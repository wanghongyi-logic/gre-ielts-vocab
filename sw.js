/* GRE new-standard release. Shell installation is atomic; lesson downloads are separate. */
const BUILD='166-offline200-v10';
// BEGIN GENERATED RELEASE POLICY
// Stable IDs identify progress/history; display ordinals never replace stored IDs.
const STANDARD_VERSION = 'gre-deep-20261010-v1';
const APPROVED_SEQUENCE = Object.freeze([175,176,177,178,179,180,181,182,183,184]);
const STORYBOOK_SAMPLE_SEQUENCE = Object.freeze([175,176,177,178,179]);
const STORYBOOK_BATCH_MODE = 'storybook-five-word-batches';
const STORYBOOK_ORDERED_MODE = 'storybook-reviewed-order';
const STORYBOOK_PRESERVED_IDS = Object.freeze([175,176,177,178,179,180,181,182,183,184,185,186,187,188,189]);
function isStorybookCatalog(raw) {
 const mode=raw?.learningRelease?.sampleMode;
 return mode==='storybook-first-five'||mode===STORYBOOK_BATCH_MODE||mode===STORYBOOK_ORDERED_MODE;
}
function validateStoryMedia(media) {
 if(media&&Object.hasOwn(media,'waitForPresentedFrame')&&typeof media.waitForPresentedFrame!=='boolean')throw new Error('Invalid poster underlay flag');
 if(media&&Object.hasOwn(media,'staticPoster')&&(!media.staticPoster||typeof media.staticPoster!=='object'||Array.isArray(media.staticPoster)))throw new Error('Invalid optional static poster');
 if(!media||!Number.isSafeInteger(media.width)||media.width<=0||!Number.isSafeInteger(media.height)||media.height<=0||!Number.isFinite(media.durationMs)||media.durationMs<=0||typeof media.alt!=='string'||!media.alt.trim())throw new Error('Storybook media metadata missing');
 for(const [kind,extensions] of [['poster',/\.(png|webp|jpe?g|avif)$/i],['video',/\.(mp4|webm)$/i],...(media.staticPoster?[['staticPoster',/\.(png|webp|jpe?g|avif)$/i]]:[])]){
  const ref=media[kind];
  if(!ref||typeof ref.url!=='string'||!/^story-media\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+$/.test(ref.url)||!extensions.test(ref.url)||!/^[a-f0-9]{64}$/.test(ref.sha256)||!ref.url.split('/').at(-1).includes(ref.sha256)||!Number.isSafeInteger(ref.bytes)||ref.bytes<=0)throw new Error('Storybook media integrity reference missing');
 }
 if(media.poster.url===media.video.url)throw new Error('Storybook poster and video must be distinct');
 return media;
}
function gateCatalog(raw) {
 if(raw.schema!==1||!Array.isArray(raw.units)||!Array.isArray(raw.entries))throw new Error('Unsupported catalog');
 const policy=raw.learningRelease;
 if(!policy||policy.standardVersion!==STANDARD_VERSION||!Array.isArray(policy.approvedIds))throw new Error('New-standard release approval missing');
 if(policy.approvedIds.length&&policy.status!=='approved')throw new Error('Batch review not approved');
 const sample=policy.sampleMode==='storybook-first-five',batches=policy.sampleMode===STORYBOOK_BATCH_MODE,ordered=policy.sampleMode===STORYBOOK_ORDERED_MODE,storybook=isStorybookCatalog(raw);
 if(policy.sampleMode!==undefined&&!storybook)throw new Error('Unsupported sample mode');
 if(policy.batchSize!==((batches||ordered)?5:10))throw new Error('Incorrect release batch size');
 if(storybook){
  if(typeof raw.preview!=='boolean')throw new Error('Storybook preview state must be explicit');
  if(sample&&(policy.approvedIds.length!==5||policy.approvedIds.some((id,i)=>id!==STORYBOOK_SAMPLE_SEQUENCE[i])))throw new Error('Storybook sample must be exactly the first five stable IDs');
  // The hash-verified catalog is the explicit review ledger. Later five-word batches
  // need new approved metadata/assets, never a code edit that pre-approves future IDs.
  if(batches&&(!policy.approvedIds.length||policy.approvedIds.length%5!==0||policy.approvedIds.some((id,i)=>!Number.isSafeInteger(id)||id<1||id!==175+i)))throw new Error('Only complete reviewed five-word batches may be released');
  // A reviewed catalog declares learning order; canonical IDs remain storage identities.
  if(ordered&&(policy.approvedIds.length<STORYBOOK_PRESERVED_IDS.length||policy.approvedIds.length%5!==0||STORYBOOK_PRESERVED_IDS.some((id,i)=>policy.approvedIds[i]!==id)||policy.approvedIds.some(id=>!Number.isSafeInteger(id)||id<1)||new Set(policy.approvedIds).size!==policy.approvedIds.length))throw new Error('Only complete uniquely ordered reviewed batches may be released');
  if(policy.mediaStatus!=='approved'&&!(raw.preview===true&&policy.mediaStatus==='pending'))throw new Error('Storybook media review not approved');
 }else if(policy.approvedIds.length%10!==0||policy.approvedIds.some((id,i)=>id!==APPROVED_SEQUENCE[i]))throw new Error('Only complete approved batches may be released');
 const seen=new Set();
 for(const entry of raw.entries){if(seen.has(entry.number))throw new Error('Duplicate canonical ID');seen.add(entry.number);}
 const entries=policy.approvedIds.map((id,i)=>{
  const entry=raw.entries.find(item=>item.number===id);
  if(!entry||entry.standardVersion!==STANDARD_VERSION||entry.reviewStatus!=='approved'||entry.textApproved!==true||entry.artApproved!==true||entry.displayOrdinal!==i+1)throw new Error('Lesson is not new-standard approved');
  const unit=raw.units[entry.unit];
  if(!Number.isSafeInteger(entry.unit)||entry.unit<0||!unit||typeof unit.url!=='string'||!/^units\/[A-Za-z0-9_-]+\.json$/.test(unit.url)||!/^[a-f0-9]{64}$/.test(unit.sha256)||!unit.url.endsWith('-'+unit.sha256+'.json')||!Number.isSafeInteger(unit.bytes)||unit.bytes<=0||(!storybook&&(!/^[a-f0-9]{64}$/.test(entry.art?.sha256)||!Number.isSafeInteger(entry.art?.bytes)||entry.art.bytes<=0)))throw new Error('Approved lesson assets missing');
  if(storybook&&(batches||ordered||policy.mediaStatus==='approved'||entry.storyMedia))validateStoryMedia(entry.storyMedia);
  return entry;
 });
 const integrityRefs=new Map(),digestBytes=new Map();
 for(const entry of entries){
  const refs=[raw.units[entry.unit],...(entry.storyMedia?[entry.storyMedia.poster,entry.storyMedia.video,...(entry.storyMedia.staticPoster?[entry.storyMedia.staticPoster]:[])]:[])];
  for(const ref of refs){
   const prior=integrityRefs.get(ref.url);
   if(prior&&(prior.sha256!==ref.sha256||prior.bytes!==ref.bytes))throw new Error('Conflicting integrity declarations for one asset URL');
   if(digestBytes.has(ref.sha256)&&digestBytes.get(ref.sha256)!==ref.bytes)throw new Error('Conflicting byte counts for one content hash');
   integrityRefs.set(ref.url,ref);
   digestBytes.set(ref.sha256,ref.bytes);
  }
 }
 let libraryTarget=4679;
 if(Object.hasOwn(policy,'libraryPlan')){
  const plan=policy.libraryPlan;
  if(!ordered||!plan||typeof plan!=='object'||Array.isArray(plan)||Object.keys(plan).length!==2||plan.version!=='canonical-4731-20261010-v1'||plan.sha256!=='cf9a48c71ebcb346315c78c2da6bcda089e24473ae0f1caef86f7805bf9caa3c')throw new Error('Unsupported approved library plan');
  libraryTarget=4731;
 }
 if(raw.publishedCount!==entries.length||raw.authoredCount!==entries.length||raw.libraryTarget!==libraryTarget)throw new Error('Incorrect published lesson count');
 return {...raw,entries};
}
// END GENERATED RELEASE POLICY
// Generated by build-shell.mjs; SW is intentionally outside this non-cyclic hash list.
const SHELL_ASSETS = [{"url":"index.html","sha256":"ea86d717d7588786a37c6de861b5534ad1e2fe018320fdc9eb11b1b64a05ee39","bytes":3256},{"url":"manifest.webmanifest","sha256":"a14797d54dab8085da725e9c3fca00656c04305783517ca773eaeb0396b61532","bytes":642},{"url":"icon-192-v2.png","sha256":"6e52c5115cb2e79148cf5e9df857568936987d1a9211907b9ccb10267970575b","bytes":47430},{"url":"gre-learning/update.js","sha256":"5c2ddc8c48d0b6d568a7927a282d9709be6a87c5dffbac8b05b559b4b48edaa8","bytes":2635},{"url":"gre-learning/app.js","sha256":"02ad3782104074bbd8f27d6cecfe85b01e3d4a30942ad9f71158c82745ce1ec4","bytes":8839},{"url":"gre-learning/catalog.json","sha256":"3ac039720420942ee340e26f99e25e3a1a2f3d2224450b44a814171115b88de6","bytes":538197},{"url":"gre-learning/lesson-loader.js","sha256":"443b0d02bac2f4c42c74d268cac0809b7162f2c6a379d082f1b4bdeddc0f66ae","bytes":11184},{"url":"gre-learning/schema.js","sha256":"fa7c6338a126e62094177b615e9453373541ac46899c505d4c6c24dc87923bb6","bytes":4853},{"url":"gre-learning/render.js","sha256":"f30225576b9d70d08df7a65f8c3d17b61d4de1d49989f11be297e17ea5b11341","bytes":3744},{"url":"gre-learning/model.js","sha256":"62a63f1c81135c717aa1f0b7c4b75a5b0dbf9d12efdfd16db28c35bf85ee900e","bytes":691},{"url":"gre-learning/swipe.js","sha256":"dd63fdc2aeb25b42167f4ca05c9d2095e1f27637b3130f8e966d087a79d66f96","bytes":21736},{"url":"gre-learning/motion.js","sha256":"11658380458992bc1754740baeb511b78eb897c4c09e392fdf86360e1c7e97b7","bytes":9296},{"url":"gre-learning/view.js","sha256":"eec3accabfbe1373ef52ebed22dba53e24d6f58dbcc96693a9adb489bae7e67f","bytes":7454},{"url":"gre-learning/motion-tracks.js","sha256":"c4fa72ae0cc4d0e91c458cd7174ba4a1ba23a7d935f352fc8cbeb583391b10fd","bytes":12138},{"url":"gre-learning/release-policy.js","sha256":"c0a0a1e0b16eb5814d8aa585f04cc3c251651587a6b4353d8ab87af3bed44dea","bytes":6769},{"url":"gre-learning/scene-glosses.js","sha256":"6e3febf82470fe2f1342672ed35832a7dfafa17069e211914243a623e7eeb8f0","bytes":1262},{"url":"icon-512-v2.png","sha256":"65508f5707903f370f3f89402f5c48ade1d4c70b4fdd1ac8dff532f396c0a9ff","bytes":298790},{"url":"gre-learning/story-media.js","sha256":"c730bf0ee5b564f74472813199339ad0b36043def9e841389b0e6d230189354a","bytes":10222},{"url":"gre-learning/storybook.css","sha256":"571de19994b8aa2f40bb201f10ebd4c85620a973a4383853f602f8f6eeb1502b","bytes":49257},{"url":"gre-learning/bookmark-navigation.js","sha256":"2e729aeb3554976d800a008618ff57a9a49f16acd983ee8623cddb76cd89ed3b","bytes":4377},{"url":"gre-learning/contents.js","sha256":"b9a5c3223d05390b4603447ca1974859ee2939c205b1572cabcf044c8962754a","bytes":13568},{"url":"gre-learning/prepared-pages.js","sha256":"542c8377232f39c759796c616c0e8498d82ac2f984561f183584a50541f94b4a","bytes":5311},{"url":"gre-learning/offline-zip.js","sha256":"83a5f302f151ad781ec204c0e86b79672ab414f268afc39b312dc9e9337705e7","bytes":6003},{"url":"gre-learning/offline-packs.js","sha256":"1727fdad38f4d432ef224876cec4d18096578c8c585208b900fba8bbe7e18714","bytes":13654},{"url":"gre-learning/offline-copy-worker.js","sha256":"ad26bf53fcf0779b153ae471bb6d265edaec4f74d99bc10b4b96680b717eab8b","bytes":1899},{"url":"gre-learning/offline-manager.js","sha256":"8e1c871ac97351fdbb50b42c96f3de6da9ab665041038e4b2f83ab43dc617c8f","bytes":14231},{"url":"gre-learning/units/175-184-7237c053125a7b03df08fbbe14200ddf95cb5abc0a0d0b53654678213ab639c7.json","sha256":"7237c053125a7b03df08fbbe14200ddf95cb5abc0a0d0b53654678213ab639c7","bytes":28330},{"url":"gre-learning/units/180-184-c525705d3cb95ee978f616e6fd36f62361a95614ee7d00cc4c7f629d0698a8a2.json","sha256":"c525705d3cb95ee978f616e6fd36f62361a95614ee7d00cc4c7f629d0698a8a2","bytes":14781},{"url":"gre-learning/units/185-189-e6fd45388566f60156fc8216603c770f8a9f8cf71c76df97a3b8abf191778a26.json","sha256":"e6fd45388566f60156fc8216603c770f8a9f8cf71c76df97a3b8abf191778a26","bytes":17330},{"url":"gre-learning/units/core001-81c5b8bf5f023b2544da6423ea592f67fcde3a55937f35c01f7ee2a4798f9dc9.json","sha256":"81c5b8bf5f023b2544da6423ea592f67fcde3a55937f35c01f7ee2a4798f9dc9","bytes":16360},{"url":"gre-learning/units/core002-254d5129a5103d01fa8daabe0a2e86faa41c2af6df15af1c6cbad2f01c8b2d09.json","sha256":"254d5129a5103d01fa8daabe0a2e86faa41c2af6df15af1c6cbad2f01c8b2d09","bytes":16031},{"url":"gre-learning/units/core003-6c71fdf34a7b9ec6b4de2149a03b451d00c30d46517bfa78b07a70964d13241e.json","sha256":"6c71fdf34a7b9ec6b4de2149a03b451d00c30d46517bfa78b07a70964d13241e","bytes":15468},{"url":"gre-learning/units/core002-8675b60138fb98ae6e6be82ce602ac493f0f8cb1338a1edf8bc13be8df18b3f2.json","sha256":"8675b60138fb98ae6e6be82ce602ac493f0f8cb1338a1edf8bc13be8df18b3f2","bytes":19869},{"url":"gre-learning/units/core004-4800144cfb72ec5386009113239a75ca6c830d490f8f4d3b629f76f94b513f7c.json","sha256":"4800144cfb72ec5386009113239a75ca6c830d490f8f4d3b629f76f94b513f7c","bytes":15887},{"url":"gre-learning/units/core005-987668ca8ef60aff22e389a8855650547f8d72d5c3eefcf8cee7f8ab859d5bf0.json","sha256":"987668ca8ef60aff22e389a8855650547f8d72d5c3eefcf8cee7f8ab859d5bf0","bytes":16224},{"url":"gre-learning/units/core006-ff962284a1e47d95a130a9d406b9f18bbe9ddc793a0670cb4a773abc8a1187ad.json","sha256":"ff962284a1e47d95a130a9d406b9f18bbe9ddc793a0670cb4a773abc8a1187ad","bytes":15239},{"url":"gre-learning/units/core007-378ce7d511e4906bf0fd42bbb75716fd421a91dfa9a0325105a7bf0c99ddb461.json","sha256":"378ce7d511e4906bf0fd42bbb75716fd421a91dfa9a0325105a7bf0c99ddb461","bytes":15421},{"url":"gre-learning/units/core008-artrepair-ee748b283c1aae6a6283270e5cb49c0e5eae210f23487037716f17566da52360.json","sha256":"ee748b283c1aae6a6283270e5cb49c0e5eae210f23487037716f17566da52360","bytes":15880},{"url":"gre-learning/units/core009-e09971135e27875ceb127d751c7a1ff6a54f93574c1cea1c569a0bca2d45121c.json","sha256":"e09971135e27875ceb127d751c7a1ff6a54f93574c1cea1c569a0bca2d45121c","bytes":20890},{"url":"gre-learning/units/text-review-31-35-9bd0c6160abe4f88a6ec52af97e7cbc99e5f52e3090c0e647b0a2fcee76f9960.json","sha256":"9bd0c6160abe4f88a6ec52af97e7cbc99e5f52e3090c0e647b0a2fcee76f9960","bytes":20061},{"url":"gre-learning/units/text-review-36-40-5d8ac16edfee702307de4c1d8c0214f3688605d89edd5eb1d188df9ea3988b39.json","sha256":"5d8ac16edfee702307de4c1d8c0214f3688605d89edd5eb1d188df9ea3988b39","bytes":20716},{"url":"gre-learning/units/text-review-41-45-b3b8d406eb7035453c841269688b1c965ebd65894f5d936aebe37a84f9d3980e.json","sha256":"b3b8d406eb7035453c841269688b1c965ebd65894f5d936aebe37a84f9d3980e","bytes":18858},{"url":"gre-learning/units/text-review-46-50-fce5b192ea6c634249c7598925b26dc2c0e05675cf5271892fc93d2e8bc6da5b.json","sha256":"fce5b192ea6c634249c7598925b26dc2c0e05675cf5271892fc93d2e8bc6da5b","bytes":18471},{"url":"gre-learning/units/text-review-51-55-20e741b926612ff33bf6c36373bb11d6941e4ef689f9b2755b93b26d788e310b.json","sha256":"20e741b926612ff33bf6c36373bb11d6941e4ef689f9b2755b93b26d788e310b","bytes":19181},{"url":"gre-learning/units/text-review-56-60-21f41aded6c60378910ac24aa28f475841d49f6bc45474097faea4d827077863.json","sha256":"21f41aded6c60378910ac24aa28f475841d49f6bc45474097faea4d827077863","bytes":19676},{"url":"gre-learning/units/core010-text-approved-286f58cbc19a5390cc5c77c537ca27e3df1f97b1ecd68caaf7969cf4c5c49029.json","sha256":"286f58cbc19a5390cc5c77c537ca27e3df1f97b1ecd68caaf7969cf4c5c49029","bytes":19123},{"url":"gre-learning/units/fungible-user-correction-7c7f0b233cbe2ed69a6ed003e6d296b40c14c91f545be086a118afd164d4f1a9.json","sha256":"7c7f0b233cbe2ed69a6ed003e6d296b40c14c91f545be086a118afd164d4f1a9","bytes":19703},{"url":"gre-learning/units/core011-text-approved-992e1a549cf5f49f4f28ba4e7db17735c69e3b122940a7b99318884a0934bbd3.json","sha256":"992e1a549cf5f49f4f28ba4e7db17735c69e3b122940a7b99318884a0934bbd3","bytes":18704},{"url":"gre-learning/units/core012-mnemonic-review-cb282230d1daa07f8059800bfce06035708246bfc59df05cbe8098da4af38fb9.json","sha256":"cb282230d1daa07f8059800bfce06035708246bfc59df05cbe8098da4af38fb9","bytes":17349},{"url":"gre-learning/units/core013-text-approved-f84356190c116d3cd88944dbd6b49e6ad54b2a73a683332464caabd95565ba9a.json","sha256":"f84356190c116d3cd88944dbd6b49e6ad54b2a73a683332464caabd95565ba9a","bytes":17865},{"url":"gre-learning/units/core014-text-approved-dc92ef49aabe0eefa6f36eb0ce98e48e3c71ce029717854e3d0214e37dd3951a.json","sha256":"dc92ef49aabe0eefa6f36eb0ce98e48e3c71ce029717854e3d0214e37dd3951a","bytes":17426},{"url":"gre-learning/units/core015-text-approved-be575a6384b37b3843f1d037da1f69abd2574b0d4987fc4b21ffcbb3f9f799b8.json","sha256":"be575a6384b37b3843f1d037da1f69abd2574b0d4987fc4b21ffcbb3f9f799b8","bytes":17814},{"url":"gre-learning/units/core016-mnemonic-review-2ef64e7d708b35f15ad27a1ba02fc30b9af72ce8555a11d8c21666110e1c7e52.json","sha256":"2ef64e7d708b35f15ad27a1ba02fc30b9af72ce8555a11d8c21666110e1c7e52","bytes":18743},{"url":"gre-learning/units/core017-mnemonic-review-ffb8b79a8e6ca50e3ca3fbf64d0f7154315158456b625974dd4d0531f3dbdc72.json","sha256":"ffb8b79a8e6ca50e3ca3fbf64d0f7154315158456b625974dd4d0531f3dbdc72","bytes":20836},{"url":"gre-learning/units/core018-text-approved-758cb0e4c979996fd3974c21e69b2117725d5a8c47c03737874ee6b1505a7e8c.json","sha256":"758cb0e4c979996fd3974c21e69b2117725d5a8c47c03737874ee6b1505a7e8c","bytes":22413},{"url":"gre-learning/units/core019-text-approved-ada08e6e1964789d669a2a07399a33d63d94d048ae3aa1b5231bc4cc0eff125c.json","sha256":"ada08e6e1964789d669a2a07399a33d63d94d048ae3aa1b5231bc4cc0eff125c","bytes":21475},{"url":"gre-learning/units/core020-text-approved-7b6a1e175c90d6f8ed33e790a4cc3310ead264fffc23898c8198e09513518886.json","sha256":"7b6a1e175c90d6f8ed33e790a4cc3310ead264fffc23898c8198e09513518886","bytes":21117},{"url":"gre-learning/units/core021-text-approved-ceb231eb758a4086c4abc7ae72dc800fecdbed84df707f4edd92700979db791c.json","sha256":"ceb231eb758a4086c4abc7ae72dc800fecdbed84df707f4edd92700979db791c","bytes":24090},{"url":"gre-learning/units/core022-text-approved-e72d9ca7347eccdc20bda798e3b51cc021c5a6dde06b05898c006898c7692a7c.json","sha256":"e72d9ca7347eccdc20bda798e3b51cc021c5a6dde06b05898c006898c7692a7c","bytes":22204},{"url":"gre-learning/units/core023-text-approved-6bc914430f85ee96944a71a7bca4728d9bd92aa1d311f9a48b34ac2cbafcba50.json","sha256":"6bc914430f85ee96944a71a7bca4728d9bd92aa1d311f9a48b34ac2cbafcba50","bytes":19514},{"url":"gre-learning/units/core024-text-approved-d7379b4e0dd7d27b40385eb3d847a36a438f74daf969c7555e6544104e7107fa.json","sha256":"d7379b4e0dd7d27b40385eb3d847a36a438f74daf969c7555e6544104e7107fa","bytes":16926},{"url":"gre-learning/units/core025-text-approved-cd37269828e21ebc5f12769fe4dacb893a65d5060d5eba3c72e29943e119b99a.json","sha256":"cd37269828e21ebc5f12769fe4dacb893a65d5060d5eba3c72e29943e119b99a","bytes":16250},{"url":"gre-learning/units/core026-text-candidate-f2dae8ffffd8b59f0d469dd6dc62341a13f843f93720e034e4390a95a604e163.json","sha256":"f2dae8ffffd8b59f0d469dd6dc62341a13f843f93720e034e4390a95a604e163","bytes":16889},{"url":"gre-learning/units/core027-text-candidate-b4b0bdee95c10d01d270ef5b5adb20f2f4ca50a0ac773ec0179841e35b9c3253.json","sha256":"b4b0bdee95c10d01d270ef5b5adb20f2f4ca50a0ac773ec0179841e35b9c3253","bytes":19200},{"url":"gre-learning/units/core028-text-candidate-04945fe358d9945e22e52f3e0d26e808a91a6e804e682f2a46772dc47f516856.json","sha256":"04945fe358d9945e22e52f3e0d26e808a91a6e804e682f2a46772dc47f516856","bytes":17020},{"url":"gre-learning/units/core029-text-candidate-56e10619879cf65742347e4d606fcc8dbf71ee615354a71f0c72ff8607b36fdc.json","sha256":"56e10619879cf65742347e4d606fcc8dbf71ee615354a71f0c72ff8607b36fdc","bytes":17803},{"url":"gre-learning/units/core030-text-candidate-e95285ae037ebaa99d9d91bede12a4a7f4581c83d9fe111fdce0b3dffed8d2b8.json","sha256":"e95285ae037ebaa99d9d91bede12a4a7f4581c83d9fe111fdce0b3dffed8d2b8","bytes":17773},{"url":"gre-learning/units/core031-text-candidate-7196e4a8d7105c79c87bf69bded9cccfba7ac3f131a99fadc1994369dfb52d98.json","sha256":"7196e4a8d7105c79c87bf69bded9cccfba7ac3f131a99fadc1994369dfb52d98","bytes":16710},{"url":"gre-learning/units/core032-text-candidate-2b77389776bca52ca2375b46008fb16240722801504ca07b5e0caa01dc2d7bd1.json","sha256":"2b77389776bca52ca2375b46008fb16240722801504ca07b5e0caa01dc2d7bd1","bytes":18798},{"url":"gre-learning/units/core033-text-candidate-4ab21e2e886f0a41feda49946e1061fa819f4be794fd40d2a983358d995ec9ca.json","sha256":"4ab21e2e886f0a41feda49946e1061fa819f4be794fd40d2a983358d995ec9ca","bytes":18150},{"url":"gre-learning/units/core034-text-candidate-031ccaa7e611ab091544f8190f959580496747bef3fb4365c530774af1dbb743.json","sha256":"031ccaa7e611ab091544f8190f959580496747bef3fb4365c530774af1dbb743","bytes":20052},{"url":"gre-learning/units/core035-text-candidate-c6e690c7fc86a52e496aba124fff14c08efddce91b2c185a8032d39a3f5d9cc8.json","sha256":"c6e690c7fc86a52e496aba124fff14c08efddce91b2c185a8032d39a3f5d9cc8","bytes":16988},{"url":"gre-learning/units/core036-text-candidate-8b837868a59c4b8124440fa15f9df87b68f5b53f3d51051947a4dd04b3f23ba1.json","sha256":"8b837868a59c4b8124440fa15f9df87b68f5b53f3d51051947a4dd04b3f23ba1","bytes":22564},{"url":"gre-learning/units/core037-text-candidate-df4897e58ede9f46a6cb7028d0e1345260f47571dd3e3f70907b067c567f25cc.json","sha256":"df4897e58ede9f46a6cb7028d0e1345260f47571dd3e3f70907b067c567f25cc","bytes":18247},{"url":"gre-learning/units/core038-text-candidate-091293e00aa5d71adb0429d63c2328eb1ae311b04645529a42543bc39fe89590.json","sha256":"091293e00aa5d71adb0429d63c2328eb1ae311b04645529a42543bc39fe89590","bytes":18656},{"url":"gre-learning/units/core039-text-candidate-319742813982b9f6ab1e3d924543127fdeafb838ee403816a0226c8148e443e7.json","sha256":"319742813982b9f6ab1e3d924543127fdeafb838ee403816a0226c8148e443e7","bytes":18939},{"url":"gre-learning/offline-preferences.js","sha256":"3e650ee23fed1e6a4aa5b9c78ce1d97c7a01151789bab424946dc722eb68b7c8","bytes":1083},{"url":"gre-learning/offline-batch.js","sha256":"73fd4ea0d28a295a3da5499242194d6bb4996f327fd5f88fff395cd5023f982c","bytes":1596}];
const scope=new URL('./',self.location.href);
const SHELL_PREFIX='gre-scalable-shell-'+encodeURIComponent(scope.pathname)+'-';
const SHELL=SHELL_PREFIX+BUILD;
const UNITS='gre-scalable-verified-units-v1';
const resolve=path=>new URL(path,scope).href;
const excluded=url=>{const path=url.pathname.slice(scope.pathname.length);return /^(skyhouse|skyhouse-source)(\/|$)/.test(path);};
let catalogPromise;
async function verify(response,ref){if(!response?.ok)throw new Error('Resource unavailable');const bytes=await response.clone().arrayBuffer();if(bytes.byteLength!==ref.bytes)throw new Error('Resource size mismatch');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==ref.sha256)throw new Error('Resource hash mismatch');return response;}
const shellRef=url=>SHELL_ASSETS.find(ref=>resolve(ref.url)===url);
async function shellReady(){
 try{const cache=await caches.open(SHELL);for(const ref of SHELL_ASSETS)await verify(await cache.match(resolve(ref.url)),ref);return SHELL_ASSETS.length>0;}catch{return false;}
}
async function shellResponse(ref,{repair=true,requirePersistence=false}={}){
 const url=resolve(ref.url);let cache,cached;
 try{cache=await caches.open(SHELL);cached=await cache.match(url);}catch{}
 if(cached){try{return await verify(cached,ref);}catch{}}
 if(!repair)throw new Error('Shell asset is missing or corrupt');
 // Do not overwrite anything until the exact build bytes pass verification.
 const response=await fetch(url,{cache:'reload'});await verify(response,ref);
 try{if(!cache)throw new Error('Shell storage unavailable');await cache.put(url,response.clone());}
 catch(error){if(requirePersistence)throw error;}
 return response;
}
async function catalog({repair=true}={}){
 if(!catalogPromise){catalogPromise=(async()=>{const response=await shellResponse(shellRef(resolve('gre-learning/catalog.json')),{repair});const raw=await response.json();if(raw.preview===true)throw new Error('Preview catalog cannot be installed');return gateCatalog(raw);})();catalogPromise.catch(()=>{catalogPromise=null;});}
 return catalogPromise;
}
const pairRefs=(entry,data)=>[data.units[entry.unit],...(isStorybookCatalog(data)?[entry.storyMedia.poster,entry.storyMedia.video,...(entry.storyMedia.staticPoster?[entry.storyMedia.staticPoster]:[])]:[{...entry.art,url:`art-units/${entry.number}-${entry.art.sha256}.json`}])];
async function refs(){const data=await catalog();const map=new Map();for(const entry of data.entries)for(const ref of pairRefs(entry,data))map.set(resolve('gre-learning/'+ref.url),ref);return map;}
async function broadcast(data){for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){const url=new URL(client.url);if(url.origin===scope.origin&&url.pathname.startsWith(scope.pathname)&&!excluded(url))client.postMessage(data);}}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const response=await fetch(resolve('gre-learning/shell-manifest.json'),{cache:'no-store'});
 if(!response.ok)throw new Error('Shell manifest unavailable');
 const manifest=await response.json();
 if(manifest.build!==BUILD)throw new Error('Shell build mismatch');
 if(JSON.stringify(manifest.assets)!==JSON.stringify(SHELL_ASSETS))throw new Error('Untrusted shell manifest');
 // Reject an internal preview before writing even one shell file. This also keeps
 // an accidental same-build development install from overwriting the old shell.
 const catalogRef=shellRef(resolve('gre-learning/catalog.json'));
 const catalogResponse=await fetch(resolve('gre-learning/catalog.json'),{cache:'reload'});
 await verify(catalogResponse,catalogRef);
 const candidateCatalog=await catalogResponse.json();
 if(candidateCatalog.preview===true)throw new Error('Preview catalog cannot be installed');
 gateCatalog(candidateCatalog);
 // New builds and same-build repairs share this verified path. Failed repairs keep every
 // still-valid asset and the preceding complete generation. Partial caches never mean ready.
 for(const ref of SHELL_ASSETS)await shellResponse(ref,{requirePersistence:true});
 if(!await shellReady())throw new Error('Incomplete shell');
 await catalog({repair:false}); // Validate sample approval before committing an install-ready marker.
 await(await caches.open(SHELL)).put(resolve('__shell_ready__'),new Response(BUILD));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 if(!await shellReady())throw new Error('Incomplete shell');
 const names=(await caches.keys()).filter(name=>name.startsWith(SHELL_PREFIX)&&name!==SHELL);
 const complete=[];for(const name of names){if(await(await caches.open(name)).match(resolve('__shell_ready__')))complete.push(name);}
 const previous=complete.at(-1);for(const name of names)if(name!==previous)await caches.delete(name);
 await self.clients.claim();await broadcast({type:'SHELL_READY',build:BUILD});
})()));
// Receipts are scoped to this worker and exact immutable URL/hash/byte count.
const verifiedResources=new Map(),downloadJobs=new Map(),mediaWrites=new Set();let mediaEpoch=0,mediaPaused=false;
async function verifyCached(response,ref,url){const key=url+'|'+ref.sha256+'|'+ref.bytes;if(!response){verifiedResources.delete(key);throw new Error('Missing cached resource');}if(!verifiedResources.has(key)){const result=verify(response,ref);verifiedResources.set(key,result);result.catch(()=>verifiedResources.delete(key));}await verifiedResources.get(key);return response;}
async function unitResponse(request,ref,{allowMediaNetwork=false,signal}={}){
 const isMedia=/\/gre-learning\/story-media\//.test(request.url),epoch=mediaEpoch;
 const shell=shellRef(request.url);if(shell)return shellResponse(shell);let cache,cached;try{cache=await caches.open(UNITS);cached=await cache.match(request.url);}catch{}
 if(cached){try{return await verifyCached(cached,ref,request.url);}catch{try{await cache.delete(request.url);}catch{}}}
 if(isMedia&&mediaPaused)return new Response('Media temporarily paused after clearing local resources',{status:404});
 const response=await fetch(request,{signal});await verify(response,ref);if(cache&&(!isMedia||(!mediaPaused&&epoch===mediaEpoch))){try{const write=cache.put(request.url,response.clone());if(isMedia)mediaWrites.add(write);try{await write;}finally{mediaWrites.delete(write);}verifiedResources.set(request.url+'|'+ref.sha256+'|'+ref.bytes,Promise.resolve());}catch{}}return response;
}
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname)||excluded(url))return;
 if(/\/gre-learning\/(units|art-units|story-media)\//.test(url.pathname)){
  event.respondWith((async()=>{const ref=(await refs()).get(url.href);if(!ref)return new Response('Unknown lesson unit',{status:404});try{return await unitResponse(request,ref);}catch{return new Response('Lesson unavailable offline or failed integrity validation',{status:503});}})());return;
 }
 event.respondWith((async()=>{const assetURL=new URL(request.url);assetURL.search='';const key=request.mode==='navigate'?resolve('index.html'):assetURL.href;const ref=shellRef(key);if(!ref)return fetch(request);try{return await shellResponse(ref);}catch{return new Response('Verified application shell unavailable; reconnect and retry',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}})());
});
async function lessonStatus(){let cache;try{cache=await caches.open(UNITS);}catch{}const shellIsReady=await shellReady();let data;try{data=await catalog({repair:false});}catch{return {type:'LESSON_STATUS',build:BUILD,shellReady:false,readyIds:[],readyPaths:[],readyCount:0,error:'Verified lesson index unavailable'};}const ready=[],readyPaths=[],checked=new Map();const check=ref=>{const url=resolve('gre-learning/'+ref.url),key=url+'|'+ref.sha256+'|'+ref.bytes;if(!checked.has(key))checked.set(key,(async()=>{try{if(shellRef(url)){if(!shellIsReady)return false;}else await verifyCached(await cache?.match(url),ref,url);readyPaths.push('gre-learning/'+ref.url);return true;}catch{return false;}})());return checked.get(key);};for(const entry of data.entries){let complete=true;for(const ref of pairRefs(entry,data))if(!await check(ref))complete=false;if(complete)ready.push(entry.number);}return {type:'LESSON_STATUS',build:BUILD,shellReady:shellIsReady,readyIds:ready,readyPaths,readyCount:ready.length,availableCount:data.entries.length,libraryTarget:data.libraryTarget,wholeTargetReady:false};}
self.addEventListener('message',event=>{
 const type=event.data?.type;
 if(type==='RESUME_MEDIA_SAVE'){mediaPaused=false;return;}
 if(type==='PAUSE_AND_CLEAR_MEDIA'){event.waitUntil((async()=>{mediaPaused=true;mediaEpoch++;for(const controller of downloadJobs.values())controller.abort();await Promise.allSettled([...mediaWrites]);const cache=await caches.open(UNITS),mediaRoot=resolve('gre-learning/story-media/');for(const request of await cache.keys())if(request.url.startsWith(mediaRoot))await cache.delete(request);verifiedResources.clear();event.ports[0]?.postMessage({type:'MEDIA_CLEARED'});})().catch(error=>event.ports[0]?.postMessage({type:'MEDIA_CLEAR_ERROR',error:error.message})));return;}
 if(type==='GET_TEXT_STATUS'){event.waitUntil(shellReady().then(ready=>event.ports[0]?.postMessage({type:'TEXT_STATUS',build:BUILD,ready})));return;}
 if(type==='GET_BUILD'){event.ports[0]?.postMessage({type:'APP_BUILD',build:BUILD});return;}
 if(type==='SKIP_WAITING'){self.skipWaiting();return;}
 if(type==='GET_LESSON_STATUS')event.waitUntil(lessonStatus().then(value=>event.ports[0]?.postMessage(value)));
 // Existing optional batch API; normal browsing also retains verified online fallback.
 if(type==='CANCEL_LESSON_DOWNLOAD'){downloadJobs.get(event.data.jobId)?.abort();return;}
 if(type==='DOWNLOAD_LESSONS')event.waitUntil((async()=>{
  const data=await catalog(),requested=[...new Set(event.data.ids||[])].slice(0,200),skipPaths=new Set(event.data.skipPaths||[]),controller=new AbortController(),jobId=event.data.jobId;
  if(typeof jobId!=='string'||downloadJobs.has(jobId)){event.ports[0]?.postMessage({type:'LESSON_DOWNLOAD_ERROR',error:'Duplicate download request'});return;}downloadJobs.set(jobId,controller);let completed=0;
  try{for(const id of requested){if(controller.signal.aborted)break;const entry=data.entries.find(item=>item.number===id);if(!entry)continue;try{for(const ref of pairRefs(entry,data)){if(controller.signal.aborted)throw new DOMException('Cancelled','AbortError');if(skipPaths.has('gre-learning/'+ref.url))continue;const url=resolve('gre-learning/'+ref.url);await unitResponse(new Request(url),ref,{allowMediaNetwork:true,signal:controller.signal});if(!shellRef(url))await verifyCached(await(await caches.open(UNITS)).match(url),ref,url);}completed++;event.ports[0]?.postMessage({type:'LESSON_DOWNLOAD_PROGRESS',completed,requested:requested.length});}catch(error){if(controller.signal.aborted)break;event.ports[0]?.postMessage({type:'LESSON_DOWNLOAD_ERROR',number:id,completed,error:error.message});break;}}
   event.ports[0]?.postMessage({type:'LESSON_DOWNLOAD_DONE',completed,requested:requested.length,cancelled:controller.signal.aborted});
  }finally{downloadJobs.delete(jobId);}
 })());
});
