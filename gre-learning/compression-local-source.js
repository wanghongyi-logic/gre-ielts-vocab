import {sha256,abortCheck} from './compression-preview.js';
const DB='gre-offline-pack-index-v1',DIR='gre-offline-packs-v1',CACHE='gre-scalable-verified-units-v1';
const roles=new Set(['video','poster','staticPoster']);
export const sourceIdentity=item=>JSON.stringify([item.path,item.sha256,item.bytes]);
function valid(item){return typeof item.path==='string'&&item.path.startsWith('gre-learning/story-media/')&&!item.path.includes('..')&&/^[a-f0-9]{64}$/.test(item.sha256)&&Number.isSafeInteger(item.bytes)&&item.bytes>0&&roles.has(item.role);}
async function readPacks(){
 if(!globalThis.indexedDB)return [];
 if(indexedDB.databases&&!(await indexedDB.databases()).some(db=>db.name===DB))return [];
 return new Promise((resolve,reject)=>{let created=false;const request=indexedDB.open(DB),timer=setTimeout(()=>reject(new Error('读取本机书库超时')),5000);request.onupgradeneeded=()=>{created=true;request.transaction.abort();};request.onerror=()=>{clearTimeout(timer);created?resolve([]):reject(request.error);};request.onsuccess=()=>{const db=request.result;if(!db.objectStoreNames.contains('packs')){clearTimeout(timer);db.close();reject(new Error('未知的本机书库格式'));return;}const tx=db.transaction('packs','readonly'),get=tx.objectStore('packs').getAll();let result;get.onsuccess=()=>{result=get.result;};tx.oncomplete=()=>{clearTimeout(timer);db.close();resolve(result);};tx.onerror=()=>{clearTimeout(timer);db.close();reject(tx.error);};};});
}
export async function listLocalMedia(catalog,{signal,baseURL=new URL('../',import.meta.url)}={}){
 abortCheck(signal);const items=new Map(),packs=await readPacks();abortCheck(signal);
 for(const pack of packs)for(const file of pack.files||[]){const item={...file,wordId:file.wordId,packName:pack.name,packBytes:pack.bytes,storage:'opfs'};if(valid(item)&&!items.has(sourceIdentity(item)))items.set(sourceIdentity(item),item);}
 if(globalThis.caches&&await caches.has(CACHE)){const cache=await caches.open(CACHE),urls=new Set((await cache.keys()).map(r=>r.url));for(const entry of catalog?.entries||[])for(const role of roles){const ref=entry.storyMedia?.[role];if(!ref)continue;const item={path:'gre-learning/'+ref.url,sha256:ref.sha256,bytes:ref.bytes,wordId:entry.number,role,storage:'cache'};if(valid(item)&&urls.has(new URL(item.path,baseURL).href)&&!items.has(sourceIdentity(item)))items.set(sourceIdentity(item),item);}}
 abortCheck(signal);return [...items.values()];
}
export async function readLocalSource(item,signal,{baseURL=new URL('../',import.meta.url)}={}){
 abortCheck(signal);if(!valid(item))throw new Error('无效的本机媒体身份');if(item.bytes>32*1024*1024)throw new Error('原文件超过 32 MB，预览已跳过');let blob;
 if(item.storage==='opfs'){
  const root=await navigator.storage.getDirectory(),dir=await root.getDirectoryHandle(DIR),handle=await dir.getFileHandle(item.packName),file=await handle.getFile();if(file.size!==item.packBytes||!Number.isSafeInteger(item.start)||item.start<0||item.start+item.bytes>file.size)throw new Error('本机书包已变化，请重新扫描');blob=file.slice(item.start,item.start+item.bytes,item.role==='video'?'video/mp4':item.path.endsWith('.png')?'image/png':item.path.endsWith('.webp')?'image/webp':'image/jpeg');
 }else if(item.storage==='cache'){
  if(!await caches.has(CACHE))return null;const response=await(await caches.open(CACHE)).match(new URL(item.path,baseURL));if(!response?.ok)return null;blob=await response.blob();
 }else throw new Error('不支持的本机资源位置');
 abortCheck(signal);if(blob.size!==item.bytes||await sha256(blob)!==item.sha256)throw new Error('本机原文件校验失败，已跳过');abortCheck(signal);return blob;
}
