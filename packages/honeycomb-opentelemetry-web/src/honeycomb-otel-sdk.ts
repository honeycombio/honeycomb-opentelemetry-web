import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureEntryPageResource } from './entry-page-resource';
import { configureBrowserAttributesResource } from './browser-attributes-resource';
import { configureDebug } from './honeycomb-debug';
import { configureDeterministicSampler } from './deterministic-sampler';
import { validateOptionsWarnings } from './validate-options';
import { WebVitalsInstrumentation } from './web-vitals-autoinstrumentation';
import { GlobalErrorsInstrumentation } from './global-errors-autoinstrumentation';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BrowserAttributesSpanProcessor } from './browser-attributes-span-processor';
import { BaggageSpanProcessor } from './baggage-span-processor';
import { createSessionSpanProcessor } from '@opentelemetry/web-common';
import { defaultSessionProvider } from './default-session-provider';
import { configureTraceExporters } from './span-processor-builder';

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

    //TODO: make a helper function for this?
    let resource = resourceFromAttributes({})
      .merge(configureEntryPageResource(options?.entryPageAttributes))
      .merge(configureBrowserAttributesResource())
      .merge(configureHoneycombResource());

    if (options?.resource) {
      resource = resource.merge(options.resource);
    }

    if (options?.resourceAttributes) {
      resource = resource.merge(
        resourceFromAttributes(options.resourceAttributes),
      );
    }

    const spanProcessors = [
      new BrowserAttributesSpanProcessor(),
      new BaggageSpanProcessor(),
      createSessionSpanProcessor(
        options?.sessionProvider || defaultSessionProvider,
      ),
      ...(options?.spanProcessors || []),
    ];

    super({
      ...options,
      instrumentations,
      resource: resource,
      sampler: configureDeterministicSampler(options),
      spanProcessors: spanProcessors,
      traceExporter: configureTraceExporters(options),
    });

    validateOptionsWarnings(options);

    if (options?.debug) {
      configureDebug(options);
    }
  }
}
