#!/usr/bin/env python3
"""Additive release gate. Legacy reviewed guard files stay immutable."""
import argparse, hashlib, importlib.util, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
HERE = Path(__file__).resolve().parent
CAPS = {'maxAdjacentContactDxPx': 3.0, 'maxAdjacentSoleDyPx': 2.0,
        'maxAdjacentSoleWidthDeltaPx': 6.0, 'maxBodyHeightRangeRatio': 0.03}
NEW_SCENES = set(range(180, 185))
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def canonical(value): return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module
legacy = load_module('legacy_registration', HERE.parent / 'registration/check.py')
phase = load_module('legacy_phase', HERE.parent / 'registration/phase_guard.py')
background = load_module('background_contact', HERE / 'background_contact.py')
def geometry(c):
    return {k: c.get(k) for k in ['asset','width','height','frames','fps','thresholds','footRois','contactDetector','staticAnchors','bodyRois','visualReviewOnly','motionProfile','actionRois','backgroundReferences','contactVisibility']}
def validate(c, review):
    failures = []
    if c.get('asset') not in NEW_SCENES: failures.append({'check':'unknown_batch_scene'})
    if c.get('thresholds') != CAPS: failures.append({'check':'global_threshold_change_forbidden'})
    if not c.get('actionRois'): failures.append({'check':'missing_meaningful_action_roi'})
    for a in c.get('actionRois',[]):
        if a.get('minPeakMeanRgbChange')!=1.0: failures.append({'check':'weakened_action_evidence_threshold'})
    if c.get('reviewedExceptions'): failures.append({'check':'batch_exception_not_authorized'})
    if c.get('contactDetector') not in ['dark_sole_v1','cream_component_v1','background_difference_v1','no_visible_contacts_v1']: failures.append({'check':'unknown_contact_detector'})
    occluded=c.get('asset')==184 and c.get('contactVisibility')=='fully_occluded_by_solid_counter' and c.get('contactDetector')=='no_visible_contacts_v1'
    if not c.get('footRois') and not occluded: failures.append({'check':'missing_contact_rois'})
    if c.get('contactDetector')=='no_visible_contacts_v1' and not occluded: failures.append({'check':'unreviewed_occlusion_profile'})
    if occluded and c.get('footRois'): failures.append({'check':'occluded_profile_cannot_claim_visible_foot_checks'})
    if occluded and (review.get('reviewed',{}).get('genuineOcclusionInEveryPose') is not True or not any(a.get('id')=='solid-counter' for a in c.get('staticAnchors',[]))): failures.append({'check':'occlusion_not_reviewed_or_not_guarded'})
    anchors = c.get('motionProfile',{}).get('staticAnchors', c.get('staticAnchors', []))
    if len(anchors)<2 or len({a.get('id') for a in anchors}) != len(anchors): failures.append({'check':'missing_distinct_fixed_anchors'})
    for a in anchors:
        if a.get('maxMeanAbsoluteRgbError') != 1.0 or a.get('minDarkContourIoU') != .985 or a.get('enabledAllFrames') is not True: failures.append({'check':'weakened_fixed_anchor_policy'})
    for roi in list(c.get('footRois',{}).values()) + list(c.get('bodyRois',{}).values()) + [a.get('roi',[]) for a in anchors] + [a.get('roi',[]) for a in c.get('actionRois',[])]:
        if len(roi)!=4 or not all(isinstance(x,int) for x in roi) or not (0<=roi[0]<roi[2]<=c['width'] and 0<=roi[1]<roi[3]<=c['height']): failures.append({'check':'invalid_roi'})
    if review.get('videoSha256')!=c.get('videoSha256') or review.get('geometrySha256')!=canonical(geometry(c)): failures.append({'check':'stale_or_reused_visual_review'})
    for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning']:
        if review.get('reviewed',{}).get(k) is not True: failures.append({'check':'visual_review_incomplete','criterion':k})
    if c.get('contactDetector')=='background_difference_v1':
        for name,roi in c.get('footRois',{}).items():
            try: background.unpack_reference(c.get('backgroundReferences',{})[name],roi)
            except (ValueError,KeyError) as e: failures.append({'check':'invalid_background_contact_reference','foot':name,'detail':str(e)})
    if c.get('motionProfile'): failures.append({'check':'unreviewed_moving_foot_profile_forbidden'})
    return failures

