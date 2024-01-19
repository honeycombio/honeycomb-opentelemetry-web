import { Span } from '@opentelemetry/api';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';

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
