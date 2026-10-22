import {muxAVC,inspectMP4} from './compression-mp4.js';
import {demuxAVC} from './compression-demux.js';
export const MAX_BYTES=200000;
// Acceptance ceiling increased; preserve the existing 02 encoder target.
export const ENCODE_TARGET_BYTES=150000;
const IMAGE_PROFILES=[{edge:512,quality:.82}];
export const VIDEO_PROFILES=Object.freeze({resolution512:{edge:512,bps:102000},resolution384:{edge:384,bps:102000},resolution256:{edge:256,bps:102000},lowFps512:{edge:512,fps:10,bps:102000}});
export const abortCheck=signal=>{if(signal?.aborted)throw new DOMException('已取消；原文件未更改','AbortError');};
export async function sha256(blob){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer())),n=>n.toString(16).padStart(2,'0')).join('');}
export function dimensions(width,height,edge){const ratio=Math.min(1,edge/Math.max(width,height));return {width:Math.max(2,Math.floor(width*ratio/2)*2),height:Math.max(2,Math.floor(height*ratio/2)*2)};}
function waitEvent(target,event,{signal,timeout=15000,action}={}){return new Promise((resolve,reject)=>{let timer;const done=error=>{clearTimeout(timer);target.removeEventListener(event,yes);target.removeEventListener('error',fail);signal?.removeEventListener('abort',abort);error?reject(error):resolve();};const yes=()=>done(),fail=()=>done(new Error('无法解码本机媒体')),abort=()=>done(new DOMException('已取消','AbortError'));target.addEventListener(event,yes,{once:true});target.addEventListener('error',fail,{once:true});signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>done(new Error('本机媒体处理超时，已保留原文件')),timeout);try{abortCheck(signal);const pending=action?.();pending?.catch?.(error=>done(error));}catch(e){done(e);}});}
async function loadVideo(blob,signal){const video=document.createElement('video'),url=URL.createObjectURL(blob);video.muted=true;video.playsInline=true;video.preload='auto';const release=()=>{video.pause();video.removeAttribute('src');video.load();URL.revokeObjectURL(url);};try{await waitEvent(video,'loadeddata',{signal,action:()=>{video.src=url;video.load();}});return {video,release};}catch(e){release();throw e;}}
async function seek(video,time,signal){if(Math.abs(video.currentTime-time)<.001&&video.readyState>=2)return;await waitEvent(video,'seeked',{signal,action:()=>{video.currentTime=time;}});}
async function imageFrom(blob,signal){const img=new Image(),url=URL.createObjectURL(blob);try{await waitEvent(img,'load',{signal,action:()=>{img.src=url;}});if(img.naturalWidth*img.naturalHeight>24000000)throw new Error('图片像素过大，预览已跳过');return {img,release:()=>{img.src='';URL.revokeObjectURL(url);}};}catch(e){URL.revokeObjectURL(url);throw e;}}
function canvas(width,height){const el=document.createElement('canvas');el.width=width;el.height=height;return el;}
const encodeImage=(el,type,quality)=>new Promise((resolve,reject)=>{el.toBlob(blob=>blob?resolve(blob):reject(new Error('图片编码失败')),type,quality);});
export async function checkStillImage(blob){
 const data=new Uint8Array(await blob.arrayBuffer()),view=new DataView(data.buffer),label=(a,b)=>new TextDecoder().decode(data.subarray(a,b));
 if(data[0]===0xff&&data[1]===0xd8)return;
 if(data.length>=8&&label(1,4)==='PNG'){let at=8;while(at+12<=data.length){const length=view.getUint32(at);if(at+12+length>data.length)throw new Error('图片数据不完整');if(label(at+4,at+8)==='acTL')throw new Error('动态 PNG 不能按静态图片处理，已跳过');at+=12+length;}return;}
 if(label(0,4)==='RIFF'&&label(8,12)==='WEBP'){let at=12;while(at+8<=data.length){const length=view.getUint32(at+4,true);if(at+8+length>data.length)throw new Error('图片数据不完整');if(['ANIM','ANMF'].includes(label(at,at+4)))throw new Error('动态 WebP 不能按静态图片处理，已跳过');at+=8+length+(length%2);}return;}
 throw new Error('预览只支持静态 PNG、JPEG 和 WebP 图片');
}
export async function compressImage(source,{signal,checkpoint=async()=>{},onProgress=()=>{}}={}){
 if(source.size>16*1024*1024)throw new Error('图片超过 16 MB，已跳过');
 await checkStillImage(source);abortCheck(signal);const {img,release}=await imageFrom(source,signal);let encodedBytes=0;try{for(const profile of IMAGE_PROFILES){await checkpoint();abortCheck(signal);const {width,height}=dimensions(img.naturalWidth,img.naturalHeight,profile.edge),el=canvas(width,height),ctx=el.getContext('2d');if(!ctx)throw new Error('浏览器不支持图片处理');ctx.drawImage(img,0,0,width,height);
  // WebP may silently become PNG. Only accept an actual requested MIME.
  let output=await encodeImage(el,'image/webp',profile.quality);
  if(output.type!=='image/webp'){ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);output=await encodeImage(el,'image/jpeg',profile.quality);if(output.type!=='image/jpeg')throw new Error('浏览器不支持安全图片编码');}
  encodedBytes=output.size;el.width=el.height=1;abortCheck(signal);onProgress({phase:'image',profile});
  if(output.size<=MAX_BYTES&&output.size<source.size){const check=await imageFrom(output,signal);try{if(check.img.naturalWidth!==width||check.img.naturalHeight!==height)throw new Error('压缩图片尺寸校验失败');}finally{check.release();}return {blob:output,width,height,sha256:await sha256(output),profile,warning:output.type==='image/jpeg'?'JPEG 会将透明背景转为白色。':null};}
 }throw new Error(`输出 ${encodedBytes} 字节，未满足不超过 200 KB 且小于原文件的要求；已保留原文件，不会自动降档`);}finally{release();}
}
async function supportedConfig(width,height,bps,fps,signal){if(!globalThis.VideoEncoder||!globalThis.VideoFrame)throw new Error('此浏览器没有可用的视频编码能力');const config={codec:'avc1.42001f',width,height,bitrate:bps,framerate:fps,latencyMode:'realtime',avc:{format:'avc'}};abortCheck(signal);const probe=await bounded(VideoEncoder.isConfigSupported(config),signal);abortCheck(signal);if(!probe.supported)throw new Error('此手机不支持所需的 H.264 编码配置');return config;}
function bounded(promise,signal,timeout=15000){return new Promise((resolve,reject)=>{let timer;const abort=()=>finish(new DOMException('已取消','AbortError'));const finish=(error,value)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve(value);};signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>finish(new Error('视频编码超时，已保留原文件')),timeout);promise.then(value=>finish(null,value),error=>finish(error));if(signal?.aborted)abort();});}
export function frameSchedule(duration,fps){
 if(!Number.isFinite(duration)||duration<=0||duration>30||!Number.isFinite(fps)||fps<1||fps>60)throw new Error('Unsupported frame schedule');
 const count=Math.ceil(duration*fps-1e-9),end=Math.round(duration*1000000),schedule=[];
 for(let i=0;i<count;i++){const timestamp=Math.round(i/fps*1000000),next=Math.min(end,Math.round((i+1)/fps*1000000));if(next<=timestamp)throw new Error('Invalid submitted frame duration');schedule.push({timestamp,duration:next-timestamp});}
 return schedule;
}
export function assertEncodedSchedule(samples,schedule){
 if(samples.length!==schedule.length)throw new Error('视频编码丢帧或多帧，已保留原文件');
 for(let i=0;i<schedule.length;i++)if(samples[i].timestamp!==schedule[i].timestamp||samples[i].duration!==schedule[i].duration)throw new Error('视频编码时间戳或帧时长不匹配，已保留原文件');
}
export function assertMuxedSchedule(info,schedule){
 if(info.videoTrackCount!==1||info.hasAudio||info.fragmented||info.hasCompositionOffsets||info.hasEditList||info.frameCount!==schedule.length||info.sampleCount!==schedule.length||info.timescale!==1000000||info.ticks!==info.declaredTicks)throw new Error('压缩视频帧数量或时间轴校验失败');
 let i=0,timestamp=0;for(const run of info.sttsRuns||[])for(let n=0;n<run.count;n++){const expected=schedule[i++];if(!expected||expected.timestamp!==timestamp||expected.duration!==run.delta)throw new Error('压缩视频逐帧时长校验失败');timestamp+=run.delta;}
 if(i!==schedule.length||timestamp!==info.ticks)throw new Error('压缩视频帧表不完整');
}
export async function encodeFrames({width,height,duration,fps,bps,draw,signal,checkpoint=async()=>{},onProgress=()=>{}}){
 const schedule=frameSchedule(duration,fps),config=await supportedConfig(width,height,bps,fps,signal),samples=[];let avcC,failure,total=0;
 abortCheck(signal);
 const encoder=new VideoEncoder({output(chunk,metadata){try{total+=chunk.byteLength;if(total>2*1024*1024)throw new Error('视频输出超过预览内存预算');const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);if(metadata?.decoderConfig?.description){const d=metadata.decoderConfig.description;avcC=(ArrayBuffer.isView(d)?new Uint8Array(d.buffer,d.byteOffset,d.byteLength):new Uint8Array(d)).slice();}samples.push({data,timestamp:chunk.timestamp,duration:chunk.duration,key:chunk.type==='key'});}catch(e){failure=e;}},error:error=>{failure=error;}});
 const el=canvas(width,height),ctx=el.getContext('2d');if(!ctx){encoder.close();throw new Error('浏览器不支持视频画布');}
 try{encoder.configure(config);for(let i=0;i<schedule.length;i++){await checkpoint();abortCheck(signal);if(failure)throw failure;const expected=schedule[i];await draw(ctx,expected.timestamp/1000000);abortCheck(signal);const frame=new VideoFrame(el,expected);try{encoder.encode(frame,{keyFrame:i%Math.max(1,Math.round(fps*2))===0});}finally{frame.close();}
 // Bound outstanding frames to one. An incomplete flush is a failure, not a
 // reason to stretch the preceding frame across a missing output.
 await bounded(encoder.flush(),signal);if(failure)throw failure;assertEncodedSchedule(samples,schedule.slice(0,i+1));onProgress({phase:'video',completed:i+1,total:schedule.length});}
 if(failure)throw failure;if(!avcC)throw new Error('视频编码没有返回 AVC 配置');assertEncodedSchedule(samples,schedule);
 const blob=muxAVC({samples,avcC,width,height});assertMuxedSchedule(await inspectMP4(blob),schedule);abortCheck(signal);return blob;
 }finally{if(encoder.state!=='closed')encoder.close();el.width=el.height=1;}
}
async function verifyVideo(blob,{duration,width,height,signal,playback=false,schedule}){if(blob.type!=='video/mp4')throw new Error('压缩视频类型错误');const info=await inspectMP4(blob);assertMuxedSchedule(info,schedule);const {video,release}=await loadVideo(blob,signal);try{if(video.videoWidth!==width||video.videoHeight!==height||Math.abs(video.duration-duration)>.002)throw new Error('压缩视频时长或尺寸校验失败');if(playback){await waitEvent(video,'timeupdate',{signal,action:()=>video.play()});video.pause();}for(const fraction of [0,.5,.95])await seek(video,Math.min(video.duration-.01,video.duration*fraction),signal);return {width,height,duration:video.duration};}finally{release();}}
let completedSelfTest;
export async function videoSelfTest({signal,checkpoint=async()=>{}}={}){
 abortCheck(signal);if(completedSelfTest)return completedSelfTest;
 // Cache only successful completed work. Each pending self-test belongs to its
 // caller and is cancelled/closed with that caller, never a detached shared job.
 const duration=.4,fps=5,blob=await encodeFrames({width:64,height:64,duration,fps,bps:65000,signal,checkpoint,draw:async(ctx,t)=>{ctx.fillStyle=t?'blue':'red';ctx.fillRect(0,0,64,64);}});
 await verifyVideo(blob,{duration,width:64,height:64,signal,playback:true,schedule:frameSchedule(duration,fps)});abortCheck(signal);completedSelfTest={supported:true,bytes:blob.size};return completedSelfTest;
}
async function waitCodecCapacity(decoder,encoder,signal,getFailure){
 const started=performance.now();while(decoder.decodeQueueSize>=4||encoder.encodeQueueSize>=4){abortCheck(signal);if(getFailure())throw getFailure();if(performance.now()-started>15000)throw new Error('视频处理超时，已保留原文件');await new Promise(resolve=>setTimeout(resolve,10));}
}
export async function transcodeAVC(source,{width,height,fps,bps,signal,checkpoint=async()=>{},onProgress=()=>{}}){
 if(!globalThis.VideoDecoder||!globalThis.EncodedVideoChunk)throw new Error('此浏览器没有可用的视频解码能力');
 const keepAll=Math.abs(fps-source.fps)<1e-9,schedule=keepAll?source.schedule:frameSchedule(source.duration,fps),chosen=new Map(schedule.map((_,i)=>[keepAll?i:Math.min(source.schedule.length-1,Math.floor(i*source.fps/fps)),i]));
 if(chosen.size!==schedule.length)throw new Error('预览帧选择存在重复');
 const encodeConfig=await supportedConfig(width,height,bps,fps,signal);abortCheck(signal);
 const supported=await bounded(VideoDecoder.isConfigSupported(source.config),signal);abortCheck(signal);if(!supported.supported)throw new Error('此手机不支持源视频的 AVC 解码配置');
 let failure,total=0,decoded=0,submitted=0,avcC;const samples=[],submittedSchedule=[];
 const encoder=new VideoEncoder({output(chunk,metadata){try{total+=chunk.byteLength;if(total>2*1024*1024)throw new Error('视频输出超过预览内存预算');const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);const d=metadata?.decoderConfig?.description;if(d)avcC=(ArrayBuffer.isView(d)?new Uint8Array(d.buffer,d.byteOffset,d.byteLength):new Uint8Array(d)).slice();samples.push({data,timestamp:chunk.timestamp,duration:chunk.duration,key:chunk.type==='key'});}catch(error){failure=error;}},error:error=>{failure=error;}});
 const el=canvas(width,height),ctx=el.getContext('2d');if(!ctx){encoder.close();throw new Error('浏览器不支持视频画布');}
 const decoder=new VideoDecoder({output(frame){try{
  abortCheck(signal);if(failure)throw failure;const expected=source.schedule[decoded];if(!expected||frame.timestamp!==expected.timestamp)throw new Error('解码帧数量或呈现时间戳不匹配，已保留原文件');
  if(frame.displayWidth!==source.width||frame.displayHeight!==source.height)throw new Error('解码视频尺寸不匹配');
  const outputIndex=chosen.get(decoded);decoded++;
  if(outputIndex!==undefined){if(outputIndex!==submitted||encoder.encodeQueueSize>=16)throw new Error('视频编码队列超出安全预算');const target=schedule[outputIndex];ctx.drawImage(frame,0,0,width,height);const resized=new VideoFrame(el,target);try{submittedSchedule.push({...target});encoder.encode(resized,{keyFrame:submitted%Math.max(1,Math.round(fps*2))===0});submitted++;}finally{resized.close();}}
  onProgress({phase:'video',completed:decoded,total:source.schedule.length});
 }catch(error){failure=error;}finally{frame.close();}},error:error=>{failure=error;}});
 try{encoder.configure(encodeConfig);decoder.configure(source.config);
  for(const sample of source.samples){await checkpoint();abortCheck(signal);if(failure)throw failure;await waitCodecCapacity(decoder,encoder,signal,()=>failure);decoder.decode(new EncodedVideoChunk({type:sample.key?'key':'delta',timestamp:sample.timestamp,duration:sample.durationUs,data:sample.data}));}
  await bounded(decoder.flush(),signal);if(failure)throw failure;
  if(decoded!==source.schedule.length||submitted!==schedule.length)throw new Error('视频解码丢帧，已保留原文件');
  await bounded(encoder.flush(),signal);if(failure)throw failure;assertEncodedSchedule(samples,submittedSchedule);assertEncodedSchedule(submittedSchedule,schedule);if(!avcC)throw new Error('视频编码没有返回 AVC 配置');
  const blob=muxAVC({samples,avcC,width,height});assertMuxedSchedule(await inspectMP4(blob),schedule);abortCheck(signal);return {blob,schedule};
 }finally{if(decoder.state!=='closed')decoder.close();if(encoder.state!=='closed')encoder.close();el.width=el.height=1;}
}
export async function compressVideo(source,{signal,checkpoint=async()=>{},onProgress=()=>{},videoProfile='resolution512'}={}){
 abortCheck(signal);const demuxed=await demuxAVC(source);abortCheck(signal);await videoSelfTest({signal,checkpoint});abortCheck(signal);
 const selected=VIDEO_PROFILES[videoProfile];if(!selected)throw new Error('未知视频预览档位');const profile={...selected,fps:selected.fps?Math.min(selected.fps,demuxed.fps):demuxed.fps};await checkpoint();abortCheck(signal);
 const {width,height}=dimensions(demuxed.width,demuxed.height,profile.edge),duration=demuxed.duration,bps=Math.min(profile.bps,Math.floor((ENCODE_TARGET_BYTES-12000)*8/duration));if(bps<45000)throw new Error('现有 02 编码预算不足以保留完整时长，已保留原文件');
 const {blob:output,schedule}=await transcodeAVC(demuxed,{width,height,duration,fps:profile.fps,bps,signal,checkpoint,onProgress});
 if(output.size>MAX_BYTES||output.size>=source.size)throw new Error(`输出 ${output.size} 字节，未满足不超过 200 KB 且小于原文件的要求；已保留原文件，不会自动降档`);
 const verified=await verifyVideo(output,{duration,width,height,signal,schedule});return {blob:output,...verified,sha256:await sha256(output),profile:{...profile,bps},warning:'已按呈现时间轴核对源解码帧和输出帧表。实际手机编码效果仍需对比确认；低帧率档会另行减少帧数。'};
}
export class PreviewQueue{
 constructor({readSource,encode=async(blob,item,options)=>item.role==='video'?compressVideo(blob,options):compressImage(blob,options),onResult=()=>{},onState=()=>{}}){this.readSource=readSource;this.encode=encode;this.onResult=onResult;this.onState=onState;this.running=false;this.paused=false;this.resumeWaiters=[];}
 pause(){if(this.running){this.paused=true;this.onState('paused');}}
 resume(){this.paused=false;for(const wake of this.resumeWaiters.splice(0))wake();if(this.running)this.onState('running');}
 cancel(){this.controller?.abort();this.resume();}
 async checkpoint(){abortCheck(this.controller.signal);if(this.paused)await new Promise(resolve=>this.resumeWaiters.push(resolve));abortCheck(this.controller.signal);}
 async run(items){if(this.running)throw new Error('已有预览正在运行');this.running=true;this.paused=false;this.controller=new AbortController();this.onState('running');const signal=this.controller.signal;try{for(const item of items){await this.checkpoint();try{const source=await this.readSource(item,signal);abortCheck(signal);if(!source)throw new Error('本机没有可验证原文件；不会联网下载');if(source.size<=MAX_BYTES){await this.onResult({item,status:'already-small',bytes:source.size});continue;}const result=await this.encode(source,item,{signal,checkpoint:()=>this.checkpoint(),onProgress:progress=>this.onState('progress',progress)});abortCheck(signal);if(result.blob.size>MAX_BYTES||result.blob.size>=source.size)throw new Error(`输出 ${result.blob.size} 字节，未满足不超过 200 KB 且小于原文件的要求`);await this.onResult({item,status:'preview',source,...result});}catch(error){if(error.name==='AbortError')throw error;await this.onResult({item,status:'skipped',reason:error.message});}}return 'done';}catch(error){if(error.name==='AbortError')return 'cancelled';throw error;}finally{this.running=false;this.paused=false;this.resume();this.onState(signal.aborted?'cancelled':'done');}}
}

export async function validateCompressionMedia(blob,variant,{signal}={}){
 const p=variant.profile;
 if(!p||p.id!=='sample02-local-v1'||p.maxEdge!==512||!Number.isInteger(p.width)||!Number.isInteger(p.height)||p.width<1||p.height<1||Math.max(p.width,p.height)>512)throw new Error('压缩文件尺寸档位无效');
 if(variant.role==='video'){
  if(!Number.isFinite(p.duration)||!Number.isFinite(p.fps))throw new Error('压缩视频缺少完整时间轴');
  const schedule=frameSchedule(p.duration,p.fps);await verifyVideo(blob,{duration:p.duration,width:p.width,height:p.height,signal,schedule,playback:true});
 }else{
  await checkStillImage(blob);const check=await imageFrom(blob,signal);try{if(check.img.naturalWidth!==p.width||check.img.naturalHeight!==p.height)throw new Error('压缩图片尺寸校验失败');}finally{check.release();}
 }
 abortCheck(signal);return true;
}
