import { DiagLogLevel } from '@opentelemetry/api';
import { HoneycombOptions } from './types';
import {
  createHoneycombSDKLogMessage,
  defaultOptions,
  isClassic,
} from './util';

export const MISSING_API_KEY_ERROR = createHoneycombSDKLogMessage(
  '❌ Missing API Key. Set `apiKey` in HoneycombOptions. Telemetry will not be exported.',
);
export const MISSING_SERVICE_NAME_ERROR = createHoneycombSDKLogMessage(
  `❌ Missing Service Name. Set \`serviceName\` in HoneycombOptions. Defaulting to '${defaultOptions.serviceName}'`,
);
export const IGNORED_DATASET_ERROR = createHoneycombSDKLogMessage(
  '🔕 Dataset is ignored in favor of service name.',
);
export const MISSING_DATASET_ERROR = createHoneycombSDKLogMessage(
  '❌ Missing dataset. Specify either HONEYCOMB_DATASET environment variable or dataset in the options parameter.',
);
export const SKIPPING_OPTIONS_VALIDATION_MSG = createHoneycombSDKLogMessage(
  '⏭️ Skipping options validation. To re-enable, set skipOptionsValidation option or HONEYCOMB_SKIP_OPTIONS_VALIDATION to false.',
);
export const CUSTOM_COLLECTOR_VALIDATION_MSG = createHoneycombSDKLogMessage(
  '⏭️ Skipping options validation, because a custom collector is being used.',
);
export const SAMPLER_OVERRIDE_WARNING = createHoneycombSDKLogMessage(
  '🔨 Default deterministic sampler has been overridden. Honeycomb requires a resource attribute called SampleRate to properly show weighted values. Non-deterministic sampleRate could lead to missing spans in Honeycomb. See our docs for more details. https://docs.honeycomb.io/getting-data-in/opentelemetry/node-distro/#sampling-without-the-honeycomb-sdk',
);
export const MISSING_FIELDS_FOR_LOCAL_VISUALIZATIONS =
  createHoneycombSDKLogMessage(
    '🔕 Disabling local visualizations - must have both service name and API key configured.',
  );
export const MISSING_FIELDS_FOR_GENERATING_LINKS = createHoneycombSDKLogMessage(
  '🔕 Disabling local visualizations - cannot infer auth and ui url roots from endpoint url.',
);
export const FAILED_AUTH_FOR_LOCAL_VISUALIZATIONS =
  createHoneycombSDKLogMessage(
    '🔕 Failed to get proper auth response from Honeycomb. No local visualization available.',
  );
export const NO_EXPORTERS_DISABLED_DEFAULT = createHoneycombSDKLogMessage(
  '🔕 Default honeycomb exporter disabled but no exporters provided',
);

/**
 * Returns true iff the endpoint is *not* a Honeycomb endpoint, such as api.honeycomb.io or
 * api.eu1.honeycomb.io.
 */
const isCustomCollector = (endpoint: string) => {
  try {
    const url = new URL(endpoint);
    return !url.hostname.endsWith('.honeycomb.io');
  } catch {
    // If URL.parse fails, assume this isn't a custom collector,
    // so that normal options validation happens.
    return false;
  }
};

export const validateOptionsWarnings = (options?: HoneycombOptions) => {
  const logLevel: DiagLogLevel = options?.logLevel
    ? options.logLevel
    : DiagLogLevel.DEBUG;

  if (options?.skipOptionsValidation) {
    if (logLevel >= DiagLogLevel.DEBUG) {
      console.debug(SKIPPING_OPTIONS_VALIDATION_MSG);
    }
    return;
  }

  const endpoint = options?.tracesEndpoint ?? options?.endpoint;
  if (endpoint && isCustomCollector(endpoint)) {
    if (logLevel >= DiagLogLevel.DEBUG) {
      console.debug(CUSTOM_COLLECTOR_VALIDATION_MSG);
    }
    return;
  }

  // warn if api key is missing
  if (!options?.apiKey && logLevel >= DiagLogLevel.WARN) {
    console.warn(MISSING_API_KEY_ERROR);
  }

  // warn if service name is missing
  if (!options?.serviceName && logLevel >= DiagLogLevel.WARN) {
    console.warn(MISSING_SERVICE_NAME_ERROR);
  }

  // warn if dataset is set while using an environment-aware key
  if (
    options?.apiKey &&
    !isClassic(options?.apiKey) &&
    options?.dataset &&
    logLevel >= DiagLogLevel.WARN
  ) {
    console.warn(IGNORED_DATASET_ERROR);
  }

  // warn if dataset is missing if using classic key
  if (
    options?.apiKey &&
    isClassic(options?.apiKey) &&
    !options?.dataset &&
    logLevel >= DiagLogLevel.WARN
  ) {
    console.warn(MISSING_DATASET_ERROR);
  }

  // warn if custom sampler provided
  if (options?.sampler && logLevel >= DiagLogLevel.DEBUG) {
    console.debug(SAMPLER_OVERRIDE_WARNING);
  }

  // warn if no exporter will be set
  if (
    options?.disableDefaultTraceExporter === true &&
    !options?.traceExporter &&
    !options?.traceExporters?.length
  ) {
    console.warn(NO_EXPORTERS_DISABLED_DEFAULT);
  }

  return options;
};
