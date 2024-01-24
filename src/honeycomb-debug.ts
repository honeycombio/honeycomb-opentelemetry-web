import { HoneycombOptions } from './types';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { defaultOptions, getTracesApiKey, getTracesEndpoint } from './util';

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
    diag.debug('Honeycomb Web SDK Debug Mode Enabled');
    const currentOptions = { ...defaultOptions, ...options };

    currentOptions.apiKey = getTracesApiKey(currentOptions);
    currentOptions.tracesApiKey = getTracesApiKey(currentOptions);
    currentOptions.endpoint = getTracesEndpoint(options);
    currentOptions.tracesEndpoint = getTracesEndpoint(options);

    diag.debug(JSON.stringify(currentOptions, null, 2));
  }
}
