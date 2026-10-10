// Stable IDs identify progress/history; their order here defines the learning sequence.
export const STANDARD_VERSION = 'gre-deep-20261010-v1';
export const APPROVED_SEQUENCE = Object.freeze([175,176,177,178,179,180,181,182,183,184]);
export function gateCatalog(raw) {
 if(raw.schema!==1||!Array.isArray(raw.units)||!Array.isArray(raw.entries))throw new Error('Unsupported catalog');
 const policy=raw.learningRelease;
 if(!policy||policy.standardVersion!==STANDARD_VERSION||policy.batchSize!==10||!Array.isArray(policy.approvedIds))throw new Error('New-standard release approval missing');
 if(policy.approvedIds.length && policy.status!=='approved')throw new Error('Batch review not approved');
 if(policy.approvedIds.length%10!==0||policy.approvedIds.some((id,i)=>id!==APPROVED_SEQUENCE[i]))throw new Error('Only complete approved batches may be released');
 const seen=new Set();
 for(const entry of raw.entries){if(seen.has(entry.number))throw new Error('Duplicate canonical ID');seen.add(entry.number);}
 const entries=policy.approvedIds.map((id,i)=>{
  const entry=raw.entries.find(item=>item.number===id);
  if(!entry||entry.standardVersion!==STANDARD_VERSION||entry.reviewStatus!=='approved'||entry.textApproved!==true||entry.artApproved!==true||entry.displayOrdinal!==i+1)throw new Error('Lesson is not new-standard approved');
  if(!raw.units[entry.unit]||!entry.art?.sha256)throw new Error('Approved lesson assets missing');
  return entry;
 });
 if(raw.publishedCount!==entries.length||raw.authoredCount!==entries.length||raw.libraryTarget!==4679)throw new Error('Incorrect published lesson count');
 return {...raw,entries};
}
