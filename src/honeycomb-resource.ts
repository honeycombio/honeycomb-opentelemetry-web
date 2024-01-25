import { Resource } from '@opentelemetry/resources';
import { VERSION } from './version';

export function configureHoneycombResource(): Resource {
  return new Resource({
    'honeycomb.distro.version': VERSION,
    'honeycomb.distro.runtime_version': 'browser',
  });
}
