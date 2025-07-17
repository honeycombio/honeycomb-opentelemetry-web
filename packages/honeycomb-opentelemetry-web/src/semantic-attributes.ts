/**
 * Custom semantic attribute constants for the Honeycomb OpenTelemetry Web SDK.
 * These attributes extend the standard OpenTelemetry semantic conventions with
 * Honeycomb-specific and browser-specific attributes.
 *
 * https://github.com/open-telemetry/semantic-conventions/tree/main/model/browser
 */

// =============================================================================
// Browser Attributes
// =============================================================================

/**
 * The name of the browser.
 * @example "Chrome", "Firefox", "Safari"
 */
export const ATTR_BROWSER_NAME = 'browser.name';

/**
 * The version of the browser.
 * @example "95.0.4638.54"
 */
export const ATTR_BROWSER_VERSION = 'browser.version';

/**
 * Whether the browser has touch screen capabilities.
 * @example true, false
 */
export const ATTR_BROWSER_TOUCH_SCREEN_ENABLED = 'browser.touch_screen_enabled';

/**
 * The current width of the browser viewport in pixels.
 * @example 1024
 */
export const ATTR_BROWSER_WIDTH = 'browser.width';

/**
 * The current height of the browser viewport in pixels.
 * @example 768
 */
export const ATTR_BROWSER_HEIGHT = 'browser.height';

// =============================================================================
// Device Attributes
// =============================================================================

/**
 * The type of device.
 * @example "desktop", "mobile", "tablet"
 */
export const ATTR_DEVICE_TYPE = 'device.type';

// =============================================================================
// Network Attributes
// =============================================================================

/**
 * The effective network connection type.
 * @example "4g", "3g", "2g", "slow-2g", "unknown"
 */
export const ATTR_NETWORK_EFFECTIVE_TYPE = 'network.effectiveType';

// =============================================================================
// Screen Attributes
// =============================================================================

/**
 * The width of the screen in pixels.
 * @example 1920
 */
export const ATTR_SCREEN_WIDTH = 'screen.width';

/**
 * The height of the screen in pixels.
 * @example 1080
 */
export const ATTR_SCREEN_HEIGHT = 'screen.height';

/**
 * The computed screen size category based on width.
 * @example "small", "medium", "large", "unknown"
 */
export const ATTR_SCREEN_SIZE = 'screen.size';

// =============================================================================
// Page Attributes
// =============================================================================

/**
 * The current page URL hash fragment.
 * @example "#section1"
 */
export const ATTR_PAGE_HASH = 'page.hash';

/**
 * The current page full URL.
 * @example "https://example.com/path?query=value#hash"
 */
export const ATTR_PAGE_URL = 'page.url';

/**
 * The current page route/pathname.
 * @example "/products/123"
 */
export const ATTR_PAGE_ROUTE = 'page.route';

/**
 * The current page hostname.
 * @example "example.com"
 */
export const ATTR_PAGE_HOSTNAME = 'page.hostname';

/**
 * The current page search parameters.
 * @example "?query=value&sort=asc"
 */
export const ATTR_PAGE_SEARCH = 'page.search';

// =============================================================================
// URL Attributes
// =============================================================================

/**
 * The current URL path.
 * @example "/products/123"
 */
export const ATTR_URL_PATH = 'url.path';

// =============================================================================
// Entry Page Attributes
// =============================================================================

/**
 * The URL of the entry page (page where the session started).
 * @example "https://example.com/landing?utm_source=google"
 */
export const ATTR_ENTRY_PAGE_URL = 'entry_page.url';

/**
 * The path of the entry page (page where the session started).
 * @example "/landing"
 */
export const ATTR_ENTRY_PAGE_PATH = 'entry_page.path';

/**
 * The search parameters of the entry page.
 * @example "?utm_source=google&utm_medium=cpc"
 */
export const ATTR_ENTRY_PAGE_SEARCH = 'entry_page.search';

/**
 * The hash fragment of the entry page.
 * @example "#welcome"
 */
export const ATTR_ENTRY_PAGE_HASH = 'entry_page.hash';

/**
 * The hostname of the entry page.
 * @example "example.com"
 */
export const ATTR_ENTRY_PAGE_HOSTNAME = 'entry_page.hostname';

/**
 * The referrer URL that led to the entry page.
 * @example "https://google.com/search?q=example"
 */
export const ATTR_ENTRY_PAGE_REFERRER = 'entry_page.referrer';

// =============================================================================
// Honeycomb Distro Attributes
// =============================================================================

/**
 * The version of the Honeycomb distribution.
 * @example "1.2.3"
 */
export const ATTR_HONEYCOMB_DISTRO_VERSION = 'honeycomb.distro.version';

