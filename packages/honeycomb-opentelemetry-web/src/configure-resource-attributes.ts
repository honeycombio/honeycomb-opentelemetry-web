import { Resource, resourceFromAttributes } from '@opentelemetry/resources';

import { HoneycombOptions } from './types';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureEntryPageResource } from './entry-page-resource';
import { configureBrowserAttributesResource } from './browser-attributes-resource';

/**
 * This function combines resource attributes we provide from this SDK with attributes provided
 * by the user in the options. It merges them together and returns a single resource.
 * @param options - Honeycomb options
 * @returns Resource - The resource with the configured attributes
 */
export const configureResourceAttributes = (
  options?: HoneycombOptions,
): Resource => {
  let resource = resourceFromAttributes({})
    .merge(configureEntryPageResource(options?.entryPageAttributes))
    .merge(configureBrowserAttributesResource())
    .merge(configureHoneycombResource());

  if (options?.resource) {
    resource = resource.merge(options.resource);
  }

  if (options?.resourceAttributes) {
    resource = resource.merge(
      resourceFromAttributes(options.resourceAttributes),
    );
  }
  return resource;
};
