import {
  CLSMetricWithAttribution,
  FCPMetricWithAttribution,
  FIDMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals';
import { WebVitalsInstrumentation } from '../src/web-vitals-autoinstrumentation';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';

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
    resourceLoadTime: 20,
    elementRenderDelay: 20,
    resourceLoadDelay: 100,
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
  'lcp.resource_load_time': 20,
  'lcp.element_render_delay': 20,
  'lcp.entries': '',
  'lcp.my_custom_attr': 'custom_attr',
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
    eventTarget: 'div#inp-element',
    eventType: 'input-delay',
    loadState: 'complete',
  },
};

const INPAttr = {
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
    waitingTime: 100,
    dnsTime: 1000,
    connectionTime: 200,
    requestTime: 300,
  },
};

const TTFBAttr = {
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
  const exporter = new InMemorySpanExporter();
  const provider = new BasicTracerProvider();
  const spanProcessor = new SimpleSpanProcessor(exporter);
  provider.addSpanProcessor(spanProcessor);
  provider.register();

  afterEach(() => {
    exporter.reset();
  });

  describe('CLS', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportCLS(CLS, (cls, span) => {
        span.setAttributes({
          'cls.entries': cls.entries.toString(),
          'cls.my_custom_attr': 'custom_attr',
        });
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('CLS');
      expect(span.instrumentationLibrary.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toEqual(CLSAttr);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['CLS'],
      });
      instr.disable();
      instr.onReportCLS(CLS, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportCLS(CLS, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('CLS');
    });
  });

  describe('LCP', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportLCP(LCP, (lcp, span) => {
        span.setAttributes({
          'lcp.entries': lcp.entries.toString(),
          'lcp.my_custom_attr': 'custom_attr',
        });
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('LCP');
      expect(span.instrumentationLibrary.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toEqual(LCPAttr);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['LCP'],
      });
      instr.disable();
      instr.onReportLCP(LCP, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportLCP(LCP, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('LCP');
    });
  });

  describe('INP', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportINP(INP, (inp, span) => {
        span.setAttributes({
          'inp.entries': inp.entries.toString(),
          'inp.my_custom_attr': 'custom_attr',
        });
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('INP');
      expect(span.instrumentationLibrary.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toEqual(INPAttr);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['INP'],
      });
      instr.disable();
      instr.onReportINP(INP, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportINP(INP, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('INP');
    });
  });

  describe('FCP', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportFCP(FCP, (fcp, span) => {
        span.setAttributes({
          'fcp.entries': fcp.entries.toString(),
          'fcp.my_custom_attr': 'custom_attr',
        });
      });
      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('FCP');
      expect(span.instrumentationLibrary.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toEqual(FCPAttr);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['FCP'],
      });
      instr.disable();
      instr.onReportFCP(FCP, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportFCP(FCP, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('FCP');
    });
  });

  describe('TTFB', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportTTFB(TTFB, (ttfb, span) => {
        span.setAttributes({
          'ttfb.entries': ttfb.entries.toString(),
          'ttfb.my_custom_attr': 'custom_attr',
        });
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('TTFB');
      expect(span.instrumentationLibrary.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toEqual(TTFBAttr);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['TTFB'],
      });
      instr.disable();
      instr.onReportTTFB(TTFB, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportTTFB(TTFB, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('TTFB');
    });
  });

  describe('FID', () => {
    it('should create a span when enabled', () => {
      const webVitalsInstr = new WebVitalsInstrumentation();
      webVitalsInstr.onReportFID(FID, (fid, span) => {
        span.setAttributes({
          'fid.entries': fid.entries.toString(),
          'fid.my_custom_attr': 'custom_attr',
        });
      });

      const span = exporter.getFinishedSpans()[0];
      expect(span.name).toBe('FID');
      expect(span.instrumentationLibrary.name).toBe(
        '@honeycombio/instrumentation-web-vitals',
      );
      expect(span.attributes).toEqual(FIDAttr);
    });

    it('should not create a span when disabled', () => {
      const instr = new WebVitalsInstrumentation({
        vitalsToTrack: ['FID'],
      });
      instr.disable();
      instr.onReportFID(FID, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(0);
      instr.enable();
      instr.onReportFID(FID, () => {});

      expect(exporter.getFinishedSpans().length).toEqual(1);
      expect(exporter.getFinishedSpans()[0].name).toEqual('FID');
    });
  });

  describe('config.vitalsToTrack', () => {
    it(`should default to ['CLS', 'LCP', 'INP'] when an empty config`, () => {
      const instr = new WebVitalsInstrumentation();
      expect(instr.vitalsToTrack).toEqual(['CLS', 'LCP', 'INP']);
    });

    it(`should default to ['CLS', 'LCP', 'INP'] when OTHER configuration options`, () => {
      const instr = new WebVitalsInstrumentation({ enabled: false });
      expect(instr.vitalsToTrack).toEqual(['CLS', 'LCP', 'INP']);
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
