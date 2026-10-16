// The learning fraction is a reading position, never a mastery score.
export const PROGRESS_DISPLAY_KEY='gre-progress-display-v1';
export const normalizeProgressDisplay=value=>value==='learning'?'learning':'download';
export function readingProgress(text){
 const match=String(text||'').match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
 if(!match)return null;
 const current=Number(match[1]),total=Number(match[2]);
 return total>0&&current>0&&current<=total?{current,total,fraction:current/total}:null;
}
export function installProgressDisplay(doc,onChange){
 const win=doc.defaultView;
 let mode='download';try{mode=normalizeProgressDisplay(win.localStorage.getItem(PROGRESS_DISPLAY_KEY));}catch{}
 const host=doc.getElementById('offline-settings'),counter=doc.getElementById('word-counter');
 const row=doc.createElement('div');row.className='library-action-row progress-display-row';
 row.innerHTML='<h3>进度显示：</h3><div class="progress-display-options" role="group" aria-label="进度显示"><button type="button" class="library-text-action" data-progress-display="learning">学习</button><span aria-hidden="true"> / </span><button type="button" class="library-text-action" data-progress-display="download">下载</button></div>';
 const buttons=row.querySelectorAll('[data-progress-display]');
 const paint=()=>buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.progressDisplay===mode)));
 for(const button of buttons)button.addEventListener('click',()=>{
  const next=normalizeProgressDisplay(button.dataset.progressDisplay);if(next===mode)return;
  mode=next;try{win.localStorage.setItem(PROGRESS_DISPLAY_KEY,mode);}catch{}
  paint();onChange(true);
 });
 host?.querySelector('.mode-row')?.after(row);paint();
 const style=doc.createElement('link');style.rel='stylesheet';style.href=new URL('./progress-display.css',import.meta.url).href;doc.head.append(style);
 if(counter&&win?.MutationObserver)new win.MutationObserver(()=>onChange(true)).observe(counter,{childList:true,characterData:true,subtree:true});
 win?.addEventListener?.('storage',event=>{if(event.key!==PROGRESS_DISPLAY_KEY&&event.key!==null)return;mode=normalizeProgressDisplay(event.newValue);paint();onChange(true);});
 return {get mode(){return mode;},reading:()=>readingProgress(counter?.textContent)};
}
