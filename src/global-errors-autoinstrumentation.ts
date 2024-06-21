import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { InstrumentationAbstract } from './web-vitals-autoinstrumentation';
import { VERSION } from './version';
import { SpanStatusCode } from '@opentelemetry/api';
import {
  SEMATTRS_EXCEPTION_MESSAGE,
  SEMATTRS_EXCEPTION_STACKTRACE,
  SEMATTRS_EXCEPTION_TYPE,
} from '@opentelemetry/semantic-conventions';

export interface GlobalErrorsInstrumentationConfig
  extends InstrumentationConfig {}

/**
 * Global errors auto-instrumentation, sends spans automatically for exceptions that reach the window.
 * @param config The {@link GlobalErrorsInstrumentationConfig}
 */
export class GlobalErrorsInstrumentation extends InstrumentationAbstract {
  constructor({ enabled = true }: GlobalErrorsInstrumentationConfig = {}) {
    const config: GlobalErrorsInstrumentationConfig = { enabled };
    super('@honeycombio/instrumentation-global-errors', VERSION, config);
  }

  onError = (event: ErrorEvent | PromiseRejectionEvent) => {
    const error = 'reason' in event ? event.reason : event.error;
    const message = error?.message;
    const type = error?.name;
    // otel spec requires at minimum these two
    if (!message || !type) return;
    const span = this.tracer.startSpan('exception', {
      attributes: {
        [SEMATTRS_EXCEPTION_TYPE]: type,
        [SEMATTRS_EXCEPTION_MESSAGE]: message,
        [SEMATTRS_EXCEPTION_STACKTRACE]: error?.stack,
      },
    });
    span.setStatus({ code: SpanStatusCode.ERROR, message });
    span.end();
  };

  init() {}

  disable(): void {
    window.removeEventListener('error', this.onError);
    window.removeEventListener('unhandledrejection', this.onError);
  }

  enable(): void {
    window.addEventListener('error', this.onError);
    window.addEventListener('unhandledrejection', this.onError);
  }
}
