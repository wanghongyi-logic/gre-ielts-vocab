import {mountCompressionPreview} from './compression-preview-ui.js';
// Same document and storage context as the installed PWA. No work before click.
export function installCompressionSettings(host,catalog,{baseURL=new URL('../',import.meta.url)}={}){
 const row=document.createElement('div');row.className='library-action-row';
 const open=document.createElement('button');open.type='button';open.className='library-text-action';open.textContent='压缩预览';open.setAttribute('aria-expanded','false');
 const panel=document.createElement('section');panel.hidden=true;panel.setAttribute('aria-label','压缩预览');
 const close=document.createElement('button');close.type='button';close.className='library-text-action';close.textContent='关闭压缩预览';
 const previewHost=document.createElement('div');panel.append(close,previewHost);row.append(open);
 host.querySelector('[data-runtime-build]').before(row,panel);
 let preview=null,closing=null;
 function dismiss({focus=false}={}){
  panel.hidden=true;open.setAttribute('aria-expanded','false');
  if(preview){const prior=preview;preview=null;open.disabled=true;closing=Promise.resolve(prior.destroy()).finally(()=>{closing=null;open.disabled=false;});}
  if(focus)open.focus();return closing;
 }
 open.onclick=()=>{if(preview||closing)return;preview=mountCompressionPreview(previewHost,catalog,{baseURL});panel.hidden=false;open.setAttribute('aria-expanded','true');close.focus();};
 close.onclick=()=>dismiss({focus:true});
 const route=()=>{if(location.hash!=='#/settings')dismiss();};
 const hide=()=>dismiss();
 // Source mutation/clear retires any in-memory comparison, without blocking normal controls.
 window.addEventListener('hashchange',route);window.addEventListener('pagehide',hide);window.addEventListener('gre-clear-library',hide);
 return {dismiss,destroy(){dismiss();window.removeEventListener('hashchange',route);window.removeEventListener('pagehide',hide);window.removeEventListener('gre-clear-library',hide);row.remove();panel.remove();}};
}
