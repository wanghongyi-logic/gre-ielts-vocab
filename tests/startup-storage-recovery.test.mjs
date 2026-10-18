import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {waitForLocal} from '../gre-learning/offline-async.js';
import {batchStatus,downloadLessons} from '../gre-learning/offline-batch.js';
const pending=()=>new Promise(()=>{}),flush=()=>new Promise(r=>setImmediate(r));
function navigatorValue(value){Object.defineProperty(globalThis,'navigator',{configurable:true,value});}
test('saved-cache inventory works with no worker and never asks network or worker',async()=>{
 navigatorValue({});const hash='a'.repeat(64),root=new URL('../gre-learning/',import.meta.url).href;
 globalThis.caches={open:async()=>({keys:async()=>[{url:root+'story-media/'+hash+'.mp4'},{url:root+'story-media/unverified.mp4'},{url:'https://other/'+hash+'.mp4'}]})};
 assert.deepEqual((await batchStatus()).readyPaths,['gre-learning/story-media/'+hash+'.mp4']);
});
test('download cancellation settles even when worker never acknowledges',async()=>{
 const messages=[];navigatorValue({serviceWorker:{controller:{postMessage(message){messages.push(message);}}}});
 const controller=new AbortController(),job=downloadLessons([1],[],{signal:controller.signal});controller.abort();await assert.rejects(job,{name:'AbortError'});assert.deepEqual(messages.map(m=>m.type),['DOWNLOAD_LESSONS','CANCEL_LESSON_DOWNLOAD']);
});
test('download worker silence times out and requests cancellation',async()=>{
 const messages=[];navigatorValue({serviceWorker:{controller:{postMessage(message){messages.push(message);}}}});await assert.rejects(downloadLessons([1],[],{idleTimeoutMs:10}),/没有响应/);assert.equal(messages.at(-1).type,'CANCEL_LESSON_DOWNLOAD');
});
test('cancelled bridge ignores late progress receipts and done',async()=>{
 let port,progress=0;navigatorValue({serviceWorker:{controller:{postMessage(message,ports){if(ports)port=ports[0];}}}});const c=new AbortController(),job=downloadLessons([1],[],{signal:c.signal,onProgress:()=>progress++});c.abort();await assert.rejects(job,{name:'AbortError'});port.postMessage({type:'LESSON_DOWNLOAD_PROGRESS',readyId:1});port.postMessage({type:'LESSON_DOWNLOAD_DONE'});port.close();await flush();assert.equal(progress,0);
});
const source=await readFile(new URL('../gre-learning/offline-manager.js',import.meta.url),'utf8');
function operationHarness({choose=async()=>{},refresh=pending}={}){
 const node=()=>({hidden:false,disabled:false,textContent:'',value:'',removeAttribute(){}}),nodes=new Map();const get=key=>{if(!nodes.has(key))nodes.set(key,node());return nodes.get(key);};
 const target={progress:node(),cancel:node(),status:node()},context=vm.createContext({waitForLocal,AbortController,DOMException,Promise,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},controller:null,activeOperation:null,clearingThisPage:false,changingMode:false,mutating:false,filePickerOpen:false,host:{querySelector:get},input:node(),modeButton:node(),clean:node(),list:{querySelectorAll:()=>[]},importTarget:target,downloadRows:[{target}],refreshDownloads(){},queueSavedRefresh(){},refresh,chooseVideoMode:choose,sharedControl:{ticket:async()=>0,state:async()=>({paused:false,generation:0})},operationOptions:operation=>({signal:operation.controller.signal}),syncMutationControls(){},window:{dispatchEvent(){}}});
 const block=source.slice(source.indexOf(' async function run('),source.indexOf('\n input.onchange='));vm.runInContext(block,context);return {context,target};
}
test('a hanging inventory refresh never blocks a new download or its cancellation',async()=>{
 let started=false;const {context:c,target}=operationHarness();const job=c.run('download',target,()=>{started=true;return pending();});await flush();assert.equal(started,true);c.controller.abort();await job;assert.equal(c.controller,null);assert.equal(target.cancel.hidden,true);assert.equal(c.input.disabled,false);
});
test('cancel before preflight completion prevents action and old completion cannot clear newer operation',async()=>{
 let finish;let choices=0;const {context:c,target}=operationHarness({choose:()=>++choices===1?new Promise(r=>finish=r):Promise.resolve()});let oldActions=0;
 const old=c.run('download',target,()=>{oldActions++;return Promise.resolve({});});await flush();c.controller.abort();await old;
 const newer=c.run('download',target,pending);await flush();const current=c.controller;finish();await flush();assert.equal(oldActions,0);assert.equal(c.controller,current);assert.equal(c.input.disabled,true);current.abort();await newer;
});
test('read timeout settles caller and later rejection is consumed',async()=>{
 let reject;const job=waitForLocal(new Promise((_,r)=>reject=r),{timeoutMs:10});await assert.rejects(job,{name:'TimeoutError'});reject(Error('late'));await flush();
});
function inventoryHarness({inventory=async()=>({readyPaths:[]}),library=async()=>({readyIds:[1],total:2,packs:[]}),usage=pending,initial=[1,2]}={}){
 const writes=[],node={textContent:'',hidden:false,disabled:false,dataset:{},setAttribute(){},removeAttribute(){},querySelector(){return this;}};
 let context;context=vm.createContext({Promise,Error,OFFLINE_EDITION:'187-test',console:{warn(){}},setTimeout,clearTimeout,waitForLocal:(work,options)=>waitForLocal(work,{...options,timeoutMs:20}),refreshEpoch:0,cachedPaths:[],savedReadyIds:initial,savedTotal:2,catalog:{entries:[]},sharedControl:{state:async()=>({generation:0,phase:'active'})},readSavedInventory:inventory,inspectLibrary:library,storageStatus:usage,queueSavedRefresh(){},refreshDownloads(){},paintSavedTotals(){writes.push([...context.savedReadyIds]);},paintSavedPending(){throw Error('a previous verified count must stay visible');},list:{replaceChildren(){}},host:{querySelector:()=>node},bookmark:node,retryStorage:{hidden:true},space:{textContent:''},clean:{hidden:false},controller:null,clearingThisPage:false,changingMode:false,mutating:false,size:n=>String(n)});
 const block=source.slice(source.indexOf(' let inventoryFailures='),source.indexOf('\n const rangeSection='));vm.runInContext(block,context);return {context,writes};
}
test('usage estimate hang does not delay verified inventory or count',async()=>{
 const {context:c,writes}=inventoryHarness();await Promise.race([c.refresh(),new Promise((_,reject)=>setTimeout(()=>reject(Error('count blocked on estimate')),50))]);assert.deepEqual(writes,[[1]]);assert.equal(c.retryStorage.hidden,true);
});
test('inventory read timeout preserves previous verified snapshot and retry recovers',async()=>{
 let unavailable=true;const {context:c,writes}=inventoryHarness({inventory:()=>unavailable?waitForLocal(pending,{timeoutMs:10}):Promise.resolve({readyPaths:[]})});await c.refresh();assert.deepEqual(c.savedReadyIds,[1,2]);assert.equal(writes.length,0);assert.equal(c.retryStorage.hidden,false);unavailable=false;await c.refresh();assert.deepEqual(writes,[[1]]);assert.equal(c.retryStorage.hidden,true);
});
test('inventory refreshes share one read and require both cache and package inventory',async()=>{
 let reads=0;const {context:c,writes}=inventoryHarness({inventory:async()=>{reads++;return {readyPaths:[]};},library:()=>Promise.reject(Object.assign(Error('OPFS unavailable'),{name:'TimeoutError'}))});await Promise.all([c.refresh(),c.refresh(),c.refresh()]);assert.equal(reads,1);assert.equal(writes.length,0);assert.deepEqual(c.savedReadyIds,[1,2]);
});
test('a timed-out or closed IDB read resets its connection and a later read retries',async()=>{
 const packSource=await readFile(new URL('../gre-learning/offline-packs.js',import.meta.url),'utf8'),block=packSource.slice(packSource.indexOf('async function transaction('),packSource.indexOf('\nasync function directory'));
 let closes=0,opens=0,aborts=0;const contexts=[];const ctx=vm.createContext({Promise,waitForLocal:(work,options)=>waitForLocal(work,{...options,timeoutMs:10}),database:null,invalidateAssetIndex(){},db(){if(!ctx.database){opens++;const which=opens;ctx.database=Promise.resolve({close(){closes++;},transaction(){const tx={abort(){aborts++;}};contexts.push(tx);tx.objectStore=()=>({getAll(){const request={};if(which>1)setTimeout(()=>{request.result=['saved'];request.onsuccess();tx.oncomplete();},0);return request;}});return tx;}});}return ctx.database;}});vm.runInContext(block,ctx);
 await assert.rejects(ctx.transaction('readonly',s=>s.getAll()),{name:'TimeoutError'});assert.equal(ctx.database,null);assert.equal(aborts,1);assert.ok(closes>=1);assert.deepEqual(await ctx.transaction('readonly',s=>s.getAll()),['saved']);assert.equal(opens,2);
});
test('page preparation abort settles even if browser storage never resolves loader pair',async()=>{
 const raw=await readFile(new URL('../gre-learning/prepared-pages.js',import.meta.url),'utf8'),code=raw.replace(/^import .*;\n/gm,'').replace('export function','function');let expire;
 const ctx=vm.createContext({waitForLocal,Map,Set,Promise,AbortController,DOMException,neighboringNumbers:()=>({previous:null,next:null})});vm.runInContext(code,ctx);
 const pages=ctx.installPreparedPages({loader:{pair:pending,retainMedia(){}},entries:[{number:1}],picker:{},window:{setTimeout:fn=>{expire=fn;return 1;},clearTimeout(){}},document:{}});pages.keep(1);const prepare=pages.prepare(1);expire();await assert.rejects(prepare,{name:'AbortError'});await pages.destroy();assert.equal(pages.get(1),null);
});
test('stalled optional storage yields verified lesson text and cancels late media work',async()=>{
 const {LessonLoader,expandCatalog}=await import('../gre-learning/lesson-loader.js');const raw=JSON.parse(await readFile(new URL('../gre-learning/catalog.json',import.meta.url)));const catalog=expandCatalog(raw),meta=catalog.entries.find(e=>e.displayOrdinal===1341),unit=JSON.parse(await readFile(new URL('../gre-learning/'+meta.unit.url,import.meta.url)));let signals=[];
 const loader=new LessonLoader(catalog,{cacheStorage:null,fetcher:()=>{throw Error('network not expected');},localMediaTimeoutMs:10});loader.resource=async()=>unit;loader.mediaResource=(_ref,signal)=>{signals.push(signal);return pending();};
 const pair=await loader.pair(meta.number);assert.equal(pair.entry.number,meta.number);assert.equal(pair.media,null);assert.ok(signals.length>=2);assert.ok(signals.every(signal=>signal.aborted));loader.destroy();
});
test('available offline media is preserved by the optional read deadline',async()=>{
 const {LessonLoader,expandCatalog}=await import('../gre-learning/lesson-loader.js');const raw=JSON.parse(await readFile(new URL('../gre-learning/catalog.json',import.meta.url))),catalog=expandCatalog(raw),meta=catalog.entries.find(e=>e.displayOrdinal===1341),unit=JSON.parse(await readFile(new URL('../gre-learning/'+meta.unit.url,import.meta.url)));
 const loader=new LessonLoader(catalog,{cacheStorage:null,localMediaTimeoutMs:100});loader.resource=async()=>unit;loader.mediaResource=async ref=>'blob:'+ref.sha256;
 const pair=await loader.pair(meta.number);assert.equal(pair.media.posterURL,'blob:'+meta.storyMedia.poster.sha256);assert.equal(pair.media.videoURL,'blob:'+meta.storyMedia.video.sha256);loader.destroy();
});
test('cancel during media-control read prevents resume write',async()=>{
 const {createMediaControl}=await import('../gre-learning/offline-control.js');let release,writes=0;navigatorValue({});globalThis.caches={open:async()=>({match:()=>new Promise(r=>release=r),put:async()=>writes++})};
 const c=new AbortController(),job=createMediaControl(new URL('https://resume-read.test/')).resume({signal:c.signal});await flush();c.abort();release(new Response(JSON.stringify({generation:2,paused:true,phase:'cleared'})));await assert.rejects(job,{name:'AbortError'});assert.equal(writes,0);
});
test('cancel while waiting for the media lock prevents resume read or write',async()=>{
 const {createMediaControl}=await import('../gre-learning/offline-control.js');let start,reads=0;navigatorValue({locks:{request(_name,_options,action){return new Promise((resolve,reject)=>{start=()=>Promise.resolve().then(action).then(resolve,reject);});}}});globalThis.caches={open:async()=>{reads++;throw Error('should not read');}};
 const c=new AbortController(),job=createMediaControl(new URL('https://resume-lock.test/')).resume({signal:c.signal});c.abort();start();await assert.rejects(job,{name:'AbortError'});assert.equal(reads,0);
});
test('optional timeout before a delayed cache guard cannot allocate a stale object URL',async()=>{
 const {createHash}=await import('node:crypto'),{LessonLoader}=await import('../gre-learning/lesson-loader.js'),bytes=Buffer.from('verified local video'),sha256=createHash('sha256').update(bytes).digest('hex'),ref={url:'story-media/'+sha256+'.mp4',sha256,bytes:bytes.length};let release;
 const loader=new LessonLoader({entries:[]},{cacheStorage:{open:async()=>({match:async()=>new Response(bytes)})},localMediaTimeoutMs:50});loader.mediaControl={ticket:async()=>0,guard:(_ticket,action)=>new Promise((resolve,reject)=>{release=()=>Promise.resolve().then(action).then(resolve,reject);})};
 const job=loader.optionalMedia(ref,undefined,'high',false);assert.equal(await job,null);assert.ok(release);release();await flush();assert.equal(loader.mediaCache.size,0);loader.destroy();
});

