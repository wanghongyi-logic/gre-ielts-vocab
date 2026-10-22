import {key,validSource,validateVariant,verify} from './compression-variants.js';
const abort=s=>{if(s?.aborted)throw new DOMException('Cancelled','AbortError');};
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
export const canonicalJSON=value=>JSON.stringify(canonical(value));
export const validSpoolName=name=>/^spool-[a-zA-Z0-9_-]{1,100}\.bin$/.test(name);
// Separate durable staging records never become canonical pack metadata. A
// writing record precedes every file creation, so interrupted staging is owned.
export function createCompressionSpool(a){
 const check=d=>{if(!d?.spool||!validSpoolName(d.spool.name)||!validSource(d.source)||key(d.source)!==key(d.variant?.source))throw Error('Invalid spool descriptor');validateVariant(d.variant);if(d.spool.sha256!==d.variant.sha256||d.spool.bytes!==d.variant.bytes)throw Error('Spool identity mismatch');};
 async function read(d){check(d);const record=await a.spoolGet(d.spool.name);if(!record||record.state!=='ready'||canonicalJSON(record)!==canonicalJSON(d))throw Error('Spool is not ready or changed');return verify(await a.readFile(d.spool.name),d.variant);}
 async function discard(ds){for(const d of ds){check(d);await a.removeFile(d.spool.name);await a.spoolDelete(d.spool.name);}}
 async function stage(sessionId,source,variant,blob,{signal}={}){
  if(typeof sessionId!=='string'||!sessionId||sessionId.length>200)throw Error('Invalid spool session');
  const d={source:structuredClone(source),variant:structuredClone(variant),spool:{name:`spool-${a.id()}.bin`,sessionId,sha256:variant.sha256,bytes:variant.bytes},state:'writing'};check(d);abort(signal);await verify(blob,variant);await a.validateMedia(blob,variant);
  const free=await a.freeSpace();if(!Number.isFinite(free)||free<blob.size+65536)throw Error('Insufficient spool space; originals retained');
  await a.spoolPut(d);await a.boundary?.('spoolPrepared');abort(signal);await a.writeFile(d.spool.name,blob,{signal});await a.boundary?.('spoolWritten');abort(signal);await verify(await a.readFile(d.spool.name),variant);d.state='ready';await a.spoolPut(d);await a.boundary?.('spoolReady');return d;
 }
 async function recover(sessionId){const ready=[];for(const d of await a.spoolList(sessionId)){check(d);if(d.state!=='ready'){await discard([d]);continue;}try{await read(d);ready.push(d);}catch{await discard([d]);}}return ready;}
 return {read,stage,discard,recover,discardSession:async id=>discard(await a.spoolList(id))};
}
