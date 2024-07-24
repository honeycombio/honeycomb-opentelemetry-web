import {
  configureHoneycombHttpJsonTraceExporter,
  DATASET_HEADER_KEY,
  TEAM_HEADER_KEY,
} from '../src/http-json-trace-exporter';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { DEFAULT_API_ENDPOINT } from '../src/util';

const dataset = 'my-dataset';
const apikey = '0000000000000000000000'; // 22 chars
const classicApikey = '00000000000000000000000000000000'; // 32 chars

describe('HTTP JSON Trace Exporter Tests', () => {
  test('it should return an OTLPTraceExporter', () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter();
    expect(traceExporter).toBeInstanceOf(OTLPTraceExporter);
  });

  test('it should set the team and not the dataset headers for a regular api key', () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      apiKey: apikey,
      dataset: dataset,
    });
    expect(traceExporter.url).toBe(DEFAULT_API_ENDPOINT + '/v1/traces');
    expect(traceExporter.headers[TEAM_HEADER_KEY]).toBe(apikey);
    expect(traceExporter.headers[DATASET_HEADER_KEY]).toBeUndefined();
  });

  test('it should set the team and dataset headers for a classic api key', () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      apiKey: classicApikey,
      dataset: dataset,
    });
    expect(traceExporter.url).toBe(DEFAULT_API_ENDPOINT + '/v1/traces');
    expect(traceExporter.headers[TEAM_HEADER_KEY]).toBe(classicApikey);
    expect(traceExporter.headers[DATASET_HEADER_KEY]).toBe(dataset);
  });

  test('it adds custom headers', () => {
    const traceExporter = configureHoneycombHttpJsonTraceExporter({
      headers: {
        'x-test-header': 'my-cool-header',
      },
    });
    expect(traceExporter.headers['x-test-header']).toBe('my-cool-header');
  });
});
