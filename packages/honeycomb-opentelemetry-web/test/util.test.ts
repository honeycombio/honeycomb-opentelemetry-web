import {
  getLogsApiKey,
  getLogsEndpoint,
  getMetricsApiKey,
  getMetricsEndpoint,
  getSampleRate,
  getTracesApiKey,
  getTracesEndpoint,
  isClassic,
  LOGS_PATH,
  maybeAppendPath,
  METRICS_PATH,
  TRACES_PATH,
} from '../src/util';

describe('isClassic', () => {
  it.each([
    {
      testString:
        'hcxik_01hqk4k20cjeh63wca8vva5stw70nft6m5n8wr8f5mjx3762s8269j50wc',
      name: 'full ingest key string, non classic',
      expected: false,
    },
    {
      testString: 'hcxik_01hqk4k20cjeh63wca8vva5stw',
      name: 'ingest key id, non classic',
      expected: false,
    },
    {
      testString:
        'hcaic_1234567890123456789012345678901234567890123456789012345678',
      name: 'full ingest key string, classic',
      expected: true,
    },
    {
      testString: 'hcaic_12345678901234567890123456',
      name: 'ingest key id, classic',
      expected: false,
    },
    {
      testString: 'kgvSpPwegJshQkuowXReLD',
      name: 'v2 configuration key',
      expected: false,
    },
    {
      testString: '12345678901234567890123456789012',
      name: 'classic key',
      expected: true,
    },
    {
      testString: undefined,
      name: 'undefined',
      expected: false,
    },
  ])(
    'test case $name',
    (testCase: { testString?: string; name: string; expected: boolean }) => {
      expect(isClassic(testCase.testString)).toEqual(testCase.expected);
    },
  );
});

// Traces

describe('maybeAppendTracesPath', () => {
  const maybeAppendTracesPath = (path: string) =>
    maybeAppendPath(path, TRACES_PATH);

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

// Metrics

describe('maybeAppendMetricsPath', () => {
  const maybeAppendMetricsPath = (path: string) =>
    maybeAppendPath(path, METRICS_PATH);

  it('appends the path if the url does not end with /v1/traces', () => {
    const endpoint = maybeAppendMetricsPath('https://api.honeycomb.io');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/metrics');
  });

  it('does not double up forward slash if endpoint ends with one', () => {
    const endpoint = maybeAppendMetricsPath('https://api.honeycomb.io/');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/metrics');
  });

  it('does not append the traces path if the url ends with /v1/traces', () => {
    const endpoint = maybeAppendMetricsPath(
      'https://api.honeycomb.io/v1/metrics',
    );
    expect(endpoint).toBe('https://api.honeycomb.io/v1/metrics');
  });

  it('does not append the traces path if the url ends with /v1/metrics/', () => {
    const endpoint = maybeAppendMetricsPath(
      'https://api.honeycomb.io/v1/metrics/',
    );
    expect(endpoint).toBe('https://api.honeycomb.io/v1/metrics/');
  });
});

describe('metrics endpoint', () => {
  it('defaults to endpoint with v1/metrics path', () => {
    const options = {
      endpoint: 'my-custom-endpoint',
    };
    expect(getMetricsEndpoint(options)).toBe('my-custom-endpoint/v1/metrics');
  });

  it('uses provided as is (without /v1/metrics) option if set', () => {
    const options = {
      metricsEndpoint: 'my-custom-endpoint',
    };
    expect(getMetricsEndpoint(options)).toBe('my-custom-endpoint');
  });

  it('prefers metricsEndpoint over endpoint', () => {
    const options = {
      metricsEndpoint: 'my-custom-metrics-endpoint',
      endpoint: 'my-metrics-endpoint',
    };
    expect(getMetricsEndpoint(options)).toBe('my-custom-metrics-endpoint');
  });
});

describe('metrics api key', () => {
  test('uses apiKey if no metricsApiKey is provided', () => {
    const options = {
      apiKey: 'basic-api-key',
    };

    expect(getMetricsApiKey(options)).toBe('basic-api-key');
  });

  test('uses metricsApiKey over apiKey', () => {
    const options = {
      apiKey: 'basic-api-key',
      metricsApiKey: 'metrics-api-key',
    };

    expect(getMetricsApiKey(options)).toBe('metrics-api-key');
  });

  test('uses metricsApiKey if no apiKey is provided', () => {
    const options = {
      metricsApiKey: 'metrics-api-key',
    };

    expect(getMetricsApiKey(options)).toBe('metrics-api-key');
  });
});

// Logs

describe('maybeAppendLogsPath', () => {
  const maybeAppendLogsPath = (path: string) =>
    maybeAppendPath(path, LOGS_PATH);

  it('appends the path if the url does not end with /v1/logs', () => {
    const endpoint = maybeAppendLogsPath('https://api.honeycomb.io');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/logs');
  });

  it('does not double up forward slash if endpoint ends with one', () => {
    const endpoint = maybeAppendLogsPath('https://api.honeycomb.io/');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/logs');
  });

  it('does not append the traces path if the url ends with /v1/traces', () => {
    const endpoint = maybeAppendLogsPath('https://api.honeycomb.io/v1/logs');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/logs');
  });

  it('does not append the traces path if the url ends with /v1/traces/', () => {
    const endpoint = maybeAppendLogsPath('https://api.honeycomb.io/v1/logs/');
    expect(endpoint).toBe('https://api.honeycomb.io/v1/logs/');
  });
});

describe('logs endpoint', () => {
  it('defaults to endpoint with v1/logs path', () => {
    const options = {
      endpoint: 'my-custom-endpoint',
    };
    expect(getLogsEndpoint(options)).toBe('my-custom-endpoint/v1/logs');
  });

  it('uses provided as is (without /v1/logs) option if set', () => {
    const options = {
      logsEndpoint: 'my-custom-endpoint',
    };
    expect(getLogsEndpoint(options)).toBe('my-custom-endpoint');
  });

  it('prefers tracesEndpoint over endpoint', () => {
    const options = {
      logsEndpoint: 'my-custom-logs-endpoint',
      endpoint: 'my-custom-endpoint',
    };
    expect(getLogsEndpoint(options)).toBe('my-custom-logs-endpoint');
  });
});

describe('logs api key', () => {
  test('uses apiKey if no logsApiKey is provided', () => {
    const options = {
      apiKey: 'basic-api-key',
    };

    expect(getLogsApiKey(options)).toBe('basic-api-key');
  });

  test('uses logsApiKey over apiKey', () => {
    const options = {
      apiKey: 'basic-api-key',
      logsApiKey: 'logs-api-key',
    };

    expect(getLogsApiKey(options)).toBe('logs-api-key');
  });

  test('uses logsApiKey if no apiKey is provided', () => {
    const options = {
      logsApiKey: 'logs-api-key',
    };

    expect(getLogsApiKey(options)).toBe('logs-api-key');
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
