import { WebSDK } from '@honeycombio/opentelemetry-web';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
const main = () => {
  console.log('Hello from the example app');
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  const sdk = new WebSDK();
  sdk.start();
};

main();
