import { ResourceTimingInstrumentationConfig } from '@opentelemetry/browser-instrumentation/experimental/resource-timing';
import { HoneycombOptions } from './types';
import { getLogsEndpoint, getMetricsEndpoint, getTracesEndpoint } from './util';

/**
 * Builds the config for resource timing instrumentation.
 *
 * Prepends this SDK's export endpoints to `ignoreUrls`, so exporting telemetry
 * does not itself record a resource timing event.
 *
 * @param options The {@link HoneycombOptions}
 * @returns the caller's config with this SDK's endpoints added to `ignoreUrls`
 */
export const configureResourceTiming = (
  options?: HoneycombOptions,
): ResourceTimingInstrumentationConfig => {
  const resourceTiming = options?.resourceTimingInstrumentationConfig;

  return {
    ...resourceTiming,
    ignoreUrls: [
      getTracesEndpoint(options),
      getMetricsEndpoint(options),
      getLogsEndpoint(options),
      ...(resourceTiming?.ignoreUrls ?? []),
    ],
  };
};
