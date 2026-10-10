#!/usr/bin/env python3
import copy,importlib.util,json
from pathlib import Path
import numpy as np
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('g',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
results=[]
def test(name,passed):results.append({'case':name,'passed':bool(passed)})
rng=np.random.default_rng(27);a=rng.integers(0,256,(32,31,3),dtype=np.uint8);ref=g.background.pack_reference(a);raw={'asset':1287,'foo':[ref,ref],'thresholds':g.CAPS};compact=g.storage.compact(raw)
test('exact_expanded_json_equality',g.storage.expand(compact)==raw)
test('exact_decoded_rgb_equality',np.array_equal(g.background.unpack_reference(g.storage.expand(compact)['foo'][0],[0,0,31,32]),a))
test('duplicate_reference_saves_bytes',len(json.dumps(compact))<len(json.dumps(raw)))
for name,mutate in [('unknown_reference',lambda x:x['foo'][0].update(rasterReference='unknown')),('corrupt_pool',lambda x:next(iter(x['rasterReferencePool'].values())).update(data='AA=='))]:
 c=copy.deepcopy(compact);mutate(c)
 try:g.storage.expand(c);passed=False
 except ValueError:passed=True
 test(name,passed)
sizes=[]
for path in sorted((HERE/'configs').glob('*.json')):
 c=json.loads(path.read_text());raw=g.storage.expand(c);packed=g.storage.compact(raw);test(path.stem+'_deep_equality',g.storage.expand(packed)==raw);test(path.stem+'_geometry_equality',g.geometry(c)==g.geometry(raw));sizes.append({'asset':c['asset'],'rawBytes':len((json.dumps(raw,indent=2)+'\n').encode()),'compactBytes':len((json.dumps(packed,indent=2)+'\n').encode())})
out={'passed':all(x['passed']for x in results),'tests':results,'sizes':sizes};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed']else 1)
