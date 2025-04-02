import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureDebug } from './honeycomb-debug';
import { configureDeterministicSampler } from './deterministic-sampler';
import { validateOptionsWarnings } from './validate-options';
import { WebVitalsInstrumentation } from './web-vitals-autoinstrumentation';
import { GlobalErrorsInstrumentation } from './global-errors-autoinstrumentation';
import { configureTraceExporters } from './composite-exporter';
import { configureSpanProcessors } from './configure-span-processors';
import { configureResourceAttributes } from './configure-resource-attributes';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    const instrumentations = [...(options?.instrumentations || [])];
    // Automatically include web vitals instrumentation unless explicitly set to false
    if (options?.webVitalsInstrumentationConfig?.enabled !== false) {
      instrumentations.push(
        new WebVitalsInstrumentation(options?.webVitalsInstrumentationConfig),
      );
    }
    // Automatically include global errors instrumentation unless explicitly set to false
    if (options?.globalErrorsInstrumentationConfig?.enabled !== false) {
      instrumentations.push(
        new GlobalErrorsInstrumentation(
          options?.globalErrorsInstrumentationConfig,
        ),
      );
    }

    super({
      ...options,
      instrumentations,
      resource: configureResourceAttributes(options),
      sampler: configureDeterministicSampler(options),
      spanProcessors: configureSpanProcessors(options),
      traceExporter: configureTraceExporters(options),
    });

    validateOptionsWarnings(options);

    if (options?.debug) {
      configureDebug(options);
    }
  }
}
