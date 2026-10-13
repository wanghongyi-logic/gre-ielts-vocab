import {isHostedMediaEntry} from './hosted-media.js';
export async function batchStatus(){const target=navigator.serviceWorker?.controller;if(!target)return {readyPaths:[],shellReady:false};return new Promise((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(new Error('离线状态检查超时，请稍后重试'));},120000);channel.port1.onmessage=({data})=>{clearTimeout(timer);channel.port1.close();resolve(data);};target.postMessage({type:'GET_LESSON_STATUS'},[channel.port2]);});}
export async function downloadLessons(ids,skipPaths,{signal,onProgress=()=>{}}={}){const target=navigator.serviceWorker?.controller;if(!target)throw new Error('请先等待纯文字离线准备完成，再下载视频');if(signal?.aborted)throw new DOMException('Cancelled','AbortError');return new Promise((resolve,reject)=>{const channel=new MessageChannel(),jobId=crypto.randomUUID();let error;const abort=()=>target.postMessage({type:'CANCEL_LESSON_DOWNLOAD',jobId});signal?.addEventListener('abort',abort,{once:true});const finish=()=>{signal?.removeEventListener('abort',abort);channel.port1.close();};channel.port1.onmessage=({data})=>{if(data.type==='LESSON_DOWNLOAD_PROGRESS')onProgress({phase:'batch',completed:data.completed,total:data.requested,readyId:data.readyId,generation:data.generation});else if(data.type==='LESSON_DOWNLOAD_ERROR'){error=new Error(data.error||'下载失败');}else if(data.type==='LESSON_DOWNLOAD_DONE'){finish();if(data.cancelled)reject(new DOMException('Cancelled','AbortError'));else if(error)reject(error);else resolve(data);}};target.postMessage({type:'DOWNLOAD_LESSONS',jobId,ids,skipPaths},[channel.port2]);});}

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
