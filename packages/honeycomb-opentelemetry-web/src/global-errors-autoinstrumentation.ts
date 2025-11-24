import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { InstrumentationAbstract } from './web-vitals-autoinstrumentation';
import { VERSION } from './version';
import {
  Attributes,
  context,
  Span,
  SpanStatusCode,
  trace,
  Tracer,
} from '@opentelemetry/api';
import {
  ATTR_EXCEPTION_MESSAGE,
  ATTR_EXCEPTION_STACKTRACE,
  ATTR_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import { computeStackTrace, StackFrame } from 'tracekit';

const LIBRARY_NAME = '@honeycombio/instrumentation-global-errors';

type ApplyCustomErrorAttributesOnSpanFn = (span: Span, error: Error) => void;

/**
 * Extracts and structures the stack trace from an error object.
 *
 * This function breaks down the stack trace into arrays of strings and numbers
 * to comply with OTLP (OpenTelemetry Protocol) requirements, which do not accept
 * arrays of objects.
 *
 * @param {Error | undefined} error - The error object from which to extract the stack trace.
 * @returns {Object} An object containing structured stack trace information with arrays of columns, lines, functions, and URLs.
 */
export function getStructuredStackTrace(error: Error | undefined) {
  if (!error) {
    return {};
  }

  // OTLP does not accept arrays of objects
  // breaking down the stack into arrays of strings/numbers
  const structuredStack: StackFrame[] = computeStackTrace(error).stack;
  const lines: number[] = [];
  const columns: number[] = [];
  const functions: string[] = [];
  const urls: string[] = [];

  if (!Array.isArray(structuredStack)) {
    return {};
  }

  structuredStack.forEach((stackFrame) => {
    lines.push(stackFrame.line);
    columns.push(stackFrame.column);
    functions.push(stackFrame.func);
    urls.push(stackFrame.url);
  });

  return {
    'exception.structured_stacktrace.columns': columns,
    'exception.structured_stacktrace.lines': lines,
    'exception.structured_stacktrace.functions': functions,
    'exception.structured_stacktrace.urls': urls,
  };
}

/**
 * Records an exception as a span in the OpenTelemetry tracer.
 *
 * @param {Error} error - The error object to record.
 * @param {Attributes} [attributes={}] - Additional attributes to add to the span.
 * @param {Tracer} [tracer=trace.getTracer(LIBRARY_NAME)] - The tracer to use for recording the span.
 * @param {ApplyCustomErrorAttributesOnSpanFn} applyCustomAttributesOnSpan - Callback function to add custom attributes to the span and mutate the span.
 */
export function recordException(
  error: Error,
  attributes: Attributes = {},
  tracer: Tracer = trace.getTracer(LIBRARY_NAME),
  applyCustomAttributesOnSpan?: ApplyCustomErrorAttributesOnSpanFn,
) {
  const message = error.message;
  const type = error.name;
  const errorAttributes = {
    [ATTR_EXCEPTION_TYPE]: type,
    [ATTR_EXCEPTION_MESSAGE]: message,
    [ATTR_EXCEPTION_STACKTRACE]: error.stack,
    ...getStructuredStackTrace(error),
    ...attributes,
  };

  const errorSpan = tracer.startSpan(
    'exception',
    { attributes: errorAttributes },
    context.active(),
  );

  if (applyCustomAttributesOnSpan) {
    applyCustomAttributesOnSpan(errorSpan, error);
  }

  errorSpan.setStatus({ code: SpanStatusCode.ERROR, message });
  errorSpan.end();
}

export interface GlobalErrorsInstrumentationConfig
  extends InstrumentationConfig {
  /**
   * A callback function for adding custom attributes to the span when an error is recorded.
   *
   * @param {Span} span - The span to which custom attributes will be added.
   * @param {Error} error - The error object that is being recorded.
   */
  applyCustomAttributesOnSpan?: ApplyCustomErrorAttributesOnSpanFn;
}

/**
 * Global errors auto-instrumentation, sends spans automatically for exceptions that reach the window.
 * @param config The {@link GlobalErrorsInstrumentationConfig}
 */
export class GlobalErrorsInstrumentation extends InstrumentationAbstract {
  private _isEnabled: boolean;
  readonly applyCustomAttributesOnSpan?: ApplyCustomErrorAttributesOnSpanFn;
  constructor({
    enabled = true,
    applyCustomAttributesOnSpan,
  }: GlobalErrorsInstrumentationConfig = {}) {
    const config: GlobalErrorsInstrumentationConfig = {
      enabled,
      applyCustomAttributesOnSpan,
    };
    super(LIBRARY_NAME, VERSION, config);
    if (enabled) {
      this.enable();
    }
    this._isEnabled = enabled;
    this.applyCustomAttributesOnSpan = applyCustomAttributesOnSpan;
  }

  onError = (event: ErrorEvent | PromiseRejectionEvent) => {
    const error: Error | undefined =
      'reason' in event ? event.reason : event.error;
    if (error) {
      recordException(error, {}, this.tracer, this.applyCustomAttributesOnSpan);
    }
  };

  init() {}

  disable(): void {
    if (!this.isEnabled()) {
      this._diag.debug(`Instrumentation already disabled`);
      return;
    }
    this._isEnabled = false;
    window.removeEventListener('error', this.onError);
    window.removeEventListener('unhandledrejection', this.onError);
    this._diag.debug(`Instrumentation  disabled`);
  }

  enable(): void {
    if (this.isEnabled()) {
      this._diag.debug(`Instrumentation already enabled`);
      return;
    }
    this._isEnabled = true;
    window.addEventListener('error', this.onError);
    window.addEventListener('unhandledrejection', this.onError);
    this._diag.debug(`Instrumentation  enabled`);
  }
  public isEnabled() {
    return this._isEnabled;
  }
}
