import {
  DetectedResourceAttributes,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { EntryPageConfig } from './types';

export const defaultConfig: EntryPageConfig = {
  path: true,
  hash: true,
  hostname: true,
  referrer: true,
  url: false,
  search: false,
};

export function configureEntryPageResource(
  config?: EntryPageConfig | false,
): Resource {
  if (config === false || !window?.location) {
    return resourceFromAttributes({});
  }

  const options = getOptions(config);
  const { href, pathname, search, hash, hostname } = window.location;

  const attributes: DetectedResourceAttributes = {
    'entry_page.url': optionalAttribute(options.url, href),
    'entry_page.path': optionalAttribute(options.path, pathname),
    'entry_page.search': optionalAttribute(options.search, search),
    'entry_page.hash': optionalAttribute(options.hash, hash),
    'entry_page.hostname': optionalAttribute(options.hostname, hostname),
    'entry_page.referrer': optionalAttribute(
      options.referrer,
      document.referrer,
    ),
  };

  return resourceFromAttributes(attributes);
}

function getOptions(config?: EntryPageConfig) {
  if (!config) {
    return defaultConfig;
  }

  return { ...defaultConfig, ...config };
}

function optionalAttribute<T>(
  shouldInclude: undefined | boolean,
  attribute: T,
): undefined | T {
  if (!shouldInclude) {
    return undefined;
  }

  return attribute;
}
