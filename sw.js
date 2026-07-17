const CACHE = "vocab-studio-v60-mobile-islands";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./theme-v2.css",
  "./learning-test-v4.css",
  "./ielts-preview.css",
  "./review-integration.css",
  "./mobile-v2.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192-v2.png",
  "./icon-512-v2.png",
  "./apple-touch-icon-v2.png",
  "./apple-launch-1179x2556.png",
  "./apple-launch-1206x2622.png",
  "./apple-launch-1320x2868.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put("./index.html", copy)));
        }
        return response;
      }).catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
      }
      return response;
    })),
  );
});
