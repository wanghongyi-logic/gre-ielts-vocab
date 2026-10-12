// Byte-level offline integration checks. This is not browser or visual QA.
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const shell=JSON.parse(await read('gre-learning/shell-manifest.json'));
const manifest=JSON.parse(await read('asset-manifest.json'));
const catalog=JSON.parse(await read('gre-learning/catalog.json'));
const sw=(await read('sw.js')).toString();
assert.equal(shell.build,'166-offline200-v16');
assert.equal(manifest.releaseBuild,shell.build);
assert.match((await read('gre-learning/offline-preferences.js')).toString(),/OFFLINE_EDITION='166-offline200-v16'/);
assert.match(sw,/const BUILD='166-offline200-v16'/);
assert.match((await read('gre-learning/update.js')).toString(),/const build = '166-offline200-v16'/);
assert.deepEqual(JSON.parse(sw.match(/const SHELL_ASSETS = (.*);\n/)[1]),shell.assets,'Service worker and shell metadata must agree exactly');
const required=['frontmatter-turn.js','frontmatter-turn.css','settings-storybook.css','images/botanical-progress-bookmark.png'];
for(const path of required)assert.ok(shell.assets.some(item=>item.url==='gre-learning/'+path),path+' must be available offline');
const paths=new Set();
for(const ref of shell.assets){assert.ok(!paths.has(ref.url),'Duplicate shell path '+ref.url);paths.add(ref.url);assert.ok(!ref.url.includes('/story-media/'),'Do not precache lesson posters or videos');const bytes=await read(ref.url);assert.equal(bytes.length,ref.bytes);assert.equal(hash(bytes),ref.sha256);}
for(const ref of manifest.assets){const bytes=await read(ref.path);assert.equal(bytes.length,ref.bytes,ref.path);assert.equal(hash(bytes),ref.sha256,ref.path);}
assert.equal(manifest.availablePairedLessons,210);
assert.equal(manifest.availableTextLessons,210);
const expectedMedia=new Set(catalog.entries.flatMap(entry=>['poster','video','staticPoster'].map(role=>entry.storyMedia?.[role]?.url).filter(Boolean)).map(path=>path.replace(/^story-media\//,'')));
const actualMedia=new Set(await readdir(new URL('gre-learning/story-media/',root)));
assert.deepEqual(actualMedia,expectedMedia,'Exactly the current approved lesson media may be hosted');
assert.equal([...actualMedia].filter(path=>path.endsWith('.mp4')).length,210);
assert.equal([...actualMedia].filter(path=>/\.(png|webp|jpg|jpeg|avif)$/.test(path)).length,351);
const index=(await read('index.html')).toString();
assert.ok(index.indexOf('./gre-learning/frontmatter-turn.css')>index.indexOf('./gre-learning/storybook.css'));
assert.ok(index.indexOf('./gre-learning/frontmatter-turn.css')<index.indexOf("import('./gre-learning/app.js')"));
if(process.env.GRE_BASELINE_DIR){
 const baseline=new URL(process.env.GRE_BASELINE_DIR.replace(/\/$/,'')+'/', 'file://');
 for(const path of ['gre-learning/catalog.json','gre-learning/offline-control.js','gre-learning/offline-packs.js'])assert.deepEqual(await read(path),await readFile(new URL(path,baseline)),path+' remains byte-identical');
 const preferences=(await read('gre-learning/offline-preferences.js')).toString().replace("OFFLINE_EDITION='166-offline200-v16'","OFFLINE_EDITION='166-offline200-v15'");
 assert.equal(preferences,(await readFile(new URL('gre-learning/offline-preferences.js',baseline))).toString(),'Preference logic stays byte-identical apart from the edition stamp');
 for(const name of await readdir(new URL('gre-learning/story-media/',baseline)))assert.deepEqual(await read('gre-learning/story-media/'+name),await readFile(new URL('gre-learning/story-media/'+name,baseline)),'Existing lesson media remains byte-identical');
}
console.log(JSON.stringify({passed:true,build:shell.build,shellAssets:shell.assets.length,manifestAssets:manifest.assets.length,hostedPosters:351,hostedVideos:210,availableTextLessons:210,newArtworkBytes:(await read('gre-learning/images/botanical-progress-bookmark.png')).length,browserVisualQA:'not run'},null,2));
