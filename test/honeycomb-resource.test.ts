import { configureHoneycombResource } from '../src/honeycomb-resource';
import { Resource } from '@opentelemetry/resources';
import { VERSION } from '../src/version';

test('it should return a Resource', () => {
  const resource = configureHoneycombResource();
  expect(resource).toBeInstanceOf(Resource);
  expect(resource.attributes['honeycomb.distro.version']).toEqual(VERSION);
  expect(resource.attributes['honeycomb.distro.runtime_version']).toEqual(
    'browser',
  );
});

test('it should merge resource attributes provided from another resource', () => {
  const resource = configureHoneycombResource({
    resource: new Resource({
      myTestAttr: 'my-test-attr',
    }),
  });
  expect(resource).toBeInstanceOf(Resource);
  expect(resource.attributes['honeycomb.distro.version']).toEqual(VERSION);
  expect(resource.attributes['honeycomb.distro.runtime_version']).toEqual(
    'browser',
  );
  expect(resource.attributes.myTestAttr).toEqual('my-test-attr');
});
