import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import {
  IGNORED_DATASET_ERROR,
  MISSING_DATASET_ERROR,
  SAMPLER_OVERRIDE_WARNING,
  SKIPPING_OPTIONS_VALIDATION_MSG,
} from '../src/honeycomb-warnings';
import { MISSING_API_KEY_ERROR, MISSING_SERVICE_NAME_ERROR } from '../src/util';
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';
const debugSpy = jest
  .spyOn(console, 'debug')
  .mockImplementation(() => undefined);

const warningSpy = jest
  .spyOn(console, 'warn')
  .mockImplementation(() => undefined);

afterEach(() => {
  debugSpy.mockClear();
  warningSpy.mockClear();
});

afterAll(() => {
  debugSpy.mockRestore();
  warningSpy.mockRestore();
});

// classic keys are 32 chars long
const classicApiKey = 'this is a string that is 32 char';
// non-classic keys are 22 chars log
const apiKey = 'an api key for 22 char';

describe('console warnings', () => {
  describe('when skipOptionsValidation is true', () => {
    it('should not show any warnings', () => {
      new HoneycombWebSDK({
        skipOptionsValidation: true,
      });
      expect(debugSpy.mock.calls[0][0]).toContain(
        SKIPPING_OPTIONS_VALIDATION_MSG,
      );
    });
  });
  describe('when skipOptionsValidation is false', () => {
    it('should show the API key missing warning', () => {
      new HoneycombWebSDK({
        serviceName: 'test-service',
      });
      expect(warningSpy.mock.calls[0][0]).toBe(MISSING_API_KEY_ERROR);
    });

    it('should show the missing service name warning', () => {
      new HoneycombWebSDK({});
      expect(warningSpy.mock.calls[1][0]).toBe(MISSING_SERVICE_NAME_ERROR);
    });

    it('should show ignored dataset warning', () => {
      new HoneycombWebSDK({
        apiKey: apiKey,
        dataset: 'test-dataset',
        serviceName: 'test-servicename',
      });
      expect(warningSpy.mock.calls[0][0]).toBe(IGNORED_DATASET_ERROR);
    });

    it('should show dataset missing warning if using a classic key', () => {
      new HoneycombWebSDK({
        apiKey: classicApiKey,
      });

      expect(warningSpy.mock.calls[1][0]).toBe(MISSING_DATASET_ERROR);
    });

    it('should sampler override warning', () => {
      const customSampler = new AlwaysOnSampler();
      new HoneycombWebSDK({
        apiKey: apiKey,
        serviceName: 'test-service',
        sampler: customSampler,
      });

      expect(warningSpy.mock.calls[0][0]).toBe(SAMPLER_OVERRIDE_WARNING);
    });
  });
});
