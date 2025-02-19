import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

// Récupère l’élément avec l’id "root"
const container = document.getElementById('root');

if (!container) {
  throw new Error('No root element found');
}

// Crée la racine avec createRoot et rend l’application
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);