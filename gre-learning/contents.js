import {filterEntries,resolveWordNumber} from './model.js';
import {startSwipe,moveSwipe,SWIPE} from './swipe.js';
import {installFrontmatterTurn} from './frontmatter-turn.js';
import {escapeLearningText as escape} from './render.js';

// The contents is another leaf of the book. Keep the reading DOM in place so
// returning to it preserves the same word, media controller and reading spot.
export function installContents({main,picker,search,entries,getSelected,navigate,onOpen=()=>{},onClose=()=>{},onTransition=()=>{},prepareReading=()=>{}}) {
 const doc=main.ownerDocument,win=doc.defaultView;
 const opener=doc.getElementById('open-search');
 const title=doc.getElementById('picker-title'),results=doc.getElementById('word-results');
 const count=doc.getElementById('search-count');
 let saved=null,restoreFrame=0,leaf=null,gestureRestored=false;
 const turns=installFrontmatterTurn({main,onActivity:onTransition,window:win,document:doc});
 function preparationFailed(){win.history.replaceState(null,'',leaf==='settings'?'#/settings':'#/contents');count.textContent='这一页暂时无法打开，请再点一次重试';picker.removeAttribute('aria-busy');}
 function reveal(change){
  turns.begin({source:picker,direction:'next',prepare:()=>{change();const ready=previewReading(saved,false);win.scrollTo({top:0,left:0,behavior:'instant'});return ready;},commit:()=>{main.focus({preventScroll:true});onClose({restored:false});}});
 }

 const readingPositions=new Map();
 // Hash history must not race the book's explicit reading-position restore.
 if(win.history&&'scrollRestoration' in win.history)win.history.scrollRestoration='manual';
 const isRoute=hash=>/^#\/?(?:contents|settings)\/?$/.test(hash);
 const isSettings=()=>/^#\/?settings\/?$/.test(win.location.hash);
 function syncLeaf(hash=win.location.hash){const settings=/^#\/?settings\/?$/.test(hash);leaf=settings?'settings':'contents';picker.dataset.leaf=leaf;title.textContent=settings?'设置':'目录';const settingsHost=doc.getElementById('offline-settings');if(settingsHost){settingsHost.hidden=!settings;if(settings)settingsHost.querySelector('details').open=true;}search.closest('.search-field').hidden=settings;doc.querySelector('.contents-list-heading').hidden=settings;results.hidden=settings;opener.setAttribute('aria-expanded',String(picker.open&&!settings));const settingTab=doc.getElementById('open-settings');settingTab?.setAttribute('aria-expanded',String(picker.open&&settings));settingTab?.classList.toggle('is-current',picker.open&&settings);if(picker.open)doc.title=(settings?'设置':'目录')+' · 单词故事';}
 const readingHash=number=>`#/learn/${number}`;
 function currentEntry(){
  // Direct directory entry resolves the same remembered word as app.render,
  // before asynchronous lesson/media preparation can finish.
  let number=getSelected();
  if(number==null){let remembered;try{remembered=win.sessionStorage?.getItem('gre-learning-current-v1');}catch{}number=resolveWordNumber('',entries,remembered);}
  return entries.find(entry=>entry.number===number)||entries[0];
 }
 function prepareLeaf({show=false}={}){
  // Keep the destination laid out but unpainted while measuring its actual
  // current row (including desktop columns). No frame or smooth scroll is used.
  const visibility=picker.style.getPropertyValue('visibility'),priority=picker.style.getPropertyPriority('visibility');
  picker.style.setProperty('visibility','hidden');
  try{
   if(show)picker.show();syncLeaf();
   win.scrollTo({top:0,left:0,behavior:'instant'});
   if(leaf==='contents'){
    const row=results.querySelector('[aria-current="page"]');
    if(row){const rect=row.getBoundingClientRect(),viewport=win.visualViewport;const height=viewport?.height||win.innerHeight,offset=viewport?.offsetTop||0;
     if(rect.height>0)win.scrollTo({top:Math.max(0,win.scrollY+rect.top+rect.height/2-offset-height/2),left:0,behavior:'instant'});
    }
   }
  }finally{if(visibility)picker.style.setProperty('visibility',visibility,priority);else picker.style.removeProperty('visibility');}
 }

 function captureReading(){const number=getSelected();if(number!=null&&!turns.busy&&!picker.open&&win.location.hash===readingHash(number))readingPositions.set(number,{scrollX:win.scrollX,scrollY:win.scrollY});}
 win.addEventListener('scroll',captureReading,{passive:true});
 function renderResults(){
  syncLeaf();
  const selected=currentEntry(),matches=filterEntries(entries,search.value),filtered=Boolean(search.value.trim());
  if(saved&&!saved.ready&&getSelected()!=null){saved.number=selected.number;saved.hash=readingHash(selected.number);saved.title=`${selected.word} · 单词故事`;saved.ready=true;}
  if(picker.open)doc.title=(isSettings()?'设置':'目录')+' · 单词故事';
  count.textContent=filtered?`找到 ${matches.length} 个词`:`${entries.length} 个词 · 按阅读顺序`;
  results.classList.toggle('is-filtered',filtered);
  results.innerHTML=matches.length?matches.map(entry=>{
   const ordinal=entry.displayOrdinal||entries.indexOf(entry)+1,isCurrent=entry.number===selected?.number;
   return `<li class="contents-entry"><button type="button" class="word-result${isCurrent?' is-current':''}" data-word="${entry.number}"${isCurrent?' aria-current="page"':''} aria-label="${escape(entry.word)}，${escape(entry.coreMeaningZh)}。第 ${ordinal} 个词${isCurrent?'，当前阅读':''}"><span class="result-heading"><strong lang="en">${escape(entry.word)}</strong><span class="result-leader" aria-hidden="true"></span><span class="result-number" aria-hidden="true">${String(ordinal).padStart(2,'0')}</span></span><span class="result-detail"><small>${escape(entry.coreMeaningZh)}</small>${isCurrent?'<span class="current-note" aria-hidden="true">正在读</span>':''}</span></button></li>`;
  }).join(''):'<li class="search-empty">没有找到这个词<br><span>试试其他拼写或中文释义</span></li>';
 }
 function show(){
  if(picker.open)return;
  win.cancelAnimationFrame(restoreFrame);
  const selected=currentEntry();
  const position=readingPositions.get(selected?.number)||{scrollX:win.scrollX,scrollY:win.scrollY};
  saved={number:selected?.number,hash:readingHash(selected?.number),...position,focus:doc.activeElement,title:doc.title,ready:getSelected()!=null};
  search.value='';renderResults();
  turns.begin({source:main,direction:'previous',flutter:true,visual:Boolean(main.querySelector('.reading-layout')),prepare:()=>{
   main.hidden=!main.classList.contains('frontmatter-live-leaf');main.inert=true;doc.body.classList.add('is-contents-open');
   prepareLeaf({show:true});
   title.focus({preventScroll:true});onOpen();
  },commit:()=>{main.hidden=true;main.inert=true;}});
 }
 function previewReading(snapshot,restore){
  main.hidden=false;main.inert=false;doc.body.classList.remove('is-contents-open');picker.close();
  opener.setAttribute('aria-expanded','false');doc.getElementById('open-settings')?.setAttribute('aria-expanded','false');doc.getElementById('open-settings')?.classList.remove('is-current');
  if(restore&&snapshot?.title)doc.title=snapshot.title;
  if(restore&&snapshot)win.scrollTo({left:snapshot.scrollX,top:snapshot.scrollY,behavior:'instant'});
  picker.removeAttribute('aria-busy');
  return prepareReading();
 }
 function finishReading(snapshot,restore){
  if(restore&&snapshot){
   const target=snapshot.focus?.isConnected&&snapshot.focus!==doc.body&&!picker.contains(snapshot.focus)?snapshot.focus:main;
   target?.focus({preventScroll:true});
   restoreFrame=win.requestAnimationFrame(()=>{restoreFrame=0;if(!picker.open&&getSelected()===snapshot.number)win.scrollTo({left:snapshot.scrollX,top:snapshot.scrollY,behavior:'instant'});});
  }
  onClose({restored:Boolean(restore&&snapshot)});
 }
 function hide({restore=true,animate=true}={}){
  if(!picker.open)return false;
  win.cancelAnimationFrame(restoreFrame);
  const snapshot=saved;
  if(animate)turns.begin({source:picker,direction:'next',prepare:()=>previewReading(snapshot,restore),commit:()=>finishReading(snapshot,restore)});
  else previewReading(snapshot,restore);
  return Boolean(restore&&snapshot);
 }
 function open(){captureReading();if(picker.open&&!isSettings()){title.focus({preventScroll:true});return;}win.location.hash='/contents';}
 function close(){if(picker.open)win.location.hash=saved?.hash||readingHash(currentEntry()?.number);}
 function syncRoute(){
  if(isRoute(win.location.hash)){
   picker.removeAttribute('aria-busy');
   if(picker.open){
    const target=isSettings()?'settings':'contents';
    if(target!==leaf)turns.begin({source:picker,copy:true,direction:target==='settings'?'previous':'next',prepare:()=>{prepareLeaf();title.focus({preventScroll:true});onOpen();}});
    else syncLeaf();
    count.textContent=search.value.trim()?`找到 ${filterEntries(entries,search.value).length} 个词`:`${entries.length} 个词 · 按阅读顺序`;
   }else show();
   return {contents:true,restored:false};
  }
  const match=/^#\/?(?:learn\/)?(\d+)$/.exec(win.location.hash);
  const same=Boolean(saved&&Number(match?.[1])===saved.number&&getSelected()===saved.number);
  const restored=picker.open&&same?hide():Boolean(gestureRestored&&same);
  gestureRestored=false;
  if(picker.open&&!same){picker.setAttribute('aria-busy','true');count.textContent='正在翻开这一页…';}
  return {contents:false,restored};
 }
 opener.addEventListener('click',open);
 search.addEventListener('input',renderResults);
 picker.addEventListener('click',event=>{
  const button=event.target.closest('[data-word]');
  if(!button||!picker.contains(button))return;
  const number=Number(button.dataset.word);
  if(number===currentEntry()?.number){close();return;}
  if(picker.hasAttribute('aria-busy')&&win.location.hash===readingHash(number))return;
  picker.setAttribute('aria-busy','true');navigate(number);
 });
 // Frontmatter uses the same distance/axis arbitration as word pages. Nothing
 // is routed until release; a short drag restores both leaf and scroll position.
 picker.setAttribute('aria-keyshortcuts','Escape ArrowLeft ArrowRight');
 const interactive='a,input,textarea,select,option,summary,label,button:not(.word-result),[contenteditable]:not([contenteditable="false"]),[role="slider"],[data-no-swipe]';
 let gesture=null,touchId=null,pointerId=null,pressTimer=0,suppressUntil=0,preview=null;
 const selected=()=>{const selection=win.getSelection?.();return Boolean(selection?.toString()&&(picker.contains(selection.anchorNode)||picker.contains(selection.focusNode)));};
 function releaseGesture(){
  win.clearTimeout(pressTimer);gesture=null;touchId=null;
  const id=pointerId;pointerId=null;
  if(id!==null&&picker.hasPointerCapture?.(id)){try{picker.releasePointerCapture(id);}catch{}}
 }
 function cancelGesture(){releaseGesture();if(turns.interactive)turns.animate(false);}
 function beginGesture(x,y,id,target){
  if(turns.busy||gesture||!picker.open||picker.hasAttribute('aria-busy')||!saved?.ready||target?.closest?.(interactive)||selected())return;
  // Leave the browser's history edge swipe untouched.
  if(x<=SWIPE.edge||x>=win.innerWidth-SWIPE.edge)return;
  pointerId=id;gesture=startSwipe({x,y,width:Math.min(picker.clientWidth||win.innerWidth,win.innerWidth),time:win.performance.now(),previous:true,next:true});
  pressTimer=win.setTimeout(()=>{if(gesture?.axis==='pending')releaseGesture();},SWIPE.holdLimit);
 }
 function previewTurn(direction){
  if(preview)return;
  preview={scrollX:win.scrollX,scrollY:win.scrollY,focus:doc.activeElement,title:doc.title,hash:win.location.hash};
  const origin=preview,snapshot=saved;
  turns.begin({source:picker,direction,interactive:true,prepare:()=>previewReading(snapshot,true),commit:()=>{
   preview=null;gestureRestored=true;
   win.location.hash=snapshot.hash;finishReading(snapshot,true);
  },rollback:()=>{
   preview=null;main.hidden=true;main.inert=true;doc.body.classList.add('is-contents-open');picker.show();
   // A newer Back/Forward or bookmark route owns the URL; rollback restores only
   // the visual source, then deferRoute applies that newer destination once.
   doc.title=origin.title;win.scrollTo({left:origin.scrollX,top:origin.scrollY,behavior:'instant'});
   origin.focus?.isConnected&&origin.focus.focus?.({preventScroll:true});syncLeaf(origin.hash);onOpen();
  }}).then(()=>{releaseGesture();preview=null;});
 }
 function dragGesture(x,y,event){
  if(!gesture)return;
  if(selected()){cancelGesture();return;}
  gesture=moveSwipe(gesture,{x,y,time:win.performance.now()});
  if(gesture.axis==='vertical'||gesture.axis==='cancelled'){cancelGesture();return;}
  if(gesture.axis==='pending'&&event.type==='touchmove'){
   if(Math.abs(gesture.dx)<SWIPE.intentSlop||Math.abs(gesture.dx)<Math.abs(gesture.dy)*SWIPE.intentRatio)return;
   gesture=moveSwipe({...gesture,axis:'horizontal'},{x,y,time:win.performance.now()});
  }
  if(gesture.axis!=='horizontal')return;
  if(event.type==='touchmove'&&!event.cancelable){cancelGesture();return;}
  if(event.cancelable)event.preventDefault();win.clearTimeout(pressTimer);
  suppressUntil=win.performance.now()+450;
  // Lock the fold edge for one gesture. Reversing back through its starting point
  // flattens the same sheet, never flashes a differently oriented replacement.
  if(!gesture.turnDirection)gesture.turnDirection=gesture.direction;
  previewTurn(gesture.turnDirection);
  const distance=gesture.turnDirection==='next'?-gesture.dx:gesture.dx;
  turns.paint(Math.max(0,Math.min(.9,distance/gesture.width*.98)));
 }
 function finishGesture(x,y){
  if(!gesture)return;
  const wasDragging=gesture.axis==='horizontal';
  gesture=moveSwipe(gesture,{x,y,time:win.performance.now()});
  const commit=wasDragging&&gesture.ready&&gesture.direction===gesture.turnDirection&&!selected();
  if(wasDragging)suppressUntil=win.performance.now()+450;
  releaseGesture();if(turns.interactive)turns.animate(commit);
 }
 picker.addEventListener('touchstart',event=>{if(event.touches.length!==1){cancelGesture();return;}const touch=event.touches[0];beginGesture(touch.clientX,touch.clientY,null,event.target);touchId=gesture?touch.identifier:null;},{passive:true});
 picker.addEventListener('touchmove',event=>{if(touchId===null)return;if(event.touches.length!==1){cancelGesture();return;}const touch=Array.from(event.touches).find(item=>item.identifier===touchId);if(touch)dragGesture(touch.clientX,touch.clientY,event);},{passive:false});
 win.addEventListener('touchend',event=>{if(touchId===null)return;const touch=Array.from(event.changedTouches).find(item=>item.identifier===touchId);if(touch)finishGesture(touch.clientX,touch.clientY);},{passive:true});
 win.addEventListener('touchcancel',cancelGesture,{passive:true});win.addEventListener('touchstart',event=>{if(event.touches.length>1)cancelGesture();},{passive:true});
 picker.addEventListener('pointerdown',event=>{if(!['mouse','pen'].includes(event.pointerType)||event.button>0||event.isPrimary===false)return;beginGesture(event.clientX,event.clientY,event.pointerId,event.target);});
 win.addEventListener('pointermove',event=>{if(event.pointerId!==pointerId||!gesture)return;dragGesture(event.clientX,event.clientY,event);if(gesture?.axis==='horizontal'&&!picker.hasPointerCapture?.(pointerId)){try{picker.setPointerCapture?.(pointerId);}catch{}};},{passive:false});
 win.addEventListener('pointerup',event=>{if(event.pointerId===pointerId)finishGesture(event.clientX,event.clientY);});win.addEventListener('pointercancel',event=>{if(event.pointerId===pointerId)cancelGesture();});
 picker.addEventListener('lostpointercapture',event=>{if(event.pointerId===pointerId)cancelGesture();});
 doc.addEventListener('click',event=>{if(win.performance.now()<suppressUntil&&(event.detail>0||event.pointerType==='touch'||event.pointerType==='pen')&&(picker.contains(event.target)||main.contains(event.target))){event.preventDefault();event.stopImmediatePropagation();}},true);
 doc.addEventListener('selectionchange',()=>{if(gesture&&selected())cancelGesture();});picker.addEventListener('contextmenu',cancelGesture);picker.addEventListener('dragstart',event=>{if(gesture)event.preventDefault();});
 win.addEventListener('blur',()=>{releaseGesture();turns.interrupt();});
 for(const type of ['pagehide','resize','orientationchange'])win.addEventListener(type,releaseGesture);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)releaseGesture();});
 win.addEventListener('wheel',()=>{if(turns.interactive)cancelGesture();else turns.finish();},{passive:true});
 win.addEventListener('touchmove',()=>{if(turns.busy&&!turns.interactive)turns.finish();},{passive:true});
 picker.addEventListener('cancel',event=>{event.preventDefault();if(turns.interactive)cancelGesture();else close();});
 doc.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&turns.interactive){event.preventDefault();cancelGesture();return;}
  if(event.key==='Escape'&&picker.open){event.preventDefault();close();return;}
  if(event.defaultPrevented||event.repeat||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||!picker.open||turns.busy||event.target?.closest?.(interactive)||selected())return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();close();}
 });
 return {show,hide,open,close,isRoute,syncRoute,renderResults,reveal,preparationFailed,whenSettled:turns.whenSettled,deferRoute:turns.deferRoute,cancel(){releaseGesture();turns.cancel();},get returnHash(){return saved?.hash||readingHash(currentEntry()?.number);}};
}
