import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { InstrumentationAbstract } from './web-vitals-autoinstrumentation';
import { VERSION } from './version';
import {
  Attributes,
  context,
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

  if (!structuredStack) {
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

export function recordException(
  error: Error,
  attributes: Attributes = {},
  tracer: Tracer = trace.getTracer(LIBRARY_NAME),
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

  errorSpan.setStatus({ code: SpanStatusCode.ERROR, message });
  errorSpan.end();
}

export interface GlobalErrorsInstrumentationConfig
  extends InstrumentationConfig {}

/**
 * Global errors auto-instrumentation, sends spans automatically for exceptions that reach the window.
 * @param config The {@link GlobalErrorsInstrumentationConfig}
 */
export class GlobalErrorsInstrumentation extends InstrumentationAbstract {
  private _isEnabled: boolean;
  constructor({ enabled = true }: GlobalErrorsInstrumentationConfig = {}) {
    const config: GlobalErrorsInstrumentationConfig = { enabled };
    super(LIBRARY_NAME, VERSION, config);
    if (enabled) {
      this.enable();
    }
    this._isEnabled = enabled;
  }

  onError = (event: ErrorEvent | PromiseRejectionEvent) => {
    const error: Error | undefined =
      'reason' in event ? event.reason : event.error;
    if (error) {
      recordException(error, {}, this.tracer);
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
