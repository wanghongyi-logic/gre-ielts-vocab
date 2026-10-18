// Isolated in-memory IDB/OPFS tests. No real browser storage is changed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const lockQueues=new Map();
function lock(name,options,action){
 if(typeof options==='function'){action=options;options={};}const signal=options?.signal;let abort;
 const previous=lockQueues.get(name)||Promise.resolve(),next=previous.catch(()=>{}).then(()=>{signal?.removeEventListener('abort',abort);if(signal?.aborted)throw new DOMException('Lock request cancelled','AbortError');return action();});lockQueues.set(name,next.catch(()=>{}));
 if(!signal)return next;
 return new Promise((resolve,reject)=>{abort=()=>reject(new DOMException('Lock request cancelled','AbortError'));signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();next.then(resolve,reject);});
}
const records=new Map(),disk=new Map(),cacheMaps=new Map(),preferences=new Map([['reading-progress','keep'],['video-mode','auto']]);
let freeBytes=1e9,failWritesAfter=Infinity,corruptNextWrite=false,failIndexCommit=false,failRemoveName=null,failIndexPutAfter=Infinity,afterCopyWrite=null,afterIndexCommit=null;
function storageError(message,name='QuotaExceededError'){return Object.assign(new Error(message),{name});}
globalThis.indexedDB={open(){const request={};setTimeout(()=>{request.result={transaction(_store,mode){const tx={},snapshot=new Map([...records].map(([key,value])=>[key,structuredClone(value)]));let pending=0,finished=false;
 tx.abort=()=>{finished=true;tx.error=storageError('Index transaction aborted','AbortError');setTimeout(()=>tx.onabort?.(),0);};
 const operation=(method,arg)=>{if(mode==='readwrite'&&['put','delete'].includes(method)&&failIndexPutAfter--<=0)throw storageError('Synchronous index write failed','DataCloneError');const req={};pending++;setTimeout(()=>{try{req.result=method==='get'?structuredClone(snapshot.get(arg)):method==='getAll'?structuredClone([...snapshot.values()]):method==='put'?(snapshot.set(arg.key,structuredClone(arg)),arg.key):snapshot.delete(arg);req.onsuccess?.();}catch(error){tx.error=error;}pending--;setTimeout(()=>{if(pending||finished)return;finished=true;if(mode==='readwrite'&&failIndexCommit){failIndexCommit=false;tx.error=storageError('Index commit interrupted','AbortError');}if(tx.error){tx.onabort?.();return;}if(mode==='readwrite'){records.clear();for(const [key,value] of snapshot)records.set(key,value);afterIndexCommit?.();}tx.oncomplete?.();},0);},0);return req;};
 tx.objectStore=()=>Object.fromEntries(['get','getAll','put','delete'].map(method=>[method,arg=>operation(method,arg)]));return tx;}};request.onsuccess?.();},0);return request;}};
const directory={async getFileHandle(name,{create=false}={}){if(!disk.has(name)){if(!create)throw storageError('Missing file','NotFoundError');disk.set(name,new Blob());}return {async getFile(){return disk.get(name);},async createWritable(){const chunks=[];return {async write(chunk){if(failWritesAfter--<=0)throw storageError('Copy interrupted');chunks.push(chunk);await afterCopyWrite?.({name,chunk});},async close(){let blob=new Blob(chunks);if(corruptNextWrite){corruptNextWrite=false;const bytes=new Uint8Array(await blob.arrayBuffer());bytes[0]^=255;blob=new Blob([bytes]);}disk.set(name,blob);},async abort(){}};}};},async removeEntry(name){if(failRemoveName===name){failRemoveName=null;throw storageError('Delete interrupted','UnknownError');}if(!disk.delete(name))throw storageError('Missing file','NotFoundError');},async *entries(){for(const name of disk.keys())yield [name,{kind:'file'}];}};
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{storage:{async getDirectory(){return {getDirectoryHandle:async()=>directory};},async estimate(){const usage=[...disk.values()].reduce((sum,file)=>sum+file.size,0);return {usage,quota:usage+freeBytes};}},locks:{request:lock}}});
globalThis.caches={async open(name){if(!cacheMaps.has(name))cacheMaps.set(name,new Map());const entries=cacheMaps.get(name);return {async match(key){return entries.get(typeof key==='string'?key:key.url)?.clone();},async put(key,value){entries.set(typeof key==='string'?key:key.url,value.clone());},async keys(){return [...entries.keys()].map(url=>({url}));},async delete(key){return entries.delete(typeof key==='string'?key:key.url);}};}};
globalThis.localStorage={getItem:key=>preferences.get(key),setItem:(key,value)=>preferences.set(key,value)};
const {importPack,localAsset,listPacks,inspectLibrary,clearSavedWords}=await import('../gre-learning/offline-packs.js');
const mediaControl=await import('../gre-learning/offline-control.js');
const root=new URL('../',import.meta.url),mediaURL=ref=>new URL('gre-learning/'+ref.url,root).href;
function digest(bytes){return createHash('sha256').update(bytes).digest('hex');}
function zip(items){let offset=0;const locals=[],central=[];for(const [name,content] of items){const b=Buffer.from(content),n=Buffer.from(name),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt32LE(b.length,18);h.writeUInt32LE(b.length,22);h.writeUInt16LE(n.length,26);locals.push(h,n,b);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=h.length+n.length+b.length;}const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(items.length,8);end.writeUInt16LE(items.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);return new Blob([...locals,cd,end]);}
function fixture(count=55,{packId='mixed',mediaOnly=false,sharedPoster=false,numbers}={}){const content=new Map(),entries=[],unitBytes=Buffer.from('{"text":"Preserved text for every word"}'),unit={url:'units/shared.json',bytes:unitBytes.length,sha256:digest(unitBytes)};content.set('gre-learning/'+unit.url,unitBytes);
 for(let i=0;i<count;i++){const number=numbers?.[i]??100+i*7,storyMedia={};for(const [role,extension] of [['video','mp4'],['poster','webp'],['staticPoster','png']]){const path=`story-media/${role}-${sharedPoster&&role==='poster'?'shared':i}.${extension}`,data=Buffer.from('PRIVATE-ASSET:'+path+':END');storyMedia[role]={url:path,bytes:data.length,sha256:digest(data)};content.set('gre-learning/'+path,data);}entries.push({number,displayOrdinal:i+1,unit:0,storyMedia});}
 const catalog={entries,units:[unit]},wordIds=entries.map(entry=>entry.number),files=[],seen=new Set();for(const entry of entries){for(const [role,ref] of [...(mediaOnly?[]:[['unit',unit]]),...Object.entries(entry.storyMedia)]){const path='gre-learning/'+ref.url;if(seen.has(path))continue;seen.add(path);files.push({path,role,wordId:entry.number,bytes:ref.bytes,sha256:ref.sha256});}}
 const manifest={format:'gre-offline-pack-v1',packId,version:'1',wordIds,files},source=zip([['manifest.json',JSON.stringify(manifest)],...files.map(file=>[file.path,content.get(file.path)])]);return {catalog,source,manifest,content};}
