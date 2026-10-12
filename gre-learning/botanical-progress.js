// Both raster segments derive their clip from this one global animated fraction.
// Actual saved progress stays separate from the transient painted front.
const fraction=value=>Math.max(0,Math.min(1,Number(value)||0));
export function installSavedProgress(nav,settings){
 const doc=nav.ownerDocument,win=doc.defaultView,reduced=win?.matchMedia?.('(prefers-reduced-motion: reduce)');
 let current=0,target=0,known=false,motion=null,frame=0;
 const now=()=>win?.performance?.now?.()??Date.now();
 const paint=value=>{current=value;nav.style.setProperty('--margin-progress-front',String(value));};
 function sample(time){if(!motion)return current;const t=Math.max(0,Math.min(1,(time-motion.start)/400)),ease=t*t*(3-2*t);return motion.from+(target-motion.from)*ease;}
 function stop(){if(frame)win?.cancelAnimationFrame?.(frame);frame=0;motion=null;}
 function settle(){stop();paint(target);if(settings?.dataset)settings.dataset.progressMotion='restore';}
 function tick(time){const value=sample(time);paint(value);if(!motion||time-motion.start>=400){stop();paint(target);return;}frame=win.requestAnimationFrame(tick);}
 function update(value,{animate=false,ready=true}={}){
  const next=fraction(value),time=now(),from=sample(time);
  nav.style.setProperty('--margin-saved-progress',String(next));
  if(next===target&&motion&&animate)return;
  const canAnimate=known&&ready&&animate&&!reduced?.matches&&!doc.hidden&&typeof win?.requestAnimationFrame==='function';
  stop();target=next;known=known||ready;
  if(!canAnimate||Math.abs(next-from)<.000001){paint(next);return;}
  paint(from);motion={from,start:time};frame=win.requestAnimationFrame(tick);
 }
 for(const name of ['pagehide','pageshow'])win?.addEventListener?.(name,settle);
 doc.addEventListener?.('visibilitychange',()=>{if(doc.hidden)settle();});
 reduced?.addEventListener?.('change',()=>{if(reduced.matches)settle();});
 return {update,settle};
}