/**
 * The runtime version of the Honeycomb distribution.
 * @example "browser"
 */
export const ATTR_HONEYCOMB_DISTRO_RUNTIME_VERSION =
  'honeycomb.distro.runtime_version';

// =============================================================================
// Web Vitals Attributes
// =============================================================================

// CLS (Cumulative Layout Shift) attributes
/**
 * CLS metric ID.
 * @example "v1-123456789"
 */
export const ATTR_CLS_ID = 'cls.id';

/**
 * CLS metric value.
 * @example 0.123
 */
export const ATTR_CLS_VALUE = 'cls.value';

/**
 * CLS metric delta.
 * @example 0.045
 */
export const ATTR_CLS_DELTA = 'cls.delta';

/**
 * CLS metric rating.
 * @example "good", "needs-improvement", "poor"
 */
export const ATTR_CLS_RATING = 'cls.rating';

/**
 * CLS navigation type.
 * @example "navigate", "reload", "back-forward"
 */
export const ATTR_CLS_NAVIGATION_TYPE = 'cls.navigation_type';

// LCP (Largest Contentful Paint) attributes
/**
 * LCP metric ID.
 * @example "v1-123456789"
 */
export const ATTR_LCP_ID = 'lcp.id';

/**
 * LCP metric value.
 * @example 1234.56
 */
export const ATTR_LCP_VALUE = 'lcp.value';

/**
 * LCP metric delta.
 * @example 123.45
 */
export const ATTR_LCP_DELTA = 'lcp.delta';

/**
 * LCP metric rating.
 * @example "good", "needs-improvement", "poor"
 */
export const ATTR_LCP_RATING = 'lcp.rating';

/**
 * LCP navigation type.
 * @example "navigate", "reload", "back-forward"
 */
export const ATTR_LCP_NAVIGATION_TYPE = 'lcp.navigation_type';

// INP (Interaction to Next Paint) attributes
/**
 * INP metric ID.
 * @example "v1-123456789"
 */
export const ATTR_INP_ID = 'inp.id';

/**
 * INP metric value.
 * @example 89.12
 */
export const ATTR_INP_VALUE = 'inp.value';

/**
 * INP metric delta.
 * @example 23.45
 */
export const ATTR_INP_DELTA = 'inp.delta';

/**
 * INP metric rating.
 * @example "good", "needs-improvement", "poor"
 */
export const ATTR_INP_RATING = 'inp.rating';

/**
 * INP navigation type.
 * @example "navigate", "reload", "back-forward"
 */
export const ATTR_INP_NAVIGATION_TYPE = 'inp.navigation_type';

// FCP (First Contentful Paint) attributes
/**
 * FCP metric ID.
 * @example "v1-123456789"
 */
export const ATTR_FCP_ID = 'fcp.id';

/**
 * FCP metric value.
 * @example 678.90
 */
export const ATTR_FCP_VALUE = 'fcp.value';

/**
 * FCP metric delta.
 * @example 67.89
 */
export const ATTR_FCP_DELTA = 'fcp.delta';

/**
 * FCP metric rating.
 * @example "good", "needs-improvement", "poor"
 */
export const ATTR_FCP_RATING = 'fcp.rating';

/**
 * FCP navigation type.
 * @example "navigate", "reload", "back-forward"
 */
export const ATTR_FCP_NAVIGATION_TYPE = 'fcp.navigation_type';

// TTFB (Time to First Byte) attributes
/**
 * TTFB metric ID.
 * @example "v1-123456789"
 */
export const ATTR_TTFB_ID = 'ttfb.id';

/**
 * TTFB metric value.
 * @example 234.56
 */
export const ATTR_TTFB_VALUE = 'ttfb.value';

/**
 * TTFB metric delta.
 * @example 34.56
 */
export const ATTR_TTFB_DELTA = 'ttfb.delta';

/**
 * TTFB metric rating.
 * @example "good", "needs-improvement", "poor"
 */
export const ATTR_TTFB_RATING = 'ttfb.rating';

/**
 * TTFB navigation type.
 * @example "navigate", "reload", "back-forward"
 */
export const ATTR_TTFB_NAVIGATION_TYPE = 'ttfb.navigation_type';

// CLS (Cumulative Layout Shift) specific attributes
/**
 * The largest shift target element for CLS.
 * @example "div.main-content"
 */
export const ATTR_CLS_LARGEST_SHIFT_TARGET = 'cls.largest_shift_target';

/**
 * The element that caused the largest shift for CLS.
 * @example "div.main-content"
 */
export const ATTR_CLS_ELEMENT = 'cls.element';

/**
 * The time when the largest shift occurred for CLS.
 * @example 1234.56
 */
export const ATTR_CLS_LARGEST_SHIFT_TIME = 'cls.largest_shift_time';

