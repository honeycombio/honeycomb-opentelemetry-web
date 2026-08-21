import { logs } from '@opentelemetry/api-logs';
import { trace } from '@opentelemetry/api';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import {
  BatchLogRecordProcessor,
  InMemoryLogRecordExporter,
  LogRecordProcessor,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { configureLogExporters } from '../src/composite-exporter';
import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { HoneycombOptions } from '../src/types';

describe('configureLogExporters', () => {
  test('it configures the Honeycomb log exporter by default', () => {
    const exporters = configureLogExporters({});

    expect(exporters).toHaveLength(1);
    expect(exporters[0]).toBeInstanceOf(OTLPLogExporter);
  });

  test('it appends user-provided logExporters to the default exporter', () => {
    const userExporter = new InMemoryLogRecordExporter();

    const exporters = configureLogExporters({ logExporters: [userExporter] });

    expect(exporters).toHaveLength(2);
    expect(exporters[0]).toBeInstanceOf(OTLPLogExporter);
    expect(exporters[1]).toBe(userExporter);
  });

  test('it omits the Honeycomb exporter when disableDefaultLogExporter is true', () => {
    const userExporter = new InMemoryLogRecordExporter();

    const exporters = configureLogExporters({
      disableDefaultLogExporter: true,
      logExporters: [userExporter],
    });

    expect(exporters).toEqual([userExporter]);
  });

  test('it returns no exporters when the default is disabled and none are provided', () => {
    expect(configureLogExporters({ disableDefaultLogExporter: true })).toEqual(
      [],
    );
  });

  test('it adds a console exporter when localVisualizations is enabled', () => {
    const exporters = configureLogExporters({ localVisualizations: true });

    expect(exporters).toHaveLength(2);
    expect(exporters[0]).toBeInstanceOf(OTLPLogExporter);
  });
});

describe('logger provider config', () => {
  /* Keep the SDK under test focused on the logs pipeline: the trace and metric
   * exporters would otherwise attempt to reach the network from jsdom. */
  const baseOptions: HoneycombOptions = {
    apiKey: 'my-api-key',
    serviceName: 'logs-pipeline-test',
    skipOptionsValidation: true,
    disableDefaultTraceExporter: true,
    disableDefaultMetricExporter: true,
    webVitalsInstrumentationConfig: { enabled: false },
    globalErrorsInstrumentationConfig: { enabled: false },
  };

  let sdk: HoneycombWebSDK | undefined;

  const startSdk = (options: HoneycombOptions) => {
    sdk = new HoneycombWebSDK({ ...baseOptions, ...options });
    sdk.start();
    return sdk;
  };

  /* `logs.setGlobalLoggerProvider` is a no-op once a provider is registered, so
   * every test has to tear the global down or it would silently assert against
   * the provider registered by the previous test. */
  afterEach(async () => {
    await sdk?.shutdown();
    sdk = undefined;
    logs.disable();
    trace.disable();
  });

  const logRecordProcessors = (
    honeycomb: HoneycombWebSDK,
  ): LogRecordProcessor[] => {
    const provider = (
      honeycomb as unknown as {
        _loggerProvider?: {
          _sharedState: { processors: LogRecordProcessor[] };
        };
      }
    )._loggerProvider;

    return provider ? provider._sharedState.processors : [];
  };

  /* Waits for the promise chain inside BatchLogRecordProcessor's export to settle.
   * The export path itself is timer-free, so a single macrotask tick is enough. */
  const settleExport = () => new Promise((resolve) => setTimeout(resolve, 0));

  test('it wraps the default Honeycomb log exporter in a BatchLogRecordProcessor', () => {
    const honeycomb = startSdk({});

    const processors = logRecordProcessors(honeycomb);
    expect(processors).toHaveLength(1);
    expect(processors[0]).toBeInstanceOf(BatchLogRecordProcessor);
  });

  test('it wraps each configured log exporter in its own BatchLogRecordProcessor', () => {
    const honeycomb = startSdk({
      logExporters: [
        new InMemoryLogRecordExporter(),
        new InMemoryLogRecordExporter(),
      ],
    });

    const processors = logRecordProcessors(honeycomb);
    expect(processors).toHaveLength(3);
    processors.forEach((processor) => {
      expect(processor).toBeInstanceOf(BatchLogRecordProcessor);
    });
  });

  test('it batches log records rather than exporting one per record', async () => {
    const exporter = new InMemoryLogRecordExporter();
    const honeycomb = startSdk({
      disableDefaultLogExporter: true,
      logExporters: [exporter],
    });

    const logger = logs.getLogger('logs-pipeline-testing');
    logger.emit({ body: 'one' });
    logger.emit({ body: 'two' });

    // A SimpleLogRecordProcessor would have exported each record as it was emitted.
    expect(exporter.getFinishedLogRecords()).toHaveLength(0);

    await honeycomb.forceFlush();

    const records = exporter.getFinishedLogRecords();
    expect(records).toHaveLength(2);
    expect(records.map((record) => record.body)).toEqual(['one', 'two']);
  });

  test('it applies logRecordProcessors from options alongside the default batch processors', async () => {
    const immediateExporter = new InMemoryLogRecordExporter();
    const batchedExporter = new InMemoryLogRecordExporter();

    const honeycomb = startSdk({
      disableDefaultLogExporter: true,
      logExporters: [batchedExporter],
      logRecordProcessors: [new SimpleLogRecordProcessor(immediateExporter)],
    });

    const processors = logRecordProcessors(honeycomb);
    expect(processors).toHaveLength(2);
    expect(processors[0]).toBeInstanceOf(SimpleLogRecordProcessor);
    expect(processors[1]).toBeInstanceOf(BatchLogRecordProcessor);

    logs.getLogger('logs-pipeline-testing').emit({ body: 'hello' });

    // The user-supplied SimpleLogRecordProcessor exports as records are emitted...
    expect(immediateExporter.getFinishedLogRecords()).toHaveLength(1);
    // ...while the default BatchLogRecordProcessor buffers until flushed.
    expect(batchedExporter.getFinishedLogRecords()).toHaveLength(0);

    await honeycomb.forceFlush();

    expect(batchedExporter.getFinishedLogRecords()).toHaveLength(1);
  });

  test('it configures a logger provider from logRecordProcessors alone', () => {
    const honeycomb = startSdk({
      disableDefaultLogExporter: true,
      logRecordProcessors: [
        new SimpleLogRecordProcessor(new InMemoryLogRecordExporter()),
      ],
    });

    const processors = logRecordProcessors(honeycomb);
    expect(processors).toHaveLength(1);
    expect(processors[0]).toBeInstanceOf(SimpleLogRecordProcessor);
  });

  /* The browser build of BatchLogRecordProcessor registers visibilitychange and
   * pagehide listeners that force a flush. This asserts the browser platform build
   * is the one being resolved: the node build would buffer straight through unload. */
  test('it flushes buffered log records when the page is hidden', async () => {
    const exporter = new InMemoryLogRecordExporter();
    startSdk({
      disableDefaultLogExporter: true,
      logExporters: [exporter],
    });

    logs.getLogger('logs-pipeline-testing').emit({ body: 'unloading' });
    expect(exporter.getFinishedLogRecords()).toHaveLength(0);

    document.dispatchEvent(new Event('pagehide'));
    await settleExport();

    expect(exporter.getFinishedLogRecords()).toHaveLength(1);
  });
});
