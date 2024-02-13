import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { Resource } from '@opentelemetry/resources';
import { WebSDK } from '../src/base-otel-sdk';
import { VERSION } from '../src/version';

test('it should extend the OTel WebSDK', () => {
  const honeycomb = new HoneycombWebSDK();
  expect(honeycomb).toBeInstanceOf(WebSDK);
});

/* These tests rely on `getResourceAttributes`, a method not
 * currently available in the proposed upstream version of
 * the base-otel-sdk. */
describe('resource config', () => {
  test('it should merge resources from the configuration', () => {
    const config = {
      resource: new Resource({
        myTestAttr: 'my-test-attr',
      }),
    };

    const honeycomb = new HoneycombWebSDK(config);

    const attributes = honeycomb.getResourceAttributes();
    expect(attributes['honeycomb.distro.version']).toEqual(VERSION);
    expect(attributes['honeycomb.distro.runtime_version']).toEqual('browser');
    expect(attributes.myTestAttr).toEqual('my-test-attr');
  });

  test('it should include resourceAttributes from the configuration', () => {
    const config = {
      resource: new Resource({
        myTestAttr: 'my-test-attr',
      }),
      resourceAttributes: { jumpingJacks: 25, marbles: 52 },
    };

    const honeycomb = new HoneycombWebSDK(config);

    const attributes = honeycomb.getResourceAttributes();
    expect(attributes['honeycomb.distro.version']).toEqual(VERSION);
    expect(attributes['honeycomb.distro.runtime_version']).toEqual('browser');
    expect(attributes.myTestAttr).toEqual('my-test-attr');
    expect(attributes.jumpingJacks).toEqual(25);
    expect(attributes.marbles).toEqual(52);
  });
});
