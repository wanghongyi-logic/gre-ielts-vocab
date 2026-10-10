#!/usr/bin/env python3
"""Correctly hash-bound synthetic media exercise geometry, separately from hash failures."""
import importlib.util,json,subprocess,tempfile
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('batch',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
def fixture(root,case):
    frames=[]
    for i in range(6):
        a=np.full((100,100,3),245,dtype=np.uint8);a[86:88,20:69]=[100,70,40]
        a[5:45,5:10]=[80,65,50];a[40:45,5:25]=[80,65,50]
        a[8:40,80:85]=[80,65,50];a[8:13,70:85]=[80,65,50]
        a[30:72,44:56]=[80,65,50]
        x=30+(4 if case=='shoe_translation' and i==3 else 0)
        y=78+ (3 if case=='loop_corruption' and i==5 else 0)
        w=10+(4 if case=='shoe_proportion' and i==3 else 0)
        if case=='gradual_drift':x+=i
        a[y:y+5,x:x+w]=[80,65,50];a[78:83,55:65]=[80,65,50]
        if case=='shoe_disappears' and i==3:a[75:85,25:49]=245
        if case=='body_growth' and i==3:a[25:30,44:56]=[80,65,50]
        if case=='camera_translation' and i==3:a=np.roll(a,4,axis=1)
        if case=='anchor_disappears' and i==3:a[5:45,5:25]=245
        a[45:50,60+(i if case!='frozen_action' else 0):65+(i if case!='frozen_action' else 0)]=[80,65,50]
        if case in ['occluded_positive','occlusion_without_review','occlusion_wrong_scene']:
            a[70:94,22:71]=[130,90,50];a[80:83,25:68]=[75,45,25]
        frames.append(a)
    video=root/'fixture.mp4'
    p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','100x100','-r','25','-i','pipe:0','-c:v','libx264','-crf','0','-pix_fmt','yuv444p',str(video)],stdin=subprocess.PIPE)
    p.communicate(b''.join(a.tobytes() for a in frames));assert p.returncode==0
    Image.fromarray(g.legacy.decode(video,100,100)[0]).save(root/'poster.png')
    c={'asset':180,'width':100,'height':100,'fps':25,'frames':6,'thresholds':dict(g.CAPS),'footRois':{'left':[25,75,50,90],'right':[52,75,69,90]},'bodyRois':{'body':[42,20,58,73]},'actionRois':[{'id':'gesture','roi':[59,44,72,51],'minPeakMeanRgbChange':1.0}],'contactDetector':'background_difference_v1','staticAnchors':[{'id':'left','roi':[2,2,28,48],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True},{'id':'right','roi':[68,5,88,43],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True}],'video':'fixture.mp4','videoSha256':g.digest(video),'poster':'poster.png','posterSha256':g.digest(root/'poster.png'),'visualReviewOnly':['Synthetic geometry fixture'],'reviewedExceptions':[],'reviewEvidence':'review.json'}
    background=np.full((100,100,3),245,dtype=np.uint8);background[86:88,20:69]=[100,70,40]
    c['backgroundReferences']={name:g.background.pack_reference(background[roi[1]:roi[3],roi[0]:roi[2]]) for name,roi in c['footRois'].items()}
    if case in ['occluded_positive','occlusion_without_review','occlusion_wrong_scene']:
        c.update({'asset':184,'contactDetector':'no_visible_contacts_v1','contactVisibility':'fully_occluded_by_solid_counter','footRois':{},'backgroundReferences':{}})
        c['staticAnchors'].append({'id':'solid-counter','roi':[25,72,68,91],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True})
    review={'videoSha256':c['videoSha256'],'geometrySha256':g.canonical(g.geometry(c)),'reviewed':{k:True for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning']}}
    if case=='occluded_positive':review['reviewed']['genuineOcclusionInEveryPose']=True
    if case=='occlusion_wrong_scene':c['asset']=180
    if case=='corrupted_background_reference':c['backgroundReferences']['left']['sha256']='0'*64
    if case=='widen_threshold':c['thresholds']['maxAdjacentContactDxPx']=99
    if case=='phase_exception_reuse':c['reviewedExceptions']=[{'id':'179-flight'}]
    if case=='disabled_anchor':c['staticAnchors'][0]['enabledAllFrames']=False
    if case=='unreviewed_anatomy':review['reviewed']['contactAndAnatomy']=False
    if case=='unknown_video':c['videoSha256']='0'*64
    (root/'review.json').write_text(json.dumps(review));c['reviewEvidenceSha256']=g.digest(root/'review.json')
    cat=root/'gre-learning';cat.mkdir(exist_ok=True)
    (cat/'catalog.json').write_text(json.dumps({'entries':[{'number':c['asset'],'storyMedia':{'video':{'sha256':c['videoSha256'],'url':'../fixture.mp4'},'poster':{'sha256':c['posterSha256']}}}]}))
    # The fixture catalog uses a canonical relative path matching the synthetic file.
    c['video']='gre-learning/fixture.mp4';(cat/'fixture.mp4').write_bytes(video.read_bytes())
    d=json.loads((cat/'catalog.json').read_text());d['entries'][0]['storyMedia']['video']['url']='fixture.mp4';(cat/'catalog.json').write_text(json.dumps(d))
    cp=root/'config.json';cp.write_text(json.dumps(c));policy={'scenes':{str(c['asset']):g.digest(cp)}}
    if case=='changed_config':c['frames']=7;cp.write_text(json.dumps(c))
    if case=='unknown_scene':policy={'scenes':{}}
    return cp,policy
cases=['occluded_positive','occlusion_without_review','occlusion_wrong_scene','positive','shoe_disappears','corrupted_background_reference','frozen_action','shoe_translation','shoe_proportion','loop_corruption','gradual_drift','body_growth','camera_translation','anchor_disappears','widen_threshold','phase_exception_reuse','disabled_anchor','unreviewed_anatomy','unknown_video','changed_config','unknown_scene'];results=[]
with tempfile.TemporaryDirectory(prefix='batch-registration-test-') as td:
    root=Path(td)
    for case in cases:
        cp,policy=fixture(root,case);r=g.check_new(root,cp,policy);checks=sorted({f['check'] for f in r['failures']});ok=r['status']==('PASS' if case in ['positive','occluded_positive'] else 'FAIL')
        if case in ['shoe_translation','shoe_proportion','loop_corruption','gradual_drift','body_growth','camera_translation','anchor_disappears']:
            ok=ok and bool(set(checks)&{'planted_contact_or_proportion_jump','planted_contact_drift_over_loop','body_scale_jump','fixed_camera_or_prop_jump'}) and not any('hash' in k for k in checks)
        results.append({'case':case,'passed':ok,'checks':checks})
output={'texturedFloorReferenceFixtures':True,'passed':all(r['passed'] for r in results),'tests':results};print(json.dumps(output,indent=2));raise SystemExit(0 if output['passed'] else 1)
