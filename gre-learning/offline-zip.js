// Narrow ZIP profile: STORE, UTF-8/ASCII names, no ZIP64/encryption.
export const MAX_ENTRY=64*1024*1024;
const fail=message=>{throw new Error(message);};
export function safePath(path){return typeof path==='string'&&/^[A-Za-z0-9_./-]+$/.test(path)&&!path.startsWith('/')&&!path.split('/').some(p=>!p||p==='.'||p==='..');}
async function read(file,start,length){if(start<0||length<0||start+length>file.size)fail('ZIP range outside file');return new Uint8Array(await file.slice(start,start+length).arrayBuffer());}
const dv=bytes=>new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
export async function indexZip(file){
 if(file.size<22||file.size>=0xffffffff)fail('Unsupported ZIP size');
 const tail=await read(file,Math.max(0,file.size-65557),Math.min(file.size,65557)),view=dv(tail);let end=-1;
 for(let i=tail.length-22;i>=0;i--)if(view.getUint32(i,true)===0x06054b50&&i+22+view.getUint16(i+20,true)===tail.length){end=i;break;}
 if(end<0)fail('ZIP directory missing');
 const count=view.getUint16(end+10,true),size=view.getUint32(end+12,true),offset=view.getUint32(end+16,true),endOffset=file.size-tail.length+end;
 if(view.getUint16(end+4,true)||view.getUint16(end+6,true)||view.getUint16(end+8,true)!==count||!count||count>2000||size>2*1024*1024||offset+size!==endOffset)fail('Unsupported ZIP directory');
 const directory=await read(file,offset,size),v=dv(directory),entries=new Map(),ranges=[];let p=0;
 for(let n=0;n<count;n++){
  if(p+46>size||v.getUint32(p,true)!==0x02014b50)fail('Malformed ZIP directory');
  const flags=v.getUint16(p+8,true),method=v.getUint16(p+10,true),compressed=v.getUint32(p+20,true),bytes=v.getUint32(p+24,true),nl=v.getUint16(p+28,true),el=v.getUint16(p+30,true),cl=v.getUint16(p+32,true),local=v.getUint32(p+42,true);
  if(flags&~0x800||method!==0||compressed!==bytes||bytes>MAX_ENTRY||v.getUint16(p+34,true)||p+46+nl+el+cl>size)fail('Unsupported compressed/encrypted/oversize ZIP entry');
  const path=new TextDecoder('utf-8',{fatal:true}).decode(directory.subarray(p+46,p+46+nl));
  if(!safePath(path)||entries.has(path))fail('Unsafe or duplicate ZIP path');
  const header=await read(file,local,30),h=dv(header);
  if(h.getUint32(0,true)!==0x04034b50||h.getUint16(6,true)!==flags||h.getUint16(8,true)!==method||h.getUint32(14,true)!==v.getUint32(p+16,true)||h.getUint32(18,true)!==bytes||h.getUint32(22,true)!==bytes||h.getUint16(26,true)!==nl)fail('ZIP local header mismatch');
  const name=await read(file,local+30,nl);if(new TextDecoder('utf-8',{fatal:true}).decode(name)!==path)fail('ZIP local filename mismatch');
  const start=local+30+nl+h.getUint16(28,true),finish=start+bytes;
  if(finish>offset)fail('ZIP entry overlaps directory');
  ranges.push([local,finish]);entries.set(path,{path,start,bytes});p+=46+nl+el+cl;
 }
 if(p!==size)fail('Unexpected ZIP directory data');
 ranges.sort((a,b)=>a[0]-b[0]);for(let i=1;i<ranges.length;i++)if(ranges[i][0]<ranges[i-1][1])fail('Overlapping ZIP entries');
 return entries;
}
export function expectedFiles(catalog){const map=new Map();for(const entry of catalog.entries){const unit=typeof entry.unit==='number'?catalog.units[entry.unit]:entry.unit;for(const [role,ref]of [['unit',unit],['poster',entry.storyMedia?.poster],['video',entry.storyMedia?.video],['staticPoster',entry.storyMedia?.staticPoster]])if(ref){const path='gre-learning/'+ref.url;const old=map.get(path);if(old){old.wordIds.add(entry.number);old.roles.add(role);}else map.set(path,{...ref,roles:new Set([role]),wordIds:new Set([entry.number])});}}return map;}
export async function validatePack(file,catalog,{signal,onProgress=()=>{}}={}){
 const entries=await indexZip(file),m=entries.get('manifest.json');if(!m||m.bytes>2*1024*1024)fail('Package manifest missing or too large');
 const manifest=JSON.parse(await file.slice(m.start,m.start+m.bytes).text());
 if(manifest.format!=='gre-offline-pack-v1'||!/^[-a-zA-Z0-9_.]{1,100}$/.test(manifest.packId)||!/^[-a-zA-Z0-9_.]{1,100}$/.test(manifest.version)||!Array.isArray(manifest.files)||!Array.isArray(manifest.wordIds)||!manifest.wordIds.length||manifest.wordIds.length>200||new Set(manifest.wordIds).size!==manifest.wordIds.length)fail('Unsupported package manifest');
 const positions=manifest.wordIds.map(id=>catalog.entries.findIndex(e=>e.number===id));if(positions.some((position,i)=>position<0||(i>0&&position<=positions[i-1])))fail('Package word order does not match this edition');
 const expected=expectedFiles(catalog),seen=new Set(),indexed=[];
 for(const ref of manifest.files){
  if(signal?.aborted)throw new DOMException('Import cancelled','AbortError');
  const zip=entries.get(ref.path),known=expected.get(ref.path);
  // Historical text units may travel in an old backup. They are checksum-checked but
  // never substitute for the current text shell; unchanged media remains reusable.
  const historicalUnit=!known&&ref.role==='unit'&&ref.bytes<=2*1024*1024&&/^[a-f0-9]{64}$/.test(ref.sha256)&&new RegExp('^gre-learning/units/[A-Za-z0-9_-]+-'+ref.sha256+'\\.json$').test(ref.path);
  if(!safePath(ref.path)||seen.has(ref.path)||!zip||!manifest.wordIds.includes(ref.wordId)||ref.bytes!==zip.bytes||(!historicalUnit&&(!known||!known.roles.has(ref.role)||!known.wordIds.has(ref.wordId)||ref.bytes!==known.bytes||ref.sha256!==known.sha256)))fail('Package asset does not match approved edition');
  seen.add(ref.path);const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.slice(zip.start,zip.start+zip.bytes).arrayBuffer())),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==ref.sha256)fail('Package asset checksum failed');
  indexed.push({...ref,start:zip.start});onProgress({phase:'verify',completed:indexed.length,total:manifest.files.length});
 }
 if(entries.size!==seen.size+1)fail('Unexpected package files');
 for(const [path,ref]of expected)if(!ref.roles.has('unit')&&[...ref.wordIds].some(id=>manifest.wordIds.includes(id))&&!seen.has(path))fail('Package is missing a lesson asset');
 return {manifest,files:indexed};
}
