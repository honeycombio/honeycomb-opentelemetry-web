# Hello World Example for the Honeycomb Web SDK

You can run this example to see the SDK in action.

## Run this application

`npm install`

Paste your API key into `index.js`, where is says "your api key goes here".

`npm run start`

Visit [http://localhost:8080]() to see "hello world".

Now go to [https://ui.honeycomb.io](), click Home, and choose the dataset "web-distro" (unless you changed the `serviceName` in `index.js`).

## Sync changes from `honeycomb-opentelemetry-web` package

`npm run dev`

Visit [http://localhost:8080]() to see "hello world".

Any changes to the `../../src` files will trigger an update to the build js. Refresh the page to load the updated bundle.
