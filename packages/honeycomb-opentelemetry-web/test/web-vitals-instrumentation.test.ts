import {
  CLSMetricWithAttribution,
  FCPMetricWithAttribution,
  FIDMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals';
import { WebVitalsInstrumentation } from '../src/web-vitals-autoinstrumentation';

import { setupTestExporter } from './test-helpers';

const CLS: CLSMetricWithAttribution = {
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
  'cls.entries': '',
  'cls.my_custom_attr': 'custom_attr',
};
const div = document.createElement('div');
div.innerHTML = `<div id="lcp-element" data-answer="42" data-famous-cats="Mr. Mistoffelees" data-has-cats>👋 Hello World</div>`;
const lcpElement = div.firstElementChild;

const LCP: LCPMetricWithAttribution = {
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
    resourceLoadDuration: 20,
    elementRenderDelay: 20,
    resourceLoadDelay: 100,
    lcpEntry: {
      duration: 0,
      element: lcpElement,
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
  'lcp.entries': '',
  'lcp.my_custom_attr': 'custom_attr',
  'lcp.resource_load_time': 20,
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
    interactionTargetElement: undefined,
    interactionTime: 10,
    nextPaintTime: 400,
    processedEventEntries: [],
    longAnimationFrameEntries: [],
    inputDelay: 42,
    processingDuration: 600,
    presentationDelay: 500,
  },
};
const scriptTiming = {
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
};

const frameTiming = {
  duration: 1000,
  entryType: 'long-animation-frame',
  name: 'long-animation-frame',
  renderStart: 90,
  startTime: 10,
  scripts: [scriptTiming],
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
    interactionTargetElement: undefined,
    interactionTime: 10,
    nextPaintTime: 400,
    processedEventEntries: [],
    longAnimationFrameEntries: [{ ...frameTiming, toJSON: () => frameTiming }],
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
  'inp.entries': '',
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
  'fcp.entries': '',
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
  'ttfb.entries': '',
  'ttfb.my_custom_attr': 'custom_attr',
  'ttfb.waiting_time': 100,
  'ttfb.connection_time': 200,
  'ttfb.dns_time': 1000,
  'ttfb.request_time': 300,
};

const FID: FIDMetricWithAttribution = {
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
      processingEnd: 600,
      interactionId: 42,
    },
  },
};

const FIDAttr = {
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
      expect(span.attributes).toEqual(CLSAttr);
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
      expect(span.attributes).toEqual(LCPAttr);
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
      expect(span.attributes).toEqual(INPAttr);
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
      expect(span.attributes).toEqual(FCPAttr);
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
      expect(span.attributes).toEqual(TTFBAttr);
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

  describe('FID', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportFID(FID, {
        applyCustomAttributes: (fid, span) => {
          span.setAttributes({
            'fid.entries': fid.entries.toString(),
            'fid.my_custom_attr': 'custom_attr',
          });
        },
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('FID');
      expect(span.instrumentationScope.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toEqual(FIDAttr);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['FID'],
      });
      instr.disable();
      instr.onReportFID(FID, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportFID(FID, { applyCustomAttributes: () => {} });

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('FID');
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
