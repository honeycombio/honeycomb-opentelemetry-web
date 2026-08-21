import {
  HoneycombWebSDK,
  createDefaultSessionProvider,
} from '@honeycombio/opentelemetry-web';
import { trace } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';

// ---------------------------------------------------------------------------
// Demo knobs. Edit these.
// ---------------------------------------------------------------------------

/** Seconds without emitted telemetry before the session expires. */
const INACTIVITY_TIMEOUT_SECONDS = 15;

/** Seconds a session may live in total, however active it is. */
const MAX_DURATION_SECONDS = 60;

/** How often the heartbeat button emits a span, in seconds. */
const HEARTBEAT_INTERVAL_SECONDS = 6;

/** How often the page redraws the countdowns, in milliseconds. */
const POLL_INTERVAL_MS = 500;

/**
 * Set to true, and paste a real ingest key below, to actually export.
 * The demo needs no backend, so exporting is off by default: failing exports
 * would otherwise fill the console and the network tab.
 */
const SEND_TO_HONEYCOMB = false;

/** Where upstream's LocalStorageSessionStore keeps the session. */
const SESSION_STORAGE_KEY = 'opentelemetry-session';

/**
 * SessionManager ignores a session read that lands within this many
 * milliseconds of the previous one (its `_inactivityResetDelay`), so the page
 * mirrors that rule to predict when the inactivity timer will fire.
 */
const INACTIVITY_RESET_DELAY_MS = 5000;

// ---------------------------------------------------------------------------
// Session wiring
// ---------------------------------------------------------------------------

const sessionManager = createDefaultSessionProvider({
  inactivityTimeout: INACTIVITY_TIMEOUT_SECONDS,
  maxDuration: MAX_DURATION_SECONDS,
});

const state = {
  session: null, // { id, startTimestamp }
  entries: [], // { at, id, reason }, newest first
  reads: 0,
  lastReadAt: null,
  lastActivityAt: 0, // mirrors SessionManager._lastActivityTimestamp
  inactivityDeadline: null, // when SessionManager's inactivity timer will fire
  pendingReason: null,
  started: false, // has the SDK finished restoring a stored session?
};

/**
 * Records that telemetry just read the session id, mirroring the bookkeeping
 * SessionManager does on the same read so the page can show a countdown.
 */
const noteSessionRead = () => {
  const now = Date.now();
  state.reads += 1;
  state.lastReadAt = now;
  if (now - state.lastActivityAt > INACTIVITY_RESET_DELAY_MS) {
    state.lastActivityAt = now;
    state.inactivityDeadline = now + INACTIVITY_TIMEOUT_SECONDS * 1000;
  }
};

/**
 * The provider handed to the SDK: the real session manager, wrapped so the demo
 * can watch every read. Nothing else on this page may call `getSessionId()` —
 * a read resets the inactivity timer, so a UI that polled the manager directly
 * would keep the session alive forever and there would be nothing to watch.
 */
const sessionProvider = {
  getSessionId: () => {
    noteSessionRead();
    return sessionManager.getSessionId();
  },
  start: () => sessionManager.start(),
  shutdown: () => sessionManager.shutdown(),
};

const recordSession = (session, reason) => {
  if (state.session?.id === session.id) {
    return;
  }
  state.session = { id: session.id, startTimestamp: session.startTimestamp };
  state.entries.unshift({ at: Date.now(), id: session.id, reason });
  renderLog();
  render();
};

sessionManager.addObserver({
  onSessionStarted: (session, previousSession) => {
    // Every session start is followed by resetTimers().
    state.inactivityDeadline = Date.now() + INACTIVITY_TIMEOUT_SECONDS * 1000;

    let reason = state.pendingReason;
    state.pendingReason = null;
    if (!reason) {
      if (!previousSession) {
        reason = 'first session in this browser';
      } else if (
        Date.now() - previousSession.startTimestamp >=
        MAX_DURATION_SECONDS * 1000 - 1000
      ) {
        reason = `max duration reached (${MAX_DURATION_SECONDS}s)`;
      } else {
        reason = `no telemetry for ${INACTIVITY_TIMEOUT_SECONDS}s`;
      }
    }
    recordSession(session, reason);
  },
  onSessionEnded: () => {},
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

const el = (id) => document.getElementById(id);

const readStoredSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY));
  } catch {
    return null;
  }
};

const seconds = (ms) => `${Math.max(0, ms / 1000).toFixed(1)}s`;

const countdown = (deadline) => {
  if (deadline === null) {
    return '–';
  }
  const remaining = deadline - Date.now();
  return remaining <= 0 ? 'now' : seconds(remaining);
};

const renderLog = () => {
  const body = el('sessionLog');
  if (state.entries.length === 0) {
    body.innerHTML = '<tr><td colspan="3" class="muted">Nothing yet.</td></tr>';
    return;
  }
  body.innerHTML = state.entries
    .map(
      (entry, index) => `
        <tr class="${index === 0 ? 'current' : ''}">
          <td class="mono">${new Date(entry.at).toLocaleTimeString()}</td>
          <td class="mono id">${entry.id}</td>
          <td class="muted">${entry.reason}</td>
        </tr>`,
    )
    .join('');
};

