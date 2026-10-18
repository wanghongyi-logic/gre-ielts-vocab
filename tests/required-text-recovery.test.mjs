import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {LessonLoader,expandCatalog} from '../gre-learning/lesson-loader.js';
const pending=()=>new Promise(()=>{}),flush=()=>new Promise(r=>setImmediate(r));
function fixture({match=async()=>undefined,put=async()=>{},fetcher}={}){
 const bytes=Buffer.from('{"schema":1,"entries":[]}'),sha256=createHash('sha256').update(bytes).digest('hex'),ref={url:'units/'+sha256+'.json',sha256,bytes:bytes.length};let network=0;
 const loader=new LessonLoader({entries:[]},{localTextTimeoutMs:10,cacheStorage:{open:async()=>({match,put})},fetcher:fetcher||(async()=>{network++;return new Response(bytes);})});return {loader,ref,bytes,get network(){return network;}};
}
test('verified next-unit text renders while its disk put never settles',async()=>{
 const f=fixture({put:pending});const result=await Promise.race([f.loader.resource(f.ref),new Promise((_,reject)=>setTimeout(()=>reject(Error('render blocked by disk put')),100))]);assert.equal(result.schema,1);await flush();assert.equal(f.loader.textWrites.size,1);assert.equal(f.loader.cache.size,1);f.loader.destroy();
});
test('a hung cached match yields to available network text and supports next calls',async()=>{
 const f=fixture({match:pending});assert.equal((await f.loader.resource(f.ref)).schema,1);assert.equal(f.network,1);assert.equal((await f.loader.resource(f.ref)).schema,1);assert.equal(f.network,1);f.loader.destroy();
});
test('available verified offline text still uses cache without network',async()=>{
 const f=fixture({fetcher:async()=>{throw Error('offline');}});f.loader.cacheStorage={open:async()=>({match:async()=>new Response(f.bytes),put:async()=>{throw Error('no rewrite');}})};assert.equal((await f.loader.resource(f.ref)).schema,1);assert.equal(f.loader.textWrites.size,0);f.loader.destroy();
});
test('stalled writes are bounded to two and late completion cannot repopulate destroyed LRU',async()=>{
 let finish;const f=fixture({put:()=>new Promise(r=>finish=r)});
 for(let i=0;i<6;i++){const ref={...f.ref,url:'units/'+i+'.json'};f.loader.cache.clear();f.loader.bytes=0;await f.loader.resource(ref);}await flush();assert.equal(f.loader.textWrites.size,2);f.loader.destroy();finish();await flush();assert.equal(f.loader.cache.size,0);assert.equal(f.loader.bytes,0);
});
test('meager to mediate crosses its actual catalog unit boundary despite stalled persistence',async()=>{
 const catalog=expandCatalog(JSON.parse(await readFile(new URL('../gre-learning/catalog.json',import.meta.url)))),meager=catalog.entries.find(e=>e.word==='meager'),next=catalog.entries[catalog.entries.indexOf(meager)+1];assert.equal(next.word,'mediate');assert.notEqual(meager.unit.url,next.unit.url);
 const loader=new LessonLoader(catalog,{localTextTimeoutMs:10,cacheStorage:{open:async()=>({match:async()=>undefined,put:pending})},fetcher:async url=>new Response(await readFile(new URL('./'+url.pathname.split('/').at(-1),new URL('../gre-learning/units/',import.meta.url))))});
 for(const meta of [meager,next]){const unit=await loader.resource(meta.unit);assert.equal(unit.entries.find(e=>e.number===meta.number).word,meta.word);}loader.destroy();
});
test('concurrent required reads share work and one caller cancel leaves the other usable',async()=>{
 let deliver,requests=0;const f=fixture({fetcher:()=>{requests++;return new Promise(r=>deliver=r);}}),a=new AbortController(),b=new AbortController();
 const first=f.loader.resource(f.ref,a.signal),second=f.loader.resource(f.ref,b.signal);await flush();a.abort();await assert.rejects(first,{name:'AbortError'});deliver(new Response(f.bytes));assert.equal((await second).schema,1);assert.equal(requests,1);f.loader.destroy();
});
test('next distinct-unit prefetch warms only text and is reused across all five words',async()=>{
 const f=fixture(),current={...f.ref,sha256:'current'},entries=Array.from({length:10},(_,i)=>({number:i+1,unit:i<5?current:f.ref}));f.loader.catalog={entries};let calls=0;f.loader.pair=()=>{throw Error('media must not be prefetched');};const resource=f.loader.resource.bind(f.loader);f.loader.resource=(...args)=>{calls++;return resource(...args);};
 f.loader.prefetchNextUnit(1);f.loader.prefetchNextUnit(2);await flush();await flush();assert.equal(calls,1);assert.equal(f.network,1);assert.equal((await resource(f.ref)).schema,1);assert.equal(f.network,1);f.loader.prefetchNextUnit(5);assert.equal(calls,1);f.loader.destroy();
});
