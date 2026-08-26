const CACHE_NAME = "credtrust-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/css/variables.css",
  "/assets/css/styles.css",
  "/assets/js/app.js",
  "/assets/js/services/WalletService.js",
  "/assets/js/services/AuthService.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network first, fallback to cache strategy for API calls
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network first, fallback to cache for all requests during development
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
