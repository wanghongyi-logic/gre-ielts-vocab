// Read-only validation of existing owned-local backup media. No encoding or replacement APIs.
export const abortCheck=signal=>{if(signal?.aborted)throw new DOMException('已取消；原文件未更改','AbortError');};
function waitEvent(target,event,{signal,timeout=15000,action}={}){return new Promise((resolve,reject)=>{let timer;const done=error=>{clearTimeout(timer);target.removeEventListener(event,yes);target.removeEventListener('error',fail);signal?.removeEventListener('abort',abort);error?reject(error):resolve();};const yes=()=>done(),fail=()=>done(new Error('无法解码本机媒体')),abort=()=>done(new DOMException('已取消','AbortError'));target.addEventListener(event,yes,{once:true});target.addEventListener('error',fail,{once:true});signal?.addEventListener('abort',abort,{once:true});timer=setTimeout(()=>done(new Error('本机媒体处理超时，已保留原文件')),timeout);try{abortCheck(signal);const pending=action?.();pending?.catch?.(error=>done(error));}catch(e){done(e);}});}
async function loadVideo(blob,signal){const video=document.createElement('video'),url=URL.createObjectURL(blob);video.muted=true;video.playsInline=true;video.preload='auto';const release=()=>{video.pause();video.removeAttribute('src');video.load();URL.revokeObjectURL(url);};try{await waitEvent(video,'loadeddata',{signal,action:()=>{video.src=url;video.load();}});return {video,release};}catch(e){release();throw e;}}
async function seek(video,time,signal){if(Math.abs(video.currentTime-time)<.001&&video.readyState>=2)return;await waitEvent(video,'seeked',{signal,action:()=>{video.currentTime=time;}});}
async function imageFrom(blob,signal){const img=new Image(),url=URL.createObjectURL(blob);try{await waitEvent(img,'load',{signal,action:()=>{img.src=url;}});if(img.naturalWidth*img.naturalHeight>24000000)throw new Error('图片像素过大，预览已跳过');return {img,release:()=>{img.src='';URL.revokeObjectURL(url);}};}catch(e){URL.revokeObjectURL(url);throw e;}}
export async function checkStillImage(blob){
 const data=new Uint8Array(await blob.arrayBuffer()),view=new DataView(data.buffer),label=(a,b)=>new TextDecoder().decode(data.subarray(a,b));
 if(data[0]===0xff&&data[1]===0xd8)return;
 if(data.length>=8&&label(1,4)==='PNG'){let at=8;while(at+12<=data.length){const length=view.getUint32(at);if(at+12+length>data.length)throw new Error('图片数据不完整');if(label(at+4,at+8)==='acTL')throw new Error('动态 PNG 不能按静态图片处理，已跳过');at+=12+length;}return;}
 if(label(0,4)==='RIFF'&&label(8,12)==='WEBP'){let at=12;while(at+8<=data.length){const length=view.getUint32(at+4,true);if(at+8+length>data.length)throw new Error('图片数据不完整');if(['ANIM','ANMF'].includes(label(at,at+4)))throw new Error('动态 WebP 不能按静态图片处理，已跳过');at+=8+length+(length%2);}return;}
 throw new Error('预览只支持静态 PNG、JPEG 和 WebP 图片');
}
export function frameSchedule(duration,fps){
 if(!Number.isFinite(duration)||duration<=0||duration>30||!Number.isFinite(fps)||fps<1||fps>60)throw new Error('Unsupported frame schedule');
 const count=Math.ceil(duration*fps-1e-9),end=Math.round(duration*1000000),schedule=[];
 for(let i=0;i<count;i++){const timestamp=Math.round(i/fps*1000000),next=Math.min(end,Math.round((i+1)/fps*1000000));if(next<=timestamp)throw new Error('Invalid submitted frame duration');schedule.push({timestamp,duration:next-timestamp});}
 return schedule;
}
export function assertMuxedSchedule(info,schedule){
 if(info.videoTrackCount!==1||info.hasAudio||info.fragmented||info.hasCompositionOffsets||info.hasEditList||info.frameCount!==schedule.length||info.sampleCount!==schedule.length||info.timescale!==1000000||info.ticks!==info.declaredTicks)throw new Error('压缩视频帧数量或时间轴校验失败');
 let i=0,timestamp=0;for(const run of info.sttsRuns||[])for(let n=0;n<run.count;n++){const expected=schedule[i++];if(!expected||expected.timestamp!==timestamp||expected.duration!==run.delta)throw new Error('压缩视频逐帧时长校验失败');timestamp+=run.delta;}
 if(i!==schedule.length||timestamp!==info.ticks)throw new Error('压缩视频帧表不完整');
}
async function verifyVideo(blob,{duration,width,height,signal,playback=false,schedule}){if(blob.type!=='video/mp4')throw new Error('压缩视频类型错误');const info=await inspectMP4(blob);assertMuxedSchedule(info,schedule);const {video,release}=await loadVideo(blob,signal);try{if(video.videoWidth!==width||video.videoHeight!==height||Math.abs(video.duration-duration)>.002)throw new Error('压缩视频时长或尺寸校验失败');if(playback){await waitEvent(video,'timeupdate',{signal,action:()=>video.play()});video.pause();}for(const fraction of [0,.5,.95])await seek(video,Math.min(video.duration-.01,video.duration*fraction),signal);return {width,height,duration:video.duration};}finally{release();}}
export async function inspectMP4(blob){
 if(blob.size>32*1024*1024)throw new Error('Source exceeds 32 MB preview memory budget');
 const data=new Uint8Array(await blob.arrayBuffer()),view=new DataView(data.buffer),tracks=[];let fragmented=false;
 const visit=(start,end,depth=0,track=null)=>{if(depth>8)throw new Error('Invalid MP4 depth');let at=start;while(at<end){if(at+8>end)throw new Error('Truncated MP4');let size=view.getUint32(at),head=8;const type=new TextDecoder().decode(data.subarray(at+4,at+8));if(size===1){if(at+16>end)throw new Error('Truncated MP4');size=Number(view.getBigUint64(at+8));head=16;}else if(size===0)size=end-at;if(!Number.isSafeInteger(size)||size<head||at+size>end)throw new Error('Invalid MP4 size');const body=at+head,limit=at+size;
 if(type==='moof'||type==='mvex')fragmented=true;
 if(type==='trak'){const child={};tracks.push(child);visit(body,limit,depth+1,child);}
 else if(['moov','mdia','minf','stbl','edts'].includes(type))visit(body,limit,depth+1,track);
 else if(type==='ctts'&&track)track.hasCompositionOffsets=true;
 else if(type==='elst'&&track)track.hasEditList=true;
 else if(type==='stsz'&&track){if(body+12>limit)throw new Error('Invalid MP4 sample sizes');track.sampleCount=view.getUint32(body+8);}
 else if(type==='hdlr'&&track){if(body+12>limit)throw new Error('Invalid MP4 handler');track.kind=new TextDecoder().decode(data.subarray(body+8,body+12));}
 else if(type==='mdhd'&&track){const version=data[body];if(version!==0&&version!==1)throw new Error('Unsupported MP4 timing version');const offset=version===1?20:12;if(body+offset+(version===1?12:8)>limit)throw new Error('Invalid MP4 timescale');track.timescale=view.getUint32(body+offset);track.declaredTicks=version===1?Number(view.getBigUint64(body+offset+4)):view.getUint32(body+offset+4);}
 else if(type==='stts'&&track){if(body+8>limit)throw new Error('Invalid MP4 timeline');const count=view.getUint32(body+4);if(count>100000||body+8+count*8>limit)throw new Error('Invalid MP4 timeline');let frames=0,ticks=0;const deltas=new Set(),runs=[];for(let i=0;i<count;i++){const n=view.getUint32(body+8+i*8),delta=view.getUint32(body+12+i*8);if(!n||!delta)throw new Error('Invalid MP4 sample duration');frames+=n;ticks+=n*delta;runs.push({count:n,delta});if(n)deltas.add(delta);}track.frames=frames;track.ticks=ticks;track.variableFrameRate=deltas.size>1;track.sttsRuns=runs;}
 at+=size;}};
 visit(0,data.length);const video=tracks.find(t=>t.kind==='vide');if(!video)throw new Error('No supported MP4 video track');const fps=video.ticks&&video.timescale?video.frames*video.timescale/video.ticks:null;
 return {hasAudio:tracks.some(t=>t.kind==='soun'),hasVideo:true,fragmented,decodeFps:fps,fps:video.hasCompositionOffsets||video.hasEditList?null:fps,presentationTimelineVerified:!video.hasCompositionOffsets&&!video.hasEditList,variableFrameRate:video.hasCompositionOffsets||video.hasEditList?null:Boolean(video.variableFrameRate),hasCompositionOffsets:Boolean(video.hasCompositionOffsets),hasEditList:Boolean(video.hasEditList),videoTrackCount:tracks.filter(t=>t.kind==='vide').length,timescale:video.timescale,ticks:video.ticks,declaredTicks:video.declaredTicks,frameCount:video.frames,sampleCount:video.sampleCount,sttsRuns:video.sttsRuns};
}
export async function validateVariantMedia(blob,variant,{signal}={}){
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
