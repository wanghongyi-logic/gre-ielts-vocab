import {OFFLINE_EDITION} from './offline-preferences.js';
// Only this upgraded page answers the SW's per-operation capability challenge.
let installed=false;
export function installVariantClientGate(){
 if(installed)return;installed=true;
 navigator.serviceWorker?.addEventListener('message',event=>{
  if(event.data?.type==='GRE_VARIANT_IMPORT_CAPABILITY')event.ports?.[0]?.postMessage({build:OFFLINE_EDITION,variants:1});
 });
}
export async function compatibleVariantClients(){
 const target=navigator.serviceWorker?.controller;if(!target)return false;
 return new Promise(resolve=>{const channel=new MessageChannel();let done=false;const finish=value=>{if(done)return;done=true;clearTimeout(timer);channel.port1.close();resolve(value);};const timer=setTimeout(()=>finish(false),7000);channel.port1.onmessage=({data})=>finish(navigator.serviceWorker.controller===target&&data?.compatible===true&&data.build===OFFLINE_EDITION);try{target.postMessage({type:'GET_VARIANT_IMPORT_CLIENTS'},[channel.port2]);}catch{finish(false);}});
}
