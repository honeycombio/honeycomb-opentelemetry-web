// @vitest-environment node

import { diag, DiagLogLevel } from '@opentelemetry/api';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as nodeEntry from '../src/node';

/**
 * Parity, enforced at compile time. The `node` and `react-server` conditions
 * resolve to this module, so a name exported from the browser entry but missing
 * here is `undefined` for every server-rendered and Node-side consumer — and
 * surfaces at the point of use, far from the cause.
 *
 * `tsconfig.typecheck.json` covers ./test, so a gap fails `npm run typecheck`
 * and the error names the missing export, rather than waiting for a test run.
 */
type MissingFromNodeEntry = Exclude<
  keyof typeof import('../src/index'),
  keyof typeof import('../src/node')
>;
type AssertNever<T extends never> = T;
type NodeEntryParity = AssertNever<MissingFromNodeEntry>;

/* Unlike the rest of the suite this file runs in a real Node environment, so
 * `window` is absent while this module is evaluated rather than deleted
 * afterwards. Imports are hoisted, so a browser global read at module scope —
 * the way 1.5.0 broke — fails the file outright; deleting globals inside a test
 * body happens too late to catch it. */
describe('non-browser entry point', () => {
  afterEach(() => {
    diag.disable();
  });

  /* Must stay first: the notice fires once per module instance, and the other
   * tests below construct the same instance. */
  it('names the Node SDK once, not on every construction', () => {
    const debug = vi.fn();
    diag.setLogger(
      { verbose: vi.fn(), debug, info: vi.fn(), warn: vi.fn(), error: vi.fn() },
      DiagLogLevel.DEBUG,
    );

    new nodeEntry.HoneycombWebSDK({
      apiKey: 'x'.repeat(32),
      serviceName: 'test',
    });
    new nodeEntry.WebVitalsInstrumentation();

    /* diag.setLogger announces its own registration, so pick out ours. */
    const notices = debug.mock.calls
      .map((call) => String(call[0]))
      .filter((message) => message.includes('@honeycombio/opentelemetry-web'));

    expect(notices).toHaveLength(1);
    expect(notices[0]).toContain('@honeycombio/opentelemetry-node');
  });

  /* `navigator` is deliberately not asserted on: Node has shipped a global
   * Navigator since v21, so unlike `window` and `document` it says nothing
   * about whether a DOM is present. */
  it('loads with no DOM present', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('is inert rather than throwing', () => {
    const sdk = new nodeEntry.HoneycombWebSDK({
      apiKey: 'x'.repeat(32),
      serviceName: 'test',
    });

    expect(() => sdk.start()).not.toThrow();
    expect(() => nodeEntry.recordException(new Error('boom'))).not.toThrow();
    expect(new nodeEntry.WebVitalsInstrumentation().isEnabled()).toBe(false);
  });
});

export type { NodeEntryParity };
