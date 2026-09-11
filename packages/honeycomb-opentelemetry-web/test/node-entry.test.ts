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
 * The `node` and `react-server` conditions select the inert build. The inert
 * build must export every value that the browser build exports. If an export
 * is absent, the caller receives `undefined`.
 *
 * `tsconfig.typecheck.json` includes ./test. `npm run typecheck` fails and
 * gives the name of the absent export.
 */
type MissingFromNodeEntry = Exclude<
  keyof typeof import('../src/index'),
  keyof typeof import('../src/node')
>;
type AssertNever<T extends never> = T;
type NodeEntryParity = AssertNever<MissingFromNodeEntry>;

/* This file runs in Node. The other tests run in jsdom. Node has no `window`.
 * If this file reads a browser global at module scope, the import fails. */
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

  it('Logs an inert notice when the caller creates the SDK.', () => {
    new nodeEntry.HoneycombWebSDK(CONFIG);

    /* `diag.setLogger` logs its own registration. Select only the notices from
     * this package. */
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

  it('Starts the SDK and throws no error.', () => {
    const sdk = new nodeEntry.HoneycombWebSDK(CONFIG);

    expect(() => sdk.start()).not.toThrow();
  });

  it('Records an exception and throws no error.', () => {
    expect(() => nodeEntry.recordException(new Error('boom'))).not.toThrow();
  });
});

export type { NodeEntryParity };
