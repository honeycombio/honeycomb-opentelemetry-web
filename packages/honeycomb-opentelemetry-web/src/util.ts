import { HoneycombOptions } from './types';

// Constants
export const DEFAULT_API_ENDPOINT = 'https://api.honeycomb.io';
export const TRACES_PATH = 'v1/traces';
export const DEFAULT_TRACES_ENDPOINT = `${DEFAULT_API_ENDPOINT}/${TRACES_PATH}`;
export const METRICS_PATH = 'v1/metrics';
export const DEFAULT_METRICS_ENDPOINT = `${DEFAULT_API_ENDPOINT}/${METRICS_PATH}`;
export const LOGS_PATH = 'v1/logs';
export const DEFAULT_LOGS_ENDPOINT = `${DEFAULT_API_ENDPOINT}/${LOGS_PATH}`;
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
  webVitalsInstrumentationConfig: {
    enabled: true,
  },
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
 * Checks for and appends v1/{traces, metrics, logs} to provided URL if missing
 * when using an HTTP based exporter protocol.
 *
 * @param url the base URL to append traces path to if missing
 * @returns the endpoint with traces path appended if missing
 */
function maybeAppendPath(url: string, path: string) {
  if (url.endsWith(path) || url.endsWith(`${path}/`)) {
    return url;
  }

  return url.endsWith('/') ? url + path : url + '/' + path;
}

export const getTracesEndpoint = (options?: HoneycombOptions) => {
  // use `tracesEndpoint` option unchanged if provided
  if (options?.tracesEndpoint) {
    return options.tracesEndpoint;
  }

  // use `endpoint` option if provided and append '/v1/traces' if not already appended
  if (options?.endpoint) {
    return maybeAppendPath(options.endpoint, TRACES_PATH);
  }

  return DEFAULT_TRACES_ENDPOINT;
};

export const getMetricsEndpoint = (options?: HoneycombOptions) => {
  // use `metricsEndpoint` option unchanged if provided
  if (options?.metricsEndpoint) {
    return options.metricsEndpoint;
  }

  // use `endpoint` option if provided and append '/v1/metrics' if not already appended
  if (options?.endpoint) {
    return maybeAppendPath(options.endpoint, METRICS_PATH);
  }

  return DEFAULT_METRICS_ENDPOINT;
};

export const getLogsEndpoint = (options?: HoneycombOptions) => {
  // use `logsEndpoint` option unchanged if provided
  if (options?.logsEndpoint) {
    return options.logsEndpoint;
  }

  // use `endpoint` option if provided and append '/v1/logs' if not already appended
  if (options?.endpoint) {
    return maybeAppendPath(options.endpoint, LOGS_PATH);
  }

  return DEFAULT_LOGS_ENDPOINT;
};

export const getTracesApiKey = (options?: HoneycombOptions) => {
  return options?.tracesApiKey || options?.apiKey;
};

export const getMetricsApiKey = (options?: HoneycombOptions) => {
  return options?.metricsApiKey || options?.apiKey;
};

export const getLogsApiKey = (options?: HoneycombOptions) => {
  return options?.logsApiKey || options?.apiKey;
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
