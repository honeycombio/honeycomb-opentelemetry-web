import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';

// placeholder test while getting test infra setup,
// will make this more meaningful later
test('it should return a NodeSDK', () => {
  const honeycomb = new HoneycombWebSDK();
  expect(honeycomb).toBeDefined();
});
