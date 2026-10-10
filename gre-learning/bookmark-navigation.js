// The highlighted bookmark describes the reading location, except while the
// directory is open. Programmatic scrolling owns one explicit, cancelable target.
export function sectionAtPosition(sections,{scrollY=0,height=0,scrollHeight=0}={}) {
 if(!sections.length)return null;
 if(scrollY>0&&scrollY+height>=scrollHeight-3)return sections.at(-1).id;
 const line=scrollY+Math.min(160,height*.22);
 let current=sections[0].id;
 for(const section of sections){if(section.top<=line)current=section.id;else break;}
 return current;
}
export function installBookmarkNavigation({surface,picker,onLayoutChange=()=>{},window:win=window,document:doc=document}) {
 const nav=doc.querySelector('.bookmarks'),directory=doc.getElementById('open-search'),toggle=doc.getElementById('toggle-bookmarks');
 const links=[...nav.querySelectorAll('[data-section]')];
 let sections=[],reading='memory',pending=null,frame=0,settleFrame=0,suspended=true,collapsed=false;
 try{collapsed=win.sessionStorage.getItem('gre-bookmarks-collapsed-v1')==='true';}catch{}
 const reduced=()=>win.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function paint(){
  const inDirectory=picker.open;
  directory.classList.toggle('is-current',inDirectory);directory.setAttribute('aria-expanded',String(inDirectory));
  links.forEach(link=>{const active=!inDirectory&&link.dataset.section===reading;link.classList.toggle('is-current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
 function position(){return sectionAtPosition(sections.map(element=>({id:element.id,top:element.getBoundingClientRect().top+win.scrollY})),{scrollY:win.scrollY,height:win.innerHeight,scrollHeight:doc.documentElement.scrollHeight});}
 function update(){frame=0;if(suspended)return;reading=pending?.id||position()||'memory';paint();}
 function schedule(){if(!frame)frame=win.requestAnimationFrame(update);}
 function cancelTarget(){pending=null;win.cancelAnimationFrame(settleFrame);settleFrame=0;}
 function sync(){if(picker.open&&pending){win.scrollTo({top:win.scrollY,behavior:'instant'});cancelTarget();}if(!suspended)reading=pending?.id||position()||'memory';paint();}
 function settle(){
  if(!pending)return;
  const y=win.scrollY;
  pending.still=Math.abs(y-pending.last)<.5?pending.still+1:0;pending.last=y;
  if(pending.still>=4&&win.performance.now()-pending.started>100){const id=pending.id;cancelTarget();reading=id;paint();return;}
  settleFrame=win.requestAnimationFrame(settle);
 }
 function navigate(id){
  if(suspended)return false;
  const target=doc.getElementById(id);if(!target||!surface.contains(target))return false;
  cancelTarget();
  pending={id:id==='word-title'?'memory':id,last:win.scrollY,still:0,started:win.performance.now()};reading=pending.id;paint();
  target.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
  settleFrame=win.requestAnimationFrame(settle);return true;
 }
 function interrupt(event){
  if(event.type==='keydown'&&!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))return;
  if(event.target?.closest?.('.bookmarks,dialog'))return;
  if(pending){win.scrollTo({top:win.scrollY,behavior:'instant'});cancelTarget();schedule();}
 }
 function applyCollapsed(){
  doc.body.classList.toggle('bookmarks-collapsed',collapsed);nav.classList.toggle('is-collapsed',collapsed);
  toggle.setAttribute('aria-expanded',String(!collapsed));toggle.setAttribute('aria-label',collapsed?'展开页边书签':'收起页边书签');toggle.title=collapsed?'展开书签':'收起书签';
  nav.querySelector('.bookmark-list').inert=collapsed;
 }
 toggle.addEventListener('click',()=>{onLayoutChange();if(pending)win.scrollTo({top:win.scrollY,behavior:'instant'});cancelTarget();collapsed=!collapsed;try{win.sessionStorage.setItem('gre-bookmarks-collapsed-v1',String(collapsed));}catch{}applyCollapsed();schedule();});
 doc.body.addEventListener('transitionend',schedule);
 win.addEventListener('scroll',schedule,{passive:true});win.addEventListener('resize',()=>{cancelTarget();schedule();});
 for(const type of ['wheel','touchstart','pointerdown'])win.addEventListener(type,interrupt,{passive:true});
 doc.addEventListener('keydown',interrupt);
 picker.addEventListener('close',sync);
 applyCollapsed();paint();
 return {navigate,sync,refresh(){cancelTarget();sections=links.map(link=>doc.getElementById(link.dataset.section)).filter(Boolean);suspended=false;reading=position()||'memory';paint();schedule();},suspend(){cancelTarget();win.cancelAnimationFrame(frame);frame=0;suspended=true;sections=[];reading='memory';paint();}};
}
