import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { InstrumentationAbstract } from './web-vitals-autoinstrumentation';
import { VERSION } from './version';
import { context, SpanStatusCode } from '@opentelemetry/api';
import {
  SEMATTRS_EXCEPTION_MESSAGE,
  SEMATTRS_EXCEPTION_STACKTRACE,
  SEMATTRS_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';
import { computeStackTrace, StackFrame } from 'tracekit';

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
    super('@honeycombio/instrumentation-global-errors', VERSION, config);
    if (enabled) {
      this.enable();
    }
    this._isEnabled = enabled;
  }

  _computeStackTrace = (error: Error | undefined) => {
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

    for (const stackFrame of structuredStack) {
      lines.push(stackFrame.line);
      columns.push(stackFrame.column);
      functions.push(stackFrame.func);
      urls.push(stackFrame.url);
    }

    return {
      'exception.structured_stacktrace.columns': columns,
      'exception.structured_stacktrace.lines': lines,
      'exception.structured_stacktrace.functions': functions,
      'exception.structured_stacktrace.urls': urls,
    };
  };

  onError = (event: ErrorEvent | PromiseRejectionEvent) => {
    const error: Error | undefined =
      'reason' in event ? event.reason : event.error;
    const message = error?.message;
    const type = error?.name;
    const attributes = {
      [SEMATTRS_EXCEPTION_TYPE]: type,
      [SEMATTRS_EXCEPTION_MESSAGE]: message,
      [SEMATTRS_EXCEPTION_STACKTRACE]: error?.stack,
      ...this._computeStackTrace(error),
    };
    // otel spec requires at minimum these two
    if (!message || !type) return;
    const errorSpan = this.tracer.startSpan(
      'exception',
      { attributes },
      context.active(),
    );
    errorSpan.setStatus({ code: SpanStatusCode.ERROR, message });
    errorSpan.end();
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
