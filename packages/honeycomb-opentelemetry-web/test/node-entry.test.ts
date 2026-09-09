import { describe, expect, it } from 'vitest';
import * as browserEntry from '../src/index';
import * as nodeEntry from '../src/node';

/* The `node` and `react-server` export conditions resolve to src/node.ts, so a
 * name exported from the browser entry but missing here becomes `undefined` for
 * every server-rendered or Node-side consumer — at the point of use, far from
 * the cause. */
describe('non-browser entry point', () => {
  it('exports everything the browser entry does', () => {
    const missing = Object.keys(browserEntry).filter(
      (name) => !(name in nodeEntry),
    );

    expect(missing).toEqual([]);
  });

  it('constructs and runs without a DOM', () => {
    const globals = ['window', 'document', 'navigator'] as const;
    const saved = globals.map((name) => [name, globalThis[name]] as const);
    globals.forEach((name) => {
      delete globalThis[name];
    });

    try {
      const sdk = new nodeEntry.HoneycombWebSDK({
        apiKey: 'x'.repeat(32),
        serviceName: 'test',
      });
      sdk.start();

      expect(() => nodeEntry.recordException(new Error('boom'))).not.toThrow();
      expect(new nodeEntry.WebVitalsInstrumentation().isEnabled()).toBe(false);
    } finally {
      saved.forEach(([name, value]) => {
        Object.defineProperty(globalThis, name, {
          value,
          configurable: true,
          writable: true,
        });
      });
    }
  });
});
