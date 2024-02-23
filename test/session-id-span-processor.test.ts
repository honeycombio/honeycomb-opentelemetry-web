import {
  context,
  propagation,
  ROOT_CONTEXT,
  SpanKind,
  trace,
  TraceFlags,
} from '@opentelemetry/api';
import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { SessionIdSpanProcessor } from '../src/session-id-span-processor';

import { BasicTracerProvider, Span } from '@opentelemetry/sdk-trace-base';

describe('SessionIdSpanProcessor', () => {
  let span: Span;
  const sessionSpanProcessor = new SessionIdSpanProcessor();
  beforeEach(() => {
    span = new Span(
      new BasicTracerProvider().getTracer('session-testing'),
      ROOT_CONTEXT,
      'test-span',
      {
        traceId: 'e4cda95b652f4a1592b449d5929fda1b',
        spanId: '7e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      },
      SpanKind.SERVER,
    );
  });
  it('adds current sessionid to a span as attributes', () => {
    expect(span.attributes).toEqual({});
    sessionSpanProcessor.onStart(span);
    expect(span.attributes).toEqual(
      expect.objectContaining({
        'session.id': expect.any(String), // this always gets added as an attribute
      }),
    );
  });
  it('adds current sessionid to baggage', () => {
    sessionSpanProcessor.onStart(span);
    expect(propagation.getBaggage(context.active())?.getAllEntries()).toEqual({
      'session.id': expect.any(String), // this should be in baggage too, fails
    });
  });
});

describe('sdk', () => {
  it('adds session id to baggage', () => {
    const honeycomb = new HoneycombWebSDK();
    honeycomb.start();

    const span = trace.getTracer('test-tracer').startSpan('test-span');
    const ctx = propagation.setBaggage(
      context.active(),
      propagation.createBaggage({
        shenanigans: { value: 'are happening' },
      }),
    );

    expect(propagation.getBaggage(ctx)?.getEntry('shenanigans')).toEqual({
      value: 'are happening',
    }); // this should be in baggage, works fine
    expect(propagation.getBaggage(context.active())?.getAllEntries()).toEqual({
      'session.id': expect.any(String), // this should be in baggage, fails
    });

    span.end();
  });
});
