#!/usr/bin/env python3
"""Meaningful phase/contact/anchor mutation tests using temporary correctly hash-bound videos."""
import importlib.util,json,tempfile,subprocess
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('guard',HERE/'check.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
s=importlib.util.spec_from_file_location('phase',HERE/'phase_guard.py');pg=importlib.util.module_from_spec(s);s.loader.exec_module(pg)
def fixture(root,case):
 frames=[]
 for i in range(6):
  a=np.full((100,100,3),[135,175,165],np.uint8);a[8:45,7:14]=[95,60,35];a[14:19,5:16]=[100,65,40];a[55:80,80:90]=[90,65,40]
  y=48 if i in[2,3] else 70;x=30
  if case in ['planted_contact_shift','hidden_contact_teleport'] and i==5:x+=6
  if case=='wrong_landing_target' and i>=4:x+=6
  a[y:y+8,x:x+10]=[232,209,164];a[y:y+8,49:59]=[232,209,164]
  if case=='shoe_disappears_in_contact' and i==4:a[64:90,24:48]=[135,175,165]
  if case=='camera_drift_during_flight' and i==2:a=np.roll(a,6,axis=1)
  if case=='anchor_disappears_during_flight' and i==2:a[55:80,80:90]=[135,175,165]
  if case=='ambiguous_landing_foot' and i==4:a[81:86,30:44]=[232,209,164]
  frames.append(a)
 video=root/'fixture.mp4';p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','100x100','-r','25','-i','pipe:0','-c:v','libx264','-crf','0','-pix_fmt','yuv444p',str(video)],stdin=subprocess.PIPE);p.communicate(b''.join(a.tobytes() for a in frames));assert p.returncode==0
 first=g.decode(video,100,100)[0];Image.fromarray(first).save(root/'poster.png')
 feet={'screenLeft':{'state':'planted','roi':[24,64,48,90],'expectedContact':{'contactX':34.5,'soleY':77,'soleWidth':10}},'screenRight':{'state':'planted','roi':[46,64,66,90],'expectedContact':{'contactX':53.5,'soleY':77,'soleWidth':10}}}
 move={f:{'state':'intentional_motion','reason':'airborne','departedContactPhase':'initial','landingContactPhase':'settled'} for f in feet}
 phases=[{'id':'initial','startFrame':0,'endFrame':1,'feet':feet},{'id':'flight','startFrame':2,'endFrame':3,'feet':move},{'id':'settled','startFrame':4,'endFrame':5,'feet':json.loads(json.dumps(feet))}]
 c={'asset':179,'width':100,'height':100,'fps':25,'frames':6,'video':'fixture.mp4','videoSha256':g.digest(video),'poster':'poster.png','posterSha256':g.digest(root/'poster.png'),'posterMustEqualDecodedFrame0':True,'thresholds':{'maxAdjacentContactDxPx':3.,'maxAdjacentSoleDyPx':2.,'maxAdjacentSoleWidthDeltaPx':6.,'maxBodyHeightRangeRatio':.03},'reviewedExceptions':[],'visualReviewOnly':['Synthetic test, moving-foot geometry deliberately exempt only within reviewed flight frames'],'motionProfile':{'type':'reviewed_179_foot_motion_v1','contactDetector':'cream_component_v1','phases':phases,'staticAnchors':[{'id':'pipe','roi':[3,3,19,50],'maxMeanAbsoluteRgbError':1.,'minDarkContourIoU':.985,'enabledAllFrames':True},{'id':'bench','roi':[76,51,94,84],'maxMeanAbsoluteRgbError':1.,'minDarkContourIoU':.985,'enabledAllFrames':True}],'reviewEvidence':'review.json'}}
 if case=='hidden_contact_teleport':
  phases[-1]['endFrame']=4;shifted=json.loads(json.dumps(feet));shifted['screenLeft']['expectedContact']['contactX']+=6;phases.append({'id':'reset-planted-target','startFrame':5,'endFrame':5,'feet':shifted})
 evidence={'videoSha256':c['videoSha256'],'phasePlanSha256':pg.canonical_hash(phases),'reviewed':{k:True for k in ['visibleLiftAndLanding','completeCharacterPoseAnatomy','stationarySceneAnchors','phaseBoundariesAndLoopReviewed']}}
 if case=='expanded_airborne_interval':phases[0]['endFrame']=0;phases[1]['startFrame']=1
 elif case=='phase_gap':phases[0]['endFrame']=0
 elif case=='no_landing':phases[-1]['feet']=json.loads(json.dumps(move))
 elif case=='disable_anchor':c['motionProfile']['staticAnchors'][1]['enabledAllFrames']=False
 elif case=='widen_anchor_tolerance':c['motionProfile']['staticAnchors'][1]['maxMeanAbsoluteRgbError']=999
 elif case=='widen_contact_tolerance':c['thresholds']['maxAdjacentContactDxPx']=999
 elif case=='reuse_on_other_scene':c['asset']=178
 elif case=='unreviewed_lift_landing':evidence['reviewed']['visibleLiftAndLanding']=False
 elif case=='unknown_video_hash':c['videoSha256']='0'*64
 (root/'review.json').write_text(json.dumps(evidence));c['motionProfile']['reviewEvidenceSha256']=g.digest(root/'review.json');return c
cases=['positive','planted_contact_shift','wrong_landing_target','hidden_contact_teleport','shoe_disappears_in_contact','camera_drift_during_flight','anchor_disappears_during_flight','ambiguous_landing_foot','expanded_airborne_interval','phase_gap','no_landing','disable_anchor','widen_anchor_tolerance','widen_contact_tolerance','reuse_on_other_scene','unreviewed_lift_landing','unknown_video_hash'];results=[]
with tempfile.TemporaryDirectory(prefix='phase-guard-test-') as td:
 root=Path(td)
 for case in cases:
  c=fixture(root,case);cp=root/'config.json';cp.write_text(json.dumps(c));policy={'guardSha256':g.digest(HERE/'check.py'),'guardModules':{'phase_guard.py':g.digest(HERE/'phase_guard.py')},'scenes':{str(c['asset']):g.digest(cp)}}
  result=g.check_scene(root,cp,policy);checks=sorted({f['check'] for f in result['failures']});ok=result['status']==('PASS' if case=='positive' else 'FAIL')
  if case in ['planted_contact_shift','wrong_landing_target']:ok=ok and 'planted_or_landing_contact_target_violation' in checks and not any('hash' in x for x in checks)
  if case in ['camera_drift_during_flight','anchor_disappears_during_flight']:ok=ok and 'fixed_camera_or_prop_discontinuity' in checks and not any('hash' in x for x in checks)
  results.append({'case':case,'passed':ok,'checks':checks})
out={'passed':all(x['passed'] for x in results),'tests':results};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed'] else 1)
