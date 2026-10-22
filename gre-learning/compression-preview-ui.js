import {compatibleCompressionClients} from './compression-client-gate.js';
import {compressionStorage} from './offline-packs.js';
import {waitForLocal} from './offline-async.js';
import {PreviewQueue,compressImage,compressVideo} from './compression-preview.js';
import {listLocalMedia,readLocalSource} from './compression-local-source.js';
// Encoding is read-only. Replacement requires a separate exact-file confirmation.
export function mountCompressionPreview(host,catalog,{baseURL=new URL('../',import.meta.url)}={}){
 host.innerHTML=`<section aria-label="本机压缩效果预览"><h2>本机压缩效果预览</h2><p>先预览手机已有资源，不上传、不重新下载。预览结果仅在当前页面内存中，尚未释放存储；只有你另行确认准确文件后，才会替换本机原文件。</p><p>请从你原来保存词书的同一个已安装 PWA 内进入。另开 Safari 标签页可能使用不同存储空间；那里看不到资源，不代表原来的保存已丢失。</p><p>每个输出最多 150,000 字节（150 KB）。达不到大小或校验要求时，跳过并保留原文件。请保持此页在前台；锁屏或切换应用会暂停。</p><label>动画档位 <select data-profile><option value="resolution512">02 · 最长边 512 像素，保持源恒定呈现帧率</option><option value="resolution384">384 像素，保持源恒定呈现帧率</option><option value="resolution256">256 像素，保持源恒定呈现帧率</option><option value="lowFps512">512 像素，最多 10 帧/秒</option></select></label><p>默认 02 档：源视频 25 帧/秒就保留 25 帧/秒与完整时长。图片固定最长边 512 像素，不自动降低画质；无法满足 150 KB 就跳过。手机硬件编码不保证与先前示例画质完全一致。可逐档比较，不自动选择最低画质。含音轨、可变帧率、复杂剪辑、分片或超过 30 秒的视频暂时跳过。</p><button data-scan>扫描本机已保存媒体</button><label>或选择测试文件 <input data-file type="file" accept="image/png,image/jpeg,image/webp,video/mp4"></label><p data-count></p><select data-items aria-label="选择本机媒体"></select><button data-start disabled>预览所选资源</button><button data-pause disabled>暂停</button><button data-cancel disabled>取消</button><p role="status" aria-live="polite" data-status></p><div data-result></div><button data-replace disabled>确认替换这一项原文件</button><button data-recover>恢复上次未完成整理</button><p>替换仅适用于本机已保存资源的 02 档预览。替换不可撤销，必须有临时空间完成安全校验和书包整理；不支持时保留原文件。</p></section>`;
 const $=s=>host.querySelector(s),scan=$('[data-scan]'),file=$('[data-file]'),start=$('[data-start]'),pause=$('[data-pause]'),cancel=$('[data-cancel]'),select=$('[data-items]'),profile=$('[data-profile]'),status=$('[data-status]'),result=$('[data-result]'),replace=$('[data-replace]'),recover=$('[data-recover]');let items=[],testFile=null,urls=[],disposed=false,scanning=false,scanController=null,scanWork=null,activeWork=null,latest=null,replacing=false,mutationController=null;
 function clearPreview(){latest=null;replace.disabled=true;for(const url of urls)URL.revokeObjectURL(url);urls=[];for(const video of result.querySelectorAll('video')){video.pause();video.removeAttribute('src');video.load();}result.replaceChildren();}
 function showItems(){select.replaceChildren();for(const [i,item] of items.entries()){const option=document.createElement('option');option.value=i;option.textContent=`${item.wordId?'词 '+item.wordId+' · ':''}${item.role==='video'?'动画':'图片'} · ${(item.bytes/1000).toFixed(1)} KB · ${item.path.split('/').at(-1)}`;select.append(option);}start.disabled=!items.length;}
 function controls(busy){if(disposed)return;scan.disabled=file.disabled=select.disabled=profile.disabled=recover.disabled=busy;start.disabled=busy||!items.length;pause.disabled=!busy||scanning||replacing;cancel.disabled=!busy||scanning;replace.disabled=busy||!latest;}
 function media(blob,label,role){const figure=document.createElement('figure'),caption=document.createElement('figcaption'),element=document.createElement(role==='video'?'video':'img'),url=URL.createObjectURL(blob);urls.push(url);element.src=url;element.style.cssText='max-width:100%;max-height:360px;object-fit:contain';if(role==='video'){element.controls=true;element.playsInline=true;element.muted=true;}else element.alt=label;caption.textContent=`${label} · ${(blob.size/1000).toFixed(1)} KB`;figure.append(caption,element);return figure;}
 const queue=new PreviewQueue({readSource:(item,signal)=>item.storage==='test'?Promise.resolve(testFile):waitForLocal(()=>readLocalSource(item,signal,{baseURL}),{signal,timeoutMs:15000}),encode:(blob,item,options)=>item.role==='video'?compressVideo(blob,{...options,videoProfile:profile.value}):compressImage(blob,options),onState:(state,progress)=>{if(disposed)return;if(state==='progress'){status.textContent=`正在本机处理 ${progress.completed||''}/${progress.total||''}；原文件未更改`;return;}const busy=state==='running'||state==='paused';controls(busy);pause.textContent=state==='paused'?'继续':'暂停';status.textContent=state==='paused'?'已暂停；回到前台后点击继续。':state==='running'?'正在本机处理；原文件未更改。':state==='cancelled'?'已取消；原文件未更改。':'预览处理结束。原文件未更改，尚未释放存储。';},onResult:async output=>{if(disposed)return;clearPreview();if(output.status!=='preview'){result.textContent=output.status==='already-small'?'原文件已经不超过 150 KB，无须压缩。':output.reason;return;}if(output.item.storage!=='test'&&output.profile.edge===512&&(output.item.role!=='video'||profile.value==='resolution512')){latest=output;replace.disabled=false;}result.append(media(output.source,'原文件',output.item.role),media(output.blob,'压缩预览',output.item.role));const note=document.createElement('p');note.textContent=`${output.width} × ${output.height}${output.duration?' · '+output.duration.toFixed(2)+' 秒 · '+output.profile.fps.toFixed(2)+' 帧/秒':''}。预计单文件减少 ${((output.source.size-output.blob.size)/1000).toFixed(1)} KB；这不是已释放空间。${output.warning||''}`;result.append(note);}});
 scan.onclick=()=>{if(disposed||queue.running||scanning||replacing)return;scanning=true;scanController=new AbortController();const signal=scanController.signal;controls(true);status.textContent='正在读取本机媒体清单…';scanWork=(async()=>{try{const found=await waitForLocal(()=>listLocalMedia(catalog,{baseURL,signal}),{signal,timeoutMs:15000});if(disposed||signal.aborted)return;items=found;testFile=null;file.value='';clearPreview();showItems();$('[data-count]').textContent=`找到 ${items.length} 项已保存媒体；逐项预览不会改动原文件。`;status.textContent=items.length?'请选择一项和档位后开始。':'此浏览器上下文未找到可列出的媒体。请从原来保存词书的同一个已安装 PWA 内进入；原文件不会因此被清除。';}catch(error){if(!disposed)status.textContent=error.message;}finally{scanning=false;scanController=null;controls(false);}})();return scanWork;};
 file.onchange=()=>{if(disposed||queue.running||scanning||replacing)return;testFile=file.files?.[0];if(!testFile)return;clearPreview();items=[{storage:'test',path:testFile.name,bytes:testFile.size,role:testFile.type==='video/mp4'?'video':'poster'}];showItems();status.textContent='测试文件只在本机读取，不会导入或修改书库。';};
 start.onclick=()=>{if(disposed||queue.running||scanning||replacing||!items.length)return;clearPreview();activeWork=queue.run([items[Number(select.value)]]).catch(error=>{if(!disposed)status.textContent=error.message;});return activeWork;};pause.onclick=()=>queue.paused?queue.resume():queue.pause();cancel.onclick=()=>{queue.cancel();mutationController?.abort();};
 replace.onclick=()=>{
  if(disposed||queue.running||scanning||replacing||!latest)return;
  const output=latest;replacing=true;mutationController=new AbortController();const signal=mutationController.signal;controls(true);
  window.dispatchEvent(new CustomEvent('gre-compression-busy',{detail:{busy:true}}));
  activeWork=(async()=>{let changed=false;try{
   status.textContent='正在核验原文件、临时空间与已打开的页面…';
   const source={path:output.item.path,sha256:output.item.sha256,bytes:output.item.bytes,wordId:output.item.wordId,role:output.item.role};
   const ext={'video/mp4':'mp4','image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[output.blob.type];
   const variant={kind:'owned-local-variant',source,wordId:source.wordId,role:source.role,path:`variants/${output.sha256}.${ext}`,sha256:output.sha256,bytes:output.blob.size,mime:output.blob.type,profile:{id:'sample02-local-v1',maxEdge:512,lossy:true,width:output.width,height:output.height,duration:output.duration,fps:output.profile.fps}};
   const selections=[{source,blob:output.blob,variant}],engine=await compressionStorage();
   const plan=await engine.plan(selections,{signal});if(signal.aborted||disposed)return;
   const p=plan.summary,label=source.role==='video'?'动画':source.role==='poster'?'插图':'静态图';
   const approved=window.confirm(`替换本机这一项原文件？\n词 ${source.wordId} · ${label}\n${source.path.split('/').at(-1)}\n原文件 ${source.bytes.toLocaleString()} 字节 → ${variant.bytes.toLocaleString()} 字节\n预计减少本机资源数据约 ${(p.estimatedSavingBytes/1048576).toFixed(2)} MB（不是已测得的手机空闲空间）。\n整理书包需要约 ${(p.temporaryBytes/1048576).toFixed(2)} MB 临时空间。\n\n这是有损压缩，画质会下降。本机原件删除后不能在此处撤销恢复；备份导出将保存压缩版本。未通过校验会保留原文件。确认后开始安全替换，最终提交后将完成必要收尾。`);
   if(!approved||signal.aborted||disposed){status.textContent='未替换，原文件保留。';return;}
   status.textContent='正在校验并整理本机书包；请保持此页在前台…';
   const done=await engine.replace(selections,{token:plan.token,irreversibleLossy:true,exactFilesConfirmed:true},{signal});changed=true;clearPreview();
   status.textContent=`已替换这一项并完成清理，资源数据减少约 ${(done.calculatedSavingBytes/1048576).toFixed(2)} MB。浏览器估算占用可能稍后更新。`;
  }catch(error){if(!disposed)status.textContent=`替换未完成：${/clients|Client generation/i.test(error.message)?'请关闭其他旧版词书页面，确认当前页面已更新后再试':error.message}。请勿手动清理书包；可点击「恢复上次未完成整理」。`;}
  finally{replacing=false;mutationController=null;controls(false);window.dispatchEvent(new CustomEvent('gre-compression-busy',{detail:{busy:false}}));if(changed){const retired={waits:[]};window.dispatchEvent(new CustomEvent('gre-compression-replaced',{detail:retired}));await Promise.allSettled(retired.waits);const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));await Promise.allSettled(detail.waits);}}
  })();return activeWork;
 };
 recover.onclick=()=>{
  if(disposed||queue.running||scanning||replacing)return;
  replacing=true;controls(true);window.dispatchEvent(new CustomEvent('gre-compression-busy',{detail:{busy:true}}));
  activeWork=(async()=>{try{
   status.textContent='正在检查上次已确认操作的整理记录…';
   if(!await compatibleCompressionClients())throw new Error('请关闭其他旧版词书页面，确认当前页面已更新后再试');
   const engine=await compressionStorage();if(disposed)return;await engine.recover();clearPreview();
   const retired={waits:[]};window.dispatchEvent(new CustomEvent('gre-compression-replaced',{detail:retired}));await Promise.allSettled(retired.waits);
   const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));await Promise.allSettled(detail.waits);
   if(!disposed)status.textContent='未完成整理已检查并恢复；没有开始新的压缩或替换。浏览器估算占用可能稍后更新。';
  }catch(error){if(!disposed)status.textContent=`恢复尚未完成：${error.message}。现有整理记录已保留，请勿手动清理书包。`;}
  finally{replacing=false;controls(false);window.dispatchEvent(new CustomEvent('gre-compression-busy',{detail:{busy:false}}));}
  })();return activeWork;
 };
 const visibility=()=>{if(document.hidden)queue.pause();};document.addEventListener('visibilitychange',visibility);
 return {queue,destroy(){disposed=true;scanController?.abort();mutationController?.abort();queue.cancel();clearPreview();items=[];testFile=null;file.value='';document.removeEventListener('visibilitychange',visibility);host.replaceChildren();return Promise.allSettled([scanWork,activeWork]);}};
}
