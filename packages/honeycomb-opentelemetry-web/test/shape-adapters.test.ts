import { SpanStatusCode } from '@opentelemetry/api';
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { logs } from '@opentelemetry/api-logs';
import {
  exceptionSpanAdapter,
  ShapeLogRecordProcessor,
  webVitalsSpanAdapter,
} from '../src/shape';
import { setupTestExporter } from './test-helpers';

/* Log records below mirror what @opentelemetry/browser-instrumentation emits,
 * captured from a real Chromium page load. */
describe('shape adapters: upstream log records -> Honeycomb spans', () => {
  const spans = setupTestExporter();
  const exportedLogs = new InMemoryLogRecordExporter();
  const emit = async (
    eventName: string,
    attributes: Record<string, string | number | boolean>,
    body?: object,
    timestamp?: number,
  ) => {
    const provider = new LoggerProvider({
      processors: [
        new ShapeLogRecordProcessor(
          [new SimpleLogRecordProcessor({ exporter: exportedLogs })],
          [webVitalsSpanAdapter, exceptionSpanAdapter],
        ),
      ],
    });
    provider.getLogger('test').emit({
      eventName,
      attributes,
      body: body ? JSON.stringify(body) : undefined,
      timestamp,
    });
    await provider.forceFlush();
  };

  beforeEach(() => {
    spans.reset();
    exportedLogs.reset();
    document.body.innerHTML = '<button id="btn" data-testid="go">Go</button>';
    logs.disable();
  });

  test('INP: span spans input delay + processing + presentation, with data attributes of the target', async () => {
    const interactionTime = 2234.5;
    await emit(
      'browser.web_vital',
      {
        'browser.web_vital.name': 'inp',
        'browser.web_vital.value': 128,
        'browser.web_vital.delta': 128,
        'browser.web_vital.rating': 'good',
        'browser.web_vital.id': 'v6-1',
        'browser.web_vital.navigation_type': 'navigate',
      },
      {
        interactionTarget: '#btn',
        interactionTime,
        interactionType: 'pointer',
        nextPaintTime: 2362.5,
        inputDelay: 1.1,
        processingDuration: 122.6,
        presentationDelay: 4.3,
        loadState: 'complete',
      },
    );

    const [span] = spans.getFinishedSpans();
    expect(span.name).toBe('INP');
    expect(span.instrumentationScope.name).toBe(
      '@honeycombio/instrumentation-web-vitals',
    );
    expect(span.attributes).toMatchObject({
      'inp.value': 128,
      'inp.rating': 'good',
      'inp.interaction_target': '#btn',
      'inp.element': '#btn',
      'inp.event_type': 'pointer',
      'inp.element.data.testid': 'go',
    });
    expect(span.attributes['inp.duration']).toBeCloseTo(128, 3);
    const durationMs = span.duration[0] * 1e3 + span.duration[1] / 1e6;
    expect(durationMs).toBeCloseTo(128, 0);
    // the metric moved into the span: it is not also exported as a log
    expect(exportedLogs.getFinishedLogRecords()).toHaveLength(0);
  });

  test('FCP: the span ends at the log timestamp and lasts `value` ms', async () => {
    const end = performance.timeOrigin + 156;
    await emit(
      'browser.web_vital',
      {
        'browser.web_vital.name': 'fcp',
        'browser.web_vital.value': 156,
        'browser.web_vital.delta': 156,
        'browser.web_vital.rating': 'good',
        'browser.web_vital.id': 'v6-2',
        'browser.web_vital.navigation_type': 'navigate',
      },
      { timeToFirstByte: 13.2, firstByteToFCP: 142.8, loadState: 'complete' },
      end,
    );

    const [span] = spans.getFinishedSpans();
    expect(span.attributes['fcp.time_to_first_byte']).toBe(13.2);
    expect(span.attributes['fcp.time_since_first_byte']).toBe(142.8);
    expect(span.duration[0] * 1e3 + span.duration[1] / 1e6).toBeCloseTo(156, 0);
    expect(span.endTime[0] * 1e3 + span.endTime[1] / 1e6).toBeCloseTo(end, 0);
  });

  test('exception: ERROR span with structured stack trace arrays', async () => {
    await emit('exception', {
      'exception.type': 'TypeError',
      'exception.message': 'boom',
      'exception.stacktrace':
        'TypeError: boom\n    at main (http://localhost/app.js:37:18)\n    at http://localhost/app.js:68:6',
    });

    const [span] = spans.getFinishedSpans();
    expect(span.name).toBe('exception');
    expect(span.status).toEqual({
      code: SpanStatusCode.ERROR,
      message: 'boom',
    });
    expect(span.attributes['exception.structured_stacktrace.lines']).toEqual([
      37, 68,
    ]);
    expect(span.attributes['exception.structured_stacktrace.columns']).toEqual([
      18, 6,
    ]);
    expect(exportedLogs.getFinishedLogRecords()).toHaveLength(0);
  });

  test('events with no adapter pass through to the exporting processor untouched', async () => {
    await emit('browser.navigation_timing', {
      'url.full': 'http://localhost/',
    });

    expect(spans.getFinishedSpans()).toHaveLength(0);
    const [record] = exportedLogs.getFinishedLogRecords();
    expect(record.eventName).toBe('browser.navigation_timing');
  });

  test('a web vital the adapter cannot shape is not lost', async () => {
    await emit('browser.web_vital', { 'browser.web_vital.name': 'fid' });

    expect(spans.getFinishedSpans()).toHaveLength(0);
    expect(exportedLogs.getFinishedLogRecords()).toHaveLength(1);
  });
});
