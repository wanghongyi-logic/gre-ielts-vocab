import {mountReleaseDownloads} from './offline-releases.js';
import {createMediaControl} from './offline-control.js';
import {batchStatus} from './offline-batch.js';
import {OFFLINE_EDITION,setMediaEdition,chooseVideoMode,videoMode} from './offline-preferences.js';
import {importPack,inspectLibrary,cleanUnusedPacks,clearSavedResources,deletePack,storageStatus} from './offline-packs.js';
const size=n=>(n/1024/1024).toFixed(1)+' MB';
export function installOfflineManager(catalog){
 setMediaEdition(catalog);let controller=null,cachedPaths=[],clearingThisPage=false,releaseDownloads=null,savedReadyIds=null;
 const host=document.createElement('section');host.className='offline-library';
 host.innerHTML=`<details class="library-page" open>
  <summary class="library-page-title">随身书库</summary>
  <div class="library-overview">
   <p class="library-eyebrow">已留在这台设备</p>
   <p class="library-count"><strong data-saved-count>—</strong><span> / <span data-total-count>210</span> 词</span></p>
   <progress data-library-progress max="210" value="0" aria-label="本机完整视频词库进度"></progress>
   <div class="library-overview-meta"><p class="library-caption" data-coverage>正在查看保存进度…</p><span data-saved-percent aria-hidden="true">—</span></div>
   <p class="library-space" data-space></p>
  </div>
  <div class="library-action-row import-row">
   <h3>导入本地文件</h3>
   <label class="offline-import">选择文件<span aria-hidden="true"> ↗</span><input type="file" accept=".zip,application/zip,application/octet-stream" aria-label="选择离线 ZIP 书包"></label>
  </div>
  <div class="library-import-feedback">
   <button type="button" data-cancel hidden>取消导入</button>
   <progress data-import-progress hidden aria-label="导入进度"></progress>
   <p role="status" aria-live="polite" data-status></p>
   <button type="button" data-reopen hidden>重新打开阅读 →</button>
  </div>
  <div class="library-action-row mode-row"><div><h3>阅读方式</h3><p data-mode-description></p></div><div data-mode-action></div></div>
  <details class="library-disclosure library-packs">
   <summary><span>已导入的书包</span><span class="library-disclosure-tail"><span data-pack-count>0 本</span><span class="library-disclosure-mark" aria-hidden="true">+</span></span></summary>
   <div class="library-disclosure-body"><ul data-packs></ul><p class="library-empty" data-empty-packs>还没有导入书包</p><button type="button" class="library-text-action" data-clean hidden>清理未使用的书包</button><button type="button" class="library-clear-action" data-clear-all>清除已保存资源</button></div>
  </details>
  <details class="library-disclosure library-help">
   <summary><span>离线阅读帮助</span><span class="library-disclosure-mark" aria-hidden="true">+</span></summary>
   <div class="library-disclosure-body">
    <p>上方只统计视频与插图都已保存的单词；重叠书包不会重复计数。正常阅读保存的内容也会计入。</p>
    <p>导入后，在飞行模式下打开几页，确认可以离线阅读。请在平时使用的浏览器或主屏幕应用中导入，两者的保存空间可能不同。</p>
    <p class="library-saved-note" data-import-note hidden>书包已保存为网站自己的本机副本。确认离线可读后，可删除「文件」里的原始 ZIP。</p>
    <p>清除网站数据会移除本机副本，请另留备份。存储数字由浏览器估算，系统仍可能清理离线内容。</p>
    <p data-storage-retention></p><button type="button" class="library-text-action" data-persist>尽量保留离线内容 →</button>
    <p>下载资源包后，在上方选择文件导入。</p>
   </div>
  </details>
 </details>`;
 host.id='offline-settings';host.setAttribute('aria-label','本机书库设置');host.classList.add('settings-leaf');host.hidden=true;document.querySelector('.contents-tools').after(host);
 const bookmark=document.createElement('button');bookmark.type='button';bookmark.id='open-settings';bookmark.className='library-rail';bookmark.setAttribute('aria-label','本地保存进度，打开设置');bookmark.setAttribute('aria-controls','word-picker');bookmark.setAttribute('aria-expanded','false');bookmark.innerHTML='<span class="library-rail-track" role="progressbar" aria-label="本机已保存单词" aria-valuemin="0" aria-valuemax="210" aria-valuenow="0"><span class="library-rail-fill"></span></span><span class="library-rail-label" aria-hidden="true">—</span>';const group=document.createElement('div');group.className='bookmark-tools';const contents=document.getElementById('open-search');contents.before(group);group.append(contents);group.after(bookmark);bookmark.onclick=()=>openManager();
 const welcome=document.createElement('div');welcome.className='settings-status';
 welcome.innerHTML='<p role="status" data-save-progress></p><p role="status" data-text-ready>正在准备文字离线…</p>';
 host.querySelector('.library-overview').append(welcome);
 const releaseStyle=document.createElement('link');releaseStyle.rel='stylesheet';releaseStyle.href=new URL('./offline-releases.css',import.meta.url).href;document.head.append(releaseStyle);
 const settingsStyle=document.createElement('link');settingsStyle.rel='stylesheet';settingsStyle.href=new URL('./settings-storybook.css',import.meta.url).href;document.head.append(settingsStyle);
 const input=host.querySelector('input'),cancel=host.querySelector('[data-cancel]'),progress=host.querySelector('[data-import-progress]'),status=host.querySelector('[data-status]'),list=host.querySelector('[data-packs]'),space=host.querySelector('[data-space]'),clean=host.querySelector('[data-clean]');
 const openManager=()=>{host.querySelector('details').open=true;location.hash='/settings';refresh(true);};
 const modeButton=document.createElement('button');modeButton.type='button';modeButton.className='library-mode-button';modeButton.textContent=videoMode()==='none'?'使用视频':'纯文字';host.querySelector('[data-mode-description]').textContent=videoMode()==='none'?'纯文字':'视频与文字';modeButton.onclick=async()=>{await chooseVideoMode(videoMode()==='none'?'auto':'none');location.reload();};host.querySelector('[data-mode-action]').append(modeButton);
 async function refresh(checkCache=false){
  try{if(checkCache){const cache=await batchStatus();cachedPaths=cache.readyPaths||[];}const [library,storage]=await Promise.all([inspectLibrary(catalog,{cachedPaths}),storageStatus()]);savedReadyIds=library.readyIds;releaseDownloads?.refreshCoverage();list.replaceChildren();host.querySelector('[data-library-progress]').max=library.total;host.querySelector('[data-library-progress]').value=library.readyIds.length;const fraction=library.total?library.readyIds.length/library.total:0;bookmark.style.setProperty('--saved-progress',String(fraction));bookmark.querySelector('.library-rail-label').textContent=Math.round(fraction*100)+'%';bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(library.readyIds.length));bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuemax',String(library.total));bookmark.querySelector('[role=progressbar]').setAttribute('aria-valuetext',`已完整保存 ${library.readyIds.length} / ${library.total} 词`);bookmark.title=`已保存 ${library.readyIds.length} / ${library.total} 词，打开设置`;bookmark.setAttribute('aria-label',`已完整保存 ${library.readyIds.length} / ${library.total} 词，打开设置`);host.querySelector('[data-saved-count]').textContent=library.readyIds.length;host.querySelector('[data-total-count]').textContent=library.total;host.querySelector('[data-coverage]').textContent='完整保存 · 视频与插图';host.querySelector('[data-saved-percent]').textContent=Math.round(fraction*100)+'%';host.querySelector('[data-pack-count]').textContent=library.packs.length+' 本';host.querySelector('[data-empty-packs]').hidden=library.packs.length>0;
   for(const pack of library.packs){const li=document.createElement('li'),label=document.createElement('span'),button=document.createElement('button');const title=document.createElement('strong'),detail=document.createElement('span');title.textContent=`${pack.wordIds.length} 词`;detail.textContent=`${size(pack.bytes)} · ${pack.version}${!pack.available?' · 文件缺失，请重新导入':pack.ownedCurrentAssets===0?' · 当前未使用':''}`;label.className='library-pack-label';label.append(title,detail);button.type='button';button.textContent='移除';button.setAttribute('aria-label',`删除 ${pack.wordIds.length} 词的本机资源包`);button.disabled=Boolean(controller);button.onclick=async()=>{if(!confirm(`删除这份本机资源包（${pack.wordIds.length} 词）？「文件」里的原始 ZIP 和其他资源包不会受影响。`))return;button.disabled=true;try{await deletePack(pack.key);status.textContent='本机资源包已删除，重新打开阅读后生效';await refresh();}catch(error){status.textContent=error.message;button.disabled=false;}};li.append(label,button);list.append(li);}
   clean.hidden=!library.packs.some(p=>p.ownedCurrentAssets===0);clean.disabled=Boolean(controller);host.querySelector('[data-clear-all]').disabled=Boolean(controller);
   space.textContent=[storage.usage!==undefined?'已用 '+size(storage.usage):'',storage.quota!==undefined?'可用约 '+size(Math.max(0,storage.quota-(storage.usage||0))):''].filter(Boolean).join(' · ')||'存储空间暂不可读';host.querySelector('[data-storage-retention]').textContent=storage.persistent?'已允许优先保留离线内容':'尚未获得优先保留权限';
  }catch{space.textContent='暂时无法读取本机存储';}
 }
 clean.onclick=async()=>{if(controller)return;const unused=(await inspectLibrary(catalog)).packs.filter(p=>p.ownedCurrentAssets===0);if(!unused.length||!confirm(`清理 ${unused.length} 个当前未使用的书包？仍在使用的内容会保留。`))return;const count=await cleanUnusedPacks(catalog,unused.map(p=>p.key));status.textContent=`已清理 ${count} 个当前未使用的书包`;await refresh();};
 host.querySelector('[data-clear-all]').onclick=async()=>{if(controller)return;const library=await inspectLibrary(catalog,{cachedPaths});if(!confirm(`清除本机已保存的 ${library.readyIds.length} 词视频与插图，以及 ${library.packs.length} 个导入资源包？文字页面、阅读进度、偏好和「文件」里的原始 ZIP 会保留。`))return;clearingThisPage=true;releaseDownloads?.refreshCoverage();const button=host.querySelector('[data-clear-all]');button.disabled=true;input.disabled=true;modeButton.disabled=true;status.textContent='正在停止读取并清除本机资源…';try{sessionStorage.setItem('gre-media-paused-after-clear','1');const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-clear-library',{detail}));await Promise.all(detail.waits);await clearSavedResources();cachedPaths=[];host.querySelector('[data-import-note]').hidden=true;sessionStorage.setItem('gre-library-cleared-message','1');location.reload();}catch(error){clearingThisPage=false;releaseDownloads?.refreshCoverage();status.textContent=`清除未完成：${error.message}，可以重新尝试`;button.disabled=false;input.disabled=false;modeButton.disabled=false;await refresh(true);}};
 try{if(sessionStorage.getItem('gre-library-cleared-message')==='1'){sessionStorage.removeItem('gre-library-cleared-message');status.textContent='已清除本机视频与插图。视频暂时停用，选择「使用视频」或导入书包即可继续';}}catch{}
 host.querySelector('[data-reopen]').onclick=()=>location.reload();
 cancel.onclick=()=>{controller?.abort();status.textContent='正在取消并清理未完成数据…';cancel.disabled=true;};
 const options=()=>({signal:controller.signal,onProgress:p=>{progress.max=p.total;progress.value=p.completed;status.textContent=p.phase==='verify'?`正在检查书包 ${Math.floor(p.completed/p.total*100)}%`:`写入本机 ${size(p.completed)} / ${size(p.total)}`;welcome.querySelector('[data-save-progress]').textContent=status.textContent;}});
 async function run(action){if(controller||clearingThisPage)return;host.querySelector('[data-import-note]').hidden=true;host.querySelector('[data-reopen]').hidden=true;controller=new AbortController();bookmark.classList.add('is-saving');input.disabled=true;cancel.hidden=false;cancel.disabled=false;progress.hidden=false;await refresh();status.textContent='正在准备，请保持应用在前台…';try{const pack=await action();await chooseVideoMode('auto');host.querySelector('[data-reopen]').hidden=false;host.querySelector('[data-import-note]').hidden=false;modeButton.textContent='纯文字';host.querySelector('[data-mode-description]').textContent='视频与文字';status.textContent=pack.duplicate?'这一本书包已经可用，无需重复占用空间':`已加入 ${pack.wordIds.length} 词。请重新打开阅读，并在飞行模式下检查`; }catch(error){status.textContent=controller.signal.aborted?'已取消，未完成数据已清理，原有书库保持不变':`未完成：${error.message}。原有书库保持不变，可以重新尝试`;}finally{controller=null;bookmark.classList.remove('is-saving');welcome.querySelector('[data-save-progress]').textContent='';input.disabled=false;input.value='';cancel.hidden=true;progress.hidden=true;await refresh();}}
 input.onchange=()=>{const file=input.files[0];if(file)run(()=>importPack(file,catalog,options()));};
 host.querySelector('[data-persist]').onclick=async()=>{try{const granted=await navigator.storage?.persist?.();status.textContent=granted?'已获准保留网站数据，请仍保留备份':'可以继续离线阅读，但系统仍可能清理已保存的内容';await refresh();}catch{status.textContent='浏览器无法请求持久存储，请保留备份';}};
 host.querySelector('details').addEventListener('toggle',event=>{if(event.target.open)refresh();});
 let savedRefreshTimer,refreshingCache=false,refreshAgain=false;const activeAssets=new Set();
 async function refreshSaved(){if(refreshingCache){refreshAgain=true;return;}refreshingCache=true;try{await refresh(true);}finally{refreshingCache=false;if(refreshAgain){refreshAgain=false;savedRefreshTimer=setTimeout(refreshSaved,500);}}}
 window.addEventListener('gre-offline-asset',({detail})=>{if(detail.phase==='start')activeAssets.add(detail.path);if(detail.phase==='end')activeAssets.delete(detail.path);bookmark.classList.toggle('is-saving',Boolean(controller)||activeAssets.size>0);if(!controller)welcome.querySelector('[data-save-progress]').textContent=activeAssets.size?`正在准备离线内容…`:'';if(detail.phase==='saved'){clearTimeout(savedRefreshTimer);savedRefreshTimer=setTimeout(refreshSaved,600);}});
 window.addEventListener('gre-offline-corrupt',()=>{const message='有一份本机内容无法读取，请重新导入对应书包；文字仍可阅读';status.textContent=message;welcome.querySelector('[data-save-progress]').textContent=message;clearTimeout(savedRefreshTimer);savedRefreshTimer=setTimeout(refreshSaved,500);});
 releaseDownloads=mountReleaseDownloads({host,catalog,getReadyIds:()=>savedReadyIds});
 const sharedControl=createMediaControl(new URL('../',import.meta.url));
 sharedControl.subscribe(state=>{if(state.generation===0)return;if(state.paused){if(state.source==='external')controller?.abort();try{sessionStorage.setItem('gre-media-paused-after-clear','1');}catch{}modeButton.textContent='使用视频';host.querySelector('[data-mode-description]').textContent='纯文字 · 视频已暂停';}else{try{sessionStorage.removeItem('gre-media-paused-after-clear');}catch{}}if(state.source==='external'&&!clearingThisPage&&state.phase!=='clearing')location.reload();});sharedControl.state().catch(()=>{});
 let readinessTimer;
 async function checkTextReady(){clearTimeout(readinessTimer);const target=navigator.serviceWorker?.controller;if(!target){welcome.querySelector('[data-text-ready]').textContent='文字正在准备，请保持联网';readinessTimer=setTimeout(checkTextReady,3000);return;}const channel=new MessageChannel();let settled=false;const timer=setTimeout(()=>{if(!settled){channel.port1.close();readinessTimer=setTimeout(checkTextReady,3000);}},6000);channel.port1.onmessage=({data})=>{settled=true;clearTimeout(timer);channel.port1.close();const ready=data.ready&&data.build===OFFLINE_EDITION;welcome.querySelector('[data-text-ready]').textContent=ready?'文字已可离线 · '+catalog.entries.length+' 词':'文字正在准备，请保持联网';if(!ready)readinessTimer=setTimeout(checkTextReady,3000);else refresh(true);};target.postMessage({type:'GET_TEXT_STATUS'},[channel.port2]);}
 checkTextReady();navigator.serviceWorker?.addEventListener('controllerchange',checkTextReady);
}
