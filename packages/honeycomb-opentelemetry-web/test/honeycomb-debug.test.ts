/* DiagConsoleLogger calls the console methods @opentelemetry/api captured at
 * module load, deliberately bypassing anything that patches console later. The
 * spy therefore has to be in place before the API module is first loaded, which
 * means requiring these modules rather than importing them. */
const consoleSpy = jest
  .spyOn(console, 'debug')
  .mockImplementation(() => undefined);

const { HoneycombWebSDK } =
  require('../src/honeycomb-otel-sdk') as typeof import('../src/honeycomb-otel-sdk');
const { defaultOptions, TRACES_PATH } =
  require('../src/util') as typeof import('../src/util');
const { MISSING_API_KEY_ERROR, MISSING_SERVICE_NAME_ERROR } =
  require('../src/validate-options') as typeof import('../src/validate-options');

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
      expect(consoleSpy).toHaveBeenCalledWith(
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(consoleSpy).toHaveBeenCalledWith(MISSING_API_KEY_ERROR);
      expect(consoleSpy).toHaveBeenCalledWith(MISSING_SERVICE_NAME_ERROR);
      expect(consoleSpy).toHaveBeenCalledWith(
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
      expect(consoleSpy).toHaveBeenCalledWith(
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: API Key configured for traces: '${testConfig.apiKey}'`,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: Service Name configured for traces: '${testConfig.serviceName}'`,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${testConfig.endpoint}/${TRACES_PATH}'`,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: Sample Rate configured for traces: '${testConfig.sampleRate}'`,
      );
    });
    it('should log the configured options to the console when endpoint is omitted', () => {
      const testConfig = {
        debug: true,
        apiKey: 'my-key',
        serviceName: 'my-service',
        sampleRate: 2,
      };
      new HoneycombWebSDK(testConfig);
      expect(consoleSpy).toHaveBeenCalledWith(
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: API Key configured for traces: '${testConfig.apiKey}'`,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: Service Name configured for traces: '${testConfig.serviceName}'`,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: 'https://api.honeycomb.io/v1/traces'`,
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `@honeycombio/opentelemetry-web: Sample Rate configured for traces: '${testConfig.sampleRate}'`,
      );
    });
  });
});
