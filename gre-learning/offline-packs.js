import {createSpoolIndex} from './compression-spool-index.js';
import {validSpoolName} from './compression-spool.js';
import {waitForLocal} from './offline-async.js';
import {createMediaControl} from './offline-control.js';
import {validatePack,indexZip} from './offline-zip.js';
import {sourceOf,verify as verifyStored,validateVariant,validSource,catalogSources,digest as variantDigest} from './compression-variants.js';
import {createCompressionStorage} from './compression-storage.js';
import {createBrowserAdapter} from './compression-browser-adapter.js';
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
  const index=new Map();for(const pack of packs.sort((a,b)=>b.installedAt-a.installedAt))for(const entry of pack.files){const source=sourceOf(entry),key=source.path+'|'+source.sha256+'|'+source.bytes;if(!index.has(key))index.set(key,[]);index.get(key).push({pack,entry});}return index;
 });assetIndex=pending;pending.catch(()=>{if(assetIndex===pending)assetIndex=null;});}
 const index=await assetIndex;
 // Every caller, including callers sharing the pending read, observes mutations.
 if(revision!==indexRevision)return indexedAssets();return index;
}
const verifiedSlices=new Map(),badSlices=new Set();
const sliceIdentity=(pack,file,entry)=>[pack.name,file.size,Number.isFinite(file.lastModified)?file.lastModified:'unknown',entry.path,entry.sha256,entry.bytes].join('|');
function db(readOnly=false){return database??=(new Promise((resolve,reject)=>{
 let settled=false,absent=false;const request=indexedDB.open(DB),timer=setTimeout(()=>{settled=true;reject(new Error('Local library is still opening; retry'));},4000);
 request.onupgradeneeded=()=>{if(readOnly){absent=true;request.transaction.abort();}else request.result.createObjectStore('packs',{keyPath:'key'});};
 request.onsuccess=()=>{clearTimeout(timer);if(settled){request.result.close?.();return;}settled=true;const connection=request.result;connection.onversionchange=()=>{connection.close?.();database=null;invalidateAssetIndex();};resolve(connection);};
 request.onerror=()=>{clearTimeout(timer);settled=true;reject(absent?Object.assign(Error('No saved pack index'),{name:'NoLocalIndex'}):request.error);};
})).catch(error=>{database=null;throw error;});}
async function transaction(mode,operation){const opening=db(mode==='readonly');let connection;try{connection=await opening;}catch(error){if(mode==='readonly'&&error.name==='NoLocalIndex')return undefined;throw error;}let tx;const reset=()=>{if(database===opening)database=null;invalidateAssetIndex();connection.close?.();};
 const result=new Promise((resolve,reject)=>{tx=connection.transaction(mode==='readwrite'&&connection.objectStoreNames?.contains('compressionMeta')?['packs','compressionMeta']:'packs',mode);if(mode==='readwrite')bumpRevision(tx);let result;const request=operation(tx.objectStore('packs'));request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>{if(mode==='readwrite')invalidateAssetIndex(true);resolve(result);};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Index update cancelled'));});
 return mode==='readonly'?waitForLocal(result,{timeoutMs:4000,onTimeout:()=>{try{tx?.abort();}catch{}reset();}}).catch(error=>{reset();throw error;}):result;
}
async function directory(){return waitForLocal(async()=> (await navigator.storage.getDirectory()).getDirectoryHandle(DIR,{create:true}));}
async function savedFile(name){return waitForLocal(async()=>{const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle(DIR,{create:false});return (await dir.getFileHandle(name,{create:false})).getFile();});}
export async function listPacks(){return await transaction('readonly',store=>store.getAll())||[];}
async function copy(file,name,signal,onProgress){
 const dir=await directory(),entry=await dir.getFileHandle(name,{create:true});
 if(typeof entry.createWritable==='function'){
  const writer=await entry.createWritable();try{for(let offset=0;offset<file.size;offset+=1024*1024){cancelled(signal);await writer.write(file.slice(offset,offset+1024*1024));onProgress({phase:'copy',completed:Math.min(offset+1024*1024,file.size),total:file.size});}await writer.close();}catch(error){await writer.abort().catch(()=>{});throw error;}
 }else{
  await new Promise((resolve,reject)=>{const worker=new Worker(new URL('./offline-copy-worker.js',import.meta.url),{type:'module'});const abort=()=>worker.postMessage({type:'cancel'});const finish=error=>{signal?.removeEventListener('abort',abort);worker.terminate();error?reject(error):resolve();};signal?.addEventListener('abort',abort,{once:true});worker.onmessage=({data})=>{if(data.done)finish();else if(data.error)finish(new Error(data.error));else onProgress({phase:'copy',completed:data.progress,total:file.size});};worker.onerror=()=>finish(new Error('此浏览器无法写入离线存储，请使用支持 OPFS 的 Safari 17 或更新版本'));worker.postMessage({file,name});if(signal?.aborted)abort();});
 }
 cancelled(signal);if((await entry.getFile()).size!==file.size)throw new Error('Stored package size mismatch');
}
async function locked(fn,signal){const action=async()=>{await recoverCompressionJournals();return fn();};if(navigator.locks?.request)return signal?navigator.locks.request(DB,{signal},action):navigator.locks.request(DB,action);throw new Error('此浏览器缺少安全导入所需的存储锁，请更新 Safari 后重试');}
function support(){if(!navigator.storage?.getDirectory||!globalThis.indexedDB||!globalThis.crypto?.subtle)throw new Error('此浏览器不支持离线书库。请使用 HTTPS 网站上的 Safari 17 或更新版本');}
async function recover(){const dir=await directory(),owned=new Set((await listPacks()).map(p=>p.name));for await(const [name,handle] of dir.entries())if(handle.kind==='file'&&/^pack-[0-9]+-[a-f0-9-]+\.zip$/.test(name)&&!owned.has(name))await dir.removeEntry(name);}
const identity=files=>JSON.stringify(files.map(f=>[f.path,f.role,f.wordId,f.bytes,f.sha256]).sort((a,b)=>a[0].localeCompare(b[0])));
async function checkExisting(parsed,catalog,options){const key=parsed.manifest.packId+'@'+parsed.manifest.version,existing=await transaction('readonly',s=>s.get(key));if(existing){if((existing.originalIdentity||identity(existing.files))!==identity(parsed.files))throw new Error('同一版本的内容不同，请使用新的版本号');if(existing.partiallyCleared)return {existing,duplicate:false};if(existing.storageFormat==='owned-local-slices-v1'){const stored=await savedFile(existing.name);if(stored.size!==existing.bytes)throw Error('Stored pack size mismatch');for(const entry of existing.files)await verifyStored(stored.slice(entry.start,entry.start+entry.bytes),entry);return {existing,duplicate:true};}try{const old=await(await(await directory()).getFileHandle(existing.name)).getFile();if(old.size===existing.bytes){await validatePack(old,catalog,options);return {existing,duplicate:true};}}catch{} }cancelled(options.signal);return {existing,duplicate:false};}
async function ensureSpace(bytes){const estimate=await waitForLocal(()=>navigator.storage.estimate?.(),{timeoutMs:1500}).catch(()=>null);if(Number.isFinite(estimate?.quota)&&Number.isFinite(estimate?.usage)&&estimate.quota-estimate.usage<bytes*1.05)throw new Error('可用存储空间不足，请先释放空间');}
// Both file import and direct download converge here. Caller holds the storage lock.
async function finalizeStoredPack(name,file,parsed,catalog,options,checked){const {existing,duplicate}=checked||await checkExisting(parsed,catalog,options);if(duplicate)return {...existing,duplicate:true};cancelled(options.signal);const {manifest,files}=parsed,record={key:manifest.packId+'@'+manifest.version,name,packId:manifest.packId,version:manifest.version,wordIds:manifest.wordIds,files,bytes:file.size,installedAt:Date.now()};await transaction('readwrite',s=>s.put(record));if(existing?.name)await(await directory()).removeEntry(existing.name).catch(()=>{});return record;}
const temporaryName=()=> 'pack-'+Date.now()+'-'+crypto.randomUUID()+'.zip';
export async function importPack(file,catalog,{signal,onProgress=()=>{}}={}){
 support();const zipIndex=await indexZip(file),manifestEntry=zipIndex.get('manifest.json');if(manifestEntry&&manifestEntry.bytes<=20*1024*1024){const manifest=JSON.parse(await file.slice(manifestEntry.start,manifestEntry.start+manifestEntry.bytes).text());if(manifest.format==='gre-owned-local-variants-v1'){const result=await (await compressionStorage()).importArchive(file,catalog,{signal});invalidateAssetIndex(true);return {...result.pack,duplicate:result.duplicate,...(Number.isSafeInteger(result.committedGeneration)?{committedGeneration:result.committedGeneration}:{})};}}const control=createMediaControl(new URL('../',import.meta.url)),generation=await control.ticket();return locked(async()=>{await control.guard(generation,()=>{});await recover();const options={signal,onProgress};cancelled(signal);const parsed=await validatePack(file,catalog,options),checked=await checkExisting(parsed,catalog,options);if(checked.duplicate)return control.guard(generation,()=>({...checked.existing,duplicate:true}));await ensureSpace(file.size);const name=temporaryName();let committed=false;try{await copy(file,name,signal,onProgress);const record=await control.guard(generation,()=>finalizeStoredPack(name,file,parsed,catalog,options,checked));committed=record.name===name;return record;}finally{if(!committed)await(await directory()).removeEntry(name).catch(()=>{});}});
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
async function deletePackLocked(pack){
 const connection=await db();if(connection.objectStoreNames?.contains('compressionJournals')){const journal={id:crypto.randomUUID(),phase:'committed',newNames:[],oldNames:[pack.name],cacheDeletes:[]};await commitPackChanges([{pack}],journal);await recoverCompressionJournals();}else{await transaction('readwrite',s=>s.delete(pack.key));await(await directory()).removeEntry(pack.name).catch(()=>{});}
}
export async function deletePack(key){return locked(async()=>{const pack=await transaction('readonly',s=>s.get(key));if(pack)await deletePackLocked(pack);});}
export async function localAssetRecord(ref,retry=true){
 const revision=indexRevision;
 try{const path='gre-learning/'+ref.url,matches=(await indexedAssets()).get(path+'|'+ref.sha256+'|'+ref.bytes)||[];
 for(const {pack,entry} of matches){try{
  if(ref.wordId!==undefined&&entry.wordId!==ref.wordId||ref.role!==undefined&&entry.role!==ref.role)continue;
  const file=await savedFile(pack.name);if(file.size!==pack.bytes||!Number.isSafeInteger(entry.start)||entry.start<0||entry.start+entry.bytes>file.size)continue;
  const mime=entry.mime||(entry.role==='video'?'video/mp4':entry.role==='unit'?'application/json':ref.url.endsWith('.png')?'image/png':ref.url.endsWith('.webp')?'image/webp':'image/jpeg');
  const identity=sliceIdentity(pack,file,entry);if(entry.kind==='owned-local-variant')validateVariant(entry);let blob=file.slice(entry.start,entry.start+entry.bytes,mime);if(!verifiedSlices.has(identity)){blob=await verifyStored(blob,entry);if(Number.isFinite(file.lastModified)){verifiedSlices.set(identity,true);while(verifiedSlices.size>64)verifiedSlices.delete(verifiedSlices.keys().next().value);}}
  return {blob,record:entry,source:sourceOf(entry),kind:entry.kind||'canonical'};
 }catch{invalidateAssetIndex();}}
 }catch{}if(retry&&revision!==indexRevision)return localAssetRecord(ref,false);return null;
}
export async function localAsset(ref,retry=true){return (await localAssetRecord(ref,retry))?.blob||null;}
export async function storageStatus(){const [estimate,persistent]=await Promise.all([waitForLocal(()=>navigator.storage?.estimate?.(),{timeoutMs:1500}).catch(()=>null),waitForLocal(()=>navigator.storage?.persisted?.(),{timeoutMs:1500}).catch(()=>false)]);return {...estimate,persistent:Boolean(persistent)};}

// Inventory scans share in-flight browser metadata reads. A caller timing out or
// cancelling cannot create another eight unabortable OPFS reads on every retry.
const inventoryReads=new Map(),inventoryReadQueue=[];let inventoryReadsActive=0;const inventoryScans=new Map();
function pumpInventoryReads(){
 while(inventoryReadsActive<8&&inventoryReadQueue.length){
  const task=inventoryReadQueue.shift(),wanted=()=>task.signals.some(signal=>!signal?.aborted);
  if(!wanted()){if(inventoryReads.get(task.key)===task)inventoryReads.delete(task.key);task.reject(new DOMException('Inventory cancelled','AbortError'));continue;}
  inventoryReadsActive++;
  const finish=()=>{inventoryReadsActive--;if(inventoryReads.get(task.key)===task)inventoryReads.delete(task.key);pumpInventoryReads();};
  Promise.resolve().then(()=>task.work(wanted)).then(task.resolve,task.reject).then(finish,finish);
 }
}
function sharedInventoryRead(key,work,signal){
 const existing=inventoryReads.get(key);
 if(existing){existing.signals=existing.signals.filter(item=>!item?.aborted);existing.signals.push(signal);return existing.promise;}
 let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;}),task={key,work,promise,resolve,reject,signals:[signal]};
 inventoryReads.set(key,task);
 // A retry must be able to reacquire index/directory metadata while up to eight
 // older, unabortable file reads are still pending. These two shared dependency
 // reads have their own single slots; they cannot multiply on repeated retries.
 if(key==='index'||key==='directory'){
  const wanted=()=>task.signals.some(item=>!item?.aborted),finish=()=>{if(inventoryReads.get(key)===task)inventoryReads.delete(key);};
  Promise.resolve().then(()=>{if(!wanted())throw new DOMException('Inventory cancelled','AbortError');return work(wanted);}).then(resolve,reject).then(finish,finish);
 }else{inventoryReadQueue.push(task);pumpInventoryReads();}
 return promise;
}
function inventoryFailure(error,stage){try{error.inventoryStage??=stage;}catch{}return error;}
function startInventoryScan(requested,scope){
 const job={revision:indexRevision,controller:new AbortController(),users:0,pending:true};
 const signal=job.controller.signal;
 job.promise=(async()=>{
  const packs=(await waitForLocal(sharedInventoryRead('index',()=>listPacks(),signal),{signal}).catch(error=>{throw inventoryFailure(error,'P1');})).sort((a,b)=>b.installedAt-a.installedAt),files=new Map();cancelled(signal);
  const candidates=packs.filter(pack=>Array.isArray(pack.files)&&pack.files.some(entry=>{const source=entry?.source||entry;return validSource(source)&&requested.has(source.path+'|'+source.sha256+'|'+source.bytes+'|'+source.wordId+'|'+source.role);})),inspected=new Set(candidates.map(pack=>pack.name));
  if(candidates.length){
   // Match exact requested metadata before opening any pack. Unrelated stalled
   // files must not hold a narrow scope hostage or trigger additional reads.
   let dir;try{dir=await waitForLocal(sharedInventoryRead('directory',async wanted=>{const root=await navigator.storage.getDirectory();if(!wanted())throw new DOMException('Inventory cancelled','AbortError');return root.getDirectoryHandle(DIR,{create:false});},signal),{signal});}
   catch(error){if(error.name!=='NotFoundError')throw inventoryFailure(error,'P2');return {packs,files,inspected};}
   let next=0;
   await Promise.all(Array.from({length:Math.min(8,candidates.length)},async()=>{
    while(next<candidates.length){
     cancelled(signal);const pack=candidates[next++];
     try{const file=await waitForLocal(sharedInventoryRead('file:'+pack.name,async wanted=>{const handle=await dir.getFileHandle(pack.name,{create:false});if(!wanted())throw new DOMException('Inventory cancelled','AbortError');return handle.getFile();},signal),{signal});files.set(pack.name,file);}
     catch(error){if(error.name!=='NotFoundError'){job.controller.abort();throw inventoryFailure(error,'P3');}}
    }
   }));
  }
  return {packs,files,inspected};
 })();
 const finish=()=>{job.pending=false;if(inventoryScans.get(scope)===job)inventoryScans.delete(scope);};job.promise.then(finish,finish);return job;
}
async function readPackInventory(requested,signal){
 const scope=JSON.stringify([...requested].sort());
 while(true){
  cancelled(signal);let job=inventoryScans.get(scope);if(!job){job=startInventoryScan(requested,scope);inventoryScans.set(scope,job);}
  if(job.controller.signal.aborted){await waitForLocal(job.promise.catch(()=>{}),{signal,timeoutMs:0});continue;}
  job.users++;
  let result;try{result=await waitForLocal(job.promise,{signal,timeoutMs:0});}
  finally{job.users--;if(!job.users&&job.pending)job.controller.abort();}
  // Imports/deletes and cross-tab notifications invalidate a scan in progress.
  if(job.revision!==indexRevision)continue;
  return {packs:result.packs.map(pack=>({...pack})),files:result.files,inspected:result.inspected};
 }
}

export async function inspectLibrary(catalog,{cachedPaths=[],signal}={}){
 const canonical=new Set(),variants=new Set(),owners=new Map(),wanted=new Set(),bindings=new Map();cancelled(signal);
 for(const e of catalog.entries)for(const role of ['video','poster','staticPoster']){const ref=e.storyMedia?.[role];if(!ref)continue;const signature='gre-learning/'+ref.url+'|'+ref.sha256+'|'+ref.bytes;wanted.add(signature);if(!bindings.has(signature))bindings.set(signature,new Set());bindings.get(signature).add(signature+'|'+e.number+'|'+role);}
 const requested=new Set([...bindings.values()].flatMap(set=>[...set])),{packs,files,inspected}=await readPackInventory(requested,signal);cancelled(signal);
 for(const pack of packs){
  const file=files.get(pack.name);pack.available=inspected.has(pack.name)?Boolean(file)&&Number.isSafeInteger(pack.bytes)&&pack.bytes>0&&file.size===pack.bytes:null;pack.ownedCurrentAssets=0;if(!pack.available)continue;
  for(const f of pack.files||[]){
   const source=f?.source||f;if(!validSource(source))continue;
   const signature=source.path+'|'+source.sha256+'|'+source.bytes,owner=signature+'|'+source.wordId+'|'+source.role;
   // Scope and exact word/role binding are checked before examining a variant.
   if(!wanted.has(signature)||!bindings.get(signature).has(owner))continue;
   if(!Number.isSafeInteger(f.start)||f.start<0||!Number.isSafeInteger(f.bytes)||f.bytes<1||f.start+f.bytes>file.size||badSlices.has(sliceIdentity(pack,file,f)))continue;
   if(f.kind==='owned-local-variant'){try{validateVariant(f);}catch{continue;}variants.add(owner);}
   else{if(f.source||f.kind&&f.kind!=='canonical')continue;canonical.add(owner);}
   if(!owners.has(owner)){owners.set(owner,pack.key);pack.ownedCurrentAssets++;}
  }
 }
 const cacheSet=new Set(cachedPaths),opfsPaths=[];
 for(const [signature,required] of bindings)if([...required].every(owner=>canonical.has(owner)||variants.has(owner)))opfsPaths.push(signature.split('|')[0]);
 const readyIds=catalog.entries.filter(e=>['video','poster','staticPoster'].every(role=>{const ref=e.storyMedia?.[role];if(!ref)return true;const path='gre-learning/'+ref.url,owner=path+'|'+ref.sha256+'|'+ref.bytes+'|'+e.number+'|'+role;return cacheSet.has(path)||canonical.has(owner)||variants.has(owner);})).map(e=>e.number);
 // This is availability from validated index identities and file metadata, not
 // a fresh checksum certificate. Selected playback/export/replacement still
 // verifies actual bytes in localAssetRecord/verifyStored before using them.
 return {packs,readyIds,opfsPaths:[...new Set(opfsPaths)],total:catalog.entries.length,verification:'metadata-only',variantRecords:variants.size};
}

export async function cleanUnusedPacks(catalog,approvedKeys){return locked(async()=>{const unused=(await inspectLibrary(catalog)).packs.filter(p=>p.ownedCurrentAssets===0&&approvedKeys.includes(p.key));for(const pack of unused)await deletePackLocked(pack);return unused.length;});}

export async function clearSavedResources(){return locked(()=>createMediaControl(new URL('../',import.meta.url)).clear(async()=>{
 if(globalThis.caches){const cache=await caches.open('gre-scalable-verified-units-v1'),root=new URL('./story-media/',import.meta.url).href;for(const request of await cache.keys())if(request.url.startsWith(root))await cache.delete(request);}
 const packs=await listPacks(),dir=await directory();for(const pack of packs){try{await dir.removeEntry(pack.name);}catch(error){if(error.name!=='NotFoundError')throw error;}await transaction('readwrite',store=>store.delete(pack.key));}
 for await(const [name,handle] of dir.entries())if(handle.kind==='file'&&(/^(?:pack-[0-9]+-[a-f0-9-]+\.zip|variant-[a-f0-9-]+-(?:[0-9]+|import)\.bin)$/.test(name)))await dir.removeEntry(name);
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
 for(const pack of packs)for(const file of pack.files)if(mediaRoles.has(file.role))(selected.has(file.wordId)?paths:protectedPaths).add(sourceOf(file).path);
 for(const path of protectedPaths)paths.delete(path);
 return paths;
}
async function commitPackChanges(changes,journal){
 const database=await db();return new Promise((resolve,reject)=>{
  const tx=database.transaction(database.objectStoreNames?.contains('compressionMeta')?['packs','compressionMeta',...(journal?['compressionJournals']:[])]:['packs'],'readwrite'),store=tx.objectStore('packs');bumpRevision(tx);
  tx.oncomplete=()=>{invalidateAssetIndex(true);resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Index update cancelled'));
  try{for(const {pack,replacement} of changes)replacement?store.put(replacement):store.delete(pack.key);if(journal)tx.objectStore('compressionJournals').put(journal);}catch(error){tx.abort();reject(error);}
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
   for(const pack of packs)for(const file of pack.files)if(mediaRoles.has(file.role)&&paths.has(sourceOf(file).path))removedURLs.add(new URL(sourceOf(file).path,root).href);
   const total=removedURLs.size;onProgress({phase:'prepare',completed:0,total});cancelled(signal);
   try{
    for(const pack of packs){const retained=pack.files.filter(file=>!mediaRoles.has(file.role)||!paths.has(sourceOf(file).path));if(retained.length!==pack.files.length)changes.push({pack,retained});}
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
    let cleanupJournal=null;if((await db()).objectStoreNames?.contains('compressionJournals')){const cacheDeletes=[];for(const request of cached){const response=await cache.match(request);if(response?.ok){const blob=await response.blob();cacheDeletes.push({path:request.url,sha256:await variantDigest(blob),bytes:blob.size});}}cleanupJournal={id:crypto.randomUUID(),phase:'committed',newNames:staged,oldNames:changes.map(c=>c.pack.name),cacheDeletes};}
    if(changes.length||cleanupJournal)await commitPackChanges(changes,cleanupJournal);committed=true;
    for(const {pack} of changes){try{await dir.removeEntry(pack.name);}catch(error){if(error.name!=='NotFoundError')throw error;}}
    let completed=0;for(const url of removedURLs){if(cache)await cache.delete(url);onProgress({phase:'delete',completed:++completed,total});}
    if(cleanupJournal)await removeCompressionJournal(cleanupJournal.id);verifiedSlices.clear();badSlices.clear();onProgress({phase:'done',completed:total,total});
    return {packs:changes.length,files:changes.reduce((sum,{pack,retained})=>sum+pack.files.length-retained.length,0),bytes:changes.reduce((sum,{pack,replacement})=>sum+pack.bytes-(replacement?.bytes||0),0),paths:urls,removedAssets:total};
   }finally{
    if(!committed)for(const name of staged)await dir.removeEntry(name).catch(()=>{});
   }
  },{rollbackOnError:()=>!committed});
 },signal);
}


// Compression runtime is configured by the v45 lifecycle coordinator. Reads of
// existing variants do not require destructive-operation permission.
let compressionOptions=null,compressionEngine=null;
export function configureCompressionStorage(options){compressionOptions=options;compressionEngine=null;}
export async function compressionStorage(){
 if(!compressionOptions)throw Error('本机压缩尚未完成安全初始化');
 if(!compressionEngine)compressionEngine=(async()=>{const options=compressionOptions;const adapter=await createBrowserAdapter({scopeURL:new URL('../',import.meta.url),compatibleClients:options.compatibleClients,validateMedia:options.validateMedia,catalog:async()=>{const catalog=await options.catalogProvider();const sources=catalogSources(catalog);return {sources,revision:await variantDigest(new Blob([JSON.stringify(sources)]))};}});return createCompressionStorage(adapter);})();
 try{return await compressionEngine;}catch(error){compressionEngine=null;throw error;}
}
function bumpRevision(tx){if(!tx.objectStoreNames?.contains('compressionMeta'))return;const store=tx.objectStore('compressionMeta'),r=store.get('revision');r.onsuccess=()=>store.put({id:'revision',value:(r.result?.value||0)+1});}
// Caller owns pack lock. Existing media lock protects cache cleanup from current
// writers; this does not claim to fence clients predating media-control.
async function recoverCompressionJournals(){
 return navigator.locks.request('gre-media-write:'+new URL('../',import.meta.url).href,async()=>{
  let connection;try{connection=await db(true);}catch(error){if(error.name==='NoLocalIndex')return;throw error;}if(!connection.objectStoreNames?.contains('compressionJournals'))return;const journals=await new Promise((resolve,reject)=>{const tx=connection.transaction('compressionJournals','readonly'),r=tx.objectStore('compressionJournals').getAll();tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(tx.error);});
  if(!journals.length)return;const dir=await directory();
  for(const j of journals){if(!['prepared','committed'].includes(j.phase))throw Error('Unknown compression journal');for(const name of j.phase==='prepared'?j.newNames:j.oldNames){try{await dir.removeEntry(name);}catch(e){if(e.name!=='NotFoundError')throw e;}}
   if(j.phase==='committed'&&globalThis.caches){const cache=await caches.open('gre-scalable-verified-units-v1');for(const c of j.cacheDeletes){const url=new URL(c.path,new URL('../',import.meta.url)),r=await cache.match(url);if(r?.ok){const blob=await r.blob();if(blob.size===c.bytes&&await variantDigest(blob)===c.sha256)await cache.delete(url);}}}
   if(j.phase==='committed'&&j.spoolNames?.length){const index=createSpoolIndex();try{for(const name of j.spoolNames){if(!validSpoolName(name))throw Error('Invalid journal spool name');try{await dir.removeEntry(name);}catch(e){if(e.name!=='NotFoundError')throw e;}await index.delete(name);}}finally{index.close();}}
   await new Promise((resolve,reject)=>{const tx=connection.transaction('compressionJournals','readwrite');tx.objectStore('compressionJournals').delete(j.id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Recovery aborted'));});
  }invalidateAssetIndex(true);
 });
}

async function removeCompressionJournal(id){const connection=await db();return new Promise((resolve,reject)=>{const tx=connection.transaction('compressionJournals','readwrite');tx.objectStore('compressionJournals').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Journal removal aborted'));});}
