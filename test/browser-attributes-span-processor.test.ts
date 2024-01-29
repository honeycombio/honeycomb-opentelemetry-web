import { BrowserAttributesSpanProcessor } from '../src/browser-attributes-span-processor';
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';
import { BasicTracerProvider, Span } from '@opentelemetry/sdk-trace-base';

describe('BrowserAttributesSpanProcessor', () => {
  const browserAttrsSpanProcessor = new BrowserAttributesSpanProcessor();

  let span: Span;
  let windowSpy: jest.SpyInstance;

  beforeEach(() => {
    windowSpy = jest.spyOn(globalThis, 'window', 'get');

    span = new Span(
      new BasicTracerProvider().getTracer('browser-attrs-testing'),
      ROOT_CONTEXT,
      'A Very Important Browser Span!',
      {
        traceId: '',
        spanId: '',
        traceFlags: TraceFlags.SAMPLED,
      },
      SpanKind.CLIENT,
    );
  });

  test('Span processor adds extra browser attributes', () => {
    windowSpy.mockImplementation(() => ({
      location: {
        hash: '#testing',
        href: 'https://example.com/some-path#testing',
        pathname: '/some-path',
      },
      screen: {
        width: 1440,
        height: 982,
      },
    }));

    browserAttrsSpanProcessor.onStart(span);

    expect(span.attributes).toEqual({
      'browser.width': window.screen.width,
      'browser.height': window.screen.height,
      'browser.hash': window.location.hash,
      'browser.url': window.location.href,
      'browser.route': window.location.pathname,
    });
  });
});