function reset(){records.clear();disk.clear();cacheMaps.clear();cacheMaps.set('gre-media-control-v1',new Map([[new URL('__gre_media_control__',root).href,new Response(JSON.stringify({generation:0,paused:false,phase:'active'}))]]));freeBytes=1e9;failWritesAfter=Infinity;corruptNextWrite=false;failIndexCommit=false;failRemoveName=null;failIndexPutAfter=Infinity;afterCopyWrite=null;afterIndexCommit=null;}
async function expectPresent(f,entries=f.catalog.entries){for(const entry of entries)for(const ref of Object.values(entry.storyMedia)){const local=await localAsset(ref);assert.ok(local,ref.url);assert.deepEqual(Buffer.from(await local.arrayBuffer()),f.content.get('gre-learning/'+ref.url));}}
async function diskSnapshot(){return new Map(await Promise.all([...disk].map(async([name,blob])=>[name,Buffer.from(await blob.arrayBuffer())])));}
async function assertUnchanged(previous){assert.equal(disk.size,previous.size);for(const [name,bytes] of previous)assert.deepEqual(Buffer.from(await disk.get(name).arrayBuffer()),bytes);}

test('first 50 clear compacts a mixed 55-word pack, retains all other bytes and shared text',async()=>{reset();const f=fixture(),sourceBytes=Buffer.from(await f.source.arrayBuffer()),pack=await importPack(f.source,f.catalog),targets=f.catalog.entries.slice(0,50),others=f.catalog.entries.slice(50),cache=await caches.open('gre-scalable-verified-units-v1');
 for(const entry of f.catalog.entries)for(const ref of Object.values(entry.storyMedia))await cache.put(mediaURL(ref),new Response(f.content.get('gre-learning/'+ref.url)));
 const textURL=mediaURL(f.catalog.units[0]),unrelatedURL=new URL('gre-learning/story-media/unrelated.mp4',root).href;await cache.put(textURL,new Response('text cache'));await cache.put(unrelatedURL,new Response('unrelated'));disk.set('unrelated-file.txt',new Blob(['keep']));
 const result=await clearSavedWords(f.catalog,targets.map(entry=>entry.number));assert.equal(result.packs,1);assert.equal(result.files,150);const [remaining]=await listPacks();assert.equal(remaining.partiallyCleared,true);assert.notEqual(remaining.name,pack.name);assert.ok(!disk.has(pack.name));assert.deepEqual(remaining.wordIds,pack.wordIds);assert.equal(remaining.files.length,16);assert.equal(remaining.bytes,remaining.files.reduce((sum,file)=>sum+file.bytes,0));
 for(const entry of targets)for(const ref of Object.values(entry.storyMedia)){assert.equal(await localAsset(ref),null);assert.equal(await cache.match(mediaURL(ref)),undefined);}
 await expectPresent(f,others);assert.deepEqual((await inspectLibrary(f.catalog)).readyIds,others.map(entry=>entry.number));assert.equal(await(await localAsset(f.catalog.units[0])).text(),f.content.get('gre-learning/'+f.catalog.units[0].url).toString());
 for(const entry of others)for(const ref of Object.values(entry.storyMedia))assert.ok(await cache.match(mediaURL(ref)));assert.ok(await cache.match(textURL));assert.ok(await cache.match(unrelatedURL));assert.equal(await disk.get('unrelated-file.txt').text(),'keep');assert.deepEqual([...preferences],[['reading-progress','keep'],['video-mode','auto']]);assert.deepEqual(Buffer.from(await f.source.arrayBuffer()),sourceBytes);
 const storedBytes=Buffer.from(await disk.get(remaining.name).arrayBuffer());for(const entry of targets)for(const ref of Object.values(entry.storyMedia))assert.equal(storedBytes.includes(f.content.get('gre-learning/'+ref.url)),false);
 const before=await diskSnapshot();assert.equal((await clearSavedWords(f.catalog,targets.map(entry=>entry.number))).files,0);await assertUnchanged(before);
});

test('a full original ZIP can restore a compacted pack, then becomes a true duplicate',async()=>{reset();const f=fixture(4);await importPack(f.source,f.catalog);await clearSavedWords(f.catalog,[f.catalog.entries[0].number]);const partial=(await listPacks())[0];const restored=await importPack(f.source,f.catalog);assert.notEqual(restored.duplicate,true);assert.notEqual(restored.name,partial.name);assert.ok(!restored.partiallyCleared);assert.ok(!disk.has(partial.name));await expectPresent(f);assert.equal((await importPack(f.source,f.catalog)).duplicate,true);assert.equal(disk.size,1);});

test('same-version different content remains rejected after compaction',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);await clearSavedWords(f.catalog,[f.catalog.entries[0].number]);const altered=structuredClone(f.manifest);altered.files=altered.files.filter(file=>file.role!=='unit');const source=zip([['manifest.json',JSON.stringify(altered)],...altered.files.map(file=>[file.path,f.content.get(file.path)])]);await assert.rejects(importPack(source,f.catalog),/同一版本/);await expectPresent(f,f.catalog.entries.slice(1));});

test('shared media stays present when a non-target word needs it',async()=>{reset();const f=fixture(3,{sharedPoster:true});await importPack(f.source,f.catalog);const target=f.catalog.entries[0],result=await clearSavedWords(f.catalog,[target.number]);assert.equal(result.files,2);assert.ok(await localAsset(target.storyMedia.poster));assert.equal(await localAsset(target.storyMedia.video),null);await expectPresent(f,f.catalog.entries.slice(1));assert.deepEqual((await inspectLibrary(f.catalog)).readyIds,f.catalog.entries.slice(1).map(entry=>entry.number));assert.ok(!result.paths.includes(mediaURL(target.storyMedia.poster)));});

