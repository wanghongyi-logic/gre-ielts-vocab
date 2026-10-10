import {LessonLoader,expandCatalog} from './lesson-loader.js';
import {escapeLearningText as escape,renderNotReady} from './render.js';
import {resolveWordNumber,filterEntries,neighboringNumbers} from './model.js';
import {installWordSwipe,installMobileZoomGuard} from './swipe.js';
import {renderWordPage} from './view.js';
import {installStoryMedia} from './story-media.js';
const catalog=expandCatalog(await fetch(new URL('./catalog.json',import.meta.url),{cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('Lesson index unavailable');return response.json();}));
installMobileZoomGuard();
const entries=catalog.entries;
document.getElementById('release-summary').textContent=`词汇学习 · 已收录 ${entries.length} / ${catalog.libraryTarget} 词`;
const loader=new LessonLoader(catalog);
const main=document.getElementById('word-content'),picker=document.getElementById('word-picker'),search=document.getElementById('word-search'),counter=document.getElementById('word-counter');
const motion=installStoryMedia(main,{picker});
const swipe=installWordSwipe({surface:main,hintHost:document.querySelector('.site-header'),picker,getNeighbor:direction=>neighboringNumbers(entries,selectedNumber)[direction],onNavigate:navigate,onTurnActivity:active=>motion.setTurning(active)});
let selectedNumber,current,currentMedia,speech,renderGeneration=0,sectionObserver;
function remember(){try{return sessionStorage.getItem('gre-learning-current-v1');}catch{return null;}}
function navigate(number){if(entries.some(entry=>entry.number===number)&&number!==selectedNumber)location.hash=`/learn/${number}`;}
function watchChapters(){
 sectionObserver?.disconnect();document.querySelectorAll('.bookmarks a').forEach(link=>{link.classList.remove('is-current');link.removeAttribute('aria-current');});
 if(!('IntersectionObserver' in window))return;
 sectionObserver=new IntersectionObserver(records=>{for(const record of records)if(record.isIntersecting){document.querySelectorAll('.bookmarks a').forEach(link=>{const active=link.dataset.section===record.target.id;link.classList.toggle('is-current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}},{rootMargin:'-10% 0px -60% 0px',threshold:0});
 main.querySelectorAll('.book-chapter').forEach(section=>sectionObserver.observe(section));
}
async function render(){
 const generation=++renderGeneration,startingHash=location.hash;
 motion.cancel();sectionObserver?.disconnect();
 const number=resolveWordNumber(startingHash,entries,remember());selectedNumber=number;current=null;currentMedia=null;
 window.speechSynthesis?.cancel();
 const selected=entries.find(entry=>entry.number===number),position={...neighboringNumbers(entries,number),total:entries.length};
 if(selected){document.title=`${selected.word} · 单词故事`;counter.textContent=`${position.index+1} / ${entries.length}`;counter.setAttribute('aria-label',`第 ${position.index+1} 个词，共 ${entries.length} 个。打开单词目录`);}
 if(!number){loader.cancel();main.removeAttribute('aria-busy');main.innerHTML=renderNotReady();swipe.cancel();return;}
 main.innerHTML='<p class="initial-status" role="status">正在翻开这一页…</p>';main.setAttribute('aria-busy','true');swipe.loading();
 let loaded;
 try{loaded=await loader.select(number);}catch(error){
  if(generation!==renderGeneration||location.hash!==startingHash||selectedNumber!==number||error.name==='AbortError')return;
  swipe.cancel();main.removeAttribute('aria-busy');main.innerHTML=`<div class="initial-status" role="status"><p>${navigator.onLine===false?'这一页尚未下载，请联网后重试':'这一页暂时无法打开，请重试'}</p><button type="button" data-retry>重试</button></div>`;return;
 }
 if(generation!==renderGeneration||location.hash!==startingHash||selectedNumber!==number)return;
 const prepared=document.createElement('div');prepared.innerHTML=renderWordPage(loaded.entry,loaded.media,position);
 await motion.refresh(loaded.media,{root:prepared});
 if(generation!==renderGeneration||location.hash!==startingHash||selectedNumber!==number)return;
 current=loaded.entry;currentMedia=loaded.media;main.removeAttribute('aria-busy');
 try{sessionStorage.setItem('gre-learning-current-v1',String(number));}catch{}
 if(location.hash!==`#/learn/${number}`)history.replaceState(null,'',`#/learn/${number}`);
 main.replaceChildren(...prepared.childNodes);loader.prefetchAdjacent(number);watchChapters();
 const speakButton=main.querySelector('[data-speak]');
 if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){speakButton.disabled=true;speakButton.title='此浏览器暂不支持朗读';}
 window.scrollTo({top:0,behavior:'instant'});swipe.rendered(`${current.word}，第 ${position.index+1} 个词，共 ${entries.length} 个`);motion.activate();
}
function renderResults(){const matches=filterEntries(entries,search.value);document.getElementById('search-count').textContent=`${matches.length} 个词`;document.getElementById('word-results').innerHTML=matches.length?matches.map(entry=>`<button type="button" class="word-result ${entry.number===selectedNumber?'is-current':''}" data-word="${entry.number}"><span class="result-number">${String(entry.displayOrdinal).padStart(2,'0')}</span><span><strong lang="en">${escape(entry.word)}</strong><small>${escape(entry.coreMeaningZh)}</small></span>${entry.number===selectedNumber?'<span class="current-dot" aria-label="当前词"></span>':''}</button>`).join(''):'<p class="search-empty">没有找到这个词，试试其他拼写或中文释义</p>';}
function openPicker(){swipe.cancel();search.value='';renderResults();if(!picker.open)picker.showModal();motion.sync();search.focus();}
function closePicker(){picker.close();}
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start',behavior:'instant'});});
document.getElementById('open-search').addEventListener('click',openPicker);counter.addEventListener('click',openPicker);document.getElementById('close-search').addEventListener('click',closePicker);search.addEventListener('input',renderResults);
picker.addEventListener('click',event=>{const button=event.target.closest('[data-word]');if(button){closePicker();navigate(Number(button.dataset.word));return;}if(event.target===picker){const box=picker.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closePicker();}});
document.addEventListener('click',event=>{
 const link=event.target.closest('[data-section]');if(link){event.preventDefault();document.getElementById(link.dataset.section)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
 const page=event.target.closest('[data-page]');if(page&&!page.disabled){swipe.go(page.dataset.page);return;}
 if(event.target.closest('[data-retry]')){render();return;}
 const button=event.target.closest('[data-speak]');if(!button||button.disabled||!current)return;
 window.speechSynthesis.cancel();speech=new SpeechSynthesisUtterance(current.word);speech.lang='en-US';speech.rate=.85;
 const voices=window.speechSynthesis.getVoices(),voice=voices.find(item=>item.localService&&item.lang.startsWith('en'))||voices.find(item=>item.lang.startsWith('en'));if(voice)speech.voice=voice;
 button.classList.add('is-speaking');speech.onend=()=>button.classList.remove('is-speaking');speech.onerror=()=>{button.classList.remove('is-speaking');document.getElementById('speech-status').textContent='朗读暂不可用，请稍后再试';};window.speechSynthesis.speak(speech);
});
window.addEventListener('hashchange',render);
window.addEventListener('pagehide',()=>{window.speechSynthesis?.cancel();loader.cancel();motion.cancel();sectionObserver?.disconnect();renderGeneration++;});
window.addEventListener('pageshow',event=>{if(event.persisted)render();});
render();window.dispatchEvent(new Event('vocab-app-ready'));
