import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import App from './app.tsx';

const container = document.getElementById('app');

if (container) {
    createRoot(container).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
