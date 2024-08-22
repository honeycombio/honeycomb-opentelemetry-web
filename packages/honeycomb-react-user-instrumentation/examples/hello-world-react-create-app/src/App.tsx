import React from 'react';
import logo from './logo.svg';
import './App.css';

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
        <p>words words words</p>

        <button
          type="button"
          onClick={(e) => {
            console.log('click');
            e.stopPropagation();
          }}
        >
          click me
        </button>
      </header>
    </div>
  );
}

export default App;
