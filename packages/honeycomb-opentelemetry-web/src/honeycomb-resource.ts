import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_TELEMETRY_DISTRO_NAME,
  ATTR_TELEMETRY_DISTRO_VERSION,
} from '@opentelemetry/semantic-conventions/incubating';
import { VERSION } from './version';
import {
  ATTR_HONEYCOMB_DISTRO_RUNTIME_VERSION,
  ATTR_HONEYCOMB_DISTRO_VERSION,
} from './semantic-attributes';

export function configureHoneycombResource(): Resource {
  return resourceFromAttributes({
    [ATTR_HONEYCOMB_DISTRO_VERSION]: VERSION,
    [ATTR_HONEYCOMB_DISTRO_RUNTIME_VERSION]: 'browser',
    [ATTR_TELEMETRY_DISTRO_NAME]: '@honeycombio/opentelemetry-web',
    [ATTR_TELEMETRY_DISTRO_VERSION]: VERSION,
  });
}
