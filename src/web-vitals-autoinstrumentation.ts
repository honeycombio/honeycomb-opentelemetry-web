import {
  CLSAttribution,
  CLSMetricWithAttribution,
  FCPAttribution,
  FCPMetricWithAttribution,
  FIDAttribution,
  FIDMetricWithAttribution,
  INPAttribution,
  INPMetricWithAttribution,
  LCPAttribution,
  LCPMetricWithAttribution,
  Metric,
  onCLS,
  onFCP,
  onFID,
  onINP,
  onLCP,
  onTTFB,
  ReportOpts,
  TTFBAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals/attribution';
import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';
import { Span } from '@opentelemetry/api';
import { VERSION } from './version';

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
  applyCustomAttributes: ApplyCustomAttributesFn;
}

export interface WebVitalsInstrumentationConfig extends InstrumentationConfig {
  /** Array of web vitals to send spans for, defaults to ["CLS", "LCP", "INP"] if not specified. */
  vitalsToTrack?: Array<Metric['name']>;

  /** Config specific to LCP (Largest Contentful Paint) */
  lcp?: VitalOpts;

  /** Config specific to CLS (Cumulative Layout Shift) */
  cls?: VitalOpts;

  /** Config specific to INP (Interaction to Next Paint) */
  inp?: VitalOpts;

  /** Config specific to FID (First Input Delay) */
  fid?: VitalOpts;

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
export class WebVitalsInstrumentation extends InstrumentationBase {
  readonly vitalsToTrack: Array<Metric['name']>;
  readonly lcpOpts?: VitalOpts;
  readonly clsOpts?: VitalOpts;
  readonly inpOpts?: VitalOpts;
  readonly fidOpts?: VitalOpts;
  readonly fcpOpts?: VitalOpts;
  readonly ttfbOpts?: VitalOpts;
  readonly enabled?: boolean;

  constructor(
    config: WebVitalsInstrumentationConfig = {
      enabled: true,
    },
  ) {
    super('@honeycombio/instrumentation-web-vitals', VERSION, {
      /**
       * NOTE: this is an unfortunate necessity to initially set
       * the enabled state of the instrumentation to false because
       * super gets called before anything else and in the parent class
       * if enabled is true, it will call `this.enable()` and the `enable`
       * function will run before any of the config options (e.g. vitalsToTrack)
       * can become available. So we're setting this explicitly to false, making config options available,
       * and then enabling the instrumentation in this constructor.
       *
       * This is usually not an issue when instrumentation is patching functions and not calling them
       * directly, this instrumentation is a bit of a special case.
       **/
      enabled: false,
    });
    this.vitalsToTrack = config?.vitalsToTrack || [
      'CLS',
      'LCP',
      'INP',
      'FCP',
      'TTFB',
    ];
    this.lcpOpts = config?.lcp;
    this.clsOpts = config?.cls;
    this.inpOpts = config?.inp;
    this.fidOpts = config?.fid;
    this.fcpOpts = config?.fcp;
    this.ttfbOpts = config?.ttfb;
    this.enabled = config?.enabled;
  }

  init() {}

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

  onReportCLS = (
    cls: CLSMetricWithAttribution,
    applyCustomAttributes?: ApplyCustomAttributesFn,
  ) => {
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

  onReportLCP = (
    lcp: LCPMetricWithAttribution,
    applyCustomAttributes?: ApplyCustomAttributesFn,
  ) => {
    const { name, attribution } = lcp;
    const {
      element,
      url,
      timeToFirstByte,
      resourceLoadDelay,
      resourceLoadTime,
      elementRenderDelay,
    }: LCPAttribution = attribution;
    const attrPrefix = this.getAttrPrefix(name);

    const span = this.tracer.startSpan(name);
    span.setAttributes({
      ...this.getSharedAttributes(lcp),
      [`${attrPrefix}.element`]: element,
      [`${attrPrefix}.url`]: url,
      [`${attrPrefix}.time_to_first_byte`]: timeToFirstByte,
      [`${attrPrefix}.resource_load_delay`]: resourceLoadDelay,
      [`${attrPrefix}.resource_load_time`]: resourceLoadTime,
      [`${attrPrefix}.element_render_delay`]: elementRenderDelay,
    });

    if (applyCustomAttributes) {
      applyCustomAttributes(lcp, span);
    }

    span.end();
  };

  onReportINP = (
    inp: INPMetricWithAttribution,
    applyCustomAttributes?: ApplyCustomAttributesFn,
  ) => {
    const { name, attribution } = inp;
    const { eventTarget, eventType, loadState }: INPAttribution = attribution;
    const attrPrefix = this.getAttrPrefix(name);

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      ...this.getSharedAttributes(inp),
      [`${attrPrefix}.element`]: eventTarget,
      [`${attrPrefix}.event_type`]: eventType,
      [`${attrPrefix}.load_state`]: loadState,
    });

