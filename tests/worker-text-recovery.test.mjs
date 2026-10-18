import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../sw.js',import.meta.url),'utf8'),pending=()=>new Promise(()=>{});
function harness({match=async()=>null,put=async()=>{},shell=false}={}){
 const helpers=source.slice(source.indexOf('const readingWrites='),source.indexOf('async function shellResponse'));
 const shellCode=source.slice(source.indexOf('async function shellResponse'),source.indexOf('async function catalog('));
 const unit=source.slice(source.indexOf('async function unitResponse'),source.indexOf("self.addEventListener('fetch'"));let network=0,writes=0;const backgrounds=[];
 const ref={url:'gre-learning/units/next.json'},cache={match,put:async(...args)=>{writes++;return put(...args);}};
 const context=vm.createContext({Response,AbortController,DOMException,Promise,Map,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,15)),clearTimeout,UNITS:'units',SHELL:'shell',resolve:x=>'https://example.test/'+x,caches:{open:async()=>cache},shellRef:()=>shell?ref:null,verify:async r=>{if(await r.clone().text()!=='verified')throw Error('bad bytes');return r;},verifyCached:async r=>r,verifiedResources:new Map(),fetch:async()=>{network++;return new Response('verified');},fetchChecked:async()=>{network++;return new Response('verified');}});
 vm.runInContext(helpers+shellCode+unit,context);
 return {run:()=>context.unitResponse({url:'https://example.test/gre-learning/units/next.json'},ref,{background:p=>backgrounds.push(p)}),context,ref,backgrounds,get network(){return network;},get writes(){return writes;}};
}
for(const shell of [false,true]){
 test((shell?'shell text':'unit text')+' responds without waiting for persistence',async()=>{
  const h=harness({put:pending,shell});assert.equal(await(await h.run()).text(),'verified');assert.equal(h.network,1);assert.equal(h.backgrounds.length,1);assert.equal(h.writes,1);
 });
 test((shell?'shell text':'unit text')+' falls back when disk match hangs',async()=>{
  const h=harness({match:pending,shell});assert.equal(await(await h.run()).text(),'verified');assert.equal(h.network,1);
 });
 test((shell?'shell text':'unit text')+' reads available offline cache before network',async()=>{
  const h=harness({match:async()=>new Response('verified'),shell});assert.equal(await(await h.run()).text(),'verified');assert.equal(h.network,0);assert.equal(h.writes,0);
 });
}
test('shell installation still requires completed persistence',async()=>{
 let finish;const h=harness({shell:true,put:()=>new Promise(r=>finish=r)});let done=false;const installing=h.context.shellResponse(h.ref,{requirePersistence:true}).then(()=>done=true);await new Promise(r=>setImmediate(r));assert.equal(done,false);finish();await installing;assert.equal(done,true);
});
