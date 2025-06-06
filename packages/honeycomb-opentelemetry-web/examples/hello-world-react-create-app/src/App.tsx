import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Link } from 'react-router-dom';
// import config from '@honeycombio/opentelemetry-web/tsconfig.json';
// console.log({config })
function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);
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
        <Link to="/dashboard">dashboard</Link>

        {data && (
          <div>
            <h3>Mock Data:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
