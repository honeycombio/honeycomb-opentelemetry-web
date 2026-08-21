import {
  createDefaultSessionProvider,
  DEFAULT_SESSION_INACTIVITY_TIMEOUT_SECONDS,
  DEFAULT_SESSION_MAX_DURATION_SECONDS,
  SafeSessionStore,
} from '../src/default-session-provider';

/* The key LocalStorageSessionStore persists under. It is a literal upstream, so
 * it is repeated here rather than imported. */
const SESSION_STORAGE_KEY = 'opentelemetry-session';

const SESSION_ID_PATTERN = /^[a-z0-9]{32}$/;

const seedStoredSession = (id: string, startTimestamp = Date.now()) => {
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({ id, startTimestamp }),
  );
};

const storedSession = (): { id: string; startTimestamp: number } | null => {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  return raw
    ? (JSON.parse(raw) as { id: string; startTimestamp: number })
    : null;
};

describe('defaultSessionProvider', () => {
  let provider: ReturnType<typeof createDefaultSessionProvider> | undefined;

  const start = async (
    ...args: Parameters<typeof createDefaultSessionProvider>
  ) => {
    provider = createDefaultSessionProvider(...args);
    await provider.start();
    return provider;
  };

  afterEach(() => {
    // Clears the inactivity and max duration timers.
    provider?.shutdown();
    provider = undefined;
    localStorage.clear();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('it generates a session id in the same shape as the previous provider', async () => {
    const session = await start();

    expect(session.getSessionId()).toEqual(
      expect.stringMatching(SESSION_ID_PATTERN),
    );
  });

  test('it generates a fresh session when localStorage holds nothing', async () => {
    const session = await start();

    expect(session.getSessionId()).toEqual(
      expect.stringMatching(SESSION_ID_PATTERN),
    );
    expect(storedSession()?.id).toBe(session.getSessionId());
  });

  test('it restores a session persisted by an earlier page load', async () => {
    const persisted = 'a'.repeat(32);
    seedStoredSession(persisted);

    const session = await start();

    expect(session.getSessionId()).toBe(persisted);
  });

  test('it ignores an unparseable persisted session rather than throwing', async () => {
    localStorage.setItem(SESSION_STORAGE_KEY, 'not json');

    const session = await start();

    expect(session.getSessionId()).toEqual(
      expect.stringMatching(SESSION_ID_PATTERN),
    );
  });

  /* Safari's private mode exposes localStorage but throws from setItem, and a
   * sandboxed iframe throws from the getter itself. Upstream's store only checks
   * for localStorage being undefined, so SafeSessionStore is what keeps either
   * case from reaching the surrounding page. */
  test('it degrades to a per-page-load session when localStorage throws', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota exceeded', 'QuotaExceededError');
    });

    const session = await start();

    expect(session.getSessionId()).toEqual(
      expect.stringMatching(SESSION_ID_PATTERN),
    );
  });

  test('SafeSessionStore reports no session when the underlying store rejects', async () => {
    const store = new SafeSessionStore({
      get: () => Promise.reject(new Error('denied')),
      save: () => Promise.reject(new Error('denied')),
    });

    await expect(store.get()).resolves.toBeNull();
    await expect(
      store.save({ id: 'a'.repeat(32), startTimestamp: Date.now() }),
    ).resolves.toBeUndefined();
  });

  test('it starts a new session once the inactivity timeout elapses', async () => {
    jest.useFakeTimers();

    const session = await start();
    const before = session.getSessionId();

    jest.advanceTimersByTime(
      DEFAULT_SESSION_INACTIVITY_TIMEOUT_SECONDS * 1000 + 1,
    );

    expect(session.getSessionId()).not.toBe(before);
    expect(session.getSessionId()).toEqual(
      expect.stringMatching(SESSION_ID_PATTERN),
    );
  });

  test('it keeps the session while activity continues inside the inactivity window', async () => {
    jest.useFakeTimers();

    const session = await start();
    const before = session.getSessionId();

    // Three quarters of the window, twice, with a read in between to mark activity.
    const threeQuarters =
      DEFAULT_SESSION_INACTIVITY_TIMEOUT_SECONDS * 1000 * 0.75;
    jest.advanceTimersByTime(threeQuarters);
    expect(session.getSessionId()).toBe(before);
    jest.advanceTimersByTime(threeQuarters);

    expect(session.getSessionId()).toBe(before);
  });

  /* A persisted session records when it started but not when it was last used,
   * so maxDuration is the only thing that can retire one across page loads. */
  test('it retires a restored session that is older than the max duration', async () => {
    jest.useFakeTimers();
    const persisted = 'b'.repeat(32);
    seedStoredSession(
      persisted,
      Date.now() - (DEFAULT_SESSION_MAX_DURATION_SECONDS + 60) * 1000,
    );

    const session = await start();
    // The expiry timer is clamped to zero for an already-stale session.
    jest.advanceTimersByTime(1);

    expect(session.getSessionId()).not.toBe(persisted);
  });

  test('it starts a new session once the max duration elapses', async () => {
    jest.useFakeTimers();

    const session = await start({
      // Keep the inactivity window clear of the max duration under test.
      inactivityTimeout: DEFAULT_SESSION_MAX_DURATION_SECONDS * 2,
    });
    const before = session.getSessionId();

    jest.advanceTimersByTime(DEFAULT_SESSION_MAX_DURATION_SECONDS * 1000 + 1);

    expect(session.getSessionId()).not.toBe(before);
  });

  test('it honours overridden expiry settings', async () => {
    jest.useFakeTimers();

    const session = await start({ inactivityTimeout: 60 });
    const before = session.getSessionId();

    jest.advanceTimersByTime(60 * 1000 + 1);

    expect(session.getSessionId()).not.toBe(before);
  });

  /* Restoring is asynchronous, so a caller reading the session id in the same
   * tick as start() gets a throwaway id. Everything driven by a browser event,
   * timer or network callback runs later than that, so it sees the restored
   * session. This pins both halves of that contract. */
  describe('restore timing', () => {
    test('a read in the same tick as start() does not see the restored session', () => {
      const persisted = 'c'.repeat(32);
      seedStoredSession(persisted);

      provider = createDefaultSessionProvider();
      void provider.start();

      expect(provider.getSessionId()).not.toBe(persisted);
    });

    test('a read from a later task sees the restored session', async () => {
      const persisted = 'd'.repeat(32);
      seedStoredSession(persisted);

      provider = createDefaultSessionProvider();
      void provider.start();

      // Any browser event, timer or network callback lands at least this late.
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(provider.getSessionId()).toBe(persisted);
    });

    test('awaiting start() sees the restored session', async () => {
      const persisted = 'e'.repeat(32);
      seedStoredSession(persisted);

      const session = await start();

      expect(session.getSessionId()).toBe(persisted);
    });
  });
});
