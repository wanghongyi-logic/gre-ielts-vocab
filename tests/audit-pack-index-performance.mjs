// Independent in-memory IDB/OPFS regression harness; no browser storage is touched.
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const records=new Map(),disk=new Map();let indexReads=0;
const request=fn=>{let r={};setTimeout(()=>{r.result=fn();r.onsuccess?.();},0);return r;};
globalThis.indexedDB={open(){let r={};setTimeout(()=>{r.result={transaction(){let tx={};let last;tx.objectStore=()=>Object.fromEntries(['get','getAll','put','delete'].map(method=>[method,arg=>{last=request(()=>{if(method==='getAll')indexReads++;let result=method==='get'?records.get(arg):method==='getAll'?[...records.values()]:method==='put'?(records.set(arg.key,structuredClone(arg)),arg.key):records.delete(arg);setTimeout(()=>tx.oncomplete?.(),0);return result;});return last;}]));return tx;}};r.onsuccess();},0);return r;}};
const directory={async getFileHandle(name,{create=false}={}){if(!disk.has(name)){if(!create)throw Error('Missing');disk.set(name,new Blob());}return {async getFile(){return disk.get(name);},async createWritable(){let chunks=[];return {async write(blob){chunks.push(blob);},async close(){disk.set(name,new Blob(chunks));},async abort(){}};}};},async removeEntry(name){disk.delete(name);},async *entries(){for(let name of disk.keys())yield [name,{kind:'file'}];}};
Object.defineProperty(globalThis,'navigator',{value:{storage:{async getDirectory(){return {async getDirectoryHandle(){return directory;}};},async estimate(){return {quota:1e9,usage:1};}},locks:{request:(name,fn)=>fn()}}});
const {importPack,localAsset}=await import(new URL('../gre-learning/offline-packs.js', import.meta.url));
const data='TRUSTED CONTENT',sha256=createHash('sha256').update(data).digest('hex');
const ref={url:'units/x.json',bytes:data.length,sha256};const catalog={units:[ref],entries:[{number:175,unit:0}]};
const manifest={format:'gre-offline-pack-v1',packId:'p',version:'v1',wordIds:[175],files:[{path:'gre-learning/'+ref.url,bytes:ref.bytes,sha256,role:'unit',wordId:175}]};
function zip(items){let offset=0;const locals=[],central=[];for(const [name,content] of items){const b=Buffer.from(content),n=Buffer.from(name),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt32LE(b.length,18);h.writeUInt32LE(b.length,22);h.writeUInt16LE(n.length,26);locals.push(h,n,b);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=h.length+n.length+b.length;}const cd=Buffer.concat(central),e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50);e.writeUInt16LE(items.length,8);e.writeUInt16LE(items.length,10);e.writeUInt32LE(cd.length,12);e.writeUInt32LE(offset,16);return new Blob([...locals,cd,e]);}
const items=[['manifest.json',JSON.stringify(manifest)],['gre-learning/units/x.json',data]];
const clean=zip(items),first=await importPack(clean,catalog);
const bytes=new Uint8Array(await disk.get(first.name).arrayBuffer());bytes[first.files[0].start]=88;disk.set(first.name,new Blob([bytes]));
const retry=await importPack(clean,catalog);
assert.notEqual(retry.duplicate,true);assert.equal(await(await localAsset(ref)).text(),data);
console.log('Same-size corruption retry:',{duplicate:retry.duplicate,returnedAsset:await(await localAsset(ref)).text()});
await importPack(zip([...items].reverse()),catalog);console.log('Identical asset repack accepted');
const beforeReads=indexReads,started=performance.now();await Promise.all(Array.from({length:100},()=>localAsset(ref)));console.log('PERFORMANCE_LOOKUPS',JSON.stringify({lookups:100,indexReads:indexReads-beforeReads,elapsedMs:performance.now()-started}));assert.ok(indexReads-beforeReads<=1,'100 concurrent asset lookups share one metadata scan');
const {deletePack,listPacks}=await import(new URL('../gre-learning/offline-packs.js', import.meta.url));
const before=(await listPacks()).length, diskBefore=disk.size;
manifest.version='v2';const v2zip=zip([['manifest.json',JSON.stringify(manifest)],items[1]]);
const cancel=new AbortController();await assert.rejects(importPack(v2zip,catalog,{signal:cancel.signal,onProgress:p=>{if(p.phase==='copy')cancel.abort();}}),{name:'AbortError'});
assert.equal((await listPacks()).length,before);assert.equal(disk.size,diskBefore);assert.equal(await(await localAsset(ref)).text(),data);console.log('Cancellation during copy retains prior version and cleans staged file');
const v2=await importPack(v2zip,catalog);assert.equal((await listPacks()).length,before+1);await deletePack(v2.key);assert.equal((await listPacks()).length,before);assert.equal(await(await localAsset(ref)).text(),data);console.log('New version import then delete restores prior assets');
disk.set('pack-123-abcdef.zip',new Blob(['partial']));await importPack(clean,catalog);assert.ok(!disk.has('pack-123-abcdef.zip'));console.log('Interrupted-import orphan recovered under lock');
const mediaURL=new URL('../gre-learning/story-media/sample.mp4',import.meta.url).href,textURL=new URL('../gre-learning/units/sample.json',import.meta.url).href,otherURL='https://other.example/gre-learning/story-media/keep.mp4';
const cached=new Map([[mediaURL,'media'],[textURL,'text'],[otherURL,'other']]);globalThis.caches={open:async name=>{if(name==='gre-media-control-v1')return {match:async()=>undefined,put:async()=>{}};assert.equal(name,'gre-scalable-verified-units-v1');return {keys:async()=>[...cached.keys()].map(url=>({url})),delete:async request=>cached.delete(request.url)};}};
disk.set('unrelated-file.txt',new Blob(['keep']));const sourceSize=clean.size;
const {clearSavedResources}=await import(new URL('../gre-learning/offline-packs.js',import.meta.url));
await clearSavedResources();assert.equal((await listPacks()).length,0);assert.equal(disk.size,1);assert.ok(disk.has('unrelated-file.txt'));assert.ok(!cached.has(mediaURL));assert.ok(cached.has(textURL));assert.ok(cached.has(otherURL));assert.equal(clean.size,sourceSize);
const {createMediaControl}=await import(new URL('../gre-learning/offline-control.js',import.meta.url));await createMediaControl(new URL('../',import.meta.url)).resume();
await importPack(clean,catalog);assert.equal(await(await localAsset(ref)).text(),data);console.log('Clear removes only owned cache media + imported packs, retains text/unrelated/original source, and permits reimport');

