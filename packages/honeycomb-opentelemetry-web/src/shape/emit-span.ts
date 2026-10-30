import {
  Attributes,
  Context,
  HrTime,
  SpanStatus,
  trace,
} from '@opentelemetry/api';
import { VERSION } from '../version';

/**
 * Emits one finished span under a Honeycomb-owned scope name. The scope names
 * used by the retired bespoke instrumentations are kept so saved queries that
 * filter on `library.name` keep matching.
 */
export function emitSpan(
  scope: string,
  name: string,
  startTime: HrTime | number,
  endTime: HrTime | number,
  attributes: Attributes,
  context?: Context,
  status?: SpanStatus,
) {
  const span = trace
    .getTracer(scope, VERSION)
    .startSpan(name, { startTime, attributes }, context);
  if (status) span.setStatus(status);
  span.end(endTime);
  return span;
}

/** Drop undefined/null so a missing upstream field is simply absent. */
export function defined(attrs: Record<string, unknown>): Attributes {
  return Object.fromEntries(
    Object.entries(attrs).filter(([, v]) => v !== undefined && v !== null),
  ) as Attributes;
}
