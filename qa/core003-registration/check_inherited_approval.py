#!/usr/bin/env python3
"""Reuse accepted371 tests only after proving old code/config/media identity.

The old tests are not executed here. All30 scenes are still checked freshly by
check_batch.py, using the untouched old dispatch modules for the previous25.
"""
import argparse,json,hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent;p=argparse.ArgumentParser();p.add_argument('--root',required=True,type=Path);a=p.parse_args();root=a.root.resolve();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();tests=[]
def test(name,passed,detail=None):tests.append({'case':name,'passed':bool(passed),'detail':detail})
def contained(relative):
 p=(root/relative).resolve()
 if not p.is_relative_to(root):raise ValueError('Outside checkout')
 return p
mfile=HERE/'evidence/core002-manifest.json';sfile=HERE/'evidence/core002-approved-suite.json';provenance=json.loads((HERE/'evidence/core002-portable-provenance.json').read_text());m=json.loads(mfile.read_text());suite=json.loads(sfile.read_text())
test('accepted_prior_manifest_portable_derivative',sha(mfile)=='af64bd2b7f33a909531fe1d75e9fa5f137a8a373eeaac0053337c20fffa75f34'==provenance['files'][mfile.name]['portableDerivativeSha256'] and provenance['files'][mfile.name]['originalAcceptedSha256']=='6b83929e6e7d55134740a6f5ef75a2af3853606144537b91544f10c55e853e1f')
test('accepted_prior_suite_portable_derivative',sha(sfile)=='689b76b940b04256aba06c7f9616af1203113b995337511a65c0292254021f0a'==provenance['files'][sfile.name]['portableDerivativeSha256'] and provenance['files'][sfile.name]['originalAcceptedSha256']==m['cleanCheckoutSuite']['sha256']=='a8c6cd6af637d92b6de4905279ffbc0d3cc64b80c43b87efc5c75a8d4834ceff')
counts={r['suite']:len(r['detail'].get('tests',[]))for r in suite['results']if r['suite']!='all25_scene_gate'};test('accepted_prior_371_approval',suite['passed']and all(r['passed']for r in suite['results'])and counts==m['tests']and sum(counts.values())==371)
bad=[];media=[]
for f in m['files']:
 p=contained(f['repositoryPath'])
 if not p.exists()or sha(p)!=f['sha256']:bad.append(f['repositoryPath'])
 if '/configs/'in f['repositoryPath']and p.exists():
  c=json.loads(p.read_text())
  for key in ['video','poster']:
   path=contained(c[key]);media.append({'asset':c['asset'],'kind':key,'same':path.exists()and sha(path)==c[key+'Sha256']})
test('all85_prior_guard_files_identical',len(m['files'])==85 and not bad,bad);test('all50_prior_media_files_identical',len(media)==50 and len({v['asset']for v in media})==25 and all(v['same']for v in media),[v for v in media if not v['same']])
out={'passed':all(t['passed']for t in tests),'tests':tests,'reusedApproval':{'priorTests':371,'counts':counts,'sourceSuiteSha256':provenance['files'][sfile.name]['originalAcceptedSha256'],'portableSuiteSha256':sha(sfile),'oldTestsRerun':False,'basis':'Accepted full-content portable report derivative (location fields only removed) plus identity checks on all85 prior code/config/review files and all50 prior media files. New helpers do not alter inherited checker modules.'}};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed']else 1)
