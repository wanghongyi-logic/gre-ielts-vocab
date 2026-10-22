import {waitForLocal} from './offline-async.js';
const KEY='gre-storage-estimate-v1';
const bytes=value=>Number.isFinite(value)&&value>=0;
const size=value=>(value/1024/1024).toFixed(1)+' MB';
// Quota estimates cover the whole origin, including OPFS, IDB and CacheStorage.
// Never add a logical asset total or ZIP size to that estimate.
export function createStorageUsage({read=()=>globalThis.navigator?.storage?.estimate?.(),storage=()=>globalThis.localStorage,now=()=>Date.now(),timeoutMs=1500}={}){
 let last=null,pending=null;
 try{const value=JSON.parse(storage()?.getItem(KEY)||'null');if(bytes(value?.usage)&&Number.isFinite(value?.at)&&value.at>0&&value.at<=now())last=value;}catch{}
 return {async refresh(){
  // Share a genuinely stalled browser operation across retries, not just its
  // deadline wrapper. A late answer cannot overwrite a newer displayed result.
  if(!pending){const job=Promise.resolve().then(read);pending=job;job.then(()=>{if(pending===job)pending=null;},()=>{if(pending===job)pending=null;});}
  try{const value=await waitForLocal(pending,{timeoutMs});if(bytes(value?.usage)){
   last={usage:value.usage,at:now()};try{storage()?.setItem(KEY,JSON.stringify(last));}catch{}
   return {...last,kind:'estimate'};
  }}catch{}
  return last?{...last,kind:'last-known'}:{kind:'unknown'};
 }};
}
// This reuses the successful inventory already needed for saved-word counts.
// No media reads, hashing, CacheStorage traversal or new catalogue scan.
export function recordedStorage(library){
 const seen=new Set();let packedBytes=0,packCount=0;
 for(const pack of library.packs||[])if(pack.available&&typeof pack.name==='string'&&!seen.has(pack.name)&&bytes(pack.bytes)){seen.add(pack.name);packedBytes+=pack.bytes;packCount++;}
 return {packedBytes,packCount};
}
export function storageUsageText(result,recorded,cache){
 let text=result?.kind==='estimate'?`本站占用约 ${size(result.usage)}（浏览器估算）`:result?.kind==='last-known'?`本站占用约 ${size(result.usage)}（上次估算：${new Date(result.at).toLocaleString('zh-CN')}；本次未读到）`:'本站占用暂时未知（浏览器未提供读数）';
 if(recorded?.packCount)text+=` · ${recorded.stale?'上次核对':'已核对'}资源包文件 ${size(recorded.packedBytes)}（不含缓存与其他存储）`;
 if(cache?.count)text+=` · ${cache.stale?'上次':''}缓存媒体记录约 ${size(cache.logicalBytes)}（逻辑大小，非磁盘占用）`;
 return text;
}
// Build this once from the catalogue; refresh only visits cached keys. These
// are declared logical sizes, not quota/disk bytes or proof of full downloads.
export function cacheSizeIndex(catalog){
 const index=new Map();for(const entry of catalog.entries)for(const ref of [entry.storyMedia?.video,entry.storyMedia?.poster,entry.storyMedia?.staticPoster].filter(Boolean))if(bytes(ref.bytes))index.set('gre-learning/'+ref.url,ref.bytes);return index;
}
export function recordedCache(paths,index){
 let logicalBytes=0,count=0;for(const path of new Set(paths))if(index.has(path)){logicalBytes+=index.get(path);count++;}return {logicalBytes,count};
}
