import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const main = () => {
  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    // endpoint: 'http://localhost:4318', // send to collector
    // To send to collector, comment out API Key
    apiKey: 'api-key',
    serviceName: 'web-distro',
    debug: true,
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
    // webVitalsInstrumentationConfig: {
    //   enabled: false,
    // },
  });
  sdk.start();
};

main();
