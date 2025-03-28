/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */

import { BrowserAttributesSpanProcessor } from '../src/browser-attributes-span-processor';
import { SpanKind, trace } from '@opentelemetry/api';

import { setupTestExporter } from './test-helpers';

describe('BrowserAttributesSpanProcessor', () => {
  const exporter = setupTestExporter([new BrowserAttributesSpanProcessor()]);

  beforeEach(() => {
    exporter.reset();
  });

  test('Span processor adds extra browser attributes', () => {
    const tracer = trace.getTracer('browser-attrs-testing');
    const span = tracer.startSpan('A Very Important Browser Span!', {
      kind: SpanKind.CLIENT,
    });

    span.end();

    const finishedSpans = exporter.getFinishedSpans();
    expect(finishedSpans).toHaveLength(1);

    expect(finishedSpans[0].attributes).toEqual({
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
