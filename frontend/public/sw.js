const CACHE_NAME = 'proteinapp-static-v1';

const PRECACHE_URLS = [
  '/',
];

const STATIC_EXTENSIONS = /\.(?:css|js|png|jpg|jpeg|svg|gif|webp|avif|woff2?|ttf|eot)$/i;
const NEXT_STATIC = /\/_next\/static\//;

self.addEventListener('install', (event: ExtendableMessageEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableMessageEvent) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  if (request.method !== 'GET') return;
  const isSameOrigin = new URL(request.url).origin === self.location.origin;

  if (isSameOrigin && NEXT_STATIC.test(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  if (isSameOrigin && STATIC_EXTENSIONS.test(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => caches.match(request).then((r) => r || new Response('Offline', { status: 503 })))
  );
});
