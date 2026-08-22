import { Instrumentation } from '@opentelemetry/instrumentation';
import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { ResourceTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/resource-timing';
import { HoneycombOptions } from './types';
import { getLogsEndpoint, getMetricsEndpoint, getTracesEndpoint } from './util';

/**
 * The endpoints this SDK exports to.
 *
 * Resource timing records an event for every resource the browser fetches,
 * which includes the SDK's own exports. Left alone, each export would produce
 * an event, that event would be exported, and that export would produce
 * another. These are always ignored, ahead of anything the caller passes.
 */
const telemetryEndpoints = (options?: HoneycombOptions): string[] => [
  getTracesEndpoint(options),
  getMetricsEndpoint(options),
  getLogsEndpoint(options),
];

/**
 * Builds the navigation and resource timing instrumentations.
 *
 * Both are off unless explicitly enabled. They emit log records rather than
 * spans, so they need the logs pipeline, which the SDK configures by default.
 *
 * @param options The {@link HoneycombOptions}
 * @returns the instrumentations the caller opted into, which may be none
 */
export const configureBrowserTimingInstrumentations = (
  options?: HoneycombOptions,
): Instrumentation[] => {
  const instrumentations: Instrumentation[] = [];

  const navigationTiming = options?.navigationTimingInstrumentationConfig;
  if (navigationTiming?.enabled) {
    instrumentations.push(
      new NavigationTimingInstrumentation(navigationTiming),
    );
  }

  const resourceTiming = options?.resourceTimingInstrumentationConfig;
  if (resourceTiming?.enabled) {
    instrumentations.push(
      new ResourceTimingInstrumentation({
        ...resourceTiming,
        ignoreUrls: [
          ...telemetryEndpoints(options),
          ...(resourceTiming.ignoreUrls ?? []),
        ],
      }),
    );
  }

  return instrumentations;
};
