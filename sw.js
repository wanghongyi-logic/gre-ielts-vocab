const BUILD = "103";
const CACHE_PREFIX = "vocab-studio-";
const CACHE = `vocab-studio-v${BUILD}-incremental`;
const NEURAL_VOICE_PROFILES = Object.freeze({
  standard: Object.freeze({
    cache: "vocab-neural-voice-piper-ljspeech-int8-v1",
    manifest: "./tts/voice-pack-manifest.json",
  }),
  hd: Object.freeze({
    cache: "vocab-neural-voice-piper-ljspeech-high-int8-v1",
    manifest: "./tts/voice-pack-hd-manifest.json",
  }),
});
const NEURAL_VOICE_CACHE = NEURAL_VOICE_PROFILES.standard.cache;
const NEURAL_VOICE_HD_CACHE = NEURAL_VOICE_PROFILES.hd.cache;
const NEURAL_AUDIO_CACHE = "vocab-neural-audio-piper-ljspeech-medium-int8-pcm-v1";
const NEURAL_AUDIO_HD_CACHE = "vocab-neural-audio-piper-ljspeech-high-int8-pcm-v1";
const READY_MARKER = `./__offline-ready__?build=${BUILD}`;
const FETCH_ATTEMPTS = 2;
const CACHE_WORKERS = 3;
const ASSET_MANIFEST_URL = `./asset-manifest.json?v=${BUILD}`;
const STATIC_ASSETS = [
  { url: "./index.html", weight: 24_000, reload: true },
  { url: "./styles.css?v=77", weight: 38_000 },
  { url: "./theme-v2.css?v=102", weight: 116_000 },
  { url: "./learning-test-v4.css?v=77", weight: 34_000 },
  { url: "./ielts-preview.css?v=77", weight: 10_000 },
  { url: "./review-integration.css?v=77", weight: 26_000 },
  { url: "./mobile-v2.css?v=102", weight: 120_000 },
  { url: "./review-v3.css?v=101", weight: 82_000 },
  { url: "./listening-review.css?v=101", weight: 33_000 },
  { url: ASSET_MANIFEST_URL, weight: 8_000 },
  { url: "./manifest.webmanifest?v=77", weight: 4_000 },
  { url: "./icon-192-v2.png", weight: 50_000 },
  { url: "./icon-512-v2.png", weight: 300_000 },
  { url: "./apple-touch-icon-v2.png", weight: 48_000 },
  { url: "./apple-launch-1179x2556.png", weight: 530_000 },
  { url: "./apple-launch-1206x2622.png", weight: 550_000 },
  { url: "./apple-launch-1320x2868.png", weight: 360_000 },
];
let cacheJob = null;
let coreAssetsPromise = null;
const neuralVoiceCacheJobs = new Map();
const previousManifestPromises = new Map();

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
        cache: asset.reload || asset.networkReload || attempt > 0 ? "reload" : "default",
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

async function manifestFromCache(cacheName, cache) {
  if (!previousManifestPromises.has(cacheName)) {
    previousManifestPromises.set(cacheName, (async () => {
      const keys = await cache.keys();
      const manifestRequest = keys.find((key) => new URL(key.url).pathname.endsWith("/asset-manifest.json"));
      if (!manifestRequest) return null;
      const response = await cache.match(manifestRequest);
      if (!response) return null;
      try {
        const manifest = await response.json();
        return manifest?.kind === "vocabulary-production-assets" ? manifest : null;
      } catch {
        return null;
      }
    })());
  }
  return previousManifestPromises.get(cacheName);
}

async function findReusableAsset(request, asset) {
  const cacheNames = (await caches.keys())
    .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE)
    .reverse();

  for (const cacheName of cacheNames) {
    const previousCache = await caches.open(cacheName);
    let response;

    if (asset.sha256 && asset.path) {
      const manifest = await manifestFromCache(cacheName, previousCache);
      const previousAsset = manifest?.assets?.find((item) => item.path === asset.path);
      if (previousAsset?.sha256 !== asset.sha256) continue;

      response = await previousCache.match(request);
      if (!response) {
        const requestedPath = new URL(request.url).pathname;
        const previousRequests = await previousCache.keys();
        const matchingRequest = previousRequests.find(
          (item) => new URL(item.url).pathname === requestedPath,
        );
        if (matchingRequest) response = await previousCache.match(matchingRequest);
      }
    } else {
      response = await previousCache.match(request);
    }

    if (response) return response;
  }
  return undefined;
}

