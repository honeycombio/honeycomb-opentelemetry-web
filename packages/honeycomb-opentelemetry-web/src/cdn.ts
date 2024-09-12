import { HoneycombOptions } from './types';
import { HoneycombWebSDK } from './honeycomb-otel-sdk';

import {
  getWebAutoInstrumentations,
  InstrumentationConfigMap,
} from '@opentelemetry/auto-instrumentations-web';
import { Context, SpanOptions, trace } from '@opentelemetry/api';
/**
 * This is a proof of concept for how you might generate a bundle suitable for hosting on a CDN.
 * If you needed to support this in production, you'd want to create a similar file that exposes the functionality you
 * need for you use cases.
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
  };
}