test('all-target pack retains units; a media-only pack is removed',async()=>{reset();const f=fixture(2),mediaOnly=fixture(2,{packId:'media-only',mediaOnly:true});await importPack(f.source,f.catalog);await importPack(mediaOnly.source,mediaOnly.catalog);await clearSavedWords(f.catalog,f.catalog.entries.map(entry=>entry.number));const remaining=await listPacks();assert.equal(remaining.length,1);assert.equal(remaining[0].packId,'mixed');assert.deepEqual(remaining[0].files.map(file=>file.role),['unit']);assert.equal(disk.size,1);assert.ok(await localAsset(f.catalog.units[0]));assert.deepEqual((await inspectLibrary(f.catalog)).readyIds,[]);});

test('quota failure leaves the complete original mixed pack intact',async()=>{reset();const f=fixture(4);await importPack(f.source,f.catalog);const previous=await diskSnapshot(),before=structuredClone(await listPacks());freeBytes=0;await assert.rejects(clearSavedWords(f.catalog,[f.catalog.entries[0].number]),/空间/);assert.deepEqual(await listPacks(),before);await assertUnchanged(previous);await expectPresent(f);});

test('failure staging a later pack cleans every temporary and keeps every original',async()=>{reset();const f=fixture(4),second=fixture(4,{packId:'second'});await importPack(f.source,f.catalog);await importPack(second.source,second.catalog);const previous=await diskSnapshot(),before=structuredClone(await listPacks());failWritesAfter=1;await assert.rejects(clearSavedWords(f.catalog,[f.catalog.entries[0].number]),/interrupted/);assert.deepEqual(await listPacks(),before);await assertUnchanged(previous);await expectPresent(f);});

test('corrupted replacement bytes are rejected before any index switch',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);const previous=await diskSnapshot(),before=structuredClone(await listPacks());corruptNextWrite=true;await assert.rejects(clearSavedWords(f.catalog,[f.catalog.entries[0].number]),/checksum/);assert.deepEqual(await listPacks(),before);await assertUnchanged(previous);await expectPresent(f);});

test('interrupted atomic index commit keeps originals and removes staged slices',async()=>{reset();const f=fixture(4),second=fixture(4,{packId:'second'});await importPack(f.source,f.catalog);await importPack(second.source,second.catalog);const previous=await diskSnapshot(),before=structuredClone(await listPacks());failIndexCommit=true;await assert.rejects(clearSavedWords(f.catalog,[f.catalog.entries[0].number]),/Index commit interrupted/);assert.deepEqual(await listPacks(),before);await assertUnchanged(previous);await expectPresent(f);});

test('cleanup failure is reported; retry removes obsolete bytes without losing retained media',async()=>{reset();const f=fixture(3),original=await importPack(f.source,f.catalog);failRemoveName=original.name;await assert.rejects(clearSavedWords(f.catalog,[f.catalog.entries[0].number]),/Delete interrupted/);await expectPresent(f,f.catalog.entries.slice(1));assert.ok(disk.has(original.name));await clearSavedWords(f.catalog,[f.catalog.entries[0].number]);assert.ok(!disk.has(original.name));assert.equal(disk.size,1);await expectPresent(f,f.catalog.entries.slice(1));});

test('selective deletion preserves paused preference and blocks only targeted automatic paths',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);const control=mediaControl.createMediaControl(root);await control.clear(async()=>{});const before=await control.state(),target=f.catalog.entries[0];await clearSavedWords(f.catalog,[target.number]);const after=await control.state();assert.equal(after.paused,before.paused);assert.ok(after.generation>before.generation);for(const ref of Object.values(target.storyMedia))assert.ok(after.blockedAutoPaths.includes(mediaURL(ref)));for(const ref of Object.values(f.catalog.entries[1].storyMedia))assert.ok(!after.blockedAutoPaths.includes(mediaURL(ref)));});


async function holdPackLock(){let release,entered;const ready=new Promise(resolve=>{entered=resolve;}),running=navigator.locks.request('gre-offline-pack-index-v1',()=>new Promise(resolve=>{release=resolve;entered();}));await ready;return {release,running};}
const settleTicket=()=>new Promise(resolve=>setTimeout(resolve,10));
test('an import with a pre-clear ticket queued behind clear cannot restore removed words',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);const held=await holdPackLock(),clearing=clearSavedWords(f.catalog,[f.catalog.entries[0].number]),importing=importPack(f.source,f.catalog),rejected=assert.rejects(importing,{name:'AbortError'});await settleTicket();held.release();await held.running;await clearing;await rejected;assert.equal(disk.size,1);assert.equal(await localAsset(f.catalog.entries[0].storyMedia.video),null);await expectPresent(f,f.catalog.entries.slice(1));});

test('duplicate import checks its generation before returning success',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);const before=await diskSnapshot(),control=mediaControl.createMediaControl(root);let changing;await assert.rejects(importPack(f.source,f.catalog,{onProgress:progress=>{if(progress.phase==='verify'&&!changing)changing=control.selectiveClear([],async()=>{});}}),{name:'AbortError'});await changing;await assertUnchanged(before);});

test('generation change during import copy rejects its commit and removes staged data',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);await clearSavedWords(f.catalog,[f.catalog.entries[0].number]);const before=await diskSnapshot(),control=mediaControl.createMediaControl(root);let changing;await assert.rejects(importPack(f.source,f.catalog,{onProgress:progress=>{if(progress.phase==='copy'&&!changing)changing=control.selectiveClear([],async()=>{});}}),{name:'AbortError'});await changing;await assertUnchanged(before);assert.equal(await localAsset(f.catalog.entries[0].storyMedia.video),null);await expectPresent(f,f.catalog.entries.slice(1));});

test('imports require explicit resume after a global clear',async()=>{reset();const f=fixture(3),control=mediaControl.createMediaControl(root);await control.clear(async()=>{});await assert.rejects(importPack(f.source,f.catalog),{name:'AbortError'});assert.equal(disk.size,0);await control.resume();await importPack(f.source,f.catalog);await expectPresent(f);});

