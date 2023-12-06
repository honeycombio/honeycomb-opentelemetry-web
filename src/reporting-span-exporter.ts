/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  SpanExporter,
  ReadableSpan,
  TimedEvent,
} from '@opentelemetry/sdk-trace-base';
import {
  ExportResult,
  ExportResultCode,
  hrTimeToMicroseconds,
} from '@opentelemetry/core';
import { Attributes, Link, SpanKind, SpanStatusCode } from '@opentelemetry/api';

/**
 * This is implementation of {@link SpanExporter} that prints spans to the
 * console. This class can be used for diagnostic purposes.
 */

type ReportedSpan = {
  traceId: string;
  parentId?: string;
  traceState?: string; //TODO: this might be a number
  name: string;
  id: string;
  kind: SpanKind;
  attributes: Attributes;
  statusCode: SpanStatusCode;
  events: TimedEvent[];
  links: Link[];
};

/* eslint-disable no-console */
export class ReportingSpanExporter implements SpanExporter {
  constructor(
    private params: { sendSpansHere: (span: ReportedSpan) => void },
  ) {}
  /**
   * Export spans.
   * @param spans
   * @param resultCallback
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    return this._sendSpans(spans, resultCallback);
  }

  /**
   * Shutdown the exporter.
   */
  shutdown(): Promise<void> {
    this._sendSpans([]);
    return this.forceFlush();
  }

  /**
   * Exports any pending spans in exporter
   */
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * converts span info into more readable format
   * @param span
   */
  private _exportInfo(span: ReadableSpan) {
    return {
      traceId: span.spanContext().traceId,
      parentId: span.parentSpanId,
      traceState: span.spanContext().traceState?.serialize(),
      name: span.name,
      id: span.spanContext().spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
      links: span.links,
    };
  }

  private _reportInfo(span: ReadableSpan): ReportedSpan {
    return {
      traceId: span.spanContext().traceId,
      parentId: span.parentSpanId,
      traceState: span.spanContext().traceState?.serialize(),
      name: span.name,
      id: span.spanContext().spanId,
      kind: span.kind,
      attributes: span.attributes,
      statusCode: span.status.code,
      events: span.events,
      links: span.links,
    };
  }

  /**
   * Showing spans in console
   * @param spans
   * @param done
   */
  private _sendSpans(
    spans: ReadableSpan[],
    done?: (result: ExportResult) => void,
  ): void {
    for (const span of spans) {
      this.params.sendSpansHere(this._reportInfo(span));
      console.dir(this._exportInfo(span), { depth: 3 });
    }
    if (done) {
      return done({ code: ExportResultCode.SUCCESS });
    }
  }
}