test('inventory diagnostics normalize each failure stage without raw errors or paths',async()=>{
 for(const stage of ['C1','C2','P1','P2','P3','C3']){
  const error=Object.assign(Error('private pack filename'),{name:'SecurityError',...(stage.startsWith('P')?{inventoryStage:stage}:{})}),events=[];
  const {context:c}=inventoryHarness({inventory:async()=>{if(stage==='C2')throw error;return {readyPaths:[]};},library:async()=>{if(stage.startsWith('P'))throw error;return {readyIds:[1],total:2,packs:[]};}});let reads=0;
  c.console={warn:(...args)=>events.push(args)};c.sharedControl.state=async()=>{if((stage==='C1'&&++reads===1)||(stage==='C3'&&++reads===2))throw error;return {generation:0,phase:'active'};};
  await c.refresh();assert.equal(events.length,1,stage);assert.equal(events[0][1].code,stage+'-S');assert.equal(JSON.stringify(events).includes('private'),false);
 }
});
test('version diagnostic appears only after two failures and clears on full success',async()=>{
 let fail=true;const {context:c}=inventoryHarness({inventory:async()=>{if(fail)throw Object.assign(Error('no'),{name:'TimeoutError'});return {readyPaths:[]};}});
 const footer={textContent:'v187'};const query=c.host.querySelector;c.host.querySelector=selector=>selector==='[data-runtime-build]'?footer:query(selector);
 await c.refresh();assert.equal(footer.textContent,'v187');await c.refresh();assert.equal(footer.textContent,'v187 · C2-T');fail=false;await c.refresh();assert.equal(footer.textContent,'v187');fail=true;await c.refresh();assert.equal(footer.textContent,'v187');
});

test('actual quota errors get local Q diagnostic without inferring device capacity',async()=>{
 const events=[],{context:c}=inventoryHarness({inventory:async()=>{throw Object.assign(Error('private quota text'),{name:'QuotaExceededError'});}});c.console={warn:(...args)=>events.push(args)};await c.refresh();assert.equal(events[0][1].code,'C2-Q');assert.equal(JSON.stringify(events).includes('private'),false);
});
