import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_TELEMETRY_DISTRO_NAME, ATTR_TELEMETRY_DISTRO_VERSION } from '@opentelemetry/semantic-conventions/incubating';
import { VERSION } from './version';

export function configureHoneycombResource(): Resource {
  return resourceFromAttributes({
    'honeycomb.distro.version': VERSION,
    'honeycomb.distro.runtime_version': 'browser',
    [ATTR_TELEMETRY_DISTRO_NAME]: '@honeycombio/opentelemetry-web',
    [ATTR_TELEMETRY_DISTRO_VERSION]: VERSION,
  });
}
