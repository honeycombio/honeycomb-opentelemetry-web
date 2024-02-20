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
  onCLS,
  onFID,
  onINP,
  onLCP,
  onTTFB,
  TTFBAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals/attribution';
import { InstrumentationBase } from '@opentelemetry/instrumentation';

type WebVitalWithAttribution =
  | LCPMetricWithAttribution
  | CLSMetricWithAttribution
  | FIDMetricWithAttribution
  | INPMetricWithAttribution
  | FCPMetricWithAttribution
  | TTFBMetricWithAttribution;

export class WebVitalsInstrumentation extends InstrumentationBase {
  constructor() {
    super('@honeycombio/instrumentation-web-vitals', '0.0.1');
  }
  init() {}

  private onReport(vital: WebVitalWithAttribution) {
    const SPAN_ATTRIBUTE_PREFIX = 'web_vital';
    const { name, id, delta, rating, value, navigationType } = vital;
    const span = this.tracer.startSpan(name);

    span.setAttributes({
      [`${SPAN_ATTRIBUTE_PREFIX}.name`]: name,
      [`${SPAN_ATTRIBUTE_PREFIX}.id`]: id,
      [`${SPAN_ATTRIBUTE_PREFIX}.delta`]: delta,
      [`${SPAN_ATTRIBUTE_PREFIX}.value`]: value,
      [`${SPAN_ATTRIBUTE_PREFIX}.rating`]: rating,
      [`${SPAN_ATTRIBUTE_PREFIX}.navigation_type`]: navigationType,
    });

    switch (name) {
      case 'CLS': {
        const {
          largestShiftTarget,
          largestShiftTime,
          largestShiftValue,
          loadState,
          largestShiftEntry,
        }: CLSAttribution = vital.attribution;
        span.setAttributes({
          'cls.largest_shift_target': largestShiftTarget,
          'cls.element': largestShiftTarget,
          'cls.largest_shift_time': largestShiftTime,
          'cls.largest_shift_value': largestShiftValue,
          'cls.load_state': loadState,
          'cls.had_recent_input': largestShiftEntry?.hadRecentInput,
        });
        break;
      }
      case 'LCP': {
        const {
          element,
          url,
          timeToFirstByte,
          resourceLoadDelay,
          resourceLoadTime,
          elementRenderDelay,
        }: LCPAttribution = vital.attribution;
        span.setAttributes({
          'lcp.element': element,
          'lcp.url': url,
          'lcp.time_to_first_byte': timeToFirstByte,
          'lcp.resource_load_delay': resourceLoadDelay,
          'lcp.resource_load_time': resourceLoadTime,
          'lcp.element_render_delay': elementRenderDelay,
        });
        break;
      }
      case 'INP': {
        const { eventTarget, eventType, loadState }: INPAttribution =
          vital.attribution;

        span.setAttributes({
          'inp.element': eventTarget,
          'inp.event_type': eventType,
          'inp.load_state': loadState,
        });
        break;
      }
      case 'FCP': {
        const { timeToFirstByte, firstByteToFCP, loadState }: FCPAttribution =
          vital.attribution;
        span.setAttributes({
          'fcp.time_to_first_byte': timeToFirstByte,
          'fcp.time_since_first_byte': firstByteToFCP,
          'fcp.load_state': loadState,
        });
        break;
      }
      case 'TTFB': {
        const {
          waitingTime,
          dnsTime,
          connectionTime,
          requestTime,
        }: TTFBAttribution = vital.attribution;
        span.setAttributes({
          'ttfb.waiting_time': waitingTime,
          'ttfb.dns_time': dnsTime,
          'ttfb.connection_time': connectionTime,
          'ttfb.request_time': requestTime,
        });
        break;
      }
      case 'FID': {
        const { eventTarget, eventType, loadState }: FIDAttribution =
          vital.attribution;
        span.setAttributes({
          'fid.element': eventTarget,
          'fid.event_type': eventType,
          'fid.load_state': loadState,
        });
      }
    }
  }

  enable(): void {
    onCLS((vital) => {
      this.onReport(vital);
    });
    onFID((vital) => {
      this.onReport(vital);
    });
    onLCP((vital) => {
      this.onReport(vital);
    });
    onINP((vital) => {
      this.onReport(vital);
    });
    onTTFB((vital) => {
      this.onReport(vital);
    });
  }
}

// export class WebVitalsInstrumentation extends InstrumentationBase {
//   onReport(metric, parentSpanContext) {
//     const now = hrTime();
//     const webVitalsSpan = trace
//       .getTracer('web-vitals-instrumentation')
//       .startSpan(metric.name, { startTime: now }, parentSpanContext);

//     webVitalsSpan.setAttributes({
//       [`web_vital.name`]: metric.name,
//       [`web_vital.id`]: metric.id,
//       [`web_vital.navigationType`]: metric.navigationType,
//       [`web_vital.delta`]: metric.delta,
//       [`web_vital.rating`]: metric.rating,
//       [`web_vital.value`]: metric.value,
//       // can expand these into their own attributes!
//       [`web_vital.entries`]: JSON.stringify(metric.entries),
//     });
//     switch (metric.name) {
//       case 'LCP':
//         webVitalsSpan.setAttributes({
//           'web_vital.lcp.element': metric.attribution.element,
//         });
//         break;

//       case 'CLS':
//         webVitalsSpan.setAttributes({
//           'web_vital.cls.largestShiftTarget':
//             metric.attribution.largestShiftTarget,
//         });
//         break;
//       case 'FID':
//         webVitalsSpan.setAttributes({
//           'web_vital.fid.eventTarget': metric.attribution.eventTarget,
//         });
//         break;
//       case 'INP':
//         webVitalsSpan.setAttributes({
//           'web_vital.inp.eventTarget': metric.attribution.eventTarget,
//         });
//         break;

//       default:
//         break;
//     }
//     webVitalsSpan.end();
//   }

//   enable() {
//     if (this.enabled) {
//       return;
//     }
//     this.enabled = true;

//     // create a parent span that will have all web vitals spans as children
//     const parentSpan = trace
//       .getTracer('web-vitals-instrumentation')
//       .startSpan('web-vitals');
//     const ctx = trace.setSpan(context.active(), parentSpan);
//     parentSpan.end();

//     onFID((metric) => {
//       this.onReport(metric, ctx);
//     });
//     onCLS((metric) => {
//       this.onReport(metric, ctx);
//     });
//     onLCP((metric) => {
//       this.onReport(metric, ctx);
//     });
//     onINP((metric) => {
//       this.onReport(metric, ctx);
//     });
//   }
// }
