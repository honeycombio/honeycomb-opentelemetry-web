import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';

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
