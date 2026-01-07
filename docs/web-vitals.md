# Web Vitals

By default, Honeycomb includes events for all web vitals except [first-input-delay](https://web.dev/articles/fid). First-input-delay is set to be replaced by interaction-to-next-paint as a core web vital in March 2024.

## Initialize Instrumentation

This instrumentation is automatically initialized with the `HoneycombWebSDK`. To disable the instrumentation, use the following config:

```js
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web'

const sdk = new HoneycombWebSDK({
  serviceName: 'my-app',
  webVitalsInstrumentationConfig: {
    enabled: false,
  },
});
```

## Vitals Attributes

All vitals have the following attributes, they will each be namespaced by the name of the vital:

```ts
/**
 * The name of the vital (in acronym form).
 */
"name": 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';

/**
 * The rating as to whether the metric value is within the "good",
 * "needs improvement", or "poor" thresholds of the metric.
 */
"<vital-rating>.rating": "good" | "needs-improvement" | "poor"

"<vital-id>.id": string;
```

### [Cumulative Layout Score](https://web.dev/articles/cls) attributes

```ts
/* Shared fields */
"cls.name": "CLS",
"cls.rating": "good" | "needs-improvement" | "poor",
"cls.id": string;
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

**Span Timing:** The span represents the CLS session window from the first layout shift to the last layout shift. The start time is when the first shift occurred, and the end time is when the last shift occurred. `LayoutShift` entries always have `duration: 0` according to the [Layout Instability API specification](https://wicg.github.io/layout-instability/). When CLS = 0 (no shifts), a zero-duration span is created at time origin.

### [Largest Contentful Paint](https://web.dev/articles/lcp) attributes

```ts
/** Shared fields */
"lcp.name": "LCP",
"lcp.rating": "good" | "needs-improvement" | "poor",
"lcp.id": string;
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

**Span Timing:** The span represents the LCP loading lifecycle. The start time is when the LCP resource started loading (`loadTime`), and the end time is when the LCP element finished rendering (`renderTime`). The span duration represents the actual time to load and render the LCP element.

### [Interaction to Next Paint](https://web.dev/articles/optimize-inp) attributes

```ts
/** Shared fields */
"inp.name": "INP",
"inp.rating": "good" | "needs-improvement" | "poor",
"inp.id": string;
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

**Span Timing:** The span represents the user interaction timing. The start time is when the user interaction began (`interactionTime`), and the end time is when the next paint completed (`interactionTime + inp.value`). The span duration represents the total time from interaction to next paint.

### [First Contentful Paint](https://web.dev/articles/fcp) attributes

```ts
/** Shared fields */
"fcp.name": "FCP",
"fcp.rating": "good" | "needs-improvement" | "poor",
"fcp.id": string;
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

**Span Timing:** The span represents the time from when the user first sees the page to when the first contentful paint occurs. For normal pages, this starts at navigation start (`performance.timeOrigin`). For prerendered pages, this starts at activation time (`activationStart`) when the user actually sees the page. The end time is when FCP occurred. The span duration equals `fcp.value`.

### [Time to First Byte](https://web.dev/articles/ttfb) attributes

```js
/** Shared fields */
"ttfb.name": "TTFB",
"ttfb.rating": "good" | "needs-improvement" | "poor",
"ttfb.id": string;
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

**Span Timing:** The span represents the time from when the user initiates the page load to when the first byte is received. For normal pages, this starts at navigation start (`performance.timeOrigin`). For prerendered pages, this starts at activation time (`activationStart`) when the user actually sees the page. The end time is when the first byte was received (`responseStart`). The span duration equals `ttfb.value`.

## Customization of event attributes

For more fine-tuned event processing, pass in a custom callback functions for each of the web-vitals:

```js

const sdk = new HoneycombWebSDK({
  webVitalsInstrumentationConfig: {
    lcp: {
      applyCustomAttributes: (vital, span) => {
        // a value under 3000ms is acceptable as a 'good' rating for our team
        // this would otherwise show up as 'needs-improvement' if the value is less than 2500 in 'lcp.rating' according to the
        // set standards but we want to record this as well.
        if (vital.value < 3000) {
          span.setAttribute('lcp.custom_rating', 'good');
        }
      },
    },
  },
});

```

The callbacks are passed their respective metric with attribution as well as the span. [web-vitals docs](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#metricwithattribution)

**Note**: passing in a custom callback will augment the attributes created by this package. If the same attribute names are used, they will _replace_ the data generated by this package.
