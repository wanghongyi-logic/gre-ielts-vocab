// Export presentation lifetime tests. Real range/UI modules, synthetic files,
// isolated VM globals: no browser, source storage, network, or real user data.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {File} from 'node:buffer';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

const root=process.env.GRE_IMPLEMENTATION_DIR||fileURLToPath(new URL('../',import.meta.url));
const rangeSource=await readFile(root+'/gre-learning/offline-range.js','utf8');
const uiSource=await readFile(root+'/gre-learning/offline-export-ui.js','utf8');
const executable=source=>source.replace(/^import .*;\s*$/gm,'').replace(/\bexport (?=(?:async )?function\b|const\b|let\b|class\b)/g,'');

class Events {
 constructor(){this.listeners=new Map();}
 addEventListener(type,listener,options={}){const list=this.listeners.get(type)||[];list.push({listener,once:options?.once});this.listeners.set(type,list);}
 removeEventListener(type,listener){this.listeners.set(type,(this.listeners.get(type)||[]).filter(item=>item.listener!==listener));}
 dispatchEvent(event){
  event.target??=this;event.currentTarget=this;
  const returns=[];
  for(const item of [...(this.listeners.get(event.type)||[])]){returns.push(item.listener.call(this,event));if(item.once)this.removeEventListener(event.type,item.listener);}
  if(typeof this['on'+event.type]==='function')returns.push(this['on'+event.type](event));
  return returns;
 }
}
class Element extends Events {
 constructor(tag){super();this.tagName=tag.toUpperCase();this.attributes=new Map();this.dataset={};this.children=[];this.parentNode=null;this.hidden=false;this.disabled=false;this.open=false;this._text='';this._value='';}
 set innerHTML(html){
  this.replaceChildren();const stack=[this];
  for(const token of html.match(/<[^>]+>|[^<]+/g)||[]){
   if(token.startsWith('</')){stack.pop();continue;}
   if(token.startsWith('<')){
    const match=token.match(/^<([\w-]+)(.*)>$/);if(!match)continue;
    const [,tag,rest]=match,node=new Element(tag);
    for(const attr of rest.matchAll(/([\w-]+)(?:="([^"]*)"|'([^']*)')?/g))node.setAttribute(attr[1],attr[2]??attr[3]??'');
    stack.at(-1).append(node);if(!['input','br','hr','img','link'].includes(tag))stack.push(node);
   }else stack.at(-1)._text+=token;
  }
 }
 set textContent(value){this.replaceChildren();this._text=String(value);}
 get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
 set value(value){this._value=this.tagName==='PROGRESS'?Number(value):String(value);this.attributes.set('value',String(value));}
 get value(){return this._value;}
 setAttribute(name,value){
  this.attributes.set(name,String(value));
  if(name==='class')this.className=String(value);
  if(['hidden','disabled','open'].includes(name))this[name]=true;
  if(name==='value')this.value=value;
  if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=String(value);
 }
 getAttribute(name){return this.attributes.get(name)??null;}
 removeAttribute(name){this.attributes.delete(name);if(name==='value')this._value=this.tagName==='PROGRESS'?0:'';if(['hidden','disabled','open'].includes(name))this[name]=false;}
 hasAttribute(name){return this.attributes.has(name);}
 append(...nodes){for(const node of nodes){if(node.tagName==='#FRAGMENT'){this.append(...[...node.children]);continue;}node.remove();node.parentNode=this;this.children.push(node);}}
 appendChild(node){this.append(node);return node;}
 replaceChildren(...nodes){for(const child of this.children)child.parentNode=null;this.children=[];this._text='';this.append(...nodes);}
 after(node){assert.ok(this.parentNode,'after requires a mounted element');node.remove();const siblings=this.parentNode.children;node.parentNode=this.parentNode;siblings.splice(siblings.indexOf(this)+1,0,node);}
 remove(){if(this.parentNode){const children=this.parentNode.children;children.splice(children.indexOf(this),1);this.parentNode=null;}}
 contains(node){return this===node||this.children.some(child=>child.contains(node));}
 matches(selector){
  if(selector.startsWith('.'))return this.className?.split(' ').includes(selector.slice(1));
  if(selector.startsWith('[')){const match=selector.match(/^\[([^=\]]+)(?:=["']?([^"'\]]+)["']?)?\]$/);return !!match&&this.hasAttribute(match[1])&&(match[2]===undefined||this.getAttribute(match[1])===match[2]);}
  return this.tagName===selector.toUpperCase();
 }
 querySelectorAll(selector){return this.children.flatMap(child=>[...(child.matches(selector)?[child]:[]),...child.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
}
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const aborted=()=>new DOMException('Cancelled','AbortError');
const catalogFixture=()=>({
 release:'174',learningRelease:{standardVersion:'synthetic-standard-v1'},
 entries:[419,19,3701,802].map((number,index)=>({number,displayOrdinal:index+1,word:`fixture-${number}`,standardVersion:'synthetic-standard-v1',storyMedia:{
  poster:{url:`story-media/${number}.webp`,bytes:19+index,sha256:String(index+1).repeat(64)},
  video:{url:`story-media/${number}.mp4`,bytes:29+index,sha256:String(index+5).repeat(64)},
  staticPoster:{url:`story-media/${number}.png`,bytes:39+index,sha256:String(index+1).repeat(64)}
 }}))
});

function fixture(options={}){
 const calls=[],created=[],revoked=[],results=[],mounts=[],busyChanges=[],liveURLs=new Set();
 let exporter=options.exporter,createURL=options.createURL,externalBusy=false,sharedBusy=false;
 const forbidden=()=>{throw new Error('Export UI must not access source storage, navigation, or preferences');};
 const window=new Events(),document={createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element('#fragment')};
 const sourceState={savedIds:[419,19,3701,802],cacheKeys:['source-video'],packs:['imported-source.zip'],readingWord:19,mode:'auto'},originalState=structuredClone(sourceState);
 class FixtureURL extends URL {
  static createObjectURL(file){createURL?.(file,created.length);const url=`blob:export-${created.length+1}`;created.push({url,file});liveURLs.add(url);return url;}
  static revokeObjectURL(url){revoked.push(url);liveURLs.delete(url);}
 }
 const makeResult=(name='GRE-1-4.zip',{count=4,packages=1,cleanup}={})=>{
  const result={complete:count,packages:Array.from({length:packages},(_,i)=>({name:i?name.replace('.zip',`-part${i+1}.zip`):name,file:new Blob([`synthetic output ${name} ${i}`])})),cleanupCalls:0,
   async cleanup(){result.cleanupCalls++;await cleanup?.();}};
  results.push(result);return result;
 };
 const ctx=vm.createContext({
  document,window,navigator:{locks:options.locks,canShare:options.canShare,share:options.share,storage:{getDirectory:forbidden}},
  URL:FixtureURL,Blob,File,AbortController,DOMException,console,setTimeout,clearTimeout,
  addEventListener:window.addEventListener.bind(window),removeEventListener:window.removeEventListener.bind(window),
  location:{get hash(){return '#/settings';},set hash(value){forbidden(value);},reload:forbidden},
  history:{pushState:forbidden,replaceState:forbidden,back:forbidden},caches:{open:forbidden,delete:forbidden},fetch:forbidden,
  localStorage:{setItem:forbidden,removeItem:forbidden},sessionStorage:{setItem:forbidden,removeItem:forbidden},
  exportSavedResources:async(catalog,settings)=>{calls.push({catalog,...settings});return exporter?exporter(catalog,settings):makeResult(`GRE-${settings.range.start}-${settings.range.end}.zip`,{count:settings.range.end-settings.range.start+1});}
 });
 vm.runInContext(executable(rangeSource),ctx,{filename:'offline-range.js'});
 vm.runInContext(executable(uiSource),ctx,{filename:'offline-export-ui.js'});
 const catalog=options.catalog||catalogFixture();
 const mount=(selectedCatalog=catalog)=>{
  const host=new Element('section'),importFeedback=new Element('div');importFeedback.className='library-import-feedback';
  const importProgress=new Element('progress');importProgress.setAttribute('data-import-progress','');importProgress.max=100;importProgress.value=37;
  const importStatus=new Element('p');importStatus.textContent='existing import status';importFeedback.append(importProgress,importStatus);host.append(importFeedback);
  const deleteProgress=new Element('progress');deleteProgress.setAttribute('data-range-delete-progress','');deleteProgress.max=40;deleteProgress.value=12;host.append(deleteProgress);
  const savedCount=new Element('strong');savedCount.textContent='4';host.append(savedCount);
  const handle=ctx.mountSavedExport({host,catalog:selectedCatalog,isBusy:()=>sharedBusy||externalBusy,setBusy:value=>{busyChanges.push(value);sharedBusy=value;}});
  const section=host.querySelector('.library-export-row');assert.ok(section,'export section must mount');
  const ui=Object.fromEntries(['export','export-cancel','export-progress','export-status','export-files','export-close','export-start','export-end','export-range','export-result'].map(name=>[name.replace('export-',''),section.querySelector(`[data-${name}]`)]));
  // Result metadata is inserted only after a successful export.
  Object.defineProperty(ui,'result',{get:()=>section.querySelector('[data-export-result]')});
  const assertUnchanged=()=>{
   assert.equal(ctx.location.hash,'#/settings');assert.deepEqual(sourceState,originalState);
   assert.equal(importProgress.value,37);assert.equal(importProgress.max,100);assert.equal(importProgress.hidden,false);
   assert.equal(deleteProgress.value,12);assert.equal(deleteProgress.max,40);assert.equal(deleteProgress.hidden,false);
   assert.equal(importStatus.textContent,'existing import status');assert.equal(savedCount.textContent,'4');assert.equal(importFeedback.parentNode,host);
  };
  const mounted={host,section,handle,ui,assertUnchanged};mounts.push(mounted);return mounted;
 };
 const first=mount();
 return {...first,ctx,window,catalog,mounts,mount,calls,created,revoked,liveURLs,results,makeResult,busyChanges,
  setExporter:value=>exporter=value,setCreateURL:value=>createURL=value,setExternalBusy:value=>externalBusy=value,
  emit:async(type,properties={})=>{await Promise.all(window.dispatchEvent({type,...properties}));await tick();},get busy(){return sharedBusy;}};
}
function setRange(mount,start,end){mount.ui.start.value=start;mount.ui.end.value=end;mount.ui.start.dispatchEvent({type:'input'});mount.ui.end.dispatchEvent({type:'input'});}
function links(mount){return mount.ui.files.querySelectorAll('a');}
function snapshot(mount){return links(mount).map(link=>({name:link.download,url:link.href}));}
function assertRetained(f,mount,previous,result){assert.deepEqual(snapshot(mount),previous);assert.equal(result.cleanupCalls,0);for(const {url} of previous)assert.ok(f.liveURLs.has(url),'prior downloads must remain live');}
function assertOnePayload(f,result){for(const candidate of f.results)assert.equal(candidate.cleanupCalls,candidate===result?0:1,'only the newest successful payload remains');assert.equal(f.liveURLs.size,result.packages.length);assert.equal(new Set(f.revoked).size,f.revoked.length,'URLs are revoked only once');}

// The close control is a reversible presentation toggle, never a cleanup action.
test('close/open only hides/shows downloads without revoking, cleaning or re-exporting',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),result=f.results[0];
 assert.equal(f.ui.close.textContent,'收起导出文件');assert.equal(f.ui.close.hidden,false);
 for(let i=0;i<3;i++){
  await f.ui.close.onclick();assert.equal(f.ui.files.hidden,true);assert.equal(f.ui.close.textContent,'展开导出文件');assertRetained(f,f,old,result);
  await f.ui.close.onclick();assert.equal(f.ui.files.hidden,false);assert.equal(f.ui.close.textContent,'收起导出文件');assertRetained(f,f,old,result);
 }
 assert.equal(f.calls.length,1);assert.equal(f.created.length,1);assert.deepEqual(f.revoked,[]);assert.deepEqual(f.busyChanges,[true,false]);f.assertUnchanged();
});

test('collapsing and reopening the export details never disposes generated files',async()=>{
 const f=fixture();f.ui.range.open=true;await f.ui.export.onclick();const old=snapshot(f),result=f.results[0];
 for(const open of [false,true,false,true]){f.ui.range.open=open;await Promise.all(f.ui.range.dispatchEvent({type:'toggle'}));assertRetained(f,f,old,result);}
 assert.equal(f.created.length,1);assert.equal(f.calls.length,1);assert.deepEqual(f.revoked,[]);f.assertUnchanged();
});

test('leaving Settings retains output and an equivalent cloned catalog remount reuses its URLs',async()=>{
 const f=fixture();setRange(f,2,3);await f.ui.export.onclick();const old=snapshot(f),result=f.results[0],label=f.ui.result?.textContent;
 await f.handle.cleanup();assert.equal(f.section.parentNode,null);assert.equal(f.ui.export.onclick(),undefined);assert.equal(result.cleanupCalls,0);assert.deepEqual(f.revoked,[]);
 for(let i=0;i<3;i++){
  const next=f.mount(structuredClone(f.catalog));assertRetained(f,next,old,result);assert.equal(next.ui.close.hidden,false);assert.equal(next.ui.result?.textContent,label);
  await next.handle.cleanup();assert.equal(result.cleanupCalls,0);
 }
 assert.equal(f.calls.length,1);assert.equal(f.created.length,1);assert.deepEqual(f.revoked,[]);f.assertUnchanged();
});

test('range edits never relabel files already generated for an earlier range and catalog version',async()=>{
 const f=fixture();setRange(f,2,3);await f.ui.export.onclick();assert.ok(f.ui.result,'a separate saved-result label is required');
 const label=f.ui.result.textContent,old=snapshot(f);assert.match(label,/2[–—-]3/);assert.ok(label.includes(f.catalog.release),'result label identifies the original catalog release');
 setRange(f,1,4);assert.equal(f.ui.export.textContent,'导出 1–4');assert.equal(f.ui.result.textContent,label);assert.deepEqual(snapshot(f),old);
 assert.deepEqual(JSON.parse(JSON.stringify(f.calls[0].range)),{start:2,end:3});assert.equal(f.calls.length,1);f.assertUnchanged();
});

test('replacement keeps old links available until new output is rendered, then cleans only old output',async()=>{
 const f=fixture(),pending=deferred();let old,cleanupObservation;
 f.setExporter(()=>f.makeResult('old.zip',{cleanup:()=>{cleanupObservation={download:links(f)[0]?.download,oldURLLive:f.liveURLs.has(old[0].url)};}}));
 await f.ui.export.onclick();old=snapshot(f);const previous=f.results[0],label=f.ui.result?.textContent;
 f.setExporter(()=>pending.promise);setRange(f,2,4);const replacing=f.ui.export.onclick();await tick();
 assertRetained(f,f,old,previous);assert.equal(f.ui.result?.textContent,label);assert.equal(f.ui.close.hidden,false);assert.equal(f.ui.export.onclick(),undefined);assert.equal(f.calls.length,2);
 const next=f.makeResult('new.zip',{count:3});pending.resolve(next);await replacing;
 assert.deepEqual(snapshot(f),[{name:'new.zip',url:f.created[1].url}]);assert.equal(previous.cleanupCalls,1);assert.equal(next.cleanupCalls,0);assert.deepEqual(f.revoked,[old[0].url]);
 assert.deepEqual(cleanupObservation,{download:'new.zip',oldURLLive:false},'replacement is rendered and old URL retired before exporter cleanup');
 assertOnePayload(f,next);assert.equal(f.busy,false);f.assertUnchanged();
});

test('failure during a replacement preserves the prior files, URLs, and range label',async()=>{
 const f=fixture();setRange(f,2,3);await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0],label=f.ui.result?.textContent;
 f.setExporter(async()=>{throw new Error('synthetic source read failed');});setRange(f,1,4);await f.ui.export.onclick();
 assertRetained(f,f,old,previous);assert.equal(f.ui.result?.textContent,label);assert.equal(f.ui.close.hidden,false);assert.match(f.ui.status.textContent,/synthetic source read failed/);
 assert.equal(f.created.length,1);assert.deepEqual(f.revoked,[]);assert.equal(f.busy,false);f.assertUnchanged();
});

