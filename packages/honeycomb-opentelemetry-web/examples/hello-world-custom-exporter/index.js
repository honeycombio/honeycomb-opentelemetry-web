import {
  getDefaultTraceExporter,
  HoneycombWebSDK,
} from '@honeycombio/opentelemetry-web';
import { trace } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

const configDefaults = {
  ignoreNetworkEvents: true,
};

const main = () => {
  const hcoConfig = {
    // defaults to sending to US instance of Honeycomb
    // endpoint: "https://api.eu1.honeycomb.io/v1/traces", // uncomment to send to EU instance
    apiKey: 'api-key-goes-here',
  };

  // Initialize Honeycomb SDK
  const sdk = new HoneycombWebSDK({
    ...hcoConfig,
    serviceName: 'hny-web-distro-example:hello-world-web', // Replace with your application name. Honeycomb will name your dataset using this variable.
    debug: true,
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
      vitalsToTrack: ['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'],
    },
    traceExporters: [
      // comment out to only use the console exporter
      getDefaultTraceExporter(hcoConfig),
      new ConsoleSpanExporter(),
    ],
  });

  sdk.start();
  const tracer = trace.getTracer('click-tracer');

  const buttonElement = document.getElementById('loadDadJoke');

  buttonElement.addEventListener('click', () => {
    fetch('https://icanhazdadjoke.com/', {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    })
      .then((res) => {
        return tracer.startActiveSpan('parseJSON', (span) => {
          const jsonPromise = res.json();
          jsonPromise.finally(span.end());
          return jsonPromise;
        });
      })
      .then((data) => {
        tracer.startActiveSpan('setInnerText', (htmlSpan) => {
          document.getElementById('dadJokeText').innerText = data.joke;
          htmlSpan.setAttribute('text', data.joke);
          htmlSpan.end();
        });
      })
      .catch((e) => {
        console.error(e);
      });
  });
};

main();
