const { HoneycombWebSDK } = require('@honeycombio/opentelemetry-web');
const {
  getWebAutoInstrumentations,
} = require('@opentelemetry/auto-instrumentations-web');

const main = () => {
  // Initialize base OTel WebSDK
  const sdk = new HoneycombWebSDK({
    // endpoint: 'http://localhost:4318', // send to collector
    // To send to collector, comment out API Key
    apiKey: 'hcaik_01hxc8g4cdhrywa0n9132mhfwh6yekhecstp429k90rec31qhv5cfjn5wk',
    serviceName: 'web-distro-basic-example',
    debug: true,
    instrumentations: [getWebAutoInstrumentations()], // add auto-instrumentation
  });
  sdk.start();
};

main();
