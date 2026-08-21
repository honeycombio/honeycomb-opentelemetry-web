import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureDebug } from './honeycomb-debug';
import { configureSampler } from './deterministic-sampler';
import { validateOptionsWarnings } from './validate-options';
import { WebVitalsInstrumentation } from './web-vitals-autoinstrumentation';
import { GlobalErrorsInstrumentation } from './global-errors-autoinstrumentation';
import {
  configureLogExporters,
  configureMetricExporters,
  configureTraceExporters,
} from './composite-exporter';
import { configureSpanProcessors } from './configure-span-processors';
import { configureLogRecordProcessors } from './configure-log-record-processors';
import { configureResourceAttributes } from './configure-resource-attributes';
import { defaultSessionProvider } from './default-session-provider';
import { SessionProvider } from '@opentelemetry/web-common';

/**
 * A session provider that also manages a session lifecycle, as upstream's
 * SessionManager does. A provider supplied by a caller is only required to
 * report a session id, so these methods are probed for rather than assumed.
 */
type ManagedSessionProvider = SessionProvider & {
  start: () => Promise<void>;
  shutdown: () => void;
};

const isManagedSessionProvider = (
  provider: SessionProvider,
): provider is ManagedSessionProvider =>
  typeof (provider as Partial<ManagedSessionProvider>).start === 'function' &&
  typeof (provider as Partial<ManagedSessionProvider>).shutdown === 'function';

export class HoneycombWebSDK extends WebSDK {
  private _sessionProvider: SessionProvider;

  constructor(options?: HoneycombOptions) {
    const instrumentations = [...(options?.instrumentations || [])];
    // Automatically include web vitals instrumentation unless explicitly set to false
    if (options?.webVitalsInstrumentationConfig?.enabled !== false) {
      instrumentations.push(
        new WebVitalsInstrumentation(options?.webVitalsInstrumentationConfig),
      );
    }
    // Automatically include global errors instrumentation unless explicitly set to false
    if (options?.globalErrorsInstrumentationConfig?.enabled !== false) {
      instrumentations.push(
        new GlobalErrorsInstrumentation(
          options?.globalErrorsInstrumentationConfig,
        ),
      );
    }

    // Resolved once so that spans, log records and the CDN wrapper all report
    // the same session.
    const sessionProvider = options?.sessionProvider || defaultSessionProvider;

    super({
      ...options,
      instrumentations,
      resource: configureResourceAttributes(options),
      sampler: configureSampler(options),
      spanProcessors: configureSpanProcessors(options, sessionProvider),
      logRecordProcessors: configureLogRecordProcessors(
        options,
        sessionProvider,
      ),
      traceExporter: configureTraceExporters(options),
      metricExporters: configureMetricExporters(options),
      logExporters: configureLogExporters(options),
    });

    this._sessionProvider = sessionProvider;

    validateOptionsWarnings(options);

    if (options?.debug) {
      configureDebug(options);
    }
  }

  /**
   * Constructs SDK components, registers them with the OpenTelemetry API, and
   * restores any session persisted by an earlier page load.
   *
   * Awaiting the returned promise is optional. Restoring the session takes a
   * single microtask, which settles before any browser event, timer or network
   * callback can fire, so instrumentation-generated telemetry already carries
   * the restored session id. Await it only when creating spans by hand in the
   * same tick as this call.
   *
   * @returns a promise that resolves once the session has been restored
   */
  public start(): Promise<void> {
    super.start();

    if (isManagedSessionProvider(this._sessionProvider)) {
      return this._sessionProvider.start();
    }
    return Promise.resolve();
  }

  public shutdown(): Promise<void> {
    if (isManagedSessionProvider(this._sessionProvider)) {
      // Clears the inactivity and max duration timers.
      this._sessionProvider.shutdown();
    }
    return super.shutdown();
  }
}
