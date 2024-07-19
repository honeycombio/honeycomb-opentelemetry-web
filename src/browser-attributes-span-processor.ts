import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { DynamicAttributesSpanProcessor } from './dynamic-attributes-span-processor';

function getBrowserAttributes() {
  const { href, pathname, search, hash, hostname } = window.location;

  return {
    'browser.width': window.innerWidth,
    'browser.height': window.innerHeight,
    'page.hash': hash,
    'page.url': href,
    'page.route': pathname,
    'page.hostname': hostname,
    'page.search': search,

    'url.path': pathname,
  };
}

/**
 * A {@link SpanProcessor} that adds browser specific attributes to each span
 * that might change over the course of a session.
 * Static attributes (e.g. User Agent) are added to the Resource.
 */
export class BrowserAttributesSpanProcessor extends DynamicAttributesSpanProcessor {
  constructor() {
    super({ getAttributes: getBrowserAttributes });
  }
}
