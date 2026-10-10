#!/usr/bin/env python3
"""Portable clean-checkout suite. Reports observed outcomes, never publication."""
import argparse,json,subprocess,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--root',required=True,type=Path);p.add_argument('--report',type=Path);a=p.parse_args();root=a.root.resolve();qa=root/'qa'
jobs=[('legacy',qa/'registration/test_guard.py',[]),('legacy_phase',qa/'registration/test_phase_guard.py',[]),('prior180',qa/'batch-registration/test_batch.py',[]),('prior185',qa/'batch185-registration/test_batch.py',[]),('core001',qa/'core001-registration/test_batch.py',[]),('core001_rig',qa/'core001-registration/test_rig.py',[]),('core002_synthetic',HERE/'test_cel_contact.py',[]),('core002_policy',HERE/'test_policy.py',[]),('core002_actual_scene_mutations',HERE/'test_scene_mutations.py',['--root',str(root)]),('all25_scene_gate',HERE/'check_batch.py',['--root',str(root)])]
results=[]
for name,script,args in jobs:
 q=subprocess.run([sys.executable,str(script),*args],capture_output=True,text=True)
 try:detail=json.loads(q.stdout)
 except json.JSONDecodeError:detail={'stdout':q.stdout,'stderr':q.stderr}
 results.append({'suite':name,'passed':q.returncode==0,'detail':detail})
 if q.returncode:print(f'{name}: FAIL',file=sys.stderr)
out={'passed':all(r['passed']for r in results),'root':str(root),'results':results};text=json.dumps(out,indent=2)+'\n'
if a.report:a.report.write_text(text)
print(text);raise SystemExit(0 if out['passed'] else 1)
