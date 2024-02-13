import {
  getSampleRate,
  getTracesApiKey,
  getTracesEndpoint,
  isClassic,
  maybeAppendTracesPath,
} from '../src/util';

// classic keys are 32 chars long
const classicApiKey = 'this is a string that is 32 char';
// non-classic keys are 22 chars log
const apiKey = 'an api key for 22 char';

describe('isClassic', () => {
  it('should return true for a classic key', () => {
    expect(isClassic(classicApiKey)).toBe(true);
  });

  it('should return false for a non-classic key', () => {
    expect(isClassic(apiKey)).toBe(false);
  });

  it('should return false for an undefined key', () => {
    expect(isClassic(undefined)).toBe(false);
  });
});

describe('maybeAppendTracesPath', () => {
  it('appends the path if the url does not end with /v1/traces', () => {
    const endpoint = maybeAppendTracesPath('https://api.honeycomb.io');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/traces');
  });

  it('does not double up forward slash if endpoint ends with one', () => {
    const endpoint = maybeAppendTracesPath('https://api.honeycomb.io/');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/traces');
  });

  it('does not append the traces path if the url ends with /v1/traces', () => {
    const endpoint = maybeAppendTracesPath(
      'https://api.honeycomb.io/v1/traces',
    );
    expect(endpoint).toBe('https://api.honeycomb.io/v1/traces');
  });

  it('does not append the traces path if the url ends with /v1/traces/', () => {
    const endpoint = maybeAppendTracesPath(
      'https://api.honeycomb.io/v1/traces/',
    );
    expect(endpoint).toBe('https://api.honeycomb.io/v1/traces/');
  });
});

describe('traces endpoint', () => {
  it('defaults to endpoint with v1/traces path', () => {
    const options = {
      endpoint: 'my-custom-endpoint',
    };
    expect(getTracesEndpoint(options)).toBe('my-custom-endpoint/v1/traces');
  });

  it('uses provided as is (without /v1/traces) option if set', () => {
    const options = {
      tracesEndpoint: 'my-custom-endpoint',
    };
    expect(getTracesEndpoint(options)).toBe('my-custom-endpoint');
  });

  it('prefers tracesEndpoint over endpoint', () => {
    const options = {
      tracesEndpoint: 'my-custom-traces-endpoint',
      endpoint: 'my-custom-endpoint',
    };
    expect(getTracesEndpoint(options)).toBe('my-custom-traces-endpoint');
  });
});

describe('traces api key', () => {
  test('uses apiKey if no tracesApiKey is provided', () => {
    const options = {
      apiKey: 'basic-api-key',
    };

    expect(getTracesApiKey(options)).toBe('basic-api-key');
  });

  test('uses tracesApiKey over apiKey', () => {
    const options = {
      apiKey: 'basic-api-key',
      tracesApiKey: 'traces-api-key',
    };

    expect(getTracesApiKey(options)).toBe('traces-api-key');
  });

  test('uses tracesApiKey if no apiKey is provided', () => {
    const options = {
      tracesApiKey: 'traces-api-key',
    };

    expect(getTracesApiKey(options)).toBe('traces-api-key');
  });
});

describe('sample rate', () => {
  it('should default to 1', () => {
    const options = {};
    expect(getSampleRate(options)).toBe(1);
  });

  it('should use provided sample rate if valid', () => {
    const options = {
      sampleRate: 2,
    };
    expect(getSampleRate(options)).toBe(2);
  });

  it('should use default sample rate if provided with 0', () => {
    const options = {
      sampleRate: 0,
    };
    expect(getSampleRate(options)).toBe(1);
  });

  it('should use default sample rate if provided with negative', () => {
    const options = {
      sampleRate: -42,
    };
    expect(getSampleRate(options)).toBe(1);
  });

  it('should use default sample rate if provided with float', () => {
    const options = {
      sampleRate: 3.14,
    };
    expect(getSampleRate(options)).toBe(1);
  });
});
