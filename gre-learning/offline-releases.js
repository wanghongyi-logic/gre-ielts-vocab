// Public, read-only release discovery. Never accepts a repository or URL from user input.
export const RELEASES_URL = 'https://github.com/wanghongyi-logic/gre-ielts-vocab/releases';
const API_URL = 'https://api.github.com/repos/wanghongyi-logic/gre-ielts-vocab/releases';
const PREFIX = '/wanghongyi-logic/gre-ielts-vocab/releases/download/';

// Each network stage has an idle deadline and shares the caller's cancellation.
function networkSession(callerSignal, timeoutMs) {
  const controller = new AbortController();
  const abort = () => controller.abort(callerSignal.reason);
  callerSignal?.addEventListener('abort', abort, {once:true});
  if (callerSignal?.aborted) abort();
  return {
    signal:controller.signal,
    wait(operation) {
      return new Promise((resolve,reject) => {
        let timer;
        const finish = (fn,value) => { clearTimeout(timer); controller.signal.removeEventListener('abort',cancel); fn(value); };
        const cancel = () => finish(reject,controller.signal.reason);
        if (controller.signal.aborted) { cancel(); return; }
        controller.signal.addEventListener('abort',cancel,{once:true});
        timer = setTimeout(() => controller.abort(new Error('network-timeout')), timeoutMs);
        Promise.resolve().then(operation).then(value => finish(resolve,value), error => finish(reject,error));
      });
    },
    close() { callerSignal?.removeEventListener('abort',abort); }
  };
}

