import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { isClassic, getTracesEndpoint } from './util';
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
  return new OTLPTraceExporter({
    url: getTracesEndpoint(options),
    headers: {
      [TEAM_HEADER_KEY]: options?.apiKey,
      [DATASET_HEADER_KEY]: isClassic(options?.apiKey)
        ? options?.dataset
        : undefined,
    },
  });
}
