import {
  HoneycombWebSDK,
  WebVitalsInstrumentation,
} from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const main = () => {
  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    // To send direct to Honeycomb, set API Key and comment out endpoint
    // apiKey: 'api-key',
    endpoint: 'http://localhost:4318', // send to local collector
    serviceName: 'web-distro',
    debug: true,
    instrumentations: [
      getWebAutoInstrumentations(),
      new WebVitalsInstrumentation(),
    ], // add auto-instrumentation
  });
  sdk.start();
};

main();
