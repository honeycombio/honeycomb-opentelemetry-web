import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import { defaultOptions, TRACES_PATH } from '../src/util';
import {
  MISSING_API_KEY_ERROR,
  MISSING_SERVICE_NAME_ERROR,
} from '../src/validate-options';

const consoleSpy = jest
  .spyOn(console, 'debug')
  .mockImplementation(() => undefined);

afterEach(() => {
  consoleSpy.mockClear();
});

afterAll(() => {
  consoleSpy.mockRestore();
});

describe('when debug is set to true', () => {
  describe('when options are missing', () => {
    it('should log defaults and errors to the console', () => {
      new HoneycombWebSDK({
        debug: true,
      });
      expect(consoleSpy).toHaveBeenNthCalledWith(
        2,
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(3, MISSING_API_KEY_ERROR);
      expect(consoleSpy).toHaveBeenNthCalledWith(4, MISSING_SERVICE_NAME_ERROR);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        5,
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${defaultOptions.tracesEndpoint}'`,
      );
      expect(consoleSpy.mock.calls[5][0]).toContain(
        `@honeycombio/opentelemetry-web: Sample Rate configured for traces: '${defaultOptions.sampleRate}'`,
      );
    });
  });
  describe('when options are provided', () => {
    it('should log the configured options to the console', () => {
      const testConfig = {
        debug: true,
        endpoint: 'http://shenanigans.honeycomb.io:1234',
        apiKey: 'my-key',
        serviceName: 'my-service',
        sampleRate: 2,
      };
      new HoneycombWebSDK(testConfig);
      expect(consoleSpy).toHaveBeenNthCalledWith(
        3,
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        4,
        `@honeycombio/opentelemetry-web: API Key configured for traces: '${testConfig.apiKey}'`,
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        5,
        `@honeycombio/opentelemetry-web: Service Name configured for traces: '${testConfig.serviceName}'`,
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        6,
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${testConfig.endpoint}/${TRACES_PATH}'`,
      );
      expect(consoleSpy).toHaveBeenNthCalledWith(
        7,
        `@honeycombio/opentelemetry-web: Sample Rate configured for traces: '${testConfig.sampleRate}'`,
      );
    });
  });
});
