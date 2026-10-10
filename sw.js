/* GRE new-standard release. Shell installation is atomic; lesson downloads are separate. */
const BUILD='128';
// BEGIN GENERATED RELEASE POLICY
// Stable IDs identify progress/history; display ordinals never replace stored IDs.
const STANDARD_VERSION = 'gre-deep-20261010-v1';
const APPROVED_SEQUENCE = Object.freeze([175,176,177,178,179,180,181,182,183,184]);
const STORYBOOK_SAMPLE_SEQUENCE = Object.freeze([175,176,177,178,179]);
const STORYBOOK_BATCH_MODE = 'storybook-five-word-batches';
const STORYBOOK_ORDERED_MODE = 'storybook-reviewed-order';
const STORYBOOK_PRESERVED_IDS = Object.freeze([175,176,177,178,179,180,181,182,183,184,185,186,187,188,189]);
function isStorybookCatalog(raw) {
 const mode=raw?.learningRelease?.sampleMode;
 return mode==='storybook-first-five'||mode===STORYBOOK_BATCH_MODE||mode===STORYBOOK_ORDERED_MODE;
}
function validateStoryMedia(media) {
 if(!media||!Number.isSafeInteger(media.width)||media.width<=0||!Number.isSafeInteger(media.height)||media.height<=0||!Number.isFinite(media.durationMs)||media.durationMs<=0||typeof media.alt!=='string'||!media.alt.trim())throw new Error('Storybook media metadata missing');
 for(const [kind,extensions] of [['poster',/\.(png|webp|jpe?g|avif)$/i],['video',/\.(mp4|webm)$/i]]){
  const ref=media[kind];
  if(!ref||typeof ref.url!=='string'||!/^story-media\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+$/.test(ref.url)||!extensions.test(ref.url)||!/^[a-f0-9]{64}$/.test(ref.sha256)||!ref.url.split('/').at(-1).includes(ref.sha256)||!Number.isSafeInteger(ref.bytes)||ref.bytes<=0)throw new Error('Storybook media integrity reference missing');
 }
 if(media.poster.url===media.video.url)throw new Error('Storybook poster and video must be distinct');
 return media;
}
function gateCatalog(raw) {
 if(raw.schema!==1||!Array.isArray(raw.units)||!Array.isArray(raw.entries))throw new Error('Unsupported catalog');
 const policy=raw.learningRelease;
 if(!policy||policy.standardVersion!==STANDARD_VERSION||!Array.isArray(policy.approvedIds))throw new Error('New-standard release approval missing');
 if(policy.approvedIds.length&&policy.status!=='approved')throw new Error('Batch review not approved');
 const sample=policy.sampleMode==='storybook-first-five',batches=policy.sampleMode===STORYBOOK_BATCH_MODE,ordered=policy.sampleMode===STORYBOOK_ORDERED_MODE,storybook=isStorybookCatalog(raw);
 if(policy.sampleMode!==undefined&&!storybook)throw new Error('Unsupported sample mode');
 if(policy.batchSize!==((batches||ordered)?5:10))throw new Error('Incorrect release batch size');
 if(storybook){
  if(typeof raw.preview!=='boolean')throw new Error('Storybook preview state must be explicit');
  if(sample&&(policy.approvedIds.length!==5||policy.approvedIds.some((id,i)=>id!==STORYBOOK_SAMPLE_SEQUENCE[i])))throw new Error('Storybook sample must be exactly the first five stable IDs');
  // The hash-verified catalog is the explicit review ledger. Later five-word batches
  // need new approved metadata/assets, never a code edit that pre-approves future IDs.
  if(batches&&(!policy.approvedIds.length||policy.approvedIds.length%5!==0||policy.approvedIds.some((id,i)=>!Number.isSafeInteger(id)||id<1||id!==175+i)))throw new Error('Only complete reviewed five-word batches may be released');
  // A reviewed catalog declares learning order; canonical IDs remain storage identities.
  if(ordered&&(policy.approvedIds.length<STORYBOOK_PRESERVED_IDS.length||policy.approvedIds.length%5!==0||STORYBOOK_PRESERVED_IDS.some((id,i)=>policy.approvedIds[i]!==id)||policy.approvedIds.some(id=>!Number.isSafeInteger(id)||id<1)||new Set(policy.approvedIds).size!==policy.approvedIds.length))throw new Error('Only complete uniquely ordered reviewed batches may be released');
  if(policy.mediaStatus!=='approved'&&!(raw.preview===true&&policy.mediaStatus==='pending'))throw new Error('Storybook media review not approved');
 }else if(policy.approvedIds.length%10!==0||policy.approvedIds.some((id,i)=>id!==APPROVED_SEQUENCE[i]))throw new Error('Only complete approved batches may be released');
 const seen=new Set();
 for(const entry of raw.entries){if(seen.has(entry.number))throw new Error('Duplicate canonical ID');seen.add(entry.number);}
 const entries=policy.approvedIds.map((id,i)=>{
  const entry=raw.entries.find(item=>item.number===id);
  if(!entry||entry.standardVersion!==STANDARD_VERSION||entry.reviewStatus!=='approved'||entry.textApproved!==true||entry.artApproved!==true||entry.displayOrdinal!==i+1)throw new Error('Lesson is not new-standard approved');
  const unit=raw.units[entry.unit];
  if(!Number.isSafeInteger(entry.unit)||entry.unit<0||!unit||typeof unit.url!=='string'||!/^units\/[A-Za-z0-9_-]+\.json$/.test(unit.url)||!/^[a-f0-9]{64}$/.test(unit.sha256)||!unit.url.endsWith('-'+unit.sha256+'.json')||!Number.isSafeInteger(unit.bytes)||unit.bytes<=0||(!storybook&&(!/^[a-f0-9]{64}$/.test(entry.art?.sha256)||!Number.isSafeInteger(entry.art?.bytes)||entry.art.bytes<=0)))throw new Error('Approved lesson assets missing');
  if(storybook&&(batches||ordered||policy.mediaStatus==='approved'||entry.storyMedia))validateStoryMedia(entry.storyMedia);
  return entry;
 });
 const integrityRefs=new Map(),digestBytes=new Map();
 for(const entry of entries){
  const refs=[raw.units[entry.unit],...(entry.storyMedia?[entry.storyMedia.poster,entry.storyMedia.video]:[])];
  for(const ref of refs){
   const prior=integrityRefs.get(ref.url);
   if(prior&&(prior.sha256!==ref.sha256||prior.bytes!==ref.bytes))throw new Error('Conflicting integrity declarations for one asset URL');
   if(digestBytes.has(ref.sha256)&&digestBytes.get(ref.sha256)!==ref.bytes)throw new Error('Conflicting byte counts for one content hash');
   integrityRefs.set(ref.url,ref);
   digestBytes.set(ref.sha256,ref.bytes);
  }
 }
 let libraryTarget=4679;
 if(Object.hasOwn(policy,'libraryPlan')){
  const plan=policy.libraryPlan;
  if(!ordered||!plan||typeof plan!=='object'||Array.isArray(plan)||Object.keys(plan).length!==2||plan.version!=='canonical-4731-20261010-v1'||plan.sha256!=='cf9a48c71ebcb346315c78c2da6bcda089e24473ae0f1caef86f7805bf9caa3c')throw new Error('Unsupported approved library plan');
  libraryTarget=4731;
 }
 if(raw.publishedCount!==entries.length||raw.authoredCount!==entries.length||raw.libraryTarget!==libraryTarget)throw new Error('Incorrect published lesson count');
 return {...raw,entries};
}
// END GENERATED RELEASE POLICY
// Generated by build-shell.mjs; SW is intentionally outside this non-cyclic hash list.
const SHELL_ASSETS = [{"url":"index.html","bytes":3027,"sha256":"ad4821e47f5944fd7e978346e6f73444288d7bf5e1a22bf6b2728c4eeaa6b30b"},{"url":"manifest.webmanifest","bytes":642,"sha256":"a14797d54dab8085da725e9c3fca00656c04305783517ca773eaeb0396b61532"},{"url":"icon-192-v2.png","bytes":47430,"sha256":"6e52c5115cb2e79148cf5e9df857568936987d1a9211907b9ccb10267970575b"},{"url":"gre-learning/update.js","bytes":2647,"sha256":"f56f6ea82bcb1d91142374abb533c2b71458b6369d2d9fdd12534956b98fc6c9"},{"url":"gre-learning/app.js","bytes":7298,"sha256":"950dce380ebbe6f75ef3e06bbbdfe102c846a37390750017544d10d29337aeac"},{"url":"gre-learning/catalog.json","bytes":33583,"sha256":"c3450ec9c72c681aff1afc7b031a7ed46d3f5b02bb40d87c7fb1872e6cbc93db"},{"url":"gre-learning/lesson-loader.js","bytes":7823,"sha256":"4a00f1b41dfe76a6b8e597ffdb1b04ebd77356a692758c5963b5fd29ef7f0be0"},{"url":"gre-learning/schema.js","bytes":4701,"sha256":"54b7754ba4706802e4dbd5ba472c8405883543c7379c83f6ace232394dc369c3"},{"url":"gre-learning/render.js","bytes":3744,"sha256":"f30225576b9d70d08df7a65f8c3d17b61d4de1d49989f11be297e17ea5b11341"},{"url":"gre-learning/model.js","bytes":691,"sha256":"62a63f1c81135c717aa1f0b7c4b75a5b0dbf9d12efdfd16db28c35bf85ee900e"},{"url":"gre-learning/swipe.js","bytes":20176,"sha256":"78d8332ac4be5417f007684f9c2e483e93947b394e493260256fc656c3f07768"},{"url":"gre-learning/motion.js","bytes":9296,"sha256":"11658380458992bc1754740baeb511b78eb897c4c09e392fdf86360e1c7e97b7"},{"url":"gre-learning/view.js","bytes":4516,"sha256":"ab27638e11a36bdb3356b4c0ea8cb7bc2b0b407e41a85af489e89664a3ce2f1e"},{"url":"gre-learning/motion-tracks.js","bytes":12138,"sha256":"c4fa72ae0cc4d0e91c458cd7174ba4a1ba23a7d935f352fc8cbeb583391b10fd"},{"url":"gre-learning/release-policy.js","bytes":6278,"sha256":"e6bc3cca7a36c7789b664399cc9aaa66cab458a9e6315260821bdfd724b37bb0"},{"url":"gre-learning/scene-glosses.js","bytes":1081,"sha256":"a7daf7e27fdc8323724cccf3374e76b29e2a2dd69d6ec19c3febea245b2eed6b"},{"url":"icon-512-v2.png","bytes":298790,"sha256":"65508f5707903f370f3f89402f5c48ade1d4c70b4fdd1ac8dff532f396c0a9ff"},{"url":"gre-learning/story-media.js","bytes":6410,"sha256":"0fcd838883146cbc46361f7889cafd0fde5262208da054ebfc79c7f430d23896"},{"url":"gre-learning/storybook.css","bytes":29226,"sha256":"2b30e14c23a9852a133276773c2190ac01235082c5052c3b7943f2966e157a72"},{"url":"gre-learning/bookmark-navigation.js","bytes":4623,"sha256":"b82eb716c3819653467341580cd6d5172d33b3f7ddb97d1361d0819eaf7eb979"}];
const scope=new URL('./',self.location.href);
const SHELL_PREFIX='gre-scalable-shell-'+encodeURIComponent(scope.pathname)+'-';
const SHELL=SHELL_PREFIX+BUILD;
const UNITS='gre-scalable-verified-units-v1';
const resolve=path=>new URL(path,scope).href;
const excluded=url=>{const path=url.pathname.slice(scope.pathname.length);return /^(skyhouse|skyhouse-source)(\/|$)/.test(path);};
let catalogPromise;
async function verify(response,ref){if(!response?.ok)throw new Error('Resource unavailable');const bytes=await response.clone().arrayBuffer();if(bytes.byteLength!==ref.bytes)throw new Error('Resource size mismatch');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==ref.sha256)throw new Error('Resource hash mismatch');return response;}
const shellRef=url=>SHELL_ASSETS.find(ref=>resolve(ref.url)===url);
async function shellReady(){
 try{const cache=await caches.open(SHELL);for(const ref of SHELL_ASSETS)await verify(await cache.match(resolve(ref.url)),ref);return SHELL_ASSETS.length>0;}catch{return false;}
}
async function shellResponse(ref,{repair=true,requirePersistence=false}={}){
 const url=resolve(ref.url);let cache,cached;
 try{cache=await caches.open(SHELL);cached=await cache.match(url);}catch{}
 if(cached){try{return await verify(cached,ref);}catch{}}
 if(!repair)throw new Error('Shell asset is missing or corrupt');
 // Do not overwrite anything until the exact build bytes pass verification.
 const response=await fetch(url,{cache:'reload'});await verify(response,ref);
 try{if(!cache)throw new Error('Shell storage unavailable');await cache.put(url,response.clone());}
 catch(error){if(requirePersistence)throw error;}
 return response;
}
async function catalog({repair=true}={}){
 if(!catalogPromise){catalogPromise=(async()=>{const response=await shellResponse(shellRef(resolve('gre-learning/catalog.json')),{repair});const raw=await response.json();if(raw.preview===true)throw new Error('Preview catalog cannot be installed');return gateCatalog(raw);})();catalogPromise.catch(()=>{catalogPromise=null;});}
 return catalogPromise;
}
const pairRefs=(entry,data)=>[data.units[entry.unit],...(isStorybookCatalog(data)?[entry.storyMedia.poster,entry.storyMedia.video]:[{...entry.art,url:`art-units/${entry.number}-${entry.art.sha256}.json`}])];
async function refs(){const data=await catalog();const map=new Map();for(const entry of data.entries)for(const ref of pairRefs(entry,data))map.set(resolve('gre-learning/'+ref.url),ref);return map;}
async function broadcast(data){for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){const url=new URL(client.url);if(url.origin===scope.origin&&url.pathname.startsWith(scope.pathname)&&!excluded(url))client.postMessage(data);}}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch(resolve('gre-learning/shell-manifest.json'),{cache:'no-store'});
 if(!response.ok)throw new Error('Shell manifest unavailable');
 const manifest=await response.json();
 if(manifest.build!==BUILD)throw new Error('Shell build mismatch');
 if(JSON.stringify(manifest.assets)!==JSON.stringify(SHELL_ASSETS))throw new Error('Untrusted shell manifest');
 // Reject an internal preview before writing even one shell file. This also keeps
 // an accidental same-build development install from overwriting the old shell.
 const catalogRef=shellRef(resolve('gre-learning/catalog.json'));
 const catalogResponse=await fetch(resolve('gre-learning/catalog.json'),{cache:'reload'});
 await verify(catalogResponse,catalogRef);
 const candidateCatalog=await catalogResponse.json();
 if(candidateCatalog.preview===true)throw new Error('Preview catalog cannot be installed');
 gateCatalog(candidateCatalog);
 // New builds and same-build repairs share this verified path. Failed repairs keep every
 // still-valid asset and the preceding complete generation. Partial caches never mean ready.
 for(const ref of SHELL_ASSETS)await shellResponse(ref,{requirePersistence:true});
 if(!await shellReady())throw new Error('Incomplete shell');
 await catalog({repair:false}); // Validate sample approval before committing an install-ready marker.
 await(await caches.open(SHELL)).put(resolve('__shell_ready__'),new Response(BUILD));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 if(!await shellReady())throw new Error('Incomplete shell');
 const names=(await caches.keys()).filter(name=>name.startsWith(SHELL_PREFIX)&&name!==SHELL);
 const complete=[];for(const name of names){if(await(await caches.open(name)).match(resolve('__shell_ready__')))complete.push(name);}
 const previous=complete.at(-1);for(const name of names)if(name!==previous)await caches.delete(name);
 await self.clients.claim();await broadcast({type:'SHELL_READY',build:BUILD});
})()));
async function unitResponse(request,ref){let cache,cached;try{cache=await caches.open(UNITS);cached=await cache.match(request.url);}catch{}if(cached){try{return await verify(cached,ref);}catch{try{await cache.delete(request.url);}catch{}}}
 // No stale-version substitution: the old paired lesson remains intact for its old shell.
 const response=await fetch(request);await verify(response,ref);
 // Storage quota/private-mode failure must not block a valid live lesson. Readiness remains false.
 if(cache){try{await cache.put(request.url,response.clone());}catch{}}return response;
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||excluded(url))return;
 if(/\/gre-learning\/(units|art-units|story-media)\//.test(url.pathname)){
  event.respondWith((async()=>{const ref=(await refs()).get(url.href);if(!ref)return new Response('Unknown lesson unit',{status:404});try{return await unitResponse(request,ref);}catch{return new Response('Lesson unavailable offline or failed integrity validation',{status:503});}})());return;
 }
 event.respondWith((async()=>{const assetURL=new URL(request.url);assetURL.search='';const key=request.mode==='navigate'?resolve('index.html'):assetURL.href;const ref=shellRef(key);if(!ref)return fetch(request);try{return await shellResponse(ref);}catch{return new Response('Verified application shell unavailable; reconnect and retry',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
async function lessonStatus(){let cache;try{cache=await caches.open(UNITS);}catch{}const shellIsReady=await shellReady();let data;try{data=await catalog({repair:false});}catch{return {type:'LESSON_STATUS',build:BUILD,shellReady:false,readyIds:[],readyCount:0,availableCount:null,libraryTarget:4731,wholeTargetReady:false,error:'Verified lesson index unavailable'};}const ready=[],checked=new Map();const check=ref=>{const url=resolve('gre-learning/'+ref.url),key=url+'|'+ref.sha256+'|'+ref.bytes;if(!checked.has(key))checked.set(key,(async()=>{try{await verify(await cache?.match(url),ref);return true;}catch{return false;}})());return checked.get(key);};for(const entry of data.entries){let complete=true;for(const ref of pairRefs(entry,data)){if(!await check(ref)){complete=false;break;}}if(complete)ready.push(entry.number);}return {type:'LESSON_STATUS',build:BUILD,shellReady:shellIsReady,readyIds:ready,readyCount:ready.length,availableCount:data.entries.length,libraryTarget:data.libraryTarget,wholeTargetReady:shellIsReady&&ready.length===data.libraryTarget};}
self.addEventListener('message',event=>{
 const type=event.data?.type;
 if(type==='GET_BUILD'){event.ports[0]?.postMessage({type:'APP_BUILD',build:BUILD});return;}
 if(type==='SKIP_WAITING'){self.skipWaiting();return;}
 if(type==='GET_LESSON_STATUS')event.waitUntil(lessonStatus().then(value=>event.ports[0]?.postMessage(value)));
 // Explicit request only, with progress on fully verified text+art or text+poster+video sets. A partial download is never ready.
 if(type==='DOWNLOAD_LESSONS')event.waitUntil((async()=>{const data=await catalog();const requested=[...new Set(event.data.ids||[])].slice(0,data.entries.length);let completed=0;for(const id of requested){const entry=data.entries.find(item=>item.number===id);if(!entry)continue;try{for(const ref of pairRefs(entry,data)){const url=resolve('gre-learning/'+ref.url);await unitResponse(new Request(url),ref);await verify(await(await caches.open(UNITS)).match(url),ref);}completed++;event.ports[0]?.postMessage({type:'LESSON_DOWNLOAD_PROGRESS',completed,requested:requested.length});}catch{event.ports[0]?.postMessage({type:'LESSON_DOWNLOAD_ERROR',number:id,completed});}}event.ports[0]?.postMessage(await lessonStatus());})());
});
