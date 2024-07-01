import { Span } from '@opentelemetry/api';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { pathnameToRoute } from './pathname-to-route';

/**
 * A {@link SpanProcessor} that adds browser specific attributes to each span
 * that might change over the course of a session.
 * Static attributes (e.g. User Agent) are added to the Resource.
 */
export class BrowserAttributesSpanProcessor implements SpanProcessor {
  constructor(public inferRoute = false) {}

  onStart(span: Span) {
    const { href, pathname, search, hash, hostname } = window.location;

    span.setAttributes({
      'browser.width': window.innerWidth,
      'browser.height': window.innerHeight,
      'page.hash': hash,
      'page.url': href,
      'page.route': this.inferRoute ? pathnameToRoute(pathname) : pathname,
      'page.hostname': hostname,
      'page.search': search,
      'url.path': pathname,
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
