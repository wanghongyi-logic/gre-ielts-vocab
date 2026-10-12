import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
const root=new URL('../',import.meta.url),origin='https://audit.test/';
const source=await readFile(new URL('sw.js',root),'utf8'),manifest=JSON.parse(await readFile(new URL('gre-learning/shell-manifest.json',root)));
const bodies=new Map(await Promise.all(manifest.assets.map(async ref=>[ref.url,await readFile(new URL(ref.url,root))])));
function fixture({failPath,slowPath,corruptPath,prior=true}={}){
 const maps=new Map(),requests=[],deletes=[],listeners={};let active=0,peak=0,claims=0;
 const key=r=>typeof r==='string'?r:r.url;
 const caches={async open(name){if(!maps.has(name))maps.set(name,new Map());const m=maps.get(name);return {async match(r){return m.get(key(r))?.clone()},async put(r,v){m.set(key(r),v.clone())},async delete(r){return m.delete(key(r))},async keys(){return [...m.keys()].map(x=>new Request(x))}}},async keys(){return [...maps.keys()]},async delete(name){deletes.push(name);return maps.delete(name)}};
 const previous=new Map();if(prior){for(const [path,body] of bodies)previous.set(origin+path,new Response(path===corruptPath?'corrupt':body));previous.set(origin+'__shell_ready__',new Response('prior'));maps.set('gre-scalable-shell-%2F-prior',previous);}
 maps.set('gre-scalable-verified-units-v1',new Map([[origin+'saved-video',new Response('saved media')]]));
 const self={location:{href:origin+'sw.js'},clients:{claim:async()=>{claims++},matchAll:async()=>[]},addEventListener:(type,fn)=>listeners[type]=fn,skipWaiting:async()=>{}};
 vm.runInNewContext(source,{self,caches,crypto:webcrypto,Request,Response,URL,AbortController,DOMException,setTimeout:(fn,ms)=>setTimeout(fn,ms===15000?80:ms),clearTimeout,fetch:async(url,{signal}={})=>{
  const path=new URL(key(url)).pathname.slice(1);requests.push(path);active++;peak=Math.max(peak,active);
  try{if(path===slowPath)await new Promise((resolve,reject)=>{signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true});});await new Promise(r=>setTimeout(r,2));if(path===failPath)return new Response('mismatched deployed file');if(path==='gre-learning/shell-manifest.json')return new Response(JSON.stringify(manifest));return bodies.has(path)?new Response(bodies.get(path)):new Response('404',{status:404});}finally{active--;}
 }});
 return {maps,requests,deletes,previous,get peak(){return peak;},get claims(){return claims;},async lifecycle(type){let job;listeners[type]({waitUntil:p=>job=p});return job;},async build(){let job,result;listeners.message({data:{type:'GET_BUILD'},ports:[{postMessage:value=>result=value}],waitUntil:p=>job=p});await job;return result;}};
}
test('unchanged shell reuse needs only manifest + catalog; media are never fetched',async()=>{const f=fixture();await f.lifecycle('install');assert.deepEqual(f.requests,['gre-learning/shell-manifest.json','gre-learning/catalog.json']);await f.lifecycle('activate');assert.equal(f.claims,1);assert.equal((await f.build()).ready,true);assert.equal(f.maps.has('gre-scalable-verified-units-v1'),true);});
test('corrupted previous file is rejected and repaired from verified network bytes',async()=>{const path=manifest.assets.find(r=>r.url.includes('/units/')).url,f=fixture({corruptPath:path});await f.lifecycle('install');assert.ok(f.requests.includes(path));assert.equal(f.requests.length,3);assert.equal((await f.build()).ready,true);});
test('first install uses six bounded parallel asset lanes and no duplicate catalog fetch',async()=>{const f=fixture({prior:false});await f.lifecycle('install');assert.equal(f.peak,6);assert.equal(f.requests.filter(p=>p==='gre-learning/catalog.json').length,1);assert.equal(f.requests.length,manifest.assets.length+1);assert.equal(f.requests.some(p=>p.includes('story-media/')),false);});
test('mixed deployment fails integrity without ready marker or old-shell/media deletion',async()=>{const path='gre-learning/app.js',f=fixture({prior:false,failPath:path});f.maps.set('gre-scalable-shell-%2F-prior',new Map([[origin+'__shell_ready__',new Response('prior')]]));await assert.rejects(f.lifecycle('install'),/size mismatch|hash mismatch/);assert.equal((await f.build()).ready,false);assert.equal(f.maps.get('gre-scalable-shell-%2F-'+manifest.build)?.has(origin+'__shell_ready__'),false);assert.equal(f.maps.has('gre-scalable-shell-%2F-prior'),true);assert.equal(f.maps.has('gre-scalable-verified-units-v1'),true);assert.equal(f.deletes.length,0);});
test('stalled response aborts on deadline and preserves prior shell',async()=>{const f=fixture({slowPath:'gre-learning/shell-manifest.json'});await assert.rejects(f.lifecycle('install'),/aborted/);assert.equal(f.maps.has('gre-scalable-shell-%2F-prior'),true);assert.equal(f.deletes.length,0);});
test('GET_BUILD does not claim readiness after an asset disappears',async()=>{const f=fixture();await f.lifecycle('install');const cache=f.maps.get('gre-scalable-shell-%2F-'+manifest.build);cache.delete(origin+'gre-learning/app.js');assert.equal((await f.build()).ready,false);});
