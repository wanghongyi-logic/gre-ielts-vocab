import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPageTransition,paintPageTransition,installWordSwipe} from '../gre-learning/swipe.js';
import {installFrontmatterTurn} from '../gre-learning/frontmatter-turn.js';

class Events{
 constructor(){this.listeners=new Map();}
 addEventListener(type,fn){const list=this.listeners.get(type)||new Set();list.add(fn);this.listeners.set(type,list);}
 removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}
 emit(type,properties={}){const event={type,target:this,cancelable:true,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){},...properties};for(const fn of this.listeners.get(type)||[])fn(event);return event;}
}
function style(){const values=new Map(),writes=[];return new Proxy({writes,setProperty(k,v){values.set(k,String(v));writes.push(k);},removeProperty(k){values.delete(k);writes.push(k);},getPropertyValue:k=>values.get(k)||''},{get:(target,key)=>key in target?target[key]:values.get(key)||'',set(target,key,value){values.set(key,String(value));writes.push(key);return true;}});}
class Node extends Events{
 constructor(tag='div'){super();this.tagName=tag;this.style=style();this.dataset={};this.children=[];this.attributes=new Map();this.className='';this.inert=false;this.clientWidth=1280;this.scrollTop=0;this.scrollLeft=0;this.box={left:0,top:0,width:1280,height:800,right:1280,bottom:800};this.classList={contains:n=>this.className.split(' ').includes(n),add:(...names)=>{this.className=[...new Set([...this.className.split(' '),...names])].join(' ');},remove:(...names)=>{this.className=this.className.split(' ').filter(n=>!names.includes(n)).join(' ');},toggle:(n,on)=>on?this.classList.add(n):this.classList.remove(n)};}
 append(...nodes){for(const node of nodes){node.remove();node.parentNode=this;this.children.push(node);}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(node=>node!==this);this.parentNode=null;}
 setAttribute(k,v){this.attributes.set(k,String(v));}removeAttribute(k){this.attributes.delete(k);}hasAttribute(k){return this.attributes.has(k);}
 getBoundingClientRect(){return this.box;}
 contains(node){return node===this||this.children.some(child=>child.contains(node));}
 matches(selector){return selector.startsWith('.')&&this.classList.contains(selector.slice(1));}
 closest(selector){return this.matches(selector)?this:this.parentNode?.closest(selector)||null;}
 querySelectorAll(selector){return this.children.flatMap(node=>[...(node.matches(selector)?[node]:[]),...node.querySelectorAll(selector)]);}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 cloneNode(){throw Error('Transition must never clone the reading or directory DOM');}
 focus(){}
}
function fixture({reduced=false,styled=true,width=1280,height=800}={}){
 let now=0,id=0;const frames=new Map(),timers=new Map(),doc=new Events(),win=new Events();
 const preference=new Events();preference.matches=reduced;
 Object.assign(win,{innerWidth:width,innerHeight:height,scrollX:0,scrollY:0,performance:{now:()=>now},matchMedia:()=>preference,getComputedStyle:()=>({getPropertyValue:()=>styled?'1':''}),getSelection:()=>({toString:()=>''}),requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:i=>frames.delete(i),setTimeout:(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id;},clearTimeout:i=>timers.delete(i)});
 Object.assign(doc,{hidden:false,documentElement:new Node('html'),body:new Node('body'),createElement:tag=>new Node(tag),querySelector:selector=>doc.body.querySelector(selector)});doc.activeElement=doc.body;
 const main=new Node('main'),article=new Node('article'),pane=new Node('div'),video=new Node('video'),picker=new Node('dialog');
 article.className='reading-layout';pane.className='reading-scroll';pane.scrollTop=486;article.append(pane,video);main.append(article);doc.body.append(main,picker);picker.open=false;
 for(const node of [main,article,picker])node.box={left:0,top:0,width,height,right:width,bottom:height};main.clientWidth=width;
 const tick=(ms=16)=>{now+=ms;const work=[...frames.values()];frames.clear();for(const fn of work)fn(now);for(const [key,timer]of [...timers])if(timer.at<=now){timers.delete(key);timer.fn();}};
 return {win,doc,main,article,pane,video,picker,tick,frames,timers,transitions:()=>doc.body.querySelectorAll('.page-transition')};
}

