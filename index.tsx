
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("React application starting...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical: Could not find root element to mount to");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React mount successful");
} catch (error) {
  console.error("Fatal Error during React initialization:", error);
}
