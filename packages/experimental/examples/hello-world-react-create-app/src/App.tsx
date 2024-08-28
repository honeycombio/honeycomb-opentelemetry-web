import React from 'react';
import logo from './logo.svg';
import './App.css';
// import config from '@honeycombio/opentelemetry-web/tsconfig.json';
// console.log({config })
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {new Date().toLocaleDateString('en-us') +
            ' ' +
            new Date().toLocaleTimeString('en-us')}
        </p>
        <button type="button" onClick={() => alert('clicked!')}>
          click for alert (creates a span)
        </button>
        <button type="button">this one has no click handler (no span)</button>
      </header>
    </div>
  );
}

export default App;
