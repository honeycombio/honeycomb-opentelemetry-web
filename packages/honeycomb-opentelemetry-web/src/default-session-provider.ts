import {
  createDefaultSessionIdGenerator,
  createLocalStorageSessionStore,
  createSessionManager,
  Session,
  SessionStore,
} from '@opentelemetry/web-common';

/**
 * Maximum lifetime of a session, in seconds, regardless of activity.
 *
 * Four hours, matching the `maxLifetime` default in opentelemetry-android.
 * This is the only setting that can retire a session across page loads, because
 * a persisted session records its start time but not its last activity.
 */
export const DEFAULT_SESSION_MAX_DURATION_SECONDS = 4 * 60 * 60;

/**
 * Time without activity after which a session expires, in seconds.
 *
 * Thirty minutes, matching the Google Analytics 4 default and the
 * opentelemetry-swift default.
 */
export const DEFAULT_SESSION_INACTIVITY_TIMEOUT_SECONDS = 30 * 60;

/**
 * Wraps a {@link SessionStore} so that a browser refusing access to
 * localStorage cannot break telemetry.
 *
 * Upstream's LocalStorageSessionStore only guards against localStorage being
 * `undefined`, which is not enough. Safari's private mode exposes localStorage
 * but throws QuotaExceededError from `setItem`, and a sandboxed iframe or a
 * browser configured to block site data throws SecurityError from the
 * localStorage getter itself. Either would otherwise propagate out of the
 * session manager and into the surrounding page.
 *
 * When storage is unavailable the session degrades to lasting a single page
 * load, which is how sessions behaved before persistence was introduced.
 */
export class SafeSessionStore implements SessionStore {
  private _store: SessionStore;

  constructor(store: SessionStore) {
    this._store = store;
  }

  async get(): Promise<Session | null> {
    try {
      return await this._store.get();
    } catch {
      return null;
    }
  }

  async save(session: Session): Promise<void> {
    try {
      await this._store.save(session);
    } catch {
      // Nothing to do: this page load simply keeps its session in memory.
    }
  }
}

/**
 * Options for {@link createDefaultSessionProvider}.
 */
export interface DefaultSessionProviderOptions {
  /** Maximum lifetime of a session, in seconds. */
  maxDuration?: number;
  /** Time without activity after which a session expires, in seconds. */
  inactivityTimeout?: number;
}

/**
 * Builds a session provider that persists its session across page loads in
 * localStorage and expires it on inactivity or old age.
 *
 * The returned manager does not read storage until `start()` is called, so
 * constructing one has no side effects and installs no timers.
 *
 * @param options overrides for the expiry defaults
 * @returns a started-on-demand session manager
 */
export const createDefaultSessionProvider = (
  options?: DefaultSessionProviderOptions,
) =>
  createSessionManager({
    sessionIdGenerator: createDefaultSessionIdGenerator(),
    sessionStore: new SafeSessionStore(createLocalStorageSessionStore()),
    maxDuration: options?.maxDuration ?? DEFAULT_SESSION_MAX_DURATION_SECONDS,
    inactivityTimeout:
      options?.inactivityTimeout ?? DEFAULT_SESSION_INACTIVITY_TIMEOUT_SECONDS,
  });

/**
 * The session provider used when a caller does not supply their own.
 *
 * This is a single shared instance on purpose: the SDK and the CDN wrapper both
 * reach for it independently, and they must report the same session.
 */
export const defaultSessionProvider = createDefaultSessionProvider();
