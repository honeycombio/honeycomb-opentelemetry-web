# TypeScript Example for the Honeycomb Web SDK

This example is written in TypeScript, uses webpack, and sends to a Collector.

It also shows

- adding custom instrumentation
- adding custom resource attributes
- adding to baggage to set attributes on child spans with the built-in baggage span processor

This example is used in our smoke / integration testing.

## Run this application locally, send straight to Honeycomb

Add your API key and comment out the endpoint.

```sh
# install dependencies
npm install
# compile and bundle
npm run build
# start app
npm start
```

## Run this application in Docker, send straight to Honeycomb

Add your API key and comment out the endpoint.

From root directory, run `docker-compose up --build app-custom-with-collector-ts`

## Send telemetry to Collector, then to Honeycomb

Add your API key and uncomment the `otlp` exporter in `otel-collector-config.yaml`.

From the root directory, `docker-compose up --build collector app-custom-with-collector-ts`
