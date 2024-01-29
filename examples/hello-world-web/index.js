import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const main = () => {
  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    // apiKey: 'api-key',
    endpoint: 'http://localhost:4318/v1/traces',
    serviceName: 'web-distro',
    debug: true,
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
  });
  sdk.start();
};

main();
