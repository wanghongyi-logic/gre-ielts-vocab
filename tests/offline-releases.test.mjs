import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseWordRange,trustedReleaseURL,normalizeReleaseAsset,localCoverage,discoverReleaseAssets,releaseListMessage,mountReleaseDownloads} from '../gre-learning/offline-releases.js';
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
test('download module has no direct import or ZIP-fetch implementation',async()=>{
 const module=await import('../gre-learning/offline-releases.js');
 assert.equal(module.downloadReleaseAsset,undefined);assert.equal(module.DIRECT_IMPORT_LIMIT,undefined);
 const source=await readFile(new URL('../gre-learning/offline-releases.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/onImport|isImporting|data-remote|fetcher\(asset\.url|new File|new Blob|\.getReader\(/);
});
test('download descriptors retain large ZIPs without a direct-import size cap',()=>{
 const large=normalizeReleaseAsset({...raw,size:128*1024*1024});
 assert.ok(large);assert.equal(large.bytes,128*1024*1024);assert.equal(large.url,url);
 assert.equal(Object.isFrozen(large),true);assert.equal(Object.isFrozen(large.range),true);
});
test('cancelled discovery does not start a metadata request',async()=>{
 let calls=0;const controller=new AbortController();controller.abort();
 await assert.rejects(discoverReleaseAssets({signal:controller.signal,fetcher:async()=>{calls++;return Response.json([]);}}),{name:'AbortError'});
 assert.equal(calls,0);
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
 const ui=mountReleaseDownloads({host,catalog:{entries:[]},fetcher:async()=>{if(fail)throw Error('offline');return Response.json([]);}});
 assert.equal(host.querySelector('input'),manual);
 const section=anchor.afterNode;
 assert.equal(section.querySelector('[data-release-page]').href,'https://github.com/wanghongyi-logic/gre-ielts-vocab/releases');
 await ui.load();assert.match(section.querySelector('[data-release-status]').textContent,/最近的发布中还没有找到/);
 fail=true;await ui.load();assert.match(section.querySelector('[data-release-status]').textContent,/暂时无法读取/);
 ui.destroy();assert.equal(section.removed,true);
});
test('download rows expose only ordinary trusted ZIP links and never invoke import callbacks',async()=>{
 const {host,manual,anchor}=fixture();let imports=0;const requests=[];
 const ui=mountReleaseDownloads({host,catalog:{entries:[]},onImport:()=>{imports++;},fetcher:async(endpoint)=>{requests.push(endpoint);return Response.json([{assets:[raw,{...raw,id:2,size:128*1024*1024}]}]);}});
 await ui.load();const section=anchor.afterNode,list=section.querySelector('[data-release-list]');
 assert.match(section.html,/下载资源包/);assert.doesNotMatch(section.html,/从 Release 导入|直接导入|CORS/);
 assert.equal(host.querySelector('input'),manual);assert.equal(list.children.length,2);
 for(const row of list.children){const actions=row.children[2];assert.equal(actions.children.length,1);const link=actions.children[0];assert.equal(link.tag,'a');assert.equal(link.href,url);assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');assert.equal(link.onclick,undefined);assert.equal(link.textContent,'下载 ZIP ↗');}
 assert.equal(imports,0);assert.equal(requests.length,1);assert.ok(requests.every(endpoint=>endpoint.startsWith('https://api.github.com/repos/')));
 ui.refreshCoverage();assert.equal(requests.length,1);assert.equal(imports,0);
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
test('destroying download list aborts only its pending metadata discovery',async()=>{
 const {host,anchor}=fixture();let signal;let started;const ready=new Promise(resolve=>started=resolve);
 const ui=mountReleaseDownloads({host,catalog:{entries:[]},fetcher:async(_,options)=>{signal=options.signal;started();return new Promise(()=>{});}});
 const pending=ui.load();await ready;ui.destroy();await pending;
 assert.equal(signal.aborted,true);assert.equal(anchor.afterNode.removed,true);
});
test('caller cancellation wins during stalled metadata discovery',async()=>{
 const controller=new AbortController();
 const discovering=discoverReleaseAssets({signal:controller.signal,fetcher:async()=>new Promise(()=>{})});
 controller.abort();await assert.rejects(discovering,{name:'AbortError'});
});
test('refresh timeout recovers controls and identifies retained stale list',async()=>{
 const {host,anchor}=fixture();let stall=false;
 const ui=mountReleaseDownloads({host,catalog:{entries:[]},discoveryTimeoutMs:10,fetcher:async()=>stall?new Promise(()=>{}):Response.json([{assets:[raw]}])});
 await ui.load();const section=anchor.afterNode,list=section.querySelector('[data-release-list]');assert.equal(list.children.length,1);
 stall=true;await ui.load();assert.equal(section.querySelector('[data-release-refresh]').disabled,false);
 assert.match(section.querySelector('[data-release-status]').textContent,/上次读取/);assert.equal(list.children.length,1);
 stall=false;await ui.load();assert.doesNotMatch(section.querySelector('[data-release-status]').textContent,/上次读取/);
 ui.destroy();
});
