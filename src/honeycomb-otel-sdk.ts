import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombHttpJsonTraceExporter } from './http-json-trace-exporter';
import { configureHoneycombResource } from './honeycomb-resource';
import { configureDebug } from './honeycomb-debug';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    super({
      resource: configureHoneycombResource(options),
      traceExporter: configureHoneycombHttpJsonTraceExporter(options),

      ...options,
    });

    if (options?.debug) {
      configureDebug(options);
    }
  }
}
