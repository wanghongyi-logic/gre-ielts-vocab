// Playback is presentation only; the semantic poster remains the accessible image.
// A page is prepared paused, revealed with a decoded first frame, then activated.
export function installStoryMedia(surface,{picker,window:win=window,document:doc=document}={}) {
 let video=null,figure=null,observer=null,media=null,frame=null,activationFrame=null,prepareCancel=null;
 let generation=0,playAttempt=0,visible=true,turning=false,activated=false,ready=false,failed=false,blocked=false,firstPass=true,lastTime=0;
 const preference=win.matchMedia('(prefers-reduced-motion: reduce)'),connection=win.navigator?.connection;
 const staticMode=()=>preference.matches||Boolean(connection?.saveData);
 const mayPlay=()=>Boolean(video&&ready&&activated&&!turning&&!failed&&!blocked&&visible&&!doc.hidden&&!picker?.open&&!staticMode());
 function stopFrame(){if(frame!==null)win.cancelAnimationFrame(frame);frame=null;}
 function dialogue(time,poster=false){
  const bubble=figure?.querySelector('[data-story-dialogue]');
  const stage=poster?media?.posterDialogue:media?.stages?.find(item=>time>=item.startMs&&time<item.endMs)||media?.stages?.at(-1);
  if(!bubble||!stage)return;
  if(bubble.textContent!==stage.text)bubble.textContent=stage.text;
  bubble.className='story-dialogue speaker-'+stage.speaker;bubble.style.setProperty('--dialogue-x',String(stage.anchor.x));
 }
 function showPoster(){
  stopFrame();figure?.classList.remove('is-playing');
  if(video)video.style.opacity='0';
  figure?.querySelector('.story-poster')?.style.removeProperty('opacity');dialogue(0,true);
 }
 function paintFrame(){
  if(!video)return;
  const time=video.currentTime*1000,duration=Number.isFinite(video.duration)?video.duration*1000:media?.durationMs;
  if(time+150<lastTime)firstPass=false;
  lastTime=time;
  const out=media?.resetTransition?.fadeOutMs||240,into=media?.resetTransition?.fadeInMs||160;
  // Retain authored loop resets, but never fade a newly entered page from blank.
  const opacity=media?.resetTransition?.type==='none'?1:Math.max(0,Math.min(1,firstPass?1:time/into,(duration-time)/out));
  figure?.classList.add('is-playing');video.style.opacity=String(Number.isFinite(opacity)?opacity:1);
  figure?.querySelector('.story-poster')?.style.setProperty('opacity','0');dialogue(time);
 }
 function frameTick(){
  frame=null;if(!mayPlay()||video.paused)return;
  paintFrame();frame=win.requestAnimationFrame(frameTick);
 }
 function sync(){
  const attempt=++playAttempt;
  if(!video)return;
  if(failed||blocked||staticMode()){video.pause();showPoster();return;}
  if(!mayPlay()){video.pause();stopFrame();return;}
  const token=generation,target=video;
  target.muted=true;
  target.play().then(()=>{
   if(token!==generation||target!==video){target.pause();return;}
   if(attempt!==playAttempt)return;
   if(!mayPlay()){target.pause();return;}
   stopFrame();paintFrame();frame=win.requestAnimationFrame(frameTick);
  }).catch(()=>{
   if(token!==generation||target!==video||attempt!==playAttempt)return;
   // A visibility/turn pause can reject an in-flight play without autoplay denial.
   if(!mayPlay())return;
   blocked=true;target.pause();showPoster();
  });
 }
 function cancel(){
  generation++;playAttempt++;activated=false;ready=false;
  observer?.disconnect();observer=null;stopFrame();
  if(activationFrame!==null)win.cancelAnimationFrame(activationFrame);activationFrame=null;
  prepareCancel?.();prepareCancel=null;video?.pause();video=null;figure=null;media=null;
 }
 async function refresh(nextMedia,{root=surface}={}){
  cancel();media=nextMedia;failed=false;blocked=false;firstPass=true;lastTime=0;visible=true;
  video=root.querySelector('[data-story-video]');if(!video)return false;
  const target=video,token=generation;
  figure=target.closest('.story-illustration');target.autoplay=false;target.removeAttribute('autoplay');target.muted=true;target.pause();
  target.addEventListener('error',()=>{if(token!==generation||target!==video)return;failed=true;target.pause();showPoster();});
  const decoded=await new Promise(resolve=>{
   let done=false,timer=null;
   const finish=ok=>{if(done)return;done=true;win.clearTimeout(timer);for(const type of ['loadeddata','seeked','canplay'])target.removeEventListener(type,check);target.removeEventListener('error',error);if(prepareCancel===abort)prepareCancel=null;resolve(ok);};
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
   timer=win.setTimeout(()=>finish(false),5000);
   try{target.currentTime=0;target.preload='auto';target.load();check();}catch{finish(false);}
  });
  if(token!==generation||target!==video)return false;
  ready=decoded;failed=!decoded;
  if(decoded&&!staticMode())paintFrame();else showPoster();
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
 function setTurning(value){turning=Boolean(value);sync();}
 const visibility=()=>sync();doc.addEventListener('visibilitychange',visibility);preference.addEventListener('change',visibility);connection?.addEventListener?.('change',visibility);picker?.addEventListener('close',visibility);
 return {refresh,activate,setTurning,cancel,sync,destroy(){cancel();doc.removeEventListener('visibilitychange',visibility);preference.removeEventListener('change',visibility);connection?.removeEventListener?.('change',visibility);picker?.removeEventListener('close',visibility);}};
}
