import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombHttpJsonTraceExporter } from './http-json-trace-exporter';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureEntryPageResource } from './entry-page-resource';
import { mergeResources } from './merge-resources';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    super({
      resource: mergeResources([
        configureHoneycombResource(),
        configureEntryPageResource(),
        options?.resource,
      ]),
      traceExporter: configureHoneycombHttpJsonTraceExporter(options),

      ...options,
    });
  }
}
