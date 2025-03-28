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

import { ContextManager, TextMapPropagator } from '@opentelemetry/api';
import {
  Instrumentation,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';
import {
  detectResources,
  Resource,
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
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { WebSDKConfiguration } from './types';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';

/** This class represents everything needed to register a fully configured OpenTelemetry Web SDK */

export class WebSDK {
  private _tracerProviderConfig?: {
    tracerConfig: WebTracerConfig;
    spanProcessor: SpanProcessor;
    contextManager?: ContextManager;
    textMapPropagator?: TextMapPropagator;
  };
  private _instrumentations: (Instrumentation | Instrumentation[])[];

  private _resource: Resource;
  private _resourceDetectors: Array<ResourceDetector>;

  private _autoDetectResources: boolean;

  private _tracerProvider?: WebTracerProvider;
  private _serviceName?: string;

  private _disabled?: boolean;

  /**
   * Create a new Web SDK instance
   */
  public constructor(configuration: Partial<WebSDKConfiguration> = {}) {
    this._resource = configuration.resource ?? resourceFromAttributes({});
    this._resourceDetectors = configuration.resourceDetectors ?? [
      browserDetector,
    ];

    this._serviceName = configuration.serviceName;

    this._autoDetectResources = configuration.autoDetectResources ?? true;

    if (configuration.spanProcessor || configuration.traceExporter) {
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

      const spanProcessor =
        configuration.spanProcessor ??
        new BatchSpanProcessor(configuration.traceExporter!);

      this._tracerProviderConfig = {
        tracerConfig: tracerProviderConfig,
        spanProcessor,
        contextManager: configuration.contextManager,
        textMapPropagator: configuration.textMapPropagator,
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

    registerInstrumentations({
      instrumentations: this._instrumentations,
    });

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

    const tracerProvider = new WebTracerProvider({
      ...this._tracerProviderConfig?.tracerConfig,
      resource: this._resource,
    });

    this._tracerProvider = tracerProvider;

    if (this._tracerProviderConfig) {
      tracerProvider.addSpanProcessor(this._tracerProviderConfig.spanProcessor);
    }

    tracerProvider.register({
      contextManager: this._tracerProviderConfig?.contextManager,
      propagator: this._tracerProviderConfig?.textMapPropagator,
    });
  }

  /* Experimental getter method: not currently part of the upstream
   * sdk's API */
  public getResourceAttributes() {
    return this._resource.attributes;
  }

  public shutdown(): Promise<void> {
    const promises: Promise<unknown>[] = [];
    if (this._tracerProvider) {
      promises.push(this._tracerProvider.shutdown());
    }

    return (
      Promise.all(promises)
        // return void instead of the array from Promise.all
        .then(() => {})
    );
  }
}
