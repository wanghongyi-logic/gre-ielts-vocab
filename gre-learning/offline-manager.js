import {createMediaControl} from './offline-control.js';
import {batchStatus,downloadLessons,optionalMediaGroups} from './offline-batch.js';
import {OFFLINE_EDITION,setMediaEdition,chooseVideoMode,videoMode} from './offline-preferences.js';
import {importPack,inspectLibrary,cleanUnusedPacks,clearSavedResources,deletePack,storageStatus} from './offline-packs.js';
const size=n=>(n/1024/1024).toFixed(1)+' MB';
export function installOfflineManager(catalog){
 setMediaEdition(catalog);let controller=null,activeOperation=null,cachedPaths=[],clearingThisPage=false,savedReadyIds=null;
 const host=document.createElement('section');host.className='offline-library';
 host.innerHTML=`<details class="library-page" open>
  <summary class="library-page-title">随身书库</summary>
  <div class="library-overview">
   <p class="library-eyebrow">已保存</p>
   <p class="library-count"><strong data-saved-count>—</strong><span> / <span data-total-count>210</span> 词</span></p>
   <p class="library-space" data-space></p>
  </div>
  <details class="library-disclosure library-pages-downloads">
   <summary><span>下载资源包</span><span class="library-disclosure-mark" aria-hidden="true">+</span></summary>
   <div class="library-disclosure-body"><ul data-pages-downloads></ul></div>
  </details>
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
  <div class="library-action-row mode-row"><div><h3>阅读方式</h3><p data-mode-description></p></div><div data-mode-action></div></div>
  <div class="library-clear-row"><button type="button" class="library-clear-action" data-clear-all>清除已保存资源</button><p role="status" data-status></p></div>
 </details>`;
 host.id='offline-settings';host.setAttribute('aria-label','本机书库设置');host.classList.add('settings-leaf');host.hidden=true;document.querySelector('.contents-tools').after(host);
 const bookmark=document.createElement('button');bookmark.type='button';bookmark.id='open-settings';bookmark.className='library-rail';bookmark.setAttribute('aria-label','本地保存进度，打开设置');bookmark.setAttribute('aria-controls','word-picker');bookmark.setAttribute('aria-expanded','false');bookmark.innerHTML='<span class="library-rail-track" role="progressbar" aria-label="本机已保存单词" aria-valuemin="0" aria-valuemax="210" aria-valuenow="0"><span class="library-rail-fill"></span></span><span class="library-rail-label" aria-hidden="true">—</span>';const group=document.createElement('div');group.className='bookmark-tools';const contents=document.getElementById('open-search');contents.before(group);group.append(contents);group.after(bookmark);bookmark.onclick=()=>openManager();
 const welcome=document.createElement('div');welcome.className='settings-status';welcome.hidden=true;
 welcome.innerHTML='<p role="status" data-text-ready>正在准备文字离线…</p>';
 host.append(welcome);
 const settingsStyle=document.createElement('link');settingsStyle.rel='stylesheet';settingsStyle.href=new URL('./settings-storybook.css',import.meta.url).href;document.head.append(settingsStyle);
 const input=host.querySelector('input'),cancel=host.querySelector('[data-cancel]'),progress=host.querySelector('[data-import-progress]'),status=host.querySelector('[data-status]'),list=host.querySelector('[data-packs]'),space=host.querySelector('[data-space]'),clean=host.querySelector('[data-clean]');
 const importTarget={progress,cancel,status:host.querySelector('[data-import-status]')};
 const downloadRows=optionalMediaGroups(catalog).map(group=>{
  const row=document.createElement('li'),label=document.createElement('span'),button=document.createElement('button');
  row.className='library-download-row';button.type='button';button.className='library-text-action';
  const feedback=document.createElement('div');feedback.className='library-download-feedback';feedback.innerHTML='<button type="button" data-download-cancel hidden>取消下载</button><progress data-download-progress hidden aria-label="本组下载进度"></progress><p role="status" data-download-status></p>';
  const target={progress:feedback.querySelector('[data-download-progress]'),cancel:feedback.querySelector('[data-download-cancel]'),status:feedback.querySelector('[data-download-status]')};
  target.progress.setAttribute('aria-label',`第 ${group.start}–${group.end} 词下载进度`);target.cancel.onclick=()=>cancelOperation(target);
  button.onclick=()=>run('download',target,async options=>{const library=await inspectLibrary(catalog);const result=await downloadLessons(group.ids,library.opfsPaths,options);return {...result,pages:true,wordIds:group.ids};});
  row.append(label,button,feedback);host.querySelector('[data-pages-downloads]').append(row);return {group,label,button,target};
 });
 function refreshDownloads(){for(const {group,label,button} of downloadRows){const saved=group.ids.filter(id=>savedReadyIds?.includes(id)).length;label.textContent=`第 ${group.start}–${group.end} 词 · ${size(group.bytes)}`;button.textContent=saved===group.ids.length?'已保存':saved?`继续下载 ${saved}/${group.ids.length}`:'下载';button.disabled=Boolean(controller)||clearingThisPage||saved===group.ids.length;}}
 const openManager=()=>{host.querySelector('details').open=true;location.hash='/settings';refresh(true);};
 const modeButton=document.createElement('button');modeButton.type='button';modeButton.className='library-mode-button';modeButton.textContent=videoMode()==='none'?'使用视频':'纯文字';host.querySelector('[data-mode-description]').textContent=videoMode()==='none'?'纯文字':'视频与文字';modeButton.onclick=async()=>{await chooseVideoMode(videoMode()==='none'?'auto':'none');location.reload();};host.querySelector('[data-mode-action]').append(modeButton);
 async function refresh(checkCache=false){
  try{if(checkCache){const cache=await batchStatus();cachedPaths=cache.readyPaths||[];}const [library,storage]=await Promise.all([inspectLibrary(catalog,{cachedPaths}),storageStatus()]);savedReadyIds=library.readyIds;refreshDownloads();list.replaceChildren();const fraction=library.total?library.readyIds.length/library.total:0;bookmark.style.setProperty('--saved-progress',String(fraction));bookmark.querySelector('.library-rail-label').textContent=`${library.readyIds.length}/${library.total}`;bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(library.readyIds.length));bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuemax',String(library.total));bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuetext',`已完整保存 ${library.readyIds.length} / ${library.total} 词`);bookmark.title=`已保存 ${library.readyIds.length} / ${library.total} 词，打开设置`;bookmark.setAttribute('aria-label',`已完整保存 ${library.readyIds.length} / ${library.total} 词，打开设置`);host.querySelector('[data-saved-count]').textContent=library.readyIds.length;host.querySelector('[data-total-count]').textContent=library.total;host.querySelector('.library-packs').hidden=library.packs.length===0;
   for(const pack of library.packs){const li=document.createElement('li'),label=document.createElement('span'),button=document.createElement('button');const title=document.createElement('strong'),detail=document.createElement('span');title.textContent=`${pack.wordIds.length} 词`;detail.textContent=`${size(pack.bytes)} · ${pack.version}${!pack.available?' · 文件缺失，请重新导入':pack.ownedCurrentAssets===0?' · 当前未使用':''}`;label.className='library-pack-label';label.append(title,detail);button.type='button';button.textContent='移除';button.setAttribute('aria-label',`删除 ${pack.wordIds.length} 词的本机资源包`);button.disabled=Boolean(controller)||clearingThisPage;button.onclick=async()=>{if(!confirm(`删除这份本机资源包（${pack.wordIds.length} 词）？「文件」里的原始 ZIP 和其他资源包不会受影响。`))return;button.disabled=true;try{await deletePack(pack.key);status.textContent='本机资源包已删除，重新打开阅读后生效';await refresh();}catch(error){status.textContent=error.message;button.disabled=false;}};li.append(label,button);list.append(li);}
   clean.hidden=!library.packs.some(p=>p.ownedCurrentAssets===0);clean.disabled=Boolean(controller)||clearingThisPage;host.querySelector('[data-clear-all]').disabled=Boolean(controller)||clearingThisPage;
   space.textContent=storage.usage!==undefined?'占用 '+size(storage.usage):'存储空间暂不可读';
  }catch{space.textContent='暂时无法读取本机存储';}
 }
 clean.onclick=async()=>{if(controller||clearingThisPage)return;const unused=(await inspectLibrary(catalog)).packs.filter(p=>p.ownedCurrentAssets===0);if(!unused.length||!confirm(`清理 ${unused.length} 个当前未使用的书包？仍在使用的内容会保留。`))return;const count=await cleanUnusedPacks(catalog,unused.map(p=>p.key));status.textContent=`已清理 ${count} 个当前未使用的书包`;await refresh();};
 host.querySelector('[data-clear-all]').onclick=async()=>{if(controller||clearingThisPage)return;const library=await inspectLibrary(catalog,{cachedPaths});if(!confirm(`清除本机已保存的 ${library.readyIds.length} 词视频与插图，以及 ${library.packs.length} 个导入资源包？文字页面、阅读进度、偏好和「文件」里的原始 ZIP 会保留。`))return;if(controller||clearingThisPage)return;clearingThisPage=true;refreshDownloads();const button=host.querySelector('[data-clear-all]');button.disabled=true;input.disabled=true;modeButton.disabled=true;status.textContent='正在停止读取并清除本机资源…';try{sessionStorage.setItem('gre-media-paused-after-clear','1');const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-clear-library',{detail}));await Promise.all(detail.waits);await clearSavedResources();cachedPaths=[];sessionStorage.setItem('gre-library-cleared-message','1');location.reload();}catch(error){clearingThisPage=false;status.textContent=`清除未完成：${error.message}，可以重新尝试`;button.disabled=false;input.disabled=false;modeButton.disabled=false;await refresh(true);}};
 try{if(sessionStorage.getItem('gre-library-cleared-message')==='1'){sessionStorage.removeItem('gre-library-cleared-message');status.textContent='已清除本机视频与插图。视频暂时停用，选择「使用视频」或导入书包即可继续';}}catch{}
 host.querySelector('[data-reopen]').onclick=()=>location.reload();
 function cancelOperation(target){if(activeOperation?.target!==target)return;controller.abort();target.status.textContent='';target.cancel.disabled=true;}
 cancel.onclick=()=>cancelOperation(importTarget);
 function operationOptions(operation){return {signal:operation.controller.signal,onProgress:p=>{
  if(activeOperation!==operation||operation.controller.signal.aborted)return;
  const {progress,status}=operation.target;progress.max=p.total;progress.value=p.completed;
  status.textContent='';
 }};}
 async function run(kind,target,action){
  if(controller||clearingThisPage)return;
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
  refreshDownloads();await refresh();
  try{
   if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');
   await chooseVideoMode('auto');ticket=await sharedControl.ticket();
   const pack=await action(operationOptions(operation)),state=await sharedControl.state();
   if(controller.signal.aborted||state.paused||state.generation!==ticket)throw new DOMException('Cancelled','AbortError');
   const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));await Promise.all(detail.waits);activated=true;
   modeButton.textContent='纯文字';host.querySelector('[data-mode-description]').textContent='视频与文字';
   status.textContent='';
  }catch(error){status.textContent=controller.signal.aborted||error.name==='AbortError'?'':`未完成：${error.message}。已保存内容保留，可以${kind==='download'?'继续下载':'重新导入'}`;}
  finally{
   // A cancelled batch keeps verified completed files; activate those too. A clear
   // from another tab changes the generation and must never resurrect media.
   if(!activated&&ticket!==null){try{const state=await sharedControl.state();if(!state.paused&&state.generation===ticket){const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));await Promise.all(detail.waits);}}catch{}}
   controller=null;activeOperation=null;
   input.disabled=false;modeButton.disabled=false;input.value='';cancel.hidden=true;progress.hidden=true;await refresh(true);
  }
 }
 input.onchange=()=>{const file=input.files[0];if(file)return run('import',importTarget,options=>importPack(file,catalog,options));};
 host.querySelector('details').addEventListener('toggle',event=>{if(event.target.open)refresh();});
 let savedRefreshTimer,refreshingCache=false,refreshAgain=false;
 async function refreshSaved(){if(refreshingCache){refreshAgain=true;return;}refreshingCache=true;try{await refresh(true);}finally{refreshingCache=false;if(refreshAgain){refreshAgain=false;savedRefreshTimer=setTimeout(refreshSaved,500);}}}
 window.addEventListener('gre-offline-asset',({detail})=>{if(detail.phase==='saved'){clearTimeout(savedRefreshTimer);savedRefreshTimer=setTimeout(refreshSaved,600);}});
 window.addEventListener('gre-offline-corrupt',()=>{status.textContent='有一份本机内容无法读取，请重新导入对应书包；文字仍可阅读';clearTimeout(savedRefreshTimer);savedRefreshTimer=setTimeout(refreshSaved,500);});
 const sharedControl=createMediaControl(new URL('../',import.meta.url));
 sharedControl.subscribe(state=>{if(state.generation===0)return;if(state.paused){if(state.source==='external')controller?.abort();try{sessionStorage.setItem('gre-media-paused-after-clear','1');}catch{}modeButton.textContent='使用视频';host.querySelector('[data-mode-description]').textContent='纯文字 · 视频已暂停';}else{try{sessionStorage.removeItem('gre-media-paused-after-clear');}catch{}}if(state.source==='external'&&!clearingThisPage&&state.phase!=='clearing')location.reload();});sharedControl.state().catch(()=>{});
 let readinessTimer;
 async function checkTextReady(){clearTimeout(readinessTimer);const target=navigator.serviceWorker?.controller;if(!target){welcome.querySelector('[data-text-ready]').textContent='文字正在准备，请保持联网';readinessTimer=setTimeout(checkTextReady,3000);return;}const channel=new MessageChannel();let settled=false;const timer=setTimeout(()=>{if(!settled){channel.port1.close();readinessTimer=setTimeout(checkTextReady,3000);}},6000);channel.port1.onmessage=({data})=>{settled=true;clearTimeout(timer);channel.port1.close();const ready=data.ready&&data.build===OFFLINE_EDITION;welcome.querySelector('[data-text-ready]').textContent=ready?'文字已可离线 · '+catalog.entries.length+' 词':'文字正在准备，请保持联网';if(!ready)readinessTimer=setTimeout(checkTextReady,3000);else refresh(true);};target.postMessage({type:'GET_TEXT_STATUS'},[channel.port2]);}
 checkTextReady();navigator.serviceWorker?.addEventListener('controllerchange',checkTextReady);
}
