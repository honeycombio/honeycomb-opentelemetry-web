import {
  CLSMetricWithAttribution,
  FCPMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals';
import { WebVitalsInstrumentation } from '../src/web-vitals-autoinstrumentation';
import { hrTime } from '@opentelemetry/core';

import { setupTestExporter } from './test-helpers';

const CLS: CLSMetricWithAttribution = {
  name: 'CLS',
  value: 0.2,
  id: 'cls-id',
  delta: 0.2,
  rating: 'needs-improvement',
  navigationType: 'back-forward',
  entries: [
    {
      hadRecentInput: false,
      value: 0.1,
      sources: [],
      duration: 0,
      entryType: 'layout-shift',
      name: 'layout-shift',
      startTime: 100,
      toJSON() {
        return '';
      },
    },
    {
      hadRecentInput: true,
      value: 0.2,
      sources: [],
      duration: 0,
      entryType: 'layout-shift',
      name: 'layout-shift',
      startTime: 200,
      toJSON() {
        return '';
      },
    },
  ],
  attribution: {
    largestShiftTarget: 'div#my-biggest-shift-element',
    largestShiftTime: 100,
    largestShiftValue: 0.2,
    loadState: 'complete',
    largestShiftEntry: {
      hadRecentInput: true,
      value: 0.2,
      sources: [],
      duration: 0,
      entryType: 'layout-shift',
      name: 'layout-shift',
      startTime: 0.1,
      toJSON() {
        return '';
      },
    },
  },
};

const CLSAttr = {
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
  'cls.my_custom_attr': 'custom_attr',
};
const div = document.createElement('div');
div.innerHTML = `<div id="data-element" data-answer="42" data-famous-cats="Mr. Mistoffelees" data-has-cats>👋 Hello World</div>`;
const dataElement = div.firstElementChild;

const LCP: LCPMetricWithAttribution = {
  name: 'LCP',
  value: 2500,
  id: 'lcp-id',
  delta: 2500,
  rating: 'good',
  navigationType: 'back-forward',
  entries: [],
  attribution: {
    target: 'div#lcp-element',
    url: 'https://my-cool-image.stuff',
    timeToFirstByte: 30,
    resourceLoadDuration: 20,
    elementRenderDelay: 20,
    resourceLoadDelay: 100,
    lcpEntry: {
      duration: 0,
      element: dataElement,
      entryType: 'largest-contentful-paint',
      id: '',
      loadTime: 0,
      name: '',
      renderTime: 74.09999999403954,
      size: 4382,
      startTime: 74.09999999403954,
      url: '',
      toJSON: () => '',
    },
  },
};

const LCPAttr = {
  'lcp.value': 2500,
  'lcp.id': 'lcp-id',
  'lcp.delta': 2500,
  'lcp.rating': 'good',
  'lcp.navigation_type': 'back-forward',
  'lcp.element': 'div#lcp-element',
  'lcp.url': 'https://my-cool-image.stuff',
  'lcp.time_to_first_byte': 30,
  'lcp.resource_load_delay': 100,
  'lcp.resource_load_duration': 20,
  'lcp.element_render_delay': 20,
  'lcp.my_custom_attr': 'custom_attr',
  'lcp.resource_load_time': 20,
};

const performanceEventTiming: PerformanceEventTiming = {
  name: 'click',
  target: dataElement,
  cancelable: false,
  processingEnd: 0,
  processingStart: 0,
  toJSON() {
    return '';
  },
  duration: 0,
  interactionId: 0,
  entryType: '',
  startTime: 0,
};

const INP: INPMetricWithAttribution = {
  name: 'INP',
  value: 200,
  id: 'inp-id',
  delta: 200,
  rating: 'good',
  entries: [],
  navigationType: 'back-forward',
  attribution: {
    interactionTarget: 'div#inp-element',
    interactionType: 'pointer',
    loadState: 'complete',
    interactionTime: 10,
    nextPaintTime: 400,
    processedEventEntries: [],
    longAnimationFrameEntries: [],
    inputDelay: 42,
    processingDuration: 600,
    presentationDelay: 500,
  },
};
const scriptTiming: PerformanceScriptTiming = {
  name: 'script',
  entryType: 'script',
  startTime: 2338.2999999523163,
  duration: 1000,
  invoker: 'BUTTON#INP-poor.onclick',
  invokerType: 'event-listener',
  windowAttribution: 'self',
  executionStart: 2338.2999999523163,
  forcedStyleAndLayoutDuration: 0,
  pauseDuration: 0,
  sourceURL: 'http://someapp.com/bundle.js',
  sourceFunctionName: 'myFn',
  sourceCharPosition: 424242,
  toJSON() {
    return '';
  },
};

const frameTiming: PerformanceLongAnimationFrameTiming = {
  duration: 1000,
  entryType: 'long-animation-frame',
  name: 'long-animation-frame',
  renderStart: 90,
  startTime: 10,
  scripts: [scriptTiming],
  styleAndLayoutStart: 0,
  blockingDuration: 0,
  firstUIEventTimestamp: 0,
  toJSON() {
    return '';
  },
};

const INPWithTimings: INPMetricWithAttribution = {
  name: 'INP',
  value: 200,
  id: 'inp-id',
  delta: 200,
  rating: 'good',
  entries: [],
  navigationType: 'back-forward',
  attribution: {
    interactionTarget: 'div#inp-element',
    interactionType: 'pointer',
    loadState: 'complete',
    interactionTime: 10,
    nextPaintTime: 400,
    processedEventEntries: [],
    longAnimationFrameEntries: [{ ...frameTiming }],
    inputDelay: 42,
    processingDuration: 600,
    presentationDelay: 500,
  },
};

const INPAttr = {
  'inp.value': 200,
  'inp.id': 'inp-id',
  'inp.duration': 1142,
  'inp.delta': 200,
  'inp.rating': 'good',
  'inp.navigation_type': 'back-forward',
  'inp.interaction_target': 'div#inp-element',
  'inp.interaction_type': 'pointer',
  'inp.load_state': 'complete',
  'inp.my_custom_attr': 'custom_attr',
  'inp.next_paint_time': 400,
  'inp.presentation_delay': 500,
  'inp.processing_duration': 600,
  'inp.interaction_time': 10,
  'inp.input_delay': 42,
  'inp.element': 'div#inp-element',
  'inp.event_type': 'pointer',
};

const FCP: FCPMetricWithAttribution = {
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
    fcpEntry: {
      name: 'first-contentful-paint',
      entryType: 'paint',
      startTime: 2500,
      duration: 0,
      toJSON() {
        return '';
      },
    },
    navigationEntry: {
      activationStart: 0,
      entryType: 'navigation',
      name: '',
      startTime: 0,
      duration: 0,
      initiatorType: 'navigation',
      nextHopProtocol: '',
      renderBlockingStatus: 'non-blocking',
      deliveryType: '',
      workerStart: 0,
      redirectStart: 0,
      redirectEnd: 0,
      fetchStart: 0,
      domainLookupStart: 0,
      domainLookupEnd: 0,
      connectStart: 0,
      secureConnectionStart: 0,
      connectEnd: 0,
      requestStart: 0,
      responseStart: 200,
      firstInterimResponseStart: 0,
      responseEnd: 0,
      transferSize: 0,
      encodedBodySize: 0,
      decodedBodySize: 0,
      responseStatus: 200,
      serverTiming: [],
      unloadEventStart: 0,
      unloadEventEnd: 0,
      domInteractive: 0,
      domContentLoadedEventStart: 0,
      domContentLoadedEventEnd: 0,
      domComplete: 0,
      loadEventStart: 0,
      loadEventEnd: 0,
      type: 'navigate',
      redirectCount: 0,
      toJSON() {
        return '';
      },
    } as PerformanceNavigationTiming,
  },
};

