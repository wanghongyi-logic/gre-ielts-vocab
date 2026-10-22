import {isHostedMediaEntry} from './hosted-media.js';
import {waitForLocal} from './offline-async.js';
// Inventories are local. A starting/suspended worker cannot block saved resources.
export async function batchStatus(){
 const cache=await waitForLocal(()=>globalThis.caches.open('gre-scalable-verified-units-v1'));
 const root=new URL('./',import.meta.url).href;
 const keys=await waitForLocal(()=>cache.keys());
 const readyPaths=keys.map(request=>request.url).filter(url=>url.startsWith(root+'story-media/')&&/[a-f0-9]{64}/.test(url)).map(url=>'gre-learning/'+url.slice(root.length));
 return {readyPaths,shellReady:false};
}
// Fresh immutable-key inventory avoids rehashing gigabytes of already saved
// complete words on Continue. Partial words still use normal per-file verification.
export function missingDownloadIds(catalog,ids,readyPaths){
 const paths=new Set(readyPaths),entries=new Map(catalog.entries.map(e=>[e.number,e]));
 return [...new Set(ids)].filter(id=>{const entry=entries.get(id);return entry&&['poster','video','staticPoster'].some(role=>{const ref=entry.storyMedia?.[role];return ref&&!paths.has('gre-learning/'+ref.url);});});
}
// The checkpoint records intent, not proof of saved bytes. A continuation always
// rechecks actual cache/OPFS resources; it never trusts these IDs as integrity receipts.
export const downloadCheckpointKey='gre-download-task-v1:'+new URL('../',import.meta.url).pathname;
export function readDownloadCheckpoint(storage){try{storage=storage||globalThis.localStorage;const value=JSON.parse(storage.getItem(downloadCheckpointKey));return value?.version===1&&Array.isArray(value.ids)&&value.ids.every(Number.isSafeInteger)&&Array.isArray(value.remaining)&&value.remaining.every(id=>value.ids.includes(id))?value:null;}catch{return null;}}
export function saveDownloadCheckpoint(value,storage=globalThis.localStorage){storage.setItem(downloadCheckpointKey,JSON.stringify(value));}
export async function downloadLessons(ids,skipPaths,{signal,onProgress=()=>{},idleTimeoutMs=120000,cancelProbeMs=2000,cancelProbeLimit=4}={}){
 ids=[...new Set(ids)];
 const target=navigator.serviceWorker?.controller;if(!target)throw new Error('离线服务尚未就绪，请稍后重试');
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 return new Promise((resolve,reject)=>{
  const channel=new MessageChannel(),jobId=crypto.randomUUID();let error,done=false,timer,cancelling=false,stopError,cancelChannel,cancelTimer,cancelProbes=0;
  const checkpoint={version:1,jobId,ids,remaining:[...ids],state:'running',updatedAt:Date.now()};
  const save=()=>{checkpoint.updatedAt=Date.now();saveDownloadCheckpoint(checkpoint);};
  try{save();}catch{channel.port1.close();channel.port2.close();reject(new Error('无法保存下载任务，请检查本机存储后重试'));return;}
  const finish=(failure,value)=>{if(done)return;done=true;clearTimeout(timer);clearTimeout(cancelTimer);signal?.removeEventListener('abort',abort);navigator.serviceWorker?.removeEventListener?.('controllerchange',changed);globalThis.document?.removeEventListener('visibilitychange',visibility);channel.port1.close();cancelChannel?.port1.close();checkpoint.state=failure?(failure.name==='AbortError'?'cancelled':'paused'):value?.unavailable?'paused':'complete';try{save();}catch{}failure?reject(failure):resolve(value);};
  // A lost cancellation reply is not proof that a native write drained. Probe
  // the SAME idempotent job cancellation with a capped budget per foreground.
  const cancel=()=>{
   if(done)return;clearTimeout(cancelTimer);cancelChannel?.port1.close();
   const probe=new MessageChannel();cancelChannel=probe;
   probe.port1.onmessage=({data})=>{probe.port1.close();if(data.type==='LESSON_DOWNLOAD_ABSENT')finish(stopError||new DOMException('Cancelled','AbortError'));};
   try{target.postMessage({type:'CANCEL_LESSON_DOWNLOAD',jobId},[probe.port2]);}catch{probe.port1.close();probe.port2.close();}
   if(!cancelling)return;
   cancelProbes++;
   if(!globalThis.document?.hidden&&cancelProbes<cancelProbeLimit){cancelTimer=setTimeout(()=>{
    if(done)return;
    if(navigator.serviceWorker?.controller&&navigator.serviceWorker.controller!==target){changed();return;}
    cancel();
   },Math.min(10000,Math.max(1,cancelProbeMs)*cancelProbes));}
   else if(cancelProbes>=cancelProbeLimit)onProgress({phase:'cancelling',pending:true});
  };
  const stop=failure=>{if(done||cancelling)return;stopError=failure;cancelling=true;clearTimeout(timer);checkpoint.state='cancelling';try{save();}catch{}cancel();onProgress({phase:'cancelling'});};
  const abort=()=>stop(new DOMException('Cancelled','AbortError'));
  const changed=()=>{const current=navigator.serviceWorker?.controller;if(!current||current===target)return;cancel();finish(new Error('离线服务已更新，请继续下载'));};
  const arm=()=>{clearTimeout(timer);if(cancelling||globalThis.document?.hidden)return;timer=setTimeout(()=>{stop(new Error('下载长时间没有响应，请继续下载'));},idleTimeoutMs);};
  // Suspension is expected on iOS, not evidence of a failed download. Give the
  // worker a fresh response window after returning; resume remains explicit if lost.
  const visibility=()=>{if(cancelling){clearTimeout(cancelTimer);if(!globalThis.document?.hidden){cancelProbes=0;cancel();}}else arm();};globalThis.document?.addEventListener('visibilitychange',visibility);
  signal?.addEventListener('abort',abort,{once:true});navigator.serviceWorker?.addEventListener?.('controllerchange',changed);
  channel.port1.onmessage=({data})=>{if(done)return;arm();if(data.type==='LESSON_DOWNLOAD_PROGRESS'){if(cancelling)return;if(checkpoint.remaining.includes(data.readyId)){checkpoint.remaining=checkpoint.remaining.filter(id=>id!==data.readyId);try{save();}catch{stop(new Error('下载任务保存失败，已完成资源保留'));return;}}onProgress({phase:'batch',completed:data.completed,total:data.requested,readyId:data.readyId,generation:data.generation});}else if(data.type==='LESSON_DOWNLOAD_ERROR'){error=new Error(data.error||'下载失败');}else if(data.type==='LESSON_DOWNLOAD_DONE'){if(data.cancelled||cancelling)finish(stopError||new DOMException('Cancelled','AbortError'));else finish(error,data);}};
  arm();try{target.postMessage({type:'DOWNLOAD_LESSONS',jobId,ids,skipPaths},[channel.port2]);}catch(error){finish(error);}
 });
}

// Ranges are published display ordinals, never vocabulary IDs or future lessons.
export function optionalMediaGroups(catalog){
 const groups=[];let current=null;
 for(const [index,entry] of catalog.entries.entries()){
  const ordinal=entry.displayOrdinal??index+1;if(!entry.storyMedia)continue;
  const bucket=Math.floor((ordinal-1)/50),hostedAvailable=isHostedMediaEntry(entry,index);
  // Split a fifty-word bucket at a hosting boundary. Retired neighbors must not
  // hide a newly hosted incremental range such as 211–220.
  if(!current||current.bucket!==bucket||current.hostedAvailable!==hostedAvailable||ordinal!==current.end+1){
   current={bucket,start:ordinal,end:ordinal,ids:[],hostedAvailable,refs:new Map()};groups.push(current);
  }
  current.end=ordinal;current.ids.push(entry.number);
  for(const ref of [entry.storyMedia.poster,entry.storyMedia.video,entry.storyMedia.staticPoster].filter(Boolean))current.refs.set(ref.url,ref);
 }
 return groups.map(({refs,bucket,...group})=>({...group,bytes:[...refs.values()].reduce((sum,ref)=>sum+ref.bytes,0)}));
}

