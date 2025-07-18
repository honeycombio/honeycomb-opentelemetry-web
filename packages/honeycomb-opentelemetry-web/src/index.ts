/**
 * Main entry point for the Honeycomb OpenTelemetry Web SDK.
 *
 * We use explicit named exports instead of wildcard exports (export * from './module')
 * for better:
 * - Tree-shaking: Bundlers can more easily determine which exports are actually used
 * - IDE support: Better autocomplete and IntelliSense for consumers
 * - Documentation: Clear visibility of what's being exported from this package
 * - Bundle analysis: Easier to track which exports contribute to bundle size
 */

export { WebSDK } from './base-otel-sdk';
export { HoneycombWebSDK } from './honeycomb-otel-sdk';
export {
  WebVitalsInstrumentation,
  WebVitalsInstrumentationConfig,
} from './web-vitals-autoinstrumentation';
export {
  GlobalErrorsInstrumentation,
  recordException,
} from './global-errors-autoinstrumentation';
export { BaggageSpanProcessor } from './baggage-span-processor';
export type {
  WebSDKConfiguration,
  HoneycombOptions,
  EntryPageConfig,
} from './types';
export {
  // Browser Attributes
  ATTR_BROWSER_HEIGHT,
  ATTR_BROWSER_NAME,
  ATTR_BROWSER_TOUCH_SCREEN_ENABLED,
  ATTR_BROWSER_VERSION,
  ATTR_BROWSER_WIDTH,

  // Device Attributes
  ATTR_DEVICE_TYPE,

  // Network Attributes
  ATTR_NETWORK_EFFECTIVE_TYPE,

  // Screen Attributes
  ATTR_SCREEN_HEIGHT,
  ATTR_SCREEN_SIZE,
  ATTR_SCREEN_WIDTH,

  // Page Attributes
  ATTR_PAGE_HASH,
  ATTR_PAGE_HOSTNAME,
  ATTR_PAGE_ROUTE,
  ATTR_PAGE_SEARCH,
  ATTR_PAGE_URL,

  // URL Attributes
  ATTR_URL_PATH,

  // Entry Page Attributes
  ATTR_ENTRY_PAGE_HASH,
  ATTR_ENTRY_PAGE_HOSTNAME,
  ATTR_ENTRY_PAGE_PATH,
  ATTR_ENTRY_PAGE_REFERRER,
  ATTR_ENTRY_PAGE_SEARCH,
  ATTR_ENTRY_PAGE_URL,

  // Honeycomb Distro Attributes
  ATTR_HONEYCOMB_DISTRO_RUNTIME_VERSION,
  ATTR_HONEYCOMB_DISTRO_VERSION,

  // CLS (Cumulative Layout Shift) Attributes
  ATTR_CLS_DELTA,
  ATTR_CLS_ELEMENT,
  ATTR_CLS_HAD_RECENT_INPUT,
  ATTR_CLS_ID,
  ATTR_CLS_LARGEST_SHIFT_TARGET,
  ATTR_CLS_LARGEST_SHIFT_TIME,
  ATTR_CLS_LARGEST_SHIFT_VALUE,
  ATTR_CLS_LOAD_STATE,
  ATTR_CLS_NAVIGATION_TYPE,
  ATTR_CLS_RATING,
  ATTR_CLS_VALUE,

  // LCP (Largest Contentful Paint) Attributes
  ATTR_LCP_DELTA,
  ATTR_LCP_ELEMENT,
  ATTR_LCP_ELEMENT_RENDER_DELAY,
  ATTR_LCP_ID,
  ATTR_LCP_NAVIGATION_TYPE,
  ATTR_LCP_RATING,
  ATTR_LCP_RESOURCE_LOAD_DELAY,
  ATTR_LCP_RESOURCE_LOAD_DURATION,
  ATTR_LCP_RESOURCE_LOAD_TIME,
  ATTR_LCP_TIME_TO_FIRST_BYTE,
  ATTR_LCP_URL,
  ATTR_LCP_VALUE,

  // INP (Interaction to Next Paint) Attributes
  ATTR_INP_DELTA,
  ATTR_INP_DURATION,
  ATTR_INP_ELEMENT,
  ATTR_INP_EVENT_TYPE,
  ATTR_INP_ID,
  ATTR_INP_INPUT_DELAY,
  ATTR_INP_INTERACTION_TARGET,
  ATTR_INP_INTERACTION_TIME,
  ATTR_INP_INTERACTION_TYPE,
  ATTR_INP_LOAD_STATE,
  ATTR_INP_NAVIGATION_TYPE,
  ATTR_INP_NEXT_PAINT_TIME,
  ATTR_INP_PRESENTATION_DELAY,
  ATTR_INP_PROCESSING_DURATION,
  ATTR_INP_RATING,
  ATTR_INP_VALUE,

  // INP Script Timing Attributes
  ATTR_INP_SCRIPT_DURATION,
  ATTR_INP_SCRIPT_ENTRY_TYPE,
  ATTR_INP_SCRIPT_EXECUTION_START,
  ATTR_INP_SCRIPT_FORCED_STYLE_AND_LAYOUT_DURATION,
  ATTR_INP_SCRIPT_INVOKER,
  ATTR_INP_SCRIPT_PAUSE_DURATION,
  ATTR_INP_SCRIPT_SOURCE_CHAR_POSITION,
  ATTR_INP_SCRIPT_SOURCE_FUNCTION_NAME,
  ATTR_INP_SCRIPT_SOURCE_URL,
  ATTR_INP_SCRIPT_START_TIME,
  ATTR_INP_SCRIPT_WINDOW_ATTRIBUTION,

  // INP Long Animation Frame Timing Attributes
  ATTR_INP_TIMING_DURATION,
  ATTR_INP_TIMING_ENTRY_TYPE,
  ATTR_INP_TIMING_NAME,
  ATTR_INP_TIMING_RENDER_START,
  ATTR_INP_TIMING_START_TIME,

  // FCP (First Contentful Paint) Attributes
  ATTR_FCP_DELTA,
  ATTR_FCP_ID,
  ATTR_FCP_LOAD_STATE,
  ATTR_FCP_NAVIGATION_TYPE,
  ATTR_FCP_RATING,
  ATTR_FCP_TIME_SINCE_FIRST_BYTE,
  ATTR_FCP_TIME_TO_FIRST_BYTE,
  ATTR_FCP_VALUE,

  // TTFB (Time to First Byte) Attributes
  ATTR_TTFB_CACHE_DURATION,
  ATTR_TTFB_CONNECTION_DURATION,
  ATTR_TTFB_CONNECTION_TIME,
  ATTR_TTFB_DELTA,
  ATTR_TTFB_DNS_DURATION,
  ATTR_TTFB_DNS_TIME,
  ATTR_TTFB_ID,
  ATTR_TTFB_NAVIGATION_TYPE,
  ATTR_TTFB_RATING,
  ATTR_TTFB_REQUEST_DURATION,
  ATTR_TTFB_REQUEST_TIME,
  ATTR_TTFB_VALUE,
  ATTR_TTFB_WAITING_DURATION,
  ATTR_TTFB_WAITING_TIME,
} from './semantic-attributes';
