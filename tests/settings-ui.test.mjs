import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=process.env.GRE_IMPLEMENTATION_DIR||fileURLToPath(new URL('../',import.meta.url));
const source=await readFile(root+'/gre-learning/offline-manager.js','utf8');
const css=await readFile(root+'/gre-learning/settings-storybook.css','utf8');
const {optionalMediaGroups}=await import(pathToFileURL(root+'/gre-learning/offline-batch.js'));
const {mountReleaseDownloads}=await import(pathToFileURL(root+'/gre-learning/offline-releases.js'));
// Minimal DOM fixture. This checks state and semantics, not browser rendering.
class Element{
 constructor(tag,doc){this.tagName=tag;this.ownerDocument=doc;this.children=[];this.attributes={};this.dataset={};this.listeners={};this.textContent='';this.className='';this.hidden=false;this.disabled=false;this.style={values:{},setProperty:(k,v)=>this.style.values[k]=v};this.classList={add:(v)=>this.className+=' '+v,remove:v=>this.className=this.className.split(' ').filter(x=>x!==v).join(' '),toggle:(v,on)=>on?this.classList.add(v):this.classList.remove(v)};}
 setAttribute(k,v){this.attributes[k]=String(v);if(k==='class')this.className=String(v);if(k==='id')this.id=v;if(k.startsWith('data-'))this.dataset[k.slice(5)]=v;}
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
 const calls={imports:0,clears:0,deletes:0,modes:[],reloads:0,confirms:[]};let confirmed=false,releaseFetches=0,importResult={wordIds:[1,2]},pendingImport;
 const data={readyIds:[1,2],total:3,packs:[{wordIds:[1,2],version:'v1',bytes:2048,available:true,ownedCurrentAssets:2,key:'one'}]};
 const ctx=vm.createContext({document:doc,window:{addEventListener(){},dispatchEvent(){}},location:{hash:'',reload(){calls.reloads++;}},sessionStorage:{getItem(){return null;},setItem(){},removeItem(){}},navigator:{storage:{persist:async()=>true},serviceWorker:{addEventListener(){}}},URL,AbortController,CustomEvent:class{constructor(t,o){this.type=t;this.detail=o.detail;}},MessageChannel,setTimeout:()=>1,clearTimeout(){},optionalMediaGroups,setMediaEdition(){},videoMode:()=> 'auto',chooseVideoMode:async mode=>calls.modes.push(mode),OFFLINE_EDITION:'v12',createMediaControl:()=>({subscribe(){},ticket:async()=>0,state:async()=>({generation:0})}),batchStatus:async()=>({readyPaths:[]}),inspectLibrary:async()=>data,storageStatus:async()=>({usage:1024,quota:10240,persistent:false}),deletePack:async()=>{calls.deletes++;},cleanUnusedPacks:async()=>0,clearSavedResources:async()=>{calls.clears++;},importPack:async()=>{calls.imports++;return pendingImport?await pendingImport:importResult;},mountReleaseDownloads:options=>mountReleaseDownloads({...options,fetcher:async()=>{releaseFetches++;return Response.json([]);}}),confirm:msg=>{calls.confirms.push(msg);return confirmed;}});
 vm.runInContext(source.replace(/^import .*;\n/gm,'').replace('export function','function').replaceAll('import.meta.url',JSON.stringify('https://fixture.test/gre-learning/offline-manager.js'))+'\ninstallOfflineManager({entries:[{number:1},{number:2},{number:3}]});',ctx);
 return {doc,ctx,calls,data,get host(){return doc.getElementById('offline-settings');},get releases(){return releaseFetches;},setConfirmed(v){confirmed=v;},setPending(p){pendingImport=p;}};
}
test('settings exposes download links and local file import in closed disclosures',async()=>{
 const f=fixture();const h=f.host;
 assert.ok(h.querySelector('input'));
 assert.match(source,/导入本地文件/);
 assert.equal(h.querySelector('[data-remote]'),null);
 assert.doesNotMatch(source,/downloadReleaseAsset|onImport:|从 Release 导入|无法直接导入/);
 assert.match(h.querySelector('[data-release-browser]').querySelector('summary').children[0].textContent,/下载资源包/);
 assert.ok(h.querySelector('[data-release-browser]'));
 assert.equal(h.querySelector('.library-packs').open,false);
 assert.equal(h.querySelector('.library-help').open,false);
 assert.equal(h.querySelector('[data-release-browser]').open,false);
 assert.ok(h.querySelector('.library-help').querySelector('[data-persist]'));
 assert.ok(h.querySelector('.library-packs').querySelector('[data-clear-all]'));
 assert.equal(f.releases,0,'initial settings do not fetch Release metadata');
 const links=f.doc.head.children.map(n=>n.href);assert.ok(links.some(x=>x.endsWith('/settings-storybook.css')));
});
test('saved count, percent, accessible progress and pack count use complete unique IDs',async()=>{
 const f=fixture();f.doc.getElementById('open-settings').onclick();await tick();
 assert.equal(f.ctx.location.hash,'/settings');
 assert.equal(f.host.querySelector('[data-saved-count]').textContent,2);
 assert.equal(f.host.querySelector('[data-saved-percent]').textContent,'67%');
 assert.equal(f.host.querySelector('[data-library-progress]').value,2);
 assert.equal(f.host.querySelector('[data-pack-count]').textContent,'1 本');
 const rail=f.doc.getElementById('open-settings');assert.equal(rail.style.values['--saved-progress'],String(2/3));assert.match(rail.getAttribute('aria-label'),/2 \/ 3/);
 assert.match(f.host.querySelector('[data-space]').textContent,/已用.*可用约/);
});
test('Release drawer fetches on first open only, and retains manual refresh',async()=>{
 const f=fixture(),drawer=f.host.querySelector('[data-release-browser]');drawer.open=true;drawer.ontoggle();await tick();assert.equal(f.releases,1);drawer.open=false;drawer.ontoggle();drawer.open=true;drawer.ontoggle();await tick();assert.equal(f.releases,1);await f.host.querySelector('[data-release-refresh]').onclick();assert.equal(f.releases,2);
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
