import { Resource } from '@opentelemetry/resources';

export function configureLandingPageResource(): Resource {
  let attributes = {};
  if (window?.location) {
    const { href, pathname, search, hash, hostname } = window.location;
    attributes = {
      'landing_page.url': href,
      'landing_page.path': pathname,
      'landing_page.search': search,
      'landing_page.hash': hash,
      'landing_page.hostname': hostname,
    };
  }

  return new Resource(attributes);
}
