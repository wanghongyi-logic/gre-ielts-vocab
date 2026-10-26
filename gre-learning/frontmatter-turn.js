import {createPageTransition,paintPageTransition,revealPageTransition} from './swipe.js';

// One transaction owns preparation, atomic adoption, reveal and cleanup.
// The actual source stays untouched until a light paper wash covers it.
const clamp=value=>Math.max(0,Math.min(1,value));
export function leafGeometry(progress,direction,width,height,{left=0,top=0}={}) {
 const p=clamp(progress),back=direction==='previous',bend=Math.sin(Math.PI*p);
 const edge=1-p*1.12,bow=bend*.035,flip=x=>back?1-x:x;
 // Intersect the outgoing face with the real leaf, not its possibly wider DOM
 // box. Overshoot may move the curl offscreen, but must never resurrect a strip
 // of old text beyond the fixed book edge. At p=1 the face has exactly zero area.
 // The reverse-paper curl ends at `edge`. Bow only into the outgoing paper:
 // edge+bow protruded beyond the curl and exposed old text on the new page.
 const points=[[flip(0),0],[flip(edge-bow),0],[flip(edge-bow*.35),.24],[flip(edge),.5],[flip(edge-bow*.35),.76],[flip(edge-bow),1],[flip(0),1]];
 return {clip:`polygon(${points.map(([x,y])=>`${(left+clamp(x)*width).toFixed(2)}px ${(top+y*height).toFixed(2)}px`).join(',')})`,edge:flip(edge)*100,curl:Math.min(21,p*65)*Math.pow(1-p,.55),bend,opacity:Math.min(1,p*22)*Math.min(1,(1-p)*15)};
}

export function installFrontmatterTurn({main,onActivity=()=>{},window:win=window,document:doc=document}) {
 const preference=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let active=null,revealCleanup=null;
 const reduced=()=>Boolean(preference?.matches);
 function finish(commit=true){
  const state=active;if(!state)return;
  // Frontmatter prepare callbacks change the real directory/dialog. Defer
  // those changes until the wash is opaque instead of copying the old tree.
  if(commit&&!state.prepared){
   state.prepared=true;paint(1);
   try{
    const result=state.prepare?.();
    if(result?.then){
     state.preparing=true;
     Promise.resolve(result).then(()=>{if(active===state){state.preparing=false;finish(true);}},()=>{if(active===state){state.preparing=false;finish(false);}});
     return;
    }
   }catch(error){finish(false);throw error;}
  }else if(commit&&state.preparing)return;
  active=null;win.cancelAnimationFrame(state.frame);win.clearTimeout(state.timer);
  state.source.inert=state.wasInert;state.source.classList.remove('is-page-transition-source');
  let completed=false;
  try{(commit?state.commit:state.rollback)?.();completed=commit;}
  finally{
   try{
    if(completed&&state.transition)revealCleanup=revealPageTransition(state.transition,{window:win,reduced:reduced()});
    else state.transition?.layer.remove();
    main.removeAttribute('data-contents-turning');
   }finally{try{onActivity(false);}finally{state.resolve();state.route?.();}}
  }
 }
 function paint(progress){
  const state=active;if(!state)return;
  state.progress=state.preparing?1:clamp(progress);
  if(state.transition)paintPageTransition(state.transition,state.progress,state.direction);
 }
 function animate(commit=true){
  const state=active;if(!state)return;
  if(state.preparing){if(!commit)finish(false);return;}
  if(reduced()||!state.transition){finish(commit);return;}
  win.cancelAnimationFrame(state.frame);win.clearTimeout(state.timer);
  const start=win.performance.now(),from=state.progress,target=commit?1:0;
  const duration=commit?Math.max(130,230*(1-from)):Math.max(110,170*from);
  function tick(now){
   if(active!==state)return;
   const t=clamp((now-start)/duration),eased=commit?t*t*(3-2*t):1-Math.pow(1-t,3);
   paint(from+(target-from)*eased);
   if(t<1)state.frame=win.requestAnimationFrame(tick);else finish(commit);
  }
  state.frame=win.requestAnimationFrame(tick);
  state.timer=win.setTimeout(()=>{if(active===state)finish(commit);},duration+350);
 }
 function begin({source,direction='previous',copy=false,visual=true,prepare,commit=()=>{},rollback=()=>{},interactive=false}) {
  if(active)finish(false);
  revealCleanup?.();revealCleanup=null;
  const state=active={source,prepare,commit,rollback,interactive,direction,progress:0,frame:0,timer:0,prepared:false,preparing:false,wasInert:source.inert};
  state.finished=new Promise(resolve=>{state.resolve=resolve;});
  // `copy` remains an accepted option for callers, but no source is copied.
  if(visual&&!doc.hidden&&!reduced())state.transition=createPageTransition({source,direction,kind:'frontmatter',window:win,document:doc});
  source.classList.add('is-page-transition-source');source.inert=true;
  main.setAttribute('data-contents-turning','');onActivity(true);
  paint(0);if(!interactive)animate(true);
  return state.finished;
 }
 const interrupt=()=>finish(!active?.interactive);
 const suspend=()=>{if(active)active.route=null;interrupt();revealCleanup?.();revealCleanup=null;};
 win.addEventListener('pagehide',suspend);win.addEventListener('resize',interrupt);win.addEventListener('orientationchange',interrupt);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)interrupt();});
 preference?.addEventListener?.('change',interrupt);
 win.visualViewport?.addEventListener?.('resize',interrupt);win.visualViewport?.addEventListener?.('scroll',interrupt);
 return {begin,paint,animate,finish,interrupt,cancel(){if(active)active.route=null;interrupt();},get busy(){return Boolean(active);},get interactive(){return Boolean(active?.interactive);},whenSettled:()=>active?.finished||Promise.resolve(),deferRoute(callback){if(!active)return false;active.route=callback;if(active.interactive)finish(false);return true;}};
}

