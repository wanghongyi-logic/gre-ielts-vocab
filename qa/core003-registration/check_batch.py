#!/usr/bin/env python3
"""Additive release gate. Legacy reviewed guard files stay immutable."""
import argparse, hashlib, importlib.util, json, subprocess, sys, math
from fractions import Fraction
from pathlib import Path
import numpy as np
from PIL import Image
HERE = Path(__file__).resolve().parent
CAPS = {'maxAdjacentContactDxPx': 3.0, 'maxAdjacentSoleDyPx': 2.0,
        'maxAdjacentSoleWidthDeltaPx': 6.0, 'maxBodyHeightRangeRatio': 0.03}
ORDER = list(range(175,190)) + [4477,4688,2524,4011,2295,3510,581,3305,4608,3404,1287,2207,516,3537,419]
NEW_SCENES = set(ORDER[25:])
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def native_metadata(sm): return {k:v for k,v in sm.items() if k not in ['video','poster']}
def canonical(value): return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module
legacy = load_module('legacy_registration', HERE.parent / 'registration/check.py')
phase = load_module('legacy_phase', HERE.parent / 'registration/phase_guard.py')
rig = load_module('core_rig', HERE.parent / 'core001-registration/rig_guard.py')
fluid = load_module('core002_fluid', HERE.parent / 'core002-registration/fluid_contact.py')
scene = load_module('core003_scene', HERE / 'scene_contact.py')
prior002 = load_module('prior002', HERE.parent / 'core002-registration/check_batch.py')
cel = load_module('core002_cel', HERE / 'cel_contact.py')
priorcore = load_module('priorcore', HERE.parent / 'core001-registration/check_batch.py')
background = load_module('background_contact', HERE / 'background_contact.py')
prior185 = load_module('prior185', HERE.parent / 'batch185-registration/check_batch.py')
previous = load_module('previous_batch', HERE.parent / 'batch-registration/check_batch.py')
body_component = load_module('core003_body', HERE / 'body_components.py')
storage = load_module('core003_storage', HERE / 'witness_storage.py')
def source_body_trace_valid(asset, trace):
    scales=[t.get('registration',{}).get('uniformScale') for t in trace]
    if not scales or any(type(v)not in [int,float] or not math.isfinite(v) or v<=0 for v in scales) or len(set(scales))!=1:return False
    for t in trace:
        mode=t.get('mode')
        if t.get('paperOpacity')!=0:return False
        if asset==419:
            # Exact reviewed combined scene cels: whole hero redraw plus rigid props.
            prop=t.get('propState',{})
            if mode!='complete-body-cel-and-rigid-props' or type(t.get('heroCel'))is not int or t['heroCel']!=t.get('registration',{}).get('pose') or prop.get('heroCel')!=t['heroCel'] or prop.get('cel')!=t.get('cel'):return False
        elif mode not in ['full-body-cel','complete-body-redrawn-cel']:return False
    return True
def geometry(c):
    c=storage.expand(c)
    return {k: c.get(k) for k in ['asset','width','height','frames','fps','thresholds','footRois','contactDetector','staticAnchors','bodyRois','visualReviewOnly','motionProfile','actionRois','backgroundReferences','contactVisibility','visibleFootNames','nativeOverlayRegions','footSupportState','footMeasurementModes','nativeDialogueSha256','partialFootScope','occlusionAnchor','rigProfile','celContactProfile','staticFootWitnesses','bodyDetector','bodyReferences','fluidProfile','sceneContactProfile','backgroundReferencesByCel','bodyExpectedHeightsByCel','nativePresentationSha256','sourceTrace','sourceTraceSha256']}
