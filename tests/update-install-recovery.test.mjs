import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../sw.js',import.meta.url),'utf8');
const pending=()=>new Promise(()=>{});
function fixture({stall,partial=false,cleanupHang=false}={}){
 const assets=[{url:'gre-learning/catalog.json'},{url:'app.js'}],build='candidate',shell='shell-candidate',stores=new Map([['shell-previous',new Map([['__shell_ready__',new Response('previous')],['saved-word',new Response('unchanged')]])]]),listeners=new Map();let claims=0,broadcasts=0,phase=false;const writes=[];
 const cache=name=>{if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return {match:async key=>{if(stall==='verify'&&phase&&key!=='__shell_ready__')return pending();return map.get(key)?.clone();},keys:async()=>{if(stall==='keys')return pending();return [...map.keys()].map(url=>({url}));},put:async(key,response)=>{writes.push(key);if((stall==='catalog'&&key===assets[0].url)||(stall==='asset'&&key==='app.js')||(stall==='marker'&&key==='__shell_ready__'))return pending();map.set(key,response.clone());if(key==='app.js')phase=true;}};};
 const verify=async response=>{if(!response?.ok)throw Error('invalid');await response.clone().arrayBuffer();return response;};
 const ctx=vm.createContext({Promise,Map,Set,Response,AbortController,DOMException,AggregateError,Date,BUILD:build,SHELL:shell,SHELL_PREFIX:'shell-',SHELL_ASSETS:assets,resolve:x=>x,shellRef:url=>assets.find(a=>a.url===url),verify,gateCatalog(){},catalog:async()=>({preview:false}),reuseShell:async()=>null,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,30)),clearTimeout,caches:{open:async name=>cache(name),keys:()=>cleanupHang?pending():Promise.resolve([...stores.keys()]),delete:async name=>stores.delete(name)},fetchChecked:async(url,options,check)=>{const response=new Response(JSON.stringify(url.endsWith('shell-manifest.json')?{build,assets}:{preview:false}));await check(response);return response;},self:{addEventListener:(type,fn)=>listeners.set(type,fn),clients:{claim:async()=>claims++}},broadcast:async()=>broadcasts++});
 const ready=source.slice(source.indexOf('async function shellReady'),source.indexOf('// Browser CacheStorage')),
 helpers=source.slice(source.indexOf('const readingWrites='),source.indexOf('async function shellResponse')),
 response=source.slice(source.indexOf('async function shellResponse'),source.indexOf('async function catalog(')),events=source.slice(source.indexOf("self.addEventListener('install'"),source.indexOf('// Receipts are scoped'));
 vm.runInContext(ready+helpers+response+events,ctx);
 if(partial){const map=new Map([['__shell_ready__',new Response(build)],[assets[0].url,new Response('{}')]]);stores.set(shell,map);}
 const run=type=>{let work;listeners.get(type)({waitUntil:p=>work=p});return work;};
 return {run,ctx,stores,writes,get claims(){return claims;},get broadcasts(){return broadcasts;},recover(){stall=null;phase=false;}};
}
for(const stall of ['catalog','asset','verify','marker'])test('hung '+stall+' fails install without activating partial cache or touching previous generation',async()=>{
 const f=fixture({stall});await assert.rejects(f.run('install'));assert.equal(f.claims,0);assert.equal(await f.stores.get('shell-previous').get('saved-word').text(),'unchanged');assert.equal(f.stores.get('shell-candidate')?.has('__shell_ready__'),false);
 f.recover();await f.run('install');assert.equal(await f.ctx.shellReady(),true);await f.run('activate');assert.equal(f.claims,1);assert.equal(f.broadcasts,1);assert.ok(f.stores.has('shell-previous'));
});
test('marker alone cannot activate a partial candidate',async()=>{const f=fixture({partial:true});assert.equal(await f.ctx.shellReady(),false);await assert.rejects(f.run('activate'),/Incomplete shell/);assert.equal(f.claims,0);assert.ok(f.stores.has('shell-previous'));});
test('runtime ready check returns false when cache inventory hangs',async()=>{const f=fixture();await f.run('install');f.ctx.caches.open=async()=>({match:async()=>new Response('candidate'),keys:pending});assert.equal(await f.ctx.shellReady(),false);});
test('old-shell housekeeping hang cannot block verified candidate activation',async()=>{const f=fixture({cleanupHang:true});await f.run('install');await f.run('activate');assert.equal(f.claims,1);assert.equal(f.broadcasts,1);assert.ok(f.stores.has('shell-previous'));});
