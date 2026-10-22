import {MAX_BYTES,compressImage as defaultCompressImage,compressVideo as defaultCompressVideo,dimensions} from './compression-preview.js';
import {demuxAVC} from './compression-demux.js';
import {digest,key,validSource,validateVariant} from './compression-variants.js';

// One source and one candidate at a time. Checkpoints and callbacks contain
// identities and counters only, never source/output blobs or preview URLs.
export const COMPRESSION_PROFILE=Object.freeze({id:'sample02-local-v1',videoProfile:'resolution512',maxEdge:512,maxBytes:MAX_BYTES,imageQuality:.82,preserveSourceFrameRate:true,preserveFullDuration:true});
export const BATCH_OWNER_LOCK='gre-compression-queue-owner-v1';
const VERSION='gre-serial-compression-v1';
const clone=value=>JSON.parse(JSON.stringify(value));
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const semantic=value=>JSON.stringify(canonical(value));
const fail=(message,code)=>{const error=new Error(message);error.code=code;throw error;};
const aborted=signal=>{if(signal?.aborted)throw new DOMException('当前处理已停止','AbortError');};
const sourceOf=item=>({path:item.path,sha256:item.sha256,bytes:item.bytes,wordId:item.wordId,role:item.role});
const revision=value=>{if(!['string','number'].includes(typeof value)||String(value)==='')fail('缺少目录版本','catalog-required');return value;};
const generation=value=>{if(!Number.isSafeInteger(value)||value<0)fail('无法核验本机书库版本','generation-required');return value;};
function metadataItem(item){
 const source=sourceOf(item);if(!validSource(source))fail('无效的待压缩原文件身份','invalid-source');
 const result={...source};
 for(const field of ['storage','packName'])if(typeof item[field]==='string')result[field]=item[field];
 for(const field of ['packBytes','start'])if(Number.isSafeInteger(item[field])&&item[field]>=0)result[field]=item[field];
 if(result.storage==='test')fail('测试文件不能替换本机书库','test-source');
 return result;
}
function scopePayload(scope){return {version:VERSION,profile:COMPRESSION_PROFILE,catalogRevision:scope.catalogRevision,generation:scope.generation,sample02:scope.sample02,items:scope.items,nonce:scope.nonce};}
const scopeToken=scope=>digest(new Blob([JSON.stringify(scopePayload(scope))]));
const sampleProof=sample=>{
 if(sample?.profile!=='resolution512'||sample.successful!==true&&sample.profileConfirmed!==true)fail('请明确确认固定 02 档；预览可选','sample-required');
 return sample.successful===true?{successful:true,profile:'resolution512'}:{successful:false,profile:'resolution512',profileConfirmed:true};
};
const supported=item=>item.role==='video'?/\.mp4$/i.test(item.path):/\.(png|jpe?g|webp)$/i.test(item.path);
const notify=async(fn,value)=>{try{await fn(clone(value));}catch{/* Presentation must not turn a completed commit into a failed one. */}};

export function createLocalCheckpointStore(storage,keyName='gre-compression-queue-v1'){
 return {
  async load(){const raw=(storage||globalThis.localStorage)?.getItem(keyName);return raw?JSON.parse(raw):null;},
  async save(value){const target=storage||globalThis.localStorage;if(!target?.setItem)fail('无法保存断点；尚未开始替换','checkpoint-unavailable');target.setItem(keyName,JSON.stringify(value));},
  async clear(){(storage||globalThis.localStorage)?.removeItem(keyName);}
 };
}

