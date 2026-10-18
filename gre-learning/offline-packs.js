import {waitForLocal} from './offline-async.js';
import {createMediaControl} from './offline-control.js';
import {validatePack} from './offline-zip.js';
const DB='gre-offline-pack-index-v1',DIR='gre-offline-packs-v1';
const cancelled=signal=>{if(signal?.aborted)throw new DOMException('Import cancelled','AbortError');};
let database,assetIndex=null,indexRevision=0;
// Metadata only: no book-sized Blob cache. Invalidate after every committed write.
const indexChannel=typeof globalThis.BroadcastChannel==='function'?new BroadcastChannel('gre-pack-index:'+new URL('../',import.meta.url).href):null;
indexChannel?.unref?.();
function invalidateAssetIndex(broadcast=false){assetIndex=null;indexRevision++;if(broadcast)indexChannel?.postMessage('changed');}
if(indexChannel)indexChannel.onmessage=()=>invalidateAssetIndex();
if(typeof window!=='undefined'){
 window.addEventListener('pageshow',()=>invalidateAssetIndex());
 window.addEventListener('focus',()=>invalidateAssetIndex());
 window.addEventListener('gre-library-updated',()=>invalidateAssetIndex());
 window.addEventListener('gre-media-control-change',()=>invalidateAssetIndex());
}
async function indexedAssets(){
 const revision=indexRevision;
 if(!assetIndex){const pending=listPacks().then(packs=>{
  const index=new Map();for(const pack of packs.sort((a,b)=>b.installedAt-a.installedAt))for(const entry of pack.files){const key=entry.path+'|'+entry.sha256+'|'+entry.bytes;if(!index.has(key))index.set(key,[]);index.get(key).push({pack,entry});}return index;
 });assetIndex=pending;pending.catch(()=>{if(assetIndex===pending)assetIndex=null;});}
 const index=await assetIndex;
 // Every caller, including callers sharing the pending read, observes mutations.
 if(revision!==indexRevision)return indexedAssets();return index;
}
const verifiedSlices=new Map(),badSlices=new Set();
const sliceIdentity=(pack,file,entry)=>[pack.name,file.size,Number.isFinite(file.lastModified)?file.lastModified:'unknown',entry.path,entry.sha256,entry.bytes].join('|');
function db(){return database??=(new Promise((resolve,reject)=>{
 let settled=false;const request=indexedDB.open(DB,1),timer=setTimeout(()=>{settled=true;reject(new Error('Local library is still opening; retry'));},4000);
 request.onupgradeneeded=()=>request.result.createObjectStore('packs',{keyPath:'key'});
 request.onsuccess=()=>{clearTimeout(timer);if(settled){request.result.close?.();return;}settled=true;const connection=request.result;connection.onversionchange=()=>{connection.close?.();database=null;invalidateAssetIndex();};resolve(connection);};
 request.onerror=()=>{clearTimeout(timer);settled=true;reject(request.error);};
})).catch(error=>{database=null;throw error;});}
async function transaction(mode,operation){const opening=db(),connection=await opening;let tx;const reset=()=>{if(database===opening)database=null;invalidateAssetIndex();connection.close?.();};
 const result=new Promise((resolve,reject)=>{tx=connection.transaction('packs',mode);let result;const request=operation(tx.objectStore('packs'));request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>{if(mode==='readwrite')invalidateAssetIndex(true);resolve(result);};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Index update cancelled'));});
 return mode==='readonly'?waitForLocal(result,{timeoutMs:4000,onTimeout:()=>{try{tx?.abort();}catch{}reset();}}).catch(error=>{reset();throw error;}):result;
}
async function directory(){return waitForLocal(async()=> (await navigator.storage.getDirectory()).getDirectoryHandle(DIR,{create:true}));}
async function savedFile(name){return waitForLocal(async()=> (await(await directory()).getFileHandle(name)).getFile());}
export async function listPacks(){return transaction('readonly',store=>store.getAll());}
async function copy(file,name,signal,onProgress){
 const dir=await directory(),entry=await dir.getFileHandle(name,{create:true});
 if(typeof entry.createWritable==='function'){
  const writer=await entry.createWritable();try{for(let offset=0;offset<file.size;offset+=1024*1024){cancelled(signal);await writer.write(file.slice(offset,offset+1024*1024));onProgress({phase:'copy',completed:Math.min(offset+1024*1024,file.size),total:file.size});}await writer.close();}catch(error){await writer.abort().catch(()=>{});throw error;}
 }else{
  await new Promise((resolve,reject)=>{const worker=new Worker(new URL('./offline-copy-worker.js',import.meta.url),{type:'module'});const abort=()=>worker.postMessage({type:'cancel'});const finish=error=>{signal?.removeEventListener('abort',abort);worker.terminate();error?reject(error):resolve();};signal?.addEventListener('abort',abort,{once:true});worker.onmessage=({data})=>{if(data.done)finish();else if(data.error)finish(new Error(data.error));else onProgress({phase:'copy',completed:data.progress,total:file.size});};worker.onerror=()=>finish(new Error('此浏览器无法写入离线存储，请使用支持 OPFS 的 Safari 17 或更新版本'));worker.postMessage({file,name});if(signal?.aborted)abort();});
 }
 cancelled(signal);if((await entry.getFile()).size!==file.size)throw new Error('Stored package size mismatch');
}
async function locked(fn,signal){if(navigator.locks?.request)return signal?navigator.locks.request(DB,{signal},fn):navigator.locks.request(DB,fn);throw new Error('此浏览器缺少安全导入所需的存储锁，请更新 Safari 后重试');}
function support(){if(!navigator.storage?.getDirectory||!globalThis.indexedDB||!globalThis.crypto?.subtle)throw new Error('此浏览器不支持离线书库。请使用 HTTPS 网站上的 Safari 17 或更新版本');}
async function recover(){const dir=await directory(),owned=new Set((await listPacks()).map(p=>p.name));for await(const [name,handle] of dir.entries())if(handle.kind==='file'&&/^pack-[0-9]+-[a-f0-9-]+\.zip$/.test(name)&&!owned.has(name))await dir.removeEntry(name);}
const identity=files=>JSON.stringify(files.map(f=>[f.path,f.role,f.wordId,f.bytes,f.sha256]).sort((a,b)=>a[0].localeCompare(b[0])));
async function checkExisting(parsed,catalog,options){const key=parsed.manifest.packId+'@'+parsed.manifest.version,existing=await transaction('readonly',s=>s.get(key));if(existing){if((existing.originalIdentity||identity(existing.files))!==identity(parsed.files))throw new Error('同一版本的内容不同，请使用新的版本号');if(existing.partiallyCleared)return {existing,duplicate:false};try{const old=await(await(await directory()).getFileHandle(existing.name)).getFile();if(old.size===existing.bytes){await validatePack(old,catalog,options);return {existing,duplicate:true};}}catch{} }cancelled(options.signal);return {existing,duplicate:false};}
async function ensureSpace(bytes){const estimate=await waitForLocal(()=>navigator.storage.estimate?.(),{timeoutMs:1500}).catch(()=>null);if(Number.isFinite(estimate?.quota)&&Number.isFinite(estimate?.usage)&&estimate.quota-estimate.usage<bytes*1.05)throw new Error('可用存储空间不足，请先释放空间');}
// Both file import and direct download converge here. Caller holds the storage lock.
async function finalizeStoredPack(name,file,parsed,catalog,options,checked){const {existing,duplicate}=checked||await checkExisting(parsed,catalog,options);if(duplicate)return {...existing,duplicate:true};cancelled(options.signal);const {manifest,files}=parsed,record={key:manifest.packId+'@'+manifest.version,name,packId:manifest.packId,version:manifest.version,wordIds:manifest.wordIds,files,bytes:file.size,installedAt:Date.now()};await transaction('readwrite',s=>s.put(record));if(existing?.name)await(await directory()).removeEntry(existing.name).catch(()=>{});return record;}
const temporaryName=()=> 'pack-'+Date.now()+'-'+crypto.randomUUID()+'.zip';
export async function importPack(file,catalog,{signal,onProgress=()=>{}}={}){
 support();const control=createMediaControl(new URL('../',import.meta.url)),generation=await control.ticket();return locked(async()=>{await control.guard(generation,()=>{});await recover();const options={signal,onProgress};cancelled(signal);const parsed=await validatePack(file,catalog,options),checked=await checkExisting(parsed,catalog,options);if(checked.duplicate)return control.guard(generation,()=>({...checked.existing,duplicate:true}));await ensureSpace(file.size);const name=temporaryName();let committed=false;try{await copy(file,name,signal,onProgress);const record=await control.guard(generation,()=>finalizeStoredPack(name,file,parsed,catalog,options,checked));committed=record.name===name;return record;}finally{if(!committed)await(await directory()).removeEntry(name).catch(()=>{});}});
}
export function trustedPackageURL(descriptor,baseURL=new URL('./',import.meta.url)){
 if(!descriptor||!Number.isSafeInteger(descriptor.bytes)||descriptor.bytes<22||descriptor.bytes>=0xffffffff||typeof descriptor.url!=='string')throw new Error('无效的下载配置');const target=new URL(descriptor.url,baseURL);if(target.origin!==baseURL.origin||target.username||target.password||target.hash||(!['https:'].includes(target.protocol)&&!['localhost','127.0.0.1'].includes(target.hostname)))throw new Error('下载必须使用本站的安全地址');return target.href;
}
async function downloadToStorage(descriptor,name,{signal,onProgress}){
 const url=trustedPackageURL(descriptor),dir=await directory(),entry=await dir.getFileHandle(name,{create:true});
 if(typeof entry.createWritable==='function'){
  const response=await fetch(url,{redirect:'error',credentials:'omit',cache:'no-store',signal});if(!response.ok||!response.body)throw new Error('视频书包暂时不可下载，请稍后重试');const reader=response.body.getReader(),writer=await entry.createWritable();let total=0;
  try{while(true){cancelled(signal);const {value,done}=await reader.read();if(done)break;total+=value.length;if(total>descriptor.bytes)throw new Error('下载大小超出声明');await writer.write(value);onProgress({phase:'download',completed:total,total:descriptor.bytes});}if(total!==descriptor.bytes)throw new Error('下载未完成，请重新下载');await writer.close();}catch(error){await writer.abort().catch(()=>{});throw error;}finally{await reader.cancel().catch(()=>{});}
 }else{
  await new Promise((resolve,reject)=>{const worker=new Worker(new URL('./offline-copy-worker.js',import.meta.url),{type:'module'}),abort=()=>worker.postMessage({type:'cancel'}),finish=error=>{signal?.removeEventListener('abort',abort);worker.terminate();error?reject(error):resolve();};signal?.addEventListener('abort',abort,{once:true});worker.onmessage=({data})=>{if(data.done)finish();else if(data.error)finish(new Error(data.error));else onProgress({phase:'download',completed:data.progress,total:descriptor.bytes});};worker.onerror=()=>finish(new Error('此浏览器无法下载到离线存储，请更新 Safari'));worker.postMessage({url,name,expectedBytes:descriptor.bytes});if(signal?.aborted)abort();});
 }cancelled(signal);return entry.getFile();
}
export async function downloadPack(descriptor,catalog,{signal,onProgress=()=>{}}={}){
 support();trustedPackageURL(descriptor);const control=createMediaControl(new URL('../',import.meta.url)),generation=await control.ticket();return locked(async()=>{await control.guard(generation,()=>{});await recover();cancelled(signal);await ensureSpace(descriptor.bytes);const options={signal,onProgress},name=temporaryName();let committed=false;try{const file=await downloadToStorage(descriptor,name,options);const parsed=await validatePack(file,catalog,options);if(parsed.manifest.packId!==descriptor.packId||parsed.manifest.version!==descriptor.version)throw new Error('下载的书包版本与目录不一致');const record=await control.guard(generation,()=>finalizeStoredPack(name,file,parsed,catalog,options));committed=record.name===name;return record;}finally{if(!committed)await(await directory()).removeEntry(name).catch(()=>{});}});
}
export async function deletePack(key){return locked(async()=>{const pack=await transaction('readonly',s=>s.get(key));if(!pack)return;await transaction('readwrite',s=>s.delete(key));await(await directory()).removeEntry(pack.name).catch(()=>{});});}
export async function localAsset(ref,retry=true){
 const revision=indexRevision;
 try{const path='gre-learning/'+ref.url;const matches=(await indexedAssets()).get(path+'|'+ref.sha256+'|'+ref.bytes)||[];for(const {pack,entry} of matches){try{const file=await savedFile(pack.name);if(file.size!==pack.bytes)continue;const identity=sliceIdentity(pack,file,entry);if(badSlices.has(identity))continue;const slice=file.slice(entry.start,entry.start+entry.bytes,entry.role==='video'?'video/mp4':entry.role==='unit'?'application/json':ref.url.endsWith('.png')?'image/png':ref.url.endsWith('.webp')?'image/webp':'image/jpeg');if(!verifiedSlices.has(identity)){const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await slice.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');if(digest!==entry.sha256){badSlices.add(identity);if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('gre-offline-corrupt',{detail:{packId:pack.packId}}));continue;}if(Number.isFinite(file.lastModified)){verifiedSlices.set(identity,true);while(verifiedSlices.size>64)verifiedSlices.delete(verifiedSlices.keys().next().value);}}return slice;}catch{invalidateAssetIndex();}}}catch{}if(retry&&revision!==indexRevision)return localAsset(ref,false);return null;
}
export async function storageStatus(){const [estimate,persistent]=await Promise.all([waitForLocal(()=>navigator.storage?.estimate?.(),{timeoutMs:1500}).catch(()=>null),waitForLocal(()=>navigator.storage?.persisted?.(),{timeoutMs:1500}).catch(()=>false)]);return {...estimate,persistent:Boolean(persistent)};}

// Inventory scans share in-flight browser metadata reads. A caller timing out or
// cancelling cannot create another eight unabortable OPFS reads on every retry.
const inventoryReads=new Map(),inventoryReadQueue=[];let inventoryReadsActive=0,inventoryScan=null;
function pumpInventoryReads(){
 while(inventoryReadsActive<8&&inventoryReadQueue.length){
  const task=inventoryReadQueue.shift();inventoryReadsActive++;
  const finish=()=>{inventoryReadsActive--;if(inventoryReads.get(task.key)===task.promise)inventoryReads.delete(task.key);pumpInventoryReads();};
  Promise.resolve().then(task.work).then(task.resolve,task.reject).then(finish,finish);
 }
}
function sharedInventoryRead(key,work){
 if(inventoryReads.has(key))return inventoryReads.get(key);
 let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
 inventoryReads.set(key,promise);inventoryReadQueue.push({key,work,promise,resolve,reject});pumpInventoryReads();return promise;
}
function inventoryFailure(error,stage){try{error.inventoryStage??=stage;}catch{}return error;}
function startInventoryScan(){
 const job={revision:indexRevision,controller:new AbortController(),users:0,pending:true};
 const signal=job.controller.signal;
 job.promise=(async()=>{
  const packs=(await listPacks().catch(error=>{throw inventoryFailure(error,'P1');})).sort((a,b)=>b.installedAt-a.installedAt),files=new Map();cancelled(signal);
  if(packs.length){
   // Read-only inspection must not create a directory; no packs means no OPFS.
   let dir;try{dir=await waitForLocal(sharedInventoryRead('directory',async()=> (await navigator.storage.getDirectory()).getDirectoryHandle(DIR)),{signal});}
   catch(error){if(error.name!=='NotFoundError')throw inventoryFailure(error,'P2');return {packs,files};}
   let next=0;
   await Promise.all(Array.from({length:Math.min(8,packs.length)},async()=>{
    while(next<packs.length){
     cancelled(signal);const pack=packs[next++];
     try{const file=await waitForLocal(sharedInventoryRead('file:'+pack.name,async()=> (await dir.getFileHandle(pack.name)).getFile()),{signal});files.set(pack.name,file);}
     catch(error){if(error.name!=='NotFoundError'){job.controller.abort();throw inventoryFailure(error,'P3');}}
    }
   }));
  }
  return {packs,files};
 })();
 const finish=()=>{job.pending=false;if(inventoryScan===job)inventoryScan=null;};job.promise.then(finish,finish);return job;
}
async function readPackInventory(signal){
 while(true){
  cancelled(signal);const job=inventoryScan||(inventoryScan=startInventoryScan());
  if(job.controller.signal.aborted){await waitForLocal(job.promise.catch(()=>{}),{signal,timeoutMs:0});continue;}
  job.users++;
  let result;try{result=await waitForLocal(job.promise,{signal,timeoutMs:0});}
  finally{job.users--;if(!job.users&&job.pending)job.controller.abort();}
  // Imports/deletes and cross-tab notifications invalidate a scan in progress.
  if(job.revision!==indexRevision)continue;
  return {packs:result.packs.map(pack=>({...pack})),files:result.files};
 }
}

export async function inspectLibrary(catalog,{cachedPaths=[],signal}={}){
 const {packs,files}=await readPackInventory(signal),signatures=new Set(),owners=new Map();cancelled(signal);
 const wanted=new Set();for(const e of catalog.entries)for(const ref of [e.storyMedia?.video,e.storyMedia?.poster,e.storyMedia?.staticPoster].filter(Boolean))wanted.add('gre-learning/'+ref.url+'|'+ref.sha256+'|'+ref.bytes);
 for(const pack of packs){const file=files.get(pack.name);pack.available=Boolean(file)&&file.size===pack.bytes;pack.ownedCurrentAssets=0;if(!pack.available)continue;for(const f of pack.files){if(badSlices.has(sliceIdentity(pack,file,f)))continue;const signature=f.path+'|'+f.sha256+'|'+f.bytes;signatures.add(signature);if(wanted.has(signature)&&!owners.has(signature)){owners.set(signature,pack.key);pack.ownedCurrentAssets++;}}}
 const cacheSet=new Set(cachedPaths),opfsPaths=[...signatures].map(signature=>signature.split('|')[0]);for(const signature of wanted)if(cacheSet.has(signature.split('|')[0]))signatures.add(signature);
 const readyIds=catalog.entries.filter(e=>[e.storyMedia?.video,e.storyMedia?.poster,e.storyMedia?.staticPoster].filter(Boolean).every(ref=>signatures.has('gre-learning/'+ref.url+'|'+ref.sha256+'|'+ref.bytes))).map(e=>e.number);
 return {packs,readyIds,opfsPaths,total:catalog.entries.length};
}

export async function cleanUnusedPacks(catalog,approvedKeys){return locked(async()=>{const unused=(await inspectLibrary(catalog)).packs.filter(p=>p.ownedCurrentAssets===0&&approvedKeys.includes(p.key));for(const pack of unused){await transaction('readwrite',s=>s.delete(pack.key));await(await directory()).removeEntry(pack.name).catch(()=>{});}return unused.length;});}

export async function clearSavedResources(){return locked(()=>createMediaControl(new URL('../',import.meta.url)).clear(async()=>{
 if(globalThis.caches){const cache=await caches.open('gre-scalable-verified-units-v1'),root=new URL('./story-media/',import.meta.url).href;for(const request of await cache.keys())if(request.url.startsWith(root))await cache.delete(request);}
 const packs=await listPacks(),dir=await directory();for(const pack of packs){try{await dir.removeEntry(pack.name);}catch(error){if(error.name!=='NotFoundError')throw error;}await transaction('readwrite',store=>store.delete(pack.key));}
 for await(const [name,handle] of dir.entries())if(handle.kind==='file'&&/^pack-[0-9]+-[a-f0-9-]+\.zip$/.test(name))await dir.removeEntry(name);
 verifiedSlices.clear();badSlices.clear();return packs.length;
}));}

// Selective clears physically remove media bytes. Mixed packs become compact,
// indexed slices; the original source ZIP and its identity remain untouched.
const mediaRoles=new Set(['video','poster','staticPoster']);
function selectedMedia(catalog,ids,packs){
 const selected=new Set(ids),paths=new Set(),protectedPaths=new Set();
 for(const entry of catalog.entries)for(const ref of [entry.storyMedia?.video,entry.storyMedia?.poster,entry.storyMedia?.staticPoster].filter(Boolean)){
  (selected.has(entry.number)?paths:protectedPaths).add('gre-learning/'+ref.url);
 }
 // Old media editions may have different paths. Shared current paths are kept
 // when another word still needs them, including across overlapping packs.
 for(const pack of packs)for(const file of pack.files)if(mediaRoles.has(file.role))(selected.has(file.wordId)?paths:protectedPaths).add(file.path);
 for(const path of protectedPaths)paths.delete(path);
 return paths;
}
async function commitPackChanges(changes){
 const database=await db();return new Promise((resolve,reject)=>{
  const tx=database.transaction('packs','readwrite'),store=tx.objectStore('packs');
  tx.oncomplete=()=>{invalidateAssetIndex(true);resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Index update cancelled'));
  try{for(const {pack,replacement} of changes)replacement?store.put(replacement):store.delete(pack.key);}catch(error){tx.abort();reject(error);}
 });
}
async function verifyRetainedSlices(file,files,signal){
 for(const entry of files){
  cancelled(signal);
  if(!Number.isSafeInteger(entry.start)||entry.start<0||!Number.isSafeInteger(entry.bytes)||entry.bytes<0||entry.start+entry.bytes>file.size)throw new Error('Stored package range mismatch');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.slice(entry.start,entry.start+entry.bytes).arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!==entry.sha256)throw new Error('Stored package asset checksum failed');
 }
}
export async function clearSavedWords(catalog,ids,{signal,onProgress=()=>{}}={}){
 support();cancelled(signal);return locked(async()=>{
  cancelled(signal);await recover();cancelled(signal);const packs=await listPacks(),paths=selectedMedia(catalog,ids,packs),root=new URL('../',import.meta.url),urls=[...paths].map(path=>new URL(path,root).href);
  cancelled(signal);let committed=false;return createMediaControl(root).selectiveClear(urls,async()=>{
   cancelled(signal);const dir=await directory(),changes=[],staged=[];
   const cache=globalThis.caches?await caches.open('gre-scalable-verified-units-v1'):null,wanted=new Set(urls),cached=(await cache?.keys()||[]).filter(request=>wanted.has(request.url));
   const removedURLs=new Set(cached.map(request=>request.url));
   for(const pack of packs)for(const file of pack.files)if(mediaRoles.has(file.role)&&paths.has(file.path))removedURLs.add(new URL(file.path,root).href);
   const total=removedURLs.size;onProgress({phase:'prepare',completed:0,total});cancelled(signal);
   try{
    for(const pack of packs){const retained=pack.files.filter(file=>!mediaRoles.has(file.role)||!paths.has(file.path));if(retained.length!==pack.files.length)changes.push({pack,retained});}
    // Keep every original until all replacements fit, copy successfully and
    // verify. A quota, interruption or checksum failure cannot lose other words.
    const stagingBytes=changes.reduce((sum,change)=>sum+change.retained.reduce((n,file)=>n+file.bytes,0),0);if(stagingBytes)await ensureSpace(stagingBytes);
    for(const change of changes){
     cancelled(signal);const {pack,retained}=change;if(!retained.length)continue;
     const source=await(await dir.getFileHandle(pack.name)).getFile();if(source.size!==pack.bytes)throw new Error('Stored package size mismatch');
     const parts=[],files=[];let offset=0;
     for(const entry of retained){
      if(!Number.isSafeInteger(entry.start)||entry.start<0||!Number.isSafeInteger(entry.bytes)||entry.bytes<0||entry.start+entry.bytes>source.size)throw new Error('Stored package range mismatch');
      parts.push(source.slice(entry.start,entry.start+entry.bytes));files.push({...entry,start:offset});offset+=entry.bytes;
     }
     const compact=new Blob(parts),name=temporaryName();staged.push(name);await copy(compact,name,signal,()=>{onProgress({phase:'prepare',completed:0,total});});
     const stored=await(await dir.getFileHandle(name)).getFile();await verifyRetainedSlices(stored,files,signal);
     change.replacement={...pack,name,files,bytes:stored.size,partiallyCleared:true,originalIdentity:pack.originalIdentity||identity(pack.files)};
    }
    // Cancellation is safe until this boundary. Once committing, finish all
    // physical removals even if the caller aborts, keeping index/cache coherent.
    cancelled(signal);onProgress({phase:'delete',completed:0,total});
    // One index transaction makes the complete set of replacements visible.
    if(changes.length)await commitPackChanges(changes);committed=true;
    for(const {pack} of changes){try{await dir.removeEntry(pack.name);}catch(error){if(error.name!=='NotFoundError')throw error;}}
    let completed=0;for(const url of removedURLs){if(cache)await cache.delete(url);onProgress({phase:'delete',completed:++completed,total});}
    verifiedSlices.clear();badSlices.clear();onProgress({phase:'done',completed:total,total});
    return {packs:changes.length,files:changes.reduce((sum,{pack,retained})=>sum+pack.files.length-retained.length,0),bytes:changes.reduce((sum,{pack,replacement})=>sum+pack.bytes-(replacement?.bytes||0),0),paths:urls,removedAssets:total};
   }finally{
    if(!committed)for(const name of staged)await dir.removeEntry(name).catch(()=>{});
   }
  },{rollbackOnError:()=>!committed});
 },signal);
}

