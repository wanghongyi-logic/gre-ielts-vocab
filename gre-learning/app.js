import {getLearningEntries} from './content.js';
import {escapeLearningText as escape, renderNotReady} from './render.js';
import {resolveWordNumber, filterEntries, neighboringNumbers} from './model.js';
import {visualMnemonics} from './visuals.js';
import {installWordSwipe, installMobileZoomGuard} from './swipe.js';
import {installMeaningMotion} from './motion.js';
installMobileZoomGuard();
const entries = getLearningEntries();
const main = document.getElementById('word-content');
const picker = document.getElementById('word-picker');
const search = document.getElementById('word-search');
const counter = document.getElementById('word-counter');
import {renderWordPage} from './view.js';
let current;
let observer;
let speech;
const meaningMotion = installMeaningMotion(main);
const swipe = installWordSwipe({surface:main,hintHost:document.querySelector('.site-header'),picker,
  getNeighbor:direction=>neighboringNumbers(entries,current?.number)[direction],onNavigate:navigate});
function remember() { try { return sessionStorage.getItem('gre-learning-current-v1'); } catch { return null; } }
function navigate(number) { if (number && number !== current?.number) location.hash = `/learn/${number}`; }
function render() {
  meaningMotion.cancel();
  const number = resolveWordNumber(location.hash, entries, remember());
  current = entries.find(entry => entry.number === number);
  observer?.disconnect();
  window.speechSynthesis?.cancel();
  if (!current) { main.innerHTML = renderNotReady(); swipe.cancel(); return; }
  try { sessionStorage.setItem('gre-learning-current-v1', String(number)); } catch {}
  if (location.hash !== `#/learn/${number}`) history.replaceState(null, '', `#/learn/${number}`);
  document.title = `${current.word} · 词汇精学`;
  const position = neighboringNumbers(entries, number);
  counter.textContent = `${String(position.index + 1).padStart(2, '0')} / ${entries.length}`;
  counter.setAttribute('aria-label', `第 ${position.index + 1} 个词，共 ${entries.length} 个。打开单词目录`);
  const visual = visualMnemonics[number];
  main.innerHTML = renderWordPage(current, visual);
  meaningMotion.refresh();
  const speakButton = main.querySelector('[data-speak]');
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { speakButton.disabled = true; speakButton.title = '此浏览器暂不支持朗读'; }
  window.scrollTo({top:0,behavior:'instant'});
  swipe.rendered(`${current.word}，第 ${position.index + 1} 个词，共 ${entries.length} 个`);
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(records=>{
      const visible = records.filter(record=>record.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
      if (visible) main.querySelectorAll('[data-section]').forEach(link=>{if(link.dataset.section===visible.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    },{rootMargin:'-115px 0px -55% 0px',threshold:0});
    main.querySelectorAll('[data-learning-panel]').forEach(section=>observer.observe(section));
  }
}
function renderResults() {
  const matches = filterEntries(entries, search.value);
  document.getElementById('search-count').textContent = `${matches.length} 个词`;
  document.getElementById('word-results').innerHTML = matches.length ? matches.map(entry=>`<button type="button" class="word-result ${entry.number===current?.number?'is-current':''}" data-word="${entry.number}"><span class="result-number">${String(entry.number).padStart(2,'0')}</span><span><strong lang="en">${escape(entry.word)}</strong><small>${escape(entry.coreMeaningZh)}</small></span>${entry.number===current?.number?'<span class="current-dot" aria-label="当前词"></span>':''}</button>`).join('') : '<p class="search-empty">没有找到这个词，试试其他拼写或中文释义</p>';
}
function openPicker() { meaningMotion.cancel();swipe.cancel();search.value='';renderResults();if(!picker.open)picker.showModal();search.focus(); }
function closePicker() { picker.close(); }
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();main.focus();main.scrollIntoView({block:'start',behavior:'instant'});});
document.getElementById('open-search').addEventListener('click',openPicker);
counter.addEventListener('click',openPicker);
document.getElementById('close-search').addEventListener('click',closePicker);
search.addEventListener('input',renderResults);
picker.addEventListener('close',()=>meaningMotion.refresh());
picker.addEventListener('click',event=>{
  const button=event.target.closest('[data-word]');
  if(button){const number=Number(button.dataset.word);closePicker();navigate(number);return;}
  if(event.target===picker){const box=picker.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closePicker();}
});
main.addEventListener('click',event=>{
  const link=event.target.closest('[data-section]');
  if(link){event.preventDefault();document.getElementById(link.dataset.section)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
  const button=event.target.closest('[data-speak]');
  if(!button||button.disabled)return;
  window.speechSynthesis.cancel();
  speech=new SpeechSynthesisUtterance(current.word);speech.lang='en-US';speech.rate=.85;
  const voices=window.speechSynthesis.getVoices();const voice=voices.find(item=>item.localService&&item.lang.startsWith('en'))||voices.find(item=>item.lang.startsWith('en'));
  if(voice)speech.voice=voice;
  button.classList.add('is-speaking');
  speech.onend=()=>button.classList.remove('is-speaking');
  speech.onerror=()=>{button.classList.remove('is-speaking');document.getElementById('speech-status').textContent='朗读暂不可用，请稍后再试';};
  window.speechSynthesis.speak(speech);
});
window.addEventListener('hashchange',render);
window.addEventListener('pagehide',()=>window.speechSynthesis?.cancel());
render();
window.dispatchEvent(new Event('vocab-app-ready'));
