# Honeycomb OpenTelemetry Web

[![OSS Lifecycle](https://img.shields.io/osslifecycle/honeycombio/honeycomb-opentelemetry-web)](https://github.com/honeycombio/home/blob/main/honeycomb-oss-lifecycle-and-practices.md)
[![CircleCI](https://circleci.com/gh/honeycombio/honeycomb-opentelemetry-web.svg?style=shield)](https://circleci.com/gh/honeycombio/honeycomb-opentelemetry-web)
[![npm](https://img.shields.io/npm/v/@honeycombio/opentelemetry-web)](https://www.npmjs.com/package/@honeycombio/opentelemetry-web)

Honeycomb wrapper for [OpenTelemetry](https://opentelemetry.io) in the browser. Detailed documentation for setup, instrumentation and troubleshooting can be found [here](https://docs.honeycomb.io/get-started/start-building/web/).

Latest release:

* built with OpenTelemetry JS [Stable v2.0.1](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v2.0.1), [Experimental v0.203.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.203.0), [API v1.9.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/api%2Fv1.9.0), [Semantic Conventions v1.36.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/semconv%2Fv1.34.0)
* compatible with OpenTelemetry Auto-Instrumentations for Web [~0.49.0](https://github.com/open-telemetry/opentelemetry-js-contrib/releases/tag/auto-instrumentations-web-v0.49.0)

This package sets up OpenTelemetry for tracing, using our recommended practices, including:

* Useful extra attributes, or fields, related to the browser
* Easy configuration to send to Honeycomb
* Basic sampler to control event volume
* Multi span attributes
* 'session.id' on every span, generated on page load
* Convenient packaging
* An informative debug mode
* Links to traces in Honeycomb
* Automatically enabled [Web Vitals](https://web.dev/articles/vitals) & error instrumentation

## Why use this?

This wrapper is a little ahead of OpenTelemetry, so that you can get the recommended fields in before they're completely standardized.

This wrapper is at least as stable as OpenTelemetry, because it is backwards-compatible as we update it to the latest OpenTelemetry versions, semantic conventions, and recommended practices.

We test this library, with its combination of OpenTelemetry dependencies, so that you can be confident that upgrades will work.

This project provides a convenient distribution of all the code required to get traces from the browser.


## Getting started

1. Install this library:

```sh
npm install @honeycombio/opentelemetry-web @opentelemetry/auto-instrumentations-web
```

2. [Get a Honeycomb API key](https://docs.honeycomb.io/get-started/configure/environments/manage-api-keys/#find-api-keys).

3. Initialize tracing at the start of your application:

```js
import { HoneycombWebSDK, WebVitalsInstrumentation } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const sdk = new HoneycombWebSDK({
  // endpoint: "https://api.eu1.honeycomb.io/v1/traces", // Send to EU instance of Honeycomb. Defaults to sending to US instance.
  apiKey: 'api-key-goes-here',
  serviceName: 'your-great-browser-application',
  instrumentations: [getWebAutoInstrumentations(), new WebVitalsInstrumentation()], // add automatic instrumentation
});
sdk.start();
```

4. Build and run your application, and then look for data in Honeycomb. On the Home screen, choose your application by looking for the service name in the Dataset dropdown at the top. Data should populate.

![Honeycomb screen, with "Home" circled on the left, and the dropdown circled at the top.](docs/honeycomb-home.png)

Refer to our [Honeycomb documentation](https://docs.honeycomb.io/get-started/start-building/web/) for more information on instrumentation and troubleshooting.

## SDK Configuration

Pass these options to the HoneycombWebSDK:

| name                              | required?                                        | type                              | default value           | description                                                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------ | --------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey                            | required[*](#send-to-an-opentelemetry-collector) | string                            |                         | [Honeycomb API Key](https://docs.honeycomb.io/working-with-your-data/settings/api-keys/) for sending traces directly to Honeycomb.                                                              |
| serviceName                       | optional                                         | string                            | unknown_service         | The name of this browser application. Your telemetry will go to a Honeycomb dataset with this name.                                                                                             |
| serviceVersion                    | optional                                         | string                            |                         | The version of this browser application.
| localVisualizations               | optional                                         | boolean                           | false                   | For each trace created, print a link to the console so that you can find it in Honeycomb. Super useful in development! Do not use in production.                                                |
| sampleRate                        | optional                                         | number                            | 1                       | If you want to send a random fraction of traces, then make this a whole number greater than 1. Only 1 in `sampleRate` traces will be sent, and the rest never be created.                       |
| tracesEndpoint                    | optional                                         | string                            | `${endpoint}/v1/traces` | Populate this to send traces to a route other than /v1/traces.                                                                                                                                  |
| debug                             | optional                                         | boolean                           | false                   | Enable additional logging.                                                                                                                                                                      |
| dataset                           | optional                                         | string                            |                         | Populate this only if your Honeycomb environment is still [Classic](https://docs.honeycomb.io/honeycomb-classic/#am-i-using-honeycomb-classic).                                                 |
| skipOptionsValidation             | optional                                         | boolean                           | false                   | Do not require any fields.[*](#send-to-an-opentelemetry-collector) Use with OpenTelemetry Collector.                                                                                            |
| spanProcessors                    | optional                                         | SpanProcessor[]                   |                         | Array of [span processors](https://opentelemetry.io/docs/languages/java/instrumentation/#span-processor) to apply to all generated spans.                                                       |
| traceExporters                    | optional                                         | SpanExporter[]                    |                         | Array of [span exporters](https://opentelemetry.io/docs/languages/js/exporters)                                                                                                                 |
| metricExporters                   | optional                                         | PushMetricExporter[]              |                         | Array of [metric exporters](https://opentelemetry.io/docs/languages/js/exporters)                                                                                                                 |
| timeout                           | optional                                         | number                            | 10000                   | Timeout used by exporters when sending data. Defaults to 10000ms. |
| tracesTimeout                     | optional                                         | number                            | 10000                   | Timeout used by the traces exporter when sending data. Overrides timeout for trace data. |
| metricsTimeout                    | optional                                         | number                            | 10000                   | Timeout used by the metrics exporter when sending data. Overrides timeout for metric data. |
| logsTimeout                       | optional                                         | number                            | 10000                   | Timeout used by the logs exporter when sending data. Overrides timeout for log data. |
| disableDefaultMetricExporter      | optional                                         | boolean                           | false                   | Disable default Honeycomb metrics exporter. You can provide additional exporters via `metricExporters` config option.             |
| disableDefaultTraceExporter       | optional                                         | boolean                           | false                   | Disable default Honeycomb trace exporter. You can provide additional exporters via `traceExporters` config option.                                                                              |
| webVitalsInstrumentationConfig    | optional                                         | WebVitalsInstrumentationConfig    | `{ enabled: true }`     | See [WebVitalsInstrumentationConfig](####WebVitalsInstrumentationConfig).                                                                                                                       |
| globalErrorsInstrumentationConfig | optional                                         | GlobalErrorsInstrumentationConfig | `{ enabled: true }`     | See [GlobalErrorsInstrumentationConfig](####GlobalErrorsInstrumentationConfig).                                                                                                                 |
| logLevel                          | optional                                         | DiagLogLevel                      | DiagLogLevel.DEBUG      | Controls the verbosity of logs printed to the console.                                                                                                                                          |
| contextManager                    | optional                                         | ContextManager                    |                         | Sets a [Context Manager](https://opentelemetry.io/docs/languages/js/context/#context-manager) for managing global span context. See [Context Management](#context-management) for more details. |

`*` Note: the `apiKey` field is required because this SDK really wants to help you send data directly to Honeycomb.

#### `WebVitalsInstrumentationConfig`
| name                      | required? | type                 | default value | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|---------------------------|-----------|----------------------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enabled                   | optional  | boolean              | `true`        | Where or not to enable this auto instrumentation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| lcp                       | optional  | VitalOpts            | `undefined`   | Pass-through config options for web-vitals. See [ReportOpts](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#reportopts).                                                                                                                                                                                                                                                                                                                                                                                                        |
| lcp.applyCustomAttributes | optional  | function             | `undefined`   | A function for adding custom attributes to core web vitals spans.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| lcp.dataAttributes        | optional  | `string[]`           | `undefined`   | An array of attribute names to filter reported as `lcp.element.data.someAttr` <br/> <li/> `undefined` will send all `data-*` attribute-value pairs. <li/> `[]` will send none <li/> `['myAttr']` will send the value of `data-my-attr` or `''` if it's not supplied. <p/> Note: An attribute that's defined, but that has no specified value such as `<div data-my-attr />` will be sent as  `{`lcp.element.data.myAttr`: '' }` which is inline with the [dataset API]( https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset). |
| cls                       | optional  | VitalOpts            | `undefined`   | Pass-through config options for web-vitals. See [ReportOpts](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#reportopts).                                                                                                                                                                                                                                                                                                                                                                                                        |
| cls.applyCustomAttributes | optional  | function             | `undefined`   | A function for adding custom attributes to core web vitals spans.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| inp                       | optional  | VitalOptsWithTimings | `undefined`   | Pass-through config options for web-vitals. See [ReportOpts](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#reportopts).                                                                                                                                                                                                                                                                                                                                                                                                        |
| inp.applyCustomAttributes | optional  | function             | `undefined`   | A function for adding custom attributes to core web vitals spans.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| inp.dataAttributes        | optional  | `string[]`           | `undefined`   | An array of attribute names to filter reported as `inp.element.data.someAttr` <br/> <li/> `undefined` will send all `data-*` attribute-value pairs. <li/> `[]` will send none <li/> `['myAttr']` will send the value of `data-my-attr` or `''` if it's not supplied. <p/> Note: An attribute that's defined, but that has no specified value such as `<div data-my-attr />` will be sent as  `{`inp.element.data.myAttr`: '' }` which is inline with the [dataset API]( https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset). |
| inp.includeTimingsAsSpans | optional  | boolean              | `false`       | When true will emit `PerformanceLongAnimationFrameTiming` and `PerformanceScriptTiming` as spans.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| fid                       | optional  | VitalOpts            | `undefined`   | Pass-through config options for web-vitals. See [ReportOpts](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#reportopts).                                                                                                                                                                                                                                                                                                                                                                                                        |
| fid.applyCustomAttributes | optional  | function             | `undefined`   | A function for adding custom attributes to core web vitals spans.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| fcp                       | optional  | VitalOpts            | `undefined`   | Pass-through config options for web-vitals. See [ReportOpts](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#reportopts).                                                                                                                                                                                                                                                                                                                                                                                                        |
| fcp.applyCustomAttributes | optional  | function             | `undefined`   | A function for adding custom attributes to core web vitals spans.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ttf                       | optional  | VitalOpts            | `undefined`   | Pass-through config options for web-vitals. See [ReportOpts](https://github.com/GoogleChrome/web-vitals?tab=readme-ov-file#reportopts).                                                                                                                                                                                                                                                                                                                                                                                                        |
| ttf.applyCustomAttributes | optional  | function             | `undefined`   | A function for adding custom attributes to core web vitals spans.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

#### `GlobalErrorsInstrumentationConfig`
| name    | required? | type    | default value | description                                       |
|---------|-----------|---------|---------------|---------------------------------------------------|
| enabled | optional  | boolean | `true`        | Where or not to enable this auto instrumentation. |
| enabled | optional | boolean | `true` | Whether or not to enable this auto instrumentation. |
| applyCustomAttributesOnSpan | optional | function | n/a | A callback function for adding custom attributes to the span when an error is recorded. Will automatically be applied to all spans generated by the auto-instrumentation. |

#### `recordException` Helper Function

The `recordException` function is a utility to send exception spans with semantic attributes from anywhere in your JS app (e.g. a global app error function, React error boundary etc.)

##### Parameters

| Parameter   | Type       | Default Value                          | Description                                                                 |
|-------------|------------|----------------------------------------|-----------------------------------------------------------------------------|
| `error`     | `Error`    | N/A                                    | The error object to record. This should be an instance of the JavaScript `Error` class. |
| `attributes`| `Attributes`| `{}`                                  | Additional attributes to add to the span. This can include any custom metadata you want to associate with the error. Will likely be deprecated in favour of using the callback function option `applyCustomAttributesOnSpan` in the future. |
| `tracer`    | `Tracer`   | `trace.getTracer(LIBRARY_NAME)`        | The tracer to use for recording the span. If not provided, the default tracer for the library will be used. |
| `applyCustomAttributesOnSpan`    | function   | n/a | A callback function for adding custom attributes to the span when an error is recorded. |

```js
recordException(
  error: Error,
  attributes?: Attributes,
  tracer?: Tracer,
  applyCustomAttributesOnSpan?
): void
```

```js
import { recordException } from '@honeycombio/opentelemetry-web';

try {
  // Some code that may throw an error
  throw new Error('Something went wrong!');
} catch (error) {
  recordException(error);
}
```


### Send to an OpenTelemetry Collector

In production, we recommend running an [OpenTelemetry Collector](https://docs.honeycomb.io/getting-data-in/otel-collector/#browser-telemetry), so that your browser app can send traces to it for you to have control over your Honeycomb API key as well any data transformation.
Your OpenTelemetry Collector can send the traces on to Honeycomb, and your API key will be in the Collector's configuration. Here is a configuration of the Honeycomb Web SDK that sends to your Collector:

```js
{
  endpoint: "http(s)://<your-collector-url>",
  serviceName: "your-spiffy-browser-application",
  skipOptionsValidation: true // because we are not including apiKey
}
```

### Context Management
OpenTelemetry uses the concept of a [Context Manager](https://opentelemetry.io/docs/languages/js/context/#context-manager) to store propagate global span context through your system. OpenTelemetry provides a context manager for browser instrumentation based on the [Zone.js](https://github.com/angular/angular/tree/main/packages/zone.js) library to track global context across asynchronous execution threads. This context manager can be plugged into this instrumentation like so:

```js
import { ZoneContextManager } from '@opentelemetry/context-zone';

const sdk = new HoneycombWebSDK({
  // other config options omitted...
  contextManager: new ZoneContextManager()
});
sdk.start();
```

Zone.js has known limitations with async/await code, and [requires](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-context-zone-peer-dep#installation) your code to be transpiled down to ES2015. It also may carry a performance penalty.

For these reasons, we do not enable ZoneContextManager by default.

## Auto-instrumentation

Here is a list of what gets instrumented automatically by including `getWebAutoInstrumentations` and `WebVitalsInstrumentation` in the list of instrumentations while initializing the SDK:

* [Document & resource loading instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-document-load)
* [Fetch request instrumentation](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch)
* [XML HTTP request instrumentation](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request)
* [User interaction instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-user-interaction)
* [Web vitals instrumentation](../../docs/web-vitals.md)

## Fields emitted

The SDK adds these fields to all telemetry:

| name                               | status                    | static?  | description                                                                                                                                                                                                                                                                                                   | example                                                                                                                    |
|------------------------------------|---------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `user_agent.original`              | [stable][browser-semconv] | static   | window.user_agent                                                                                                                                                                                                                                                                                             | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36` |
| `browser.height`                   | planned                   | per-span | [window.innerHeight](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight), the height of the layout viewport in pixels                                                                                                                                                                        | 287                                                                                                                        |
| `browser.width`                    | planned                   | per-span | [window.innerWidth](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth), the height of the layout viewport in pixels                                                                                                                                                                          | 1720                                                                                                                       |
| `browser.brands`                   | stable                    | static   | [NavigatorUAData: brands](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/brands)                                                                                                                                                                                                            | ["Not_A Brand 8", "Chromium 120", "Google Chrome 120"]                                                                     |
| `browser.name`                     | custom                    | static   | Best guess of browser type                                                                                                                                                                                                                                                                                    | "Chrome", "Chromium", "Firefox", "Safari", etc.                                                                            |
| `browser.version`                  | custom                    | static   | Version of browser                                                                                                                                                                                                                                                                                            | `109.1`                                                                                                                    |
| `browser.platform`                 | stable                    | static   | [NavigatorUAData: platform](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/platform)                                                                                                                                                                                                        | "Windows"                                                                                                                  |
| `browser.mobile`                   | stable                    | static   | [NavigatorUAData: mobile](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/mobile)                                                                                                                                                                                                            | true                                                                                                                       |
| `browser.language`                 | stable                    | static   | [Navigator: language](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language)                                                                                                                                                                                                                    | "fr-FR"                                                                                                                    |
| `browser.touch_screen_enabled`     | stable                    | static   | [Navigator: maxTouchPoints](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints)                                                                                                                                                                                                        | true                                                                                                                       |
| `device.type`                      | custom                    | static   | Best guess of device type                                                                                                                                                                                                                                                                                     | "desktop", "mobile", "tablet", etc.                                                                                        |
| `network.effectiveType`            | custom                    | static   | [NetworkInformation: effectiveType](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType). Best guess of user's "effective network type", which is based on their overall network speed. Only available on Chromium devices, and only computed once when the SDK is initialized. | "slow-2g", "2g", "3g", "4g"                                                                                                |
| `page.url`                         | custom                    | per-span |                                                                                                                                                                                                                                                                                                               | `https://docs.honeycomb.io/getting-data-in/data-best-practices/#datasets-group-data-together?page=2`                       |
| `page.route`                       | custom                    | per-span |                                                                                                                                                                                                                                                                                                               | `/getting-data-in/data-best-practices/`                                                                                    |
| `page.search`                      | custom                    | per-span |                                                                                                                                                                                                                                                                                                               | `?page=2`                                                                                                                  |
| `page.hash`                        | custom                    | per-span |                                                                                                                                                                                                                                                                                                               | `#datasets-group-data-together`                                                                                            |
| `page.hostname`                    | custom                    | per-span |                                                                                                                                                                                                                                                                                                               | `docs.honeycomb.io`                                                                                                        |
| `screen.width`                     | custom                    | static   | Total available screen width in pixels.                                                                                                                                                                                                                                                                       | `780`                                                                                                                      |
| `screen.height`                    | custom                    | static   | Total available screen height in pixels                                                                                                                                                                                                                                                                       | `1000`                                                                                                                     |
| `screen.size`                      | custom                    | static   | `small` (less than 768px), `medium` (769px - 1024px) or `large` (greater than 1024px), `unknown` if the size is missing.                                                                                                                                                                                      |                                                                                                                            |
| `honeycomb.distro.version`         | stable                    | static   | package version                                                                                                                                                                                                                                                                                               | "1.2.3"                                                                                                                    |
| `honeycomb.distro.runtime_version` | stable                    | static   |                                                                                                                                                                                                                                                                                                               | "browser"                                                                                                                  |
| `entry_page.url`                   | custom                    | static   |                                                                                                                                                                                                                                                                                                               | `https://docs.honeycomb.io/getting-data-in/data-best-practices/#datasets-group-data-together?page=2`                       |
| `entry_page.path`                  | custom                    | static   |                                                                                                                                                                                                                                                                                                               | `/getting-data-in/data-best-practices/`                                                                                    |
| `entry_page.search`                | custom                    | static   |                                                                                                                                                                                                                                                                                                               | `?page=2`                                                                                                                  |
| `entry_page.hash`                  | custom                    | static   |                                                                                                                                                                                                                                                                                                               | `#datasets-group-data-together`                                                                                            |
| `entry_page.hostname`              | custom                    | static   |                                                                                                                                                                                                                                                                                                               | `docs.honeycomb.io`                                                                                                        |
| `entry_page.referrer`              | custom                    | static   | [Document: referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer)                                                                                                                                                                                                                      | `https://honeycomb.io`                                                                                                     |


Static fields are added to the [Resource](https://opentelemetry.io/docs/concepts/resources/), so they are same for every span emitted for the loaded page.

Fields that can change during the lifetime of the page are instead added to each span in a [SpanProcessor](https://opentelemetry.io/docs/specs/otel/trace/sdk/#span-processor).

#### GlobalErrorsInstrumentationConfig

You can expect the following attributes to be emitted from the global errors instrumentation, unless you have it disabled in your SDK configuration:
| name                                         | status          | static?  | description                                                                   | example                                                                                                                                                                                                    |
|----------------------------------------------|-----------------|----------|-------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `exception.stacktrace`                       | stable          | per-span | The entire stacktrace as a string.                                            | ReferenceError: VAR is not defined<br>&nbsp;&nbsp;&nbsp;&nbsp;at main(/index.js:37:18)<br>&nbsp;&nbsp;&nbsp;&nbsp;at <anonymous>(/index.js:68:6)<br>&nbsp;&nbsp;&nbsp;&nbsp;at <anonymous>(/index.js:68:6) |
| `exception.message`                          | stable          | per-span | The exception's message.                                                      | VAR is not defined                                                                                                                                                                                         |
| `exception.type`                             | stable          | per-span | The type of exception.                                                        | ReferenceError                                                                                                                                                                                             |
| `exception.structured_stacktrace.columns`    | custom          | per-span | Array of columns extracted from `exception.stacktrace`.                       | [18, 6, 6]                                                                                                                                                                                                 |
| `exception.structured_stacktrace.lines`      | custom          | per-span | Array of lines extracted from `exception.stacktrace`.                         | [37, 68, 68]                                                                                                                                                                                               |
| `exception.structured_stacktrace.functions`  | custom          | per-span | Array of function names extracted from `exception.stacktrace`.                | [main, \<anonymous\>, \<anonymous\>]                                                                                                                                                                       |
| `exception.structured_stacktrace.urls`       | custom          | per-span | Array of urls or directories extracted from `exception.stacktrace`.           | [/index.js, /index.js, /index.js]                                                                                                                                                                          |

## Migration Practices

This wrapper can change faster than OpenTelemetry, and yet be more stable. This section describes how we do that.

### Versioning

Our version numbers are independent of the OpenTelemetry version numbers. Check the badge at the top of this README for the OpenTelemetry version this is based on.

When OpenTelemetry releases a new version of the packages this project depends on, we update this project to use them within a week, unless our tests indicate a problem.

When the OpenTelemetry API or SDK has a major version bump, this package will, too. We also have major version bumps of our own.

### Code

If there is something we want to get into OpenTelemetry, or a PR that we wish were merged already, we can incorporate that code here in parallel to working to get it published upstream.

When that code is in place upstream, we remove it here, and release a new version. When there is no change to the inputs and outputs, nothing else is required.

### Fields

This project adds fields to the outgoing spans. We follow semantic convention when they exist.

For fields that aren't yet part of the semantic conventions, we give them a name. If those field names become stable with a different name, then:

1. We add the new name, and emit both for 6 months.
1. We mark the old name as deprecated in this documentation
1. We offer a configuration option to NOT emit both.
1. After that period, we add a configuration parameter to allow you to say, keep emitting that old field name.
1. A year after the semantic convention has been in place, we stop emitting the old field name at all. (at the next major version bump)

### Configuration

The configuration accepted by this wrapper is based on the options available in the OpenTelemetry libraries.

When an option is not available upstream, we give it a name. If that option becomes available upstream under a different name, we migrate to that.

1. We add the new name, and accept both for 6 months.
1. We mark the old name as deprecated in this documentation, and issue a warning in debug mode.
1. After this period, the old name will be ignored (at the next major version bump).

## Change Log

See [CHANGELOG.md](./CHANGELOG.md)

[browser-semconv]: https://github.com/scheler/opentelemetry-specification/blob/browser-events/specification/resource/semantic_conventions/browser.md