for(const completion of ['reject','return'])test(`cancelled replacement preserves old output when exporter later ${completion==='reject'?'rejects':'returns a candidate'}`,async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0],label=f.ui.result?.textContent,pending=deferred();
 f.setExporter(()=>pending.promise);setRange(f,2,4);const task=f.ui.export.onclick();await tick();
 const current=f.calls.at(-1);current.onProgress({phase:'pack',completed:2,total:4});assert.equal(f.ui.progress.value,2);f.ui.cancel.onclick();assert.equal(current.signal.aborted,true);
 current.onProgress({phase:'pack',completed:4,total:4});assert.equal(f.ui.progress.value,2,'late progress after cancel is ignored');
 let candidate;if(completion==='reject')pending.reject(aborted());else{candidate=f.makeResult('cancelled.zip');pending.resolve(candidate);}await task;
 if(candidate)assert.equal(candidate.cleanupCalls,1,'late returned output belongs to the cancelled attempt and must be cleaned');
 assertRetained(f,f,old,previous);assert.equal(f.ui.result?.textContent,label);assert.equal(f.created.length,1);assert.deepEqual(f.revoked,[]);assert.equal(f.busy,false);f.assertUnchanged();
});

test('partial URL-allocation failure cleans the candidate and its URLs while keeping old downloads',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0],label=f.ui.result?.textContent;
 f.setExporter(()=>f.makeResult('candidate.zip',{packages:2}));f.setCreateURL((file,index)=>{if(index===2)throw new Error('synthetic URL failure');});
 await f.ui.export.onclick();const candidate=f.results[1];assert.equal(candidate.cleanupCalls,1);assertRetained(f,f,old,previous);assert.equal(f.ui.result?.textContent,label);
 assert.deepEqual(f.revoked,[f.created[1].url]);assert.equal(f.liveURLs.size,1);assert.match(f.ui.status.textContent,/synthetic URL failure/);assert.equal(f.ui.close.hidden,false);f.assertUnchanged();
});

