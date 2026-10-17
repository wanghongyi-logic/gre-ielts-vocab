// Hosting availability is independent of the complete catalog and local library.
// Rebuild the shell after changing this policy; the worker receives the same code.
// Add a future range only with its reviewed content and uploaded hash-bound assets.
// Retired media remain local/import-only; future ordinals are never implicit.
export const HOSTED_MEDIA_ORDINAL_RANGES = [[1,50],[1001,1320]];
export function isHostedMediaEntry(entry,index){
 const ordinal=entry.displayOrdinal??index+1;
 return HOSTED_MEDIA_ORDINAL_RANGES.some(([first,last])=>ordinal>=first&&ordinal<=last);
}
export function hostedMediaPaths(catalog){
 return new Set(catalog.entries.flatMap((entry,index)=>isHostedMediaEntry(entry,index)?[entry.storyMedia?.poster,entry.storyMedia?.video,entry.storyMedia?.staticPoster].filter(Boolean).map(ref=>ref.url):[]));
}
