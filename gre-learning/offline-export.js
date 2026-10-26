import {localAsset,localAssetRecord} from './offline-packs.js';
import {CRC32,SHA256} from './offline-export-hash.js';
import {safePath,MAX_ENTRY,indexZip} from './offline-zip.js';
import {resolveSavedRange} from './offline-range.js';

const CHUNK=1024*1024,MAX_MEMORY=24*1024*1024,WORDS_PER_PACKAGE=100;
const EXPORT_DIR='gre-offline-exports-v1',SESSION_LOCK='gre-offline-export-session-v1:',STALE_AFTER=24*60*60*1000;
const SESSION_NAME=/^export-([0-9]{13})-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const encoder=new TextEncoder();
const abortError=()=>new DOMException('已取消导出','AbortError');
const cancelled=signal=>{if(signal?.aborted)throw abortError();};
const memoryError=()=>new Error('此浏览器只能导出合计 24 MB 以内的资源，请使用支持本机文件存储的较新 Safari');

export async function fingerprints(blob,signal){
 const crc=new CRC32(),sha=new SHA256();
 for(let n=0;n<blob.size;n+=CHUNK){cancelled(signal);const bytes=new Uint8Array(await blob.slice(n,n+CHUNK).arrayBuffer());cancelled(signal);crc.update(bytes);sha.update(bytes);}
 cancelled(signal);return {crc:crc.digest(),sha256:sha.hex()};
}
function header(path,size,crc,offset,central=false){
 const name=encoder.encode(path),bytes=new Uint8Array((central?46:30)+name.length),v=new DataView(bytes.buffer);
 v.setUint32(0,central?0x02014b50:0x04034b50,true);
 if(central){v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x800,true);v.setUint32(16,crc,true);v.setUint32(20,size,true);v.setUint32(24,size,true);v.setUint16(28,name.length,true);v.setUint32(42,offset,true);}
 else{v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,size,true);v.setUint32(22,size,true);v.setUint16(26,name.length,true);}
 bytes.set(name,central?46:30);return bytes;
}
export async function writeStoreZip(items,sink,{signal,onProgress=()=>{}}={}){
 if(!items.length||items.length>20000)throw new Error('资源数量不支持导出');
 const directoryBytes=items.reduce((n,item)=>n+46+encoder.encode(item.path).length,0);if(directoryBytes>20*1024*1024)throw new Error('所选范围目录超过安全单包上限');const estimate=items.reduce((n,item)=>n+(item.bytes??item.blob?.size??0)+76+2*encoder.encode(item.path).length,22);if(estimate>=0xffffffff)throw new Error('当前分包超过 ZIP32 大小上限，请缩小所选范围');
 let offset=0;const directory=[],paths=new Set();
 for(let i=0;i<items.length;i++){
  cancelled(signal);const item=items[i],{path,crc}=item;
  const blob=item.readBlob?await item.readBlob():item.blob;cancelled(signal);
  if(!blob||(item.bytes!==undefined&&blob.size!==item.bytes))throw new Error('已保存资源在导出期间发生变化，请重试');
  if(!safePath(path)||paths.has(path)||encoder.encode(path).length>65535||blob.size>MAX_ENTRY)throw new Error('资源格式不支持导出');
  if(offset+blob.size+76+2*encoder.encode(path).length>=0xffffffff)throw new Error('所选范围超过 ZIP32 单包大小上限');paths.add(path);const start=offset,h=header(path,blob.size,crc,0);await sink.write(h,offset);offset+=h.length;
  const checkedCRC=new CRC32(),checkedSHA=item.sha256?new SHA256():null;
  for(let n=0;n<blob.size;n+=CHUNK){cancelled(signal);const bytes=new Uint8Array(await blob.slice(n,n+CHUNK).arrayBuffer());cancelled(signal);checkedCRC.update(bytes);checkedSHA?.update(bytes);await sink.write(bytes,offset);offset+=bytes.length;}
  if(checkedCRC.digest()!==crc||(checkedSHA&&checkedSHA.hex()!==item.sha256))throw new Error('已保存资源在导出期间发生变化，请重试');
  directory.push(header(path,blob.size,crc,start,true));cancelled(signal);onProgress({completed:i+1,total:items.length});
 }
 const directoryStart=offset;if(offset+directoryBytes+22>=0xffffffff)throw new Error('所选范围超过 ZIP32 单包大小上限');
 for(const d of directory){cancelled(signal);await sink.write(d,offset);offset+=d.length;}
 cancelled(signal);const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,items.length,true);v.setUint16(10,items.length,true);v.setUint32(12,offset-directoryStart,true);v.setUint32(16,directoryStart,true);await sink.write(end,offset);cancelled(signal);return offset+22;
}

