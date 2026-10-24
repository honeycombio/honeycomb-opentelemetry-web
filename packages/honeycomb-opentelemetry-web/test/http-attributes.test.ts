/**
 * Regression test for the HTTP span attributes that downstream consumers of
 * Honeycomb Web SDK telemetry (queries, dashboards, derived columns) rely on:
 *
 *   - http.method
 *   - http.url
 *   - http.response_content_length
 *
 * These are the *old* (pre-1.7.0) HTTP semantic conventions. Upstream
 * OpenTelemetry JS instrumentation packages are migrating to the stable
 * conventions (`http.request.method`, `url.full`, ...) and are dropping the
 * old attributes, or gating them behind an option that may default to "off"
 * (see `skipOldSemconvContentLengthAttrs` in `@opentelemetry/sdk-trace-web`'s
 * `addSpanNetworkEvents`).
 *
 * This suite runs the real fetch and XHR instrumentations, plus the helper
 * shared by document-load and resource-timing, and fails if a dependency
 * update removes or renames those attributes. If it fails after an upgrade,
 * the change is user-visible and needs a release note.
 */
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  addSpanNetworkEvents,
  InMemorySpanExporter,
  SimpleSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';

/*
 * `@opentelemetry/instrumentation-fetch` only patches `fetch` when a
 * `PerformanceObserver` is present (it uses one to correlate resource
 * timing entries with fetch spans). jsdom doesn't implement it, so without
 * this stub the instrumentation silently no-ops and this test would give a
 * false pass.
 */
class StubPerformanceObserver {
  observe() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
(globalThis as { PerformanceObserver?: unknown }).PerformanceObserver =
  StubPerformanceObserver;

/* Both instrumentations wait ~300ms after the request settles before
 * ending the span, to give a PerformanceObserver a chance to correlate
 * resource timing entries with it. */
const waitForSpanEnd = () => new Promise((resolve) => setTimeout(resolve, 350));

describe('fetch() spans include the legacy HTTP attributes', () => {
  const FETCH_ENDPOINT = 'http://example.test/widgets';
  const mswServer = setupServer(
    http.get(FETCH_ENDPOINT, () => HttpResponse.text('ok')),
  );

  const exporter = new InMemorySpanExporter();
  const provider = new WebTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });

  let unregister: () => void;

  beforeAll(() => {
    mswServer.listen();
    unregister = registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [new FetchInstrumentation()],
    });
  });

  afterAll(() => {
    unregister();
    mswServer.close();
  });

  afterEach(() => {
    mswServer.resetHandlers();
    exporter.reset();
  });

  test('a fetch() span includes http.method and http.url', async () => {
    await fetch(FETCH_ENDPOINT);
    await waitForSpanEnd();

    const [span] = exporter.getFinishedSpans();
    expect(span).toBeDefined();
    expect(span.attributes['http.method']).toBe('GET');
    expect(span.attributes['http.url']).toBe(FETCH_ENDPOINT);
  });
});

describe('XMLHttpRequest spans include the legacy HTTP attributes', () => {
  /* `msw`'s XHR interceptor shadows `send` on the XHR *instance*, which
   * shadows the prototype-level patch that instrumentation-xml-http-request
   * relies on, so it never sees the request complete. A real HTTP server
   * sidesteps that so the instrumentation behaves as it would in a browser. */
  let httpServer: Server;
  let endpoint: string;

  const exporter = new InMemorySpanExporter();
  const provider = new WebTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });

  let unregister: () => void;

  beforeAll(async () => {
    httpServer = createServer((_req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end('ok');
    });
    await new Promise<void>((resolve) =>
      httpServer.listen(0, '127.0.0.1', resolve),
    );
    const { port } = httpServer.address() as AddressInfo;
    endpoint = `http://127.0.0.1:${port}/widgets`;

    unregister = registerInstrumentations({
      tracerProvider: provider,
      instrumentations: [new XMLHttpRequestInstrumentation()],
    });
  });

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        unregister();
        httpServer.close(() => resolve());
      }),
  );

  afterEach(() => exporter.reset());

  test('an XMLHttpRequest span includes http.method and http.url', async () => {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', endpoint);
      xhr.onload = () => resolve();
      xhr.onerror = () => reject(new Error('xhr request failed'));
      xhr.send();
    });
    await waitForSpanEnd();

    const [span] = exporter.getFinishedSpans();
    expect(span).toBeDefined();
    expect(span.attributes['http.method']).toBe('GET');
    expect(span.attributes['http.url']).toBe(endpoint);
  });
});

describe('addSpanNetworkEvents (shared by document-load and resource-timing) sets http.response_content_length', () => {
  const exporter = new InMemorySpanExporter();
  const provider = new WebTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });
  const tracer = provider.getTracer('http-attributes-test');

  afterEach(() => exporter.reset());

  test('an encodedBodySize on the performance entry becomes the http.response_content_length attribute', () => {
    const span = tracer.startSpan('resourceFetch');

    // Shape of the subset of PerformanceResourceTiming that
    // addSpanNetworkEvents reads from.
    addSpanNetworkEvents(span, {
      startTime: 0,
      encodedBodySize: 1234,
    });
    span.end();

    const [finished] = exporter.getFinishedSpans();
    expect(finished.attributes['http.response_content_length']).toBe(1234);
  });
});
