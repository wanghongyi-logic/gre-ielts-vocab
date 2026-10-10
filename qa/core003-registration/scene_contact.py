"""Additive scene geometry checks on visible, independently annotated evidence.

Local templates measure registration only. Explicit relations describe visible
landmarks; no hidden grip, topology, or physical simulation is inferred.
"""
import math
import numpy as np
CAPS={'maxTemplateMeanRgbError':8.0,'searchRadiusPx':12,'maxLandmarkOffsetPx':1.0}
REQUIRED={1287:{'gate-hinge','gate-free-end','gate-hand','visitor-plan'},2207:{'chain-cart-end','chain-post-end','chain-visible-middle','chain-visible-upper','failed-push-hands'},516:{'carpet-front','door-jamb','carpet-grip'},3537:{'dogmatic-gesture','contrary-evidence','fixed-props'},419:{'window-state','page-state','lamp-state','sash-grip','sash-rail'}}
def validate(c,review,background):
 p=c.get('sceneContactProfile');bad=[]
 if not isinstance(p,dict) or any(p.get(k)!=v for k,v in CAPS.items()):return [{'check':'missing_or_weakened_scene_geometry_policy'}]
 if review.get('reviewed',{}).get('sceneSpecificGeometry') is not True:bad.append({'check':'scene_geometry_visual_review_missing'})
 cells={str(v)for v in c.get('celContactProfile',{}).get('frameCels',[])}
 if c['asset']==419:
  states=p.get('statesByCel',{})
  if set(states)!=cells or any(v.get('window')not in ['open','partly-open','closed']or v.get('page')not in ['flat','raised']or v.get('lamp')!='lit'or(v.get('window')=='closed'and v.get('page')!='flat')for v in states.values()):bad.append({'check':'invalid_conducive_state_schedule'})
 names={w.get('id')for w in p.get('landmarks',[])}
 if not REQUIRED.get(c['asset'],set()).issubset(names) or len(names)!=len(p.get('landmarks',[])):bad.append({'check':'incomplete_scene_landmarks'})
 for w in p.get('landmarks',[]):
  if not w.get('scope') or set(w.get('byCel',{}))!=cells:bad.append({'check':'incomplete_scene_geometry_coverage','landmark':w.get('id')})
  for cell,t in w.get('byCel',{}).items():
   try:
    ref=background.unpack_reference(t['reference'],t['roi'])
    if ref.size<60 or ref.std()<8:raise ValueError('insufficient contrast')
    pt=t['point']
    if len(pt)!=2 or not all(type(v)in[int,float]and math.isfinite(v)for v in pt):raise ValueError('invalid landmark')
   except (KeyError,ValueError)as e:bad.append({'check':'invalid_scene_landmark','landmark':w.get('id'),'detail':str(e)})
 expected_rel={1287:{'gate-grip-proximity'},2207:{'restrained-cart-endpoint-span'},516:{'carpet-door-clearance'},3537:set(),419:{'sash-grip-proximity'}}
 if not expected_rel.get(c['asset'],set()).issubset({r.get('id')for r in p.get('relations',[])}):bad.append({'check':'missing_scene_contact_relations'})
 for rel in p.get('relations',[]):
  if rel.get('a')not in names or rel.get('b')not in names or rel.get('kind')not in ['distance','horizontal_clearance'] or not rel.get('scope'):bad.append({'check':'invalid_scene_relation'})
 return bad

def measure(frames,c,background):
 p=c.get('sceneContactProfile')
 if not p:return [{'check':'missing_scene_geometry_profile'}],{}
 bad=[];out={'landmarks':{},'relations':{},'reviewedStateLabels':p.get('statesByCel',{}),'stateScope':'Categorical state labels bind independently reviewed per-cel raster witnesses; they are not free-standing physical inference.'};schedule=c['celContactProfile']['frameCels'];tracks={};radius=CAPS['searchRadiusPx']
 # Held cels repeat exactly; cache per distinct ROI pixel state.
 for w in p['landmarks']:
  refs={cell:(t,background.unpack_reference(t['reference'],t['roi']).astype(float))for cell,t in w['byCel'].items()};cache={};track=[];max_mae=0;max_offset=0
  for i,cell in enumerate(schedule):
   t,ref=refs[str(cell)];x1,y1,x2,y2=t['roi'];key=(cell,frames[i,max(0,y1-radius):min(c['height'],y2+radius),max(0,x1-radius):min(c['width'],x2+radius)].tobytes())
   if key not in cache:
    best=(float('inf'),0,0)
    for oy in range(-radius,radius+1):
     for ox in range(-radius,radius+1):
      if min(x1+ox,y1+oy)<0:continue
      patch=frames[i,y1+oy:y2+oy,x1+ox:x2+ox]
      if patch.shape==ref.shape:
       score=float(np.abs(patch.astype(float)-ref).mean())
       if (score,abs(ox)+abs(oy))<(best[0],abs(best[1])+abs(best[2])):best=(score,ox,oy)
    cache[key]=best
   mae,ox,oy=cache[key];offset=max(abs(ox),abs(oy));max_mae=max(max_mae,mae);max_offset=max(max_offset,offset)
   if mae>CAPS['maxTemplateMeanRgbError']:bad.append({'check':'scene_landmark_evidence_changed','landmark':w['id'],'frame':i,'mae':mae})
   if offset>CAPS['maxLandmarkOffsetPx']:bad.append({'check':'scene_landmark_registration_changed','landmark':w['id'],'frame':i,'offset':[ox,oy]})
   track.append([t['point'][0]+ox,t['point'][1]+oy])
  tracks[w['id']]=track;out['landmarks'][w['id']]={'maxMae':max_mae,'maxOffsetPx':max_offset,'scope':w['scope']}
 for rel in p.get('relations',[]):
  vals=[]
  for i,cell in enumerate(schedule):
   if str(cell)not in rel['byCel']:continue
   a=tracks[rel['a']][i];b=tracks[rel['b']][i];value=math.dist(a,b)if rel['kind']=='distance'else b[0]-a[0];bounds=rel['byCel'][str(cell)];vals.append(value)
   if not bounds[0]<=value<=bounds[1]:bad.append({'check':'scene_contact_or_clearance_changed','relation':rel['id'],'frame':i,'value':value,'bounds':bounds})
  out['relations'][rel['id']]={'min':min(vals)if vals else None,'max':max(vals)if vals else None,'scope':rel['scope']}
 return bad,out
