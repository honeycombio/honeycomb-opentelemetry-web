# honeycomb-opentelemetry-web changelog

## v0.21.0 [beta] - 2025-07-01

### ✨ Features

- feat: Send data-* attributes for INP. (#554) | @wolfgangcodes

### 🛠️ Maintenance

- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 2 updates (#565) | @dependabot
- maint(deps): bump the example-deps group across 3 directories with 2 updates (#566) | @dependabot
- maint(deps): bump the example-deps group across 3 directories with 3 updates (#563) | @dependabot
- maint: Remove deprecated dependabot config (#562) | @martin308
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 3 updates (#561) | @dependabot

## v0.20.0 [beta] - 2025-06-19

### ✨ Features
- feat: add service version attribute (#553) | @jairo-mendoza

### 🐛 Fixes
- fix: honoring custom sampler when provided by user. (#559) | @howardyoo

### 🛠️ Maintenance
- chore: Update examples to remove FID. (#548) | wolfgangcodes
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 7 updates (#551) | @dependabot
- maint(deps): bump web-vitals from 5.0.2 to 5.0.3 in /packages/honeycomb-opentelemetry-web (#555) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 2 updates (#556) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 2 updates (#550) | @dependabot
- maint(deps): bump @babel/runtime from 7.27.4 to 7.27.6 in /packages/honeycomb-opentelemetry-web (#549) | @dependabot
- maint(deps): bump the example-deps group across 6 directories with 10 updates (#546) | @dependabot

## v0.19.0 [beta] - 2025-06-04

### ✨ Features
- feat: add metrics and logs configuration (#545) | @(beeklimt@honeycomb.io)

### 🛠️ Maintenance
- maint(deps): bump web-vitals from 5.0.1 to 5.0.2 in /packages/honeycomb-opentelemetry-web (#543) | @(49699333+dependabot[bot]@users.noreply.github.com)
- maint(deps): bump @babel/runtime from 7.27.1 to 7.27.4 in /packages/honeycomb-opentelemetry-web (#544) | @(49699333+dependabot[bot]@users.noreply.github.com)
- maint(deps): bump web-vitals from 5.0.0 to 5.0.1 in /packages/honeycomb-opentelemetry-web (#540) | @(49699333+dependabot[bot]@users.noreply.github.com)
- maint(deps): bump @opentelemetry/semantic-conventions from 1.33.0 to 1.34.0 in /packages/honeycomb-opentelemetry-web in the otel group (#538) | @(49699333+dependabot[bot]@users.noreply.github.com)

## v0.18.0 [beta] - 2025-05-20

### 💥 Breaking Changes
- **chore: Upgrade to web-vitals 5.0.0 (#534)** removes support for FID since it has been removed from `web-vitals@5.0.0`. For the full set of upstream changes see changelog [here](https://github.com/GoogleChrome/web-vitals/blob/main/CHANGELOG.md#v500-2025-05-07)

### ✨ Features
- feat: telemetry distro attrs (#530) | @martin308

### 🐛 Fixes
- fix: upgrade orb version to test bugfix (#524) | @arriIsHere

### 🛠️ Maintenance
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 9 updates (#535) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 3 updates (#536) | @dependabot
- chore: Upgrade to web-vitals 5.0.0 (#534) | @wolfgangcodes
- maint(deps): bump @opentelemetry/semantic-conventions from 1.32.0 to 1.33.0 in /packages/honeycomb-opentelemetry-web in the otel group (#532) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 3 updates (#533) | @dependabot
- maint(deps): bump @babel/runtime from 7.27.0 to 7.27.1 in /packages/honeycomb-opentelemetry-web (#529) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 3 updates (#528) | @dependabot
- maint(deps-dev): bump http-proxy-middleware from 2.0.7 to 2.0.9 in /packages/honeycomb-opentelemetry-web/examples/custom-with-collector-ts (#527) | @dependabot
- maint(deps): bump the example-deps group across 6 directories with 9 updates (#525) | @dependabot
- maint: remove .github/workflows/gh-issue-to-asana.yml (#526) | @martin308
- maint(deps-dev): bump rollup from 4.40.0 to 4.40.1 in /packages/honeycomb-opentelemetry-web in the dev-dependencies group (#521) | @dependabot
- maint(deps): bump http-proxy-middleware from 2.0.7 to 2.0.9 in /packages/honeycomb-opentelemetry-web/examples/hello-world-react-create-app (#522) | @dependabot
- maint(deps): bump react-router and react-router-dom in /packages/honeycomb-opentelemetry-web/examples/experimental/user-interaction-instrumentation (#523) | @dependabot
- maint(deps): bump react-router and react-router-dom in /packages/honeycomb-opentelemetry-web/examples/hello-world-react-create-app (#520) | @dependabot

## v0.17.1 [beta] - 2025-04-24

### 🐛 Fixes

- fix: Add repository to package.json (#518) | @pkanal
- fix: explicitly add default resource attributes (#517) | @pkanal

### 🛠️ Maintenance

- maint(deps): bump @opentelemetry/semantic-conventions from 1.30.0 to 1.32.0 in /packages/honeycomb-opentelemetry-web in the otel group (#512) | @dependabot
- Add top-level types element to package.json (#499) | @sodabrew
 (tag: honeycomb-opentelemetry-web-v0.17.0)- rel: v0.17.0 (#511) | @pkanal

## v0.17.0 [beta] - 2025-04-07

### ✨ Features

- feat: add an option to disable automatic browser attributes (#510) | @beekhc

### 🛠️ Maintenance

- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 3 updates (#509) | @dependabot

## v0.16.0 [beta] - 2025-04-04

### ✨ Features

- feat: Export types and BaggageSpanProcessor (#502) | @pkanal

### 🛠️ Maintenance

- maint: Upgrade to v2.0.0/v0.200.0 upstream OTel packages (#503) | @pkanal
- maint: Upgrade @opentelemetry/core to v2 (#507) | @pkanal
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 2 updates (#504) | @dependabot
- maint(deps): bump the example-deps group across 6 directories with 6 updates (#506) | @dependabot
- maint(deps): bump @babel/runtime from 7.26.10 to 7.27.0 in /packages/honeycomb-opentelemetry-web (#505) | @dependabot

## v0.15.0 [beta] - 2025-03-24

### ✨ Features

- feat: Allow custom session id provider (#489) | @martin308

### 🛠️ Maintenance

- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 2 updates (#496) | @dependabot
- maint: Peer dependencies and testing for v2 network instrumentation (#493) | @pkanal
- maint(deps-dev): bump esbuild from 0.23.0 to 0.25.1 in /packages/honeycomb-opentelemetry-web (#495) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 2 updates (#491) | @dependabot
- maint(deps): bump the example-deps group across 6 directories with 13 updates (#492) | @dependabot
- maint: Consolidate all the dependabot for examples (#486) | @martin308
- maint: npm update all examples (#488) | @martin308
- maint: Use LTS tag (#487) | @martin308

## v0.14.0 [beta] - 2025-03-19

### ✨ Features

- feat: Add node export to package json (#483) | David Hewitt
- docs: Updates READMEs to match project structure. (#478) | Bee Klimt

### 🐛 Fixes

- fix: Dont validate options when using a custom collector. (#477) | Bee Klimt

### 🛠️ Maintenance

- chore: remove unused gh action (#468) | Mustafa Haddara
- maint(deps): bump @babel/runtime from 7.26.7 to 7.26.9 in /packages/honeycomb-opentelemetry-web (#463) | dependabot[bot]
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 3 updates (#474) | dependabot[bot]
- maint(deps-dev): bump webpack from 5.97.1 to 5.98.0 in /packages/honeycomb-opentelemetry-web/examples/custom-with-collector-ts in the example-deps group (#473) | dependabot[bot]
- maint(deps-dev): bump esbuild from 0.24.2 to 0.25.0 in /packages/honeycomb-opentelemetry-web/examples/hello-world-custom-exporter in the example-deps group (#471) | dependabot[bot]
- maint(deps): bump the example-deps group in /packages/honeycomb-opentelemetry-web/examples/hello-world-react-create-app with 5 updates (#472) | dependabot[bot]
- maint(deps-dev): bump esbuild from 0.24.2 to 0.25.0 in /packages/honeycomb-opentelemetry-web/examples/hello-world-cjs in the example-deps group (#470) | dependabot[bot]
- maint(deps-dev): bump esbuild from 0.24.2 to 0.25.0 in /packages/honeycomb-opentelemetry-web/examples/hello-world-web in the example-deps group (#469) | dependabot[bot]
- maint(deps): bump the otel group across 1 directory with 5 updates (#465) | dependabot[bot]
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 8 updates (#466) | dependabot[bot]
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 3 updates (#482) | dependabot[bot]
- maint(deps): bump @babel/runtime from 7.26.9 to 7.26.10 in /packages/honeycomb-opentelemetry-web (#481) | dependabot[bot]

## v0.13.0 [beta] - 2025-02-10

### 🐛 Fixes

- fix: Export experimental packages as part of the core package (#459) | @pkanal

### 🛠️ Maintenance

- maint(deps): bump @opentelemetry/semantic-conventions from 1.28.0 to 1.29.0 in /packages/honeycomb-opentelemetry-web in the otel group (#457) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 5 updates (#458) | @dependabot

## v0.12.1 [beta] - 2025-02-04

### 🛠️ Maintenance

- maint(deps-dev): bump rollup from 4.32.0 to 4.34.1 in /packages/honeycomb-opentelemetry-web in the dev-dependencies group (#455) | @dependabot
- maint(deps): bump the example-deps group in /packages/honeycomb-opentelemetry-web/examples/hello-world-react-create-app with 6 updates (#454) | @dependabot
- fix: Update README.md (#453) | @maecapozzi
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 2 updates (#451) | @dependabot
- maint(deps): bump @babel/runtime from 7.26.0 to 7.26.7 in /packages/honeycomb-opentelemetry-web (#452) | @dependabot
- chore: Update versions and links (#450) | @martin308
- fix: releasing.md updates (#449) | @martin308

## v0.12.0 [beta] - 2025-01-21

### ✨ Features

- feat(error-autoinstrumentation): Add applyCustomAttribitesToSpan config option (#447) | @pkanal
- docs: Docs for recordException function (#446) | @pkanal
- fix: Fallback to default trace endpoint for link exporter. (#444) | @wolfgangcodes
- fix: Add guard for null stack from tracekit. (#442) | @wolfgangcodes

### 🛠️ Maintenance

- maint(deps-dev): bump @testing-library/user-event from 14.5.2 to 14.6.0 in /packages/honeycomb-opentelemetry-web/examples/hello-world-react-create-app in the example-deps group (#440) | @dependabot
- maint(deps): bump @opentelemetry/context-zone from 1.30.0 to 1.30.1 in /packages/honeycomb-opentelemetry-web/examples/hello-world-web in the example-deps group (#439) | @dependabot
- maint(deps): bump @opentelemetry/context-zone from 1.30.0 to 1.30.1 in /packages/honeycomb-opentelemetry-web/examples/hello-world-custom-exporter in the example-deps group (#438) | @dependabot
- maint(deps-dev): bump ts-loader from 9.5.1 to 9.5.2 in /packages/honeycomb-opentelemetry-web/examples/custom-with-collector-ts in the example-deps group (#437) | @dependabot
- maint(deps-dev): bump rollup from 4.30.1 to 4.31.0 in /packages/honeycomb-opentelemetry-web in the dev-dependencies group (#445) | @dependabot
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 7 updates (#441) | @dependabot
- maint: Remove experimental-opentelemetry-web (#435) | @wolfgangcodes
- maint(deps): bump the example-deps group across 1 directory with 10 updates (#436) | @dependabot
- maint: Move experimental user-interaction-instrumentation into honeycomb-opentelemetry-web/experimental so we can remove experimental-opentelemetry-web (#434) | @wolfgangcodes

## v0.11.0 [beta] - 2025-01-14

### ✨ Features

- feat(honeycomb-opentelemetry-web): Add support for differing subdomains for debug link exporter. (#406) | @wolfgangcodes
- feat: Add `recordException` helper function (#431) | @pkanal

### 🛠️ Maintenance

- maint(deps): bump the otel group across 1 directory with 7 updates (#432) | @dependabot
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 8 updates (#417) | @dependabot
- maint(deps): bump ua-parser-js from 1.0.39 to 1.0.40 in /packages/honeycomb-opentelemetry-web (#419) | @dependabot
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 8 updates (#407) | @dependabot
- feat(honeycomb-opentelemetry-web): Add support for differing subdomains for debug link exporter. (#406) | @wolfgangcodes


## v0.10.0 [beta] - 2024-11-27

- maint(deps): bump the otel group in /packages/experimental-opentelemetry-web with 8 updates (#395) | @dependabot
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 9 updates (#397) | @dependabot
 (main)- maint(deps-dev): bump the dev-dependencies group in /packages/experimental-opentelemetry-web with 3 updates (#396) | @dependabot
- maint(deps-dev): bump the dev-dependencies group in /packages/honeycomb-opentelemetry-web with 4 updates (#398) | @dependabot
- fix: Fix TTFB and FCP metrics not appearing (#394) | @jairo-mendoza
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 3 updates (#388) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 4 updates (#391) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 2 updates (#392) | @dependabot
- docs: Update readme's to include new errors attributes (#393) | @jairo-mendoza
- feat: Update tests to use mocked stacktrace (#390) | @jairo-mendoza
- feat: Add additional fields collected by the TraceKit package for stack traces (#383) | @jairo-mendoza
- docs: add documentation on ContextManagers and Zone.js (#386) | @MustafaHaddara

## v0.9.0 [beta] - 2024-11-08
- (breaking) `headers` config option only accepts string keys (see upstream change in @opentelemetry/exporter-trace-otlp-http `v0.84.0`)
- docs: copy README to package directory (#384) | @mustafahaddara
- fix(rollup): Remove x64 specific package (#382) | @martin308
- maint(deps): bump the otel group across 1 directory with 7 updates (#381) | @dependabot
- maint(deps): bump @rollup/rollup-linux-x64-gnu from 4.24.3 to 4.24.4 in /packages/honeycomb-opentelemetry-web (#380) | @dependabot
- maint(deps): bump @opentelemetry/context-zone from 1.26.0 to 1.27.0 in /packages/honeycomb-opentelemetry-web/examples/hello-world-web in the example-deps group (#373) | @dependabot
- maint(deps): bump the example-deps group in /packages/honeycomb-opentelemetry-web/examples/hello-world-custom-exporter with 4 updates (#367) | @dependabot
- maint(deps): bump web-vitals from 4.2.3 to 4.2.4 in /packages/experimental-opentelemetry-web (#378) | @dependabot
- maint(deps): bump @babel/runtime from 7.25.9 to 7.26.0 in /packages/experimental-opentelemetry-web (#379) | @dependabot
- maint(deps): bump the otel group in /packages/honeycomb-opentelemetry-web with 8 updates (#349) | @dependabot
- maint(deps): bump the example-deps group across 1 directory with 10 updates (#374) | @dependabot
- maint(deps-dev): bump the example-deps group across 1 directory with 3 updates (#372) | @dependabot
- maint(deps-dev): bump the example-deps group in /packages/honeycomb-opentelemetry-web/examples/hello-world-cjs with 3 updates (#364) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 7 updates (#375) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 9 updates (#377) | @dependabot
- maint(deps-dev): bump the example-deps group in /packages/honeycomb-opentelemetry-web/examples/hello-world-cdn with 2 updates (#360) | @dependabot
- maint(deps): bump @rollup/rollup-linux-x64-gnu from 4.24.0 to 4.24.3 in /packages/experimental-opentelemetry-web (#363) | @dependabot
- maint(deps): bump web-vitals from 4.2.3 to 4.2.4 in /packages/honeycomb-opentelemetry-web (#361) | @dependabot
- maint(deps): bump @babel/runtime from 7.25.9 to 7.26.0 in /packages/honeycomb-opentelemetry-web (#365) | @dependabot
- chore(dependabot): Dependabot maintenance (#359) | @pkanal
- maint(deps): bump @babel/runtime from 7.24.7 to 7.25.9 in /packages/experimental-opentelemetry-web (#347) | @dependabot
- maint(deps): bump @babel/runtime from 7.25.0 to 7.25.9 in /packages/honeycomb-opentelemetry-web (#345) | @dependabot
- maint(deps-dev): bump @babel/plugin-transform-runtime from 7.25.4 to 7.25.9 in /packages/honeycomb-opentelemetry-web (#344) | @dependabot
- maint(deps-dev): bump tslib from 2.7.0 to 2.8.0 in /packages/honeycomb-opentelemetry-web (#339) | @dependabot
- maint(deps-dev): bump tslib from 2.7.0 to 2.8.0 in /packages/experimental-opentelemetry-web (#334) | @dependabot
- maint(deps): bump ua-parser-js from 1.0.38 to 1.0.39 in /packages/honeycomb-opentelemetry-web (#338) | @dependabot
- maint(deps-dev): bump rollup from 4.21.3 to 4.24.0 in /packages/honeycomb-opentelemetry-web (#336) | @dependabot
- maint(deps-dev): bump @babel/preset-env from 7.25.4 to 7.25.8 in /packages/experimental-opentelemetry-web (#335) | @dependabot
- maint(deps-dev): bump @rollup/plugin-alias from 5.1.0 to 5.1.1 in /packages/experimental-opentelemetry-web (#332) | @dependabot
- maint(deps-dev): bump @babel/plugin-transform-runtime from 7.24.7 to 7.25.7 in /packages/experimental-opentelemetry-web (#331) | @dependabot
- maint(deps-dev): bump serve from 14.2.3 to 14.2.4 in /packages/honeycomb-opentelemetry-web/examples/hello-world-web in the example-deps group (#341) | @dependabot

## v0.8.1 [beta] - 2024-10-22
- fix(honeycomb-opentelemetry-web): Add check for lcpEntry.element (#342) | @wolfgangcodes

## v0.8.0 [Beta] - 2024-10-17
- fix: This code duplicated  not needed. (#329) | @wolfgangcodes
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 4 updates (#325) | @dependabot
- maint(deps-dev): bump tslib from 2.6.3 to 2.7.0 in /packages/honeycomb-opentelemetry-web (#295) | @dependabot
- maint(deps-dev): bump husky from 9.1.4 to 9.1.6 in /packages/honeycomb-opentelemetry-web (#293) | @dependabot
- maint(deps-dev): bump the example-deps group across 1 directory with 2 updates (#306) | @dependabot
- maint(deps): bump @rollup/rollup-linux-x64-gnu from 4.21.3 to 4.24.0 in /packages/honeycomb-opentelemetry-web (#321) | @dependabot
- maint(deps-dev): bump @babel/preset-env from 7.25.3 to 7.25.8 in /packages/honeycomb-opentelemetry-web (#326) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 5 updates (#327) | @dependabot
- feat: Allow Disabling the default Exporter (#328) | @arriIsHere
- feat: Add log level config option to SDK (#315) | @jairo-mendoza
- feat(honeycomb-opentelemetry-web): Add data attributtes for LCP. (#309) | @wolfgangcodes
- feat(codeowners): team rename (#324) | @martin308
- maint(deps): bump the otel group across 1 directory with 8 updates (#263) | @dependabot
- feat: support multiple exporters (#303) | @arriIsHere
- chore: Update release readme. (#302) | @wolfgangcodes

## v0.7.0 [beta] - 2024-09-16
- maint(deps): bump the example-deps group across 1 directory with 3 updates (#288) | @dependabot
- maint(deps-dev): bump rollup from 4.20.0 to 4.21.3 in /packages/honeycomb-opentelemetry-web (#289) | @dependabot
- maint(deps-dev): bump lint-staged from 15.2.8 to 15.2.10 in /packages/honeycomb-opentelemetry-web (#277) | @dependabot
- maint(deps): bump @rollup/rollup-linux-x64-gnu from 4.20.0 to 4.21.3 in /packages/honeycomb-opentelemetry-web (#290) | @dependabot
- feat: Add CDN example. (#280) | @wolfgangcodes
- chore: Update readme for webVitalsInstrumentationConfig and globalErrorsInstrumentationConfig (#283) | @wolfgangcodes
- maint(deps-dev): bump @babel/plugin-transform-runtime from 7.24.7 to 7.25.4 in /packages/honeycomb-opentelemetry-web (#287) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 3 updates (#284) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 3 updates (#286) | @dependabot
- fix: Make applyCustomAttributes optional. (#281) | @wolfgangcodes
- chore: Update readme links to docs (#242) | @wolfgangcodes
- chore: update gitignore paths (#239) | @pkanal
- docs: Add example for a span processor that hooks into react router (#233) | @pkanal
-
## v0.6.0 [beta] - 2024-08-09
- feat: Add LOAF support for onINP (#191) | @wolfgangcodes
- docs: Tell people about the session ID (#232) | @jessitron
- refactor: export multiple packages (#203) | @MustafaHaddara
- feat: Support multiple span processors (#212) | @pkanal
- chore: dependabot should ignore major version upgrades (#210) | @pkanal
- fix: npm audit vulnerability (#209) | @pkanal
- chore: Use Approximately equivalent to version for eslint b/c peer dep (#196) | @wolfgangcodes
- maint(deps): bump ua-parser-js from 1.0.37 to 1.0.38 in /packages/honeycomb-react-user-instrumentation (#227) | @dependabot
- maint(deps): bump @rollup/rollup-linux-x64-gnu from 4.9.5 to 4.20.0 in /packages/honeycomb-react-user-instrumentation (#229) | @dependabot
- maint: update package paths for dependabot (#218) | @MustafaHaddara
- maint(deps): bump web-vitals from 4.2.1 to 4.2.2 (#199) | @dependabot

## v0.5.0 [beta] - 2024-07-18
- maint(deps-dev): bump esbuild from 0.21.5 to 0.22.0 in /examples/hello-world-web in the example-deps group (#184) | @dependabot
- maint(deps): bump web-vitals from 4.2.0 to 4.2.1 (#183) | @dependabot
- docs: update vulnerability reporting process (#193) | @robbkidd
- feat: Bundle using Rollup for multi-module support. (#175) | @wolfgangcodes
- maint: Remove Pipeline team as code owners from web distro (#190) | @akvanhar
- feat: Add Global Error Instrumentation (#186) | @wolfgangcodes @nordfjord
- feat: Update example to nest spans. (#189) | @wolfgangcodes

## v0.4.0 [beta] - 2024-06-21
- maint(deps): bump the otel group across 1 directory with 9 updates (#178) | @dependabot
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 6 updates (#179) | @dependabot
- maint(deps): bump web-vitals from 4.0.1 to 4.2.0 (#177) | @dependabot
- maint(deps-dev): bump esbuild from 0.21.3 to 0.21.5 in /examples/hello-world-web in the example-deps group across 1 directory (#176) | @dependabot
- maint(deps): bump ua-parser-js from 1.0.37 to 1.0.38 (#163) | @dependabot
- docs: add example config & API calls for network events (#165) | @MustafaHaddara
- feat: include url.path attribute (#171) | @MustafaHaddara

## v0.3.0 [beta] - 2024-05-23
- maint(deps): bump the otel group with 8 updates (#147) | @dependabot
- maint(deps-dev): bump the dev-dependencies group with 2 updates (#155) | @dependabot
- maint(deps-dev): bump esbuild from 0.20.2 to 0.21.3 in /examples/hello-world-web in the example-deps group across 1 directory (#157) | @dependabot
- maint(deps): bump web-vitals from 4.0.0 to 4.0.1 (#158) | @dependabot
- feat: Upgrade to web-vitals@4.0.0 (#152) | @wolfgangcodes
- feat: add device.type and network.effectiveType attributes (#154) | @mustafahaddara
- fix: Use constant for `service.name` from semconv library (#153) | @pkanal
- feat: drop axios requirement (#151) | @mustafahaddara
- fix: Add missing dependency shimmer to package.json (#150) | @tayles
- maint: adding more detail to the release guide (#146) | @mustafahaddara

## v0.2.1 [beta] - 2024-05-10
- maint(deps-dev): bump the dev-dependencies group across 1 directory with 3 updates (#144) | @dependabot
- fix: Add ability to disable, don't clobber defaults when passing other config params. (#140) | @wolfgangcodes
- fix: properly declare devDependencies (#143) | @mustafahaddara

## v0.2.0 [beta] - 2024-05-01
- fix: add opentelemetry/core as a peerdependency to package.json (#136) | @Aghassi
- feat: Add headers option to main SDK config (#135) | @pkanal
- maint(deps): bump the otel group with 7 updates (#133) | @dependabot
- maint(deps): bump the dev-dependencies group across 1 directory with 3 updates (#132) | @dependabot
- maint(deps): bump the example-deps group in /examples/hello-world-web with 2 updates (#131) | @dependabot
- feat: add browser.name attribute (#130) | @mustafahaddara
- feat: Add s/m/l screen size resource attribute (#129) | @pkanal

## v0.1.1 [beta] - 2024-04-16

- maint(deps): bump the otel group with 7 updates (#122) | @dependabot
- maint(deps): bump the dev-dependencies group with 4 updates (#123) | @dependabot
- maint(deps): bump the example-deps group in /examples/hello-world-web with 2 updates (#120) | @dependabot
- maint(deps): bump axios from 1.6.7 to 1.6.8 (#112) | @dependabot

## v0.1.0 [beta] - 2024-03-13

- maint(deps): bump the example-deps group in /examples/hello-world-web with 1 update (#104) | @dependabot
- maint(deps): bump the dev-dependencies group with 3 updates (#108) | @dependabot
- maint(deps): bump the otel group with 8 updates (#97) | @dependabot
- docs: add auto-instrumentation details (#103) |@pkanal
- feat: Auto-enable web vitals instrumentation (#106) | @pkanal @wolfgangcodes
- maint: Update ubuntu image in workflows to latest (#107) | @MikeGoldsmith

## v0.0.4 [alpha] - 2024-03-07

### Enhancements

- feat: add support for classic ingest keys (#101) | @cewkrupa @JamieDanielson
- docs: Web Vitals Readme (#99) | @pkanal
- docs: make this line c&p-able (#96) | @jessitron

## v0.0.3 [alpha] - 2024-02-28

### Enhancements

- docs: add JS docs for web vitals instrumentation (#92) | @pkanal @JamieDanielson
- feat: ✨ Config for web vitals (#91) | @pkanal
- feat: initial web vitals instrumentation  (#84) | @pkanal

### Maintenance

- fix: update version and add version change to releasing doc (#90) | @JamieDanielson
- maint(deps-dev): bump the example-deps group in /examples/hello-world-web with 1 update (#82) | @dependabot
- maint(deps): bump the dev-dependencies group with 3 updates (#89) | @dependabot
- maint: add releaseyml for generated release notes (#88) | @JamieDanielson

## v0.0.2 [alpha] - 2024-02-23

### Enhancements

- feat: add localVisualizations for link to Honeycomb trace (#81) | @JamieDanielson
- feat: ✨ Add `skipOptionsValidation` option and validate options (#77) | @pkanal
- feat: add BaggageSpanProcessor (#74) | @JamieDanielson
- feat: ✨ add support for plain objects when initializing resource (#34) | @ahrbnsn
- feat: add AlwaysOffSampler (#72) | @JamieDanielson
- feat: Add DeterministicSampler for easier sampling (#70) | @JamieDanielson
- feat: allow custom override of entry page attributes (#62) | @ahrbnsn

### Maintenance

- maint: build out smoke test with more detailed example app (#85) | @JamieDanielson
- maint: test and local dev notes cleanup (#71) | @JamieDanielson
- maint(deps-dev): bump the example-deps group in /examples/hello-world-web with 1 update (#65) | dependabot[bot]
- maint(deps): bump the dev-dependencies group with 4 updates (#64) | dependabot[bot]
- fix(ci): update publish steps to depend on smoke tests (#60) | @pkanal

## v0.0.1 [alpha] - 2024-01-31

🎉 Initial alpha release of Honeycomb's OpenTelemetry Web Distro! 🎉
