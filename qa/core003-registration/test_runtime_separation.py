#!/usr/bin/env python3
"""Verify QA witnesses are not shell, lesson or media prefetch dependencies."""
import argparse,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--root',required=True,type=Path);a=p.parse_args();root=a.root.resolve();tests=[]
def test(name,passed,detail=None):tests.append({'case':name,'passed':bool(passed),'detail':detail})
def is_qa(url):return bool(re.search(r'(^|/)qa(/|$)',url.split('?')[0]))
shell=json.loads((root/'gre-learning/shell-manifest.json').read_text());refs=shell['assets'];test('shell_has_no_qa_configs',bool(refs)and not any(is_qa(v['url'])for v in refs),{'assets':len(refs)})
sw=(root/'sw.js').read_text();match=re.search(r'const SHELL_ASSETS\s*=\s*(\[.*?\]);',sw,re.S);swrefs=json.loads(match[1])if match else[];test('service_worker_prefetch_has_no_qa_configs',bool(swrefs)and not any(is_qa(v['url'])for v in swrefs),{'assets':len(swrefs)})
cat=json.loads((root/'gre-learning/catalog.json').read_text());urls=[u['url']for u in cat['units']]
for e in cat['entries']:
 for k in ['video','poster']:
  if e.get('storyMedia',{}).get(k):urls.append(e['storyMedia'][k]['url'])
test('lesson_and_media_refs_exclude_qa',bool(urls)and not any(is_qa(u)for u in urls),{'references':len(urls)})
flagged=[]
for p in [root/'index.html',*sorted((root/'gre-learning').glob('*.js'))]:
 text=p.read_text()
 if re.search(r'''["'](?:\.\./|\./|/)?qa/''',text):flagged.append(str(p.relative_to(root)))
test('runtime_entrypoints_do_not_reference_qa',not flagged,flagged)
out={'passed':all(t['passed']for t in tests),'scope':'Static declared shell/lesson/media dependencies and runtime entrypoints, not a full network trace. QA files may still exist as repository artifacts.','tests':tests};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed']else 1)
