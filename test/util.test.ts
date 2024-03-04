import {
  getSampleRate,
  getTracesApiKey,
  getTracesEndpoint,
  isClassic,
  maybeAppendTracesPath,
} from '../src/util';


describe('isClassic', () => {
  it.each([
    {
      testString: "hcxik_01hqk4k20cjeh63wca8vva5stw70nft6m5n8wr8f5mjx3762s8269j50wc",
      name: "full ingest key string, non classic",
      expected: false
    },
    {
      testString: "hcxik_01hqk4k20cjeh63wca8vva5stw",
      name: "ingest key id, non classic",
      expected: false
    },
    {
      testString: "hcaic_1234567890123456789012345678901234567890123456789012345678",
      name: "full ingest key string, classic",
      expected: true
    },
    {
      testString: "hcaic_12345678901234567890123456",
      name: "ingest key id, classic",
      expected: false
    },
    {
      testString: "kgvSpPwegJshQkuowXReLD",
      name: "v2 configuration key",
      expected: false
    },
    {
      testString: "12345678901234567890123456789012",
      name: "classic key",
      expected: true
    },
    {
      testString: undefined,
      name: "undefined",
      expected: false
    }

  ])("test case $name", (testCase) => {
    expect(isClassic(testCase.testString)).toEqual(testCase.expected);
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

  it('should use 0 sample rate if provided with 0', () => {
    const options = {
      sampleRate: 0,
    };
    expect(getSampleRate(options)).toBe(0);
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
