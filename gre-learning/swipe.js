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

const INTERACTIVE='a,button,input,textarea,select,option,summary,label,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="slider"],[role="textbox"],[data-no-swipe],dialog';
export function installWordSwipe({surface,hintHost,picker,getNeighbor,onNavigate,window:win=window,document:doc=document}) {
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
  const pointers=new Set();
  let gesture=null,pointerId=null,phase='idle',timer=null,frame=null,pressTimer=null,suppressUntil=0,enterDirection=null;
  const reduced=()=>win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const selected=()=>{
    const selection=win.getSelection?.();
    return Boolean(selection?.toString() && (surface.contains(selection.anchorNode)||surface.contains(selection.focusNode)));
  };
  const blocked=()=>picker.open||Boolean(doc.querySelector('dialog[open]'));
  const interactive=target=>Boolean(target?.closest?.(INTERACTIVE));
  const clearTimer=()=>{win.clearTimeout(timer);timer=null;win.cancelAnimationFrame(frame);frame=null;win.clearTimeout(pressTimer);pressTimer=null;};
  function releaseCapture() {
    const id=pointerId;pointerId=null;
    if(id!==null && surface.hasPointerCapture?.(id)) {try{surface.releasePointerCapture(id);}catch{}}
  }
  function cleanStyle() {
    surface.classList.remove('is-swiping','is-swipe-settling');
    surface.style.removeProperty('transform');surface.style.removeProperty('opacity');surface.style.removeProperty('transition');
    feedback.hidden=true;feedback.classList.remove('is-ready','is-boundary');
  }
  function reset() {
    clearTimer();gesture=null;touchId=null;phase='idle';enterDirection=null;releaseCapture();cleanStyle();
  }
  function snapBack() {
    const wasDragging=gesture?.axis==='horizontal';
    clearTimer();gesture=null;releaseCapture();feedback.hidden=true;
    if(!wasDragging||reduced()){reset();return;}
    phase='returning';surface.classList.remove('is-swiping');surface.classList.add('is-swipe-settling');
    surface.style.transition='transform 220ms cubic-bezier(.2,.75,.25,1)';surface.style.transform='translateX(0)';
    timer=win.setTimeout(reset,230);
  }
  function go(direction) {
    if(phase!=='idle'||blocked()) return false;
    const number=getNeighbor(direction);
    if(!number)return false;
    clearTimer();gesture=null;releaseCapture();feedback.hidden=true;
    enterDirection=direction;phase='leaving';
    if(reduced()){onNavigate(number);return true;}
    surface.classList.remove('is-swiping');surface.classList.add('is-swipe-settling');
    surface.style.transition='transform 160ms cubic-bezier(.4,0,1,1), opacity 160ms ease';
    surface.style.transform=`translateX(${(direction==='next'?-1:1)*Math.min(win.innerWidth*.55,260)}px)`;
    surface.style.opacity='0';
    timer=win.setTimeout(()=>{timer=null;onNavigate(number);},165);
    return true;
  }
  function rendered(announcement) {
    const direction=phase==='leaving'?enterDirection:null;
    reset();status.textContent=announcement;
    if(!direction||reduced())return;
    phase='entering';surface.classList.add('is-swipe-settling');surface.style.transition='none';
    surface.style.transform=`translateX(${direction==='next'?36:-36}px)`;surface.style.opacity='0';
    // Two frames preserve the initial pose even when the new DOM paints in this frame.
    frame=win.requestAnimationFrame(()=>{frame=win.requestAnimationFrame(()=>{
      surface.style.transition='transform 200ms cubic-bezier(.2,.75,.25,1), opacity 180ms ease';
      surface.style.transform='translateX(0)';surface.style.opacity='1';timer=win.setTimeout(reset,210);
    });});
  }
  function draw() {
    surface.classList.add('is-swiping');surface.style.transform=`translateX(${gesture.offset}px)`;
    feedback.hidden=false;feedback.classList.toggle('is-ready',gesture.ready);feedback.classList.toggle('is-boundary',!gesture.available);
    const next=gesture.direction==='next';
    label.textContent=!gesture.available?(next?'已经是最后一个词':'已经是第一个词'):gesture.ready?(next?'松手，切换下一个词':'松手，切换上一个词'):(next?'继续向左滑动 · 下一个词':'继续向右滑动 · 上一个词');
    fill.style.transform=`scaleX(${Math.min(1,Math.abs(gesture.dx)/gesture.threshold)})`;
  }
  // Keep touch and pointer streams separate: Safari emits both for one finger.
  // Touch listeners are attached to the reading surface, not a passive root target.
  let touchId=null;
  function begin({x,y,id,target}) {
    if(phase!=='idle'||gesture||blocked()||interactive(target)||selected())return;
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
    if(event.pointerType!=='pen'||event.isPrimary===false||event.button>0||pointers.size)return;
    begin({x:event.clientX,y:event.clientY,id:event.pointerId,target:event.target});
  }
  function move(event) {
    if(!gesture||event.pointerType!=='pen'||event.pointerId!==pointerId)return;
    drag(event.clientX,event.clientY,event);
    // Capture is an enhancement; window listeners still work if capture fails.
    if(gesture?.axis==='horizontal'&&!surface.hasPointerCapture?.(pointerId)) {
      try{surface.setPointerCapture?.(pointerId);}catch{}
    }
  }
  function up(event) {
    pointers.delete(event.pointerId);
    if(event.pointerType==='pen'&&event.pointerId===pointerId)finish(event.clientX,event.clientY);
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
  listen(doc,'click',event=>{if(win.performance.now()<suppressUntil&&(event.detail>0||event.pointerType==='touch'||event.pointerType==='pen')){event.preventDefault();event.stopImmediatePropagation();}},true);
  listen(doc,'selectionchange',()=>{if(gesture&&selected())snapBack();});
  listen(surface,'contextmenu',()=>{if(gesture)snapBack();});
  listen(doc,'keydown',event=>{
    if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||blocked()||interactive(event.target)||selected())return;
    const direction=event.key==='ArrowLeft'?'previous':event.key==='ArrowRight'?'next':null;
    if(direction){event.preventDefault();if(gesture)snapBack();else go(direction);}
  });
  listen(win,'blur',()=>{pointers.clear();reset();});listen(win,'pagehide',()=>{pointers.clear();reset();});
  listen(win,'resize',reset);
  listen(doc,'visibilitychange',()=>{if(doc.hidden){pointers.clear();reset();}});
  return {go,rendered,cancel:reset,get busy(){return phase!=='idle';},destroy(){reset();listeners.forEach(remove=>remove());feedback.remove();hint.remove();status.remove();surface.removeAttribute('aria-describedby');}};
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