def validate(c, review):
    c=storage.expand(c)
    failures = []
    if c.get('asset') not in NEW_SCENES: failures.append({'check':'unknown_batch_scene'})
    if c.get('thresholds') != CAPS: failures.append({'check':'global_threshold_change_forbidden'})
    occluded=c.get('asset') in {4011,2295} and c.get('contactVisibility')=='fully_occluded_by_solid_counter' and c.get('contactDetector')=='no_visible_contacts_v1'
    names=c.get('visibleFootNames',[])
    stationary=c.get('staticFootWitnesses',{})
    expected_stationary={'companion-left':'companion-left-shoe','companion-right':'companion-right-shoe'} if c.get('asset') in {1287,3537} else {}
    if stationary!=expected_stationary:failures.append({'check':'incomplete_static_visible_shoe_coverage'})
    if stationary and review.get('reviewed',{}).get('staticShoeWitnesses') is not True:failures.append({'check':'static_shoe_visual_review_missing'})
    if (not names and not occluded) or len(set(names))!=len(names) or set(names)!=(set(c.get('footRois',{}))|set(stationary)): failures.append({'check':'incomplete_visible_foot_coverage'})
    if not c.get('actionRois'): failures.append({'check':'missing_meaningful_action_roi'})
    for a in c.get('actionRois',[]):
        if a.get('minPeakMeanRgbChange')!=1.0: failures.append({'check':'weakened_action_evidence_threshold'})
    if c.get('bodyDetector')!='background_component_v1':failures.append({'check':'unknown_body_detector'})
    if c.get('bodyDetector') in ['background_difference_v1','background_component_v1']:
        for name,roi in c.get('bodyRois',{}).items():
            try:background.unpack_reference(c.get('bodyReferences',{})[name],roi)
            except (ValueError,KeyError) as e:failures.append({'check':'invalid_body_reference','body':name,'detail':str(e)})
    if c.get('reviewedExceptions'): failures.append({'check':'batch_exception_not_authorized'})
    if c.get('contactDetector') not in ['dark_sole_v1','cream_component_v1','background_difference_v1','no_visible_contacts_v1']: failures.append({'check':'unknown_contact_detector'})
    occluded=c.get('asset') in {4011,2295} and c.get('contactVisibility')=='fully_occluded_by_solid_counter' and c.get('contactDetector')=='no_visible_contacts_v1'
    if not c.get('footRois') and not occluded: failures.append({'check':'missing_contact_rois'})
    if c.get('contactDetector')=='no_visible_contacts_v1' and not occluded: failures.append({'check':'unreviewed_occlusion_profile'})
    if occluded and c.get('footRois'): failures.append({'check':'occluded_profile_cannot_claim_visible_foot_checks'})
    if occluded and (review.get('reviewed',{}).get('genuineOcclusionInEveryPose') is not True or not any(a.get('id')==c.get('occlusionAnchor') for a in c.get('staticAnchors',[]))): failures.append({'check':'occlusion_not_reviewed_or_not_guarded'})
    anchors = c.get('motionProfile',{}).get('staticAnchors', c.get('staticAnchors', []))
    if len(anchors)<2 or len({a.get('id') for a in anchors}) != len(anchors): failures.append({'check':'missing_distinct_fixed_anchors'})
    for a in anchors:
        for overlay in c.get('nativeOverlayRegions',[]):
            box=a.get('roi',[])
            if len(box)==4 and len(overlay)==4 and max(box[0],overlay[0])<min(box[2],overlay[2]) and max(box[1],overlay[1])<min(box[3],overlay[3]):failures.append({'check':'fixed_anchor_obscured_by_native_dialogue','anchor':a.get('id')})
        if a.get('maxMeanAbsoluteRgbError') != 1.0 or a.get('minDarkContourIoU') != .985 or a.get('enabledAllFrames') is not True: failures.append({'check':'weakened_fixed_anchor_policy'})
    for roi in list(c.get('footRois',{}).values()) + list(c.get('bodyRois',{}).values()) + [a.get('roi',[]) for a in anchors] + [a.get('roi',[]) for a in c.get('actionRois',[])]:
        if len(roi)!=4 or not all(isinstance(x,int) for x in roi) or not (0<=roi[0]<roi[2]<=c['width'] and 0<=roi[1]<roi[3]<=c['height']): failures.append({'check':'invalid_roi'})
    if review.get('posterSha256')!=c.get('posterSha256'):failures.append({'check':'stale_visual_poster_review'})
    if review.get('nativeDialogueSha256')!=c.get('nativeDialogueSha256') or review.get('nativePresentationSha256')!=c.get('nativePresentationSha256'):failures.append({'check':'stale_native_metadata_review_binding'})
    if review.get('videoSha256')!=c.get('videoSha256') or review.get('geometrySha256')!=canonical(geometry(c)): failures.append({'check':'stale_or_reused_visual_review'})
    for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning']:
        if review.get('reviewed',{}).get(k) is not True: failures.append({'check':'visual_review_incomplete','criterion':k})
    if c.get('contactDetector')=='background_difference_v1':
        for name,roi in c.get('footRois',{}).items():
            try: background.unpack_reference(c.get('backgroundReferences',{})[name],roi)
            except (ValueError,KeyError) as e: failures.append({'check':'invalid_background_contact_reference','foot':name,'detail':str(e)})
    dynamic=c.get('backgroundReferencesByCel',{})
    if dynamic:
        if c.get('asset')!=1287 or set(dynamic)!={'far'}:failures.append({'check':'unreviewed_dynamic_contact_background'})
        for name,by in dynamic.items():
            if set(by)!={str(v) for v in c.get('celContactProfile',{}).get('frameCels',[])}:failures.append({'check':'incomplete_dynamic_contact_background'})
            for cell,ref in by.items():
                try:background.unpack_reference(ref,c['footRois'][name])
                except (ValueError,KeyError) as e:failures.append({'check':'invalid_dynamic_contact_background','detail':str(e)})
        if review.get('reviewed',{}).get('movingGateBackgroundIsolation') is not True:failures.append({'check':'dynamic_background_visual_review_missing'})
    scope=c.get('partialFootScope',{})
    modes=c.get('footMeasurementModes',{})
    expected_modes={'far':'full_visible_shoe_bounds_v1'} if c.get('asset') in {2207,516} else {}
    if scope:failures.append({'check':'unreviewed_partial_foot_scope'})
    if modes!=expected_modes:failures.append({'check':'unreviewed_contact_proxy'})
    if modes and review.get('reviewed',{}).get('fullVisibleFarShoeBounds'+str(c.get('asset'))) is not True:failures.append({'check':'full_shoe_proxy_visual_review_missing'})
    expected_bodies=c.get('bodyExpectedHeightsByCel',{})
    if expected_bodies:
        if c.get('asset') not in {2207,516,419} or set(expected_bodies)!=set(c.get('bodyRois',{})):failures.append({'check':'unreviewed_articulated_body_profile'})
        if review.get('reviewed',{}).get('articulatedBodyGeometry') is not True:failures.append({'check':'articulated_body_review_missing'})
        for name,by in expected_bodies.items():
            if set(by)!={str(v) for v in c.get('celContactProfile',{}).get('frameCels',[])} or any(type(v)is not int or v<=0 for v in by.values()):failures.append({'check':'incomplete_articulated_body_profile'})
        if 'complete-body-geometry' not in {w.get('id')for w in c.get('celContactProfile',{}).get('witnesses',[])}:failures.append({'check':'missing_complete_body_geometry_witness'})
    if c.get('motionProfile'): failures.append({'check':'unreviewed_moving_foot_profile_forbidden'})
    failures+=rig.validate(c,review,background)
    failures+=cel.validate(c,review,background)
    failures+=fluid.validate(c,review)
    failures+=scene.validate(c,review,background)
    return failures

