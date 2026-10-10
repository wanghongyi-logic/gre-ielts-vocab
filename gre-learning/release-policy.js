// Stable IDs identify progress/history; display ordinals never replace stored IDs.
export const STANDARD_VERSION = 'gre-deep-20261010-v1';
export const APPROVED_SEQUENCE = Object.freeze([175,176,177,178,179,180,181,182,183,184]);
export const STORYBOOK_SAMPLE_SEQUENCE = Object.freeze([175,176,177,178,179]);
export const STORYBOOK_BATCH_MODE = 'storybook-five-word-batches';
export function isStorybookCatalog(raw) {
 const mode=raw?.learningRelease?.sampleMode;
 return mode==='storybook-first-five'||mode===STORYBOOK_BATCH_MODE;
}
function validateStoryMedia(media) {
 if(!media||!Number.isSafeInteger(media.width)||media.width<=0||!Number.isSafeInteger(media.height)||media.height<=0||!Number.isFinite(media.durationMs)||media.durationMs<=0||typeof media.alt!=='string'||!media.alt.trim())throw new Error('Storybook media metadata missing');
 for(const [kind,extensions] of [['poster',/\.(png|webp|jpe?g|avif)$/i],['video',/\.(mp4|webm)$/i]]){
  const ref=media[kind];
  if(!ref||typeof ref.url!=='string'||!/^story-media\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+$/.test(ref.url)||!extensions.test(ref.url)||!/^[a-f0-9]{64}$/.test(ref.sha256)||!ref.url.split('/').at(-1).includes(ref.sha256)||!Number.isSafeInteger(ref.bytes)||ref.bytes<=0)throw new Error('Storybook media integrity reference missing');
 }
 if(media.poster.url===media.video.url)throw new Error('Storybook poster and video must be distinct');
 return media;
}
export function gateCatalog(raw) {
 if(raw.schema!==1||!Array.isArray(raw.units)||!Array.isArray(raw.entries))throw new Error('Unsupported catalog');
 const policy=raw.learningRelease;
 if(!policy||policy.standardVersion!==STANDARD_VERSION||!Array.isArray(policy.approvedIds))throw new Error('New-standard release approval missing');
 if(policy.approvedIds.length&&policy.status!=='approved')throw new Error('Batch review not approved');
 const sample=policy.sampleMode==='storybook-first-five',batches=policy.sampleMode===STORYBOOK_BATCH_MODE,storybook=isStorybookCatalog(raw);
 if(policy.sampleMode!==undefined&&!storybook)throw new Error('Unsupported sample mode');
 if(policy.batchSize!==(batches?5:10))throw new Error('Incorrect release batch size');
 if(storybook){
  if(typeof raw.preview!=='boolean')throw new Error('Storybook preview state must be explicit');
  if(sample&&(policy.approvedIds.length!==5||policy.approvedIds.some((id,i)=>id!==STORYBOOK_SAMPLE_SEQUENCE[i])))throw new Error('Storybook sample must be exactly the first five stable IDs');
  // The hash-verified catalog is the explicit review ledger. Later five-word batches
  // need new approved metadata/assets, never a code edit that pre-approves future IDs.
  if(batches&&(!policy.approvedIds.length||policy.approvedIds.length%5!==0||policy.approvedIds.some((id,i)=>!Number.isSafeInteger(id)||id<1||id!==175+i)))throw new Error('Only complete reviewed five-word batches may be released');
  if(policy.mediaStatus!=='approved'&&!(raw.preview===true&&policy.mediaStatus==='pending'))throw new Error('Storybook media review not approved');
 }else if(policy.approvedIds.length%10!==0||policy.approvedIds.some((id,i)=>id!==APPROVED_SEQUENCE[i]))throw new Error('Only complete approved batches may be released');
 const seen=new Set();
 for(const entry of raw.entries){if(seen.has(entry.number))throw new Error('Duplicate canonical ID');seen.add(entry.number);}
 const entries=policy.approvedIds.map((id,i)=>{
  const entry=raw.entries.find(item=>item.number===id);
  if(!entry||entry.standardVersion!==STANDARD_VERSION||entry.reviewStatus!=='approved'||entry.textApproved!==true||entry.artApproved!==true||entry.displayOrdinal!==i+1)throw new Error('Lesson is not new-standard approved');
  const unit=raw.units[entry.unit];
  if(!Number.isSafeInteger(entry.unit)||entry.unit<0||!unit||typeof unit.url!=='string'||!/^units\/[A-Za-z0-9_-]+\.json$/.test(unit.url)||!/^[a-f0-9]{64}$/.test(unit.sha256)||!unit.url.endsWith('-'+unit.sha256+'.json')||!Number.isSafeInteger(unit.bytes)||unit.bytes<=0||!/^[a-f0-9]{64}$/.test(entry.art?.sha256)||!Number.isSafeInteger(entry.art?.bytes)||entry.art.bytes<=0)throw new Error('Approved lesson assets missing');
  if(storybook&&(batches||policy.mediaStatus==='approved'||entry.storyMedia))validateStoryMedia(entry.storyMedia);
  return entry;
 });
 const integrityRefs=new Map(),digestBytes=new Map();
 for(const entry of entries){
  const refs=[raw.units[entry.unit],...(entry.storyMedia?[entry.storyMedia.poster,entry.storyMedia.video]:[])];
  for(const ref of refs){
   const prior=integrityRefs.get(ref.url);
   if(prior&&(prior.sha256!==ref.sha256||prior.bytes!==ref.bytes))throw new Error('Conflicting integrity declarations for one asset URL');
   if(digestBytes.has(ref.sha256)&&digestBytes.get(ref.sha256)!==ref.bytes)throw new Error('Conflicting byte counts for one content hash');
   integrityRefs.set(ref.url,ref);
   digestBytes.set(ref.sha256,ref.bytes);
  }
 }
 if(raw.publishedCount!==entries.length||raw.authoredCount!==entries.length||raw.libraryTarget!==4679)throw new Error('Incorrect published lesson count');
 return {...raw,entries};
}
