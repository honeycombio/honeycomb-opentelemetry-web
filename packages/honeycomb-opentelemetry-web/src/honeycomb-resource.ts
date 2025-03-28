import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { VERSION } from './version';

export function configureHoneycombResource(): Resource {
  return resourceFromAttributes({
    'honeycomb.distro.version': VERSION,
    'honeycomb.distro.runtime_version': 'browser',
  }) as Resource;
}
