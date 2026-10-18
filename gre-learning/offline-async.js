// A stalled browser read must never keep reader/settings controls busy forever.
// This settles the caller, not an underlying write: writes retain their commit guards.
export function waitForLocal(work,{signal,timeoutMs=6000,message='本机存储读取超时，请重试',onTimeout}={}){
 return new Promise((resolve,reject)=>{
  let done=false,timer;
  const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve(value);};
  const abort=()=>finish(new DOMException('Cancelled','AbortError'));
  if(signal?.aborted){abort();return;}signal?.addEventListener('abort',abort,{once:true});
  if(timeoutMs>0)timer=setTimeout(()=>{try{onTimeout?.();}catch{}finish(Object.assign(new Error(message),{name:'TimeoutError'}));},timeoutMs);
  try{Promise.resolve(typeof work==='function'?work():work).then(value=>finish(null,value),error=>finish(error));}catch(error){finish(error);}
 });
}

// A fast local-read deadline starts network fallback; it does not discard a
// still-pending valid offline copy. Only verified, non-missing results compete.
export async function preferVerifiedLocal(localWork,networkWork,{signal,localTimeoutMs=1200,totalTimeoutMs=6500}={}){
 const start=Date.now(),network=new AbortController();
 if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
 const local=Promise.resolve().then(localWork);
 try{
  try{return await waitForLocal(local,{signal,timeoutMs:Math.min(localTimeoutMs,totalTimeoutMs)});}
  catch(error){if(signal?.aborted)throw error;}
  const remaining=Math.max(1,totalTimeoutMs-(Date.now()-start));
  return await waitForLocal(Promise.any([local,Promise.resolve().then(()=>networkWork(network.signal))]),{signal,timeoutMs:remaining});
 }catch(error){throw error instanceof AggregateError?error.errors.at(-1):error;}
 finally{network.abort();}
}
