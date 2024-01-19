import { Resource } from '@opentelemetry/resources';
import { HoneycombOptions } from './types';
import { VERSION } from './version';

export function configureHoneycombResource(
  options?: HoneycombOptions,
): Resource {
  return new Resource({
    'honeycomb.distro.version': VERSION,
    'honeycomb.distro.runtime_version': 'browser',
  }).merge(options?.resource ? options.resource : null);
}
