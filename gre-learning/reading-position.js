import {installReadingScroll} from './reading-scroll.js';
// Canonical word numbers survive catalogue reordering; display ordinals do not.
export const READING_KEY='gre-learning-reading-v1';
const nonnegative=value=>Number.isFinite(value)&&value>=0?value:0;
const anchorOffset=value=>Number.isFinite(value)?Math.max(-64,value):0;
export function readReadingPosition(win,entries){
 let saved;
 try{saved=JSON.parse(win.localStorage.getItem(READING_KEY));}catch{}
 if(saved?.version===1&&entries.some(entry=>entry.number===saved.number))return {version:1,number:saved.number,section:typeof saved.section==='string'?saved.section:null,offset:anchorOffset(saved.offset),scrollY:nonnegative(saved.scrollY)};
 let legacy;try{legacy=Number(win.sessionStorage.getItem('gre-learning-current-v1'));}catch{}
 const number=entries.some(entry=>entry.number===legacy)?legacy:entries[0]?.number;
 return number==null?null:{version:1,number,section:null,offset:0,scrollY:0};
}
export function installReadingPosition({entries,surface,picker,getSelected,window:win=window,document:doc=document,scroll=installReadingScroll({surface,window:win,document:doc})}){
 let saved=readReadingPosition(win,entries);
 const initialWord=/^#\/?(?:learn\/)?(\d+)$/.exec(win.location.hash);
 // Reloading our own canonical URL resumes that word; a different deep link wins.
 let resume=!initialWord||Number(initialWord[1])===saved?.number,ready=false,writeTimer=null,dirty=false,layoutChanging=false,layoutFrame=0;
 function flush(){
  if(writeTimer!==null){win.clearTimeout(writeTimer);writeTimer=null;}
  if(!dirty)return;dirty=false;
  try{win.localStorage.setItem(READING_KEY,JSON.stringify(saved));}catch{}
  try{win.sessionStorage.setItem('gre-learning-current-v1',String(saved.number));}catch{}
 }
 function elements(){return [...doc.querySelectorAll('.bookmarks [data-section]')].map(link=>doc.getElementById(link.dataset.section)).filter(node=>node&&surface.contains(node));}
 function capture({force=false,defer=false}={}){
  if(resume||layoutChanging||!ready||picker.open||surface.hidden||surface.hasAttribute('data-contents-turning')||surface.hasAttribute('aria-busy'))return;
  const number=getSelected();if(!entries.some(entry=>entry.number===number))return;
  if(!force&&!new RegExp('^#/?(?:learn/)?'+number+'$').test(win.location.hash))return;
  const scrollY=nonnegative(scroll.metrics().scrollY),sections=elements();
  // Chapter jumps leave a small reading margin above the heading. Anchor to
  // that heading (with a signed inset), not to a previous chapter's long body.
  const section=scrollY<=1?sections.find(node=>node.id==='word-title'):sections.filter(node=>scroll.top(node)<=scrollY+Math.min(48,scroll.metrics().height*.08)).at(-1);
  saved={version:1,number,section:section?.id||null,offset:section?anchorOffset(scrollY-scroll.top(section)):0,scrollY};
  dirty=true;
  if(defer){if(writeTimer===null)writeTimer=win.setTimeout(flush,250);}else flush();
 }
 function restore(){
  if(!resume||!ready||picker.open||surface.hidden)return false;
  resume=false;
  if(saved?.number!==getSelected())return false;
  const section=elements().find(node=>node.id===saved.section);
  const atStart=saved.section==='word-title'&&saved.scrollY<=1&&saved.offset===0;
  const top=atStart?0:section?scroll.top(section)+saved.offset:saved.scrollY;
  scroll.to(top);
  return true;
 }
 scroll.onScroll(()=>capture({defer:true}));
 scroll.onLayout(()=>{
  // saved is updated on every genuine reading scroll. Re-measuring after the
  // media query changed would measure the new layout, losing the old anchor.
  if(!ready||saved?.number!==getSelected())return;
  layoutChanging=true;resume=true;win.cancelAnimationFrame(layoutFrame);
  layoutFrame=win.requestAnimationFrame(()=>{
   layoutFrame=win.requestAnimationFrame(()=>{layoutFrame=0;restore();layoutChanging=false;if(!picker.open)capture();});
  });
 });
 win.addEventListener('pagehide',()=>{capture();flush();});
 doc.addEventListener('visibilitychange',()=>{if(doc.visibilityState==='hidden'){capture();flush();}});
 return {remember:()=>saved?.number,position:number=>saved?.number===number?{scrollX:0,scrollY:saved.scrollY}:null,capture,restore,
  adopted(number){ready=true;if(saved?.number!==number)resume=false;if(!picker.open){restore();capture();}},
  // An explicit route selected while startup is pending always wins.
  route(hash){const match=/^#\/?(?:learn\/)?(\d+)$/.exec(hash);if(match&&!(picker.open&&Number(match[1])===saved?.number))resume=false;}};
}
