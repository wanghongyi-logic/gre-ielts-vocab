import {filterEntries} from './model.js';
import {escapeLearningText as escape} from './render.js';

// The contents is another leaf of the book. Keep the reading DOM in place so
// returning to it preserves the same word, media controller and reading spot.
export function installContents({main,picker,search,entries,getSelected,navigate,onOpen=()=>{},onClose=()=>{},onTransition=()=>{}}) {
 const doc=main.ownerDocument,win=doc.defaultView;
 const opener=doc.getElementById('open-search'),returnButton=doc.getElementById('close-search');
 const title=doc.getElementById('picker-title'),results=doc.getElementById('word-results');
 const count=doc.getElementById('search-count');
 const returnWord=doc.getElementById('contents-return-word');
 let saved=null,restoreFrame=0,turn=null;
 // A viewport-sized paper impression owns the visual handoff. Snapshot once;
 // only compositor transforms run during the turn (no per-frame layout reads).
 function settleTurn(runRoute=true){if(!turn)return;const previous=turn;turn=null;previous.animation?.cancel();win.cancelAnimationFrame(previous.frame);win.clearTimeout(previous.timer);previous.paper.remove();main.removeAttribute('data-contents-turning');onTransition(false);previous.done?.();previous.resolve?.();if(runRoute&&previous.route)previous.route();}
 function transition(change,done){
  settleTurn();
  const source=picker.open?picker:main;
  const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const rect=source.getBoundingClientRect();
  let paper;
  if(!reduced&&source.children.length&&rect.width){
   paper=doc.createElement('div');paper.className='contents-paper-turn';paper.inert=true;paper.setAttribute('aria-hidden','true');
   // Read each section/row once, before attachment. Offscreen branches are
   // shallow geometry placeholders; their text/media descendants are never cloned.
   function impressionOf(node){
    if(node.nodeType!==1)return node.cloneNode(false);
    const copy=node.cloneNode(false);
    if(node.matches('.book-spread,.book-chapter,.contents-entry')){
     const box=node.getBoundingClientRect();
     if(box.bottom<0||box.top>win.innerHeight){copy.style.height=`${box.height}px`;return copy;}
    }
    for(const child of node.childNodes)copy.append(impressionOf(child));
    return copy;
   }
   const impression=impressionOf(source);impression.classList.add('contents-paper-impression');
   const originals=source.querySelectorAll('video');
   impression.querySelectorAll('video').forEach((video,index)=>{
    const original=originals[index],canvas=doc.createElement('canvas');canvas.className=video.className;canvas.style.cssText=video.style.cssText;
    const scale=Math.min(1,768/(original.videoWidth||768));canvas.width=Math.max(1,Math.round(original.videoWidth*scale));canvas.height=Math.max(1,Math.round(original.videoHeight*scale));
    try{if(original.readyState<2)throw new Error('poster');canvas.getContext('2d').drawImage(original,0,0,canvas.width,canvas.height);video.replaceWith(canvas);}catch{video.closest('.story-illustration')?.querySelector('.story-poster')?.style.setProperty('opacity','1');video.remove();}
   });
   for(const node of [impression,...impression.querySelectorAll('*')]){node.removeAttribute('id');node.removeAttribute('aria-labelledby');node.removeAttribute('aria-describedby');node.removeAttribute('autofocus');}
   Object.assign(impression.style,{position:'absolute',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,maxWidth:'none',margin:'0',display:'block'});
   paper.append(impression);doc.body.append(paper);
  }
  main.setAttribute('data-contents-turning','');onTransition(true);change();
  if(!paper){main.removeAttribute('data-contents-turning');onTransition(false);done?.();return;}
  const direction=picker.open?1:-1;
  const state=turn={paper,done,frame:0,animation:null,timer:0};
  state.finished=new Promise(resolve=>{state.resolve=resolve;});
  // A complete outgoing paper is already above the new layout before it paints.
  // Give the destination one paint at frame zero before revealing it.
  state.frame=win.requestAnimationFrame(()=>{state.frame=win.requestAnimationFrame(()=>{
   if(turn!==state)return;
   if(!paper.animate){settleTurn();return;}
   state.animation=paper.animate([{transform:'translateX(0)'},{transform:`translateX(${direction*103}%)`}],{duration:360,easing:'cubic-bezier(.32,.05,.2,1)',fill:'forwards'});
   state.animation.finished.then(()=>{if(turn===state)settleTurn();},()=>{});
   state.timer=win.setTimeout(()=>{if(turn===state)settleTurn();},650);
  });});
 }
 win.addEventListener('pagehide',()=>settleTurn(false));
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)settleTurn(false);});
 win.addEventListener('resize',settleTurn);
 // A deliberate vertical scroll takes control of the already-ready leaf.
 // Finish its impression first rather than letting real content drift beneath it.
 for(const type of ['wheel','touchmove'])win.addEventListener(type,()=>settleTurn(),{passive:true});
 function preparationFailed(){win.history.replaceState(null,'','#/contents');count.textContent='这一页暂时无法打开，请再点一次重试';picker.removeAttribute('aria-busy');}
 function reveal(change){transition(()=>{change();hide({restore:false,animate:false});win.scrollTo({top:0,left:0,behavior:'instant'});main.focus({preventScroll:true});},()=>onClose({restored:false}));}

 const readingPositions=new Map();
 // Hash history must not race the book's explicit reading-position restore.
 if(win.history&&'scrollRestoration' in win.history)win.history.scrollRestoration='manual';
 const isRoute=hash=>/^#\/?contents\/?$/.test(hash);
 const readingHash=number=>`#/learn/${number}`;
 const currentEntry=()=>entries.find(entry=>entry.number===getSelected())||entries[0];
 function captureReading(){const number=getSelected();if(number!=null&&!picker.open&&win.location.hash===readingHash(number))readingPositions.set(number,{scrollX:win.scrollX,scrollY:win.scrollY});}
 win.addEventListener('scroll',captureReading,{passive:true});
 function renderResults(){
  const selected=currentEntry(),matches=filterEntries(entries,search.value),filtered=Boolean(search.value.trim());
  if(saved&&!saved.ready&&getSelected()!=null){saved.number=selected.number;saved.hash=readingHash(selected.number);saved.title=`${selected.word} · 单词故事`;saved.ready=true;}
  if(picker.open)doc.title='目录 · 单词故事';
  count.textContent=filtered?`找到 ${matches.length} 个词`:`${entries.length} 个词 · 按阅读顺序`;
  returnWord.textContent=selected?selected.word:'';
  returnButton.setAttribute('aria-label',selected?`继续阅读 ${selected.word}`:'返回阅读');
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
  transition(()=>{
  main.hidden=true;main.inert=true;
  doc.body.classList.add('is-contents-open');
  picker.show();
  doc.title='目录 · 单词故事';
  opener.setAttribute('aria-expanded','true');
  win.scrollTo({top:0,left:0,behavior:'instant'});
  title.focus({preventScroll:true});
  onOpen();
  });
 }
 function hide({restore=true,animate=true}={}){
  if(!picker.open)return false;
  win.cancelAnimationFrame(restoreFrame);
  const snapshot=saved;
  const change=()=>{
  main.hidden=false;main.inert=false;
  doc.body.classList.remove('is-contents-open');
  picker.close();
  opener.setAttribute('aria-expanded','false');
  if(restore&&snapshot?.title)doc.title=snapshot.title;
  if(restore&&snapshot){
   win.scrollTo({left:snapshot.scrollX,top:snapshot.scrollY,behavior:'instant'});
   const target=snapshot.focus?.isConnected&&snapshot.focus!==doc.body&&!picker.contains(snapshot.focus)?snapshot.focus:opener;
   target?.focus({preventScroll:true});
   restoreFrame=win.requestAnimationFrame(()=>{
    restoreFrame=0;
    if(!picker.open&&getSelected()===snapshot.number)win.scrollTo({left:snapshot.scrollX,top:snapshot.scrollY,behavior:'instant'});
   });
  }
  picker.removeAttribute('aria-busy');
  };
  if(animate)transition(change,()=>onClose({restored:Boolean(restore&&snapshot)}));else change();
  return Boolean(restore&&snapshot);
 }
 function open(){captureReading();if(picker.open){title.focus({preventScroll:true});return;}win.location.hash='/contents';}
 function close(){if(picker.open)win.location.hash=saved?.hash||readingHash(currentEntry()?.number);}
 function syncRoute(){
  if(isRoute(win.location.hash)){picker.removeAttribute('aria-busy');if(picker.open)count.textContent=search.value.trim()?`找到 ${filterEntries(entries,search.value).length} 个词`:`${entries.length} 个词 · 按阅读顺序`;show();return {contents:true,restored:false};}
  const match=/^#\/?(?:learn\/)?(\d+)$/.exec(win.location.hash);
  const same=Boolean(saved&&Number(match?.[1])===saved.number&&getSelected()===saved.number);
  const restored=picker.open&&same?hide():false;
  if(picker.open&&!same){picker.setAttribute('aria-busy','true');count.textContent='正在翻开这一页…';}
  return {contents:false,restored};
 }
 opener.addEventListener('click',open);
 returnButton.addEventListener('click',close);
 search.addEventListener('input',renderResults);
 picker.addEventListener('click',event=>{
  const button=event.target.closest('[data-word]');
  if(!button||!picker.contains(button))return;
  const number=Number(button.dataset.word);
  if(number===currentEntry()?.number){close();return;}
  navigate(number);
 });
 picker.addEventListener('cancel',event=>{event.preventDefault();close();});
 doc.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&picker.open){event.preventDefault();close();}
 });
 return {show,hide,open,close,isRoute,syncRoute,renderResults,reveal,preparationFailed,whenSettled:()=>turn?.finished||Promise.resolve(),deferRoute(callback){if(!turn)return false;turn.route=callback;return true;},get returnHash(){return saved?.hash||readingHash(currentEntry()?.number);}};
}
