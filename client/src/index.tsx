import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

// Simplified app for initial testing
const SimpleApp = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Zynfantry</h1>
      <p className="text-xl mb-2">Front-line Pouchers</p>
      <div className="p-4 bg-gray-800 rounded mt-8">
        <p>Basic app structure working!</p>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <SimpleApp />
  );
}