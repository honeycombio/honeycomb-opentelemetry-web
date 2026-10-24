import { Attributes, Context } from '@opentelemetry/api';
import { SdkLogRecord } from '@opentelemetry/sdk-logs';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { LogShapeAdapter } from './shape-log-record-processor';
import { defined, emitSpan } from './emit-span';

/**
 * Rebuilds Honeycomb's web vitals spans (`LCP`, `CLS`, `INP`, `FCP`, `TTFB`)
 * from upstream `browser.web_vital` log records.
 *
 * Needs the upstream instrumentation configured with
 * `includeRawAttribution: true`: the record's attributes alone carry only
 * value, delta, rating, id and navigation type.
 *
 * Known gaps, none recoverable from the log record:
 *  - `<vital>.navigation_*` for soft navigations
 *  - the CLS session-window duration (only the largest shift time is known)
 *  - `reportSoftNavs`, `vitalsToTrack` and `durationThreshold` options
 *  - `applyCustomAttributes(vital, span)` receives no live `Metric`
 */
const SCOPE = '@honeycombio/instrumentation-web-vitals';
const ATTR = (k: string) => `browser.web_vital.${k}`;

/** A `PerformanceNavigationTiming` after `JSON.stringify`. */
interface NavEntry {
  name?: string;
  navigationId?: number;
}

/** The fields of web-vitals' attribution objects that Honeycomb reports, after `JSON.stringify`. */
interface Attribution {
  navigationEntry?: NavEntry;
  loadState?: string;
  timeToFirstByte?: number;
  firstByteToFCP?: number;
  waitingDuration?: number;
  dnsDuration?: number;
  connectionDuration?: number;
  requestDuration?: number;
  cacheDuration?: number;
  largestShiftTarget?: string;
  largestShiftTime?: number;
  largestShiftValue?: number;
  largestShiftEntry?: { hadRecentInput?: boolean };
  target?: string;
  url?: string;
  resourceLoadDelay?: number;
  resourceLoadDuration?: number;
  elementRenderDelay?: number;
  lcpEntry?: { loadTime?: number; renderTime?: number };
  interactionTarget?: string;
  interactionTime?: number;
  interactionType?: string;
  nextPaintTime?: number;
  inputDelay?: number;
  processingDuration?: number;
  presentationDelay?: number;
}

const parseBody = (body: SdkLogRecord['body']): Attribution => {
  if (typeof body !== 'string') return {};
  try {
    return JSON.parse(body) as Attribution;
  } catch {
    return {};
  }
};

/**
 * The navigation the metric belongs to. Only FCP and TTFB attributions carry
 * a navigation entry. For a hard navigation, which is all web-vitals reports
 * without `reportSoftNavs`, the page's own entry is the one it would have used.
 */
const navigationEntry = (
  attribution: Attribution,
  navigationType: unknown,
): NavEntry | undefined => {
  if (attribution.navigationEntry) return attribution.navigationEntry;
  if (navigationType === 'soft-navigation') return undefined;
  const [entry] = performance.getEntriesByType('navigation');
  return entry?.toJSON() as NavEntry | undefined;
};

/** Everything the upstream record says about the metric, under Honeycomb's names. */
const common = (p: string, a: Attributes, nav?: NavEntry): Attributes =>
  defined({
    [`${p}.id`]: a[ATTR('id')],
    [`${p}.delta`]: a[ATTR('delta')],
    [`${p}.value`]: a[ATTR('value')],
    [`${p}.rating`]: a[ATTR('rating')],
    [`${p}.navigation_type`]: a[ATTR('navigation_type')],
    [`${p}.navigation_id`]: nav?.navigationId,
    [`${p}.navigation_url`]: nav?.name,
    [`${p}.navigation_start_time`]: nav ? 0 : undefined,
  });

/**
 * Honeycomb copies `data-*` attributes from the element onto the span. The
 * log record only has the element's selector, so look the element up again.
 * Best effort: the DOM may have changed since the metric was measured.
 */
const dataAttributes = (selector: unknown, prefix: string): Attributes => {
  if (typeof selector !== 'string' || typeof document === 'undefined') {
    return {};
  }
  try {
    const dataset = document.querySelector<HTMLElement>(selector)?.dataset;
    return Object.fromEntries(
      Object.entries(dataset ?? {}).map(([k, v]) => [
        `${prefix}.element.data.${k}`,
        v,
      ]),
    );
  } catch {
    return {};
  }
};

