import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
import {LessonLoader,expandCatalog} from '../gre-learning/lesson-loader.js';
import {optionalMediaGroups} from '../gre-learning/offline-batch.js';
const root=new URL('../',import.meta.url),catalog=expandCatalog(JSON.parse(await readFile(new URL('gre-learning/catalog.json',root))));
const origin='https://optional.test/',baseURL=new URL('gre-learning/',origin);
const file=url=>readFile(new URL(new URL(url).pathname.slice(1),root));
test('51–210 default reading and adjacent preparation request text only',async()=>{
 let mediaCalls=0;const loader=new LessonLoader(catalog,{baseURL,cacheStorage:null,fetcher:async url=>{if(url.pathname.includes('story-media'))mediaCalls++;return new Response(await file(url));}});
 for(const meta of catalog.entries.slice(50)){const pair=await loader.pair(meta.number);assert.equal(pair.media,null);assert.equal(pair.entry.word,meta.word);}
 assert.equal(mediaCalls,0);loader.destroy();
});
test('local posters, videos and static posters display after app update with no remote request',async()=>{
 const original=catalog.entries.find(e=>e.displayOrdinal>50&&e.storyMedia.staticPoster),meta={...original,storyMedia:{...original.storyMedia}},disk=new Map();
 for(const role of ['poster','video','staticPoster']){const bytes=Buffer.from('synthetic verified local '+role),sha256=createHash('sha256').update(bytes).digest('hex'),ref={...meta.storyMedia[role],sha256,bytes:bytes.length};meta.storyMedia[role]=ref;disk.set(new URL(ref.url,baseURL).href,bytes);}
 const localCatalog={...catalog,entries:catalog.entries.map(entry=>entry===original?meta:entry)};
 for(let update=0;update<2;update++){
  const loader=new LessonLoader(localCatalog,{baseURL,cacheStorage:{open:async()=>({match:async url=>disk.has(url)?new Response(disk.get(url)):undefined,put:async()=>{}})},fetcher:async url=>{assert.ok(!url.pathname.includes('story-media'));return new Response(await file(url));}});
  const pair=await loader.pair(meta.number);for(const key of ['posterURL','videoURL','staticPosterURL'])assert.match(pair.media[key],/^blob:/);loader.destroy();
 }
});
test('corrupt optional local media stays hidden and cannot fall back to network',async()=>{
 const loader=new LessonLoader(catalog,{baseURL,cacheStorage:{open:async()=>({match:async()=>new Response('corrupt'),put:async()=>{}})},fetcher:async url=>{assert.ok(!url.pathname.includes('story-media'));return new Response(await file(url));}});
 assert.equal((await loader.pair(catalog.entries[50].number)).media,null);loader.destroy();
});
test('download groups include all current published 1–210 refs, including static posters',()=>{
 const groups=optionalMediaGroups(catalog);assert.deepEqual(groups.map(group=>group.hostedAvailable),[true,false,false,false,false]);assert.deepEqual(groups.map(g=>[g.start,g.end,g.ids.length]),[[1,50,50],[51,100,50],[101,150,50],[151,200,50],[201,210,10]]);
 const bytesFor=entries=>[...new Map(entries.flatMap(entry=>['poster','video','staticPoster'].map(role=>entry.storyMedia?.[role]).filter(Boolean)).map(ref=>[ref.url,ref])).values()].reduce((sum,ref)=>sum+ref.bytes,0);
 assert.equal(groups[0].bytes,bytesFor(catalog.entries.slice(0,50)));
 assert.equal(groups[0].ids[0],catalog.entries[0].number);assert.notEqual(groups[0].ids[0],1,'display range is distinct from vocabulary IDs');
 assert.equal(groups.reduce((n,g)=>n+g.bytes,0),bytesFor(catalog.entries));
});
function worker(){
 const listeners={},maps=new Map(),requests=[];let fail=false;
 const key=r=>typeof r==='string'?r:r.url;
 const caches={open:async name=>{if(!maps.has(name))maps.set(name,new Map());const m=maps.get(name);return {match:async r=>m.get(key(r))?.clone(),put:async(r,s)=>m.set(key(r),s.clone()),delete:async r=>m.delete(key(r)),keys:async()=>[...m.keys()].map(url=>new Request(url))};},keys:async()=>[...maps.keys()],delete:async name=>maps.delete(name)};
 const ctx=vm.createContext({self:{location:{href:origin+'sw.js'},addEventListener:(type,fn)=>listeners[type]=fn,clients:{claim:async()=>{},matchAll:async()=>[]}},caches,crypto:webcrypto,Response,Request,URL,AbortController,DOMException,Map,Set,setTimeout,clearTimeout,fetch:async req=>{requests.push(key(req));if(fail)return new Response('failure',{status:503});return new Response(await file(key(req)));}});
 return {ctx,requests,maps,setFail:value=>fail=value,load:async()=>vm.runInContext(await readFile(new URL('sw.js',root),'utf8'),ctx),fetch:async url=>{let p;listeners.fetch({request:new Request(url),respondWith:x=>p=x});return p;},message:async(data,onMessage)=>{const messages=[];let p;listeners.message({data,ports:[{postMessage:value=>{messages.push(value);onMessage?.(value);}}],waitUntil:x=>p=x});await p;return messages;}};
}
test('retired optional GET and explicit download both avoid network; clear prevents refetch',async()=>{
 const w=worker();await w.load();const meta=catalog.entries[50],url=new URL(meta.storyMedia.video.url,baseURL).href;
 assert.equal((await w.fetch(url)).status,404);assert.ok(!w.requests.includes(url));
 let results=await w.message({type:'DOWNLOAD_LESSONS',jobId:'one',ids:[meta.number],skipPaths:[]});assert.equal(results.at(-1).completed,0);assert.ok(results.some(m=>m.type==='LESSON_DOWNLOAD_ERROR'&&m.error.includes('资源包')));assert.ok(!w.requests.includes(url));
 const calls=w.requests.length;assert.equal((await w.fetch(url)).status,404);assert.equal(w.requests.length,calls);
 await w.message({type:'PAUSE_AND_CLEAR_MEDIA'});assert.equal((await w.fetch(url)).status,404);assert.equal(w.requests.length,calls);
 await w.message({type:'RESUME_MEDIA_SAVE'});assert.equal((await w.fetch(url)).status,404);assert.equal(w.requests.length,calls);
 w.setFail(true);results=await w.message({type:'DOWNLOAD_LESSONS',jobId:'error',ids:[meta.number]});assert.ok(results.some(m=>m.type==='LESSON_DOWNLOAD_ERROR'));assert.equal(results.at(-1).type,'LESSON_DOWNLOAD_DONE');
});
test('live activation retries deferred preparation after closing settings or opening contents',async()=>{
 const source=await readFile(new URL('gre-learning/app.js',root),'utf8');const block=source.slice(source.indexOf('function refreshLibrary(){'),source.indexOf("window.addEventListener('gre-clear-library'"));
 for(const interruptedStage of ['destroy','render']){
  let handler,release,destroyed=0,renders=0;const ctx=vm.createContext({window:{addEventListener:(name,fn)=>handler=fn},renderGeneration:1,libraryRevision:0,renderedLibraryRevision:0,libraryRefreshEpoch:0,libraryRefreshJob:null,contents:{whenSettled:async()=>{}},swipe:{cancel(){}},loader:{cancel(){}},pages:{destroy(){destroyed++;return interruptedStage==='destroy'&&destroyed===1?new Promise(resolve=>release=resolve):Promise.resolve();}},render:async options=>{assert.equal(options.preserveScroll,true);ctx.renderGeneration++;renders++;if(interruptedStage==='render'&&renders===1)await new Promise(resolve=>release=resolve);else ctx.renderedLibraryRevision=ctx.libraryRevision;}});
  vm.runInContext(block,ctx);const event={detail:{waits:[]}};handler(event);while(!release)await new Promise(r=>setImmediate(r));ctx.renderGeneration++;release();await Promise.all(event.detail.waits);
  assert.equal(ctx.renderedLibraryRevision,1);assert.equal(destroyed,2,'frontmatter invalidation must retry, never retain stale text-only DOM');
 }
 assert.match(source,/preserveScroll&&selectedNumber===number\?window.scrollY:0/,'only the same word retains current live scroll; a new destination opens at top');
 assert.ok(source.indexOf('const scrollPosition=')>source.indexOf('const adopt=()=>{'),'scroll is captured at adoption, not before async media preparation');
 assert.ok(!block.includes('location.reload'));
});
test('library activation yields permanently to clear and does not spin after stable preparation failure',async()=>{
 const source=await readFile(new URL('gre-learning/app.js',root),'utf8'),block=source.slice(source.indexOf('function refreshLibrary(){'),source.indexOf("window.addEventListener('gre-clear-library'"));
 let handler,release,renders=0;const ctx=vm.createContext({window:{addEventListener:(name,fn)=>handler=fn},renderGeneration:1,libraryRevision:0,renderedLibraryRevision:0,libraryRefreshEpoch:0,libraryRefreshJob:null,contents:{whenSettled:async()=>{}},swipe:{cancel(){}},loader:{cancel(){}},pages:{destroy:()=>new Promise(resolve=>release=resolve)},render:async()=>{renders++;ctx.renderGeneration++;}});vm.runInContext(block,ctx);
 let event={detail:{waits:[]}};handler(event);while(!release)await new Promise(r=>setImmediate(r));ctx.libraryRefreshEpoch++;release();await Promise.all(event.detail.waits);assert.equal(renders,0);
 release=null;event={detail:{waits:[]}};handler(event);while(!release)await new Promise(r=>setImmediate(r));release();await Promise.all(event.detail.waits);assert.equal(renders,1);assert.ok(ctx.renderedLibraryRevision<ctx.libraryRevision,'failed page stays pending for later route retry');
});

