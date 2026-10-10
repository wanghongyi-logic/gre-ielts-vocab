"""Exact reviewed balance mechanism: upright rigid assemblies around a fixed pivot.
Small reference patches are measurement inputs, never animation construction layers.
"""
import math
import numpy as np
CAPS={'maxAngleDeg':6.5,'maxTemplateMeanRgbError':8.0,'searchRadiusPx':1,'minPanTableClearancePx':15,'tableBackEdgeY':359,'pivot':[280,249],'halfBeam':122.5}
NAMES={'left-pan','left-object','right-pan','right-object'}
def validate(c,review,background):
 p=c.get('rigProfile');bad=[]
 if c['asset']!=2295:
  return [{'check':'rig_scope_reuse_forbidden'}] if p else []
 if not p or any(p.get(k)!=v for k,v in CAPS.items()):return [{'check':'missing_or_weakened_rig_policy'}]
 if review.get('reviewed',{}).get('rigPivotContactClearance') is not True:bad.append({'check':'rig_visual_review_missing'})
 if len(p.get('anglesDeg',[]))!=c['frames'] or any(type(v) not in [int,float] or not math.isfinite(v) or not 0<=v<=6.5 for v in p.get('anglesDeg',[])):bad.append({'check':'unreviewed_rig_angle_range'})
 if {t.get('id') for t in p.get('templates',[])}!=NAMES or len(p.get('templates',[]))!=4:bad.append({'check':'incomplete_pan_and_object_evidence'})
 for t in p.get('templates',[]):
  try:
   a=background.unpack_reference(t['reference'],t['roi'])
   if a.size<60 or a.std()<3:raise ValueError('Insufficient visual evidence')
   if t.get('side')!=t.get('id','').split('-')[0] or t.get('panBottomY')!=326:raise ValueError('Invalid assembly linkage')
  except (KeyError,ValueError) as e:bad.append({'check':'invalid_rig_template','detail':str(e)})
 return bad

def measure(frames,c,background):
 p=c.get('rigProfile')
 if not p:return [],{}
 failures=[];out={};half=p['halfBeam'];radius=p['searchRadiusPx']
 for t in p['templates']:
  reference=background.unpack_reference(t['reference'],t['roi']).astype(float);x1,y1,x2,y2=t['roi'];sign=-1 if t['side']=='left' else 1;maximum=0.;min_clearance=999.
  for i,angle in enumerate(p['anglesDeg']):
   theta=math.radians(angle);dx=round(sign*half*(math.cos(theta)-1));dy=round(sign*half*math.sin(theta));best=float('inf');offset=None
   for ox in range(dx-radius,dx+radius+1):
    for oy in range(dy-radius,dy+radius+1):
     patch=frames[i,y1+oy:y2+oy,x1+ox:x2+ox]
     if patch.shape!=reference.shape:continue
     mae=float(np.abs(patch.astype(float)-reference).mean())
     if mae<best:best=mae;offset=[ox,oy]
   maximum=max(maximum,best)
   if best>p['maxTemplateMeanRgbError']:failures.append({'check':'rig_assembly_or_object_contact_discontinuity','template':t['id'],'frame':i,'mae':best})
   if offset is not None:
    clearance=p['tableBackEdgeY']-(t['panBottomY']+offset[1]);min_clearance=min(min_clearance,clearance)
    if clearance<p['minPanTableClearancePx']:failures.append({'check':'pan_table_clearance_lost','template':t['id'],'frame':i,'clearance':clearance})
  out[t['id']]={'maxTemplateMae':maximum,'minPanTableClearancePx':min_clearance,'scope':'Rigid visible object/pan patches follow reviewed upright assembly trajectory; complete contact contours and meaning remain visual-review-only.'}
 return failures,out