export function parseWordRange(name) {
  const match = /^GRE-words-(\d{1,5})-(\d{1,5})\.zip$/.exec(name || '');
  if (!match) return null;
  const start = Number(match[1]), end = Number(match[2]);
  return start > 0 && end >= start && end <= 99999 ? {start, end, count: end - start + 1} : null;
}
export function trustedReleaseURL(value, name) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.port || url.username || url.password || url.search || url.hash || !url.pathname.startsWith(PREFIX)) throw new Error('Invalid release URL');
  const parts = url.pathname.slice(PREFIX.length).split('/').map(decodeURIComponent);
  if (parts.length !== 2 || parts.some(p => !p || /[\\/\x00-\x1f]/.test(p) || p === '.' || p === '..') || parts[1] !== name || !parseWordRange(name)) throw new Error('Invalid release asset');
  return url.href;
}
export function normalizeReleaseAsset(raw, release) {
  try {
    const range = parseWordRange(raw?.name);
    if (!range || raw.state !== 'uploaded' || !Number.isSafeInteger(raw.id) || raw.id <= 0 || !Number.isSafeInteger(raw.size) || raw.size <= 0) return null;
    const url = trustedReleaseURL(raw.browser_download_url, raw.name);
    const asset = Object.freeze({id:raw.id, name:raw.name, bytes:raw.size, url, range:Object.freeze(range), release:String(release?.tag_name || '')});
    return asset;
  } catch { return null; }
}
export function localCoverage(asset, catalog, readyIds) {
  if (!Array.isArray(readyIds)) return null;
  const {start, end, count} = asset.range;
  const entries = catalog?.entries || [];
  // Filename ranges are display ordinals, never the non-contiguous vocabulary IDs.
  const selected = entries.filter((entry, index) => {
    const ordinal = entry.displayOrdinal ?? index + 1;
    return ordinal >= start && ordinal <= end;
  });
  if (selected.length !== count) return null;
  const ready = new Set(readyIds.map(String));
  return {saved:selected.filter(entry => ready.has(String(entry.number))).length, total:count};
}
export async function discoverReleaseAssets({fetcher = globalThis.fetch, signal, timeoutMs = 20000} = {}) {
  const network = networkSession(signal,timeoutMs);
  const assets = [], seen = new Set();
  // Bounded discovery: the latest 300 public releases; no arbitrary pagination URLs.
  try { for (let page = 1; page <= 3; page++) {
    const response = await network.wait(() => fetcher(`${API_URL}?per_page=100&page=${page}`, {signal:network.signal, mode:'cors', credentials:'omit', redirect:'error', referrerPolicy:'no-referrer', headers:{Accept:'application/vnd.github+json'}}));
    if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'release-rate-limit' : 'release-unavailable');
    const releases = await network.wait(() => response.json());
    if (!Array.isArray(releases)) throw new Error('release-invalid-response');
    for (const release of releases) {
      if (!release || release.draft || !Array.isArray(release.assets)) continue;
      for (const raw of release.assets) {
        const asset = normalizeReleaseAsset(raw, release);
        if (asset && !seen.has(asset.id)) { seen.add(asset.id); assets.push(asset); }
      }
    }
    if (releases.length < 100) break;
  }
  return assets.sort((a,b) => a.range.start-b.range.start || a.range.end-b.range.end || b.id-a.id);
  } finally { network.close(); }
}
const size = bytes => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
export function releaseListMessage(state) {
  return ({loading:'正在查找可下载的书包…', empty:'最近的发布中还没有找到书包。已有 ZIP 文件仍可在上方导入。', error:'暂时无法读取书包列表。可以打开下载页，下载后在上方选择文件。', ready:''})[state];
}
export function mountReleaseDownloads({host, catalog, getReadyIds = () => null, fetcher = globalThis.fetch, discoveryTimeoutMs = 20000}) {
  if (!host || host.querySelector('[data-release-downloads]')) return null;
  const doc = host.ownerDocument;
  const section = doc.createElement('section');
  section.className = 'library-quiet-section release-downloads';
  section.dataset.releaseDownloads = '';
  section.innerHTML = '<details class="release-browser" data-release-browser><summary><span>下载 ZIP 备份</span><span class="library-disclosure-tail"><span class="library-disclosure-mark" aria-hidden="true">+</span></span></summary><div class="release-browser-body"><div class="release-heading"><span>可下载书包</span><button type="button" class="library-text-action" data-release-refresh>刷新列表</button></div><p data-release-status role="status" aria-live="polite"></p><ul data-release-list></ul><a data-release-page target="_blank" rel="noopener noreferrer">打开书包下载页 ↗</a></div></details>';
  section.querySelector('[data-release-page]').href = RELEASES_URL;
  const backupHost = host.querySelector('[data-backup-downloads]');
  const anchor = host.querySelector('.library-import-feedback');
  if (backupHost) backupHost.append(section); else if (anchor) anchor.after(section); else host.append(section);
  const status = section.querySelector('[data-release-status]'), list = section.querySelector('[data-release-list]'), refresh = section.querySelector('[data-release-refresh]');
  let assets = [], busy = false, destroyed = false, loaded = false, controller;
  function render() {
    list.replaceChildren();
    for (const asset of assets) {
      const row = doc.createElement('li'), title = doc.createElement('strong'), info = doc.createElement('p'), actions = doc.createElement('div'), link = doc.createElement('a');
      title.textContent = `第 ${asset.range.start}–${asset.range.end} 词`;
      const coverage = localCoverage(asset, catalog, getReadyIds());
      info.textContent = `${size(asset.bytes)} · ${coverage ? `本机已保存 ${coverage.saved}/${coverage.total} 词` : '保存情况待确认'}`;
      actions.className = 'release-actions';
      link.href = asset.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = '下载 ZIP ↗';
      actions.append(link); row.append(title,info,actions); list.append(row);
    }
  }
  async function load() {
    if (busy || destroyed) return;
    controller?.abort(); controller = new AbortController(); busy = true; refresh.disabled = true;
    status.textContent = releaseListMessage('loading');
    try { assets = await discoverReleaseAssets({fetcher,signal:controller.signal,timeoutMs:discoveryTimeoutMs}); if (!destroyed) status.textContent = releaseListMessage(assets.length ? 'ready':'empty'); }
    catch (error) { if (!destroyed && error?.name !== 'AbortError') status.textContent = releaseListMessage('error') + (assets.length ? '下方仍是上次读取的列表。' : ''); }
    finally { busy = false; if (!destroyed) { refresh.disabled = false; render(); refresh.textContent = '刷新列表'; } }
  }
  refresh.onclick = load;
  const browser = section.querySelector('[data-release-browser]');
  browser.ontoggle = () => { if (browser.open && !loaded && !busy && !destroyed) { loaded = true; load(); } };
  return {load, refreshCoverage:render, destroy(){destroyed=true;controller?.abort();section.remove();}};
}
