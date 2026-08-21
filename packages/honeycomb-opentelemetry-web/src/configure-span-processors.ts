import { HoneycombOptions } from './types';
import { BaggageSpanProcessor } from './baggage-span-processor';
import { BrowserAttributesSpanProcessor } from './browser-attributes-span-processor';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  createSessionSpanProcessor,
  SessionProvider,
} from '@opentelemetry/web-common';
import { defaultSessionProvider } from './default-session-provider';

// TODO: we might not need this anymore if the top level tracer provider supports multiple span processors!
/**
 * Builds and returns an array of Span Processors that includes the BatchSpanProcessor, BrowserSpanProcessor,
 * BaggageSpanProcessor, and optionally user provided Span Processors.
 * @param options The {@link HoneycombOptions}
 * @param sessionProvider the session provider the SDK resolved for this instance
 * @returns {@link SpanProcessor[]}
 */
export const configureSpanProcessors = (
  options?: HoneycombOptions,
  sessionProvider: SessionProvider = options?.sessionProvider ||
    defaultSessionProvider,
): SpanProcessor[] => {
  const processors: SpanProcessor[] = [];

  if (!options?.disableBrowserAttributes) {
    processors.push(new BrowserAttributesSpanProcessor());
  }

  processors.push(
    new BaggageSpanProcessor(),
    createSessionSpanProcessor(sessionProvider),
    ...(options?.spanProcessors || []),
  );

  return processors;
};