const FCPAttr = {
  'fcp.value': 2500,
  'fcp.id': 'fcp-id',
  'fcp.delta': 2500,
  'fcp.rating': 'good',
  'fcp.navigation_type': 'back-forward',
  'fcp.time_to_first_byte': 200,
  'fcp.time_since_first_byte': 400,
  'fcp.load_state': 'complete',
  'fcp.my_custom_attr': 'custom_attr',
};

const TTFB: TTFBMetricWithAttribution = {
  name: 'TTFB',
  value: 2500,
  id: 'ttfb-id',
  delta: 2500,
  rating: 'good',
  navigationType: 'back-forward',
  entries: [],
  attribution: {
    waitingDuration: 100,
    dnsDuration: 1000,
    requestDuration: 300,
    cacheDuration: 100,
    connectionDuration: 200,
    navigationEntry: {
      activationStart: 0,
      entryType: 'navigation',
      name: '',
      startTime: 0,
      duration: 0,
      initiatorType: 'navigation',
      nextHopProtocol: '',
      renderBlockingStatus: 'non-blocking',
      deliveryType: '',
      workerStart: 0,
      redirectStart: 0,
      redirectEnd: 0,
      fetchStart: 0,
      domainLookupStart: 0,
      domainLookupEnd: 0,
      connectStart: 0,
      secureConnectionStart: 0,
      connectEnd: 0,
      requestStart: 0,
      responseStart: 2500,
      firstInterimResponseStart: 0,
      responseEnd: 0,
      transferSize: 0,
      encodedBodySize: 0,
      decodedBodySize: 0,
      responseStatus: 200,
      serverTiming: [],
      unloadEventStart: 0,
      unloadEventEnd: 0,
      domInteractive: 0,
      domContentLoadedEventStart: 0,
      domContentLoadedEventEnd: 0,
      domComplete: 0,
      loadEventStart: 0,
      loadEventEnd: 0,
      type: 'navigate',
      redirectCount: 0,
      toJSON() {
        return '';
      },
    } as PerformanceNavigationTiming,
  },
};

