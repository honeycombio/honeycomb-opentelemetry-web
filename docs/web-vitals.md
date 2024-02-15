# Web Vitals

By default, Honeycomb includes events for all web vitals except [first-input-delay](https://web.dev/articles/fid). First-input-delay is set to be replaced by interaction-to-next-paint as a core web vital in March 2024.

## Customization of event attributes

For fine-tuned event processing, pass in a custom callback functions for each of the web-vitals:

```js

const sdk = new HoneycombWebSDK({
  webVitalsInstrumentation: {
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
  webVitalsInstrumentation: {
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
  webVitalsInstrumentation: {
    includeValueInTopLevelNamespace: true,
  },
});
```

## Disable web vitals reporting

To disable collection of web vitals, set `webVitalsInstrumentation` to false in the config

```js
const sdk = new HoneycombWebSDK({
  serviceName: 'my-app',
  webVitalsInstrumentation: false,
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
