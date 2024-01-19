import { HoneycombOptions } from './types';
import { BrowserAttributesSpanProcessor } from './browser-attributes-span-processor';
import {
  ReadableSpan,
  Span,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Context } from '@opentelemetry/api';

export const configureSpanProcessor = (options?: HoneycombOptions) => {
  if (options?.spanProcessor) {
    return new CombinedSpanProcessor(options.spanProcessor);
  }

  return new BrowserAttributesSpanProcessor();
};

export class CombinedSpanProcessor implements SpanProcessor {
  private customSpanProcessor: SpanProcessor;
  private browserAttrsSpanProcessor: BrowserAttributesSpanProcessor;

  constructor(customSpanProcessor: SpanProcessor) {
    this.customSpanProcessor = customSpanProcessor;
    this.browserAttrsSpanProcessor = new BrowserAttributesSpanProcessor();
  }

  onStart(span: Span, parentContext: Context): void {
    this.customSpanProcessor.onStart(span, parentContext);
    this.browserAttrsSpanProcessor.onStart(span);
  }

  onEnd(span: ReadableSpan): void {
    this.customSpanProcessor.onEnd(span);
    this.browserAttrsSpanProcessor.onEnd();
  }

  async forceFlush(): Promise<void> {
    await this.customSpanProcessor.forceFlush();
    await this.browserAttrsSpanProcessor.forceFlush();
  }

  async shutdown(): Promise<void> {
    await this.customSpanProcessor.shutdown();
    await this.browserAttrsSpanProcessor.shutdown();
  }
}
