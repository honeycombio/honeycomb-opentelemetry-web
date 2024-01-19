import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { configureHoneycombHttpJsonTraceExporter } from './http-json-trace-exporter';
import { configureHoneycombResource } from './honeycomb-resource';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    super({
      resource: configureHoneycombResource(options),
      traceExporter: configureHoneycombHttpJsonTraceExporter(options),

      ...options,
    });
  }
}
