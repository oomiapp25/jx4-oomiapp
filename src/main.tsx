import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Registrar Service Worker para PWA
registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento root');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
