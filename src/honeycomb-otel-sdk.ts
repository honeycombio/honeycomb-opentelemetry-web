import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombHttpJsonTraceExporter } from './http-json-trace-exporter';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureEntryPageResource } from './entry-page-resource';
import { mergeResources } from './merge-resources';
import { configureDebug } from './honeycomb-debug';
import { configureSpanProcessor } from './span-processor-builder';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    super({
      ...options,
      resource: mergeResources([
        configureEntryPageResource(),
        options?.resource,
        configureHoneycombResource(),
      ]),
      traceExporter: configureHoneycombHttpJsonTraceExporter(options),
      spanProcessor: configureSpanProcessor(options),
    });

    if (options?.debug) {
      configureDebug(options);
    }
  }
}
