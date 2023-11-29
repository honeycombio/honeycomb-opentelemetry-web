import { WebSDKConfiguration } from './types';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  WebTracerProvider,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-web';
// import { ZoneContextManager } from '@opentelemetry/context-zone';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

export class WebSDK {
  /**
   * Create a new Web SDK instance
   */
  public constructor(configuration: Partial<WebSDKConfiguration> = {}) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    const provider = new WebTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: configuration.serviceName,
      }),
    });

    provider.addSpanProcessor(
      new BatchSpanProcessor(configuration.traceExporter!),
    );

    registerInstrumentations({
      instrumentations: configuration.instrumentations,
    });
  }
}