const TTFBAttr = {
  'ttfb.value': 2500,
  'ttfb.id': 'ttfb-id',
  'ttfb.delta': 2500,
  'ttfb.rating': 'good',
  'ttfb.navigation_type': 'back-forward',
  'ttfb.waiting_duration': 100,
  'ttfb.dns_duration': 1000,
  'ttfb.connection_duration': 200,
  'ttfb.cache_duration': 100,
  'ttfb.request_duration': 300,
  'ttfb.my_custom_attr': 'custom_attr',
  'ttfb.waiting_time': 100,
  'ttfb.connection_time': 200,
  'ttfb.dns_time': 1000,
  'ttfb.request_time': 300,
};

describe('Web Vitals Instrumentation Tests', () => {
  const exporter = setupTestExporter();

  afterEach(() => {
    exporter.reset();
  });

  describe('CLS', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportCLS(CLS, {
        applyCustomAttributes: (cls, span) => {
          span.setAttributes({
            'cls.entries': cls.entries.toString(),
            'cls.my_custom_attr': 'custom_attr',
          });
        },
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('CLS');
      expect(span.instrumentationScope.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toMatchObject(CLSAttr);

      const expectedStart = hrTime(100);
      const expectedEnd = hrTime(200);

      expect(span.startTime).toEqual(expectedStart);
      expect(span.endTime).toEqual(expectedEnd);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['CLS'],
      });
      instr.disable();
      instr.onReportCLS(CLS, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportCLS(CLS, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('CLS');
    });
  });

  describe('LCP', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportLCP(LCP, {
        dataAttributes: [],
        applyCustomAttributes: (lcp, span) => {
          span.setAttributes({
            'lcp.entries': lcp.entries.toString(),
            'lcp.my_custom_attr': 'custom_attr',
          });
        },
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('LCP');
      expect(span.instrumentationScope.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toMatchObject(LCPAttr);

      // Verify explicit timing from actual browser events
      // Performance entry times are DOMHighResTimeStamp (ms since time origin)
      // which are converted to absolute HrTime using hrTime() helper
      const expectedStart = hrTime(0); // lcpEntry.loadTime
      const expectedEnd = hrTime(74.09999999403954); // lcpEntry.renderTime

      expect(span.startTime).toEqual(expectedStart);
      expect(span.endTime).toEqual(expectedEnd);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['LCP'],
      });
      instr.disable();
      instr.onReportLCP(LCP, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportLCP(LCP, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('LCP');
    });
    describe('dataAttributes', () => {
      it('should include add data-* attributes as span attributes when dataAttributes is undefined', () => {
        const instr = new WebVitalsInstrumentation({
          vitalsToTrack: ['LCP'],
        });
        instr.enable();
        instr.onReportLCP(LCP, {
          applyCustomAttributes: () => {},
          dataAttributes: undefined,
        });
        expect(exporter.getFinishedSpans().length).toEqual(1);
        const span = exporter.getFinishedSpans()[0];
        expect(span.attributes).toMatchObject({
          'lcp.element.data.answer': '42',
          'lcp.element.data.famousCats': 'Mr. Mistoffelees',
          'lcp.element.data.hasCats': '',
        });
      });
      it('should not include any data-* attributes when dataAttributes is []', () => {
        const instr = new WebVitalsInstrumentation({
          vitalsToTrack: ['LCP'],
        });
        instr.enable();
        instr.onReportLCP(LCP, {
          applyCustomAttributes: () => {},
          dataAttributes: [],
        });
        expect(exporter.getFinishedSpans().length).toEqual(1);
        const span = exporter.getFinishedSpans()[0];
        expect(span.attributes).not.toMatchObject({
          'lcp.element.data.answer': '42',
          'lcp.element.data.famousCats': 'Mr. Mistoffelees',
          'lcp.element.data.hasCats': '',
        });
      });
      it('should only include any data-* attributes that match dataAttributes array', () => {
        const instr = new WebVitalsInstrumentation({
          vitalsToTrack: ['LCP'],
        });
        instr.enable();
        instr.onReportLCP(LCP, {
          applyCustomAttributes: () => {},
          dataAttributes: ['answer'],
        });
        expect(exporter.getFinishedSpans().length).toEqual(1);
        const span = exporter.getFinishedSpans()[0];
        expect(span.attributes['lcp.element.data.answer']).toEqual('42');
        expect(span.attributes['lcp.element.data.famousCats']).toBeUndefined();
        expect(span.attributes['lcp.element.data.hasCats']).toBeUndefined();
        expect(span.attributes).toMatchObject({
          'lcp.element.data.answer': '42',
        });
        expect(span.attributes).not.toMatchObject({
          'lcp.element.data.famousCats': 'Mr. Mistoffelees',
          'lcp.element.data.hasCats': '',
        });
      });
    });
  });

  describe('INP', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportINP(INP, {
        applyCustomAttributes: (inp, span) => {
          span.setAttributes({
            'inp.entries': inp.entries.toString(),
            'inp.my_custom_attr': 'custom_attr',
          });
        },
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('INP');
      expect(span.instrumentationScope.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toMatchObject(INPAttr);

      // Verify explicit timing from actual browser events
      // INP timing: interactionTime (10ms) to interactionTime + duration (1152ms)
      const inpDuration = 42 + 600 + 500; // inputDelay + processingDuration + presentationDelay = 1142
      const expectedStart = hrTime(10); // interactionTime
      const expectedEnd = hrTime(10 + inpDuration); // interactionTime + inpDuration

      expect(span.startTime).toEqual(expectedStart);
      expect(span.endTime).toEqual(expectedEnd);
    });

    it('should create a include timings when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportINP(INPWithTimings, {
        applyCustomAttributes: (inp, span) => {
          span.setAttributes({
            'inp.entries': inp.entries.toString(),
            'inp.my_custom_attr': 'custom_attr',
          });
        },
        includeTimingsAsSpans: true,
      });

      const [scriptTimingSpan, timingSpan, inpSpan] =
        exporter.getFinishedSpans();
      expect(inpSpan.name).toBe('INP');
      expect(inpSpan.instrumentationScope.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(timingSpan.attributes).toEqual({
        'inp.timing.duration': 1000,
        'inp.timing.entryType': 'long-animation-frame',
        'inp.timing.name': 'long-animation-frame',
        'inp.timing.renderStart': 90,
        'inp.timing.startTime': 10,
      });
      expect(scriptTimingSpan.attributes).toEqual({
        'inp.timing.script.duration': 1000,
        'inp.timing.script.entry_type': 'script',
        'inp.timing.script.execution_start': 2338.2999999523163,
        'inp.timing.script.forced_style_and_layout_duration': 0,
        'inp.timing.script.invoker': 'BUTTON#INP-poor.onclick',
        'inp.timing.script.pause_duration': 0,
        'inp.timing.script.source_char_position': 424242,
        'inp.timing.script.source_function_name': 'myFn',
        'inp.timing.script.source_url': 'http://someapp.com/bundle.js',
        'inp.timing.script.start_time': 2338.2999999523163,
        'inp.timing.script.window_attribution': 'self',
      });
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['INP'],
      });
      instr.disable();
      instr.onReportINP(INP, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportINP(INP, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('INP');
    });

    describe('dataAttributes', () => {
      const INPWithDataAttributes: INPMetricWithAttribution = {
        ...INP,
        entries: [performanceEventTiming],
      };
      it('should include add data-* attributes as span attributes when dataAttributes is undefined', () => {
        const instr = new WebVitalsInstrumentation({
          vitalsToTrack: ['INP'],
        });
        instr.enable();
        instr.onReportINP(INPWithDataAttributes, {
          applyCustomAttributes: () => {},
          dataAttributes: undefined,
        });
        expect(exporter.getFinishedSpans().length).toEqual(1);
        const span = exporter.getFinishedSpans()[0];
        expect(span.attributes).toMatchObject({
          'inp.element.data.answer': '42',
          'inp.element.data.famousCats': 'Mr. Mistoffelees',
          'inp.element.data.hasCats': '',
        });
      });

      it('should not include any data-* attributes when dataAttributes is []', () => {
        const instr = new WebVitalsInstrumentation({
          vitalsToTrack: ['INP'],
        });
        instr.enable();
        instr.onReportINP(INPWithDataAttributes, {
          applyCustomAttributes: () => {},
          dataAttributes: [],
        });
        expect(exporter.getFinishedSpans().length).toEqual(1);
        const span = exporter.getFinishedSpans()[0];
        expect(span.attributes).not.toMatchObject({
          'inp.element.data.answer': '42',
          'inp.element.data.famousCats': 'Mr. Mistoffelees',
          'inp.element.data.hasCats': '',
        });
      });

      it('should only include any data-* attributes that match dataAttributes array', () => {
        const instr = new WebVitalsInstrumentation({
          vitalsToTrack: ['INP'],
        });
        instr.enable();
        instr.onReportINP(INPWithDataAttributes, {
          applyCustomAttributes: () => {},
          dataAttributes: ['answer'],
        });
        expect(exporter.getFinishedSpans().length).toEqual(1);
        const span = exporter.getFinishedSpans()[0];
        expect(span.attributes['inp.element.data.answer']).toEqual('42');
        expect(span.attributes['inp.element.data.famousCats']).toBeUndefined();
        expect(span.attributes['inp.element.data.hasCats']).toBeUndefined();
        expect(span.attributes).toMatchObject({
          'inp.element.data.answer': '42',
        });
        expect(span.attributes).not.toMatchObject({
          'inp.element.data.famousCats': 'Mr. Mistoffelees',
          'inp.element.data.hasCats': '',
        });
      });
    });
  });

  describe('FCP', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportFCP(FCP, {
        applyCustomAttributes: (fcp, span) => {
          span.setAttributes({
            'fcp.entries': fcp.entries.toString(),
            'fcp.my_custom_attr': 'custom_attr',
          });
        },
      });
      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('FCP');
      expect(span.instrumentationScope.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toMatchObject(FCPAttr);

      // Verify explicit timing from actual browser events
      // For normal (non-prerendered) pages: activationStart (0) to fcpEntry.startTime (2500ms)
      const expectedStart = hrTime(0); // activationStart for normal page
      const expectedEnd = hrTime(2500); // fcpEntry.startTime

      expect(span.startTime).toEqual(expectedStart);
      expect(span.endTime).toEqual(expectedEnd);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['FCP'],
      });
      instr.disable();
      instr.onReportFCP(FCP, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportFCP(FCP, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('FCP');
    });
  });

  describe('TTFB', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportTTFB(TTFB, {
        applyCustomAttributes: (ttfb, span) => {
          span.setAttributes({
            'ttfb.entries': ttfb.entries.toString(),
            'ttfb.my_custom_attr': 'custom_attr',
          });
        },
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('TTFB');
      expect(span.instrumentationScope.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toMatchObject(TTFBAttr);

      // Verify explicit timing from actual browser events
      // For normal (non-prerendered) pages: activationStart (0) to responseStart (2500ms)
      const expectedStart = hrTime(0); // activationStart for normal page
      const expectedEnd = hrTime(2500); // navigationEntry.responseStart

      expect(span.startTime).toEqual(expectedStart);
      expect(span.endTime).toEqual(expectedEnd);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['TTFB'],
      });
      instr.disable();
      instr.onReportTTFB(TTFB, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportTTFB(TTFB, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('TTFB');
    });
  });

  describe('config.vitalsToTrack', () => {
    it(`should default to ['CLS', 'LCP', 'INP', 'TTFB', 'FCP'] when an empty config`, () => {
      const instr = new WebVitalsInstrumentation();
      expect(instr.vitalsToTrack).toEqual(['CLS', 'LCP', 'INP', 'TTFB', 'FCP']);
    });

    it(`should default to ['CLS', 'LCP', 'INP', 'TTFB', 'FCP'] when OTHER configuration options`, () => {
      const instr = new WebVitalsInstrumentation({ enabled: false });
      expect(instr.vitalsToTrack).toEqual(['CLS', 'LCP', 'INP', 'TTFB', 'FCP']);
    });

    it('should be overridden vitalsToTrack is explicity passed', () => {
      const instr = new WebVitalsInstrumentation({ vitalsToTrack: ['CLS'] });
      expect(instr.vitalsToTrack).toEqual(['CLS']);
    });
  });

  describe('config.enabled', () => {
    it('should be default to be enabled when not passed anything', () => {
      const instr = new WebVitalsInstrumentation();
      expect(instr.isEnabled()).toBe(true);
    });

    it('should be default to be enabled passed other config options', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['CLS'],
      });
      expect(instr.isEnabled()).toBe(true);
    });

    it('should be enabled if explicitly passed enabled', () => {
      const instr = new WebVitalsInstrumentation({
        enabled: true,
      });
      expect(instr.isEnabled()).toBe(true);
    });

    it('should be disabled if explicitly passed enabled=false', () => {
      const instr = new WebVitalsInstrumentation({
        enabled: false,
      });
      expect(instr.isEnabled()).toBe(false);
    });

    it('should be be turned toggled when passed enabled = true', () => {
      const instr = new WebVitalsInstrumentation({
        enabled: true,
      });
      expect(instr.isEnabled()).toBe(true);
      instr.disable();
      expect(instr.isEnabled()).toBe(false);
      instr.enable();
      expect(instr.isEnabled()).toBe(true);
    });

    it('should be be turned toggled when passed enabled = false', () => {
      const instr = new WebVitalsInstrumentation({
        enabled: false,
      });
      expect(instr.isEnabled()).toBe(false);
      instr.enable();
      expect(instr.isEnabled()).toBe(true);
      instr.disable();
      expect(instr.isEnabled()).toBe(false);
    });

    it('should be be turned toggled when passed empty config', () => {
      const instr = new WebVitalsInstrumentation();
      expect(instr.isEnabled()).toBe(true);
      instr.disable();
      expect(instr.isEnabled()).toBe(false);
      instr.enable();
      expect(instr.isEnabled()).toBe(true);
    });
  });
});
