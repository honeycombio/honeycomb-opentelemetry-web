/**
 * The entry point for environments with no DOM. The `node` and `react-server`
 * export conditions select this file.
 *
 * This package is for browsers. It reads `window`, `document` and `navigator`.
 * Node does not have these globals. Server rendering, Node test runners and
 * React Server Components run browser code in Node. If these environments load
 * the browser build, the import fails.
 *
 * This build has the same exports as `./index`, but each export does nothing.
 * An import is always safe. The browser build collects the telemetry.
 *
 * Export each value from `./index` in this file also. A type check fails if you
 * do not. See `test/node-entry.test.ts`.
 */

import { diag } from '@opentelemetry/api';

export * from './semantic-attributes';

let warned = false;
function noteInertUsage(what: string) {
  if (warned) return;
  warned = true;
  diag.debug(
    `@honeycombio/opentelemetry-web: ${what} ran outside a browser. ` +
      `This build collects no telemetry. This is correct for server rendering ` +
      `and for Node test runners. To instrument Node, use the OpenTelemetry ` +
      `Node SDK: @opentelemetry/sdk-node.`,
  );
}

class InertInstrumentation {
  constructor(config?: unknown) {
    void config;
    noteInertUsage(new.target.name);
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
  }
  start() {
    noteInertUsage(this.constructor.name);
  }
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
 * No-op outside a browser. The browser build records an `exception` span on the
 * registered tracer provider; with no provider registered there is nothing to
 * record to, so this discards rather than throwing.
 */
export const recordException: (
  error?: unknown,
  attributes?: unknown,
  tracer?: unknown,
  applyCustomAttributesOnSpan?: unknown,
) => void = () => {};
