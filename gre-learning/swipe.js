// Distance, not velocity, decides navigation. Touch events explicitly arbitrate
// horizontal dragging versus native vertical scrolling on mobile Safari.
export const SWIPE = Object.freeze({edge:18, slop:10, directionRatio:1.3, intentSlop:4, intentRatio:2, holdLimit:500});
export function startSwipe({x,y,width,time=0,previous=false,next=false}) {
  return {x,y,width,time,previous,next,axis:'pending',dx:0,dy:0,offset:0,ready:false,direction:null,threshold:Math.min(112,Math.max(68,width*.20))};
}
export function moveSwipe(state,{x,y,time}) {
  const dx=x-state.x,dy=y-state.y,ax=Math.abs(dx),ay=Math.abs(dy);
  let axis=state.axis;
  if(axis==='pending') {
    if(time-state.time>SWIPE.holdLimit) axis='cancelled';
    else if(ay>=SWIPE.slop && ax<ay*SWIPE.directionRatio) axis='vertical';
    else if(ax>=SWIPE.slop && ax>=ay*SWIPE.directionRatio) axis='horizontal';
  }
  const direction=dx<0?'next':'previous';
  const available=Boolean(state[direction]);
  // Reversing course or moving vertically before release unarms the gesture.
  const aligned=ax>=ay*SWIPE.directionRatio;
  const ready=axis==='horizontal'&&available&&aligned&&ax>=state.threshold;
  const offset=axis==='horizontal' ? Math.sign(dx)*(available?Math.min(ax,state.threshold+Math.sqrt(Math.max(0,ax-state.threshold))*5):Math.min(32,Math.sqrt(ax)*2.2)) : 0;
  return {...state,dx,dy,axis,direction,available,ready,offset};
}

// DOM rectangles and fixed overlays use layout-viewport coordinates. The visible
// viewport can move inside it when mobile browser chrome or orientation changes.
export const paperSafeInset=(articleTop,viewportTop,inset)=>Math.max(0,Math.min(inset,articleTop-viewportTop));
export function paperViewportBounds(rect,{left=0,top=0,width,height},safeTop=0,edgeLeft=Infinity){
 const x=Math.max(rect.left,left),y=Math.max(rect.top,top+Math.max(0,safeTop));
 const right=Math.min(rect.right??rect.left+rect.width,left+width,edgeLeft);
 const bottom=Math.min(rect.bottom,top+height);
 return {left:x,top:y,width:Math.max(0,right-x),height:Math.max(0,bottom-y)};
}

// cloneNode copies the reading tree, but not a nested pane's scroll position.
// Apply this only after the impression is connected and has its final geometry;
// a detached/unsized scroll box would clamp the copied offset back to zero.
export function copyReadingScrollState(source,impression){
 const originals=source.querySelectorAll('.reading-scroll');
 impression.querySelectorAll('.reading-scroll').forEach((pane,index)=>{
  const original=originals[index];if(!original)return;
  pane.scrollTop=original.scrollTop;pane.scrollLeft=original.scrollLeft;
 });
}

