import { HoneycombOptions } from './types';

// Constants
export const DEFAULT_API_ENDPOINT = 'https://api.honeycomb.io';
export const TRACES_PATH = 'v1/traces';

/**
 * Determines whether the passed in apikey is classic (32 chars) or not.
 *
 * @param apikey the apikey
 * @returns a boolean to indicate if the apikey was a classic key
 */
export function isClassic(apikey?: string): boolean {
  return apikey?.length === 32;
}

/**
 * Checks for and appends v1/traces to provided URL if missing when using an HTTP
 * based exporter protocol.
 *
 * @param url the base URL to append traces path to if missing
 * @param protocol the exporter protocol to send telemetry
 * @returns the endpoint with traces path appended if missing
 */
export function maybeAppendTracesPath(url: string) {
  if (!url?.endsWith(TRACES_PATH)) {
    return url.endsWith('/') ? url + TRACES_PATH : url + TRACES_PATH;
  }
  return url;
}

export const getTracesEndpoint = (options?: HoneycombOptions) => {
  // use `tracesEndpoint` option unchanged if provided
  if (options?.tracesEndpoint) {
    return options.tracesEndpoint;
  }

  // use `endpoint` option if provided and append '/v1/traces' if not already appended
  if (options?.endpoint) {
    return maybeAppendTracesPath(options.endpoint);
  }

  return `${DEFAULT_API_ENDPOINT}/${TRACES_PATH}`;
};
