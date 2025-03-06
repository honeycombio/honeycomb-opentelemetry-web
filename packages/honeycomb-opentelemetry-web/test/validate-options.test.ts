import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import {
  CUSTOM_COLLECTOR_VALIDATION_MSG,
  IGNORED_DATASET_ERROR,
  MISSING_API_KEY_ERROR,
  MISSING_DATASET_ERROR,
  MISSING_SERVICE_NAME_ERROR,
  SAMPLER_OVERRIDE_WARNING,
  SKIPPING_OPTIONS_VALIDATION_MSG,
} from '../src/validate-options';
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

// non-ingest classic keys are 32 chars long
const classicApiKey = '12345678901234567890123456789012';
// non-ingest non-classic keys are 22 chars log
const apiKey = 'kgvSpPwegJshQkuowXReLD';

describe('console warnings', () => {
  describe('when skipOptionsValidation is true', () => {
    it('should not show any warnings', () => {
      new HoneycombWebSDK({
        skipOptionsValidation: true,
      });
      expect(debugSpy).toHaveBeenNthCalledWith(
        1,
        SKIPPING_OPTIONS_VALIDATION_MSG,
      );
    });
  });
  describe('when skipOptionsValidation is false', () => {
    it('should not show warnings when using a custom endpoint', () => {
      new HoneycombWebSDK({
        endpoint: "http://localhost"
      });
      expect(debugSpy).toHaveBeenNthCalledWith(
        1,
        CUSTOM_COLLECTOR_VALIDATION_MSG,
      );
    });

    it('should not show warnings when using a custom traces endpoint', () => {
      new HoneycombWebSDK({
        tracesEndpoint: "http://localhost"
      });
      expect(debugSpy).toHaveBeenNthCalledWith(
        1,
        CUSTOM_COLLECTOR_VALIDATION_MSG,
      );
    });

    it('should show the API key missing warning', () => {
      new HoneycombWebSDK({
        serviceName: 'test-service',
      });
      expect(warningSpy).toHaveBeenNthCalledWith(1, MISSING_API_KEY_ERROR);
    });

    it('should show the missing service name warning', () => {
      new HoneycombWebSDK({});
      expect(warningSpy).toHaveBeenNthCalledWith(2, MISSING_SERVICE_NAME_ERROR);
    });

    it('should show ignored dataset warning', () => {
      new HoneycombWebSDK({
        apiKey: apiKey,
        dataset: 'test-dataset',
        serviceName: 'test-servicename',
      });
      expect(warningSpy).toHaveBeenLastCalledWith(IGNORED_DATASET_ERROR);
    });

    it('should show dataset missing warning if using a classic key', () => {
      new HoneycombWebSDK({
        apiKey: classicApiKey,
      });

      expect(warningSpy).toHaveBeenLastCalledWith(MISSING_DATASET_ERROR);
    });

    it('should sampler override warning', () => {
      const customSampler = new AlwaysOnSampler();
      new HoneycombWebSDK({
        apiKey: apiKey,
        serviceName: 'test-service',
        sampler: customSampler,
      });

      expect(debugSpy).toHaveBeenLastCalledWith(SAMPLER_OVERRIDE_WARNING);
    });
  });
});
