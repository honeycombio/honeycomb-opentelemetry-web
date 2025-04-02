import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';

import { HoneycombOptions } from './types';
import { configureHoneycombHttpJsonTraceExporter } from './http-json-trace-exporter';
import { configureConsoleTraceLinkExporter } from './console-trace-link-exporter';

export const configureTraceExporters = (
  options?: HoneycombOptions,
): SpanExporter => {
  const honeycombTraceExporters = [];

  if (options?.localVisualizations) {
    honeycombTraceExporters.push(configureConsoleTraceLinkExporter(options));
  }

  // if there is a user-provided exporter, add to the composite exporter
  if (options?.traceExporter) {
    honeycombTraceExporters.push(options?.traceExporter);
  }

  // if there is an array of user-provided exporters, add them to the composite exporter
  // This will override the default honeycomb trace exporter.
  if (options?.traceExporters) {
    honeycombTraceExporters.push(...options.traceExporters);
  }

  // Disable this if a configuration option is present
  if (options?.disableDefaultTraceExporter !== true) {
    honeycombTraceExporters.unshift(
      configureHoneycombHttpJsonTraceExporter(options),
    );
  }

  return configureCompositeExporter([...honeycombTraceExporters]);
};

/**
 * Builds and returns a new {@link SpanExporter} that wraps the provided array
 * of {@link SpanExporter}s
 *
 * @param exporters the exporters to wrap with the composite exporter
 * @returns the configured {@link SpanExporter} instance
 */
export function configureCompositeExporter(
  exporters: SpanExporter[],
): SpanExporter {
  return new CompositeSpanExporter(exporters);
}

/**
 * A custom SpanExporter that wraps a number of other exporters and calls export and shutdown
 * for each.
 */
class CompositeSpanExporter implements SpanExporter {
  private _exporters: SpanExporter[];

  constructor(exporters: SpanExporter[]) {
    this._exporters = exporters;
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    this._exporters.forEach((exporter) =>
      exporter.export(spans, resultCallback),
    );
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  async shutdown(): Promise<void> {
    const results: Promise<void>[] = [];
    this._exporters.forEach((exporter) => results.push(exporter.shutdown()));
    await Promise.all(results);
  }
}
