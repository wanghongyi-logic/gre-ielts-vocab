import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LessonLoader} from '../gre-learning/lesson-loader.js';
import {preferVerifiedLocal} from '../gre-learning/offline-async.js';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),pending=()=>new Promise(()=>{});
const bytes=Buffer.from('{"schema":1,"entries":[]}'),ref={url:'units/slow.json',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};
function loaderFixture({match=async()=>null,fetcher=async()=>{throw Error('offline');},localAsset,localTextTimeoutMs=1200,textTimeoutMs=6500}={}){
 const loader=new LessonLoader({entries:[]},{cacheStorage:{open:async()=>({match,put:async()=>{}})},fetcher,localTextTimeoutMs,textTimeoutMs});
 if(localAsset){const code=LessonLoader.prototype.readResource.toString().replace('async readResource','async function readResource');loader.readResource=vm.runInNewContext('('+code+')',{localAsset,preferVerifiedLocal,Response,URL,TextDecoder,AbortController,Promise,Error,Uint8Array,abortError:()=>new DOMException('Cancelled','AbortError')});}
 return loader;
}
for(const source of ['cache','imported package'])test('offline '+source+' remains readable when valid local bytes take two seconds',async()=>{
 let fetches=0;const late=async()=>{await sleep(2000);return source==='cache'?new Response(bytes):new Blob([bytes]);};
 const loader=loaderFixture({...source==='cache'?{match:late}:{localAsset:late},fetcher:async()=>{fetches++;throw Error('offline');}}),start=performance.now();assert.equal((await loader.resource(ref)).schema,1);const elapsed=performance.now()-start;assert.ok(elapsed>=1900&&elapsed<3000,elapsed);assert.equal(fetches,1);assert.equal(loader.cache.size,1);loader.destroy();
});
test('valid late local read beats a hanging network and aborts the losing request',async()=>{
 let signal;const loader=loaderFixture({localTextTimeoutMs:5,match:async()=>{await sleep(30);return new Response(bytes);},fetcher:(_,options)=>{signal=options.signal;return pending();}});assert.equal((await loader.resource(ref)).schema,1);assert.equal(signal.aborted,true);loader.destroy();
});
test('corrupt late local bytes do not become offline availability',async()=>{
 const loader=loaderFixture({localTextTimeoutMs:5,match:async()=>{await sleep(25);return new Response('bad');}});await assert.rejects(loader.resource(ref),/offline/);assert.equal(loader.cache.size,0);loader.destroy();
});
test('caller cancellation and total deadline prevent stale late local adoption',async()=>{
 for(const abort of [true,false]){const controller=new AbortController(),loader=loaderFixture({localTextTimeoutMs:5,textTimeoutMs:20,match:async()=>{await sleep(50);return new Response(bytes);},fetcher:pending});const job=loader.resource(ref,controller.signal);if(abort)setTimeout(()=>controller.abort(),10);await assert.rejects(job,{name:abort?'AbortError':'TimeoutError'});await sleep(60);assert.equal(loader.cache.size,0);assert.equal(loader.textWrites.size,0);loader.destroy();}
});
const workerSource=await readFile(new URL('../sw.js',import.meta.url),'utf8');
function workerFixture({shell=true,delay=2000,corrupt=false,network=pending,timeoutScale=1}={}){
 const helpers=workerSource.slice(workerSource.indexOf('const readingWrites='),workerSource.indexOf('async function shellResponse')),
 shellCode=workerSource.slice(workerSource.indexOf('async function shellResponse'),workerSource.indexOf('async function catalog(')),unitCode=workerSource.slice(workerSource.indexOf('async function unitResponse'),workerSource.indexOf("self.addEventListener('fetch'"));let fetches=0,netSignal;
 const verify=async response=>{const data=Buffer.from(await response.clone().arrayBuffer());if(data.length!==ref.bytes||createHash('sha256').update(data).digest('hex')!==ref.sha256)throw Error('integrity');return response;};
 const ctx=vm.createContext({Promise,Map,Response,AbortController,DOMException,AggregateError,setTimeout:(fn,ms)=>setTimeout(fn,ms*timeoutScale),clearTimeout,SHELL:'shell',UNITS:'units',resolve:x=>x,verifiedResources:new Map(),shellRef:()=>shell?ref:null,caches:{open:async()=>({match:async()=>{await sleep(delay);return new Response(corrupt?'bad':bytes);},put:async()=>{}})},verify,verifyCached:verify,fetch:async(_,options)=>{fetches++;netSignal=options.signal;return network();},fetchChecked:async(_,options,check)=>{fetches++;netSignal=options.signal;return check(await network());}});vm.runInContext(helpers+shellCode+unitCode,ctx);return {run:signal=>ctx.unitResponse({url:'https://example.test/gre-learning/units/slow.json'},ref,{signal}),get fetches(){return fetches;},get netSignal(){return netSignal;}};
}
for(const shell of [true,false])test('SW '+(shell?'shell':'unit')+' preserves two-second valid offline cached text',async()=>{
 const f=workerFixture({shell,network:async()=>{throw Error('offline');}}),start=performance.now();assert.equal(await(await f.run()).text(),bytes.toString());assert.ok(performance.now()-start>=1900);assert.equal(f.fetches,1);
});
test('SW late local winner cancels stalled network; corrupt bytes never win',async()=>{
 const f=workerFixture({delay:25,timeoutScale:.01});assert.equal(await(await f.run()).text(),bytes.toString());assert.equal(f.netSignal.aborted,true);
 const bad=workerFixture({delay:25,timeoutScale:.01,corrupt:true,network:async()=>{throw Error('offline');}});await assert.rejects(bad.run(),/offline/);
});
test('SW and loader use identical generated local-read race logic',async()=>{
 const helper=await readFile(new URL('../gre-learning/offline-async.js',import.meta.url),'utf8'),generated=workerSource.split('// BEGIN GENERATED LOCAL READ RACE\n')[1].split('// END GENERATED LOCAL READ RACE')[0];assert.equal(generated,helper.replace('export function','function').replace('export async function','async function'));
});
test('real SW checked-fetch bridge forwards local-winner cancellation to fetch',async()=>{
 const code=workerSource.slice(workerSource.indexOf('async function fetchChecked'),workerSource.indexOf('let reuseNames;'));let actualSignal;
 const ctx=vm.createContext({AbortController,setTimeout,clearTimeout,fetch:(_,options)=>{actualSignal=options.signal;return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));}});vm.runInContext(code,ctx);
 const controller=new AbortController(),job=ctx.fetchChecked('unit.json',{signal:controller.signal},async()=>{});controller.abort();await assert.rejects(job,{name:'AbortError'});assert.equal(actualSignal.aborted,true);
});
test('corrupt fast network cannot beat a valid slower local copy',async()=>{
 const loader=loaderFixture({localTextTimeoutMs:5,match:async()=>{await sleep(30);return new Response(bytes);},fetcher:async()=>new Response('corrupt')});assert.equal((await loader.resource(ref)).schema,1);loader.destroy();
 for(const shell of [true,false]){const f=workerFixture({shell,delay:25,timeoutScale:.01,network:async()=>new Response('corrupt')});assert.equal(await(await f.run()).text(),bytes.toString());}
});
