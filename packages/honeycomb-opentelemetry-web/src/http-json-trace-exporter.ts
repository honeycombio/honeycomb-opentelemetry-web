import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getTracesApiKey, getTracesEndpoint, isClassic } from './util';
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
    headers: configureHeaders(options, apiKey),
  });
}

function configureHeaders(options?: HoneycombOptions, apiKey?: string) {
  const headers = { ...options?.headers };
  if (apiKey && !headers[TEAM_HEADER_KEY]) {
    headers[TEAM_HEADER_KEY] = apiKey;
  }
  if (isClassic(apiKey) && options?.dataset) {
    headers[DATASET_HEADER_KEY] = options?.dataset;
  }

  return headers;
}
