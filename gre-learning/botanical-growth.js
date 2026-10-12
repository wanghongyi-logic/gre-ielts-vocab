// A temporary painted celebration; stored progress and counts are never written.
export function growthFraction(elapsed,actual){
 const real=Math.max(0,Math.min(1,Number(actual)||0));
 if(elapsed<880){const t=Math.max(0,elapsed/880);return t*t*(3-2*t);}
 if(elapsed<1040)return 1;
 const t=Math.min(1,(elapsed-1040)/280),ease=t*t*(3-2*t);return 1+(real-1)*ease;
}
export function installBranchGrowth(nav){
 if(!nav?.addEventListener||nav.dataset.branchGrowthReady)return;
 nav.dataset.branchGrowthReady='true';
 const win=nav.ownerDocument.defaultView,reduced=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let frame=0,started=0;
 function clear(){win.cancelAnimationFrame(frame);frame=0;nav.style.removeProperty('--margin-displayed-progress');nav.classList.remove('is-growing-vine');nav.style.removeProperty('--margin-growth-glow');nav.style.removeProperty('--margin-growth-bloom');}
 function tick(now){const elapsed=now-started;if(elapsed>=1320||reduced?.matches){clear();return;}
  nav.style.setProperty('--margin-displayed-progress',String(growthFraction(elapsed,nav.style.getPropertyValue('--margin-saved-progress'))));
  nav.style.setProperty('--margin-growth-glow',elapsed<880?'.38':'0');
  const bloom=Math.max(0,1-Math.abs(elapsed-920)/150)*.28;nav.style.setProperty('--margin-growth-bloom',String(bloom));
  frame=win.requestAnimationFrame(tick);
 }
 function celebrate(){clear();if(reduced?.matches)return;started=win.performance.now();nav.classList.add('is-growing-vine');tick(started);}
 const doc=nav.ownerDocument;
 doc.addEventListener('click',event=>{if(event.target.closest?.('.reading-end button[data-section="word-title"]'))celebrate();});
 win.addEventListener('hashchange',clear);
 const surface=doc.getElementById?.('word-content');
 if(surface&&win.MutationObserver)new win.MutationObserver(clear).observe(surface,{childList:true});
 if(doc.createElement){for(const name of ['upper','lower','bloom']){const el=doc.createElement('span');el.className=`margin-growth-${name}`;el.setAttribute('aria-hidden','true');nav.append(el);}}
 reduced?.addEventListener?.('change',()=>{if(reduced.matches)clear();});
 return {celebrate,clear};
}
