import fs from 'node:fs/promises';import vm from 'node:vm';import assert from 'node:assert/strict';import {performance} from 'node:perf_hooks';
const base=new URL('../gre-learning/',import.meta.url);
const catalog=JSON.parse(await fs.readFile(new URL('catalog.json',base))),packSource=await fs.readFile(new URL('offline-packs.js',base),'utf8'),block=packSource.slice(packSource.indexOf('const inventoryReads='),packSource.indexOf('export async function cleanUnusedPacks')).replace('export async function','async function');
const {waitForLocal}=await import(new URL('offline-async.js',base));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function fixture({delay=0,timeout=6000,hang=false}={}){
 const records=[];for(let n=0;n<1600;n+=5){const entries=catalog.entries.slice(n,n+5);records.push({key:'key'+n,name:'pack'+n,bytes:1,installedAt:n,files:entries.flatMap(e=>[e.storyMedia.video,e.storyMedia.poster,e.storyMedia.staticPoster].filter(Boolean).map(ref=>({path:'gre-learning/'+ref.url,bytes:ref.bytes,sha256:ref.sha256})))})}
 const stats={index:0,directory:0,handles:0,files:0,active:0,maxActive:0};const releases=[],missing=new Set(),wrongSize=new Set();let fail=null;
 const lag=()=>delay?sleep(delay):Promise.resolve();
 const dir={async getFileHandle(name){stats.handles++;stats.active++;stats.maxActive=Math.max(stats.maxActive,stats.active);await lag();if(missing.has(name)){stats.active--;throw Object.assign(Error('Missing'),{name:'NotFoundError'});}if(fail){stats.active--;throw fail;}
 return {async getFile(){stats.files++;await lag();if(hang)await new Promise(r=>releases.push(r));stats.active--;return{size:wrongSize.has(name)?2:1}}}}};
 const ctx=vm.createContext({waitForLocal:(work,options={})=>waitForLocal(work,{...options,timeoutMs:options.timeoutMs===0?0:timeout}),Map,Set,Promise,Boolean,AbortController,DOMException,indexRevision:0,DIR:'packs',badSlices:new Set(),sliceIdentity:()=>'',cancelled:s=>{if(s?.aborted)throw new DOMException('Cancelled','AbortError')},listPacks:async()=>{stats.index++;return structuredClone(records)},navigator:{storage:{async getDirectory(){stats.directory++;await lag();return{async getDirectoryHandle(){stats.directory++;await lag();return dir}}}}}});
 vm.runInContext(block,ctx);return{ctx,stats,records,missing,wrongSize,releases,unhang(){hang=false;releases.splice(0).forEach(r=>r())},fail(error){fail=error}};
}
for(const delay of [5,20]){const f=fixture({delay}),start=performance.now();const r=await waitForLocal(()=>f.ctx.inspectLibrary(catalog));assert.equal(r.readyIds.length,1600);assert.equal(f.stats.index,1);assert.equal(f.stats.directory,2);assert.equal(f.stats.files,320);assert.equal(f.stats.maxActive,8);console.log('1600 words / 320 packs',JSON.stringify({delayMs:delay,elapsedMs:Math.round(performance.now()-start),...f.stats}));}
{
 const f=fixture();f.missing.add('pack0');let r=await f.ctx.inspectLibrary(catalog);assert.equal(r.readyIds.length,1595);r=await f.ctx.inspectLibrary(catalog,{cachedPaths:f.records[0].files.map(v=>v.path)});assert.equal(r.readyIds.length,1600);f.missing.clear();f.wrongSize.add('pack5');r=await f.ctx.inspectLibrary(catalog);assert.equal(r.readyIds.length,1595);f.fail(Object.assign(Error('Denied'),{name:'SecurityError'}));await assert.rejects(f.ctx.inspectLibrary(catalog),{name:'SecurityError'});console.log('PASS missing, wrong size, cache union, unknown storage failure');
}
{
 const f=fixture({delay:1});const results=await Promise.all(Array.from({length:6},()=>f.ctx.inspectLibrary(catalog)));results.forEach(r=>assert.equal(r.readyIds.length,1600));assert.equal(f.stats.index,1);assert.equal(f.stats.files,320);assert.equal(f.stats.maxActive,8);console.log('PASS six simultaneous retries share one scan',JSON.stringify(f.stats));
}
{
 const f=fixture({hang:true,timeout:20});for(let attempt=0;attempt<4;attempt++){await assert.rejects(f.ctx.inspectLibrary(catalog),{name:'TimeoutError'});assert.equal(f.stats.files,8);assert.equal(f.stats.active,8);assert.equal(f.stats.maxActive,8);}f.unhang();await sleep(5);const r=await f.ctx.inspectLibrary(catalog);assert.equal(r.readyIds.length,1600);assert.equal(f.stats.maxActive,8);assert.equal(f.stats.active,0);console.log('PASS four timed-out retries never exceed eight underlying reads and later recover',JSON.stringify(f.stats));
}
{
 const f=fixture({hang:true});const c=new AbortController(),p=f.ctx.inspectLibrary(catalog,{signal:c.signal});await sleep(5);c.abort();await assert.rejects(p,{name:'AbortError'});assert.equal(f.stats.files,8);f.unhang();await sleep(5);assert.equal(f.stats.files,8,'cancelled sole scan launches no further packs');const r=await f.ctx.inspectLibrary(catalog);assert.equal(r.readyIds.length,1600);console.log('PASS sole cancellation stops new metadata probes and retries recover');
}
{
 const f=fixture({delay:1});const c=new AbortController(),one=f.ctx.inspectLibrary(catalog,{signal:c.signal}),two=f.ctx.inspectLibrary(catalog);await sleep(5);c.abort();await assert.rejects(one,{name:'AbortError'});assert.equal((await two).readyIds.length,1600);assert.equal(f.stats.files,320);console.log('PASS cancelling one subscriber preserves another shared scan');
}
{
 const f=fixture({delay:1});const p=f.ctx.inspectLibrary(catalog);await sleep(5);f.ctx.indexRevision++;f.missing.add('pack0');const r=await p;assert.equal(r.readyIds.length,1595);assert.equal(f.stats.index,2);assert.equal(f.stats.maxActive,8);console.log('PASS generation/index revision change rechecks before returning');
}

{
 const f=fixture();const c=new AbortController(),one=f.ctx.inspectLibrary(catalog,{signal:c.signal});c.abort();const two=f.ctx.inspectLibrary(catalog);await assert.rejects(one,{name:'AbortError'});assert.equal((await two).readyIds.length,1600);assert.equal(f.stats.maxActive,8);console.log('PASS immediate retry skips a cancelled prior scan');
}

{
 for(const stage of ['P1','P2','P3']){const f=fixture(),error=Object.assign(Error('private path'),{name:'SecurityError'});if(stage==='P1')f.ctx.listPacks=async()=>{throw error;};else if(stage==='P2')f.ctx.navigator.storage.getDirectory=async()=>{throw error;};else f.fail(error);await assert.rejects(f.ctx.inspectLibrary(catalog),value=>value===error&&value.inventoryStage===stage);}
 console.log('PASS read-only inventory errors retain identity and identify index/directory/file stages');
}