test('failed first output allocation leaves no retained candidate to resurrect on remount',async()=>{
 const f=fixture({createURL:()=>{throw new Error('first URL unavailable');}});await f.ui.export.onclick();
 assert.equal(f.results[0].cleanupCalls,1);assert.equal(links(f).length,0);assert.equal(f.liveURLs.size,0);assert.equal(f.ui.close.hidden,true);
 await f.handle.cleanup();const next=f.mount(structuredClone(f.catalog));assert.equal(links(next).length,0);assert.equal(f.created.length,0);assert.equal(f.results[0].cleanupCalls,1);
});

test('unmounting during replacement aborts and cleans its late candidate while retaining earlier success',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0],pending=deferred(),cleaning=deferred();
 f.setExporter(()=>pending.promise);const running=f.ui.export.onclick();await tick();const teardown=f.handle.cleanup();assert.equal(f.calls.at(-1).signal.aborted,true);
 const candidate=f.makeResult('late-candidate.zip',{cleanup:()=>cleaning.promise});pending.resolve(candidate);await tick();assert.equal(candidate.cleanupCalls,1);assert.equal(previous.cleanupCalls,0);
 cleaning.resolve();await Promise.all([running,teardown]);assert.equal(f.section.parentNode,null);assert.equal(f.busy,false);assert.deepEqual(f.revoked,[]);
 const next=f.mount(structuredClone(f.catalog));assertRetained(f,next,old,previous);assert.equal(f.created.length,1);assert.equal(candidate.cleanupCalls,1);
});

