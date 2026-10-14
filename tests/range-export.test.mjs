// Synthetic local-only export fixtures. No real browser storage or media is used.
import test, {beforeEach, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {exportSavedResources} from '../gre-learning/offline-export.js';
import {indexZip, validatePack} from '../gre-learning/offline-zip.js';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const missing=()=>new DOMException('Missing fixture file','NotFoundError');
let state;
class Directory {
 constructor(path=''){this.path=path;this.kind='directory';this.children=new Map();}
 async getDirectoryHandle(name,{create=false}={}){
  state.storageReads++;
  let child=this.children.get(name);
  if(!child){if(!create)throw missing();child=new Directory(this.path+'/'+name);this.children.set(name,child);state.storageWrites++;}
  assert.equal(child.kind,'directory');return child;
 }
 async getFileHandle(name,{create=false}={}){
  state.storageReads++;
  let child=this.children.get(name);
  if(!child){if(!create)throw missing();child=new DiskFile(this.path+'/'+name);this.children.set(name,child);state.storageWrites++;}
  assert.equal(child.kind,'file');return child;
 }
 async removeEntry(name){state.storageWrites++;if(!this.children.delete(name))throw missing();}
 async *entries(){state.storageReads++;yield* this.children.entries();}
}
class DiskFile {
 constructor(path){this.path=path;this.kind='file';this.blob=new Blob();}
 async getFile(){state.storageReads++;return this.blob;}
 async createWritable(){
  state.storageWrites++;const parts=[];let offset=0,closed=false;
  return {
   write:async({position,data})=>{assert.equal(closed,false);assert.equal(position,offset);offset+=data.byteLength;parts.push(data.slice());state.storageWrites++;},
   close:async()=>{closed=true;this.blob=new Blob(parts);state.storageWrites++;},
   abort:async()=>{closed=true;parts.length=0;state.storageWrites++;}
  };
 }
}
function reset(){
 state={root:new Directory(),records:new Map(),cache:new Map(),storageReads:0,storageWrites:0,indexReads:0,indexWrites:0,cacheWrites:0,fetches:0};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{storage:{getDirectory:async()=>{state.storageReads++;return state.root;}}}});
 globalThis.indexedDB={open(){state.indexReads++;const request={};setImmediate(()=>{request.result={transaction(_name,mode){assert.equal(mode,'readonly');const tx={};tx.objectStore=()=>({getAll(){state.indexReads++;const req={};setImmediate(()=>{req.result=[...state.records.values()].map(record=>structuredClone(record));req.onsuccess?.();setImmediate(()=>tx.oncomplete?.());});return req;}});return tx;}};request.onsuccess?.();});return request;}};
 globalThis.caches={has:async name=>name==='gre-scalable-verified-units-v1',open:async name=>{
  assert.equal(name,'gre-scalable-verified-units-v1');return {
   match:async url=>state.cache.get(String(url))?.clone(),
   keys:async()=>[...state.cache.keys()].map(url=>({url})),
   put:async()=>{state.cacheWrites++;throw new Error('Export must not write source cache');},
   delete:async()=>{state.cacheWrites++;throw new Error('Export must not delete source cache');}
  };
 }};
 globalThis.fetch=async()=>{state.fetches++;throw new Error('Export must never fetch');};
}
beforeEach(reset);
afterEach(()=>assert.equal(state.fetches,0,'export must remain local-only'));

function fixture({permuted=true,sharedPoster=false}={}){
 const ids=[419,19,3701,802,64,2999,915],blobs=new Map();
 const byOrdinal=ids.map((number,index)=>{
  const displayOrdinal=index+1,storyMedia={};
  for(const [role,extension] of [['poster','webp'],['video','mp4'],['staticPoster','png']]){
   const tag=sharedPoster&&role==='poster'?'shared':displayOrdinal,url=`story-media/${role}-${tag}.${extension}`;
   const bytes=Buffer.from(`synthetic ${url} body`),ref={url,bytes:bytes.length,sha256:hash(bytes)};
   storyMedia[role]=ref;blobs.set(url,new Blob([bytes]));
  }
  return {number,displayOrdinal,storyMedia};
 });
 const entries=permuted?[3,0,5,1,6,4,2].map(index=>byOrdinal[index]):byOrdinal;
 return {catalog:{entries,units:[]},blobs,byOrdinal};
}
async function readPackages(result,catalog){
 const parsed=[];
 for(const pack of result.packages){
  const checked=await validatePack(pack.file,catalog);
  assert.equal(pack.words,checked.manifest.wordIds.length);
  assert.equal((await indexZip(pack.file)).size,checked.files.length+1);
  parsed.push(checked);
 }
 return parsed;
}
async function snapshots(blobs){return new Map(await Promise.all([...blobs].map(async([url,blob])=>[url,Buffer.from(await blob.arrayBuffer())])));}
async function unchanged(blobs,before){assert.equal(blobs.size,before.size);for(const [url,bytes] of before)assert.deepEqual(Buffer.from(await blobs.get(url).arrayBuffer()),bytes);}

