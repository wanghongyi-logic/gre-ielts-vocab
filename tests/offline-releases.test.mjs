import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {File} from 'node:buffer';
import {parseWordRange,trustedReleaseURL,normalizeReleaseAsset,localCoverage,discoverReleaseAssets,downloadReleaseAsset,releaseListMessage,DIRECT_IMPORT_LIMIT,mountReleaseImporter} from '../gre-learning/offline-releases.js';
globalThis.File ??= File;
const name='GRE-words-061-070.zip';
const url=`https://github.com/wanghongyi-logic/gre-ielts-vocab/releases/download/test/${name}`;
const raw={id:1,name,size:4,state:'uploaded',browser_download_url:url};
const asset=()=>normalizeReleaseAsset(raw,{tag_name:'test'});
test('range parsing is strict and ranges count inclusively',()=>{
 assert.deepEqual(parseWordRange(name),{start:61,end:70,count:10});
 for(const name of ['GRE-words-000-010.zip','GRE-words-071-070.zip','../GRE-words-061-070.zip','GRE-words-61-70.zip.exe','GRE-words-1-100000.zip'])assert.equal(parseWordRange(name),null);
});
test('allowlist is exact repository, HTTPS, no credentials or encoded traversal',()=>{
 assert.equal(trustedReleaseURL(url,name),url);
 for(const bad of [url.replace('https:','http:'),url.replace('github.com','github.com.evil.test'),url.replace('github.com','user:pass@github.com'),url.replace('gre-ielts-vocab','other'),url+'?token=x',url+'#x',url.replace('/test/','/test%2fescape/'),url.replace('/test/','/test%5cescape/'),url.replace('/test/','/%00/'),url.replace('github.com','github.com:444')])assert.throws(()=>trustedReleaseURL(bad,name));
 assert.equal(normalizeReleaseAsset({...raw,state:'new'}),null);
 assert.equal(normalizeReleaseAsset({...raw,size:-1}),null);
});
test('local coverage uses display ordinals rather than IDs and distinguishes unknown',()=>{
 const catalog={entries:Array.from({length:10},(_,i)=>({displayOrdinal:61+i,number:500+i*7}))};
 assert.deepEqual(localCoverage(asset(),catalog,[500,507,563]),{saved:3,total:10});
 assert.deepEqual(localCoverage(asset(),catalog,[]),{saved:0,total:10});
 assert.equal(localCoverage(asset(),catalog,null),null);
 assert.equal(localCoverage(asset(),{entries:[]},[]),null);
});
test('empty release list, HTTP error and invalid payload are distinct from assets',async()=>{
 assert.deepEqual(await discoverReleaseAssets({fetcher:async()=>Response.json([])}),[]);
 await assert.rejects(discoverReleaseAssets({fetcher:async()=>new Response('',{status:403})}),/rate-limit/);
 await assert.rejects(discoverReleaseAssets({fetcher:async()=>Response.json({})}),/invalid-response/);
 assert.match(releaseListMessage('empty'),/最近的发布中还没有找到/);
 assert.match(releaseListMessage('error'),/暂时无法读取/);
});
test('discovery rejects arbitrary assets, ignores drafts, deduplicates and sends no credentials',async()=>{
 const found=await discoverReleaseAssets({fetcher:async(endpoint,options)=>{
 assert.match(endpoint,/^https:\/\/api.github.com\/repos\/wanghongyi-logic\/gre-ielts-vocab\/releases\?/);
 assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');
 return Response.json([{draft:true,assets:[{...raw,id:2}]},{tag_name:'test',assets:[raw,raw,{...raw,id:3,browser_download_url:'https://evil.test/a.zip'}]}]);
 }});
 assert.equal(found.length,1);assert.equal(found[0].url,url);
});
test('streaming transfer creates a small file with progress and no ambient credentials',async()=>{
 const progress=[];
 const file=await downloadReleaseAsset(asset(),{fetcher:async(input,options)=>{assert.equal(input,url);assert.equal(options.credentials,'omit');return new Response('abcd');},onProgress:p=>progress.push(p)});
 assert.equal(file.name,name);assert.equal(await file.text(),'abcd');assert.equal(progress.at(-1).completed,4);
});
test('transfer rejects unverified descriptors and oversized assets without fetching',async()=>{
 const fetcher=()=>{throw new Error('must not fetch');};
 await assert.rejects(downloadReleaseAsset({...asset()},{fetcher}),/刷新/);
 await assert.rejects(downloadReleaseAsset(normalizeReleaseAsset({...raw,size:DIRECT_IMPORT_LIMIT+1}),{fetcher}),/先下载/);
});
test('transfer handles CORS failure, wrong sizes, and abort before fetching',async()=>{
 await assert.rejects(downloadReleaseAsset(asset(),{fetcher:async()=>{throw new TypeError('Failed to fetch');}}));
 for(const body of ['abc','abcde'])await assert.rejects(downloadReleaseAsset(asset(),{fetcher:async()=>new Response(body)}));
 await assert.rejects(downloadReleaseAsset(asset(),{fetcher:async()=>new Response('abcd',{headers:{'Content-Length':'8'}})}),/大小已变化/);
 const controller=new AbortController();controller.abort();
 await assert.rejects(downloadReleaseAsset(asset(),{signal:controller.signal,fetcher:()=>{throw Error('must not fetch');}}),{name:'AbortError'});
});
// Minimal DOM fixture exercises ownership, states and repeated clicks without browser dependencies.
class Element {
 constructor(tag,doc){this.tag=tag;this.ownerDocument=doc;this.children=[];this.dataset={};this.selectors=new Map();}
 set innerHTML(value){this.html=value;for(const m of value.matchAll(/data-(release-[a-z-]+)/g)){const key=`[data-${m[1]}]`;if(!this.selectors.has(key))this.selectors.set(key,new Element('node',this.ownerDocument));}}
 querySelector(selector){return this.selectors.get(selector)||null;}
 append(...items){this.children.push(...items);}
 replaceChildren(...items){this.children=items;}
 after(item){this.afterNode=item;}
 remove(){this.removed=true;}
}
const fixture=()=>{const doc={createElement:tag=>new Element(tag,doc)};const host=new Element('host',doc),manual=new Element('input',doc),anchor=new Element('feedback',doc);host.selectors.set('input',manual);host.selectors.set('.library-import-feedback',anchor);return {host,manual,anchor};};
test('mount preserves file import, empty/error states and manual download page',async()=>{
 const {host,manual,anchor}=fixture();let fail=false;
 const ui=mountReleaseImporter({host,catalog:{entries:[]},fetcher:async()=>{if(fail)throw Error('offline');return Response.json([]);}});
 assert.equal(host.querySelector('input'),manual);
 const section=anchor.afterNode;
 assert.equal(section.querySelector('[data-release-page]').href,'https://github.com/wanghongyi-logic/gre-ielts-vocab/releases');
 await ui.load();assert.match(section.querySelector('[data-release-status]').textContent,/最近的发布中还没有找到/);
 fail=true;await ui.load();assert.match(section.querySelector('[data-release-status]').textContent,/暂时无法读取/);
 ui.destroy();assert.equal(section.removed,true);
});
test('CORS-failed direct import retains download action and prevents duplicate clicks',async()=>{
 const {host,anchor}=fixture();let calls=0, reject;
 const ui=mountReleaseImporter({host,catalog:{entries:[]},onImport:()=>{calls++;return new Promise((_,r)=>{reject=r;});},fetcher:async()=>Response.json([{assets:[raw]}])});
 await ui.load();const section=anchor.afterNode,list=section.querySelector('[data-release-list]');
 const button=list.children[0].children[2].children[0];
 const pending=button.onclick();await button.onclick();assert.equal(calls,1);
 reject(new TypeError('CORS'));await pending;
 assert.match(section.querySelector('[data-release-status]').textContent,/保存后在上方选择文件/);
 assert.equal(list.children[0].children[2].children[1].href,url);
});
test('module does not replace host or introduce raw HTML from release metadata',async()=>{
 const source=await readFile(new URL('../gre-learning/offline-releases.js',import.meta.url),'utf8');
 assert.ok(!source.includes('host.innerHTML'));assert.ok(!source.includes('.arrayBuffer('));
 assert.equal((source.match(/\.innerHTML\s*=/g)||[]).length,1);
});
test('discovery network deadline aborts stalled fetch and stalled JSON body',async()=>{
 let signal;
 await assert.rejects(discoverReleaseAssets({timeoutMs:10,fetcher:async(_,options)=>{signal=options.signal;return new Promise(()=>{});}}),/network-timeout/);
 assert.equal(signal.aborted,true);
 await assert.rejects(discoverReleaseAssets({timeoutMs:10,fetcher:async()=>({ok:true,json:()=>new Promise(()=>{})})}),/network-timeout/);
});
test('download fetch and stream idle deadlines abort and release reader',async()=>{
 let signal,cancelled=false;
 await assert.rejects(downloadReleaseAsset(asset(),{timeoutMs:10,fetcher:async(_,options)=>{signal=options.signal;return new Promise(()=>{});}}),/network-timeout/);
 assert.equal(signal.aborted,true);
 const stream=new ReadableStream({pull(){return new Promise(()=>{});},cancel(){cancelled=true;}});
 await assert.rejects(downloadReleaseAsset(asset(),{timeoutMs:10,fetcher:async()=>new Response(stream)}),/network-timeout/);
 assert.equal(cancelled,true);assert.equal(stream.locked,false);
});
test('caller cancellation wins during stalled discovery and streaming',async()=>{
 const discoveryController=new AbortController();
 const discovering=discoverReleaseAssets({signal:discoveryController.signal,fetcher:async()=>new Promise(()=>{})});
 discoveryController.abort();await assert.rejects(discovering,{name:'AbortError'});
 const controller=new AbortController(),stream=new ReadableStream({pull(){return new Promise(()=>{});}});
 const downloading=downloadReleaseAsset(asset(),{signal:controller.signal,fetcher:async()=>new Response(stream)});
 setTimeout(()=>controller.abort(),5);await assert.rejects(downloading,{name:'AbortError'});assert.equal(stream.locked,false);
});
test('refresh timeout recovers controls and identifies retained stale list',async()=>{
 const {host,anchor}=fixture();let stall=false;
 const ui=mountReleaseImporter({host,catalog:{entries:[]},discoveryTimeoutMs:10,fetcher:async()=>stall?new Promise(()=>{}):Response.json([{assets:[raw]}])});
 await ui.load();const section=anchor.afterNode,list=section.querySelector('[data-release-list]');assert.equal(list.children.length,1);
 stall=true;await ui.load();assert.equal(section.querySelector('[data-release-refresh]').disabled,false);
 assert.match(section.querySelector('[data-release-status]').textContent,/上次读取/);assert.equal(list.children.length,1);
 stall=false;await ui.load();assert.doesNotMatch(section.querySelector('[data-release-status]').textContent,/上次读取/);
 ui.destroy();
});