// Give downloadPack its actual HTTPS module base while retaining the exact source
// and shared mocked storage; Node's file:// module origin cannot be downloaded.
const sourceURL=new URL('../gre-learning/offline-packs.js',import.meta.url);
let hostedSource=await readFile(sourceURL,'utf8');for(const dependency of ['offline-control.js','offline-zip.js','offline-async.js'])hostedSource=hostedSource.replace(`'./${dependency}'`,JSON.stringify(new URL(dependency,sourceURL).href));
hostedSource=hostedSource.replaceAll('import.meta.url',JSON.stringify('https://example.test/gre-learning/offline-packs.js'));
const hosted=await import('data:text/javascript;base64,'+Buffer.from(hostedSource).toString('base64'));
const hostedRoot=new URL('https://example.test/'),hostedControl=mediaControl.createMediaControl(hostedRoot);
async function resetHosted(){reset();const cache=await caches.open('gre-media-control-v1');await cache.put(new URL('__gre_media_control__',hostedRoot).href,new Response(JSON.stringify({generation:0,paused:false,phase:'active'})));}

test('a queued ZIP download with a pre-clear ticket aborts before fetch',async()=>{await resetHosted();const f=fixture(3);await hosted.importPack(f.source,f.catalog);let fetches=0;globalThis.fetch=async()=>{fetches++;return new Response(f.source);};const held=await holdPackLock(),clearing=hosted.clearSavedWords(f.catalog,[f.catalog.entries[0].number]),downloading=hosted.downloadPack({url:'offline-packs/mixed.zip',bytes:f.source.size,packId:'mixed',version:'1'},f.catalog),rejected=assert.rejects(downloading,{name:'AbortError'});await settleTicket();held.release();await held.running;await clearing;await rejected;assert.equal(fetches,0);assert.equal(await hosted.localAsset(f.catalog.entries[0].storyMedia.video),null);assert.equal(disk.size,1);});

test('generation change during ZIP download rejects its commit without losing retained bytes',async()=>{await resetHosted();const f=fixture(3);await hosted.importPack(f.source,f.catalog);await hosted.clearSavedWords(f.catalog,[f.catalog.entries[0].number]);const before=await diskSnapshot();globalThis.fetch=async()=>new Response(f.source);let changing;await assert.rejects(hosted.downloadPack({url:'offline-packs/mixed.zip',bytes:f.source.size,packId:'mixed',version:'1'},f.catalog,{onProgress:progress=>{if(progress.phase==='download'&&!changing)changing=hostedControl.selectiveClear([],async()=>{});}}),{name:'AbortError'});await changing;await assertUnchanged(before);assert.equal(await hosted.localAsset(f.catalog.entries[0].storyMedia.video),null);await expectPresent(f,f.catalog.entries.slice(1));});


test('a synchronous later index-write failure aborts the entire replacement transaction',async()=>{reset();const f=fixture(4),second=fixture(4,{packId:'second'});await importPack(f.source,f.catalog);await importPack(second.source,second.catalog);const previous=await diskSnapshot(),before=structuredClone(await listPacks());failIndexPutAfter=1;await assert.rejects(clearSavedWords(f.catalog,[f.catalog.entries[0].number]),/Synchronous index write failed/);assert.deepEqual(await listPacks(),before);await assertUnchanged(previous);await expectPresent(f);});

test('old-edition target paths are removed while current non-target assets remain',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);const current=structuredClone(f.catalog),target=current.entries[0];for(const ref of Object.values(target.storyMedia))ref.url=ref.url.replace('story-media/','story-media/new-edition-');const cache=await caches.open('gre-scalable-verified-units-v1');for(const ref of [...Object.values(target.storyMedia),...Object.values(f.catalog.entries[0].storyMedia)])await cache.put(mediaURL(ref),new Response('media'));const result=await clearSavedWords(current,[target.number]);for(const ref of Object.values(f.catalog.entries[0].storyMedia)){assert.equal(await localAsset(ref),null);assert.equal(await cache.match(mediaURL(ref)),undefined);assert.ok(result.paths.includes(mediaURL(ref)));}for(const ref of Object.values(target.storyMedia))assert.equal(await cache.match(mediaURL(ref)),undefined);await expectPresent(f,f.catalog.entries.slice(1));});

test('a separate non-target pack stays byte-identical while the overlapping mixed pack shrinks',async()=>{reset();const f=fixture(3);await importPack(f.source,f.catalog);const other=f.catalog.entries.at(-1),manifest={...f.manifest,packId:'unaffected',wordIds:[other.number],files:f.manifest.files.filter(file=>file.role==='unit'||file.wordId===other.number).map(file=>({...file,wordId:other.number}))},source=zip([['manifest.json',JSON.stringify(manifest)],...manifest.files.map(file=>[file.path,f.content.get(file.path)])]),pack=await importPack(source,f.catalog),previous=Buffer.from(await disk.get(pack.name).arrayBuffer());await clearSavedWords(f.catalog,[f.catalog.entries[0].number]);assert.deepEqual((await listPacks()).find(item=>item.key===pack.key),pack);assert.deepEqual(Buffer.from(await disk.get(pack.name).arrayBuffer()),previous);await expectPresent(f,f.catalog.entries.slice(1));});

test('repeated compaction keeps original identity so the complete source still restores every word',async()=>{reset();const f=fixture(4);await importPack(f.source,f.catalog);await clearSavedWords(f.catalog,[f.catalog.entries[0].number]);const identity=(await listPacks())[0].originalIdentity;await clearSavedWords(f.catalog,[f.catalog.entries[1].number]);assert.equal((await listPacks())[0].originalIdentity,identity);assert.deepEqual((await inspectLibrary(f.catalog)).readyIds,f.catalog.entries.slice(2).map(entry=>entry.number));await importPack(f.source,f.catalog);await expectPresent(f);assert.equal(disk.size,1);});

test('real published catalog clears display ordinals 1–50, not vocabulary IDs 1–50, including static posters',async()=>{
 reset();const {expandCatalog}=await import('../gre-learning/lesson-loader.js');const catalog=expandCatalog(JSON.parse(await readFile(new URL('../gre-learning/catalog.json',import.meta.url))));
 const first=catalog.entries.slice(0,50),rest=catalog.entries.slice(50),ids=first.map(entry=>entry.number);assert.notEqual(ids[0],1);
 const cache=await caches.open('gre-scalable-verified-units-v1'),all=entries=>entries.flatMap(entry=>Object.values(entry.storyMedia||{})).filter(ref=>ref?.url).map(mediaURL);
 const targets=new Set(all(first)),retained=new Set(all(rest));for(const url of new Set([...targets,...retained]))await cache.put(url,new Response('cache fixture'));
 await clearSavedWords(catalog,ids);for(const url of targets)if(!retained.has(url))assert.equal(await cache.match(url),undefined);for(const url of retained)assert.ok(await cache.match(url));
 const cachedPaths=(await cache.keys()).map(request=>new URL(request.url).pathname.split('/gre-learning/')[1]).map(path=>'gre-learning/'+path);
 const result=await inspectLibrary(catalog,{cachedPaths});assert.deepEqual(result.readyIds,rest.map(entry=>entry.number));
});

