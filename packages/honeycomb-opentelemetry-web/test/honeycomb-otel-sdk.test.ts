/**
 * @jest-environment-options {"url": "http://something-something.com/some-page?search_params=yes&hello=hi#the-hash"}
 */

import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { WebSDK } from '../src/base-otel-sdk';
import { VERSION } from '../src/version';
import { HoneycombOptions } from '../src/types';
import {
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  trace,
} from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';

test('it should extend the OTel WebSDK', () => {
  const honeycomb = new HoneycombWebSDK();
  expect(honeycomb).toBeInstanceOf(WebSDK);
});

/* These tests rely on `getResourceAttributes`, a method not
 * currently available in the proposed upstream version of
 * the base-otel-sdk. */
describe('resource config', () => {
  test('it should merge resources from the configuration', () => {
    const config = {
      resource: resourceFromAttributes({
        myTestAttr: 'my-test-attr',
      }),
    };

    const honeycomb = new HoneycombWebSDK(config);

    const attributes = honeycomb.getResourceAttributes();
    expect(attributes['honeycomb.distro.version']).toEqual(VERSION);
    expect(attributes['honeycomb.distro.runtime_version']).toEqual('browser');
    expect(attributes.myTestAttr).toEqual('my-test-attr');
  });

  test('it should include resourceAttributes from the configuration', () => {
    const config = {
      resource: resourceFromAttributes({
        myTestAttr: 'my-test-attr',
      }),
      resourceAttributes: { jumpingJacks: 25, marbles: 52 },
    };

    const honeycomb = new HoneycombWebSDK(config);

    const attributes = honeycomb.getResourceAttributes();
    expect(attributes['honeycomb.distro.version']).toEqual(VERSION);
    expect(attributes['honeycomb.distro.runtime_version']).toEqual('browser');
    expect(attributes.myTestAttr).toEqual('my-test-attr');
    expect(attributes.jumpingJacks).toEqual(25);
    expect(attributes.marbles).toEqual(52);
  });
});

describe('entry page configuration', () => {
  test('includes entry page attributes by default', () => {
    const honeycomb = new HoneycombWebSDK();
    const attributes = honeycomb.getResourceAttributes();
    expect(attributes['entry_page.path']).toEqual('/some-page');
  });

  test('does not include entry page attributes when `config.entryPageAttributes` is false', () => {
    const config: HoneycombOptions = {
      entryPageAttributes: false,
    };

    const honeycomb = new HoneycombWebSDK(config);

    const attributes = honeycomb.getResourceAttributes();
    expect(attributes['entry_page.path']).toBeUndefined();
  });

  test('it respects custom config options', () => {
    const config: HoneycombOptions = {
      entryPageAttributes: {
        url: true,
        path: false,
      },
    };

    const honeycomb = new HoneycombWebSDK(config);

    const attributes = honeycomb.getResourceAttributes();
    expect(attributes['entry_page.url']).toEqual(
      'http://something-something.com/some-page?search_params=yes&hello=hi#the-hash',
    );
    expect(attributes['entry_page.path']).toBeUndefined();
  });
});

describe('span processor config', () => {
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

  const exporter = new InMemorySpanExporter();
  const config: HoneycombOptions = {
    spanProcessor: new TestSpanProcessorTwo(),
    spanProcessors: [
      new TestSpanProcessorOne(),
      new SimpleSpanProcessor(exporter),
    ],
    // Disable JSON exporter for testing
    disableDefaultTraceExporter: true,
  };
  const honeycomb = new HoneycombWebSDK(config);

  beforeEach(() => {
    honeycomb.start();
    exporter.reset();

    try {
      const span = trace
        .getTracer('span-processor-testing')
        .startSpan('A Very Important Browser Span!');
      span.end();
    } catch (e) {
      // Ignore the error
    }
  });

  afterAll(async () => {
    await honeycomb.shutdown();
  });

  test('it should use the BrowserAttributesSpanProcessor', () => {
    const finishedSpans = exporter.getFinishedSpans();
    expect(finishedSpans).toHaveLength(1);
    expect(finishedSpans[0].attributes).toMatchObject({
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

  test('it should use the BaggageSpanProcessor', () => {
    const bag = propagation.createBaggage({
      'app.message': { value: 'heygirl' },
    });
    const ctx = propagation.setBaggage(ROOT_CONTEXT, bag);
    const span = trace.getTracer('span-processor-testing').startSpan(
      'A Very Important Browser Span!',
      {
        kind: SpanKind.CLIENT,
      },
      ctx,
    );
    span.end();
    const getFinishedSpans = exporter.getFinishedSpans();
    expect(getFinishedSpans).toHaveLength(2);
    expect(getFinishedSpans[1].attributes).toMatchObject({
      'app.message': 'heygirl',
    });
  });

  test('it should use the SessionSpanProcessor', () => {
    const finishedSpans = exporter.getFinishedSpans();
    expect(finishedSpans).toHaveLength(1);
    expect(finishedSpans[0].attributes).toMatchObject({
      'session.id': expect.stringMatching(/^[a-z0-9]{32}$/),
    });
  });

  test('it should use a customer span processor passed through spanProcessors', () => {
    const finishedSpans = exporter.getFinishedSpans();
    expect(finishedSpans).toHaveLength(1);
    expect(finishedSpans[0].attributes).toMatchObject({
      'processor1.name': 'TestSpanProcessorOne',
    });
  });

  test('it should use a customer span processor passed through spanProcessor', () => {
    const finishedSpans = exporter.getFinishedSpans();
    expect(finishedSpans).toHaveLength(1);
    expect(finishedSpans[0].attributes).toMatchObject({
      'processor2.name': 'TestSpanProcessorTwo',
    });
  });
});
