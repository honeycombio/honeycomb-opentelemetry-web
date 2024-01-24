import { HoneycombOptions } from './types';

// Constants
export const DEFAULT_API_ENDPOINT = 'https://api.honeycomb.io';
export const TRACES_PATH = 'v1/traces';
export const DEFAULT_TRACES_ENDPOINT = `${DEFAULT_API_ENDPOINT}/${TRACES_PATH}`;
export const DEFAULT_SERVICE_NAME = 'unknown_service';

/**
 * Default options for the Honeycomb Web SDK.
 */
export const defaultOptions: HoneycombOptions = {
  apiKey: '',
  tracesApiKey: '',
  endpoint: DEFAULT_TRACES_ENDPOINT,
  tracesEndpoint: DEFAULT_TRACES_ENDPOINT,
  serviceName: DEFAULT_SERVICE_NAME,
  debug: false,
  // TODO: Not yet implemented
  // sampleRate: 1,
  // localVisualizations: false,
  // skipOptionsValidation: false,
};

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
 * @returns the endpoint with traces path appended if missing
 */
export function maybeAppendTracesPath(url: string) {
  if (url.endsWith(TRACES_PATH) || url.endsWith(`${TRACES_PATH}/`)) {
    return url;
  }

  return url.endsWith('/') ? url + TRACES_PATH : url + '/' + TRACES_PATH;
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

  return DEFAULT_TRACES_ENDPOINT;
};

export const getTracesApiKey = (options?: HoneycombOptions) => {
  return options?.tracesApiKey || options?.apiKey;
};
