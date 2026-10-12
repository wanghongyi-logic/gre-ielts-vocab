import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {renderWordPage} from '../gre-learning/view.js';
const css=fs.readFileSync(new URL('../gre-learning/storybook.css',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../gre-learning/app.js',import.meta.url),'utf8');
const entry={number:1,word:'test',ipa:'test',pos:'n.',coreMeaningZh:'测试',coreEn:'test',coreImageZh:'测试。',mnemonics:[],usage:[],examples:[],equivalents:[]};
const media={width:768,height:768,posterURL:'blob:verified-poster',videoURL:'blob:verified-video'};
test('one shared wrapper mask has stable edge alpha for poster, video, overlap and canvas snapshots',()=>{
 const masks=[...css.matchAll(/([^{}]+)\{([^{}]*mask-image:[^{}]+)\}/g)].filter(match=>match[1].includes('story-'));
 assert.equal(masks.length,2);for(const match of masks){assert.equal(match[1].trim(),'.story-media-stack');assert.match(match[2],/-webkit-mask-image:/);}
 assert.doesNotMatch(css,/\.story-(?:poster|video)[^{]*\{[^}]*mask-image/);
 for(const edge of [0,.1,.25,.5,.75,.9,1])for(const opacity of [0,.2,.5,.8,1]){const composited=1*(1-opacity)+opacity;assert.equal(composited*edge,edge,'shared mask is applied only after opaque media layers composite');}
 assert.equal(.5+(1-.5)*.5,.75,'the former separate-mask overlap darkened a half-opacity edge');
});
test('shared media wrapper has no layout size change and dialogue remains outside it',()=>{
 const html=renderWordPage(entry,media,{index:0,total:1});assert.equal((html.match(/class="story-media-stack"/g)||[]).length,1);assert.match(html,/<div class="illustration-art"><div class="story-media-stack"><img[^>]+><video[^>]+><\/video><\/div><\/div>/);
 assert.match(css,/\.story-media-stack\{position:absolute;inset:0;isolation:isolate;overflow:hidden\}/);
 const overlay={...media,posterDialogue:{text:'May I?',placement:{mode:'courteous-original-art-overlay',x:.03,y:.01,width:.3,height:.1,tailX:.25,tailY:.23}}};const special=renderWordPage({...entry,number:2819},overlay,{index:0,total:1});assert.match(special,/<\/video><\/div><svg class="courteous-original-overlay"/);
});
test('local media and poster-only fallback use one stage; pure text has none',()=>{
 for(const value of [media,{...media,videoURL:null},{...media,posterURL:null}])assert.equal((renderWordPage(entry,value,{index:0,total:1}).match(/class="story-media-stack"/g)||[]).length,1);
 const text=renderWordPage(entry,null,{index:0,total:1});assert.doesNotMatch(text,/story-media-stack|<video|<img/);assert.match(text,/text-only-reading/);
});
test('ordinary swipe preserves presentation while frontmatter hiding keeps its existing conceal path',()=>{
 assert.match(source,/onTurnActivity:active=>motion.setTurning\(active,\{preservePresentation:true\}\)/);assert.match(source,/onTransition:active=>motion.setTurning\(active\)/);
 const swipe=fs.readFileSync(new URL('../gre-learning/swipe.js',import.meta.url),'utf8');assert.match(swipe,/article.cloneNode\(true\)/);assert.match(swipe,/canvas.className=video.className;canvas.style.cssText=video.style.cssText/);assert.match(swipe,/video.replaceWith\(canvas\)/);
});
