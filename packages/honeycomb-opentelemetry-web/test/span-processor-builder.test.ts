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
import {
  propagation,
  ROOT_CONTEXT,
  SpanKind,
  TraceFlags,
} from '@opentelemetry/api';

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
  test('Configures BatchSpanProcessor, BaggageSpanProcessor, & BrowserAttributesSpanProcessor by default', () => {
    const honeycombSpanProcessors = configureSpanProcessors({});
    expect(honeycombSpanProcessors.getSpanProcessors()).toHaveLength(4);
    expect(honeycombSpanProcessors.getSpanProcessors()[0]).toBeInstanceOf(
      BatchSpanProcessor,
    );
    const bag = propagation.createBaggage({
      'app.message': { value: 'heygirl' },
    });
    const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);
    honeycombSpanProcessors.onStart(span, ctx);
    expect(span.attributes).toMatchObject({
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

  test('Configures additional user provided span processor', () => {
    const honeycombSpanProcessors = configureSpanProcessors({
      spanProcessor: new TestSpanProcessorOne(),
    });
    expect(honeycombSpanProcessors.getSpanProcessors()).toHaveLength(5);
    expect(honeycombSpanProcessors.getSpanProcessors()[0]).toBeInstanceOf(
      BatchSpanProcessor,
    );

    honeycombSpanProcessors.onStart(span, ROOT_CONTEXT);
    expect(span.attributes).toMatchObject({
      'browser.width': 1024,
      'browser.height': 768,
      'page.hash': '#the-hash',
      'page.hostname': 'something-something.com',
      'page.route': '/some-page',
      'page.search': '?search_params=yes&hello=hi',
      'page.url':
        'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
      'processor1.name': 'TestSpanProcessorOne',
      'url.path': '/some-page',
      'session.id': expect.stringMatching(/^[a-z0-9]{32}$/),
    });
  });

  test('Configures array of span processors if provided', () => {
    const honeycombSpanProcessors = configureSpanProcessors({
      spanProcessors: [new TestSpanProcessorOne(), new TestSpanProcessorTwo()],
    });

    expect(honeycombSpanProcessors.getSpanProcessors()).toHaveLength(6);

    honeycombSpanProcessors.onStart(span, ROOT_CONTEXT);
    expect(span.attributes).toMatchObject({
      'browser.width': 1024,
      'browser.height': 768,
      'page.hash': '#the-hash',
      'page.hostname': 'something-something.com',
      'page.route': '/some-page',
      'page.search': '?search_params=yes&hello=hi',
      'page.url':
        'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
      'processor1.name': 'TestSpanProcessorOne',
      'processor2.name': 'TestSpanProcessorTwo',
      'url.path': '/some-page',
      'session.id': expect.stringMatching(/^[a-z0-9]{32}$/),
    });
  });
});
