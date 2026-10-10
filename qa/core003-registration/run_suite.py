#!/usr/bin/env python3
"""Portable exact30 clean-checkout suite. No live publication claim."""
import argparse,json,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--root',required=True,type=Path);p.add_argument('--report',type=Path);a=p.parse_args();root=a.root.resolve();qa=root/'qa'
jobs=[('inherited_approval_identity',HERE/'check_inherited_approval.py',['--root',str(root)]),('core003_policy',HERE/'test_policy.py',[]),('core003_storage',HERE/'test_storage.py',[]),('core003_body_components',HERE/'test_body_components.py',[]),*[(f'core003_actual_scene_mutations_{n}',HERE/'test_scene_mutations.py',['--root',str(root),'--assets',str(n)])for n in [1287,2207,516,3537,419]],('core003_native_binding',HERE/'test_native_binding.py',['--root',str(root)]),('core003_runtime_separation',HERE/'test_runtime_separation.py',['--root',str(root)]),('all30_scene_gate',HERE/'check_batch.py',['--root',str(root)])]
results=[]
for name,script,args in jobs:
 q=subprocess.run([sys.executable,str(script),*args],capture_output=True,text=True)
 try:detail=json.loads(q.stdout)
 except json.JSONDecodeError:detail={'stdout':q.stdout,'stderr':q.stderr}
 results.append({'suite':name,'passed':q.returncode==0,'detail':detail})
 if q.returncode:print(f'{name}: FAIL',file=sys.stderr)
out={'passed':all(r['passed']for r in results),'root':str(root),'inheritedTestsReused':371,'inheritedTestsRerun':False,'results':results};text=json.dumps(out,indent=2)+'\n'
if a.report:a.report.write_text(text)
print(text);raise SystemExit(0 if out['passed'] else 1)
