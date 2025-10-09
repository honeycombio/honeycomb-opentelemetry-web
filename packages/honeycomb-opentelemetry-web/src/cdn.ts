import { HoneycombOptions } from './types';
import { HoneycombWebSDK } from './honeycomb-otel-sdk';

import {
  getWebAutoInstrumentations,
  InstrumentationConfigMap,
} from '@opentelemetry/auto-instrumentations-web';
import {
  context,
  Context,
  propagation,
  SpanOptions,
  trace,
} from '@opentelemetry/api';
import { defaultSessionProvider } from './default-session-provider';
/**
 * This is a proof of concept for how you might generate a bundle suitable for hosting on a CDN.
 * If you needed to support this in production, you'd want to create a similar file that exposes the functionality you
 * need for you use cases.
 *
 * The getOtel* functions are provided for ease of exploration. Your CDN wrapper should expose only what you intend to use.
 *
 * Here we're making the assumption that we need to be able to:
 * - Initialize the HoneycombWebSDK
 * - We want the auto instrumentation from the meta package
 * - Create a custom span.
 */
export function configureHoneycombSDK(
  options: HoneycombOptions,
  instrumentationOptions: InstrumentationConfigMap,
  tracerName = options.serviceName || 'tracer',
) {
  const sessionProvider = options.sessionProvider ?? defaultSessionProvider;
  options.instrumentations = [
    ...(options.instrumentations || []),
    getWebAutoInstrumentations(instrumentationOptions),
  ];

  const honeycombWebSDK = new HoneycombWebSDK(options);
  const tracer = trace.getTracer(tracerName);

  return {
    start: () => honeycombWebSDK.start(),
    shutdown: () => honeycombWebSDK.shutdown(),
    startSpan: (name: string, options?: SpanOptions, context?: Context) => {
      return tracer.startSpan(name, options, context);
    },
    getSessionId: () => sessionProvider.getSessionId(),
    getOtelTrace: () => trace,
    getOtelContext: () => context,
    getOtelPropagation: () => propagation,
  };
}
