// Ranges always refer to the current table of contents, never vocabulary IDs.
export function savedRangeLimit(catalog){
 return Math.max(0,...catalog.entries.map((entry,index)=>entry.displayOrdinal??index+1).filter(Number.isSafeInteger));
}
export function resolveSavedRange(catalog,startValue,endValue){
 const max=savedRangeLimit(catalog),parse=value=>['string','number'].includes(typeof value)&&/^\d+$/.test(String(value).trim())?Number(String(value).trim()):NaN;
 const start=parse(startValue),end=parse(endValue);
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||end<1||start>max||end>max)throw new Error(`请输入 1–${max} 的整数`);
 if(start>end)throw new Error('起始序号不能大于结束序号');
 const selected=catalog.entries.map((entry,index)=>({entry,ordinal:entry.displayOrdinal??index+1})).filter(({ordinal})=>ordinal>=start&&ordinal<=end).sort((a,b)=>a.ordinal-b.ordinal);
 const ids=selected.map(({entry})=>entry.number);
 if(selected.length!==end-start+1||selected.some(({ordinal},index)=>ordinal!==start+index)||new Set(ids).size!==ids.length)throw new Error('这段序号不在当前目录中');
 return {start,end,ids};
}
export function savedRangeFields(prefix){
 return `<div class="library-range-fields"><input type="number" inputmode="numeric" min="1" step="1" placeholder="起始" aria-label="起始词序号" data-${prefix}-start><span aria-hidden="true">–</span><input type="number" inputmode="numeric" min="1" step="1" placeholder="结束" aria-label="结束词序号" data-${prefix}-end><button type="button" class="library-text-action" data-${prefix}></button></div>`;
}
export function bindSavedRange(section,catalog,{prefix,verb,defaultAll=false}){
 const start=section.querySelector(`[data-${prefix}-start]`),end=section.querySelector(`[data-${prefix}-end]`),button=section.querySelector(`[data-${prefix}]`),status=section.querySelector(`[data-${prefix}-status]`);
 const max=savedRangeLimit(catalog);start.max=end.max=String(max);start.value=defaultAll&&max?'1':'';end.value=defaultAll&&max?String(max):'';
 let busy=false,selected=null;
 function sync(value=busy){
  busy=value;start.disabled=end.disabled=busy;selected=null;
  try{selected=resolveSavedRange(catalog,start.value,end.value);}catch{}
  button.textContent=selected?`${verb} ${selected.start}–${selected.end}`:verb;button.disabled=busy||!selected;
 }
 function edit(){
  if(busy)return;status.textContent='';sync();
  if(String(start.value).trim()&&String(end.value).trim()&&!selected){try{resolveSavedRange(catalog,start.value,end.value);}catch(error){status.textContent=error.message;}}
 }
 start.addEventListener('input',edit);end.addEventListener('input',edit);sync();
 return {sync,selection:()=>resolveSavedRange(catalog,start.value,end.value),button,start,end};
}
