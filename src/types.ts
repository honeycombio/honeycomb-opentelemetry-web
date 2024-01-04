// This code will eventually be packaged upstream into a WebSDK package.
// Once it is released as a package, this distro will depend directly on the upstream package.
// https://github.com/open-telemetry/opentelemetry-js/pull/4325
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ContextManager } from '@opentelemetry/api';
import { TextMapPropagator } from '@opentelemetry/api';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { Detector, DetectorSync, IResource } from '@opentelemetry/resources';
import {
  IdGenerator,
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
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

/**
 * The options used to configure the Honeycomb Node SDK.
 */
export interface HoneycombOptions extends Partial<WebSDKConfiguration> {
  /** The API key used to send telemetry to Honeycomb. */
  apiKey?: string;

  /** The API key used to send traces telemetry to Honeycomb. Defaults to apikey if not set. */
  tracesApiKey?: string;

  /** The API endpoint where telemetry is sent. Defaults to 'https://api.honeycomb.io' */
  endpoint?: string;

  /** The API endpoint where traces telemetry is sent. Defaults to endpoint if not set. */
  tracesEndpoint?: string;

  /** The dataset where traces telemetry is stored in Honeycomb. Only used when using a classic API key. */
  dataset?: string;

  /** The service name of the application and where traces telemetry is stored in Honeycomb. */
  serviceName?: string;

  /** The sample rate used to determine whether a trace is exported. Defaults to 1 (send everything). */
  sampleRate?: number;

  /** The debug flag enables additional logging that us useful when debugging your application. Do not use in production. */
  debug?: boolean;

  /** The local visualizations flag enables logging Honeycomb URLs for completed traces. Do not use in production. */
  localVisualizations?: boolean;

  /** Skip options validation warnings (eg no API key configured). This is useful when the SDK is being
   * used in conjuction with an OpenTelemetry Collector (which will handle the API key and dataset configuration).
   * Defaults to 'false'.
   */
  skipOptionsValidation?: boolean;
}
