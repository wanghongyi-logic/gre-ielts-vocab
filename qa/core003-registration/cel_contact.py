"""Hash-bound visible contact/prop witnesses for complete redrawn cels.

Reference patches are independent measurement inputs, never construction layers.
They certify only the named visible raster evidence, not hidden anatomy, causal
meaning, physical fluid simulation, or continuous motion between held cels.
"""
import math
import numpy as np
CAPS={'maxTemplateMeanRgbError':8.0,'searchRadiusPx':1,'minReferenceStd':8.0}
REQUIRED={1287:{'gate-hand-contact','visitor-plan'},2207:{'visible-chain-span','failed-push-hands'},516:{'carpet-door-contact','carpet-grip'},3537:{'dogmatic-gesture','contrary-evidence'},419:{'window-state','page-state','lamp-state'}}

def validate(c,review,background):
 p=c.get('celContactProfile');bad=[]
 if not isinstance(p,dict) or any(p.get(k)!=v for k,v in CAPS.items()):return [{'check':'missing_or_weakened_cel_contact_policy'}]
 if review.get('reviewed',{}).get('celContactWitnesses') is not True:bad.append({'check':'cel_contact_visual_review_missing'})
 schedule=p.get('frameCels',[])
 if len(schedule)!=c['frames'] or any(type(v) is not int or v<0 for v in schedule):bad.append({'check':'invalid_cel_schedule'})
 names={w.get('id') for w in p.get('witnesses',[])}
 if not REQUIRED.get(c['asset'],set()).issubset(names) or len(names)!=len(p.get('witnesses',[])):bad.append({'check':'incomplete_semantic_contact_witnesses'})
 for w in p.get('witnesses',[]):
  if not w.get('scope') or set(w.get('byCel',{}))!={str(v) for v in schedule}:bad.append({'check':'incomplete_contact_cel_coverage','witness':w.get('id')})
  if w.get('id') in {'companion-left-shoe','companion-right-shoe'}:
   targets=list(w.get('byCel',{}).values())
   if targets and any(t!=targets[0] for t in targets):bad.append({'check':'static_shoe_target_changes_between_cels','witness':w.get('id')})
  for cell,d in w.get('byCel',{}).items():
   try:
    box=d['roi']
    if len(box)!=4 or any(type(v) is not int for v in box) or not(0<=box[0]<box[2]<=c['width'] and 0<=box[1]<box[3]<=c['height']):raise ValueError('Invalid ROI')
    a=background.unpack_reference(d['reference'],box)
    if a.size<60 or a.std()<CAPS['minReferenceStd']:raise ValueError('Insufficient visual contrast')
   except (ValueError,KeyError) as e:bad.append({'check':'invalid_contact_cel_reference','witness':w.get('id'),'cel':cell,'detail':str(e)})
 return bad

def measure(frames,c,background):
 p=c.get('celContactProfile')
 if not p:return [{'check':'missing_cel_contact_profile'}],{}
 bad=[];out={};radius=CAPS['searchRadiusPx']
 for w in p['witnesses']:
  refs={k:(v['roi'],background.unpack_reference(v['reference'],v['roi']).astype(float)) for k,v in w['byCel'].items()};maximum=0.;worst=None
  for i,cell in enumerate(p['frameCels']):
   roi,ref=refs[str(cell)];x1,y1,x2,y2=roi;best=float('inf')
   for oy in range(-radius,radius+1):
    for ox in range(-radius,radius+1):
     if y1+oy<0 or x1+ox<0:continue
     patch=frames[i,y1+oy:y2+oy,x1+ox:x2+ox]
     if patch.shape==ref.shape:best=min(best,float(np.abs(patch.astype(float)-ref).mean()))
   if best>maximum:maximum=best;worst=i
   if not math.isfinite(best) or best>CAPS['maxTemplateMeanRgbError']:bad.append({'check':'visible_contact_or_prop_witness_changed','witness':w['id'],'frame':i,'cel':cell,'mae':best})
  out[w['id']]={'maxMae':maximum,'worstFrame':worst,'checkedFrames':len(frames),'scope':w['scope']}
 return bad,out
