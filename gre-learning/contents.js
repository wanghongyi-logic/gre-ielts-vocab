import {filterEntries} from './model.js';
import {escapeLearningText as escape} from './render.js';

// The contents is another leaf of the book. Keep the reading DOM in place so
// returning to it preserves the same word, media controller and reading spot.
export function installContents({main,picker,search,entries,getSelected,navigate,onOpen=()=>{},onClose=()=>{}}) {
 const doc=main.ownerDocument,win=doc.defaultView;
 const opener=doc.getElementById('open-search'),returnButton=doc.getElementById('close-search');
 const title=doc.getElementById('picker-title'),results=doc.getElementById('word-results');
 const count=doc.getElementById('search-count');
 const returnWord=doc.getElementById('contents-return-word');
 let saved=null,restoreFrame=0;
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
  main.hidden=true;main.inert=true;
  doc.body.classList.add('is-contents-open');
  picker.show();
  doc.title='目录 · 单词故事';
  opener.setAttribute('aria-expanded','true');
  win.scrollTo({top:0,left:0,behavior:'instant'});
  title.focus({preventScroll:true});
  onOpen();
 }
 function hide({restore=true}={}){
  if(!picker.open)return false;
  win.cancelAnimationFrame(restoreFrame);
  const snapshot=saved;
  main.hidden=false;main.inert=false;
  doc.body.classList.remove('is-contents-open');
  picker.close();
  opener.setAttribute('aria-expanded','false');
  if(snapshot?.title)doc.title=snapshot.title;
  if(restore&&snapshot){
   win.scrollTo({left:snapshot.scrollX,top:snapshot.scrollY,behavior:'instant'});
   const target=snapshot.focus?.isConnected&&snapshot.focus!==doc.body&&!picker.contains(snapshot.focus)?snapshot.focus:opener;
   target?.focus({preventScroll:true});
   restoreFrame=win.requestAnimationFrame(()=>{
    restoreFrame=0;
    if(!picker.open&&getSelected()===snapshot.number)win.scrollTo({left:snapshot.scrollX,top:snapshot.scrollY,behavior:'instant'});
   });
  }
  onClose({restored:Boolean(restore&&snapshot)});
  return Boolean(restore&&snapshot);
 }
 function open(){captureReading();if(picker.open){title.focus({preventScroll:true});return;}win.location.hash='/contents';}
 function close(){if(picker.open)win.location.hash=saved?.hash||readingHash(currentEntry()?.number);}
 function syncRoute(){
  if(isRoute(win.location.hash)){show();return {contents:true,restored:false};}
  const match=/^#\/?(?:learn\/)?(\d+)$/.exec(win.location.hash);
  const restored=picker.open?hide({restore:Boolean(saved&&Number(match?.[1])===saved.number&&getSelected()===saved.number)}):false;
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
 return {show,hide,open,close,isRoute,syncRoute,renderResults,get returnHash(){return saved?.hash||readingHash(currentEntry()?.number);}};
}
