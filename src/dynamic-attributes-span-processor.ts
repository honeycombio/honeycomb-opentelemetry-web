import { Attributes, Span } from '@opentelemetry/api';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';

interface PageRouteSpanProcessorOptions {
  getAttributes: () => Attributes;
}

/**
 * A {@link SpanProcessor} that adds dynamic attributes to every span
 */
export class DynamicAttributesSpanProcessor implements SpanProcessor {
  private getAttributes: () => Attributes;
  constructor(options: PageRouteSpanProcessorOptions) {
    this.getAttributes = options.getAttributes;
  }

  onStart(span: Span) {
    const attributes = this.getAttributes();
    span.setAttributes(attributes);
  }

  onEnd() {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}
