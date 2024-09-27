import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import {
  configureHoneycombHttpJsonTraceExporter,
  DATASET_HEADER_KEY,
  TEAM_HEADER_KEY,
} from '../src/http-json-trace-exporter';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { hrTime, hrTimeDuration } from '@opentelemetry/core';
import { IResource } from '@opentelemetry/resources';

import { DEFAULT_API_ENDPOINT } from '../src/util';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const dataset = 'my-dataset';
const apikey = '0000000000000000000000'; // 22 chars
const classicApikey = '00000000000000000000000000000000'; // 32 chars

let req: Request | null = null;
const server = setupServer(
  http.post(`${DEFAULT_API_ENDPOINT}/v1/traces`, ({ request }) => {
    req = request;
    return HttpResponse.json({
      ok: true,
    });
  }),
);

const fakeSpan: ReadableSpan = {
  name: 'test span',
  kind: SpanKind.INTERNAL,
  status: { code: SpanStatusCode.OK },
  attributes: {},
  links: [],
  events: [],
  ended: true,
  startTime: hrTime(0),
  endTime: hrTime(1),
  duration: hrTimeDuration(hrTime(0), hrTime(1)),
  resource: {
    attributes: {},
    merge: (x: IResource) => x,
  },
  instrumentationLibrary: {
    name: 'test',
    version: '0.0.0',
  },
  droppedAttributesCount: 0,
  droppedEventsCount: 0,
  droppedLinksCount: 0,
  spanContext: () => ({
    traceId: '1234',
    spanId: '1234',
    traceFlags: 0,
  }),
};

describe('HTTP JSON Trace Exporter Tests', () => {
  beforeAll(() => {
    server.listen({
      onUnhandledRequest: 'error',
    });
  });
  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    server.resetHandlers();
    req = null;
  });

  test('it should return an OTLPTraceExporter', () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter();
    expect(traceExporter).toBeInstanceOf(OTLPTraceExporter);
  });

  test('it should set the team and not the dataset headers for a regular api key', async () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      apiKey: apikey,
      dataset: dataset,
    });

    await new Promise((resolve) => {
      traceExporter.send(
        [fakeSpan],
        () => {
          console.log('success');
          resolve(null);
        },
        () => {},
      );
    });

    expect(req).not.toBeNull();
    // req is non null here, since the assertion above passed
    const request = req!;

    expect(request.url).toBe(DEFAULT_API_ENDPOINT + '/v1/traces');
    expect(request.headers.get(TEAM_HEADER_KEY)).toBe(apikey);
    expect(request.headers.get(DATASET_HEADER_KEY)).toBeNull();
  });

  test('it should set the team and dataset headers for a classic api key', async () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      apiKey: classicApikey,
      dataset: dataset,
    });

    await new Promise((resolve) => {
      traceExporter.send(
        [fakeSpan],
        () => {
          console.log('success');
          resolve(null);
        },
        () => {},
      );
    });

    expect(req).not.toBeNull();
    // req is non null here, since the assertion above passed
    const request = req!;

    expect(request.url).toBe(DEFAULT_API_ENDPOINT + '/v1/traces');
    expect(request.headers.get(TEAM_HEADER_KEY)).toBe(classicApikey);
    expect(request.headers.get(DATASET_HEADER_KEY)).toBe(dataset);
  });

  test('it adds custom headers', async () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      headers: {
        'x-test-header': 'my-cool-header',
      },
    });

    await new Promise((resolve) => {
      traceExporter.send(
        [fakeSpan],
        () => {
          console.log('success');
          resolve(null);
        },
        () => {},
      );
    });

    expect(req).not.toBeNull();
    // req is non null here, since the assertion above passed
    const request = req!;

    expect(request.headers.get('x-test-header')).toBe('my-cool-header');
  });
});
