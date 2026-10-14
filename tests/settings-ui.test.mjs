import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=process.env.GRE_IMPLEMENTATION_DIR||fileURLToPath(new URL('../',import.meta.url));
const source=await readFile(root+'/gre-learning/offline-manager.js','utf8');
const exportSource=await readFile(root+'/gre-learning/offline-export-ui.js','utf8');
const rangeSource=await readFile(root+'/gre-learning/offline-range.js','utf8');
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
 matches(s){const qualified=s.match(/^([\w-]+)(\[.+\])$/);if(qualified)return this.tagName===qualified[1]&&this.matches(qualified[2]);if(s.startsWith('#'))return this.id===s.slice(1);if(s.startsWith('.'))return this.className.split(' ').includes(s.slice(1));if(s.startsWith('[')){const [k,v]=s.slice(1,-1).split('=');return k in this.attributes&&(!v||this.attributes[k]===v.replaceAll('"',''));}return this.tagName===s;}
 querySelectorAll(s){return this.children.flatMap(n=>[...(n.matches(s)?[n]:[]),...n.querySelectorAll(s)]);}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 addEventListener(k,fn){this.listeners[k]=fn;}
 set innerHTML(s){this.children=[];const stack=[this];for(const token of s.match(/<[^>]*>|[^<]+/g)||[]){if(token.startsWith('</')){stack.pop();continue;}if(token.startsWith('<')){const tag=token.match(/^<([\w-]+)/)?.[1];if(!tag)continue;const node=new Element(tag,this.ownerDocument);for(const m of token.matchAll(/([\w-]+)(?:="([^"]*)"|='([^']*)')?/g)){if(m.index===1)continue;node.setAttribute(m[1],m[2]??m[3]??'');}node.hidden='hidden'in node.attributes;node.open='open'in node.attributes;stack.at(-1).append(node);if(!['input','link','br','img'].includes(tag))stack.push(node);}else stack.at(-1).textContent+=token;}}
}
const tick=()=>new Promise(r=>setImmediate(r));
function fixture({allHosted=true,first50=false}={}){
 const doc={createElement:tag=>new Element(tag,doc)};doc.root=new Element('document',doc);doc.head=new Element('head',doc);doc.root.append(doc.head);doc.querySelector=s=>doc.root.querySelector(s);doc.getElementById=id=>doc.querySelector('#'+id);const contents=new Element('div',doc);contents.className='contents-tools';doc.root.append(contents);const nav=new Element('nav',doc),search=new Element('button',doc);search.id='open-search';doc.root.append(nav);nav.append(search);
 const calls={inspections:0,imports:0,downloads:0,activations:0,clears:0,selective:[],deletes:0,cleanups:0,exports:0,exportCleanups:0,objectURLs:[],revokedURLs:[],modes:[],reloads:0,confirms:[]};let pendingClear,clearError,confirmed=false,releaseFetches=0,importResult={wordIds:[1,2]},pendingImport,pendingDownload,pendingExport,progressOptions,exportOptions,clearOptions,mode='auto',pendingActivation;const events={};
 const exportResult={complete:2,packages:[{name:'GRE-1-2.zip',file:new Blob(['saved resources'])}],cleanup:async()=>{calls.exportCleanups++;}};
 class FixtureURL extends URL{static createObjectURL(file){const url='blob:settings-export-'+(calls.objectURLs.length+1);calls.objectURLs.push({url,file});return url;}static revokeObjectURL(url){calls.revokedURLs.push(url);}}
 const data={readyIds:[1,2],total:3,packs:[{wordIds:[1,2],version:'v1',bytes:2048,available:true,ownedCurrentAssets:2,key:'one'}]};
 if(first50){data.readyIds=Array.from({length:50},(_,i)=>1000+i);data.total=51;}
 const ctx=vm.createContext({document:doc,window:{addEventListener(k,fn){events[k]=fn;},dispatchEvent(event){if(event.type==='gre-library-updated'){calls.activations++;if(pendingActivation)event.detail.waits.push(pendingActivation);}}},location:{hash:'',reload(){calls.reloads++;}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},navigator:{storage:{persist:async()=>true},serviceWorker:{addEventListener(){}}},URL:FixtureURL,File,Blob,AbortController,DOMException,CustomEvent:class{constructor(t,o){this.type=t;this.detail=o.detail;}},MessageChannel,RELEASES_URL,setTimeout:()=>1,clearTimeout(){},optionalMediaGroups:catalog=>optionalMediaGroups(catalog).map(group=>({...group,hostedAvailable:allHosted||group.hostedAvailable})),setMediaEdition(){},videoMode:()=>mode,chooseVideoMode:async value=>{calls.modes.push(value);mode=value;},OFFLINE_EDITION:'v12',createMediaControl:()=>({subscribe(){},ticket:async()=>0,state:async()=>({generation:0})}),batchStatus:async()=>({readyPaths:[]}),inspectLibrary:async()=>{calls.inspections++;return data;},storageStatus:async()=>({usage:1024,quota:10240,persistent:false}),deletePack:async()=>{calls.deletes++;},cleanUnusedPacks:async()=>{calls.cleanups++;return 0;},clearSavedResources:async()=>{calls.clears++;},clearSavedWords:async(catalog,ids,options)=>{calls.selective.push([...ids]);clearOptions=options;if(pendingClear)await pendingClear;if(clearError)throw clearError;if(options?.signal?.aborted)throw new DOMException('Cancelled','AbortError');data.readyIds=data.readyIds.filter(id=>!ids.includes(id));return {removedAssets:ids.length*3};},downloadLessons:async(ids,paths,options)=>{calls.downloads++;progressOptions=options;return pendingDownload?await pendingDownload:{wordIds:ids};},importPack:async(file,catalog,options)=>{calls.imports++;progressOptions=options;return pendingImport?await pendingImport:importResult;},exportSavedResources:async(catalog,options)=>{calls.exports++;exportOptions=options;return pendingExport?await pendingExport:exportResult;},mountReleaseDownloads:options=>mountReleaseDownloads({...options,fetcher:async()=>{releaseFetches++;return Response.json([]);}}),confirm:msg=>{calls.confirms.push(msg);return confirmed;}});
 vm.runInContext(rangeSource.replaceAll('export function','function'),ctx);
 vm.runInContext(exportSource.replace(/^import .*;\n/gm,'').replace('export function','function'),ctx);
 vm.runInContext(source.replace(/^import .*;\n/gm,'').replace('export function','function').replaceAll('import.meta.url',JSON.stringify('https://fixture.test/gre-learning/offline-manager.js'))+(first50?'\ninstallOfflineManager({entries:Array.from({length:51},(_,i)=>({number:1000+i,displayOrdinal:i+1,storyMedia:{poster:{url:"p"+i,bytes:100},video:{url:"v"+i,bytes:200}}}))});':'\ninstallOfflineManager({entries:[{number:1},{number:2},{number:3},...[51,52,101,102].map(number=>({number,displayOrdinal:number,storyMedia:{poster:{url:"p"+number,bytes:100},video:{url:"v"+number,bytes:200}}}))]});'),ctx);
 if(!first50){const end=doc.getElementById('offline-settings').querySelector('[data-export-end]');end.value='3';end.listeners.input();}
 return {doc,ctx,calls,data,exportResult,clearProgress(p){clearOptions.onProgress(p);},get clearSignal(){return clearOptions?.signal;},get exportOptions(){return exportOptions;},setExport(p){pendingExport=p;},exportProgress(p){exportOptions.onProgress(p);},get exportSignal(){return exportOptions?.signal;},get host(){return doc.getElementById('offline-settings');},get releases(){return releaseFetches;},setClear(p,error){pendingClear=p;clearError=error;},setConfirmed(v){confirmed=v;},setActivation(p){pendingActivation=p;},setPending(p){pendingImport=p;},setDownload(p){pendingDownload=p;},progress(p){progressOptions.onProgress(p);},get signal(){return progressOptions.signal;},emit(k,detail){events[k]({detail});}};
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

test('retired Pages ranges show import guidance with no enabled or visible stale download action',async()=>{
 const f=fixture({allHosted:false});await tick();
 for(const row of rows(f)){const button=row.querySelector('button');assert.equal(button.hidden,true);assert.equal(button.disabled,true);assert.match(row.querySelector('span').textContent,/请从下方下载资源包后导入/);await button.onclick();}
 assert.equal(f.calls.downloads,0);assert.ok(f.host.querySelector('[data-release-browser]'));assert.equal(f.host.querySelector('input').disabled,false);
 f.data.readyIds=[51,52];f.doc.getElementById('open-settings').onclick();await tick();assert.match(rows(f)[0].querySelector('span').textContent,/已保存到本机/);assert.equal(rows(f)[0].querySelector('button').hidden,true);
});

function setRange(f,prefix,start,end){const h=f.host,a=h.querySelector(`[data-${prefix}-start]`),b=h.querySelector(`[data-${prefix}-end]`);a.value=String(start);b.value=String(end);a.listeners.input();b.listeners.input();return h.querySelector(`[data-${prefix}]`);}
test('saved download rows never hide deletion; range delete names selected ordinals and refreshes in place',async()=>{
 const f=fixture({first50:true});f.doc.getElementById('open-settings').onclick();await tick();
 const first=rows(f)[0];assert.equal(first.querySelector('button').textContent,'已保存');assert.equal(first.querySelector('button').disabled,true);await first.querySelector('button').onclick();assert.equal(f.calls.selective.length,0);
 const button=setRange(f,'range-delete',13,17),range=f.host.querySelector('[data-delete-range]');range.open=true;
 assert.equal(button.textContent,'删除 13–17');assert.equal(button.disabled,false);let finish;f.setClear(new Promise(resolve=>finish=resolve));const running=button.onclick();await tick();
 assert.deepEqual(f.calls.selective[0],[1012,1013,1014,1015,1016]);assert.equal(updateBlocked(f),true);assert.equal(f.host.querySelector('input').disabled,true);assert.equal(f.host.querySelector('[data-export]').disabled,true);
 assert.equal(f.host.querySelector('[data-range-delete-progress]').hidden,false);assert.equal(first.querySelector('[data-download-progress]').hidden,true);assert.equal(f.host.querySelector('[data-import-progress]').hidden,true);
 f.clearProgress({phase:'delete',completed:7,total:15});assert.equal(f.host.querySelector('[data-range-delete-progress]').value,7);assert.equal(f.host.querySelector('[data-range-delete-status]').textContent,'删除 7/15');assert.equal(f.host.querySelector('[data-range-delete-cancel]').hidden,true);
 await button.onclick();assert.equal(f.calls.selective.length,1);finish();await running;
 assert.equal(f.host.querySelector('[data-saved-count]').textContent,45);assert.equal(first.querySelector('button').textContent,'继续下载 45/50');assert.equal(button.disabled,false);assert.equal(range.open,true);assert.equal(f.host.querySelector('[data-range-delete-start]').value,'13');
 assert.equal(f.calls.confirms.length,0);assert.equal(f.calls.reloads,0);assert.equal(f.calls.clears,0);assert.deepEqual(f.calls.modes,[]);assert.equal(f.ctx.location.hash,'/settings');assert.equal(updateBlocked(f),false);assertNoDuplicateProgress(f);
});
test('range validation blocks blank, fractions, exponent, bounds and reversed selections before mutation',async()=>{
 const f=fixture({first50:true}),h=f.host,button=h.querySelector('[data-range-delete]');assert.equal(button.disabled,true);assert.equal(h.querySelector('[data-range-delete-start]').value,'');
 for(const [start,end] of [['',''],['1.5','2'],['1e1','20'],['0','2'],['1','52'],['8','7']]){setRange(f,'range-delete',start,end);assert.equal(button.disabled,true);await button.onclick();}
 assert.equal(f.calls.selective.length,0);assert.equal(f.calls.activations,0);assert.equal(updateBlocked(f),false);
 setRange(f,'range-delete',51,51);assert.equal(button.disabled,false);assert.equal(button.textContent,'删除 51–51');
});
test('range cancellation and errors stay local and unlock controls without navigation',async()=>{
 for(const outcome of ['cancel','error']){const f=fixture({first50:true});f.doc.getElementById('open-settings').onclick();await tick();const button=setRange(f,'range-delete',2,4);let finish;f.setClear(new Promise(resolve=>finish=resolve),outcome==='error'?new Error('quota'):null);const running=button.onclick();await tick();
 if(outcome==='cancel'){f.host.querySelector('[data-range-delete-cancel]').onclick();assert.equal(f.clearSignal.aborted,true);}finish();await running;
 assert.equal(f.host.querySelector('[data-range-delete-status]').textContent,outcome==='error'?'删除未完成：quota':'');assert.equal(f.host.querySelector('[data-status]').textContent,'');assert.equal(button.disabled,false);assert.equal(f.host.querySelector('input').disabled,false);assert.equal(f.calls.reloads,0);assert.equal(f.ctx.location.hash,'/settings');assert.equal(updateBlocked(f),false);assert.equal(f.data.readyIds.length,50);}
});
for(const kind of ['download','import','export'])test(`range delete respects active ${kind} and cannot run a competing action`,async()=>{
 const f=fixture({first50:true});f.doc.getElementById('open-settings').onclick();await tick();const button=setRange(f,'range-delete',10,12);let finish;const pending=new Promise(resolve=>finish=resolve);let running;
 if(kind==='download'){f.setDownload(pending);running=rows(f)[1].querySelector('button').onclick();}else if(kind==='import'){f.setPending(pending);const input=f.host.querySelector('input');input.files=[new Blob(['test'])];running=input.onchange();}else{f.setExport(pending);running=f.host.querySelector('[data-export]').onclick();}
 await tick();assert.equal(button.disabled,true);assert.equal(f.host.querySelector('[data-range-delete-start]').disabled,true);await button.onclick();assert.equal(f.calls.selective.length,0);finish(kind==='export'?f.exportResult:{wordIds:[]});await running;assert.equal(button.disabled,false);
});
test('range deletion blocks imports, downloads, export, full clear and mode changes until refreshed',async()=>{
 const f=fixture({first50:true});f.doc.getElementById('open-settings').onclick();await tick();let finish;f.setClear(new Promise(resolve=>finish=resolve));const running=setRange(f,'range-delete',7,9).onclick();await tick();
 const h=f.host;await h.querySelector('[data-export]').onclick();await h.querySelector('[data-clear-all]').onclick();await h.querySelector('.library-mode-button').onclick();const input=h.querySelector('input');input.files=[new Blob(['test'])];await input.onchange();await rows(f)[1].querySelector('button').onclick();
 assert.equal(f.calls.exports,0);assert.equal(f.calls.clears,0);assert.equal(f.calls.imports,0);assert.equal(f.calls.downloads,0);assert.deepEqual(f.calls.modes,[]);finish();await running;assert.equal(updateBlocked(f),false);
});
test('export range uses the same fields, freezes selection, and reports progress only in its drawer',async()=>{
 const f=fixture({first50:true}),h=f.host;const button=setRange(f,'export',20,25);assert.equal(button.textContent,'导出 20–25');let finish;f.setExport(new Promise(resolve=>finish=resolve));const running=button.onclick();await tick();
 assert.equal(JSON.stringify(f.exportOptions.range),JSON.stringify({start:20,end:25}));assert.equal(h.querySelector('[data-export-start]').disabled,true);assert.equal(h.querySelector('[data-range-delete]').disabled,true);f.exportProgress({phase:'scan',completed:3,total:6});assert.equal(h.querySelector('[data-export-status]').textContent,'检查 3/6');assert.equal(h.querySelector('[data-range-delete-status]').textContent,'');
 finish(f.exportResult);await running;assert.equal(h.querySelector('[data-export-start]').disabled,false);assert.equal(h.querySelector('[data-export-start]').value,'20');await h.querySelector('[data-export-close]').onclick();
});
test('both range drawers retain open state across update capture and restore',async()=>{
 const f=fixture({first50:true}),h=f.host;h.querySelector('[data-export-range]').open=true;h.querySelector('[data-delete-range]').open=true;const capture={};f.emit('gre-update-capture',capture);h.querySelector('[data-export-range]').open=false;h.querySelector('[data-delete-range]').open=false;const restore={position:{drawers:capture.drawers},waits:[]};f.emit('gre-update-restore',restore);await Promise.all(restore.waits);assert.equal(h.querySelector('[data-export-range]').open,true);assert.equal(h.querySelector('[data-delete-range]').open,true);
});

test('each committed download word updates saved count and vine immediately without storage rescan or remount',async()=>{
 const f=fixture();f.data.total=7;let finish;f.setDownload(new Promise(resolve=>finish=resolve));const row=rows(f)[0],running=row.querySelector('button').onclick();await tick();
 const inspections=f.calls.inspections,packNode=f.host.querySelector('[data-packs]').children[0],rail=f.doc.getElementById('open-settings');
 f.progress({phase:'batch',completed:1,total:2});assert.equal(f.host.querySelector('[data-saved-count]').textContent,2,'transfer counters alone are not committed readiness');
 f.progress({phase:'batch',completed:1,total:2,readyId:51,generation:99});assert.equal(f.host.querySelector('[data-saved-count]').textContent,2,'stale generation ignored');
 f.progress({phase:'batch',completed:1,total:2,readyId:101,generation:0});assert.equal(f.host.querySelector('[data-saved-count]').textContent,2,'unrelated group ignored');
 f.progress({phase:'batch',completed:1,total:2,readyId:51,generation:0});assert.equal(f.host.querySelector('[data-saved-count]').textContent,3);assert.equal(rail.style.values['--saved-progress'],String(3/7));
 f.progress({phase:'batch',completed:1,total:2,readyId:51,generation:0});assert.equal(f.host.querySelector('[data-saved-count]').textContent,3,'duplicate receipt never double counts');
 assert.equal(f.calls.inspections,inspections);assert.equal(f.host.querySelector('[data-packs]').children[0],packNode);assert.equal(row.querySelector('[data-download-progress]').hidden,false);
 f.data.readyIds=[1,2,51];row.querySelector('[data-download-cancel]').onclick();f.progress({phase:'batch',completed:2,total:2,readyId:52,generation:0});assert.equal(f.host.querySelector('[data-saved-count]').textContent,3,'late cancelled receipt ignored');
 finish({});await running;assert.equal(f.host.querySelector('[data-saved-count]').textContent,3);
});
test('uncommitted ZIP import progress never changes whole-vine saved fraction',async()=>{
 const f=fixture();let finish;f.setPending(new Promise(resolve=>finish=resolve));const input=f.host.querySelector('input');input.files=[new Blob(['zip'])];const running=input.onchange();await tick();
 const rail=f.doc.getElementById('open-settings'),before=rail.style.values['--saved-progress'];f.progress({phase:'batch',completed:1,total:2,readyId:51,generation:0});assert.equal(rail.style.values['--saved-progress'],before);
 finish({});await running;
});

test('saved export owns manager mutation and reload guards while leaving route, source totals and other progress untouched',async()=>{
 const f=fixture({first50:true});f.data.packs[0].ownedCurrentAssets=0;f.doc.getElementById('open-settings').onclick();await tick();f.setConfirmed(true);
 const h=f.host,input=h.querySelector('input'),clear=h.querySelector('[data-clear-all]'),clean=h.querySelector('[data-clean]'),remove=h.querySelector('[data-packs]').querySelector('button'),mode=h.querySelector('.library-mode-button');
 const rail=f.doc.getElementById('open-settings'),saved=h.querySelector('[data-saved-count]').textContent,fill=rail.style.values['--saved-progress'],state=JSON.stringify(f.data),inspections=f.calls.inspections;
 const importProgress=h.querySelector('[data-import-progress]'),importStatus=h.querySelector('[data-import-status]');importProgress.max=9;importProgress.value=4;importStatus.textContent='prior import feedback';
 const others=rows(f).map(row=>({progress:row.querySelector('[data-download-progress]'),status:row.querySelector('[data-download-status]')}));
 for(const {progress,status} of others){progress.max=17;progress.value=8;status.textContent='prior group feedback';}
 let finish;f.setExport(new Promise(resolve=>finish=resolve));const exporting=h.querySelector('[data-export]').onclick();
 assert.equal(updateBlocked(f),true,'export claims manager guard before its first await');
 for(const control of [input,clear,clean,remove,mode,...rows(f).map(row=>row.querySelector('button'))])assert.equal(control.disabled,true);
 await clear.onclick();await clean.onclick();await remove.onclick();await mode.onclick();input.files=[new Blob(['unrequested import'])];await input.onchange();for(const row of rows(f))await row.querySelector('button').onclick();
 assert.equal(f.calls.clears,0);assert.equal(f.calls.cleanups,0);assert.equal(f.calls.deletes,0);assert.equal(f.calls.imports,0);assert.equal(f.calls.downloads,0);assert.deepEqual(f.calls.selective,[]);assert.deepEqual(f.calls.modes,[]);assert.equal(f.calls.confirms.length,0);assert.equal(f.calls.inspections,inspections);
 await tick();assert.equal(f.calls.exports,1);assert.equal(h.querySelector('[data-export]').onclick(),undefined);
 f.exportProgress({phase:'batch',completed:1,total:2,readyId:1050,generation:0});assert.equal(h.querySelector('[data-export-progress]').value,1);assert.equal(h.querySelector('[data-export-progress]').hidden,false);
 assert.equal(importProgress.value,4);assert.equal(importProgress.max,9);assert.equal(importProgress.hidden,true);assert.equal(importStatus.textContent,'prior import feedback');
 for(const {progress,status} of others){assert.equal(progress.value,8);assert.equal(progress.max,17);assert.equal(progress.hidden,true);assert.equal(status.textContent,'prior group feedback');}
 assert.equal(h.querySelector('[data-saved-count]').textContent,saved);assert.equal(rail.style.values['--saved-progress'],fill);assert.equal(JSON.stringify(f.data),state);assert.equal(f.ctx.location.hash,'/settings');assert.equal(f.calls.reloads,0);assert.equal(f.calls.activations,0);
 finish(f.exportResult);await exporting;
 assert.equal(updateBlocked(f),false);for(const control of [input,clear,clean,remove,mode,rows(f)[1].querySelector('button')])assert.equal(control.disabled,false);assert.equal(rows(f)[0].querySelector('button').disabled,true);
 assert.equal(h.querySelector('[data-export-progress]').hidden,true);assert.equal(h.querySelector('[data-export-files]').querySelectorAll('a').length,1);assert.equal(h.querySelector('[data-export-status]').textContent,'已整理 2 词 · 1 个包');
 await h.querySelector('[data-export-close]').onclick();assert.equal(f.calls.exportCleanups,0);assert.deepEqual(f.calls.revokedURLs,[]);assert.equal(h.querySelector('[data-export-files]').hidden,true);await h.querySelector('[data-export-close]').onclick();assert.equal(h.querySelector('[data-export-files]').hidden,false);assert.equal(JSON.stringify(f.data),state);assert.equal(f.ctx.location.hash,'/settings');assert.equal(f.calls.reloads,0);assert.equal(rail.style.values['--saved-progress'],fill);
});

test('export cancellation during a queued Web Lock releases manager controls and update guard without navigation',async()=>{
 const f=fixture();f.doc.getElementById('open-settings').onclick();await tick();const h=f.host,fill=f.doc.getElementById('open-settings').style.values['--saved-progress'];let requested;
 f.ctx.navigator.locks={request:(name,{signal},action)=>{requested={name,signal,action};return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));}};
 const exporting=h.querySelector('[data-export]').onclick();await tick();assert.equal(requested.name,'gre-offline-pack-index-v1');assert.equal(f.calls.exports,0);assert.equal(updateBlocked(f),true);assert.equal(h.querySelector('input').disabled,true);assert.equal(h.querySelector('[data-clear-all]').disabled,true);
 h.querySelector('[data-export-cancel]').onclick();assert.equal(requested.signal.aborted,true);await exporting;
 assert.equal(updateBlocked(f),false);assert.equal(h.querySelector('input').disabled,false);assert.equal(h.querySelector('[data-clear-all]').disabled,false);assert.equal(h.querySelector('[data-export-status]').textContent,'');assert.equal(h.querySelector('[data-export-progress]').hidden,true);assert.equal(h.querySelector('[data-export-files]').children.length,0);
 assert.equal(f.calls.exports,0);assert.equal(f.calls.reloads,0);assert.equal(f.ctx.location.hash,'/settings');assert.equal(f.doc.getElementById('open-settings').style.values['--saved-progress'],fill);assertNoDuplicateProgress(f);
 delete f.ctx.navigator.locks;await h.querySelector('[data-export]').onclick();assert.equal(f.calls.exports,1);assert.equal(updateBlocked(f),false);await h.querySelector('[data-export-close]').onclick();assert.equal(f.calls.exportCleanups,0);
});

test('export respects an existing import guard and releases its own manager guard after failure',async()=>{
 const f=fixture();f.doc.getElementById('open-settings').onclick();await tick();const h=f.host,input=h.querySelector('input');let finishImport;f.setPending(new Promise(resolve=>finishImport=resolve));input.files=[new Blob(['import'])];const importing=input.onchange();await tick();
 assert.equal(h.querySelector('[data-export]').onclick(),undefined);assert.equal(f.calls.exports,0);assert.equal(updateBlocked(f),true);
 finishImport({wordIds:[1,2]});await importing;assert.equal(updateBlocked(f),false);
 const before=f.doc.getElementById('open-settings').style.values['--saved-progress'];let fail;f.setExport(new Promise((resolve,reject)=>fail=reject));const exporting=h.querySelector('[data-export]').onclick();await tick();assert.equal(f.calls.exports,1);assert.equal(updateBlocked(f),true);assert.equal(input.disabled,true);
 f.exportProgress({phase:'pack',completed:1,total:3});assert.equal(h.querySelector('[data-export-progress]').value,1);assert.equal(h.querySelector('[data-import-progress]').hidden,true);for(const row of rows(f))assert.equal(row.querySelector('[data-download-progress]').hidden,true);
 fail(new Error('export source unavailable'));await exporting;
 assert.equal(updateBlocked(f),false);assert.equal(input.disabled,false);assert.equal(h.querySelector('[data-clear-all]').disabled,false);assert.equal(h.querySelector('[data-export-status]').textContent,'导出未完成：export source unavailable');assert.equal(h.querySelector('[data-import-status]').textContent,'');assert.equal(h.querySelector('[data-export-progress]').hidden,true);assert.equal(h.querySelector('[data-export-files]').children.length,0);
 assert.equal(f.ctx.location.hash,'/settings');assert.equal(f.calls.reloads,0);assert.equal(f.calls.activations,1,'only the earlier import activates media');assert.deepEqual(f.calls.modes,['auto']);assert.equal(f.doc.getElementById('open-settings').style.values['--saved-progress'],before);assertNoDuplicateProgress(f);
 await h.querySelector('[data-clear-all]').onclick();assert.equal(f.calls.confirms.length,1,'normal controls are usable again after export failure');assert.equal(f.calls.clears,0,'confirmation still protects source deletion');
});

test('export and delete share compact accessible range controls and peer settings typography',()=>{
 const f=fixture({first50:true}),h=f.host;
 for(const prefix of ['export','range-delete']){
  const start=h.querySelector(`[data-${prefix}-start]`),end=h.querySelector(`[data-${prefix}-end]`);
  assert.equal(start.getAttribute('aria-label'),'起始词序号');assert.equal(end.getAttribute('aria-label'),'结束词序号');assert.equal(start.max,'51');assert.equal(end.max,'51');
  assert.equal(start.parent.className,'library-range-fields');assert.equal(start.parent,end.parent);assert.equal(h.querySelector(`[data-${prefix}-status]`).textContent,'');
 }
 assert.match(css,/--settings-action-size:16px/);assert.match(css,/--settings-action-leading:1\.5/);assert.match(css,/grid-template-columns:minmax\(0,1fr\) auto minmax\(0,1fr\)/);assert.match(css,/library-range-feedback \[hidden\]\{display:none\}/);
 assert.equal(h.querySelector('[data-export-range]').open,false);assert.equal(h.querySelector('[data-delete-range]').open,false);
 assert.equal(h.querySelector('[data-range-delete-start]').value,'');assert.equal(h.querySelector('[data-range-delete-end]').value,'');
});
test('invalid export ranges do not start work, reserve a lock, or clear previous output',async()=>{
 const f=fixture({first50:true}),h=f.host;await h.querySelector('[data-export]').onclick();const link=h.querySelector('[data-export-files]').querySelector('a');
 for(const [start,end] of [['',''],['2.5','9'],['4','3'],['1','52']]){const button=setRange(f,'export',start,end);assert.equal(button.disabled,true);await button.onclick();}
 assert.equal(f.calls.exports,1);assert.equal(f.calls.exportCleanups,0);assert.equal(h.querySelector('[data-export-files]').querySelector('a'),link);assert.equal(f.calls.revokedURLs.length,0);assert.equal(updateBlocked(f),false);
});
