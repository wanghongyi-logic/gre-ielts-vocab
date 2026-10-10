#!/usr/bin/env python3
import importlib.util,json
from pathlib import Path
import numpy as np
P=Path(__file__).parent;s=importlib.util.spec_from_file_location('b',P/'body_components.py');b=importlib.util.module_from_spec(s);s.loader.exec_module(b);tests=[]
def test(name,passed):tests.append({'case':name,'passed':bool(passed)})
def independent_flood(mask):
 todo=set(zip(*np.where(mask)));out=[]
 while todo:
  first=todo.pop();stack=[first];points=[first]
  while stack:
   y,x=stack.pop()
   for dy in [-1,0,1]:
    for dx in [-1,0,1]:
     q=(y+dy,x+dx)
     if q in todo:todo.remove(q);stack.append(q);points.append(q)
  ys,xs=zip(*points);out.append([len(points),min(xs),min(ys),max(xs),max(ys)])
 return sorted(out)
rng=np.random.default_rng(429)
for i,prob in enumerate([.01,.2,.45,.8]):
 m=rng.random((25,31))<prob;test('independent_flood_equivalence_'+str(i),sorted(b.components(m))==independent_flood(m))
m=np.zeros((160,120),bool);m[30:130,20:95]=True;m[2,2]=True;m[157,115]=True;test('isolated_codec_speckles_excluded',b.height(m)==100)
n=np.zeros_like(m);n[24:135,20:95]=True;test('real_scale_change_remains_visible',b.height(n)==111)
n=np.zeros_like(m);n[43:143,20:95]=True;test('translation_preserves_height_not_location',b.height(n)==100 and b.components(n)[0][2]==43)
try:b.height(np.eye(16,dtype=bool));bad=False
except ValueError:bad=True
test('insufficient_body_fails_closed',bad)
out={'passed':all(t['passed']for t in tests),'tests':tests};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed']else 1)
