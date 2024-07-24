/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */

import { BrowserAttributesSpanProcessor } from '../src/browser-attributes-span-processor';
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';
import { BasicTracerProvider, Span } from '@opentelemetry/sdk-trace-base';

describe('BrowserAttributesSpanProcessor', () => {
  const browserAttrsSpanProcessor = new BrowserAttributesSpanProcessor();

  let span: Span;

  beforeEach(() => {
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
    browserAttrsSpanProcessor.onStart(span);

    expect(span.attributes).toEqual({
      'browser.width': 1024,
      'browser.height': 768,
      'page.hash': '#the-hash',
      'page.hostname': 'something-something.com',
      'page.route': '/some-page',
      'page.search': '?search_params=yes&hello=hi',
      'page.url':
        'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
      'url.path': '/some-page',
    });
  });
});