// A transition contains only two empty paint layers. The live reading tree,
// decoded poster and video remain where they are until atomic page adoption.
export function createPageTransition({source,direction='next',kind='word',window:win=window,document:doc=document}){
 const styled=win.getComputedStyle?.(doc.documentElement).getPropertyValue('--page-transitions-ready').trim()==='1';
 if(!styled)return null;
 const rect=source.getBoundingClientRect(),v=win.visualViewport;
 const viewport={left:v?.offsetLeft||0,top:v?.offsetTop||0,width:v?.width||win.innerWidth,height:v?.height||win.innerHeight};
 const foreedge=doc.querySelector?.('.bookmarks.paper-foreedge')?.getBoundingClientRect?.();
 const bounds=paperViewportBounds(rect,viewport,0,foreedge?.width>0?foreedge.left:Infinity);
 if(!bounds.width||!bounds.height)return null;
 const layer=doc.createElement('div');layer.className='page-transition';layer.dataset.kind=kind;layer.dataset.direction=direction;
 layer.inert=true;layer.setAttribute('aria-hidden','true');
 Object.assign(layer.style,{left:`${bounds.left}px`,top:`${bounds.top}px`,width:`${bounds.width}px`,height:`${bounds.height}px`});
 const wash=doc.createElement('div');wash.className='page-transition-wash';
 const edge=doc.createElement('div');edge.className='page-transition-edge';
 layer.append(wash,edge);doc.body.append(layer);
 const transition={layer,wash,edge,width:bounds.width,direction};paintPageTransition(transition,0,direction);return transition;
}
export function paintPageTransition(transition,progress,direction=transition.direction){
 const p=Math.max(0,Math.min(1,progress));transition.direction=direction;
 transition.layer.dataset.direction=direction;transition.layer.dataset.progress=p.toFixed(3);
 // Only compositor-friendly properties change while a finger/animation moves.
 transition.wash.style.opacity=String(Math.pow(p,1.22));
 transition.edge.style.opacity=String(Math.sin(Math.PI*p)*.66);
 const across=transition.width+88,x=(direction==='next'?1-p:p)*across-88;
 transition.edge.style.transform=`translate3d(${x.toFixed(2)}px,0,0)`;
}
export function revealPageTransition(transition,{window:win=window,reduced=false}={}){
 if(!transition)return ()=>{};
 const layer=transition.layer;let animation,timer,removed=false;
 const remove=()=>{if(removed)return;removed=true;win.clearTimeout(timer);layer.remove();};
 if(reduced){remove();return remove;}
 layer.dataset.phase='revealing';
 // The destination is already adopted and backed by its decoded poster. Fade
 // the small paper layer away; never animate or reparent the document itself.
 if(typeof layer.animate==='function'){
  animation=layer.animate([{opacity:1},{opacity:0}],{duration:150,easing:'cubic-bezier(.2,.7,.2,1)',fill:'forwards'});
  animation.finished.then(remove,remove);
 }else{
  layer.classList.add('is-revealing');
  layer.addEventListener('animationend',remove,{once:true});timer=win.setTimeout(remove,220);
 }
 return ()=>{animation?.cancel();remove();};
}

