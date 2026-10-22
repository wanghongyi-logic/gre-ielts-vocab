import {readPreviewAsset,previewClientId} from './compression-preview-session.js';
import {waitForLocal,preferVerifiedLocal} from './offline-async.js';
import {hostedMediaPaths,isHostedMediaEntry} from './hosted-media.js';
import {createMediaControl} from './offline-control.js';
import {videoMode} from './offline-preferences.js';
import {localAsset} from './offline-packs.js';
import {gateCatalog,isStorybookCatalog} from './release-policy.js';
import {validateTrackedArt} from './motion-tracks.js';
import {validateEntry} from './schema.js';
const notifyMedia=(phase,ref)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('gre-offline-asset',{detail:{phase,path:ref.url,bytes:ref.bytes}}));};
const mediaType=ref=>ref.url.endsWith('.mp4')?'video/mp4':ref.url.endsWith('.webm')?'video/webm':ref.url.endsWith('.webp')?'image/webp':ref.url.endsWith('.png')?'image/png':ref.url.endsWith('.avif')?'image/avif':'image/jpeg';
const abortError=()=>Object.assign(new Error('Request superseded'),{name:'AbortError'});
// Saved reads address one immutable key directly; cache enumeration/open is not a prerequisite.
const matchSavedCache=(storage,url)=>typeof storage?.match==='function'?storage.match(url,{cacheName:'gre-scalable-verified-units-v1'}):Promise.resolve(storage?.open?.('gre-scalable-verified-units-v1')).then(cache=>cache?.match(url));
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
 constructor(catalog,{baseURL=new URL('./',import.meta.url),fetcher=globalThis.fetch.bind(globalThis),crypto=globalThis.crypto,cacheStorage=globalThis.caches,mediaTimeoutMs=5000,localMediaTimeoutMs=6500,localTextTimeoutMs=1200,textTimeoutMs=6500,maxEntries=8,maxBytes=2*1024*1024,setTimer=globalThis.setTimeout.bind(globalThis),clearTimer=globalThis.clearTimeout.bind(globalThis)}={}) {
  this.catalog=catalog;this.hostedMediaPaths=hostedMediaPaths(catalog);this.index=new Map(catalog.entries.map(entry=>[entry.number,entry]));
  if(this.index.size!==catalog.entries.length)throw new Error('Duplicate canonical ID');
  this.baseURL=baseURL;this.fetcher=fetcher;this.cacheStorage=cacheStorage;this.crypto=crypto;this.mediaTimeoutMs=mediaTimeoutMs;this.localMediaTimeoutMs=localMediaTimeoutMs;this.localTextTimeoutMs=localTextTimeoutMs;this.textTimeoutMs=textTimeoutMs;this.textWrites=new Map();this.textReads=new Map();this.mediaReads=new Map();this.localMediaReads=new Map();this.nextUnit=null;this.mediaControl=createMediaControl(new URL('../',baseURL));this.mediaGeneration=null;this.mediaControl.subscribe(state=>{if(state.paused||(this.mediaGeneration!==null&&state.generation!==this.mediaGeneration))this.destroy();this.mediaGeneration=state.generation;});this.maxEntries=maxEntries;this.maxBytes=maxBytes;this.cache=new Map();this.bytes=0;this.generation=0;this.foreground=null;this.prefetchController=null;this.timer=null;this.mediaCache=new Map();this.previewMediaSources=new Map();this.setTimer=setTimer;this.clearTimer=clearTimer;this.previewChannel=typeof BroadcastChannel==='function'?new BroadcastChannel('gre-compression-preview-v1'):null;this.previewChannel?.unref?.();if(this.previewChannel)this.previewChannel.onmessage=event=>{if(event.data?.sender===previewClientId)return;this.destroy();if(typeof window!=='undefined'){const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-compression-replaced',{detail}));Promise.allSettled(detail.waits).then(()=>window.dispatchEvent(new CustomEvent('gre-library-updated',{detail:{waits:[]}})));}};if(typeof window!=='undefined')window.addEventListener('gre-compression-preview-change',()=>this.destroy());
 }
 async resource(ref,signal,priority='high') {
  if(signal?.aborted)throw abortError();
  let job=this.textReads.get(ref.sha256);
  if(!job){
   const controller=new AbortController();job={controller,users:0};
   job.promise=this.readResource(ref,controller.signal,priority).finally(()=>{if(this.textReads.get(ref.sha256)===job)this.textReads.delete(ref.sha256);});
   this.textReads.set(ref.sha256,job);
  }
  job.users++;
  try{return await waitForLocal(()=>job.promise,{signal,timeoutMs:0});}
  finally{if(--job.users===0&&this.textReads.get(ref.sha256)===job){this.textReads.delete(ref.sha256);job.controller.abort();}}
 }
 async readResource(ref,signal,priority='high') {
  if(signal?.aborted)throw abortError();
  const key=ref.sha256;
  if(this.cache.has(key)){const item=this.cache.get(key);this.cache.delete(key);this.cache.set(key,item);return item.data;}
  const url=new URL(ref.url,this.baseURL);
  if(url.origin!==this.baseURL.origin||!url.pathname.startsWith(this.baseURL.pathname))throw new Error('Unit outside lesson scope');
  const verified=async(response,fromDisk=false)=>{
   if(!response?.ok)throw new Error(`Lesson download failed (${response?.status??'missing'})`);
   const bytes=await response.arrayBuffer();
   if(bytes.byteLength!==ref.bytes)throw new Error('Lesson byte count mismatch');
   const digest=await this.crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest),value=>value.toString(16).padStart(2,'0')).join('');
   if(hash!==key)throw new Error('Lesson integrity mismatch');
   return {bytes,fromDisk};
  };
  const {bytes,fromDisk}=await preferVerifiedLocal(()=>Promise.any([
   (async()=>{const blob=await localAsset(ref);if(!blob)throw new Error('No imported text');return verified(new Response(blob));})(),
   (async()=>{const cached=await matchSavedCache(this.cacheStorage,url.href);if(!cached)throw new Error('No cached text');return verified(cached,true);})()
  ]),async networkSignal=>verified(await this.fetcher(url,{signal:networkSignal,priority,cache:'no-cache'})),{signal,localTimeoutMs:this.localTextTimeoutMs,totalTimeoutMs:this.textTimeoutMs});
  if(signal?.aborted)throw abortError();
  const data=JSON.parse(new TextDecoder().decode(bytes));
  if(data.schema!==1){if(data.schema!==2||!ref.url.startsWith('art-units/')||bytes.byteLength>2*1024*1024)throw new Error('Unsupported lesson schema');validateTrackedArt(data);}
  // First-load requests can finish before service-worker control. Persist verified bytes too.
  // Quota/private-mode failures affect offline availability, never successful live rendering.
  if(this.cacheStorage&&!fromDisk&&!this.textWrites.has(url.href)&&this.textWrites.size<2){
   // Verified text is immediately readable. At most two best-effort disk writes
   // may remain pending; a stalled browser must not retain the whole book in RAM.
   const write=Promise.resolve().then(async()=>{const disk=await this.cacheStorage.open('gre-scalable-verified-units-v1');await disk.put(url.href,new Response(bytes,{headers:{'Content-Type':'application/json'}}));}).catch(()=>{}).finally(()=>this.textWrites.delete(url.href));
   this.textWrites.set(url.href,write);
  }
  if(signal?.aborted)throw abortError();
  // Never pin a single oversize unit in the LRU. Its foreground caller may still render it.
  if(bytes.byteLength<=this.maxBytes){
   if(this.cache.has(key))this.bytes-=this.cache.get(key).bytes;
   this.cache.set(key,{data,bytes:bytes.byteLength});this.bytes+=bytes.byteLength;
   while(this.cache.size>this.maxEntries||this.bytes>this.maxBytes){const oldest=this.cache.keys().next().value;this.bytes-=this.cache.get(oldest).bytes;this.cache.delete(oldest);}
  }
  return data;
 }
 // Consumers share verification, but cancelling one page never cancels another.
 async mediaResource(ref,signal,priority='high',allowNetwork=true) {
  if(signal?.aborted)throw abortError();
  const ticket=await this.mediaControl.readTicket();if(ticket===null)return null;
  if(signal?.aborted)throw abortError();
  const key=[ticket,ref.url,ref.sha256,ref.bytes,Boolean(allowNetwork)].join('|');
  let job=this.mediaReads.get(key);
  if(!job||job.controller.signal.aborted){
   const controller=new AbortController();job={controller,users:0};
   job.promise=Promise.resolve().then(()=>this.readMediaResource(ref,controller.signal,priority,allowNetwork,ticket)).finally(()=>{if(this.mediaReads.get(key)===job)this.mediaReads.delete(key);});
   this.mediaReads.set(key,job);
  }
  job.users++;
  try{return await waitForLocal(()=>job.promise,{signal,timeoutMs:0});}
  finally{if(--job.users===0&&this.mediaReads.get(key)===job)job.controller.abort();}
 }
 async readLocalMedia(ref,url,ticket){
  const key=[ticket,url.href,ref.sha256,ref.bytes].join('|');
  let pending=this.localMediaReads.get(key);
  if(!pending){
   // Native storage reads cannot be aborted. Keep only their in-flight promise,
   // allowing a replacement page to reuse the work rather than duplicate it.
   pending=Promise.any([
    (async()=>{const blob=await localAsset(ref);if(!blob)throw new Error('No imported media');return blob;})(),
    (async()=>{const cached=await matchSavedCache(this.cacheStorage,url.href);if(!cached)throw new Error('No cached media');const bytes=await cached.arrayBuffer();if(bytes.byteLength!==ref.bytes)throw new Error('Invalid cache size');const digest=await this.crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==ref.sha256)throw new Error('Invalid cache hash');return new Blob([bytes],{type:mediaType(ref)});})()
   ]);
   this.localMediaReads.set(key,pending);
   const finish=()=>{if(this.localMediaReads.get(key)===pending)this.localMediaReads.delete(key);};pending.then(finish,finish);
  }
  return pending;
 }
 async readMediaResource(ref,signal,priority,allowNetwork,ticket){
  if(signal?.aborted)throw abortError();
  const preview=await readPreviewAsset(ref,{catalog:this.catalog,scopeURL:new URL('../',this.baseURL),generation:ticket});
  if(signal?.aborted)throw abortError();
  if(preview)return this.mediaControl.readGuard(ticket,()=>{if(signal?.aborted)throw abortError();const identity='preview|'+preview.token+'|'+preview.variant.sha256+'|'+preview.source.sha256;this.previewMediaSources.set(identity,preview.source.sha256);if(!this.mediaCache.has(identity))this.mediaCache.set(identity,URL.createObjectURL(preview.blob));return this.mediaCache.get(identity);});
  if(this.mediaCache.has(ref.sha256))return this.mediaControl.readGuard(ticket,()=>{if(signal?.aborted)throw abortError();return this.mediaCache.get(ref.sha256);});
  const url=new URL(ref.url,this.baseURL);
  if(url.origin!==this.baseURL.origin||!url.pathname.startsWith(new URL('story-media/',this.baseURL).pathname))throw new Error('Media outside lesson scope');
  const local=this.readLocalMedia(ref,url,ticket).then(blob=>({blob,network:false}));
  let result;
  try{result=await waitForLocal(local,{signal,timeoutMs:1200});}
  catch(error){
   if(signal?.aborted)throw error;
   if(!allowNetwork||!this.hostedMediaPaths.has(ref.url)||!await this.mediaControl.automaticAllowed(url)){
    try{result=await waitForLocal(local,{signal,timeoutMs:0});}catch(error){if(signal?.aborted)throw error;return null;}
   }else{
    const fallback=new AbortController(),abortFallback=()=>fallback.abort();signal?.addEventListener('abort',abortFallback,{once:true});if(signal?.aborted)abortFallback();
    const network=async()=>{notifyMedia('start',ref);try{
     const {bytes}=await optionalMediaBytes(this.fetcher,url,fallback.signal,priority,this.mediaTimeoutMs);
     if(bytes.byteLength!==ref.bytes)throw new Error('Illustration byte count mismatch');
     const digest=await this.crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
     if(hash!==ref.sha256)throw new Error('Illustration integrity mismatch');
     return {blob:new Blob([bytes],{type:mediaType(ref)}),network:true};
    }finally{notifyMedia('end',ref);}};
    try{result=await waitForLocal(()=>Promise.any([local,network()]),{signal,timeoutMs:0});}
    finally{fallback.abort();signal?.removeEventListener('abort',abortFallback);}
   }
  }
  if(signal?.aborted)throw abortError();
  // A local result is already verified and requires no storage mutation.
  // Do not let a cancelled download's still-draining cache.put hold playback.
  if(!result.network)return this.mediaControl.readGuard(ticket,()=>{
   if(signal?.aborted)throw abortError();
   if(this.mediaCache.has(ref.sha256))return this.mediaCache.get(ref.sha256);
   const blobURL=URL.createObjectURL(result.blob);this.mediaCache.set(ref.sha256,blobURL);return blobURL;
  });
  return this.mediaControl.guard(ticket,async()=>{
   if(signal?.aborted)throw abortError();
   if(this.mediaCache.has(ref.sha256))return this.mediaCache.get(ref.sha256);
   if(result.network&&this.cacheStorage){try{const disk=await this.cacheStorage.open('gre-scalable-verified-units-v1');await disk.put(url.href,new Response(result.blob,{headers:{'Content-Type':mediaType(ref)}}));notifyMedia('saved',ref);}catch{}}
   if(signal?.aborted)throw abortError();
   const blobURL=URL.createObjectURL(result.blob);this.mediaCache.set(ref.sha256,blobURL);return blobURL;
  });
 }
 async optionalMedia(ref,signal,priority,allowNetwork,timeoutMs=this.localMediaTimeoutMs){
  if(!ref)return null;
  const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
  try{return await waitForLocal(()=>this.mediaResource(ref,controller.signal,priority,allowNetwork),{signal,timeoutMs,onTimeout:abort});}
  catch(error){abort();if(signal?.aborted)throw error;return null;}
  finally{signal?.removeEventListener('abort',abort);}
 }
 async pair(number,signal,priority='high',{progressive=false}={}) {
  const meta=this.index.get(Number(number));if(!meta)throw new Error('Lesson is not reviewed and ready');
  if(isStorybookCatalog(this.catalog)) {
   if(videoMode()==='none'){const unit=await this.resource(meta.unit,signal,priority),entry=unit.entries?.find(e=>e.number===meta.number);if(!entry||entry.word!==meta.word)throw new Error('Incompatible lesson');validateEntry(entry);return {entry,media:null};}
   const refs=meta.storyMedia,allowNetwork=isHostedMediaEntry(meta,this.catalog.entries.indexOf(meta));
   if(progressive){
    let availablePosterURL=null;
    const posterRead=this.optionalMedia(refs?.poster,signal,priority,allowNetwork,30000).then(url=>{availablePosterURL=url;return url;});
    const posterReady=posterRead.then(posterURL=>posterURL?{...refs,posterURL,videoURL:null,pending:true}:null);
    const videoReady=this.optionalMedia(refs?.video,signal,priority,allowNetwork,30000);
    let staticPosterURL=null;
    const staticPosterReady=this.optionalMedia(refs?.staticPoster,signal,priority,allowNetwork,30000).then(url=>{staticPosterURL=url;return url;});
    // Neither poster can hold a verified video behind its IO.
    const mediaReady=videoReady.then(async videoURL=>{const posterURL=videoURL?availablePosterURL:await posterRead;return refs&&(posterURL||videoURL||staticPosterURL)?{...refs,posterURL,videoURL,staticPosterURL,pending:false}:null;});
    // A required-text failure or page retirement can precede the consumers.
    posterReady.catch(()=>{});mediaReady.catch(()=>{});staticPosterReady.catch(()=>{});
    const unit=await this.resource(meta.unit,signal,priority),entry=unit.entries?.find(item=>item.number===meta.number);
    if(!entry||entry.word!==meta.word)throw new Error('Incompatible lesson');validateEntry(entry);
    return {entry,media:refs?{...refs,pending:true}:null,posterReady,mediaReady,staticPosterReady};
   }
   const [unit,posterURL,videoURL,staticPosterURL]=await Promise.all([this.resource(meta.unit,signal,priority),this.optionalMedia(refs?.poster,signal,priority,allowNetwork),this.optionalMedia(refs?.video,signal,priority,allowNetwork),this.optionalMedia(refs?.staticPoster,signal,priority,allowNetwork)]);
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
 prefetchNextUnit(number){
  const i=this.catalog.entries.findIndex(entry=>entry.number===number),current=this.catalog.entries[i];
  if(!current)return;
  const next=this.catalog.entries.slice(i+1).find(entry=>entry.unit.sha256!==current.unit.sha256);
  if(!next||this.cache.has(next.unit.sha256)||this.nextUnit?.hash===next.unit.sha256)return;
  this.nextUnit?.controller.abort();
  const controller=new AbortController(),job={hash:next.unit.sha256,controller};this.nextUnit=job;
  const timer=this.setTimer(()=>controller.abort(),8000);
  // Text only: no media reads/decoding, and one next distinct unit at a time.
  this.resource(next.unit,controller.signal,'low').catch(()=>{}).finally(()=>{this.clearTimer(timer);if(this.nextUnit===job)this.nextUnit=null;});
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
  for(const [hash,url] of this.mediaCache)if(!hashes.has(hash)&&!hashes.has(this.previewMediaSources.get(hash))){URL.revokeObjectURL(url);this.mediaCache.delete(hash);this.previewMediaSources.delete(hash);}
 }
 destroy(){this.cancel();for(const job of this.mediaReads.values())job.controller.abort();this.mediaReads.clear();this.localMediaReads.clear();this.nextUnit?.controller.abort();this.nextUnit=null;for(const job of this.textReads.values())job.controller.abort();this.textReads.clear();this.cache.clear();this.bytes=0;for(const url of this.mediaCache.values())URL.revokeObjectURL(url);this.mediaCache.clear();this.previewMediaSources.clear();}
}