/**
 * The value of the largest shift for CLS.
 * @example 0.123
 */
export const ATTR_CLS_LARGEST_SHIFT_VALUE = 'cls.largest_shift_value';

/**
 * The load state when CLS occurred.
 * @example "complete", "loading"
 */
export const ATTR_CLS_LOAD_STATE = 'cls.load_state';

/**
 * Whether there was recent input before the CLS.
 * @example true, false
 */
export const ATTR_CLS_HAD_RECENT_INPUT = 'cls.had_recent_input';

// LCP (Largest Contentful Paint) specific attributes
/**
 * The element that was the largest contentful paint.
 * @example "img.hero-image"
 */
export const ATTR_LCP_ELEMENT = 'lcp.element';

/**
 * The URL of the resource for LCP.
 * @example "https://example.com/hero.jpg"
 */
export const ATTR_LCP_URL = 'lcp.url';

/**
 * Time to first byte for LCP.
 * @example 123.45
 */
export const ATTR_LCP_TIME_TO_FIRST_BYTE = 'lcp.time_to_first_byte';

/**
 * Resource load delay for LCP.
 * @example 45.67
 */
export const ATTR_LCP_RESOURCE_LOAD_DELAY = 'lcp.resource_load_delay';

/**
 * Resource load duration for LCP.
 * @example 89.12
 */
export const ATTR_LCP_RESOURCE_LOAD_DURATION = 'lcp.resource_load_duration';

/**
 * Element render delay for LCP.
 * @example 12.34
 */
export const ATTR_LCP_ELEMENT_RENDER_DELAY = 'lcp.element_render_delay';

/**
 * Resource load time for LCP (deprecated, use resource_load_duration).
 * @example 89.12
 * @deprecated Use ATTR_LCP_RESOURCE_LOAD_DURATION instead
 */
export const ATTR_LCP_RESOURCE_LOAD_TIME = 'lcp.resource_load_time';

// INP (Interaction to Next Paint) specific attributes
/**
 * Input delay for INP.
 * @example 12.34
 */
export const ATTR_INP_INPUT_DELAY = 'inp.input_delay';

/**
 * Interaction target for INP.
 * @example "button.submit"
 */
export const ATTR_INP_INTERACTION_TARGET = 'inp.interaction_target';

/**
 * Interaction time for INP.
 * @example 1234567890123
 */
export const ATTR_INP_INTERACTION_TIME = 'inp.interaction_time';

/**
 * Interaction type for INP.
 * @example "click", "keydown"
 */
export const ATTR_INP_INTERACTION_TYPE = 'inp.interaction_type';

/**
 * Load state when INP occurred.
 * @example "complete", "loading"
 */
export const ATTR_INP_LOAD_STATE = 'inp.load_state';

/**
 * Next paint time for INP.
 * @example 1234567890234
 */
export const ATTR_INP_NEXT_PAINT_TIME = 'inp.next_paint_time';

/**
 * Presentation delay for INP.
 * @example 23.45
 */
export const ATTR_INP_PRESENTATION_DELAY = 'inp.presentation_delay';

/**
 * Processing duration for INP.
 * @example 34.56
 */
export const ATTR_INP_PROCESSING_DURATION = 'inp.processing_duration';

/**
 * Total duration for INP.
 * @example 70.35
 */
export const ATTR_INP_DURATION = 'inp.duration';

/**
 * Element for INP (deprecated, use interaction_target).
 * @example "button.submit"
 * @deprecated Use ATTR_INP_INTERACTION_TARGET instead
 */
export const ATTR_INP_ELEMENT = 'inp.element';

/**
 * Event type for INP (deprecated, use interaction_type).
 * @example "click"
 * @deprecated Use ATTR_INP_INTERACTION_TYPE instead
 */
export const ATTR_INP_EVENT_TYPE = 'inp.event_type';

// INP Script Timing attributes
/**
 * Script entry type for INP timing.
 * @example "script"
 */
export const ATTR_INP_SCRIPT_ENTRY_TYPE = 'inp.timing.script.entry_type';

/**
 * Script start time for INP timing.
 * @example 1234567890123
 */
export const ATTR_INP_SCRIPT_START_TIME = 'inp.timing.script.start_time';

/**
 * Script execution start for INP timing.
 * @example 1234567890125
 */
export const ATTR_INP_SCRIPT_EXECUTION_START =
  'inp.timing.script.execution_start';

/**
 * Script duration for INP timing.
 * @example 45.67
 */
export const ATTR_INP_SCRIPT_DURATION = 'inp.timing.script.duration';

/**
 * Script forced style and layout duration for INP timing.
 * @example 12.34
 */
