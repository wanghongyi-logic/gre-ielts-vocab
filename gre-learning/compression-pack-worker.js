let access,offset=0,expected=0;
self.onmessage=async({data})=>{try{
 if(data.type==='open'){
  if(access||!/^variant-[a-zA-Z0-9_-]+\.bin$/.test(data.name)||!Number.isSafeInteger(data.totalBytes)||data.totalBytes<0)throw Error('Invalid stream destination');
  const dir=await(await navigator.storage.getDirectory()).getDirectoryHandle('gre-offline-packs-v1',{create:true});
  access=await(await dir.getFileHandle(data.name,{create:true})).createSyncAccessHandle();access.truncate(0);expected=data.totalBytes;
 }else if(data.type==='chunk'){
  if(!access||!(data.buffer instanceof ArrayBuffer)||data.buffer.byteLength>1048576||offset+data.buffer.byteLength>expected)throw Error('Invalid stream chunk');
  const bytes=new Uint8Array(data.buffer);let n=0;while(n<bytes.length){const wrote=access.write(bytes.subarray(n),{at:offset+n});if(!wrote)throw Error('Short local write');n+=wrote;}offset+=n;
 }else if(data.type==='close'){
  if(!access||offset!==expected)throw Error('Incomplete local stream');access.flush();access.close();access=null;
 }else throw Error('Unknown stream operation');self.postMessage({ok:true});
 }catch(e){try{access?.close();}catch{}access=null;self.postMessage({error:e.message});}
};