test('the light transition contains only empty paper layers and changes compositor properties',()=>{
 for(const [width,height]of [[1280,800],[800,1280],[844,390],[1440,900]]){
  const f=fixture({width,height});const transition=createPageTransition({source:f.article,window:f.win,document:f.doc});
  assert.equal(transition.layer.children.length,2);assert.equal(f.main.contains(f.video),true);assert.equal(f.pane.scrollTop,486);
  const geometry=Object.fromEntries(['left','top','width','height'].map(k=>[k,transition.layer.style[k]]));
  transition.wash.style.writes.length=0;transition.edge.style.writes.length=0;
  paintPageTransition(transition,.6);paintPageTransition(transition,.4,'previous');
  assert.deepEqual(new Set(transition.wash.style.writes),new Set(['opacity']));assert.deepEqual(new Set(transition.edge.style.writes),new Set(['opacity','transform']));
  assert.deepEqual(Object.fromEntries(Object.keys(geometry).map(k=>[k,transition.layer.style[k]])),geometry);
  assert.equal(transition.layer.style.width,`${width}px`);assert.equal(transition.layer.style.height,`${height}px`);
 }
});

test('frontmatter keeps the original tree and does not change the destination until commit',async()=>{
 const f=fixture();let prepared=0,committed=0;const turn=installFrontmatterTurn({main:f.main,window:f.win,document:f.doc});
 const done=turn.begin({source:f.picker,copy:true,prepare:()=>prepared++,commit:()=>committed++});
 assert.equal(prepared,0);assert.equal(committed,0);assert.equal(f.picker.parentNode,f.doc.body);
 f.tick(100);assert.equal(prepared,0);assert.equal(turn.busy,true);
 f.tick(140);await done;assert.equal(prepared,1);assert.equal(committed,1);assert.equal(turn.busy,false);assert.equal(f.main.contains(f.video),true);assert.equal(f.pane.scrollTop,486);
 f.tick(220);assert.equal(f.transitions().length,0);
});

test('a cancelled native preview preserves directory, media and reading position',async()=>{
 const f=fixture();let prepared=0,rolledBack=0;const turn=installFrontmatterTurn({main:f.main,window:f.win,document:f.doc});
 const done=turn.begin({source:f.picker,interactive:true,prepare:()=>prepared++,rollback:()=>rolledBack++});
 turn.paint(.5);turn.animate(false);f.tick(180);await done;
 assert.equal(prepared,0);assert.equal(rolledBack,1);assert.equal(f.picker.inert,false);assert.equal(f.main.hasAttribute('data-contents-turning'),false);assert.equal(f.transitions().length,0);assert.equal(f.pane.scrollTop,486);
});

test('async media preparation is held behind opaque paper; rejection and cancellation clean up',async()=>{
 for(const reject of [false,true]){
  const f=fixture();let settle,commits=0,rollbacks=0;const turn=installFrontmatterTurn({main:f.main,window:f.win,document:f.doc});
  const done=turn.begin({source:f.picker,prepare:()=>new Promise((resolve,fail)=>{settle=reject?fail:resolve;}),commit:()=>commits++,rollback:()=>rollbacks++});
  f.tick(240);assert.equal(turn.busy,true);assert.equal(f.transitions()[0].children[0].style.opacity,'1');assert.equal(commits,0);
  settle();await done;assert.equal(commits,reject?0:1);assert.equal(rollbacks,reject?1:0);assert.equal(turn.busy,false);f.tick(220);assert.equal(f.transitions().length,0);
 }
 const f=fixture();let resolve,commits=0;const turn=installFrontmatterTurn({main:f.main,window:f.win,document:f.doc});
 const done=turn.begin({source:f.picker,interactive:true,prepare:()=>new Promise(r=>resolve=r),commit:()=>commits++});
 turn.finish();turn.animate(false);await done;resolve();await Promise.resolve();assert.equal(commits,0);assert.equal(f.transitions().length,0);
});

