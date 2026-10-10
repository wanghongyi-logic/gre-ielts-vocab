import {LessonLoader,expandCatalog} from './lesson-loader.js';
import {escapeLearningText as escape,renderNotReady} from './render.js';
import {resolveWordNumber,filterEntries,neighboringNumbers} from './model.js';
import {installWordSwipe,installMobileZoomGuard} from './swipe.js';
import {installPreparedPages} from './prepared-pages.js';
import {installContents} from './contents.js';
import {installStoryMedia} from './story-media.js';
import {installBookmarkNavigation} from './bookmark-navigation.js';
const catalog=expandCatalog(await fetch(new URL('./catalog.json',import.meta.url),{cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('Lesson index unavailable');return response.json();}));
installMobileZoomGuard();
const entries=catalog.entries;
document.getElementById('release-summary').textContent=`词汇学习 · 已收录 ${entries.length} 词`;
const loader=new LessonLoader(catalog);
const main=document.getElementById('word-content'),picker=document.getElementById('word-picker'),search=document.getElementById('word-search'),counter=document.getElementById('word-counter');
const bookmarks=installBookmarkNavigation({surface:main,picker,onLayoutChange:()=>swipe.cancel()});
let motion=installStoryMedia(main,{picker});
const pages=installPreparedPages({loader,entries,picker});
const swipe=installWordSwipe({surface:main,hintHost:main.parentNode,picker,getNeighbor:direction=>neighboringNumbers(entries,selectedNumber)[direction],getPrepared:direction=>pages.get(neighboringNumbers(entries,selectedNumber)[direction]),prepareNeighbor:direction=>pages.prepare(neighboringNumbers(entries,selectedNumber)[direction]),onNavigate:navigate,onTurnActivity:active=>motion.setTurning(active)});
let selectedNumber,current,currentMedia,speech,renderGeneration=0,pendingSection=null;
const contents=installContents({main,picker,search,entries,getSelected:()=>selectedNumber,navigate,onOpen:()=>{swipe.cancel();if(current){renderGeneration++;main.removeAttribute('aria-busy');pages.adjacent(selectedNumber);}bookmarks.sync();motion.sync();window.speechSynthesis?.cancel();},onClose:()=>{bookmarks.sync();motion.sync();},onTransition:active=>motion.setTurning(active)});
function remember(){try{return sessionStorage.getItem('gre-learning-current-v1');}catch{return null;}}
function navigate(number){if(entries.some(entry=>entry.number===number)&&number!==selectedNumber)location.hash=`/learn/${number}`;}
function watchChapters(){bookmarks.refresh();}
async function render(){
 const generation=++renderGeneration,startingHash=location.hash;
 const inContents=contents.isRoute(startingHash);
 const number=resolveWordNumber(inContents?'':startingHash,entries,remember());
 window.speechSynthesis?.cancel();
 const selected=entries.find(entry=>entry.number===number),position={...neighboringNumbers(entries,number),total:entries.length};
 if(!number){pages.destroy();loader.cancel();motion.cancel();bookmarks.suspend();current=null;selectedNumber=null;main.removeAttribute('aria-busy');main.innerHTML=renderNotReady();swipe.cancel();return;}
 // A failed destination leaves the existing page and its playback state usable.
 // The verified, decoded destination is adopted only as one atomic replacement.
 if(!current){main.innerHTML='<p class="initial-status" role="status">正在翻开这一页…</p>';main.setAttribute('aria-busy','true');}
 main.setAttribute('aria-busy','true');pages.keep(number,selectedNumber);swipe.loading(number);
 let page;
 try{page=await pages.prepare(number);}catch(error){
  if(generation!==renderGeneration||location.hash!==startingHash)return;
  swipe.cancel();main.removeAttribute('aria-busy');
  if(current&&picker.open){contents.preparationFailed();pages.adjacent(selectedNumber);}
  else if(current){history.replaceState(null,'',`#/learn/${selectedNumber}`);pages.adjacent(selectedNumber);document.getElementById('speech-status').textContent='这一页暂时无法打开，请稍后再试';}
  else main.innerHTML=`<div class="initial-status" role="status"><p>${navigator.onLine===false?'这一页尚未下载，请联网后重试':'这一页暂时无法打开，请重试'}</p><button type="button" data-retry>重试</button></div>`;
  return;
 }
 if(picker.open&&!inContents)await contents.whenSettled();
 if(generation!==renderGeneration||location.hash!==startingHash)return;
 page=pages.take(number);if(!page)return;
 const adopt=()=>{
 motion.destroy();main.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.load();});bookmarks.suspend();motion=page.motion;
 current=page.loaded.entry;currentMedia=page.loaded.media;selectedNumber=number;
 main.removeAttribute('aria-busy');
 document.title=`${selected.word} · 单词故事`;counter.textContent=`${position.index+1} / ${entries.length}`;counter.setAttribute('aria-label',`第 ${position.index+1} 个词，共 ${entries.length} 个`);
 try{sessionStorage.setItem('gre-learning-current-v1',String(number));}catch{}
 if(!inContents&&location.hash!==`#/learn/${number}`)history.replaceState(null,'',`#/learn/${number}`);
 main.replaceChildren(...page.root.childNodes);page.root.remove();
 main.querySelectorAll('[data-prepared-id]').forEach(node=>{node.id=node.dataset.preparedId;delete node.dataset.preparedId;});
 const speakButton=main.querySelector('[data-speak]');
 if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){speakButton.disabled=true;speakButton.title='此浏览器暂不支持朗读';}
 if(!picker.open)window.scrollTo({top:0,behavior:'instant'});
 watchChapters();swipe.rendered(`${current.word}，第 ${position.index+1} 个词，共 ${entries.length} 个`);if(picker.open)motion.setTurning(true);motion.activate();pages.adjacent(number);
 if(picker.open&&inContents)contents.renderResults();
 if(pendingSection){const section=pendingSection;pendingSection=null;bookmarks.navigate(section);}
 };
 if(picker.open&&!inContents)contents.reveal(adopt);else adopt();
}
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();const target=picker.open?document.getElementById('picker-title'):main;target.focus();target.scrollIntoView({block:'start',behavior:'instant'});});
document.addEventListener('click',event=>{
 const link=event.target.closest('[data-section]');if(link){event.preventDefault();if(picker.open){pendingSection=link.dataset.section;contents.close();return;}bookmarks.navigate(link.dataset.section);return;}
 const page=event.target.closest('[data-page]');if(page&&!page.disabled){swipe.go(page.dataset.page);return;}
 if(event.target.closest('[data-retry]')){render();return;}
 const button=event.target.closest('[data-speak]');if(!button||button.disabled||!current)return;
 window.speechSynthesis.cancel();speech=new SpeechSynthesisUtterance(current.word);speech.lang='en-US';speech.rate=.85;
 const voices=window.speechSynthesis.getVoices(),voice=voices.find(item=>item.localService&&item.lang.startsWith('en'))||voices.find(item=>item.lang.startsWith('en'));if(voice)speech.voice=voice;
 button.classList.add('is-speaking');speech.onend=()=>button.classList.remove('is-speaking');speech.onerror=()=>{button.classList.remove('is-speaking');document.getElementById('speech-status').textContent='朗读暂不可用，请稍后再试';};window.speechSynthesis.speak(speech);
});
function route(){if(contents.deferRoute(route))return;const state=contents.syncRoute();if(state.contents&&current)return;if(state.restored&&current){renderGeneration++;main.removeAttribute('aria-busy');pages.adjacent(selectedNumber);if(pendingSection){const section=pendingSection;pendingSection=null;requestAnimationFrame(()=>bookmarks.navigate(section));}return;}render();}
window.addEventListener('hashchange',route);
window.addEventListener('pagehide',event=>{window.speechSynthesis?.cancel();loader.cancel();pages.destroy();if(event.persisted)motion.setTurning(true);else motion.cancel();bookmarks.suspend();renderGeneration++;});
window.addEventListener('pageshow',event=>{if(!event.persisted)return;if(contents.isRoute(location.hash)!==picker.open){route();return;}if(current&&(contents.isRoute(location.hash)||resolveWordNumber(location.hash,entries,remember())===selectedNumber)){main.removeAttribute('aria-busy');watchChapters();motion.setTurning(false);pages.adjacent(selectedNumber);}else route();});
route();window.dispatchEvent(new Event('vocab-app-ready'));
