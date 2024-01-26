import { HoneycombOptions } from './types';
import { BrowserAttributesSpanProcessor } from './browser-attributes-span-processor';
import {
  BatchSpanProcessor,
  ReadableSpan,
  Span,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';
import { configureHoneycombHttpJsonTraceExporter } from './http-json-trace-exporter';

// TODO: jsdocs
// TODO: naming this file
// TODO: tests

export const configureSpanProcessors = (options?: HoneycombOptions) => {
  const honeycombSpanProcessor = new CompositeSpanProcessor();

  // add exporter
  // TODO: also leave a comment here
  honeycombSpanProcessor.addProcessor(
    new BatchSpanProcessor(configureHoneycombHttpJsonTraceExporter(options)),
  );

  // we always want to add the browser attrs span processor
  honeycombSpanProcessor.addProcessor(new BrowserAttributesSpanProcessor());

  // if there is a user provided span processor, add it to the composite span processor
  if (options?.spanProcessor) {
    honeycombSpanProcessor.addProcessor(options?.spanProcessor);
  }

  return honeycombSpanProcessor;
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
