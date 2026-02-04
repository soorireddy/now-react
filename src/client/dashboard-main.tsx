import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './components/Dashboard';

const rootElement = document.getElementById('dashboard-root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Dashboard />
        </React.StrictMode>
    );
}