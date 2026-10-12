import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createMediaControl} from '../gre-learning/offline-control.js';
import {LessonLoader} from '../gre-learning/lesson-loader.js';
const stores=new Map();globalThis.caches={open:async name=>{if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name),key=x=>typeof x==='string'?x:x.url;return {match:async x=>map.get(key(x))?.clone(),put:async(x,r)=>map.set(key(x),r.clone()),delete:async x=>map.delete(key(x)),keys:async()=>[...map.keys()].map(url=>({url}))};}};
const base=new URL('https://selective.test/gre-learning/'),scope=new URL('../',base),url=new URL('story-media/first.mp4',base).href,other=new URL('story-media/other.mp4',base).href;
test('selective clear invalidates outstanding writes without changing global mode; durable block survives resume',async()=>{
 const control=createMediaControl(scope),before=await control.ticket();let entered=false,during;
 await control.selectiveClear([url],async()=>{entered=true;during=await control.ticket();assert.equal(await control.automaticAllowed(url),false);});assert.equal(entered,true);await assert.rejects(control.guard(during,()=>{throw Error('captured old OPFS slice during clear');}),{name:'AbortError'});
 await assert.rejects(control.guard(before,()=>{throw Error('must never write');}),{name:'AbortError'});
 assert.equal((await control.state()).paused,false);assert.equal(await control.automaticAllowed(other),true);await control.resume();assert.equal(await control.automaticAllowed(url),false);
 const {createMediaControl:fresh}=await import('../gre-learning/offline-control.js?fresh-selective');assert.equal(await fresh(scope).automaticAllowed(url),false);
 await control.selectiveClear([url],async()=>{throw Error('quota');}).catch(error=>assert.match(error.message,/quota/));assert.equal((await control.state()).phase,'selective-cleared');assert.equal((await control.state()).paused,false);
});
test('loader does not refill selectively cleared media but still reads explicit verified redownloads',async()=>{
 const bytes=Buffer.from('verified first video'),ref={url:'story-media/first.mp4',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};let calls=0;
 const loader=new LessonLoader({entries:[{number:1001,displayOrdinal:1,storyMedia:{video:ref}}]},{baseURL:base,fetcher:async()=>{calls++;return new Response(bytes);}});
 assert.equal(await loader.mediaResource(ref),null);assert.equal(calls,0);
 await(await caches.open('gre-scalable-verified-units-v1')).put(url,new Response(bytes));const blob=await loader.mediaResource(ref);assert.match(blob,/^blob:/);assert.equal(calls,0);loader.destroy();
});
test('a loader network request started before clear cannot repopulate cache afterwards',async()=>{
 const newScope=new URL('https://racing.test/'),newBase=new URL('gre-learning/',newScope),bytes=Buffer.from('racing media'),ref={url:'story-media/race.mp4',bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};let release,started;const began=new Promise(resolve=>started=resolve),gate=new Promise(resolve=>release=resolve);
 const loader=new LessonLoader({entries:[{number:1002,displayOrdinal:2,storyMedia:{video:ref}}]},{baseURL:newBase,fetcher:async()=>{started();await gate;return new Response(bytes);}});
 const pending=loader.mediaResource(ref);await began;await createMediaControl(newScope).selectiveClear([new URL(ref.url,newBase).href],async()=>{});release();await assert.rejects(pending,{name:'AbortError'});
 assert.equal(await(await caches.open('gre-scalable-verified-units-v1')).match(new URL(ref.url,newBase).href),undefined);loader.destroy();
});
