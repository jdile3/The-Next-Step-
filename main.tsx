import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for Chrome Android WebAPK install and offline mode
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('ServiceWorker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
