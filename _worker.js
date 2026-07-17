const VOICES = {
  "en-US": { name: "en-US-AvaMultilingualNeural", rate: "-5%" },
  "zh-CN": { name: "zh-CN-XiaoxiaoNeural", rate: "-3%" },
};

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function jsonResponse(status, error) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function synthesize(request, env, context) {
  const requestOrigin = request.headers.get("Origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) return jsonResponse(403, "Cross-origin speech requests are not allowed");
  if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) return jsonResponse(503, "Neural speech is not configured");

  let payload;
  try { payload = await request.json(); }
  catch { return jsonResponse(400, "Invalid JSON"); }
  const text = String(payload?.text || "").trim();
  const lang = payload?.lang === "zh-CN" ? "zh-CN" : "en-US";
  if (!text || text.length > 1_500) return jsonResponse(400, "Speech text must contain 1–1500 characters");

  const digest = await sha256(`${lang}\0${text}`);
  const cacheKey = new Request(new URL(`/__neural_speech/${digest}.mp3`, request.url), { method: "GET" });
  const edgeCache = caches.default;
  const cached = await edgeCache.match(cacheKey);
  if (cached) return cached;

  const voice = VOICES[lang];
  const ssml = `<speak version="1.0" xml:lang="${lang}"><voice name="${voice.name}"><prosody rate="${voice.rate}">${xmlEscape(text)}</prosody></voice></speak>`;
  const endpoint = `https://${env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const azureResponse = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "gre-ielts-vocabulary-app",
    },
    body: ssml,
  });
  if (!azureResponse.ok) return jsonResponse(502, `Neural speech provider returned ${azureResponse.status}`);

  const audio = new Response(azureResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
  context.waitUntil(edgeCache.put(cacheKey, audio.clone()));
  return audio;
}

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url);
    if (url.pathname === "/api/tts" && request.method === "POST") return synthesize(request, env, context);
    return env.ASSETS.fetch(request);
  },
};
