import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const main = () => {
  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    apiKey: 'api-key-goes-here',
    serviceName: 'web-distro',
    debug: true,
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
  });
  sdk.start();
};

main();
