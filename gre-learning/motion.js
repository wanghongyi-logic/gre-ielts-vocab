import {validateTrackedArt,renderTrackedArtwork,collectTrackedStage,paintTrackedStage} from './motion-tracks.js';
// Only the selected, integrity-checked inert scene is retained by the renderer.
const motionArtwork=Object.create(null);
const motionExamples=Object.create(null);
const trackedArtwork=Object.create(null);
export function setMotionLesson(art){for(const map of [motionArtwork,motionExamples,trackedArtwork])for(const key of Object.keys(map))delete map[key];if(art){if(art.schema===2){validateTrackedArt(art);trackedArtwork[art.number]=art;}else motionArtwork[art.number]=art.layers;motionExamples[art.number]=art.example;}}
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export {motionExamples};
const defaults={x:0,y:0,sx:1,sy:1,rotate:0,ox:0,oy:0,opacity:1};
// All intermediate poses are rigid transforms of coherent objects. No interpolated limb paths.
export function motionState(frames,progress) {
  let left=frames[0],right=frames[frames.length-1];
  for(let i=1;i<frames.length;i++){if(progress<=frames[i].at){left=frames[i-1];right=frames[i];break;}}
  let t=Math.max(0,Math.min(1,(progress-left.at)/(right.at-left.at||1)));t=right.easing==='quadratic-in'?t*t:t*t*(3-2*t);
  if(right.step===true)t=progress<right.at?0:1;
  return Object.fromEntries(Object.entries(defaults).map(([key,value])=>[key,(left[key]??value)+((right[key]??value)-(left[key]??value))*t]));
}
export function motionTransform(state) {return `translate(${state.x} ${state.y}) translate(${state.ox} ${state.oy}) rotate(${state.rotate}) scale(${state.sx} ${state.sy}) translate(${-state.ox} ${-state.oy})`;}
function artwork(number,id,progress) {
 return motionArtwork[number].map((layer,index)=>{
   const markup=layer.markup
     .replace(/\bid="([^"]+)"/g,(_,name)=>`id="${id}-${name}"`)
     .replace(/url\(#([^\)]+)\)/g,(_,name)=>`url(#${id}-${name})`)
     .replace(/(href|xlink:href)="#([^"]+)"/g,(_,attribute,name)=>`${attribute}="#${id}-${name}"`);
   if(!layer.frames&&!layer.ambient)return markup;
   const state=motionState(layer.frames||[{at:0},{at:1}],progress);
   const ambient=layer.ambient?motionState(layer.ambient.frames,layer.ambient.phase||0):null;
   const inner=ambient?`<g data-motion-ambient="" transform="${motionTransform(ambient)}" opacity="${ambient.opacity}">${markup}</g>`:markup;
   return `<g data-motion-layer="${index}" data-motion-role="${layer.role}" transform="${motionTransform(state)}" opacity="${state.opacity}">${inner}</g>`;
 }).join('');
}
function scene(number,visual,suffix,phase,live=false) {
 const example=motionExamples[number],id=`meaning-${number}-${suffix}`;
 const tracked=trackedArtwork[number];
 if(tracked){const time=live?0:phase==='after'?tracked.reducedTimeMs:tracked.beforeTimeMs;return `<svg xmlns="http://www.w3.org/2000/svg" class="meaning-motion-scene" ${live?'data-motion-stage=""':''} data-phase="${phase}" viewBox="${tracked.viewBox.join(' ')}" style="aspect-ratio:${tracked.viewBox[2]} / ${tracked.viewBox[3]};fill:#000;stroke:none" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${example.word} · ${live?'词义动画':phase==='before'?'变化前':'变化后'}</title><desc id="${id}-desc">${escape(live?example.summary:example[phase])}</desc>${renderTrackedArtwork(tracked,id,time)}</svg>`;}
 return `<svg xmlns="http://www.w3.org/2000/svg" class="meaning-motion-scene" ${live?'data-motion-stage=""':''} data-phase="${phase}" viewBox="0 0 360 248" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${example.word} · ${live?'词义动画':phase==='before'?'变化前':'变化后'}</title><desc id="${id}-desc">${escape(live?example.summary:example[phase])}</desc>${artwork(number,id,phase==='after'?1:0)}<g class="motion-ending-word" ${live?'data-motion-ending-word=""':''} opacity="${phase==='after'?1:0}" aria-hidden="true"><rect x="0" y="200" width="360" height="48" fill="#f6f5ef"/><text x="180" y="233" text-anchor="middle" style="font-family:Georgia,serif;font-size:29px;font-weight:600;fill:#173d36;stroke:none">${escape(example.word)}</text></g></svg>`;
}
export function renderMeaningMotion(entry,visual,{reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false}={}) {
 const example=motionExamples[entry.number];if(!visual||!example||(!motionArtwork[entry.number]&&!trackedArtwork[entry.number])||example.word!==entry.word)return '';
 return `<div class="meaning-motion" data-meaning-motion="${entry.number}">${reduced?`<div class="motion-comparison"><figure><figcaption>变化前</figcaption>${scene(entry.number,visual,'before','before')}</figure><figure><figcaption>变化后</figcaption>${scene(entry.number,visual,'after','after')}</figure></div>`:`<div class="motion-live">${scene(entry.number,visual,'live','before',true)}</div>`}</div>`;
}
// Preserve the full cause/action/result, then reveal the English word in a dedicated footer.
export function motionTimeline(elapsed) {
 const cycle=((elapsed%10100)+10100)%10100;
 const reset=cycle>=9850;
 const progress=reset?0:Math.min(1,Math.max(0,(cycle-600)/6200));
 const stageOpacity=cycle<9600?1:cycle<9850?1-(cycle-9600)/250:(cycle-9850)/250;
 const wordOpacity=cycle<7000||reset?0:Math.min(1,(cycle-7000)/300);
 return {cycle,progress,stageOpacity,wordOpacity};
}
// One observed illustration, one RAF, no timers or control UI. Static comparisons remain
// readable under reduced motion; offscreen/background scenes consume no animation frames.
export function installMeaningMotion(surface,{window:win=window}={}) {
 let active=null,frame=null,elapsed=0,previous=null,visible=true,destroyed=false;
 const media=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const stop=()=>{if(frame!==null)win.cancelAnimationFrame(frame);frame=null;previous=null;};
 const canRun=()=>active&&!destroyed&&visible&&!win.document?.hidden&&!media?.matches;
 function paint(progress,time=elapsed){if(!active)return;if(active.tracked){paintTrackedStage(active.targets,((time%active.tracked.durationMs)+active.tracked.durationMs)%active.tracked.durationMs);return;}for(const {element,frames,ambient,ambientElement} of active.layers){const state=motionState(frames,progress);element.setAttribute('transform',motionTransform(state));element.setAttribute('opacity',String(state.opacity));if(ambient&&ambientElement){const phase=((time/(ambient.period||1200))+(ambient.phase||0))%1;const motion=motionState(ambient.frames,phase);ambientElement.setAttribute('transform',motionTransform(motion));ambientElement.setAttribute('opacity',String(motion.opacity));}}}
 function tick(now){frame=null;if(!canRun())return;if(previous!==null)elapsed+=Math.min(now-previous,80);previous=now;
  // 0.6 s before, 6.2 s action, 0.2 s settled result, 0.3 s word reveal, 2.3 s word hold.
  // Brief fade masks reset,
  // avoiding a misleading reverse action (e.g. a repealed treaty becoming valid).
  if(active.tracked){paint(0);frame=win.requestAnimationFrame(tick);return;}
  const timeline=motionTimeline(elapsed);
  paint(timeline.progress);active.stage.style.opacity=String(timeline.stageOpacity);if(active.ending)active.ending.setAttribute('opacity',String(timeline.wordOpacity));frame=win.requestAnimationFrame(tick);
 }
 function resume(){stop();if(canRun())frame=win.requestAnimationFrame(tick);}
 const observer=win.IntersectionObserver?new win.IntersectionObserver(entries=>{for(const entry of entries){if(entry.target===active?.root){visible=entry.isIntersecting;resume();}}},{threshold:0}):null;
 function cancel(){stop();observer?.disconnect();if(active){paint(0,0);active.stage.style.opacity='1';active.ending?.setAttribute('opacity','0');}active=null;elapsed=0;visible=true;}
 function refresh(){cancel();const root=surface.querySelector('[data-meaning-motion]');if(!root)return;const number=Number(root.dataset.meaningMotion),stage=root.querySelector('[data-motion-stage]');if((!motionArtwork[number]&&!trackedArtwork[number])||!stage)return;if(trackedArtwork[number]){active={root,stage,tracked:trackedArtwork[number],targets:collectTrackedStage(stage,trackedArtwork[number])};visible=!observer;observer?.observe(root);resume();return;}active={root,stage,ending:stage.querySelector('[data-motion-ending-word]'),layers:[...stage.querySelectorAll('[data-motion-layer]')].map(element=>({element,frames:motionArtwork[number][Number(element.dataset.motionLayer)].frames||[{at:0},{at:1}],ambient:motionArtwork[number][Number(element.dataset.motionLayer)].ambient,ambientElement:element.querySelector('[data-motion-ambient]')}))};visible=!observer;observer?.observe(root);resume();}
 const visibility=()=>resume();const preference=()=>{elapsed=0;paint(0);if(active){active.stage.style.opacity='1';active.ending?.setAttribute('opacity','0');}resume();};
 win.document?.addEventListener('visibilitychange',visibility);win.addEventListener('pagehide',stop);win.addEventListener('pageshow',resume);media?.addEventListener?.('change',preference);
 refresh();
 return {cancel,refresh,destroy(){cancel();destroyed=true;win.document?.removeEventListener('visibilitychange',visibility);win.removeEventListener('pagehide',stop);win.removeEventListener('pageshow',resume);media?.removeEventListener?.('change',preference);}};
}
