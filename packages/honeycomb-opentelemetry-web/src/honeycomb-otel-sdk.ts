import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureDebug } from './honeycomb-debug';
import { configureSampler } from './deterministic-sampler';
import { validateOptionsWarnings } from './validate-options';
import { WebVitalsInstrumentation } from './web-vitals-autoinstrumentation';
import { GlobalErrorsInstrumentation } from './global-errors-autoinstrumentation';
import {
  configureLogExporters,
  configureMetricExporters,
  configureTraceExporters,
} from './composite-exporter';
import { configureSpanProcessors } from './configure-span-processors';
import { configureBrowserTimingInstrumentations } from './configure-browser-timings';
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
    // Navigation and resource timing are opt in, so unlike the two above they
    // are added only when a caller asks for them.
    instrumentations.push(...configureBrowserTimingInstrumentations(options));

    super({
      ...options,
      instrumentations,
      resource: configureResourceAttributes(options),
      sampler: configureSampler(options),
      spanProcessors: configureSpanProcessors(options),
      traceExporter: configureTraceExporters(options),
      metricExporters: configureMetricExporters(options),
      logExporters: configureLogExporters(options),
    });

    validateOptionsWarnings(options);

    if (options?.debug) {
      configureDebug(options);
    }
  }
}
