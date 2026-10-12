export const OFFLINE_EDITION='166-offline200-v8';
let mediaEdition='';
export function setMediaEdition(catalog){mediaEdition=catalog.entries.map(e=>[e.number,e.storyMedia?.video?.sha256,e.storyMedia?.poster?.sha256,e.storyMedia?.staticPoster?.sha256].join(':')).join('|');}
export function videoMode(){try{if(sessionStorage.getItem('gre-media-paused-after-clear')==='1')return 'none';}catch{}try{return localStorage.getItem('gre-video-mode-v1')||'auto';}catch{return 'auto';}}
export function chooseVideoMode(mode){try{sessionStorage.removeItem('gre-media-paused-after-clear');}catch{}if(mode==='auto'&&typeof navigator!=='undefined')navigator.serviceWorker?.controller?.postMessage({type:'RESUME_MEDIA_SAVE'});try{localStorage.setItem('gre-video-mode-v1',mode);localStorage.setItem('gre-offline-choice-media',mediaEdition);}catch{}}
// Text/layout releases do not re-prompt. An explicit no-video choice survives all updates.
export function needsOfflineChoice(){try{return videoMode()!=='none'&&localStorage.getItem('gre-offline-choice-media')!==mediaEdition;}catch{return true;}}
