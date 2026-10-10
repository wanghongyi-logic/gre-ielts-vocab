#!/usr/bin/env python3
"""Self-contained tests. All synthetic video fixtures are temporary, never published."""
import importlib.util,json,tempfile,subprocess
from pathlib import Path
import numpy as np
from PIL import Image
HERE=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('guard',HERE/'check.py');g=importlib.util.module_from_spec(s);s.loader.exec_module(g)
def fixture(root,kind):
 arrays=[]
 for i in range(4):
  a=np.full((100,100,3),245,np.uint8);a[15:71,38:78]=[95,95,75];a[72:83,32:57]=[80,65,50];a[72:83,66:90]=[80,65,50];a[30:34,80+i:84+i]=[100,80,50]
  if (kind in ['shoe_translation','shoe_proportion'] and i==2) or (kind=='loop_seam_corruption' and i==3):
   a[70:93,25:62]=245
   if kind=='shoe_translation':a[72:83,38:63]=[80,65,50]
   elif kind=='shoe_proportion':a[72:83,27:63]=[80,65,50]
   else:a[78:89,32:57]=[80,65,50]
  arrays.append(a)
 video=root/'fixture.mp4';p=subprocess.Popen(['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','100x100','-r','25','-i','pipe:0','-c:v','libx264','-crf','0','-pix_fmt','yuv444p',str(video)],stdin=subprocess.PIPE);p.communicate(b''.join(a.tobytes() for a in arrays));assert p.returncode==0
 first=g.decode(video,100,100)[0];Image.fromarray(first).save(root/'poster.png')
 c={'asset':178,'width':100,'height':100,'fps':25,'frames':4,'video':'fixture.mp4','videoSha256':g.digest(video),'poster':'poster.png','posterSha256':g.digest(root/'poster.png'),'posterMustEqualDecodedFrame0':True,'footRois':{'left':[25,70,65,94],'right':[65,70,95,94]},'bodyRois':{'main':[25,10,95,94]},'thresholds':{'maxAdjacentContactDxPx':3.0,'maxAdjacentSoleDyPx':2.0,'maxAdjacentSoleWidthDeltaPx':6.0,'maxBodyHeightRangeRatio':0.2},'reviewedExceptions':[],'visualReviewOnly':['Synthetic unit-test fixture']}
 return c
results=[]
with tempfile.TemporaryDirectory(prefix='redraw-guard-test-') as td:
 root=Path(td)
 for case in ['positive','shoe_translation','shoe_proportion','loop_seam_corruption','threshold_tamper','unknown_scene','stale_media_hash','unreviewed_exception','exception_reuse','missing_rois']:
  c=fixture(root,case)
  if case=='unknown_scene':c['asset']=999
  elif case=='stale_media_hash':c['videoSha256']='0'*64
  elif case=='unreviewed_exception':c['reviewedExceptions']=[{'id':'not-reviewed'}]
  elif case=='exception_reuse':c['reviewedExceptions']=[dict(g.RESET_CAPS['177-existing-narrative-reset-v121'],id='177-existing-narrative-reset-v121',rationale='Invalid reuse on another video')]
  elif case=='missing_rois':c['footRois']={}
  cp=root/'config.json';cp.write_text(json.dumps(c));policy={'guardSha256':g.digest(HERE/'check.py'),'scenes':{'178':g.digest(cp)}}
  if case=='threshold_tamper':c['thresholds']['maxAdjacentSoleDyPx']=999;cp.write_text(json.dumps(c))
  r=g.check_scene(root,cp,policy);checks=sorted({q['check'] for q in r['failures']});ok=r['status']==('PASS' if case=='positive' else 'FAIL')
  if case in ['shoe_translation','shoe_proportion','loop_seam_corruption']:ok=ok and 'contact_or_shoe_proportion_discontinuity' in checks and not any('hash' in q for q in checks)
  results.append({'case':case,'passed':ok,'checks':checks})
out={'passed':all(r['passed'] for r in results),'tests':results};print(json.dumps(out,indent=2));raise SystemExit(0 if out['passed'] else 1)
