import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const main = () => {
  // Set OTel to log in Debug mode
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    endpoint: 'https://api.honeycomb.io',
    apiKey: 'api-key-goes-here',
    serviceName: 'web-distro',
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
  });
  sdk.start();
};

main();
