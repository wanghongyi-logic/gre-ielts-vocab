#!/usr/bin/env python3
"""Mutate each actual reviewed scene's decoded raster, then re-encode/rebind media.

The references, contacts, and thresholds stay exactly those of the accepted
scene. Test-only review rebindings prevent hash rejection from masquerading as
geometry detection. They never write or approve production review files.
"""
import argparse,copy,importlib.util,json,subprocess,tempfile
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('g',HERE/'check_batch.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
def run_one(root,c,frames,case):
 video=root/'gre-learning/mutant.mp4';video.parent.mkdir(exist_ok=True)
 p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f"{c['width']}x{c['height']}",'-r',str(c['fps']),'-i','pipe:0','-c:v','libx264','-crf','0','-pix_fmt','yuv444p',str(video)],stdin=subprocess.PIPE);p.communicate(frames.tobytes());assert p.returncode==0
 c=copy.deepcopy(c);c.update(video='gre-learning/mutant.mp4',videoSha256=g.digest(video),poster='poster.png',reviewEvidence='review.json',nativeDialogueSha256=g.canonical({'stages':None,'posterDialogue':None}))
 Image.fromarray(g.legacy.decode(video,c['width'],c['height'])[0]).save(root/'poster.png');c['posterSha256']=g.digest(root/'poster.png')
 review={'videoSha256':c['videoSha256'],'geometrySha256':g.canonical(g.geometry(c)),'reviewed':{k:True for k in ['allOrderedPoses','contactAndAnatomy','fixedCameraAndProps','completeLoopAndMeaning','celContactWitnesses','staticShoeWitnesses','fullVisibleFarShoeBounds3305','fullVisibleFarShoeBounds4608','visibleFluidTrajectory']},'scope':'Test-only rebind; not an independent approval'}
 (root/'review.json').write_text(json.dumps(review));c['reviewEvidenceSha256']=g.digest(root/'review.json')
 (root/'gre-learning/catalog.json').write_text(json.dumps({'entries':[{'number':c['asset'],'storyMedia':{'video':{'url':'mutant.mp4','sha256':c['videoSha256']},'poster':{'url':'../poster.png','sha256':c['posterSha256']}}}]}))
 cp=root/'config.json';cp.write_text(json.dumps(c));return g.check_new(root,cp,{'scenes':{str(c['asset']):g.digest(cp)}})
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--root',required=True,type=Path);parser.add_argument('--assets',nargs='*',type=int);args=parser.parse_args();results=[]
 with tempfile.TemporaryDirectory(prefix='real-scene-mutants-') as td:
  root=Path(td)
  for cp in sorted((HERE/'configs').glob('*.json')):
   c=json.loads(cp.read_text())
   if args.assets and c['asset'] not in args.assets:continue
   original=g.legacy.decode(g.legacy.contained(args.root,c['video']),c['width'],c['height']);idx=len(original)//2
   r=run_one(root,c,original,'positive');results.append({'asset':c['asset'],'case':'positive_reencoded','passed':r['status']=='PASS','checks':sorted({x['check'] for x in r['failures']})})
   for name,box in c['footRois'].items():
    for kind in ['shift','erase','widen']:
     a=original.copy();x1,y1,x2,y2=box;ref=g.background.unpack_reference(c['backgroundReferences'][name],box);patch=a[idx,y1:y2,x1:x2].copy();a[idx,y1:y2,x1:x2]=ref
     if kind=='shift':a[idx,y1:y2,x1+12:x2+12]=patch
     if kind=='widen':
      wide=np.array(Image.fromarray(patch).resize((patch.shape[1]+24,patch.shape[0])));a[idx,y1:y2,x1:x2+24]=wide
     r=run_one(root,c,a,kind);checks={x['check'] for x in r['failures']};target=[x for x in r['failures'] if x.get('foot')==name and x['check'] in ['unreliable_foot_evidence','planted_contact_or_proportion_jump','planted_contact_drift_over_loop']];results.append({'asset':c['asset'],'case':f'{name}_{kind}','passed':bool(target) and not any('hash' in x for x in checks),'checks':sorted(checks)})
   if c['asset']==581:
    for kind in ['upright_water','miss_soil','missing_stream']:
     a=original.copy();profile=c['fluidProfile'];state='none' if kind=='upright_water' else 'stream';fi=next(i for i,v in enumerate(c['celContactProfile']['frameCels']) if profile['flowStates'][str(v)]==state);x1,y1,x2,y2=profile['roi'];patch=a[fi,y1:y2,x1:x2].copy()
     if kind=='upright_water':a[fi,y1+5:y2-2,x1+10:x1+14]=[100,180,210]
     elif kind=='missing_stream':a[fi,y1:y2,x1:x2]=245
     else:a[fi,y1:y2,x1:x2]=np.roll(patch,-16,axis=1)
     r=run_one(root,c,a,kind);checks={x['check'] for x in r['failures']};expected={'upright_water':'water_visible_in_upright_state','miss_soil':'water_endpoint_misses_visible_soil','missing_stream':'visible_water_missing'}[kind];results.append({'asset':581,'case':kind,'passed':expected in checks and not any('hash' in x for x in checks),'checks':sorted(checks)})
   for w in c['celContactProfile']['witnesses']:
    box=w['byCel'][str(c['celContactProfile']['frameCels'][idx])]['roi'];x1,y1,x2,y2=box
    for kind in ['shift','erase']:
     a=original.copy();patch=a[idx,y1:y2,x1:x2].copy();a[idx,y1:y2,x1:x2]=245
     if kind=='shift':a[idx,y1:y2,x1:x2]=np.roll(patch,12,axis=1)
     r=run_one(root,c,a,kind);checks={x['check'] for x in r['failures']};target=[x for x in r['failures'] if x.get('witness')==w['id'] and x['check']=='visible_contact_or_prop_witness_changed'];results.append({'asset':c['asset'],'case':f"{w['id']}_{kind}",'passed':bool(target) and not any('hash' in x for x in checks),'checks':sorted(checks)})
 out={'passed':bool(results) and all(r['passed'] for r in results),'tests':results};print(json.dumps(out,indent=2));return 0 if out['passed'] else 1
if __name__=='__main__':raise SystemExit(main())
