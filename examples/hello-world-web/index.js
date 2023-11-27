import { HoneycombOpenTelemetryWebSDK } from '@honeycombio/opentelemetry-web';
const main = () => {
  console.log('Hello from the example app');
  new HoneycombOpenTelemetryWebSDK();
};

main();
