/**
 * Telemetry parity guard for the HTTP semantic conventions.
 *
 * The web instrumentations emit *legacy* HTTP semconv by default: `http.url`,
 * `http.method`, `http.status_code` and friends, with span names like
 * `HTTP GET`. Upstream removed the `semconvStabilityOptIn` escape hatch in
 * 0.221.0 and emits only the stable names from that release onward, silently
 * renaming every HTTP field customers query, chart and alert on.
 *
 * These tests pin the mode the installed instrumentations resolve to, so that
 * migration can only land as a deliberate, reviewable change rather than
 * drifting in on a dependency bump.
 *
 * They assert configuration rather than emitted spans on purpose: both
 * instrumentations refuse to patch anything outside a real browser
 * (`FetchInstrumentation.enable()` returns early when `isNode`), so there is no
 * span to inspect under jsdom. End-to-end coverage of the emitted attributes
 * belongs in the Cypress suite, which runs in a real browser.
 */
import { SemconvStability } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';

/** The mode is resolved in the constructor and kept privately. */
const semconvModeOf = (instrumentation: object): SemconvStability =>
  (instrumentation as { _semconvStability: SemconvStability })
    ._semconvStability;

describe('HTTP semantic convention parity', () => {
  test('fetch defaults to legacy semantic conventions', () => {
    expect(semconvModeOf(new FetchInstrumentation())).toBe(
      SemconvStability.OLD,
    );
  });

  test('xml http request defaults to legacy semantic conventions', () => {
    expect(semconvModeOf(new XMLHttpRequestInstrumentation())).toBe(
      SemconvStability.OLD,
    );
  });

  /* Proves the opt-in still exists. When this stops working, the instrumentation
   * has moved to stable-only semconv and customers' HTTP fields have been
   * renamed underneath them. */
  test('the stable opt-in is still available', () => {
    expect(
      semconvModeOf(
        new FetchInstrumentation({ semconvStabilityOptIn: 'http' }),
      ),
    ).toBe(SemconvStability.STABLE);

    expect(
      semconvModeOf(
        new FetchInstrumentation({ semconvStabilityOptIn: 'http/dup' }),
      ),
    ).toBe(SemconvStability.DUPLICATE);
  });
});
