import { defaultOptions, TRACES_PATH } from '../src/util';
import {
  MISSING_API_KEY_ERROR,
  MISSING_SERVICE_NAME_ERROR,
} from '../src/validate-options';

// As of @opentelemetry/api 1.9.1, DiagConsoleLogger saves the original console
// methods at module-load time and calls those directly, deliberately bypassing
// any wrapping of `console` installed afterwards. A spy created after the api
// module has loaded therefore never sees diag output. To observe it we install
// the spy first and re-require the SDK (via resetModules) so the freshly
// evaluated api module captures our spy as the "original" console.debug.
let consoleSpy: jest.SpyInstance;

const newDebugSDK = (options: Record<string, unknown>) => {
  jest.resetModules();
  consoleSpy = jest
    .spyOn(console, 'debug')
    .mockImplementation(() => undefined);
  const { HoneycombWebSDK } = require('../src/honeycomb-otel-sdk');
  new HoneycombWebSDK(options);
};

// The SDK's own debug output, with @opentelemetry/api's internal diag messages
// (e.g. "Registered a global for diag ...") filtered out so the assertions are
// not coupled to api internals.
const debugMessages = () =>
  consoleSpy.mock.calls
    .map((call) => String(call[0]))
    .filter((message) => !message.startsWith('@opentelemetry/api:'));

afterEach(() => {
  consoleSpy?.mockRestore();
});

describe('when debug is set to true', () => {
  describe('when options are missing', () => {
    it('should log defaults and errors to the console', () => {
      newDebugSDK({
        debug: true,
      });
      const messages = debugMessages();
      expect(messages[0]).toBe(
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(messages[1]).toBe(MISSING_API_KEY_ERROR);
      expect(messages[2]).toBe(MISSING_SERVICE_NAME_ERROR);
      expect(messages[3]).toBe(
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${defaultOptions.tracesEndpoint}'`,
      );
      expect(messages[4]).toContain(
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
      newDebugSDK(testConfig);
      const messages = debugMessages();
      expect(messages[0]).toBe(
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(messages[1]).toBe(
        `@honeycombio/opentelemetry-web: API Key configured for traces: '${testConfig.apiKey}'`,
      );
      expect(messages[2]).toBe(
        `@honeycombio/opentelemetry-web: Service Name configured for traces: '${testConfig.serviceName}'`,
      );
      expect(messages[3]).toBe(
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: '${testConfig.endpoint}/${TRACES_PATH}'`,
      );
      expect(messages[4]).toBe(
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
      newDebugSDK(testConfig);
      const messages = debugMessages();
      expect(messages[0]).toBe(
        '@honeycombio/opentelemetry-web: 🐝 Honeycomb Web SDK Debug Mode Enabled 🐝',
      );
      expect(messages[1]).toBe(
        `@honeycombio/opentelemetry-web: API Key configured for traces: '${testConfig.apiKey}'`,
      );
      expect(messages[2]).toBe(
        `@honeycombio/opentelemetry-web: Service Name configured for traces: '${testConfig.serviceName}'`,
      );
      expect(messages[3]).toBe(
        `@honeycombio/opentelemetry-web: Endpoint configured for traces: 'https://api.honeycomb.io/v1/traces'`,
      );
      expect(messages[4]).toBe(
        `@honeycombio/opentelemetry-web: Sample Rate configured for traces: '${testConfig.sampleRate}'`,
      );
    });
  });
});
