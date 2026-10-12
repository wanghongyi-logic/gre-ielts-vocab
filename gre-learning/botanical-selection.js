// One physical pigment mark follows semantic selection; controls never move.
export function accentPlacement(navRect,controlRect,{inkOffset=0}={}) {
 const height=Math.min(54,Math.max(32,controlRect.height-10));
 const center=controlRect.top+controlRect.height/2+inkOffset;
 return {x:7,y:Math.max(0,Math.min(navRect.height-height,center-navRect.top-height/2)),height};
}
export function installMovingWatercolor(nav){
 if(!nav?.ownerDocument?.createElement||nav.dataset.movingWatercolorReady)return;
 nav.dataset.movingWatercolorReady='true';
 const doc=nav.ownerDocument,win=doc.defaultView;
 const mark=doc.createElement('div'),pigment=doc.createElement('span');
 mark.className='margin-selection';mark.setAttribute('aria-hidden','true');pigment.className='margin-selection-pigment';mark.append(pigment);nav.append(mark);
 const reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let travel=null,spread=null,selected=null,placed=false,frame=0,instant=false,lastTarget='';
 function cancel(){travel?.cancel();spread?.cancel();travel=spread=null;}
 function place(immediate=false){
  const control=nav.querySelector('.margin-control.is-current');
  if(!control){cancel();mark.hidden=true;selected=null;placed=false;return;}
  const nr=nav.getBoundingClientRect(),cr=control.getBoundingClientRect();
  const list=control.closest?.('.bookmark-list'),lr=list?.getBoundingClientRect();
  if(lr&&(cr.bottom<=lr.top||cr.top>=lr.bottom)){cancel();mark.hidden=true;placed=false;return;}
  const inkOffset=control.id==='open-search'?(win.innerHeight<=640?0:win.innerHeight<=760?5:10):0;
  const target=accentPlacement(nr,cr,{inkOffset});
  const key=`${target.x},${target.y},${target.height}`;
  if(placed&&!mark.hidden&&selected===control&&key===lastTarget&&!immediate)return;
  lastTarget=key;
  // Read the currently painted position before canceling: reversals start here.
  const old=placed&&!mark.hidden?mark.getBoundingClientRect():null;
  const changed=selected!==control;selected=control;
  cancel();mark.hidden=false;mark.style.height=`${target.height}px`;mark.style.transform=`translate3d(${target.x}px,${target.y}px,0)`;
  if(old&&!immediate&&!reduced?.matches&&typeof mark.animate==='function'){
   const fromX=old.left-nr.left,fromY=old.top-nr.top;
   if(Math.abs(fromY-target.y)>.5||changed){
    travel=mark.animate([{transform:`translate3d(${fromX}px,${fromY}px,0)`,height:`${old.height}px`},{transform:`translate3d(${target.x}px,${target.y}px,0)`,height:`${target.height}px`}],{duration:320,easing:'cubic-bezier(.22,.7,.2,1)'});
    spread=pigment.animate([{transform:'scale(.82,.9)',opacity:.8},{transform:'scale(.86,.94)',opacity:.9,offset:.68},{transform:'scale(1)',opacity:1}],{duration:450,easing:'ease-out'});
   }
  }
  placed=true;
 }
 function schedule(immediate=false){instant=instant||immediate;if(frame)return;frame=win.requestAnimationFrame(()=>{frame=0;const now=instant;instant=false;place(now);});}
 if(win.MutationObserver){new win.MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.classList?.contains('margin-control')))schedule();}).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});}
 if(win.ResizeObserver){const observer=new win.ResizeObserver(()=>schedule(true));observer.observe(nav);for(const el of nav.querySelectorAll('.margin-control,.bookmark-list'))observer.observe(el);}
 win.addEventListener('resize',()=>schedule(true),{passive:true});
 nav.querySelector('.bookmark-list')?.addEventListener('scroll',()=>schedule(true),{passive:true});
 reduced?.addEventListener?.('change',()=>schedule(true));
 place(true);
 return {place,mark};
}
