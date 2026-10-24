import { Context } from '@opentelemetry/api';
import { LogRecordProcessor, SdkLogRecord } from '@opentelemetry/sdk-logs';

/**
 * Turns one kind of upstream log record into the telemetry Honeycomb users
 * already query, usually a span.
 */
export interface LogShapeAdapter {
  /** Matches `SdkLogRecord.eventName`, e.g. `browser.web_vital`. */
  readonly eventName: string;
  /**
   * Emit the Honeycomb-shaped telemetry for `record`.
   * Return true to consume the record: it is then not forwarded to the
   * exporting processor, so the same event is not sent twice.
   */
  adapt(record: SdkLogRecord, context?: Context): boolean;
}

/**
 * Sits in front of the exporting log processor. Records an adapter consumes
 * stop here; every other record passes through to `inner` untouched.
 *
 * A LogRecordProcessor cannot drop a record, so the host has to own the
 * processor that exports: that is why `inner` is a constructor argument.
 */
export class ShapeLogRecordProcessor implements LogRecordProcessor {
  private readonly _adapters: Map<string, LogShapeAdapter>;

  constructor(
    private readonly _inner: LogRecordProcessor,
    adapters: LogShapeAdapter[],
  ) {
    this._adapters = new Map(adapters.map((a) => [a.eventName, a]));
  }

  onEmit(record: SdkLogRecord, context?: Context): void {
    const adapter = record.eventName
      ? this._adapters.get(record.eventName)
      : undefined;
    let consumed = false;
    if (adapter) {
      try {
        consumed = adapter.adapt(record, context);
      } catch {
        // A broken adapter must never lose the original upstream record.
        consumed = false;
      }
    }
    if (!consumed) this._inner.onEmit(record, context);
  }

  forceFlush() {
    return this._inner.forceFlush();
  }

  shutdown() {
    return this._inner.shutdown();
  }
}
