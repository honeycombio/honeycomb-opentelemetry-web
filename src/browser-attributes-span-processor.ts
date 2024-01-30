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
    span.setAttributes({
      'browser.width': window.innerWidth,
      'browser.height': window.innerHeight,
      'browser.hash': window.location.hash,
      'browser.url': window.location.href,
      'browser.route': window.location.pathname,
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
