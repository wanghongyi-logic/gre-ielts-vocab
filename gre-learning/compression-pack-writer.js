// One bounded chunk in flight. Never concatenate the complete compacted pack.
export async function writeCompressionParts(directory,name,parts,totalBytes,{signal}={}){
 const check=()=>{if(signal?.aborted)throw new DOMException('Cancelled','AbortError');};check();
 const h=await directory.getFileHandle(name,{create:true});let written=0;
 if(typeof h.createWritable==='function'){
  const w=await h.createWritable();try{for await(const blob of parts){for(let n=0;n<blob.size;n+=1048576){check();const chunk=blob.slice(n,n+1048576);await w.write(chunk);written+=chunk.size;}}check();if(written!==totalBytes)throw Error('Stream length mismatch');await w.close();}catch(e){await w.abort().catch(()=>{});throw e;}
 }else{
  if(typeof Worker!=='function')throw Error('Safe local streaming writer unavailable');
  const worker=new Worker(new URL('./compression-pack-worker.js',import.meta.url),{type:'module'});let pending=null,failure;
  const fail=e=>{failure=e;pending?.reject(e);pending=null;};
  const cancel=()=>fail(new DOMException('Cancelled','AbortError'));signal?.addEventListener('abort',cancel,{once:true});
  worker.onerror=e=>fail(Error(e.message||'Local stream worker failed'));
  worker.onmessage=({data})=>{if(data.error){fail(Error(data.error));return;}const waiter=pending;pending=null;waiter?.resolve(data);};
  const send=(message,transfer=[])=>new Promise((resolve,reject)=>{if(failure){reject(failure);return;}const timer=setTimeout(()=>fail(Error('Local stream write timed out')),30000);pending={resolve:x=>{clearTimeout(timer);resolve(x);},reject:e=>{clearTimeout(timer);reject(e);}};try{worker.postMessage(message,transfer);}catch(e){fail(e);}});
  try{check();await send({type:'open',name,totalBytes});for await(const blob of parts){for(let n=0;n<blob.size;n+=1048576){check();const buffer=await blob.slice(n,n+1048576).arrayBuffer();written+=buffer.byteLength;await send({type:'chunk',buffer},[buffer]);}}check();if(written!==totalBytes)throw Error('Stream length mismatch');await send({type:'close'});}finally{signal?.removeEventListener('abort',cancel);worker.terminate();}
 }
 check();if((await h.getFile()).size!==totalBytes)throw Error('Stored stream length mismatch');
}