test('progress belongs only to the active export and stale callbacks cannot touch replacement progress',async()=>{
 const f=fixture();await f.ui.export.onclick();const oldProgress=f.calls[0].onProgress,pending=deferred();f.setExporter(()=>pending.promise);
 const replacing=f.ui.export.onclick();await tick();assert.equal(f.ui.progress.hidden,false);assert.equal(f.ui.progress.hasAttribute('value'),false);
 oldProgress({phase:'pack',completed:99,total:99});assert.equal(f.ui.progress.hasAttribute('value'),false);f.assertUnchanged();
 f.calls.at(-1).onProgress({phase:'scan',completed:2,total:4});assert.equal(f.ui.progress.value,2);assert.equal(f.ui.progress.max,4);f.assertUnchanged();
 pending.resolve(f.makeResult('new-progress.zip'));await replacing;const status=f.ui.status.textContent;
 oldProgress({phase:'pack',completed:99,total:99});f.calls.at(-1).onProgress({phase:'pack',completed:88,total:99});assert.equal(f.ui.status.textContent,status);assert.equal(f.ui.progress.hidden,true);f.assertUnchanged();
});

test('queued replacement lock is abortable without exporting again or retiring existing files',async()=>{
 let block=false,request;
 const f=fixture({locks:{request:async(name,{signal},action)=>{
  assert.equal(name,'gre-offline-pack-index-v1');if(!block)return action();request={signal};return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(aborted()),{once:true}));
 }}});
 await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0];block=true;const task=f.ui.export.onclick();await tick();
 assert.equal(f.calls.length,1);assertRetained(f,f,old,previous);f.ui.cancel.onclick();await task;assert.equal(request.signal.aborted,true);
 assert.equal(f.calls.length,1);assertRetained(f,f,old,previous);assert.deepEqual(f.revoked,[]);assert.equal(f.busy,false);
});

