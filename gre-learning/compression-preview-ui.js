import {mountCompressionBatch} from './compression-batch-ui.js';
import {listLocalMedia} from './compression-local-source.js';
// Same-origin inline settings entry. No stand-alone file/test UI.
export function mountCompressionPreview(host,catalog,{baseURL=new URL('../',import.meta.url),isBusy=()=>false}={}){
 host.replaceChildren();
 const retire=async()=>{const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-compression-replaced',{detail}));await Promise.all(detail.waits);};
 return mountCompressionBatch(host,catalog,{baseURL,isBusy,
  getItems:({wordIds,signal})=>{const selected=new Set(wordIds);return listLocalMedia({...catalog,entries:catalog.entries.filter(entry=>selected.has(entry.number))},{baseURL,signal});},
  onBusy:busy=>window.dispatchEvent(new CustomEvent('gre-compression-busy',{detail:{busy}})),
  onRetire:retire,onChanged:async()=>{const detail={waits:[]};window.dispatchEvent(new CustomEvent('gre-library-updated',{detail}));await Promise.allSettled(detail.waits);}
 });
}
