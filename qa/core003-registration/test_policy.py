#!/usr/bin/env python3
import copy,importlib.util,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;s=importlib.util.spec_from_file_location('g',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
results=[]
def test(name,passed):results.append({'case':name,'passed':bool(passed)})
valid={'learningRelease':{'approvedIds':g.ORDER,'sampleMode':'storybook-reviewed-order','batchSize':5},'entries':[{'number':n,'displayOrdinal':i+1,'storyMedia':{'witness':True}}for i,n in enumerate(g.ORDER)]};known={str(n)for n in g.ORDER}
test('exact30_noncontiguous_order',not g.validate_catalog(valid,known))
for kind in ['contiguous','reverse','duplicate','missing','wrong_ordinal','unapproved']:
 c=copy.deepcopy(valid)
 if kind=='contiguous':c['learningRelease']['approvedIds']=list(range(175,205))
 if kind=='reverse':c['learningRelease']['approvedIds'].reverse()
 if kind=='duplicate':c['learningRelease']['approvedIds'][-1]=1287
 if kind=='missing':c['entries'].pop()
 if kind=='wrong_ordinal':c['entries'][-1]['displayOrdinal']=419
 if kind=='unapproved':c['entries'].append({'number':999,'storyMedia':{'witness':True}})
 test(kind,bool(g.validate_catalog(c,known)))
for cp in sorted((HERE/'configs').glob('*.json')):
 c=g.storage.expand(json.loads(cp.read_text()));review=json.loads((HERE.parent.parent/c['reviewEvidence']).read_text());test(cp.stem+'_reviewed_policy',not g.validate(c,review))
 for field,mutate,expected in [('global_caps',lambda x:x['thresholds'].update(maxAdjacentContactDxPx=4),'global_threshold_change_forbidden'),('cel_caps',lambda x:x['celContactProfile'].update(maxTemplateMeanRgbError=9),'missing_or_weakened_cel_contact_policy'),('scene_caps',lambda x:x['sceneContactProfile'].update(maxLandmarkOffsetPx=2),'missing_or_weakened_scene_geometry_policy'),('missing_scene_landmark',lambda x:x['sceneContactProfile']['landmarks'].pop(),'incomplete_scene_landmarks')]:
  z=copy.deepcopy(c);mutate(z);test(cp.stem+'_'+field,expected in {v['check']for v in g.validate(z,review)})
for cp in sorted((HERE/'configs').glob('*.json')):
 c=json.loads(cp.read_text());tr=json.loads((HERE.parent.parent/c['sourceTrace']).read_text());test(cp.stem+'_complete_source_trace',g.source_body_trace_valid(c['asset'],tr))
 for kind in ['scale','mode','opacity']:
  z=copy.deepcopy(tr)
  if kind=='scale':z[len(z)//2]['registration']['uniformScale']*=1.1
  elif kind=='mode':z[len(z)//2]['mode']='frozen-legs'
  else:z[len(z)//2]['paperOpacity']=0.1
  test(cp.stem+'_source_'+kind,not g.source_body_trace_valid(c['asset'],z))
 if c['asset']==419:
  for field in ['heroCel','cel']:
   z=copy.deepcopy(tr);z[0]['propState'][field]=999;test('419_inconsistent_'+field,not g.source_body_trace_valid(419,z))
  test('419_mode_rejected_for_other_assets',not g.source_body_trace_valid(516,tr))
out={'passed':all(x['passed']for x in results),'tests':results};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed']else 1)
