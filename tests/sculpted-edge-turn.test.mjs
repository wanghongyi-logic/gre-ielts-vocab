import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {paperViewportBounds} from '../gre-learning/swipe.js';
import {installFrontmatterTurn,leafGeometry} from '../gre-learning/frontmatter-turn.js';
import {makeHarness} from '../qa/frontmatter/dom-harness.mjs';
const cases=[{width:375,left:0,edge:331},{width:390,left:0,edge:346},{width:760,left:24,edge:698},{width:1440,left:24,edge:1261}];
test('word-page curl is clipped at measured foreedge, including wide desktop margins',()=>{
 for(const {width,left,edge} of cases){
  const bounds=paperViewportBounds({left,top:0,width:width-left,right:width,bottom:1600},{left:0,top:0,width,height:812},0,edge);
  assert.equal(bounds.left+bounds.width,edge);assert.equal(bounds.height,812);
 }
 const zoom=paperViewportBounds({left:0,top:0,width:700,right:700,bottom:1600},{left:35,top:90,width:320,height:610},0,331);
 assert.deepEqual(zoom,{left:35,top:90,width:296,height:610});
 const noEdge=paperViewportBounds({left:0,top:0,width:375,bottom:1000},{width:375,height:812});assert.equal(noEdge.width,375);
});
test('both frontmatter directions leave the fixed page block outside one immediate 300 ms turn',()=>{
 for(const {width,left,edge} of cases)for(const direction of ['next','previous']){
  const h=makeHarness();h.win.innerWidth=width;h.main.box={left,top:0,width:width-left,height:1500};
  const foreedge=h.make('nav','',h.doc.body,'bookmarks paper-foreedge');foreedge.box={left:edge,top:16,width:44,height:780};foreedge.style.position='fixed';foreedge.style.left=`${edge}px`;foreedge.style.width='44px';
  const original=h.doc.querySelector.bind(h.doc);h.doc.querySelector=selector=>selector==='.bookmarks.paper-foreedge'?foreedge:original(selector);
  const before=foreedge.style.cssText;let commits=0;
  const turn=installFrontmatterTurn({main:h.main,window:h.win,document:h.doc});turn.begin({source:h.main,direction,prepare(){},commit:()=>commits++});
  const overlay=h.overlays[0];assert.equal(overlay.dataset.bookEdge,'sculpted');assert.equal(parseFloat(overlay.style.left)+parseFloat(overlay.style.width),edge);assert.equal(overlay.children.length,1);
  h.frame(16);assert.ok(Number(overlay.dataset.progress)>0);assert.equal(foreedge.style.cssText,before,'fixed paper layers are never transformed or clipped with the leaf');
  h.frame(284);assert.equal(commits,1);assert.equal(h.overlays.length,0);assert.equal(h.main.style.clipPath,'');assert.equal(foreedge.style.cssText,before);
 }
});
test('interrupt and interactive rollback remove only the moving leaf, not the page block',()=>{
 const h=makeHarness();const foreedge=h.make('nav','edge',h.doc.body,'bookmarks paper-foreedge');const original=h.doc.querySelector.bind(h.doc);h.doc.querySelector=s=>s==='.bookmarks.paper-foreedge'?foreedge:original(s);foreedge.box={left:331,top:16,width:44,height:780};
 let rollbacks=0;const turn=installFrontmatterTurn({main:h.main,window:h.win,document:h.doc});turn.begin({source:h.main,interactive:true,rollback:()=>rollbacks++});turn.paint(.4);turn.cancel();
 assert.equal(rollbacks,1);assert.equal(foreedge.isConnected,true);assert.equal(foreedge.style.clipPath,'');assert.equal(h.overlays.length,0);
});
test('turn reverse and shadow use the fixed page block palette without changing timing or video lifecycle',async()=>{
 const css=await readFile(new URL('../gre-learning/frontmatter-turn.css',import.meta.url),'utf8');assert.match(css,/--turn-paper:#faf5e9;--turn-depth:#eee5d3;--turn-seam:#b6a181/);assert.match(css,/\.paper-turn\[data-book-edge="sculpted"\]\{box-shadow:none\}/);
 const turn=await readFile(new URL('../gre-learning/frontmatter-turn.js',import.meta.url),'utf8');assert.match(turn,/300\*\(1-from\)/);assert.ok(!turn.includes('flutter'));
});

const points=clip=>[...clip.matchAll(/(-?[\d.]+)px (-?[\d.]+)px/g)].map(m=>[Number(m[1]),Number(m[2])]);
const polygonArea=vertices=>Math.abs(vertices.reduce((sum,[x,y],i)=>{const [nx,ny]=vertices[(i+1)%vertices.length];return sum+x*ny-nx*y;},0))/2;
test('outgoing face never leaks beyond its actual leaf and reaches exactly zero area',()=>{
 for(const direction of ['next','previous'])for(const width of [287,331,346,1237])for(const progress of [0,.25,.75,.89,.9,.95,.99,1]){
  const vertices=points(leafGeometry(progress,direction,width,812,{left:35,top:4400}).clip);
  for(const [x,y]of vertices){assert.ok(x>=35&&x<=35+width,`old face leaked at ${direction} ${progress}`);assert.ok(y>=4400&&y<=5212);}
  if(progress===1)assert.equal(polygonArea(vertices),0,'completed fold cannot retain an outgoing strip');
 }
});
test('tall scrolled Settings and Contents retire the whole old leaf, including the far gutter',()=>{
 for(const leaf of ['settings','contents'])for(const direction of ['next','previous']){
  const h=makeHarness();h.win.scrollY=4400;h.picker.open=true;h.picker.dataset.leaf=leaf;h.picker.box={left:0,top:0,width:375,height:11000};
  const foreedge=h.make('nav','edge',h.doc.body,'bookmarks paper-foreedge');foreedge.getBoundingClientRect=()=>({left:331,top:16,width:44,height:780});const original=h.doc.querySelector.bind(h.doc);h.doc.querySelector=s=>s==='.bookmarks.paper-foreedge'?foreedge:original(s);
  const turn=installFrontmatterTurn({main:h.main,window:h.win,document:h.doc});turn.begin({source:h.picker,direction,interactive:true,prepare(){h.picker.close();h.main.hidden=false;}});
  turn.paint(.99);const almost=points(h.picker.style.clipPath);assert.ok(almost.every(([x,y])=>x>=0&&x<=331&&y>=4400&&y<=5212));
  turn.paint(1);assert.equal(polygonArea(points(h.picker.style.clipPath)),0);turn.finish();
  assert.equal(h.picker.open,false);assert.equal(h.picker.classList.contains('frontmatter-live-leaf'),false);assert.equal(h.picker.style.clipPath,'');assert.equal(h.picker.style.display,'');assert.equal(h.main.hidden,false);assert.equal(h.overlays.length,0);assert.equal(foreedge.isConnected,true);
 }
});
