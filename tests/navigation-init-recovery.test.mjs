import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {resolveWordNumber,neighboringNumbers} from '../gre-learning/model.js';
const flush=()=>new Promise(r=>setImmediate(r));
test('full app initialization binds restored reading, swipe and Contents despite optional storage setup failure',async()=>{
 const source=(await readFile(new URL('../gre-learning/app.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replaceAll('import.meta.url',"'https://example.test/gre-learning/app.js'");
 const entries=[{number:1467,word:'meager'},{number:1473,word:'mediate'},{number:1490,word:'minimize'}],nodes=new Map(),listeners=new Map();let swipeOptions,contentsOptions,adopted=[],renders=0;
 function node(){const attrs=new Set();return {parentNode:{},childNodes:[],dataset:{},open:false,addEventListener(){},setAttribute:k=>attrs.add(k),removeAttribute:k=>attrs.delete(k),hasAttribute:k=>attrs.has(k),querySelectorAll:()=>[],querySelector:()=>({}),replaceChildren(){renders++;},remove(){}};}
 const document={getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);},querySelector:()=>node(),addEventListener:(name,fn)=>listeners.set('doc:'+name,fn)};
 const location={hash:'#/learn/1467'},window={addEventListener:(name,fn)=>listeners.set(name,fn),dispatchEvent(){},scrollTo(){},scrollY:0};
 const motion={destroy(){},activate(){},sync(){},cancel(){},setTurning(){},prepareReveal(){}};let prepared;
 const pages={keep(){},adjacent(){},prepare:async number=>prepared={loaded:{entry:entries.find(e=>e.number===number),media:null},motion,root:node()},take:()=>prepared,get(){},discard(){},destroy:async()=>{}};
 const context={URL,Event,console:{warn(){}},navigator:{onLine:false},document,window,location,sessionStorage:{setItem(){}},history:{replaceState:(_,__,hash)=>location.hash=hash},fetch:async()=>({ok:true,json:async()=>({entries})}),expandCatalog:x=>x,LessonLoader:class{cancel(){}},installMobileZoomGuard(){},installOfflineManager(){throw Error('storage blocked');},installReadingScroll:()=>({metrics:()=>({scrollY:0}),to(){}}),installBookmarkNavigation:()=>({refresh(){},sync(){},suspend(){}}),installStoryMedia:()=>motion,installPreparedPages:()=>pages,installWordSwipe:options=>{swipeOptions=options;return {loading(){},cancel(){},rendered(){},go:direction=>options.onNavigate(options.getNeighbor(direction))};},installReadingPosition:()=>({remember:()=>1467,position(){},adopted:n=>adopted.push(n),route(){},capture(){},restore(){}}),installContents:options=>{contentsOptions=options;return {isRoute:()=>false,deferRoute:()=>false,syncRoute:()=>({}),whenSettled:async()=>{},reveal:fn=>fn()};},resolveWordNumber,neighboringNumbers};
 await vm.runInNewContext('(async()=>{'+source+'})()',context);await flush();assert.deepEqual(adopted,[1467]);assert.equal(renders,1);
 swipeOptions.onNavigate(swipeOptions.getNeighbor('next'));location.hash='#'+location.hash;listeners.get('hashchange')();await flush();assert.deepEqual(adopted,[1467,1473]);
 contentsOptions.navigate(1490);location.hash='#'+location.hash;listeners.get('hashchange')();await flush();assert.deepEqual(adopted,[1467,1473,1490]);assert.equal(renders,3);
});

test('settings rail mounts before real bookmark botanical observers capture it',async()=>{
 const app=await readFile(new URL('../gre-learning/app.js',import.meta.url),'utf8');
 const bookmark=await readFile(new URL('../gre-learning/bookmark-navigation.js',import.meta.url),'utf8');
 const botanical=await readFile(new URL('../gre-learning/botanical-margin.js',import.meta.url),'utf8');
 assert.ok(bookmark.includes('installBotanicalMargin('));assert.ok(botanical.includes("#open-settings"));
 assert.ok(app.indexOf('try{installOfflineManager(catalog);}')<app.indexOf('const bookmarks=installBookmarkNavigation('));
});

test('stale-reading recovery releases all read work even if an optional cleanup hook throws',async()=>{
 const source=await readFile(new URL('../gre-learning/app.js',import.meta.url),'utf8'),code=source.slice(source.indexOf("window.addEventListener('gre-update-recover-reading'"),source.indexOf('function signalRendered'));
 let handler,swipes=0,cancelled=0,destroyed=0,cleared=0;const ctx=vm.createContext({window:{addEventListener:(_,fn)=>handler=fn},renderGeneration:1,libraryRefreshEpoch:2,libraryRefreshJob:{},contents:{cancel(){throw Error('optional');}},swipe:{cancel:()=>swipes++},loader:{cancel:()=>cancelled++},main:{removeAttribute:()=>cleared++},motion:{setTurning(){}},pages:{destroy:async()=>destroyed++},Promise});vm.runInContext(code,ctx);const detail={waits:[]};handler({detail});await Promise.all(detail.waits);assert.equal(ctx.renderGeneration,2);assert.equal(ctx.libraryRefreshEpoch,3);assert.equal(ctx.libraryRefreshJob,null);assert.deepEqual([swipes,cancelled,destroyed,cleared],[1,1,1,1]);
});
