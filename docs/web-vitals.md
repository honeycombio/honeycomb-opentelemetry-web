# Web Vitals

By default, Honeycomb includes events for all web vitals except [first-input-delay](https://web.dev/articles/fid). First-input-delay is set to be replaced by interaction-to-next-paint as a core web vital in March 2024.

## Initialize Instrumentation

To initialize this instrumentation, add it to the list of instrumentations.

```js
import { HoneycombWebSDK, WebVitalsInstrumentation } from '@honeycombio/opentelemetry-web'

const sdk = new HoneycombWebSDK({
  serviceName: 'my-app',
  instrumentations: [new WebVitalsInstrumentation()],
});
```

## Vitals Attributes

All vitals have the following attributes, they will each be namespaced by the name of the vital:

```ts
/**
 * The name of the vital (in acronym form).
 */
"<vital-name>.name": 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';

/**
 * The rating as to whether the metric value is within the "good",
 * "needs improvement", or "poor" thresholds of the metric.
 */
"<vital-rating>.rating": "good" | "needs-improvement" | "poor"

/**
 * A unique ID representing this particular metric instance. This ID can
 * be used by an analytics tool to dedupe multiple values sent for the same
 * metric instance, or to group multiple deltas together and calculate a
 * total. It can also be used to differentiate multiple different metric
 * instances sent from the same page, which can happen if the page is
 * restored from the back/forward cache (in that case new vital object
 * get created).
 */

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

The event time is when the single largest layout shift contributing to the page's CLS score occurred. (performance.timeOrigin + metric.largestShiftTime)

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

The event time is the start of the page load (performance.timeOrigin), the duration is equivalent to "lcp.value"

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

The event time is equal to the time the interaction began {[TODO] `attribution.eventTime + performance.timeOrigin`? or just `attribution.eventTime`}, the duration is equal to `inp.value`

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

The event time is equal to the start of the page load, the duration is equal to `fcp.value`

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

The event time is equal to the timeOrigin & the duration is equal to ttfb.value

## Customization of event attributes

For more fine-tuned event processing, pass in a custom callback functions for each of the web-vitals:

```js

const sdk = new HoneycombWebSDK({
  instrumentations: [new WebVitalsInstrumentation({
    lcp: {
      applyCustomAttributes: (vital, span) => {
        // a value under 3000ms is acceptable as a 'good' rating for our team
        // this would otherwise show up as 'needs-improvement' if the value is less than 2500 in 'lcp.rating' according to the
        // set standards but we want to record this as well.
        if (vital.value < 3000) {
          span.setAttribute('lcp.custom_rating', 'good');
        }
      };
    }
  })]
});

```

The callbacks are passed their respective metric with attribution as well as the span. [web-vitals docs](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#metricwithattribution)

**Note**: passing in a custom callback will augment the attributes created by this package. If the same attribute names are used, they will _replace_ the data generated by this package.

## Disable web vitals reporting

To disable collection of web vitals, set `webVitals` to false in the config

```js
const sdk = new HoneycombWebSDK({
  serviceName: 'my-app',
  instrumentations: [new WebVitalsInstrumentation({
    enabled: false
  })],
});
```
