// The highlighted bookmark describes the reading location, except while the
// directory is open. Programmatic scrolling owns one explicit, cancelable target.
export function sectionAtPosition(sections,{scrollY=0,height=0,scrollHeight=0}={}) {
 if(!sections.length)return null;
 if(scrollY<=0)return sections[0].id;
 if(scrollY>0&&scrollY+height>=scrollHeight-3)return sections.at(-1).id;
 const line=scrollY+Math.min(160,height*.22);
 let current=sections[0].id;
 for(const section of sections){if(section.top<=line)current=section.id;else break;}
 return current;
}
export function installBookmarkNavigation({surface,picker,window:win=window,document:doc=document}) {
 const nav=doc.querySelector('.bookmarks'),directory=doc.getElementById('open-search');
 const links=[...nav.querySelectorAll('[data-section]')];
 let sections=[],reading='word-title',pending=null,frame=0,settleFrame=0,suspended=true;
 // Retire only the old rail preference; keep all reading progress untouched.
 try{win.sessionStorage.removeItem('gre-bookmarks-collapsed-v1');}catch{}
 doc.body.classList.remove('bookmarks-collapsed');nav.classList.remove('is-collapsed');
 const reduced=()=>win.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function paint(){
  const inDirectory=picker.open;
  directory.classList.toggle('is-current',inDirectory);directory.setAttribute('aria-expanded',String(inDirectory));
  links.forEach(link=>{const active=!inDirectory&&link.dataset.section===reading;link.classList.toggle('is-current',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
 function position(){return sectionAtPosition(sections.map(element=>({id:element.id,top:element.getBoundingClientRect().top+win.scrollY})),{scrollY:win.scrollY,height:win.innerHeight,scrollHeight:doc.documentElement.scrollHeight});}
 function update(){frame=0;if(suspended)return;reading=pending?.id||position()||'word-title';paint();}
 function schedule(){if(!frame)frame=win.requestAnimationFrame(update);}
 function cancelTarget(){pending=null;win.cancelAnimationFrame(settleFrame);settleFrame=0;}
 function sync(){if(picker.open&&pending){win.scrollTo({top:win.scrollY,behavior:'instant'});cancelTarget();}if(!suspended)reading=pending?.id||position()||'word-title';paint();}
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
  pending={id,last:win.scrollY,still:0,started:win.performance.now()};reading=pending.id;paint();
  if(id==='word-title')win.scrollTo({top:0,left:0,behavior:reduced()?'instant':'smooth'});
  else target.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
  settleFrame=win.requestAnimationFrame(settle);return true;
 }
 function interrupt(event){
  if(event.type==='keydown'&&!['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))return;
  if(event.target?.closest?.('.bookmarks,dialog'))return;
  if(pending){win.scrollTo({top:win.scrollY,behavior:'instant'});cancelTarget();schedule();}
 }
 doc.body.addEventListener('transitionend',schedule);
 win.addEventListener('scroll',schedule,{passive:true});win.addEventListener('resize',()=>{cancelTarget();schedule();});
 for(const type of ['wheel','touchstart','pointerdown'])win.addEventListener(type,interrupt,{passive:true});
 doc.addEventListener('keydown',interrupt);
 picker.addEventListener('close',sync);
 paint();
 return {navigate,sync,refresh(){cancelTarget();sections=links.map(link=>doc.getElementById(link.dataset.section)).filter(Boolean);suspended=false;reading=position()||'word-title';paint();schedule();},suspend(){cancelTarget();win.cancelAnimationFrame(frame);frame=0;suspended=true;sections=[];reading='word-title';paint();}};
}
