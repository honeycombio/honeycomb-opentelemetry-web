import {
  DetectedResourceAttributes,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { EntryPageConfig } from './types';
import {
  ATTR_ENTRY_PAGE_HASH,
  ATTR_ENTRY_PAGE_HOSTNAME,
  ATTR_ENTRY_PAGE_PATH,
  ATTR_ENTRY_PAGE_REFERRER,
  ATTR_ENTRY_PAGE_SEARCH,
  ATTR_ENTRY_PAGE_URL,
} from './semantic-attributes';

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
    [ATTR_ENTRY_PAGE_URL]: optionalAttribute(options.url, href),
    [ATTR_ENTRY_PAGE_PATH]: optionalAttribute(options.path, pathname),
    [ATTR_ENTRY_PAGE_SEARCH]: optionalAttribute(options.search, search),
    [ATTR_ENTRY_PAGE_HASH]: optionalAttribute(options.hash, hash),
    [ATTR_ENTRY_PAGE_HOSTNAME]: optionalAttribute(options.hostname, hostname),
    [ATTR_ENTRY_PAGE_REFERRER]: optionalAttribute(
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
