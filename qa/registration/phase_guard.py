"""Narrow phase-aware179 extension. Moving feet are visually reviewed, never numerically called planted.
All fixed-background anchors remain protected throughout deliberate foot motion.
"""
import hashlib,json
from pathlib import Path
import numpy as np

def canonical_hash(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def validate_profile(c,count,evidence):
 errors=[];p=c.get('motionProfile',{});phases=p.get('phases',[]);feet=['screenLeft','screenRight']
 if c.get('asset')!=179 or p.get('type')!='reviewed_179_foot_motion_v1' or p.get('contactDetector')!='cream_component_v1':errors.append({'check':'unknown_motion_profile'})
 if c.get('reviewedExceptions'):errors.append({'check':'motion_profile_cannot_reuse_reset_exceptions'})
 caps={'maxAdjacentContactDxPx':3.0,'maxAdjacentSoleDyPx':2.0,'maxAdjacentSoleWidthDeltaPx':6.0,'maxBodyHeightRangeRatio':0.03}
 if any(c.get('thresholds',{}).get(k)!=v for k,v in caps.items()):errors.append({'check':'motion_profile_cannot_relax_global_thresholds'})
 if c.get('metricScaleTo312',312/c['width'])!=312/c['width']:errors.append({'check':'invalid_displacement_normalization'})
 if not isinstance(phases,list) or not phases:return errors+[{'check':'missing_phase_plan'}]
 cursor=0;ids=set();planted={f:[] for f in feet}
 for phase in phases:
  if phase.get('id') in ids:errors.append({'check':'duplicate_phase_id'})
  ids.add(phase.get('id'));start,end=phase.get('startFrame'),phase.get('endFrame')
  if not isinstance(start,int) or not isinstance(end,int) or start!=cursor or end<start or end>=count:errors.append({'check':'phase_gap_overlap_or_invalid_range','phase':phase.get('id')})
  if isinstance(end,int):cursor=end+1
  if set(phase.get('feet',{}))!=set(feet):errors.append({'check':'missing_or_unknown_foot_state','phase':phase.get('id')});continue
  for foot in feet:
   state=phase['feet'][foot];mode=state.get('state')
   if mode=='planted':
    planted[foot].append(phase['id']);expected=state.get('expectedContact',{});roi=state.get('roi',[])
    if len(roi)!=4 or not all(k in expected for k in ['contactX','soleY','soleWidth']):errors.append({'check':'landing_or_contact_anchor_missing','phase':phase['id'],'foot':foot})
    elif not(roi[0]<=expected['contactX']<roi[2] and roi[1]<=expected['soleY']<roi[3] and expected['soleWidth']>0):errors.append({'check':'invalid_contact_target','phase':phase['id'],'foot':foot})
   elif mode=='intentional_motion':
    if state.get('reason') not in ['lift','airborne','water_sweep','touchdown','settling']:errors.append({'check':'unbounded_or_unexplained_motion','phase':phase['id'],'foot':foot})
    if not state.get('departedContactPhase') or not state.get('landingContactPhase'):errors.append({'check':'motion_without_reviewed_departure_and_landing','phase':phase['id'],'foot':foot})
   else:errors.append({'check':'unknown_foot_state','phase':phase['id'],'foot':foot})
 if cursor!=count:errors.append({'check':'phase_plan_does_not_cover_video'})
 byid={q['id']:q for q in phases if 'id'in q}
 for foot in feet:
  if len(planted[foot])<2 or phases[0].get('feet',{}).get(foot,{}).get('state')!='planted' or phases[-1].get('feet',{}).get(foot,{}).get('state')!='planted':errors.append({'check':'unbounded_flight_or_missing_stable_start_end','foot':foot})
  for q in phases:
   state=q.get('feet',{}).get(foot,{})
   if state.get('state')=='intentional_motion':
    before=byid.get(state.get('departedContactPhase'));after=byid.get(state.get('landingContactPhase'))
    if not before or not after or before.get('endFrame',count)>=q.get('startFrame',0) or after.get('startFrame',0)<=q.get('endFrame',count) or before.get('feet',{}).get(foot,{}).get('state')!='planted' or after.get('feet',{}).get(foot,{}).get('state')!='planted':errors.append({'check':'invalid_flight_landing_bounds','phase':q.get('id'),'foot':foot})
 anchors=p.get('staticAnchors',[])
 if len(anchors)<2 or not {'pipe','bench'}.issubset({a.get('id') for a in anchors}):errors.append({'check':'missing_continuous_camera_prop_anchors'})
 for a in anchors:
  if len(a.get('roi',[]))!=4 or a.get('maxMeanAbsoluteRgbError',999)>1.0 or a.get('minDarkContourIoU',0)<0.985 or a.get('enabledAllFrames') is not True:errors.append({'check':'weakened_or_phase_disabled_static_anchor','anchor':a.get('id')})
 if evidence.get('videoSha256')!=c.get('videoSha256') or evidence.get('phasePlanSha256')!=canonical_hash(phases):errors.append({'check':'stale_or_reused_motion_review'})
 required=['visibleLiftAndLanding','completeCharacterPoseAnatomy','stationarySceneAnchors','phaseBoundariesAndLoopReviewed']
 if not all(evidence.get('reviewed',{}).get(k) is True for k in required):errors.append({'check':'motion_visual_review_incomplete'})
 return errors

def evaluate_motion(frames,c,evidence):
 failures=validate_profile(c,len(frames),evidence);p=c['motionProfile'];used=[];summary={'fixedAnchors':{},'contacts':{},'intentionalMotion':[]};scale=312/c['width'];t=c['thresholds']
 if any(f['check']!='motion_visual_review_incomplete' for f in failures):return failures,used,summary
 # Structural checks do not disappear during any moving-foot interval.
 for anchor in p['staticAnchors']:
  x1,y1,x2,y2=anchor['roi'];ref=frames[0,y1:y2,x1:x2];mr=np.min(ref,axis=2)<130;maxmae=0.;miniou=1.;cache={}
  if int(mr.sum())<20 or float(ref.std())<8:failures.append({'check':'static_anchor_has_no_distinct_visible_structure','anchor':anchor['id']})
  for i,f in enumerate(frames):
   z=f[y1:y2,x1:x2];key=z.tobytes()
   if key not in cache:
    m=np.min(z,axis=2)<130;union=np.count_nonzero(m|mr);iou=np.count_nonzero(m&mr)/union if union else 1.;mae=float(np.abs(z.astype(float)-ref).mean());cache[key]=(iou,mae)
   iou,mae=cache[key];maxmae=max(maxmae,mae);miniou=min(miniou,iou)
   if mae>anchor['maxMeanAbsoluteRgbError'] or iou<anchor['minDarkContourIoU']:failures.append({'check':'fixed_camera_or_prop_discontinuity','anchor':anchor['id'],'frame':i,'mae':mae,'iou':iou})
  summary['fixedAnchors'][anchor['id']]={'maxMae':maxmae,'minIoU':miniou,'checkedFrames':len(frames),'includesAllMovingFootFrames':True}
 for phase in p['phases']:
  for foot,state in phase['feet'].items():
   if state['state']=='intentional_motion':summary['intentionalMotion'].append({'foot':foot,'phase':phase['id'],'startFrame':phase['startFrame'],'endFrame':phase['endFrame'],'reason':state['reason'],'numericalFootProxy':'not applied; bounded reviewed movement','anatomyAndTrajectory':'visual-review-only'});continue
   target=state['expectedContact'];records=[]
   for i in range(phase['startFrame'],phase['endFrame']+1):
    try:value=cream_shoe_contact(frames[i],state['roi'])
    except ValueError as error:failures.append({'check':'unreliable_contact_detection','phase':phase['id'],'foot':foot,'frame':i,'detail':str(error)});continue
    dx=abs(value['contactX']-target['contactX'])*scale;dy=abs(value['soleY']-target['soleY'])*scale;dw=abs(value['soleWidth']-target['soleWidth'])*scale;records.append({'frame':i,'contactDxPx':dx,'soleDyPx':dy,'soleWidthDeltaPx':dw})
    if dx>t['maxAdjacentContactDxPx'] or dy>t['maxAdjacentSoleDyPx'] or dw>t['maxAdjacentSoleWidthDeltaPx']:failures.append({'check':'planted_or_landing_contact_target_violation','foot':foot,'phase':phase['id'],'frame':i,'contactDxPx':dx,'soleDyPx':dy,'soleWidthDeltaPx':dw})
   summary['contacts'][phase['id']+':'+foot]={'expected':target,'frames':records}
 # Consecutive planted phases may not reset targets to hide a contact teleport.
 for before,after in zip(p['phases'],p['phases'][1:]):
  for foot in ['screenLeft','screenRight']:
   left=before['feet'][foot];right=after['feet'][foot]
   if left['state']!='planted' or right['state']!='planted':continue
   try:a=cream_shoe_contact(frames[before['endFrame']],left['roi']);b=cream_shoe_contact(frames[after['startFrame']],right['roi'])
   except ValueError as error:failures.append({'check':'unreliable_contact_boundary_detection','foot':foot,'detail':str(error)});continue
   dx=abs(a['contactX']-b['contactX'])*scale;dy=abs(a['soleY']-b['soleY'])*scale;dw=abs(a['soleWidth']-b['soleWidth'])*scale
   if dx>t['maxAdjacentContactDxPx'] or dy>t['maxAdjacentSoleDyPx'] or dw>t['maxAdjacentSoleWidthDeltaPx']:failures.append({'check':'planted_phase_boundary_contact_jump','foot':foot,'fromPhase':before['id'],'toPhase':after['id'],'contactDxPx':dx,'soleDyPx':dy,'soleWidthDeltaPx':dw})
 # Both start and finish must be stable; different intentional touchdown locations are not automatically loop exceptions.
 for foot in ['screenLeft','screenRight']:
  start=p['phases'][0]['feet'][foot];end=p['phases'][-1]['feet'][foot]
  try:a=cream_shoe_contact(frames[0],start['roi']);b=cream_shoe_contact(frames[-1],end['roi'])
  except ValueError as error:failures.append({'check':'unreliable_loop_contact_detection','foot':foot,'detail':str(error)});continue
  dx=abs(a['contactX']-b['contactX'])*scale;dy=abs(a['soleY']-b['soleY'])*scale
  if dx>t['maxAdjacentContactDxPx'] or dy>t['maxAdjacentSoleDyPx']:failures.append({'check':'unreviewed_motion_loop_contact_jump','foot':foot,'contactDxPx':dx,'soleDyPx':dy})
 return failures,used,summary

def cream_shoe_contact(image,roi):
 """Conservative warm cream component in a reviewed tight shoe ROI; ambiguous evidence fails."""
 x1,y1,x2,y2=roi;z=image[y1:y2,x1:x2].astype(float);r,g,b=z[:,:,0],z[:,:,1],z[:,:,2]
 mask=(r>190)&(g>165)&(b>110)&(r>g*1.015)&(g>b*1.08);h,w=mask.shape;seen=np.zeros_like(mask);components=[]
 for sy,sx in zip(*np.where(mask)):
  if seen[sy,sx]:continue
  stack=[(int(sy),int(sx))];seen[sy,sx]=True;points=[]
  while stack:
   y,x=stack.pop();points.append((y,x))
   for dy,dx in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
    ny,nx=y+dy,x+dx
    if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;stack.append((ny,nx))
  if len(points)>=30:components.append(points)
 components.sort(key=len,reverse=True)
 if not components:raise ValueError('No reliable cream-shoe component in reviewed contact ROI')
 if len(components)>1 and len(components[1])>=len(components[0])*0.65:raise ValueError('Ambiguous cream components; reviewed shoe ROI must distinguish the foot')
 p=np.array(components[0]);ys,xs=p[:,0],p[:,1];sole=int(ys.max());near=xs[ys>=sole-5]
 if xs.min()==0 or xs.max()==w-1 or sole==h-1:raise ValueError('Shoe component is clipped by contact ROI')
 return {'soleY':sole+y1,'contactX':(int(near.min())+int(near.max()))/2+x1,'soleWidth':int(near.max()-near.min()+1),'componentPixels':len(p)}
