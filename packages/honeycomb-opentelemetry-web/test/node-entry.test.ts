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
 * A type check makes sure that this build exports each value that the browser
 * build exports. The `node` and `react-server` conditions select this build. A
 * missing export becomes `undefined` for the caller, far from the cause.
 * `tsconfig.typecheck.json` includes ./test, so `npm run typecheck` fails and
 * gives the name of the export.
 */
type MissingFromNodeEntry = Exclude<
  keyof typeof import('../src/index'),
  keyof typeof import('../src/node')
>;
type AssertNever<T extends never> = T;
type NodeEntryParity = AssertNever<MissingFromNodeEntry>;

/* This file runs in Node. The other tests run in jsdom, which has a `window`.
 * Node does not, so a read of a browser global at module scope fails the
 * import. */
describe('non-browser entry point', () => {
  const CONFIG = { apiKey: 'x'.repeat(32), serviceName: 'test' };

  let nodeEntry: typeof import('../src/node');
  let debug: Mock<LogFn>;

  beforeEach(async () => {
    /* The build sends the notice one time for each module instance. Give each
     * test a new instance, so the tests can run in any sequence. */
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

  it('Logs an inert notice when the caller starts the SDK.', () => {
    new nodeEntry.HoneycombWebSDK(CONFIG).start();

    /* `diag.setLogger` logs its own registration, so select our notices. */
    const notices = debug.mock.calls
      .map((call) => String(call[0]))
      .filter((message) => message.includes('@honeycombio/opentelemetry-web'));

    expect(notices).toHaveLength(1);
    expect(notices[0]).toContain('HoneycombWebSDK');
    expect(notices[0]).toContain('@opentelemetry/sdk-node');
  });

  it('Logs an inert notice when the caller creates an instrumentation.', () => {
    new nodeEntry.WebVitalsInstrumentation();

    const notices = debug.mock.calls
      .map((call) => String(call[0]))
      .filter((message) => message.includes('@honeycombio/opentelemetry-web'));

    expect(notices).toHaveLength(1);
    expect(notices[0]).toContain('WebVitalsInstrumentation');
  });

  it('Can start the SDK without throwing.', () => {
    const sdk = new nodeEntry.HoneycombWebSDK(CONFIG);

    expect(() => sdk.start()).not.toThrow();
  });
});

export type { NodeEntryParity };
