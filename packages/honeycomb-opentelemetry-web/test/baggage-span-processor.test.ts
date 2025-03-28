import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BaggageSpanProcessor } from '../src/baggage-span-processor';
import { propagation, ROOT_CONTEXT, SpanKind, trace } from '@opentelemetry/api';

describe('BaggageSpanProcessor', () => {
  const exporter = new InMemorySpanExporter();
  const baggageProcessor = new BaggageSpanProcessor();

  const bag = propagation.createBaggage({
    brand: { value: 'samsonite' },
  });

  const expectedAttrs = {
    brand: 'samsonite',
  };

  beforeEach(() => {
    exporter.reset();
  });

  test('onStart adds current Baggage entries to a span as attributes', () => {
    const tracer = trace.getTracer('baggage-testing');
    const provider = new WebTracerProvider({
      spanProcessors: [
        new BaggageSpanProcessor(),
        new SimpleSpanProcessor(exporter),
      ],
    });
    provider.register();
    const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);

    const span = tracer.startSpan(
      'Edward W. Span',
      {
        kind: SpanKind.SERVER,
      },
      ctx,
    );

    baggageProcessor.onStart(span, ctx);
    span.end();

    const finishedSpans = exporter.getFinishedSpans();
    expect(finishedSpans).toHaveLength(1);
    expect(finishedSpans[0].attributes).toEqual(expectedAttrs);
  });
});
