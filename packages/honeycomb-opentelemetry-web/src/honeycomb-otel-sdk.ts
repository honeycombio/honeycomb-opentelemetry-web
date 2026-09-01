import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureDebug } from './honeycomb-debug';
import { configureSampler } from './deterministic-sampler';
import { validateOptionsWarnings } from './validate-options';
import { WebVitalsInstrumentation } from './web-vitals-autoinstrumentation';
import { GlobalErrorsInstrumentation } from './global-errors-autoinstrumentation';
import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { ResourceTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/resource-timing';
import {
  configureLogExporters,
  configureMetricExporters,
  configureTraceExporters,
} from './composite-exporter';
import { configureSpanProcessors } from './configure-span-processors';
import { configureResourceTiming } from './configure-resource-timing';
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
    // Include navigation timing instrumentation only when explicitly set to true
    if (options?.navigationTimingInstrumentationConfig?.enabled === true) {
      instrumentations.push(
        new NavigationTimingInstrumentation(
          options.navigationTimingInstrumentationConfig,
        ),
      );
    }
    // Include resource timing instrumentation only when explicitly set to true
    if (options?.resourceTimingInstrumentationConfig?.enabled === true) {
      instrumentations.push(
        new ResourceTimingInstrumentation(configureResourceTiming(options)),
      );
    }

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
