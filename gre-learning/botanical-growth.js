// A temporary painted celebration; stored progress and counts are never written.
const smooth=t=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
export function growthFraction(elapsed,actual){
 const real=Math.max(0,Math.min(1,Number(actual)||0));
 const keys=[[0,0],[220,.2],[500,.55],[780,.92],[940,1],[1040,1]];
 for(let i=1;i<keys.length;i++){const [end,to]=keys[i],[start,from]=keys[i-1];if(elapsed<end)return from+(to-from)*smooth((elapsed-start)/(end-start));}
 return 1+(real-1)*smooth((elapsed-1040)/280);
}
export function growthDetails(elapsed){
 const flower=smooth((elapsed-840)/140)*(1-smooth((elapsed-1050)/200));
 return {gold:elapsed<940?.64*(1-smooth((elapsed-890)/50)):0,
  wake:elapsed<970?.38*(1-smooth((elapsed-900)/70)):0,
  flower:flower*.94,flowerScale:.45+.55*smooth((elapsed-840)/170),
  bloom:flower*.18};
}
export function installBranchGrowth(nav){
 if(!nav?.addEventListener||nav.dataset.branchGrowthReady)return;
 nav.dataset.branchGrowthReady='true';
 const win=nav.ownerDocument.defaultView,reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let frame=0,started=0;
 function clear(){win.cancelAnimationFrame(frame);frame=0;nav.style.removeProperty('--margin-displayed-progress');nav.classList.remove('is-growing-vine');nav.style.removeProperty('--margin-growth-glow');nav.style.removeProperty('--margin-growth-bloom');for(const key of ['wake','flower','flower-scale'])nav.style.removeProperty('--margin-growth-'+key);}
 function tick(now){const elapsed=now-started;if(elapsed>=1320||reduced?.matches){clear();return;}
  nav.style.setProperty('--margin-displayed-progress',String(growthFraction(elapsed,nav.style.getPropertyValue('--margin-saved-progress'))));
  const detail=growthDetails(elapsed);
  nav.style.setProperty('--margin-growth-glow',String(detail.gold));
  nav.style.setProperty('--margin-growth-bloom',String(detail.bloom));
  nav.style.setProperty('--margin-growth-wake',String(detail.wake));
  nav.style.setProperty('--margin-growth-flower',String(detail.flower));
  nav.style.setProperty('--margin-growth-flower-scale',String(detail.flowerScale));
  frame=win.requestAnimationFrame(tick);
 }
 function celebrate(){clear();if(reduced?.matches)return;started=win.performance.now();nav.classList.add('is-growing-vine');tick(started);}
 const doc=nav.ownerDocument;
 doc.addEventListener('click',event=>{if(event.target.closest?.('.reading-end button[data-section="word-title"]'))celebrate();});
 for(const name of ['hashchange','pagehide','pageshow'])win.addEventListener(name,clear);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)clear();});
 const surface=doc.getElementById?.('word-content');
 if(surface&&win.MutationObserver)new win.MutationObserver(clear).observe(surface,{childList:true});
 if(doc.createElement){for(const name of ['upper','lower','bloom','upper-wake','lower-wake','flower']){const el=doc.createElement('span');el.className=`margin-growth-${name}`;if(name.endsWith('-wake'))el.className+=` margin-growth-${name.split('-')[0]}`;el.setAttribute('aria-hidden','true');nav.append(el);}}
 reduced?.addEventListener?.('change',()=>{if(reduced.matches)clear();});
 return {celebrate,clear};
}
