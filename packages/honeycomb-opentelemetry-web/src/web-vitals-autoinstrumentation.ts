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
 * Web vitals auto-instrumentation, sends spans automatically for CLS, LCP, INP, FCP, FID, TTFB.
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

  private getAttrPrefix(name: string) {
    return name.toLowerCase();
  }

  private getSharedAttributes(vital: Metric) {
    const { name, id, delta, rating, value, navigationType } = vital;
    const attrPrefix = this.getAttrPrefix(name);
    return {
      [`${attrPrefix}.id`]: id,
      [`${attrPrefix}.delta`]: delta,
      [`${attrPrefix}.value`]: value,
      [`${attrPrefix}.rating`]: rating,
      [`${attrPrefix}.navigation_type`]: navigationType,
    };
  }

  private getAttributesForPerformanceLongAnimationFrameTiming(
    prefix: string,
    perfEntry: PerformanceLongAnimationFrameTiming,
  ) {
    const loafAttributes = {
      [`${prefix}.duration`]: perfEntry.duration,
      [`${prefix}.entryType`]: perfEntry.entryType,
      [`${prefix}.name`]: perfEntry.name,
      [`${prefix}.renderStart`]: perfEntry.renderStart,
      [`${prefix}.startTime`]: perfEntry.startTime,
    };
    return loafAttributes;
  }

  private getAttributesForPerformanceScriptTiming(
    prefix: string,
    scriptPerfEntry: PerformanceScriptTiming,
  ) {
    const scriptAttributes = {
      [`${prefix}.entry_type`]: scriptPerfEntry.entryType,
      [`${prefix}.start_time`]: scriptPerfEntry.startTime,
      [`${prefix}.execution_start`]: scriptPerfEntry.executionStart,
      [`${prefix}.duration`]: scriptPerfEntry.duration,
      [`${prefix}.forced_style_and_layout_duration`]:
        scriptPerfEntry.forcedStyleAndLayoutDuration,
      [`${prefix}.invoker`]: scriptPerfEntry.invoker,
      [`${prefix}.pause_duration`]: scriptPerfEntry.pauseDuration,
      [`${prefix}.source_url`]: scriptPerfEntry.sourceURL,
      [`${prefix}.source_function_name`]: scriptPerfEntry.sourceFunctionName,
      [`${prefix}.source_char_position`]: scriptPerfEntry.sourceCharPosition,
      [`${prefix}.window_attribution`]: scriptPerfEntry.windowAttribution,
    };
    return scriptAttributes;
  }

  private processPerformanceLongAnimationFrameTimingSpans(
    parentPrefix: string,
    perfEntry?: PerformanceLongAnimationFrameTiming,
  ) {
    if (!perfEntry) return;

    const prefix = `${parentPrefix}.timing`;
    const loafAttributes =
      this.getAttributesForPerformanceLongAnimationFrameTiming(
        prefix,
        perfEntry,
      );
    this.tracer.startActiveSpan(
      perfEntry.name,
      { startTime: perfEntry.startTime },
      (span) => {
        span.setAttributes(loafAttributes);
        this.processPerformanceScriptTimingSpans(prefix, perfEntry.scripts);
        span.end(perfEntry.startTime + perfEntry.duration);
      },
    );
  }

  private processPerformanceScriptTimingSpans(
    parentPrefix: string,
    perfScriptEntries?: PerformanceScriptTiming[],
  ) {
    if (!perfScriptEntries) return;
    if (!perfScriptEntries?.length) return;
    const prefix = `${parentPrefix}.script`;

    perfScriptEntries.map((scriptPerfEntry) => {
      this.tracer.startActiveSpan(
        scriptPerfEntry.name,
        { startTime: scriptPerfEntry.startTime },
        (span) => {
          const scriptAttributes = this.getAttributesForPerformanceScriptTiming(
            prefix,
            scriptPerfEntry,
          );
          span.setAttributes(scriptAttributes);
          span.end(scriptPerfEntry.startTime + scriptPerfEntry.duration);
        },
      );
    });
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
    const attrPrefix = this.getAttrPrefix(name);

    const span = this.tracer.startSpan(name);
    span.setAttributes({
      ...this.getSharedAttributes(cls),
      [`${attrPrefix}.largest_shift_target`]: largestShiftTarget,
      [`${attrPrefix}.element`]: largestShiftTarget,
      [`${attrPrefix}.largest_shift_time`]: largestShiftTime,
      [`${attrPrefix}.largest_shift_value`]: largestShiftValue,
      [`${attrPrefix}.load_state`]: loadState,
      [`${attrPrefix}.had_recent_input`]: largestShiftEntry?.hadRecentInput,
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
    const attrPrefix = this.getAttrPrefix(name);

    const span = this.tracer.startSpan(name);
    span.setAttributes({
      ...this.getSharedAttributes(lcp),
      [`${attrPrefix}.element`]: target,
      [`${attrPrefix}.url`]: url,
      [`${attrPrefix}.time_to_first_byte`]: timeToFirstByte,
      [`${attrPrefix}.resource_load_delay`]: resourceLoadDelay,
      [`${attrPrefix}.resource_load_duration`]: resourceLoadDuration,
      [`${attrPrefix}.element_render_delay`]: elementRenderDelay,
      // This will be deprecated in a future version
      [`${attrPrefix}.resource_load_time`]: resourceLoadDuration,
    });

    const el: HTMLElement = lcpEntry?.element as HTMLElement;
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

    if (applyCustomAttributes) {
      applyCustomAttributes(lcp, span);
    }

    span.end();
  };

  onReportINP = (
    inp: INPMetricWithAttribution,
    inpOpts: InpVitalOpts = { includeTimingsAsSpans: false },
  ) => {
    const { applyCustomAttributes, includeTimingsAsSpans } = inpOpts;
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

    const attrPrefix = this.getAttrPrefix(name);
    const inpDuration = inputDelay + processingDuration + presentationDelay;
    this.tracer.startActiveSpan(
      name,
      { startTime: interactionTime },
      (inpSpan) => {
        const inpAttributes = {
          ...this.getSharedAttributes(inp),
          [`${attrPrefix}.input_delay`]: inputDelay,
          [`${attrPrefix}.interaction_target`]: interactionTarget,
          [`${attrPrefix}.interaction_time`]: interactionTime,
          [`${attrPrefix}.interaction_type`]: interactionType,
          [`${attrPrefix}.load_state`]: loadState,
          [`${attrPrefix}.next_paint_time`]: nextPaintTime,
          [`${attrPrefix}.presentation_delay`]: presentationDelay,
          [`${attrPrefix}.processing_duration`]: processingDuration,
          [`${attrPrefix}.duration`]: inpDuration,
          // These will be deprecated in a future version
          [`${attrPrefix}.element`]: interactionTarget,
          [`${attrPrefix}.event_type`]: interactionType,
        };

        inpSpan.setAttributes(inpAttributes);

        if (applyCustomAttributes) {
          applyCustomAttributes(inp, inpSpan);
        }

        if (includeTimingsAsSpans) {
          longAnimationFrameEntries.forEach((perfEntry) => {
            this.processPerformanceLongAnimationFrameTimingSpans(
              attrPrefix,
              perfEntry,
            );
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
    const attrPrefix = this.getAttrPrefix(name);

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      ...this.getSharedAttributes(fcp),
      [`${attrPrefix}.time_to_first_byte`]: timeToFirstByte,
      [`${attrPrefix}.time_since_first_byte`]: firstByteToFCP,
      [`${attrPrefix}.load_state`]: loadState,
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
    const attrPrefix = this.getAttrPrefix(name);
    const attributes = {
      ...this.getSharedAttributes(ttfb),
      [`${attrPrefix}.waiting_duration`]: waitingDuration,
      [`${attrPrefix}.dns_duration`]: dnsDuration,
      [`${attrPrefix}.connection_duration`]: connectionDuration,
      [`${attrPrefix}.request_duration`]: requestDuration,
      [`${attrPrefix}.cache_duration`]: cacheDuration,
      // These will be deprecated ina future version
      [`${attrPrefix}.waiting_time`]: waitingDuration,
      [`${attrPrefix}.dns_time`]: dnsDuration,
      [`${attrPrefix}.connection_time`]: connectionDuration,
      [`${attrPrefix}.request_time`]: requestDuration,
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
