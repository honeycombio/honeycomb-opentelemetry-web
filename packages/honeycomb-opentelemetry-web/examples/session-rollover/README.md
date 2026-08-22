# Session Rollover Example for the Honeycomb Web SDK

Run this example to watch `session.id` expire, persist and roll over while you look at
the page. The session windows are turned down to seconds, so behaviour that normally
takes hours is observable in the time it takes to read this.

## Run this application

`npm install`

`npm run start`

Visit [http://localhost:8080]().

The example does not export telemetry by default, so it needs no API key and no
network: failing exports would otherwise bury the demo in console and network noise.
To send to Honeycomb instead, set `SEND_TO_HONEYCOMB = true` at the top of `index.js`
and paste your ingest key into `apiKey`. Then go to
[https://ui.honeycomb.io](), click Home, and choose the dataset named by
`serviceName` in `index.js`.

## Watch sessions roll over

The demo configures the SDK with `createDefaultSessionProvider({ inactivityTimeout: 15,
maxDuration: 60 })` — both in seconds, both editable at the top of `index.js`. The page
shows the current `session.id`, a running log of every id it has observed, and what is
in `localStorage["opentelemetry-session"]`.

- **Roll over on inactivity.** Leave the page alone. A new id appears roughly 15
  seconds after the last emitted telemetry, and then every 15 seconds after that.
- **Roll over on max duration.** Click _Start heartbeat_ to emit a span every 6
  seconds. That keeps resetting the inactivity timer, so the session survives until it
  is 60 seconds old and rolls over anyway.
- **Persist across a page load.** Reload. The same id comes back out of
  `localStorage`. Reload after the max duration has elapsed and you get a new one.
- **Start clean.** _Clear stored session_, then reload.
- **Force a rollover.** _Force a new session_ calls `resetSession()` on the session
  manager.

One behaviour worth internalising: **"activity" means emitted telemetry**, not mouse
movement. The inactivity timer resets only when a span or log record reads the session
id, and upstream's `SessionManager` ignores reads within 5 seconds of the previous one.
That is why the page never polls `getSessionId()` for its display — polling would keep
the session alive forever. It watches reads by wrapping the provider it hands to the
SDK, and watches rollovers with `sessionManager.addObserver(...)`.

## Sync changes from `honeycomb-opentelemetry-web` package

`npm run dev`

Visit [http://localhost:8080]() to see the demo.

Any changes to the `../../src` files will trigger an update to the build js. Refresh the page to load the updated bundle.
