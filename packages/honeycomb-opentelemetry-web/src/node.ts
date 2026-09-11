/**
 * Non-browser entry point, selected by the `node` and `react-server` export
 * conditions.
 *
 * This package targets browsers: it reads `window`, `document` and `navigator`,
 * and so does the upstream instrumentation it bundles. Server rendering,
 * Node-target test runners and RSC all evaluate client modules in Node, where
 * those globals do not exist, so resolving them to the browser build makes a
 * bare `import` fatal — before any of the caller's own code runs.
 *
 * Rather than guard every browser global, this build gives those environments
 * something inert with the same shape. Importing is always safe; collection
 * happens in the browser, where the real build is resolved.
 *
 * Every value exported from `./index` must be exported here too;
 * `test/node-entry.test.ts` enforces that at type-check time.
 */

import { diag } from '@opentelemetry/api';

/* Pure string constants — no DOM access, and useful in code shared between
 * browser and server, so they are re-exported rather than stubbed. */
export * from './semantic-attributes';

let warned = false;
function noteInertUsage(what: string) {
  if (warned) return;
  warned = true;
  diag.debug(
    `@honeycombio/opentelemetry-web: ${what} was constructed outside a browser, ` +
      `so no telemetry will be collected here. This is expected during server ` +
      `rendering or in Node-based test runners; the browser build is used in ` +
      `the browser. To instrument the server itself, use the Node distribution, ` +
      `@honeycombio/opentelemetry-node.`,
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
    noteInertUsage('WebSDK');
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
