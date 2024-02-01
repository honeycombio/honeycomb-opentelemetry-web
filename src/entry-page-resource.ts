import { Resource } from '@opentelemetry/resources';

export function configureEntryPageResource(): Resource {
  let attributes = {};
  if (window?.location) {
    const { href, pathname, search, hash, hostname } = window.location;
    attributes = {
      'entry_page.url': href,
      'entry_page.path': pathname,
      'entry_page.search': search,
      'entry_page.hash': hash,
      'entry_page.hostname': hostname,
      'entry_page.referrer': document.referrer,
    };
  }

  return new Resource(attributes);
}
