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
 const calls={inspections:0,imports:0,downloads:0,activations:0,clears:0,deletes:0,modes:[],reloads:0,confirms:[]};let confirmed=false,releaseFetches=0,importResult={wordIds:[1,2]},pendingImport,pendingDownload,progressOptions,mode='auto',pendingActivation;const events={};
 const data={readyIds:[1,2],total:3,packs:[{wordIds:[1,2],version:'v1',bytes:2048,available:true,ownedCurrentAssets:2,key:'one'}]};
 const ctx=vm.createContext({document:doc,window:{addEventListener(k,fn){events[k]=fn;},dispatchEvent(event){if(event.type==='gre-library-updated'){calls.activations++;if(pendingActivation)event.detail.waits.push(pendingActivation);}}},location:{hash:'',reload(){calls.reloads++;}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},navigator:{storage:{persist:async()=>true},serviceWorker:{addEventListener(){}}},URL,AbortController,DOMException,CustomEvent:class{constructor(t,o){this.type=t;this.detail=o.detail;}},MessageChannel,RELEASES_URL,setTimeout:()=>1,clearTimeout(){},optionalMediaGroups,setMediaEdition(){},videoMode:()=>mode,chooseVideoMode:async value=>{calls.modes.push(value);mode=value;},OFFLINE_EDITION:'v12',createMediaControl:()=>({subscribe(){},ticket:async()=>0,state:async()=>({generation:0})}),batchStatus:async()=>({readyPaths:[]}),inspectLibrary:async()=>{calls.inspections++;return data;},storageStatus:async()=>({usage:1024,quota:10240,persistent:false}),deletePack:async()=>{calls.deletes++;},cleanUnusedPacks:async()=>0,clearSavedResources:async()=>{calls.clears++;},downloadLessons:async(ids,paths,options)=>{calls.downloads++;progressOptions=options;return pendingDownload?await pendingDownload:{wordIds:ids};},importPack:async(file,catalog,options)=>{calls.imports++;progressOptions=options;return pendingImport?await pendingImport:importResult;},mountReleaseDownloads:options=>mountReleaseDownloads({...options,fetcher:async()=>{releaseFetches++;return Response.json([]);}}),confirm:msg=>{calls.confirms.push(msg);return confirmed;}});
 vm.runInContext(source.replace(/^import .*;\n/gm,'').replace('export function','function').replaceAll('import.meta.url',JSON.stringify('https://fixture.test/gre-learning/offline-manager.js'))+'\ninstallOfflineManager({entries:[{number:1},{number:2},{number:3},...[51,52,101,102].map(number=>({number,displayOrdinal:number,storyMedia:{poster:{url:"p"+number,bytes:100},video:{url:"v"+number,bytes:200}}}))]});',ctx);
 return {doc,ctx,calls,data,get host(){return doc.getElementById('offline-settings');},get releases(){return releaseFetches;},setConfirmed(v){confirmed=v;},setActivation(p){pendingActivation=p;},setPending(p){pendingImport=p;},setDownload(p){pendingDownload=p;},progress(p){progressOptions.onProgress(p);},get signal(){return progressOptions.signal;},emit(k,detail){events[k]({detail});}};
}
test('settings has one clean resource drawer, separate import controls and no mixed FAQ',async()=>{
 const f=fixture(),h=f.host,drawer=h.querySelector('.library-pages-downloads');
 assert.ok(h.querySelector('input'));assert.match(source,/导入文件/);assert.equal(drawer.open,false);
 assert.equal(drawer.querySelector('summary').children[0].textContent,'下载资源包');
 assert.equal(h.querySelectorAll('.library-pages-downloads').length,1);assert.ok(h.querySelector('[data-release-browser]'));assert.equal(h.querySelector('[data-release-browser]').open,false);
 assert.equal(drawer.querySelectorAll('details').length,0);assert.ok(drawer.querySelector('[data-pages-downloads]'));
 const release=h.querySelector('[data-release-downloads-slot]');assert.equal(release.parent,h.querySelector('.library-page'));assert.ok(release.querySelector('[data-release-browser]'));assert.equal(drawer.querySelector('[data-release-browser]'),null);assert.equal(h.querySelector('[data-release-page]'),null);assert.match(release.querySelector('summary').children[0].textContent,/从 Release 下载/);
 for(const selector of ['[data-packs]','[data-persist]','[data-storage-retention]','[data-text-ready]'])assert.equal(drawer.querySelector(selector),null);
 assert.doesNotMatch(source,/>更多<|离线阅读帮助|已保存数量只统计|导入后可用飞行模式检查|浏览器与主屏幕应用的保存空间可能不同/);
 assert.equal(h.querySelector('[data-persist]'),null);assert.equal(h.querySelector('[data-library-progress]'),null);
 assert.equal(h.querySelector('.library-packs').hidden,true);f.doc.getElementById('open-settings').onclick();await tick();
 assert.equal(h.querySelector('.library-packs').hidden,false,'existing imported files remain manageable');assert.equal(h.querySelector('.library-packs').open,false);
 f.data.packs=[];f.doc.getElementById('open-settings').onclick();await tick();assert.equal(h.querySelector('.library-packs').hidden,true);
 assert.ok(h.querySelector('[data-clear-all]'));assert.equal(f.releases,0,'no release API or fake download progress in settings');
 assert.doesNotMatch(source,/downloadReleaseAsset|onImport:|data-remote/);
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

test('repeated mode toggles update hidden reading in place without leaving Settings or reloading',async()=>{
 const f=fixture();f.doc.getElementById('open-settings').onclick();await tick();const settings=f.host,button=settings.querySelector('.library-mode-button'),rail=f.doc.getElementById('open-settings'),pack=settings.querySelector('[data-packs]').children[0],inspections=f.calls.inspections,fill=rail.style.values['--saved-progress'];
 let finish;f.setActivation(new Promise(r=>finish=r));const first=button.onclick();await tick();
 assert.equal(button.disabled,true);assert.equal(settings.querySelector('input').disabled,true);assert.equal(settings.querySelector('[data-clear-all]').disabled,true);for(const row of rows(f))assert.equal(row.querySelector('button').disabled,true);
 await button.onclick();assert.deepEqual(f.calls.modes,['none'],'rapid repeats cannot overlap mode changes');
 finish();await first;f.setActivation(null);assert.equal(f.ctx.location.hash,'/settings');assert.equal(f.calls.reloads,0);assert.equal(f.host,settings);assert.equal(settings.querySelector('.library-mode-button'),button);assert.equal(button.textContent,'使用视频');assert.equal(button.disabled,false);
 await button.onclick();assert.deepEqual(f.calls.modes,['none','auto']);assert.equal(button.textContent,'纯文字');assert.equal(f.calls.reloads,0);assert.equal(f.ctx.location.hash,'/settings');assert.equal(f.calls.activations,2);assert.equal(settings.querySelector('[data-mode-status]').textContent,'');assert.equal(f.calls.inspections,inspections,'mode switches never rescan storage');assert.equal(settings.querySelector('[data-packs]').children[0],pack);assert.equal(rail.style.values['--saved-progress'],fill);
});
test('failed in-place mode activation stays in Settings and releases only its locks',async()=>{
 const f=fixture();f.doc.getElementById('open-settings').onclick();await tick();let fail;f.setActivation(new Promise((_,reject)=>fail=reject));const button=f.host.querySelector('.library-mode-button'),running=button.onclick();await tick();fail(new Error('activation failed'));await running;
 assert.equal(f.ctx.location.hash,'/settings');assert.equal(f.calls.reloads,0);assert.match(f.host.querySelector('[data-mode-status]').textContent,/切换未完成/);assert.equal(button.disabled,false);assert.equal(f.host.querySelector('input').disabled,false);assert.equal(f.host.querySelector('[data-clear-all]').disabled,false);assert.equal(f.host.querySelector('[data-import-status]').textContent,'');assert.equal(f.host.querySelector('[data-status]').textContent,'');
});

test('separate Release drawer refreshes a read-only list without starting any import or Pages progress',async()=>{
 const f=fixture(),drawer=f.host.querySelector('[data-release-browser]');assert.equal(f.releases,0);drawer.open=true;drawer.ontoggle();await tick();assert.equal(f.releases,1);await f.host.querySelector('[data-release-refresh]').onclick();assert.equal(f.releases,2);assert.equal(f.calls.imports,0);assert.equal(f.calls.downloads,0);assert.equal(f.host.querySelector('[data-import-progress]').hidden,true);for(const row of rows(f))assert.equal(row.querySelector('[data-download-progress]').hidden,true);
 assert.match(source,/releaseDownloads\?\.cancelPending\(\)/,'clear explicitly cancels pending metadata');
});

function updateBlocked(f){const detail={blocked:false};f.emit('gre-update-can-reload',detail);return detail.blocked;}
test('automatic update guard tracks actual file picker/import lifecycle',async()=>{
 const f=fixture(),input=f.host.querySelector('input');assert.equal(updateBlocked(f),false);
 input.listeners.click();assert.equal(updateBlocked(f),true);input.listeners.cancel();assert.equal(updateBlocked(f),false);
 let finish;f.setPending(new Promise(resolve=>finish=resolve));input.files=[new Blob(['zip'])];input.listeners.change();const running=input.onchange();await tick();assert.equal(updateBlocked(f),true);
 finish({wordIds:[1,2]});await running;assert.equal(updateBlocked(f),false);
});
test('automatic update guard tracks actual download and mode activation lifecycle',async()=>{
 const f=fixture();let finish;f.setDownload(new Promise(resolve=>finish=resolve));const running=rows(f)[0].querySelector('button').onclick();await tick();assert.equal(updateBlocked(f),true);finish({wordIds:[51,52]});await running;assert.equal(updateBlocked(f),false);
 let activate;f.setActivation(new Promise(resolve=>activate=resolve));const changing=f.host.querySelector('.library-mode-button').onclick();await tick();assert.equal(updateBlocked(f),true);activate();await changing;assert.equal(updateBlocked(f),false);
});
test('automatic update guard remains set through confirmed clear reload',async()=>{const f=fixture();f.setConfirmed(true);await f.host.querySelector('[data-clear-all]').onclick();assert.equal(updateBlocked(f),true);assert.equal(f.calls.reloads,1);});
for(const kind of ['delete','cleanup'])test(`automatic reload stays blocked through ${kind} mutation and final refresh`,async()=>{
 const f=fixture();f.data.packs[0].ownedCurrentAssets=0;f.doc.getElementById('open-settings').onclick();await tick();f.setConfirmed(true);let finish,finishRefresh;
 const original=f.ctx.inspectLibrary;f.ctx[kind==='delete'?'deletePack':'cleanUnusedPacks']=()=>new Promise(resolve=>finish=resolve);
 const running=f.host.querySelector(kind==='delete'?'[data-packs]':'[data-clean]');const task=(kind==='delete'?running.querySelector('button'):running).onclick();await tick();assert.equal(updateBlocked(f),true);assert.equal(f.host.querySelector('input').disabled,true);
 f.ctx.inspectLibrary=()=>new Promise(resolve=>finishRefresh=()=>resolve(f.data));finish(1);await tick();assert.equal(updateBlocked(f),true,'refresh is still within mutation guard');finishRefresh();await task;f.ctx.inspectLibrary=original;assert.equal(updateBlocked(f),false);assert.equal(f.host.querySelector('input').disabled,false);
});
for(const kind of ['delete','cleanup'])test(`${kind} failure releases reload guard and controls`,async()=>{
 const f=fixture();f.data.packs[0].ownedCurrentAssets=0;f.doc.getElementById('open-settings').onclick();await tick();f.setConfirmed(true);f.ctx[kind==='delete'?'deletePack':'cleanUnusedPacks']=async()=>{throw new Error('storage unavailable');};const target=f.host.querySelector(kind==='delete'?'[data-packs]':'[data-clean]');await(kind==='delete'?target.querySelector('button'):target).onclick();assert.equal(updateBlocked(f),false);assert.equal(f.host.querySelector('input').disabled,false);assert.match(f.host.querySelector('[data-status]').textContent,/storage unavailable/);
});
test('expanded Settings drawers are captured and restored before asynchronous layout settles',async()=>{
 const f=fixture(),selectors=['.library-page','.library-pages-downloads','[data-release-browser]','.library-packs'];for(const selector of selectors)f.host.querySelector(selector).open=true;
 const position={};f.emit('gre-update-capture',position);for(const selector of selectors){assert.equal(position.drawers[selector],true);f.host.querySelector(selector).open=false;}
 let resolveLibrary;f.ctx.inspectLibrary=()=>new Promise(resolve=>resolveLibrary=()=>resolve(f.data));const detail={position,waits:[]};f.emit('gre-update-restore',detail);for(const selector of selectors)assert.equal(f.host.querySelector(selector).open,true);assert.equal(detail.waits.length,1);let settled=false;const pending=Promise.all(detail.waits).then(()=>settled=true);await tick();assert.equal(settled,false);assert.equal(f.releases,1,'one bounded read restores Release list height');resolveLibrary();await pending;assert.equal(f.host.querySelector('.library-packs').hidden,false);assert.equal(settled,true);
});
