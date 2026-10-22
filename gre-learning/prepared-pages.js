import {waitForLocal} from './offline-async.js';
import {renderWordPage,renderArtwork} from './view.js';
import {neighboringNumbers} from './model.js';
import {installStoryMedia} from './story-media.js';

const hasDisplayLines = stage => Array.isArray(stage?.displayLines)&&stage.displayLines.length>=1&&stage.displayLines.length<=2&&stage.displayLines.every(line=>typeof line==='string'&&line.length>0&&!/[\r\n]/.test(line));
const displayText = stage => hasDisplayLines(stage)?stage.displayLines.join('\n'):stage.text;

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
    const loaded=await waitForLocal(()=>loader.pair(number,controller.signal,priority,{progressive:true}),{signal:controller.signal,timeoutMs:0});
    if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
    const root=doc.createElement('div');root.className='prepared-page';
    root.innerHTML=renderWordPage(loaded.entry,loaded.media,{...neighboringNumbers(entries,number),total:entries.length});
    page.root=root;page.loaded=loaded;
    root.querySelectorAll('[id]').forEach(node=>{node.dataset.preparedId=node.id;node.id=`prepared-${number}-${node.id}`;});
    if(loaded.mediaReady){
     // Text and a stable media slot are ready independently of local disk/video decoding.
     const article=root.querySelector('.reading-layout'),opening=root.querySelector('.opening-page');
     const motion=installStoryMedia(root,{picker,window:win,document:doc});let stage=0,staticPosterURL=null;
     page.motion={...motion,activate(){page.active=true;motion.activate();},destroy(){controller.abort();motion.destroy();}};
     function addRetry(host){
      const retry=doc.createElement('button');retry.type='button';retry.className='offline-video-hint';retry.textContent='重试动画';
      retry.onclick=async()=>{if(retry.disabled||controller.signal.aborted)return;retry.disabled=true;try{const next=await loader.pair(number,controller.signal,'high',{progressive:true});if(controller.signal.aborted)return;if(next.mediaReady){retry.remove();await attach(await next.mediaReady,2);}}catch{}finally{retry.disabled=false;}};
      host.appendChild(retry);
     }
     async function attach(media,rank){
      if(controller.signal.aborted)return;
      if(rank<stage){
       if(rank===1&&media?.posterURL){
        const figure=opening.querySelector('.story-illustration'),stack=figure?.querySelector('.story-media-stack');
        if(stack&&!figure.querySelector('.story-poster')){const image=doc.createElement('img');image.className='story-poster';image.src=media.posterURL;image.width=media.width;image.height=media.height;image.alt=media.alt||loaded.entry.coreImageZh;image.decoding='async';stack.insertBefore(image,stack.firstChild);}
        if(loaded.media)loaded.media={...loaded.media,posterURL:media.posterURL};motion.updateMedia({posterURL:media.posterURL});
       }
       return;
      }
      stage=rank;
      if(!media){
       opening.querySelector('.story-illustration')?.remove();article.classList.add('text-only-reading');loaded.media=null;
       if(rank===2)addRetry(opening);return;
      }
      if(staticPosterURL)media={...media,staticPosterURL};
      const holder=doc.createElement('div');holder.innerHTML=renderArtwork(loaded.entry,media);
      const figure=holder.firstElementChild;if(!figure)return;
      // Keep the article, text, IDs, scroll and reading-position ownership stable.
      opening.querySelector('.story-illustration')?.replaceWith(figure);
      if(!opening.querySelector('.story-illustration'))opening.appendChild(figure);
      article.classList.remove('text-only-reading');loaded.media=media;
      const ready=motion.refresh(media,{root:article});
      if(page.active)motion.activate();
      if(rank===2&&!media.videoURL)addRetry(figure);
      await ready;
     }
     page.mediaReady=Promise.resolve(loaded.mediaReady).then(media=>attach(media,2)).catch(()=>{});
     if(loaded.posterReady)Promise.resolve(loaded.posterReady).then(media=>attach(media,1)).catch(()=>{});
     if(loaded.staticPosterReady)Promise.resolve(loaded.staticPosterReady).then(url=>{if(controller.signal.aborted||!url)return;staticPosterURL=url;if(loaded.media)loaded.media={...loaded.media,staticPosterURL:url};motion.updateMedia({staticPosterURL:url});}).catch(()=>{});
     page.ready=true;return page;
    }
    const poster=root.querySelector('.story-poster');
    if(poster){
    await Promise.race([poster.decode().catch(()=>{}),new Promise((_,reject)=>controller.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}))]);
    if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');if(!poster.naturalWidth)poster.remove();
    }
    if(loaded.media?.staticPosterURL){
     const fallback=doc.createElement('img');fallback.src=loaded.media.staticPosterURL;await waitForLocal(()=>fallback.decode().catch(()=>{}),{signal:controller.signal,timeoutMs:0});
     if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');page.staticPosterImage=fallback;
    }
    // The visible preparation is always the authored frame-zero poster. A video
    // decoder may fail without turning this real, verified page into a blank.
    page.motion=installStoryMedia(root,{picker,window:win,document:doc});
    // A decoded authored poster is sufficient for a page turn. Warm video in
    // parallel; its controller keeps the poster until a frame is presented.
    const videoReady=page.motion.refresh(loaded.media,{root}).catch(()=>false);
    const mediaReady=root.querySelector('.story-poster')?true:await videoReady;
    if(!mediaReady&&!root.querySelector('.story-poster')){root.querySelector('.story-illustration')?.remove();root.querySelector('.reading-layout')?.classList.add('text-only-reading');}
    if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
    if(!page.motion.prepareStaticPoster()){
    root.querySelectorAll('video').forEach(video=>{video.pause();video.style.opacity='0';});
    root.querySelectorAll('.story-poster').forEach(image=>{image.style.opacity='1';if(loaded.media?.waitForPresentedFrame)image.style.removeProperty('clip-path');});
    root.querySelectorAll('.story-illustration').forEach(figure=>figure.classList.remove('is-playing'));
    const dialogue=root.querySelector('[data-story-dialogue]');const first=loaded.media?.staticPoster?loaded.media.stages?.[0]:loaded.media?.posterDialogue;
    if(dialogue&&first){dialogue.textContent=displayText(first);if(hasDisplayLines(first))dialogue.setAttribute('data-story-display-lines','true');else if(dialogue.hasAttribute('data-story-display-lines'))dialogue.removeAttribute('data-story-display-lines');dialogue.className='story-dialogue speaker-'+first.speaker;dialogue.style.setProperty('--dialogue-x',String(first.anchor.x));}
    }
    page.ready=true;return page;
   }catch(error){if(pages.get(number)===page)dispose(page);throw error;}
   finally{win.clearTimeout(timer);loader.retainMedia?.(retained);}
  })();
  return page.promise;
 }
 function adjacent(number){keep(number);loader.prefetchNextUnit?.(number);const position=neighboringNumbers(entries,number);for(const id of [position.next,position.previous].filter(Boolean))prepare(id,'low').catch(()=>{});}
 function get(number){const page=pages.get(number);return page?.ready?page:null;}
 function take(number){const page=get(number);if(page)pages.delete(number);return page;}
 return {prepare,get,take,adjacent,keep,discard(number){const page=pages.get(number);if(page)dispose(page);},destroy(){const retiring=[...pages.values()];for(const page of retiring)dispose(page);return Promise.allSettled(retiring.map(page=>page.promise));}};
}

