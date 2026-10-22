import {FORMAT,validateVariant,verify,sourceOf,key,catalogSources} from './compression-variants.js';
import {indexZip,validatePack,expectedFiles,safePath} from './vendor/offline-zip.js';
import {CRC32} from './vendor/offline-export-hash.js';
const enc=new TextEncoder();
function header(path,bytes,crc,offset,central){const name=enc.encode(path),b=new Uint8Array((central?46:30)+name.length),v=new DataView(b.buffer);v.setUint32(0,central?0x02014b50:0x04034b50,true);if(central){v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint16(8,0x800,true);v.setUint32(16,crc,true);v.setUint32(20,bytes,true);v.setUint32(24,bytes,true);v.setUint16(28,name.length,true);v.setUint32(42,offset,true);}else{v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,bytes,true);v.setUint32(22,bytes,true);v.setUint16(26,name.length,true);}b.set(name,central?46:30);return b;}
export async function exportVariants(records,read){
 if(!records.length||records.length>19999)throw Error('Unsupported archive count');
 const items=[],files=[];for(let i=0;i<records.length;i++){const f=records[i];if(f.kind==='owned-local-variant')validateVariant(f);else if(!safePath(f.path))throw Error('Invalid canonical path');const blob=await verify(await read(f),f);const archivePath=`media/${i}.bin`;files.push({...f,ownerPack:undefined,start:undefined,archivePath});items.push({path:archivePath,blob});}
 items.unshift({path:'manifest.json',blob:new Blob([JSON.stringify({format:FORMAT,trust:'owned-local-not-official',files})])});
 const estimated=items.reduce((n,x)=>n+x.blob.size+76+2*enc.encode(x.path).length,22);if(estimated>=0xffffffff||items[0].blob.size>20*1024*1024)throw Error('所选范围超过安全 ZIP32 或元数据上限，无法生成单个包');
 const parts=[],central=[];let offset=0;
 for(const {path,blob} of items){const c=new CRC32();c.update(new Uint8Array(await blob.arrayBuffer()));const crc=c.digest(),h=header(path,blob.size,crc,0,false);central.push(header(path,blob.size,crc,offset,true));parts.push(h,blob);offset+=h.length+blob.size;}
 const start=offset;for(const c of central){parts.push(c);offset+=c.length;}const b=new Uint8Array(22),v=new DataView(b.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,items.length,true);v.setUint16(10,items.length,true);v.setUint32(12,offset-start,true);v.setUint32(16,start,true);parts.push(b);return new Blob(parts,{type:'application/zip'});
}
export async function importVariantArchive(blob,catalog,{validateMedia,allowOwnedHistorical=false,signal}={}){
 const zip=await indexZip(blob),m=zip.get('manifest.json');if(!m||m.bytes>20*1024*1024)throw Error('Missing/oversize manifest');const manifest=JSON.parse(await blob.slice(m.start,m.start+m.bytes).text());
 if(manifest.format==='gre-offline-pack-v1')return {...await validatePack(blob,catalog,{signal}),trust:'official-catalog-validated'};
 if(manifest.format!==FORMAT||manifest.trust!=='owned-local-not-official'||!Array.isArray(manifest.files)||!manifest.files.length||manifest.files.length>19999||typeof validateMedia!=='function')throw Error('Unsupported variant archive');
 const expected=expectedFiles(catalog);const current=new Map(catalogSources(catalog).map(s=>[s.wordId+'|'+s.role,s])),seen=new Set(),bindings=new Set(),files=[];
 for(const f of manifest.files){if(signal?.aborted)throw new DOMException('Cancelled','AbortError');if(f.kind==='owned-local-variant')validateVariant(f);else{const known=expected.get(f.path);if(f.kind||!known||!known.roles.has(f.role)||!known.wordIds.has(f.wordId)||known.sha256!==f.sha256||known.bytes!==f.bytes)throw Error('Canonical asset not approved');}if(!/^media\/[0-9]+\.bin$/.test(f.archivePath)||seen.has(f.archivePath)||bindings.has(key(sourceOf(f))))throw Error('Duplicate/unsafe variant');seen.add(f.archivePath);bindings.add(key(sourceOf(f)));const s=current.get(f.wordId+'|'+f.role);if(f.kind==='owned-local-variant'&&(s?key(s)!==key(f.source):!allowOwnedHistorical))throw Error('Source not bound to current catalog');const e=zip.get(f.archivePath);if(!e||e.bytes!==f.bytes)throw Error('Missing output');const output=await verify(blob.slice(e.start,e.start+e.bytes),f);if(f.kind==='owned-local-variant')await validateMedia(output,f);files.push({...f,start:e.start});}
 if(zip.size!==files.length+1)throw Error('Unexpected archive entries');return {manifest,files,trust:'owned-local-not-official'};
}
