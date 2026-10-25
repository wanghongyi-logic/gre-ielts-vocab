// Hosting availability is independent of the complete catalog and local library.
// Rebuild the shell after changing this policy; the worker receives the same code.
// These explicit ranges include only reviewed, uploaded hash-bound assets.
// Retired videos remain local/import-only; existing images keep their hosting.
export const HOSTED_MEDIA_ORDINAL_RANGES = [[3100,3300]];
export const HOSTED_IMAGE_ORDINAL_RANGES = [[2600,3300]];
const inHostedRanges = (entry,index,ranges) => {
 const ordinal=entry.displayOrdinal??index+1;
 return ranges.some(([first,last])=>ordinal>=first&&ordinal<=last);
};
// A complete downloadable word needs its video and every image, not just a poster.
export function isHostedMediaEntry(entry,index){
 return inHostedRanges(entry,index,HOSTED_MEDIA_ORDINAL_RANGES)&&inHostedRanges(entry,index,HOSTED_IMAGE_ORDINAL_RANGES);
}
export function hostedMediaPaths(catalog){
 return new Set(catalog.entries.flatMap((entry,index)=>[
  ...(inHostedRanges(entry,index,HOSTED_IMAGE_ORDINAL_RANGES)?[entry.storyMedia?.poster,entry.storyMedia?.staticPoster]:[]),
  ...(inHostedRanges(entry,index,HOSTED_MEDIA_ORDINAL_RANGES)?[entry.storyMedia?.video]:[])
 ].filter(Boolean).map(ref=>ref.url)));
}