// Arbitrary ranges use the published learning order; stable vocabulary IDs may
// be sparse, non-monotonic, and completely unrelated to the entered endpoints.
const sparseNumbers=[911,5,2048,77,6001,13,308,42];
async function resolveRange(catalog,start,end){const {resolveSavedRange}=await import('../gre-learning/offline-range.js');return resolveSavedRange(catalog,start,end);}
const mediaRefs=entries=>entries.flatMap(entry=>Object.values(entry.storyMedia||{})).filter(ref=>ref?.url);
async function seedMediaCache(f,entries=f.catalog.entries){const cache=await caches.open('gre-scalable-verified-units-v1');for(const ref of mediaRefs(entries))await cache.put(mediaURL(ref),new Response(f.content.get('gre-learning/'+ref.url)));return cache;}
async function mediaCacheSnapshot(){return new Map(await Promise.all([...(cacheMaps.get('gre-scalable-verified-units-v1')||[])].map(async([url,response])=>[url,Buffer.from(await response.clone().arrayBuffer())])));}
async function cachedMediaPaths(){const cache=await caches.open('gre-scalable-verified-units-v1');return (await cache.keys()).map(request=>'gre-learning/'+request.url.split('/gre-learning/')[1]);}
function subsetSource(f,ordinals,packId){
 const entries=ordinals.map(ordinal=>f.catalog.entries[ordinal-1]),ids=entries.map(entry=>entry.number),wanted=new Set(mediaRefs(entries).map(ref=>'gre-learning/'+ref.url));
 const files=f.manifest.files.filter(file=>file.role==='unit'||wanted.has(file.path)).map(file=>({...file,wordId:ids.includes(file.wordId)?file.wordId:ids[0]}));
 const manifest={...f.manifest,packId,wordIds:ids,files};return zip([['manifest.json',JSON.stringify(manifest)],...files.map(file=>[file.path,f.content.get(file.path)])]);
}
function assertClearProgress(events,total){
 assert.ok(events.length>=2,'preparation and completion are both reported');
 assert.equal(events[0].phase,'prepare');assert.equal(events[0].completed,0);assert.equal(events[0].total,total);
 assert.equal(events.at(-1).phase,'done');assert.equal(events.at(-1).completed,total);assert.equal(events.at(-1).total,total);
 let completed=0,phase=0;
 for(const event of events){
  assert.ok(['prepare','delete','done'].includes(event.phase),`unexpected phase ${event.phase}`);
  const nextPhase=['prepare','delete','done'].indexOf(event.phase);assert.ok(nextPhase>=phase,'phases never go backwards');phase=nextPhase;
  assert.equal(event.total,total,'every event uses the same unique saved asset count');assert.ok(Number.isSafeInteger(event.completed));assert.ok(event.completed>=completed&&event.completed<=total,'progress stays monotonic and bounded');
  if(event.phase==='prepare')assert.equal(event.completed,0,'preparing a replacement has not deleted anything');completed=event.completed;
 }
 if(total)assert.ok(events.some(event=>event.phase==='delete'),'committed deletion has its own phase');
}
async function expectRemoved(entries,cache){for(const ref of mediaRefs(entries)){assert.equal(await localAsset(ref),null,`OPFS removed ${ref.url}`);assert.equal(await cache.match(mediaURL(ref)),undefined,`cache removed ${ref.url}`);}}
async function assertSavedDataUnchanged(f,before){assert.deepEqual(await listPacks(),before.packs);await assertUnchanged(before.disk);assert.deepEqual(await mediaCacheSnapshot(),before.cache);await expectPresent(f);}
async function savedDataSnapshot(){return {packs:structuredClone(await listPacks()),disk:await diskSnapshot(),cache:await mediaCacheSnapshot()};}
async function seedAutomaticState(f){
 const control=mediaControl.createMediaControl(root),unrelatedURL=new URL('gre-learning/story-media/previously-cleared.mp4',root).href;
 // Preserve both a prior exclusion outside the new range and one overlapping it.
 const blocked=[mediaURL(f.catalog.entries[0].storyMedia.video),mediaURL(f.catalog.entries[2].storyMedia.poster),unrelatedURL];await control.selectiveClear(blocked,async()=>{});
 const urls=[...mediaRefs(f.catalog.entries).map(mediaURL),unrelatedURL],state=await control.state(),allowed=await Promise.all(urls.map(url=>control.automaticAllowed(url)));return {control,urls,state,allowed};
}
async function assertAutomaticUnchanged(before,{generation='advanced'}={}){
 const after=await before.control.state();assert.deepEqual(after.blockedAutoPaths||[],before.state.blockedAutoPaths||[],'failure restores precisely the prior automatic-loading exclusions');assert.equal(after.paused,before.state.paused);
 assert.deepEqual(await Promise.all(before.urls.map(url=>before.control.automaticAllowed(url))),before.allowed,'failure does not alter which saved or unsaved media may load automatically');
 if(generation==='advanced')assert.ok(after.generation>before.state.generation,'failed active mutation still invalidates stale media tickets');else assert.equal(after.generation,before.state.generation,'queued or pre-aborted mutation never acquires a media generation');
}


test('range resolver maps sparse non-monotonic IDs and accepts inclusive boundary and single-word ranges',async()=>{
 const f=fixture(8,{numbers:sparseNumbers});
 for(const [start,end] of [[1,1],[8,8],[1,8],[3,6],[5,5]])assert.deepEqual(await resolveRange(f.catalog,start,end),{start,end,ids:sparseNumbers.slice(start-1,end)});
 assert.deepEqual(await resolveRange(f.catalog,'3','6'),{start:3,end:6,ids:[2048,77,6001,13]});
 const reordered={...f.catalog,entries:[...f.catalog.entries].reverse()};assert.deepEqual(await resolveRange(reordered,3,6),{start:3,end:6,ids:[2048,77,6001,13]},'explicit ordinals take precedence over array position');
 const legacy=structuredClone(f.catalog);for(const entry of legacy.entries)delete entry.displayOrdinal;
 assert.deepEqual(await resolveRange(legacy,2,4),{start:2,end:4,ids:[5,2048,77]});
});

