// Safari's OPFS synchronous writer is available only in a dedicated worker.
// This worker never reads the media library and owns only an isolated export directory.
let handle,queue=Promise.resolve();
function close(){const current=handle;handle=null;try{current?.close();}catch{}}
self.onmessage=({data})=>{
 queue=queue.then(async()=>{
  try{
   if(data.type==='open'){
    if(!/^export-[0-9]{13}-[a-f0-9-]{36}$/.test(data.session)||!/^part-[0-9]+\.zip$/.test(data.name))throw new Error('无效的临时导出文件');
    const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle('gre-offline-exports-v1',{create:true}),session=await dir.getDirectoryHandle(data.session,{create:true}),entry=await session.getFileHandle(data.name,{create:true});
    handle=await entry.createSyncAccessHandle();handle.truncate(0);
   }else if(data.type==='write'){
    if(!handle||!Number.isSafeInteger(data.offset)||data.offset<0)throw new Error('导出文件未打开');
    let done=0;const bytes=new Uint8Array(data.bytes);
    while(done<bytes.length){const n=handle.write(bytes.subarray(done),{at:data.offset+done});if(!Number.isSafeInteger(n)||n<=0||n>bytes.length-done)throw new Error('临时导出文件写入失败');done+=n;}
   }else if(data.type==='close'){if(!handle)throw new Error('导出文件未打开');handle.flush();handle.close();handle=null;}
   else if(data.type==='abort')close();
   else throw new Error('未知的导出操作');
   self.postMessage({id:data.id});
  }catch(error){close();self.postMessage({id:data.id,error:error.message});}
 }).catch(()=>{close();});
};
