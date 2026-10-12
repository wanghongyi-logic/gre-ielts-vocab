const implementationURL=process.env.GRE_IMPLEMENTATION_DIR?new URL(process.env.GRE_IMPLEMENTATION_DIR.replace(/\/$/,'')+'/', 'file://'):new URL('../',import.meta.url);
// Independent in-memory IDB/OPFS regression harness; no browser storage is touched.
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const records=new Map(),disk=new Map();
const request=fn=>{let r={};setTimeout(()=>{r.result=fn();r.onsuccess?.();},0);return r;};
globalThis.indexedDB={open(){let r={};setTimeout(()=>{r.result={transaction(){let tx={};let last;tx.objectStore=()=>Object.fromEntries(['get','getAll','put','delete'].map(method=>[method,arg=>{last=request(()=>{let result=method==='get'?records.get(arg):method==='getAll'?[...records.values()]:method==='put'?(records.set(arg.key,structuredClone(arg)),arg.key):records.delete(arg);setTimeout(()=>tx.oncomplete?.(),0);return result;});return last;}]));return tx;}};r.onsuccess();},0);return r;}};
const directory={async getFileHandle(name,{create=false}={}){if(!disk.has(name)){if(!create)throw Error('Missing');disk.set(name,new Blob());}return {async getFile(){return disk.get(name);},async createWritable(){let chunks=[];return {async write(blob){chunks.push(blob);},async close(){disk.set(name,new Blob(chunks));},async abort(){}};}};},async removeEntry(name){disk.delete(name);},async *entries(){for(let name of disk.keys())yield [name,{kind:'file'}];}};
Object.defineProperty(globalThis,'navigator',{value:{storage:{async getDirectory(){return {async getDirectoryHandle(){return directory;}};},async estimate(){return {quota:1e9,usage:1};}},locks:{request:(name,fn)=>fn()}}});
const {importPack,localAsset}=await import(new URL('gre-learning/offline-packs.js',implementationURL));
const data='TRUSTED CONTENT',sha256=createHash('sha256').update(data).digest('hex');
const ref={url:'units/old-'+sha256+'.json',bytes:data.length,sha256};const catalog={units:[ref],entries:[{number:175,unit:0}]};
const manifest={format:'gre-offline-pack-v1',packId:'p',version:'v1',wordIds:[175],files:[{path:'gre-learning/'+ref.url,bytes:ref.bytes,sha256,role:'unit',wordId:175}]};
function zip(items){let offset=0;const locals=[],central=[];for(const [name,content] of items){const b=Buffer.from(content),n=Buffer.from(name),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt32LE(b.length,18);h.writeUInt32LE(b.length,22);h.writeUInt16LE(n.length,26);locals.push(h,n,b);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=h.length+n.length+b.length;}const cd=Buffer.concat(central),e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50);e.writeUInt16LE(items.length,8);e.writeUInt16LE(items.length,10);e.writeUInt32LE(cd.length,12);e.writeUInt32LE(offset,16);return new Blob([...locals,cd,e]);}
const items=[['manifest.json',JSON.stringify(manifest)],['gre-learning/'+ref.url,data]];

const videoData='retained video',videoSHA=createHash('sha256').update(videoData).digest('hex');
const video={url:'story-media/v-'+videoSHA+'.mp4',bytes:videoData.length,sha256:videoSHA};
catalog.entries[0].storyMedia={video};
manifest.files.push({path:'gre-learning/'+video.url,bytes:video.bytes,sha256:videoSHA,role:'video',wordId:175});
items[0][1]=JSON.stringify(manifest);items.push(['gre-learning/'+video.url,videoData]);
const oldZip=zip(items);await importPack(oldZip,catalog);assert.equal(await(await localAsset(video)).text(),videoData);
const revised=structuredClone(catalog);revised.units[0]={url:'units/updated.json',sha256:'a'.repeat(64),bytes:99};
assert.equal(await(await localAsset(revised.entries[0].storyMedia.video)).text(),videoData);
console.log('PASS: installed OPFS video survives changed text catalog');
const {validatePack}=await import(new URL('gre-learning/offline-zip.js',implementationURL));
await validatePack(oldZip,revised);await importPack(oldZip,revised);assert.equal(await localAsset(revised.units[0]),null);assert.equal(await(await localAsset(video)).text(),videoData);console.log('PASS: old backup re-import after changed text; old text cannot replace new text');
const changedMedia=structuredClone(revised);changedMedia.entries[0].storyMedia.video.sha256='b'.repeat(64);await assert.rejects(validatePack(oldZip,changedMedia));console.log('PASS: changed video digest still rejects stale backup');
const corrupt=new Uint8Array(await oldZip.arrayBuffer());const position=Buffer.from(corrupt).indexOf(Buffer.from(data));assert.ok(position>=0);corrupt[position]^=1;await assert.rejects(validatePack(new Blob([corrupt]),revised));console.log('PASS: corrupt historical text payload rejected');
