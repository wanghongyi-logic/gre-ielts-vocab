import {waitForLocal} from './offline-async.js';
import {createSavedSnapshot,savedSnapshotKey} from './offline-snapshot.js';
import {savedRangeFields,bindSavedRange} from './offline-range.js';
import {mountSavedExport} from './offline-export-ui.js';
import {mountReleaseDownloads} from './offline-releases.js';
import {createMediaControl} from './offline-control.js';
import {batchStatus,downloadLessons,optionalMediaGroups} from './offline-batch.js';
import {OFFLINE_EDITION,setMediaEdition,chooseVideoMode,videoMode} from './offline-preferences.js';
import {importPack,inspectLibrary,cleanUnusedPacks,clearSavedResources,clearSavedWords,deletePack,storageStatus} from './offline-packs.js';
const size=n=>(n/1024/1024).toFixed(1)+' MB';
export function installOfflineManager(catalog){
 const savedSnapshot=createSavedSnapshot(catalog);
 setMediaEdition(catalog);let controller=null,activeOperation=null,cachedPaths=[],clearingThisPage=false,changingMode=false,mutating=false,filePickerOpen=false,savedReadyIds=null,savedGeneration=null,savedTotal=catalog.entries.length,releaseDownloads=null,savedExport=null,rangeDelete=null,refreshEpoch=0;
 window.addEventListener('gre-update-can-reload',event=>{if(controller||changingMode||clearingThisPage||mutating||filePickerOpen)event.detail.blocked=true;});
 const host=document.createElement('section');host.className='offline-library';
 host.innerHTML=`<details class="library-page" open>
  <summary class="library-page-title">随身书库</summary>
  <div class="library-overview">
   <p class="library-eyebrow">已保存</p>
   <p class="library-count"><strong data-saved-count>—</strong><span> / <span data-total-count>${catalog.entries.length}</span> 词</span></p>
   <p class="library-space" data-space></p>
  </div>
  <details class="library-disclosure library-pages-downloads">
   <summary><span>下载资源包</span><span class="library-disclosure-mark" aria-hidden="true">+</span></summary>
   <div class="library-disclosure-body"><ul data-pages-downloads></ul></div>
  </details>
  <div data-release-downloads-slot></div>
  <div class="library-action-row import-row">
   <label class="offline-import">导入文件<span aria-hidden="true"> ↗</span><input type="file" accept=".zip,application/zip,application/octet-stream" aria-label="选择离线 ZIP 书包"></label>
  </div>
  <div class="library-import-feedback">
   <button type="button" data-cancel hidden>取消导入</button>
   <progress data-import-progress hidden aria-label="导入进度"></progress>
   <p role="status" aria-live="polite" data-import-status></p>
   <button type="button" data-reopen hidden>重新打开阅读 →</button>
  </div>
  <details class="library-disclosure library-packs" hidden>
   <summary><span>已导入文件</span><span class="library-disclosure-mark" aria-hidden="true">+</span></summary>
   <div class="library-disclosure-body"><ul data-packs></ul><button type="button" class="library-text-action" data-clean hidden>清理未使用的文件</button></div>
  </details>
  <div class="library-action-row mode-row"><div><h3>阅读方式</h3><p data-mode-description></p><p role="status" data-mode-status></p></div><div data-mode-action></div></div>
  <details class="library-disclosure library-range-row" data-delete-range><summary><span>按范围删除</span><span class="library-disclosure-mark" aria-hidden="true">+</span></summary><div class="library-disclosure-body">${savedRangeFields('range-delete')}<div class="library-range-feedback"><button type="button" data-range-delete-cancel hidden>取消删除</button><progress data-range-delete-progress hidden aria-label="删除进度"></progress><p role="status" aria-live="polite" data-range-delete-status></p></div></div></details>
  <div class="library-clear-row"><button type="button" class="library-clear-action" data-clear-all>清除已保存资源</button><p role="status" data-status></p></div>
  <p class="library-space" data-runtime-build>v${OFFLINE_EDITION.split('-')[0]}</p>
 </details>`;
 host.id='offline-settings';host.setAttribute('aria-label','本机书库设置');host.classList.add('settings-leaf');host.hidden=true;document.querySelector('.contents-tools').after(host);
 const bookmark=document.createElement('button');bookmark.type='button';bookmark.id='open-settings';bookmark.className='library-rail';bookmark.dataset.savedInventoryPending='true';bookmark.setAttribute('aria-label','本地保存进度，打开设置');bookmark.setAttribute('aria-controls','word-picker');bookmark.setAttribute('aria-expanded','false');bookmark.innerHTML=`<span class="library-rail-track" role="progressbar" aria-label="本机已保存单词" aria-valuemin="0" aria-valuemax="${catalog.entries.length}" aria-busy="true"><span class="library-rail-fill"></span></span><span class="library-rail-label" aria-hidden="true">—</span>`;const group=document.createElement('div');group.className='bookmark-tools';const contents=document.getElementById('open-search');contents.before(group);group.append(contents);group.after(bookmark);bookmark.onclick=()=>openManager();
 const releaseStyle=document.createElement('link');releaseStyle.rel='stylesheet';releaseStyle.href=new URL('./offline-releases.css',import.meta.url).href;document.head.append(releaseStyle);
 const welcome=document.createElement('div');welcome.className='settings-status';welcome.hidden=true;
 welcome.innerHTML='<p role="status" data-text-ready>正在准备文字离线…</p>';
 host.append(welcome);
 const settingsStyle=document.createElement('link');settingsStyle.rel='stylesheet';settingsStyle.href=new URL('./settings-storybook.css',import.meta.url).href;document.head.append(settingsStyle);
 const input=host.querySelector('input[type="file"]'),cancel=host.querySelector('[data-cancel]'),progress=host.querySelector('[data-import-progress]'),status=host.querySelector('[data-status]'),list=host.querySelector('[data-packs]'),space=host.querySelector('[data-space]'),clean=host.querySelector('[data-clean]');
 const importTarget={progress,cancel,status:host.querySelector('[data-import-status]')};
 const retryStorage=document.createElement('button');retryStorage.type='button';retryStorage.className='library-text-action';retryStorage.textContent='重试读取';retryStorage.hidden=true;space.after(retryStorage);retryStorage.onclick=()=>refresh();
 input.addEventListener('click',()=>{filePickerOpen=true;refreshDownloads();});
 for(const type of ['change','cancel'])input.addEventListener(type,()=>{filePickerOpen=false;refreshDownloads();});
 window.addEventListener('focus',()=>{if(filePickerOpen)setTimeout(()=>{filePickerOpen=false;refreshDownloads();},500);});
 // One explicit action traverses every currently hosted range. The worker
 // verifies existing cache entries and skips verified imported paths per asset.
 const availableIds=optionalMediaGroups(catalog).filter(group=>group.hostedAvailable).flatMap(group=>group.ids);
 const row=document.createElement('li'),button=document.createElement('button');
 row.className='library-download-row';button.type='button';button.className='library-text-action';
 const feedback=document.createElement('div');feedback.className='library-download-feedback';feedback.innerHTML='<button type="button" data-download-cancel hidden>取消下载</button><progress data-download-progress hidden aria-label="全部资源下载进度"></progress><p role="status" aria-live="polite" data-download-status></p>';
 const downloadTarget={progress:feedback.querySelector('[data-download-progress]'),cancel:feedback.querySelector('[data-download-cancel]'),status:feedback.querySelector('[data-download-status]'),downloadIds:availableIds};
 downloadTarget.cancel.onclick=()=>cancelOperation(downloadTarget);
 button.onclick=()=>run('download',downloadTarget,async options=>{
  const library=await waitForLocal(()=>inspectLibrary(catalog,{signal:options.signal}),{signal:options.signal,timeoutMs:0});
  return downloadLessons(availableIds,library.opfsPaths,options);
 });
 row.append(button,feedback);host.querySelector('[data-pages-downloads]').append(row);
 const downloadRows=[{target:downloadTarget}];
 function refreshDownloads(){
  rangeDelete?.sync(Boolean(controller)||clearingThisPage||changingMode||mutating||filePickerOpen);savedExport?.sync();
  const saved=availableIds.filter(id=>savedReadyIds?.includes(id)).length,complete=saved===availableIds.length;
  button.textContent=complete?'已保存全部资源':saved?'继续下载全部资源':'下载全部资源';
  button.disabled=complete||Boolean(controller)||clearingThisPage||changingMode||mutating||filePickerOpen;
 }
 refreshDownloads();
 const openManager=()=>{host.querySelector('details').open=true;location.hash='/settings';refresh(true);};
 const modeButton=document.createElement('button');modeButton.type='button';modeButton.className='library-mode-button';
 function syncMode(){const textOnly=videoMode()==='none';modeButton.textContent=textOnly?'使用视频':'纯文字';host.querySelector('[data-mode-description]').textContent=textOnly?'纯文字':'视频与文字';}
 syncMode();host.querySelector('[data-mode-action]').append(modeButton);
 modeButton.onclick=async()=>{
  if(controller||clearingThisPage||changingMode||mutating)return;
  changingMode=true;modeButton.disabled=true;input.disabled=true;clean.disabled=true;host.querySelector('[data-clear-all]').disabled=true;
  for(const button of list.querySelectorAll('button'))button.disabled=true;
  refreshDownloads();const modeStatus=host.querySelector('[data-mode-status]');modeStatus.textContent='';
  try{
   await chooseVideoMode(videoMode()==='none'?'auto':'none');syncMode();
   const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));await Promise.all(detail.waits);
  }catch(error){modeStatus.textContent=`切换未完成：${error.message}`;syncMode();}
  finally{changingMode=false;const busy=Boolean(controller)||clearingThisPage;input.disabled=busy;modeButton.disabled=busy;clean.disabled=busy;host.querySelector('[data-clear-all]').disabled=busy;for(const button of list.querySelectorAll('button'))button.disabled=busy;refreshDownloads();}
 };
 function paintSavedTotals(animate=false){bookmark.dataset.savedInventoryPending='false';savedSnapshot.save(savedReadyIds,savedGeneration);bookmark.querySelector('[role=progressbar]').removeAttribute('aria-busy');bookmark.dataset.progressMotion=animate?'download':'restore';const fraction=savedTotal?savedReadyIds.length/savedTotal:0;bookmark.style.setProperty('--saved-progress',String(fraction));bookmark.querySelector('.library-rail-label').textContent=`${savedReadyIds.length}/${savedTotal}`;bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(savedReadyIds.length));bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuemax',String(savedTotal));bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuetext',`已完整保存 ${savedReadyIds.length} / ${savedTotal} 词`);bookmark.title=`已保存 ${savedReadyIds.length} / ${savedTotal} 词，打开设置`;bookmark.setAttribute('aria-label',`已完整保存 ${savedReadyIds.length} / ${savedTotal} 词，打开设置`);host.querySelector('[data-saved-count]').textContent=savedReadyIds.length;host.querySelector('[data-total-count]').textContent=savedTotal;}
 function paintSavedPending(){bookmark.dataset.savedInventoryPending='true';savedReadyIds=null;bookmark.style.setProperty('--saved-progress','0');bookmark.querySelector('.library-rail-label').textContent='—';const bar=bookmark.querySelector('[role=progressbar]');bar.removeAttribute('aria-valuenow');bar.removeAttribute('aria-valuetext');bar.setAttribute('aria-busy','true');bookmark.title='本地保存进度，打开设置';bookmark.setAttribute('aria-label',bookmark.title);host.querySelector('[data-saved-count]').textContent='—';refreshDownloads();}
 const restoredIds=savedSnapshot.restore();if(restoredIds!==null){savedReadyIds=restoredIds;savedGeneration=savedSnapshot.generation();paintSavedTotals();}
 async function readSavedInventory(){let timer;try{return await Promise.race([batchStatus(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Inventory pending')),8000);})]);}finally{clearTimeout(timer);}}
 let refreshJob=null;
 function refresh(){if(refreshJob)return refreshJob;const job=refreshInventory().finally(()=>{if(refreshJob===job)refreshJob=null;});refreshJob=job;return job;}
 async function refreshInventory(){
  const epoch=++refreshEpoch;let paths=cachedPaths;
  try{const before=await waitForLocal(()=>sharedControl.state());if(before.phase==='clearing'||before.phase==='selective-clearing')throw new Error('Inventory changing');{const cache=await readSavedInventory();if(cache.pending||cache.error)throw new Error('Inventory pending');paths=cache.readyPaths||[];}const library=await inspectLibrary(catalog,{cachedPaths:paths});const after=await waitForLocal(()=>sharedControl.state());if(epoch!==refreshEpoch)return;if(after.generation!==before.generation||after.phase==='clearing'||after.phase==='selective-clearing'){queueSavedRefresh();return;}cachedPaths=paths;savedReadyIds=library.readyIds;savedGeneration=after.generation;savedTotal=library.total;refreshDownloads();list.replaceChildren();paintSavedTotals();host.querySelector('.library-packs').hidden=library.packs.length===0;
   for(const pack of library.packs){const li=document.createElement('li'),label=document.createElement('span'),button=document.createElement('button');const title=document.createElement('strong'),detail=document.createElement('span');title.textContent=`${pack.wordIds.length} 词`;detail.textContent=`${size(pack.bytes)} · ${pack.version}${!pack.available?' · 文件缺失，请重新导入':pack.ownedCurrentAssets===0?' · 当前未使用':''}`;label.className='library-pack-label';label.append(title,detail);button.type='button';button.textContent='移除';button.setAttribute('aria-label',`删除 ${pack.wordIds.length} 词的本机资源包`);button.disabled=Boolean(controller)||clearingThisPage||changingMode||mutating;button.onclick=async()=>{if(controller||clearingThisPage||changingMode||mutating)return;if(!confirm(`删除这份本机资源包（${pack.wordIds.length} 词）？「文件」里的原始 ZIP 和其他资源包不会受影响。`))return;mutating=true;syncMutationControls();try{await deletePack(pack.key);status.textContent='本机资源包已删除，重新打开阅读后生效';await refresh();}catch(error){status.textContent=error.message;}finally{mutating=false;syncMutationControls();}};li.append(label,button);list.append(li);}
   clean.hidden=!library.packs.some(p=>p.ownedCurrentAssets===0);clean.disabled=Boolean(controller)||clearingThisPage||changingMode||mutating;host.querySelector('[data-clear-all]').disabled=Boolean(controller)||clearingThisPage||changingMode||mutating;
   retryStorage.hidden=true;space.textContent='';storageStatus().then(storage=>{if(epoch===refreshEpoch)space.textContent=storage.usage!==undefined?'占用 '+size(storage.usage):'';}).catch(()=>{});
  }catch{if(epoch===refreshEpoch){retryStorage.hidden=false;space.textContent='暂时无法读取本机存储';if(savedReadyIds===null)paintSavedPending();else{bookmark.dataset.savedInventoryPending='true';bookmark.querySelector('[role=progressbar]').setAttribute('aria-busy','true');}}}
 }
 const rangeSection=host.querySelector('[data-delete-range]');
 rangeDelete=bindSavedRange(rangeSection,catalog,{prefix:'range-delete',verb:'删除'});
 const deleteProgress=rangeSection.querySelector('[data-range-delete-progress]'),deleteStatus=rangeSection.querySelector('[data-range-delete-status]'),deleteCancel=rangeSection.querySelector('[data-range-delete-cancel]');
 let deletion=null;
 deleteCancel.onclick=()=>{if(!deletion||deletion.committing)return;deletion.controller.abort();deleteCancel.disabled=true;};
 rangeDelete.button.onclick=async()=>{
  if(controller||clearingThisPage||changingMode||mutating||filePickerOpen)return;
  let selected;try{selected=rangeDelete.selection();}catch(error){deleteStatus.textContent=error.message;return;}
  const current={controller:new AbortController(),committing:false};deletion=current;mutating=true;syncMutationControls();
  deleteStatus.textContent='';deleteProgress.hidden=false;deleteProgress.removeAttribute('value');deleteCancel.hidden=false;deleteCancel.disabled=false;
  try{
   const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-clear-library',{detail}));await Promise.all(detail.waits);
   const result=await clearSavedWords(catalog,selected.ids,{signal:current.controller.signal,onProgress:p=>{
    if(deletion!==current)return;
    if(p.phase==='delete'||p.phase==='done'){current.committing=true;deleteCancel.hidden=true;}
    if(p.phase==='prepare'){deleteProgress.removeAttribute('value');deleteStatus.textContent='正在准备';}
    else{deleteProgress.max=p.total||1;deleteProgress.value=p.completed;deleteStatus.textContent=`删除 ${p.completed}/${p.total}`;}
   }});
   deleteStatus.textContent=result.removedAssets?`已删除 ${selected.start}–${selected.end} · ${result.removedAssets} 个资源`:'这段没有可删除的资源';
  }catch(error){deleteStatus.textContent=error.name==='AbortError'?'':`删除未完成：${error.message}`;}
  finally{
   // Rebuild reading and totals in place, including after cancellation or a
   // partial cleanup failure. Keep the route, drawer and inputs untouched.
   try{const updated={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail:updated}));await Promise.all(updated.waits);}
   catch(error){deleteStatus.textContent=`刷新未完成：${error.message}`;}
   await refresh(true);deletion=null;mutating=false;deleteCancel.hidden=true;deleteProgress.hidden=true;syncMutationControls();
  }
 };
 function syncMutationControls(){const busy=Boolean(controller)||clearingThisPage||changingMode||mutating;input.disabled=busy;modeButton.disabled=busy;clean.disabled=busy;host.querySelector('[data-clear-all]').disabled=busy;for(const button of list.querySelectorAll('button'))button.disabled=busy;refreshDownloads();}
 clean.onclick=async()=>{if(controller||clearingThisPage||changingMode||mutating)return;mutating=true;syncMutationControls();try{const unused=(await inspectLibrary(catalog)).packs.filter(p=>p.ownedCurrentAssets===0);if(!unused.length||!confirm(`清理 ${unused.length} 个当前未使用的书包？仍在使用的内容会保留。`))return;const count=await cleanUnusedPacks(catalog,unused.map(p=>p.key));status.textContent=`已清理 ${count} 个当前未使用的书包`;await refresh();}catch(error){status.textContent=`清理未完成：${error.message}`;}finally{mutating=false;syncMutationControls();}};
 host.querySelector('[data-clear-all]').onclick=async()=>{if(controller||clearingThisPage||changingMode||mutating)return;const library=await inspectLibrary(catalog,{cachedPaths});if(!confirm(`清除本机已保存的 ${library.readyIds.length} 词视频与插图，以及 ${library.packs.length} 个导入资源包？文字页面、阅读进度、偏好和「文件」里的原始 ZIP 会保留。`))return;if(controller||clearingThisPage||changingMode||mutating)return;clearingThisPage=true;savedSnapshot.invalidate();paintSavedPending();releaseDownloads?.cancelPending();refreshDownloads();const button=host.querySelector('[data-clear-all]');button.disabled=true;input.disabled=true;modeButton.disabled=true;status.textContent='正在停止读取并清除本机资源…';try{sessionStorage.setItem('gre-media-paused-after-clear','1');const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-clear-library',{detail}));await Promise.all(detail.waits);await clearSavedResources();cachedPaths=[];sessionStorage.setItem('gre-library-cleared-message','1');location.reload();}catch(error){clearingThisPage=false;status.textContent=`清除未完成：${error.message}，可以重新尝试`;button.disabled=false;input.disabled=false;modeButton.disabled=false;await refresh(true);}};
 try{if(sessionStorage.getItem('gre-library-cleared-message')==='1'){sessionStorage.removeItem('gre-library-cleared-message');status.textContent='已清除本机视频与插图。视频暂时停用，选择「使用视频」或导入书包即可继续';}}catch{}
 host.querySelector('[data-reopen]').onclick=()=>location.reload();
 function cancelOperation(target){if(activeOperation?.target!==target)return;controller.abort();target.status.textContent='';target.cancel.disabled=true;}
 cancel.onclick=()=>cancelOperation(importTarget);
 function operationOptions(operation){return {signal:operation.controller.signal,onProgress:p=>{
  if(activeOperation!==operation||operation.controller.signal.aborted)return;
  const {progress,status}=operation.target;progress.max=p.total;progress.value=p.completed;
  status.textContent=operation.kind==='download'?`${p.completed}/${p.total}`:'';
  // The worker emits this receipt only after every asset of this word is
  // verified and committed. Byte/import progress never changes saved totals.
  if(operation.kind==='download'&&p.phase==='batch'&&Number.isSafeInteger(p.readyId)&&p.generation===operation.generation&&operation.target.downloadIds.includes(p.readyId)&&!savedReadyIds?.includes(p.readyId)){
   const entry=catalog.entries.find(entry=>entry.number===p.readyId);if(!entry)return;
   cachedPaths=[...new Set([...cachedPaths,...[entry.storyMedia?.video,entry.storyMedia?.poster,entry.storyMedia?.staticPoster].filter(Boolean).map(ref=>'gre-learning/'+ref.url)])];
   if(savedReadyIds===null){queueSavedRefresh();return;}
   savedReadyIds=[...savedReadyIds,p.readyId];savedGeneration=p.generation;refreshEpoch++;paintSavedTotals(true);refreshDownloads();
  }
 }};}
 async function run(kind,target,action){
  if(controller||clearingThisPage||changingMode||mutating||filePickerOpen)return;
  let ticket=null,activated=false;
  host.querySelector('[data-reopen]').hidden=true;
  controller=new AbortController();const operation={kind,target,controller};activeOperation=operation;
  const {progress,cancel,status}=target;
  // Only the initiating control owns progress, cancellation and the live status.
  for(const other of [importTarget,...downloadRows.map(row=>row.target)]){other.status.textContent='';other.progress.hidden=true;other.cancel.hidden=true;}
  input.disabled=true;modeButton.disabled=true;
  cancel.hidden=false;cancel.disabled=false;progress.hidden=false;progress.removeAttribute('value');
  status.textContent='';
  clean.disabled=true;host.querySelector('[data-clear-all]').disabled=true;
  for(const button of list.querySelectorAll('button'))button.disabled=true;
  refreshDownloads();queueSavedRefresh();
  try{
   if(operation.controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
   const signal=operation.controller.signal;
   await waitForLocal(()=>chooseVideoMode('auto',{signal}),{signal});ticket=await waitForLocal(()=>sharedControl.ticket(),{signal});operation.generation=ticket;
   const pack=await waitForLocal(()=>action(operationOptions(operation)),{signal,timeoutMs:0}),state=await waitForLocal(()=>sharedControl.state(),{signal});
   if(activeOperation!==operation||signal.aborted||state.paused||state.generation!==ticket)throw new DOMException('Cancelled','AbortError');
   const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));await waitForLocal(()=>Promise.all(detail.waits),{signal});activated=true;
   modeButton.textContent='纯文字';host.querySelector('[data-mode-description]').textContent='视频与文字';
   status.textContent=kind==='download'&&pack.unavailable?`已保存 ${pack.completed}/${pack.requested} · 暂不可用 ${pack.unavailable}`:'';
  }catch(error){const cancelled=operation.controller.signal.aborted||error.name==='AbortError';operation.controller.abort();if(activeOperation===operation)status.textContent=cancelled?'':`未完成：${error.message}。已保存内容保留，可以${kind==='download'?'继续下载':'重新导入'}`;}
  finally{
   // A cancelled batch keeps verified completed files; activate those too. A clear
   // from another tab changes the generation and must never resurrect media.
   // Release UI ownership first. Readiness/activation checks cannot strand Cancel.
   if(activeOperation===operation){
    controller=null;activeOperation=null;
    input.disabled=false;modeButton.disabled=false;input.value='';cancel.hidden=true;progress.hidden=true;syncMutationControls();queueSavedRefresh();
   }
   if(!activated&&ticket!==null)waitForLocal(()=>sharedControl.state()).then(state=>{
    if(activeOperation||state.paused||state.generation!==ticket)return;
    const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));Promise.allSettled(detail.waits);
   }).catch(()=>{});
  }
 }
 input.onchange=()=>{const file=input.files[0];if(file)return run('import',importTarget,options=>importPack(file,catalog,options));};
 host.querySelector('details').addEventListener('toggle',event=>{if(event.target.open)refresh();});
 let savedRefreshTimer,refreshingCache=false,refreshAgain=false;
 function queueSavedRefresh(){clearTimeout(savedRefreshTimer);savedRefreshTimer=setTimeout(refreshSaved,100);}
 window.addEventListener('storage',event=>{if(event.key===savedSnapshotKey){if(event.newValue===null){refreshEpoch++;paintSavedPending();}queueSavedRefresh();}});
 window.addEventListener('gre-library-updated',queueSavedRefresh);
 window.addEventListener('focus',queueSavedRefresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)queueSavedRefresh();});
 navigator.serviceWorker?.addEventListener('message',event=>{if(event.data?.type==='SAVED_INVENTORY_CHANGED'){savedSnapshot.invalidate();refreshEpoch++;paintSavedPending();queueSavedRefresh();}});
 // Catch browser eviction / changes made outside this tab without media reads.
 setInterval(()=>{if(!document.hidden&&!controller&&!mutating&&!clearingThisPage)queueSavedRefresh();},30000);
 queueSavedRefresh();
 async function refreshSaved(){if(refreshingCache){refreshAgain=true;return;}refreshingCache=true;try{await refresh(true);}finally{refreshingCache=false;if(refreshAgain){refreshAgain=false;savedRefreshTimer=setTimeout(refreshSaved,500);}}}
 window.addEventListener('gre-offline-asset',({detail})=>{if(detail.phase==='saved'){clearTimeout(savedRefreshTimer);savedRefreshTimer=setTimeout(refreshSaved,600);}});
 window.addEventListener('gre-offline-corrupt',()=>{savedSnapshot.invalidate();refreshEpoch++;paintSavedPending();status.textContent='有一份本机内容无法读取，请重新导入对应书包；文字仍可阅读';clearTimeout(savedRefreshTimer);savedRefreshTimer=setTimeout(refreshSaved,500);});
 releaseDownloads=mountReleaseDownloads({host,catalog});
 savedExport=mountSavedExport({host,catalog,isBusy:()=>Boolean(controller)||clearingThisPage||changingMode||mutating||filePickerOpen,setBusy:value=>{mutating=value;syncMutationControls();}});
 const drawerSelectors=['.library-page','.library-pages-downloads','[data-release-browser]','.library-packs','[data-export-range]','[data-delete-range]'];
 window.addEventListener('gre-update-capture',event=>{event.detail.drawers=Object.fromEntries(drawerSelectors.map(selector=>[selector,Boolean(host.querySelector(selector)?.open)]));});
 window.addEventListener('gre-update-restore',event=>{
  const drawers=event.detail.position?.drawers;if(!drawers)return;
  // Start the explicit load before toggling open, so the toggle cannot duplicate it.
  const releaseReady=drawers['[data-release-browser]']===true?releaseDownloads.load():Promise.resolve();
  for(const selector of drawerSelectors)if(typeof drawers[selector]==='boolean'){const drawer=host.querySelector(selector);if(drawer)drawer.open=drawers[selector];}
  event.detail.waits.push(Promise.all([refresh(true),releaseReady]));
 });
 const sharedControl=createMediaControl(new URL('../',import.meta.url));
 sharedControl.subscribe(state=>{const settledSnapshot=state.initial&&savedSnapshot.matchesGeneration(state);if(!settledSnapshot&&(state.initial||state.paused||state.phase?.startsWith('selective-')||savedGeneration!==state.generation)){savedSnapshot.invalidate();refreshEpoch++;paintSavedPending();if(state.phase!=='clearing'&&state.phase!=='selective-clearing')queueSavedRefresh();}if(state.generation===0)return;if(state.phase?.startsWith('selective-')){if(state.source==='external'){controller?.abort();if(state.phase==='selective-cleared'){const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));Promise.all(detail.waits).then(()=>refresh(true));}}return;}if(state.paused){releaseDownloads?.cancelPending();if(state.source==='external')controller?.abort();try{sessionStorage.setItem('gre-media-paused-after-clear','1');}catch{}modeButton.textContent='使用视频';host.querySelector('[data-mode-description]').textContent='纯文字 · 视频已暂停';}else{try{sessionStorage.removeItem('gre-media-paused-after-clear');}catch{}}if(state.source==='external'&&!clearingThisPage&&state.phase!=='clearing')location.reload();});sharedControl.state().catch(()=>{});
 let readinessTimer;
 async function checkTextReady(){clearTimeout(readinessTimer);const target=navigator.serviceWorker?.controller;if(!target){welcome.querySelector('[data-text-ready]').textContent='文字正在准备，请保持联网';readinessTimer=setTimeout(checkTextReady,3000);return;}const channel=new MessageChannel();let settled=false;const timer=setTimeout(()=>{if(!settled){channel.port1.close();readinessTimer=setTimeout(checkTextReady,3000);}},6000);channel.port1.onmessage=({data})=>{settled=true;clearTimeout(timer);channel.port1.close();const ready=data.ready&&data.build===OFFLINE_EDITION;welcome.querySelector('[data-text-ready]').textContent=ready?'文字已可离线 · '+catalog.entries.length+' 词':'文字正在准备，请保持联网';if(!ready)readinessTimer=setTimeout(checkTextReady,3000);else refresh(true);};target.postMessage({type:'GET_TEXT_STATUS'},[channel.port2]);}
 checkTextReady();navigator.serviceWorker?.addEventListener('controllerchange',checkTextReady);
}

