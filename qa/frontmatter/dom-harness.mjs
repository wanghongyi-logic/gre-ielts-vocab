// Deliberately simulated DOM. This is not browser rendering or visual QA.
export class Events {
 constructor(){this.listeners=new Map();}
 addEventListener(type,fn,options){const entries=this.listeners.get(type)||[];entries.push({fn,options});this.listeners.set(type,entries);}
 removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)||[]).filter(entry=>entry.fn!==fn));}
 emit(type,properties={}){const event={type,target:this,cancelable:true,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...properties};for(const {fn}of this.listeners.get(type)||[]){fn(event);if(event.stopped)break;}return event;}
}
function style(){const values=new Map();return new Proxy({setProperty(name,value){values.set(name,String(value));},removeProperty(name){values.delete(name);},getPropertyValue(name){return values.get(name)||'';},getPropertyPriority(){return '';},get cssText(){return [...values].map(([key,value])=>`${key}:${value}`).join(';');}}, {get(target,key){if(key in target)return target[key];return values.get(String(key).replace(/[A-Z]/g,m=>'-'+m.toLowerCase()))||'';},set(target,key,value){values.set(String(key).replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),String(value));return true;}});}
class Classes {
 constructor(node){this.node=node;}
 list(){return this.node.className.split(/\s+/).filter(Boolean);}
 contains(name){return this.list().includes(name);}
 add(...names){this.node.className=[...new Set([...this.list(),...names])].join(' ');}
 remove(...names){this.node.className=this.list().filter(name=>!names.includes(name)).join(' ');}
 toggle(name,force){const add=force??!this.contains(name);add?this.add(name):this.remove(name);return add;}
}
export class Element extends Events {
 constructor(tag,doc){super();this.tagName=tag.toUpperCase();this.ownerDocument=doc;this.nodeType=1;this.childNodes=[];this.style=style();this.attributes=new Map();this.className='';this.classList=new Classes(this);this.dataset={};this.hidden=false;this.inert=false;this.open=false;this.value='';this.checked=false;this.textContent='';this.clientWidth=375;this.capture=new Set();this.box={left:0,top:0,width:375,height:1500};}
 get id(){return this.attributes.get('id')||'';}set id(value){this.attributes.set('id',value);}
 get children(){return this.childNodes.filter(node=>node.nodeType===1);}
 get isConnected(){return this===this.ownerDocument?.body||Boolean(this.parentNode?.isConnected);}
 setAttribute(name,value){if(name==='class')this.className=value;else this.attributes.set(name,String(value));}
 getAttribute(name){return name==='class'?this.className:this.attributes.get(name)??null;}
 hasAttribute(name){return this.attributes.has(name);}
 removeAttribute(name){this.attributes.delete(name);}
 append(...nodes){for(const node of nodes){node.remove?.();this.childNodes.push(node);node.parentNode=this;}}
 after(node){const parent=this.parentNode;if(!parent)return;node.remove?.();const index=parent.childNodes.indexOf(this);parent.childNodes.splice(index+1,0,node);node.parentNode=parent;}
 remove(){if(this.parentNode)this.parentNode.childNodes=this.parentNode.childNodes.filter(node=>node!==this);this.parentNode=null;}
 contains(node){return node===this||this.childNodes.some(child=>child.contains?.(node));}
 matches(selector){return selector.split(',').some(part=>{part=part.trim();if(part==='button:not(.word-result)')return this.tagName==='BUTTON'&&!this.classList.contains('word-result');if(part.startsWith('.'))return this.classList.contains(part.slice(1));if(part.startsWith('#'))return this.id===part.slice(1);const attr=/^\[([\w-]+)(?:="?([^"\]]+)"?)?\]$/.exec(part);if(attr)return this.hasAttribute(attr[1])&&(!attr[2]||this.getAttribute(attr[1])===attr[2]);return this.tagName.toLowerCase()===part;});}
 closest(selector){return this.matches(selector)?this:this.parentNode?.closest?.(selector)||null;}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 querySelectorAll(selector){const result=[];for(const node of this.children){if(node.matches(selector))result.push(node);result.push(...node.querySelectorAll(selector));}return result;}
 cloneNode(deep){const clone=new Element(this.tagName,this.ownerDocument);clone.className=this.className;clone.attributes=new Map(this.attributes);clone.hidden=this.hidden;clone.open=this.open;clone.value=this.value;clone.checked=this.checked;clone.box={...this.box};clone.textContent=this.textContent;if(deep)for(const child of this.childNodes)clone.append(child.cloneNode(true));return clone;}
 getBoundingClientRect(){const win=this.ownerDocument.defaultView;const fixed=this.style.position==='fixed';const left=fixed?parseFloat(this.style.left)||0:this.box.left-win.scrollX;const top=fixed?parseFloat(this.style.top)||0:this.box.top-win.scrollY;const width=fixed?parseFloat(this.style.width)||this.box.width:this.box.width;return {left,top,width,height:this.box.height,right:left+width,bottom:top+this.box.height};}
 focus(){this.ownerDocument.activeElement=this;}
 show(){this.open=true;}
 close(){this.open=false;this.emit('close');}
 setPointerCapture(id){this.capture.add(id);}hasPointerCapture(id){return this.capture.has(id);}releasePointerCapture(id){this.capture.delete(id);this.emit('lostpointercapture',{pointerId:id});}
}
export function makeHarness({reduced=false,styled=true}={}){
 const win=new Events(),doc=new Events();let now=0,nextId=0,hash='#/learn/12';const frames=new Map(),timers=new Map(),hashEvents=[];
 Object.assign(win,{innerWidth:375,innerHeight:812,scrollX:0,scrollY:0,performance:{now:()=>now},history:{scrollRestoration:'auto',replaceState(_state,_unused,value){hash=value;}},requestAnimationFrame(fn){const id=++nextId;frames.set(id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);},setTimeout(fn,delay){const id=++nextId;timers.set(id,{fn,at:now+delay});return id;},clearTimeout(id){timers.delete(id);},scrollTo({top=0,left=0}){win.scrollX=left;win.scrollY=top;},getSelection:()=>({toString:()=>''}),getComputedStyle:()=>({getPropertyValue:()=>styled?'1':''})});
 const preference=new Events();preference.matches=reduced;win.matchMedia=()=>preference;
 win.location={get hash(){return hash;},set hash(value){const next=value.startsWith('#')?value:'#'+value;if(next!==hash){hash=next;hashEvents.push(()=>win.emit('hashchange'));}}};
 Object.assign(doc,{defaultView:win,hidden:false,title:'abate · 单词故事',createElement:tag=>new Element(tag,doc),getElementById(id){return doc.body.querySelector('#'+id);},querySelector(selector){return doc.body.querySelector(selector);},querySelectorAll(selector){return doc.body.querySelectorAll(selector);}});
 doc.documentElement=new Element('html',doc);doc.body=new Element('body',doc);doc.activeElement=doc.body;
 const make=(tag,id,parent=doc.body,classes='')=>{const node=doc.createElement(tag);node.id=id;node.className=classes;parent.append(node);return node;};
 const main=make('main','word-content');make('article','',main,'reading-layout');
 const opener=make('button','open-search');const settings=make('button','open-settings');
 const picker=make('dialog','word-picker',doc.body,'contents-page');const sheet=make('div','',picker,'contents-sheet');const title=make('h1','picker-title',sheet);const tools=make('div','',sheet,'contents-tools');const label=make('label','',tools,'search-field');const search=make('input','word-search',label);const heading=make('div','',sheet,'contents-list-heading');const count=make('p','search-count',heading);const results=make('ol','word-results',sheet);const host=make('section','offline-settings',sheet);make('details','',host);
 function frame(ms=16){now+=ms;const work=[...frames.values()];frames.clear();for(const fn of work)fn(now);for(const [id,timer]of [...timers])if(timer.at<=now){timers.delete(id);timer.fn();}}
 function drain(limit=100){let i=0;while((frames.size||hashEvents.length)&&i++<limit){while(hashEvents.length)hashEvents.shift()();if(frames.size)frame();}if(i>=limit)throw new Error('Simulation did not settle');}
 return {win,doc,main,picker,search,title,opener,count,results,host,settings,make,preference,frame,drain,hashes(){while(hashEvents.length)hashEvents.shift()();},get overlays(){return doc.querySelectorAll('.frontmatter-turn');},set now(value){now=value;}};
}
