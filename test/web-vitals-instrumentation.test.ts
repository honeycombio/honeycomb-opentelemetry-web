import { WebVitalsInstrumentation } from '../src/web-vitals-autoinstrumentation';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

describe('Web Vitals Instrumentation Tests', () => {
  const exporter = new InMemorySpanExporter();
  const provider = new BasicTracerProvider();
  const spanProcessor = new SimpleSpanProcessor(exporter);
  provider.addSpanProcessor(spanProcessor);
  provider.register();

  afterEach(() => {
    exporter.reset();
  });
  const webVitalsInstr = new WebVitalsInstrumentation({ enabled: false });
  it('should create a CLS span', () => {
    webVitalsInstr.onReportCLS(
      {
        name: 'CLS',
        value: 0.2,
        id: 'cls-id',
        delta: 0.2,
        rating: 'needs-improvement',
        navigationType: 'back-forward',
        entries: [],
        attribution: {
          largestShiftTarget: 'div#my-biggest-shift-element',
          largestShiftTime: 100,
          largestShiftValue: 0.2,
          loadState: 'complete',
          largestShiftEntry: {
            hadRecentInput: true,
            value: 0.2,
            sources: [],
            duration: 0.3,
            entryType: 'layout-shift',
            name: 'layout-shift',
            startTime: 0.1,
            toJSON() {
              return '';
            },
          },
        },
      },
      (cls, span) => {
        span.setAttributes({
          'cls.entries': cls.entries.toString(),
          'cls.my_custom_attr': 'custom_attr',
        });
      },
    );

    const span = exporter.getFinishedSpans()[0];
    expect(span.name).toBe('CLS');
    expect(span.instrumentationLibrary.name).toBe(
      '@honeycombio/instrumentation-web-vitals',
    );
    expect(span.attributes).toEqual({
      'cls.value': 0.2,
      'cls.id': 'cls-id',
      'cls.delta': 0.2,
      'cls.rating': 'needs-improvement',
      'cls.navigation_type': 'back-forward',
      'cls.largest_shift_target': 'div#my-biggest-shift-element',
      'cls.element': 'div#my-biggest-shift-element',
      'cls.largest_shift_time': 100,
      'cls.largest_shift_value': 0.2,
      'cls.load_state': 'complete',
      'cls.had_recent_input': true,
      'cls.entries': '',
      'cls.my_custom_attr': 'custom_attr',
    });
  });

  it('should create an LCP span', () => {
    webVitalsInstr.onReportLCP(
      {
        name: 'LCP',
        value: 2500,
        id: 'lcp-id',
        delta: 2500,
        rating: 'good',
        navigationType: 'back-forward',
        entries: [],
        attribution: {
          element: 'div#lcp-element',
          url: 'https://my-cool-image.stuff',
          timeToFirstByte: 30,
          resourceLoadTime: 20,
          elementRenderDelay: 20,
          resourceLoadDelay: 100,
        },
      },
      (lcp, span) => {
        span.setAttributes({
          'lcp.entries': lcp.entries.toString(),
          'lcp.my_custom_attr': 'custom_attr',
        });
      },
    );

    const span = exporter.getFinishedSpans()[0];
    expect(span.name).toBe('LCP');
    expect(span.instrumentationLibrary.name).toBe(
      '@honeycombio/instrumentation-web-vitals',
    );
    expect(span.attributes).toEqual({
      'lcp.value': 2500,
      'lcp.id': 'lcp-id',
      'lcp.delta': 2500,
      'lcp.rating': 'good',
      'lcp.navigation_type': 'back-forward',
      'lcp.element': 'div#lcp-element',
      'lcp.url': 'https://my-cool-image.stuff',
      'lcp.time_to_first_byte': 30,
      'lcp.resource_load_delay': 100,
      'lcp.resource_load_time': 20,
      'lcp.element_render_delay': 20,
      'lcp.entries': '',
      'lcp.my_custom_attr': 'custom_attr',
    });
  });

  it('should create an INP span', () => {
    webVitalsInstr.onReportINP(
      {
        name: 'INP',
        value: 200,
        id: 'inp-id',
        delta: 200,
        rating: 'good',
        entries: [],
        navigationType: 'back-forward',
        attribution: {
          eventTarget: 'div#inp-element',
          eventType: 'input-delay',
          loadState: 'complete',
        },
      },
      (inp, span) => {
        span.setAttributes({
          'inp.entries': inp.entries.toString(),
          'inp.my_custom_attr': 'custom_attr',
        });
      },
    );

    const span = exporter.getFinishedSpans()[0];
    expect(span.name).toBe('INP');
    expect(span.instrumentationLibrary.name).toBe(
      '@honeycombio/instrumentation-web-vitals',
    );
    expect(span.attributes).toEqual({
      'inp.value': 200,
      'inp.id': 'inp-id',
      'inp.delta': 200,
      'inp.rating': 'good',
      'inp.navigation_type': 'back-forward',
      'inp.element': 'div#inp-element',
      'inp.event_type': 'input-delay',
      'inp.load_state': 'complete',
      'inp.entries': '',
      'inp.my_custom_attr': 'custom_attr',
    });
  });

  it('should create an FCP span', () => {
    webVitalsInstr.onReportFCP(
      {
        name: 'FCP',
        value: 2500,
        id: 'fcp-id',
        delta: 2500,
        rating: 'good',
        navigationType: 'back-forward',
        entries: [],
        attribution: {
          timeToFirstByte: 200,
          firstByteToFCP: 400,
          loadState: 'complete',
        },
      },
      (fcp, span) => {
        span.setAttributes({
          'fcp.entries': fcp.entries.toString(),
          'fcp.my_custom_attr': 'custom_attr',
        });
      },
    );
    const span = exporter.getFinishedSpans()[0];
    expect(span.name).toBe('FCP');
    expect(span.instrumentationLibrary.name).toBe(
      '@honeycombio/instrumentation-web-vitals',
    );
    expect(span.attributes).toEqual({
      'fcp.value': 2500,
      'fcp.id': 'fcp-id',
      'fcp.delta': 2500,
      'fcp.rating': 'good',
      'fcp.navigation_type': 'back-forward',
      'fcp.time_to_first_byte': 200,
      'fcp.time_since_first_byte': 400,
      'fcp.load_state': 'complete',
      'fcp.entries': '',
      'fcp.my_custom_attr': 'custom_attr',
    });
  });

  it('should create a TTFB span', () => {
    webVitalsInstr.onReportTTFB(
      {
        name: 'TTFB',
        value: 2500,
        id: 'ttfb-id',
        delta: 2500,
        rating: 'good',
        navigationType: 'back-forward',
        entries: [],
        attribution: {
          waitingTime: 100,
          dnsTime: 1000,
          connectionTime: 200,
          requestTime: 300,
        },
      },
      (ttfb, span) => {
        span.setAttributes({
          'ttfb.entries': ttfb.entries.toString(),
          'ttfb.my_custom_attr': 'custom_attr',
        });
      },
    );

    const span = exporter.getFinishedSpans()[0];
    expect(span.name).toBe('TTFB');
    expect(span.instrumentationLibrary.name).toBe(
      '@honeycombio/instrumentation-web-vitals',
    );
    expect(span.attributes).toEqual({
      'ttfb.value': 2500,
      'ttfb.id': 'ttfb-id',
      'ttfb.delta': 2500,
      'ttfb.rating': 'good',
      'ttfb.navigation_type': 'back-forward',
      'ttfb.waiting_time': 100,
      'ttfb.dns_time': 1000,
      'ttfb.connection_time': 200,
      'ttfb.request_time': 300,
      'ttfb.entries': '',
      'ttfb.my_custom_attr': 'custom_attr',
    });
  });

  it('should create an FID span', () => {
    webVitalsInstr.onReportFID(
      {
        name: 'FID',
        value: 2500,
        id: 'fid-id',
        delta: 2500,
        rating: 'good',
        navigationType: 'back-forward',
        entries: [],
        attribution: {
          eventTarget: 'div#fid-element',
          eventType: 'input-delay',
          loadState: 'complete',
          eventTime: 0,
          eventEntry: {
            duration: 0.3,
            entryType: 'layout-shift',
            name: 'layout-shift',
            startTime: 0.1,
            cancelable: false,
            processingStart: 0,
            target: document.body,
            toJSON() {
              return '';
            },
          },
        },
      },
      (fid, span) => {
        span.setAttributes({
          'fid.entries': fid.entries.toString(),
          'fid.my_custom_attr': 'custom_attr',
        });
      },
    );

    const span = exporter.getFinishedSpans()[0];
    expect(span.name).toBe('FID');
    expect(span.instrumentationLibrary.name).toBe(
      '@honeycombio/instrumentation-web-vitals',
    );
    expect(span.attributes).toEqual({
      'fid.value': 2500,
      'fid.id': 'fid-id',
      'fid.delta': 2500,
      'fid.rating': 'good',
      'fid.navigation_type': 'back-forward',
      'fid.element': 'div#fid-element',
      'fid.event_type': 'input-delay',
      'fid.load_state': 'complete',
      'fid.entries': '',
      'fid.my_custom_attr': 'custom_attr',
    });
  });
});
