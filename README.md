# Honeycomb OpenTelemetry Web

[![OSS Lifecycle](https://img.shields.io/osslifecycle/honeycombio/honeycomb-opentelemetry-web)](https://github.com/honeycombio/home/blob/main/honeycomb-oss-lifecycle-and-practices.md)
[![CircleCI](https://circleci.com/gh/honeycombio/honeycomb-opentelemetry-web.svg?style=shield)](https://circleci.com/gh/honeycombio/honeycomb-opentelemetry-web)
[![npm](https://img.shields.io/npm/v/@honeycombio/opentelemetry-web)](https://www.npmjs.com/package/@honeycombio/opentelemetry-web)

Honeycomb wrapper for [OpenTelemetry](https://opentelemetry.io) in the browser.
<!-- TODO: happy badges of the OTel versions we are using -->
<!-- TODO: evergreen question of whether to use fields or attributes -->
**STATUS: this library is in BETA.** Data shapes are stable and safe for production. We are actively seeking feedback to ensure usability.

Latest release:

* built with OpenTelemetry JS [Stable v1.24.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.24.0), [Experimental v0.51.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.51.0), [API v1.8.0](https://github.com/open-telemetry/opentelemetry-js/releases/tag/api%2Fv1.8.0)
* compatible with OpenTelemetry Auto-Instrumentations for Web [~0.39.0](https://github.com/open-telemetry/opentelemetry-js-contrib/releases/tag/auto-instrumentations-web-v0.39.0)

This package sets up OpenTelemetry for tracing, using our recommended practices, including:

* Useful extra attributes, or fields, related to the browser
* Easy configuration to send to Honeycomb
* Basic sampler to control event volume
* Multi span attributes
* Convenient packaging
* An informative debug mode
* Links to traces in Honeycomb
* Automatically enabled Web Vitals instrumentation

<!-- TODO: determine whether we must call this a distro instead of a wrapper. -->

<!-- Things to come: smoke tests in multiple browsers, smoke tests for popular frameworks, CDN distribution -->

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
  apiKey: 'api-key-goes-here',
  serviceName: 'your-great-browser-application',
  instrumentations: [getWebAutoInstrumentations(), new WebVitalsInstrumentation()], // add automatic instrumentation
});
sdk.start();
```

4. Build and run your application, and then look for data in Honeycomb. On the Home screen, choose your application by looking for the service name in the Dataset dropdown at the top. Data should populate.

![Honeycomb screen, with "Home" circled on the left, and the dropdown circled at the top.](docs/honeycomb-home.png)

Refer to our [Honeycomb documentation](https://docs.honeycomb.io/get-started/start-building/rum/) for more information on instrumentation and troubleshooting.

## SDK Configuration

Pass these options to the HoneycombWebSDK:

| name                  | required?                                        | type    | default value           | description                                                                                                                                                               |
| --------------------- | ------------------------------------------------ | ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiKey            | required[*](#send-to-an-opentelemetry-collector) | string  |                         | [Honeycomb API Key](https://docs.honeycomb.io/working-with-your-data/settings/api-keys/) for sending traces directly to Honeycomb.                                         |
| serviceName         | optional                                         | string  | unknown_service         | The name of this browser application. Your telemetry will go to a Honeycomb dataset with this name.                                                                       |
| localVisualizations | optional                                         | boolean | false                   | For each trace created, print a link to the console so that you can find it in Honeycomb. Super useful in development! Do not use in production.                          |
| sampleRate            | optional                                         | number  | 1                       | If you want to send a random fraction of traces, then make this a whole number greater than 1. Only 1 in `sampleRate` traces will be sent, and the rest never be created. |
| tracesEndpoint        | optional                                         | string  | `${endpoint}/v1/traces` | Populate this to send traces to a route other than /v1/traces.                                                                                                             |
| debug                 | optional                                         | boolean | false                   | Enable additional logging.                                                                                                                                                 |
| dataset               | optional                                         | string  |                         | Populate this only if your Honeycomb environment is still [Classic](https://docs.honeycomb.io/honeycomb-classic/#am-i-using-honeycomb-classic).                                   |
| skipOptionsValidation | optional                                         | boolean | false                   | Do not require any fields.[*](#send-to-an-opentelemetry-collector) Use with OpenTelemetry Collector.                                                                                                       |

`*` Note: the `apiKey` field is required because this SDK really wants to help you send data directly to Honeycomb.

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

## Auto-instrumentation

Here is a list of what gets instrumented automatically by including `getWebAutoInstrumentations` and `WebVitalsInstrumentation` in the list of instrumentations while initializing the SDK:

* [Document & resource loading instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-document-load#readme)
* [Fetch request instrumentation](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-fetch)
* [XML HTTP request instrumentation](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-xml-http-request)
* [User interaction instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/web/opentelemetry-instrumentation-user-interaction)
* [Web vitals instrumentation](./docs/web-vitals.md)

## Fields emitted

The SDK adds these fields to all telemetry:

| name | status | static? | description | example |
|------|--------|---------|-------------|---------|
| `user_agent.original` | [stable](https://github.com/scheler/opentelemetry-specification/blob/browser-events/specification/resource/semantic_conventions/browser.md) | static | window.user_agent | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36` |
| `browser.height` | planned | per-span | [window.innerHeight](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight), the height of the layout viewport in pixels | 287 |
| `browser.width` | planned | per-span | [window.innerWidth](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth), the height of the layout viewport in pixels | 1720 |
| `browser.brands` | stable | static | [NavigatorUAData: brands](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/brands) | ["Not_A Brand 8", "Chromium 120", "Google Chrome 120"] |
| `browser.name` | custom | static | Best guess of browser type | "Chrome", "Chromium", "Firefox", "Safari", etc. |
| `browser.version` | custom | static | Version of browser | `109.1` |
| `browser.platform` | stable | static | [NavigatorUAData: platform](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/platform) | "Windows" |
| `browser.mobile` | stable | static | [NavigatorUAData: mobile](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/mobile) | true |
| `browser.language` | stable | static | [Navigator: language](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/language) | "fr-FR" |
| `browser.touch_screen_enabled` | stable | static | [Navigator: maxTouchPoints](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/maxTouchPoints) | true |
| `page.url`      | custom | per-span |   | `https://docs.honeycomb.io/getting-data-in/data-best-practices/#datasets-group-data-together?page=2` |
| `page.route`     | custom | per-span |   | `/getting-data-in/data-best-practices/`                                                              |
| `page.search`   | custom | per-span |   | `?page=2`                                                                                            |
| `page.hash`     | custom | per-span |   | `#datasets-group-data-together`                                                                      |
| `page.hostname` | custom | per-span |   | `docs.honeycomb.io`   |
| `screen.width` | custom | static | Total available screen width in pixels.   | `780`   |
| `screen.height` | custom | static |  Total available screen height in pixels | `1000`   |
| `screen.size` | custom | static |  `small` (less than 768px), `medium` (769px - 1024px) or `large` (greater than 1024px), `unknown` if the size is missing. |
| `honeycomb.distro.version` | stable | static | package version | "1.2.3" |
| `honeycomb.distro.runtime_version` | stable | static | | "browser" |
| `entry_page.url`      | custom | static |   | `https://docs.honeycomb.io/getting-data-in/data-best-practices/#datasets-group-data-together?page=2` |
| `entry_page.path`     | custom | static |   | `/getting-data-in/data-best-practices/`                                                              |
| `entry_page.search`   | custom | static |   | `?page=2`                                                                                            |
| `entry_page.hash`     | custom | static |   | `#datasets-group-data-together`                                                                      |
| `entry_page.hostname` | custom | static |   | `docs.honeycomb.io`                                                                                  |
| `entry_page.referrer` | custom | static | [Document: referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer)   | `https://honeycomb.io`                                                                                  |

Static fields are added to the [Resource](https://opentelemetry.io/docs/concepts/resources/), so they are same for every span emitted for the loaded page.

Fields that can change during the lifetime of the page are instead added to each span in a [SpanProcessor](https://opentelemetry.io/docs/specs/otel/trace/sdk/#span-processor).

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

## Development

See [DEVELOPING.md](./DEVELOPING.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## Support

See [SUPPORT.md](./SUPPORT.md)

## Code of Conduct

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