def measure(frames,c):
    """Every frame plus seam. Source proportions and intended action also require visual review."""
    c=storage.expand(c)
    failures=[]; summary={'contacts':{},'anchors':{},'bodies':{}}; scale=312/c['width']
    detector=legacy.contact if c['contactDetector']=='dark_sole_v1' else phase.cream_shoe_contact
    for name,roi in c['footRois'].items():
        contact_cache={}
        contacts=[];mode=c.get('footMeasurementModes',{}).get(name);toe_only=mode in ['exposed_toe_and_sole_visual_width','exposed_heel_and_sole_visual_width']
        for i,f in enumerate(frames):
            try:
                x1,y1,x2,y2=roi;cell=str(c.get('celContactProfile',{}).get('frameCels',[0]*len(frames))[i]);ref=c.get('backgroundReferencesByCel',{}).get(name,{}).get(cell,c.get('backgroundReferences',{}).get(name));cache_key=(cell if name in c.get('backgroundReferencesByCel',{}) else None,f[y1:y2,x1:x2].tobytes())
                if cache_key in contact_cache:value=dict(contact_cache[cache_key])
                else:
                    value=background.contact(f,roi,ref,allow_hidden_left_heel=mode=='exposed_toe_and_sole_visual_width',allow_hidden_right_toe=mode=='exposed_heel_and_sole_visual_width') if c['contactDetector']=='background_difference_v1' else detector(f,roi)
                    contact_cache[cache_key]=dict(value)
                if mode=='full_visible_shoe_bounds_v1':
                    value['contactX']=(value['exposedHeelX']+value['exposedToeX'])/2
                    value['soleWidth']=value['exposedToeX']-value['exposedHeelX']+1
                if toe_only:value['contactX']=value['exposedHeelX' if mode=='exposed_heel_and_sole_visual_width' else 'exposedToeX']
                contacts.append(value)
            except ValueError as e: failures.append({'check':'unreliable_foot_evidence','foot':name,'frame':i,'detail':str(e)});contacts.append(None)
        transitions=[]
        for i,current in enumerate(contacts):
            previous=contacts[i-1]
            if current is None or previous is None: continue
            q={'fromFrame':(i-1)%len(frames),'toFrame':i,'dx':abs(current['contactX']-previous['contactX'])*scale,'dy':abs(current['soleY']-previous['soleY'])*scale,'dw':None if toe_only else abs(current['soleWidth']-previous['soleWidth'])*scale}
            transitions.append(q)
            if q['dx']>3 or q['dy']>2 or (q['dw'] is not None and q['dw']>6): failures.append({'check':'planted_contact_or_proportion_jump','foot':name,**q})
        # Adjacent limits alone could hide gradual drifting planted feet.
        valid=[v for v in contacts if v is not None]
        if valid:
            extent={key:(max(x[key] for x in valid)-min(x[key] for x in valid))*scale for key in ['contactX','soleY','soleWidth']}
            if extent['contactX']>3 or extent['soleY']>2: failures.append({'check':'planted_contact_drift_over_loop','foot':name,'range':extent})
            if toe_only:extent['soleWidth']=None
            summary['contacts'][name]={'range':extent,'transitions':transitions,'horizontalLandmark':('exposed heel' if mode=='exposed_heel_and_sole_visual_width' else 'exposed toe') if toe_only else ('full visible heel/toe bounds midpoint' if mode=='full_visible_shoe_bounds_v1' else 'sole-band center'),'shoeWidthValidation':'visual-review-only; overlapping heel makes full sole band unreliable' if toe_only else ('adjacent full visible silhouette width limit' if mode=='full_visible_shoe_bounds_v1' else 'adjacent sole-band width limit')}
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
        x1,y1,x2,y2=roi; heights=[];body_cache={}
        body_reference=background.unpack_reference(c['bodyReferences'][name],roi) if c.get('bodyDetector') in ['background_difference_v1','background_component_v1'] else None
        for i,f in enumerate(frames):
            if c.get('bodyDetector') in ['background_difference_v1','background_component_v1']:
                ref=body_reference
                mask=np.max(np.abs(f[y1:y2,x1:x2].astype(int)-ref.astype(int)),axis=2)>25
                ys,_=np.where(mask)
            else:ys,_=np.where(np.min(f[y1:y2,x1:x2],2)<130)
            if not len(ys): failures.append({'check':'body_evidence_missing','body':name,'frame':i});continue
            if c.get('bodyDetector')=='background_component_v1':
                try:
                    key=np.packbits(mask).tobytes()
                    if key not in body_cache:body_cache[key]=body_component.height(mask)
                    heights.append(body_cache[key])
                except ValueError as e:failures.append({'check':'body_evidence_missing','body':name,'frame':i,'detail':str(e)})
            else:heights.append(int(ys.max()-ys.min()+1))
        if heights:
            expected=c.get('bodyExpectedHeightsByCel',{}).get(name)
            if expected:
                residuals=[h/expected[str(c['celContactProfile']['frameCels'][i])] for i,h in enumerate(heights)]
                ratio=(max(residuals)-min(residuals))/float(np.median(residuals));absolute=max(abs(v-1)for v in residuals)
                summary['bodies'][name]={'phaseNormalizedHeightRangeRatio':ratio,'maxAbsoluteHeightResidualRatio':absolute,'rawHeightRangeRatio':(max(heights)-min(heights))/float(np.median(heights)),'scope':'Exact independently reviewed whole-body articulation by cel; unchanged3% residual scale cap plus full-body raster witness. Not a blanket lean exception.'}
                if ratio>.03 or absolute>.03:failures.append({'check':'body_scale_jump','body':name,'ratio':ratio,'absolute':absolute})
            else:
                ratio=(max(heights)-min(heights))/float(np.median(heights));summary['bodies'][name]={'heightRangeRatio':ratio}
                if ratio>.03: failures.append({'check':'body_scale_jump','body':name,'ratio':ratio})
    scene_bad,scene_summary=scene.measure(frames,c,background);failures+=scene_bad
    if scene_summary:summary['sceneContact']=scene_summary
    fluid_bad,fluid_summary=fluid.measure(frames,c);failures+=fluid_bad
    if fluid_summary:summary['fluid']=fluid_summary
    cel_bad,cel_summary=cel.measure(frames,c,background);failures+=cel_bad
    if cel_summary:summary['celContact']=cel_summary
    rig_bad,rig_summary=rig.measure(frames,c,background);failures+=rig_bad
    if rig_summary:summary['rig']=rig_summary
    return failures,summary

