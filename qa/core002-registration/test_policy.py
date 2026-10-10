#!/usr/bin/env python3
import copy,importlib.util,json,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('g',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
results=[]
for case in ['positive','reordered','duplicate','unknown','ordinal','ordinal_bool','unsafe','missing','wrong_mode']:
 cat={'learningRelease':{'sampleMode':'storybook-reviewed-order','batchSize':5,'approvedIds':g.ORDER.copy()},'entries':[{'number':n,'displayOrdinal':i+1,'storyMedia':{'reviewed':True}} for i,n in enumerate(g.ORDER)]}
 if case=='reordered':cat['learningRelease']['approvedIds'][-2:]=reversed(cat['learningRelease']['approvedIds'][-2:])
 if case=='duplicate':cat['learningRelease']['approvedIds'][-1]=3510
 if case=='unknown':cat['entries'].append({'number':9999,'displayOrdinal':26,'storyMedia':True})
 if case=='ordinal':cat['entries'][-1]['displayOrdinal']=3404
 if case=='ordinal_bool':cat['entries'][0]['displayOrdinal']=True
 if case=='unsafe':cat['learningRelease']['approvedIds'][-1]=9007199254740992
 if case=='missing':cat['entries'].pop()
 if case=='wrong_mode':cat['learningRelease']['sampleMode']='storybook-five-word-batches'
 bad=g.validate_catalog(cat,{str(n)for n in g.ORDER});results.append({'case':'order_'+case,'passed':bool(bad)==(case!='positive')})
policy=json.loads((HERE/'batch-policy-lock.json').read_text())
with tempfile.TemporaryDirectory(prefix='policy-mutations-') as td:
 root=Path(td)
 for group in ['immutablePriorFiles','extensionFiles']:
  for relative,h in policy[group].items():
   src=HERE.parent.parent/relative;dst=root/relative;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(src.read_bytes());assert g.digest(dst)==h
 altered=copy.deepcopy(policy);altered['immutablePriorFiles'].pop(next(iter(altered['immutablePriorFiles'])));results.append({'case':'deleted_prior_policy_entry','passed':any(f['check']=='immutable_prior_manifest_changed' for x in g.verify_policy_files(root,altered) for f in x['failures'])})
 results.append({'case':'complete_immutable_baseline_positive','passed':not g.verify_policy_files(root,policy)})
 for relative in policy['immutablePriorFiles']:
  f=root/relative;original=f.read_bytes();f.write_bytes(original+b'\nmutation');bad=g.verify_policy_files(root,policy);f.write_bytes(original);results.append({'case':'prior_file_mutation','path':relative,'passed':len(bad)==1 and bad[0]['failures'][0]['path']==relative})
 relative=next(iter(policy['immutablePriorFiles']));(root/relative).unlink();bad=g.verify_policy_files(root,policy);results.append({'case':'missing_prior_file','passed':len(bad)==1 and bad[0]['failures'][0]['path']==relative})
out={'passed':all(r['passed']for r in results),'tests':results};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed'] else 1)
