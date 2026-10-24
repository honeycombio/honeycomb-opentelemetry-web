import { Attributes, Context } from '@opentelemetry/api';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import { getElementXPath } from '@opentelemetry/sdk-trace-web';
import { SdkLogRecord } from '@opentelemetry/sdk-logs';
import { LogShapeAdapter } from './shape-log-record-processor';
import { emitSpan } from './emit-span';

/**
 * Rebuilds the `click` span shape from `browser.user_action.click`.
 *
 * What a log cannot give back: the span stays open while the click handlers
 * run, so fetch/XHR spans started by a handler become its children. A log
 * record is a point event, so those requests have no click parent here.
 * Upstream also logs every click, not only clicks on elements with handlers.
 */
export const userActionSpanAdapter: LogShapeAdapter = {
  eventName: 'browser.user_action.click',
  adapt(record: SdkLogRecord, context?: Context) {
    const a = record.attributes as Attributes;
    let xpath: string | undefined;
    try {
      const el = document.querySelector(String(a['browser.css_selector']));
      if (el) xpath = getElementXPath(el);
    } catch {
      /* selector no longer resolves */
    }
    const at = hrTimeToMilliseconds(record.hrTime);
    emitSpan(
      '@honeycombio/user-instrumentation',
      'click',
      at,
      at,
      {
        event_type: 'click',
        target_element: String(a['browser.tag_name'] ?? ''),
        ...(xpath ? { target_xpath: xpath } : {}),
        'http.url': window.location.href,
      },
      context,
    );
    return true;
  },
};
