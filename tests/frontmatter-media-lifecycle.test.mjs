import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {installStoryMedia} from '../gre-learning/story-media.js';
import {installFrontmatterTurn} from '../gre-learning/frontmatter-turn.js';
function events(object={}){const handlers=new Map();return Object.assign(object,{addEventListener(type,fn){if(!handlers.has(type))handlers.set(type,new Set());handlers.get(type).add(fn);},removeEventListener(type,fn){handlers.get(type)?.delete(fn);},emit(type){for(const fn of handlers.get(type)||[])fn();}});}
function style(){const values=new Map();return {setProperty(k,v){values.set(k,v);},removeProperty(k){values.delete(k);},getPropertyValue:k=>values.get(k)||'',getPropertyPriority:()=>''};}
function harness({rvfc=true}={}){
 let frameId=0,callbackId=0,timerId=0,loads=0,plays=0;
 const frames=new Map(),callbacks=new Map(),timers=new Map();
 const doc=events({hidden:false}),picker=events({open:false});
 const win=events({document:doc,navigator:{},matchMedia:()=>events({matches:false}),requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id)});
 const poster={style:style()},figure={querySelector:selector=>selector==='.story-poster'?poster:null,matches:()=>false,classList:{add(){},remove(){}}};
 const video=events({style:style(),readyState:2,seeking:false,currentTime:0,duration:10,paused:true,closest:()=>figure,removeAttribute(){},load(){loads++;},pause(){this.paused=true;},play(){plays++;this.paused=false;return Promise.resolve();}});
 if(rvfc){video.requestVideoFrameCallback=fn=>{callbacks.set(++callbackId,fn);return callbackId;};video.cancelVideoFrameCallback=id=>callbacks.delete(id);}
 const surface={querySelector:()=>video},motion=installStoryMedia(surface,{window:win,document:doc,picker});
 const flush=()=>{const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(0);};
 const present=()=>{const pending=[...callbacks.values()];callbacks.clear();for(const fn of pending)fn(0,{presentedFrames:1});};
 return {motion,video,poster,picker,doc,flush,present,callbacks,timers,get loads(){return loads;},get plays(){return plays;}};
}
const media={durationMs:10000,resetTransition:{type:'none'}};
const micro=()=>Promise.resolve();
test('all story videos retain decoded poster until an actual presentation, not just play resolution',async()=>{
 const h=harness();await h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();
 assert.equal(h.poster.style.getPropertyValue('opacity'),'1');
 h.present();h.flush();assert.equal(h.poster.style.getPropertyValue('opacity'),'0');h.motion.destroy();
});
test('Settings and Contents return warms the same controller under the intact leaf',async()=>{
 for(const leaf of ['settings','contents']){
  const h=harness();await h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();h.present();h.flush();
  h.video.currentTime=3.25;const loads=h.loads;
  h.motion.setTurning(true);h.picker.open=true;h.motion.sync();
  assert.equal(h.poster.style.getPropertyValue('opacity'),'1',leaf+' retains decoded backing before hiding');
  h.picker.open=false;let settled=false;const ready=h.motion.prepareReveal().then(()=>settled=true);await micro();
  assert.equal(settled,true,'decoded poster makes the turn ready without waiting for playback');assert.equal(h.poster.style.getPropertyValue('z-index'),'1','poster covers the retired video layer');assert.equal(h.video.currentTime,3.25);assert.equal(h.loads,loads,'no reload or seek on same-word return');
  assert.equal(h.timers.size,0,'return has no 500 ms gate');h.present();h.flush();await ready;assert.equal(h.poster.style.getPropertyValue('opacity'),'0');assert.equal(h.poster.style.getPropertyValue('z-index'),'');h.motion.setTurning(false);h.motion.destroy();
 }
});
test('retired presentation callbacks cannot expose a hidden video; stalled decode preserves backing',async()=>{
 const h=harness();await h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();
 const stale=[...h.callbacks.values()][0];h.motion.setTurning(true);h.picker.open=true;h.motion.sync();stale(0,{presentedFrames:1});h.flush();
 assert.equal(h.poster.style.getPropertyValue('opacity'),'1');
 h.picker.open=false;const ready=h.motion.prepareReveal();await micro();for(const fn of [...h.timers.values()])fn();await ready;
 assert.equal(h.poster.style.getPropertyValue('opacity'),'1');assert.equal(h.poster.style.getPropertyValue('z-index'),'1','stalled decoder remains safely covered without a navigation timer');h.motion.destroy();
});
test('older video APIs keep a poster underlay and cancellation settles preparation',async()=>{
 const h=harness({rvfc:false});await h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();h.motion.setTurning(true);
 const ready=h.motion.prepareReveal();await micro();h.flush();await ready;assert.equal(h.poster.style.getPropertyValue('opacity'),'1');
 const pending=h.motion.prepareReveal();h.motion.destroy();await pending;
});
test('a prepared frontmatter destination is not uncovered before media readiness',async()=>{
 let ready,commits=0;const doc=events({hidden:false,documentElement:{}}),win=events({innerWidth:400,innerHeight:800,matchMedia:()=>events({matches:true}),cancelAnimationFrame(){},clearTimeout(){}});
 const main={setAttribute(){},removeAttribute(){}},source={getBoundingClientRect:()=>({left:0,top:0,width:400,height:800,bottom:800,right:400})};
 const turn=installFrontmatterTurn({main,window:win,document:doc});
 const finished=turn.begin({source,prepare:()=>new Promise(resolve=>ready=resolve),commit:()=>commits++});
 assert.equal(commits,0);ready();await finished;assert.equal(commits,1);
 let resolve;const pending=turn.begin({source,interactive:true,prepare:()=>new Promise(r=>resolve=r),rollback:()=>commits++});turn.animate(false);await pending;resolve();await micro();assert.equal(commits,2,'cancel need not wait for a decoder');
});
test('unchanged library revisions discard prepared duplicates without remounting the active word',async()=>{
 const source=await readFile(new URL('../gre-learning/app.js',import.meta.url),'utf8');
 const start=source.indexOf(' if(current&&selectedNumber===number&&JSON.stringify'),end=source.indexOf(' page=pages.take(number);',start);
 const block=source.slice(start,end);assert.ok(start>0&&end>start);
 for(const changed of [false,true]){
  let discarded=0;const current={number:1,word:'same'},currentMedia={videoURL:'blob:same'};
  const ctx=vm.createContext({current,currentMedia,selectedNumber:1,number:1,page:{loaded:{entry:{...current},media:{videoURL:changed?'blob:new':'blob:same'}}},renderedLibraryRevision:0,mediaRevision:2,main:{removeAttribute(){}},swipe:{cancel(){}},pages:{discard:()=>discarded++,adjacent(){}}});
  vm.runInContext('(function(){'+block+'})()',ctx);assert.equal(discarded,changed?0:1);assert.equal(ctx.renderedLibraryRevision,changed?0:2);
 }
 assert.match(source,/prepareReading:\(\)=>motion.prepareReveal\(\)/);
});
test('new-word activation starts at zero once; repeated lifecycle sync does not restart playback',async()=>{
 const h=harness();h.video.currentTime=6;await h.motion.refresh(media);assert.equal(h.video.currentTime,0);assert.equal(h.loads,1);
 h.motion.activate();h.flush();h.flush();h.motion.sync();h.motion.sync();await micro();
 assert.equal(h.plays,1,'one pending play request despite repeated sync');
 h.video.currentTime=2;h.motion.sync();h.motion.sync();assert.equal(h.plays,1);assert.equal(h.video.currentTime,2);h.motion.destroy();
});
test('Contents current row restores once; repeated new-word clicks route once',async()=>{
 const source=await readFile(new URL('../gre-learning/contents.js',import.meta.url),'utf8');
 const block=source.slice(source.indexOf(" picker.addEventListener('click'"),source.indexOf(' // Frontmatter uses'));
 for(const number of [1,2]){
  let click,closed=0,navigated=0,busy=false;const button={dataset:{word:String(number)}};
  const win={location:{hash:'#/contents'}};
  const picker={addEventListener:(type,fn)=>click=fn,contains:()=>true,hasAttribute:()=>busy,setAttribute:()=>busy=true};
  vm.runInNewContext(block,{picker,win,currentEntry:()=>({number:1}),close:()=>closed++,navigate:n=>{navigated++;win.location.hash=`#/learn/${n}`;},readingHash:n=>`#/learn/${n}`});
  click({target:{closest:()=>button}});
  assert.equal(closed,number===1?1:0);assert.equal(navigated,number===2?1:0);
  if(number===2){click({target:{closest:()=>button}});assert.equal(navigated,1);}
 }
});
test('new-word Contents reveal adopts and prepares one destination with one fold',async()=>{
 const source=await readFile(new URL('../gre-learning/contents.js',import.meta.url),'utf8');
 const block=source.slice(source.indexOf(' function reveal(change){'),source.indexOf(' const readingPositions'));
 let adopted=0,prepared=0,committed=0,options;const ready=Promise.resolve();
 const ctx=vm.createContext({picker:{},saved:{},turns:{begin:value=>options=value},previewReading:()=>{prepared++;return ready;},win:{scrollTo(){}},main:{focus(){}},onClose:()=>committed++});
 vm.runInContext(block,ctx);ctx.reveal(()=>adopted++);assert.equal(options.flutter,undefined,'no three-sheet repeat when selecting one word');assert.equal(options.prepare(),ready);options.commit();
 assert.equal(adopted,1);assert.equal(prepared,1);assert.equal(committed,1);
});
test('every frontmatter route is a single sheet, with first-frame feedback and no queued startup frame',async()=>{
 const source=await readFile(new URL('../gre-learning/contents.js',import.meta.url),'utf8');assert.ok(!source.includes('flutter'),'opening, closing, switching and row selection share one fold');
 let id=0,now=0,commits=0,preparations=0;const frames=new Map(),timers=new Map(),elements=[];
 const node=()=>({style:style(),classList:{add(){},remove(){}},dataset:{},setAttribute(){},removeAttribute(){},append(child){(this.children??=[]).push(child);},remove(){this.removed=true;}});
 const doc=events({hidden:false,documentElement:{},body:node(),createElement:()=>{const n=node();elements.push(n);return n;}});
 const win=events({innerWidth:400,innerHeight:800,performance:{now:()=>now},matchMedia:()=>events({matches:false}),getComputedStyle:()=>({getPropertyValue:()=> '1'}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:i=>timers.delete(i)});
 const main=node(),sheet=Object.assign(node(),{getBoundingClientRect:()=>({left:0,top:0,width:400,height:800,bottom:800,right:400})});
 const turn=installFrontmatterTurn({main,window:win,document:doc});
 const finished=turn.begin({source:sheet,prepare:()=>{preparations++;return Promise.resolve();},commit:()=>commits++});await micro();
 assert.equal(frames.size,1);const tick=[...frames.values()][0];frames.clear();now=16;tick(now);
 const overlay=elements.find(n=>n.className==='frontmatter-turn');assert.equal(overlay.children.length,1);assert.ok(Number(overlay.dataset.progress)>0,'input responds in the first animation frame');
 assert.equal(preparations,1);turn.finish();await finished;assert.equal(commits,1);assert.equal(frames.size,0,'completion leaves no second animation queued');
 const cancelled=turn.begin({source:sheet,interactive:true,prepare:()=>Promise.resolve(),rollback:()=>commits++});await micro();turn.paint(.2);turn.animate(false);turn.finish(false);await cancelled;assert.equal(commits,2);assert.equal(frames.size,0);
});

test('ordinary page turns preserve the outgoing presented video and never re-enable its hidden poster',async()=>{
 const h=harness();await h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();h.present();h.flush();h.video.currentTime=3.25;
 const loads=h.loads;
 for(let i=0;i<12;i++){
  h.motion.setTurning(true,{preservePresentation:true});assert.equal(h.video.paused,true);assert.equal(h.poster.style.getPropertyValue('opacity'),'0');assert.equal(h.callbacks.size,0,'ordinary pause does not retire a healthy video compositor');
  h.motion.setTurning(false,{preservePresentation:true});await micro();assert.equal(h.poster.style.getPropertyValue('opacity'),'1','rollback guards a potentially retired compositor');h.present();h.flush();assert.equal(h.poster.style.getPropertyValue('opacity'),'0');assert.equal(h.video.currentTime,3.25);assert.equal(h.loads,loads);
 }
 h.motion.destroy();
});
test('normal turn during first-frame wait retains decoded backing until a real presentation',async()=>{
 const h=harness();await h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();assert.equal(h.poster.style.getPropertyValue('opacity'),'1');
 h.motion.setTurning(true,{preservePresentation:true});h.motion.setTurning(false,{preservePresentation:true});await micro();assert.equal(h.poster.style.getPropertyValue('opacity'),'1');
 h.present();h.flush();assert.equal(h.poster.style.getPropertyValue('opacity'),'0');h.motion.destroy();
});
test('video failure during a normal turn preserves the semantic poster fallback',async()=>{
 const h=harness();await h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();h.present();h.flush();h.motion.setTurning(true,{preservePresentation:true});h.video.emit('error');h.motion.setTurning(false,{preservePresentation:true});
 assert.equal(h.video.style.opacity,'0');assert.notEqual(h.poster.style.getPropertyValue('opacity'),'0');assert.equal(h.video.paused,true);h.motion.destroy();
});
test('older video APIs preserve their poster backing and crop through cancelled ordinary turns',async()=>{
 const h=harness({rvfc:false});await h.motion.refresh({...media,waitForPresentedFrame:true});h.motion.activate();h.flush();h.flush();await micro();const crop=h.poster.style.getPropertyValue('clip-path');
 h.motion.setTurning(true,{preservePresentation:true});assert.equal(h.poster.style.getPropertyValue('opacity'),'1');assert.equal(h.poster.style.getPropertyValue('clip-path'),crop);h.motion.setTurning(false,{preservePresentation:true});await micro();assert.equal(h.poster.style.getPropertyValue('opacity'),'1');h.motion.destroy();
});


test('video decode finishing after page adoption resumes playback under its poster',async()=>{
 const h=harness();h.video.readyState=0;const decoding=h.motion.refresh(media);h.motion.activate();h.flush();h.flush();await micro();assert.equal(h.plays,0);
 h.video.readyState=2;h.video.emit('loadeddata');assert.equal(await decoding,true);await micro();assert.equal(h.plays,1);assert.equal(h.poster.style.getPropertyValue('opacity'),'1');h.present();h.flush();assert.equal(h.poster.style.getPropertyValue('opacity'),'0');h.motion.destroy();
});
