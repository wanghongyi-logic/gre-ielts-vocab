import {motionArtwork} from './motion-artwork.js';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const descriptions = [
 ['abandon','工人正在把桥建到一半','工人主动放下工具离开，桥的缺口留着无人继续施工'],
 ['abase','两位成人起初平等站立','其中一人用自我贬低的话讨好对方并低身恳求：这是 abase oneself 的一个例子'],
 ['abash','讲解者自信地写出算式','错误被当众指出并改正，讲解者脸红、目光移开、话语停顿'],
 ['abate','暴雨和强风使树明显弯曲','雨势与风力逐渐减弱，但小雨和微风仍在继续'],
 ['abbreviate','同一个人使用完整称谓 Doctor Chen','称谓缩写成 Dr. Chen，所指的人和称谓含义不变']
];
export const motionExamples = Object.freeze(Object.fromEntries(descriptions.map(([word,before,after],index)=>[index+1,{word,before,after,summary:`${before}；${after}。`}])));
const defaults={x:0,y:0,sx:1,sy:1,rotate:0,ox:0,oy:0,opacity:1};
// All intermediate poses are rigid transforms of coherent objects. No interpolated limb paths.
export function motionState(frames,progress) {
  let left=frames[0],right=frames[frames.length-1];
  for(let i=1;i<frames.length;i++){if(progress<=frames[i].at){left=frames[i-1];right=frames[i];break;}}
  let t=Math.max(0,Math.min(1,(progress-left.at)/(right.at-left.at||1)));t=t*t*(3-2*t);
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
 return `<svg xmlns="http://www.w3.org/2000/svg" class="meaning-motion-scene" ${live?'data-motion-stage=""':''} data-phase="${phase}" viewBox="0 0 360 200" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${example.word} · ${live?'词义动画':phase==='before'?'变化前':'变化后'}</title><desc id="${id}-desc">${escape(live?example.summary:example[phase])}</desc>${artwork(number,id,phase==='after'?1:0)}</svg>`;
}
export function renderMeaningMotion(entry,visual) {
 const example=motionExamples[entry.number];if(!visual||!example||!motionArtwork[entry.number]||example.word!==entry.word)return '';
 return `<div class="meaning-motion" data-meaning-motion="${entry.number}"><div class="motion-live">${scene(entry.number,visual,'live','before',true)}</div><div class="motion-comparison"><figure><figcaption>变化前</figcaption>${scene(entry.number,visual,'before','before')}</figure><figure><figcaption>变化后</figcaption>${scene(entry.number,visual,'after','after')}</figure></div></div>`;
}
// One observed illustration, one RAF, no timers or control UI. Static comparisons remain
// readable under reduced motion; offscreen/background scenes consume no animation frames.
export function installMeaningMotion(surface,{window:win=window}={}) {
 let active=null,frame=null,elapsed=0,previous=null,visible=true,destroyed=false;
 const media=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const stop=()=>{if(frame!==null)win.cancelAnimationFrame(frame);frame=null;previous=null;};
 const canRun=()=>active&&!destroyed&&visible&&!win.document?.hidden&&!media?.matches;
 function paint(progress,time=elapsed){if(!active)return;for(const {element,frames,ambient,ambientElement} of active.layers){const state=motionState(frames,progress);element.setAttribute('transform',motionTransform(state));element.setAttribute('opacity',String(state.opacity));if(ambient&&ambientElement){const phase=((time/(ambient.period||1200))+(ambient.phase||0))%1;const motion=motionState(ambient.frames,phase);ambientElement.setAttribute('transform',motionTransform(motion));ambientElement.setAttribute('opacity',String(motion.opacity));}}}
 function tick(now){frame=null;if(!canRun())return;if(previous!==null)elapsed+=Math.min(now-previous,80);previous=now;
  // 0.6 s before, 6.2 s causal sequence, 1.1 s result. Ambient consequence motion continues.
  // Brief fade masks reset,
  // avoiding a misleading reverse action (e.g. a repealed treaty becoming valid).
  const cycle=elapsed%8400;const progress=Math.min(1,Math.max(0,(cycle-600)/6200));
  const opacity=cycle<7900?1:cycle<8150?1-(cycle-7900)/250:(cycle-8150)/250;
  paint(cycle>=8150?0:progress);active.stage.style.opacity=String(opacity);frame=win.requestAnimationFrame(tick);
 }
 function resume(){stop();if(canRun())frame=win.requestAnimationFrame(tick);}
 const observer=win.IntersectionObserver?new win.IntersectionObserver(entries=>{for(const entry of entries){if(entry.target===active?.root){visible=entry.isIntersecting;resume();}}},{threshold:0}):null;
 function cancel(){stop();observer?.disconnect();if(active){paint(0);active.stage.style.opacity='1';}active=null;elapsed=0;visible=true;}
 function refresh(){cancel();const root=surface.querySelector('[data-meaning-motion]');if(!root)return;const number=Number(root.dataset.meaningMotion),stage=root.querySelector('[data-motion-stage]');if(!motionArtwork[number]||!stage)return;active={root,stage,layers:[...stage.querySelectorAll('[data-motion-layer]')].map(element=>({element,frames:motionArtwork[number][Number(element.dataset.motionLayer)].frames||[{at:0},{at:1}],ambient:motionArtwork[number][Number(element.dataset.motionLayer)].ambient,ambientElement:element.querySelector('[data-motion-ambient]')}))};visible=!observer;observer?.observe(root);resume();}
 const visibility=()=>resume();const preference=()=>{elapsed=0;paint(0);if(active)active.stage.style.opacity='1';resume();};
 win.document?.addEventListener('visibilitychange',visibility);win.addEventListener('pagehide',stop);win.addEventListener('pageshow',resume);media?.addEventListener?.('change',preference);
 refresh();
 return {cancel,refresh,destroy(){cancel();destroyed=true;win.document?.removeEventListener('visibilitychange',visibility);win.removeEventListener('pagehide',stop);win.removeEventListener('pageshow',resume);media?.removeEventListener?.('change',preference);}};
}
