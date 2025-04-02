import { propagation, ROOT_CONTEXT, SpanKind, trace } from '@opentelemetry/api';

import { BaggageSpanProcessor } from '../src/baggage-span-processor';
import { setupTestExporter } from './test-helpers';

describe('BaggageSpanProcessor', () => {
  const exporter = setupTestExporter([new BaggageSpanProcessor()]);

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
    const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);

    const span = tracer.startSpan(
      'Edward W. Span',
      {
        kind: SpanKind.SERVER,
      },
      ctx,
    );

    span.end();

    const finishedSpans = exporter.getFinishedSpans();
    expect(finishedSpans).toHaveLength(1);
    expect(finishedSpans[0].attributes).toEqual(expectedAttrs);
  });
});
