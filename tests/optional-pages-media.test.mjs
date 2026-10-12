import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
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
 const meta=catalog.entries.find(e=>e.displayOrdinal>50&&e.storyMedia.staticPoster),disk=new Map();
 for(const ref of [meta.storyMedia.poster,meta.storyMedia.video,meta.storyMedia.staticPoster])disk.set(new URL(ref.url,baseURL).href,await file(new URL(ref.url,baseURL)));
 for(let update=0;update<2;update++){
  const loader=new LessonLoader(catalog,{baseURL,cacheStorage:{open:async()=>({match:async url=>disk.has(url)?new Response(disk.get(url)):undefined,put:async()=>{}})},fetcher:async url=>{assert.ok(!url.pathname.includes('story-media'));return new Response(await file(url));}});
  const pair=await loader.pair(meta.number);for(const key of ['posterURL','videoURL','staticPosterURL'])assert.match(pair.media[key],/^blob:/);loader.destroy();
 }
});
test('corrupt optional local media stays hidden and cannot fall back to network',async()=>{
 const loader=new LessonLoader(catalog,{baseURL,cacheStorage:{open:async()=>({match:async()=>new Response('corrupt'),put:async()=>{}})},fetcher:async url=>{assert.ok(!url.pathname.includes('story-media'));return new Response(await file(url));}});
 assert.equal((await loader.pair(catalog.entries[50].number)).media,null);loader.destroy();
});
test('download groups contain only current published 51+ refs, including static posters',()=>{
 const groups=optionalMediaGroups(catalog);assert.deepEqual(groups.map(g=>[g.start,g.end,g.ids.length]),[[51,100,50],[101,150,50],[151,200,50],[201,210,10]]);
 assert.equal(groups.reduce((n,g)=>n+g.bytes,0),506117138);
});
function worker(){
 const listeners={},maps=new Map(),requests=[];let fail=false;
 const key=r=>typeof r==='string'?r:r.url;
 const caches={open:async name=>{if(!maps.has(name))maps.set(name,new Map());const m=maps.get(name);return {match:async r=>m.get(key(r))?.clone(),put:async(r,s)=>m.set(key(r),s.clone()),delete:async r=>m.delete(key(r)),keys:async()=>[...m.keys()].map(url=>new Request(url))};},keys:async()=>[...maps.keys()],delete:async name=>maps.delete(name)};
 const ctx=vm.createContext({self:{location:{href:origin+'sw.js'},addEventListener:(type,fn)=>listeners[type]=fn,clients:{claim:async()=>{},matchAll:async()=>[]}},caches,crypto:webcrypto,Response,Request,URL,AbortController,DOMException,Map,Set,setTimeout,clearTimeout,fetch:async req=>{requests.push(key(req));if(fail)return new Response('failure',{status:503});return new Response(await file(key(req)));}});
 return {requests,maps,setFail:value=>fail=value,load:async()=>vm.runInContext(await readFile(new URL('sw.js',root),'utf8'),ctx),fetch:async url=>{let p;listeners.fetch({request:new Request(url),respondWith:x=>p=x});return p;},message:async data=>{const messages=[];let p;listeners.message({data,ports:[{postMessage:value=>messages.push(value)}],waitUntil:x=>p=x});await p;return messages;}};
}
test('worker blocks optional GET misses; explicit download verifies and persists; clear prevents refetch',async()=>{
 const w=worker();await w.load();const meta=catalog.entries[50],url=new URL(meta.storyMedia.video.url,baseURL).href;
 assert.equal((await w.fetch(url)).status,404);assert.ok(!w.requests.includes(url));
 let results=await w.message({type:'DOWNLOAD_LESSONS',jobId:'one',ids:[meta.number],skipPaths:[]});assert.equal(results.at(-1).completed,1);assert.equal(results.at(-1).cancelled,false);assert.ok(w.requests.includes(url));
 const calls=w.requests.length;assert.equal((await w.fetch(url)).status,200);assert.equal(w.requests.length,calls);
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
