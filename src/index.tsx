import React from 'react';
import ReactDOM from 'react-dom/client';
import FlappyCat from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <FlappyCat />
  </React.StrictMode>
);