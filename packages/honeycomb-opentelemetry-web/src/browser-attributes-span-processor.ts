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
  private width = window.innerWidth;
  private height = window.innerHeight;

  constructor() {
    window.addEventListener(
      'resize',
      () => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
      },
      { passive: true },
    );
  }

  onStart(span: Span) {
    const { href, pathname, search, hash, hostname } = window.location;

    span.setAttributes({
      [ATTR_BROWSER_WIDTH]: this.width,
      [ATTR_BROWSER_HEIGHT]: this.height,
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