    if (applyCustomAttributes) {
      applyCustomAttributes(inp, span);
    }

    span.end();
  };

  onReportFCP = (
    fcp: FCPMetricWithAttribution,
    applyCustomAttributes?: ApplyCustomAttributesFn,
  ) => {
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

  onReportFID = (
    fid: FIDMetricWithAttribution,
    applyCustomAttributes?: ApplyCustomAttributesFn,
  ) => {
    const { name, attribution } = fid;
    const { eventTarget, eventType, loadState }: FIDAttribution = attribution;
    const attrPrefix = this.getAttrPrefix(name);

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      ...this.getSharedAttributes(fid),
      [`${attrPrefix}.element`]: eventTarget,
      [`${attrPrefix}.event_type`]: eventType,
      [`${attrPrefix}.load_state`]: loadState,
    });

    if (applyCustomAttributes) {
      applyCustomAttributes(fid, span);
    }

    span.end();
  };

  onReportTTFB = (
    ttfb: TTFBMetricWithAttribution,
    applyCustomAttributes?: ApplyCustomAttributesFn,
  ) => {
    const { name, attribution } = ttfb;
    const {
      waitingTime,
      dnsTime,
      connectionTime,
      requestTime,
    }: TTFBAttribution = attribution;
    const attrPrefix = this.getAttrPrefix(name);

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      ...this.getSharedAttributes(ttfb),
      [`${attrPrefix}.waiting_time`]: waitingTime,
      [`${attrPrefix}.dns_time`]: dnsTime,
      [`${attrPrefix}.connection_time`]: connectionTime,
      [`${attrPrefix}.request_time`]: requestTime,
    });

    if (applyCustomAttributes) {
      applyCustomAttributes(ttfb, span);
    }

    span.end();
  };

  enable(): void {
    if (!this.enabled) {
      this._diag.debug(`Instrumentation disabled`);
      return;
    }
    this._diag.debug(`Sending spans for ${this.vitalsToTrack.join(',')}`);

    if (this.vitalsToTrack.includes('CLS')) {
      onCLS((vital) => {
        this.onReportCLS(vital, this.clsOpts?.applyCustomAttributes);
      }, this.clsOpts);
    }

    if (this.vitalsToTrack.includes('LCP')) {
      onLCP((vital) => {
        this.onReportLCP(vital, this.lcpOpts?.applyCustomAttributes);
      }, this.lcpOpts);
    }

    if (this.vitalsToTrack.includes('INP')) {
      onINP((vital) => {
        this.onReportINP(vital, this.inpOpts?.applyCustomAttributes);
      }, this.inpOpts);
    }

    if (this.vitalsToTrack.includes('FID')) {
      onFID((vital) => {
        this.onReportFID(vital, this.fidOpts?.applyCustomAttributes);
      }, this.fidOpts);
    }

    if (this.vitalsToTrack.includes('TTFB')) {
      onTTFB((vital) => {
        this.onReportTTFB(vital, this.ttfbOpts?.applyCustomAttributes);
      }, this.ttfbOpts);
    }

    if (this.vitalsToTrack.includes('FCP')) {
      onFCP((vital) => {
        this.onReportFCP(vital, this.fcpOpts?.applyCustomAttributes);
      }, this.fcpOpts);
    }
  }
}
