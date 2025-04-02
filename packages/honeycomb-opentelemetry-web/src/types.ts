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

import type { ContextManager, DiagLogLevel } from '@opentelemetry/api';
import { TextMapPropagator } from '@opentelemetry/api';
import { Instrumentation } from '@opentelemetry/instrumentation';
import {
  DetectedResourceAttributes,
  Resource,
  ResourceDetector,
} from '@opentelemetry/resources';
import {
  IdGenerator,
  Sampler,
  SpanExporter,
  SpanLimits,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { SessionProvider } from '@opentelemetry/web-common';
import { WebVitalsInstrumentationConfig } from './web-vitals-autoinstrumentation';
import { GlobalErrorsInstrumentationConfig } from './global-errors-autoinstrumentation';

export interface WebSDKConfiguration {
  autoDetectResources: boolean;
  contextManager: ContextManager;
  textMapPropagator: TextMapPropagator;
  instrumentations: (Instrumentation | Instrumentation[])[];
  resource: Resource;
  resourceDetectors: Array<ResourceDetector>;
  sampler: Sampler;
  serviceName?: string;
  spanProcessor?: SpanProcessor;
  spanProcessors?: SpanProcessor[];
  traceExporter: SpanExporter;
  spanLimits: SpanLimits;
  idGenerator: IdGenerator;
}

/**
 * The options used to configure the Honeycomb Web SDK.
 */
export interface HoneycombOptions extends Partial<WebSDKConfiguration> {
  /** Honeycomb API key for sending traces directly to Honeycomb */
  apiKey?: string;

  /** Honeycomb API key for sending traces telemetry to Honeycomb. Defaults to apiKey if not set. */
  tracesApiKey?: string;

  /** The API endpoint where telemetry is sent. Defaults to 'https://api.honeycomb.io/v1/traces'.
   * Appends `/v1/traces` to the endpoint provided.
   */
  endpoint?: string;

  /** Optionally pass extra headers to the exporter. Commonly used if sending to a collector that requires authentication */
  headers?: { [key: string]: string };

  /** The API endpoint where traces telemetry is sent. Defaults to endpoint if not set. */
  tracesEndpoint?: string;

  /** The dataset where traces telemetry is stored in Honeycomb. Only required when using a classic API key.
   * https://docs.honeycomb.io/honeycomb-classic/#am-i-using-honeycomb-classic
   */
  dataset?: string;

  /** The service name of the application and where traces telemetry is stored in Honeycomb.
   * Defaults to `unknown_service`
   */
  serviceName?: string;

  /** Provide an array of span processors that should be applied to all spans.
   * Use this to specify synchronous hooks that can add to a span once the span is started or ended.
   * The processors will be applied in the order they are specified.
   * E.g. adding attributes to a span.
   */
  spanProcessors?: SpanProcessor[];

  /** Provide an array of exporters
   * Use this to configure custom tracing services in addition
   * to the default honeycomb one.
   * E.g. You want to send data to another service.
   */
  traceExporters?: SpanExporter[];

  /** Disable the default honeycomb SpanExporters
   * `true` Disables the default honeycomb span exporter, `false` enables.
   * in this case you should provide other exporters in the `traceExporters` field.
   * Defaults to 'false'.
   */
  disableDefaultTraceExporter?: boolean;

  /** The sample rate used to determine whether a trace is exported.
   * This must be a whole positive number. Only 1 out of every `sampleRate` traces will be randomly selected to be sent.
   * Set to 0 to drop everything.
   * Defaults to 1 (send everything).
   */
  sampleRate?: number;

  /** The debug flag enables additional logging that is useful when debugging your application. Do not use in production.
   * Defaults to 'false'.
   */
  debug?: boolean;

  /** Additional attributes, will be included as fields on all data */
  resourceAttributes?: DetectedResourceAttributes;

  /** The local visualizations flag enables logging Honeycomb URLs for completed traces. Do not use in production.
   * Defaults to 'false'.
   */
  localVisualizations?: boolean;

  /** Skip options validation warnings (eg no API key configured). This is useful when the SDK is being
   * used in conjunction with an OpenTelemetry Collector (which will handle the API key and dataset configuration).
   * Defaults to 'false'.
   */
  skipOptionsValidation?: boolean;

  /** Configuration for entry page attributes: set to false to disable entirely, or pass in a custom config
   * to fine-tune the included attributes.
   *
   * Defaults to
   * ```
   * {
   *  path: true,
   *  hash: true,
   *  hostname: true,
   *  referrer: true,
   *  url: false,
   *  search: false
   * }
   * ```
   */
  entryPageAttributes?: false | EntryPageConfig;

  /** Config options for web vitals instrumentation. Enabled by default. */
  webVitalsInstrumentationConfig?: WebVitalsInstrumentationConfig;
  globalErrorsInstrumentationConfig?: GlobalErrorsInstrumentationConfig;

  /**
   * Controls the verbosity of logs. Utilizes OpenTelemetry's `DiagLogLevel` enum. Defaults to 'DEBUG'.
   * Current options include 'NONE', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'VERBOSE', and 'ALL'.
   */
  logLevel?: DiagLogLevel;

  /** Optionally provide a session provider to generate session ids for the session span processor. */
  sessionProvider?: SessionProvider;
}

/* Configure which fields to include in the `entry_page` resource attributes. By default,
 * does not include attributes that could expose search params (url, search) */
export type EntryPageConfig = {
  /** Include the path: '/working-with-your-data/overview/'
   * Defaults to 'true' */
  path?: boolean;

  /** Include the hash: '#view-events'
   * Defaults to 'true' */
  hash?: boolean;

  /** Include the hostname: 'docs.honeycomb.io'
   * Defaults to 'true' */
  hostname?: boolean;

  /** Include the document.referrer: 'https://example.com/page-with-referring-link'
   * Defaults to 'true' */
  referrer?: boolean;

  /** Include the full url.
   * 'https://docs.honeycomb.io/working-with-your-data/overview/#view-events?page=2'
   *
   * Defaults to 'false' */
  url?: boolean;

  /** Include the search params: '?page=2'
   * Defaults to 'false' */
  search?: boolean;
};