export function makeVariant(output,item){
 const source=sourceOf(item),p=output?.profile,ext={'video/mp4':'mp4','image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[output?.blob?.type];
 if(!p||p.edge!==512||!ext||!Number.isInteger(output.width)||!Number.isInteger(output.height)||output.width<1||output.height<1||Math.max(output.width,output.height)>512)fail('输出不是已确认的 02 档；不会自动降档','profile-mismatch');
 if(source.role!=='video'&&p.quality!==.82)fail('图片画质档位发生变化；不会自动降档','profile-mismatch');
 const variant={kind:'owned-local-variant',source,wordId:source.wordId,role:source.role,path:`variants/${output.sha256}.${ext}`,sha256:output.sha256,bytes:output.blob.size,mime:output.blob.type,profile:{id:COMPRESSION_PROFILE.id,maxEdge:512,lossy:true,width:output.width,height:output.height}};
 if(source.role==='video')Object.assign(variant.profile,{duration:output.duration,fps:p.fps});
 return validateVariant(variant);
}

export class SerialCompressionQueue{
 constructor({readSource,encode,compressImage=defaultCompressImage,compressVideo=defaultCompressVideo,inspectVideo=demuxAVC,storage,checkpointStore,readGeneration,gate,ownerLock,onProgress=()=>{},onItem=()=>{}}={}){
  if(typeof readSource!=='function'||!storage||typeof readGeneration!=='function'||typeof gate!=='function')throw new TypeError('readSource, storage, readGeneration and compatibility gate are required');
  this.readSource=readSource;this.encode=encode||((blob,item,options)=>item.role==='video'?compressVideo(blob,options):compressImage(blob,options));this.inspectVideo=inspectVideo;this.storage=storage;this.readGeneration=readGeneration;this.gate=gate;this.onProgress=onProgress;this.onItem=onItem;
  this.checkpointStore=checkpointStore?.save?checkpointStore:createLocalCheckpointStore(checkpointStore);this.state=null;this.running=false;this.paused=false;this.controller=null;this.stopRequest=null;this.resumeScope=null;this.checkpointAvailable=true;this.usedScopeTokens=new Set();this.ownerLock=ownerLock;this.ownerHeld=false;this.scopeIdentityCache=new WeakMap();
 }
 async prepare(items,{catalogRevision,sample02}={}){
  if(this.running)fail('已有批量任务正在处理','busy');
  const clean=items.map(metadataItem);if(!clean.length||new Set(clean.map(key)).size!==clean.length)fail('请选择不重复的准确文件清单','invalid-scope');
  const scope={...scopePayload({catalogRevision:revision(catalogRevision),generation:generation(await this.readGeneration()),sample02:sampleProof(sample02),items:clean,nonce:globalThis.crypto.randomUUID()}),sources:clean.map(sourceOf),remainingCount:clean.length};
  scope.token=await scopeToken(scope);return clone(scope);
 }
 async _validateScope(scope){
  if(scope?.version!==VERSION||JSON.stringify(scope.profile)!==JSON.stringify(COMPRESSION_PROFILE)||typeof scope.nonce!=='string')fail('批量确认范围无效','invalid-scope');
  revision(scope.catalogRevision);generation(scope.generation);sampleProof(scope.sample02);
  if(!Array.isArray(scope.items)||!scope.items.length||JSON.stringify(scope.items)!==JSON.stringify(scope.items.map(metadataItem))||new Set(scope.items.map(key)).size!==scope.items.length||JSON.stringify(scope.sources)!==JSON.stringify(scope.items.map(sourceOf))||scope.token!==await scopeToken(scope))fail('准确文件清单已变化，请重新确认','changed-scope');
 }
 _approve(scope,approval){if(approval?.approved!==true||approval.scopeToken!==scope.token||approval.irreversibleLossy!==true||approval.exactFilesConfirmed!==true)fail('需要明确确认当前准确文件清单的有损替换','approval-required');}
 // The checkpoint key is origin-wide, so ownership must be origin-wide too.
 // Never queue hidden work behind another tab; the user must explicitly retry.
 async _withOwner(work){
  const manager=this.ownerLock||globalThis.navigator?.locks;
  if(typeof manager?.request!=='function')fail('此浏览器缺少安全批量任务锁，尚未执行替换','owner-lock-unavailable');
  return manager.request(BATCH_OWNER_LOCK,{mode:'exclusive',ifAvailable:true},async lock=>{
   if(!lock)fail('另一个页面正在批量压缩或恢复整理，请等待它停止后明确重试','owner-busy');
   this.ownerHeld=true;try{return await work();}finally{this.ownerHeld=false;}
  });
 }
 async _assertCheckpointCurrent(){
  const saved=await this.checkpointStore.load(),stamp=value=>value?semantic({scopeToken:value.scope?.token,approvalToken:value.approvalToken,expectedGeneration:value.expectedGeneration,results:value.results.map(r=>({source:r.source,status:r.status,code:r.code??null,reason:r.reason??null,originalRetained:r.originalRetained??null,logicalSavingBytes:r.logicalSavingBytes||0})),inFlight:value.inFlight||null,staged:value.staged||[]}):null;
  if(!saved||stamp(saved)!==stamp(this.state))fail('断点已由其他页面更新，请重新载入并确认剩余范围','checkpoint-changed');
 }
 async _engine(){const engine=typeof this.storage==='function'?await this.storage():this.storage;if(!engine?.plan||!engine?.replace)fail('本机替换引擎不可用','storage-unavailable');return engine;}
 snapshot(){
  const state=this.state,results=state?.results||[],count=status=>results.filter(r=>r.status===status).length;
  return {status:state?.status||'idle',total:state?.items.length||0,completed:count('completed'),skipped:count('skipped'),failed:count('failed'),remaining:state?state.items.length-results.length:0,logicalSavingBytes:results.reduce((sum,r)=>sum+(r.logicalSavingBytes||0),0),current:state?.current?clone(state.current):null,reason:state?.reason||null,recoveryRequired:Boolean(state?.inFlight),staged:state?.staged?.length||0,checkpointAvailable:this.checkpointAvailable};
 }
 async _progress(){await notify(this.onProgress,this.snapshot());}
 async _save(){
  const state=this.state;if(!state)return;
  if(!this.ownerHeld)fail('未持有批量任务锁，不能更新断点','owner-lock-required');
  // Enumerate fields: neither injected helpers nor callbacks can smuggle Blob
  // values, DOM nodes or encoded content into a durable checkpoint.
  const checkpoint={version:VERSION,scope:state.scope,items:state.items,results:state.results,expectedGeneration:state.expectedGeneration,status:state.status,reason:state.reason||null,inFlight:state.inFlight||null,staged:state.staged||[],approvalToken:state.approvalToken,updatedAt:Date.now()};
  try{await this.checkpointStore.save(this.checkpointStore.incremental===true?checkpoint:clone(checkpoint));this.checkpointAvailable=true;}catch(error){this.checkpointAvailable=false;error.code='checkpoint-unavailable';throw error;}
 }
 async loadCheckpoint(){
  if(this.running)fail('正在处理时不能载入其他断点','busy');
  const checkpoint=await this.checkpointStore.load();if(!checkpoint)return null;
  if(checkpoint.version!==VERSION)fail('不支持的压缩断点版本','invalid-checkpoint');
  await this._validateScope(checkpoint.scope);
  if(JSON.stringify(checkpoint.items)!==JSON.stringify(checkpoint.scope.items)||!Array.isArray(checkpoint.results)||!Number.isSafeInteger(checkpoint.expectedGeneration)||checkpoint.expectedGeneration<0)fail('压缩断点身份不一致','invalid-checkpoint');
  const identities=new Set(checkpoint.items.map(key)),seen=new Set();
  for(const result of checkpoint.results){const id=key(result.source);if(!identities.has(id)||seen.has(id)||!['completed','skipped','failed'].includes(result.status)||!Number.isFinite(result.logicalSavingBytes)||result.logicalSavingBytes<0)fail('压缩断点结果无效','invalid-checkpoint');seen.add(id);}
  if(checkpoint.inFlight&&(!identities.has(key(checkpoint.inFlight.source))||seen.has(key(checkpoint.inFlight.source))))fail('压缩断点提交身份无效','invalid-checkpoint');
  for(const descriptor of checkpoint.staged||[])this._descriptor(descriptor,checkpoint.scope);
  if(checkpoint.inFlight?.group)for(const descriptor of checkpoint.inFlight.group)this._descriptor(descriptor,checkpoint.scope);
  this.state=clone(checkpoint);this.state.staged??=[];this.usedScopeTokens.add(checkpoint.scope.token);if(checkpoint.approvalToken)this.usedScopeTokens.add(checkpoint.approvalToken);this.state.current=null;this.state.status=checkpoint.inFlight?'recovery-required':checkpoint.results.length===checkpoint.items.length?'done':'paused';this.state.reason=checkpoint.inFlight?'上次替换结果待核实；请明确恢复整理，不能假定原件仍在':null;this.resumeScope=null;this.paused=this.state.status==='paused';await this._progress();return this.snapshot();
 }
 async start(scope,approval){
  if(this.running)fail('已有批量任务正在处理','busy');
  if(this.state?.inFlight)fail('先恢复上次结果不确定的整理','recovery-required');
  this.running=true;this.stopRequest=null;
  try{return await this._withOwner(async()=>{
   await this._validateScope(scope);this._approve(scope,approval);
   // This check and every later checkpoint write share the same origin owner.
   const saved=await this.checkpointStore.load();if(saved?.inFlight)fail('先恢复上次结果不确定的整理','recovery-required');
   if(this.usedScopeTokens.has(scope.token)||saved?.scope?.token===scope.token||saved?.approvalToken===scope.token)fail('此确认已使用，请重新确认当前剩余准确范围','approval-required');
   if(!await this.gate())fail('请关闭旧版词书页面后再试','incompatible-clients');
   if(generation(await this.readGeneration())!==scope.generation)fail('书库已变化，请重新确认准确范围','generation-changed');
   if(saved?.scope?.nonce){
    const engine=await this._engine();if(typeof engine.discardSessionSpool!=='function')fail('无法安全清理上一批临时文件，请先恢复整理','group-storage-unavailable');
    // A new explicitly approved run supersedes only the previous checkpoint's
    // temporary session, including writing records lost before checkpointing.
    await engine.discardSessionSpool(saved.scope.nonce);
    if(generation(await this.readGeneration())!==scope.generation)fail('书库已变化，请重新确认准确范围','generation-changed');
   }
   this.state={scope:clone(scope),items:clone(scope.items),results:[],expectedGeneration:scope.generation,status:'running',reason:null,inFlight:null,staged:[],current:null,approvalToken:scope.token};this.resumeScope=null;this.usedScopeTokens.add(scope.token);await this._save();
   return await this._run();
  });}finally{this.running=false;}
 }
 pause(){if(this.running){this.stopRequest='paused';this.paused=true;this.controller?.abort();}}
 cancel(){if(this.running){this.stopRequest='cancelled';this.paused=false;this.controller?.abort();}}
 async getResumeScope(){
  if(this.running)fail('请等待当前项目安全停止','busy');if(!this.state)fail('没有可继续的任务','no-checkpoint');if(this.state.inFlight)fail('先恢复上次结果不确定的整理','recovery-required');
  const finished=new Set(this.state.results.map(r=>key(r.source))),items=this.state.items.filter(item=>!finished.has(key(item)));if(!items.length)return null;
  this.resumeScope=await this.prepare(items,{catalogRevision:this.state.scope.catalogRevision,sample02:this.state.scope.sample02});return clone(this.resumeScope);
 }
 async resume({approval,catalogRevision}={}){
  if(this.running)fail('已有批量任务正在处理','busy');if(!this.state||this.state.inFlight)fail('没有可直接继续的已核实断点','recovery-required');
  this.running=true;this.stopRequest=null;
  try{return await this._withOwner(async()=>{
   const scope=this.resumeScope;if(!scope||this.usedScopeTokens.has(scope.token))fail('请先核对并确认剩余准确范围','approval-required');await this._validateScope(scope);this._approve(scope,approval);
   if(revision(catalogRevision)!==this.state.scope.catalogRevision)fail('目录已更新，请重新扫描并确认','catalog-changed');
   await this._assertCheckpointCurrent();
   if(!await this.gate())fail('请关闭旧版词书页面后再试','incompatible-clients');if(generation(await this.readGeneration())!==scope.generation)fail('书库已变化，请重新确认剩余范围','generation-changed');
   // Preserve the original full manifest and counters. Fresh approval binds only
   // the exact still-pending identities and the current generation.
   const finished=new Set(this.state.results.map(r=>key(r.source))),remaining=this.state.items.filter(item=>!finished.has(key(item)));
   if(JSON.stringify(remaining)!==JSON.stringify(scope.items))fail('剩余文件清单已变化','changed-scope');
   this.state.expectedGeneration=scope.generation;this.state.approvalToken=scope.token;this.usedScopeTokens.add(scope.token);this.state.status='running';this.state.reason=null;this.resumeScope=null;await this._save();return await this._run();
  });}finally{this.running=false;}
 }
 async _checkGeneration(){if(generation(await this.readGeneration())!==this.state.expectedGeneration)fail('书库已被其他操作更改；请重新确认剩余准确范围','generation-changed');}
 async _result(item,result){
  const record={source:sourceOf(item),status:result.status,code:result.code||null,reason:result.reason||null,originalRetained:result.originalRetained??null,logicalSavingBytes:result.logicalSavingBytes||0};
  if(result.output)record.output=clone(result.output);
  this.state.results.push(record);await this._save();await notify(this.onItem,record);
 }
 _descriptor(value,scope=this.state.scope){
  const descriptor=clone(value),source=sourceOf(descriptor.source||{});validateVariant(descriptor.variant);
  let allowed=this.scopeIdentityCache.get(scope);if(!allowed){allowed=new Set(scope.sources.map(key));this.scopeIdentityCache.set(scope,allowed);}
  if(!validSource(source)||key(source)!==key(descriptor.variant.source)||descriptor.state!=='ready'||descriptor.spool?.sessionId!==scope.nonce||typeof descriptor.spool.name!=='string'||descriptor.spool.sha256!==descriptor.variant.sha256||descriptor.spool.bytes!==descriptor.variant.bytes||!allowed.has(key(source)))fail('暂存输出与已确认范围不一致','invalid-spool');
  return {source,variant:clone(descriptor.variant),spool:{name:descriptor.spool.name,sessionId:descriptor.spool.sessionId,sha256:descriptor.spool.sha256,bytes:descriptor.spool.bytes},state:'ready'};
 }
 async _groupResult(descriptors,result){
  const state=this.state,start=state.results.length,staged=state.staged,flight=state.inFlight;
  const names=new Set(descriptors.map(d=>d.spool.name));state.staged=staged.filter(d=>!names.has(d.spool.name));state.inFlight=null;
  const records=descriptors.map((d,i)=>({source:d.source,status:'completed',code:'replaced',reason:null,originalRetained:false,output:d.variant,commitGeneration:result.committedGeneration,
   // Credit the group total exactly once; no per-file physical saving is claimed.
   logicalSavingBytes:i===0?result.calculatedSavingBytes:0}));
  state.results.push(...records);try{await this._save();}catch(error){state.results.length=start;state.staged=staged;state.inFlight=flight;throw error;}
  for(const record of records)await notify(this.onItem,record);
 }
 async _discard(engine,descriptors){
  if(!descriptors.length)return;await engine.discardSpool(descriptors);const names=new Set(descriptors.map(d=>d.spool.name));this.state.staged=this.state.staged.filter(d=>!names.has(d.spool.name));await this._save();
 }
 async _encodeAndStage(engine,item,signal){
  const state=this.state;let source=null,output=null;
  try{
   source=await this.readSource(clone(item),signal);aborted(signal);
   if(!source||source.skip===true){await this._result(item,{status:'skipped',code:source?.code||'unavailable',reason:source?.reason||'原文件当前不可读取，未执行替换',originalRetained:null});return null;}
   if(source.size!==item.bytes||await digest(source)!==item.sha256)fail('原文件身份已变化；未执行替换','source-changed');aborted(signal);
   let expectedVideo=null;
   if(item.role==='video'){const info=await this.inspectVideo(source);expectedVideo={fps:info.fps,duration:info.duration,...dimensions(info.width,info.height,512)};aborted(signal);}
   state.current={source:sourceOf(item),phase:'encoding'};await this._progress();
   output=await this.encode(source,clone(item),{signal,videoProfile:'resolution512',checkpoint:async()=>{aborted(signal);},onProgress:progress=>{state.current={source:sourceOf(item),phase:'encoding',completed:Number(progress.completed)||0,total:Number(progress.total)||0};void this._progress();}});aborted(signal);
   if(!output?.blob||output.blob.size>MAX_BYTES||output.blob.size>=source.size)fail('02 档无法满足 150,000 字节；未替换原文件，不会降档','oversize-output');
   if(expectedVideo&&(!Number.isFinite(expectedVideo.fps)||!Number.isFinite(expectedVideo.duration)||Math.abs(output.profile?.fps-expectedVideo.fps)>1e-9||!Number.isFinite(output.profile?.fps)||!Number.isFinite(output.duration)||Math.abs(output.duration-expectedVideo.duration)>.002||output.width!==expectedVideo.width||output.height!==expectedVideo.height))fail('输出未保留源帧率、完整时长或 512 尺寸档位','profile-mismatch');
   const variant=makeVariant(output,item);if(await digest(output.blob)!==variant.sha256)fail('输出校验失败，未替换原文件','output-changed');aborted(signal);await this._checkGeneration();
   state.current.phase='staging';await this._progress();
   let staged;try{staged=await engine.spoolCandidate(state.scope.nonce,sourceOf(item),variant,output.blob,{signal});}catch(error){
    // A staging failure can leave an owned temporary file, never a replacement.
    // Clean this source only; preserve other ready candidates for resume.
    source=null;output=null;const leftovers=await engine.recoverSpool(state.scope.nonce);await engine.discardSpool(leftovers.filter(d=>key(d.source)===key(item)));if(/space|quota/i.test(error.message))error.code='spool-space';throw error;
   }
   const ready=this._descriptor(staged);
   if(key(ready.source)!==key(item)||semantic(ready.variant)!==semantic(variant))fail('暂存文件身份发生变化','invalid-spool');
   state.staged.push(ready);await this._save();return ready;
  }finally{source=null;output=null;}
 }
 async _run(){
  this.paused=false;this.controller=new AbortController();if(this.stopRequest)this.controller.abort();const signal=this.controller.signal,state=this.state;await this._progress();
  try{
   aborted(signal);await this._checkGeneration();const engine=await this._engine();
   for(const method of ['groupSources','spoolCandidate','recoverSpool','discardSpool','discardSessionSpool'])if(typeof engine[method]!=='function')fail('分组安全整理引擎不可用，未执行替换','group-storage-unavailable');
   const finished=new Set(state.results.map(r=>key(r.source))),pending=state.items.filter(item=>!finished.has(key(item))),byIdentity=new Map(pending.map(item=>[key(item),item]));
   // The storage engine owns durable spool journals. Recover only this explicitly
   // resumed session, then adopt verified ready candidates lost before a save.
   const recovered=await engine.recoverSpool(state.scope.nonce);aborted(signal);await this._checkGeneration();
   state.staged=[];const readyKeys=new Set();
   for(const raw of recovered){const d=this._descriptor(raw);if(finished.has(key(d.source))){await engine.discardSpool([d]);continue;}if(readyKeys.has(key(d.source)))fail('暂存文件身份重复','invalid-spool');readyKeys.add(key(d.source));state.staged.push(d);}
   await this._save();
   const grouped=await engine.groupSources(pending.map(sourceOf));aborted(signal);await this._checkGeneration();
   if(grouped.generation!==state.expectedGeneration)fail('书库已变化，请重新确认剩余范围','generation-changed');
   if(grouped.catalogRevision!==state.scope.catalogRevision)fail('目录已变化，请重新扫描并确认','catalog-changed');
   const groups=grouped.groups||[],skipped=grouped.skipped||[],seen=new Set();
   for(const source of [...groups.flatMap(g=>g.sources),...skipped.map(s=>s.source)]){const id=key(source);if(!byIdentity.has(id)||seen.has(id))fail('分组清单与已确认准确范围不一致','group-scope-changed');seen.add(id);}
   if(seen.size!==pending.length)fail('分组清单缺少已确认文件','group-scope-changed');
   for(const skip of skipped){await this._checkGeneration();aborted(signal);const item=byIdentity.get(key(skip.source));await this._discard(engine,state.staged.filter(d=>key(d.source)===key(item)));await this._result(item,{status:'skipped',code:item.bytes<=MAX_BYTES?'already-small':'unavailable',reason:skip.reason||'此项无须或无法再次压缩，未执行替换',originalRetained:null});}
   groupLoop:for(const group of groups){
    if(this.stopRequest)break;await this._checkGeneration();aborted(signal);
    const descriptors=[];
    for(const groupSource of group.sources){
     if(this.stopRequest)break groupLoop;await this._checkGeneration();aborted(signal);const item=byIdentity.get(key(groupSource));state.current={source:sourceOf(item),phase:'reading'};await this._progress();
     try{
      if(item.bytes<=MAX_BYTES){await this._result(item,{status:'skipped',code:'already-small',originalRetained:true});continue;}
      if(!supported(item)||item.bytes>(item.role==='video'?32:16)*1024*1024){await this._result(item,{status:'skipped',code:'unsupported',reason:'格式或大小不受支持，未替换原文件',originalRetained:true});continue;}
      const staged=state.staged.find(d=>key(d.source)===key(item));const ready=staged||await this._encodeAndStage(engine,item,signal);if(ready)descriptors.push(ready);
     }catch(error){
      if(error.name==='AbortError'||['generation-changed','catalog-changed','checkpoint-unavailable','invalid-spool','spool-space'].includes(error.code))throw error;
      const skip=['oversize-output','profile-mismatch'].includes(error.code)||/不支持|超出|超过|无法压到|150 KB|音轨|可变|时长|格式|预算|unsupported/i.test(error.message);
      await this._result(item,{status:skip?'skipped':'failed',code:error.code||'processing-failed',reason:error.message,originalRetained:true});
     }finally{state.current=null;await this._progress();}
    }
    if(!descriptors.length)continue;
    let plan=null,attempted=false,completed=false;
    try{
     aborted(signal);await this._checkGeneration();state.current={source:descriptors[0].source,phase:'planning',groupSize:descriptors.length};await this._progress();plan=await engine.plan(descriptors,{signal});aborted(signal);await this._checkGeneration();
     if(plan.summary.catalogRevision!==state.scope.catalogRevision)fail('目录已变化；请重新扫描并确认','catalog-changed');
     const exact=descriptors.map(({source,variant})=>({source,variant}));if(!plan.token||semantic(plan.summary.selected)!==semantic(exact))fail('替换计划与准确源文件/输出身份不一致','plan-changed');
     if(!await this.gate())fail('请关闭旧版词书页面后再继续','incompatible-clients');aborted(signal);await this._checkGeneration();
     state.current.phase='replacing';state.inFlight={source:descriptors[0].source,variant:descriptors[0].variant,group:clone(descriptors),planToken:plan.token};await this._save();await this._progress();aborted(signal);attempted=true;
     const result=await engine.replace(descriptors,{token:plan.token,irreversibleLossy:true,exactFilesConfirmed:true},{signal});
     if(!Number.isFinite(result.calculatedSavingBytes)||result.calculatedSavingBytes<0)fail('替换返回了无法核实的统计结果','uncertain-result');
     const oldGeneration=state.expectedGeneration;await this._groupResult(descriptors,result);completed=true;
     if(result.committedGeneration!==oldGeneration+1||generation(await this.readGeneration())!==result.committedGeneration){state.status='needs-approval';state.reason='本组已替换，但书库版本不符合本次提交；剩余项目需要重新确认';break;}
     state.expectedGeneration=result.committedGeneration;await this._save();
    }catch(error){
     if(completed){state.status='needs-approval';state.reason='本组已替换；继续前需要重新核对书库版本和剩余范围：'+error.message;break;}
     if(attempted){state.status='recovery-required';state.reason='本组替换或整理结果尚未核实，不能认定原件仍在。请明确恢复整理后重新确认剩余范围';await this._save().catch(()=>{});break;}
     state.inFlight=null;
     if(error.name==='AbortError'||['generation-changed','catalog-changed','incompatible-clients','checkpoint-unavailable'].includes(error.code))throw error;
     await this._discard(engine,descriptors);
     for(const d of descriptors)await this._result(d.source,{status:'failed',code:error.code||'group-plan-failed',reason:error.message,originalRetained:true});
    }finally{plan=null;state.current=null;await this._progress();}
   }
   if(state.status==='running')state.status=this.stopRequest||(state.results.length===state.items.length?'done':'paused');
   if(!state.inFlight&&state.results.length===state.items.length){await engine.discardSessionSpool(state.scope.nonce);state.staged=[];}
  }catch(error){state.status=['generation-changed','catalog-changed','incompatible-clients'].includes(error.code)?'needs-approval':error.name==='AbortError'?(this.stopRequest||'cancelled'):'blocked';state.reason=error.message;}
  finally{state.current=null;this.paused=state.status==='paused';this.controller=null;this.stopRequest=null;await this._save().catch(()=>{if(!state.inFlight){state.status='blocked';state.reason='无法保存最新断点；请勿自动继续，请重新核对本机资源';}this.checkpointAvailable=false;});await this._progress();}
  return this.snapshot();
 }
 async recover({approved=false}={}){
  if(this.running)fail('请等待当前任务停止','busy');if(!approved)fail('恢复整理需要明确确认','approval-required');
  this.running=true;try{return await this._withOwner(async()=>{
   if(!this.state)return this.snapshot();
   if(!this.state.inFlight){
    if(this.snapshot().remaining!==0)return this.snapshot();
    await this._assertCheckpointCurrent();if(!await this.gate())fail('请关闭旧版词书页面后再恢复','incompatible-clients');
    const engine=await this._engine();await engine.discardSessionSpool(this.state.scope.nonce);this.state.staged=[];this.state.status='done';this.state.reason=null;await this._save();await this._progress();return this.snapshot();
   }
   // A read-only load may have raced another owner. Verify under ownership
   // before recovery or any save, including an error-path save.
   await this._assertCheckpointCurrent();
   const flight=clone(this.state.inFlight),resultCount=this.state.results.length,stagedBefore=this.state.staged;
   try{
    if(!await this.gate())fail('请关闭旧版词书页面后再恢复','incompatible-clients');const engine=await this._engine();if(typeof engine.recover!=='function')fail('恢复整理不可用','recovery-unavailable');await engine.recover();
    this.state.inFlight=null;
    const affected=flight.group||[{source:flight.source,variant:flight.variant}];
    if(flight.group)await engine.discardSpool(flight.group);
    const affectedKeys=new Set(affected.map(d=>key(d.source)));this.state.staged=this.state.staged.filter(d=>!affectedKeys.has(key(d.source)));
    // Recovery does not report which side of commit was reached. Never invent
    // completion/savings or claim the original was retained.
    const records=affected.map(d=>({source:d.source,status:'failed',code:'recovered-outcome-unknown',reason:'整理已恢复，本组提交结果未单独核实；不计入已完成或节省空间，请重新扫描核对',originalRetained:null,logicalSavingBytes:0}));
    this.state.results.push(...records);await this._save();for(const record of records)await notify(this.onItem,record);
    this.state.status='paused';this.state.reason='整理已恢复；剩余项目必须重新确认，此项结果请重新扫描核对';this.resumeScope=null;await this._save();await this._progress();return this.snapshot();
   }catch(error){this.state.results.length=resultCount;this.state.inFlight=flight;this.state.staged=stagedBefore;this.state.status='recovery-required';this.state.reason='整理尚未核实：'+error.message;await this._save().catch(()=>{});await this._progress();throw error;}
  });}finally{this.running=false;}
 }

}
export {SerialCompressionQueue as CompressionQueue};
