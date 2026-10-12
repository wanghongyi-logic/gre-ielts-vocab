// Illustration-only enhancement. Reading routes, downloads and media remain owned
// by the existing app. The margin color fraction is copied from real saved state.
export const MARGIN_ITEMS=Object.freeze({
 'open-search':{label:'目录',icon:'<path d="M4.5 6.2 19 5.7M5 12.1l13.5-.2M4.8 18.1l14-.4"/>'},
 'word-title':{label:'单词',icon:'<text x="12" y="21" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="currentColor" stroke="none">A</text>'},
 memory:{label:'记忆',icon:'<path d="M12 12C2.1 11.3 3.9 2.3 8.2 3.1c3 .4 3.8 5 3.8 8.9Zm0 0c1.2-9.6 9.9-8 8.8-3.8-.6 3-5 3.8-8.8 3.8Zm0 0c9.7 1.3 8 10.1 3.8 8.8-3-.6-3.8-5-3.8-8.8Zm0 0c-1.1 9.8-10 8-8.8 3.9.6-3 5-4 8.8-3.9Z"/>'},
 usage:{label:'用法',icon:'<circle cx="15.5" cy="7.5" r="4.4"/><path d="m12.3 10.7-9 9M5.4 17.6l2 2M8 15l2 2"/>'},
 'context-examples':{label:'例句',icon:'<path d="M9.5 5C5.2 8 3 11.3 3 15.3c0 2.3 1.3 3.7 3.2 3.7 2 0 3.3-1.5 3.3-3.3 0-1.7-1.1-3-2.8-3.2.1-2.3 1.3-4.8 2.8-7.5Zm11 0c-4.3 3-6.5 6.3-6.5 10.3 0 2.3 1.3 3.7 3.2 3.7 2 0 3.3-1.5 3.3-3.3 0-1.7-1.1-3-2.8-3.2.1-2.3 1.3-4.8 2.8-7.5Z"/>'},
 comparison:{label:'等价词',icon:'<path d="m7 3-.8 18M17 3l.5 18M5.5 5l-.4 14M18.5 5l.6 14"/>'},
 'open-settings':{label:'设置',icon:'<path d="m10 3-.7 2.5-2.2 1.3-2.5-.6-2 3.5 1.8 1.9v2.6L2.6 16l2 3.5 2.5-.6 2.2 1.3.7 2.5h4l.7-2.5 2.2-1.3 2.5.6 2-3.5-1.8-1.8v-2.6l1.8-1.9-2-3.5-2.5.6-2.2-1.3L14 3h-4Z" transform="translate(0 -1) scale(1 .96)"/><circle cx="12" cy="11.5" r="3"/>'}
});
export const marginIcon=key=>`<svg class="margin-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${MARGIN_ITEMS[key].icon}</svg>`;
export const marginArtMarkup=()=>'<div class="margin-art" aria-hidden="true"><span class="margin-vine margin-vine-ground"></span><span class="margin-vine margin-vine-saved"></span></div>';
export function marginNavMarkup(){
 const keys=['word-title','memory','usage','context-examples','comparison'];
 return `<nav class="bookmarks paper-foreedge botanical-margin" aria-label="页边书签">${marginArtMarkup()}<button class="bookmark contents-bookmark margin-control" id="open-search" type="button" aria-label="打开单词目录，查找单词" aria-controls="word-picker" aria-expanded="false" title="目录">${marginIcon('open-search')}<span class="margin-label">目录</span></button><div class="bookmark-list" id="bookmark-list">${keys.map(key=>`<a class="bookmark margin-control${key==='word-title'?' is-current':''}" href="#${key}" data-section="${key}" aria-label="${MARGIN_ITEMS[key].label}" title="${MARGIN_ITEMS[key].label}"${key==='word-title'?' aria-current="location"':''}>${marginIcon(key)}<span class="margin-label">${MARGIN_ITEMS[key].label}</span></a>`).join('')}</div></nav>`;
}
export function savedFraction(value){const number=Number(value);return Number.isFinite(number)?Math.max(0,Math.min(1,number)):0;}
export function syncMarginGeometry(nav){
 const list=nav.querySelector('.bookmark-list');if(!nav.getBoundingClientRect||!list?.getBoundingClientRect)return;
 const height=Math.max(44,list.getBoundingClientRect().top-nav.getBoundingClientRect().top-8);
 nav.style.setProperty('--margin-vine-height',`${height}px`);
}
export function installBotanicalMargin(nav){
 if(!nav||nav.dataset.botanicalMarginReady)return;nav.dataset.botanicalMarginReady='true';
 const doc=nav.ownerDocument,win=doc.defaultView;
 nav.classList.add('paper-foreedge','botanical-margin');
 nav.querySelectorAll('.edge-material,.edge-pocket').forEach(element=>element.remove());
 if(!doc.querySelector('[data-botanical-margin-style]')){const link=doc.createElement('link');link.rel='stylesheet';link.href=new URL('./botanical-margin.css',import.meta.url).href;link.dataset.botanicalMarginStyle='';doc.head.append(link);}
 if(!nav.querySelector('.margin-art'))nav.insertAdjacentHTML('afterbegin',marginArtMarkup());
 for(const control of nav.querySelectorAll('.bookmark,#open-settings')){
  const key=control.dataset.section||control.id,item=MARGIN_ITEMS[key];if(!item||control.classList.contains('margin-control'))continue;
  control.querySelectorAll('.edge-icon,.edge-label,:scope > span:not(.library-rail-track):not(.library-rail-label)').forEach(element=>element.remove());
  control.classList.add('margin-control');control.insertAdjacentHTML('beforeend',marginIcon(key)+`<span class="margin-label">${item.label}</span>`);
  if(control.dataset.section)control.setAttribute('aria-label',item.label);
  if(!control.title)control.title=item.label;
 }
 const settings=nav.querySelector('#open-settings'),count=settings?.querySelector('.library-rail-label');
 const sync=()=>{
  if(count){const match=count.textContent.match(/^(\d+)\s*\/\s*(\d+)$/);count.dataset.saved=match?.[1]||'—';count.dataset.total=match?`/ ${match[2]}`:'';}
  nav.style.setProperty('--margin-saved-progress',String(savedFraction(settings?.style.getPropertyValue('--saved-progress'))));
 };
 sync();
 if(win?.MutationObserver){const observer=new win.MutationObserver(sync);if(count)observer.observe(count,{childList:true,characterData:true,subtree:true});if(settings)observer.observe(settings,{attributes:true,attributeFilter:['style']});}
 const geometry=()=>syncMarginGeometry(nav);geometry();
 if(win?.ResizeObserver){const observer=new win.ResizeObserver(geometry);for(const element of [nav,nav.querySelector('.bookmark-list'),settings])if(element)observer.observe(element);}
 win?.addEventListener?.('resize',geometry,{passive:true});
}
