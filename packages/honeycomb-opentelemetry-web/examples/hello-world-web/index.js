import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { trace } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { RandomIdGenerator } from '@opentelemetry/sdk-trace-base';

const configDefaults = {
  ignoreNetworkEvents: true,
};

const getSessionProvider = () => {
  const generator = new RandomIdGenerator();

  let sessionId = null;

  let count = 0;
  return {
    // Your session logic is probably based on cookies or local storage.
    // But for this example, we will use a random ID generator and call 5 jokes a session.
    countJokes: () => {
      if (count > 5) {
        const newSessionId = generator.generateTraceId();
        sessionId = newSessionId;
        count = 0;
        return;
      }
      count++;
    },
    getSessionId: () => {
      if (sessionId === null) {
        sessionId = generator.generateTraceId();
      }
      return sessionId;
    },
  };
};
const sessionProvider = getSessionProvider();

const main = () => {
  // Initialize Honeycomb SDK
  const sdk = new HoneycombWebSDK({
    // defaults to sending to US instance of Honeycomb
    // endpoint: "https://api.eu1.honeycomb.io/v1/traces", // uncomment to send to EU instance
    apiKey: 'api-key', // Replace with your Honeycomb Ingest API Key
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
      vitalsToTrack: ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'],
      cls: {
        reportAllChanges: true,
      },
      lcp: {
        dataAttributes: ['hello', 'barBiz'],
        reportAllChanges: true,
      },
    },
    localVisualizations: true,
    sessionProvider: sessionProvider,
  });
  sdk.start();
  sessionProvider.getSessionId(); // Initialize session ID
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
          sessionProvider.countJokes();
        });
      })
      .catch((e) => {
        console.error(e);
      });
  });
};

main();
