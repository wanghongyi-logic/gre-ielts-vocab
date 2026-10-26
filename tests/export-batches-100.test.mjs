import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {exportSavedResources} from '../gre-learning/offline-export.js';
import {validatePack,indexZip} from '../gre-learning/offline-zip.js';
const digest=b=>createHash('sha256').update(b).digest('hex');
function fixture(count,{offset=0,missing=[],shared=false,size=24,reverse=false}={}){
 const blobs=new Map(),entries=[];
 for(let i=0;i<count;i++){
  const ordinal=i+1+offset,number=7000+i*3,storyMedia={};
  for(const role of ['video','poster','staticPoster']){
   const key=shared&&role==='poster'?'shared-poster':`${ordinal}-${role}`,bytes=Buffer.alloc(size,key);
   const url=`story-media/${key}.bin`;storyMedia[role]={url,bytes:bytes.length,sha256:digest(bytes)};blobs.set(url,new Blob([bytes]));
  }
  entries.push({number,displayOrdinal:ordinal,storyMedia});
 }
 if(reverse)entries.reverse();
 const catalog={entries,units:[],version:'test'};
 return {catalog,readSource:async ref=>missing.includes(entries.find(e=>e.number===ref.wordId)?.displayOrdinal)?null:blobs.get(ref.url),blobs};
}
async function verify(result,catalog,expectedNames,expectedIds){
 assert.deepEqual(result.packages.map(p=>p.name),expectedNames);
 const ids=[],packIds=[];
 for(const p of result.packages){
  assert.ok(p.words>0&&p.words<=100);
  const parsed=await validatePack(p.file,catalog);ids.push(...parsed.manifest.wordIds);packIds.push(parsed.manifest.packId);
  assert.equal(parsed.manifest.wordIds.length,p.words);
  const index=await indexZip(p.file);
  assert.equal(index.size,parsed.files.length+1);
  for(const e of catalog.entries.filter(e=>parsed.manifest.wordIds.includes(e.number)))for(const ref of Object.values(e.storyMedia))assert.ok(index.has('gre-learning/'+ref.url));
 }
 assert.deepEqual(ids,expectedIds);assert.equal(new Set(ids).size,ids.length);assert.equal(new Set(packIds).size,packIds.length);
 await result.cleanup();await result.cleanup();
}
for(const count of [1,99,100,101,200,201])test(`${count} complete words: boundaries, names, hashes and each ZIP validator`,async()=>{
 const {catalog,readSource}=fixture(count),progress=[];
 const result=await exportSavedResources(catalog,{readSource,onProgress:p=>progress.push(p)});
 const names=Array.from({length:Math.ceil(count/100)},(_,i)=>`GRE-${i*100+1}-${Math.min(count,(i+1)*100)}.zip`);
 assert.equal(result.complete,count);assert.equal(result.skipped,0);
 assert.ok(progress.every((p,i)=>!i||p.scanned>=progress[i-1].scanned));
 assert.equal(progress.at(-1).scanned,count);
 assert.ok(progress.every(p=>p.completed<=p.total&&p.packageIndex>=1&&p.packageIndex<=p.packageTotal&&p.range.end-p.range.start<100));
 assert.deepEqual(new Set(progress.map(p=>p.phase)),new Set(['scan','pack']));
 await verify(result,catalog,names,catalog.entries.map(e=>e.number));
});
test('0 words: no ZIP and explicit zero-count error',async()=>{
 const {catalog,readSource}=fixture(0);await assert.rejects(exportSavedResources(catalog,{readSource}),e=>e.complete===0&&e.selectedCount===0&&e.skipped===0);
});
test('custom 51–251: anchored windows and one-word tail with stable IDs',async()=>{
 const {catalog,readSource}=fixture(300),result=await exportSavedResources(catalog,{readSource,range:{start:51,end:251}});
 await verify(result,catalog,['GRE-51-150.zip','GRE-151-250.zip','GRE-251-251.zip'],catalog.entries.slice(50,251).map(e=>e.number));
});
test('custom 78–202: shorter final batch',async()=>{
 const {catalog,readSource}=fixture(250),result=await exportSavedResources(catalog,{readSource,range:{start:78,end:202}});
 assert.deepEqual(result.packages.map(p=>p.words),[100,25]);
 await verify(result,catalog,['GRE-78-177.zip','GRE-178-202.zip'],catalog.entries.slice(77,202).map(e=>e.number));
});
test('shared media is self-contained in both ZIPs',async()=>{
 const {catalog,readSource}=fixture(101,{shared:true}),result=await exportSavedResources(catalog,{readSource});
 for(const p of result.packages)assert.ok((await indexZip(p.file)).has('gre-learning/story-media/shared-poster.bin'));
 await verify(result,catalog,['GRE-1-100.zip','GRE-101-101.zip'],catalog.entries.map(e=>e.number));
});
test('missing first and last words do not move range boundaries',async()=>{
 const missing=[1,100,101,200,201],{catalog,readSource}=fixture(201,{missing}),result=await exportSavedResources(catalog,{readSource});
 assert.equal(result.skipped,5);assert.deepEqual(result.skippedOrdinals,missing);assert.equal(result.complete,196);assert.deepEqual(result.packages.map(p=>p.words),[98,98]);
 await verify(result,catalog,['GRE-1-100.zip','GRE-101-200.zip'],catalog.entries.filter(e=>!missing.includes(e.displayOrdinal)).map(e=>e.number));
});
test('empty middle window creates no empty ZIP and does not fill across windows',async()=>{
 const missing=Array.from({length:100},(_,i)=>101+i),{catalog,readSource}=fixture(201,{missing}),result=await exportSavedResources(catalog,{readSource});
 assert.equal(result.plannedPackages,3);assert.deepEqual(result.packages.map(p=>p.packageIndex),[1,3]);assert.deepEqual(result.packages.map(p=>p.words),[100,1]);
 await verify(result,catalog,['GRE-1-100.zip','GRE-201-201.zip'],catalog.entries.filter(e=>!missing.includes(e.displayOrdinal)).map(e=>e.number));
});
test('all selected resources missing returns missing count, not empty file',async()=>{
 const {catalog,readSource}=fixture(101,{missing:Array.from({length:101},(_,i)=>i+1)});
 await assert.rejects(exportSavedResources(catalog,{readSource,range:{start:1,end:101}}),e=>e.selectedCount===101&&e.complete===0&&e.skipped===101&&e.skippedOrdinals.length===101);
});
test('stable catalog ordering preserved inside each manifest, no ordinal renumbering',async()=>{
 const {catalog,readSource}=fixture(101,{reverse:true}),result=await exportSavedResources(catalog,{readSource,range:{start:1,end:101}});
 await verify(result,catalog,['GRE-1-100.zip','GRE-101-101.zip'],[...catalog.entries.filter(e=>e.displayOrdinal<=100),...catalog.entries.filter(e=>e.displayOrdinal===101)].map(e=>e.number));
});
test('invalid range rejected before any source read',async()=>{
 const {catalog}=fixture(201);let reads=0;
 for(const range of [{start:0,end:1},{start:1,end:202},{start:20,end:1},{start:1.5,end:2}])await assert.rejects(exportSavedResources(catalog,{range,readSource:()=>{reads++;}}));assert.equal(reads,0);
});
test('cancel while scanning second package, then retry succeeds',async()=>{
 const {catalog,readSource}=fixture(101),controller=new AbortController();let reached=false;
 await assert.rejects(exportSavedResources(catalog,{readSource,signal:controller.signal,onProgress:p=>{if(p.packageIndex===2&&p.phase==='scan'){reached=true;controller.abort();}}}),{name:'AbortError'});assert.ok(reached);
 const result=await exportSavedResources(catalog,{readSource});await verify(result,catalog,['GRE-1-100.zip','GRE-101-101.zip'],catalog.entries.map(e=>e.number));
});
test('error in second package is recoverable, no partial success returned',async()=>{
 const {catalog,readSource}=fixture(101);let failed=false;
 await assert.rejects(exportSavedResources(catalog,{readSource:async ref=>{if(ref.wordId===catalog.entries[100].number){failed=true;throw Error('read failed');}return readSource(ref);}}),/read failed/);assert.ok(failed);
 const result=await exportSavedResources(catalog,{readSource});await verify(result,catalog,['GRE-1-100.zip','GRE-101-101.zip'],catalog.entries.map(e=>e.number));
});
test('mutation between scan and write fails checksum instead of exporting corrupt data',async()=>{
 const {catalog,readSource}=fixture(1);let count=0;
 await assert.rejects(exportSavedResources(catalog,{readSource:async ref=>{const b=await readSource(ref);count++;return count>3?new Blob([Buffer.alloc(b.size,123)]):b;}}),/发生变化/);
});
test('memory fallback caps retained output across multiple packages at 24 MiB',async()=>{
 const {catalog,readSource}=fixture(201,{size:45000});let second=false;
 await assert.rejects(exportSavedResources(catalog,{readSource,onProgress:p=>{if(p.packageIndex===2)second=true;}}),/24 MB/);assert.ok(second);
});
