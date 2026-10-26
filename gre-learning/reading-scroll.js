// Keep the viewport contract shared with tablet-landscape.css. The DOM stays
// intact when rotating; only the owner of vertical reading movement changes.
export const TABLET_LEARNING_QUERY='(min-width: 600px) and (min-height: 280px) and (orientation: landscape)';

export function installReadingScroll({surface,window:win=window,document:doc=document}) {
 const query=win.matchMedia?.(TABLET_LEARNING_QUERY);
 let landscape=Boolean(query?.matches);
 const listeners=new Set(),layoutListeners=new Set();
 const root=()=>landscape?surface.querySelector('.reading-scroll'):null;
 function metrics(){
  const element=root();
  return element?{scrollY:element.scrollTop,height:element.clientHeight,scrollHeight:element.scrollHeight}:
   {scrollY:win.scrollY||0,height:win.innerHeight||0,scrollHeight:doc.documentElement.scrollHeight};
 }
 function top(element){
  const container=root();
  if(container){
   // The headword belongs to the fixed illustration leaf, not the scroll leaf.
   if(!container.contains(element))return 0;
   return element.getBoundingClientRect().top-container.getBoundingClientRect().top+container.scrollTop;
  }
  return element.getBoundingClientRect().top+(win.scrollY||0);
 }
 function to(value,{behavior='instant',left=0}={}){
  const position=metrics(),limit=Math.max(0,position.scrollHeight-position.height);
  const options={top:Math.max(0,Math.min(Number.isFinite(value)?value:0,limit)),left,behavior};
  const container=root();
  if(container)container.scrollTo(options);else win.scrollTo(options);
 }
 function intoView(element,{behavior='instant'}={}){
  const margin=parseFloat(win.getComputedStyle?.(element)?.scrollMarginTop)||0;
  to(top(element)-margin,{behavior});
 }
 function scrolled(event){
  // CSS applies its new layout before matchMedia dispatches change. Do not let
  // the old window's resulting scroll-to-zero overwrite the last reading spot.
  if(query&&query.matches!==landscape)return;
  const container=root();
  if(container?event.target!==container:event.currentTarget!==win)return;
  for(const listener of listeners)listener(event);
 }
 function changed(){
  const previous=landscape;landscape=Boolean(query?.matches);
  if(previous===landscape)return;
  for(const listener of layoutListeners)listener({landscape,previous});
 }
 win.addEventListener('scroll',scrolled,{passive:true});
 // scroll does not bubble; capture also works when a prepared page is adopted.
 surface.addEventListener('scroll',scrolled,{passive:true,capture:true});
 query?.addEventListener?.('change',changed);
 return {metrics,top,to,intoView,get root(){return root();},get landscape(){return landscape;},
  onScroll(listener){listeners.add(listener);return()=>listeners.delete(listener);},
  onLayout(listener){layoutListeners.add(listener);return()=>layoutListeners.delete(listener);},
  destroy(){win.removeEventListener('scroll',scrolled);surface.removeEventListener('scroll',scrolled,true);query?.removeEventListener?.('change',changed);listeners.clear();layoutListeners.clear();}};
}
