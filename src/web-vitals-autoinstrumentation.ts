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
  TTFBAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals/attribution';
import {
  InstrumentationBase,
  InstrumentationConfig,
} from '@opentelemetry/instrumentation';

export interface WebVitalsInstrumentationConfig extends InstrumentationConfig {
  vitalsToTrack?: Array<Metric['name']>;
}

export class WebVitalsInstrumentation extends InstrumentationBase {
  readonly vitalsToTrack: Array<Metric['name']>;

  constructor(
    config: WebVitalsInstrumentationConfig = {
      enabled: true,
    },
  ) {
    super('@honeycombio/instrumentation-web-vitals', '0.0.1', {
      // NOTE: this is an unfortunate necessity to initially set
      // the enabled state of the instrumentation to false because
      // super gets called before anything else and in the parent class
      // if enabled is true, it will call `this.enable()` and the `enable`
      // function will run before any of the config options (e.g. vitalsToTrack)
      // can become available. So we're setting this explicitly to false, making config options available,
      // and then enabling the instrumentation in this constructor.

      // This is usually not an issue when instrumentation is patching functions and not calling them
      // directly, this instrumentation is a bit of a special case.
      enabled: false,
    });
    this.vitalsToTrack = config?.vitalsToTrack || ['CLS', 'LCP', 'INP'];

    if (config.enabled === true) {
      this.enable();
    }
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

  onReportCLS = (cls: CLSMetricWithAttribution) => {
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

    span.end();
  };

  onReportLCP = (lcp: LCPMetricWithAttribution) => {
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

    span.end();
  };

  onReportINP = (inp: INPMetricWithAttribution) => {
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

    span.end();
  };

  onReportFCP = (fcp: FCPMetricWithAttribution) => {
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

    span.end();
  };

  onReportFID = (fid: FIDMetricWithAttribution) => {
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

    span.end();
  };

  onReportTTFB = (ttfb: TTFBMetricWithAttribution) => {
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

    span.end();
  };

  enable(): void {
    this._diag.debug(`Sending spans for ${this.vitalsToTrack.join(',')}`);

    if (this.vitalsToTrack.includes('CLS')) {
      onCLS((vital) => {
        this.onReportCLS(vital);
      });
    }

    if (this.vitalsToTrack.includes('LCP')) {
      onLCP((vital) => {
        this.onReportLCP(vital);
      });
    }

    if (this.vitalsToTrack.includes('INP')) {
      onINP((vital) => {
        this.onReportINP(vital);
      });
    }

    if (this.vitalsToTrack.includes('FID')) {
      onFID((vital) => {
        this.onReportFID(vital);
      });
    }

    if (this.vitalsToTrack.includes('TTFB')) {
      onTTFB((vital) => {
        this.onReportTTFB(vital);
      });
    }

    if (this.vitalsToTrack.includes('FCP')) {
      onFCP((vital) => {
        this.onReportFCP(vital);
      });
    }
  }
}
