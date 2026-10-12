import {readFile} from 'node:fs/promises';import {existsSync} from 'node:fs';import assert from 'node:assert/strict';
const base=new URL((process.env.GRE_IMPLEMENTATION_DIR||new URL('../',import.meta.url).pathname).replace(/\/$/,'')+'/', 'file://').pathname;
const {LessonLoader,expandCatalog}=await import(base+'gre-learning/lesson-loader.js');
const {renderWordPage}=await import(base+'gre-learning/view.js');
const catalog=expandCatalog(JSON.parse(await readFile(base+'gre-learning/catalog.json')));
// Pick an actually hosted fixture; deployments may intentionally remove later media.
const meta=catalog.entries.find(entry=>entry.storyMedia?.video&&existsSync(base+'gre-learning/'+entry.storyMedia.video.url));
assert.ok(meta,'Media fallback audit needs at least one hosted video fixture');
const video=meta.storyMedia.video,bytes=await readFile(base+'gre-learning/'+video.url);
const url=new URL('https://audit.test/gre-learning/');
for(const mode of ['404','hang-fetch','hang-body']){
 const network=[];const loader=new LessonLoader(catalog,{baseURL:url,mediaTimeoutMs:35,cacheStorage:{open:async()=>({match:async u=>u===new URL(video.url,url).href?new Response(bytes):undefined,put:async()=>{}})},fetcher:async u=>{network.push(u.pathname);if(u.pathname.includes('/units/'))return new Response(await readFile(base+u.pathname));if(mode==='404')return new Response('gone',{status:404});if(mode==='hang-fetch')return new Promise(()=>{});return {ok:true,arrayBuffer:()=>new Promise(()=>{})}}});
 const start=Date.now();const pair=await loader.pair(meta.number);assert.equal(pair.entry.word,meta.word);assert.ok(pair.media?.videoURL.startsWith('blob:'));assert.equal(pair.media.posterURL,null);assert.ok(!network.some(p=>p.endsWith('.mp4')));assert.ok(Date.now()-start<1000);const html=renderWordPage(pair.entry,pair.media,{index:catalog.entries.indexOf(meta),total:catalog.entries.length});assert.ok(html.includes('<video'));assert.ok(!html.includes('src="null"'));console.log('PASS retained cached video + unavailable poster:',mode,'in',Date.now()-start,'ms');loader.destroy();
}
for(const mode of ['404','hang-fetch','hang-body']){
 const loader=new LessonLoader(catalog,{baseURL:url,mediaTimeoutMs:35,cacheStorage:null,fetcher:async u=>{if(u.pathname.includes('/units/'))return new Response(await readFile(base+u.pathname));if(mode==='404')return new Response('gone',{status:404});if(mode==='hang-fetch')return new Promise(()=>{});return {ok:true,arrayBuffer:()=>new Promise(()=>{})}}});
 const start=Date.now();const pair=await loader.pair(meta.number);assert.equal(pair.entry.word,meta.word);assert.equal(pair.media,null);assert.ok(Date.now()-start<1000);console.log('PASS fresh text with all media unavailable:',mode,'in',Date.now()-start,'ms');loader.destroy();
}
// Emulate a previously imported OPFS archive under a newly loaded app module/catalog.
const pack={key:'old@1',name:'old.zip',bytes:bytes.length,installedAt:1,files:[{path:'gre-learning/'+video.url,sha256:video.sha256,bytes:video.bytes,start:0,role:'video'}]};
globalThis.indexedDB={open(){const r={};setTimeout(()=>{r.result={transaction(){const tx={};tx.objectStore=()=>({getAll(){const q={};setTimeout(()=>{q.result=[pack];q.onsuccess?.();setTimeout(()=>tx.oncomplete?.(),0)},0);return q}});return tx}};r.onsuccess()},0);return r}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{storage:{getDirectory:async()=>({getDirectoryHandle:async()=>({getFileHandle:async name=>{assert.equal(name,'old.zip');return {getFile:async()=>new Blob([bytes])}}})})}}});
const localLoader=new LessonLoader(catalog,{baseURL:url,mediaTimeoutMs:35,cacheStorage:null,fetcher:async u=>{assert.ok(!u.pathname.endsWith('.mp4'),'OPFS video must never request deleted remote');return u.pathname.includes('/units/')?new Response(await readFile(base+u.pathname)):new Response('gone',{status:404})}});
const localPair=await localLoader.pair(meta.number);assert.ok(localPair.media?.videoURL.startsWith('blob:'));assert.equal(localPair.media.posterURL,null);assert.equal(localPair.entry.word,meta.word);localLoader.destroy();console.log('PASS retained OPFS video + deleted remote poster/video, fresh app/text');
