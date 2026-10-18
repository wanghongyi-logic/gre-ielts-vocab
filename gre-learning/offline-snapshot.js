// Small synchronous UI snapshot; authoritative storage is reconciled in the
// background. Identity comparison carries unchanged words across app updates.
export const savedSnapshotKey='gre-saved-inventory-v1';
const refs=entry=>[entry.storyMedia?.video,entry.storyMedia?.poster,entry.storyMedia?.staticPoster].filter(Boolean);
export function createSavedSnapshot(catalog,storage){
 let lastSaved=null;
 const identities=new Map(catalog.entries.map(entry=>[entry.number,JSON.stringify(refs(entry).map(ref=>[ref.url,ref.sha256,ref.bytes]))]));
 function restore(){try{const value=JSON.parse((storage||globalThis.localStorage).getItem(savedSnapshotKey));if(value?.version!==1||!Array.isArray(value.words))return null;return value.words.filter(([id,identity])=>identities.get(id)===identity).map(([id])=>id);}catch{return null;}}
 function generation(){try{const value=JSON.parse((storage||globalThis.localStorage).getItem(savedSnapshotKey));return value?.version===1&&Number.isSafeInteger(value.generation)?value.generation:null;}catch{return null;}}
 function matchesGeneration(state){return state.phase!=='clearing'&&state.phase!=='selective-clearing'&&generation()!==null&&generation()===state.generation;}
 function save(ids,generation){try{const value=JSON.stringify({version:1,...(Number.isSafeInteger(generation)?{generation}:{}),words:[...new Set(ids)].filter(id=>identities.has(id)).sort((a,b)=>a-b).map(id=>[id,identities.get(id)])});if(value===lastSaved)return;lastSaved=value;if((storage||globalThis.localStorage).getItem(savedSnapshotKey)!==value)(storage||globalThis.localStorage).setItem(savedSnapshotKey,value);}catch{}}
 function invalidate(){lastSaved=null;try{(storage||globalThis.localStorage).removeItem(savedSnapshotKey);}catch{}}
 return {restore,save,invalidate,generation,matchesGeneration};
}