test('reduced motion or an unavailable new stylesheet still navigates without an overlay',async()=>{
 for(const options of [{reduced:true},{styled:false}]){
  const f=fixture(options);let prepared=0,commits=0;const turn=installFrontmatterTurn({main:f.main,window:f.win,document:f.doc});
  await turn.begin({source:f.picker,prepare:()=>prepared++,commit:()=>commits++});
  assert.equal(prepared,1);assert.equal(commits,1);assert.equal(f.transitions().length,0);assert.equal(f.frames.size,0);
 }
});

test('throwing adoption restores interaction and does not strand a paper layer',async()=>{
 const f=fixture();const turn=installFrontmatterTurn({main:f.main,window:f.win,document:f.doc});
 const done=turn.begin({source:f.picker,interactive:true,commit:()=>{throw Error('adoption failed');}});
 assert.throws(()=>turn.finish(),/adoption failed/);await done;
 assert.equal(turn.busy,false);assert.equal(f.picker.inert,false);assert.equal(f.transitions().length,0);assert.equal(f.main.hasAttribute('data-contents-turning'),false);
 let committed=false;const next=turn.begin({source:f.picker,interactive:true,commit:()=>committed=true});turn.finish();await next;assert.equal(committed,true);
});

test('word turns leave both live media and prepared roots in place until navigation',()=>{
 const f=fixture(),prepared=new Node(),navigated=[];
 const swipe=installWordSwipe({surface:f.main,picker:f.picker,getNeighbor:()=>2,getPrepared:()=>({number:2,root:prepared}),onNavigate:n=>navigated.push(n),window:f.win,document:f.doc});
 assert.equal(swipe.go('next'),true);f.tick(100);assert.equal(navigated.length,0);assert.equal(prepared.parentNode,undefined);assert.equal(f.main.contains(f.video),true);assert.equal(f.pane.scrollTop,486);
 f.tick(150);assert.deepEqual(navigated,[2]);swipe.rendered('next word');assert.equal(swipe.busy,false);f.tick(220);assert.equal(f.transitions().length,0);swipe.destroy();
});

test('vertical touch remains native and cannot select another word',()=>{
 const f=fixture(),navigated=[];
 const swipe=installWordSwipe({surface:f.main,picker:f.picker,getNeighbor:()=>2,getPrepared:()=>({number:2,root:new Node()}),onNavigate:n=>navigated.push(n),window:f.win,document:f.doc});
 f.main.emit('touchstart',{target:f.pane,touches:[{identifier:1,clientX:900,clientY:600}]});
 const event=f.main.emit('touchmove',{target:f.pane,touches:[{identifier:1,clientX:894,clientY:450}]});
 f.win.emit('touchend',{changedTouches:[{identifier:1,clientX:894,clientY:450}]});
 assert.equal(Boolean(event.defaultPrevented),false);assert.equal(navigated.length,0);assert.equal(f.transitions().length,0);swipe.destroy();
});

test('runtime no longer clones DOM, captures video or animates page geometry',async()=>{
 const swipe=await readFile(new URL('../gre-learning/swipe.js',import.meta.url),'utf8'),frontmatter=await readFile(new URL('../gre-learning/frontmatter-turn.js',import.meta.url),'utf8');
 for(const source of [swipe,frontmatter])assert.doesNotMatch(source,/\.cloneNode\(|createElement\(['"]canvas|drawImage\(|\.style\.(?:clipPath|filter)\s*=/);
 const css=await readFile(new URL('../gre-learning/page-transitions.css',import.meta.url),'utf8');assert.doesNotMatch(css,/(?:clip-path|backdrop-filter|filter\s*:|box-shadow|border\s*:)/);assert.match(css,/prefers-reduced-motion/);
});
