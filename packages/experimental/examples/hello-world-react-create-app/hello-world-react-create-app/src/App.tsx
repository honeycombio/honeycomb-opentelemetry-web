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
        {/* <code>Module: {config.compilerOptions.module}</code>
        <code>Target: {config.compilerOptions.target}</code> */}
        <hr />

        {/* <pre>
          <code>{JSON.stringify(config, null, 2)}</code>
          </pre> */}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
