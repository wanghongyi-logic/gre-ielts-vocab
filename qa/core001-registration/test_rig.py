#!/usr/bin/env python3
"""Hash-bound synthetic mechanism mutations exercise decoded visual checks."""
from pathlib import Path
import importlib.util,tempfile,json,subprocess,math
import numpy as np
from PIL import Image
P=Path(__file__).parent;s=importlib.util.spec_from_file_location('g',P/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
results=[]
with tempfile.TemporaryDirectory() as td:
 r=Path(td);(r/'gre-learning').mkdir()
 for case in ['positive','pan_shift','object_loses_contact','object_missing','pivot_drift','unreviewed_mechanics','weaken_clearance','excess_angle','scope_reuse']:
  angles=[0,0,3,6.5,6.5,0];boxes={'left-pan':[120,318,170,324],'left-object':[125,290,165,312],'right-pan':[380,318,430,324],'right-object':[390,290,414,312]};frames=[]
  for i,angle in enumerate(angles):
   a=np.full((512,512,3),245,np.uint8);a[430:460,20:110]=[95,65,35];a[445:450,20:110]=[70,42,25];a[242:256,276:287]=[80,65,40];a[247:251,280:284]=[215,155,75];a[60:70,195+i:215+i]=[75,65,50]
   for name,(x1,y1,x2,y2) in boxes.items():
    sign=-1 if name.startswith('left') else 1;theta=math.radians(angle);dx=round(sign*122.5*(math.cos(theta)-1));dy=round(sign*122.5*math.sin(theta))
    if case=='pan_shift' and name=='right-pan' and i==3:dy+=7
    if case=='object_loses_contact' and name=='left-object' and i==3:dy-=8
    if case=='object_missing' and name=='right-object' and i==3:continue
    a[y1+dy:y2+dy,x1+dx:x2+dx]=[170,115,55];a[y1+dy:y1+dy+2,x1+dx:x2+dx]=[85,65,40]
   if case=='pivot_drift' and i==3:a[242:256,276:287]=245;a[242:256,281:292]=[80,65,40]
   frames.append(a)
  video=r/'gre-learning/fixture.mp4';p=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','512x512','-r','25','-i','pipe:0','-c:v','libx264','-crf','0','-pix_fmt','yuv444p',str(video)],stdin=subprocess.PIPE);p.communicate(b''.join(a.tobytes() for a in frames));assert p.returncode==0
  decoded=g.legacy.decode(video,512,512);Image.fromarray(decoded[0]).save(r/'poster.png');profile=dict(g.rig.CAPS);profile['anglesDeg']=angles;profile['templates']=[{'id':n,'side':n.split('-')[0],'roi':b,'panBottomY':326,'reference':g.background.pack_reference(decoded[0,b[1]:b[3],b[0]:b[2]])} for n,b in boxes.items()]
  c={'asset':2295,'width':512,'height':512,'frames':6,'fps':25,'thresholds':dict(g.CAPS),'footRois':{},'visibleFootNames':[],'bodyRois':{},'contactDetector':'no_visible_contacts_v1','contactVisibility':'fully_occluded_by_solid_counter','occlusionAnchor':'solid-counter','actionRois':[{'id':'gesture','roi':[190,55,225,75],'minPeakMeanRgbChange':1.}],'staticAnchors':[{'id':n,'roi':b,'maxMeanAbsoluteRgbError':1.,'minDarkContourIoU':.985,'enabledAllFrames':True} for n,b in {'solid-counter':[20,430,110,460],'fixed-pivot':[276,242,287,256]}.items()],'visualReviewOnly':['Synthetic fixture'],'rigProfile':profile,'video':'gre-learning/fixture.mp4','videoSha256':g.digest(video),'poster':'poster.png','posterSha256':g.digest(r/'poster.png'),'reviewEvidence':'review.json','nativeDialogueSha256':g.canonical({'stages':None,'posterDialogue':None})}
  if case=='weaken_clearance':profile['minPanTableClearancePx']=0
  if case=='excess_angle':profile['anglesDeg'][3]=20
  if case=='scope_reuse':c['asset']=4011
  review={'videoSha256':c['videoSha256'],'geometrySha256':g.canonical(g.geometry(c)),'reviewed':{k:True for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning','genuineOcclusionInEveryPose','rigPivotContactClearance']}}
  if case=='unreviewed_mechanics':review['reviewed']['rigPivotContactClearance']=False
  (r/'review.json').write_text(json.dumps(review));c['reviewEvidenceSha256']=g.digest(r/'review.json');cp=r/'config.json';cp.write_text(json.dumps(c));(r/'gre-learning/catalog.json').write_text(json.dumps({'entries':[{'number':c['asset'],'storyMedia':{'video':{'url':'fixture.mp4','sha256':c['videoSha256']},'poster':{'sha256':c['posterSha256']}}}]}));out=g.check_new(r,cp,{'scenes':{str(c['asset']):g.digest(cp)}});checks={f['check'] for f in out['failures']};ok=out['status']==('PASS' if case=='positive' else 'FAIL')
  if case in ['pan_shift','object_loses_contact','object_missing']:ok=ok and 'rig_assembly_or_object_contact_discontinuity' in checks and not any('hash' in k for k in checks)
  if case=='pivot_drift':ok=ok and 'fixed_camera_or_prop_jump' in checks
  results.append({'case':case,'passed':ok,'checks':sorted(checks)})
out={'passed':all(x['passed'] for x in results),'tests':results};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed'] else 1)
