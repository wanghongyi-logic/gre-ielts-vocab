#!/usr/bin/env python3
"""Cross-check final staged native JSON, reviewer addendum, configs and catalog."""
import argparse,json,importlib.util
from pathlib import Path
HERE=Path(__file__).resolve().parent;s=importlib.util.spec_from_file_location('g',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g);p=argparse.ArgumentParser();p.add_argument('--root',required=True,type=Path);a=p.parse_args();root=a.root.resolve();tests=[]
def test(name,passed):tests.append({'case':name,'passed':bool(passed)})
bfile=HERE/'evidence/core003-final-native.json';bindings=json.loads(bfile.read_text());registry=json.loads((HERE/'native-presentation-binding.json').read_text());digest=g.digest(bfile);test('exact_accepted_native_source',digest==registry['sourceBindingsSha256']);catalog=json.loads((root/'gre-learning/catalog.json').read_text())
for e in bindings['entries']:
 n=e['number'];sm=e['storyMedia'];c=g.storage.expand(json.loads((HERE/f'configs/{n}.json').read_text()));review=json.loads((root/c['reviewEvidence']).read_text());evidence=review['nativePresentationEvidence'];path=root/evidence['path'];test(str(n)+'_independent_native_addendum',g.digest(path)==evidence['sha256']and digest in path.read_text());actual=next(x['storyMedia']for x in catalog['entries']if x['number']==n);test(str(n)+'_complete_storymedia_matches_accepted_native',actual==sm);expected=g.canonical(g.native_metadata(sm));test(str(n)+'_config_registry_review_same_native',c['nativePresentationSha256']==registry['scenes'][str(n)]['nativePresentationSha256']==review['nativePresentationSha256']==expected)
out={'passed':all(t['passed']for t in tests),'tests':tests};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed']else 1)
