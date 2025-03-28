/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */
import { configureSpanProcessors } from '../src/configure-span-processors';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';
import {
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  trace,
} from '@opentelemetry/api';

import { setupTestExporter } from './test-helpers';

class TestSpanProcessorOne implements SpanProcessor {
  onStart(span: Span): void {
    span.setAttributes({
      'processor1.name': 'TestSpanProcessorOne',
    });
  }

  onEnd(): void {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}

class TestSpanProcessorTwo implements SpanProcessor {
  onStart(span: Span): void {
    span.setAttributes({
      'processor2.name': 'TestSpanProcessorTwo',
    });
  }

  onEnd(): void {}

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    return Promise.resolve();
  }
}

describe('configureSpanProcessors', () => {
  const honeycombSpanProcessors = configureSpanProcessors({});
  const exporter = setupTestExporter(honeycombSpanProcessors);
  let span: Span;

  beforeEach(() => {
    exporter.reset();
    span = trace
      .getTracer('composite-span-processor-testing')
      .startSpan('A Very Important Browser Span!');
  });
  test('Configures BatchSpanProcessor, BaggageSpanProcessor, & BrowserAttributesSpanProcessor by default', () => {
    expect(honeycombSpanProcessors).toHaveLength(3);

    const bag = propagation.createBaggage({
      'app.message': { value: 'heygirl' },
    });
    const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);

    span = trace
      .getTracer('composite-span-processor-testing')
      .startSpan(
        'A Very Important Browser Span!',
        { kind: SpanKind.CLIENT },
        ctx,
      );

    span.end();
    const getFinishedSpans = exporter.getFinishedSpans();
    expect(getFinishedSpans).toHaveLength(1);
    expect(getFinishedSpans[0].attributes).toMatchObject({
      'app.message': 'heygirl',
      'browser.width': 1024,
      'browser.height': 768,
      'page.hash': '#the-hash',
      'page.hostname': 'something-something.com',
      'page.route': '/some-page',
      'page.search': '?search_params=yes&hello=hi',
      'page.url':
        'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
      'url.path': '/some-page',
      'session.id': expect.stringMatching(/^[a-z0-9]{32}$/),
    });
  });

  test('Configures array of span processors if provided', () => {
    const testSpanProcessorOne = new TestSpanProcessorOne();
    const testSpanProcessorTwo = new TestSpanProcessorTwo();

    const honeycombSpanProcessors = configureSpanProcessors({
      spanProcessors: [testSpanProcessorOne, testSpanProcessorTwo],
    });

    expect(honeycombSpanProcessors).toHaveLength(5);

    span = trace
      .getTracer('composite-span-processor-testing')
      .startSpan('A Very Important Browser Span!', { kind: SpanKind.CLIENT });

    testSpanProcessorOne.onStart(span);
    testSpanProcessorTwo.onStart(span);
    span.end();
    const getFinishedSpans = exporter.getFinishedSpans();
    expect(getFinishedSpans).toHaveLength(1);
    expect(getFinishedSpans[0].attributes).toMatchObject({
      'processor1.name': 'TestSpanProcessorOne',
      'processor2.name': 'TestSpanProcessorTwo',
    });
  });
});
