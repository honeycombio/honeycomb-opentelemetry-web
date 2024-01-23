import { configureDebug } from '../src/honeycomb-debug';

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
    configureDebug({
      debug: true,
    });
    const expectedConfig = {
      debug: true,
      apiKey: 'MISSING',
      serviceName: 'MISSING',
      endpoint: 'https://api.honeycomb.io',
      tracesEndpoint: 'https://api.honeycomb.io/v1/traces',
    };
    expect(consoleSpy).toHaveBeenCalledWith(
      'Honeycomb Web SDK Debug Mode Enabled',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      JSON.stringify(expectedConfig, null, 2),
    );
  });
  it('should log the provided options configuration to the console', () => {
    configureDebug({
      debug: true,
      endpoint: 'http://shenanigans:1234',
      apiKey: 'my-key',
      serviceName: 'my-service',
    });
    const expectedConfig = {
      debug: true,
      apiKey: 'my-key',
      serviceName: 'my-service',
      endpoint: 'http://shenanigans:1234',
      tracesEndpoint: 'http://shenanigans:1234/v1/traces',
    };
    expect(consoleSpy).toHaveBeenCalledWith(
      'Honeycomb Web SDK Debug Mode Enabled',
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      JSON.stringify(expectedConfig, null, 2),
    );
  });
});
