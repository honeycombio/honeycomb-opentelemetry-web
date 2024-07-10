const { HoneycombWebSDK } = require('@honeycombio/opentelemetry-web');
const {
  getWebAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-web');

const configDefaults = {
  ignoreNetworkEvents: true,
};

const main = () => {
  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    // endpoint: 'http://localhost:4318', // send to collector
    // To send to collector, comment out API Key
    apiKey: 'api-key',
    serviceName: 'hny-web-distro-example:hello-world-cjs',
    debug: true,
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-xml-http-request': configDefaults,
        '@opentelemetry/instrumentation-fetch': configDefaults,
        '@opentelemetry/instrumentation-document-load': configDefaults,
      }),
    ], // add auto-instrumentation
  });
  sdk.start();
};

main();
