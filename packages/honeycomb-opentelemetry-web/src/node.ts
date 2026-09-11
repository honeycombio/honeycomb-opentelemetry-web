/**
 * This file is the entry point for environments with no DOM. The `node` and
 * `react-server` export conditions select it.
 *
 * The `@honeycombio/opentelemetry-web` package is intended to be run in a
 * browser context.
 *
 * A browser provides `window`, `document`, etc. Node does not have these
 * globals, which can cause unexpected errors at import and instantiation time.
 *
 * This inert build has the same exports as `./index`, but each export is a
 * no-op and emits no telemetry.
 *
 * Each value exported from `./index` must also be exported from this file.
 * A type check in `test/node-entry.test.ts` enforces this.
 *
 * To instrument in a Node context, consider @opentelemetry/sdk-node.
 */

import { diag } from '@opentelemetry/api';

export * from './semantic-attributes';

let warned = false;
function logInertUsage(what: string) {
  if (warned) return;
  warned = true;
  diag.debug(
    `@honeycombio/opentelemetry-web: ${what} ran outside a browser, for ` +
      `example in a test runner or a server component. This build collects ` +
      `no telemetry. To instrument Node, use the OpenTelemetry Node SDK: ` +
      `@opentelemetry/sdk-node.`,
  );
}

class InertInstrumentation {
  constructor(config?: unknown) {
    void config;
    logInertUsage(new.target.name);
  }
  init() {}
  enable() {}
  disable() {}
  isEnabled() {
    return false;
  }
  setTracerProvider: (provider?: unknown) => void = () => {};
  setMeterProvider: (provider?: unknown) => void = () => {};
  setConfig: (config?: unknown) => void = () => {};
  getConfig() {
    return {};
  }
}

export class WebSDK {
  constructor(options?: unknown) {
    void options;
    logInertUsage(new.target.name);
  }
  start() {}
  shutdown() {
    return Promise.resolve();
  }
}

export class HoneycombWebSDK extends WebSDK {}

export class WebVitalsInstrumentation extends InertInstrumentation {}
export class GlobalErrorsInstrumentation extends InertInstrumentation {}
export class UserInteractionInstrumentation extends InertInstrumentation {}

export class BaggageSpanProcessor {
  onStart: (span?: unknown, context?: unknown) => void = () => {};
  onEnd: (span?: unknown) => void = () => {};
  forceFlush() {
    return Promise.resolve();
  }
  shutdown() {
    return Promise.resolve();
  }
}

/**
 * This function discards the error and throws no exception.
 */
export const recordException: (
  error?: unknown,
  attributes?: unknown,
  tracer?: unknown,
  applyCustomAttributesOnSpan?: unknown,
) => void = () => {};
