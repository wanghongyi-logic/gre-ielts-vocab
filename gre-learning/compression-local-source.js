import {sha256,abortCheck} from './compression-preview.js';
import {validSource,validateVariant} from './compression-variants.js';
const DB='gre-offline-pack-index-v1',DIR='gre-offline-packs-v1',CACHE='gre-scalable-verified-units-v1';
const roles=['video','poster','staticPoster'];
// Word and role are part of approval identity, even when two entries share bytes.
export const sourceIdentity=item=>JSON.stringify([item.path,item.sha256,item.bytes,item.wordId,item.role]);
const valid=validSource;
const cancelled=()=>new DOMException('已取消；原文件未更改','AbortError');
const timeout=()=>Object.assign(new Error('读取超时，请重试'),{name:'TimeoutError'});
const errorText=error=>error?.message||'存储暂时不可读';
function sourceRequests(catalog){
 const wanted=new Map();
 for(const entry of catalog?.entries||[])for(const role of roles){const ref=entry.storyMedia?.[role];if(!ref)continue;const source={path:'gre-learning/'+ref.url,sha256:ref.sha256,bytes:ref.bytes,wordId:entry.number,role};if(valid(source))wanted.set(sourceIdentity(source),source);}
 return wanted;
}
// Inactivity (not total range duration) is bounded. Progress renews the deadline.
// Abort/timeout stops new reads; late results cannot modify the returned inventory.
function readStage(work,{signal,timeoutMs}){
 return new Promise((resolve,reject)=>{
  const state={stopped:false,onStop:new Set()};let timer;
  const finish=error=>{if(state.stopped)return;state.stopped=true;for(const stop of state.onStop)stop();state.onStop.clear();clearTimeout(timer);signal?.removeEventListener('abort',abort);error?.name==='AbortError'&&signal?.aborted?reject(error):resolve(error||null);};
  const abort=()=>finish(cancelled());
  if(signal?.aborted){abort();return;}
  state.touch=()=>{if(!state.stopped){clearTimeout(timer);timer=setTimeout(()=>finish(timeout()),timeoutMs);}};
  signal?.addEventListener('abort',abort,{once:true});state.touch();
  Promise.resolve().then(()=>{if(!state.stopped)return work(state);}).then(()=>finish(),finish);
 });
}
// Never depend on IDBFactory.databases(): Safari may reject or stall enumeration
// while direct read-only opening still works. No version is requested, and a
// new database's versionchange transaction is always aborted without writes.
function readMatchingPacks(wanted,{signal,timeoutMs}){
 const records=new Map(),uncertain=new Set();
 return new Promise((resolve,reject)=>{
  let done=false,db,tx,request,timer,absent=false;
  const close=connection=>{try{connection?.close();}catch{}};
  const finish=error=>{
   if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);
   if(error)try{tx?.abort();}catch{}
   close(db);
   if(signal?.aborted){reject(cancelled());return;}
   resolve({records,uncertain,error:error||null});
  };
  const abort=()=>finish(cancelled());
  const touch=()=>{if(!done){clearTimeout(timer);timer=setTimeout(()=>finish(timeout()),timeoutMs);}};
  if(signal?.aborted){abort();return;}
  signal?.addEventListener('abort',abort,{once:true});touch();
  try{
   if(!globalThis.indexedDB?.open)throw new Error('此浏览器无法读取本机书包索引');
   request=globalThis.indexedDB.open(DB);
   request.onupgradeneeded=()=>{absent=true;try{request.transaction.abort();}catch(error){finish(error);}close(request.result);};
   request.onblocked=()=>finish(new Error('本机书包索引被其他页面占用'));
   request.onerror=()=>finish(absent?null:request.error||new Error('本机书包索引读取失败'));
   request.onsuccess=()=>{
    db=request.result;if(done){close(db);return;}touch();
    try{
     if(!db.objectStoreNames.contains('packs'))throw new Error('未知的本机书包索引格式');
     db.onversionchange=()=>finish(new Error('本机书包索引已变化，请重试'));
     tx=db.transaction('packs','readonly');
     tx.oncomplete=()=>finish();tx.onerror=tx.onabort=()=>finish(tx.error||new Error('本机书包索引读取中断'));
     // One metadata record at a time, never getAll() or read unrelated bodies.
     const cursorRequest=tx.objectStore('packs').openCursor();
     cursorRequest.onerror=()=>finish(cursorRequest.error||new Error('本机书包索引读取失败'));
     cursorRequest.onsuccess=()=>{
      if(done)return;touch();
      try{
       const cursor=cursorRequest.result;if(!cursor)return;const pack=cursor.value;
       if(!Array.isArray(pack?.files))throw new Error('部分本机书包索引格式无效');
       for(const file of pack.files){
        if(!file||typeof file!=='object')continue;
        const variant=file.kind==='owned-local-variant',source=variant?file.source:file;
        if(!valid(source))continue;
        const identity=sourceIdentity(source);if(!wanted.has(identity))continue;
        try{
         if(variant)validateVariant(file);
         else if(file.source||file.kind&&file.kind!=='canonical')throw new Error('未知的本机原文件格式');
         if(typeof pack.name!=='string'||!pack.name||/[\\/]/.test(pack.name)||['.','..'].includes(pack.name)||!Number.isSafeInteger(pack.bytes)||pack.bytes<1||!Number.isSafeInteger(file.start)||file.start<0||file.start+file.bytes>pack.bytes)throw new Error('本机文件位置无效');
         if(!records.has(identity))records.set(identity,[]);
         records.get(identity).push({...wanted.get(identity),storage:'opfs',packName:pack.name,packBytes:pack.bytes,start:file.start,storedBytes:file.bytes,variant});
        }catch{uncertain.add(identity);}
       }
       cursor.continue();
      }catch(error){finish(error);}
     };
    }catch(error){finish(error);}
   };
  }catch(error){finish(error);}
 });
}
function discardResponse(response){try{response?.body?.cancel?.()?.catch?.(()=>{});}catch{}}
// These pools outlive individual scans. A timed-out browser call keeps its slot
// until it actually settles; a retry joins that exact read rather than issuing
// another unabortable operation. Only metadata, never Response/File bodies, is
// delivered to subscribers. Cancelled queued jobs are removed immediately.
function createReadPool(limit){
 const pending=new Map(),queue=[];let active=0;
 const detach=task=>{for(const [state,stop] of task.users)state.onStop.delete(stop);task.users.clear();};
 const pump=()=>{
  while(active<limit&&queue.length){
   const task=queue.shift();if(!task.users.size)continue;task.active=true;active++;
   const wanted=()=>task.users.size>0,touch=()=>{for(const state of task.users.keys())state.touch();};
   const finish=(error,value)=>{active--;if(pending.get(task.key)===task)pending.delete(task.key);detach(task);pump();error?task.reject(error):task.resolve(value);};
   Promise.resolve().then(()=>{if(!wanted())throw cancelled();return task.work(wanted,touch);}).then(value=>finish(null,value),error=>finish(error));
  }
 };
 return (key,work,state)=>{
  if(state.stopped)return Promise.reject(cancelled());
  let task=pending.get(key);
  if(!task){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});task={key,work,promise,resolve,reject,users:new Map(),active:false};pending.set(key,task);queue.push(task);}
  if(!task.users.has(state)){
   const stop=()=>{task.users.delete(state);if(!task.users.size&&!task.active){const at=queue.indexOf(task);if(at>=0)queue.splice(at,1);if(pending.get(key)===task)pending.delete(key);task.reject(cancelled());}};
   task.users.set(state,stop);state.onStop.add(stop);
  }
  pump();return task.promise;
 };
}
const cacheReadPools=new WeakMap(),packReadPools=new WeakMap();
function cacheReadPool(storage){if(!cacheReadPools.has(storage))cacheReadPools.set(storage,createReadPool(6));return cacheReadPools.get(storage);}
function packReadPool(storage){if(!packReadPools.has(storage))packReadPools.set(storage,{directory:createReadPool(1),files:createReadPool(4)});return packReadPools.get(storage);}
async function readRequestedCache(wanted,{signal,timeoutMs,baseURL}){
 const found=new Map(),unknown=new Set(),visited=new Set(),warnings=[];const entries=[...wanted];let next=0;
 const error=await readStage(async state=>{
  // CacheStorage.match never creates a cache, unlike has() followed by open().
  // Only response metadata is inspected here. Bytes/hash are checked before use.
  const storage=globalThis.caches;if(typeof storage?.match!=='function')throw new Error('此浏览器无法读取本机媒体缓存');const read=cacheReadPool(storage);
  await Promise.all(Array.from({length:Math.min(6,entries.length)},async()=>{
   while(!state.stopped&&next<entries.length){
    const [identity,source]=entries[next++];
    try{
     const url=new URL(source.path,baseURL),response=await read(url.href,async()=>{
      let response;try{response=await storage.match(url,{cacheName:CACHE});return response?{ok:response.ok,length:response.headers?.get?.('Content-Length'),variant:response.headers?.get?.('X-GRE-Owned-Variant')}:null;}
      finally{discardResponse(response);}
     },state);
     if(state.stopped)return;state.touch();
     visited.add(identity);
     if(!response)continue; // A known miss, not a failed read.
     if(!response.ok){unknown.add(identity);continue;}
     const length=response.length;
     if(response.variant==='1'||length!==null&&length!==undefined&&Number(length)!==source.bytes){unknown.add(identity);continue;}
     found.set(identity,{...source,storage:'cache'});
    }catch(error){if(state.stopped)return;state.touch();visited.add(identity);unknown.add(identity);}
   }
  }));
 },{signal,timeoutMs});
 if(error)warnings.push('媒体缓存清单未读全：'+errorText(error));
 for(const [identity] of wanted)if(!visited.has(identity))unknown.add(identity);
 if(unknown.size&&!error)warnings.push(`媒体缓存有 ${unknown.size} 项暂时无法确认；不代表没有保存。`);
 return {found,unknown,warnings};
}
async function inspectRequestedPacks(records,{signal,timeoutMs}){
 const found=new Map(),omitted=new Set(),unknown=new Set(),checked=new Set(),warnings=[],packs=new Map();
 for(const [identity,entries] of records)for(const entry of entries){if(!packs.has(entry.packName))packs.set(entry.packName,[]);packs.get(entry.packName).push({identity,entry});}
 if(!packs.size)return {found,omitted,unknown,warnings};
 const pending=[...packs];let next=0;
 const error=await readStage(async state=>{
  const storage=globalThis.navigator?.storage;if(typeof storage?.getDirectory!=='function')throw new Error('此浏览器无法读取本机书包文件');const reads=packReadPool(storage);
  let directory;
  try{directory=await reads.directory(DIR,async(wanted,touch)=>{const root=await storage.getDirectory();if(!wanted())throw cancelled();touch();return root.getDirectoryHandle(DIR,{create:false});},state);}
  catch(error){if(error?.name!=='NotFoundError')throw error;for(const identity of records.keys())checked.add(identity);return;}
  if(state.stopped)return;state.touch();
  await Promise.all(Array.from({length:Math.min(4,pending.length)},async()=>{
   while(!state.stopped&&next<pending.length){
    const [name,matches]=pending[next++];
    try{
     const file=await reads.files(name,async(wanted,touch)=>{const handle=await directory.getFileHandle(name,{create:false});if(!wanted())throw cancelled();touch();const file=await handle.getFile();return {size:file.size,lastModified:file.lastModified};},state);if(state.stopped)return;state.touch();
     for(const {identity,entry} of matches){
      checked.add(identity);
      if(file.size!==entry.packBytes){unknown.add(identity);continue;}
      if(entry.variant)omitted.add(identity);
      else if(!found.has(identity)){const {storedBytes,variant,...item}=entry;found.set(identity,item);}
     }
    }catch(error){if(state.stopped)return;state.touch();for(const {identity} of matches){checked.add(identity);if(error?.name!=='NotFoundError')unknown.add(identity);}}
   }
  }));
 },{signal,timeoutMs});
 if(error)warnings.push('本机书包文件清单未读全：'+errorText(error));
 for(const identity of records.keys())if(!checked.has(identity)||error&&!found.has(identity)&&!omitted.has(identity))unknown.add(identity);
 if(unknown.size&&!error)warnings.push(`本机书包有 ${unknown.size} 项暂时无法确认；不代表没有保存。`);
 return {found,omitted,unknown,warnings};
}
export async function listLocalMedia(catalog,{signal,baseURL=new URL('../',import.meta.url),timeoutMs=5000}={}){
 abortCheck(signal);timeoutMs=Number.isFinite(timeoutMs)&&timeoutMs>0?timeoutMs:5000;
 const wanted=sourceRequests(catalog),items=new Map(),unknown=new Set(),warnings=[];
 if(wanted.size){
  const [packResult,cacheResult]=await Promise.all([
   (async()=>{const indexed=await readMatchingPacks(wanted,{signal,timeoutMs}),local=await inspectRequestedPacks(indexed.records,{signal,timeoutMs});return {indexed,local};})(),
   readRequestedCache(wanted,{signal,timeoutMs,baseURL})
  ]);
  abortCheck(signal);
  const {indexed,local}=packResult;
  if(indexed.error){warnings.push('本机书包索引清单未读全：'+errorText(indexed.error));for(const identity of wanted.keys())unknown.add(identity);}
  if(indexed.uncertain.size)warnings.push(`本机索引有 ${indexed.uncertain.size} 项身份或位置无法确认；未加入待处理清单。`);
  for(const identity of [...indexed.uncertain,...local.unknown,...cacheResult.unknown])unknown.add(identity);
  warnings.push(...local.warnings,...cacheResult.warnings);
  for(const [identity,item] of cacheResult.found)items.set(identity,item);
  for(const [identity,item] of local.found)items.set(identity,item);
  // An indexed compressed record is not proof its bytes are still readable.
  // Omit it, rather than claim verification or re-scan compressed media bodies.
  const omittedVariants=[...local.omitted].filter(identity=>!items.has(identity)).length;
  for(const identity of local.omitted)unknown.delete(identity);
  for(const identity of items.keys())unknown.delete(identity);
  const result=[...wanted.keys()].filter(identity=>items.has(identity)).map(identity=>items.get(identity));
  return inventoryResult(result,{warnings,unknown:unknown.size,omittedVariants,variantRecords:local.omitted.size,requested:wanted.size});
 }
 return inventoryResult([],{warnings,unknown:0,omittedVariants:0,variantRecords:0,requested:0});
}
function inventoryResult(items,metadata){
 // Array compatibility for existing callers; consumers must retain the metadata
 // before filtering so an unreadable store is never presented as “zero saved”.
 Object.defineProperties(items,Object.fromEntries(Object.entries({...metadata,partial:metadata.unknown>0||metadata.warnings.length>0}).map(([key,value])=>[key,{value,enumerable:false}])));
 return items;
}
export async function readLocalSource(item,signal,{baseURL=new URL('../',import.meta.url)}={}){
 abortCheck(signal);if(!valid(item))throw new Error('无效的本机媒体身份');if(item.bytes>32*1024*1024)throw new Error('原文件超过 32 MB，预览已跳过');let blob;
 if(item.storage==='opfs'){
  const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle(DIR,{create:false}),handle=await dir.getFileHandle(item.packName,{create:false}),file=await handle.getFile();if(file.size!==item.packBytes||!Number.isSafeInteger(item.start)||item.start<0||item.start+item.bytes>file.size)throw new Error('本机书包已变化，请重新扫描');blob=file.slice(item.start,item.start+item.bytes,item.role==='video'?'video/mp4':item.path.endsWith('.png')?'image/png':item.path.endsWith('.webp')?'image/webp':'image/jpeg');
 }else if(item.storage==='cache'){
  const response=await caches.match(new URL(item.path,baseURL),{cacheName:CACHE});if(!response?.ok)return null;blob=await response.blob();
 }else throw new Error('不支持的本机资源位置');
 abortCheck(signal);if(blob.size!==item.bytes||await sha256(blob)!==item.sha256)throw new Error('本机原文件校验失败，已跳过');abortCheck(signal);return blob;
}
