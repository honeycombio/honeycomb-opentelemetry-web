import { HoneycombOptions } from './types';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import {
  defaultOptions,
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
  if (options?.debug) {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
    diag.debug('🐝 Honeycomb Web SDK Debug Mode Enabled 🐝');
    const currentOptions = { ...defaultOptions, ...options };

    // tracesApiKey and tracesEndpoint need to be computed from apiKey and endpoint
    currentOptions.tracesApiKey = getTracesApiKey(options) || '';
    currentOptions.tracesEndpoint = getTracesEndpoint(options);

    if (currentOptions.tracesApiKey === '') {
      diag.debug(MISSING_API_KEY_ERROR);
    } else {
      diag.debug(
        `@honeycombio/opentelemetry-web: API Key configured for traces: '${currentOptions.tracesApiKey}'`,
      );
    }

    diag.debug(
      `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${currentOptions.tracesEndpoint}'`,
    );

    if (currentOptions.serviceName == defaultOptions.serviceName) {
      diag.debug(MISSING_SERVICE_NAME_ERROR);
    } else {
      diag.debug(
        `@honeycombio/opentelemetry-web: Service Name configured for traces: '${currentOptions.serviceName}'`,
      );
    }
  }
}
