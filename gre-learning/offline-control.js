// One durable generation per application scope. All media commits and clears share a lock.
const MEDIA_CONTROL_CACHE='gre-media-control-v1',mediaControlInstances=new Map();
export function createMediaControl(scopeURL){
 const scope=new URL(scopeURL).href;if(mediaControlInstances.has(scope))return mediaControlInstances.get(scope);
 const key=new URL('__gre_media_control__',scope).href,lockName='gre-media-write:'+scope,listeners=new Set();
 let memory={generation:0,paused:false,phase:'active'},announced='',queue=Promise.resolve();
 const channel=typeof globalThis.BroadcastChannel==='function'?new BroadcastChannel(lockName):null;channel?.unref?.();
 async function read(){try{const cache=await globalThis.caches?.open(MEDIA_CONTROL_CACHE),response=await cache?.match?.(key);if(response){const state=await response.json();if(Number.isSafeInteger(state.generation)&&state.generation>=0&&typeof state.paused==='boolean')memory=state;}}catch{}return {...memory};}
 async function write(state){const cache=await globalThis.caches?.open(MEDIA_CONTROL_CACHE);if(cache?.put)await cache.put(key,new Response(JSON.stringify(state),{headers:{'Content-Type':'application/json'}}));memory={...state};}
 function announce(state,source='local'){const stamp=state.generation+'|'+state.paused+'|'+state.phase;if(stamp===announced)return;const initial=announced==='';announced=stamp;for(const listener of listeners)listener({...state,source,initial});if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('gre-media-control-change',{detail:{...state,source,initial}}));}
 function publish(state){announce(state);channel?.postMessage({scope});}
 async function lock(action,signal){if(globalThis.navigator?.locks?.request)return signal?navigator.locks.request(lockName,{signal},action):navigator.locks.request(lockName,action);const run=queue.then(action,action);queue=run.catch(()=>{});return run;}
 const changed=()=>Object.assign(new Error('Saved media changed in another page'),{name:'AbortError'});
 if(channel)channel.onmessage=async event=>{if(event.data?.scope===scope)announce(await read(),'external');};
 const api={
  async state(){const state=await read();announce(state,'read');return state;},
  async ticket(){const state=await api.state();return state.paused?null:state.generation;},
  async guard(generation,action){return lock(async()=>{const state=await read();announce(state,'read');if(state.paused||state.generation!==generation)throw changed();return action();});},
  async clear(action){return lock(async()=>{const previous=await read(),state={...previous,generation:previous.generation+1,paused:true,phase:'clearing'};await write(state);publish(state);await action();const complete={...state,phase:'cleared'};await write(complete);publish(complete);return complete;});},
  async automaticAllowed(url){const state=await read();return !state.paused&&!(state.blockedAutoPaths||[]).includes(new URL(url,scope).href);},
  async selectiveClear(paths,action,{rollbackOnError=()=>false}={}){return lock(async()=>{
   const previous=await read(),state={...previous,generation:previous.generation+1,phase:'selective-clearing',blockedAutoPaths:[...new Set([...(previous.blockedAutoPaths||[]),...paths.map(path=>new URL(path,scope).href)])]};
   await write(state);publish(state);let rollback=false;
   try{return await action();}catch(error){rollback=rollbackOnError();throw error;}
   finally{
    // A cancelled/failed preparation did not delete saved media. Restore its
    // automatic-loading policy while still invalidating stale writer tickets.
    const complete={...state,...(rollback?{blockedAutoPaths:previous.blockedAutoPaths||[]}:{ }),generation:state.generation+1,phase:'selective-cleared'};
    await write(complete);publish(complete);
   }
  });},
  async resume({signal}={}){return lock(async()=>{if(signal?.aborted)throw changed();const previous=await read();if(signal?.aborted)throw changed();if(!previous.paused)return previous;const state={...previous,generation:previous.generation+1,paused:false,phase:'active'};await write(state);publish(state);return state;},signal);},
  subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
 };
 mediaControlInstances.set(scope,api);return api;
}

