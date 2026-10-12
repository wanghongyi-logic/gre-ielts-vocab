// One physical pigment mark follows semantic selection; controls never move.
export function accentPlacement(navRect,controlRect,{inkOffset=0,fullControl=false}={}) {
 const height=fullControl?Math.min(180,Math.max(32,controlRect.height-20)):Math.min(54,Math.max(32,controlRect.height-10));
 const center=controlRect.top+controlRect.height/2+inkOffset;
 return {x:7,y:Math.max(0,Math.min(navRect.height-height,center-navRect.top-height/2)),height};
}
export const DIFFUSION_MS=460;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const t=clamp(v);return t*t*(3-2*t);};
export function diffusionFrame(elapsed,sourceStrength=1){
 const t=clamp(elapsed/DIFFUSION_MS);
 return {done:t===1,sourceOpacity:sourceStrength*(1-smooth(t/.57)),sourceScale:1+.12*smooth(t/.57),
  targetOpacity:smooth((t-.32)/.6),targetScale:.66+.34*smooth((t-.32)/.68),
  bridgeOpacity:.34*smooth(t/.22)*(1-smooth((t-.45)/.37)),
  bridgeHead:smooth(t/.62),bridgeTail:smooth((t-.24)/.6)};
}
export function interruptedSource(motion,now){
 const f=diffusionFrame(now-motion.started,motion.strength);
 return f.targetOpacity>=f.sourceOpacity?{position:motion.to,strength:f.targetOpacity}:{position:motion.from,strength:f.sourceOpacity};
}
export function installMovingWatercolor(nav){
 if(!nav?.ownerDocument?.createElement||nav.dataset.movingWatercolorReady)return;
 nav.dataset.movingWatercolorReady='true';
 const doc=nav.ownerDocument,win=doc.defaultView;
 function layer(className){const el=doc.createElement('div');el.className=className;el.setAttribute('aria-hidden','true');nav.append(el);return el;}
 const source=layer('margin-selection diffusion-source'),mark=layer('margin-selection diffusion-target'),bridge=layer('margin-diffusion-bridge');
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let selected=null,position=null,motion=null,animationFrame=0,frame=0,instant=false,lastTarget='';
 const now=()=>win.performance.now();
 function at(el,p,opacity=1,scale=1){el.hidden=false;el.style.height=`${p.height}px`;el.style.opacity=String(opacity);el.style.transform=`translate3d(${p.x}px,${p.y}px,0) scale(${scale})`;}
 function stop(){win.cancelAnimationFrame(animationFrame);animationFrame=0;motion=null;source.hidden=true;bridge.hidden=true;}
 function render(timestamp){
  if(!motion)return;
  const f=diffusionFrame(timestamp-motion.started,motion.strength);
  at(source,motion.from,f.sourceOpacity,f.sourceScale);at(mark,motion.to,f.targetOpacity,f.targetScale);
  const a=motion.from.y+motion.from.height/2,b=motion.to.y+motion.to.height/2;
  const top=Math.min(a,b),height=Math.abs(b-a);
  bridge.hidden=false;bridge.style.top=`${top}px`;bridge.style.height=`${height}px`;bridge.style.opacity=String(f.bridgeOpacity);
  const start=Math.min(f.bridgeHead,f.bridgeTail),end=Math.max(f.bridgeHead,f.bridgeTail);
  const low=a<b?start:1-end,high=a<b?end:1-start,feather=(high-low)*.3;
  const mask=`linear-gradient(to bottom,transparent ${low*100}%,#000 ${(low+feather)*100}%,#000 ${(high-feather)*100}%,transparent ${high*100}%)`;
  bridge.style.maskImage=mask;bridge.style.webkitMaskImage=mask;
  if(f.done){const target=motion.to;stop();at(mark,target);return;}
  animationFrame=win.requestAnimationFrame(render);
 }
 function place(immediate=false){
  const control=nav.querySelector('.margin-control.is-current');
  if(!control){stop();mark.hidden=true;selected=null;position=null;return;}
  const nr=nav.getBoundingClientRect(),cr=control.getBoundingClientRect();
  const list=control.closest?.('.bookmark-list'),lr=list?.getBoundingClientRect();
  if(lr&&(cr.bottom<=lr.top||cr.top>=lr.bottom)){stop();mark.hidden=true;position=null;return;}
  const inkOffset=control.id==='open-search'?(win.innerHeight<=640?0:win.innerHeight<=760?5:10):0;
  const target=accentPlacement(nr,cr,{inkOffset,fullControl:control.id==='open-settings'});
  const key=`${target.x},${target.y},${target.height}`;
  if(position&&!mark.hidden&&selected===control&&key===lastTarget&&!immediate)return;
  const time=now(),previous=motion?interruptedSource(motion,time):{position,strength:1};
  selected=control;lastTarget=key;stop();position=target;
  if(previous.position&&!immediate&&!reduced?.matches&&Math.abs(previous.position.y-target.y)>.5){
   motion={from:previous.position,to:target,strength:previous.strength,started:time};render(time);
  }else at(mark,target);
 }
 function schedule(immediate=false){instant=instant||immediate;if(frame)return;frame=win.requestAnimationFrame(()=>{frame=0;const now=instant;instant=false;place(now);});}
 if(win.MutationObserver){new win.MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.classList?.contains('margin-control')))schedule();}).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});}
 if(win.ResizeObserver){const observer=new win.ResizeObserver(()=>schedule(true));observer.observe(nav);for(const el of nav.querySelectorAll('.margin-control,.bookmark-list'))observer.observe(el);}
 win.addEventListener('resize',()=>schedule(true),{passive:true});
 nav.querySelector('.bookmark-list')?.addEventListener('scroll',()=>schedule(true),{passive:true});
 reduced?.addEventListener?.('change',()=>schedule(true));
 place(true);
 return {place,mark,source,bridge};
}
