// Narrow, dependency-free MP4 writer for monotonic, silent baseline AVC only.
// No reordering, audio, edit lists, fragmented output, or external media reads.
const bytes=(...parts)=>{const n=parts.reduce((s,p)=>s+p.length,0),out=new Uint8Array(n);let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;};
const text=s=>new TextEncoder().encode(s);
const u32=(...ns)=>{const out=new Uint8Array(ns.length*4),v=new DataView(out.buffer);ns.forEach((n,i)=>v.setUint32(i*4,n));return out;};
const u16=(...ns)=>{const out=new Uint8Array(ns.length*2),v=new DataView(out.buffer);ns.forEach((n,i)=>v.setUint16(i*2,n));return out;};
const zeros=n=>new Uint8Array(n);
const box=(name,...parts)=>{const body=bytes(...parts);return bytes(u32(body.length+8),text(name),body);};
const full=(name,flags,...parts)=>box(name,u32(flags),...parts);
const matrix=u32(0x10000,0,0,0,0x10000,0,0,0,0x40000000);
export function muxAVC({samples,avcC,width,height}){
 if(!samples.length||samples.length>1800||!samples[0].key||!(avcC instanceof Uint8Array)||avcC.length<7||avcC[0]!==1)throw new Error('Unsupported AVC stream');
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<2||height<2||width>1024||height>1024)throw new Error('Unsupported dimensions');
 let end=0;for(const s of samples){if(s.timestamp!==end||!Number.isInteger(s.duration)||s.duration<=0||!s.data.length)throw new Error('Non-contiguous AVC timeline');end+=s.duration;}
 if(end>60000000)throw new Error('Preview duration exceeds limit');
 const ftyp=box('ftyp',text('isom'),u32(512),text('isomiso2avc1mp41'));
 const payload=bytes(...samples.map(s=>s.data));if(payload.length>2*1024*1024)throw new Error('Encoded preview exceeds memory budget');
 const mdat=box('mdat',payload),timescale=1000000,duration=end;
 const mvhd=full('mvhd',0,u32(0,0,timescale,duration,0x10000),u16(0x100,0),zeros(8),matrix,zeros(24),u32(2));
 const tkhd=full('tkhd',7,u32(0,0,1,0,duration),zeros(8),u16(0,0,0,0),matrix,u32(width*65536,height*65536));
 const mdhd=full('mdhd',0,u32(0,0,timescale,duration),u16(0x55c4,0));
 const hdlr=full('hdlr',0,u32(0),text('vide'),zeros(12),text('Local preview\0'));
 const avc1=box('avc1',zeros(6),u16(1),zeros(16),u16(width,height),u32(0x480000,0x480000,0),u16(1),zeros(32),u16(24,65535),box('avcC',avcC));
 const stsd=full('stsd',0,u32(1),avc1);
 const runs=[];for(const sample of samples){const last=runs.at(-1);if(last&&last[1]===sample.duration)last[0]++;else runs.push([1,sample.duration]);}
 const stts=full('stts',0,u32(runs.length),...runs.map(r=>u32(...r)));
 const stsc=full('stsc',0,u32(1,1,samples.length,1));
 const stsz=full('stsz',0,u32(0,samples.length),u32(...samples.map(s=>s.data.length)));
 const stco=full('stco',0,u32(1,ftyp.length+8));
 const keys=samples.flatMap((s,i)=>s.key?[i+1]:[]),stss=full('stss',0,u32(keys.length,...keys));
 const stbl=box('stbl',stsd,stts,stsc,stsz,stco,stss);
 const dinf=box('dinf',full('dref',0,u32(1),full('url ',1)));
 const minf=box('minf',full('vmhd',1,u16(0,0,0,0)),dinf,stbl);
 const moov=box('moov',mvhd,box('trak',tkhd,box('mdia',mdhd,hdlr,minf)));
 return new Blob([ftyp,mdat,moov],{type:'video/mp4'});
}
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