async function loadProductionAssets() {
  const cache = await caches.open(CACHE);
  const manifestAsset = STATIC_ASSETS.find((asset) => asset.url === ASSET_MANIFEST_URL);
  const request = cacheKeyRequest(manifestAsset);
  let response = await cache.match(request);

  if (!response) {
    response = await fetchAsset({ ...manifestAsset, reload: true });
    await cache.put(request, response.clone());
  }

  const manifest = await response.json();
  if (
    manifest?.kind !== "vocabulary-production-assets"
    || !Array.isArray(manifest.assets)
  ) {
    throw new Error("Invalid production asset manifest");
  }

  return manifest.assets.map((asset) => {
    const path = String(asset.path || "").replace(/^\.?\//, "");
    if (!path || path.includes("..")) throw new Error(`Invalid production asset path: ${path}`);
    return {
      url: path === "app.js" ? `./app.js?v=${BUILD}` : `./${path}`,
      path,
      weight: Math.max(1, Number(asset.bytes) || 1),
      sha256: String(asset.sha256 || ""),
      // Entry modules have stable filenames. If their manifest hash changed,
      // bypass the HTTP cache; otherwise reuse the verified previous response.
      networkReload: Boolean(asset.entryPoint),
    };
  });
}

async function getCoreAssets() {
  if (!coreAssetsPromise) {
    coreAssetsPromise = loadProductionAssets()
      .then((productionAssets) => {
        const byUrl = new Map();
        for (const asset of [...STATIC_ASSETS, ...productionAssets]) byUrl.set(asset.url, asset);
        return [...byUrl.values()];
      })
      .catch((error) => {
        coreAssetsPromise = null;
        throw error;
      });
  }
  return coreAssetsPromise;
}

async function cacheWholeApp() {
  const coreAssets = await getCoreAssets();
  const totalWeight = coreAssets.reduce((total, asset) => total + asset.weight, 0);
  const cache = await caches.open(CACHE);
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  const progressByAsset = new Map(coreAssets.map((asset) => [asset.url, 0]));
  let completed = 0;
  let lastPercent = -1;

  const notify = (type, detail = {}) => {
    for (const client of clients) client.postMessage({ type, build: BUILD, ...detail });
  };
  const report = (assetUrl, fraction, force = false) => {
    progressByAsset.set(assetUrl, Math.max(0, Math.min(1, fraction)));
    const weighted = coreAssets.reduce(
      (total, asset) => total + asset.weight * (progressByAsset.get(asset.url) || 0),
      0,
    );
    const percent = Math.min(100, Math.round((weighted / totalWeight) * 100));
    if (!force && percent === lastPercent) return;
    lastPercent = percent;
    notify("CACHE_PROGRESS", {
      percent,
      completed,
      total: coreAssets.length,
      asset: assetUrl.replace(/^\.\//, "").split("?")[0],
    });
  };

  notify("CACHE_START", { percent: 0, completed: 0, total: coreAssets.length });

  let cursor = 0;
  const cacheNext = async () => {
    while (cursor < coreAssets.length) {
      const assetIndex = cursor;
      cursor += 1;
      const asset = coreAssets[assetIndex];
      const request = cacheKeyRequest(asset);
      const currentResponse = asset.reload ? undefined : await cache.match(request);
      const reusableResponse = currentResponse
        || (asset.reload ? undefined : await findReusableAsset(request, asset));

      if (reusableResponse) {
        if (!currentResponse) await cache.put(request, reusableResponse.clone());
        completed += 1;
        report(asset.url, 1, true);
        continue;
      }

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
    completed: coreAssets.length,
    total: coreAssets.length,
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

function neuralVoiceProfile(profileId) {
  return NEURAL_VOICE_PROFILES[profileId] || NEURAL_VOICE_PROFILES.standard;
}

function neuralVoiceReadyRequest(profileId, version) {
  const safeProfileId = profileId === "hd" ? "hd" : "standard";
  const safeVersion = encodeURIComponent(String(version || "unknown"));
  return new Request(`./__voice-ready__?profile=${safeProfileId}&version=${safeVersion}`);
}

async function notifyNeuralVoice(type, profileId, detail = {}) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  for (const client of clients) client.postMessage({ type, profileId, ...detail });
}

async function cacheNeuralVoicePack(profileId = "standard") {
  const profile = neuralVoiceProfile(profileId);
  const cache = await caches.open(profile.cache);
  const manifestRequest = new Request(profile.manifest, {
    credentials: "same-origin",
  });
  const cachedManifestResponse = await cache.match(manifestRequest);
  let manifestResponse;
  try {
    manifestResponse = await fetch(new Request(profile.manifest, {
      cache: "reload",
      credentials: "same-origin",
    }));
    if (!manifestResponse.ok) throw new Error(`Voice manifest HTTP ${manifestResponse.status}`);
  } catch (error) {
    if (!cachedManifestResponse) throw error;
    manifestResponse = cachedManifestResponse;
  }
  const manifest = await manifestResponse.json();
  if (manifest?.kind !== "vocabulary-neural-voice-pack" || !Array.isArray(manifest.assets)) {
    throw new Error("Invalid neural voice manifest");
  }
  const readyRequest = neuralVoiceReadyRequest(profileId, manifest.version);
  await cache.delete(readyRequest);

  const totalBytes = manifest.assets.reduce(
    (total, asset) => total + Math.max(1, Number(asset?.bytes) || 1),
    0,
  );
  let bytesDone = 0;
  let completed = 0;
  let lastPercent = -1;
  const report = async (force = false) => {
    const percent = Math.min(100, Math.round((bytesDone / totalBytes) * 100));
    if (!force && percent === lastPercent) return;
    lastPercent = percent;
    await notifyNeuralVoice("NEURAL_VOICE_PROGRESS", profileId, {
      percent,
      completed,
      total: manifest.assets.length,
      bytesDone,
      totalBytes,
    });
  };

  let cursor = 0;
  const cacheNext = async () => {
    while (cursor < manifest.assets.length) {
      const asset = manifest.assets[cursor];
      cursor += 1;
      const path = String(asset?.path || "").replace(/^\.?\//, "");
      if (!path || path.includes("..")) continue;
      const request = new Request(`./tts/${path}`, { credentials: "same-origin" });
      const cached = await cache.match(request);
      const expectedBytes = Math.max(1, Number(asset?.bytes) || 1);
      const cachedBytes = Number(
        cached?.headers.get("x-vocabulary-asset-bytes")
        || cached?.headers.get("content-length")
        || 0,
      );
      if (cached && cachedBytes === expectedBytes) {
        bytesDone += Math.max(1, Number(asset?.bytes) || 1);
        completed += 1;
        await report();
        continue;
      }
      if (cached) await cache.delete(request);
      const response = await fetch(new Request(request, { cache: "force-cache" }));
      if (!response.ok) throw new Error(`Voice asset HTTP ${response.status}: ${path}`);
      const reader = response.body?.getReader();
      if (!reader) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength !== expectedBytes) {
          throw new Error(`Voice asset size mismatch: ${path}`);
        }
        const headers = new Headers(response.headers);
        headers.set("content-length", String(buffer.byteLength));
        headers.set("x-vocabulary-asset-bytes", String(buffer.byteLength));
        await cache.put(request, new Response(buffer, {
          status: response.status,
          statusText: response.statusText,
          headers,
        }));
        bytesDone += expectedBytes;
      } else {
        let received = 0;
        const headers = new Headers(response.headers);
        headers.set("x-vocabulary-asset-bytes", String(expectedBytes));
        const monitoredStream = new ReadableStream({
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }
            received += value.byteLength;
            bytesDone += value.byteLength;
            controller.enqueue(value);
            await report();
          },
          cancel(reason) {
            return reader.cancel(reason);
          },
        });
        await cache.put(request, new Response(monitoredStream, {
          status: response.status,
          statusText: response.statusText,
          headers,
        }));
        if (received !== expectedBytes) {
          await cache.delete(request);
          throw new Error(`Voice asset size mismatch: ${path}`);
        }
      }
      completed += 1;
      await report();
    }
  };
  await report(true);
  await Promise.all([cacheNext(), cacheNext()]);
  bytesDone = totalBytes;
  completed = manifest.assets.length;
  await cache.put(manifestRequest, new Response(JSON.stringify(manifest), {
    headers: { "content-type": "application/json; charset=utf-8" },
  }));
  await cache.put(readyRequest, new Response(JSON.stringify({
    profileId,
    version: String(manifest.version || ""),
    readyAt: Date.now(),
    totalBytes,
  }), {
    headers: { "content-type": "application/json; charset=utf-8" },
  }));
  await report(true);
  await notifyNeuralVoice("NEURAL_VOICE_READY", profileId, {
    percent: 100,
    completed,
    total: manifest.assets.length,
    totalBytes,
    version: String(manifest.version || ""),
  });
}

async function neuralVoiceCacheStatus(profileId = "standard") {
  const profile = neuralVoiceProfile(profileId);
  const cache = await caches.open(profile.cache);
  const manifestResponse = await cache.match(profile.manifest);
  if (!manifestResponse) return { ready: false, version: "", totalBytes: 0 };
  try {
    const manifest = await manifestResponse.json();
    if (manifest?.kind !== "vocabulary-neural-voice-pack" || !Array.isArray(manifest.assets)) {
      return { ready: false, version: "", totalBytes: 0 };
    }
    const marker = await cache.match(neuralVoiceReadyRequest(profileId, manifest.version));
    if (!marker) return { ready: false, version: String(manifest.version || ""), totalBytes: 0 };
    const matches = await Promise.all(manifest.assets.map(async (asset) => {
      const path = String(asset?.path || "").replace(/^\.?\//, "");
      if (!path || path.includes("..")) return false;
      const response = await cache.match(`./tts/${path}`);
      const expectedBytes = Math.max(1, Number(asset?.bytes) || 1);
      const cachedBytes = Number(
        response?.headers.get("x-vocabulary-asset-bytes")
        || response?.headers.get("content-length")
        || 0,
      );
      return Boolean(response && cachedBytes === expectedBytes);
    }));
    return {
      ready: matches.every(Boolean),
      version: String(manifest.version || ""),
      totalBytes: Number(manifest.totalBytes) || 0,
    };
  } catch {
    return { ready: false, version: "", totalBytes: 0 };
  }
}

function ensureNeuralVoiceCacheJob(profileId = "standard") {
  const normalizedProfileId = profileId === "hd" ? "hd" : "standard";
  if (!neuralVoiceCacheJobs.has(normalizedProfileId)) {
    const job = cacheNeuralVoicePack(normalizedProfileId).finally(() => {
      neuralVoiceCacheJobs.delete(normalizedProfileId);
    });
    neuralVoiceCacheJobs.set(normalizedProfileId, job);
  }
  return neuralVoiceCacheJobs.get(normalizedProfileId);
}

async function isWholeAppCached(cache, coreAssets = null) {
  const assets = coreAssets || await getCoreAssets();
  const entries = await Promise.all([
    cache.match(READY_MARKER),
    ...assets.map((asset) => cache.match(cacheKeyRequest(asset))),
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
    caches.open(CACHE)
      .then((cache) => isWholeAppCached(cache))
      .then(async (ready) => {
        if (!ready) throw new Error("Incremental cache is incomplete");
        const keys = await caches.keys();
        const hasPreviousAppVersion = keys.some(
          (key) => key.startsWith(CACHE_PREFIX) && key !== CACHE,
        );
        await Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
            .map((key) => caches.delete(key)),
        );
        await Promise.all(
          keys
            .filter((key) => (
              (key.startsWith("vocab-neural-voice-")
                && key !== NEURAL_VOICE_CACHE
                && key !== NEURAL_VOICE_HD_CACHE)
              || (key.startsWith("vocab-neural-audio-")
                && key !== NEURAL_AUDIO_CACHE
                && key !== NEURAL_AUDIO_HD_CACHE)
              || key === "kitten-tts"
            ))
            .map((key) => caches.delete(key)),
        );
        await self.clients.claim();
        if (hasPreviousAppVersion) {
          const windows = await self.clients.matchAll({
            type: "window",
            includeUncontrolled: true,
          });
          await Promise.allSettled(
            windows.map((client) => (
              typeof client.navigate === "function"
                ? client.navigate(client.url)
                : Promise.resolve()
            )),
          );
        }
      }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "PRELOAD_NEURAL_VOICE") {
    event.waitUntil(ensureNeuralVoiceCacheJob("standard").catch(async (error) => {
      await notifyNeuralVoice("NEURAL_VOICE_ERROR", "standard", {
        message: error?.message || "语音包下载失败",
      });
    }));
  }
  if (event.data?.type === "PRELOAD_NEURAL_VOICE_PROFILE") {
    const profileId = event.data?.profileId === "hd" ? "hd" : "standard";
    event.waitUntil(ensureNeuralVoiceCacheJob(profileId).catch(async (error) => {
      await notifyNeuralVoice("NEURAL_VOICE_ERROR", profileId, {
        message: error?.message || "语音包下载失败",
      });
    }));
  }
  if (event.data?.type === "GET_NEURAL_VOICE_STATUS") {
    const profileId = event.data?.profileId === "hd" ? "hd" : "standard";
    event.waitUntil(neuralVoiceCacheStatus(profileId).then((status) => {
      event.source?.postMessage({
        type: status.ready ? "NEURAL_VOICE_READY" : "NEURAL_VOICE_STATUS",
        profileId,
        percent: status.ready ? 100 : 0,
        ready: status.ready,
        version: status.version,
        totalBytes: status.totalBytes,
      });
    }));
  }
  if (event.data?.type === "GET_CACHE_STATUS") {
    event.waitUntil(
      caches.open(CACHE)
        .then(async (cache) => {
          const coreAssets = await getCoreAssets();
          const ready = await isWholeAppCached(cache, coreAssets);
          if (ready) {
            event.source?.postMessage({
              type: "CACHE_READY",
              build: BUILD,
              percent: 100,
              completed: coreAssets.length,
              total: coreAssets.length,
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

  if (url.pathname.includes("/tts/")) {
    const useHdCache = url.pathname.includes("/ljspeech/high/")
      || url.pathname.endsWith("/voice-pack-hd-manifest.json");
    event.respondWith(
      caches.open(useHdCache ? NEURAL_VOICE_HD_CACHE : NEURAL_VOICE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) event.waitUntil(cache.put(request, response.clone()));
        return response;
      }),
    );
    return;
  }

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