export const ATTR_INP_SCRIPT_FORCED_STYLE_AND_LAYOUT_DURATION =
  'inp.timing.script.forced_style_and_layout_duration';

/**
 * Script invoker for INP timing.
 * @example "event-listener"
 */
export const ATTR_INP_SCRIPT_INVOKER = 'inp.timing.script.invoker';

/**
 * Script pause duration for INP timing.
 * @example 5.67
 */
export const ATTR_INP_SCRIPT_PAUSE_DURATION =
  'inp.timing.script.pause_duration';

/**
 * Script source URL for INP timing.
 * @example "https://example.com/script.js"
 */
export const ATTR_INP_SCRIPT_SOURCE_URL = 'inp.timing.script.source_url';

/**
 * Script source function name for INP timing.
 * @example "handleClick"
 */
export const ATTR_INP_SCRIPT_SOURCE_FUNCTION_NAME =
  'inp.timing.script.source_function_name';

/**
 * Script source character position for INP timing.
 * @example 123
 */
export const ATTR_INP_SCRIPT_SOURCE_CHAR_POSITION =
  'inp.timing.script.source_char_position';

/**
 * Script window attribution for INP timing.
 * @example "self"
 */
export const ATTR_INP_SCRIPT_WINDOW_ATTRIBUTION =
  'inp.timing.script.window_attribution';

// INP Long Animation Frame Timing attributes
/**
 * Long animation frame duration for INP timing.
 * @example 123.45
 */
export const ATTR_INP_TIMING_DURATION = 'inp.timing.duration';

/**
 * Long animation frame entry type for INP timing.
 * @example "long-animation-frame"
 */
export const ATTR_INP_TIMING_ENTRY_TYPE = 'inp.timing.entryType';

/**
 * Long animation frame name for INP timing.
 * @example "same-origin-descendant"
 */
export const ATTR_INP_TIMING_NAME = 'inp.timing.name';

/**
 * Long animation frame render start for INP timing.
 * @example 1234567890234
 */
export const ATTR_INP_TIMING_RENDER_START = 'inp.timing.renderStart';

/**
 * Long animation frame start time for INP timing.
 * @example 1234567890123
 */
export const ATTR_INP_TIMING_START_TIME = 'inp.timing.startTime';

// FCP (First Contentful Paint) specific attributes
/**
 * Time to first byte for FCP.
 * @example 123.45
 */
export const ATTR_FCP_TIME_TO_FIRST_BYTE = 'fcp.time_to_first_byte';

/**
 * Time since first byte for FCP.
 * @example 67.89
 */
export const ATTR_FCP_TIME_SINCE_FIRST_BYTE = 'fcp.time_since_first_byte';

/**
 * Load state when FCP occurred.
 * @example "complete", "loading"
 */
export const ATTR_FCP_LOAD_STATE = 'fcp.load_state';

// TTFB (Time to First Byte) specific attributes
/**
 * Waiting duration for TTFB.
 * @example 45.67
 */
export const ATTR_TTFB_WAITING_DURATION = 'ttfb.waiting_duration';

/**
 * DNS duration for TTFB.
 * @example 12.34
 */
export const ATTR_TTFB_DNS_DURATION = 'ttfb.dns_duration';

/**
 * Connection duration for TTFB.
 * @example 23.45
 */
export const ATTR_TTFB_CONNECTION_DURATION = 'ttfb.connection_duration';

/**
 * Request duration for TTFB.
 * @example 34.56
 */
export const ATTR_TTFB_REQUEST_DURATION = 'ttfb.request_duration';

/**
 * Cache duration for TTFB.
 * @example 5.67
 */
export const ATTR_TTFB_CACHE_DURATION = 'ttfb.cache_duration';

/**
 * Waiting time for TTFB (deprecated, use waiting_duration).
 * @example 45.67
 * @deprecated Use ATTR_TTFB_WAITING_DURATION instead
 */
export const ATTR_TTFB_WAITING_TIME = 'ttfb.waiting_time';

/**
 * DNS time for TTFB (deprecated, use dns_duration).
 * @example 12.34
 * @deprecated Use ATTR_TTFB_DNS_DURATION instead
 */
export const ATTR_TTFB_DNS_TIME = 'ttfb.dns_time';

/**
 * Connection time for TTFB (deprecated, use connection_duration).
 * @example 23.45
 * @deprecated Use ATTR_TTFB_CONNECTION_DURATION instead
 */
export const ATTR_TTFB_CONNECTION_TIME = 'ttfb.connection_time';

/**
 * Request time for TTFB (deprecated, use request_duration).
 * @example 34.56
 * @deprecated Use ATTR_TTFB_REQUEST_DURATION instead
 */
export const ATTR_TTFB_REQUEST_TIME = 'ttfb.request_time';
