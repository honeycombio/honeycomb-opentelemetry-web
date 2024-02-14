import { HoneycombOptions } from './types';
import { BaggageSpanProcessor } from './baggage-span-processor';
import { BrowserAttributesSpanProcessor } from './browser-attributes-span-processor';
import {
  BatchSpanProcessor,
  ReadableSpan,
  Span,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';
import { configureHoneycombHttpJsonTraceExporter } from './http-json-trace-exporter';

/**
 * Builds and returns Span Processor that combines the BatchSpanProcessor, BrowserSpanProcessor,
 * and optionally a user provided Span Processor.
 * @param options The {@link HoneycombOptions}
 * @returns a {@link CompositeSpanProcessor}
 */
export const configureSpanProcessors = (options?: HoneycombOptions) => {
  const honeycombSpanProcessor = new CompositeSpanProcessor();

  // We have to configure the exporter here because the way the base SDK is setup
  // does not allow having both a `spanProcessor` and `traceExporter` configured.
  honeycombSpanProcessor.addProcessor(
    new BatchSpanProcessor(configureHoneycombHttpJsonTraceExporter(options)),
  );

  // we always want to add the baggage span processor
  honeycombSpanProcessor.addProcessor(new BaggageSpanProcessor());

  // we always want to add the browser attrs span processor
  honeycombSpanProcessor.addProcessor(new BrowserAttributesSpanProcessor());

  // if there is a user provided span processor, add it to the composite span processor
  if (options?.spanProcessor) {
    honeycombSpanProcessor.addProcessor(options?.spanProcessor);
  }

  return honeycombSpanProcessor;
};

/**
 * A {@link SpanProcessor} that combines multiple span processors into a single
 * span processor that can be passed into the SDKs `spanProcessor` option.
 */
export class CompositeSpanProcessor implements SpanProcessor {
  private spanProcessors: Array<SpanProcessor> = [];

  public addProcessor(processor: SpanProcessor) {
    this.spanProcessors.push(processor);
  }

  public getSpanProcessors() {
    return this.spanProcessors;
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
