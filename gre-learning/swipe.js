// Deliberate, distance-based gestures: a fast flick alone never changes the word.
export const SWIPE = Object.freeze({edge:28, slop:14, directionRatio:1.4, minDuration:120, holdLimit:450});
export function startSwipe({x,y,width,time=0,previous=false,next=false}) {
  return {x,y,width,time,previous,next,axis:'pending',dx:0,dy:0,offset:0,ready:false,direction:null,threshold:Math.min(140,Math.max(76,width*.24))};
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
  const ready=axis==='horizontal'&&available&&aligned&&ax>=state.threshold&&time-state.time>=SWIPE.minDuration;
  const offset=axis==='horizontal' ? Math.sign(dx)*(available?Math.min(ax,state.threshold+Math.sqrt(Math.max(0,ax-state.threshold))*5):Math.min(32,Math.sqrt(ax)*2.2)) : 0;
  return {...state,dx,dy,axis,direction,available,ready,offset};
}

const INTERACTIVE='a,button,input,textarea,select,option,summary,label,[contenteditable]:not([contenteditable="false"]),[role="button"],[role="link"],[role="slider"],[role="textbox"],[data-no-swipe],dialog';
export function installWordSwipe({surface,navigation,picker,getNeighbor,onNavigate,window:win=window,document:doc=document}) {
  const feedback=doc.createElement('div');
  feedback.className='swipe-feedback';feedback.hidden=true;feedback.setAttribute('aria-hidden','true');
  const label=doc.createElement('span');label.className='swipe-label';
  const track=doc.createElement('span');track.className='swipe-track';
  const fill=doc.createElement('span');track.append(fill);feedback.append(label,track);doc.body.append(feedback);
  const hint=doc.createElement('p');hint.className='word-navigation-hint';hint.id='swipe-instructions';
  hint.textContent='PointerEvent' in win?'左右滑动 · 松手切换':'点按按钮切换单词';navigation.prepend(hint);
  surface.setAttribute('aria-describedby',hint.id);
  const status=doc.createElement('span');status.className='sr-only';status.setAttribute('role','status');status.setAttribute('aria-live','polite');doc.body.append(status);
  const pointers=new Set();
  let gesture=null,pointerId=null,phase='idle',timer=null,frame=null,pressTimer=null,armTimer=null,suppressUntil=0,enterDirection=null;
  const reduced=()=>win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const selected=()=>Boolean(win.getSelection?.()?.toString());
  const blocked=()=>picker.open||Boolean(doc.querySelector('dialog[open]'));
  const interactive=target=>Boolean(target?.closest?.(INTERACTIVE));
  const clearTimer=()=>{win.clearTimeout(timer);timer=null;win.cancelAnimationFrame(frame);frame=null;win.clearTimeout(pressTimer);pressTimer=null;win.clearTimeout(armTimer);armTimer=null;};
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
    clearTimer();gesture=null;phase='idle';enterDirection=null;releaseCapture();cleanStyle();
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
  function down(event) {
    if(event.pointerType!=='touch'&&event.pointerType!=='pen')return;
    if(phase!=='idle'||gesture||blocked()||interactive(event.target)||selected()||event.isPrimary===false||event.button>0||pointers.size>0)return;
    if(event.clientX<=SWIPE.edge||event.clientX>=win.innerWidth-SWIPE.edge)return;
    pointerId=event.pointerId;
    gesture=startSwipe({x:event.clientX,y:event.clientY,width:Math.min(surface.clientWidth||win.innerWidth,win.innerWidth),time:win.performance.now(),previous:getNeighbor('previous'),next:getNeighbor('next')});
    // Do not intercept a long press intended to select text or open its context menu.
    pressTimer=win.setTimeout(()=>{if(gesture?.axis==='pending')reset();},SWIPE.holdLimit);
    armTimer=win.setTimeout(()=>{
      if(gesture?.axis==='horizontal') {
        gesture=moveSwipe(gesture,{x:gesture.x+gesture.dx,y:gesture.y+gesture.dy,time:win.performance.now()});draw();
      }
    },SWIPE.minDuration);
  }
  function move(event) {
    if(!gesture||event.pointerId!==pointerId)return;
    if(blocked()||selected()){snapBack();return;}
    gesture=moveSwipe(gesture,{x:event.clientX,y:event.clientY,time:win.performance.now()});
    if(gesture.axis==='vertical'||gesture.axis==='cancelled'){reset();return;}
    if(gesture.axis!=='horizontal')return;
    win.clearTimeout(pressTimer);pressTimer=null;
    if(!surface.hasPointerCapture?.(pointerId)){try{surface.setPointerCapture?.(pointerId);}catch{snapBack();return;}}
    if(event.cancelable)event.preventDefault();
    suppressUntil=win.performance.now()+450;draw();
  }
  function up(event) {
    pointers.delete(event.pointerId);
    if(!gesture||event.pointerId!==pointerId)return;
    const wasDragging=gesture.axis==='horizontal';
    gesture=moveSwipe(gesture,{x:event.clientX,y:event.clientY,time:win.performance.now()});
    if(wasDragging)suppressUntil=win.performance.now()+450;
    if(wasDragging&&gesture.ready&&!blocked()&&!selected()){const direction=gesture.direction;go(direction);}else snapBack();
  }
  function cancel(event) {pointers.delete(event.pointerId);if(event.pointerId===pointerId)snapBack();}
  const listeners=[];
  function listen(target,type,fn,options){target.addEventListener(type,fn,options);listeners.push(()=>target.removeEventListener(type,fn,options));}
  listen(surface,'pointerdown',down);
  listen(win,'pointerdown',event=>{if(event.pointerType==='touch'||event.pointerType==='pen'){pointers.add(event.pointerId);if(pointers.size>1)snapBack();}});
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
