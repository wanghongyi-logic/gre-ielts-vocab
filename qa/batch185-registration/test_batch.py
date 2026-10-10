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
        x=30+(4 if case in ['shoe_translation','outer189_left_shift'] and i==3 else 0)
        y=78+ (3 if case=='loop_corruption' and i==5 else 0)
        w=10+(4 if case=='shoe_proportion' and i==3 else 0)
        if case=='gradual_drift':x+=i
        a[y:y+5,x:x+w]=[80,65,50];right_x=55+(4 if case in ['toe_proxy_shift','outer189_right_shift'] and i==3 else 0);a[78:83,right_x:right_x+10]=[80,65,50]
        if case=='codec_edge_speckle_positive' and i==3:a[83:86,60]=[80,65,50]
        if case in ['shoe_disappears','outer189_missing_left'] and i==3:a[75:85,25:49]=245
        if case=='outer189_missing_right' and i==3:a[75:85,52:78]=245
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
    c={'asset':185,'width':100,'height':100,'fps':25,'frames':6,'thresholds':dict(g.CAPS),'visibleFootNames':['left','right'],'nativeOverlayRegions':[],'footRois':{'left':[25,75,50,90],'right':[52,75,69,90]},'bodyRois':{'body':[42,20,58,73]},'actionRois':[{'id':'gesture','roi':[59,44,72,51],'minPeakMeanRgbChange':1.0}],'contactDetector':'background_difference_v1','staticAnchors':[{'id':'left','roi':[2,2,28,48],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True},{'id':'right','roi':[68,5,88,43],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True}],'video':'fixture.mp4','videoSha256':g.digest(video),'poster':'poster.png','posterSha256':g.digest(root/'poster.png'),'visualReviewOnly':['Synthetic geometry fixture'],'reviewedExceptions':[],'reviewEvidence':'review.json','nativeDialogueSha256':g.canonical({'stages':None,'posterDialogue':None})}
    if case.startswith('toe_proxy'):
        c['footRois']={'speaker-left':c['footRois']['left'],'speaker-right':[52,75,78,90]};c['visibleFootNames']=list(c['footRois']);c['footMeasurementModes']={'speaker-right':'exposed_toe_and_sole_visual_width'}
        if case=='toe_proxy_reuse':c['asset']=186
    if case.startswith('outer189'):
        c.update({'asset':189,'footSupportState':'stationary_shoes_no_ground_claim','footMeasurementModes':{'left':'exposed_heel_and_sole_visual_width','right':'exposed_toe_and_sole_visual_width'}});c['footRois']['right']=[52,75,78,90]
        if case=='outer189_wrong_mode':c['footMeasurementModes']['left']='exposed_toe_and_sole_visual_width'
    background=np.full((100,100,3),245,dtype=np.uint8);background[86:88,20:69]=[100,70,40]
    c['backgroundReferences']={name:g.background.pack_reference(background[roi[1]:roi[3],roi[0]:roi[2]]) for name,roi in c['footRois'].items()}
    if case in ['occluded_positive','occlusion_without_review','occlusion_wrong_scene']:
        c.update({'asset':188,'contactDetector':'no_visible_contacts_v1','contactVisibility':'fully_occluded_by_solid_counter','footRois':{},'visibleFootNames':[],'backgroundReferences':{}})
        c['staticAnchors'].append({'id':'solid-counter','roi':[25,72,68,91],'maxMeanAbsoluteRgbError':1.0,'minDarkContourIoU':.985,'enabledAllFrames':True})
    if case in ['stationary_shoe_positive','stationary_shoe_without_review']:
        c['asset']=189;c['footSupportState']='stationary_shoes_no_ground_claim'
    if case=='overlay_covers_anchor':c['nativeOverlayRegions']=[[2,2,28,48]]
    if case=='omitted_visible_foot':del c['footRois']['right']
    review={'videoSha256':c['videoSha256'],'geometrySha256':g.canonical(g.geometry(c)),'reviewed':{k:True for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning']}}
    if case.startswith('outer189'):
        review['reviewed']['stationaryShoesInEveryPose']=True
        if case!='outer189_without_review':review['reviewed']['outerShoeLandmarksWithVisualContours189']=True
    if case.startswith('toe_proxy') and case!='toe_proxy_without_review':review['reviewed']['exposedToeAndSoleWithVisualWidth185']=True
    if case=='stationary_shoe_positive':review['reviewed']['stationaryShoesInEveryPose']=True
    if case=='occluded_positive':review['reviewed']['genuineOcclusionInEveryPose']=True
    if case=='occlusion_wrong_scene':c['asset']=185
    if case=='corrupted_background_reference':c['backgroundReferences']['left']['sha256']='0'*64
    if case=='widen_threshold':c['thresholds']['maxAdjacentContactDxPx']=99
    if case=='phase_exception_reuse':c['reviewedExceptions']=[{'id':'179-flight'}]
    if case=='disabled_anchor':c['staticAnchors'][0]['enabledAllFrames']=False
    if case=='unreviewed_anatomy':review['reviewed']['contactAndAnatomy']=False
    if case=='changed_native_dialogue':c['nativeDialogueSha256']='0'*64
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
cases=['outer189_positive','outer189_left_shift','outer189_right_shift','outer189_missing_left','outer189_missing_right','outer189_without_review','outer189_wrong_mode','changed_native_dialogue','toe_proxy_positive','toe_proxy_shift','toe_proxy_reuse','toe_proxy_without_review','codec_edge_speckle_positive','occluded_positive','stationary_shoe_positive','stationary_shoe_without_review','overlay_covers_anchor','omitted_visible_foot','occlusion_without_review','occlusion_wrong_scene','positive','shoe_disappears','corrupted_background_reference','frozen_action','shoe_translation','shoe_proportion','loop_corruption','gradual_drift','body_growth','camera_translation','anchor_disappears','widen_threshold','phase_exception_reuse','disabled_anchor','unreviewed_anatomy','unknown_video','changed_config','unknown_scene'];results=[]
with tempfile.TemporaryDirectory(prefix='batch-registration-test-') as td:
    root=Path(td)
    for case in cases:
        cp,policy=fixture(root,case);r=g.check_new(root,cp,policy);checks=sorted({f['check'] for f in r['failures']});ok=r['status']==('PASS' if case in ['positive','occluded_positive','stationary_shoe_positive','toe_proxy_positive','codec_edge_speckle_positive','outer189_positive'] else 'FAIL')
        if case in ['outer189_left_shift','outer189_right_shift','toe_proxy_shift','shoe_translation','shoe_proportion','loop_corruption','gradual_drift','body_growth','camera_translation','anchor_disappears']:
            ok=ok and bool(set(checks)&{'planted_contact_or_proportion_jump','planted_contact_drift_over_loop','body_scale_jump','fixed_camera_or_prop_jump'}) and not any('hash' in k for k in checks)
        if case in ['outer189_missing_left','outer189_missing_right']:ok=ok and 'unreliable_foot_evidence' in checks and not any('hash' in k for k in checks)
        results.append({'case':case,'passed':ok,'checks':checks})
output={'texturedFloorReferenceFixtures':True,'passed':all(r['passed'] for r in results),'tests':results};print(json.dumps(output,indent=2));raise SystemExit(0 if output['passed'] else 1)
