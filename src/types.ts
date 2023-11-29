import type { ContextManager } from '@opentelemetry/api';
import { TextMapPropagator } from '@opentelemetry/api';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { Detector, DetectorSync, IResource } from '@opentelemetry/resources';
import {
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
  IdGenerator,
} from '@opentelemetry/sdk-trace-base';

export interface WebSDKConfiguration {
  autoDetectResources: boolean;
  contextManager: ContextManager;
  textMapPropagator: TextMapPropagator;
  instrumentations: InstrumentationOption[];
  resource: IResource;
  resourceDetectors: Array<Detector | DetectorSync>;
  sampler: Sampler;
  serviceName?: string;
  spanProcessor: SpanProcessor;
  traceExporter: SpanExporter;
  spanLimits: SpanLimits;
  idGenerator: IdGenerator;
}
