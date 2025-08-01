import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  Link,
  RouterProvider,
  useParams,
} from 'react-router-dom';
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { ReactRouterSpanProcessor } from './reactRouterSpanProcessor';

const configDefaults = {
  ignoreNetworkEvents: true,
};

const Name = () => {
  const { name } = useParams();
  return (
    <div>
      {name} <Link to={'/'}>Home</Link>
    </div>
  );
};

const Pet = () => {
  const { name, pet } = useParams();
  return (
    <div>
      {name} has a pet {pet}
      <Link to={`/name/${name}`}>Back to person</Link>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: 'name/:name',
    element: <Name />,
  },
  {
    path: 'name/:name/pet/:pet',
    element: <Pet />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// -
// Using web-vitals directly, you won't need to do this if using HoneycombWebSDK
// It's just for debugging purposes.
reportWebVitals(console.log);

try {
  const sdk = new HoneycombWebSDK({
    debug: true,
    apiKey: 'api-key-goes-here',
    serviceName: 'hny-web-distro-example:hello-world-react-create-app',
    webVitalsInstrumentationConfig: {
      vitalsToTrack: ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'],
      inp: { includeTimingsAsSpans: true },
    },
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-xml-http-request': configDefaults,
        '@opentelemetry/instrumentation-fetch': configDefaults,
        '@opentelemetry/instrumentation-document-load': configDefaults,
      }),
    ], // add automatic instrumentation
    spanProcessors: [new ReactRouterSpanProcessor({ router })],
  });
  sdk.start();
} catch (err) {
  console.error(err);
}
