const CACHE = "vocab-studio-v70-ielts-gre-design-sync";
const CORE_ASSETS = [
  "./index.html",
  "./styles.css?v=70",
  "./theme-v2.css?v=70",
  "./learning-test-v4.css?v=70",
  "./ielts-preview.css?v=70",
  "./review-integration.css?v=70",
  "./mobile-v2.css?v=70",
  "./app.js?v=70",
  "./manifest.webmanifest?v=70",
  "./icon-192-v2.png",
  "./icon-512-v2.png",
  "./apple-touch-icon-v2.png",
  "./apple-launch-1179x2556.png",
  "./apple-launch-1206x2622.png",
  "./apple-launch-1320x2868.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" }).then((response) => {
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