def measure(frames,c):
    """Every frame plus seam. Source proportions and intended action also require visual review."""
    failures=[]; summary={'contacts':{},'anchors':{},'bodies':{}}; scale=312/c['width']
    detector=legacy.contact if c['contactDetector']=='dark_sole_v1' else phase.cream_shoe_contact
    for name,roi in c['footRois'].items():
        contacts=[]
        for i,f in enumerate(frames):
            try: contacts.append(background.contact(f,roi,c['backgroundReferences'][name]) if c['contactDetector']=='background_difference_v1' else detector(f,roi))
            except ValueError as e: failures.append({'check':'unreliable_foot_evidence','foot':name,'frame':i,'detail':str(e)});contacts.append(None)
        transitions=[]
        for i,current in enumerate(contacts):
            previous=contacts[i-1]
            if current is None or previous is None: continue
            q={'fromFrame':(i-1)%len(frames),'toFrame':i,'dx':abs(current['contactX']-previous['contactX'])*scale,'dy':abs(current['soleY']-previous['soleY'])*scale,'dw':abs(current['soleWidth']-previous['soleWidth'])*scale}
            transitions.append(q)
            if q['dx']>3 or q['dy']>2 or q['dw']>6: failures.append({'check':'planted_contact_or_proportion_jump','foot':name,**q})
        # Adjacent limits alone could hide gradual drifting planted feet.
        valid=[v for v in contacts if v is not None]
        if valid:
            extent={key:(max(x[key] for x in valid)-min(x[key] for x in valid))*scale for key in ['contactX','soleY','soleWidth']}
            if extent['contactX']>3 or extent['soleY']>2: failures.append({'check':'planted_contact_drift_over_loop','foot':name,'range':extent})
            summary['contacts'][name]={'range':extent,'transitions':transitions}
    for a in c['staticAnchors']:
        x1,y1,x2,y2=a['roi']; reference=frames[0,y1:y2,x1:x2]; mask=np.min(reference,2)<130
        if mask.sum()<20 or reference.std()<8: failures.append({'check':'anchor_evidence_missing','anchor':a['id']})
        maximum=0.; minimum=1.
        for i,f in enumerate(frames):
            z=f[y1:y2,x1:x2]; m=np.min(z,2)<130; union=np.count_nonzero(mask|m)
            iou=np.count_nonzero(mask&m)/union if union else 1.; mae=float(np.abs(z.astype(float)-reference).mean())
            maximum=max(maximum,mae);minimum=min(minimum,iou)
            if mae>1 or iou<.985: failures.append({'check':'fixed_camera_or_prop_jump','anchor':a['id'],'frame':i,'mae':mae,'iou':iou})
        summary['anchors'][a['id']]={'maxMae':maximum,'minIoU':minimum,'checkedFrames':len(frames)}
    for name,roi in c.get('bodyRois',{}).items():
        x1,y1,x2,y2=roi; heights=[]
        for i,f in enumerate(frames):
            ys,_=np.where(np.min(f[y1:y2,x1:x2],2)<130)
            if not len(ys): failures.append({'check':'body_evidence_missing','body':name,'frame':i});continue
            heights.append(int(ys.max()-ys.min()+1))
        if heights:
            ratio=(max(heights)-min(heights))/float(np.median(heights));summary['bodies'][name]={'heightRangeRatio':ratio}
            if ratio>.03: failures.append({'check':'body_scale_jump','body':name,'ratio':ratio})
    return failures,summary

