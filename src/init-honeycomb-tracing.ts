import { HoneycombWebSDK } from './honeycomb-otel-sdk';
import { HoneycombOptions } from './types';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

export const initHoneycombTracing = (options: HoneycombOptions) => {
  const sdk = new HoneycombWebSDK({
    // To send direct to Honeycomb, set API Key and comment out endpoint
    ...options,
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
  });
  sdk.start();
};

// @ts-expect-error it exists now!
window.initHoneycombTracing = initHoneycombTracing;