test('external busy work prevents re-export without disturbing retained output',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0];f.setExternalBusy(true);f.handle.sync();
 assert.equal(f.ui.export.disabled,true);assert.equal(f.ui.export.onclick(),undefined);assertRetained(f,f,old,previous);assert.equal(f.calls.length,1);assert.deepEqual(f.revoked,[]);
 f.setExternalBusy(false);f.handle.sync();assert.equal(f.ui.export.disabled,false);
});

for(const [description,change] of [
 ['release',catalog=>{catalog.release='175';}],
 ['media checksum',catalog=>{catalog.entries[1].storyMedia.video.sha256='f'.repeat(64);}],
 ['media byte count',catalog=>{catalog.entries[1].storyMedia.video.bytes++;}],
 ['media path',catalog=>{catalog.entries[1].storyMedia.video.url='story-media/replaced.mp4';}],
 ['static poster checksum',catalog=>{catalog.entries[1].storyMedia.staticPoster.sha256='e'.repeat(64);}],
 ['stable word identity',catalog=>{catalog.entries[1].number=9999;}],
 ['display order',catalog=>{[catalog.entries[0].displayOrdinal,catalog.entries[1].displayOrdinal]=[2,1];}]
])test(`retained output is not shown as current after a catalog ${description} change`,async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f);await f.handle.cleanup();const changed=structuredClone(f.catalog);change(changed);
 const next=f.mount(changed);assert.equal(links(next).length,0,'incompatible output must not appear under the new catalog');assert.equal(next.ui.close.hidden,true);
 assert.equal(f.calls.length,1);assert.equal(f.created.length,1,'catalog changes do not recreate or re-export old output');assert.ok(old.length>0);
});

