import { context, propagation, trace } from '@opentelemetry/api';
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const tracing = () => {
  const configDefaults = {
    ignoreNetworkEvents: true,
  };

  const sdk = new HoneycombWebSDK({
    // To send direct to Honeycomb, set API Key and comment out endpoint
    // apiKey: 'api-key',
    endpoint: 'http://localhost:4318', // send to local collector
    serviceName: 'hny-web-distro-example:custom-with-collector-ts',
    debug: true,
    skipOptionsValidation: true,
    resourceAttributes: { 'app.environment': 'development' },
    instrumentations: [
      // add auto-instrumentation
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-xml-http-request': configDefaults,
        '@opentelemetry/instrumentation-fetch': configDefaults,
        '@opentelemetry/instrumentation-document-load': configDefaults,
      }),
    ],
  });
  sdk.start();
};

const trackButton = (onClick: { (): void; (): void }) => {
  const button = document.getElementById(
    'button-important',
  ) as HTMLButtonElement;

  button.onclick = () => {
    const tracer = trace.getTracer('click-tracer');
    return tracer.startActiveSpan(`clicked the button`, (span) => {
      onClick();
      span.end();
    });
  };
};

const onClick = () => {
  console.debug('button clicked');
  const ctx = propagation.setBaggage(
    context.active(),
    propagation.createBaggage({
      username: { value: 'alice' },
    }),
  );
  context.with(ctx, () => {
    const tracer = trace.getTracer('click-tracer');
    tracer.startActiveSpan('did a thing', (span) => {
      span.setAttribute('message', 'important message');
      tracer.startActiveSpan('calculating stuff', (childspan) => {
        console.log('important things are happening');
        childspan.end();
      });
      span.end();
    });
  });
};

const setupFetchCall = () => {
  document.getElementById('loadDadJokeFetch')!.onclick = () => {
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
        document.getElementById('dadJokeText')!.innerText = data.joke;
      })
      .catch((e) => {
        console.error(e);
      });
  };
};

const setupXHRCall = () => {
  document.getElementById('loadDadJokeXHR')!.onclick = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://icanhazdadjoke.com/');
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('accept', 'application/json');

    xhr.onload = function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        document.getElementById('dadJokeText')!.innerText = data.joke;
      } else {
        console.error('Request failed:', xhr.status);
      }
    };

    xhr.onerror = function () {
      console.error('Request failed');
    };

    xhr.send();
  };
};

const main = () => {
  tracing();
  trackButton(onClick);
  setupFetchCall();
  setupXHRCall();
};
main();
