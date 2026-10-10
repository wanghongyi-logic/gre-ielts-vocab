// Playback is presentation only; the semantic poster remains the accessible image.
// Every URL passed here was byte-counted and SHA-256 verified by LessonLoader.
export function installStoryMedia(surface,{picker,window:win=window,document:doc=document}={}) {
 let video=null,figure=null,toggle=null,observer=null,visible=true,userPaused=false,mediaFailed=false,autoplayBlocked=false,frame=null,generation=0,playAttempt=0,media=null;
 const pausedByMedia=new Map();
 const connection=win.navigator?.connection;
 const preference=win.matchMedia('(prefers-reduced-motion: reduce)');
 const saveData=()=>Boolean(win.navigator?.connection?.saveData);
 const mayPlay=()=>Boolean(video&&!mediaFailed&&visible&&!doc.hidden&&!picker?.open&&!preference.matches&&!saveData()&&!userPaused);
 function stopFrame(){if(frame!==null){win.cancelAnimationFrame(frame);frame=null;}}
 function frameTick(){
  if(!video||video.paused){frame=null;return;}
  const duration=Number.isFinite(video.duration)?video.duration*1000:media?.durationMs;
  const time=video.currentTime*1000;
  const out=media?.resetTransition?.fadeOutMs||240,into=media?.resetTransition?.fadeInMs||160;
  const bubble=figure?.querySelector('[data-story-dialogue]');if(bubble&&media?.stages){const stage=media.stages.find(item=>time>=item.startMs&&time<item.endMs)||media.stages.at(-1);if(bubble.textContent!==stage.text)bubble.textContent=stage.text;bubble.className='story-dialogue speaker-'+stage.speaker;bubble.style.setProperty('--dialogue-x',String(stage.anchor.x));}
  const opacity=media?.resetTransition?.type==='none'?1:Math.max(0,Math.min(1,time/into,(duration-time)/out));
  // Fade the complete artwork plane to parchment at the explicit story reset.
  // The poster stays underneath except while video is actually playing.
  video.style.opacity=String(opacity);
  if(figure)figure.querySelector('.story-poster').style.opacity='0';
  frame=win.requestAnimationFrame(frameTick);
 }
 function showPoster(){
  stopFrame();
  figure?.classList.remove('is-playing');
  if(video)video.style.opacity='0';
  figure?.querySelector('.story-poster')?.style.removeProperty('opacity');
  const bubble=figure?.querySelector('[data-story-dialogue]');
  if(bubble&&media?.posterDialogue){const stage=media.posterDialogue;bubble.textContent=stage.text;bubble.style.setProperty('--dialogue-x',String(stage.anchor.x));bubble.className='story-dialogue speaker-'+stage.speaker;}
 }
 function sync(){
  const attempt=++playAttempt;
  if(!video)return;
  toggle?.setAttribute('aria-pressed',String(userPaused||preference.matches||saveData()));
  toggle?.setAttribute('aria-label',userPaused?'播放插画动画':'暂停插画动画');
  if(toggle)toggle.hidden=preference.matches||saveData()||mediaFailed;
  if(mediaFailed||(autoplayBlocked&&userPaused)){video.pause();showPoster();return;}
  if(mayPlay()){
   const token=generation,target=video;
   target.muted=true;target.play().then(()=>{if(token!==generation){if(target!==video)target.pause();return;}if(attempt!==playAttempt)return;if(!mayPlay()){target.pause();return;}figure?.classList.add('is-playing');stopFrame();frame=win.requestAnimationFrame(frameTick);}).catch(()=>{if(token===generation&&attempt===playAttempt&&mayPlay()){autoplayBlocked=true;userPaused=true;target.pause();showPoster();stopFrame();toggle?.setAttribute('aria-pressed','true');toggle?.setAttribute('aria-label','播放插画动画');}});
  }else{
   video.pause();stopFrame();if(userPaused&&video.readyState>=2){figure?.classList.add('is-playing');video.style.opacity='1';}
   if(preference.matches||saveData())showPoster();
  }
 }
 function cancel(){generation++;playAttempt++;observer?.disconnect();observer=null;stopFrame();video?.pause();video=null;figure=null;toggle=null;media=null;}
 function refresh(nextMedia){
  cancel();mediaFailed=false;autoplayBlocked=false;media=nextMedia;video=surface.querySelector('[data-story-video]');if(!video)return;
  figure=video.closest('.story-illustration');toggle=figure.querySelector('[data-motion-toggle]');userPaused=pausedByMedia.get(media?.video?.sha256||media?.videoURL)||false;visible=true;
  const ownGeneration=generation;
  toggle?.addEventListener('click',()=>{if(ownGeneration!==generation)return;userPaused=!userPaused;if(!userPaused)autoplayBlocked=false;pausedByMedia.set(media?.video?.sha256||media?.videoURL,userPaused);sync();});
  video.addEventListener('error',()=>{if(ownGeneration!==generation)return;mediaFailed=true;userPaused=true;video.pause();showPoster();if(toggle)toggle.hidden=true;stopFrame();});
  if('IntersectionObserver' in win){observer=new win.IntersectionObserver(records=>{if(ownGeneration!==generation)return;visible=records.some(item=>item.isIntersecting);sync();},{threshold:.05});observer.observe(figure);}
  sync();
 }
 const visibility=()=>sync();doc.addEventListener('visibilitychange',visibility);preference.addEventListener('change',visibility);connection?.addEventListener?.('change',visibility);picker?.addEventListener('close',visibility);
 return {refresh,cancel,sync,destroy(){cancel();doc.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',visibility);connection?.removeEventListener?.('change',visibility);picker?.removeEventListener('close',visibility);}};
}
