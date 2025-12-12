import { Span } from '@opentelemetry/api';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_BROWSER_HEIGHT,
  ATTR_BROWSER_PAGE_VISIBILITY,
  ATTR_BROWSER_WIDTH,
  ATTR_PAGE_HASH,
  ATTR_PAGE_HOSTNAME,
  ATTR_PAGE_ROUTE,
  ATTR_PAGE_SEARCH,
  ATTR_PAGE_URL,
  ATTR_URL_PATH,
} from './semantic-attributes';

/**
 * A {@link SpanProcessor} that adds browser specific attributes to each span
 * that might change over the course of a session.
 * Static attributes (e.g. User Agent) are added to the Resource.
 */
export class BrowserAttributesSpanProcessor implements SpanProcessor {
  constructor() {}

  onStart(span: Span) {
    const { href, pathname, search, hash, hostname } = window.location;
    console.log(document.visibilityState);

    span.setAttributes({
      [ATTR_BROWSER_WIDTH]: window.innerWidth,
      [ATTR_BROWSER_HEIGHT]: window.innerHeight,
      [ATTR_PAGE_HASH]: hash,
      [ATTR_PAGE_URL]: href,
      [ATTR_PAGE_ROUTE]: pathname,
      [ATTR_PAGE_HOSTNAME]: hostname,
      [ATTR_PAGE_SEARCH]: search,

      [ATTR_URL_PATH]: pathname,

      [ATTR_BROWSER_PAGE_VISIBILITY]: document.visibilityState,
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
