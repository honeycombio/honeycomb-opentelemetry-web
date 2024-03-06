import { HoneycombOptions } from './types';

// Constants
export const DEFAULT_API_ENDPOINT = 'https://api.honeycomb.io';
export const TRACES_PATH = 'v1/traces';
export const DEFAULT_TRACES_ENDPOINT = `${DEFAULT_API_ENDPOINT}/${TRACES_PATH}`;
export const DEFAULT_SERVICE_NAME = 'unknown_service';
export const DEFAULT_SAMPLE_RATE = 1;

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
  sampleRate: 1,
  skipOptionsValidation: false,
  localVisualizations: false,
};

export const createHoneycombSDKLogMessage = (message: string) =>
  `@honeycombio/opentelemetry-web: ${message}`;

const classicKeyRegex = /^[a-f0-9]*$/;
const ingestClassicKeyRegex = /^hc[a-z]ic_[a-z0-9]*$/;

/**
 * Determines whether the passed in apikey is classic or not.
 *
 * @param apikey the apikey
 * @returns a boolean to indicate if the apikey was a classic key
 */
export function isClassic(apikey?: string): boolean {
  if (apikey == null || apikey.length === 0) {
    return false;
  } else if (apikey.length === 32) {
    return classicKeyRegex.test(apikey);
  } else if (apikey.length === 64) {
    return ingestClassicKeyRegex.test(apikey);
  }
  return false;
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

export const getSampleRate = (options?: HoneycombOptions) => {
  if (
    // must be a whole positive integer
    typeof options?.sampleRate === 'number' &&
    Number.isSafeInteger(options?.sampleRate) &&
    options?.sampleRate >= 0
  ) {
    return options?.sampleRate;
  }

  return DEFAULT_SAMPLE_RATE;
};
