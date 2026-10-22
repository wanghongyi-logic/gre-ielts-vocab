// Created only by explicit staging/recovery, never inventory or settings reads.
export function createSpoolIndex(){
 let db;
 async function transaction(mode,operation){
  if(!db)db=await new Promise((resolve,reject)=>{let abandoned=false;const r=indexedDB.open('gre-compression-spool-v1',1),timer=setTimeout(()=>{abandoned=true;reject(Error('Spool database timed out'));},5000);
   r.onupgradeneeded=()=>{if(abandoned){r.transaction.abort();return;}r.result.createObjectStore('items',{keyPath:'spool.name'});};
   r.onsuccess=()=>{clearTimeout(timer);if(abandoned){r.result.close();return;}r.result.onversionchange=()=>r.result.close();resolve(r.result);};
   r.onerror=()=>{clearTimeout(timer);reject(r.error);};r.onblocked=()=>{abandoned=true;clearTimeout(timer);reject(Error('Spool database blocked'));};});
  return new Promise((resolve,reject)=>{const tx=db.transaction(['items'],mode);let request;try{request=operation(tx.objectStore('items'));}catch(e){tx.abort();reject(e);return;}tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Spool transaction aborted'));});
 }
 return {put:d=>transaction('readwrite',s=>s.put(d)),get:name=>transaction('readonly',s=>s.get(name)),delete:name=>transaction('readwrite',s=>s.delete(name)),list:async sessionId=>(await transaction('readonly',s=>s.getAll())).filter(d=>sessionId===undefined||d.spool.sessionId===sessionId),close:()=>{db?.close();db=null;}};
}