const INTERACTIVE='video[controls],audio[controls],a,button,input,textarea,select,option,summary,label,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="slider"],[role="textbox"],[data-no-swipe],dialog';
export function installWordSwipe({surface,hintHost,picker,getNeighbor,getPrepared=()=>null,prepareNeighbor=null,onNavigate,onTurnActivity=()=>{},window:win=window,document:doc=document}) {
  const feedback=doc.createElement('div');
  feedback.className='swipe-feedback';feedback.hidden=true;feedback.setAttribute('aria-hidden','true');
  const label=doc.createElement('span');label.className='swipe-label';
  const track=doc.createElement('span');track.className='swipe-track';
  const fill=doc.createElement('span');track.append(fill);feedback.append(label,track);doc.body.append(feedback);
  const hint=doc.createElement('p');hint.className='word-navigation-hint';hint.id='swipe-instructions';
  hint.textContent='左右拖动切换单词 · 上下滚动阅读';
  (hintHost||surface.parentNode).append(hint);
  surface.setAttribute('aria-describedby',hint.id);
  const status=doc.createElement('span');status.className='sr-only';status.setAttribute('role','status');status.setAttribute('aria-live','polite');doc.body.append(status);
  // Permanent, empty background only: never clone or animate native status text.
  const safeArea=doc.createElement('div');safeArea.className='paper-safe-area';
  safeArea.setAttribute('aria-hidden','true');safeArea.inert=true;doc.body.append(safeArea);
  const viewport=()=>{const v=win.visualViewport;return {left:v?.offsetLeft||0,top:v?.offsetTop||0,width:v?.width||win.innerWidth,height:v?.height||win.innerHeight};};
  function syncSafeArea(){
    const v=viewport();Object.assign(safeArea.style,{left:`${v.left}px`,top:`${v.top}px`,width:`${v.width}px`});
    // An already-inset standalone viewport can still report a nonzero env().
    // Paint only existing empty space, never cover text or add a second inset.
    safeArea.style.removeProperty('height');
    const requested=safeArea.getBoundingClientRect().height;
    const articleTop=surface.querySelector('.reading-layout')?.getBoundingClientRect().top??v.top;
    safeArea.style.height=`${paperSafeInset(articleTop,v.top,requested)}px`;
    return v;
  }
  syncSafeArea();
  const pointers=new Set();
  let gesture=null,pointerId=null,phase='idle',timer=null,frame=null,pressTimer=null,suppressUntil=0,enterDirection=null;
  let pendingTurn=0;
  let paperScrollX=0,paperScrollY=0;
  let paper=null,paperProgress=0,paperDirection=null,focusAfterTurn=false,revealCleanup=null;
  const motionPreference=win.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduced=()=>Boolean(motionPreference?.matches);
  const selected=()=>{
    const selection=win.getSelection?.();
    return Boolean(selection?.toString() && (surface.contains(selection.anchorNode)||surface.contains(selection.focusNode)));
  };
  const blocked=()=>surface.hasAttribute('data-contents-turning')||picker.open||Boolean(doc.querySelector('dialog[open]'));
  const interactive=target=>Boolean(target?.closest?.(INTERACTIVE));
  const clearTimer=()=>{win.clearTimeout(timer);timer=null;win.cancelAnimationFrame(frame);frame=null;win.clearTimeout(pressTimer);pressTimer=null;};
  function releaseCapture() {
    const id=pointerId;pointerId=null;
    if(id!==null && surface.hasPointerCapture?.(id)) {try{surface.releasePointerCapture(id);}catch{}}
  }
  // Keep the actual page and media in place. A tiny paper wash follows the
  // gesture, covers the atomic adoption, then reveals the prepared destination.
  function makePaper(direction) {
    if(reduced())return;
    if(paper&&paperDirection===direction)return true;
    if(paper){paper.layer.remove();paper=null;}
    revealCleanup?.();revealCleanup=null;
    const destination=getPrepared(direction);
    if(!destination)return false;
    const article=surface.querySelector('.reading-layout');
    if(!article)return;
    syncSafeArea();
    paper=createPageTransition({source:article,direction,kind:'word',window:win,document:doc});
    if(!paper)return false;
    onTurnActivity(true);
    paperScrollX=win.scrollX;paperScrollY=win.scrollY;
    paper.layer.dataset.destination=String(destination.number);
    paperDirection=direction;return true;
  }
  function paintPaper(progress,direction=paperDirection) {
    paperProgress=progress;
    if(!paper)return;
    paperDirection=direction;paintPageTransition(paper,progress,direction);
  }
  function cleanStyle({reveal=false}={}) {
    revealCleanup?.();revealCleanup=null;
    if(reveal&&paper)revealCleanup=revealPageTransition(paper,{window:win,reduced:reduced()});else paper?.layer.remove();
    paper=null;paperProgress=0;paperDirection=null;
    surface.classList.remove('is-swiping','is-swipe-settling');
    surface.style.removeProperty('transform');surface.style.removeProperty('opacity');surface.style.removeProperty('transition');
    feedback.hidden=true;feedback.classList.remove('is-ready','is-boundary');onTurnActivity(false);
  }
  function reset(options={}) {
    pendingTurn++;clearTimer();gesture=null;touchId=null;phase='idle';enterDirection=null;focusAfterTurn=false;releaseCapture();cleanStyle(options);syncSafeArea();
  }
  function animatePaper(target,duration,complete) {
    const from=paperProgress,start=win.performance.now();
    function tick(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=target===0?1-Math.pow(1-t,3):t*t*(3-2*t);
      paintPaper(from+(target-from)*eased);
      if(t<1)frame=win.requestAnimationFrame(tick);else{frame=null;complete();}
    }
    frame=win.requestAnimationFrame(tick);
  }
  function snapBack() {
    const wasDragging=gesture?.axis==='horizontal';
    clearTimer();gesture=null;touchId=null;releaseCapture();feedback.hidden=true;
    if(!wasDragging||reduced()||!paper){reset();return;}
    phase='returning';surface.classList.remove('is-swiping');surface.classList.add('is-swipe-settling');
    animatePaper(0,180,reset);
  }
  function go(direction) {
    if(phase==='preparing')reset();
    if(phase!=='idle'||blocked()||surface.hasAttribute('aria-busy')) return false;
    const number=getNeighbor(direction);
    if(!number)return false;
    clearTimer();gesture=null;touchId=null;releaseCapture();feedback.hidden=true;
    focusAfterTurn=surface.contains(doc.activeElement);
    const token=++pendingTurn;
    function commit(){
      if(token!==pendingTurn)return;
      if(blocked()||selected()||getNeighbor(direction)!==number){reset();return;}
      enterDirection=direction;phase='leaving';
      if(reduced()){onTurnActivity(true);onNavigate(number);return;}
      if(!makePaper(direction)){onTurnActivity(true);onNavigate(number);return;}
      surface.classList.remove('is-swiping');surface.classList.add('is-swipe-settling');
      animatePaper(1,Math.max(130,240*(1-paperProgress)),()=>onNavigate(number));
    }
    if(getPrepared(direction)){commit();return true;}
    // Readiness is bounded by the preparation manager. Never peel onto a blank.
    if(!prepareNeighbor){reset();return false;}
    phase='preparing';onTurnActivity(true);feedback.hidden=false;
    label.textContent='正在准备这一页…';
    Promise.resolve(prepareNeighbor(direction)).then(commit).catch(()=>{
      if(token!==pendingTurn)return;reset();status.textContent='这一页暂时无法打开，请稍后再试';
    });
    return true;
  }
  function loading(number) {
    if(number!==undefined&&number!==getNeighbor(enterDirection)){reset();return;}
    if(phase!=='leaving'){reset();return;}
    clearTimer();gesture=null;touchId=null;releaseCapture();
    // Cached pages settle immediately; a slow fetch gets a quiet loading state.
    if(paper)timer=win.setTimeout(()=>{paper?.layer.classList.add('is-loading');},180);
  }
  function rendered(announcement) {
    const focus=focusAfterTurn;
    const reveal=phase==='leaving'&&paperProgress>=.99;
    reset({reveal});status.textContent=announcement;
    if(focus)surface.focus({preventScroll:true});
  }
  function draw() {
    surface.classList.add('is-swiping');
    const direction=gesture.direction;
    if(!reduced()){
      const ready=makePaper(direction);
      const distance=Math.abs(gesture.dx),width=gesture.width;
      const progress=gesture.available?Math.min(.88,distance/width*.95):Math.min(.045,distance/width*.12);
      if(ready)paintPaper(progress,direction);
    }
    // Feedback stays quiet until the release threshold or a book boundary.
    feedback.hidden=!(gesture.ready||!gesture.available);
    feedback.classList.toggle('is-ready',gesture.ready);feedback.classList.toggle('is-boundary',!gesture.available);
    label.textContent=gesture.available&&!getPrepared(direction)?'正在准备这一页…':!gesture.available?(direction==='next'?'已经是最后一页':'已经是第一页'):(direction==='next'?'松手，翻到下一页':'松手，翻回上一页');
    fill.style.transform=`scaleX(${Math.min(1,Math.abs(gesture.dx)/gesture.threshold)})`;
  }
  // Keep touch and pointer streams separate: Safari emits both for one finger.
  // Touch listeners are attached to the reading surface, not a passive root target.
  let touchId=null;
  function begin({x,y,id,target}) {
    if(phase==='returning'||phase==='preparing')reset();
    if(phase!=='idle'||gesture||blocked()||surface.hasAttribute('aria-busy')||interactive(target)||selected())return;
    if(x<=SWIPE.edge||x>=win.innerWidth-SWIPE.edge)return;
    pointerId=id;
    gesture=startSwipe({x,y,width:Math.min(surface.clientWidth||win.innerWidth,win.innerWidth),time:win.performance.now(),previous:getNeighbor('previous'),next:getNeighbor('next')});
    // A stationary long press remains available for text selection and lookup.
    pressTimer=win.setTimeout(()=>{if(gesture?.axis==='pending')reset();},SWIPE.holdLimit);
  }
  function drag(x,y,event) {
    if(!gesture)return;
    if(blocked()||selected()){snapBack();return;}
    gesture=moveSwipe(gesture,{x,y,time:win.performance.now()});
    if(gesture.axis==='vertical'||gesture.axis==='cancelled'){reset();return;}
    if(gesture.axis==='pending'&&event.type==='touchmove') {
      // CSS pan-y is the primary arbiter. Leave 1–3px jitter completely native;
      // reserve only clear horizontal intent, then keep that ownership until lift.
      // Switching to vertical after this point returns the card, not native scroll.
      if(Math.abs(gesture.dx)<SWIPE.intentSlop||Math.abs(gesture.dx)<Math.abs(gesture.dy)*SWIPE.intentRatio)return;
      gesture=moveSwipe({...gesture,axis:'horizontal'},{x,y,time:win.performance.now()});
    }
    if(gesture.axis!=='horizontal')return;
    win.clearTimeout(pressTimer);pressTimer=null;
    // In the touch path a non-cancelable move means native scrolling already won.
    // Never change words after the browser has taken ownership of that gesture.
    if(event.type==='touchmove'&&!event.cancelable){snapBack();return;}
    if(event.cancelable)event.preventDefault();
    suppressUntil=win.performance.now()+450;draw();
  }
  function finish(x,y) {
    if(!gesture)return;
    const wasDragging=gesture.axis==='horizontal';
    gesture=moveSwipe(gesture,{x,y,time:win.performance.now()});
    if(wasDragging)suppressUntil=win.performance.now()+450;
    if(wasDragging&&gesture.ready&&!blocked()&&!selected()){const direction=gesture.direction;go(direction);}else snapBack();
  }
  function down(event) {
    if(phase==='idle'&&!gesture)suppressUntil=0;
    if(!['pen','mouse'].includes(event.pointerType)||event.isPrimary===false||event.button>0||pointers.size)return;
    begin({x:event.clientX,y:event.clientY,id:event.pointerId,target:event.target});
  }
  function move(event) {
    if(!gesture||!['pen','mouse'].includes(event.pointerType)||event.pointerId!==pointerId)return;
    drag(event.clientX,event.clientY,event);
    // Capture is an enhancement; window listeners still work if capture fails.
    if(gesture?.axis==='horizontal'&&!surface.hasPointerCapture?.(pointerId)) {
      try{surface.setPointerCapture?.(pointerId);}catch{}
    }
  }
  function up(event) {
    pointers.delete(event.pointerId);
    if(['pen','mouse'].includes(event.pointerType)&&event.pointerId===pointerId)finish(event.clientX,event.clientY);
  }
  function cancel(event) {pointers.delete(event.pointerId);if(event.pointerId===pointerId)snapBack();}
  function touchStart(event) {
    if(event.touches.length!==1){touchId=null;snapBack();return;}
    const touch=event.touches[0];
    begin({x:touch.clientX,y:touch.clientY,id:null,target:event.target});
    touchId=gesture?touch.identifier:null;
  }
  function touchMove(event) {
    if(touchId===null||!gesture)return;
    if(event.touches.length!==1){touchId=null;snapBack();return;}
    const touch=Array.from(event.touches).find(item=>item.identifier===touchId);
    if(touch)drag(touch.clientX,touch.clientY,event);
  }
  function touchEnd(event) {
    if(touchId===null)return;
    const touch=Array.from(event.changedTouches).find(item=>item.identifier===touchId);
    if(!touch)return;
    touchId=null;finish(touch.clientX,touch.clientY);
  }
  const listeners=[];
  function listen(target,type,fn,options){target.addEventListener(type,fn,options);listeners.push(()=>target.removeEventListener(type,fn,options));}
  listen(surface,'touchstart',touchStart,{passive:true});
  listen(surface,'touchmove',touchMove,{passive:false});
  listen(win,'touchend',touchEnd,{passive:true});
  listen(win,'touchcancel',()=>{touchId=null;snapBack();},{passive:true});
  listen(win,'touchstart',event=>{if(event.touches.length>1){touchId=null;snapBack();}},{passive:true});
  listen(surface,'pointerdown',down);
  listen(win,'pointerdown',event=>{if(event.pointerType==='pen'){pointers.add(event.pointerId);if(pointers.size>1)snapBack();}});
  listen(win,'pointermove',move,{passive:false});listen(win,'pointerup',up);listen(win,'pointercancel',cancel);
  listen(surface,'lostpointercapture',event=>{if(event.pointerId===pointerId)snapBack();});
  listen(doc,'click',event=>{if(surface.contains(event.target)&&win.performance.now()<suppressUntil&&(event.detail>0||event.pointerType==='touch'||event.pointerType==='pen')){event.preventDefault();event.stopImmediatePropagation();}},true);
  listen(doc,'selectionchange',()=>{if(selected()){if(gesture)snapBack();else if(phase==='preparing')reset();}});
  listen(surface,'contextmenu',()=>{if(gesture)snapBack();});
  listen(surface,'dragstart',event=>{if(gesture)event.preventDefault();});
  listen(doc,'keydown',event=>{
    if(event.key==='Escape'&&!blocked()&&(gesture||phase!=='idle')){event.preventDefault();reset();return;}
    if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||blocked()||interactive(event.target)||selected())return;
    const direction=event.key==='ArrowLeft'?'previous':event.key==='ArrowRight'?'next':null;
    if(direction){event.preventDefault();if(gesture)snapBack();else go(direction);}
  });
  listen(win,'blur',()=>{pointers.clear();reset();});listen(win,'pagehide',()=>{pointers.clear();reset();});
  const viewportChanged=()=>{syncSafeArea();reset();};
  listen(win,'scroll',()=>{syncSafeArea();if(gesture||(paper&&(win.scrollX!==paperScrollX||win.scrollY!==paperScrollY)))reset();},{passive:true});
  // A vertical touch belongs to the native reading pane, never to a word turn.
  // Capture is required because element scroll events do not bubble. This also
  // retires a frozen paper impression if scroll momentum wins the gesture.
  listen(surface,'scroll',event=>{if(event.target?.matches?.('.reading-scroll')&&(gesture||paper))reset();},{passive:true,capture:true});
  listen(win,'resize',viewportChanged);listen(win,'orientationchange',viewportChanged);
  if(win.visualViewport?.addEventListener){listen(win.visualViewport,'resize',viewportChanged);listen(win.visualViewport,'scroll',viewportChanged);}
  if(motionPreference?.addEventListener)listen(motionPreference,'change',reset);
  listen(doc,'visibilitychange',()=>{if(doc.hidden){pointers.clear();reset();}});
  return {go,loading,rendered,cancel:reset,get busy(){return phase!=='idle';},destroy(){reset();listeners.forEach(remove=>remove());feedback.remove();hint.remove();status.remove();safeArea.remove();surface.removeAttribute('aria-describedby');}};
}

// Explicit user preference: suppress page zoom for touch-first mobile browsers.
// Browser accessibility settings and OS-level magnification can override this.
export function installMobileZoomGuard({window:win=window,document:doc=document}={}) {
  const mobile=()=>Boolean(win.matchMedia?.('(hover: none) and (pointer: coarse)').matches);
  const listeners=[];
  const listen=(type,fn)=>{doc.addEventListener(type,fn,{passive:false});listeners.push(()=>doc.removeEventListener(type,fn));};
  const pinch=event=>{if(mobile()&&event.touches.length>1&&event.cancelable)event.preventDefault();};
  listen('touchstart',pinch);listen('touchmove',pinch);
  for(const type of ['gesturestart','gesturechange']) {
    listen(type,event=>{if(mobile()&&event.cancelable)event.preventDefault();});
  }
  // touch-action handles double-tap zoom; this also covers older WebKit behavior.
  listen('dblclick',event=>{if(mobile()&&event.cancelable&&!event.target?.closest?.('input,textarea,[contenteditable]'))event.preventDefault();});
  return {destroy(){listeners.forEach(remove=>remove());}};
}
