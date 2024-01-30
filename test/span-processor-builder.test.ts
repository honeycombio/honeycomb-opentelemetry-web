/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */
import {
  CompositeSpanProcessor,
  configureSpanProcessors,
} from '../src/span-processor-builder';
import {
  BasicTracerProvider,
  BatchSpanProcessor,
  Span,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { ROOT_CONTEXT, SpanKind, TraceFlags } from '@opentelemetry/api';

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

describe('CompositeSpanProcessor', () => {
  const compositeSpanProcessor = new CompositeSpanProcessor();

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

  test('Combines multiple span processors', () => {
    compositeSpanProcessor.addProcessor(new TestSpanProcessorOne());
    compositeSpanProcessor.addProcessor(new TestSpanProcessorTwo());

    compositeSpanProcessor.onStart(span, ROOT_CONTEXT);

    expect(span.attributes).toEqual({
      'processor1.name': 'TestSpanProcessorOne',
      'processor2.name': 'TestSpanProcessorTwo',
    });
  });
});

describe('configureSpanProcessors', () => {
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
  test('Configures BatchSpanProcessor & BrowserAttributesSpanProcessor by default', () => {
    const honeycombSpanProcessors = configureSpanProcessors({});
    expect(honeycombSpanProcessors.getSpanProcessors()).toHaveLength(2);
    expect(honeycombSpanProcessors.getSpanProcessors()[0]).toBeInstanceOf(
      BatchSpanProcessor,
    );

    honeycombSpanProcessors.onStart(span, ROOT_CONTEXT);
    expect(span.attributes).toEqual({
      'browser.width': 1024,
      'browser.height': 768,
      'page.hash': '#the-hash',
      'page.hostname': 'something-something.com',
      'page.route': '/some-page',
      'page.search': '?search_params=yes&hello=hi',
      'page.url':
        'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
    });
  });
  test('Configures additional user provided span processor', () => {
    const honeycombSpanProcessors = configureSpanProcessors({
      spanProcessor: new TestSpanProcessorOne(),
    });
    expect(honeycombSpanProcessors.getSpanProcessors()).toHaveLength(3);
    expect(honeycombSpanProcessors.getSpanProcessors()[0]).toBeInstanceOf(
      BatchSpanProcessor,
    );

    honeycombSpanProcessors.onStart(span, ROOT_CONTEXT);
    expect(span.attributes).toEqual({
      'browser.width': 1024,
      'browser.height': 768,
      'page.hash': '#the-hash',
      'page.hostname': 'something-something.com',
      'page.route': '/some-page',
      'page.search': '?search_params=yes&hello=hi',
      'page.url':
        'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
      'processor1.name': 'TestSpanProcessorOne',
    });
  });
});
