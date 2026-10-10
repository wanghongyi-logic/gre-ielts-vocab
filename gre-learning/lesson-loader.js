import {gateCatalog} from './release-policy.js';
import {validateTrackedArt} from './motion-tracks.js';
import {validateEntry} from './schema.js';
const abortError=()=>Object.assign(new Error('Request superseded'),{name:'AbortError'});
export function expandCatalog(raw){
 raw=gateCatalog(raw);
 return {...raw,entries:raw.entries.map(entry=>({...entry,unit:raw.units[entry.unit],art:{...entry.art,url:`art-units/${entry.number}-${entry.art.sha256}.json`}}))};
}
export class LessonLoader {
 constructor(catalog,{baseURL=new URL('./',import.meta.url),fetcher=globalThis.fetch.bind(globalThis),crypto=globalThis.crypto,cacheStorage=globalThis.caches,maxEntries=8,maxBytes=2*1024*1024,setTimer=globalThis.setTimeout.bind(globalThis),clearTimer=globalThis.clearTimeout.bind(globalThis)}={}) {
  this.catalog=catalog;this.index=new Map(catalog.entries.map(entry=>[entry.number,entry]));
  if(this.index.size!==catalog.entries.length)throw new Error('Duplicate canonical ID');
  this.baseURL=baseURL;this.fetcher=fetcher;this.cacheStorage=cacheStorage;this.crypto=crypto;this.maxEntries=maxEntries;this.maxBytes=maxBytes;this.cache=new Map();this.bytes=0;this.generation=0;this.foreground=null;this.prefetchController=null;this.timer=null;this.mediaCache=new Map();this.setTimer=setTimer;this.clearTimer=clearTimer;
 }
 async resource(ref,signal,priority='high') {
  if(signal?.aborted)throw abortError();
  const key=ref.sha256;
  if(this.cache.has(key)){const item=this.cache.get(key);this.cache.delete(key);this.cache.set(key,item);return item.data;}
  const url=new URL(ref.url,this.baseURL);
  if(url.origin!==this.baseURL.origin||!url.pathname.startsWith(this.baseURL.pathname))throw new Error('Unit outside lesson scope');
  const response=await this.fetcher(url,{signal,priority,cache:'no-cache'});
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
 async mediaResource(ref,signal,priority='high') {
  if(signal?.aborted)throw abortError();
  if(this.mediaCache.has(ref.sha256))return this.mediaCache.get(ref.sha256);
  const url=new URL(ref.url,this.baseURL);
  if(url.origin!==this.baseURL.origin||!url.pathname.startsWith(new URL('story-media/',this.baseURL).pathname))throw new Error('Media outside lesson scope');
  const response=await this.fetcher(url,{signal,priority,cache:'no-cache'});
  if(!response.ok)throw new Error('Illustration download failed');
  const bytes=await response.arrayBuffer();
  if(bytes.byteLength!==ref.bytes)throw new Error('Illustration byte count mismatch');
  const digest=await this.crypto.subtle.digest('SHA-256',bytes);
  const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  if(hash!==ref.sha256)throw new Error('Illustration integrity mismatch');
  if(signal?.aborted)throw abortError();
  const type=ref.url.endsWith('.mp4')?'video/mp4':ref.url.endsWith('.webm')?'video/webm':ref.url.endsWith('.webp')?'image/webp':ref.url.endsWith('.png')?'image/png':ref.url.endsWith('.avif')?'image/avif':'image/jpeg';
  if(this.cacheStorage){try{const disk=await this.cacheStorage.open('gre-scalable-verified-units-v1');await disk.put(url.href,new Response(bytes,{headers:{'Content-Type':type}}));}catch{}}
  if(signal?.aborted)throw abortError();
  // Another concurrent verified request may have completed while disk persistence waited.
  if(this.mediaCache.has(ref.sha256))return this.mediaCache.get(ref.sha256);
  const blobURL=URL.createObjectURL(new Blob([bytes],{type}));
  this.mediaCache.set(ref.sha256,blobURL);return blobURL;
 }
 async pair(number,signal,priority='high') {
  const meta=this.index.get(Number(number));if(!meta)throw new Error('Lesson is not reviewed and ready');
  if(this.catalog.learningRelease.sampleMode==='storybook-first-five') {
   const refs=meta.storyMedia;
   const [unit,posterURL,videoURL]=await Promise.all([this.resource(meta.unit,signal,priority),refs?this.mediaResource(refs.poster,signal,priority):null,refs?this.mediaResource(refs.video,signal,priority):null]);
   const entry=unit.entries?.find(item=>item.number===meta.number);
   if(!entry||entry.word!==meta.word)throw new Error('Incompatible lesson');
   validateEntry(entry);
   return {entry,media:refs?{...refs,posterURL,videoURL}:null};
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
 destroy(){this.cancel();this.cache.clear();this.bytes=0;for(const url of this.mediaCache.values())URL.revokeObjectURL(url);this.mediaCache.clear();}
}
