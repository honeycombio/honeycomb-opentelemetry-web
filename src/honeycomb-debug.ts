import { HoneycombOptions } from './types';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getTracesApiKey, getTracesEndpoint } from './util';

/**
 * Configures the Honeycomb Web SDK to log debug information to the console.
 * Enables the DiagConsoleLogger and sets the log level to DEBUG.
 * Logs the provided Honeycomb options to the console, as well as defaults.
 *
 * @param options the provided Honeycomb options
 */

export function configureDebug(options?: HoneycombOptions): void {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  diag.debug('Honeycomb Web SDK Debug Mode Enabled');
  if (options?.debug) {
    options.apiKey
      ? options.apiKey
      : (options.apiKey = getTracesApiKey(options));

    if (options.apiKey == undefined) {
      options.apiKey = 'MISSING';
    }

    options.serviceName
      ? options.serviceName
      : (options.serviceName = 'MISSING');

    options.endpoint
      ? options.endpoint
      : (options.endpoint = getTracesEndpoint(options));

    options.tracesEndpoint
      ? options.tracesEndpoint
      : (options.tracesEndpoint = getTracesEndpoint(options));

    diag.debug(JSON.stringify(options, null, 2));
  }
}
