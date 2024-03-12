import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureEntryPageResource } from './entry-page-resource';
import { configureBrowserAttributesResource } from './browser-attributes-resource';
import { mergeResources } from './merge-resources';
import { configureDebug } from './honeycomb-debug';
import { configureSpanProcessors } from './span-processor-builder';
import { configureDeterministicSampler } from './deterministic-sampler';
import { validateOptionsWarnings } from './validate-options';
import { WebVitalsInstrumentation } from './web-vitals-autoinstrumentation';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    const instrumentations = [...(options?.instrumentations || [])];
    // Automatically include web vitals instrumentation unless explicitly set to false
    if (options?.webVitalsInstrumentationConfig?.enabled !== false) {
      instrumentations.push(
        new WebVitalsInstrumentation(options?.webVitalsInstrumentationConfig),
      );
    }

    super({
      ...options,
      instrumentations,
      resource: mergeResources([
        configureBrowserAttributesResource(),
        configureEntryPageResource(options?.entryPageAttributes),
        options?.resource,
        options?.resourceAttributes,
        configureHoneycombResource(),
      ]),
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
