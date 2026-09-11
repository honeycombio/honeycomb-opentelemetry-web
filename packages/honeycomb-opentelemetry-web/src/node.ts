/**
 * The entry point for environments with no DOM. The `node` and `react-server`
 * export conditions select this file.
 *
 * This package is for browsers. The browser build reads `window`, `document`
 * and `navigator`. Node does not have these globals. A server, a Node test
 * runner and React Server Components can run browser code in Node. If these
 * environments load the browser build, the import fails.
 *
 * This build has the same exports as `./index`, but each export does nothing.
 * An import is always safe. Only the browser build collects telemetry.
 *
 * Also export each value from `./index` in this file. A type check fails if you
 * do not. See `test/node-entry.test.ts`.
 */

import { diag } from '@opentelemetry/api';

export * from './semantic-attributes';

let warned = false;
function logInertUsage(what: string) {
  if (warned) return;
  warned = true;
  diag.debug(
    `@honeycombio/opentelemetry-web: ${what} ran outside a browser. ` +
      `This build collects no telemetry. You probably created this object in a ` +
      `Node context. Examples are a test runner and a server component. ` +
      `To instrument Node, use the OpenTelemetry Node SDK: ` +
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
 * This function does nothing outside a browser. It discards the error and
 * throws no exception. The browser build records an `exception` span.
 */
export const recordException: (
  error?: unknown,
  attributes?: unknown,
  tracer?: unknown,
  applyCustomAttributesOnSpan?: unknown,
) => void = () => {};
