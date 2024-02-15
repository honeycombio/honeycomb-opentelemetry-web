import { Context, diag, propagation, Span } from '@opentelemetry/api';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';

/**
 * A {@link SpanProcessor} that reads entries stored in {@link Baggage}
 * from the parent context and adds the baggage entries' keys and values
 * to the span as attributes on span start.
 *
 * Keys and values added to Baggage will appear on subsequent child
 * spans for a trace within this service *and* be propagated to external
 * services in accordance with any configured propagation formats
 * configured. If the external services also have a Baggage span
 * processor, the keys and values will appear in those child spans as
 * well.
 *
 * ⚠ Warning ⚠️
 *
 * Do not put sensitive information in Baggage.
 *
 * To repeat: a consequence of adding data to Baggage is that the keys and
 * values will appear in all outgoing HTTP headers from the application.
 */
export class BaggageSpanProcessor implements SpanProcessor {
  constructor() {}

  onStart(span: Span, parentContext: Context): void {
    (propagation.getBaggage(parentContext)?.getAllEntries() ?? []).forEach(
      (entry) => {
        span.setAttribute(entry[0], entry[1].value);
        diag.debug(
          `@honeycombio/opentelemetry-web: 🚨 Baggage in all outgoing headers: ${entry[0]}=${entry[1].value} `,
        );
      },
    );
  }

  onEnd() {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}
