import {
  CLSAttribution,
  CLSMetricWithAttribution,
  FCPAttribution,
  FCPMetricWithAttribution,
  INPAttribution,
  INPMetricWithAttribution,
  LCPAttribution,
  LCPMetricWithAttribution,
  Metric,
  onCLS,
  onFCP,
  onINP,
  onLCP,
  onTTFB,
  ReportOpts,
  TTFBAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals/attribution';
import {
  Instrumentation,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';
import { VERSION } from './version';
import {
  diag,
  DiagLogger,
  Meter,
  MeterProvider,
  metrics,
  Span,
  trace,
  Tracer,
  TracerProvider,
} from '@opentelemetry/api';
import * as shimmer from 'shimmer';
import {
  ATTR_CLS_DELTA,
  ATTR_CLS_ELEMENT,
  ATTR_CLS_HAD_RECENT_INPUT,
  ATTR_CLS_ID,
  ATTR_CLS_LARGEST_SHIFT_TARGET,
  ATTR_CLS_LARGEST_SHIFT_TIME,
  ATTR_CLS_LARGEST_SHIFT_VALUE,
  ATTR_CLS_LOAD_STATE,
  ATTR_CLS_NAVIGATION_TYPE,
  ATTR_CLS_RATING,
  ATTR_CLS_VALUE,
  ATTR_FCP_DELTA,
  ATTR_FCP_ID,
  ATTR_FCP_LOAD_STATE,
  ATTR_FCP_NAVIGATION_TYPE,
  ATTR_FCP_RATING,
  ATTR_FCP_TIME_SINCE_FIRST_BYTE,
  ATTR_FCP_TIME_TO_FIRST_BYTE,
  ATTR_FCP_VALUE,
  ATTR_INP_DELTA,
  ATTR_INP_DURATION,
  ATTR_INP_ELEMENT,
  ATTR_INP_EVENT_TYPE,
  ATTR_INP_ID,
  ATTR_INP_INPUT_DELAY,
  ATTR_INP_INTERACTION_TARGET,
  ATTR_INP_INTERACTION_TIME,
  ATTR_INP_INTERACTION_TYPE,
  ATTR_INP_LOAD_STATE,
  ATTR_INP_NAVIGATION_TYPE,
  ATTR_INP_NEXT_PAINT_TIME,
  ATTR_INP_PRESENTATION_DELAY,
  ATTR_INP_PROCESSING_DURATION,
  ATTR_INP_RATING,
  ATTR_INP_SCRIPT_DURATION,
  ATTR_INP_SCRIPT_ENTRY_TYPE,
  ATTR_INP_SCRIPT_EXECUTION_START,
  ATTR_INP_SCRIPT_FORCED_STYLE_AND_LAYOUT_DURATION,
  ATTR_INP_SCRIPT_INVOKER,
  ATTR_INP_SCRIPT_PAUSE_DURATION,
  ATTR_INP_SCRIPT_SOURCE_CHAR_POSITION,
  ATTR_INP_SCRIPT_SOURCE_FUNCTION_NAME,
  ATTR_INP_SCRIPT_SOURCE_URL,
  ATTR_INP_SCRIPT_START_TIME,
  ATTR_INP_SCRIPT_WINDOW_ATTRIBUTION,
  ATTR_INP_TIMING_DURATION,
  ATTR_INP_TIMING_ENTRY_TYPE,
  ATTR_INP_TIMING_NAME,
  ATTR_INP_TIMING_RENDER_START,
  ATTR_INP_TIMING_START_TIME,
  ATTR_INP_VALUE,
  ATTR_LCP_DELTA,
  ATTR_LCP_ELEMENT,
  ATTR_LCP_ELEMENT_RENDER_DELAY,
  ATTR_LCP_ID,
  ATTR_LCP_NAVIGATION_TYPE,
  ATTR_LCP_RATING,
  ATTR_LCP_RESOURCE_LOAD_DELAY,
  ATTR_LCP_RESOURCE_LOAD_DURATION,
  ATTR_LCP_RESOURCE_LOAD_TIME,
  ATTR_LCP_TIME_TO_FIRST_BYTE,
  ATTR_LCP_URL,
  ATTR_LCP_VALUE,
  ATTR_TTFB_CACHE_DURATION,
  ATTR_TTFB_CONNECTION_DURATION,
  ATTR_TTFB_CONNECTION_TIME,
  ATTR_TTFB_DELTA,
  ATTR_TTFB_DNS_DURATION,
  ATTR_TTFB_DNS_TIME,
  ATTR_TTFB_ID,
  ATTR_TTFB_NAVIGATION_TYPE,
  ATTR_TTFB_RATING,
  ATTR_TTFB_REQUEST_DURATION,
  ATTR_TTFB_REQUEST_TIME,
  ATTR_TTFB_VALUE,
  ATTR_TTFB_WAITING_DURATION,
  ATTR_TTFB_WAITING_TIME,
} from './semantic-attributes';

type ApplyCustomAttributesFn = (vital: Metric, span: Span) => void;

interface VitalOpts extends ReportOpts {
  /**
   * Callback function to add custom attributes to web vitals span.
   * @example
   * (vital, span) => {
   *   // a value under 3000ms is acceptable as a 'good' rating for our team
   *   // this would otherwise show up as 'needs-improvement' if the value is less than 2500 in 'lcp.rating' according to the
   *   // set standards but we want to record this as well.
   *   if (vital.value < 3000) {
   *     span.setAttribute('lcp.custom_rating', 'good');
   *  }
   * }
   */
  applyCustomAttributes?: ApplyCustomAttributesFn;
}

interface LcpVitalOpts extends VitalOpts {
  /**
   * Will filter the values of these data attributes if provided, otherwise will send all data-* attributes an LCP entry
   * An empty allow list, such as { dataAttributes: [] } will disable sending data-* attributes
   */
  dataAttributes?: string[];
}

interface InpVitalOpts extends VitalOpts {
  /**
   * if this is true it will create spans from the PerformanceLongAnimationFrameTiming frames
   */
  includeTimingsAsSpans?: boolean;
  /**
   * Will filter the values of these data attributes if provided, otherwise will send all data-* attributes an INP entry
   * An empty allow list, such as { dataAttributes: [] } will disable sending data-* attributes
   */
  dataAttributes?: string[];
}

// To avoid importing InstrumentationAbstract from:
// import { InstrumentationAbstract } from '@opentelemetry/instrumentation/build/src/instrumentation';
// When this is exposed we can import from there.
export abstract class InstrumentationAbstract implements Instrumentation {
  protected _config: InstrumentationConfig;

  private _tracer: Tracer;
  private _meter: Meter;
  protected _diag: DiagLogger;

  constructor(
    public readonly instrumentationName: string,
    public readonly instrumentationVersion: string,
    config: InstrumentationConfig = {},
  ) {
    this._config = {
      enabled: true,
      ...config,
    };

    this._diag = diag.createComponentLogger({
      namespace: instrumentationName,
    });

    this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);

    this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
    this._updateMetricInstruments();
  }

  /* Api to wrap instrumented method */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  protected _wrap = shimmer.wrap;
  /* Api to unwrap instrumented methods */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  protected _unwrap = shimmer.unwrap;
  /* Api to mass wrap instrumented method */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  protected _massWrap = shimmer.massWrap;
  /* Api to mass unwrap instrumented methods */
  // eslint-disable-next-line @typescript-eslint/unbound-method
  protected _massUnwrap = shimmer.massUnwrap;

  /* Returns meter */
  protected get meter(): Meter {
    return this._meter;
  }

  /**
   * Sets MeterProvider to this plugin
   * @param meterProvider
   */
  public setMeterProvider(meterProvider: MeterProvider): void {
    this._meter = meterProvider.getMeter(
      this.instrumentationName,
      this.instrumentationVersion,
    );

    this._updateMetricInstruments();
  }

  /**
   * Sets the new metric instruments with the current Meter.
   */
  protected _updateMetricInstruments(): void {
    return;
  }

  /* Returns InstrumentationConfig */
  public getConfig(): InstrumentationConfig {
    return this._config;
  }

  /**
   * Sets InstrumentationConfig to this plugin
   * @param InstrumentationConfig
   */
  public setConfig(config: InstrumentationConfig = {}): void {
    this._config = Object.assign({}, config);
  }

  /**
   * Sets TraceProvider to this plugin
   * @param tracerProvider
   */
  public setTracerProvider(tracerProvider: TracerProvider): void {
    this._tracer = tracerProvider.getTracer(
      this.instrumentationName,
      this.instrumentationVersion,
    );
  }

  /* Returns tracer */
  protected get tracer(): Tracer {
    return this._tracer;
  }

  /* Disable plugin */
  public abstract enable(): void;

  /* Enable plugin */
  public abstract disable(): void;

  /**
   * Init method in which plugin should define _modules and patches for
   * methods
   */
  protected abstract init(): void;
}

export interface WebVitalsInstrumentationConfig extends InstrumentationConfig {
  /** Array of web vitals to send spans for, defaults to ["CLS", "LCP", "INP"] if not specified. */
  vitalsToTrack?: Array<Metric['name']>;

  /** Config specific to LCP (Largest Contentful Paint) */
  lcp?: LcpVitalOpts;

  /** Config specific to CLS (Cumulative Layout Shift) */
  cls?: VitalOpts;

  /** Config specific to INP (Interaction to Next Paint) */
  inp?: InpVitalOpts;

  /** Config specific to FCP (First Contentful Paint) */
  fcp?: VitalOpts;

  /** Config specific to TTFB (Time To First Byte) */
  ttfb?: VitalOpts;
}

/**
 * Web vitals auto-instrumentation, sends spans automatically for CLS, LCP, INP, FCP, TTFB.
 * Defaults to sending spans for CLS, LCP, INP, FCP and TTFB.
 * @param config The {@link WebVitalsInstrumentationConfig }
 */
export class WebVitalsInstrumentation extends InstrumentationAbstract {
  readonly vitalsToTrack: Array<Metric['name']>;
  readonly lcpOpts?: LcpVitalOpts;
  readonly clsOpts?: VitalOpts;
  readonly inpOpts?: InpVitalOpts;
  readonly fcpOpts?: VitalOpts;
  readonly ttfbOpts?: VitalOpts;
  private _isEnabled: boolean;

  constructor({
    enabled = true,
    vitalsToTrack = ['CLS', 'LCP', 'INP', 'TTFB', 'FCP'],
    lcp,
    cls,
    inp,
    fcp,
    ttfb,
  }: WebVitalsInstrumentationConfig = {}) {
    const config: WebVitalsInstrumentationConfig = {
      enabled,
      vitalsToTrack,
      lcp,
      cls,
      inp,
      fcp,
      ttfb,
    };
    super('@honeycombio/instrumentation-web-vitals', VERSION, config);
    this.vitalsToTrack = [...vitalsToTrack];
    this.lcpOpts = lcp;
    this.clsOpts = cls;
    this.inpOpts = inp;
    this.fcpOpts = fcp;
    this.ttfbOpts = ttfb;
    this._isEnabled = enabled;
    this._setupWebVitalsCallbacks();
  }

  init() {}

  private _setupWebVitalsCallbacks() {
    if (this.vitalsToTrack.includes('CLS')) {
      onCLS((vital) => {
        this.onReportCLS(vital, this.clsOpts);
      }, this.clsOpts);
    }

    if (this.vitalsToTrack.includes('LCP')) {
      onLCP((vital) => {
        this.onReportLCP(vital, this.lcpOpts);
      }, this.lcpOpts);
    }

    if (this.vitalsToTrack.includes('INP')) {
      onINP((vital) => {
        this.onReportINP(vital, this.inpOpts);
      }, this.inpOpts);
    }

    if (this.vitalsToTrack.includes('TTFB')) {
      onTTFB((vital) => {
        this.onReportTTFB(vital, this.ttfbOpts);
      }, this.ttfbOpts);
    }

    if (this.vitalsToTrack.includes('FCP')) {
      onFCP((vital) => {
        this.onReportFCP(vital, this.fcpOpts);
      }, this.fcpOpts);
    }
  }

  private getAttributesForPerformanceLongAnimationFrameTiming(
    perfEntry: PerformanceLongAnimationFrameTiming,
  ) {
    const loafAttributes = {
      [ATTR_INP_TIMING_DURATION]: perfEntry.duration,
      [ATTR_INP_TIMING_ENTRY_TYPE]: perfEntry.entryType,
      [ATTR_INP_TIMING_NAME]: perfEntry.name,
      [ATTR_INP_TIMING_RENDER_START]: perfEntry.renderStart,
      [ATTR_INP_TIMING_START_TIME]: perfEntry.startTime,
    };
    return loafAttributes;
  }

  private getAttributesForPerformanceScriptTiming(
    scriptPerfEntry: PerformanceScriptTiming,
  ) {
    const scriptAttributes = {
      [ATTR_INP_SCRIPT_ENTRY_TYPE]: scriptPerfEntry.entryType,
      [ATTR_INP_SCRIPT_START_TIME]: scriptPerfEntry.startTime,
      [ATTR_INP_SCRIPT_EXECUTION_START]: scriptPerfEntry.executionStart,
      [ATTR_INP_SCRIPT_DURATION]: scriptPerfEntry.duration,
      [ATTR_INP_SCRIPT_FORCED_STYLE_AND_LAYOUT_DURATION]:
        scriptPerfEntry.forcedStyleAndLayoutDuration,
      [ATTR_INP_SCRIPT_INVOKER]: scriptPerfEntry.invoker,
      [ATTR_INP_SCRIPT_PAUSE_DURATION]: scriptPerfEntry.pauseDuration,
      [ATTR_INP_SCRIPT_SOURCE_URL]: scriptPerfEntry.sourceURL,
      [ATTR_INP_SCRIPT_SOURCE_FUNCTION_NAME]:
        scriptPerfEntry.sourceFunctionName,
      [ATTR_INP_SCRIPT_SOURCE_CHAR_POSITION]:
        scriptPerfEntry.sourceCharPosition,
      [ATTR_INP_SCRIPT_WINDOW_ATTRIBUTION]: scriptPerfEntry.windowAttribution,
    };
    return scriptAttributes;
  }

  private processPerformanceLongAnimationFrameTimingSpans(
    perfEntry?: PerformanceLongAnimationFrameTiming,
  ) {
    if (!perfEntry) return;

    const loafAttributes =
      this.getAttributesForPerformanceLongAnimationFrameTiming(perfEntry);
    this.tracer.startActiveSpan(
      perfEntry.name,
      { startTime: perfEntry.startTime },
      (span) => {
        span.setAttributes(loafAttributes);
        this.processPerformanceScriptTimingSpans(perfEntry.scripts);
        span.end(perfEntry.startTime + perfEntry.duration);
      },
    );
  }

  private processPerformanceScriptTimingSpans(
    perfScriptEntries?: PerformanceScriptTiming[],
  ) {
    if (!perfScriptEntries) return;
    if (!perfScriptEntries?.length) return;

    perfScriptEntries.forEach((scriptPerfEntry) => {
      this.tracer.startActiveSpan(
        scriptPerfEntry.name,
        { startTime: scriptPerfEntry.startTime },
        (span) => {
          const scriptAttributes =
            this.getAttributesForPerformanceScriptTiming(scriptPerfEntry);
          span.setAttributes(scriptAttributes);
          span.end(scriptPerfEntry.startTime + scriptPerfEntry.duration);
        },
      );
    });
  }

  private getElementFromNode(node: Node | null): Element | undefined {
    if (node?.nodeType === Node.ELEMENT_NODE) {
      return node as Element;
    }
    return undefined;
  }

  private addDataAttributes(
    element: Element | null | undefined,
    span: Span,
    dataAttributes: string[] | undefined,
    attrPrefix: string,
  ) {
    const el = element as HTMLElement;

    if (el?.dataset) {
      for (const attrName in el.dataset) {
        const attrValue = el.dataset[attrName];
        if (
          // Value exists (including the empty string AND either
          attrValue !== undefined &&
          // dataAttributes is undefined (i.e. send all values as span attributes) OR
          (dataAttributes === undefined ||
            // dataAttributes is specified AND attrName is in dataAttributes (i.e attribute name is in the supplied allowList)
            dataAttributes.includes(attrName))
        ) {
          span.setAttribute(
            `${attrPrefix}.element.data.${attrName}`,
            attrValue,
          );
        }
      }
    }
  }

  onReportCLS = (cls: CLSMetricWithAttribution, clsOpts: VitalOpts = {}) => {
    const { applyCustomAttributes } = clsOpts;
    if (!this.isEnabled()) return;

    const { name, attribution } = cls;
    const {
      largestShiftTarget,
      largestShiftTime,
      largestShiftValue,
      loadState,
      largestShiftEntry,
    }: CLSAttribution = attribution;

    const span = this.tracer.startSpan(name);
    span.setAttributes({
      [ATTR_CLS_ID]: cls.id,
      [ATTR_CLS_DELTA]: cls.delta,
      [ATTR_CLS_VALUE]: cls.value,
      [ATTR_CLS_RATING]: cls.rating,
      [ATTR_CLS_NAVIGATION_TYPE]: cls.navigationType,
      [ATTR_CLS_LARGEST_SHIFT_TARGET]: largestShiftTarget,
      [ATTR_CLS_ELEMENT]: largestShiftTarget,
      [ATTR_CLS_LARGEST_SHIFT_TIME]: largestShiftTime,
      [ATTR_CLS_LARGEST_SHIFT_VALUE]: largestShiftValue,
      [ATTR_CLS_LOAD_STATE]: loadState,
      [ATTR_CLS_HAD_RECENT_INPUT]: largestShiftEntry?.hadRecentInput,
    });

    if (applyCustomAttributes) {
      applyCustomAttributes(cls, span);
    }

    span.end();
  };

  onReportLCP = (lcp: LCPMetricWithAttribution, lcpOpts: LcpVitalOpts = {}) => {
    const { applyCustomAttributes, dataAttributes } = lcpOpts;
    if (!this.isEnabled()) return;

    const { name, attribution } = lcp;
    const {
      target,
      url,
      timeToFirstByte,
      resourceLoadDelay,
      resourceLoadDuration,
      elementRenderDelay,
      lcpEntry,
    }: LCPAttribution = attribution;

    const span = this.tracer.startSpan(name);
    span.setAttributes({
      [ATTR_LCP_ID]: lcp.id,
      [ATTR_LCP_DELTA]: lcp.delta,
      [ATTR_LCP_VALUE]: lcp.value,
      [ATTR_LCP_RATING]: lcp.rating,
      [ATTR_LCP_NAVIGATION_TYPE]: lcp.navigationType,
      [ATTR_LCP_ELEMENT]: target,
      [ATTR_LCP_URL]: url,
      [ATTR_LCP_TIME_TO_FIRST_BYTE]: timeToFirstByte,
      [ATTR_LCP_RESOURCE_LOAD_DELAY]: resourceLoadDelay,
      [ATTR_LCP_RESOURCE_LOAD_DURATION]: resourceLoadDuration,
      [ATTR_LCP_ELEMENT_RENDER_DELAY]: elementRenderDelay,
      // This will be deprecated in a future version
      [ATTR_LCP_RESOURCE_LOAD_TIME]: resourceLoadDuration,
    });

    this.addDataAttributes(lcpEntry?.element, span, dataAttributes, 'lcp');

    if (applyCustomAttributes) {
      applyCustomAttributes(lcp, span);
    }

    span.end();
  };

  onReportINP = (
    inp: INPMetricWithAttribution,
    inpOpts: InpVitalOpts = { includeTimingsAsSpans: false },
  ) => {
    const { applyCustomAttributes, includeTimingsAsSpans, dataAttributes } =
      inpOpts;
    if (!this.isEnabled()) return;

    const { name, attribution } = inp;
    const {
      inputDelay,
      interactionTarget,
      interactionTime,
      interactionType,
      loadState,
      nextPaintTime,
      presentationDelay,
      processingDuration,
      longAnimationFrameEntries,
    }: INPAttribution = attribution;

    const inpDuration = inputDelay + processingDuration + presentationDelay;
    this.tracer.startActiveSpan(
      name,
      { startTime: interactionTime },
      (inpSpan) => {
        const inpAttributes = {
          [ATTR_INP_ID]: inp.id,
          [ATTR_INP_DELTA]: inp.delta,
          [ATTR_INP_VALUE]: inp.value,
          [ATTR_INP_RATING]: inp.rating,
          [ATTR_INP_NAVIGATION_TYPE]: inp.navigationType,
          [ATTR_INP_INPUT_DELAY]: inputDelay,
          [ATTR_INP_INTERACTION_TARGET]: interactionTarget,
          [ATTR_INP_INTERACTION_TIME]: interactionTime,
          [ATTR_INP_INTERACTION_TYPE]: interactionType,
          [ATTR_INP_LOAD_STATE]: loadState,
          [ATTR_INP_NEXT_PAINT_TIME]: nextPaintTime,
          [ATTR_INP_PRESENTATION_DELAY]: presentationDelay,
          [ATTR_INP_PROCESSING_DURATION]: processingDuration,
          [ATTR_INP_DURATION]: inpDuration,
          // These will be deprecated in a future version
          [ATTR_INP_ELEMENT]: interactionTarget,
          [ATTR_INP_EVENT_TYPE]: interactionType,
        };

        inpSpan.setAttributes(inpAttributes);
        inp.entries.forEach((inpEntry) => {
          this.addDataAttributes(
            this.getElementFromNode(inpEntry.target),
            inpSpan,
            dataAttributes,
            'inp',
          );
        });
        if (applyCustomAttributes) {
          applyCustomAttributes(inp, inpSpan);
        }

        if (includeTimingsAsSpans) {
          longAnimationFrameEntries.forEach((perfEntry) => {
            this.processPerformanceLongAnimationFrameTimingSpans(perfEntry);
          });
        }
        inpSpan.end(interactionTime + inpDuration);
      },
    );
  };

  onReportFCP = (fcp: FCPMetricWithAttribution, fcpOpts: VitalOpts = {}) => {
    const { applyCustomAttributes } = fcpOpts;
    if (!this.isEnabled()) return;

    const { name, attribution } = fcp;
    const { timeToFirstByte, firstByteToFCP, loadState }: FCPAttribution =
      attribution;

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      [ATTR_FCP_ID]: fcp.id,
      [ATTR_FCP_DELTA]: fcp.delta,
      [ATTR_FCP_VALUE]: fcp.value,
      [ATTR_FCP_RATING]: fcp.rating,
      [ATTR_FCP_NAVIGATION_TYPE]: fcp.navigationType,
      [ATTR_FCP_TIME_TO_FIRST_BYTE]: timeToFirstByte,
      [ATTR_FCP_TIME_SINCE_FIRST_BYTE]: firstByteToFCP,
      [ATTR_FCP_LOAD_STATE]: loadState,
    });

    if (applyCustomAttributes) {
      applyCustomAttributes(fcp, span);
    }

    span.end();
  };

  onReportTTFB = (
    ttfb: TTFBMetricWithAttribution,
    ttfbOpts: VitalOpts = {},
  ) => {
    const { applyCustomAttributes } = ttfbOpts;
    if (!this.isEnabled()) return;

    const { name, attribution } = ttfb;
    const {
      cacheDuration,
      connectionDuration,
      dnsDuration,
      requestDuration,
      waitingDuration,
    }: TTFBAttribution = attribution;
    const attributes = {
      [ATTR_TTFB_ID]: ttfb.id,
      [ATTR_TTFB_DELTA]: ttfb.delta,
      [ATTR_TTFB_VALUE]: ttfb.value,
      [ATTR_TTFB_RATING]: ttfb.rating,
      [ATTR_TTFB_NAVIGATION_TYPE]: ttfb.navigationType,
      [ATTR_TTFB_WAITING_DURATION]: waitingDuration,
      [ATTR_TTFB_DNS_DURATION]: dnsDuration,
      [ATTR_TTFB_CONNECTION_DURATION]: connectionDuration,
      [ATTR_TTFB_REQUEST_DURATION]: requestDuration,
      [ATTR_TTFB_CACHE_DURATION]: cacheDuration,
      // These will be deprecated ina future version
      [ATTR_TTFB_WAITING_TIME]: waitingDuration,
      [ATTR_TTFB_DNS_TIME]: dnsDuration,
      [ATTR_TTFB_CONNECTION_TIME]: connectionDuration,
      [ATTR_TTFB_REQUEST_TIME]: requestDuration,
    };

    const span = this.tracer.startSpan(name);
    span.setAttributes(attributes);
    if (applyCustomAttributes) {
      applyCustomAttributes(ttfb, span);
    }
    span.end();
  };

  disable(): void {
    if (!this.isEnabled()) {
      this._diag.debug(`Instrumentation already disabled`);
      return;
    }
    this._isEnabled = false;
    this._diag.debug(`Instrumentation  disabled`);
  }

  enable(): void {
    if (this.isEnabled()) {
      this._diag.debug(`Instrumentation already enabled`);
      return;
    }
    this._isEnabled = true;
    this._diag.debug(`Instrumentation  enabled`);
    this._diag.debug(`Sending spans for ${this.vitalsToTrack.join(',')}`);
  }
  public isEnabled() {
    return this._isEnabled;
  }
}
