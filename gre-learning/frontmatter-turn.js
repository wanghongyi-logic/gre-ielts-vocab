// One transaction owns the outgoing leaf, its prepared destination, and cleanup.
// The live reading DOM stays attached: no video clone, frame capture, or reload.
const clamp=value=>Math.max(0,Math.min(1,value));
export function leafGeometry(progress,direction,width,height,{left=0,top=0}={}) {
 const p=clamp(progress),back=direction==='previous',bend=Math.sin(Math.PI*p);
 const edge=1-p*1.12,bow=bend*.035,flip=x=>back?1-x:x;
 const points=[[flip(0),0],[flip(edge-bow),0],[flip(edge),.24],[flip(edge+bow),.5],[flip(edge),.76],[flip(edge-bow),1],[flip(0),1]];
 return {clip:`polygon(${points.map(([x,y])=>`${(left+x*width).toFixed(2)}px ${(top+y*height).toFixed(2)}px`).join(',')})`,edge:flip(edge)*100,curl:Math.min(21,p*65)*Math.pow(1-p,.55),bend,opacity:Math.min(1,p*22)*Math.min(1,(1-p)*15)};
}

export function installFrontmatterTurn({main,onActivity=()=>{},window:win=window,document:doc=document}) {
 const preference=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let active=null;
 const reduced=()=>Boolean(preference?.matches);
 function finish(commit=true){
  const state=active;if(!state)return;
  active=null;win.cancelAnimationFrame(state.frame);win.clearTimeout(state.timer);
  // Hide/restore the proper real leaf before removing the curl. No empty frame.
  if(state.face)state.face.inert=state.wasInert;
  (commit?state.commit:state.rollback)?.();
  state.restore?.();state.overlay?.remove();
  main.removeAttribute('data-contents-turning');onActivity(false);
  state.resolve();state.route?.();
 }
 function paint(progress){
  const state=active;if(!state)return;
  state.progress=clamp(progress);
  if(!state.overlay)return;
  const {bounds,rect,direction,face}=state;
  face.style.clipPath=leafGeometry(state.progress,direction,bounds.width,bounds.height,{left:bounds.left-rect.left,top:bounds.top-rect.top}).clip;
  state.overlay.dataset.progress=state.progress.toFixed(3);
  state.folds.forEach((fold,index)=>{
   const delay=state.flutter?index*.09:0;
   const p=clamp((state.progress-delay)/(1-delay));
   const shape=leafGeometry(p,direction,bounds.width,bounds.height);
   const curl=index?Math.min(shape.curl,7-index):shape.curl;
   fold.style.width=`${curl}%`;
   fold.style.left=`${shape.edge-(direction==='next'?curl:0)}%`;
   fold.style.opacity=String(shape.opacity*(index ? .65 : 1));
   fold.style.transform=`skewY(${shape.bend*(direction==='next'?-2.2:2.2)}deg)`;
   fold.style.setProperty('--leaf-bow',`${shape.bend*12}px`);
  });
 }
 function animate(commit=true){
  const state=active;if(!state)return;
  if(reduced()||!state.overlay){finish(commit);return;}
  win.cancelAnimationFrame(state.frame);win.clearTimeout(state.timer);
  const start=win.performance.now(),from=state.progress,target=commit?1:0;
  const duration=commit?Math.max(160,(state.flutter?510:360)*(1-from)):Math.max(140,240*from);
  function tick(now){
   if(active!==state)return;
   const t=clamp((now-start)/duration),eased=commit?t*t*(3-2*t):1-Math.pow(1-t,3);
   paint(from+(target-from)*eased);
   if(t<1)state.frame=win.requestAnimationFrame(tick);else finish(commit);
  }
  // The real target is laid out and painted before the first parting of paper.
  state.frame=win.requestAnimationFrame(()=>{state.frame=win.requestAnimationFrame(tick);});
  state.timer=win.setTimeout(()=>{if(active===state)finish(commit);},duration+350);
 }
 function begin({source,direction='previous',flutter=false,copy=false,visual=true,prepare,commit=()=>{},rollback=()=>{},interactive=false}) {
  if(active)finish(!active.interactive);
  const rect=source.getBoundingClientRect(),v=win.visualViewport;
  const left=Math.max(rect.left,v?.offsetLeft||0),top=Math.max(rect.top,v?.offsetTop||0);
  const right=Math.min(rect.right??rect.left+rect.width,(v?.offsetLeft||0)+(v?.width||win.innerWidth));
  const bottom=Math.min(rect.bottom,(v?.offsetTop||0)+(v?.height||win.innerHeight));
  const state=active={commit,rollback,interactive,direction,flutter,progress:0,frame:0,timer:0,rect,bounds:{left,top,width:Math.max(0,right-left),height:Math.max(0,bottom-top)}};
  state.finished=new Promise(resolve=>{state.resolve=resolve;});
  // The stylesheet is static in index.html. A missed/old stylesheet degrades to
  // an immediate complete leaf instead of showing an unstyled intermediate.
  const styled=win.getComputedStyle?.(doc.documentElement).getPropertyValue('--frontmatter-turn-ready').trim()==='1';
  if(visual&&!doc.hidden&&!reduced()&&styled&&state.bounds.width&&state.bounds.height){
   const face=copy?visibleImpression(source):source;
   state.face=face;
   const properties=['position','display','left','top','width','max-width','margin','clip-path','z-index','pointer-events'];
   const styles=properties.map(name=>[name,face.style.getPropertyValue(name),face.style.getPropertyPriority(name)]);
   state.wasInert=face.inert;
   face.classList.add('frontmatter-live-leaf');face.inert=true;
   Object.assign(face.style,{position:'fixed',display:'block',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,maxWidth:'none',margin:'0',zIndex:'18',pointerEvents:'none'});
   if(copy){face.removeAttribute('id');face.setAttribute('aria-hidden','true');doc.body.append(face);}
   state.restore=()=>{
    if(copy){face.remove();return;}
    face.classList.remove('frontmatter-live-leaf');
    for(const [name,value,priority] of styles){if(value)face.style.setProperty(name,value,priority);else face.style.removeProperty(name);}
    if(!face.style.cssText)face.removeAttribute('style');
   };
   const overlay=doc.createElement('div');overlay.className='frontmatter-turn';overlay.inert=true;overlay.setAttribute('aria-hidden','true');overlay.dataset.direction=direction;
   Object.assign(overlay.style,{left:`${left}px`,top:`${top}px`,width:`${state.bounds.width}px`,height:`${state.bounds.height}px`});
   state.folds=Array.from({length:flutter?3:1},(_,index)=>{const fold=doc.createElement('div');fold.className='frontmatter-fold';fold.dataset.sheet=String(index);overlay.append(fold);return fold;});
   state.overlay=overlay;doc.body.append(overlay);
  }
  main.setAttribute('data-contents-turning','');onActivity(true);
  try{prepare?.();paint(0);}catch(error){finish(false);throw error;}
  if(!interactive)animate(true);
  return state.finished;
 }
 // Only frontmatter is impressed for contents↔settings. Skip invisible branches
 // rather than copying hundreds of rows; the reading video is never impressed.
 function visibleImpression(node){
  if(node.nodeType!==1)return node.cloneNode(false);
  const copy=node.cloneNode(false);copy.removeAttribute('id');copy.removeAttribute('autofocus');copy.removeAttribute('aria-labelledby');copy.removeAttribute('aria-describedby');
  if(node.matches('.contents-entry,.offline-pack-row')){
   const box=node.getBoundingClientRect();
   if(box.bottom<0||box.top>win.innerHeight){copy.style.height=`${box.height}px`;return copy;}
  }
  if(node.matches('.contents-sheet')){const computed=win.getComputedStyle(node);for(const property of ['padding-top','padding-right','padding-bottom','padding-left']){const value=computed.getPropertyValue(property);if(value)copy.style.setProperty(property,value);}}
  if(node.matches('input')){copy.value=node.value;copy.checked=node.checked;}
  if(node.matches('progress'))copy.value=node.value;
  for(const child of node.childNodes)copy.append(visibleImpression(child));
  return copy;
 }
 const interrupt=()=>finish(!active?.interactive);
 const suspend=()=>{if(active)active.route=null;interrupt();};
 win.addEventListener('pagehide',suspend);win.addEventListener('resize',interrupt);win.addEventListener('orientationchange',interrupt);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)interrupt();});
 preference?.addEventListener?.('change',interrupt);
 win.visualViewport?.addEventListener?.('resize',interrupt);win.visualViewport?.addEventListener?.('scroll',interrupt);
 return {begin,paint,animate,finish,interrupt,cancel(){if(active)active.route=null;interrupt();},get busy(){return Boolean(active);},get interactive(){return Boolean(active?.interactive);},whenSettled:()=>active?.finished||Promise.resolve(),deferRoute(callback){if(!active)return false;active.route=callback;if(active.interactive)finish(false);return true;}};
}
