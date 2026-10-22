import {createCompressionSpool,validSpoolName} from './compression-spool.js';
import {SHA256} from './vendor/offline-export-hash.js';
import {importVariantArchive} from './compression-archive.js';
import {key,sourceOf,validSource,validateVariant,verify,digest} from './compression-variants.js';
const clone=x=>structuredClone(x),abort=s=>{if(s?.aborted)throw new DOMException('Cancelled','AbortError');};
export async function hashArchive(blob,signal){const sha=new SHA256();for(let n=0;n<blob.size;n+=1048576){abort(signal);sha.update(new Uint8Array(await blob.slice(n,n+1048576).arrayBuffer()));}abort(signal);return sha.hex();}
// Adapter methods are deliberately injectable. All state transitions run under
// BOTH established locks, pack first then media. No new unobserved lock claims.
export function createCompressionStorage(a){
 const spool=createCompressionSpool(a);
 const candidate=x=>x.spool?spool.read(x):Promise.resolve(x.blob);
 async function recoverLocked(){
  const state=await a.snapshot();for(const j of state.journals||[]){
   if(j.phase==='prepared'){for(const name of j.newNames)await a.removeFile(name);await a.removeJournal(j.id);}
   else if(j.phase==='committed'){
    // Metadata is authoritative after commit; never roll back a lossy operation.
    for(const name of j.oldNames)await a.removeFile(name);
    for(const c of j.cacheDeletes)await a.deleteCacheIfHash(c.path,c.sha256,c.bytes);
    for(const name of j.spoolNames||[]){if(!validSpoolName(name))throw Error('Invalid journal spool name');await a.removeFile(name);await a.spoolDelete(name);}
    await a.removeJournal(j.id);
   }else throw Error('Unknown durable journal phase');
  }
 }
 async function plan(selections,{signal}={}){
  abort(signal);const snap=await a.snapshot(),catalog=await a.catalog();
  const chosen=new Map();for(const x of selections){if(!validSource(x.source)||chosen.has(key(x.source)))throw Error('Invalid/duplicate selection');validateVariant(x.variant);if(key(x.variant.source)!==key(x.source))throw Error('Variant source mismatch');const blob=await candidate(x);await verify(blob,x.variant);if(!x.spool)await a.validateMedia(blob,x.variant);chosen.set(key(x.source),x);}
  if(!chosen.size)throw Error('No selections');
  const current=new Map(catalog.sources.map(s=>[s.wordId+'|'+s.role,s]));
  for(const x of chosen.values()){const live=current.get(x.source.wordId+'|'+x.source.role);if(live&&key(live)!==key(x.source))throw Error('Catalog source changed');}
  const changes=[],found=new Set();let newBytes=0,oldBytes=0;
  for(const p of snap.packs){let changed=false;const entries=[];
   for(const f of p.files){const selection=chosen.get(key(sourceOf(f)));if(selection){found.add(key(selection.source));if(f.kind==='owned-local-variant'&&f.sha256===selection.variant.sha256){entries.push({entry:f,pack:p});continue;}await verify(await a.readEntry(p,f),f);changed=true;entries.push({entry:selection.variant,selection});}else entries.push({entry:f,pack:p});}
   if(changed){changes.push({pack:p,entries});newBytes+=entries.reduce((n,x)=>n+x.entry.bytes,0);oldBytes+=p.bytes;}
  }
  const cacheDeletes=[],cacheOnlyEntries=[];let cacheBytes=0;
  for(const c of snap.cache){const selection=chosen.get(key(c));if(selection){await verify(await a.readCache(c.path),c);cacheDeletes.push(c);cacheBytes+=c.bytes;if(!found.has(key(c))){found.add(key(c));cacheOnlyEntries.push({entry:selection.variant,selection});newBytes+=selection.variant.bytes;}}}
  if(cacheOnlyEntries.length)changes.push({pack:null,entries:cacheOnlyEntries});
  if([...chosen.keys()].some(k=>!found.has(k)))throw Error('Selected source no longer local');
  const summary={selected:[...chosen.values()].map(x=>({source:x.source,variant:x.variant})),generation:snap.generation,revision:snap.revision,catalogRevision:catalog.revision,originalPackedBytes:oldBytes,duplicateCacheBytes:cacheBytes,replacementBytes:newBytes,estimatedSavingBytes:oldBytes+cacheBytes-newBytes,temporaryBytes:newBytes+65536+2*new TextEncoder().encode(JSON.stringify({changes:changes.map(c=>({pack:c.pack,files:c.entries.map(x=>x.entry)})),cacheDeletes})).length,irreversibleLossy:true};
  if(summary.estimatedSavingBytes<0)throw Error('Replacement would increase storage');
  const token=await digest(new Blob([JSON.stringify(summary)]));return {summary,token,changes,cacheDeletes};
 }
 async function replace(selections,approval,{signal}={}){
  // Runtime attestation is an integration requirement, NOT a way to detect old
  // tabs. Production stays disabled until the deployment coordinator proves it.
  if(!await a.compatibleClients())throw Error('All clients must be upgraded and legacy tabs closed');
  return a.lock(async()=>{
   await recoverLocked();const p=await plan(selections,{signal});
   if(approval?.token!==p.token||approval?.irreversibleLossy!==true||approval?.exactFilesConfirmed!==true)throw Error('Explicit exact-file lossy confirmation required');
   if(!p.changes.length&&!p.cacheDeletes.length)return {duplicate:true,calculatedSavingBytes:0};
   await a.prepareMutation?.();
   const free=await a.freeSpace();if(!Number.isFinite(free)||free<p.summary.temporaryBytes)throw Error('Insufficient temporary space; originals retained');
   const id=a.id(),newNames=p.changes.map((_,i)=>`variant-${id}-${i}.bin`),j={id,phase:'prepared',newNames,oldNames:p.changes.filter(x=>x.pack).map(x=>x.pack.name),cacheDeletes:p.cacheDeletes,spoolNames:selections.filter(x=>x.spool).map(x=>x.spool.name)};
   await a.putJournal(j);await a.boundary?.('prepared');
   const replacements=[];
   // Exceptions deliberately retain the prepared journal for crash-safe cleanup.
   for(let i=0;i<p.changes.length;i++){
    abort(signal);const c=p.changes[i],files=[];let start=0;
    for(const x of c.entries){files.push({...x.entry,start});start+=x.entry.bytes;}
    async function* parts(){for(const x of c.entries){abort(signal);const blob=x.selection?await candidate(x.selection):await a.readEntry(x.pack,x.entry);await verify(blob,x.entry);yield blob;}}
    if(a.writeParts)await a.writeParts(newNames[i],parts(),start,{signal});
    else {const chunks=[];for await(const blob of parts())chunks.push(blob);await a.writeFile(newNames[i],new Blob(chunks),{signal});}
    await a.boundary?.('written');const stored=await a.readFile(newNames[i]);if(stored.size!==start)throw Error('Pack length mismatch');
    for(const f of files){const b=stored.slice(f.start,f.start+f.bytes);await verify(b,f);if(f.kind==='owned-local-variant')await a.validateMedia(b,f);}await a.boundary?.('verified');
    replacements.push({...c.pack,key:c.pack?.key||`local-variant@${id}-${i}`,name:newNames[i],bytes:start,files,wordIds:c.pack?.wordIds||[...new Set(files.map(f=>f.wordId))],packId:c.pack?.packId||'local-variant',version:c.pack?.version||'1',storageFormat:'owned-local-slices-v1',originalIdentity:c.pack?.originalIdentity||(c.pack?JSON.stringify(c.pack.files.map(f=>[f.path,f.role,f.wordId,f.bytes,f.sha256]).sort((a,b)=>a[0].localeCompare(b[0]))):undefined),installedAt:Date.now()});
   }
   abort(signal);const now=await a.snapshot(),cat=await a.catalog();if(now.generation!==p.summary.generation||now.revision!==p.summary.revision||cat.revision!==p.summary.catalogRevision)throw Error('Library/catalog changed; confirm again');
   await a.boundary?.('beforeCommit');abort(signal);if(!await a.compatibleClients())throw Error('Client generation changed; original retained');
   // Atomic transaction includes replacement metadata AND committed journal.
   const committed=await a.commit(replacements,{...j,phase:'committed'},p.summary);await a.boundary?.('committed');
   // Cancellation no longer interrupts cleanup. A failed cleanup remains durable.
   await recoverLocked();await a.boundary?.('cleaned');return {calculatedSavingBytes:p.summary.estimatedSavingBytes,cleanupPending:false,committedGeneration:committed?.committedGeneration};
  });
 }
 async function importArchive(blob,catalog,{signal,allowOwnedHistorical=false}={}){
  if(!await a.compatibleClients())throw Error('All clients must be upgraded and legacy tabs closed');
  return a.lock(async()=>{
   await a.prepareMutation?.();await recoverLocked();abort(signal);const before=await a.snapshot(),cat=await a.catalog();
   const parsed=await importVariantArchive(blob,catalog,{signal,allowOwnedHistorical,validateMedia:a.validateMedia});
   const current=new Map(cat.sources.map(s=>[s.wordId+'|'+s.role,s]));
   for(const f of parsed.files){if(f.role==='unit')continue;const source=sourceOf(f),live=current.get(source.wordId+'|'+source.role);if(live?key(live)!==key(source):!allowOwnedHistorical)throw Error('Import catalog is stale');}
   const archiveHash=await hashArchive(blob,signal),packKey='local-backup@'+archiveHash;
   const existing=before.packs.find(p=>p.key===packKey);
   if(existing){for(const f of existing.files)await verify(await a.readEntry(existing,f),f);return {duplicate:true,pack:existing};}
   if(await a.freeSpace()<blob.size+65536+2*new TextEncoder().encode(JSON.stringify(parsed.files)).length)throw Error('Insufficient temporary space; originals retained');
   const id=a.id(),name=`variant-${id}-import.bin`,j={id,phase:'prepared',newNames:[name],oldNames:[],cacheDeletes:[]};
   await a.putJournal(j);await a.boundary?.('prepared');abort(signal);await a.writeFile(name,blob,{signal});await a.boundary?.('written');
   const stored=await a.readFile(name);if(stored.size!==blob.size)throw Error('Archive length mismatch');
   for(const f of parsed.files){abort(signal);const b=stored.slice(f.start,f.start+f.bytes);await verify(b,f);if(f.kind==='owned-local-variant')await a.validateMedia(b,f);}
   await a.boundary?.('verified');const after=await a.snapshot();if(after.revision!==before.revision||after.generation!==before.generation||(await a.catalog()).revision!==cat.revision)throw Error('Library/catalog changed');abort(signal);
   const pack={key:packKey,name,files:parsed.files,bytes:stored.size,wordIds:[...new Set(parsed.files.map(f=>f.wordId))],packId:'local-backup',version:archiveHash,storageFormat:'owned-local-slices-v1',installedAt:Date.now()};
   await a.boundary?.('beforeCommit');abort(signal);if(!await a.compatibleClients())throw Error('Client generation changed; original retained');const committed=await a.commit([pack],{...j,phase:'committed'},before);await a.boundary?.('committed');await recoverLocked();return {pack,duplicate:false,committedGeneration:committed?.committedGeneration};
  });
 }
 async function groupSources(sources){return a.lock(async()=>{
  const snap=await a.snapshot(),catalog=await a.catalog(),unique=new Map(),skipped=[];
  const live=new Map(catalog.sources.map(s=>[s.wordId+'|'+s.role,s]));
  for(const source of sources){if(!validSource(source)||unique.has(key(source)))throw Error('Invalid/duplicate source scope');const current=live.get(source.wordId+'|'+source.role);if(current&&key(current)!==key(source))throw Error('Catalog source changed');unique.set(key(source),source);}
  const owners=new Map();for(const p of snap.packs)for(const f of p.files){const k=key(sourceOf(f));if(unique.has(k)){if(!owners.has(k))owners.set(k,[]);owners.get(k).push({pack:p,entry:f});}}
  const cacheKeys=new Set(snap.cache.map(key)),eligible=new Map();for(const [k,source] of unique){if(source.bytes<=150000){skipped.push({source,reason:'already-small'});continue;}
   let variant=false;for(const x of owners.get(k)||[])if(x.entry.kind==='owned-local-variant'){try{await verify(await a.readEntry(x.pack,x.entry),x.entry);variant=true;break;}catch{}}
   if(variant){skipped.push({source,reason:'already-variant'});continue;}
   if(!owners.has(k)&&!cacheKeys.has(k)){skipped.push({source,reason:'not-local'});continue;}eligible.set(k,source);
  }
  const parent=new Map([...eligible.keys()].map(k=>[k,k])),find=k=>{let root=k;while(parent.get(root)!==root)root=parent.get(root);while(k!==root){const next=parent.get(k);parent.set(k,root);k=next;}return root;};
  const byPack=new Map();for(const k of eligible.keys())for(const x of owners.get(k)||[]){const prior=byPack.get(x.pack.key);if(prior)parent.set(find(k),find(prior));else byPack.set(x.pack.key,k);}
  const grouped=new Map(),cacheOnly=[];for(const [k,source] of eligible){if(!owners.has(k)){cacheOnly.push(source);continue;}const root=find(k);if(!grouped.has(root))grouped.set(root,[]);grouped.get(root).push(source);}
  const groups=[...grouped.values()];for(let i=0;i<cacheOnly.length;i+=128)groups.push(cacheOnly.slice(i,i+128));
  return {groups:groups.map((sources,i)=>({id:'group-'+i,sources})),skipped,generation:snap.generation,revision:snap.revision,catalogRevision:catalog.revision};
 });}
 return {groupSources,spoolCandidate:(...args)=>a.lock(()=>spool.stage(...args)),recoverSpool:id=>a.lock(()=>spool.recover(id)),discardSpool:ds=>a.lock(()=>spool.discard(ds)),discardSessionSpool:id=>a.lock(()=>spool.discardSession(id)),plan:(s,o)=>a.lock(()=>plan(s,o)),replace,importArchive,recover:()=>a.lock(recoverLocked)};
}