test('range resolver rejects invalid endpoints and incomplete or ambiguous ordinal mappings',async()=>{
 const f=fixture(8,{numbers:sparseNumbers});
 for(const [start,end] of [['',4],[' ',4],[1,''],[0,4],[-1,4],[1,9],[5,4],[1.5,4],[1,4.5],['2x',4],[NaN,4],[1,Infinity],[1,Number.MAX_SAFE_INTEGER+1],[null,4],[true,4],[undefined,4],['1e0',4],['0x1',4]])await assert.rejects(resolveRange(f.catalog,start,end),`${String(start)}–${String(end)} must be rejected`);
 const missing=structuredClone(f.catalog);missing.entries[2].displayOrdinal=8;await assert.rejects(resolveRange(missing,2,4),'missing ordinal 3 must not select another word');
 const duplicate=structuredClone(f.catalog);duplicate.entries[2].displayOrdinal=2;await assert.rejects(resolveRange(duplicate,2,3),'duplicate ordinal 2 must not select an ambiguous range');
 const duplicateId=structuredClone(f.catalog);duplicateId.entries[2].number=duplicateId.entries[1].number;await assert.rejects(resolveRange(duplicateId,2,3),'two ordinals must not silently identify the same stored word');
});

for(const [start,end] of [[1,2],[3,6],[7,8],[5,5],[1,8]])test(`clearing display range ${start}–${end} removes only its sparse-ID media from OPFS and cache`,async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers}),sourceBytes=Buffer.from(await f.source.arrayBuffer()),original=await importPack(f.source,f.catalog),cache=await seedMediaCache(f);
 const textURL=mediaURL(f.catalog.units[0]);await cache.put(textURL,new Response('retained text cache'));
 const range=await resolveRange(f.catalog,start,end),targets=f.catalog.entries.slice(start-1,end),others=f.catalog.entries.filter(entry=>!range.ids.includes(entry.number)),events=[];
 await clearSavedWords(f.catalog,range.ids,{onProgress:event=>events.push({...event})});
 await expectRemoved(targets,cache);await expectPresent(f,others);for(const ref of mediaRefs(others))assert.ok(await cache.match(mediaURL(ref)),`outside cache retained ${ref.url}`);
 assertClearProgress(events,targets.length*3);assert.deepEqual((await inspectLibrary(f.catalog,{cachedPaths:await cachedMediaPaths()})).readyIds,others.map(entry=>entry.number));
 assert.equal(await(await localAsset(f.catalog.units[0])).text(),f.content.get('gre-learning/'+f.catalog.units[0].url).toString());assert.equal(await(await cache.match(textURL)).text(),'retained text cache');
 assert.deepEqual([...preferences],[['reading-progress','keep'],['video-mode','auto']]);assert.deepEqual(Buffer.from(await f.source.arrayBuffer()),sourceBytes);assert.ok(!disk.has(original.name),'the old ZIP bytes are physically removed');
 for(const blob of disk.values()){const bytes=Buffer.from(await blob.arrayBuffer());for(const ref of mediaRefs(targets))assert.equal(bytes.includes(f.content.get('gre-learning/'+ref.url)),false,`no obsolete ${ref.url} bytes remain`);}
});

test('partially saved interior range counts only existing unique assets across cache and OPFS',async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers});await importPack(subsetSource(f,[1,3,8],'partial-saved'),f.catalog);
 const cache=await seedMediaCache(f,[f.catalog.entries[1],f.catalog.entries[3]]);
 for(const ref of [f.catalog.entries[2].storyMedia.video,f.catalog.entries[4].storyMedia.poster])await cache.put(mediaURL(ref),new Response(f.content.get('gre-learning/'+ref.url)));
 const beforeReady=(await inspectLibrary(f.catalog,{cachedPaths:await cachedMediaPaths()})).readyIds;assert.deepEqual(beforeReady,[911,5,2048,77,42]);
 const {ids}=await resolveRange(f.catalog,3,6),events=[],result=await clearSavedWords(f.catalog,ids,{onProgress:event=>events.push({...event})});assert.equal(result.removedAssets,7);
 // Three OPFS assets for ordinal 3, three cache-only assets for 4, one for 5,
 // and none for 6. The cached copy of ordinal 3's video is counted only once.
 assertClearProgress(events,7);await expectRemoved(f.catalog.entries.slice(2,6),cache);await expectPresent(f,[f.catalog.entries[0],f.catalog.entries[7]]);
 for(const ref of mediaRefs([f.catalog.entries[1]]))assert.ok(await cache.match(mediaURL(ref)));
 assert.deepEqual((await inspectLibrary(f.catalog,{cachedPaths:await cachedMediaPaths()})).readyIds,[911,5,42]);
});

test('overlapping packs and cached duplicates report each selected asset once and remove every copy',async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers}),first=await importPack(f.source,f.catalog),second=await importPack(subsetSource(f,[2,3,4,5],'overlap'),f.catalog),cache=await seedMediaCache(f),events=[];
 const {ids}=await resolveRange(f.catalog,3,5),targets=f.catalog.entries.slice(2,5),others=f.catalog.entries.filter(entry=>!ids.includes(entry.number));
 const targetURLs=mediaRefs(targets).map(mediaURL);
 const result=await clearSavedWords(f.catalog,ids,{onProgress:event=>{
  events.push({...event});if(event.phase==='delete'&&event.completed>0){
   assert.ok(!disk.has(first.name)&&!disk.has(second.name),'no completed deletion is reported while either old pack remains');
   const absent=targetURLs.filter(url=>!cacheMaps.get('gre-scalable-verified-units-v1').has(url)&&![...records.values()].some(pack=>pack.files.some(file=>new URL(file.path,root).href===url)));
   assert.ok(event.completed<=absent.length,'reported progress never runs ahead of unique assets actually removed');
  }
 }});assert.equal(result.packs,2);assert.equal(result.files,18);assert.equal(result.removedAssets,9);assertClearProgress(events,9);
 await expectRemoved(targets,cache);await expectPresent(f,others);assert.ok(!disk.has(first.name));assert.ok(!disk.has(second.name));
 for(const pack of await listPacks()){for(const file of pack.files)assert.ok(file.role==='unit'||!ids.includes(file.wordId));const bytes=Buffer.from(await disk.get(pack.name).arrayBuffer());for(const ref of mediaRefs(targets))assert.equal(bytes.includes(f.content.get('gre-learning/'+ref.url)),false);}
 const before=await savedDataSnapshot(),retry=[];await clearSavedWords(f.catalog,ids,{onProgress:event=>retry.push({...event})});assertClearProgress(retry,0);assert.deepEqual(await listPacks(),before.packs);await assertUnchanged(before.disk);assert.deepEqual(await mediaCacheSnapshot(),before.cache);
});

