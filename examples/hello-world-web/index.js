import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const configDefaults = {
  ignoreNetworkEvents: true,
};

const main = () => {
  // Initialize Honeycomb SDK
  const sdk = new HoneycombWebSDK({
    // defaults to sending to US instance of Honeycomb
    // endpoint: "https://api.eu1.honeycomb.io/v1/traces", // uncomment to send to EU instance
    apiKey: 'api-key', // Replace with your Honeycomb Ingest API Key
    serviceName: 'web-distro', // Replace with your application name. Honeycomb will name your dataset using this variable.
    debug: true,
    instrumentations: [
      getWebAutoInstrumentations({
        // load custom configuration for xml-http-request instrumentation
        '@opentelemetry/instrumentation-xml-http-request': configDefaults,
        '@opentelemetry/instrumentation-fetch': configDefaults,
        '@opentelemetry/instrumentation-document-load': configDefaults,
      }),
    ],
  });
  sdk.start();

  // add event handlers
  document.getElementById('loadDadJoke').onclick = () => {
    fetch('https://icanhazdadjoke.com/', {
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        document.getElementById('dadJokeText').innerText = data.joke;
      })
      .catch((e) => {
        console.error(e);
      });
  };
};

main();
