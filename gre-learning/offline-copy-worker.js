// Safari17 dedicated-worker OPFS path. Writes bounded chunks, never the whole ZIP in RAM.
let cancelled=false,network;
self.onmessage=async event=>{
 if(event.data.type==='cancel'){cancelled=true;network?.abort();return;}
 const {file,name,url,expectedBytes}=event.data;let handle,reader;
 try{
  const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle('gre-offline-packs-v1',{create:true}),entry=await dir.getFileHandle(name,{create:true});
  handle=await entry.createSyncAccessHandle();handle.truncate(0);let total=0;
  if(cancelled)throw new Error('Import cancelled');
  if(url){const target=new URL(url);if(target.origin!==self.location.origin)throw new Error('Package download must use the same origin');network=new AbortController();const response=await fetch(target,{redirect:'error',credentials:'omit',cache:'no-store',signal:network.signal});if(!response.ok||!response.body)throw new Error('Package download unavailable');reader=response.body.getReader();}
  while(true){if(cancelled)throw new Error('Import cancelled');let chunk;if(reader){const result=await reader.read();if(result.done)break;chunk=result.value;}else{if(total>=file.size)break;chunk=new Uint8Array(await file.slice(total,total+1024*1024).arrayBuffer());}
   if(total+chunk.length>(url?expectedBytes:file.size))throw new Error('Package download exceeded declared size');let done=0;while(done<chunk.length){const n=handle.write(chunk.subarray(done),{at:total+done});if(!n)throw new Error('Storage write failed');done+=n;}total+=chunk.length;self.postMessage({progress:total});
  }
  if(total!==(url?expectedBytes:file.size))throw new Error('Incomplete package download');handle.flush();handle.close();handle=null;self.postMessage({done:true});
 }catch(error){await reader?.cancel().catch(()=>{});handle?.close();handle=null;self.postMessage({error:error.message});}finally{handle?.close();}
};
