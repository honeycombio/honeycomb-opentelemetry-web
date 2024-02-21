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
import { InstrumentationBase } from '@opentelemetry/instrumentation';

export class WebVitalsInstrumentation extends InstrumentationBase {
  constructor() {
    super('@honeycombio/instrumentation-web-vitals', '0.0.1');
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

  private onReportCLS(cls: CLSMetricWithAttribution) {
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
  }

  private onReportLCP(lcp: LCPMetricWithAttribution) {
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
  }

  private onReportINP(inp: INPMetricWithAttribution) {
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
  }

  private onReportFCP(fcp: FCPMetricWithAttribution) {
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
  }

  private onReportFID(fid: FIDMetricWithAttribution) {
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
  }

  private onReportTTFB(ttfb: TTFBMetricWithAttribution) {
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
      [`${attrPrefix}.waiting_time`]: waitingTime,
      [`${attrPrefix}.dns_time`]: dnsTime,
      [`${attrPrefix}.connection_time`]: connectionTime,
      [`${attrPrefix}.request_time`]: requestTime,
    });

    span.end();
  }

  enable(): void {
    onCLS((vital) => {
      this.onReportCLS(vital);
    });
    onFID((vital) => {
      this.onReportFID(vital);
    });
    onLCP((vital) => {
      this.onReportLCP(vital);
    });
    onINP((vital) => {
      this.onReportINP(vital);
    });
    onTTFB((vital) => {
      this.onReportTTFB(vital);
    });
    onFCP((vital) => {
      this.onReportFCP(vital);
    });
  }
}
