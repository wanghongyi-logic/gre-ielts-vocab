// Explicit owned-local bytes: source binding is identity, NOT proof of derivation.
export const FORMAT='gre-owned-local-variants-v1';
const roles=new Set(['video','poster','staticPoster']);
export const key=s=>JSON.stringify([s.path,s.sha256,s.bytes,s.wordId,s.role]);
export const sourceOf=f=>f.source||{path:f.path,sha256:f.sha256,bytes:f.bytes,wordId:f.wordId,role:f.role};
export const digest=async blob=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');
export function validSource(s){return s&&/^gre-learning\/story-media\/[A-Za-z0-9_./-]+$/.test(s.path)&&!s.path.split('/').some(x=>!x||x==='.'||x==='..')&&/^[a-f0-9]{64}$/.test(s.sha256)&&Number.isSafeInteger(s.bytes)&&s.bytes>0&&Number.isSafeInteger(s.wordId)&&roles.has(s.role);}
export function validateVariant(f){
 if(f.kind!=='owned-local-variant'||!validSource(f.source)||f.wordId!==f.source.wordId||f.role!==f.source.role||!/^variants\/[a-f0-9]{64}\.(mp4|png|webp|jpg)$/.test(f.path)||! /^[a-f0-9]{64}$/.test(f.sha256)||!Number.isSafeInteger(f.bytes)||f.bytes<1||f.bytes>150000||f.bytes>=f.source.bytes)throw Error('Invalid variant identity');
 const ext={'video/mp4':'mp4','image/png':'png','image/webp':'webp','image/jpeg':'jpg'}[f.mime];
 if(!ext||f.path!==`variants/${f.sha256}.${ext}`||(f.role==='video')!==(f.mime==='video/mp4')||f.profile?.id!=='sample02-local-v1'||f.profile.maxEdge!==512||f.profile.lossy!==true)throw Error('Invalid variant MIME/profile');
 return f;
}
export async function verify(blob,f){
 if(!blob||blob.size!==f.bytes||await digest(blob)!==f.sha256)throw Error('Stored checksum mismatch');
 if(f.kind!=='owned-local-variant')return blob;
 validateVariant(f);const b=new Uint8Array(await blob.slice(0,16).arrayBuffer()),ascii=(a,z)=>String.fromCharCode(...b.slice(a,z));
 const ok=f.mime==='video/mp4'?ascii(4,8)==='ftyp':f.mime==='image/png'?b[0]===137&&ascii(1,4)==='PNG'&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10:f.mime==='image/webp'?ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP':b[0]===255&&b[1]===216&&b[2]===255;
 if(!ok)throw Error('Unsafe/mismatched media signature');return blob.slice(0,blob.size,f.mime);
}
export function catalogSources(catalog){return catalog.entries.flatMap(e=>[...roles].flatMap(role=>{const r=e.storyMedia?.[role];return r?[{path:'gre-learning/'+r.url,sha256:r.sha256,bytes:r.bytes,wordId:e.number,role}]:[];}));}
export async function resolveSaved(source,records,read){
 if(!validSource(source))throw Error('Invalid source');
 for(const f of records.filter(f=>key(sourceOf(f))===key(source)).sort((a,b)=>(b.kind==='owned-local-variant')-(a.kind==='owned-local-variant'))){try{const blob=await verify(await read(f),f);return {blob,record:f,kind:f.kind||'canonical',source};}catch{}}
 return null;
}
// Every consumer uses the same verified resolution, not path-only readiness.
export async function savedInventory(sources,records,read){const result=[];for(const s of sources)if(await resolveSaved(s,records,read))result.push(s);return result;}
export async function needsDownload(source,records,read){return !await resolveSaved(source,records,read);}
