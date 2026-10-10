#!/usr/bin/env python3
"""Hash-bound decoded-video contact guard. Natural redrawing is allowed; visual QA remains required."""
import argparse,hashlib,json,subprocess,sys,importlib.util
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
RESET_CAPS={
 '175-existing-narrative-reset-v121':{'asset':175,'videoSha256':'9ada9463e3c9612e669416638afc17d94617d01cb9500b35b06df5b4a2960928','foot':'left','fromFrame':168,'toFrame':0,'maxContactDxPx':3.5,'maxSoleDyPx':2.0},
 '177-existing-narrative-reset-v121':{'asset':177,'videoSha256':'ab1e0264b1e7c88b672b46c1203fd8ac0c2af67ab2b9cfc66c6eea8d8e7b1ff0','foot':'front','fromFrame':143,'toFrame':0,'maxContactDxPx':3.0,'maxSoleDyPx':3.0}}
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def contained(root,relative):
 if Path(relative).is_absolute():raise ValueError('Absolute media paths are forbidden')
 p=(root/relative).resolve()
 if not p.is_relative_to(root.resolve()):raise ValueError('Media path escapes checkout')
 return p
def decode(path,w,h):
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
 return np.frombuffer(raw,dtype=np.uint8).reshape(-1,h,w,3)
def contact(a,box):
 x1,y1,x2,y2=box;m=np.min(a[y1:y2,x1:x2],axis=2)<130;ys,xs=np.where(m)
 if not len(xs):raise ValueError('No contour in contact ROI')
 y=int(ys.max());band=xs[ys>=y-5];lo=int(band.min()+x1);hi=int(band.max()+x1)
 return {'soleY':y+y1,'contactX':(lo+hi)/2,'soleWidth':hi-lo+1}
def evaluate_frames(frames,c):
 failures=[];used=[];summary={};t=c['thresholds'];scale=c.get('metricScaleTo312',1.0)
 for ex in c.get('reviewedExceptions',[]):
  cap=RESET_CAPS.get(ex.get('id'));valid=bool(cap) and all(ex.get(k)==v for k,v in cap.items()) and ex.get('videoSha256')==c['videoSha256'] and cap['asset']==c['asset']
  if not valid:failures.append({'check':'unreviewed_or_reused_exception','id':ex.get('id')})
 for name,roi in c['footRois'].items():
  ls=[contact(f,roi) for f in frames];trans=[]
  for i,cur in enumerate(ls):
   prev=ls[i-1];q={'fromFrame':i-1 if i else len(ls)-1,'toFrame':i,'foot':name,'loopSeam':i==0,'contactDxPx':abs(cur['contactX']-prev['contactX'])*scale,'soleDyPx':abs(cur['soleY']-prev['soleY'])*scale,'soleWidthDeltaPx':abs(cur['soleWidth']-prev['soleWidth'])*scale};trans.append(q)
   bad=q['contactDxPx']>t['maxAdjacentContactDxPx'] or q['soleDyPx']>t['maxAdjacentSoleDyPx'] or q['soleWidthDeltaPx']>t['maxAdjacentSoleWidthDeltaPx']
   if bad:
    exception=next((e for e in c.get('reviewedExceptions',[]) if e.get('id') in RESET_CAPS and all(e.get(k)==v for k,v in RESET_CAPS[e['id']].items()) and e['videoSha256']==c['videoSha256'] and e['asset']==c['asset'] and e['foot']==name and e['fromFrame']==q['fromFrame'] and e['toFrame']==q['toFrame'] and q['contactDxPx']<=e['maxContactDxPx'] and q['soleDyPx']<=e['maxSoleDyPx'] and q['soleWidthDeltaPx']<=t['maxAdjacentSoleWidthDeltaPx']),None)
    if exception:used.append({'exception':exception['id'],'rationale':exception['rationale'],'transition':q})
    else:failures.append({'check':'contact_or_shoe_proportion_discontinuity','transition':q})
  summary[name]={'maxContactDxPx':max(q['contactDxPx'] for q in trans),'maxSoleDyPx':max(q['soleDyPx'] for q in trans),'maxSoleWidthDeltaPx':max(q['soleWidthDeltaPx'] for q in trans),'loopSeam':trans[0]}
 for name,roi in c.get('bodyRois',{}).items():
  x1,y1,x2,y2=roi;heights=[]
  for f in frames:
   ys,xs=np.where(np.min(f[y1:y2,x1:x2],2)<130);heights.append(int(ys.max()-ys.min()+1))
  ratio=(max(heights)-min(heights))/float(np.median(heights));summary[name]={'bodyHeightRangeRatio':ratio}
  if ratio>t['maxBodyHeightRangeRatio']:failures.append({'check':'body_scale_discontinuity','body':name,'ratio':ratio})
 return failures,used,summary
