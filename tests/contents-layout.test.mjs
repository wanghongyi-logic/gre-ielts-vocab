import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {centeredContentsScrollTop} from '../gre-learning/contents.js';

test('a current row is centered below the sticky directory header',()=>{
 const top=centeredContentsScrollTop({scrollY:0,rowTop:2020,rowHeight:90,viewportTop:20,viewportHeight:800,headerHeight:100});
 assert.equal(top,1595);
 assert.equal(2020-top+45,20+100+(800-100)/2);
});

test('portrait centering respects visual viewport displacement and a taller stacked search',()=>{
 const top=centeredContentsScrollTop({scrollY:500,rowTop:1500,rowHeight:110,viewportTop:20,viewportHeight:600,headerHeight:140});
 assert.equal(top,1665);
 assert.equal(centeredContentsScrollTop({rowTop:60,rowHeight:90,viewportHeight:800,headerHeight:100}),0,'first rows must not create negative scrolling');
});

test('legacy no-header centering and very short viewports remain bounded',()=>{
 assert.equal(centeredContentsScrollTop({scrollY:500,rowTop:400,rowHeight:100,viewportHeight:800}),550);
 assert.equal(centeredContentsScrollTop({rowTop:500,rowHeight:100,viewportHeight:300,headerHeight:500}),250);
});

test('directory-only styles use one column, sticky search and readable touch input',async()=>{
 const css=await readFile(new URL('../gre-learning/contents-layout.css',import.meta.url),'utf8');
 assert.match(css,/\.contents-sticky-header\s*\{\s*position:sticky;top:0/);
 assert.match(css,/\.word-results\s*\{[^}]*column-count:1/s);
 assert.match(css,/\.search-field input\s*\{[^}]*font-size:16px/s);
 assert.match(css,/\.word-result\s*\{[^}]*min-height:86px/s);
 assert.ok(!css.includes('[data-leaf="settings"]'),'the settings leaf keeps its original layout');
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 const header=html.slice(html.indexOf('<div class="contents-sticky-header">'),html.indexOf('<div class="contents-list-heading">'));
 assert.ok(header.includes('id="picker-title"')&&header.includes('id="word-search"'));
});
