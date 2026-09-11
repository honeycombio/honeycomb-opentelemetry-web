// @vitest-environment node

import { diag, DiagLogLevel } from '@opentelemetry/api';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';

type LogFn = (message: string, ...args: unknown[]) => void;

/**
 * Parity, enforced at compile time. The `node` and `react-server` conditions
 * resolve to this module, so a name exported from the browser entry but missing
 * here is `undefined` for every server-rendered and Node-side consumer, and
 * surfaces at the point of use rather than here.
 *
 * `tsconfig.typecheck.json` covers ./test, so a gap fails `npm run typecheck`
 * and the error names the missing export.
 */
type MissingFromNodeEntry = Exclude<
  keyof typeof import('../src/index'),
  keyof typeof import('../src/node')
>;
type AssertNever<T extends never> = T;
type NodeEntryParity = AssertNever<MissingFromNodeEntry>;

/* Unlike the rest of the suite this file runs in a real Node environment, so
 * `window` is absent while the module under test is evaluated. Imports are
 * hoisted, so deleting globals inside a test body would run after evaluation
 * and could never catch a module-scope read, which is how 1.5.0 broke. */
describe('non-browser entry point', () => {
  let nodeEntry: typeof import('../src/node');
  let debug: Mock<LogFn>;

  beforeEach(async () => {
    /* The inert build logs its notice once per module instance. Reset the
     * registry so each test gets its own and can run in any order. */
    vi.resetModules();

    debug = vi.fn<LogFn>();
    diag.setLogger(
      {
        verbose: vi.fn<LogFn>(),
        debug,
        info: vi.fn<LogFn>(),
        warn: vi.fn<LogFn>(),
        error: vi.fn<LogFn>(),
      },
      DiagLogLevel.DEBUG,
    );

    nodeEntry = await import('../src/node');
  });

  afterEach(() => {
    diag.disable();
  });

  /* diag.setLogger announces its own registration, so pick out ours. */
  const noticesLogged = () =>
    debug.mock.calls
      .map((call) => String(call[0]))
      .filter((message) => message.includes('@honeycombio/opentelemetry-web'));

  it('names the Node SDK once, not on every construction', () => {
    new nodeEntry.HoneycombWebSDK({
      apiKey: 'x'.repeat(32),
      serviceName: 'test',
    });
    new nodeEntry.WebVitalsInstrumentation();

    const notices = noticesLogged();

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
