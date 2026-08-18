# Custom Exporter example for the Honeycomb Web SDK

You can run this example to see the SDK in action.

## Run this application

`npm install`

Paste your API key into `index.js`, where is says "your api key goes here".

`npm run start`

Visit [http://localhost:3000]() to see "hello world".

Now go to [https://ui.honeycomb.io](), click Home, and choose the dataset "web-distro" (unless you changed the `serviceName` in `index.js`).

## Hard and soft navigations

The page reports Core Web Vitals twice: once for the initial page load (a
_hard_ navigation), and again for each _soft_ navigation, a route change that
leaves the document in place the way single-page apps do.

Load the page, then use the "Go to /products/42" buttons and watch the spans in
the console. The first set of vitals carries
`<vital>.navigation_type: "navigate"`; each soft navigation produces a further
set carrying `"soft-navigation"`, along with a `<vital>.navigation_url` naming
the route the metric belongs to. Prefer that attribute over the URL at export
time, since web-vitals can report a metric after the next navigation begins.

While reading the output:

- Chromium 151+ only. Other browsers ignore the `reportSoftNavs` options in
  `index.js`, leaving only the hard navigation.
- web-vitals reports `TTFB` as `0` for a soft navigation, which issues no
  request.
- `CLS` and `INP` reset at each soft navigation, and `FCP`/`LCP` measure the
  first and largest contentful paint _after_ it. An element the browser does not
  repaint adds nothing to the new value.
- The first soft navigation finalizes the vitals for the initial page load.

## Sync changes from `honeycomb-opentelemetry-web` package

`npm run dev`

Visit [http://localhost:3000]() to see "hello world".

Any changes to the `../../src` files will trigger an update to the build js. Refresh the page to load the updated bundle.
