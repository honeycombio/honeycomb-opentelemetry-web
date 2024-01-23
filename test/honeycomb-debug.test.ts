import { HoneycombWebSDK } from '../src/honeycomb-otel-sdk';

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
  it('should log the debug information to the console', () => {
    new HoneycombWebSDK({
      debug: true,
    });
    const expectedConfig = JSON.stringify(
      {
        debug: true,
        apiKey: 'MISSING',
        serviceName: 'MISSING',
        endpoint: 'https://api.honeycomb.io/v1/traces',
        tracesEndpoint: 'https://api.honeycomb.io/v1/traces',
      },
      null,
      2,
    );
    expect(consoleSpy.mock.calls[1][0]).toContain(
      'Honeycomb Web SDK Debug Mode Enabled',
    );
    expect(consoleSpy.mock.calls[2][0]).toContain(expectedConfig);
  });
  it('should log the provided options configuration to the console', () => {
    new HoneycombWebSDK({
      debug: true,
      endpoint: 'http://shenanigans:1234',
      apiKey: 'my-key',
      serviceName: 'my-service',
    });
    const expectedConfig = JSON.stringify(
      {
        debug: true,
        endpoint: 'http://shenanigans:1234',
        apiKey: 'my-key',
        serviceName: 'my-service',
        tracesEndpoint: 'http://shenanigans:1234/v1/traces',
      },
      null,
      2,
    );
    expect(consoleSpy.mock.calls[1][0]).toContain(
      'Honeycomb Web SDK Debug Mode Enabled',
    );
    expect(consoleSpy.mock.calls[2][0]).toContain(expectedConfig);
  });
});
