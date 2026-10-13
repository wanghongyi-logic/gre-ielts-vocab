// Byte-level offline integration checks. This is not browser or visual QA.
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {OFFLINE_EDITION} from '../gre-learning/offline-preferences.js';
import {isHostedMediaEntry,hostedMediaPaths} from '../gre-learning/hosted-media.js';
const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const shell=JSON.parse(await read('gre-learning/shell-manifest.json'));
const manifest=JSON.parse(await read('asset-manifest.json'));
const catalog=JSON.parse(await read('gre-learning/catalog.json'));
const sw=(await read('sw.js')).toString();
assert.equal(shell.build,OFFLINE_EDITION);
assert.equal(manifest.releaseBuild,shell.build);
assert.equal(sw.match(/const BUILD='([^']+)'/)[1],shell.build);
assert.equal((await read('gre-learning/update.js')).toString().match(/const build = '([^']+)'/)[1],shell.build);
assert.deepEqual(JSON.parse(sw.match(/const SHELL_ASSETS = (.*);\n/)[1]),shell.assets,'Service worker and shell metadata must agree exactly');
const required=['botanical-margin.js','botanical-margin.css','botanical-vine.webp','botanical-sage-wash.webp','book-paper-face.webp','frontmatter-turn.js','frontmatter-turn.css','settings-storybook.css','images/botanical-progress-bookmark.png'];
for(const path of required)assert.ok(shell.assets.some(item=>item.url==='gre-learning/'+path),path+' must be available offline');
const paths=new Set();
for(const ref of shell.assets){assert.ok(!paths.has(ref.url),'Duplicate shell path '+ref.url);paths.add(ref.url);assert.ok(!ref.url.includes('/story-media/'),'Do not precache lesson posters or videos');const bytes=await read(ref.url);assert.equal(bytes.length,ref.bytes);assert.equal(hash(bytes),ref.sha256);}
for(const ref of manifest.assets){const bytes=await read(ref.path);assert.equal(bytes.length,ref.bytes,ref.path);assert.equal(hash(bytes),ref.sha256,ref.path);}
const hosted=catalog.entries.filter(isHostedMediaEntry);
assert.equal(manifest.availablePairedLessons,hosted.length);
assert.equal(manifest.availableTextLessons,catalog.publishedCount);
const expectedMedia=new Set([...hostedMediaPaths(catalog)].map(path=>path.replace(/^story-media\//,'')));
const actualMedia=new Set(await readdir(new URL('gre-learning/story-media/',root)));
assert.deepEqual(actualMedia,expectedMedia,'Only explicitly hosted catalog media may be present');
const videos=[...actualMedia].filter(path=>path.endsWith('.mp4')).length;
const posters=[...actualMedia].filter(path=>/\.(png|webp|jpg|jpeg|avif)$/.test(path)).length;
assert.equal(videos,new Set(hosted.map(e=>e.storyMedia.video.url)).size);
assert.equal(posters,new Set(hosted.flatMap(e=>[e.storyMedia.poster,e.storyMedia.staticPoster].filter(Boolean).map(r=>r.url))).size);
const index=(await read('index.html')).toString();
assert.ok(index.indexOf('./gre-learning/frontmatter-turn.css')>index.indexOf('./gre-learning/storybook.css'));
assert.ok(index.indexOf('./gre-learning/frontmatter-turn.css')<index.indexOf("import('./gre-learning/app.js')"));
if(process.env.GRE_BASELINE_DIR){
 const baseline=new URL(process.env.GRE_BASELINE_DIR.replace(/\/$/,'')+'/', 'file://');
 const old=JSON.parse(await readFile(new URL('gre-learning/catalog.json',baseline)));
 assert.deepEqual(catalog.entries.slice(0,old.entries.length),old.entries,'Prior entries stay byte-equivalent objects');
 assert.deepEqual(catalog.units.slice(0,old.units.length),old.units,'Prior text chunks stay hash-bound');
 const control=(await read('gre-learning/offline-control.js')).toString(),packs=(await read('gre-learning/offline-packs.js')).toString();
 assert.match(control,/if\(state.paused\|\|state.generation!==generation\)throw changed/);
 assert.match(packs,/export async function clearSavedWords/);assert.match(packs,/await verifyRetainedSlices\(stored,files\)/);
 const preferences=(await read('gre-learning/offline-preferences.js')).toString().replace(/OFFLINE_EDITION='[^']+'/,"OFFLINE_EDITION='edition'");
 assert.equal(preferences,(await readFile(new URL('gre-learning/offline-preferences.js',baseline))).toString().replace(/OFFLINE_EDITION='[^']+'/ ,"OFFLINE_EDITION='edition'"),'Preference logic stays byte-identical apart from edition');
 const priorMedia=await readdir(new URL('gre-learning/story-media/',baseline));
 for(const name of priorMedia)assert.deepEqual(await read('gre-learning/story-media/'+name),await readFile(new URL('gre-learning/story-media/'+name,baseline)),'Existing hosted media remains byte-identical');
}
console.log(JSON.stringify({passed:true,build:shell.build,shellAssets:shell.assets.length,manifestAssets:manifest.assets.length,hostedPosters:posters,hostedVideos:videos,availableTextLessons:catalog.publishedCount,candidatePreview:catalog.preview,browserVisualQA:'not run'},null,2));
