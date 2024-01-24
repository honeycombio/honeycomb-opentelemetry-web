import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';
import {
  defaultOptions,
  MISSING_API_KEY_ERROR,
  MISSING_SERVICE_NAME_ERROR,
  TRACES_PATH,
} from '../src/util';

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
      expect(consoleSpy.mock.calls[1][0]).toContain(
        'Honeycomb Web SDK Debug Mode Enabled',
      );
      expect(consoleSpy.mock.calls[2][0]).toContain(MISSING_API_KEY_ERROR);
      expect(consoleSpy.mock.calls[3][0]).toContain(
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${defaultOptions.tracesEndpoint}'`,
      );
      expect(consoleSpy.mock.calls[4][0]).toContain(MISSING_SERVICE_NAME_ERROR);
    });
  });
  describe('when options are provided', () => {
    it('should log the configured options to the console', () => {
      const testConfig = {
        debug: true,
        endpoint: 'http://shenanigans:1234',
        apiKey: 'my-key',
        serviceName: 'my-service',
      };
      new HoneycombWebSDK(testConfig);
      expect(consoleSpy.mock.calls[1][0]).toContain(
        'Honeycomb Web SDK Debug Mode Enabled',
      );
      expect(consoleSpy.mock.calls[2][0]).toContain(
        `@honeycombio/opentelemetry-web: API Key configured for traces: '${testConfig.apiKey}'`,
      );
      expect(consoleSpy.mock.calls[3][0]).toContain(
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${testConfig.endpoint}/${TRACES_PATH}'`,
      );
      expect(consoleSpy.mock.calls[4][0]).toContain(
        `@honeycombio/opentelemetry-web: Service Name configured for traces: '${testConfig.serviceName}'`,
      );
    });
  });
});
