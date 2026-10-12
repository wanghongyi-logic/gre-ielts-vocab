/* A carved fore-edge decorates the existing navigation; it owns no routes,
   downloads, scroll state, media state, or reading content. */
const NS='http://www.w3.org/2000/svg';
export const EDGE_ITEMS=Object.freeze({
 'open-search':{label:'目录',icon:'<path d="M5 6h14M5 12h14M5 18h14"/>'},
 'word-title':{label:'单词',icon:'<path d="m5 20 7-16 7 16M8 14h8M3.5 20h5M15.5 20h5"/>'},
 memory:{label:'记忆',icon:'<path d="M12 12C2 11 4 2 8 3c3 0 4 5 4 9Zm0 0c1-10 10-8 9-4 0 3-5 4-9 4Zm0 0c10 1 8 10 4 9-3 0-4-5-4-9Zm0 0C11 22 2 20 3 16c0-3 5-4 9-4Z"/>'},
 usage:{label:'用法',icon:'<circle cx="15.5" cy="7.5" r="4.5"/><path d="m12.3 10.7-9 9M5.4 17.6l2 2M8 15l2 2"/>'},
 'context-examples':{label:'例句',icon:'<path d="M9.5 5C5.2 8 3 11.3 3 15.3c0 2.3 1.3 3.7 3.2 3.7 2 0 3.3-1.5 3.3-3.3 0-1.7-1.1-3-2.8-3.2.1-2.3 1.3-4.8 2.8-7.5Zm11 0c-4.3 3-6.5 6.3-6.5 10.3 0 2.3 1.3 3.7 3.2 3.7 2 0 3.3-1.5 3.3-3.3 0-1.7-1.1-3-2.8-3.2.1-2.3 1.3-4.8 2.8-7.5Z"/>'},
 comparison:{label:'等价词',icon:'<path d="m6 3-2 18h5L8 3H6Zm10 0-1 18h5L18 3h-2Z"/>'},
 'open-settings':{label:'设置',icon:'<path d="m10 3-.7 2.5-2.2 1.3-2.5-.6-2 3.5 1.8 1.9v2.6L2.6 16l2 3.5 2.5-.6 2.2 1.3.7 2.5h4l.7-2.5 2.2-1.3 2.5.6 2-3.5-1.8-1.8v-2.6l1.8-1.9-2-3.5-2.5.6-2.2-1.3L14 3h-4Z" transform="translate(0 -1) scale(1 .96)"/><circle cx="12" cy="11.5" r="3"/>'}
});
export const EDGE_MATERIAL=Object.freeze({x:337,y:30,width:94,height:2113,imageWidth:724,imageHeight:2172,designHeight:794});
export function pocketMarkup(id,base=new URL('.',import.meta.url).href){
 const height=id.includes('open-settings')?180:64,paper=`${base}sculpted-paper-leaves.webp`;
 return `<svg class="edge-pocket${height===180?' edge-pocket-fan':''}" viewBox="0 0 44 ${height}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><defs><pattern id="${id}-paper" width="44" height="96" patternUnits="userSpaceOnUse"><image href="${paper}" width="400" height="600" preserveAspectRatio="none"/></pattern></defs><rect class="edge-pocket-floor" width="44" height="${height}"/><rect width="44" height="${height}" fill="url(#${id}-paper)" opacity=".4" style="mix-blend-mode:multiply"/></svg>`;
}
export function materialMarkup(base=new URL('.',import.meta.url).href){
 const m=EDGE_MATERIAL;
 const slice=(name,from,to)=>`<svg class="edge-material-${name}" viewBox="${m.x} ${m.y+from/m.designHeight*m.height} ${m.width} ${(to-from)/m.designHeight*m.height}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><image href="${base}sculpted-continuous-paper.webp" width="${m.imageWidth}" height="${m.imageHeight}"/></svg>`;
 return `<div class="edge-material" aria-hidden="true">${slice('directory',0,64)}${slice('upper',64,179)}${slice('fan',179,359)}${slice('lower',359,474)}<div class="edge-material-section-window">${slice('sections',474,794)}</div></div>`;
}
export function syncMaterialGeometry(nav){
 const settings=nav.querySelector('#open-settings'),directory=nav.querySelector('#open-search'),sections=nav.querySelector('.bookmark-list');
 if(!nav.getBoundingClientRect||!settings?.getBoundingClientRect||!directory?.getBoundingClientRect||!sections?.getBoundingClientRect)return;
 const top=nav.getBoundingClientRect().top,fan=settings.getBoundingClientRect(),index=sections.getBoundingClientRect();
 for(const [name,value]of [['directory-bottom',directory.getBoundingClientRect().bottom-top],['settings-top',fan.top-top],['settings-bottom',fan.bottom-top],['sections-top',index.top-top],['section-scroll',sections.scrollTop||0]])nav.style.setProperty(`--edge-${name}`,`${Math.max(0,value)}px`);
}
function svgIcon(doc,markup){const svg=doc.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.classList.add('edge-icon');svg.innerHTML=markup;return svg;}
export function installSculptedBookEdge(nav){
 if(!nav||nav.dataset.sculptedEdgeReady)return;
 nav.dataset.sculptedEdgeReady='true';
 const doc=nav.ownerDocument;
 if(!doc.querySelector('[data-sculpted-edge-style]')){const link=doc.createElement('link');link.rel='stylesheet';link.href=new URL('./sculpted-book-edge.css',import.meta.url).href;link.dataset.sculptedEdgeStyle='';doc.head.append(link);}
 nav.classList.add('paper-foreedge');
 if(!nav.querySelector('.edge-material'))nav.insertAdjacentHTML('beforeend',materialMarkup());
 for(const control of nav.querySelectorAll('.bookmark,[id="open-settings"]')){
  const key=control.dataset.section||control.id,item=EDGE_ITEMS[key];if(!item||control.classList.contains('edge-control'))continue;
  control.classList.add('edge-control');
  control.insertAdjacentHTML('afterbegin',pocketMarkup(`edge-${key}`));
  control.append(svgIcon(doc,item.icon));
  let label=control.querySelector(':scope > span:not(.library-rail-track):not(.library-rail-label)');
  if(!label){label=doc.createElement('span');label.textContent=item.label;control.append(label);}
  label.classList.add('edge-label');
  if(control.dataset.section)control.setAttribute('aria-label',item.label);
  if(!control.title)control.title=item.label;
 }
 const count=nav.querySelector('.library-rail-label');
 if(count){
  const sync=()=>{const match=count.textContent.match(/^(\d+)\s*\/\s*(\d+)$/);count.dataset.saved=match?.[1]||'—';count.dataset.total=match?`/ ${match[2]}`:'';};
  sync();const Observer=doc.defaultView?.MutationObserver;
  if(Observer)new Observer(sync).observe(count,{childList:true,characterData:true,subtree:true});
 }
 const win=doc.defaultView;
 const sync=()=>syncMaterialGeometry(nav);
 sync();
 if(win?.ResizeObserver){const observer=new win.ResizeObserver(sync);for(const element of [nav,nav.querySelector('#open-settings'),nav.querySelector('#open-search'),nav.querySelector('.bookmark-list')])if(element)observer.observe(element);}
 win?.addEventListener?.('resize',sync,{passive:true});
 nav.querySelector('.bookmark-list')?.addEventListener?.('scroll',sync,{passive:true});

}
