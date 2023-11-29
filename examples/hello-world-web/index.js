import { WebSDK } from '@honeycombio/opentelemetry-web';
const main = () => {
  console.log('Hello from the example app');
  new WebSDK();
};

main();
