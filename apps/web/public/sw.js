// ALAYA INSIDER — Service Worker
// Provides offline support and caches static assets

const CACHE_NAME = "alaya-cache-v1";
const STATIC_ASSETS = [
  "/manifest.json",
];

// Install: cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network, cache new responses
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls and browser extensions
  if (
    event.request.url.includes("/api/") ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          // Cache successful responses for static assets
          if (
            response.status === 200 &&
            response.type === "basic" &&
            (event.request.url.includes("/_next/static/") ||
              event.request.destination === "font" ||
              event.request.destination === "style" ||
              event.request.destination === "script" ||
              event.request.url.includes("/images/"))
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed — serve cached version or offline fallback
          if (event.request.mode === "navigate") {
            return caches.match("/offline");
          }
          return cachedResponse || new Response("Offline", { status: 503 });
        });

      return cachedResponse || fetchPromise;
    })
  );
});
