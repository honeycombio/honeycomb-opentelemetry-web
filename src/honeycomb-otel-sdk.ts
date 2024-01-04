import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebSDK } from './base-otel-sdk';
import { HoneycombOptions } from './types';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export class HoneycombWebSDK extends WebSDK {
  constructor(options?: HoneycombOptions) {
    super({
      spanProcessor: new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: options?.endpoint,
          headers: {
            'x-honeycomb-team': options?.apiKey,
          },
        }),
      ),
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: options?.serviceName,
      }),
      ...options,
    });
  }
}