test('same-release content change can generate one new retained payload and retires the prior version',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0];await f.handle.cleanup();
 const changed=structuredClone(f.catalog);changed.entries[0].storyMedia.video.sha256='a'.repeat(64);const next=f.mount(changed);
 f.setExporter(()=>f.makeResult('new-edition.zip'));await next.ui.export.onclick();assert.equal(previous.cleanupCalls,1);assert.deepEqual(f.revoked,[old[0].url]);assert.equal(links(next)[0].download,'new-edition.zip');assertOnePayload(f,f.results[1]);
 await next.handle.cleanup();const remounted=f.mount(structuredClone(changed));assert.equal(links(remounted)[0].href,f.created[1].url);assert.equal(f.created.length,2);
});

test('explicit discard is idempotent, revokes every retained URL once, and prevents restoration',async()=>{
 const f=fixture();f.setExporter(()=>f.makeResult('discard.zip',{packages:2}));await f.ui.export.onclick();const output=f.results[0];
 await Promise.all([f.handle.cleanup({discard:true}),f.handle.cleanup({discard:true})]);await f.handle.cleanup({discard:true});
 assert.equal(output.cleanupCalls,1);assert.deepEqual(new Set(f.revoked),new Set(f.created.map(item=>item.url)));assert.equal(f.revoked.length,2);assert.equal(f.liveURLs.size,0);assert.equal(f.section.parentNode,null);
 const next=f.mount(structuredClone(f.catalog));assert.equal(links(next).length,0);assert.equal(next.ui.close.hidden,true);assert.equal(f.created.length,2);assert.equal(f.calls.length,1);
});

