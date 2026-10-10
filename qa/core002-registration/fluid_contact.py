"""Visible cyan-water witnesses only; not volume or fluid-physics validation."""
import numpy as np

def validate(c,review):
 p=c.get('fluidProfile');bad=[]
 if c['asset']!=581:return [{'check':'fluid_scope_reuse_forbidden'}] if p else []
 if not p or p.get('colorRule')!='cyan_water_v1' or not p.get('scope'):return [{'check':'missing_fluid_witness_policy'}]
 if review.get('reviewed',{}).get('visibleFluidTrajectory') is not True:bad.append({'check':'fluid_visual_review_missing'})
 if set(p.get('flowStates',{}))!={str(v) for v in c.get('celContactProfile',{}).get('frameCels',[])} or any(v not in ['none','stream','drops'] for v in p.get('flowStates',{}).values()):bad.append({'check':'incomplete_fluid_cel_coverage'})
 for key in ['roi','soilEllipse']:
  b=p.get(key,[])
  if len(b)!=4 or any(type(v)is not int for v in b) or not(0<=b[0]<b[2]<=c['width'] and 0<=b[1]<b[3]<=c['height']):bad.append({'check':'invalid_fluid_geometry'})
 return bad

def measure(frames,c):
 p=c.get('fluidProfile')
 if not p:return [],{}
 bad=[];records=[];x1,y1,x2,y2=p['roi'];ex1,ey1,ex2,ey2=p['soilEllipse'];cx=(ex1+ex2)/2;cy=(ey1+ey2)/2;rx=(ex2-ex1)/2;ry=(ey2-ey1)/2
 for i,f in enumerate(frames):
  cell=c['celContactProfile']['frameCels'][i];state=p['flowStates'][str(cell)];z=f[y1:y2,x1:x2].astype(int);r,g,b=z.transpose(2,0,1);m=(r<225)&(b>r+12)&(g>r+12)&(b>g-8);ys,xs=np.where(m);count=len(xs);rec={'frame':i,'cel':cell,'state':state,'visibleCyanPixels':count}
  if state=='none':
   if count>10:bad.append({'check':'water_visible_in_upright_state','frame':i,'count':count})
  elif count<30:bad.append({'check':'visible_water_missing','frame':i,'count':count})
  else:
   bottom=int(ys.max());band=xs[ys>=bottom-2];px=float(np.median(band)+x1);py=bottom+y1;rec['visibleEndpoint']=[px,py]
   # Two pixels cover antialiasing of the explicitly reviewed soil rim;
   # this cannot authorize out-of-pot flow or a hidden continuation.
   ellipse=((px-cx)/(rx+2))**2+((py-cy)/(ry+2))**2
   if ellipse>1 or py<ey1-2 or py>ey2+2:bad.append({'check':'water_endpoint_misses_visible_soil','frame':i,'endpoint':[px,py],'ellipse':ellipse})
   if state=='stream':
    rowcounts=np.bincount(ys,minlength=y2-y1);active=np.where(rowcounts>0)[0]
    if len(active) and np.max(np.diff(active),initial=0)>3:bad.append({'check':'visible_stream_disconnected','frame':i})
  records.append(rec)
 return bad,{'scope':p['scope'],'frames':records}
