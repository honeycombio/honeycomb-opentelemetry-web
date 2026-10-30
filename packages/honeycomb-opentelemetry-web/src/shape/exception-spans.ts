import { Attributes, Context, SpanStatusCode } from '@opentelemetry/api';
import { hrTimeToMilliseconds } from '@opentelemetry/core';
import {
  ATTR_EXCEPTION_MESSAGE,
  ATTR_EXCEPTION_STACKTRACE,
} from '@opentelemetry/semantic-conventions';
import { SdkLogRecord } from '@opentelemetry/sdk-logs';
import { LogShapeAdapter } from './shape-log-record-processor';
import { emitSpan } from './emit-span';
import { getStructuredStackTrace } from '../global-errors-autoinstrumentation';

/**
 * Rebuilds Honeycomb's `exception` span from the upstream `exception` log
 * event: same attributes, ERROR status, and the structured stack trace arrays
 * that Honeycomb adds on top of `exception.stacktrace`.
 */
export const exceptionSpanAdapter: LogShapeAdapter = {
  eventName: 'exception',
  adapt(record: SdkLogRecord, context?: Context) {
    const a = record.attributes as Attributes;
    const stack = a[ATTR_EXCEPTION_STACKTRACE];
    // computeStackTrace reads `.stack` off an Error-like object.
    const asError = Object.assign(
      new Error(String(a[ATTR_EXCEPTION_MESSAGE] ?? '')),
      { stack: typeof stack === 'string' ? stack : undefined },
    );
    const at = hrTimeToMilliseconds(record.hrTime);
    emitSpan(
      '@honeycombio/instrumentation-global-errors',
      'exception',
      at,
      at,
      { ...a, ...getStructuredStackTrace(asError) },
      context,
      {
        code: SpanStatusCode.ERROR,
        message: String(a[ATTR_EXCEPTION_MESSAGE] ?? ''),
      },
    );
    return true;
  },
};
