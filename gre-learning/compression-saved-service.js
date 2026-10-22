import {catalogSources,sourceOf,key,resolveSaved} from './compression-variants.js';
import {exportVariants} from './compression-archive.js';
// Single read contract for app, service worker and inventory integration. The
// host supplies verified canonical CacheStorage fallback, never path-only hits.
export function createSavedMediaService({snapshot,readEntry,readCanonicalCache}){
 async function records(){const s=await snapshot();return s.packs.flatMap(pack=>pack.files.map(f=>({...f,ownerPack:pack})));}
 async function resolve(source){const all=await records(),saved=await resolveSaved(source,all,f=>readEntry(f.ownerPack,f));if(saved)return saved;const b=await readCanonicalCache?.(source);return b?resolveSaved(source,[source],async()=>b):null;}
 return {
  resolve,playback:async s=>(await resolve(s))?.blob||null,
  shouldDownload:async s=>!await resolve(s),
  async inventory(catalog){const sources=catalogSources(catalog),ready=[];for(const s of sources)if(await resolve(s))ready.push(key(s));const set=new Set(ready);return {sources:ready,readyIds:catalog.entries.filter(e=>sources.filter(s=>s.wordId===e.number).every(s=>set.has(key(s)))).map(e=>e.number)};},
  // A catalog update changes source identity; resolve never treats the old
  // variant as satisfying new canonical content. No mutation/network here.
  async updateStatus(catalog){return Promise.all(catalogSources(catalog).map(async source=>({source,saved:Boolean(await resolve(source))})));},
  async exportSelected(sources){const selected=[];for(const source of sources){const r=await resolve(source);if(!r)throw Error('Selected saved media missing/corrupt');selected.push(r);}return exportVariants(selected.map(x=>x.record),f=>selected.find(x=>x.record===f).blob);},
  // Delete planner identifies exact binding and every duplicate owner, rather
  // than deleting only a sidecar or another word sharing the same source URL.
  async deleteSelection(sources){const wanted=new Set(sources.map(key));return (await records()).filter(f=>wanted.has(key(sourceOf(f))));}
 };
}
