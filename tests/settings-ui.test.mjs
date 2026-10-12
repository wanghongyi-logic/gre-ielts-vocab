import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=process.env.GRE_IMPLEMENTATION_DIR||fileURLToPath(new URL('../',import.meta.url));
const source=await readFile(root+'/gre-learning/offline-manager.js','utf8');
const css=await readFile(root+'/gre-learning/settings-storybook.css','utf8');
const {optionalMediaGroups}=await import(pathToFileURL(root+'/gre-learning/offline-batch.js'));
const {mountReleaseDownloads,RELEASES_URL}=await import(pathToFileURL(root+'/gre-learning/offline-releases.js'));
// Minimal DOM fixture. This checks state and semantics, not browser rendering.
class Element{
 constructor(tag,doc){this.tagName=tag;this.ownerDocument=doc;this.children=[];this.attributes={};this.dataset={};this.listeners={};this.textContent='';this.className='';this.hidden=false;this.disabled=false;this.style={values:{},setProperty:(k,v)=>this.style.values[k]=v};this.classList={add:(v)=>this.className+=' '+v,remove:v=>this.className=this.className.split(' ').filter(x=>x!==v).join(' '),toggle:(v,on)=>on?this.classList.add(v):this.classList.remove(v)};}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);if(k==='id')this.id=v;if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;}
 removeAttribute(k){delete this.attributes[k];if(k==='value')delete this.value;}
 getAttribute(k){return this.attributes[k];}
 append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}
 after(node){const i=this.parent.children.indexOf(this);node.parent=this.parent;this.parent.children.splice(i+1,0,node);}
 before(node){const i=this.parent.children.indexOf(this);node.parent=this.parent;this.parent.children.splice(i,0,node);}
 remove(){this.parent.children=this.parent.children.filter(n=>n!==this);}
 replaceChildren(...nodes){this.children=[];this.append(...nodes);}
 matches(s){if(s.startsWith('#'))return this.id===s.slice(1);if(s.startsWith('.'))return this.className.split(' ').includes(s.slice(1));if(s.startsWith('[')){const [k,v]=s.slice(1,-1).split('=');return k in this.attributes&&(!v||this.attributes[k]===v.replaceAll('"',''));}return this.tagName===s;}
 querySelectorAll(s){return this.children.flatMap(n=>[...(n.matches(s)?[n]:[]),...n.querySelectorAll(s)]);}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 addEventListener(k,fn){this.listeners[k]=fn;}
 set innerHTML(s){this.children=[];const stack=[this];for(const token of s.match(/<[^>]*>|[^<]+/g)||[]){if(token.startsWith('</')){stack.pop();continue;}if(token.startsWith('<')){const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const node=new Element(tag,this.ownerDocument);for(const m of token.matchAll(/([\w-]+)(?:="([^"]*)"|='([^']*)')?/g)){if(m.index===1)continue;node.setAttribute(m[1],m[2]??m[3]??'');}node.hidden='hidden'in node.attributes;node.open='open'in node.attributes;stack.at(-1).append(node);if(!['input','link','br','img'].includes(tag))stack.push(node);}else stack.at(-1).textContent+=token;}}
}
const tick=()=>new Promise(r=>setImmediate(r));
function fixture(){
 const doc={createElement:tag=>new Element(tag,doc)};doc.root=new Element('document',doc);doc.head=new Element('head',doc);doc.root.append(doc.head);doc.querySelector=s=>doc.root.querySelector(s);doc.getElementById=id=>doc.querySelector('#'+id);const contents=new Element('div',doc);contents.className='contents-tools';doc.root.append(contents);const nav=new Element('nav',doc),search=new Element('button',doc);search.id='open-search';doc.root.append(nav);nav.append(search);
 const calls={imports:0,downloads:0,activations:0,clears:0,deletes:0,modes:[],reloads:0,confirms:[]};let confirmed=false,releaseFetches=0,importResult={wordIds:[1,2]},pendingImport,pendingDownload,progressOptions;const events={};
 const data={readyIds:[1,2],total:3,packs:[{wordIds:[1,2],version:'v1',bytes:2048,available:true,ownedCurrentAssets:2,key:'one'}]};
 const ctx=vm.createContext({document:doc,window:{addEventListener(k,fn){events[k]=fn;},dispatchEvent(event){if(event.type==='gre-library-updated')calls.activations++;}},location:{hash:'',reload(){calls.reloads++;}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},navigator:{storage:{persist:async()=>true},serviceWorker:{addEventListener(){}}},URL,AbortController,DOMException,CustomEvent:class{constructor(t,o){this.type=t;this.detail=o.detail;}},MessageChannel,RELEASES_URL,setTimeout:()=>1,clearTimeout(){},optionalMediaGroups,setMediaEdition(){},videoMode:()=> 'auto',chooseVideoMode:async mode=>calls.modes.push(mode),OFFLINE_EDITION:'v12',createMediaControl:()=>({subscribe(){},ticket:async()=>0,state:async()=>({generation:0})}),batchStatus:async()=>({readyPaths:[]}),inspectLibrary:async()=>data,storageStatus:async()=>({usage:1024,quota:10240,persistent:false}),deletePack:async()=>{calls.deletes++;},cleanUnusedPacks:async()=>0,clearSavedResources:async()=>{calls.clears++;},downloadLessons:async(ids,paths,options)=>{calls.downloads++;progressOptions=options;return pendingDownload?await pendingDownload:{wordIds:ids};},importPack:async(file,catalog,options)=>{calls.imports++;progressOptions=options;return pendingImport?await pendingImport:importResult;},mountReleaseDownloads:options=>mountReleaseDownloads({...options,fetcher:async()=>{releaseFetches++;return Response.json([]);}}),confirm:msg=>{calls.confirms.push(msg);return confirmed;}});
 vm.runInContext(source.replace(/^import .*;\n/gm,'').replace('export function','function').replaceAll('import.meta.url',JSON.stringify('https://fixture.test/gre-learning/offline-manager.js'))+'\ninstallOfflineManager({entries:[{number:1},{number:2},{number:3},...[51,52,101,102].map(number=>({number,displayOrdinal:number,storyMedia:{poster:{url:"p"+number,bytes:100},video:{url:"v"+number,bytes:200}}}))]});',ctx);
 return {doc,ctx,calls,data,get host(){return doc.getElementById('offline-settings');},get releases(){return releaseFetches;},setConfirmed(v){confirmed=v;},setPending(p){pendingImport=p;},setDownload(p){pendingDownload=p;},progress(p){progressOptions.onProgress(p);},get signal(){return progressOptions.signal;},emit(k,detail){events[k]({detail});}};
}
test('settings has one clean resource drawer, separate import controls and no mixed FAQ',async()=>{
 const f=fixture(),h=f.host,drawer=h.querySelector('.library-pages-downloads');
 assert.ok(h.querySelector('input'));assert.match(source,/导入文件/);assert.equal(drawer.open,false);
 assert.equal(drawer.querySelector('summary').children[0].textContent,'下载资源包');
 assert.equal(h.querySelectorAll('.library-pages-downloads').length,1);assert.equal(h.querySelector('[data-release-browser]'),null);
 assert.equal(drawer.querySelectorAll('details').length,0);assert.ok(drawer.querySelector('[data-pages-downloads]'));
 assert.equal(h.querySelector('[data-release-page]'),null,'unneeded Release jump is removed');
 assert.doesNotMatch(source,/RELEASES_URL|github\.com/);
 for(const selector of ['[data-packs]','[data-persist]','[data-storage-retention]','[data-text-ready]'])assert.equal(drawer.querySelector(selector),null);
 assert.doesNotMatch(source,/>更多<|离线阅读帮助|已保存数量只统计|导入后可用飞行模式检查|浏览器与主屏幕应用的保存空间可能不同/);
 assert.equal(h.querySelector('[data-persist]'),null);assert.equal(h.querySelector('[data-library-progress]'),null);
 assert.equal(h.querySelector('.library-packs').hidden,true);f.doc.getElementById('open-settings').onclick();await tick();
 assert.equal(h.querySelector('.library-packs').hidden,false,'existing imported files remain manageable');assert.equal(h.querySelector('.library-packs').open,false);
 f.data.packs=[];f.doc.getElementById('open-settings').onclick();await tick();assert.equal(h.querySelector('.library-packs').hidden,true);
 assert.ok(h.querySelector('[data-clear-all]'));assert.equal(f.releases,0,'no release API or fake download progress in settings');
 assert.doesNotMatch(source,/downloadReleaseAsset|onImport:|data-remote|mountReleaseDownloads/);
});
test('saved count, accessible rail and pack count use complete unique IDs',async()=>{
 const f=fixture();f.doc.getElementById('open-settings').onclick();await tick();
 assert.equal(f.ctx.location.hash,'/settings');
 assert.equal(f.host.querySelector('[data-saved-count]').textContent,2);
 assert.equal(f.host.querySelector('[data-saved-percent]'),null);
 assert.equal(f.host.querySelector('[data-library-progress]'),null);

 const rail=f.doc.getElementById('open-settings');assert.equal(rail.style.values['--saved-progress'],String(2/3));assert.match(rail.getAttribute('aria-label'),/2 \/ 3/);
 assert.match(f.host.querySelector('[data-space]').textContent,/占用/);
});
test('clear and individual pack deletion still require their original confirmation',async()=>{
 const f=fixture();f.doc.getElementById('open-settings').onclick();await tick();
 await f.host.querySelector('[data-clear-all]').onclick();assert.equal(f.calls.clears,0);assert.match(f.calls.confirms.at(-1),/文字页面、阅读进度、偏好/);
 const remove=f.host.querySelector('[data-packs]').querySelector('button');await remove.onclick();assert.equal(f.calls.deletes,0);assert.match(f.calls.confirms.at(-1),/原始 ZIP/);
 f.setConfirmed(true);await remove.onclick();assert.equal(f.calls.deletes,1);
 await f.host.querySelector('[data-clear-all]').onclick();assert.equal(f.calls.clears,1);assert.equal(f.calls.reloads,1);
});
test('local import still routes through shared run and disables destructive controls until it settles',async()=>{
 const f=fixture();let finish;f.setPending(new Promise(r=>finish=r));const input=f.host.querySelector('input');input.files=[new Blob(['test'])];input.onchange();await tick();assert.equal(f.calls.imports,1);assert.equal(input.disabled,true);assert.equal(f.host.querySelector('[data-clear-all]').disabled,true);assert.equal(f.host.querySelector('[data-cancel]').hidden,false);
 finish({wordIds:[1,2]});await tick();await tick();assert.equal(input.disabled,false);assert.equal(f.host.querySelector('[data-cancel]').hidden,true);assert.equal(f.host.querySelector('[data-reopen]').hidden,true);assert.deepEqual(f.calls.modes,['auto']);
});
test('settings CSS provides 44px controls, 375px gutter, generated asset crop and reduced motion',()=>{
 assert.match(css,/min-height: 44px/);assert.match(css,/padding-right: 66px/);assert.match(css,/botanical-progress-bookmark\.png/);assert.match(css,/background-size: auto 100%/);assert.match(css,/clip-path: inset\(calc\(\(1 - var\(--saved-progress/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/forced-colors: active/);
 const tiny=[...css.matchAll(/font-size:\s*(\d+)px/g)].map(m=>+m[1]).filter(n=>n<14);assert.ok(tiny.every(n=>n>=12));
});

function rows(f){return f.host.querySelector('[data-pages-downloads]').children;}
function assertNoDuplicateProgress(f){
 assert.equal(f.host.querySelector('[data-save-progress]'),null);
 assert.equal(f.host.querySelector('[data-library-progress]'),null);
 assert.equal(f.host.querySelector('[data-saved-count]').textContent,f.data.readyIds.length);
 assert.equal(f.doc.getElementById('open-settings').querySelector('[role=progressbar]').getAttribute('aria-valuenow'),String(f.data.readyIds.length));
}
test('download progress, cancellation and completion belong only to clicked group',async()=>{
 const f=fixture();let finish;f.setDownload(new Promise(r=>finish=r));
 const [first,second]=rows(f);const running=second.querySelector('button').onclick();await tick();
 assert.equal(f.calls.downloads,1);assert.equal(first.querySelector('[data-download-progress]').hidden,true);
 assert.equal(second.querySelector('[data-download-progress]').hidden,false);
 assert.equal(f.host.querySelector('[data-import-progress]').hidden,true);assert.equal(f.host.querySelector('[data-cancel]').hidden,true);
 assert.equal(f.host.querySelector('[data-import-status]').textContent,'');assert.equal(f.host.querySelector('input').disabled,true);
 assert.equal(f.host.querySelector('[data-clear-all]').disabled,true);assert.equal(first.querySelector('button').disabled,true);
 f.progress({phase:'batch',completed:1,total:2});
 assert.equal(second.querySelector('[data-download-progress]').value,1);assert.equal(second.querySelector('[data-download-status]').textContent,'');assertNoDuplicateProgress(f);
 await first.querySelector('button').onclick();assert.equal(f.calls.downloads,1,'repeated competing requests are ignored');
 f.data.total=7;f.data.readyIds=[1,2,101,102];finish({wordIds:[101,102]});await running;
 assert.equal(second.querySelector('[data-download-status]').textContent,'');assert.equal(first.querySelector('[data-download-status]').textContent,'');
 assert.equal(second.querySelector('[data-download-progress]').hidden,true);assert.equal(f.host.querySelector('input').disabled,false);assert.equal(f.calls.activations,1);assert.equal(f.calls.reloads,0);assertNoDuplicateProgress(f);
});
test('import progress stays in import area; download feedback remains empty',async()=>{
 const f=fixture();let finish;f.setPending(new Promise(r=>finish=r));const input=f.host.querySelector('input');input.files=[new Blob(['test'])];const running=input.onchange();await tick();
 f.progress({phase:'verify',completed:1,total:4});assert.equal(f.host.querySelector('[data-import-progress]').value,1);assert.equal(f.host.querySelector('[data-import-status]').textContent,'');
 for(const row of rows(f)){assert.equal(row.querySelector('[data-download-progress]').hidden,true);assert.equal(row.querySelector('[data-download-status]').textContent,'');assert.equal(row.querySelector('button').disabled,true);}
 assertNoDuplicateProgress(f);finish({wordIds:[1,2]});await running;assert.equal(f.host.querySelector('[data-import-status]').textContent,'');assert.equal(f.calls.reloads,0);
});
for(const kind of ['download','import'])for(const outcome of ['failure','cancel'])test(`${kind} ${outcome} is scoped and releases controls`,async()=>{
 const f=fixture();let reject;const pending=new Promise((_,r)=>reject=r);let running,target;
 if(kind==='download'){f.setDownload(pending);target=rows(f)[0];running=target.querySelector('button').onclick();}
 else{f.setPending(pending);const input=f.host.querySelector('input');input.files=[new Blob(['test'])];target=f.host;running=input.onchange();}
 await tick();const status=target.querySelector(kind==='download'?'[data-download-status]':'[data-import-status]');
 if(outcome==='cancel'){target.querySelector(kind==='download'?'[data-download-cancel]':'[data-cancel]').onclick();assert.equal(f.signal.aborted,true);f.progress({phase:'batch',completed:1,total:2});assert.equal(status.textContent,'');}
 reject(new Error('test failure'));await running;
 if(outcome==='cancel')assert.equal(status.textContent,'');else assert.match(status.textContent,/未完成：test failure/);
 assert.equal(f.host.querySelector('input').disabled,false);assert.equal(f.host.querySelector('[data-clear-all]').disabled,false);assertNoDuplicateProgress(f);
 if(kind==='download')assert.equal(f.host.querySelector('[data-import-status]').textContent,'');else for(const row of rows(f))assert.equal(row.querySelector('[data-download-status]').textContent,'');
 assert.equal(f.calls.reloads,0);assert.equal(f.calls.activations,1,'verified partial media is activated without refresh');
});
test('clear is blocked during download and restored after cancellation',async()=>{
 const f=fixture();f.setConfirmed(true);let finish;f.setDownload(new Promise(r=>finish=r));const row=rows(f)[0],running=row.querySelector('button').onclick();await tick();
 await f.host.querySelector('[data-clear-all]').onclick();assert.equal(f.calls.clears,0);row.querySelector('[data-download-cancel]').onclick();finish({wordIds:[]});await running;
 await f.host.querySelector('[data-clear-all]').onclick();assert.equal(f.calls.clears,1);assert.equal(f.calls.reloads,1);for(const row of rows(f))assert.equal(row.querySelector('button').disabled,true);
});

test('completion has no popup, dismiss control or expiry timer',()=>{
 assert.doesNotMatch(source,/library-status-dismiss|data-download-dismiss|data-import-dismiss|2500|已加入|已可离线阅读|这一本书包已经可用/);
});
