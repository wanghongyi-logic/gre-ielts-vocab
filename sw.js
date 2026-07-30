const BUILD = "77";
const CACHE_PREFIX = "vocab-studio-";
const CACHE = `vocab-studio-v${BUILD}-whole-library-shuffle`;
const READY_MARKER = `./__offline-ready__?build=${BUILD}`;
const FETCH_ATTEMPTS = 2;
const CACHE_WORKERS = 3;
const CORE_ASSETS = [
  { url: "./index.html", weight: 24_000, reload: true },
  { url: `./styles.css?v=${BUILD}`, weight: 38_000 },
  { url: `./theme-v2.css?v=${BUILD}`, weight: 90_000 },
  { url: `./learning-test-v4.css?v=${BUILD}`, weight: 34_000 },
  { url: `./ielts-preview.css?v=${BUILD}`, weight: 10_000 },
  { url: `./review-integration.css?v=${BUILD}`, weight: 26_000 },
  { url: `./mobile-v2.css?v=${BUILD}`, weight: 78_000 },
  { url: `./app.js?v=${BUILD}`, weight: 10_500_000 },
  { url: `./manifest.webmanifest?v=${BUILD}`, weight: 4_000 },
  { url: "./icon-192-v2.png", weight: 50_000 },
  { url: "./icon-512-v2.png", weight: 300_000 },
  { url: "./apple-touch-icon-v2.png", weight: 48_000 },
  { url: "./apple-launch-1179x2556.png", weight: 530_000 },
  { url: "./apple-launch-1206x2622.png", weight: 550_000 },
  { url: "./apple-launch-1320x2868.png", weight: 360_000 },
];
const TOTAL_WEIGHT = CORE_ASSETS.reduce((total, asset) => total + asset.weight, 0);
let cacheJob = null;

function cacheKeyRequest(asset) {
  return new Request(asset.url, {
    credentials: "same-origin",
  });
}

async function fetchAsset(asset) {
  let lastError;
  for (let attempt = 0; attempt < FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(new Request(asset.url, {
        cache: asset.reload || attempt > 0 ? "reload" : "default",
        credentials: "same-origin",
      }));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`Unable to cache ${asset.url}: ${lastError?.message || "network error"}`);
}

async function cacheWholeApp() {
  const cache = await caches.open(CACHE);
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const progressByAsset = new Map(CORE_ASSETS.map((asset) => [asset.url, 0]));
  let completed = 0;
  let lastPercent = -1;

  const notify = (type, detail = {}) => {
    for (const client of clients) client.postMessage({ type, build: BUILD, ...detail });
  };
  const report = (assetUrl, fraction, force = false) => {
    progressByAsset.set(assetUrl, Math.max(0, Math.min(1, fraction)));
    const weighted = CORE_ASSETS.reduce(
      (total, asset) => total + asset.weight * (progressByAsset.get(asset.url) || 0),
      0,
    );
    const percent = Math.min(100, Math.round((weighted / TOTAL_WEIGHT) * 100));
    if (!force && percent === lastPercent) return;
    lastPercent = percent;
    notify("CACHE_PROGRESS", {
      percent,
      completed,
      total: CORE_ASSETS.length,
      asset: assetUrl.replace(/^\.\//, "").split("?")[0],
    });
  };

  notify("CACHE_START", { percent: 0, completed: 0, total: CORE_ASSETS.length });

  let cursor = 0;
  const cacheNext = async () => {
    while (cursor < CORE_ASSETS.length) {
      const assetIndex = cursor;
      cursor += 1;
      const asset = CORE_ASSETS[assetIndex];
      const request = cacheKeyRequest(asset);
      const response = await fetchAsset(asset);

      const cachePromise = cache.put(request, response.clone());
      if (response.body) {
        const reader = response.body.getReader();
        let loaded = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          loaded += value?.byteLength || 0;
          report(asset.url, Math.min(0.98, loaded / asset.weight));
        }
      }
      await cachePromise;
      completed += 1;
      report(asset.url, 1, true);
    }
  };

  await Promise.all(Array.from({ length: CACHE_WORKERS }, () => cacheNext()));
  await cache.put(
    READY_MARKER,
    new Response(JSON.stringify({ build: BUILD, readyAt: Date.now() }), {
      headers: { "content-type": "application/json" },
    }),
  );
  notify("CACHE_READY", {
    percent: 100,
    completed: CORE_ASSETS.length,
    total: CORE_ASSETS.length,
  });
}

function ensureCacheJob() {
  if (!cacheJob) {
    cacheJob = cacheWholeApp().finally(() => {
      cacheJob = null;
    });
  }
  return cacheJob;
}

async function isWholeAppCached(cache) {
  const entries = await Promise.all([
    cache.match(READY_MARKER),
    ...CORE_ASSETS.map((asset) => cache.match(cacheKeyRequest(asset))),
  ]);
  return entries.every(Boolean);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    ensureCacheJob()
      .then(() => self.skipWaiting())
      .catch(async (error) => {
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of clients) {
          client.postMessage({
            type: "CACHE_ERROR",
            build: BUILD,
            message: "离线资源准备失败，保留当前可用版本",
          });
        }
        await caches.delete(CACHE);
        throw error;
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
          .map((key) => caches.delete(key)),
      )),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "GET_CACHE_STATUS") {
    event.waitUntil(
      caches.open(CACHE)
        .then((cache) => isWholeAppCached(cache))
        .then((ready) => {
          if (ready) {
            event.source?.postMessage({
              type: "CACHE_READY",
              build: BUILD,
              percent: 100,
              completed: CORE_ASSETS.length,
              total: CORE_ASSETS.length,
              silent: Boolean(event.data?.silentIfReady),
            });
            return undefined;
          }
          return ensureCacheJob().catch(() => {
            event.source?.postMessage({
              type: "CACHE_ERROR",
              build: BUILD,
              message: "离线资源恢复失败，保留当前可用内容，联网后会自动重试",
            });
          });
        }),
    );
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match("./index.html");
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) event.waitUntil(cache.put("./index.html", response.clone()));
          return response;
        } catch {
          return cache.match("./index.html");
        }
      }),
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        event.waitUntil(cache.put(request, response.clone()));
      }
      return response;
    }),
  );
});