const render = () => {
  const now = Date.now();
  const session = state.session;

  el('currentSessionId').textContent = session ? session.id : 'no session yet';
  el('sessionAge').textContent = session
    ? seconds(now - session.startTimestamp)
    : '–';
  el('maxCountdown').textContent = session
    ? countdown(session.startTimestamp + MAX_DURATION_SECONDS * 1000)
    : '–';
  el('inactivityCountdown').textContent = countdown(state.inactivityDeadline);
  el('lastRead').textContent = state.lastReadAt
    ? `${seconds(now - state.lastReadAt)} ago`
    : 'never';
  el('readCount').textContent = String(state.reads);
  el('sessionCount').textContent = String(state.entries.length);

  const stored = readStoredSession();
  el('storageView').textContent = stored
    ? JSON.stringify(stored, null, 2)
    : '(empty)';

  // Safety net: a rollover in another tab, or one the observer somehow missed,
  // still shows up, because every session start is written to localStorage.
  // Until start() resolves, storage still holds the previous page load's
  // session, which is not this page's session yet.
  if (state.started && stored?.id && stored.id !== session?.id) {
    recordSession(stored, 'seen in localStorage (another tab?)');
  }
};

// ---------------------------------------------------------------------------
// The SDK
// ---------------------------------------------------------------------------

const configDefaults = { ignoreNetworkEvents: true };

/** Swallows spans, so the demo needs neither a backend nor a network. */
const noopExporter = {
  export: (_spans, resultCallback) => resultCallback({ code: 0 }), // 0 is SUCCESS
  shutdown: () => Promise.resolve(),
};

const main = () => {
  el('configLine').textContent =
    `inactivityTimeout: ${INACTIVITY_TIMEOUT_SECONDS}s · ` +
    `maxDuration: ${MAX_DURATION_SECONDS}s · ` +
    `persisted in localStorage["${SESSION_STORAGE_KEY}"]`;

  const sdk = new HoneycombWebSDK({
    // defaults to sending to US instance of Honeycomb
    // endpoint: "https://api.eu1.honeycomb.io/v1/traces", // uncomment to send to EU instance
    apiKey: 'api-key', // Replace with your Honeycomb Ingest API Key
    serviceName: 'hny-web-distro-example:hello-world-web', // Replace with your application name. Honeycomb will name your dataset using this variable.
    debug: false,
    instrumentations: [
      getWebAutoInstrumentations({
        // load custom configuration for xml-http-request instrumentation
        '@opentelemetry/instrumentation-xml-http-request': configDefaults,
        '@opentelemetry/instrumentation-fetch': configDefaults,
        '@opentelemetry/instrumentation-document-load': configDefaults,
      }),
    ],
    contextManager: new ZoneContextManager(),
    webVitalsInstrumentationConfig: {
      vitalsToTrack: ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'],
      lcp: {
        dataAttributes: ['hello', 'barBiz'],
      },
    },
    sessionProvider,
    // Keep the demo offline: no exports, so no failing requests drown out what
    // the page is trying to show. Flip SEND_TO_HONEYCOMB to undo this.
    disableDefaultTraceExporter: !SEND_TO_HONEYCOMB,
    disableDefaultLogExporter: !SEND_TO_HONEYCOMB,
    disableDefaultMetricExporter: !SEND_TO_HONEYCOMB,
    traceExporters: SEND_TO_HONEYCOMB ? undefined : [noopExporter],
  });

  const storedBefore = readStoredSession();

  sdk.start().then(() => {
    // Restoring a stored session starts no new session, so the observer stays
    // quiet: log the restored one here instead.
    if (storedBefore?.id) {
      state.inactivityDeadline = Date.now() + INACTIVITY_TIMEOUT_SECONDS * 1000;
      recordSession(storedBefore, 'restored from localStorage');
    }
    state.started = true;
    render();
  });

  const tracer = trace.getTracer('session-demo');
  const emitSpan = (name) => {
    tracer.startSpan(name).end();
    render();
  };

  el('emitSpan').addEventListener('click', () => emitSpan('demo.manual-span'));

  let heartbeat = null;
  el('toggleHeartbeat').addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
      button.setAttribute('aria-pressed', 'false');
      button.textContent = 'Start heartbeat';
      return;
    }
    emitSpan('demo.heartbeat');
    heartbeat = setInterval(
      () => emitSpan('demo.heartbeat'),
      HEARTBEAT_INTERVAL_SECONDS * 1000,
    );
    button.setAttribute('aria-pressed', 'true');
    button.textContent = `Heartbeat on (every ${HEARTBEAT_INTERVAL_SECONDS}s)`;
  });

  el('forceSession').addEventListener('click', () => {
    state.pendingReason = 'forced with resetSession()';
    sessionManager.resetSession();
  });

  el('clearStorage').addEventListener('click', () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    el('storageView').textContent =
      '(cleared — reload to start from a brand new session)';
  });

  el('reload').addEventListener('click', () => window.location.reload());

  el('loadDadJoke').addEventListener('click', () => {
    fetch('https://icanhazdadjoke.com/', {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    })
      .then((res) =>
        tracer.startActiveSpan('parseJSON', (span) => {
          const jsonPromise = res.json();
          jsonPromise.finally(() => span.end());
          return jsonPromise;
        }),
      )
      .then((data) => {
        tracer.startActiveSpan('setInnerText', (htmlSpan) => {
          el('dadJokeText').innerText = data.joke;
          htmlSpan.setAttribute('text', data.joke);
          htmlSpan.end();
        });
      })
      .catch((e) => {
        el('dadJokeText').innerText = `Could not fetch a joke: ${e.message}`;
      });
  });

  setInterval(render, POLL_INTERVAL_MS);
  render();
};

main();
