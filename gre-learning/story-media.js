const hasDisplayLines = stage => Array.isArray(stage?.displayLines)&&stage.displayLines.length>=1&&stage.displayLines.length<=2&&stage.displayLines.every(line=>typeof line==='string'&&line.length>0&&!/[\r\n]/.test(line));
const displayText = stage => hasDisplayLines(stage)?stage.displayLines.join('\n'):stage.text;
// Playback is presentation only; the semantic poster remains the accessible image.
// A page is prepared paused, revealed with a decoded first frame, then activated.
export function installStoryMedia(surface,{picker,window:win=window,document:doc=document}={}) {
 let video=null,figure=null,observer=null,media=null,frame=null,activationFrame=null,prepareCancel=null;
 let presented=false,presentationRequest=null,presentationTarget=null,presentationPaint=null,revealing=false;
 let presentationEpoch=0;
 let generation=0,playAttempt=0,pendingPlay=null,visible=true,turning=false,activated=false,ready=false,failed=false,blocked=false,firstPass=true,lastTime=0;
 const preference=win.matchMedia('(prefers-reduced-motion: reduce)'),connection=win.navigator?.connection;
 const staticMode=()=>preference.matches||Boolean(connection?.saveData);
 const mayPlay=()=>Boolean(video&&ready&&activated&&(!turning||revealing)&&!failed&&!blocked&&visible&&!doc.hidden&&!picker?.open&&!staticMode());
 function stopFrame(){if(frame!==null)win.cancelAnimationFrame(frame);frame=null;}
 function dialogue(time,poster=false){
  const bubble=figure?.querySelector('[data-story-dialogue]');
  const stage=poster?media?.posterDialogue:media?.stages?.find(item=>time>=item.startMs&&time<item.endMs)||media?.stages?.at(-1);
  const overlay=figure?.matches('[data-courteous-original-overlay="2819"]')?figure.querySelector('[data-courteous-dialogue]'):null;
  if(overlay&&stage?.placement?.mode==='courteous-original-art-overlay'){
   const p=stage.placement,x=p.x*724,y=p.y*724,w=p.width*724,h=p.height*724;
   overlay.setAttribute('aria-label',stage.text);overlay.querySelector('[data-courteous-bubble]').setAttribute('visibility',stage.text?'visible':'hidden');
   const tail=overlay.querySelector('[data-courteous-tail]'),rect=overlay.querySelector('[data-courteous-rect]'),text=overlay.querySelector('[data-courteous-text]');
   tail.setAttribute('d',`M${x+w*.46} ${y+h} L${p.tailX*724} ${p.tailY*724} L${x+w*.57} ${y+h}`);
   for(const [k,v]of Object.entries({x,y,width:w,height:h}))rect.setAttribute(k,String(v));
   text.setAttribute('x',String(x+w/2));text.setAttribute('y',String(y+43));text.textContent=stage.text;return;
  }
  if(!bubble||!stage)return;
  const text=displayText(stage);if(bubble.textContent!==text)bubble.textContent=text;
  if(hasDisplayLines(stage))bubble.setAttribute('data-story-display-lines','true');else if(bubble.hasAttribute('data-story-display-lines'))bubble.removeAttribute('data-story-display-lines');
  bubble.className='story-dialogue speaker-'+stage.speaker;bubble.style.setProperty('--dialogue-x',String(stage.anchor.x));
 }
 function waitForFrame(){return Boolean(media?.waitForPresentedFrame&&media?.resetTransition?.type==='none');}
 function cancelPresentation(){
  presentationEpoch++;
  if(presentationRequest!==null)presentationTarget?.cancelVideoFrameCallback?.(presentationRequest);
  if(presentationPaint!==null)win.cancelAnimationFrame(presentationPaint);
  presentationRequest=null;presentationTarget=null;presentationPaint=null;
 }
 function requestPresentation(){
  if(presented||presentationRequest!==null||presentationPaint!==null||typeof video?.requestVideoFrameCallback!=='function')return;
  const token=generation,epoch=presentationEpoch,target=video;presentationTarget=target;
  presentationRequest=target.requestVideoFrameCallback((_now,details)=>{
   if(token!==generation||epoch!==presentationEpoch||target!==video)return;
   presentationRequest=null;presentationTarget=null;
   if(!(details?.presentedFrames>0)){requestPresentation();return;}
   presentationPaint=win.requestAnimationFrame(()=>{
    if(token!==generation||epoch!==presentationEpoch||target!==video)return;presentationPaint=null;
    presented=true;if(mayPlay()&&!target.paused)paintFrame();
   });
  });
 }
 // Hiding the reading tree can retire an iOS video compositor surface without
 // changing readyState. Its old presentation callback is not proof of a new paint.
 function retainPresentation(){
  cancelPresentation();presented=false;
  const poster=figure?.querySelector('.story-poster');
  poster?.style.setProperty('opacity','1');poster?.style.removeProperty('clip-path');
 }
 function prepareReveal(){
  if(!video||failed||blocked||staticMode()||(presented&&!video.paused))return Promise.resolve();
  // The destination's poster was decoded before adoption. Put that existing
  // image above the retired video surface and turn immediately; playback warms
  // underneath it. A fresh presented frame, never a timer, owns the handoff.
  const poster=figure?.querySelector('.story-poster');
  poster?.style.setProperty('opacity','1');poster?.style.setProperty('z-index','1');
  revealing=true;video.style.opacity='1';figure?.classList.add('is-playing');
  sync();return Promise.resolve();
 }
 function posterSource(staticFallback=false){
  if(!media?.staticPosterURL)return;
  const image=figure?.querySelector('.story-poster'),src=staticFallback?media.staticPosterURL:media.posterURL;
  if(image&&image.getAttribute('src')!==src)image.setAttribute('src',src);
 }
 function prepareStaticPoster(){
  if(media?.staticPosterURL&&(staticMode()||failed||blocked)){showPoster();return true;}return false;
 }
 function showPoster(){
  if(waitForFrame())figure?.querySelector('.story-poster')?.style.removeProperty('clip-path');
  posterSource(true);stopFrame();figure?.classList.remove('is-playing');
  if(video)video.style.opacity='0';
  figure?.querySelector('.story-poster')?.style.removeProperty('opacity');dialogue(0,true);
 }
 function paintFrame(){
  if(!video)return;
  posterSource(false);
  if(!presented&&typeof video.requestVideoFrameCallback==='function'){
   video.style.opacity='1';figure?.classList.add('is-playing');
   figure?.querySelector('.story-poster')?.style.setProperty('opacity','1');return;
  }
  const time=video.currentTime*1000,duration=Number.isFinite(video.duration)?video.duration*1000:media?.durationMs;
  if(time+150<lastTime)firstPass=false;
  lastTime=time;
  const out=media?.resetTransition?.fadeOutMs||240,into=media?.resetTransition?.fadeInMs||160;
  // Retain authored loop resets, but never fade a newly entered page from blank.
  const opacity=media?.resetTransition?.type==='none'?1:Math.max(0,Math.min(1,firstPass?1:time/into,(duration-time)/out));
  figure?.classList.add('is-playing');video.style.opacity=String(Number.isFinite(opacity)?opacity:1);
  const underlay=typeof video.requestVideoFrameCallback!=='function',poster=figure?.querySelector('.story-poster');
  poster?.style.setProperty('opacity',underlay?'1':'0');poster?.style.removeProperty('z-index');
  if(waitForFrame()){if(underlay)poster?.style.setProperty('clip-path','inset(5% 0 4%)');else poster?.style.removeProperty('clip-path');}dialogue(time);
 }
 function frameTick(){
  frame=null;if(!mayPlay()||video.paused)return;
  paintFrame();frame=win.requestAnimationFrame(frameTick);
 }
 function sync(){
  if(!video)return;
  if(failed||blocked||staticMode()){playAttempt++;pendingPlay=null;video.pause();showPoster();return;}
  if(!mayPlay()){playAttempt++;pendingPlay=null;video.pause();stopFrame();if(picker?.open||doc.hidden)retainPresentation();return;}
  requestPresentation();
  // Closing the dialog, intersection updates and turn completion can all sync
  // one navigation. None is a new playback intent or a reason to call play twice.
  if(pendingPlay!==null)return;
  if(!video.paused){if(frame===null)frame=win.requestAnimationFrame(frameTick);return;}
  const attempt=++playAttempt;pendingPlay=attempt;
  const token=generation,target=video;
  posterSource(false);target.muted=true;
  target.play().then(()=>{
   if(pendingPlay===attempt)pendingPlay=null;
   if(token!==generation||target!==video){target.pause();return;}
   if(attempt!==playAttempt)return;
   if(!mayPlay()){target.pause();return;}
   stopFrame();paintFrame();frame=win.requestAnimationFrame(frameTick);
  }).catch(()=>{
   if(pendingPlay===attempt)pendingPlay=null;
   if(token!==generation||target!==video||attempt!==playAttempt)return;
   // A visibility/turn pause can reject an in-flight play without autoplay denial.
   if(!mayPlay())return;
   blocked=true;cancelPresentation();target.pause();showPoster();
  });
 }
 function cancel(){
  generation++;playAttempt++;pendingPlay=null;activated=false;ready=false;presented=false;revealing=false;cancelPresentation();
  observer?.disconnect();observer=null;stopFrame();
  if(activationFrame!==null)win.cancelAnimationFrame(activationFrame);activationFrame=null;
  prepareCancel?.();prepareCancel=null;video?.pause();video=null;figure=null;media=null;
 }
 async function refresh(nextMedia,{root=surface}={}){
  cancel();media=nextMedia;failed=false;blocked=false;firstPass=true;lastTime=0;visible=true;
  video=root.querySelector('[data-story-video]');if(!video)return false;
  const target=video,token=generation;
  figure=target.closest('.story-illustration');posterSource(false);target.autoplay=false;target.removeAttribute('autoplay');target.muted=true;target.pause();
  target.addEventListener('error',()=>{if(token!==generation||target!==video)return;failed=true;target.pause();showPoster();});
  const decoded=await new Promise(resolve=>{
   let done=false,timer=null;
   const finish=(ok,terminal=true)=>{
    if(terminal){win.clearTimeout(timer);for(const type of ['loadeddata','seeked','canplay'])target.removeEventListener(type,check);target.removeEventListener('error',error);if(prepareCancel===abort)prepareCancel=null;}
    if(done){if(ok&&token===generation&&target===video){ready=true;failed=false;sync();}return;}
    done=true;resolve(ok);
   };
   const abort=()=>finish(false),error=()=>finish(false);
   function check(){
    if(token!==generation||target!==video){finish(false);return;}
    if(target.readyState<2||target.seeking)return;
    if(target.currentTime>.001){try{target.currentTime=0;}catch{finish(false);}return;}
    finish(true);
   }
   prepareCancel=abort;
   for(const type of ['loadeddata','seeked','canplay'])target.addEventListener(type,check);
   target.addEventListener('error',error);
   timer=win.setTimeout(()=>finish(false,false),5000);
   try{target.currentTime=0;target.preload='auto';target.load();check();}catch{finish(false);}
  });
  if(token!==generation||target!==video)return false;
  ready=decoded;failed=false; // A slow local decoder may still report loadeddata; timeout is not corruption.
  if(decoded&&activated&&!staticMode()){paintFrame();sync();}else if(!decoded||staticMode())showPoster();
  return decoded;
 }
 function activate(){
  if(!video)return;
  const token=generation,target=video;
  if('IntersectionObserver' in win){
   observer?.disconnect();visible=false;observer=new win.IntersectionObserver(records=>{if(token!==generation||target!==video)return;visible=records.some(item=>item.isIntersecting);sync();},{threshold:.05});observer.observe(figure);
  }
  if(activationFrame!==null)win.cancelAnimationFrame(activationFrame);
  // The paused first frame gets one complete visible paint after the fold clears.
  activationFrame=win.requestAnimationFrame(()=>{activationFrame=win.requestAnimationFrame(()=>{
   activationFrame=null;if(token!==generation||target!==video)return;activated=true;sync();
  });});
 }
 function setTurning(value,{preservePresentation=false}={}){
  const resumeVisibleTurn=turning&&!value&&preservePresentation;turning=Boolean(value);
  if(turning&&!preservePresentation)retainPresentation();else revealing=false;
  // The outgoing impression must retain its exact visible frame. On rollback,
  // however, opacity hiding may have retired WebKit's video surface: cover it
  // with the existing decoded poster until a fresh frame is presented.
  if(resumeVisibleTurn){retainPresentation();prepareReveal();}
  sync();
 }
 const visibility=()=>sync();doc.addEventListener('visibilitychange',visibility);preference.addEventListener('change',visibility);connection?.addEventListener?.('change',visibility);picker?.addEventListener('close',visibility);
 return {refresh,activate,setTurning,cancel,sync,prepareReveal,prepareStaticPoster,updateMedia(next){media={...media,...next};if(staticMode()||failed||blocked)showPoster();else if(video&&ready&&!video.paused)paintFrame();},destroy(){cancel();doc.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',visibility);connection?.removeEventListener?.('change',visibility);picker?.removeEventListener('close',visibility);}};
}

