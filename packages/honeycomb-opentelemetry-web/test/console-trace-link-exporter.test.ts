import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  buildTraceUrl,
  configureConsoleTraceLinkExporter,
  getUrlRoots,
} from '../src/console-trace-link-exporter';

const apikey = '000000000000000000000000';
const classicApikey = '00000000000000000000000000000000';

describe('buildTraceUrl', () => {
  it('builds environment trace URL', () => {
    const url = buildTraceUrl(
      apikey,
      'my-service',
      'my-team',
      'my-environment',
      'https://ui.honeycomb.io',
    );
    expect(url).toBe(
      'https://ui.honeycomb.io/my-team/environments/my-environment/datasets/my-service/trace?trace_id',
    );
  });

  it('builds classic trace URL', () => {
    const url = buildTraceUrl(
      classicApikey,
      'my-service',
      'my-team',
      'my-environment',
      'https://ui.honeycomb.io',
    );
    expect(url).toBe(
      'https://ui.honeycomb.io/my-team/datasets/my-service/trace?trace_id',
    );
  });
});

describe('ConsoleTraceLinkExporter', () => {
  let originalFetch: typeof global.fetch;
  let consoleLogSpy: jest.SpyInstance;

  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn();

    consoleLogSpy = jest.spyOn(console, 'log');
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('makes request and logs the trace url', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          team: { slug: 'test-team' },
          environment: { slug: 'test-env' },
        }),
    });

    const exporter = configureConsoleTraceLinkExporter({
      apiKey: apikey,
      serviceName: 'test-service',
      endpoint: 'https://api.honeycomb.io/v1/traces',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.honeycomb.io/1/auth',
      {
        headers: {
          'x-honeycomb-team': apikey,
        },
      },
    );

    // @ts-expect-error we only include the properties we need
    const fakeSpan: ReadableSpan = {
      spanContext: () => ({
        traceId: '1234',
        spanId: '1234',
        traceFlags: 0,
      }),
    };

    // wait for promises to resolve
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick);

    // all of the fetch() promises have to resolve before we can export
    exporter.export([fakeSpan], () => {});

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '@honeycombio/opentelemetry-web: Honeycomb link: https://ui.honeycomb.io/test-team/environments/test-env/datasets/test-service/trace?trace_id=1234',
    );
  });

  it('makes request and handles successful requests that return errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const exporter = configureConsoleTraceLinkExporter({
      apiKey: apikey,
      serviceName: 'test-service',
      endpoint: 'https://api.honeycomb.io/v1/traces',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.honeycomb.io/1/auth',
      {
        headers: {
          'x-honeycomb-team': apikey,
        },
      },
    );

    // @ts-expect-error we only include the properties we need
    const fakeSpan: ReadableSpan = {
      spanContext: () => ({
        traceId: '1234',
        spanId: '1234',
        traceFlags: 0,
      }),
    };

    // wait for promises to resolve
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick);

    // all of the fetch() promises have to resolve before we can export
    exporter.export([fakeSpan], () => {});

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '@honeycombio/opentelemetry-web: 🔕 Failed to get proper auth response from Honeycomb. No local visualization available.',
    );
  });

  it('makes request and handles failed requests', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce({});

    const exporter = configureConsoleTraceLinkExporter({
      apiKey: apikey,
      serviceName: 'test-service',
      endpoint: 'https://api.honeycomb.io/v1/traces',
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.honeycomb.io/1/auth',
      {
        headers: {
          'x-honeycomb-team': apikey,
        },
      },
    );

    // @ts-expect-error we only include the properties we need
    const fakeSpan: ReadableSpan = {
      spanContext: () => ({
        traceId: '1234',
        spanId: '1234',
        traceFlags: 0,
      }),
    };

    // wait for promises to resolve
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick);

    // all of the fetch() promises have to resolve before we can export
    exporter.export([fakeSpan], () => {});

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '@honeycombio/opentelemetry-web: 🔕 Failed to get proper auth response from Honeycomb. No local visualization available.',
    );
  });
});

describe('getUrlRoots', () => {
  it('it should generate correct auth and ui url roots for domains (api.)', () => {
    const endpoint = 'https://api.honeycomb.io/v1/traces';
    const { authRoot, uiRoot } = getUrlRoots(endpoint);
    expect(authRoot).toEqual('https://api.honeycomb.io/1/auth');
    expect(uiRoot).toEqual('https://ui.honeycomb.io');
  });
  it('it should generate correct auth and ui url roots for dash-separated domains domains (api-other_env.)', () => {
    const endpoint = 'https://api-other_env.honeycomb.io/v1/traces';
    const { authRoot, uiRoot } = getUrlRoots(endpoint);
    expect(authRoot).toEqual('https://api-other_env.honeycomb.io/1/auth');
    expect(uiRoot).toEqual('https://ui-other_env.honeycomb.io');
  });
  it('it should generate correct auth and ui url roots for dot-separated domains (api.other_region)', () => {
    const endpoint = 'https://api.other_region.honeycomb.io/v1/traces';
    const { authRoot, uiRoot } = getUrlRoots(endpoint);
    expect(authRoot).toEqual('https://api.other_region.honeycomb.io/1/auth');
    expect(uiRoot).toEqual('https://ui.other_region.honeycomb.io');
  });
  it('it should generate correct auth and ui url roots for dot-dash-separated domains (api.other_env-other_region.)', () => {
    const endpoint =
      'https://api.other_env-other_region.honeycomb.io/v1/traces';
    const { authRoot, uiRoot } = getUrlRoots(endpoint);
    expect(authRoot).toEqual(
      'https://api.other_env-other_region.honeycomb.io/1/auth',
    );
    expect(uiRoot).toEqual('https://ui.other_env-other_region.honeycomb.io');
  });
});
