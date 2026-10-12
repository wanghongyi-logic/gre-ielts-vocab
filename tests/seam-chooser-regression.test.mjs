import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {leafGeometry} from '../gre-learning/frontmatter-turn.js';
import {installContents} from '../gre-learning/contents.js';
import {makeHarness} from '../qa/frontmatter/dom-harness.mjs';
const points=clip=>[...clip.matchAll(/(-?[\d.]+)px (-?[\d.]+)px/g)].map(m=>[Number(m[1]),Number(m[2])]);
test('screenshot-matched mid-turn seam contains old Settings ink behind the paper curl',()=>{
 const width=839,progress=.344,shape=leafGeometry(progress,'next',width,1800);
 const seam=shape.edge/100*width,curl=shape.curl/100*width;
 assert.ok(Math.abs(seam-516)<1);assert.ok(Math.abs(seam-curl-376)<2,'matches observed reverse-paper band');
 const previousLeak=seam+Math.sin(Math.PI*progress)*.035*width;
 assert.ok(previousLeak>541&&previousLeak<543,'old formula predicts the observed 25px residual strip');
 assert.ok(points(shape.clip).every(([x])=>x<=seam+.01),'new mask never places old text on the revealed side');
});
test('at every turn stage, both directions clip old content on the outgoing side of the shared seam',()=>{
 for(const direction of ['next','previous'])for(const width of [287,331,346,839,1237])for(let i=0;i<=100;i++){
  const shape=leafGeometry(i/100,direction,width,812,{left:19,top:4400}),seam=19+Math.max(0,Math.min(100,shape.edge))/100*width;
  for(const [x]of points(shape.clip))assert.ok(direction==='next'?x<=seam+.011:x>=seam-.011,`${direction}, progress ${i}: old content escaped seam`);
 }
});
function settings(){
 const h=makeHarness(),contents=installContents({main:h.main,picker:h.picker,search:h.search,entries:[{number:12,word:'abate',coreMeaningZh:'减弱'}],getSelected:()=>12,navigate(){throw Error('unexpected navigation');}});
 const route=()=>{if(contents.deferRoute(route))return;contents.syncRoute();};h.win.addEventListener('hashchange',route);h.win.location.hash='/settings';h.drain();
 const input=h.make('input','import-file',h.host);input.setAttribute('type','file');h.win.scrollTo({top:1720});input.focus();return {...h,contents,input,route};
}
test('native file chooser cancel, same-file selection and change never act as dialog Escape',()=>{
 for(const eventType of ['cancel','cancel','change']){
  const h=settings();const event=h.picker.emit(eventType,{target:h.input});h.drain();
  assert.equal(event.defaultPrevented,false);assert.equal(h.win.location.hash,'#/settings');assert.equal(h.picker.open,true);assert.equal(h.main.hidden,true);assert.equal(h.win.scrollY,1720);assert.equal(h.doc.activeElement,h.input);
  h.contents.renderResults();assert.equal(h.win.scrollY,1720);assert.equal(h.doc.activeElement,h.input,'underlying media refresh does not replace the file control');
 }
 const h=settings();h.picker.emit('cancel',{target:h.picker});h.drain();assert.equal(h.win.location.hash,'#/learn/12','real dialog Escape remains supported');
});
test('persisted and nonpersisted foreground keep Settings route, scroll, focus and live controller',async()=>{
 const source=await readFile(new URL('../gre-learning/app.js',import.meta.url),'utf8');
 const block=source.slice(source.indexOf("window.addEventListener('pagehide'"),source.indexOf("route();window.dispatchEvent"));
 for(const persisted of [false,true]){
  const h=settings(),handlers={},turns=[];let refreshes=0;
  const ctx=vm.createContext({window:{addEventListener:(name,fn)=>handlers[name]=fn,speechSynthesis:{cancel(){}}},libraryRefreshEpoch:0,renderGeneration:1,loader:{cancel(){}},pages:{destroy(){},adjacent(){}},motion:{setTurning:v=>turns.push(v),cancel(){throw Error('foreground return must preserve controller');}},bookmarks:{suspend(){}},current:{number:12},contents:h.contents,location:h.win.location,picker:h.picker,main:h.main,selectedNumber:12,renderedLibraryRevision:0,libraryRevision:0,watchChapters:()=>refreshes++,route:h.route,resolveWordNumber:()=>12,entries:[],remember(){},refreshLibrary(){}});
  vm.runInContext(block,ctx);handlers.pagehide({persisted});handlers.pageshow({persisted});h.drain();
  assert.deepEqual(turns,[true,false]);assert.equal(refreshes,1);assert.equal(h.win.location.hash,'#/settings');assert.equal(h.picker.open,true);assert.equal(h.main.hidden,true);assert.equal(h.win.scrollY,1720);assert.equal(h.doc.activeElement,h.input);
 }
});
