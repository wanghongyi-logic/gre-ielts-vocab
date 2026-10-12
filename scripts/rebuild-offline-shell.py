from pathlib import Path
import json,hashlib,re
root=Path(__file__).resolve().parent.parent
p=root/'gre-learning/shell-manifest.json';data=json.loads(p.read_text());data['build']='166-offline200-v8'
paths=[x['url'] for x in data['assets']]
for name in ['offline-zip.js','offline-packs.js','offline-copy-worker.js','offline-manager.js','offline-preferences.js','offline-batch.js']:
 path='gre-learning/'+name
 if path not in paths:paths.append(path)
# Cache all small lesson text files, never pre-cache all video assets.
catalog=json.loads((root/'gre-learning/catalog.json').read_text())
for unit in catalog['units']:
 path='gre-learning/'+unit['url']
 if path not in paths:paths.append(path)
data['assets']=[{'url':path,'sha256':hashlib.sha256((root/path).read_bytes()).hexdigest(),'bytes':(root/path).stat().st_size} for path in paths]
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
sw=root/'sw.js';s=sw.read_text();s=re.sub(r"const BUILD='[^']+';","const BUILD='"+data['build']+"';",s);s=re.sub(r'const SHELL_ASSETS = .*?;\n', 'const SHELL_ASSETS = '+json.dumps(data['assets'],separators=(',',':'))+';\n',s,count=1);sw.write_text(s)
# Catalog media references survive optional removal of hosted video files.
import gzip,datetime
p=root/'asset-manifest.json';m=json.loads(p.read_text());m['releaseBuild']=data['build'];m['generatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();m['readyAssetContract']='text+poster+video';m['availablePairedLessons']=catalog['publishedCount'];m['availableTextLessons']=catalog['publishedCount'];m['offlinePackageWords']=200
old={a['path']:a for a in m['assets']}
for entry in catalog['entries']:
 for ref in [entry.get('storyMedia',{}).get(role) for role in ['video','poster','staticPoster']]:
  if ref:old.setdefault('gre-learning/'+ref['url'],{'path':'gre-learning/'+ref['url']})
for path in paths:old.setdefault(path,{'path':path})
for path,a in list(old.items()):
 if not (root/path).is_file() and path.endswith(('.mp4','.webm')):
  del old[path];continue
 b=(root/path).read_bytes();h=hashlib.sha256(b).hexdigest();gz=a.get('gzipBytes') if a.get('sha256')==h else len(gzip.compress(b,mtime=0));a.update(loading='shell' if path in paths else 'on-demand',bytes=len(b),sha256=h,gzipBytes=gz)
m['assets']=list(old.values());m['totals']={k:sum(a[k] for a in m['assets']) for k in ['bytes','gzipBytes']};p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
