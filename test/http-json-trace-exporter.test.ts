import {
  DATASET_HEADER_KEY,
  TEAM_HEADER_KEY,
  configureHoneycombHttpJsonTraceExporter,
} from '../src/http-json-trace-exporter';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DEFAULT_API_ENDPOINT } from '../src/util';

const dataset = 'my-dataset';
const apikey = '0000000000000000000000'; // 22 chars
const classicApikey = '00000000000000000000000000000000'; // 32 chars

test('it should return an OTLPTraceExporter', () => {
  const traceExporter = configureHoneycombHttpJsonTraceExporter();
  expect(traceExporter).toBeInstanceOf(OTLPTraceExporter);
});

describe('with a regular apikey', () => {
  test('it should set the team and not the dataset headers', () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      apiKey: apikey,
      dataset: dataset,
    });
    expect(traceExporter.url).toBe(DEFAULT_API_ENDPOINT + '/v1/traces');
    expect(traceExporter.headers[TEAM_HEADER_KEY]).toBe(apikey);
    expect(traceExporter.headers[DATASET_HEADER_KEY]).toBeUndefined();
  });
});

describe('with a classic apikey', () => {
  test('it should set the team and dataset headers', () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      apiKey: classicApikey,
      dataset: dataset,
    });
    expect(traceExporter.url).toBe(DEFAULT_API_ENDPOINT + '/v1/traces');
    expect(traceExporter.headers[TEAM_HEADER_KEY]).toBe(classicApikey);
    expect(traceExporter.headers[DATASET_HEADER_KEY]).toBe(dataset);
  });
});
