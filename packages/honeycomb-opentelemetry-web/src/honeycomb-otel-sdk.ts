import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureEntryPageResource } from './entry-page-resource';
import { configureBrowserAttributesResource } from './browser-attributes-resource';
import { configureDebug } from './honeycomb-debug';
import { configureSpanProcessors } from './span-processor-builder';
import { configureDeterministicSampler } from './deterministic-sampler';
import { validateOptionsWarnings } from './validate-options';
import { WebVitalsInstrumentation } from './web-vitals-autoinstrumentation';
import { GlobalErrorsInstrumentation } from './global-errors-autoinstrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';

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

    const resource = resourceFromAttributes({})
      .merge(configureEntryPageResource(options?.entryPageAttributes))
      .merge(configureBrowserAttributesResource())
      .merge(configureHoneycombResource());

    if (options?.resource) {
      resource.merge(options.resource);
    }

    if (options?.resourceAttributes) {
      resource.merge(resourceFromAttributes(options.resourceAttributes));
    }

    super({
      ...options,
      instrumentations,
      resource: resource,
      sampler: configureDeterministicSampler(options),
      // Exporter is configured through the span processor because
      // the base SDK does not allow having both a spanProcessor and a
      // traceExporter configured at the same time.
      spanProcessor: configureSpanProcessors(options),
    });

    validateOptionsWarnings(options);

    if (options?.debug) {
      configureDebug(options);
    }
  }
}
