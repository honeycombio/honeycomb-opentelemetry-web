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

import { ContextManager, metrics, TextMapPropagator, trace } from '@opentelemetry/api';
import {
  Instrumentation,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';
import type { Resource } from '@opentelemetry/resources';
import {
  defaultResource,
  detectResources,
  ResourceDetectionConfig,
  ResourceDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  WebTracerConfig,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import {
  LoggerProvider,
  LogRecordExporter,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { WebSDKConfiguration } from './types';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';
import { logs } from '@opentelemetry/api-logs';

/** This class represents everything needed to register a fully configured OpenTelemetry Web SDK */

export class WebSDK {
  private _tracerProviderConfig?: {
    tracerConfig: WebTracerConfig;
    spanProcessor?: SpanProcessor;
    spanProcessors?: SpanProcessor[];
    contextManager?: ContextManager;
    textMapPropagator?: TextMapPropagator;
  };

  private _meterProviderConfig?: {
    metricExporters: PushMetricExporter[];
  };

  private _loggerProviderConfig?: {
    logExporters: LogRecordExporter[];
  };

  private _instrumentations: (Instrumentation | Instrumentation[])[];

  private _resource: Resource;
  private _resourceDetectors: Array<ResourceDetector>;

  private _autoDetectResources: boolean;

  private _tracerProvider?: WebTracerProvider;
  private _meterProvider?: MeterProvider;
  private _loggerProvider?: LoggerProvider;
  private _serviceName?: string;
  private _serviceVersion?: string;

  private _disabled?: boolean;

  /**
   * Create a new Web SDK instance
   */
  public constructor(configuration: Partial<WebSDKConfiguration> = {}) {
    // As of v2 of the JS packages, we need to explicitly start with the default resource that contains
    // telemetry.sdk.language etc.
    this._resource = defaultResource().merge(
      configuration.resource ?? resourceFromAttributes({}),
    );
    this._resourceDetectors = configuration.resourceDetectors ?? [
      browserDetector,
    ];

    this._serviceName = configuration.serviceName;
    this._serviceVersion = configuration.serviceVersion;

    this._autoDetectResources = configuration.autoDetectResources ?? true;

    if (
      configuration.spanProcessor ||
      configuration.traceExporter ||
      configuration.spanProcessors
    ) {
      const tracerProviderConfig: WebTracerConfig = {};

      if (configuration.sampler) {
        tracerProviderConfig.sampler = configuration.sampler;
      }
      if (configuration.spanLimits) {
        tracerProviderConfig.spanLimits = configuration.spanLimits;
      }
      if (configuration.idGenerator) {
        tracerProviderConfig.idGenerator = configuration.idGenerator;
      }

      const spanProcessors: SpanProcessor[] =
        configuration.spanProcessors || [];
      if (configuration.traceExporter) {
        spanProcessors.push(
          new BatchSpanProcessor(configuration.traceExporter),
        );
      }

      this._tracerProviderConfig = {
        tracerConfig: tracerProviderConfig,
        spanProcessor: configuration.spanProcessor,
        spanProcessors: spanProcessors,
        contextManager: configuration.contextManager,
        textMapPropagator: configuration.textMapPropagator,
      };
    }

    if (configuration.metricExporters) {
      this._meterProviderConfig = {
        metricExporters: configuration.metricExporters,
      };
    }

    if (configuration.logExporters) {
      this._loggerProviderConfig = {
        logExporters: configuration.logExporters,
      };
    }

    let instrumentations: (Instrumentation | Instrumentation[])[] = [];
    if (configuration.instrumentations) {
      instrumentations = configuration.instrumentations;
    }
    this._instrumentations = instrumentations;
  }

  /**
   * Call this method to construct SDK components and register them with the OpenTelemetry API.
   */
  public start(): void {
    if (this._disabled) {
      return;
    }

    if (this._autoDetectResources) {
      const internalConfig: ResourceDetectionConfig = {
        detectors: this._resourceDetectors,
      };

      this._resource = this._resource.merge(detectResources(internalConfig));
    }

    this._resource =
      this._serviceName === undefined
        ? this._resource
        : this._resource.merge(
            resourceFromAttributes({
              [ATTR_SERVICE_NAME]: this._serviceName,
            }),
          );

    if (this._serviceVersion !== undefined) {
      this._resource = this._resource.merge(
        resourceFromAttributes({
          [ATTR_SERVICE_VERSION]: this._serviceVersion,
        }),
      );
    }

    const spanProcessors: SpanProcessor[] = [];

    if (this._tracerProviderConfig?.spanProcessor) {
      spanProcessors.push(this._tracerProviderConfig.spanProcessor);
    }

    if (this._tracerProviderConfig?.spanProcessors) {
      spanProcessors.push(...this._tracerProviderConfig.spanProcessors);
    }

    const tracerProvider = new WebTracerProvider({
      ...this._tracerProviderConfig?.tracerConfig,
      resource: this._resource,
      spanProcessors: spanProcessors,
    });

    this._tracerProvider = tracerProvider;

    tracerProvider.register({
      contextManager: this._tracerProviderConfig?.contextManager,
      propagator: this._tracerProviderConfig?.textMapPropagator,
    });
    trace.setGlobalTracerProvider(tracerProvider);

    if (this._meterProviderConfig) {
      const readers = this._meterProviderConfig.metricExporters.map(
        (exporter) => {
          return new PeriodicExportingMetricReader({ exporter });
        },
      );
      this._meterProvider = new MeterProvider({
        resource: this._resource,
        readers,
      });
      metrics.setGlobalMeterProvider(this._meterProvider);
    }

    if (this._loggerProviderConfig) {
      const processors = this._loggerProviderConfig.logExporters.map(
        (exporter) => {
          return new SimpleLogRecordProcessor(exporter);
        },
      );
      this._loggerProvider = new LoggerProvider({
        resource: this._resource,
        processors,
      });
      logs.setGlobalLoggerProvider(this._loggerProvider);
    }

    registerInstrumentations({
      instrumentations: this._instrumentations,
    });
  }

  /* Experimental getter method: not currently part of the upstream
   * sdk's API */
  public getResourceAttributes() {
    return this._resource.attributes;
  }

  public forceFlush(): Promise<void> {
    const promises: Promise<unknown>[] = [];
    if (this._tracerProvider) {
      promises.push(this._tracerProvider.forceFlush());
    }
    if (this._meterProvider) {
      promises.push(this._meterProvider.forceFlush());
    }
    if (this._loggerProvider) {
      promises.push(this._loggerProvider.forceFlush());
    }

    return (
      Promise.all(promises)
        // return void instead of the array from Promise.all
        .then(() => {})
    );
  }

  public shutdown(): Promise<void> {
    const promises: Promise<unknown>[] = [];
    if (this._tracerProvider) {
      promises.push(this._tracerProvider.shutdown());
    }
    if (this._meterProvider) {
      promises.push(this._meterProvider.shutdown());
    }
    if (this._loggerProvider) {
      promises.push(this._loggerProvider.shutdown());
    }

    return (
      Promise.all(promises)
        // return void instead of the array from Promise.all
        .then(() => {})
    );
  }
}