for(const [label,start,end] of [['interior',2,5],['first boundary',1,2],['last boundary',6,7],['single word',4,4],['full range',1,7]]){
 test(`${label} selects display ordinals but retains full catalog word order and stable IDs`,async()=>{
  const f=fixture(),before=structuredClone(f.catalog),reads=[],progress=[];
  const targets=f.catalog.entries.filter(entry=>entry.displayOrdinal>=start&&entry.displayOrdinal<=end),allowed=new Set(targets.flatMap(entry=>Object.values(entry.storyMedia).map(ref=>ref.url)));
  const result=await exportSavedResources(f.catalog,{range:{start,end},readSource:ref=>{assert.ok(allowed.has(ref.url),'outside-range source read');reads.push(ref.url);return f.blobs.get(ref.url);},onProgress:p=>progress.push(p)});
  assert.equal(result.complete,end-start+1);assert.equal(result.skipped,0);assert.equal(result.packages.length,1);assert.equal(result.packages[0].name,`GRE-${start}-${end}.zip`);
  const [parsed]=await readPackages(result,f.catalog);
  assert.deepEqual(parsed.manifest.wordIds,targets.map(entry=>entry.number));
  assert.deepEqual(new Set(parsed.files.map(file=>file.wordId)),new Set(targets.map(entry=>entry.number)));
  assert.equal(parsed.files.length,targets.length*3);assert.equal(reads.length,targets.length*6);
  assert.deepEqual(progress.filter(p=>p.phase==='scan'),targets.map((_,i)=>({phase:'scan',completed:i+1,total:targets.length})));
  assert.deepEqual(progress.filter(p=>p.phase==='pack').at(-1),{phase:'pack',completed:targets.length*3+1,total:targets.length*3+1});
  assert.deepEqual(f.catalog,before);await result.cleanup();
 });
}

test('digit strings and original index fallback keep correct filename ordinals',async()=>{
 const f=fixture();for(const entry of f.catalog.entries)delete entry.displayOrdinal;
 const result=await exportSavedResources(f.catalog,{range:{start:'002',end:' 04 '},readSource:ref=>f.blobs.get(ref.url)});
 assert.equal(result.packages[0].name,'GRE-2-4.zip');
 assert.deepEqual((await readPackages(result,f.catalog))[0].manifest.wordIds,f.catalog.entries.slice(1,4).map(entry=>entry.number));
 await result.cleanup();
});

test('invalid endpoints and reversed/out-of-bounds ranges cause zero reads or writes',async()=>{
 const f=fixture();let reads=0,progress=0;
 const invalid=[0,-1,8,1.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1,true,false,null,undefined,'',' ','2.0','1e0','+1','0x1','-1','9007199254740992',[],[1],{},1n];
 const ranges=invalid.flatMap(value=>[{start:value,end:7},{start:1,end:value}]);
 ranges.push({start:5,end:2},{},null,false,1,'1-7');
 for(const range of ranges){
  await assert.rejects(exportSavedResources(f.catalog,{range,readSource:()=>{reads++;},onProgress:()=>{progress++;}}));
  assert.equal(reads,0);assert.equal(progress,0);assert.equal(state.storageReads,0);assert.equal(state.storageWrites,0);assert.equal(state.indexReads,0);assert.equal(state.cacheWrites,0);
 }
});

test('incomplete, duplicate, and noninteger ordinal coverage fails before source or storage access',async()=>{
 for(const change of [entries=>entries.splice(1,1),entries=>{entries[1].displayOrdinal=1;},entries=>{entries[1].displayOrdinal=2.5;},entries=>{entries[1].number=entries[0].number;}]){
  const f=fixture({permuted:false});change(f.catalog.entries);let reads=0;
  await assert.rejects(exportSavedResources(f.catalog,{range:{start:1,end:3},readSource:()=>{reads++;}}));
  assert.equal(reads,0);assert.equal(state.storageReads,0);assert.equal(state.storageWrites,0);
 }
});