test('shared media required outside the range is excluded from deletion progress',async()=>{
 reset();const f=fixture(4,{sharedPoster:true}),cache=await seedMediaCache(f);await importPack(f.source,f.catalog);const events=[],range=await resolveRange(f.catalog,2,3);
 await clearSavedWords(f.catalog,range.ids,{onProgress:event=>events.push({...event})});assertClearProgress(events,4);
 for(const entry of f.catalog.entries.slice(1,3)){assert.equal(await localAsset(entry.storyMedia.video),null);assert.equal(await localAsset(entry.storyMedia.staticPoster),null);assert.ok(await localAsset(entry.storyMedia.poster));assert.ok(await cache.match(mediaURL(entry.storyMedia.poster)));}
 await expectPresent(f,[f.catalog.entries[0],f.catalog.entries[3]]);
});

test('an entirely unsaved range completes with zero work and preserves unrelated cached media',async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers});await seedMediaCache(f,[f.catalog.entries[0],f.catalog.entries[7]]);const before=await savedDataSnapshot(),events=[],{ids}=await resolveRange(f.catalog,3,6);
 await clearSavedWords(f.catalog,ids,{onProgress:event=>events.push({...event})});assertClearProgress(events,0);assert.deepEqual(await listPacks(),before.packs);await assertUnchanged(before.disk);assert.deepEqual(await mediaCacheSnapshot(),before.cache);
});

for(const abortAt of ['before call','prepare'])test(`abort ${abortAt} preserves all saved pack and cache bytes`,async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers});await importPack(f.source,f.catalog);await seedMediaCache(f);const automatic=await seedAutomaticState(f),before=await savedDataSnapshot(),controller=new AbortController(),events=[];
 if(abortAt==='before call')controller.abort();
 await assert.rejects(clearSavedWords(f.catalog,(await resolveRange(f.catalog,3,6)).ids,{signal:controller.signal,onProgress:event=>{events.push({...event});if(event.phase==='prepare')controller.abort();}}),{name:'AbortError'});
 await assertSavedDataUnchanged(f,before);await assertAutomaticUnchanged(automatic,{generation:abortAt==='before call'?'same':'advanced'});assert.ok(!events.some(event=>event.phase==='delete'||event.phase==='done'),'a cancelled preparation never reports deletion');
});

for(const writeNumber of [1,2])test(`abort during staged copy ${writeNumber} removes every temporary and preserves both original packs`,async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers});await importPack(f.source,f.catalog);await importPack(subsetSource(f,[2,3,4,5,6,7],'second-staging-pack'),f.catalog);await seedMediaCache(f);
 const automatic=await seedAutomaticState(f),before=await savedDataSnapshot(),controller=new AbortController(),events=[];let writes=0;afterCopyWrite=()=>{if(++writes===writeNumber)controller.abort();};
 await assert.rejects(clearSavedWords(f.catalog,(await resolveRange(f.catalog,3,6)).ids,{signal:controller.signal,onProgress:event=>events.push({...event})}),{name:'AbortError'});
 assert.equal(writes,writeNumber,'cancellation stops before another staged write');assert.ok(!events.some(event=>event.phase==='delete'||event.phase==='done'));await assertSavedDataUnchanged(f,before);await assertAutomaticUnchanged(automatic);
});

test('abort while waiting for the storage lock preserves the original range',async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers});await importPack(f.source,f.catalog);await seedMediaCache(f);const automatic=await seedAutomaticState(f),before=await savedDataSnapshot(),controller=new AbortController(),held=await holdPackLock();
 const clearing=clearSavedWords(f.catalog,(await resolveRange(f.catalog,3,6)).ids,{signal:controller.signal}),rejected=assert.rejects(clearing,{name:'AbortError'});controller.abort();held.release();await held.running;await rejected;await assertSavedDataUnchanged(f,before);await assertAutomaticUnchanged(automatic,{generation:'same'});
});

test('abort immediately after atomic index commit still finishes all pack and cache cleanup',async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers}),first=await importPack(f.source,f.catalog),second=await importPack(subsetSource(f,[2,3,4,5,6,7],'postcommit-overlap'),f.catalog),cache=await seedMediaCache(f),controller=new AbortController(),events=[];let commits=0;
 afterIndexCommit=()=>{commits++;controller.abort();};const {ids}=await resolveRange(f.catalog,3,6);
 await clearSavedWords(f.catalog,ids,{signal:controller.signal,onProgress:event=>events.push({...event})});assert.equal(commits,1);assert.ok(controller.signal.aborted);assertClearProgress(events,12);
 await expectRemoved(f.catalog.entries.slice(2,6),cache);await expectPresent(f,[...f.catalog.entries.slice(0,2),...f.catalog.entries.slice(6)]);assert.ok(!disk.has(first.name));assert.ok(!disk.has(second.name));assert.equal(disk.size,2);
 assert.deepEqual((await inspectLibrary(f.catalog,{cachedPaths:await cachedMediaPaths()})).readyIds,[911,5,308,42]);
});

test('cache-only deletion remains coherent when cancellation arrives after deletion has started',async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers}),cache=await seedMediaCache(f),controller=new AbortController(),events=[],{ids}=await resolveRange(f.catalog,3,6);
 await clearSavedWords(f.catalog,ids,{signal:controller.signal,onProgress:event=>{events.push({...event});if(event.phase==='delete'&&event.completed>0)controller.abort();}});
 assert.ok(controller.signal.aborted,'the cancellation hook ran after at least one deletion');assertClearProgress(events,12);await expectRemoved(f.catalog.entries.slice(2,6),cache);
 for(const ref of mediaRefs([...f.catalog.entries.slice(0,2),...f.catalog.entries.slice(6)]))assert.ok(await cache.match(mediaURL(ref)));
});

