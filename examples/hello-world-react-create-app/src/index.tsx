import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';

const configDefaults = {
  ignoreNetworkEvents: true,
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
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
    apiKey: 'api-key-goes-here',
    serviceName: 'hny-web-distro-example:hello-world-react-create-app',
    instrumentations: [
      getWebAutoInstrumentations({
        '@opentelemetry/instrumentation-xml-http-request': configDefaults,
        '@opentelemetry/instrumentation-fetch': configDefaults,
        '@opentelemetry/instrumentation-document-load': configDefaults,
      }),
    ], // add automatic instrumentation
  });
  sdk.start();
} catch (err) {
  console.error(err);
}