test('ordinary unmount can be followed by an explicit discard without leaking retained output',async()=>{
 const f=fixture();await f.ui.export.onclick();await f.handle.cleanup();assert.equal(f.results[0].cleanupCalls,0);
 await f.handle.cleanup({discard:true});await f.handle.cleanup({discard:true});assert.equal(f.results[0].cleanupCalls,1);assert.equal(f.revoked.length,1);assert.equal(f.liveURLs.size,0);
 const next=f.mount(structuredClone(f.catalog));assert.equal(links(next).length,0);
});

test('many successful replacements retain only one payload across repeated unmounts',async()=>{
 const f=fixture();let current=f;
 for(let i=0;i<6;i++){
  f.setExporter(()=>f.makeResult(`replacement-${i}.zip`,{packages:i%2+1}));await current.ui.export.onclick();const result=f.results.at(-1),old=snapshot(current);assertOnePayload(f,result);
  await current.handle.cleanup();assertOnePayload(f,result);current=f.mount(structuredClone(f.catalog));assert.deepEqual(snapshot(current),old);assertOnePayload(f,result);
 }
 assert.equal(f.calls.length,6);assert.equal(f.created.length,9);assert.equal(f.results.filter(result=>result.cleanupCalls===0).length,1);
 await current.handle.cleanup({discard:true});assert.ok(f.results.every(result=>result.cleanupCalls===1));assert.equal(f.liveURLs.size,0);assert.equal(f.revoked.length,9);
});

test('bfcache pagehide retains a successful export and restores it without duplicate URLs',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),result=f.results[0];await f.emit('pagehide',{persisted:true});
 assert.equal(result.cleanupCalls,0);assert.deepEqual(f.revoked,[]);assert.equal(f.liveURLs.size,1);
 await f.emit('pageshow',{persisted:true});assertRetained(f,f,old,result);assert.equal(f.created.length,1);assert.equal(f.calls.length,1);
 await f.handle.cleanup();const next=f.mount(structuredClone(f.catalog));assertRetained(f,next,old,result);assert.equal(f.created.length,1);
});

test('optional file-share capability failure never invalidates retained downloadable output',async()=>{
 const f=fixture({canShare:()=>{throw new Error('unsupported files');},share:async()=>{}});await f.ui.export.onclick();const old=snapshot(f),result=f.results[0];
 assert.equal(links(f).length,1);assert.equal(f.ui.files.querySelectorAll('button').length,0);await f.ui.close.onclick();await f.ui.close.onclick();assertRetained(f,f,old,result);
 await f.handle.cleanup();const next=f.mount(structuredClone(f.catalog));assertRetained(f,next,old,result);assert.equal(f.created.length,1);
});

test('old download visibility can be toggled during replacement without cancelling or restarting it',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),previous=f.results[0],pending=deferred();f.setExporter(()=>pending.promise);
 const task=f.ui.export.onclick();await tick();await f.ui.close.onclick();assert.equal(f.ui.files.hidden,true);assertRetained(f,f,old,previous);assert.equal(f.calls.at(-1).signal.aborted,false);
 await f.ui.close.onclick();assert.equal(f.ui.files.hidden,false);assertRetained(f,f,old,previous);assert.equal(f.calls.length,2);assert.deepEqual(f.revoked,[]);
 pending.resolve(f.makeResult('toggle-replacement.zip'));await task;assertOnePayload(f,f.results[1]);
});

