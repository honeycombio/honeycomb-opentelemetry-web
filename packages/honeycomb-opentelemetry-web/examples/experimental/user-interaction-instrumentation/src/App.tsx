import React from 'react';
import logo from './logo.svg';
import './App.css';
// import config from '@honeycombio/opentelemetry-web/tsconfig.json';
// console.log({config })
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <code>user-interaction-instrumentation</code> example
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {new Date().toLocaleDateString('en-us') +
            ' ' +
            new Date().toLocaleTimeString('en-us')}
        </p>
      </header>

      <main className="App-main" onClick={() => console.log('clicked on body')}>
        this entire div has a click handler (should create a span)
        <button type="button" onClick={() => console.log('clicked on button')}>
          has a click handler
        </button>
        <button type="button">
          this one has no click handler but is nested in a div (creates a span)
        </button>
      </main>
      <button type="button">this one has no click handler (no span)</button>
    </div>
  );
}

export default App;
