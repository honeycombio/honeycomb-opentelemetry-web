import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import {
  getLogsApiKey, getLogsEndpoint,
  getMetricsApiKey, getMetricsEndpoint,
  getTracesApiKey, getTracesEndpoint,
  isClassic } from './util';
import { HoneycombOptions } from './types';

export const TEAM_HEADER_KEY = 'x-honeycomb-team';
export const DATASET_HEADER_KEY = 'x-honeycomb-dataset';

/**
 * Builds and returns an OTLP Traces exporter that sends data over http/json
 * @param options The {@link HoneycombOptions} used to configure the exporter
 * @returns a {@link SpanExporter} configured to send telemetry to Honeycomb over http/json
 */
export function configureHoneycombHttpJsonTraceExporter(
  options?: HoneycombOptions,
): OTLPTraceExporter {
  const apiKey = getTracesApiKey(options);
  return new OTLPTraceExporter({
    url: getTracesEndpoint(options),
    headers: configureHeaders(options, apiKey, options?.tracesHeaders),
  });
}

/**
 * Builds and returns an OTLP Metrics exporter that sends data over http/json
 * @param options The {@link HoneycombOptions} used to configure the exporter
 * @returns an {@link OTLPMetricExporter} configured to send telemetry to Honeycomb over http/json
 */
export function configureHoneycombHttpJsonMetricExporter(
  options?: HoneycombOptions,
): OTLPMetricExporter {
  const apiKey = getMetricsApiKey(options);
  return new OTLPMetricExporter({
    url: getMetricsEndpoint(options),
    headers: configureHeaders(options, apiKey, options?.metricsHeaders, true),
  });
}

/**
 * Builds and returns an OTLP Logs exporter that sends data over http/json
 * @param options The {@link HoneycombOptions} used to configure the exporter
 * @returns an {@link OTLPLogExporter} configured to send telemetry to Honeycomb over http/json
 */
export function configureHoneycombHttpJsonLogExporter(
  options?: HoneycombOptions,
): OTLPLogExporter {
  const apiKey = getLogsApiKey(options);
  return new OTLPLogExporter({
    url: getLogsEndpoint(options),
    headers: configureHeaders(options, apiKey, options?.logsHeaders),
  });
}

function configureHeaders(
  options?: HoneycombOptions,
  apiKey?: string,
  signalHeaders?: { [key: string]: string },
  isMetrics: boolean = false,
) {
  const headers = { ...options?.headers, ...signalHeaders };
  if (apiKey && !headers[TEAM_HEADER_KEY]) {
    headers[TEAM_HEADER_KEY] = apiKey;
  }
  if (isClassic(apiKey)) {
    if (isMetrics && options?.metricsDataset) {
      headers[DATASET_HEADER_KEY] = options?.metricsDataset;
    } else if (options?.dataset) {
      headers[DATASET_HEADER_KEY] = options?.dataset;
    }
  }
  return headers;
}
