import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { WebSDK } from '../src/base-otel-sdk';

test('it should extend the OTel WebSDK', () => {
  const honeycomb = new HoneycombWebSDK();
  expect(honeycomb).toBeInstanceOf(WebSDK);
});
