import { HoneycombOptions } from './types';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import {
  defaultOptions,
  getSampleRate,
  getTracesApiKey,
  getTracesEndpoint,
  MISSING_API_KEY_ERROR,
  MISSING_SERVICE_NAME_ERROR,
} from './util';

/**
 * Configures the Honeycomb Web SDK to log debug information to the console.
 * Enables the DiagConsoleLogger and sets the log level to DEBUG.
 * Logs the provided Honeycomb options to the console, as well as defaults.
 *
 * @param options the provided Honeycomb options
 */
export function configureDebug(options?: HoneycombOptions): void {
  if (!options?.debug) {
    return;
  }
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  diag.debug('🐝 Honeycomb Web SDK Debug Mode Enabled 🐝');

  // traces endpoint must be computed from provided options
  const tracesEndpoint = getTracesEndpoint(options);
  const currentOptions = {
    ...defaultOptions,
    ...options,
    tracesEndpoint,
  };

  debugTracesApiKey(currentOptions);
  debugServiceName(currentOptions);
  debugTracesEndpoint(currentOptions);
  debugSampleRate(currentOptions);
}

function debugTracesApiKey(options: HoneycombOptions): void {
  const tracesApiKey = getTracesApiKey(options) || '';
  if (!tracesApiKey) {
    diag.debug(MISSING_API_KEY_ERROR);
    return;
  }
  diag.debug(
    `@honeycombio/opentelemetry-web: API Key configured for traces: '${tracesApiKey}'`,
  );
}

function debugServiceName(options: HoneycombOptions): void {
  const serviceName = options.serviceName || defaultOptions.serviceName;
  if (serviceName === defaultOptions.serviceName) {
    diag.debug(MISSING_SERVICE_NAME_ERROR);
    return;
  }
  diag.debug(
    `@honeycombio/opentelemetry-web: Service Name configured for traces: '${serviceName}'`,
  );
}

function debugTracesEndpoint(options: HoneycombOptions): void {
  const tracesEndpoint = getTracesEndpoint(options);
  if (!tracesEndpoint) {
    diag.debug('No endpoint configured for traces');
    return;
  }
  diag.debug(
    `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${tracesEndpoint}'`,
  );
}

function debugSampleRate(options: HoneycombOptions): void {
  const sampleRate = getSampleRate(options);
  if (!sampleRate) {
    // this should never happen, but guard just in case?
    diag.debug('No sampler configured for traces');
    return;
  }
  diag.debug(
    `@honeycombio/opentelemetry-web: Sample Rate configured for traces: '${sampleRate}'`,
  );
}
