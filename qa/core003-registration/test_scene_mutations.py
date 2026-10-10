#!/usr/bin/env python3
"""Mutate each actual reviewed scene's decoded raster, then re-encode/rebind media.

The references, contacts, and thresholds stay exactly those of the accepted
scene. Test-only review rebindings prevent hash rejection from masquerading as
geometry detection. They never write or approve production review files.
"""
import argparse,copy,importlib.util,json,subprocess,tempfile,sys,shutil
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('g',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
def run_one(root,c,frames,case):
 trace=root/c['sourceTrace'];trace.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(HERE.parent.parent/c['sourceTrace'],trace)
 video=root/'gre-learning/mutant.mp4';video.parent.mkdir(exist_ok=True)
 p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f"{c['width']}x{c['height']}",'-r',str(c['fps']),'-i','pipe:0','-c:v','libx264','-crf','0','-pix_fmt',('yuv444p'if case=='wrong_pixel_format'else'yuv420p'),'-threads','1','-g',str(len(frames)+1),'-keyint_min',str(len(frames)+1),'-sc_threshold','0','-an','-movflags','+faststart',str(video)],stdin=subprocess.PIPE);p.communicate(frames.tobytes());assert p.returncode==0
 c=copy.deepcopy(c);c.update(video='gre-learning/mutant.mp4',videoSha256=g.digest(video),poster='poster.webp',reviewEvidence='review.json',nativePresentationSha256=g.canonical({}),nativeDialogueSha256=g.canonical({'stages':None,'posterDialogue':None}))
 if case in ['changed_source_scale','changed_source_phase']:
  tr=json.loads(trace.read_text())
  if case=='changed_source_scale':tr[len(tr)//2]['registration']['uniformScale']*=1.1
  else:tr[len(tr)//2]['cel']=999
  trace.write_text(json.dumps(tr));c['sourceTraceSha256']=g.digest(trace)
 poster=g.legacy.decode(video,c['width'],c['height'])[0].copy()
 if case=='poster_not_frame_zero':poster[0,0]=[0,255,0]
 Image.fromarray(poster).save(root/'poster.webp',lossless=case!='lossy_poster',quality=100);c['posterSha256']=g.digest(root/'poster.webp')
 review={'videoSha256':c['videoSha256'],'posterSha256':c['posterSha256'],'nativeDialogueSha256':c['nativeDialogueSha256'],'nativePresentationSha256':c['nativePresentationSha256'],'geometrySha256':g.canonical(g.geometry(c)),'reviewed':{k:True for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning','celContactWitnesses','staticShoeWitnesses','fullVisibleFarShoeBounds3305','fullVisibleFarShoeBounds4608','fullVisibleFarShoeBounds2207','fullVisibleFarShoeBounds516','visibleFluidTrajectory','sceneSpecificGeometry','movingGateBackgroundIsolation','articulatedBodyGeometry']},'scope':'Test-only rebind; not an independent approval'}
 (root/'review.json').write_text(json.dumps(review));c['reviewEvidenceSha256']=g.digest(root/'review.json')
 (root/'gre-learning/catalog.json').write_text(json.dumps({'entries':[{'number':c['asset'],'storyMedia':{'video':{'url':'mutant.mp4','sha256':c['videoSha256']},'poster':{'url':'../poster.webp','sha256':c['posterSha256']}}}]}))
 if case in ['native_stages_change','native_reset_change']:
  catalog=json.loads((root/'gre-learning/catalog.json').read_text());sm=catalog['entries'][0]['storyMedia'];sm['stages'if case=='native_stages_change'else'resetTransition']={'unexpected':'changed after approval'};(root/'gre-learning/catalog.json').write_text(json.dumps(catalog))
 cp=root/'config.json';cp.write_text(json.dumps(c));return g.check_new(root,cp,{'scenes':{str(c['asset']):g.digest(cp)}})
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--root',required=True,type=Path);parser.add_argument('--assets',nargs='*',type=int);args=parser.parse_args();results=[]
 with tempfile.TemporaryDirectory(prefix='real-scene-mutants-') as td:
  root=Path(td)
  for cp in sorted((HERE/'configs').glob('*.json')):
   c=g.storage.expand(json.loads(cp.read_text()))
   if args.assets and c['asset'] not in args.assets:continue
   original=g.legacy.decode(g.legacy.contained(args.root,c['video']),c['width'],c['height']);idx=len(original)//2
   r=run_one(root,c,original,'positive');results.append({'asset':c['asset'],'case':'positive_reencoded','passed':r['status']=='PASS','checks':sorted({x['check'] for x in r['failures']})})
   if r['status']!='PASS':continue
   if c['asset']==1287:
    for kind,expected in [('wrong_pixel_format','unexpected_video_codec_or_pixel_format'),('poster_not_frame_zero','poster_not_decoded_first_frame'),('lossy_poster','poster_requires_lossless_webp'),('native_stages_change','native_dialogue_metadata_changed'),('native_reset_change','native_presentation_metadata_changed'),('changed_source_scale','source_requires_constant_scale_complete_body_cels'),('changed_source_phase','source_pose_schedule_changed')]:
     r=run_one(root,c,original,kind);checks={x['check']for x in r['failures']};results.append({'asset':c['asset'],'case':kind,'passed':expected in checks and not any('hash'in x for x in checks),'checks':sorted(checks)})
   for name,box in c['footRois'].items():
    for kind in ['shift','erase','widen']:
     a=original.copy();x1,y1,x2,y2=box;ref=g.background.unpack_reference(c.get('backgroundReferencesByCel',{}).get(name,{}).get(str(c['celContactProfile']['frameCels'][idx]),c['backgroundReferences'][name]),box);patch=a[idx,y1:y2,x1:x2].copy();a[idx,y1:y2,x1:x2]=ref
     if kind=='shift':a[idx,y1:y2,x1+12:x2+12]=patch
     if kind=='widen':
      wide=np.array(Image.fromarray(patch).resize((patch.shape[1]+24,patch.shape[0])));a[idx,y1:y2,x1:x2+24]=wide
     r=run_one(root,c,a,kind);checks={x['check'] for x in r['failures']};target=[x for x in r['failures'] if x.get('foot')==name and x['check'] in ['unreliable_foot_evidence','planted_contact_or_proportion_jump','planted_contact_drift_over_loop']];results.append({'asset':c['asset'],'case':f'{name}_{kind}','passed':bool(target) and not any('hash' in x for x in checks),'checks':sorted(checks)})
   if c['asset']==419:
    states=c['sceneContactProfile']['statesByCel'];closed=next(int(k)for k,v in states.items()if v['window']=='closed');opened=next(int(k)for k,v in states.items()if v['window']=='open'and v['page']=='raised');fi=c['celContactProfile']['frameCels'].index(closed);source=c['celContactProfile']['frameCels'].index(opened)
    for kind,name in [('wrong_window_state','window-state'),('flutter_when_closed','page-state'),('lamp_removed','lamp-state')]:
     w=next(w for w in c['celContactProfile']['witnesses']if w['id']==name);x1,y1,x2,y2=w['byCel'][str(closed)]['roi'];a=original.copy();a[fi,y1:y2,x1:x2]=245 if kind=='lamp_removed'else original[source,y1:y2,x1:x2]
     r=run_one(root,c,a,kind);checks={x['check']for x in r['failures']};target=[x for x in r['failures']if x.get('witness')==name and x['check']=='visible_contact_or_prop_witness_changed'];results.append({'asset':c['asset'],'case':kind,'passed':bool(target)and not any('hash'in x for x in checks),'checks':sorted(checks)})
   for w in c['celContactProfile']['witnesses']:
    box=w['byCel'][str(c['celContactProfile']['frameCels'][idx])]['roi'];x1,y1,x2,y2=box
    for kind in ['shift','erase']:
     a=original.copy();patch=a[idx,y1:y2,x1:x2].copy();a[idx,y1:y2,x1:x2]=245
     if kind=='shift':a[idx,y1:y2,x1:x2]=np.roll(patch,12,axis=1)
     r=run_one(root,c,a,kind);checks={x['check'] for x in r['failures']};target=[x for x in r['failures'] if x.get('witness')==w['id'] and x['check']=='visible_contact_or_prop_witness_changed'];results.append({'asset':c['asset'],'case':f"{w['id']}_{kind}",'passed':bool(target) and not any('hash' in x for x in checks),'checks':sorted(checks)})
   if c.get('bodyExpectedHeightsByCel'):
    for kind in ['body_scale','body_shift']:
     a=original.copy();x1,y1,x2,y2=c['bodyRois']['hero'];patch=a[idx,y1:y2,x1:x2].copy();a[idx,y1:y2,x1:x2]=g.background.unpack_reference(c['bodyReferences']['hero'],[x1,y1,x2,y2])
     if kind=='body_shift':a[idx,y1-12:y2-12,x1:x2]=patch
     else:
      wide=np.array(Image.fromarray(patch).resize((patch.shape[1]+20,patch.shape[0]+20)));a[idx,y1-20:y2,x1:x2+20]=wide
     r=run_one(root,c,a,kind);checks={x['check']for x in r['failures']};target=[x for x in r['failures']if x.get('witness')=='complete-body-geometry'and x['check']=='visible_contact_or_prop_witness_changed'];results.append({'asset':c['asset'],'case':kind,'passed':bool(target)and not any('hash'in x for x in checks),'checks':sorted(checks)})
   if c.get('bodyExpectedHeightsByCel'):
    heights=c['bodyExpectedHeightsByCel']['hero'];lo=min(heights,key=heights.get);hi=max(heights,key=heights.get);fi=c['celContactProfile']['frameCels'].index(int(lo));source=c['celContactProfile']['frameCels'].index(int(hi));a=original.copy();a[fi]=original[source]
    r=run_one(root,c,a,'wrong_articulation_phase');checks={x['check']for x in r['failures']};target=[x for x in r['failures']if x.get('witness')=='complete-body-geometry'and x['check']=='visible_contact_or_prop_witness_changed'];results.append({'asset':c['asset'],'case':'wrong_articulation_phase','passed':bool(target)and'body_scale_jump'in checks and not any('hash'in x for x in checks),'checks':sorted(checks)})
   if c.get('bodyExpectedHeightsByCel'):
    hand_id={2207:'failed-push-hands',516:'carpet-grip',419:'sash-grip'}[c['asset']];hand=next(w for w in c['sceneContactProfile']['landmarks']if w['id']==hand_id);x1,y1,x2,y2=hand['byCel'][str(c['celContactProfile']['frameCels'][idx])]['roi'];a=original.copy();patch=a[idx,y1:y2,x1:x2].copy();a[idx,y1:y2,x1:x2]=245;a[idx,y1:y2,x1+18:x2+18]=patch
    r=run_one(root,c,a,'detached_visible_hand');checks={x['check']for x in r['failures']};target=[x for x in r['failures']if x.get('landmark')==hand_id and x['check']in ['scene_landmark_evidence_changed','scene_landmark_registration_changed']];results.append({'asset':c['asset'],'case':'detached_visible_hand','passed':bool(target)and not any('hash'in x for x in checks),'checks':sorted(checks)})
   for landmark in c['sceneContactProfile']['landmarks']:
    fi=idx;cell=str(c['celContactProfile']['frameCels'][fi]);x1,y1,x2,y2=landmark['byCel'][cell]['roi']
    for kind in ['shift','erase']:
     a=original.copy();patch=a[fi,y1:y2,x1:x2].copy();a[fi,y1:y2,x1:x2]=245
     if kind=='shift':a[fi,y1:y2,x1:x2]=np.roll(patch,8,axis=1)
     r=run_one(root,c,a,kind);checks={x['check']for x in r['failures']};target=[x for x in r['failures']if x.get('landmark')==landmark['id']and x['check']in ['scene_landmark_evidence_changed','scene_landmark_registration_changed']];results.append({'asset':c['asset'],'case':landmark['id']+'_'+kind,'passed':bool(target)and not any('hash'in x for x in checks),'checks':sorted(checks)})
   print(f"asset{c['asset']}: {len(results)} cases complete",file=sys.stderr)
 out={'passed':bool(results) and all(r['passed'] for r in results),'tests':results};print(json.dumps(out,indent=2));return 0 if out['passed'] else 1
if __name__=='__main__':raise SystemExit(main())
