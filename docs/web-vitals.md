# Web Vitals

By default, Honeycomb includes events for all web vitals except [first-input-delay](https://web.dev/articles/fid). First-input-delay is set to be replaced by interaction-to-next-paint as a core web vital in March 2024.

## Vitals Attributes

All vitals have the following attributes: `web_vital.name`, `web_vital.rating`, `web_vital.id`

```ts
/**
 * The name of the vital (in acronym form).
 */
"web_vital.name": 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';

/**
 * The rating as to whether the metric value is within the "good",
 * "needs improvement", or "poor" thresholds of the metric.
 */
"web_vital.rating": "good" | "needs-improvement" | "poor"

/**
 * A unique ID representing this particular metric instance. This ID can
 * be used by an analytics tool to dedupe multiple values sent for the same
 * metric instance, or to group multiple deltas together and calculate a
 * total. It can also be used to differentiate multiple different metric
 * instances sent from the same page, which can happen if the page is
 * restored from the back/forward cache (in that case new vital object
 * get created).
 */

"web_vital.id": string;
```

### [Cumulative Layout Score](https://web.dev/articles/cls) attributes

```ts
/* Shared fields */
"web_vital.name": "CLS",
"web_vital.rating": "good" | "needs-improvement" | "poor",
"web_vital.id": string;


/* CLS specific fields */
"cls.value": number;
"cls.delta": number;

 /**
 * A selector identifying the first element (in document order) that
 * shifted when the single largest layout shift contributing to the page's
 * CLS score occurred.
 */
"cls.largest_shift_target": string

/* if available, the data-attribute on the largest shift target. Otherwise, an alias for cls.largest_shift_target */
"cls.element": attribution.largestShiftTarget

/**
 * The time when the single largest layout shift contributing to the page's
 * CLS score occurred. The number of milliseconds elapsed since navigation.
 * [OPEN QUESTION] should this be cls.elapsed_time? or have something as an
 * alias? it records the ms since navigation (performance.timeOrigin) — it
 * isn't a timestamp as a DateTime
 */
"cls.largest_shift_time": DOMHighResTimeStamp;

/**
 * The layout shift score of the single largest layout shift contributing to
 * the page's CLS score.
 */
"cls.largest_shift_value": number;

/**
 * The loading state of the document at the time when the largest layout
 * shift contribution to the page's CLS score occurred (see
 * https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#loadstate
 * for details).
 */
"cls.load_state": LoadState

/* attribution.largestShiftEntry.hadRecentInput */
"cls.had_recent_input": boolean;

```

The event time is when the single largest layout shift contributing to the page's CLS score occurred. (performance.timeOrigin + metric.largestShiftTime)

### [Largest Contentful Paint](https://web.dev/articles/lcp) attributes

```ts
/** Shared fields */
"web_vital.name": "LCP",
"web_vital.rating": "good" | "needs-improvement" | "poor",
"web_vital.id": string;

/** LCP specific fields */

"lcp.value": number;
"lcp.delta": number;

/**
* if available, the data attribute on the element corresponding to the largest
* contentful paint for the page. Otherwise, its selector.
*/
"lcp.element": string;

/**
 * The URL (if applicable) of the LCP image resource. If the LCP element
 * is a text node, this value will not be set.
 */
"lcp.url": string;

/**
 * The time from when the user initiates loading the page until when the
 * browser receives the first byte of the response (a.k.a. TTFB). See
 * [Optimize LCP](https://web.dev/articles/optimize-lcp) for details.
 */

"lcp.time_to_first_byte": number;
/**
 * The delta between TTFB and when the browser starts loading the LCP
 * resource (if there is one, otherwise 0). See [Optimize
 * LCP](https://web.dev/articles/optimize-lcp) for details.
 */
"lcp.resource_load_delay": number;

/**
 * The total time it takes to load the LCP resource itself (if there is one,
 * otherwise 0). See [Optimize LCP](https://web.dev/articles/optimize-lcp) for
 * details.
 */
"lcp.resource_load_time": number;

/**
 * The delta between when the LCP resource finishes loading until the LCP
 * element is fully rendered. See [Optimize
 * LCP](https://web.dev/articles/optimize-lcp) for details.
 */
"lcp.element_render_delay": number;

```

The event time is the start of the page load (performance.timeOrigin), the duration is equivalent to "lcp.value"

### [Interaction to Next Paint](https://web.dev/articles/optimize-inp) attributes

```ts
/** Shared fields */
"web_vital.name": "INP",
"web_vital.rating": "good" | "needs-improvement" | "poor",
"web_vital.id": string;

/** INP specific fields */

/* How long from the user interaction until the next paint */
"inp.value": number;
"inp.delta": number;

/**
 *
 * Either a selector identifying the element that the user interacted with for
 * the event corresponding to INP or its data-attribute (when `dataAttribute`
 * option is set in the config). This element will be the `target` of the
 * `event` dispatched.
 */
"inp.element": string;

/**
 * The `type` of the `event` dispatched corresponding to INP.
 */
"inp.event_type": string;

/**
 * The loading state of the document at the time when the event corresponding
 * to INP occurred (see `LoadState` for details). If the interaction occurred
 * while the document was loading and executing script (e.g. usually in the
 * `dom-interactive` phase) it can result in long delays.
 */
"inp.load_state": LoadState;
}

```

The event time is equal to the time the interaction began {[TODO] `attribution.eventTime + performance.timeOrigin`? or just `attribution.eventTime`}, the duration is equal to `inp.value`

### [First Contentful Paint](https://web.dev/articles/fcp) attributes

```ts
/** Shared fields */
"web_vital.name": "FCP",
"web_vital.rating": "good" | "needs-improvement" | "poor",
"web_vital.id": string;

/** FCP specific fields */

"fcp.value": number;
"fcp.delta": number;
/**
 * The time from when the user initiates loading the page until when the
 * browser receives the first byte of the response (a.k.a. TTFB).
 */
"fcp.time_to_first_byte": number;

/**
 * The delta between TTFB and the first contentful paint (FCP).
 */
"fcp.time_since_first_byte": number;

/**
 * The loading state of the document at the time when FCP `occurred (see
 * `LoadState` for details). Ideally, documents can paint before they finish
 * loading (e.g. the `loading` or `dom-interactive` phases).
 */
"fcp.load_state": LoadState;

```

The event time is equal to the start of the page load, the duration is equal to `fcp.value`

### [Time to First Byte](https://web.dev/articles/ttfb) attributes

```js
/** Shared fields */
"web_vital.name": "TTFB",
"web_vital.rating": "good" | "needs-improvement" | "poor",
"web_vital.id": string;

/** TTFB specific fields */

"ttfb.value": number;
"ttfb.delta": number;

/**
 * The total time from when the user initiates loading the page to when the
 * DNS lookup begins. This includes redirects, service worker startup, and
 * HTTP cache lookup times.
 */
"ttfb.waiting_time": number;
/**
 * The total time to resolve the DNS for the current request.
 */
"ttfb.dns_time": number;
/**
 * The total time to create the connection to the requested domain.
 */
"ttfb.connection_time": number;
/**
 * The time time from when the request was sent until the first byte of the
 * response was received. This includes network time as well as server
 * processing time.
 */
"ttfb.request_time": number;

```

The event time is equal to the timeOrigin & the duration is equal to ttfb.value

## Customization of event attributes

For more fine-tuned event processing, pass in a custom callback functions for each of the web-vitals:

```js

const sdk = new HoneycombWebSDK({
  webVitals: {
    onCLS: (clsWithAttribution) => {//custom event processor },
  }
});

```

Supported fields:

```ts
onCLS?: CLSReportCallbackWithAttribution;
onFCP?: FCPReportCallbackWithAttribution;
onFID?: FIDReportCallbackWithAttribution;
onINP?: INPReportCallbackWithAttribution;
onLCP?: LCPReportCallbackWithAttribution;
onTTFB?: TTFBReportCallbackWithAttribution;

```

The callbacks are passed their respective metric with attribution. [web-vitals docs](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#metricwithattribution)

**Note**: passing in a custom callback will _replace_ the default attributes provided by this package, not augment.

## Additional Configuration

### Using custom data attribute to identify elements

Sometimes the element selector (used by LCP, INP & CLS events) is not very human-readable (or changes frequently) & makes it difficult to figure out the actual culprit. Pass in a custom data selector & hny will use that identifier instead for the `lcp.element`, `cls.element` & `inp.element` attributes.

```js
const sdk = new HoneycombWebSDK({
  serviceName: 'my-app',
  webVitals: {
    elementDataAttribute: 'human-id',
  },
});
```

```html
<input type="color" class="css-1rjml27" data-human-id="favorite-color-picker" />
```

Example INP event:

```js
{
  "web_vital.name: "inp",
  "inp.element": "favorite-color-picker",
  // other fields
}
```

### Including the metric value in `web_vital.value` attribute

By default, each metric value is namespaced under the metric name, `lcp.value` | `cls.value` | `inp.value`, etc. Chose to include the value in `web_vital.value` attribute:

```js
const sdk = new HoneycombWebSDK({
  serviceName: 'my-app',
  webVitals: {
    includeValueInTopLevelNamespace: true,
  },
});
```

## Disable web vitals reporting

To disable collection of web vitals, set `webVitals` to false in the config

```js
const sdk = new HoneycombWebSDK({
  serviceName: 'my-app',
  webVitals: false,
});
```

## Config Options

```ts
interface WebVitalsConfig {
  elementDataAttribute?: string;
  reportOptions?: {
    reportAllChanges?: boolean;
    durationThreshold?: number;
  };
  onCLS?: CLSReportCallbackWithAttribution;
  onFCP?: FCPReportCallbackWithAttribution;
  onFID?: FIDReportCallbackWithAttribution;
  onINP?: INPReportCallbackWithAttribution;
  onLCP?: LCPReportCallbackWithAttribution;
  onTTFB?: TTFBReportCallbackWithAttribution;

  /** Whether or not the metric's value should be sent as
   * `web_vital.value` as well as `[metricName].value`, ie `lcp.value`.
   * Defaults to false */
  includeValueInTopLevelNamespace?: boolean;
}

```