test('missing and partially saved words are skipped only within the selected range',async()=>{
 const f=fixture(),range={start:2,end:6},progress=[];
 for(const ref of Object.values(f.byOrdinal[1].storyMedia))f.blobs.delete(ref.url);
 f.blobs.delete(f.byOrdinal[2].storyMedia.video.url);
 f.blobs.delete(f.byOrdinal[3].storyMedia.poster.url);
 const before=await snapshots(f.blobs),catalogBefore=structuredClone(f.catalog);
 const result=await exportSavedResources(f.catalog,{range,readSource:ref=>f.blobs.get(ref.url),onProgress:p=>progress.push(p)});
 assert.equal(result.complete,2);assert.equal(result.skipped,3);assert.equal(result.packages[0].name,'GRE-5-6.zip');
 const [parsed]=await readPackages(result,f.catalog);
 assert.deepEqual(parsed.manifest.wordIds,f.catalog.entries.filter(entry=>[5,6].includes(entry.displayOrdinal)).map(entry=>entry.number));
 assert.equal(parsed.files.length,6);assert.equal(progress.filter(p=>p.phase==='scan').at(-1).total,5);
 await unchanged(f.blobs,before);assert.deepEqual(f.catalog,catalogBefore);await result.cleanup();
});

test('every declared static poster must exist and pass its hash before a word exports',async()=>{
 for(const unavailable of ['missing','corrupt']){
  const f=fixture({permuted:false}),ref=f.byOrdinal[1].storyMedia.staticPoster;
  if(unavailable==='missing')f.blobs.delete(ref.url);
  else f.blobs.set(ref.url,new Blob([Buffer.alloc(ref.bytes,1)]));
  const result=await exportSavedResources(f.catalog,{range:{start:1,end:3},readSource:ref=>f.blobs.get(ref.url)});
  assert.equal(result.complete,2);assert.equal(result.skipped,1);
  const [parsed]=await readPackages(result,f.catalog);
  assert.deepEqual(parsed.manifest.wordIds,[f.byOrdinal[0].number,f.byOrdinal[2].number]);
  assert.equal(parsed.files.filter(file=>file.role==='staticPoster').length,2);await result.cleanup();
 }
});

test('no complete words in the range is an error even when outside words are fully saved',async()=>{
 const f=fixture(),allowed=new Set(f.byOrdinal.slice(1,3).flatMap(entry=>Object.values(entry.storyMedia).map(ref=>ref.url)));
 for(const entry of f.byOrdinal.slice(1,3))f.blobs.delete(entry.storyMedia.staticPoster.url);
 await assert.rejects(exportSavedResources(f.catalog,{range:{start:2,end:3},readSource:ref=>{assert.ok(allowed.has(ref.url));return f.blobs.get(ref.url);}}),/所选范围.*没有完整保存/);
 assert.equal(state.root.children.get('gre-offline-exports-v1')?.children.size,0);
});

test('shared media paths are exported once with an in-range owner and remain importer-compatible',async()=>{
 const f=fixture({sharedPoster:true}),reads=new Map(),before=await snapshots(f.blobs);
 const result=await exportSavedResources(f.catalog,{range:{start:2,end:4},readSource:ref=>{reads.set(ref.url,(reads.get(ref.url)||0)+1);return f.blobs.get(ref.url);}});
 const [parsed]=await readPackages(result,f.catalog),shared=parsed.files.filter(file=>file.path.endsWith('poster-shared.webp'));
 assert.equal(result.complete,3);assert.equal(parsed.files.length,7);assert.equal(shared.length,1);
 assert.equal(shared[0].wordId,f.byOrdinal[3].number);assert.equal(reads.get(f.byOrdinal[0].storyMedia.poster.url),2);
 assert.deepEqual(parsed.manifest.wordIds,[f.byOrdinal[3].number,f.byOrdinal[1].number,f.byOrdinal[2].number]);
 await unchanged(f.blobs,before);await result.cleanup();
});

test('range export keeps lazy re-read checksum protection when selected media changes',async()=>{
 for(const changed of ['missing','corrupt']){
  const f=fixture(),target=f.byOrdinal[3].storyMedia.video;let targetReads=0;
  await assert.rejects(exportSavedResources(f.catalog,{range:{start:4,end:4},readSource:ref=>{
   if(ref.url===target.url&&++targetReads===2)return changed==='missing'?null:new Blob([Buffer.alloc(ref.bytes,3)]);
   return f.blobs.get(ref.url);
  }}),/发生变化/);
  assert.equal(targetReads,2);assert.equal(state.root.children.get('gre-offline-exports-v1')?.children.size,0);
 }
});

