import test from 'node:test';
import assert from 'node:assert/strict';
import {copyReadingScrollState,moveSwipe,startSwipe} from '../gre-learning/swipe.js';

const root=panes=>({querySelectorAll:selector=>selector==='.reading-scroll'?panes:[]});

test('a paper impression retains every independent reading-pane offset',()=>{
 const source=root([{scrollTop:486,scrollLeft:0},{scrollTop:91,scrollLeft:12}]);
 // A real clone starts at zero even when its source pane is scrolled.
 const panes=[{scrollTop:0,scrollLeft:0},{scrollTop:0,scrollLeft:0}];
 copyReadingScrollState(source,root(panes));
 assert.deepEqual(panes,[{scrollTop:486,scrollLeft:0},{scrollTop:91,scrollLeft:12}]);
});

test('ordinary page layouts and missing matching panes remain untouched',()=>{
 const pane={scrollTop:17,scrollLeft:3};
 assert.doesNotThrow(()=>copyReadingScrollState(root([]),root([])));
 copyReadingScrollState(root([]),root([pane]));
 assert.deepEqual(pane,{scrollTop:17,scrollLeft:3});
});

test('right-pane vertical scrolling never arms a turn, even after horizontal drift',()=>{
 let gesture=startSwipe({x:900,y:400,width:1280,previous:true,next:true});
 gesture=moveSwipe(gesture,{x:898,y:370,time:20});
 assert.equal(gesture.axis,'vertical');assert.equal(gesture.offset,0);assert.equal(gesture.ready,false);
 gesture=moveSwipe(gesture,{x:650,y:180,time:80});
 assert.equal(gesture.axis,'vertical');assert.equal(gesture.offset,0);assert.equal(gesture.ready,false);
});

test('deliberate horizontal turns retain their distance threshold and direction',()=>{
 const start=startSwipe({x:950,y:400,width:1280,previous:true,next:true});
 const turn=moveSwipe(start,{x:790,y:397,time:80});
 assert.equal(turn.axis,'horizontal');assert.equal(turn.direction,'next');assert.equal(turn.ready,true);
 const drift=moveSwipe(turn,{x:790,y:230,time:100});
 assert.equal(drift.ready,false,'moving vertically before release unarms the turn');
});
