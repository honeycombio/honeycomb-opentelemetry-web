import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { trace } from '@opentelemetry/api';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-base';

const configDefaults = {
  ignoreNetworkEvents: true,
};

const main = () => {
  // Initialize Honeycomb SDK
  const sdk = new HoneycombWebSDK({
    // defaults to sending to US instance of Honeycomb
    // endpoint: "https://api.eu1.honeycomb.io/v1/traces", // uncomment to send to EU instance
    apiKey: 'api-key-goes-here',
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
      // Report vitals for soft navigations as well as the initial page load.
      // Chromium 151+ only; other browsers ignore the option, so setting it
      // everywhere is safe.
      cls: { reportSoftNavs: true },
      fcp: { reportSoftNavs: true },
      inp: { reportSoftNavs: true },
      lcp: { reportSoftNavs: true },
      ttfb: { reportSoftNavs: true },
    },
    traceExporters: [new ConsoleSpanExporter()],
  });

  sdk.start();
  const tracer = trace.getTracer('click-tracer');

  // Chrome detects a soft navigation only when an interaction changes the URL
  // and the page paints new content. pushState alone is not enough, so this
  // renders into the DOM too.
  const renderRoute = (path) => {
    const title = path === '/' ? 'Home' : `Product ${path.split('/').pop()}`;
    const heading = document.createElement('h3');
    heading.textContent = title;
    const body = document.createElement('p');
    body.textContent = `${title} content painted at ${new Date().toISOString()}`;
    body.style.cssText =
      'font-size:1.5rem;min-height:160px;padding:1rem;background:#ffe9a8';
    document.getElementById('routeOutlet').replaceChildren(heading, body);
  };

  document.querySelectorAll('.routes [data-route]').forEach((routeButton) => {
    routeButton.addEventListener('click', () => {
      const path = routeButton.dataset.route;
      history.pushState({}, '', path);
      renderRoute(path);
    });
  });

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