test('no-range export retains all-word behavior, source order, skip counts, and filename',async()=>{
 const f=fixture({permuted:false});f.blobs.delete(f.byOrdinal[2].storyMedia.video.url);
 const before=await snapshots(f.blobs),progress=[];
 const result=await exportSavedResources(f.catalog,{readSource:ref=>f.blobs.get(ref.url),onProgress:p=>progress.push(p)});
 assert.equal(result.complete,6);assert.equal(result.skipped,1);assert.equal(result.packages[0].name,'GRE-1-7.zip');
 const [parsed]=await readPackages(result,f.catalog);assert.deepEqual(parsed.manifest.wordIds,f.catalog.entries.filter(entry=>entry!==f.byOrdinal[2]).map(entry=>entry.number));
 assert.equal(progress.filter(p=>p.phase==='scan').at(-1).total,7);await unchanged(f.blobs,before);await result.cleanup();
});

test('range and existing all-word export preserve the 200-word split and shared-asset deduplication',async()=>{
 const f=fixture(),shared=f.byOrdinal[0].storyMedia;
 const catalog={entries:Array.from({length:203},(_,i)=>({number:1000+i*13,displayOrdinal:i+1,storyMedia:shared})),units:[]};
 for(const range of [undefined,{start:2,end:202}]){
  const result=await exportSavedResources(catalog,{range,readSource:ref=>f.blobs.get(ref.url)});
  const parsed=await readPackages(result,catalog),expected=range?catalog.entries.slice(1,202):catalog.entries;
  assert.deepEqual(result.packages.map(pack=>pack.words),[200,expected.length-200]);
  assert.deepEqual(parsed.flatMap(pack=>pack.manifest.wordIds),expected.map(entry=>entry.number));
  assert.ok(parsed.every(pack=>pack.files.length===3));await result.cleanup();
 }
});

test('default local source combines cached and imported slices without changing either source',async()=>{
 const f=fixture({permuted:false}),parts=[],files=[];let offset=0;
 const imported=f.byOrdinal.filter(entry=>entry.displayOrdinal!==3);
 for(const entry of imported)for(const [role,ref] of Object.entries(entry.storyMedia)){
  const blob=f.blobs.get(ref.url);parts.push(blob);files.push({path:'gre-learning/'+ref.url,role,wordId:entry.number,bytes:ref.bytes,sha256:ref.sha256,start:offset});offset+=blob.size;
 }
 const original=new Blob(parts),sourceDir=new Directory('/gre-offline-packs-v1'),source=new DiskFile('/gre-offline-packs-v1/source.zip');source.blob=original;
 sourceDir.children.set('source.zip',source);state.root.children.set('gre-offline-packs-v1',sourceDir);
 state.records.set('synthetic@1',{key:'synthetic@1',name:'source.zip',installedAt:1,bytes:original.size,wordIds:imported.map(entry=>entry.number),files});
 for(const ref of Object.values(f.byOrdinal[2].storyMedia))state.cache.set(new URL('../gre-learning/'+ref.url,import.meta.url).href,new Response(f.blobs.get(ref.url)));
 const originalBytes=Buffer.from(await original.arrayBuffer()),recordBefore=structuredClone([...state.records]),cacheBefore=await Promise.all([...state.cache].map(async([url,response])=>[url,await response.clone().text()]));
 const result=await exportSavedResources(f.catalog,{range:{start:2,end:4}}),[parsed]=await readPackages(result,f.catalog);
 assert.deepEqual(parsed.manifest.wordIds,f.byOrdinal.slice(1,4).map(entry=>entry.number));assert.equal(parsed.files.length,9);
 assert.deepEqual([...state.records],recordBefore);assert.deepEqual(Buffer.from(await source.blob.arrayBuffer()),originalBytes);
 assert.deepEqual(await Promise.all([...state.cache].map(async([url,response])=>[url,await response.clone().text()])),cacheBefore);
 assert.equal(state.cacheWrites,0);assert.equal(state.indexWrites,0);await result.cleanup();
 assert.equal(sourceDir.children.get('source.zip'),source);assert.deepEqual(Buffer.from(await source.blob.arrayBuffer()),originalBytes);
 assert.equal(state.root.children.get('gre-offline-exports-v1')?.children.size,0);
});
