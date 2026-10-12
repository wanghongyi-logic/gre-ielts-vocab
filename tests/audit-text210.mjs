// Independent full-catalog text-only loading/rendering regression.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const base=fileURLToPath(new URL('../',import.meta.url));
globalThis.localStorage={getItem:()=> 'none'};
const {LessonLoader,expandCatalog}=await import(base+'gre-learning/lesson-loader.js');
const {renderWordPage}=await import(base+'gre-learning/view.js');
const catalog=expandCatalog(JSON.parse(await readFile(base+'gre-learning/catalog.json')));
const requests=[];
const loader=new LessonLoader(catalog,{baseURL:new URL('https://audit.test/gre-learning/'),cacheStorage:null,fetcher:async url=>{assert.match(url.pathname,/\/units\//);requests.push(url.pathname);return new Response(await readFile(base+url.pathname));}});
for(const [i,meta] of catalog.entries.entries()){const result=await loader.pair(meta.number);assert.equal(result.media,null);assert.equal(result.entry.word,meta.word);const html=renderWordPage(result.entry,result.media,{index:i,total:210});assert.ok(!html.includes('<video'));assert.ok(!html.includes('story-poster'));assert.ok(html.includes(meta.word));}
console.log('All210 text-only pages load, validate and render, no media fetch; unit requests:',requests.length);
