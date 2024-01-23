import { Resource } from '@opentelemetry/resources';

export function configureLandingPageResource(): Resource {
  let attributes = {};
  if (window?.location) {
    const { href, pathname, search, hash } = window.location;
    attributes = {
      'landing_page.url': href,
      'landing_page.path': pathname,
      'landing_page.search': search,
      'landing_page.hash': hash,
    };
  }

  return new Resource(attributes);
}
