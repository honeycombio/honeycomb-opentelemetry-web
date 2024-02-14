import { BaggageSpanProcessor } from '../src/baggage-span-processor';
import {
  propagation,
  ROOT_CONTEXT,
  SpanKind,
  TraceFlags,
} from '@opentelemetry/api';
import { BasicTracerProvider, Span } from '@opentelemetry/sdk-trace-base';

describe('BaggageSpanProcessor', () => {
  const baggageProcessor = new BaggageSpanProcessor();

  const bag = propagation.createBaggage({
    brand: { value: 'samsonite' },
  });

  const expectedAttrs = {
    brand: 'samsonite',
  };

  let span: Span;

  beforeEach(() => {
    span = new Span(
      new BasicTracerProvider().getTracer('baggage-testing'),
      ROOT_CONTEXT,
      'Edward W. Span',
      {
        traceId: 'e4cda95b652f4a1592b449d5929fda1b',
        spanId: '7e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      },
      SpanKind.SERVER,
    );
  });

  test('onStart adds current Baggage entries to a span as attributes', () => {
    expect(span.attributes).toEqual({});
    const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);

    baggageProcessor.onStart(span, ctx);

    expect(span.attributes).toEqual(expectedAttrs);
  });
});
