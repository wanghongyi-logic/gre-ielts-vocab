import {createMediaControl} from './offline-control.js';
import {videoMode} from './offline-preferences.js';
import {localAsset} from './offline-packs.js';
import {gateCatalog,isStorybookCatalog} from './release-policy.js';
import {validateTrackedArt} from './motion-tracks.js';
import {validateEntry} from './schema.js';
const notifyMedia=(phase,ref)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('gre-offline-asset',{detail:{phase,path:ref.url,bytes:ref.bytes}}));};
const mediaType=ref=>ref.url.endsWith('.mp4')?'video/mp4':ref.url.endsWith('.webm')?'video/webm':ref.url.endsWith('.webp')?'image/webp':ref.url.endsWith('.png')?'image/png':ref.url.endsWith('.avif')?'image/avif':'image/jpeg';
const abortError=()=>Object.assign(new Error('Request superseded'),{name:'AbortError'});
// Optional media has a deadline independent of required lesson text, including body reads.
async function optionalMediaBytes(fetcher,url,signal,priority,timeoutMs){
 const controller=new AbortController();let timer,abort;
 try{return await Promise.race([(async()=>{const response=await fetcher(url,{signal:controller.signal,priority,cache:'no-cache'});if(!response.ok)throw new Error('Illustration download failed');return {response,bytes:await response.arrayBuffer()};})(),new Promise((_,reject)=>{abort=()=>{controller.abort();reject(abortError());};signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>{controller.abort();reject(new Error('Optional illustration timed out'));},timeoutMs);if(signal?.aborted)abort();})]);}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export function expandCatalog(raw){
 raw=gateCatalog(raw);
 return {...raw,entries:raw.entries.map(entry=>({...entry,unit:raw.units[entry.unit],...(entry.art?{art:{...entry.art,url:`art-units/${entry.number}-${entry.art.sha256}.json`}}:{})}))};
}
export class LessonLoader {
 constructor(catalog,{baseURL=new URL('./',import.meta.url),fetcher=globalThis.fetch.bind(globalThis),crypto=globalThis.crypto,cacheStorage=globalThis.caches,mediaTimeoutMs=5000,maxEntries=8,maxBytes=2*1024*1024,setTimer=globalThis.setTimeout.bind(globalThis),clearTimer=globalThis.clearTimeout.bind(globalThis)}={}) {
  this.catalog=catalog;this.index=new Map(catalog.entries.map(entry=>[entry.number,entry]));
  if(this.index.size!==catalog.entries.length)throw new Error('Duplicate canonical ID');
  this.baseURL=baseURL;this.fetcher=fetcher;this.cacheStorage=cacheStorage;this.crypto=crypto;this.mediaTimeoutMs=mediaTimeoutMs;this.mediaControl=createMediaControl(new URL('../',baseURL));this.mediaGeneration=null;this.mediaControl.subscribe(state=>{if(state.paused||(this.mediaGeneration!==null&&state.generation!==this.mediaGeneration))this.destroy();this.mediaGeneration=state.generation;});this.maxEntries=maxEntries;this.maxBytes=maxBytes;this.cache=new Map();this.bytes=0;this.generation=0;this.foreground=null;this.prefetchController=null;this.timer=null;this.mediaCache=new Map();this.setTimer=setTimer;this.clearTimer=clearTimer;
 }
 async resource(ref,signal,priority='high') {
  if(signal?.aborted)throw abortError();
  const key=ref.sha256;
  if(this.cache.has(key)){const item=this.cache.get(key);this.cache.delete(key);this.cache.set(key,item);return item.data;}
  const url=new URL(ref.url,this.baseURL);
  if(url.origin!==this.baseURL.origin||!url.pathname.startsWith(this.baseURL.pathname))throw new Error('Unit outside lesson scope');
  const local=await localAsset(ref);
  if(signal?.aborted)throw abortError();
  const response=local?new Response(local):await this.fetcher(url,{signal,priority,cache:'no-cache'});
  if(!response.ok)throw new Error(`Lesson download failed (${response.status})`);
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength!==ref.bytes)throw new Error('Lesson byte count mismatch');
  const digest=await this.crypto.subtle.digest('SHA-256',bytes);
  const hash=Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
  if(hash!==key)throw new Error('Lesson integrity mismatch');
  if(signal?.aborted)throw abortError();
  const data=JSON.parse(new TextDecoder().decode(bytes));
  if(data.schema!==1){if(data.schema!==2||!ref.url.startsWith('art-units/')||bytes.byteLength>2*1024*1024)throw new Error('Unsupported lesson schema');validateTrackedArt(data);}
  // First-load requests can finish before service-worker control. Persist verified bytes too.
  // Quota/private-mode failures affect offline availability, never successful live rendering.
  if(this.cacheStorage){try{const disk=await this.cacheStorage.open('gre-scalable-verified-units-v1');await disk.put(url.href,new Response(bytes,{headers:{'Content-Type':'application/json'}}));}catch{}}
  if(signal?.aborted)throw abortError();
  // Never pin a single oversize unit in the LRU. Its foreground caller may still render it.
  if(bytes.byteLength<=this.maxBytes){
   if(this.cache.has(key))this.bytes-=this.cache.get(key).bytes;
   this.cache.set(key,{data,bytes:bytes.byteLength});this.bytes+=bytes.byteLength;
   while(this.cache.size>this.maxEntries||this.bytes>this.maxBytes){const oldest=this.cache.keys().next().value;this.bytes-=this.cache.get(oldest).bytes;this.cache.delete(oldest);}
  }
  return data;
 }
 async mediaResource(ref,signal,priority='high',allowNetwork=true) {
  const ticket=await this.mediaControl.ticket();if(ticket===null)return null;
  if(signal?.aborted)throw abortError();
  if(this.mediaCache.has(ref.sha256))return this.mediaControl.guard(ticket,()=>this.mediaCache.get(ref.sha256));
  const url=new URL(ref.url,this.baseURL);
  if(url.origin!==this.baseURL.origin||!url.pathname.startsWith(new URL('story-media/',this.baseURL).pathname))throw new Error('Media outside lesson scope');
  const local=await localAsset(ref);
  if(signal?.aborted)throw abortError();
  if(local)return this.mediaControl.guard(ticket,()=>{if(signal?.aborted)throw abortError();if(this.mediaCache.has(ref.sha256))return this.mediaCache.get(ref.sha256);const blobURL=URL.createObjectURL(local);this.mediaCache.set(ref.sha256,blobURL);return blobURL;});
  // Reuse previously verified local cache before online fallback.
  {
   try{const cached=await(await this.cacheStorage?.open('gre-scalable-verified-units-v1'))?.match(url.href);if(!cached)throw new Error('Not cached');const bytes=await cached.arrayBuffer();if(bytes.byteLength!==ref.bytes)throw new Error('Invalid cache');const digest=await this.crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==ref.sha256)throw new Error('Invalid cache');if(signal?.aborted)throw abortError();return this.mediaControl.guard(ticket,()=>{if(this.mediaCache.has(ref.sha256))return this.mediaCache.get(ref.sha256);const blobURL=URL.createObjectURL(new Blob([bytes],{type:mediaType(ref)}));this.mediaCache.set(ref.sha256,blobURL);return blobURL;});}catch(error){if(signal?.aborted)throw error;}
  }
  if(!allowNetwork)return null;
  notifyMedia('start',ref);try{
  const {bytes}=await optionalMediaBytes(this.fetcher,url,signal,priority,this.mediaTimeoutMs);
  if(bytes.byteLength!==ref.bytes)throw new Error('Illustration byte count mismatch');
  const digest=await this.crypto.subtle.digest('SHA-256',bytes);
  const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  if(hash!==ref.sha256)throw new Error('Illustration integrity mismatch');
  if(signal?.aborted)throw abortError();
  const type=mediaType(ref);
  return await this.mediaControl.guard(ticket,async()=>{
  if(this.cacheStorage){try{const disk=await this.cacheStorage.open('gre-scalable-verified-units-v1');await disk.put(url.href,new Response(bytes,{headers:{'Content-Type':type}}));notifyMedia('saved',ref);}catch{}}
  if(signal?.aborted)throw abortError();
  // Another concurrent verified request may have completed while disk persistence waited.
  if(this.mediaCache.has(ref.sha256))return this.mediaCache.get(ref.sha256);
  const blobURL=URL.createObjectURL(new Blob([bytes],{type}));
  this.mediaCache.set(ref.sha256,blobURL);return blobURL;
  });
  }finally{notifyMedia('end',ref);}
 }
 async pair(number,signal,priority='high') {
  const meta=this.index.get(Number(number));if(!meta)throw new Error('Lesson is not reviewed and ready');
  if(isStorybookCatalog(this.catalog)) {
   if(videoMode()==='none'){const unit=await this.resource(meta.unit,signal,priority),entry=unit.entries?.find(e=>e.number===meta.number);if(!entry||entry.word!==meta.word)throw new Error('Incompatible lesson');validateEntry(entry);return {entry,media:null};}
   const refs=meta.storyMedia,allowNetwork=(meta.displayOrdinal??this.catalog.entries.indexOf(meta)+1)<=50;
   const [unit,posterURL,videoURL,staticPosterURL]=await Promise.all([this.resource(meta.unit,signal,priority),refs?this.mediaResource(refs.poster,signal,priority,allowNetwork).catch(error=>{if(signal?.aborted)throw error;return null;}):null,refs?this.mediaResource(refs.video,signal,priority,allowNetwork).catch(error=>{if(signal?.aborted)throw error;return null;}):null,refs?.staticPoster?this.mediaResource(refs.staticPoster,signal,priority,allowNetwork).catch(error=>{if(signal?.aborted)throw error;return null;}):null]);
   const entry=unit.entries?.find(item=>item.number===meta.number);
   if(!entry||entry.word!==meta.word)throw new Error('Incompatible lesson');
   validateEntry(entry);
   return {entry,media:refs&&(posterURL||videoURL)?{...refs,posterURL,videoURL,...(refs.staticPoster?{staticPosterURL}:{} )}:null};
  }
  const [unit,art]=await Promise.all([this.resource(meta.unit,signal,priority),this.resource(meta.art,signal,priority)]);
  const entry=unit.entries?.find(entry=>entry.number===meta.number);
  if(!entry||entry.word!==meta.word||art.number!==meta.number||art.word!==meta.word||art.example?.word!==meta.word||(art.schema===2?!Array.isArray(art.nodes):!Array.isArray(art.layers)))throw new Error('Incompatible lesson and artwork');
  validateEntry(entry);
  return {entry,art};
 }
 cancel(){this.generation++;this.foreground?.abort();this.foreground=null;this.prefetchController?.abort();this.prefetchController=null;if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;}
 async select(number){
  this.cancel();const generation=this.generation;const controller=new AbortController();this.foreground=controller;
  try{const lesson=await this.pair(number,controller.signal);if(generation!==this.generation||controller.signal.aborted)throw abortError();return {...lesson,generation};}
  catch(error){controller.abort();throw error;}
  finally{if(this.foreground===controller)this.foreground=null;}
 }
 prefetchAdjacent(number){
  const generation=this.generation;const i=this.catalog.entries.findIndex(entry=>entry.number===number);
  if(this.timer!==null)this.clearTimer(this.timer);
  this.timer=this.setTimer(async()=>{this.timer=null;if(generation!==this.generation)return;const controller=new AbortController();this.prefetchController=controller;
   // At most two sequential low-priority neighboring lessons; aborted by every foreground selection.
   for(const meta of [this.catalog.entries[i+1],this.catalog.entries[i-1]].filter(Boolean)){try{await this.pair(meta.number,controller.signal,'low');}catch{}if(controller.signal.aborted||generation!==this.generation)break;}
   if(this.prefetchController===controller)this.prefetchController=null;
  },250);
 }
 retainMedia(numbers){
  const hashes=new Set();for(const number of numbers){const refs=this.index.get(number)?.storyMedia;if(refs){hashes.add(refs.poster.sha256);hashes.add(refs.video.sha256);if(refs.staticPoster)hashes.add(refs.staticPoster.sha256);}}
  for(const [hash,url] of this.mediaCache)if(!hashes.has(hash)){URL.revokeObjectURL(url);this.mediaCache.delete(hash);}
 }
 destroy(){this.cancel();this.cache.clear();this.bytes=0;for(const url of this.mediaCache.values())URL.revokeObjectURL(url);this.mediaCache.clear();}
}
