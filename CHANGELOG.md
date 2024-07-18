# honeycomb-opentelemetry-web changelog

## v0.5.0 [beta] - 2024-07-18
- maint(deps-dev): bump esbuild from 0.21.5 to 0.22.0 in /examples/hello-world-web in the example-deps group (#184) | @dependabot
- maint(deps): bump web-vitals from 4.2.0 to 4.2.1 (#183) | @dependabot
- docs: update vulnerability reporting process (#193) | @robbkidd
- feat: Bundle using Rollup for multi-module support. (#175) | @wolfgangcodes
 (main)- maint: Remove Pipeline team as code owners from web distro (#190) | @akvanhar
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
