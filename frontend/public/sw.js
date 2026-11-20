/* SuxonaShop service worker.
 * - Hashed build assets (/assets/*): cache-first (their URL changes when content changes).
 * - Page navigations: network-first, falling back to the cached app shell, then offline.html.
 * - API and cross-origin requests are never touched, so data is never stale or leaked.
 * Bump VERSION to drop old caches.
 */
const VERSION = 'v1';
const ASSETS = `suxona-assets-${VERSION}`;
const PAGES = `suxona-pages-${VERSION}`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGES).then((c) => c.addAll(['/offline.html', '/icon-192.png'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![ASSETS, PAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES).then((c) => c.put('/', copy));
          return res;
        })
        .catch(async () => (await caches.match('/')) || caches.match('/offline.html'))
    );
  }
});
