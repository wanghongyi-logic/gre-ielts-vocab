import {mountCompressionPreview} from './compression-preview-ui.js';
// Match the export row. Collapsed settings do not scan, encode or load checkpoints.
export function installCompressionSettings(host,catalog,{baseURL=new URL('../',import.meta.url),isBusy=()=>false}={}){
 const row=document.createElement('details');row.className='library-disclosure library-range-row';
 row.innerHTML='<summary><span>按范围压缩</span><span class="library-disclosure-mark" aria-hidden="true">+</span></summary>';
 const body=document.createElement('div');row.append(body);host.querySelector('[data-runtime-build]').before(row);
 let panel=null,disposed=false;
 const open=()=>{if(row.open&&!panel&&!disposed)panel=mountCompressionPreview(body,catalog,{baseURL,isBusy});};row.addEventListener('toggle',open);
 const pause=()=>panel?.pause();window.addEventListener('pagehide',pause);window.addEventListener('gre-clear-library',pause);
 return {dismiss(){row.open=false;panel?.pause();},destroy(){disposed=true;row.removeEventListener('toggle',open);window.removeEventListener('pagehide',pause);window.removeEventListener('gre-clear-library',pause);row.remove();return panel?.destroy();}};
}
