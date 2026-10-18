import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {createSavedSnapshot,savedSnapshotKey} from '../gre-learning/offline-snapshot.js';
const catalog={entries:[1,2].map(number=>({number,storyMedia:{poster:{url:number+'.webp',sha256:String(number),bytes:1}}}))};
function fixture(){const data=new Map(),storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};return {data,storage,snapshot:createSavedSnapshot(catalog,storage)};}
const source=await readFile(new URL('../gre-learning/offline-manager.js',import.meta.url),'utf8');
function subscription(snapshot){let listener,invalidations=0;const ctx={savedSnapshot:snapshot,savedGeneration:snapshot.generation(),refreshEpoch:0,controller:null,queueSavedRefresh(){},paintSavedPending(){invalidations++;},sharedControl:{subscribe:fn=>listener=fn,state:async()=>{}},window:{dispatchEvent(){}},CustomEvent:class{constructor(type,options){this.detail=options.detail;}},Promise,refresh:async()=>{}};const code=source.slice(source.indexOf(' sharedControl.subscribe('),source.indexOf('\n let readinessTimer;'));vm.runInNewContext(code,ctx);return {emit:state=>listener(state),get invalidations(){return invalidations;}};}
test('reopen after range deletion retains only matching verified generation',()=>{
 const f=fixture();f.snapshot.save([2],7);const reopened=createSavedSnapshot(catalog,f.storage),h=subscription(reopened);h.emit({initial:true,generation:7,phase:'selective-cleared',paused:false});assert.equal(h.invalidations,0);assert.deepEqual(reopened.restore(),[2]);
 h.emit({initial:false,generation:8,phase:'selective-cleared',paused:false,source:'external'});assert.equal(h.invalidations,1);assert.equal(reopened.restore(),null);
});
test('legacy and stale pre-delete snapshots cannot claim current generation',()=>{
 for(const generation of [undefined,6]){const f=fixture();f.snapshot.save([1,2],generation);const h=subscription(f.snapshot);h.emit({initial:true,generation:7,phase:'selective-cleared',paused:false});assert.equal(h.invalidations,1);assert.equal(f.snapshot.restore(),null);}
});
test('reopen after verified download restores matching snapshot; active deletion always invalidates',()=>{
 const f=fixture();f.snapshot.save([1,2],7);const reopened=createSavedSnapshot(catalog,f.storage);assert.deepEqual(reopened.restore(),[1,2]);assert.equal(reopened.matchesGeneration({generation:7,phase:'active'}),true);assert.equal(reopened.matchesGeneration({generation:7,phase:'selective-clearing'}),false);const h=subscription(reopened);h.emit({initial:true,generation:7,phase:'selective-clearing',paused:false});assert.equal(h.invalidations,1);
});
test('a committed receipt cannot overwrite unknown inventory with a partial snapshot',()=>{
 const start=source.indexOf('   if(savedReadyIds===null)'),end=source.indexOf('\n  }\n }};}',start),block=source.slice(start,end);let writes=0,queued=0;
 const ctx={savedReadyIds:null,savedGeneration:null,queueSavedRefresh:()=>queued++,p:{readyId:1,generation:4},refreshEpoch:0,paintSavedTotals:()=>writes++,refreshDownloads(){}};
 vm.runInNewContext('(function(){'+block+'})()',ctx);assert.equal(queued,1);assert.equal(writes,0);assert.equal(ctx.savedReadyIds,null);
 ctx.savedReadyIds=[2];vm.runInNewContext('(function(){'+block+'})()',ctx);assert.equal(writes,1);assert.deepEqual([...ctx.savedReadyIds],[2,1]);assert.equal(ctx.savedGeneration,4);
});