def check_new(root,path,policy):
    c=storage.expand(json.loads(path.read_text()));n=str(c.get('asset'));fail=[]
    if n not in policy.get('scenes',{}):return {'asset':n,'status':'FAIL','failures':[{'check':'unknown_unreviewed_scene'}]}
    if digest(path)!=policy['scenes'][n]:fail.append({'check':'unreviewed_config'})
    rp=legacy.contained(root,c['reviewEvidence']);review=json.loads(rp.read_text())
    if digest(rp)!=c['reviewEvidenceSha256']:fail.append({'check':'review_evidence_hash_mismatch'})
    if review.get('componentEvidence'):
        evidence=legacy.contained(root,review['componentEvidence']['path'])
        if digest(evidence)!=review['componentEvidence']['sha256']:fail.append({'check':'component_review_evidence_changed'})
    if review.get('nativePresentationEvidence'):
        evidence=legacy.contained(root,review['nativePresentationEvidence']['path'])
        if digest(evidence)!=review['nativePresentationEvidence']['sha256']:fail.append({'check':'native_presentation_evidence_changed'})
    fail+=validate(c,review)
    trace_path=legacy.contained(root,c['sourceTrace'])
    if digest(trace_path)!=c['sourceTraceSha256']:fail.append({'check':'source_construction_trace_changed'})
    trace=json.loads(trace_path.read_text())
    if len(trace)!=c['frames'] or [t.get('frame')for t in trace]!=list(range(c['frames'])) or [t.get('cel')for t in trace]!=c['celContactProfile']['frameCels']:fail.append({'check':'source_pose_schedule_changed'})
    if not source_body_trace_valid(c['asset'],trace):fail.append({'check':'source_requires_constant_scale_complete_body_cels'})
    video=legacy.contained(root,c['video']);poster=legacy.contained(root,c['poster'])
    if digest(video)!=c['videoSha256']:fail.append({'check':'unreviewed_media_hash'})
    if digest(poster)!=c['posterSha256']:fail.append({'check':'unreviewed_poster_hash'})
    entries=json.loads((root/'gre-learning/catalog.json').read_text())['entries'];entry=next((e for e in entries if e['number']==c['asset']),{})
    sm=entry.get('storyMedia',{})
    if c.get('nativePresentationSha256')!=canonical(native_metadata(sm)):fail.append({'check':'native_presentation_metadata_changed'})
    if c.get('nativeDialogueSha256')!=canonical({'stages':sm.get('stages'),'posterDialogue':sm.get('posterDialogue')}):fail.append({'check':'native_dialogue_metadata_changed'})
    if sm.get('video',{}).get('sha256')!=c['videoSha256'] or 'gre-learning/'+sm.get('video',{}).get('url','')!=c['video'] or sm.get('poster',{}).get('sha256')!=c['posterSha256']:fail.append({'check':'catalog_media_mismatch'})
    try:
        actual_poster=legacy.contained(root,'gre-learning/'+sm.get('poster',{}).get('url','')).resolve()
        if actual_poster!=poster.resolve():fail.append({'check':'catalog_poster_path_mismatch'})
    except ValueError:fail.append({'check':'catalog_poster_path_mismatch'})
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height,avg_frame_rate,codec_name,pix_fmt','-of','json',str(video)]))
    streams=probe.get('streams',[])
    if len(streams)!=1 or streams[0].get('width')!=c['width'] or streams[0].get('height')!=c['height'] or Fraction(streams[0].get('avg_frame_rate','0'))!=Fraction(c['fps']):fail.append({'check':'video_dimensions_or_fps_mismatch'})
    if streams and (streams[0].get('codec_name')!='h264' or streams[0].get('pix_fmt')!='yuv420p'):fail.append({'check':'unexpected_video_codec_or_pixel_format'})
    if Image.open(poster).format!='WEBP':fail.append({'check':'poster_codec_mismatch'})
    poster_blob=poster.read_bytes();poster_chunks=[];pi=12
    while pi+8<=len(poster_blob):
        kind=poster_blob[pi:pi+4];size=int.from_bytes(poster_blob[pi+4:pi+8],'little');poster_chunks.append(kind);pi+=8+size+(size%2)
    if b'VP8L' not in poster_chunks or b'VP8 ' in poster_chunks:fail.append({'check':'poster_requires_lossless_webp'})
    all_streams=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_type','-of','json',str(video)]))['streams']
    if len(all_streams)!=1 or all_streams[0].get('codec_type')!='video':fail.append({'check':'video_must_be_silent_single_stream'})
    packets=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','packet=flags','-of','json',str(video)]))['packets']
    if sum('K' in x.get('flags','') for x in packets)!=1:fail.append({'check':'video_must_be_single_gop'})
    blob=video.read_bytes();offset=0;boxes=[]
    while offset+8<=len(blob):
        size=int.from_bytes(blob[offset:offset+4],'big');kind=blob[offset+4:offset+8];header=8
        if size==1:size=int.from_bytes(blob[offset+8:offset+16],'big');header=16
        if size==0:size=len(blob)-offset
        if size<header or offset+size>len(blob):break
        boxes.append(kind);offset+=size
    if b'moov' not in boxes or b'mdat' not in boxes or boxes.index(b'moov')>boxes.index(b'mdat'):fail.append({'check':'video_requires_faststart'})
    frames=legacy.decode(video,c['width'],c['height'])
    if len(frames)!=c['frames']:fail.append({'check':'frame_count_mismatch'})
    if not np.array_equal(frames[0],np.array(Image.open(poster).convert('RGB'))):fail.append({'check':'poster_not_decoded_first_frame'})
    if fail:return {'asset':n,'status':'FAIL','failures':fail}
    bad,summary=measure(frames,c)
    fail+=bad
    summary['contactScope']='No visible feet: genuine solid-counter occlusion reviewed; no numerical foot pass is claimed.' if c.get('contactDetector')=='no_visible_contacts_v1' else ('Stationary shoe landmarks checked; no planted-ground contact claimed.' if c.get('footSupportState')=='stationary_shoes_no_ground_claim' else 'Declared hero contacts checked across all decoded frames, full cycle and seam. Exact2207/516 far shoes use full visible outline bounds. Static companion shoes have separate fixed raster witnesses, not sole-band ground-contact claims.')
    summary['nativeDialogueScope']='Native overlays are excluded from decoded-media measurements. Declared overlay regions, when supplied, are checked against anchors; actual rendered containment and occlusion require separate integration review.'
    summary['actionEvidence']={}
    for a in c['actionRois']:
        x1,y1,x2,y2=a['roi'];ref=frames[0,y1:y2,x1:x2].astype(float)
        peak=max(float(np.abs(f[y1:y2,x1:x2].astype(float)-ref).mean()) for f in frames)
        summary['actionEvidence'][a['id']]={'peakMeanRgbChange':peak,'meaningAndTrajectory':'visual-review-only'}
        if peak<1.0:fail.append({'check':'action_roi_has_no_visible_change','action':a['id'],'peak':peak})
    return {'asset':n,'status':'FAIL' if fail else 'PASS','videoSha256':c['videoSha256'],'configSha256':digest(path),'failures':fail,'measurements':summary,'visualReviewOnly':c['visualReviewOnly']}

