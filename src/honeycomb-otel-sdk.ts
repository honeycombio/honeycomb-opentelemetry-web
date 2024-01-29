import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureEntryPageResource } from './entry-page-resource';
import { mergeResources } from './merge-resources';
import { configureDebug } from './honeycomb-debug';
import { configureSpanProcessors } from './span-processor-builder';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    super({
      ...options,
      resource: mergeResources([
        configureEntryPageResource(),
        options?.resource,
        configureHoneycombResource(),
      ]),
      // Exporter is configured through the span processor because
      // the base SDK does not allow having both a spanProcessor and a
      // traceExporter configured at the same time.
      spanProcessor: configureSpanProcessors(options),
    });

    if (options?.debug) {
      configureDebug(options);
    }
  }
}