// Retain a lease while generated files are offered to this tab. A later export
// may reap only old, recognized export sessions for which no tab owns a lease.
async function holdSession(session){
 if(!navigator.locks?.request)return ()=>{};
 let release;
 const held=new Promise(resolve=>{release=resolve;});
 await new Promise((resolve,reject)=>{navigator.locks.request(SESSION_LOCK+session,async()=>{resolve();await held;}).catch(reject);});
 return release;
}
async function removeSession(session){
 if(!navigator.storage?.getDirectory)return;
 let root;try{root=await navigator.storage.getDirectory();}catch{return;}
 try{const dir=await root.getDirectoryHandle(EXPORT_DIR);await dir.removeEntry(session,{recursive:true});}catch(error){if(error.name!=='NotFoundError')throw error;}
}
export async function cleanStaleExports(now=Date.now()){
 if(!navigator.locks?.request)return;
 try{
  const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle(EXPORT_DIR);
  for await(const [name,handle] of dir.entries()){
   const match=SESSION_NAME.exec(name);if(handle.kind!=='directory'||!match||now-Number(match[1])<STALE_AFTER)continue;
   await navigator.locks.request(SESSION_LOCK+name,{ifAvailable:true},async lock=>{if(lock)await dir.removeEntry(name,{recursive:true}).catch(()=>{});});
  }
 }catch{}
}

function waitFor(promise,signal,timeout=30000){
 return new Promise((resolve,reject)=>{
  let timer;const done=(callback,value)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);callback(value);},abort=()=>done(reject,abortError());
  Promise.resolve(promise).then(value=>done(resolve,value),error=>done(reject,error));
  timer=setTimeout(()=>done(reject,new Error('临时文件写入超时，请重试')),timeout);
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
 });
}
function memorySink(budget){
 const parts=[];let total=0,closed=false;
 return {kind:'memory',write:async bytes=>{if(closed)throw new Error('导出文件已关闭');if(total+bytes.length>budget)throw memoryError();total+=bytes.length;parts.push(bytes);},finish:async()=>{closed=true;const file=new Blob(parts,{type:'application/zip'});parts.length=0;return file;},abort:async()=>{closed=true;parts.length=0;}};
}
function workerChannel(worker,signal){
 let id=0,failed=null,closed=false;const pending=new Map();
 function fail(error){if(failed||closed)return;failed=error;for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();signal?.removeEventListener('abort',abort);worker.terminate();}
 const abort=()=>fail(abortError());signal?.addEventListener('abort',abort,{once:true});
 worker.onmessage=({data})=>{const p=pending.get(data?.id);if(!p)return;pending.delete(data.id);clearTimeout(p.timer);if(data.error){const error=new Error(data.error);p.reject(error);fail(error);}else p.resolve();};
 worker.onerror=()=>fail(new Error('临时文件写入失败'));
 worker.onmessageerror=()=>fail(new Error('临时文件通信失败'));
 function call(type,extra={}){
  if(failed)return Promise.reject(failed);if(closed)return Promise.reject(new Error('导出文件已关闭'));
  try{cancelled(signal);}catch(error){fail(error);return Promise.reject(error);}
  return new Promise((resolve,reject)=>{
   const key=++id,timer=setTimeout(()=>fail(new Error('临时文件写入超时，请重试')),30000);pending.set(key,{resolve,reject,timer});
   try{worker.postMessage({type,id:key,...extra},extra.bytes?[extra.bytes]:[]);}catch(error){fail(error);}
  });
 }
 return {call,stop:()=>{if(!failed&&!closed){closed=true;signal?.removeEventListener('abort',abort);worker.terminate();}},abort:()=>fail(abortError())};
}
async function createSink(session,name,signal,budget){
 let entry,own,writer,channel;
 try{
  cancelled(signal);const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle(EXPORT_DIR,{create:true});own=await dir.getDirectoryHandle(session,{create:true});entry=await own.getFileHandle(name,{create:true});cancelled(signal);
  if(typeof entry.createWritable==='function'){
   try{writer=await entry.createWritable();}catch(error){if(error.name!=='NotSupportedError')throw error;}
  }
  if(writer){
   let closed=false,aborting;
   const abort=()=>{if(aborting)return aborting;if(!closed){closed=true;aborting=waitFor(writer.abort(),undefined,1000).catch(()=>{});return aborting;}};
   signal?.addEventListener('abort',abort,{once:true});
   if(signal?.aborted){await abort();throw abortError();}
   return {kind:'disk',write:async(bytes,offset)=>{cancelled(signal);await waitFor(writer.write({type:'write',position:offset,data:bytes}),signal);cancelled(signal);},finish:async()=>{cancelled(signal);await waitFor(writer.close(),signal);closed=true;signal?.removeEventListener('abort',abort);cancelled(signal);return entry.getFile();},abort:async()=>{signal?.removeEventListener('abort',abort);await abort();}};
  }
  const worker=new Worker(new URL('./offline-export-worker.js',import.meta.url),{type:'module'});channel=workerChannel(worker,signal);await channel.call('open',{session,name});
  return {kind:'disk',write:(bytes,offset)=>channel.call('write',{bytes:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),offset}),finish:async()=>{await channel.call('close');channel.stop();cancelled(signal);return entry.getFile();},abort:async()=>{channel.abort();}};
 }catch(error){
  channel?.abort();if(writer)await waitFor(writer.abort(),undefined,1000).catch(()=>{});if(own)await own.removeEntry(name).catch(()=>{});cancelled(signal);
  if(error.name==='QuotaExceededError')throw new Error('可用存储空间不足，无法创建临时导出文件');
  return memorySink(budget);
 }
}
async function source(ref){
 const imported=await localAsset(ref);if(imported)return imported;
 try{if(!await caches.has('gre-scalable-verified-units-v1'))return null;const cache=await caches.open('gre-scalable-verified-units-v1'),response=await cache.match(new URL(ref.url,import.meta.url));if(response?.ok)return response.blob();}catch{}
 return null;
}

