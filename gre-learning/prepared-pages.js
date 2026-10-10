import {renderWordPage} from './view.js';
import {neighboringNumbers} from './model.js';
import {installStoryMedia} from './story-media.js';

// Only the current page and its two approved neighbours retain decoded media.
// Preparation never mutates the active reading surface or starts playback.
export function installPreparedPages({loader,entries,picker,window:win=window,document:doc=document}) {
 const pages=new Map();let retained=new Set();
 function dispose(page){page.controller.abort();page.motion?.destroy();page.root?.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.load();});page.root?.remove();if(pages.get(page.number)===page)pages.delete(page.number);}
 function keep(number,activeNumber){
  const position=neighboringNumbers(entries,number);
  retained=new Set([number,activeNumber,position.previous,position.next].filter(Boolean));
  for(const page of pages.values())if(!retained.has(page.number))dispose(page);
  loader.retainMedia?.(retained);
 }
 function prepare(number,priority='high'){
  if(!entries.some(entry=>entry.number===number))return Promise.reject(new Error('Unapproved page'));
  if(pages.has(number))return pages.get(number).promise;
  const controller=new AbortController(),page={number,controller,ready:false,root:null,motion:null};pages.set(number,page);controller.signal.addEventListener('abort',()=>page.motion?.cancel(),{once:true});
  page.promise=(async()=>{
   const timer=win.setTimeout(()=>controller.abort(),8000);
   try{
    const loaded=await loader.pair(number,controller.signal,priority);
    if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
    const root=doc.createElement('div');root.className='prepared-page';
    root.innerHTML=renderWordPage(loaded.entry,loaded.media,{...neighboringNumbers(entries,number),total:entries.length});
    page.root=root;page.loaded=loaded;
    root.querySelectorAll('[id]').forEach(node=>{node.dataset.preparedId=node.id;node.id=`prepared-${number}-${node.id}`;});
    const poster=root.querySelector('.story-poster');
    if(!poster)throw new Error('Page poster missing');
    await Promise.race([poster.decode(),new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}))]);
    if(!poster.naturalWidth||controller.signal.aborted)throw new Error('Page poster unavailable');
    // The visible preparation is always the authored frame-zero poster. A video
    // decoder may fail without turning this real, verified page into a blank.
    page.motion=installStoryMedia(root,{picker,window:win,document:doc});
    await page.motion.refresh(loaded.media,{root});
    if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
    root.querySelectorAll('video').forEach(video=>{video.pause();video.style.opacity='0';});
    root.querySelectorAll('.story-poster').forEach(image=>image.style.opacity='1');
    root.querySelectorAll('.story-illustration').forEach(figure=>figure.classList.remove('is-playing'));
    const dialogue=root.querySelector('[data-story-dialogue]');const first=loaded.media?.posterDialogue;
    if(dialogue&&first){dialogue.textContent=first.text;dialogue.className='story-dialogue speaker-'+first.speaker;dialogue.style.setProperty('--dialogue-x',String(first.anchor.x));}
    page.ready=true;return page;
   }catch(error){if(pages.get(number)===page)dispose(page);throw error;}
   finally{win.clearTimeout(timer);loader.retainMedia?.(retained);}
  })();
  return page.promise;
 }
 function adjacent(number){keep(number);const position=neighboringNumbers(entries,number);for(const id of [position.next,position.previous].filter(Boolean))prepare(id,'low').catch(()=>{});}
 function get(number){const page=pages.get(number);return page?.ready?page:null;}
 function take(number){const page=get(number);if(page)pages.delete(number);return page;}
 return {prepare,get,take,adjacent,keep,destroy(){for(const page of [...pages.values()])dispose(page);}};
}