def validate_catalog(catalog,known):
    fail=[];ids=catalog.get('learningRelease',{}).get('approvedIds',[])
    if catalog.get('learningRelease',{}).get('sampleMode')!='storybook-reviewed-order' or catalog.get('learningRelease',{}).get('batchSize')!=5:fail.append({'check':'wrong_reviewed_order_mode'})
    if ids!=ORDER or any(type(n) is not int or n<=0 or n>9007199254740991 for n in ids) or len(ids)!=len(set(ids)):fail.append({'check':'unreviewed_order_or_invalid_ids'})
    entries=catalog.get('entries',[]);active=[e for e in entries if e.get('storyMedia')]
    if {str(e.get('number')) for e in active}!=known or len(active)!=len(known):fail.append({'check':'active_approved_reviewed_scene_sets_differ'})
    for e in active:
        n=e.get('number')
        if n not in ORDER or type(e.get('displayOrdinal')) is not int or e.get('displayOrdinal')!=ORDER.index(n)+1:fail.append({'check':'canonical_id_display_ordinal_mismatch','asset':n})
    return fail

def verify_policy_files(root,policy):
    results=[]
    if len(policy.get('immutablePriorFiles',{}))!=85 or canonical(policy.get('immutablePriorFiles'))!='22ab784426f9b424e4142d027685af74273a882d43766a4c4b8d002f31cde292':results.append({'status':'FAIL','failures':[{'check':'immutable_prior_manifest_changed'}]})
    for group in ['immutablePriorFiles','extensionFiles']:
        for relative,expected in policy[group].items():
            try:actual=digest(legacy.contained(root,relative))
            except (OSError,ValueError):actual=None
            if actual!=expected:results.append({'status':'FAIL','failures':[{'check':'reviewed_guard_changed','path':relative}]})
    return results

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,required=True);parser.add_argument('--report',type=Path);args=parser.parse_args();root=args.root.resolve()
    policy=json.loads((HERE/'batch-policy-lock.json').read_text());results=[]
    results+=verify_policy_files(root,policy)
    policies=[(HERE.parent/'registration',legacy.check_scene),(HERE.parent/'batch-registration',previous.check_new),(HERE.parent/'batch185-registration',prior185.check_new),(HERE.parent/'core001-registration',priorcore.check_new),(HERE.parent/'core002-registration',prior002.check_new),(HERE,check_new)]
    resolved=[(d,fn,json.loads((d/('policy-lock.json' if d.name=='registration' else 'batch-policy-lock.json')).read_text())) for d,fn in policies]
    known=set().union(*(set(p['scenes']) for _,_,p in resolved))
    if set(policy['scenes'])!={str(n) for n in NEW_SCENES} or policy.get('approvedOrder')!=ORDER:results.append({'status':'FAIL','failures':[{'check':'incomplete_or_unreviewed_core_policy'}]})
    bad=validate_catalog(json.loads((root/'gre-learning/catalog.json').read_text()),known)
    if bad:results.append({'status':'FAIL','failures':bad})
    for d,fn,p in resolved:
        for n in p['scenes']:
            try:results.append(fn(root,d/'configs'/f'{n}.json',p))
            except Exception as e:results.append({'asset':n,'status':'FAIL','failures':[{'check':'unreadable_or_missing_scene','detail':str(e)}]})
    output={'status':'PASS' if results and all(r['status']=='PASS' for r in results) else 'FAIL','scenes':results,'visualReviewStillRequired':True}
    text=json.dumps(output,indent=2)+'\n'
    if args.report:args.report.write_text(text)
    print(text);return 0 if output['status']=='PASS' else 1
if __name__=='__main__':sys.exit(main())