test('BFCache return retries an interrupted local-media activation',async()=>{
 const source=await readFile(new URL('gre-learning/app.js',root),'utf8'),block=source.slice(source.indexOf("window.addEventListener('pageshow'"),source.indexOf("route();window.dispatchEvent"));
 let handler,refreshes=0;const ctx=vm.createContext({window:{addEventListener:(name,fn)=>handler=fn},contents:{isRoute:()=>false},location:{hash:'#/learn/1'},picker:{open:false},current:{},selectedNumber:1,entries:[],remember(){},resolveWordNumber:()=>1,main:{removeAttribute(){}},watchChapters(){},motion:{setTurning(){}},pages:{adjacent(){}},renderedLibraryRevision:0,libraryRevision:1,refreshLibrary:()=>refreshes++,route(){throw Error('same-word BFCache return should preserve route')}});vm.runInContext(block,ctx);handler({persisted:true});assert.equal(refreshes,1);
});

test('first 50 keep automatic media saving; explicit group fills only missing cache and OPFS refs',async()=>{
 const w=worker();await w.load();const meta=catalog.entries.slice(0,50).find(entry=>entry.storyMedia.staticPoster)||catalog.entries[0];
 const posterURL=new URL(meta.storyMedia.poster.url,baseURL).href,videoURL=new URL(meta.storyMedia.video.url,baseURL).href;
 assert.equal((await w.fetch(posterURL)).status,200,'first-50 poster still saves automatically');assert.ok(w.requests.includes(posterURL));
 const calls=w.requests.length,skipPaths=['gre-learning/'+meta.storyMedia.video.url];
 const results=await w.message({type:'DOWNLOAD_LESSONS',jobId:'first50',ids:[meta.number],skipPaths});assert.equal(results.at(-1).completed,1);
 const fetched=w.requests.slice(calls);assert.ok(!fetched.includes(posterURL),'verified cache must not redownload');assert.ok(!fetched.includes(videoURL),'OPFS-covered video must not redownload');
 if(meta.storyMedia.staticPoster)assert.ok(fetched.includes(new URL(meta.storyMedia.staticPoster.url,baseURL).href),'missing static poster is included');
 const after=w.requests.length;await w.message({type:'DOWNLOAD_LESSONS',jobId:'first50-repeat',ids:[meta.number],skipPaths});assert.equal(w.requests.length,after,'repeat download fills no already-saved bytes');
});