def check_scene(root,config_path,policy):
 root=Path(root).resolve();cp=Path(config_path);c=json.loads(cp.read_text());n=str(c.get('asset','unknown'));fail=[]
 if n not in policy.get('scenes',{}):return {'asset':n,'status':'FAIL','failures':[{'check':'unknown_unreviewed_scene'}]}
 if digest(cp)!=policy['scenes'][n]:fail.append({'check':'unreviewed_config_or_thresholds'})
 required=['frames','fps','width','height','video','videoSha256','poster','posterSha256','thresholds']
 if any(k not in c for k in required) or (not c.get('motionProfile') and not c.get('footRois')):return {'asset':n,'status':'FAIL','failures':fail+[{'check':'missing_required_scene_config'}]}
 catalogPath=root/'gre-learning/catalog.json'
 if catalogPath.exists():
  entries=json.loads(catalogPath.read_text()).get('entries',[]);entry=next((e for e in entries if e.get('number')==c['asset']),None)
  if not entry or not entry.get('storyMedia'):fail.append({'check':'catalog_scene_missing'})
  else:
   sm=entry['storyMedia']
   if sm.get('video',{}).get('sha256')!=c['videoSha256'] or 'gre-learning/'+sm.get('video',{}).get('url','')!=c['video'] or sm.get('poster',{}).get('sha256')!=c['posterSha256']:fail.append({'check':'catalog_uses_unknown_or_unreviewed_media'})
 video=contained(root,c['video']);poster=contained(root,c['poster'])
 if digest(video)!=c['videoSha256']:fail.append({'check':'unknown_or_stale_video_hash'})
 if digest(poster)!=c['posterSha256']:fail.append({'check':'unknown_or_stale_poster_hash'})
 a=decode(video,c['width'],c['height'])
 if len(a)!=c['frames']:fail.append({'check':'frame_count','actual':len(a),'expected':c['frames']})
 if c.get('posterMustEqualDecodedFrame0') and not np.array_equal(np.array(Image.open(poster).convert('RGB')),a[0]):fail.append({'check':'poster_not_decoded_frame0'})
 if c.get('motionProfile'):
  modulePath=HERE/'phase_guard.py'
  if policy.get('guardModules',{}).get('phase_guard.py')!=digest(modulePath):fail.append({'check':'phase_guard_code_hash_mismatch'})
  evidencePath=contained(root,c['motionProfile']['reviewEvidence'])
  if digest(evidencePath)!=c['motionProfile']['reviewEvidenceSha256']:fail.append({'check':'motion_review_evidence_hash_mismatch'})
  evidence=json.loads(evidencePath.read_text());spec=importlib.util.spec_from_file_location('phase_guard',modulePath);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
  bad,used,summary=module.evaluate_motion(a,c,evidence)
 else:bad,used,summary=evaluate_frames(a,c)
 fail+=bad
 return {'asset':c['asset'],'status':'FAIL' if fail else 'PASS','videoSha256':digest(video),'configSha256':digest(cp),'decodedFrames':len(a),'failures':fail,'reviewedExceptionsUsed':used,'measurements':summary,'visualReviewOnly':c['visualReviewOnly'],'naturalRedrawAllowed':True}
def main():
 p=argparse.ArgumentParser();p.add_argument('--root',type=Path,default=HERE.parents[1]);p.add_argument('--scene',action='append');p.add_argument('--report',type=Path);args=p.parse_args();policy=json.loads((HERE/'policy-lock.json').read_text());reports=[]
 if digest(Path(__file__))!=policy['guardSha256']:reports.append({'status':'FAIL','failures':[{'check':'guard_code_hash_mismatch'}]})
 catalogPath=args.root/'gre-learning/catalog.json'
 if not catalogPath.exists():reports.append({'status':'FAIL','failures':[{'check':'release_catalog_missing'}]})
 else:
  active={str(e['number']) for e in json.loads(catalogPath.read_text()).get('entries',[]) if e.get('storyMedia')}
  for unknown in active-set(policy['scenes']):reports.append({'asset':unknown,'status':'FAIL','failures':[{'check':'unknown_catalog_scene_without_reviewed_roi_config'}]})
 for moduleName,expected in policy.get('guardModules',{}).items():
  if digest(contained(HERE,moduleName))!=expected:reports.append({'status':'FAIL','failures':[{'check':'guard_module_hash_mismatch','module':moduleName}]})
 for n in args.scene or sorted(policy['scenes']):
  try:reports.append(check_scene(args.root,HERE/'configs'/f'{n}.json',policy))
  except Exception as e:reports.append({'asset':n,'status':'FAIL','failures':[{'check':'missing_unreviewed_or_unreadable_scene','detail':str(e)}]})
 out={'status':'PASS' if reports and all(r['status']=='PASS' for r in reports) else 'FAIL','scenes':reports,'visualReviewStillRequired':True};text=json.dumps(out,indent=2)+'\n'
 if args.report:args.report.write_text(text)
 print(text);return 0 if out['status']=='PASS' else 1
if __name__=='__main__':sys.exit(main())