export const webVitalsSpanAdapter: LogShapeAdapter = {
  eventName: 'browser.web_vital',
  adapt(record: SdkLogRecord, context?: Context) {
    const a = record.attributes as Attributes;
    const name = String(a[ATTR('name')] ?? '').toLowerCase();
    const attribution = parseBody(record.body);
    const value = Number(a[ATTR('value')] ?? 0);
    // web-vitals reports its own measurement time as the log timestamp.
    const reportedAt = hrTimeToMilliseconds(record.hrTime);
    const origin = performance.timeOrigin;
    const base = common(
      name,
      a,
      navigationEntry(attribution, a[ATTR('navigation_type')]),
    );

    switch (name) {
      case 'fcp':
        emitSpan(
          SCOPE,
          'FCP',
          reportedAt - value,
          reportedAt,
          defined({
            ...base,
            'fcp.time_to_first_byte': attribution.timeToFirstByte,
            'fcp.time_since_first_byte': attribution.firstByteToFCP,
            'fcp.load_state': attribution.loadState,
          }),
          context,
        );
        return true;
      case 'ttfb':
        emitSpan(
          SCOPE,
          'TTFB',
          reportedAt - value,
          reportedAt,
          defined({
            ...base,
            'ttfb.waiting_duration': attribution.waitingDuration,
            'ttfb.dns_duration': attribution.dnsDuration,
            'ttfb.connection_duration': attribution.connectionDuration,
            'ttfb.request_duration': attribution.requestDuration,
            'ttfb.cache_duration': attribution.cacheDuration,
            // deprecated aliases Honeycomb still emits
            'ttfb.waiting_time': attribution.waitingDuration,
            'ttfb.dns_time': attribution.dnsDuration,
            'ttfb.connection_time': attribution.connectionDuration,
            'ttfb.request_time': attribution.requestDuration,
          }),
          context,
        );
        return true;
      case 'cls': {
        const shiftAt = attribution.largestShiftTime;
        const at = shiftAt !== undefined ? origin + shiftAt : reportedAt;
        emitSpan(
          SCOPE,
          'CLS',
          at,
          at,
          defined({
            ...base,
            'cls.largest_shift_target': attribution.largestShiftTarget,
            'cls.element': attribution.largestShiftTarget,
            'cls.largest_shift_time': shiftAt,
            'cls.largest_shift_value': attribution.largestShiftValue,
            'cls.load_state': attribution.loadState,
            'cls.had_recent_input':
              attribution.largestShiftEntry?.hadRecentInput,
            ...dataAttributes(
              attribution.largestShiftTarget,
              'cls.largestShift',
            ),
          }),
          context,
        );
        return true;
      }
      case 'lcp': {
        const entry = attribution.lcpEntry;
        emitSpan(
          SCOPE,
          'LCP',
          origin + (entry?.loadTime || 0),
          origin + (entry?.renderTime || 0),
          defined({
            ...base,
            'lcp.element': attribution.target,
            'lcp.url': attribution.url,
            'lcp.time_to_first_byte': attribution.timeToFirstByte,
            'lcp.resource_load_delay': attribution.resourceLoadDelay,
            'lcp.resource_load_duration': attribution.resourceLoadDuration,
            'lcp.element_render_delay': attribution.elementRenderDelay,
            // deprecated alias Honeycomb still emits
            'lcp.resource_load_time': attribution.resourceLoadDuration,
            ...dataAttributes(attribution.target, 'lcp'),
          }),
          context,
        );
        return true;
      }
      case 'inp': {
        const duration =
          (attribution.inputDelay ?? 0) +
          (attribution.processingDuration ?? 0) +
          (attribution.presentationDelay ?? 0);
        const start = origin + (attribution.interactionTime ?? 0);
        emitSpan(
          SCOPE,
          'INP',
          start,
          start + duration,
          defined({
            ...base,
            'inp.input_delay': attribution.inputDelay,
            'inp.interaction_target': attribution.interactionTarget,
            'inp.interaction_time': attribution.interactionTime,
            'inp.interaction_type': attribution.interactionType,
            'inp.load_state': attribution.loadState,
            'inp.next_paint_time': attribution.nextPaintTime,
            'inp.presentation_delay': attribution.presentationDelay,
            'inp.processing_duration': attribution.processingDuration,
            'inp.duration': duration,
            // deprecated aliases Honeycomb still emits
            'inp.element': attribution.interactionTarget,
            'inp.event_type': attribution.interactionType,
            ...dataAttributes(attribution.interactionTarget, 'inp'),
          }),
          context,
        );
        return true;
      }
      default:
        return false;
    }
  },
};
