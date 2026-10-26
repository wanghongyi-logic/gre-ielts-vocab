(() => {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:' || location.hostname === 'app.local') return;
  const build = '204-offline3500-v64';
  const restoreKey='gre-update-position-v1';
  let registration,connecting,checking,inspecting,pendingBuild,applyTimer,retryTimer,hideTimer;
  let appReady=false,readingBlockedAt=null,recoveringReading=false,pendingController;
  let interaction=0,restoring=false,refreshing=false,lastCheck=-Infinity,lastInput=-Infinity,pointerDown=false,retryDelay=5000;
  const status=document.getElementById('update-status');
  const show=message=>{if(status){clearTimeout(hideTimer);status.textContent=message;status.hidden=false;}};
  const canReload=()=>{
    if(!appReady||document.visibilityState==='hidden'||pointerDown||Date.now()-lastInput<400||recoveringReading)return false;
    const detail={blocked:false,storageMutation:false,readingPreparation:false};window.dispatchEvent(new CustomEvent('gre-update-can-reload',{detail}));
    if(!detail.blocked){readingBlockedAt=null;return true;}
    if(detail.storageMutation||!detail.readingPreparation){readingBlockedAt=null;return false;}
    readingBlockedAt??=Date.now();
    if(Date.now()-readingBlockedAt>=12000&&pendingController===navigator.serviceWorker.controller){
      recoveringReading=true;const recovery={waits:[]};
      window.dispatchEvent(new CustomEvent('gre-update-recover-reading',{detail:recovery}));
      let timer;Promise.race([Promise.allSettled(recovery.waits),new Promise(resolve=>{timer=setTimeout(resolve,3000);})]).finally(()=>{clearTimeout(timer);recoveringReading=false;readingBlockedAt=Date.now();applyReady();});
    }
    return false;
  };
  function applyReady(){
    clearTimeout(applyTimer);
    if(!pendingBuild||refreshing||document.visibilityState==='hidden')return;
    if(!canReload()){applyTimer=setTimeout(applyReady,200);return;}
    const key=`vocab-update-reload-${pendingBuild}`;
    try{
      const raw=sessionStorage.getItem(key);let attempt;
      try{attempt=JSON.parse(raw);}catch{}
      if(raw==='1'||attempt===1){attempt={attempts:1,at:Date.now()};sessionStorage.setItem(key,JSON.stringify(attempt));}
      if(attempt?.attempts>=2){show('新版已就绪，请重新打开');return;}
      if(attempt?.attempts===1&&Date.now()-attempt.at<30000){applyTimer=setTimeout(applyReady,Math.max(200,30000-(Date.now()-attempt.at)));return;}
      const position={build:pendingBuild,hash:location.hash,x:window.scrollX,y:window.scrollY,at:Date.now()};
      window.dispatchEvent(new CustomEvent('gre-update-capture',{detail:position}));
      sessionStorage.setItem(restoreKey,JSON.stringify(position));
      sessionStorage.setItem(key,JSON.stringify({attempts:(attempt?.attempts||0)+1,at:Date.now()}));
    }catch{show('新版已就绪，请重新打开');return;}
    refreshing=true;show('新版已就绪，正在打开…');location.reload();
  }
  async function restorePosition(){
    if(restoring)return;
    let position;try{position=JSON.parse(sessionStorage.getItem(restoreKey));}catch{return;}
    if(!position)return;
    if(position.build!==build||position.hash!==location.hash||Date.now()-position.at>120000){try{sessionStorage.removeItem(restoreKey);}catch{}return;}
    restoring=true;const startingInteraction=interaction;
    const detail={position,waits:[]};window.dispatchEvent(new CustomEvent('gre-update-restore',{detail}));
    await Promise.allSettled(detail.waits);
    // The application and reopened drawers must be laid out before restoring scroll.
    // Do not jump back if the user has navigated or interacted while content loads.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(location.hash===position.hash&&interaction===startingInteraction)window.scrollTo({left:Number(position.x)||0,top:Number(position.y)||0,behavior:'instant'});
      try{sessionStorage.removeItem(restoreKey);}catch{}restoring=false;
    }));
  }
  function inspectController(){
    const controller=navigator.serviceWorker.controller;if(!controller||inspecting)return inspecting;
    inspecting=new Promise(resolve=>{
      const channel=new MessageChannel();let done=false;
      const finish=()=>{if(done)return;done=true;clearTimeout(timer);channel.port1.close();resolve();};
      const timer=setTimeout(()=>{finish();scheduleRetry();},8000);
      channel.port1.onmessage=event=>{
        const data=event.data;
        if(controller===navigator.serviceWorker.controller&&data?.type==='APP_BUILD'&&data.ready===true&&data.build&&String(data.build)!==build){pendingBuild=String(data.build);pendingController=controller;applyReady();}
        finish();
      };
      try{controller.postMessage({type:'GET_BUILD'},[channel.port2]);}catch{finish();}
    }).finally(()=>{inspecting=null;});return inspecting;
  }
  const activate=worker=>{if(worker?.state==='installed')worker.postMessage({type:'SKIP_WAITING'});};
  const watched=new WeakSet();
  function watchWorker(worker){if(!worker||watched.has(worker))return;watched.add(worker);worker.addEventListener('statechange',()=>{activate(worker);if(worker.state==='redundant')scheduleRetry();});activate(worker);}
  function scheduleRetry(){clearTimeout(retryTimer);retryTimer=setTimeout(()=>{lastCheck=-Infinity;if(!registration)connect();checkForUpdate();},retryDelay);retryDelay=Math.min(60000,retryDelay*3);}
  function checkForUpdate(){
    if(document.visibilityState==='hidden')return;
    // Already installed updates can apply offline, without waiting for a network check.
    inspectController();applyReady();
    if(navigator.onLine===false||document.visibilityState==='hidden'||!registration||checking||Date.now()-lastCheck<30000)return checking;
    lastCheck=Date.now();clearTimeout(retryTimer);
    watchWorker(registration.waiting);watchWorker(registration.installing);
    checking=registration.update().then(()=>{retryDelay=5000;watchWorker(registration.waiting);watchWorker(registration.installing);return inspectController();}).catch(scheduleRetry).finally(()=>{checking=null;});
    return checking;
  }
  navigator.serviceWorker.addEventListener('controllerchange',()=>{pendingBuild=null;pendingController=null;readingBlockedAt=null;Promise.resolve(inspecting).then(inspectController);});
  navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='SHELL_READY'&&event.source===navigator.serviceWorker.controller)inspectController();});
  function connect(){if(!appReady||connecting||navigator.onLine===false)return;connecting=navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(value=>{
    registration=value;
    registration.addEventListener('updatefound',()=>watchWorker(registration.installing));
    watchWorker(registration.waiting);watchWorker(registration.installing);checkForUpdate();
  }).catch(scheduleRetry).finally(()=>{connecting=null;});}
  // Give local reading priority; failed startup may still recover via a ready update.
  const startupTimer=setTimeout(()=>{appReady=true;connect();inspectController();applyReady();},12000);
  window.addEventListener('gre-app-rendered',()=>{if(appReady)return;appReady=true;clearTimeout(startupTimer);connect();inspectController();applyReady();});
  // Inspect now: registration/network work must never delay an already-ready update.
  inspectController();
  window.addEventListener('online',()=>{if(!registration)connect();checkForUpdate();});
  window.addEventListener('pageshow',checkForUpdate);
  window.addEventListener('focus',checkForUpdate);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){pointerDown=false;checkForUpdate();}});
  for(const type of ['pointerdown','pointerup','pointercancel','keydown','scroll','wheel','touchstart'])window.addEventListener(type,()=>{lastInput=Date.now();if(['pointerdown','keydown','wheel','touchstart'].includes(type))interaction++;if(type==='pointerdown')pointerDown=true;if(type==='pointerup'||type==='pointercancel')pointerDown=false;},{passive:true});
  window.addEventListener('blur',()=>{pointerDown=false;});
  window.addEventListener('gre-app-rendered',restorePosition);
  setInterval(checkForUpdate,60000);
})();

