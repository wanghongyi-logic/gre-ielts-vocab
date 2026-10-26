import {savedRangeFields,bindSavedRange} from './offline-range.js';
import {exportSavedResources} from './offline-export.js';

// One successful output survives drawer collapse and same-page Settings mounts.
// Replacements are transactional: a failed attempt never retires that output.
let retainedSavedExport=null,retiredCleanup=Promise.resolve();
const retiredExports=new Set();
const catalogIdentity=catalog=>JSON.stringify([catalog.release??catalog.version??'',catalog.entries.map((entry,index)=>[entry.number,entry.displayOrdinal??index+1,...['video','poster','staticPoster'].map(role=>{const ref=entry.storyMedia?.[role];return ref?[ref.url,ref.bytes,ref.sha256]:null;})])]);
function retryRetired(){
 const pending=retiredCleanup.then(async()=>{for(const result of retiredExports){await result.cleanup();retiredExports.delete(result);}});
 retiredCleanup=pending.catch(()=>{});return pending;
}
function retireOutput(previous){
 if(previous&&!previous.retired){previous.retired=true;for(const asset of previous.assets)URL.revokeObjectURL(asset.url);previous.assets=[];retiredExports.add(previous.result);}
 return retryRetired();
}

export function mountSavedExport({host,catalog,isBusy,setBusy}){
 const section=document.createElement('div');
 section.className='library-export-row';
 section.innerHTML=`<details class="library-disclosure library-range-row" data-export-range><summary><span>导出已保存资源</span><span class="library-disclosure-mark" aria-hidden="true">+</span></summary><div class="library-disclosure-body">${savedRangeFields('export')}<p>所选范围每 100 词生成一个 ZIP，最后不足 100 词单独一包。缺资源的词会跳过，不跨包补齐；全缺资源的分段不生成文件。已压缩资源按原保存版本导出。生成后请逐包点击保存，并在浏览器或“文件”中确认。</p><div class="library-range-feedback"><button type="button" data-export-cancel hidden>取消导出</button><progress data-export-progress hidden aria-label="导出进度"></progress><p role="status" aria-live="polite" data-export-status></p><div data-export-files></div><button type="button" class="library-text-action" data-export-close hidden>收起导出文件</button></div></div></details>`;
 host.querySelector('.library-import-feedback').after(section);
 const button=section.querySelector('[data-export]'),cancel=section.querySelector('[data-export-cancel]'),progress=section.querySelector('[data-export-progress]'),status=section.querySelector('[data-export-status]'),files=section.querySelector('[data-export-files]'),close=section.querySelector('[data-export-close]');
 const range=bindSavedRange(section,catalog,{prefix:'export',verb:'导出',defaultAll:true}),key=catalogIdentity(catalog);
 let operation=null,output=retainedSavedExport?.catalogKey===key?retainedSavedExport:null,disposed=false,teardown=null;
 const abortError=()=>new DOMException('已取消导出','AbortError');
 const checkCancelled=current=>{if(disposed||current.controller.signal.aborted)throw abortError();};
 const summary=current=>{const selected=current.range.end-current.range.start+1,skipped=current.result.skipped??Math.max(0,selected-current.result.complete);return `选定 ${selected} 词 · 完整导出 ${current.result.complete} 词 · 缺资源未导出 ${skipped} 词 · ${current.result.packages.length} 个 ZIP 已生成，请逐包保存`;};
 function syncOutput(){files.hidden=Boolean(output?.collapsed);close.hidden=!output;close.textContent=files.hidden?'展开导出文件':'收起导出文件';close.setAttribute('aria-expanded',String(!files.hidden));}

 function renderOutput(current,target){
  const label=document.createElement('p');label.setAttribute('data-export-result','');
  label.textContent=`第 ${current.range.start}–${current.range.end} 词${current.version?` · 版本 ${current.version}`:''}${current.result.skippedOrdinals?.length?` · 未导出序号：${current.result.skippedOrdinals.slice(0,20).join('、')}${current.result.skippedOrdinals.length>20?'等':''}`:''}`;target.append(label);
  for(let i=0;i<current.result.packages.length;i++){
   const pack=current.result.packages[i],row=document.createElement('div');row.className='library-action-row';
   let asset=current.assets[i];
   if(!asset){const file=new File([pack.file],pack.name,{type:'application/zip'});asset={file,url:URL.createObjectURL(file)};current.assets.push(asset);}
   const {file,url}=asset,link=document.createElement('a');
   link.href=url;link.download=pack.name;link.className='library-text-action';link.textContent=`保存第 ${i+1}/${current.result.packages.length} 包 · ${pack.name}（${pack.words} 词）`;row.append(link);
   let canShare=false;try{canShare=Boolean(navigator.share&&navigator.canShare?.({files:[file]}));}catch{}
   if(canShare){
    const share=document.createElement('button');share.type='button';share.className='library-text-action';share.textContent='分享';
    share.onclick=async()=>{
     if(disposed||output!==current||share.disabled)return;share.disabled=true;
     try{await navigator.share({files:[file]});}
     catch(error){if(!disposed&&output===current&&!current.collapsed&&error?.name!=='AbortError')status.textContent='分享未完成，可以使用保存文件';}
     finally{share.disabled=false;}
    };row.append(share);
   }
   target.append(row);
  }
 }
 if(output){renderOutput(output,files);status.textContent=summary(output);syncOutput();}
 close.onclick=()=>{if(disposed||!output)return;output.collapsed=!output.collapsed;syncOutput();};
 cancel.onclick=()=>{operation?.controller.abort();cancel.disabled=true;};

 async function run(current){
  let candidate=null;
  try{
   // Retry a previous failed temporary cleanup before allocating another result.
   await retryRetired();checkCancelled(current);
   const action=()=>{
    checkCancelled(current);
    return exportSavedResources(catalog,{
     signal:current.controller.signal,range:current.range,
     onProgress:p=>{
      if(disposed||operation!==current||current.controller.signal.aborted)return;
      // This bar is explicitly per phase/package, never the library download or
      // study progress. Overall checked words remain monotonic across packs.
      progress.max=p.total||1;progress.value=p.completed;progress.setAttribute('aria-label',`第 ${p.packageIndex}/${p.packageTotal} 包${p.phase==='scan'?'检查':'写入'}进度`);status.textContent=`第 ${p.packageIndex}/${p.packageTotal} 包 · 第 ${p.range.start}–${p.range.end} 词 · ${p.phase==='scan'?'检查词条':'写入文件'} ${p.completed}/${p.total} · 总计已检查 ${p.scanned}/${p.selectedCount} 词${p.skipped?` · 缺资源未导出 ${p.skipped} 词`:''}`;
     }
    });
   };
   const result=navigator.locks?.request?await navigator.locks.request('gre-offline-pack-index-v1',{signal:current.controller.signal},action):await action();
   candidate={result,assets:[],catalogKey:key,range:current.range,version:catalog.release??catalog.version??'',collapsed:false};
   checkCancelled(current);
   const rendered=document.createElement('div');renderOutput(candidate,rendered);checkCancelled(current);
   const previous=retainedSavedExport;
   output=candidate;retainedSavedExport=candidate;candidate=null;
   files.replaceChildren(...Array.from(rendered.children));syncOutput();status.textContent=summary(output);
   // Only a complete, renderable replacement can retire the previous session.
   try{if(previous&&previous!==output)await retireOutput(previous);}catch(error){if(!disposed)status.textContent=`${summary(output)} · 清理旧文件未完成：${error.message}`;}
  }catch(error){
   let cleanupError;if(candidate){try{await retireOutput(candidate);}catch(cause){cleanupError=cause;}}
   if(!disposed){status.textContent=cleanupError?`清理临时文件未完成：${cleanupError.message}`:current.controller.signal.aborted||error?.name==='AbortError'?(output?`已取消本次导出 · ${summary(output)}`:'已取消导出'):`导出未完成：${error.message}`;syncOutput();}
  }finally{
   if(operation===current){operation=null;setBusy(false);range.sync(disposed||isBusy());cancel.hidden=true;progress.hidden=true;}
  }
 }
 button.onclick=()=>{
  if(disposed||operation||isBusy())return;
  let selected;try{selected=range.selection();}catch(error){status.textContent=error.message;return;}
  const current={controller:new AbortController(),range:{start:selected.start,end:selected.end},done:null};operation=current;
  range.sync(true);cancel.hidden=false;cancel.disabled=false;progress.hidden=false;progress.removeAttribute('value');status.textContent='';setBusy(true);
  current.done=run(current);return current.done;
 };
 return {
  busy:()=>Boolean(operation),
  sync:()=>range.sync(disposed||Boolean(operation)||isBusy()),
  cleanup:({discard=false}={})=>{
   if(!teardown){
    disposed=true;operation?.controller.abort();button.disabled=true;cancel.disabled=true;
    // Leaving Settings detaches only this UI. The successful session and its
    // URLs remain available to a later mount with the same catalog identity.
    teardown=(async()=>{await operation?.done;section.remove();})();
   }
   if(!discard)return teardown;
   return teardown.then(async()=>{const previous=output;output=null;if(retainedSavedExport===previous)retainedSavedExport=null;files.replaceChildren();if(previous)await retireOutput(previous);else await retryRetired();});
  }
 };
}
