import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { ResourceTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/resource-timing';

import { configureBrowserTimingInstrumentations } from '../src/configure-browser-timings';
import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { HoneycombOptions } from '../src/types';
import {
  DEFAULT_LOGS_ENDPOINT,
  DEFAULT_METRICS_ENDPOINT,
  DEFAULT_TRACES_ENDPOINT,
} from '../src/util';

/** Reads the config back off a constructed instrumentation. */
const configOf = (instrumentation: unknown) =>
  (
    instrumentation as {
      getConfig: () => { ignoreUrls?: (string | RegExp)[] };
    }
  ).getConfig();

describe('browser timing instrumentations', () => {
  describe('by default', () => {
    test('neither is enabled', () => {
      expect(configureBrowserTimingInstrumentations()).toEqual([]);
      expect(configureBrowserTimingInstrumentations({})).toEqual([]);
    });

    /* An empty config object is not consent. Both instrumentations stay off
     * until `enabled` is explicitly true, unlike web vitals and global errors
     * which are on unless switched off. */
    test('passing a config without enabled does not turn them on', () => {
      const instrumentations = configureBrowserTimingInstrumentations({
        navigationTimingInstrumentationConfig: {},
        resourceTimingInstrumentationConfig: { batchSize: 10 },
      });

      expect(instrumentations).toEqual([]);
    });

    test('explicitly disabling them keeps them off', () => {
      const instrumentations = configureBrowserTimingInstrumentations({
        navigationTimingInstrumentationConfig: { enabled: false },
        resourceTimingInstrumentationConfig: { enabled: false },
      });

      expect(instrumentations).toEqual([]);
    });
  });

  describe('when opted in', () => {
    test('it adds navigation timing', () => {
      const instrumentations = configureBrowserTimingInstrumentations({
        navigationTimingInstrumentationConfig: { enabled: true },
      });

      expect(instrumentations).toHaveLength(1);
      expect(instrumentations[0]).toBeInstanceOf(
        NavigationTimingInstrumentation,
      );
    });

    test('it adds resource timing', () => {
      const instrumentations = configureBrowserTimingInstrumentations({
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      expect(instrumentations).toHaveLength(1);
      expect(instrumentations[0]).toBeInstanceOf(ResourceTimingInstrumentation);
    });

    test('it adds both, navigation timing first', () => {
      const instrumentations = configureBrowserTimingInstrumentations({
        navigationTimingInstrumentationConfig: { enabled: true },
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      expect(instrumentations).toHaveLength(2);
      expect(instrumentations[0]).toBeInstanceOf(
        NavigationTimingInstrumentation,
      );
      expect(instrumentations[1]).toBeInstanceOf(ResourceTimingInstrumentation);
    });
  });

  /* Resource timing records an event per resource the browser fetches, which
   * would otherwise include the SDK's own exports: every export would produce
   * an event, which would be exported, which would produce another. */
  describe('resource timing ignores this SDK’s own exports', () => {
    test('it ignores the default endpoints', () => {
      const [resourceTiming] = configureBrowserTimingInstrumentations({
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      expect(configOf(resourceTiming).ignoreUrls).toEqual([
        DEFAULT_TRACES_ENDPOINT,
        DEFAULT_METRICS_ENDPOINT,
        DEFAULT_LOGS_ENDPOINT,
      ]);
    });

    test('it ignores a custom endpoint', () => {
      const [resourceTiming] = configureBrowserTimingInstrumentations({
        endpoint: 'http://localhost:4318',
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      expect(configOf(resourceTiming).ignoreUrls).toEqual([
        'http://localhost:4318/v1/traces',
        'http://localhost:4318/v1/metrics',
        'http://localhost:4318/v1/logs',
      ]);
    });

    test('it keeps caller-supplied ignoreUrls alongside its own', () => {
      const [resourceTiming] = configureBrowserTimingInstrumentations({
        resourceTimingInstrumentationConfig: {
          enabled: true,
          ignoreUrls: [/\/analytics$/, 'https://example.com/ping'],
        },
      });

      expect(configOf(resourceTiming).ignoreUrls).toEqual([
        DEFAULT_TRACES_ENDPOINT,
        DEFAULT_METRICS_ENDPOINT,
        DEFAULT_LOGS_ENDPOINT,
        /\/analytics$/,
        'https://example.com/ping',
      ]);
    });

    test('it passes the rest of the config through untouched', () => {
      const [resourceTiming] = configureBrowserTimingInstrumentations({
        resourceTimingInstrumentationConfig: {
          enabled: true,
          batchSize: 10,
          initiatorTypes: ['fetch', 'xmlhttprequest'],
        },
      });

      expect(configOf(resourceTiming)).toMatchObject({
        batchSize: 10,
        initiatorTypes: ['fetch', 'xmlhttprequest'],
      });
    });
  });

  /* The instrumentations are assembled in the SDK constructor, so these assert
   * the wiring rather than the builder above. */
  describe('through the SDK', () => {
    const baseOptions: HoneycombOptions = {
      apiKey: 'my-api-key',
      serviceName: 'browser-timings-test',
      skipOptionsValidation: true,
      webVitalsInstrumentationConfig: { enabled: false },
      globalErrorsInstrumentationConfig: { enabled: false },
    };

    const instrumentationsOf = (sdk: HoneycombWebSDK) =>
      (sdk as unknown as { _instrumentations: unknown[] })._instrumentations;

    test('it registers neither by default', () => {
      const sdk = new HoneycombWebSDK(baseOptions);

      expect(instrumentationsOf(sdk)).toEqual([]);
    });

    test('it registers the ones opted into', () => {
      const sdk = new HoneycombWebSDK({
        ...baseOptions,
        navigationTimingInstrumentationConfig: { enabled: true },
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      const instrumentations = instrumentationsOf(sdk);
      expect(instrumentations).toHaveLength(2);
      expect(instrumentations[0]).toBeInstanceOf(
        NavigationTimingInstrumentation,
      );
      expect(instrumentations[1]).toBeInstanceOf(ResourceTimingInstrumentation);
    });
  });
});