test('direct loader media calls cannot bypass retired hosting policy',async()=>{
 const loader=new LessonLoader(catalog,{baseURL,cacheStorage:null,fetcher:()=>{throw new Error('retired media must never fetch');}});
 for(const ref of [catalog.entries[50].storyMedia.poster,catalog.entries[50].storyMedia.video])assert.equal(await loader.mediaResource(ref,undefined,'high',true),null);
 loader.destroy();
});

test('selective first-group clear blocks automatic worker fetch but permits an explicit re-download',async()=>{
 const w=worker();await w.load();const meta=catalog.entries[0],url=new URL(meta.storyMedia.poster.url,baseURL).href;
 assert.equal((await w.fetch(url)).status,200);
 w.ctx.selectedURL=url;await vm.runInContext("mediaControl.selectiveClear([selectedURL],async()=>{await(await caches.open(UNITS)).delete(selectedURL);})",w.ctx);
 const before=w.requests.length;assert.equal((await w.fetch(url)).status,404);assert.equal(w.requests.length,before);
 const result=await w.message({type:'DOWNLOAD_LESSONS',jobId:'explicit-after-clear',ids:[meta.number]});assert.equal(result.at(-1).completed,1);assert.ok(!result.some(message=>message.type==='LESSON_DOWNLOAD_ERROR'));
 assert.equal((await w.fetch(url)).status,200,'saved bytes are usable despite automatic refill block');
});

test('worker emits committed word receipt only after every required media cache asset is verified',async()=>{
 const w=worker();await w.load();const meta=catalog.entries[0],media=[meta.storyMedia.video,meta.storyMedia.poster,meta.storyMedia.staticPoster].filter(Boolean);let receipts=0;
 const messages=await w.message({type:'DOWNLOAD_LESSONS',jobId:'ready-receipt',ids:[meta.number]},message=>{
  if(message.type!=='LESSON_DOWNLOAD_PROGRESS')return;receipts++;assert.equal(message.readyId,meta.number);assert.equal(message.generation,0);
  for(const ref of media)assert.ok(w.maps.get('gre-scalable-verified-units-v1').has(new URL(ref.url,baseURL).href));
 });assert.equal(receipts,1);assert.equal(messages.at(-1).completed,1);
});
test('saved poster with failed remaining video never emits a completed-word receipt',async()=>{
 const w=worker();await w.load();const meta=catalog.entries[0];assert.equal((await w.fetch(new URL(meta.storyMedia.poster.url,baseURL).href)).status,200);w.setFail(true);
 const messages=await w.message({type:'DOWNLOAD_LESSONS',jobId:'partial-no-receipt',ids:[meta.number]});assert.ok(messages.some(message=>message.type==='LESSON_DOWNLOAD_ERROR'));assert.ok(!messages.some(message=>message.type==='LESSON_DOWNLOAD_PROGRESS'));assert.equal(messages.at(-1).completed,0);
});
