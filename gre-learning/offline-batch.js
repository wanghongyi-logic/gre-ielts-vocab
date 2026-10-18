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
export async function downloadLessons(ids,skipPaths,{signal,onProgress=()=>{},idleTimeoutMs=120000}={}){
 const target=navigator.serviceWorker?.controller;if(!target)throw new Error('离线服务尚未就绪，请稍后重试');
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 return new Promise((resolve,reject)=>{
  const channel=new MessageChannel(),jobId=crypto.randomUUID();let error,done=false,timer;
  const finish=(failure,value)=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);navigator.serviceWorker?.removeEventListener?.('controllerchange',changed);channel.port1.close();failure?reject(failure):resolve(value);};
  const cancel=()=>{try{target.postMessage({type:'CANCEL_LESSON_DOWNLOAD',jobId});}catch{}};
  const abort=()=>{cancel();finish(new DOMException('Cancelled','AbortError'));};
  const changed=()=>{cancel();finish(new Error('离线服务已更新，请继续下载'));};
  const arm=()=>{clearTimeout(timer);timer=setTimeout(()=>{cancel();finish(new Error('下载长时间没有响应，请继续下载'));},idleTimeoutMs);};
  signal?.addEventListener('abort',abort,{once:true});navigator.serviceWorker?.addEventListener?.('controllerchange',changed);
  channel.port1.onmessage=({data})=>{if(done)return;arm();if(data.type==='LESSON_DOWNLOAD_PROGRESS')onProgress({phase:'batch',completed:data.completed,total:data.requested,readyId:data.readyId,generation:data.generation});else if(data.type==='LESSON_DOWNLOAD_ERROR'){error=new Error(data.error||'下载失败');}else if(data.type==='LESSON_DOWNLOAD_DONE'){if(data.cancelled)finish(new DOMException('Cancelled','AbortError'));else finish(error,data);}};
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

