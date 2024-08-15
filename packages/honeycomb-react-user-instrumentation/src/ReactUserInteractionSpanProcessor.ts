import {
  ReadableSpan,
  Span,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';

export class ReactUserInteractionSpanProcessor implements SpanProcessor {
  onStart(_span: Span, _parentContext: Context): void {}

  onEnd(span: ReadableSpan): void {
    console.log('end');
    if (span.name.startsWith('react-')) {
      // @ts-expect-error span.name is technically readonly
      span.name = span.name.slice('react-'.length);
    }

    const eventType = span.attributes['event_type'];
    if (typeof eventType === 'string' && eventType?.startsWith('react-')) {
      span.attributes['event_type'] = eventType.slice('react-'.length);
    }
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
