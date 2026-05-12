// Bump CACHE_NAME en cada deploy si quieres forzar refresco de assets cacheados.
// network-first para HTML evita que deploys queden atrapados en cache viejo.
const CACHE_NAME = 'duo-energy-v3-2026-05-12';
const PRECACHE_URLS = ['/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Permite que la app pida al SW activar la versión nueva sin cerrar pestaña
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isHTMLRequest(request) {
  if (request.mode === 'navigate') return true;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname === '/' || url.pathname === '/index.html') return true;
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Cross-origin (Firebase, gstatic, cdnjs, fonts.google, etc.): no interceptar.
  // El navegador los maneja directo y CSP los evalúa solo una vez.
  if (url.origin !== self.location.origin) return;

  // HTML (incluido index.html y navegaciones SPA): network-first → fallback cache → fallback offline
  if (isHTMLRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('/')))
    );
    return;
  }

  // Estáticos (js, css, fuentes, imágenes, manifest): cache-first con refresh en background
  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    }).catch(() => new Response('Offline', {status: 503}))
  );
});
