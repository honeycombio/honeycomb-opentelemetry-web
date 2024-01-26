import { HoneycombOptions } from './types';
import { BrowserAttributesSpanProcessor } from './browser-attributes-span-processor';
import {
  ReadableSpan,
  Span,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';

export const configureSpanProcessors = (options: HoneycombOptions) => {
  const honeycombSpanProcessor = new CompositeSpanProcessor();

  honeycombSpanProcessor.addProcessor(new BrowserAttributesSpanProcessor());

  if (options.spanProcessor) {
    honeycombSpanProcessor.addProcessor(options.spanProcessor);
  }
};

export class CompositeSpanProcessor implements SpanProcessor {
  private spanProcessors: Array<SpanProcessor> = [];

  public addProcessor(processor: SpanProcessor) {
    this.spanProcessors.push(processor);
  }

  onStart(span: Span, parentContext: Context): void {
    this.spanProcessors.forEach((processor) => {
      processor.onStart(span, parentContext);
    });
  }

  onEnd(span: ReadableSpan): void {
    this.spanProcessors.forEach((processor) => {
      processor.onEnd(span);
    });
  }

  forceFlush(): Promise<void> {
    return Promise.all(
      this.spanProcessors.map((processor) => processor.forceFlush()),
    ).then(() => {});
  }

  shutdown(): Promise<void> {
    return Promise.all(
      this.spanProcessors.map((processor) => processor.forceFlush()),
    ).then(() => {});
  }
}