test('current published catalog resolves interior and last-word ordinals without confusing them with IDs',async()=>{
 reset();const {expandCatalog}=await import('../gre-learning/lesson-loader.js'),catalog=expandCatalog(JSON.parse(await readFile(new URL('../gre-learning/catalog.json',import.meta.url))));
 for(const [start,end] of [[1,1],[37,63],[catalog.entries.length-2,catalog.entries.length],[catalog.entries.length,catalog.entries.length]]){
  const expected=catalog.entries.filter(entry=>entry.displayOrdinal>=start&&entry.displayOrdinal<=end).map(entry=>entry.number),resolved=await resolveRange(catalog,start,end);assert.deepEqual(resolved,{start,end,ids:expected});assert.equal(expected.length,end-start+1);
 }
 const start=37,end=63,range=await resolveRange(catalog,start,end),targets=catalog.entries.filter(entry=>range.ids.includes(entry.number)),others=catalog.entries.filter(entry=>!range.ids.includes(entry.number));
 assert.notDeepEqual(range.ids,Array.from({length:end-start+1},(_,i)=>start+i),'published stable IDs differ from display ordinals');
 const cache=await caches.open('gre-scalable-verified-units-v1'),targetURLs=new Set(mediaRefs(targets).map(mediaURL)),otherURLs=new Set(mediaRefs(others).map(mediaURL));
 for(const url of new Set([...targetURLs,...otherURLs]))await cache.put(url,new Response('isolated published catalog fixture'));
 const events=[];await clearSavedWords(catalog,range.ids,{onProgress:event=>events.push({...event})});assertClearProgress(events,[...targetURLs].filter(url=>!otherURLs.has(url)).length);
 for(const url of targetURLs)if(!otherURLs.has(url))assert.equal(await cache.match(url),undefined);for(const url of otherURLs)assert.ok(await cache.match(url));
 assert.deepEqual((await inspectLibrary(catalog,{cachedPaths:await cachedMediaPaths()})).readyIds,others.map(entry=>entry.number));
});

for(const [failure,inject,expected] of [
 ['quota',()=>{freeBytes=0;},/空间/],
 ['staged write',()=>{failWritesAfter=0;},/Copy interrupted/],
 ['retained-byte verification',()=>{corruptNextWrite=true;},/checksum/],
 ['index commit',()=>{failIndexCommit=true;},/Index commit interrupted/],
 ['synchronous later index write',()=>{failIndexPutAfter=1;},/Synchronous index write failed/]
])test(`precommit ${failure} failure restores prior automatic loading and every saved byte`,async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers});await importPack(f.source,f.catalog);await importPack(subsetSource(f,[2,3,4,5,6,7],'automatic-rollback-overlap'),f.catalog);await seedMediaCache(f);
 const automatic=await seedAutomaticState(f),before=await savedDataSnapshot(),{ids}=await resolveRange(f.catalog,3,6);inject();await assert.rejects(clearSavedWords(f.catalog,ids),expected);
 await assertSavedDataUnchanged(f,before);await assertAutomaticUnchanged(automatic);
});

test('prepare cancellation with no earlier exclusions leaves all automatic loading available',async()=>{
 reset();const f=fixture(4);await importPack(f.source,f.catalog);await seedMediaCache(f);const control=mediaControl.createMediaControl(root),before=await control.state(),controller=new AbortController();
 assert.deepEqual(before.blockedAutoPaths||[],[]);await assert.rejects(clearSavedWords(f.catalog,(await resolveRange(f.catalog,2,3)).ids,{signal:controller.signal,onProgress:event=>{if(event.phase==='prepare')controller.abort();}}),{name:'AbortError'});
 const after=await control.state();assert.deepEqual(after.blockedAutoPaths||[],[]);assert.equal(after.paused,before.paused);assert.ok(after.generation>before.generation);for(const ref of mediaRefs(f.catalog.entries))assert.equal(await control.automaticAllowed(mediaURL(ref)),true);
});

test('postcommit cleanup failure keeps deleted paths blocked while retaining prior exclusions',async()=>{
 reset();const f=fixture(8,{numbers:sparseNumbers}),original=await importPack(f.source,f.catalog),cache=await seedMediaCache(f),automatic=await seedAutomaticState(f),range=await resolveRange(f.catalog,3,6),targets=f.catalog.entries.slice(2,6),others=f.catalog.entries.filter(entry=>!range.ids.includes(entry.number));
 failRemoveName=original.name;await assert.rejects(clearSavedWords(f.catalog,range.ids),/Delete interrupted/);
 const targetURLs=mediaRefs(targets).map(mediaURL),expected=new Set([...automatic.state.blockedAutoPaths,...targetURLs]),after=await automatic.control.state();
 assert.deepEqual(new Set(after.blockedAutoPaths),expected,'committed deletion never rolls back its automatic-loading exclusion');assert.equal(after.paused,automatic.state.paused);assert.ok(after.generation>automatic.state.generation);
 for(const url of targetURLs)assert.equal(await automatic.control.automaticAllowed(url),false);for(const [index,url] of automatic.urls.entries())if(!targetURLs.includes(url))assert.equal(await automatic.control.automaticAllowed(url),automatic.allowed[index],'unselected automatic loading is unchanged');
 for(const ref of mediaRefs(targets))assert.equal(await localAsset(ref),null,'the replacement index has already committed');assert.ok(disk.has(original.name),'the injected cleanup failure leaves the obsolete ZIP for recovery');await expectPresent(f,others);
 await clearSavedWords(f.catalog,range.ids);await expectRemoved(targets,cache);await expectPresent(f,others);assert.ok(!disk.has(original.name));assert.deepEqual(new Set((await automatic.control.state()).blockedAutoPaths),expected,'recovery keeps every deliberate exclusion');
});


test('temporary OPFS read failure does not downgrade saved words to missing',async()=>{
 reset();const f=fixture(3);await importPack(f.source,f.catalog);const original=directory.getFileHandle;
 directory.getFileHandle=async()=>{throw Object.assign(new Error('OPFS suspended'),{name:'TimeoutError'});};
 try{await assert.rejects(inspectLibrary(f.catalog),{name:'TimeoutError'});}finally{directory.getFileHandle=original;}
 await expectPresent(f);assert.equal((await inspectLibrary(f.catalog)).readyIds.length,3);
});
