import test from 'node:test';
import assert from 'node:assert/strict';
import {installReadingScroll,TABLET_LEARNING_QUERY} from '../gre-learning/reading-scroll.js';
import {installReadingPosition,READING_KEY} from '../gre-learning/reading-position.js';

function harness(initialLandscape=false){
 const events=new Map(),surfaceEvents=new Map(),modeListeners=new Set(),frames=new Map(),store=new Map();let frame=0;
 const mode={matches:initialLandscape,addEventListener:(_,fn)=>modeListeners.add(fn),removeEventListener:(_,fn)=>modeListeners.delete(fn)};
 const container={scrollTop:0,clientHeight:700,scrollHeight:2600,contains:node=>node.id!=='word-title',getBoundingClientRect:()=>({top:20}),scrollTo(options){container.scrollTop=options.top;surfaceEvents.get('scroll')?.({target:container});}};
 const positions={"word-title":24,memory:350,usage:1000,'context-examples':1700,comparison:2300};
 const nodes=Object.fromEntries(Object.keys(positions).map(id=>[id,{id,getBoundingClientRect(){return {top:mode.matches?(id==='word-title'?24:20+positions[id]-350-container.scrollTop):positions[id]-win.scrollY};}}]));
 const surface={hidden:false,addEventListener:(name,fn)=>surfaceEvents.set(name,fn),removeEventListener(){},hasAttribute:()=>false,querySelector:selector=>selector==='.reading-scroll'?container:null,contains:node=>Object.values(nodes).includes(node)};
 const win={scrollY:0,innerHeight:800,location:{hash:'#/learn/1'},localStorage:{getItem:key=>store.get(key),setItem:(key,value)=>store.set(key,value)},sessionStorage:{getItem:()=>null,setItem(){}},matchMedia:query=>{assert.equal(query,TABLET_LEARNING_QUERY);return mode;},addEventListener:(name,fn)=>events.set(name,fn),removeEventListener(){},getComputedStyle:()=>({scrollMarginTop:'18px'}),scrollTo(options){win.scrollY=options.top;events.get('scroll')?.({currentTarget:win,target:doc});},requestAnimationFrame:fn=>{frames.set(++frame,fn);return frame;},cancelAnimationFrame:id=>frames.delete(id),setTimeout,clearTimeout};
 const doc={documentElement:{scrollHeight:3200},getElementById:id=>nodes[id],querySelectorAll:()=>Object.keys(nodes).map(section=>({dataset:{section}})),addEventListener(){}};
 const scroll=installReadingScroll({surface,window:win,document:doc});
 return {win,doc,surface,container,scroll,store,nodes,mode,
  rotate(landscape){mode.matches=landscape;for(const fn of modeListeners)fn({matches:landscape});},
  flushFrames(){while(frames.size){const pending=[...frames.values()];frames.clear();for(const fn of pending)fn();}},
  emitWindowScroll(){events.get('scroll')?.({currentTarget:win,target:doc});}};
}

test('landscape scrolls only the reading leaf; portrait retains document scrolling',()=>{
 const h=harness(true);h.scroll.to(620);assert.equal(h.container.scrollTop,620);assert.equal(h.win.scrollY,0);
 assert.equal(h.scroll.top(h.nodes.usage),650);assert.equal(h.scroll.top(h.nodes['word-title']),0);
 h.scroll.intoView(h.nodes.usage);assert.equal(h.container.scrollTop,632);
 h.rotate(false);h.scroll.to(620);assert.equal(h.win.scrollY,620);assert.equal(h.container.scrollTop,632);
 h.scroll.intoView(h.nodes.usage);assert.equal(h.win.scrollY,982);
});

test('only the active reading root dispatches a reading scroll',()=>{
 const h=harness(true);let calls=0;h.scroll.onScroll(()=>calls++);
 h.emitWindowScroll();assert.equal(calls,0);h.scroll.to(300);assert.equal(calls,1);
 h.rotate(false);h.scroll.to(300);assert.equal(calls,2);
 // Ignore a CSS layout-reset scroll before matchMedia delivers its change.
 h.mode.matches=true;h.emitWindowScroll();assert.equal(calls,2);
});

test('rotating preserves the semantic chapter and offset in both directions',()=>{
 const h=harness(false),picker={open:false};
 const reading=installReadingPosition({entries:[{number:1}],surface:h.surface,picker,getSelected:()=>1,window:h.win,document:h.doc,scroll:h.scroll});
 reading.adopted(1);h.scroll.to(1030);reading.capture();
 assert.equal(JSON.parse(h.store.get(READING_KEY)).section,'usage');
 h.rotate(true);h.flushFrames();assert.equal(h.container.scrollTop,680);assert.equal(h.win.scrollY,1030);
 h.scroll.to(850);h.rotate(false);h.flushFrames();assert.equal(h.win.scrollY,1200);
 assert.equal(JSON.parse(h.store.get(READING_KEY)).section,'usage');
});

test('rotation while the contents leaf is open defers reading restoration until close',()=>{
 const h=harness(false),picker={open:false};
 const reading=installReadingPosition({entries:[{number:1}],surface:h.surface,picker,getSelected:()=>1,window:h.win,document:h.doc,scroll:h.scroll});
 reading.adopted(1);h.scroll.to(1040);picker.open=true;h.rotate(true);h.flushFrames();
 assert.equal(h.container.scrollTop,0);picker.open=false;assert.equal(reading.restore(),true);assert.equal(h.container.scrollTop,690);
});

test('a chapter jump retains its breathing room instead of anchoring the preceding chapter',()=>{
 const h=harness(true),picker={open:false};
 const reading=installReadingPosition({entries:[{number:1}],surface:h.surface,picker,getSelected:()=>1,window:h.win,document:h.doc,scroll:h.scroll});
 reading.adopted(1);h.scroll.intoView(h.nodes.usage);reading.capture();
 const saved=JSON.parse(h.store.get(READING_KEY));assert.equal(saved.section,'usage');assert.equal(saved.offset,-18);
 h.rotate(false);h.flushFrames();assert.equal(h.win.scrollY,982);
 h.rotate(true);h.flushFrames();assert.equal(h.container.scrollTop,632);
});