test('a collapsed retained result stays available after remount without generating another file',async()=>{
 const f=fixture();await f.ui.export.onclick();const old=snapshot(f),result=f.results[0];await f.ui.close.onclick();await f.handle.cleanup();
 const next=f.mount(structuredClone(f.catalog));assertRetained(f,next,old,result);
 if(next.ui.files.hidden){assert.equal(next.ui.close.textContent,'展开导出文件');await next.ui.close.onclick();}
 assert.equal(next.ui.files.hidden,false);assertRetained(f,next,old,result);assert.equal(f.created.length,1);assert.equal(f.calls.length,1);assert.deepEqual(f.revoked,[]);
});

test('failed old-session cleanup keeps the new successful result and retries before another allocation',async()=>{
 const f=fixture();let allowCleanup=false;
 f.setExporter(()=>f.makeResult('retiring.zip',{cleanup:()=>{if(!allowCleanup)throw new Error('temporary cleanup failure');}}));await f.ui.export.onclick();
 f.setExporter(()=>f.makeResult('current.zip'));await f.ui.export.onclick();const current=f.results[1],old=snapshot(f),label=f.ui.result.textContent;
 assert.equal(f.results[0].cleanupCalls,1);assertRetained(f,f,old,current);assert.match(f.ui.status.textContent,/temporary cleanup failure/);
 await f.ui.export.onclick();assert.equal(f.calls.length,2,'failed retirement prevents accumulating another candidate');assert.equal(f.results[0].cleanupCalls,2);assertRetained(f,f,old,current);assert.equal(f.ui.result.textContent,label);
 allowCleanup=true;await f.ui.export.onclick();assert.equal(f.calls.length,3);assert.equal(f.results[0].cleanupCalls,3);assert.equal(current.cleanupCalls,1);assert.equal(f.results[2].cleanupCalls,0);
 assert.equal(f.liveURLs.size,1);assert.equal(new Set(f.revoked).size,f.revoked.length);
});

test('explicit discard during replacement aborts the candidate and releases the previous success exactly once',async()=>{
 const f=fixture();await f.ui.export.onclick();const previous=f.results[0],pending=deferred();f.setExporter(()=>pending.promise);
 const running=f.ui.export.onclick();await tick();const cleanup=f.handle.cleanup({discard:true});assert.equal(f.calls.at(-1).signal.aborted,true);
 const candidate=f.makeResult('discarded-candidate.zip');pending.resolve(candidate);await Promise.all([running,cleanup]);await f.handle.cleanup({discard:true});
 assert.equal(previous.cleanupCalls,1);assert.equal(candidate.cleanupCalls,1);assert.equal(f.created.length,1);assert.equal(f.revoked.length,1);assert.equal(f.liveURLs.size,0);
 const next=f.mount(structuredClone(f.catalog));assert.equal(links(next).length,0);assert.equal(f.calls.length,2);
});

test('late explicit discard from an older mount cannot clean an already-retired payload twice',async()=>{
 const f=fixture();await f.ui.export.onclick();const previous=f.results[0];await f.handle.cleanup();
 const next=f.mount(structuredClone(f.catalog));f.setExporter(()=>f.makeResult('latest.zip'));await next.ui.export.onclick();const current=f.results[1],old=snapshot(next);
 assert.equal(previous.cleanupCalls,1);await f.handle.cleanup({discard:true});await f.handle.cleanup({discard:true});
 assert.equal(previous.cleanupCalls,1,'a payload already retired by replacement must not be cleaned twice');assertRetained(f,next,old,current);assert.equal(f.revoked.length,1);
 await next.handle.cleanup();const remounted=f.mount(structuredClone(f.catalog));assertRetained(f,remounted,old,current);assert.equal(f.created.length,2);
});
