import {sourceOf,key} from './compression-variants.js';
const DB='gre-offline-pack-index-v1',DIR='gre-offline-packs-v1',CACHE='gre-scalable-verified-units-v1';
// Not automatically instantiated. v2 fences baseline v1 IDB writers by causing
// VersionError. This does NOT fence old cache-only writers: upgraded-client gate
// and shared media lock are both required before activation.
export async function createBrowserAdapter({scopeURL,catalog,validateMedia,compatibleClients=()=>false}){
 if(!navigator.locks?.request||!validateMedia)throw Error('Locks and media validator required');
 const scope=new URL(scopeURL),controlKey=new URL('__gre_media_control__',scope).href;
 // Read-only initialization never upgrades. Mutation preparation is explicit.
 async function open(version){return new Promise((resolve,reject)=>{
  let abandoned=false;const r=version?indexedDB.open(DB,version):indexedDB.open(DB),timer=setTimeout(()=>{abandoned=true;reject(Error('Local database opening timed out'));},5000);
  r.onupgradeneeded=()=>{if(abandoned||!version){r.transaction.abort();if(!abandoned){clearTimeout(timer);resolve(null);}return;}if(!r.result.objectStoreNames.contains('packs'))r.result.createObjectStore('packs',{keyPath:'key'});for(const name of ['compressionJournals','compressionMeta'])if(!r.result.objectStoreNames.contains(name))r.result.createObjectStore(name,{keyPath:'id'});};
  r.onblocked=()=>{abandoned=true;clearTimeout(timer);reject(Error('Close old library tabs before upgrading'));};
  r.onerror=()=>{clearTimeout(timer);reject(r.error);};r.onsuccess=()=>{clearTimeout(timer);if(abandoned){r.result.close();return;}resolve(r.result);};
 });}

 let db=await open();
 if(db)db.onversionchange=()=>db.close();
 let dir;const directory=async(create=false)=>dir||=(await(await navigator.storage.getDirectory()).getDirectoryHandle(DIR,{create}));
 const transaction=(stores,mode,work)=>new Promise((resolve,reject)=>{const tx=db.transaction(stores,mode);let result;try{result=work(tx);}catch(e){tx.abort();reject(e);return;}tx.oncomplete=()=>resolve(typeof result==='function'?result():result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Transaction aborted'));});
 const requestAll=async()=>{if(!db)return {packs:[],journals:[],revision:0};const modern=db.objectStoreNames.contains('compressionMeta');return transaction(modern?['packs','compressionJournals','compressionMeta']:['packs'],'readonly',tx=>{const p=tx.objectStore('packs').getAll(),j=modern?tx.objectStore('compressionJournals').getAll():null,m=modern?tx.objectStore('compressionMeta').get('revision'):null;return()=>({packs:p.result,journals:j?.result||[],revision:m?.result?.value||0});});};
 const generation=async()=>{const r=await(await caches.open('gre-media-control-v1')).match(controlKey);return r?(await r.json()).generation:0;};
 const cache=await caches.open(CACHE),readFile=async name=>(await(await directory()).getFileHandle(name)).getFile();
 const readCache=async path=>{const r=await cache.match(new URL(path,scope));return r?.ok?r.blob():null;};
 return {
  compatibleClients,catalog,validateMedia,async prepareMutation(){if(!await compatibleClients())throw Error('Compatible-client deployment gate is closed');if(!db?.objectStoreNames.contains('compressionMeta')){db?.close();db=await open(2);db.onversionchange=()=>db.close();}},id:()=>crypto.randomUUID(),
  lock:fn=>navigator.locks.request(DB,()=>navigator.locks.request('gre-media-write:'+scope.href,fn)),
  async snapshot(){const s=await requestAll(),sources=new Map();for(const p of s.packs)for(const f of p.files){const v=sourceOf(f);if(v.role!=='unit')sources.set(v.path,v);}for(const v of (await catalog()).sources)sources.set(v.path,v);const urls=new Set((await cache.keys()).map(r=>r.url));return {...s,generation:await generation(),cache:[...sources.values()].filter(x=>urls.has(new URL(x.path,scope).href))};},
  readFile,readCache,
  async readEntry(pack,f){const b=await readFile(pack.name);if(b.size!==pack.bytes||!Number.isSafeInteger(f.start)||f.start<0||f.start+f.bytes>b.size)throw Error('Pack changed/range invalid');return b.slice(f.start,f.start+f.bytes);},
  async writeFile(name,blob,{signal}={}){
   const check=()=>{if(signal?.aborted)throw new DOMException('Cancelled','AbortError');};check();
   const h=await(await directory(true)).getFileHandle(name,{create:true});
   if(typeof h.createWritable==='function'){const w=await h.createWritable();try{for(let n=0;n<blob.size;n+=1048576){check();await w.write(blob.slice(n,n+1048576));}check();await w.close();}catch(e){await w.abort().catch(()=>{});throw e;}}
   else{
    if(typeof Worker!=='function')throw Error('此浏览器不能安全写入本机文件，原文件已保留');
    await new Promise((resolve,reject)=>{const worker=new Worker(new URL('./offline-copy-worker.js',import.meta.url),{type:'module'});let done=false,timer;
     const finish=error=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);worker.terminate();error?reject(error):resolve();};
     const heartbeat=()=>{clearTimeout(timer);timer=setTimeout(()=>finish(Error('本机文件写入超时，原文件已保留')),30000);};
     const cancel=()=>{worker.postMessage({type:'cancel'});finish(new DOMException('Cancelled','AbortError'));};signal?.addEventListener('abort',cancel,{once:true});
     worker.onmessage=({data})=>{heartbeat();if(data.done)finish();else if(data.error)finish(Error(data.error));};worker.onerror=event=>finish(Error(event.message||'本机写入失败，原文件已保留'));
     heartbeat();worker.postMessage({file:blob,name});if(signal?.aborted)cancel();
    });
   }
   check();if((await h.getFile()).size!==blob.size)throw Error('Stored package size mismatch');
  },
  async removeFile(name){try{await(await directory()).removeEntry(name);}catch(e){if(e.name!=='NotFoundError')throw e;}},
  async deleteCacheIfHash(path,hash,bytes){const b=await readCache(path);if(!b)return;const {digest}=await import('./compression-variants.js');if(b.size===bytes&&await digest(b)===hash)await cache.delete(new URL(path,scope));},
  putJournal:j=>transaction(['compressionJournals'],'readwrite',tx=>{tx.objectStore('compressionJournals').put(j);}),
  removeJournal:id=>transaction(['compressionJournals'],'readwrite',tx=>{tx.objectStore('compressionJournals').delete(id);}),
  async commit(packs,j,expected){if(await generation()!==expected.generation)throw Error('Generation changed');
   // Fence in-flight canonical downloads before exposing new metadata. This
   // cache write is not atomic with IDB: failure leaves originals untouched;
   // a crash afterwards may conservatively block auto-download but not reading.
   const controlCache=await caches.open('gre-media-control-v1'),oldResponse=await controlCache.match(controlKey),previous=oldResponse?await oldResponse.json():{generation:0,paused:false,phase:'active'};
   if(previous.generation!==expected.generation)throw Error('Generation changed');
   const replaced=packs.flatMap(p=>p.files.filter(f=>f.kind==='owned-local-variant').map(f=>new URL(f.source.path,scope).href));
   const next={...previous,generation:previous.generation+1,phase:'variants-committing',blockedAutoPaths:[...new Set([...(previous.blockedAutoPaths||[]),...replaced])]};
   await controlCache.put(controlKey,new Response(JSON.stringify(next),{headers:{'Content-Type':'application/json'}}));
   const notify=()=>{const channel=new BroadcastChannel('gre-media-write:'+scope.href);channel.postMessage({scope:scope.href});channel.close();};notify();
   await transaction(['packs','compressionJournals','compressionMeta'],'readwrite',tx=>{const m=tx.objectStore('compressionMeta'),r=m.get('revision');r.onsuccess=()=>{if((r.result?.value||0)!==expected.revision){tx.abort();return;}for(const p of packs)tx.objectStore('packs').put(p);tx.objectStore('compressionJournals').put(j);m.put({id:'revision',value:expected.revision+1});};});const channel=new BroadcastChannel('gre-pack-index:'+scope.href);channel.postMessage('changed');channel.close();await controlCache.put(controlKey,new Response(JSON.stringify({...next,phase:'variants-committed'}),{headers:{'Content-Type':'application/json'}}));notify();return {committedGeneration:next.generation};},
  async freeSpace(){const e=await navigator.storage.estimate();return e.quota-e.usage;},
  close:()=>db?.close()
 };
}