export async function exportSavedResources(catalog,{signal,onProgress=()=>{},readSource=source,range}={}){
 // Validate before opening storage or cleaning temporary files. Keep the
 // original catalog order: the importer validates stable word IDs
 // against that full catalog, not against display ordinals or a renumbered copy.
 const selectedRange=range===undefined?null:resolveSavedRange(catalog,range?.start,range?.end),selected=selectedRange?new Set(selectedRange.ids):null;
 const entries=selected?catalog.entries.filter(entry=>selected.has(entry.number)):catalog.entries;
 // Fixed ordinal windows keep missing words in their original segment; they
 // never pull a later word forward just to fill a package.
 const ordinals=new Map(catalog.entries.map((entry,index)=>[entry,entry.displayOrdinal??index+1])),ordinal=entry=>ordinals.get(entry);
 const start=selectedRange?.start??Math.min(...entries.map(ordinal)),end=selectedRange?.end??Math.max(...entries.map(ordinal)),batches=[];
 for(let from=start;Number.isFinite(from)&&from<=end;from+=WORDS_PER_PACKAGE){const to=Math.min(from+WORDS_PER_PACKAGE-1,end);batches.push({start:from,end:to,entries:[]});}
 for(const entry of entries)batches[Math.floor((ordinal(entry)-start)/WORDS_PER_PACKAGE)].entries.push(entry);
 const session='export-'+Date.now()+'-'+crypto.randomUUID(),outputs=[],skippedOrdinals=[];let skipped=0,complete=0,sink=null,memoryBytes=0,released=false,release=()=>{};
 const cleanup=async()=>{if(released)return;try{await removeSession(session);released=true;}finally{release();}};
 let group=[],assets=new Map(),bytes=0,batch=null,batchIndex=0,scanned=0;
 const report=(phase,completed,total)=>onProgress({phase,completed,total,packageIndex:batchIndex+1,packageTotal:batches.length,range:{start:batch.start,end:batch.end},scanned,selectedCount:entries.length,skipped});
 const prepareSink=async()=>{if(!sink)sink=await createSink(session,'part-'+(outputs.length+1)+'.zip',signal,MAX_MEMORY-memoryBytes);return sink;};
 async function flush(){
  if(!group.length)return;
  const number=outputs.length+1,hasVariants=[...assets.values()].some(a=>a.record?.kind==='owned-local-variant'),manifest=hasVariants?{format:'gre-owned-local-variants-v1',trust:'owned-local-not-official',files:[...assets.values()].map((a,i)=>({...a.record,archivePath:'media/'+i+'.bin',start:undefined}))}:{format:'gre-offline-pack-v1',packId:session+'-'+number,version:'1',wordIds:group.map(e=>e.number),files:[...assets.values()].map(({path,role,wordId,ref})=>({path,role,wordId,bytes:ref.bytes,sha256:ref.sha256}))};
  const manifestBlob=new Blob([JSON.stringify(manifest)]);if(manifestBlob.size>20*1024*1024)throw new Error('所选范围元数据超过安全单包上限');const mhash=await fingerprints(manifestBlob,signal),items=[{path:'manifest.json',blob:manifestBlob,crc:mhash.crc},...[...assets.values()].map((a,i)=>({path:hasVariants?'media/'+i+'.bin':a.path,bytes:a.stored.bytes,sha256:a.stored.sha256,crc:a.crc,readBlob:async()=>{return readSource(a.ref);}}))];
  const name=`GRE-${batch.start}-${batch.end}.zip`;
  await prepareSink();
  try{
   await writeStoreZip(items,sink,{signal,onProgress:p=>report('pack',p.completed,p.total)});const file=await sink.finish();cancelled(signal);await indexZip(file);cancelled(signal);
   if(sink.kind==='memory')memoryBytes+=file.size;
   outputs.push({name,file,words:group.length,range:{start:batch.start,end:batch.end},packageIndex:batchIndex+1,packageTotal:batches.length});sink=null;
  }catch(error){await sink.abort();sink=null;throw error;}
  group=[];assets=new Map();bytes=0;
 }
 try{
  cancelled(signal);release=await holdSession(session);await cleanStaleExports();cancelled(signal);
  // Keep only paths, sizes and fingerprints while scanning. Media is re-read
  // one asset at a time when writing, and the exact written bytes are checked
  // again before the temporary package can be finalized. The small Blob
  // fallback also caps retained output across all packages.
  for(batchIndex=0;batchIndex<batches.length;batchIndex++){
   batch=batches[batchIndex];cancelled(signal);report('scan',0,batch.entries.length);
   await prepareSink();
   for(let i=0;i<batch.entries.length;i++){
   cancelled(signal);const entry=batch.entries[i],found=[];
   for(const role of ['poster','video','staticPoster']){
    const originalRef=entry.storyMedia?.[role];if(!originalRef)continue;const ref={...originalRef,wordId:entry.number,role},path='gre-learning/'+ref.url;
    if(!safePath(path)||!Number.isSafeInteger(ref.bytes)||ref.bytes<0||ref.bytes>MAX_ENTRY)throw new Error('资源信息不支持导出');
    const prior=assets.get(path);
    if(prior&&prior.record?.kind!=='owned-local-variant'&&prior.ref.sha256===ref.sha256&&prior.ref.bytes===ref.bytes){found.push({...prior,role,wordId:entry.number});continue;}
    const imported=readSource===source?await localAssetRecord(ref):null,stored=imported?.record||ref;const blob=imported?.blob||await readSource(ref);cancelled(signal);if(!blob||blob.size!==stored.bytes){found.length=0;break;}
    const hash=await fingerprints(blob,signal);if(hash.sha256!==stored.sha256){found.length=0;break;}
    found.push({path,role,wordId:entry.number,ref,stored,record:imported?.record||{path,role,wordId:entry.number,bytes:ref.bytes,sha256:ref.sha256},crc:hash.crc});
   }
   if(found.length&&entry.storyMedia?.video&&found.some(a=>a.role==='video')){
    const extra=found.filter(a=>!assets.has(a.path)).reduce((n,a)=>n+a.stored.bytes,0);
    if(sink?.kind==='memory'&&memoryBytes+bytes+extra>MAX_MEMORY)throw memoryError();
    // Each fixed window contains at most 100 selected words. Resources shared
    // across windows are included again so every ZIP imports independently.
    group.push(entry);for(const a of found)if(!assets.has(a.path)){assets.set(a.path,a);bytes+=a.stored.bytes;}complete++;
   }else{skipped++;skippedOrdinals.push(ordinal(entry));}
   scanned++;report('scan',i+1,batch.entries.length);
   }
   await flush();if(sink){await sink.abort();sink=null;}
  }
  if(!outputs.length)throw Object.assign(new Error(selected?'所选范围内没有完整保存的资源可导出':'本机还没有完整保存的资源可导出'),{selectedCount:entries.length,complete:0,skipped,skippedOrdinals});cancelled(signal);
  return {packages:outputs,complete,skipped,skippedOrdinals,selectedCount:entries.length,plannedPackages:batches.length,cleanup};
 }catch(error){if(sink)await sink.abort().catch(()=>{});await cleanup().catch(()=>{});throw error;}
}
