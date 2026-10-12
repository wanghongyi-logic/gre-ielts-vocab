from pathlib import Path
import json,hashlib,re
root=Path(__file__).resolve().parent.parent
p=root/'gre-learning/shell-manifest.json';data=json.loads(p.read_text());data['build']='166-offline200-v19'
assert "OFFLINE_EDITION='"+data['build']+"'" in (root/'gre-learning/offline-preferences.js').read_text(), 'Settings readiness edition must match shell build'
paths=[x['url'] for x in data['assets']]
for name in ['offline-zip.js','offline-packs.js','offline-copy-worker.js','offline-manager.js','offline-preferences.js','offline-batch.js','offline-control.js','offline-releases.js','offline-releases.css','settings-storybook.css','frontmatter-turn.js','frontmatter-turn.css','images/botanical-progress-bookmark.png','images/bookbinding-inlay.webp']:
 path='gre-learning/'+name
 if path not in paths:paths.append(path)
# Cache all small lesson text files, never pre-cache all video assets.
catalog=json.loads((root/'gre-learning/catalog.json').read_text())
for unit in catalog['units']:
 path='gre-learning/'+unit['url']
 if path not in paths:paths.append(path)
data['assets']=[{'url':path,'sha256':hashlib.sha256((root/path).read_bytes()).hexdigest(),'bytes':(root/path).stat().st_size} for path in paths]
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
sw=root/'sw.js';s=sw.read_text();control=(root/'gre-learning/offline-control.js').read_text().replace('export function ','function ');block='// BEGIN GENERATED MEDIA CONTROL\n'+control+'// END GENERATED MEDIA CONTROL\n'
if '// BEGIN GENERATED MEDIA CONTROL' in s:s=re.sub(r'// BEGIN GENERATED MEDIA CONTROL\n.*?// END GENERATED MEDIA CONTROL\n',lambda _:block,s,flags=re.S)
else:s=block+s
s=re.sub(r"const BUILD='[^']+';","const BUILD='"+data['build']+"';",s);s=re.sub(r'const SHELL_ASSETS = .*?;\n', 'const SHELL_ASSETS = '+json.dumps(data['assets'],separators=(',',':'))+';\n',s,count=1);sw.write_text(s)
# Catalog media references survive optional removal of hosted videos and illustrations.
import gzip,datetime
p=root/'asset-manifest.json';m=json.loads(p.read_text());m['releaseBuild']=data['build'];m['generatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();m['readyAssetContract']='text+poster+video';m['availablePairedLessons']=catalog['publishedCount'];m['availableTextLessons']=catalog['publishedCount'];m['offlinePackageWords']=200
old={a['path']:a for a in m['assets']}
for entry in catalog['entries']:
 for ref in [entry.get('storyMedia',{}).get(role) for role in ['video','poster','staticPoster']]:
  if ref:old.setdefault('gre-learning/'+ref['url'],{'path':'gre-learning/'+ref['url']})
for path in paths:old.setdefault(path,{'path':path})
for path,a in list(old.items()):
 if not (root/path).is_file() and path.startswith('gre-learning/story-media/') and path.endswith(('.mp4','.webm','.png','.webp','.jpg','.jpeg','.avif','.gif')):
  del old[path];continue
 b=(root/path).read_bytes();h=hashlib.sha256(b).hexdigest();gz=a.get('gzipBytes') if a.get('sha256')==h else len(gzip.compress(b,mtime=0));a.update(loading='shell' if path in paths else 'on-demand',bytes=len(b),sha256=h,gzipBytes=gz)
m['availablePairedLessons']=sum(all((root/'gre-learning'/ref['url']).is_file() for ref in [entry.get('storyMedia',{}).get(role) for role in ['video','poster','staticPoster']] if ref) for entry in catalog['entries'])
m['assets']=list(old.values());m['totals']={k:sum(a[k] for a in m['assets']) for k in ['bytes','gzipBytes']};p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
