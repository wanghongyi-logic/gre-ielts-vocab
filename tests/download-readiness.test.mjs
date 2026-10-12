import test from 'node:test';
import assert from 'node:assert/strict';
import {downloadLessons} from '../gre-learning/offline-batch.js';
test('batch bridge forwards committed identity/generation separately from transfer counters',async()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'navigator'),updates=[];
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{controller:{postMessage(message,ports){assert.equal(message.type,'DOWNLOAD_LESSONS');assert.deepEqual(message.ids,[123]);assert.deepEqual(message.skipPaths,['gre-learning/story-media/imported.mp4']);ports[0].postMessage({type:'LESSON_DOWNLOAD_PROGRESS',completed:1,requested:1,readyId:123,generation:7});ports[0].postMessage({type:'LESSON_DOWNLOAD_DONE',completed:1,requested:1});ports[0].close();}}}}});
 try{const result=await downloadLessons([123],['gre-learning/story-media/imported.mp4'],{onProgress:value=>updates.push(value)});assert.equal(result.completed,1);assert.deepEqual(updates,[{phase:'batch',completed:1,total:1,readyId:123,generation:7}]);}
 finally{if(previous)Object.defineProperty(globalThis,'navigator',previous);else delete globalThis.navigator;}
});
