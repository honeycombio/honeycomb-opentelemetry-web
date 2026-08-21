import { HoneycombOptions } from './types';
import { LogRecordProcessor } from '@opentelemetry/sdk-logs';
import {
  createSessionLogRecordProcessor,
  SessionProvider,
} from '@opentelemetry/web-common';
import { defaultSessionProvider } from './default-session-provider';

/**
 * Builds and returns an array of Log Record Processors that attaches the
 * session id to every log record, followed by any user provided Log Record
 * Processors.
 *
 * These run ahead of the exporting processors, so the session id is set before
 * a record is queued for export.
 *
 * @param options The {@link HoneycombOptions}
 * @param sessionProvider the session provider the SDK resolved for this instance
 * @returns {@link LogRecordProcessor[]}
 */
export const configureLogRecordProcessors = (
  options?: HoneycombOptions,
  sessionProvider: SessionProvider = options?.sessionProvider ||
    defaultSessionProvider,
): LogRecordProcessor[] => {
  return [
    createSessionLogRecordProcessor(sessionProvider),
    ...(options?.logRecordProcessors || []),
  ];
};