def check_new(root,path,policy):
    c=json.loads(path.read_text());n=str(c.get('asset'));fail=[]
    if n not in policy.get('scenes',{}):return {'asset':n,'status':'FAIL','failures':[{'check':'unknown_unreviewed_scene'}]}
    if digest(path)!=policy['scenes'][n]:fail.append({'check':'unreviewed_config'})
    rp=legacy.contained(root,c['reviewEvidence']);review=json.loads(rp.read_text())
    if digest(rp)!=c['reviewEvidenceSha256']:fail.append({'check':'review_evidence_hash_mismatch'})
    fail+=validate(c,review)
    video=legacy.contained(root,c['video']);poster=legacy.contained(root,c['poster'])
    if digest(video)!=c['videoSha256']:fail.append({'check':'unreviewed_media_hash'})
    if digest(poster)!=c['posterSha256']:fail.append({'check':'unreviewed_poster_hash'})
    entries=json.loads((root/'gre-learning/catalog.json').read_text())['entries'];entry=next((e for e in entries if e['number']==c['asset']),{})
    sm=entry.get('storyMedia',{})
    if sm.get('video',{}).get('sha256')!=c['videoSha256'] or 'gre-learning/'+sm.get('video',{}).get('url','')!=c['video'] or sm.get('poster',{}).get('sha256')!=c['posterSha256']:fail.append({'check':'catalog_media_mismatch'})
    frames=legacy.decode(video,c['width'],c['height'])
    if len(frames)!=c['frames']:fail.append({'check':'frame_count_mismatch'})
    if not np.array_equal(frames[0],np.array(Image.open(poster).convert('RGB'))):fail.append({'check':'poster_not_decoded_first_frame'})
    if fail:return {'asset':n,'status':'FAIL','failures':fail}
    bad,summary=measure(frames,c)
    fail+=bad
    summary['contactScope']='No visible feet: genuine solid-counter occlusion reviewed; no numerical foot pass is claimed.' if c.get('contactDetector')=='no_visible_contacts_v1' else 'Every visible planted foot checked across decoded frames and loop seam.'
    summary['actionEvidence']={}
    for a in c['actionRois']:
        x1,y1,x2,y2=a['roi'];ref=frames[0,y1:y2,x1:x2].astype(float)
        peak=max(float(np.abs(f[y1:y2,x1:x2].astype(float)-ref).mean()) for f in frames)
        summary['actionEvidence'][a['id']]={'peakMeanRgbChange':peak,'meaningAndTrajectory':'visual-review-only'}
        if peak<1.0:fail.append({'check':'action_roi_has_no_visible_change','action':a['id'],'peak':peak})
    return {'asset':n,'status':'FAIL' if fail else 'PASS','videoSha256':c['videoSha256'],'configSha256':digest(path),'failures':fail,'measurements':summary,'visualReviewOnly':c['visualReviewOnly']}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,required=True);parser.add_argument('--report',type=Path);args=parser.parse_args();root=args.root.resolve()
    policy=json.loads((HERE/'batch-policy-lock.json').read_text());results=[]
    for relative,expected in policy['immutableLegacyFiles'].items():
        if digest(legacy.contained(root,relative))!=expected:results.append({'status':'FAIL','failures':[{'check':'legacy_guard_changed','path':relative}]})
    for relative,expected in policy['extensionFiles'].items():
        if digest(legacy.contained(root,relative))!=expected:results.append({'status':'FAIL','failures':[{'check':'extension_code_changed','path':relative}]})
    old_policy=json.loads((HERE.parent/'registration/policy-lock.json').read_text())
    active={str(e['number']) for e in json.loads((root/'gre-learning/catalog.json').read_text())['entries'] if e.get('storyMedia')}
    known=set(old_policy['scenes'])|set(policy['scenes'])
    if set(policy['scenes'])!={str(n) for n in NEW_SCENES}:results.append({'status':'FAIL','failures':[{'check':'incomplete_five_scene_review_policy'}]})
    catalog=json.loads((root/'gre-learning/catalog.json').read_text())
    approved={str(n) for n in catalog.get('learningRelease',{}).get('approvedIds',[])}
    if approved!=known or active!=known:results.append({'status':'FAIL','failures':[{'check':'active_approved_reviewed_scene_sets_differ','active':sorted(active),'approved':sorted(approved),'reviewed':sorted(known)}]})
    for n in active-known:results.append({'asset':n,'status':'FAIL','failures':[{'check':'unknown_catalog_scene'}]})
    for n in sorted(known):
        try:
            result=legacy.check_scene(root,HERE.parent/'registration/configs'/f'{n}.json',old_policy) if n in old_policy['scenes'] else check_new(root,HERE/'configs'/f'{n}.json',policy)
            results.append(result)
        except Exception as e:results.append({'asset':n,'status':'FAIL','failures':[{'check':'unreadable_or_missing_scene','detail':str(e)}]})
    output={'status':'PASS' if results and all(r['status']=='PASS' for r in results) else 'FAIL','scenes':results,'visualReviewStillRequired':True}
    text=json.dumps(output,indent=2)+'\n'
    if args.report:args.report.write_text(text)
    print(text);return 0 if output['status']=='PASS' else 1
if __name__=='__main__':sys.exit(main())
