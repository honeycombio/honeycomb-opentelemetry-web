import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';

export const setupTestExporter = (spanProcessors?: SpanProcessor[]) => {
  const exporter = new InMemorySpanExporter();
  const provider = new WebTracerProvider({
    spanProcessors: [
      ...(spanProcessors || []),
      new SimpleSpanProcessor(exporter),
    ],
  });

  provider.register();

  return exporter;
};
