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

  private getSharedAttributes(vital: Metric) {
    const { name, id, delta, rating, value, navigationType } = vital;
    return {
      [`${name}.id`]: id,
      [`${name}.delta`]: delta,
      [`${name}.value`]: value,
      [`${name}.rating`]: rating,
      [`${name}.navigation_type`]: navigationType,
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

    const span = this.tracer.startSpan(name);
    span.setAttributes({
      ...this.getSharedAttributes(cls),
      [`${name}.largest_shift_target`]: largestShiftTarget,
      [`${name}.element`]: largestShiftTarget,
      [`${name}.largest_shift_time`]: largestShiftTime,
      [`${name}.largest_shift_value`]: largestShiftValue,
      [`${name}.load_state`]: loadState,
      [`${name}.had_recent_input`]: largestShiftEntry?.hadRecentInput,
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

    const span = this.tracer.startSpan(name);
    span.setAttributes({
      ...this.getSharedAttributes(lcp),
      [`${name}.element`]: element,
      [`${name}.url`]: url,
      [`${name}.time_to_first_byte`]: timeToFirstByte,
      [`${name}.resource_load_delay`]: resourceLoadDelay,
      [`${name}.resource_load_time`]: resourceLoadTime,
      [`${name}.element_render_delay`]: elementRenderDelay,
    });

    span.end();
  }

  private onReportINP(inp: INPMetricWithAttribution) {
    const { name, attribution } = inp;
    const { eventTarget, eventType, loadState }: INPAttribution = attribution;

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      ...this.getSharedAttributes(inp),
      [`${name}.element`]: eventTarget,
      [`${name}.event_type`]: eventType,
      [`${name}.load_state`]: loadState,
    });

    span.end();
  }

  private onReportFCP(fcp: FCPMetricWithAttribution) {
    const { name, attribution } = fcp;
    const { timeToFirstByte, firstByteToFCP, loadState }: FCPAttribution =
      attribution;

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      ...this.getSharedAttributes(fcp),
      [`${name}.time_to_first_byte`]: timeToFirstByte,
      [`${name}.time_since_first_byte`]: firstByteToFCP,
      [`${name}.load_state`]: loadState,
    });

    span.end();
  }

  private onReportFID(fid: FIDMetricWithAttribution) {
    const { name, attribution } = fid;
    const { eventTarget, eventType, loadState }: FIDAttribution = attribution;

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      ...this.getSharedAttributes(fid),
      [`${name}.element`]: eventTarget,
      [`${name}.event_type`]: eventType,
      [`${name}.load_state`]: loadState,
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

    const span = this.tracer.startSpan(name);

    span.setAttributes({
      [`${name}.waiting_time`]: waitingTime,
      [`${name}.dns_time`]: dnsTime,
      [`${name}.connection_time`]: connectionTime,
      [`${name}.request_time`]: requestTime,
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
