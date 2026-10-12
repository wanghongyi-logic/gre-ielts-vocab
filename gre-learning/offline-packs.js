import {validatePack} from './offline-zip.js';
const DB='gre-offline-pack-index-v1',DIR='gre-offline-packs-v1';
const cancelled=signal=>{if(signal?.aborted)throw new DOMException('Import cancelled','AbortError');};
let database;
const verifiedSlices=new Map(),badSlices=new Set();
const sliceIdentity=(pack,file,entry)=>[pack.name,file.size,Number.isFinite(file.lastModified)?file.lastModified:'unknown',entry.path,entry.sha256,entry.bytes].join('|');
function db(){return database??=(new Promise((resolve,reject)=>{const request=indexedDB.open(DB,1);request.onupgradeneeded=()=>request.result.createObjectStore('packs',{keyPath:'key'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);})).catch(error=>{database=null;throw error;});}
async function transaction(mode,operation){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('packs',mode);let result;const request=operation(tx.objectStore('packs'));request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Index update cancelled'));});}
async function directory(){return(await navigator.storage.getDirectory()).getDirectoryHandle(DIR,{create:true});}
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
async function locked(fn){if(navigator.locks?.request)return navigator.locks.request(DB,fn);throw new Error('此浏览器缺少安全导入所需的存储锁，请更新 Safari 后重试');}
function support(){if(!navigator.storage?.getDirectory||!globalThis.indexedDB||!globalThis.crypto?.subtle)throw new Error('此浏览器不支持离线书库。请使用 HTTPS 网站上的 Safari 17 或更新版本');}
async function recover(){const dir=await directory(),owned=new Set((await listPacks()).map(p=>p.name));for await(const [name,handle] of dir.entries())if(handle.kind==='file'&&/^pack-[0-9]+-[a-f0-9-]+\.zip$/.test(name)&&!owned.has(name))await dir.removeEntry(name);}
const identity=files=>JSON.stringify(files.map(f=>[f.path,f.role,f.wordId,f.bytes,f.sha256]).sort((a,b)=>a[0].localeCompare(b[0])));
async function checkExisting(parsed,catalog,options){const key=parsed.manifest.packId+'@'+parsed.manifest.version,existing=await transaction('readonly',s=>s.get(key));if(existing){if(identity(existing.files)!==identity(parsed.files))throw new Error('同一版本的内容不同，请使用新的版本号');try{const old=await(await(await directory()).getFileHandle(existing.name)).getFile();if(old.size===existing.bytes){await validatePack(old,catalog,options);return {existing,duplicate:true};}}catch{} }cancelled(options.signal);return {existing,duplicate:false};}
async function ensureSpace(bytes){const estimate=await navigator.storage.estimate?.();if(Number.isFinite(estimate?.quota)&&Number.isFinite(estimate?.usage)&&estimate.quota-estimate.usage<bytes*1.05)throw new Error('可用存储空间不足，请先释放空间');}
// Both file import and direct download converge here. Caller holds the storage lock.
async function finalizeStoredPack(name,file,parsed,catalog,options,checked){const {existing,duplicate}=checked||await checkExisting(parsed,catalog,options);if(duplicate)return {...existing,duplicate:true};cancelled(options.signal);const {manifest,files}=parsed,record={key:manifest.packId+'@'+manifest.version,name,packId:manifest.packId,version:manifest.version,wordIds:manifest.wordIds,files,bytes:file.size,installedAt:Date.now()};await transaction('readwrite',s=>s.put(record));if(existing?.name)await(await directory()).removeEntry(existing.name).catch(()=>{});return record;}
const temporaryName=()=> 'pack-'+Date.now()+'-'+crypto.randomUUID()+'.zip';
export async function importPack(file,catalog,{signal,onProgress=()=>{}}={}){
 support();return locked(async()=>{await recover();const options={signal,onProgress};cancelled(signal);const parsed=await validatePack(file,catalog,options),checked=await checkExisting(parsed,catalog,options);if(checked.duplicate)return {...checked.existing,duplicate:true};await ensureSpace(file.size);const name=temporaryName();let committed=false;try{await copy(file,name,signal,onProgress);const record=await finalizeStoredPack(name,file,parsed,catalog,options,checked);committed=record.name===name;return record;}finally{if(!committed)await(await directory()).removeEntry(name).catch(()=>{});}});
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
 support();trustedPackageURL(descriptor);return locked(async()=>{await recover();cancelled(signal);await ensureSpace(descriptor.bytes);const options={signal,onProgress},name=temporaryName();let committed=false;try{const file=await downloadToStorage(descriptor,name,options);const parsed=await validatePack(file,catalog,options);if(parsed.manifest.packId!==descriptor.packId||parsed.manifest.version!==descriptor.version)throw new Error('下载的书包版本与目录不一致');const record=await finalizeStoredPack(name,file,parsed,catalog,options);committed=record.name===name;return record;}finally{if(!committed)await(await directory()).removeEntry(name).catch(()=>{});}});
}
export async function deletePack(key){return locked(async()=>{const pack=await transaction('readonly',s=>s.get(key));if(!pack)return;await transaction('readwrite',s=>s.delete(key));await(await directory()).removeEntry(pack.name).catch(()=>{});});}
export async function localAsset(ref){
 try{const path='gre-learning/'+ref.url;const packs=(await listPacks()).sort((a,b)=>b.installedAt-a.installedAt);for(const pack of packs){const entry=pack.files.find(f=>f.path===path&&f.sha256===ref.sha256&&f.bytes===ref.bytes);if(!entry)continue;try{const file=await(await(await directory()).getFileHandle(pack.name)).getFile();if(file.size!==pack.bytes)continue;const identity=sliceIdentity(pack,file,entry);if(badSlices.has(identity))continue;const slice=file.slice(entry.start,entry.start+entry.bytes,entry.role==='video'?'video/mp4':entry.role==='unit'?'application/json':ref.url.endsWith('.png')?'image/png':ref.url.endsWith('.webp')?'image/webp':'image/jpeg');if(!verifiedSlices.has(identity)){const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await slice.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');if(digest!==entry.sha256){badSlices.add(identity);if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('gre-offline-corrupt',{detail:{packId:pack.packId}}));continue;}if(Number.isFinite(file.lastModified)){verifiedSlices.set(identity,true);while(verifiedSlices.size>64)verifiedSlices.delete(verifiedSlices.keys().next().value);}}return slice;}catch{}}}catch{}return null;
}
export async function storageStatus(){const estimate=await navigator.storage?.estimate?.();const persistent=await navigator.storage?.persisted?.();return {...estimate,persistent:Boolean(persistent)};}

export async function inspectLibrary(catalog,{cachedPaths=[]}={}){
 const packs=(await listPacks()).sort((a,b)=>b.installedAt-a.installedAt),signatures=new Set(),owners=new Map();
 const wanted=new Set();for(const e of catalog.entries)for(const ref of [e.storyMedia?.video,e.storyMedia?.poster,e.storyMedia?.staticPoster].filter(Boolean))wanted.add('gre-learning/'+ref.url+'|'+ref.sha256+'|'+ref.bytes);
 for(const pack of packs){pack.available=false;let file;try{file=await(await(await directory()).getFileHandle(pack.name)).getFile();pack.available=file.size===pack.bytes;}catch{}pack.ownedCurrentAssets=0;if(!pack.available)continue;for(const f of pack.files){if(badSlices.has(sliceIdentity(pack,file,f)))continue;const signature=f.path+'|'+f.sha256+'|'+f.bytes;signatures.add(signature);if(wanted.has(signature)&&!owners.has(signature)){owners.set(signature,pack.key);pack.ownedCurrentAssets++;}}}
 const opfsPaths=[...signatures].map(signature=>signature.split('|')[0]);for(const signature of wanted)if(cachedPaths.includes(signature.split('|')[0]))signatures.add(signature);
 const readyIds=catalog.entries.filter(e=>[e.storyMedia?.video,e.storyMedia?.poster,e.storyMedia?.staticPoster].filter(Boolean).every(ref=>signatures.has('gre-learning/'+ref.url+'|'+ref.sha256+'|'+ref.bytes))).map(e=>e.number);
 return {packs,readyIds,opfsPaths,total:catalog.entries.length};
}

export async function cleanUnusedPacks(catalog,approvedKeys){return locked(async()=>{const unused=(await inspectLibrary(catalog)).packs.filter(p=>p.ownedCurrentAssets===0&&approvedKeys.includes(p.key));for(const pack of unused){await transaction('readwrite',s=>s.delete(pack.key));await(await directory()).removeEntry(pack.name).catch(()=>{});}return unused.length;});}

export async function clearSavedResources(){return locked(async()=>{
 const worker=navigator.serviceWorker?.controller;
 if(worker)await new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(new Error('请等待页面更新完成后重试清除'));},15000);channel.port1.onmessage=({data})=>{clearTimeout(timer);channel.port1.close();data.type==='MEDIA_CLEARED'?resolve():reject(new Error(data.error||'无法清除已保存内容'));};worker.postMessage({type:'PAUSE_AND_CLEAR_MEDIA'},[channel.port2]);});
 if(globalThis.caches){const cache=await caches.open('gre-scalable-verified-units-v1'),root=new URL('./story-media/',import.meta.url).href;for(const request of await cache.keys())if(request.url.startsWith(root))await cache.delete(request);}
 const packs=await listPacks(),dir=await directory();for(const pack of packs){try{await dir.removeEntry(pack.name);}catch(error){if(error.name!=='NotFoundError')throw error;}await transaction('readwrite',store=>store.delete(pack.key));}
 for await(const [name,handle] of dir.entries())if(handle.kind==='file'&&/^pack-[0-9]+-[a-f0-9-]+\.zip$/.test(name))await dir.removeEntry(name);
 verifiedSlices.clear();badSlices.clear();return packs.length;
});}
