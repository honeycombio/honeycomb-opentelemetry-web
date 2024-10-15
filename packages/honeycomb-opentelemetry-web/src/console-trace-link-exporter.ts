import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { HoneycombOptions } from './types';
import {
  createHoneycombSDKLogMessage,
  getTracesApiKey,
  isClassic,
} from './util';
import {
  FAILED_AUTH_FOR_LOCAL_VISUALIZATIONS,
  MISSING_FIELDS_FOR_LOCAL_VISUALIZATIONS,
} from './validate-options';
import { DiagLogLevel } from '@opentelemetry/api';

/**
 * Builds and returns a {@link SpanExporter} that logs Honeycomb URLs for completed traces
 *
 * @remark This is not for production use.
 * @param options The {@link HoneycombOptions} used to configure the exporter
 * @returns the configured {@link ConsoleTraceLinkExporter} instance
 */
export function configureConsoleTraceLinkExporter(
  options?: HoneycombOptions,
): SpanExporter {
  const apiKey = getTracesApiKey(options);
  return new ConsoleTraceLinkExporter(
    options?.serviceName,
    apiKey,
    options?.logLevel,
  );
}

/**
 * A custom {@link SpanExporter} that logs Honeycomb URLs for completed traces.
 *
 * @remark This is not for production use.
 */
class ConsoleTraceLinkExporter implements SpanExporter {
  private _traceUrl = '';
  private _logLevel: DiagLogLevel = DiagLogLevel.DEBUG;

  constructor(serviceName?: string, apikey?: string, logLevel?: DiagLogLevel) {
    if (logLevel) {
      this._logLevel = logLevel;
    }

    if (!serviceName || !apikey) {
      if (this._logLevel >= DiagLogLevel.DEBUG) {
        console.debug(MISSING_FIELDS_FOR_LOCAL_VISUALIZATIONS);
      }
      return;
    }

    const options = {
      headers: {
        'x-honeycomb-team': apikey,
      },
    };
    fetch('https://api.honeycomb.io/1/auth', options)
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        }
        throw new Error();
      })
      .then((data) => {
        const respData: AuthResponse = data;
        if (respData.team?.slug) {
          this._traceUrl = buildTraceUrl(
            apikey,
            serviceName,
            respData.team?.slug,
            respData.environment?.slug,
          );
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        if (this._logLevel >= DiagLogLevel.INFO) {
          console.log(FAILED_AUTH_FOR_LOCAL_VISUALIZATIONS);
        }
      });
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void,
  ): void {
    if (this._traceUrl) {
      spans.forEach((span) => {
        // only log root spans (ones without a parent span)
        if (!span.parentSpanId && this._logLevel >= DiagLogLevel.INFO) {
          console.log(
            createHoneycombSDKLogMessage(
              `Honeycomb link: ${this._traceUrl}=${span.spanContext().traceId}`,
            ),
          );
        }
      });
    }
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

/**
 * Builds and returns a URL that is used to log when a trace is completed in the {@link ConsoleTraceLinkExporter}.
 *
 * @param apikey the Honeycomb API key used to retrieve the Honeycomb team and environment
 * @param serviceName the Honeycomb service name (or classic dataset) where data is stored
 * @param team the Honeycomb team
 * @param environment the Honeycomb environment
 * @returns
 */
export function buildTraceUrl(
  apikey: string,
  serviceName: string,
  team: string,
  environment?: string,
): string {
  let url = `https://ui.honeycomb.io/${team}`;
  if (!isClassic(apikey) && environment) {
    url += `/environments/${environment}`;
  }
  url += `/datasets/${serviceName}/trace?trace_id`;
  return url;
}

interface AuthResponse {
  environment?: EnvironmentResponse;
  team?: TeamResponse;
}

interface EnvironmentResponse {
  slug?: string;
}

interface TeamResponse {
  slug?: string;
}
