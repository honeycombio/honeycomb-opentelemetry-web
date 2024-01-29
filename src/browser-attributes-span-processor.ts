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
      'browser.width': window.screen.width,
      'browser.height': window.screen.height,
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
