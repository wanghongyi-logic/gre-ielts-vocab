import {exportSavedResources} from './offline-export.js';

export function mountSavedExport({host,catalog,isBusy,setBusy}){
 const section=document.createElement('div');
 section.className='library-export-row';
 section.innerHTML='<div class="library-action-row"><button type="button" class="library-text-action" data-export>导出已保存资源 ↗</button></div><div class="library-import-feedback"><button type="button" data-export-cancel hidden>取消导出</button><progress data-export-progress hidden aria-label="导出进度"></progress><p role="status" aria-live="polite" data-export-status></p><div data-export-files></div><button type="button" class="library-text-action" data-export-close hidden>收起导出文件</button></div>';
 host.querySelector('.library-import-feedback').after(section);
 const button=section.querySelector('[data-export]'),cancel=section.querySelector('[data-export-cancel]'),progress=section.querySelector('[data-export-progress]'),status=section.querySelector('[data-export-status]'),files=section.querySelector('[data-export-files]'),close=section.querySelector('[data-export-close]');
 let operation=null,output=null,closing=null,disposed=false,teardown=null,cleanupTail=Promise.resolve();
 const retired=new Set();
 const abortError=()=>new DOMException('已取消导出','AbortError');
 const checkCancelled=current=>{if(disposed||current.controller.signal.aborted)throw abortError();};

 // Detach each output before awaiting its cleanup. Only this mount's URLs and
 // exporter-owned temporary session are retired; source storage is never touched.
 function discardOutput(){
  const previous=output;output=null;
  files.replaceChildren();close.hidden=true;
  if(previous){
   for(const url of previous.urls)URL.revokeObjectURL(url);
   retired.add(previous.result);
  }
  const pending=cleanupTail.then(async()=>{
   for(const result of retired){await result.cleanup();retired.delete(result);}
  });
  cleanupTail=pending.catch(()=>{});
  return pending;
 }

 function renderOutput(current){
  for(const pack of current.result.packages){
   const row=document.createElement('div');row.className='library-action-row';
   const file=new File([pack.file],pack.name,{type:'application/zip'}),url=URL.createObjectURL(file);
   current.urls.push(url);
   const link=document.createElement('a');
   link.href=url;link.download=pack.name;link.className='library-text-action';link.textContent=`保存 ${pack.name}`;
   row.append(link);
   // Sharing is optional. Some browsers expose canShare but throw for files.
   let canShare=false;
   try{canShare=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
   if(canShare){
    const share=document.createElement('button');share.type='button';share.className='library-text-action';share.textContent='分享';
    share.onclick=async()=>{
     if(disposed||output!==current||share.disabled)return;
     share.disabled=true;
     try{await navigator.share({files:[file]});}
     catch(error){if(!disposed&&output===current&&error?.name!=='AbortError')status.textContent='分享未完成，可以使用保存文件';}
     finally{share.disabled=false;}
    };
    row.append(share);
   }
   files.append(row);
  }
 }

 close.onclick=()=>{
  if(disposed||operation||closing)return;
  button.disabled=true;close.disabled=true;
  // Schedule after claiming the close operation so repeated clicks cannot race.
  closing=Promise.resolve().then(()=>discardOutput()).then(()=>{if(!disposed)status.textContent='';})
   .catch(error=>{if(!disposed)status.textContent=`清理导出文件未完成：${error.message}`;})
   .finally(()=>{closing=null;button.disabled=disposed;close.disabled=false;});
  return closing;
 };
 cancel.onclick=()=>{operation?.controller.abort();cancel.disabled=true;};

 async function run(current){
  try{
   await discardOutput();checkCancelled(current);
   const action=()=>{
    checkCancelled(current);
    return exportSavedResources(catalog,{
     signal:current.controller.signal,
     onProgress:p=>{
      if(disposed||operation!==current||current.controller.signal.aborted)return;
      progress.max=p.total;progress.value=p.completed;
     }
    });
   };
   const result=navigator.locks?.request
    ?await navigator.locks.request('gre-offline-pack-index-v1',{signal:current.controller.signal},action)
    :await action();
   output={result,urls:[]};
   checkCancelled(current);
   renderOutput(output);
   status.textContent=`已整理 ${result.complete} 词 · ${result.packages.length} 个包`;
   close.hidden=false;
  }catch(error){
   let cleanupError;
   if(output){try{await discardOutput();}catch(cause){cleanupError=cause;}}
   if(!disposed)status.textContent=cleanupError?`清理导出文件未完成：${cleanupError.message}`
    :current.controller.signal.aborted||error?.name==='AbortError'?'':`导出未完成：${error.message}`;
  }finally{
   if(operation===current){
    operation=null;setBusy(false);button.disabled=disposed;cancel.hidden=true;progress.hidden=true;
   }
  }
 }

 button.onclick=()=>{
  if(disposed||operation||closing||isBusy())return;
  // Claim both local and manager busy state before the first asynchronous step.
  const current={controller:new AbortController(),done:null};operation=current;
  button.disabled=true;cancel.hidden=false;cancel.disabled=false;progress.hidden=false;progress.removeAttribute('value');
  status.textContent='';close.hidden=true;setBusy(true);
  current.done=run(current);
  return current.done;
 };

 return {
  busy:()=>Boolean(operation||closing),
  cleanup:()=>{
   if(teardown)return teardown;
   disposed=true;operation?.controller.abort();button.disabled=true;cancel.disabled=true;
   // Wait for an in-flight export, including a queued Web Lock, before retiring
   // anything it returns. Cleanup is idempotent and never changes the route.
   teardown=(async()=>{
    await operation?.done;await closing;
    try{await discardOutput();}finally{section.remove();}
   })().catch(error=>{teardown=null;throw error;});
   return teardown;
  }
 };
}
