import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {waitForLocal} from '../gre-learning/offline-async.js';
import {LessonLoader} from '../gre-learning/lesson-loader.js';

test('uncontrolled/offline reader loads verified text from disk without fetch or rewrite',async()=>{
 const bytes=Buffer.from('{"schema":1,"entries":[]}'),sha256=createHash('sha256').update(bytes).digest('hex'),ref={url:'units/test.json',bytes:bytes.length,sha256};let fetches=0,writes=0;
 const loader=new LessonLoader({entries:[]},{cacheStorage:{open:async()=>({match:async()=>new Response(bytes),put:async()=>writes++})},fetcher:async()=>{fetches++;throw Error('offline');}});
 assert.deepEqual(await loader.resource(ref),{schema:1,entries:[]});assert.equal(fetches,0);assert.equal(writes,0);loader.destroy();
});
test('corrupt disk text is rejected and a valid network copy repairs it',async()=>{
 const bytes=Buffer.from('{"schema":1,"entries":[]}'),sha256=createHash('sha256').update(bytes).digest('hex'),ref={url:'units/test.json',bytes:bytes.length,sha256};let fetches=0,writes=0;
 const loader=new LessonLoader({entries:[]},{cacheStorage:{open:async()=>({match:async()=>new Response('corrupt'),put:async()=>writes++})},fetcher:async()=>{fetches++;return new Response(bytes);}});
 await loader.resource(ref);assert.equal(fetches,1);assert.equal(writes,1);loader.destroy();
});
test('decoded poster makes a prepared page ready while its video decoder is stalled',async()=>{
 let finishVideo,disposed=0,reads=0;const poster={decode:async()=>{},naturalWidth:100},root={className:'',innerHTML:'',querySelectorAll:()=>[],querySelector:s=>s==='.story-poster'?poster:null,remove(){}};
 const source=(await readFile(new URL('../gre-learning/prepared-pages.js',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace('export function','function');
 const context=vm.createContext({waitForLocal,Map,Set,Promise,AbortController,DOMException,renderWordPage:()=>'',neighboringNumbers:()=>({previous:1,next:3}),installStoryMedia:()=>({refresh:()=>new Promise((resolve,reject)=>finishVideo=reject),prepareStaticPoster:()=>true,cancel(){},destroy(){disposed++;}})});
 vm.runInContext(source,context);
 const timers=new Map();let id=0;
 const pages=context.installPreparedPages({loader:{pair:async()=>{reads++;return {entry:{number:2},media:{}};},retainMedia(){}},entries:[1,2,3].map(number=>({number})),picker:{},window:{setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id)},document:{createElement:()=>root}});
 pages.keep(2);const page=await pages.prepare(2);assert.equal(page.ready,true);assert.equal(reads,1);assert.equal(timers.size,0);assert.ok(finishVideo);assert.equal(await pages.prepare(2),page);assert.equal(reads,1);
 await pages.destroy();assert.equal(disposed,1);finishVideo(new Error('Decoder cancelled after disposal'));await new Promise(resolve=>setImmediate(resolve));
});

test('all concurrent package-index readers retry when a mutation races the scan',async()=>{
 const source=await readFile(new URL('../gre-learning/offline-packs.js',import.meta.url),'utf8');const block=source.slice(source.indexOf('async function indexedAssets(){'),source.indexOf('\nconst verifiedSlices'));let scans=0,finish;
 const pack=path=>[{installedAt:1,files:[{path,sha256:'hash',bytes:1}]}];
 const context=vm.createContext({Map,Promise,assetIndex:null,indexRevision:0,listPacks:()=>++scans===1?new Promise(r=>finish=r):Promise.resolve(pack('new'))});vm.runInContext(block,context);
 const first=context.indexedAssets(),second=context.indexedAssets();context.indexRevision++;context.assetIndex=null;finish(pack('old'));for(const result of await Promise.all([first,second])){assert.equal(result.has('new|hash|1'),true);assert.equal(result.has('old|hash|1'),false);}assert.equal(scans,2);
});
