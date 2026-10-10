#!/usr/bin/env python3
"""Actual decoded, correctly rebound media mutations; no hash-mismatch shortcuts."""
import copy, importlib.util, json, subprocess, tempfile
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('g',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)

def encode(path,frames):
 p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','100x100','-r','25','-i','pipe:0','-c:v','libx264','-crf','0','-pix_fmt','yuv444p',str(path)],stdin=subprocess.PIPE)
 p.communicate(frames.tobytes());assert p.returncode==0
 return g.legacy.decode(path,100,100)

def fixture(root,asset,case):
 a=np.full((6,100,100,3),245,dtype=np.uint8)
 a[:,86:88,20:69]=[100,70,40];a[:,5:45,5:10]=[80,65,50];a[:,40:45,5:25]=[80,65,50];a[:,8:40,80:85]=[80,65,50];a[:,8:13,70:85]=[80,65,50];a[:,30:72,44:56]=[80,65,50];a[:,78:83,30:40]=[80,65,50];a[:,78:83,55:65]=[80,65,50]
 for i in range(6):a[i,47:53,60+i:65+i]=[80,65,50]
 a[:,58:63,16:26]=[90,55,25];a[:,66:71,73:83]=[90,55,25]
 reference=encode(root/'reference.mp4',a)
 roi=[58,44,73,56];cel={'frameCels':list(range(6)),**g.cel.CAPS,'witnesses':[{'id':name,'scope':'Synthetic visible raster contact witness only','byCel':{str(i):{'roi':roi,'reference':g.background.pack_reference(reference[i,44:56,58:73])} for i in range(6)}} for name in sorted(g.cel.REQUIRED[asset])]}
 for w in cel['witnesses']:
  if w['id'].startswith('companion-'):
   r=[13,55,29,65] if w['id']=='companion-left-shoe' else [70,63,86,73]
   w['byCel']={str(i):{'roi':r,'reference':g.background.pack_reference(reference[0,r[1]:r[3],r[0]:r[2]])} for i in range(6)}
 if case=='shift_companion':a[3,55:65,13:31]=245;a[3,58:63,21:31]=[90,55,25]
 if case=='missing_companion':a[3,55:65,13:31]=245
 if case=='shift_prop':a[3,44:57,58:78]=245;a[3,47:53,69:74]=[80,65,50]
 if case=='missing_prop':a[3,44:57,58:78]=245
 if case=='wrong_cel':a[3,44:57,58:78]=a[0,44:57,58:78]
 if case=='shift_foot':a[3,78:83,30:44]=245;a[3,78:83,34:44]=[80,65,50]
 if case=='missing_foot':a[3,75:85,25:49]=245
 if case=='camera':a[3]=np.roll(a[3],4,axis=1)
 if case=='frozen':a[:]=a[0]
 video=root/'gre-learning/fixture.mp4';video.parent.mkdir(exist_ok=True);frames=encode(video,a);poster=root/'poster.png';Image.fromarray(frames[0]).save(poster)
 c={'asset':asset,'width':100,'height':100,'fps':25,'frames':6,'thresholds':dict(g.CAPS),'visibleFootNames':['left','right'],'nativeOverlayRegions':[],'footRois':{'left':[25,75,50,90],'right':[52,75,69,90]},'bodyRois':{'body':[42,20,58,73]},'actionRois':[{'id':'gesture','roi':[58,44,73,56],'minPeakMeanRgbChange':1.0}],'contactDetector':'background_difference_v1','staticAnchors':[{'id':'left','roi':[2,2,28,48],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True},{'id':'right','roi':[78,5,88,43],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True}],'video':'gre-learning/fixture.mp4','videoSha256':g.digest(video),'poster':'poster.png','posterSha256':g.digest(poster),'visualReviewOnly':['Synthetic geometry fixture, not approval for real art'],'reviewedExceptions':[],'reviewEvidence':'review.json','nativeDialogueSha256':g.canonical({'stages':None,'posterDialogue':None}),'celContactProfile':cel}
 if asset in {3510,4608,3404}:
  c['staticFootWitnesses']={'companion-left':'companion-left-shoe','companion-right':'companion-right-shoe'};c['visibleFootNames']+=list(c['staticFootWitnesses'])
 if asset in {3305,4608}:c['footMeasurementModes']={'far':'full_visible_shoe_bounds_v1'};c['footRois']={'near':c['footRois']['left'],'far':c['footRois']['right']};c['visibleFootNames']=['near','far']+list(c.get('staticFootWitnesses',{}))
 if asset==581:c['fluidProfile']={'colorRule':'cyan_water_v1','scope':'Synthetic none-state evidence','roi':[58,44,73,56],'soilEllipse':[10,65,30,80],'flowStates':{str(i):'none' for i in range(6)}}
 bg=np.full((100,100,3),245,dtype=np.uint8);bg[86:88,20:69]=[100,70,40];c['backgroundReferences']={name:g.background.pack_reference(bg[b[1]:b[3],b[0]:b[2]]) for name,b in c['footRois'].items()}
 if case=='wrong_fps':c['fps']=24
 if case=='poster_not_frame0':Image.fromarray(np.roll(frames[0],8,axis=1)).save(poster);c['posterSha256']=g.digest(poster)
 if case=='weakened_cap':cel['maxTemplateMeanRgbError']=99
 if case=='missing_witness':cel['witnesses'].pop()
 if case=='missing_pose':cel['witnesses'][0]['byCel'].pop('3')
 if case=='bad_schedule':cel['frameCels'].pop()
 review={'videoSha256':c['videoSha256'],'geometrySha256':g.canonical(g.geometry(c)),'reviewed':{k:True for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning','celContactWitnesses','staticShoeWitnesses','fullVisibleFarShoeBounds3305','fullVisibleFarShoeBounds4608','visibleFluidTrajectory']}}
 if case=='unreviewed_witness':review['reviewed']['celContactWitnesses']=False
 (root/'review.json').write_text(json.dumps(review));c['reviewEvidenceSha256']=g.digest(root/'review.json')
 (video.parent/'catalog.json').write_text(json.dumps({'entries':[{'number':asset,'storyMedia':{'video':{'url':'fixture.mp4','sha256':c['videoSha256']},'poster':{'url':'../poster.png','sha256':c['posterSha256']}}}]}))
 cp=root/'config.json';cp.write_text(json.dumps(c));return cp,{'scenes':{str(asset):g.digest(cp)}}

def main():
 results=[]
 with tempfile.TemporaryDirectory(prefix='core002-mutants-') as td:
  root=Path(td)
  for n in sorted(g.NEW_SCENES):
   for case in ['positive','shift_prop','missing_prop','wrong_cel','shift_foot','missing_foot','camera','frozen','weakened_cap','missing_witness','missing_pose','bad_schedule','unreviewed_witness','wrong_fps','poster_not_frame0']+(['shift_companion','missing_companion'] if n in {3510,4608,3404} else []):
    cp,p=fixture(root,n,case);r=g.check_new(root,cp,p);checks={f['check'] for f in r['failures']};ok=(r['status']=='PASS')==(case=='positive')
    if case in ['shift_prop','missing_prop','wrong_cel','shift_companion','missing_companion']:ok=ok and 'visible_contact_or_prop_witness_changed' in checks and not any('hash' in x for x in checks)
    if case=='shift_foot':ok=ok and 'planted_contact_or_proportion_jump' in checks
    if case=='missing_foot':ok=ok and 'unreliable_foot_evidence' in checks
    if case=='camera':ok=ok and 'fixed_camera_or_prop_jump' in checks
    if case=='frozen':ok=ok and 'action_roi_has_no_visible_change' in checks
    results.append({'asset':n,'case':case,'passed':bool(ok),'checks':sorted(checks)})
 out={'passed':all(r['passed'] for r in results),'tests':results};print(json.dumps(out,indent=2));return 0 if out['passed'] else 1
if __name__=='__main__':raise SystemExit(main())
