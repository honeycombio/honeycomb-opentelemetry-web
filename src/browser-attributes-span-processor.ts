import { Span } from '@opentelemetry/api';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';

/**
 * A {@link SpanProcessor} that adds browser specific attributes to each span
 * that might change over the course of a session.
 * Static attributes (e.g. User Agent) are added to the Resource.
 */
export class BrowserAttributesSpanProcessor implements SpanProcessor {
  constructor() {}

  onStart(span: Span) {
    const { href, pathname, search, hash, hostname } = window.location;

    span.setAttributes({
      'browser.width': window.innerWidth,
      'browser.height': window.innerHeight,
      'page.hash': hash,
      'page.url': href,
      'page.route': pathname,
      'page.hostname': hostname,
      'page.search': search,
    });
  }

  onEnd() {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}
