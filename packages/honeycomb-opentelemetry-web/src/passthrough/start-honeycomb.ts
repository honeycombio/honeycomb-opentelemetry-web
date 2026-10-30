import { metrics } from '@opentelemetry/api';
import { startLogsSdk } from '@opentelemetry/browser-sdk/logs';
import { startTracesSdk } from '@opentelemetry/browser-sdk/traces';
import { ErrorsInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/errors';
import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { ResourceTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/resource-timing';
import { WebVitalsInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/web-vitals';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';
import {
  defaultResource,
  detectResources,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  BatchLogRecordProcessor,
  LogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import {
  BatchSpanProcessor,
  SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import {
  createSessionLogRecordProcessor,
  createSessionSpanProcessor,
} from '@opentelemetry/web-common';
import { BaggageSpanProcessor } from '../baggage-span-processor';
import { BrowserAttributesSpanProcessor } from '../browser-attributes-span-processor';
import { configureConsoleTraceLinkExporter } from '../console-trace-link-exporter';
import { configureResourceAttributes } from '../configure-resource-attributes';
import { configureResourceTiming } from '../configure-resource-timing';
import { defaultSessionProvider } from '../default-session-provider';
import {
  configureHoneycombHttpJsonLogExporter,
  configureHoneycombHttpJsonMetricExporter,
  configureHoneycombHttpJsonTraceExporter,
} from '../http-json-exporter';
import {
  exceptionSpanAdapter,
  ShapeLogRecordProcessor,
  webVitalsSpanAdapter,
} from '../shape';
import { HoneycombOptions } from '../types';
import { configureSampling } from './sample-rate';

/**
 * Spike: HoneycombOptions in, upstream per-signal starts out.
 *
 * `startBrowserSdk` is only `startLogsSdk` plus `startTracesSdk`. Calling those
 * directly lets this wrapper own the processors that export, which gives it
 * exporter timeouts, `forceFlush`, a log shaper that sits in front of the log
 * exporter, and a place to add metrics, none of which `startBrowserSdk` offers.
 *
 * Everything here is configuration or reshaping. No instrumentation lives here.
 */
export function startHoneycombOnBrowserSdk(options: HoneycombOptions = {}) {
  const sessionProvider = options.sessionProvider ?? defaultSessionProvider;
  const resourceAttributes = {
    // the per-signal starts do not run resource detectors on their own
    ...detectResources({ detectors: [browserDetector] }).attributes,
    ...configureResourceAttributes(options).attributes,
  };
  const common = {
    serviceName: options.serviceName,
    serviceVersion: options.serviceVersion,
  };

  // Logs: the shaper sits in front of every exporting processor, so a record it
  // turns into a span is not also exported as a log.
  const logExporters = [
    ...(options.disableDefaultLogExporter
      ? []
      : [configureHoneycombHttpJsonLogExporter(options)]),
    ...(options.logExporters ?? []),
  ];
  const logExportProcessors: LogRecordProcessor[] = logExporters.map(
    (exporter) => new BatchLogRecordProcessor({ exporter }),
  );
  const logsSdk = startLogsSdk({
    ...common,
    resourceAttributes: { ...resourceAttributes },
    processors: [
      createSessionLogRecordProcessor(sessionProvider),
      ...(options.logRecordProcessors ?? []),
      new ShapeLogRecordProcessor(logExportProcessors, [
        webVitalsSpanAdapter,
        exceptionSpanAdapter,
      ]),
    ],
  });

  // Traces: started second so that both global providers exist when the
  // instrumentations register.
  const { sampler, processors: samplingProcessors } =
    configureSampling(options);
  const traceExporters: SpanExporter[] = [
    ...(options.disableDefaultTraceExporter
      ? []
      : [configureHoneycombHttpJsonTraceExporter(options)]),
    ...(options.localVisualizations
      ? [configureConsoleTraceLinkExporter(options)]
      : []),
    ...(options.traceExporter ? [options.traceExporter] : []),
    ...(options.traceExporters ?? []),
  ];
  const traceExportProcessors = traceExporters.map(
    (exporter) => new BatchSpanProcessor(exporter),
  );
  const tracesSdk = startTracesSdk({
    ...common,
    resourceAttributes: { ...resourceAttributes },
    sampler,
    spanLimits: options.spanLimits,
    contextManager: options.contextManager,
    propagators: options.textMapPropagator
      ? [options.textMapPropagator]
      : undefined,
    // Order matters: everything that adds fields comes before the exporters.
    processors: [
      new BrowserAttributesSpanProcessor(),
      new BaggageSpanProcessor(),
      createSessionSpanProcessor(sessionProvider),
      ...samplingProcessors,
      ...(options.spanProcessors ?? []),
      ...traceExportProcessors,
    ],
    instrumentations: [
      ...(options.webVitalsInstrumentationConfig?.enabled === false
        ? []
        : [new WebVitalsInstrumentation({ includeRawAttribution: true })]),
      ...(options.globalErrorsInstrumentationConfig?.enabled === false
        ? []
        : [new ErrorsInstrumentation()]),
      ...(options.navigationTimingInstrumentationConfig?.enabled === true
        ? [
            new NavigationTimingInstrumentation(
              options.navigationTimingInstrumentationConfig,
            ),
          ]
        : []),
      ...(options.resourceTimingInstrumentationConfig?.enabled === true
        ? [new ResourceTimingInstrumentation(configureResourceTiming(options))]
        : []),
      // upstream takes a flat list; getWebAutoInstrumentations() returns an array
      ...(options.instrumentations ?? []).flat(),
    ],
  });

  // Metrics: the Browser SDK has none, so this is plain upstream wiring.
  const metricExporters = [
    ...(options.disableDefaultMetricExporter
      ? []
      : [configureHoneycombHttpJsonMetricExporter(options)]),
    ...(options.metricExporters ?? []),
  ];
  const meterProvider = metricExporters.length
    ? new MeterProvider({
        resource: defaultResource().merge(
          resourceFromAttributes(resourceAttributes),
        ),
        readers: metricExporters.map(
          (exporter) => new PeriodicExportingMetricReader({ exporter }),
        ),
      })
    : undefined;
  if (meterProvider) metrics.setGlobalMeterProvider(meterProvider);

  return {
    /** The wrapper owns the exporting processors, so it can flush them. */
    async forceFlush() {
      await Promise.all([
        ...traceExportProcessors.map((p) => p.forceFlush()),
        ...logExportProcessors.map((p) => p.forceFlush()),
        meterProvider?.forceFlush(),
      ]);
    },
    async shutdown() {
      await Promise.all([
        tracesSdk.shutdown(),
        logsSdk.shutdown(),
        meterProvider?.shutdown(),
      ]);
    },
  };
}
