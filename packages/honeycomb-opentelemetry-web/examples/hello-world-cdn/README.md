# Hello World Example for the Honeycomb Web SDK using a CDN

You can run this example to see the SDK in action. This is for POC example only, in production we recommend using a bundler like rollup or webpack.

## Run this example

1.  `npm install`
2.  `npm run build` (This will build the package and put the cdn in the `dist/cdn` folder)
3. Paste your API key into `index.html`, where is says "your api key goes here".
4. `npm start` to serve the bundle

Now go to [https://ui.honeycomb.io](), click Home, and choose the dataset `hny-web-distro-example:hello-world-cdn` (unless you changed the `serviceName` in `index.html`).
