import {importVariantArchive} from './compression-archive.js';
import {catalogSources,digest,verify} from './compression-variants.js';
import {SHA256} from './vendor/offline-export-hash.js';
import {validateVariantMedia} from './variant-media-validation.js';
const abort=s=>{if(s?.aborted)throw new DOMException('Import cancelled','AbortError');};
export async function hashArchive(blob,signal){const sha=new SHA256();for(let at=0;at<blob.size;at+=1048576){abort(signal);sha.update(new Uint8Array(await blob.slice(at,at+1048576).arrayBuffer()));}abort(signal);return sha.hex();}
// Only called by an explicit ordinary import under the existing pack lock.
// Additive storage: never replace/delete original packs, cache, or preview spools.
export async function importOwnedArchive(blob,catalog,a,{signal,validateMedia=validateVariantMedia}={}){
 if(!await a.compatibleClients())throw Error('Close old library tabs before importing this backup');
 await a.guard(()=>{});abort(signal);const revision=await digest(new Blob([JSON.stringify(catalogSources(catalog))]));
 const parsed=await importVariantArchive(blob,catalog,{signal,validateMedia});
 const hash=await hashArchive(blob,signal),key='local-backup@'+hash,existing=(await a.list()).find(p=>p.key===key);
 if(existing){const stored=await a.read(existing.name);if(stored.size!==existing.bytes)throw Error('Stored archive length mismatch');for(const f of existing.files)await verify(stored.slice(f.start,f.start+f.bytes),f);return a.guard(()=>({...existing,duplicate:true}));}
 await a.ensureSpace(blob.size+65536+2*new TextEncoder().encode(JSON.stringify(parsed.files)).length);
 await a.prepare();const name=a.temporaryName();let committed=false;
 try{
  await a.copy(blob,name);abort(signal);const stored=await a.read(name);if(stored.size!==blob.size)throw Error('Stored archive length mismatch');
  for(const f of parsed.files){abort(signal);const b=await verify(stored.slice(f.start,f.start+f.bytes),f);if(f.kind==='owned-local-variant')await validateMedia(b,f,{signal});}
  const current=await a.catalogProvider();if(await digest(new Blob([JSON.stringify(catalogSources(current))]))!==revision)throw Error('Catalog changed during import');
  const record={key,name,files:parsed.files,bytes:stored.size,wordIds:[...new Set(parsed.files.map(f=>f.wordId))],packId:'local-backup',version:hash,storageFormat:'owned-local-slices-v1',installedAt:Date.now()};
  return await a.guard(async()=>{abort(signal);if(!await a.compatibleClients())throw Error('Client compatibility changed during import');const result=await a.commit(record,()=>{committed=true;});committed=true;return {...record,duplicate:false,...(Number.isSafeInteger(result?.committedGeneration)?{committedGeneration:result.committedGeneration}:{})};});
 }finally{if(!committed)await a.remove(name).catch(()=>{});}
}
