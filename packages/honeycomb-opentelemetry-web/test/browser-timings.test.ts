import { vi } from 'vitest';
import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { ResourceTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/resource-timing';

import { configureResourceTiming } from '../src/configure-resource-timing';
import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { HoneycombOptions } from '../src/types';
import {
  DEFAULT_LOGS_ENDPOINT,
  DEFAULT_METRICS_ENDPOINT,
  DEFAULT_TRACES_ENDPOINT,
} from '../src/util';

const DEFAULT_ENDPOINTS = [
  DEFAULT_TRACES_ENDPOINT,
  DEFAULT_METRICS_ENDPOINT,
  DEFAULT_LOGS_ENDPOINT,
];

/** Reads the config back off a constructed instrumentation. */
const configOf = (instrumentation: unknown) =>
  (
    instrumentation as {
      getConfig: () => { ignoreUrls?: (string | RegExp)[] };
    }
  ).getConfig();

/* Web vitals and global errors are switched off so the instrumentation array
 * holds only what each test opted into. */
describe('browser timing instrumentations', () => {
  const baseOptions: HoneycombOptions = {
    apiKey: 'my-api-key',
    serviceName: 'browser-timings-test',
    skipOptionsValidation: true,
    webVitalsInstrumentationConfig: { enabled: false },
    globalErrorsInstrumentationConfig: { enabled: false },
  };

  /* Navigation timing schedules a retry timer from its constructor. Upstream
   * overwrites the stored timeout id in a class field initializer that runs
   * after `super()`, so `disable()` cannot clear it. Fake timers keep the
   * callbacks off the real event loop, where they would otherwise fire after
   * the test environment is torn down. */
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const registered = (options?: HoneycombOptions) =>
    (
      new HoneycombWebSDK({ ...baseOptions, ...options }) as unknown as {
        _instrumentations: unknown[];
      }
    )._instrumentations;

  describe('by default', () => {
    test('neither is registered', () => {
      expect(registered()).toEqual([]);
    });

    /* Both stay off until `enabled` is explicitly true. */
    test('a config without enabled does not turn them on', () => {
      expect(
        registered({
          navigationTimingInstrumentationConfig: {},
          resourceTimingInstrumentationConfig: { batchSize: 10 },
        }),
      ).toEqual([]);
    });

    test('explicitly disabling them keeps them off', () => {
      expect(
        registered({
          navigationTimingInstrumentationConfig: { enabled: false },
          resourceTimingInstrumentationConfig: { enabled: false },
        }),
      ).toEqual([]);
    });
  });

  describe('when opted in', () => {
    test('it registers navigation timing', () => {
      const instrumentations = registered({
        navigationTimingInstrumentationConfig: { enabled: true },
      });

      expect(instrumentations).toHaveLength(1);
      expect(instrumentations[0]).toBeInstanceOf(
        NavigationTimingInstrumentation,
      );
    });

    test('it registers resource timing', () => {
      const instrumentations = registered({
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      expect(instrumentations).toHaveLength(1);
      expect(instrumentations[0]).toBeInstanceOf(ResourceTimingInstrumentation);
    });

    test('it registers both, navigation timing first', () => {
      const instrumentations = registered({
        navigationTimingInstrumentationConfig: { enabled: true },
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      expect(instrumentations).toHaveLength(2);
      expect(instrumentations[0]).toBeInstanceOf(
        NavigationTimingInstrumentation,
      );
      expect(instrumentations[1]).toBeInstanceOf(ResourceTimingInstrumentation);
    });

    test('it hands resource timing the endpoints to ignore', () => {
      const [resourceTiming] = registered({
        resourceTimingInstrumentationConfig: { enabled: true },
      });

      expect(configOf(resourceTiming).ignoreUrls).toEqual(DEFAULT_ENDPOINTS);
    });
  });
});

describe('configureResourceTiming', () => {
  test('it ignores the default endpoints', () => {
    expect(configureResourceTiming().ignoreUrls).toEqual(DEFAULT_ENDPOINTS);
    expect(
      configureResourceTiming({
        resourceTimingInstrumentationConfig: { enabled: true },
      }).ignoreUrls,
    ).toEqual(DEFAULT_ENDPOINTS);
  });

  test('it ignores a custom endpoint', () => {
    const config = configureResourceTiming({
      endpoint: 'http://localhost:4318',
      resourceTimingInstrumentationConfig: { enabled: true },
    });

    expect(config.ignoreUrls).toEqual([
      'http://localhost:4318/v1/traces',
      'http://localhost:4318/v1/metrics',
      'http://localhost:4318/v1/logs',
    ]);
  });

  test('it keeps caller-supplied ignoreUrls alongside its own', () => {
    const config = configureResourceTiming({
      resourceTimingInstrumentationConfig: {
        enabled: true,
        ignoreUrls: [/\/analytics$/, 'https://example.com/ping'],
      },
    });

    expect(config.ignoreUrls).toEqual([
      ...DEFAULT_ENDPOINTS,
      /\/analytics$/,
      'https://example.com/ping',
    ]);
  });

  test('it passes the rest of the config through untouched', () => {
    const config = configureResourceTiming({
      resourceTimingInstrumentationConfig: {
        enabled: true,
        batchSize: 10,
        initiatorTypes: ['fetch', 'xmlhttprequest'],
      },
    });

    expect(config).toMatchObject({
      enabled: true,
      batchSize: 10,
      initiatorTypes: ['fetch', 'xmlhttprequest'],
    });
  });
});
