// The Next Step - Service Worker for Native Android WebAPK & Offline Support
const CACHE_NAME = 'the-next-step-v7';
const PRECACHE_ASSETS = [
  './',
  './budget.html',
  './harm-reduction.html',
  './ads-and-links.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './assets/index-BqfrATXR.js',
  './assets/index-DiHGjP6t.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial fallback:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch listener - REQUIRED by Chrome for WebAPK installation
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Only handle same-origin or local assets, and never cache Vite dev modules
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.includes('/src/') ||
    event.request.url.includes('/node_modules/')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseToCache))
            .catch((err) => console.warn('ServiceWorker cache write error:', err));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request, { ignoreSearch: true });
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          return (
            (await caches.match('./budget.html')) ||
            (await caches.match('./')) ||
            new Response('Offline - cached page unavailable.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
          );
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      })
  );
});
