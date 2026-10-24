import { startBrowserSdk } from '@opentelemetry/browser-sdk';
import { ErrorsInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/errors';
import { UserActionInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/user-action';
import { WebVitalsInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/web-vitals';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';
import { detectResources } from '@opentelemetry/resources';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  createSessionLogRecordProcessor,
  createSessionSpanProcessor,
} from '@opentelemetry/web-common';
import { BrowserAttributesSpanProcessor } from '../browser-attributes-span-processor';
import { BaggageSpanProcessor } from '../baggage-span-processor';
import { configureResourceAttributes } from '../configure-resource-attributes';
import { configureSampler } from '../deterministic-sampler';
import { defaultSessionProvider } from '../default-session-provider';
import {
  exceptionSpanAdapter,
  ShapeLogRecordProcessor,
  userActionSpanAdapter,
  webVitalsSpanAdapter,
} from '../shape';
import { HoneycombOptions } from '../types';
import { getLogsEndpoint, getTracesApiKey, getTracesEndpoint } from '../util';

/**
 * Spike: HoneycombOptions in, `startBrowserSdk` out.
 *
 * Everything here is configuration. The only code that shapes telemetry lives
 * in `../shape`, as log record processors.
 */
export function startHoneycombOnBrowserSdk(options: HoneycombOptions = {}) {
  const sessionProvider = options.sessionProvider ?? defaultSessionProvider;
  const headers = {
    ...options.headers,
    ...(getTracesApiKey(options)
      ? { 'x-honeycomb-team': getTracesApiKey(options) as string }
      : {}),
  };

  const logProcessor = new ShapeLogRecordProcessor(
    new BatchLogRecordProcessor({
      exporter: new OTLPLogExporter({
        url: getLogsEndpoint(options),
        headers,
      }),
    }),
    [webVitalsSpanAdapter, exceptionSpanAdapter, userActionSpanAdapter],
  );

  return startBrowserSdk({
    serviceName: options.serviceName,
    serviceVersion: options.serviceVersion,
    resourceAttributes: {
      // startBrowserSdk does not run resource detectors on its own
      ...detectResources({ detectors: [browserDetector] }).attributes,
      ...configureResourceAttributes(options).attributes,
    },
    traces: {
      sampler: configureSampler(options),
      processors: [
        new BrowserAttributesSpanProcessor(),
        new BaggageSpanProcessor(),
        createSessionSpanProcessor(sessionProvider),
        ...(options.spanProcessors ?? []),
      ],
      exportConfig: { url: getTracesEndpoint(options), headers },
    },
    logs: {
      processors: [
        createSessionLogRecordProcessor(sessionProvider),
        logProcessor,
      ],
    },
    instrumentations: [
      new ErrorsInstrumentation(),
      new UserActionInstrumentation(),
      new WebVitalsInstrumentation({ includeRawAttribution: true }),
      // upstream takes a flat list; getWebAutoInstrumentations() returns an array
      ...(options.instrumentations ?? []).flat(),
    ],
  });
}
