(() => {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:' || location.hostname === 'app.local') return;
  const build = '125';
  let refreshing = false;
  let lastUpdateCheck = 0;
  let registration;
  let hideTimer;
  const status = document.getElementById('update-status');
  const show = (message, temporary=false) => {
    clearTimeout(hideTimer);
    status.textContent=message;status.hidden=false;
    if(temporary)hideTimer=setTimeout(()=>status.hidden=true,3500);
  };
  const reloadForBuild = nextBuild => {
    if (!nextBuild || String(nextBuild) === build || refreshing) return;
    const key=`vocab-update-reload-${nextBuild}`;
    try { if(sessionStorage.getItem(key)==='1')return;sessionStorage.setItem(key,'1'); } catch {}
    refreshing=true;show('新版已就绪，正在打开…');
    setTimeout(()=>location.reload(),240);
  };
  const inspectController = () => {
    const controller=navigator.serviceWorker.controller;if(!controller)return;
    const channel=new MessageChannel();
    const timer=setTimeout(()=>channel.port1.close(),3000);
    channel.port1.onmessage=event=>{clearTimeout(timer);if(event.data?.type==='APP_BUILD')reloadForBuild(event.data.build);channel.port1.close();};
    controller.postMessage({type:'GET_BUILD'},[channel.port2]);
  };
  const checkForUpdate = (force=false) => {
    if(navigator.onLine===false||!registration)return;
    const now=Date.now();if(!force&&now-lastUpdateCheck<30000)return;lastUpdateCheck=now;
    registration.update().catch(()=>{});inspectController();
  };
  navigator.serviceWorker.addEventListener('controllerchange',inspectController);
  navigator.serviceWorker.addEventListener('message',event=>{
    const data=event.data||{};
    if(data.type==='SHELL_READY' && event.source===navigator.serviceWorker.controller)show('离线页面已就绪；仅已下载的词可离线打开',true);
  });
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(value=>{
    registration=value;checkForUpdate(true);
    if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;
      worker?.addEventListener('statechange',()=>{if(worker.state==='installed')worker.postMessage({type:'SKIP_WAITING'});});
    });
  }).catch(()=>{});
  window.addEventListener('online',()=>checkForUpdate(true));
  window.addEventListener('pageshow',()=>checkForUpdate(true));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkForUpdate();});
  setInterval(checkForUpdate,5*60000);
})();
