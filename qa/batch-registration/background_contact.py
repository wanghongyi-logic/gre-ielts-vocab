"""Measurement-only fixed-background subtraction; never alters animation pixels."""
import base64,hashlib,zlib
import numpy as np

def pack_reference(rgb):
    raw=np.ascontiguousarray(rgb,dtype=np.uint8).tobytes()
    return {'encoding':'zlib-base64-rgb24','shape':list(rgb.shape),'sha256':hashlib.sha256(raw).hexdigest(),'data':base64.b64encode(zlib.compress(raw,9)).decode('ascii')}

def unpack_reference(value,roi):
    x1,y1,x2,y2=roi;shape=[y2-y1,x2-x1,3]
    if value.get('encoding')!='zlib-base64-rgb24' or value.get('shape')!=shape:raise ValueError('Invalid fixed-background sample dimensions or encoding')
    raw=zlib.decompress(base64.b64decode(value['data'],validate=True))
    if len(raw)!=int(np.prod(shape)) or hashlib.sha256(raw).hexdigest()!=value['sha256']:raise ValueError('Fixed-background sample hash/length mismatch')
    return np.frombuffer(raw,dtype=np.uint8).reshape(shape)

def contact(image,roi,reference):
    x1,y1,x2,y2=roi;bg=unpack_reference(reference,roi)
    z=image[y1:y2,x1:x2];mask=np.max(np.abs(z.astype(int)-bg.astype(int)),axis=2)>25
    # Require enough visible foreground to avoid codec noise or a disappeared shoe.
    seen=np.zeros_like(mask);components=[];h,w=mask.shape
    for sy,sx in zip(*np.where(mask)):
        if seen[sy,sx]:continue
        stack=[(int(sy),int(sx))];seen[sy,sx]=True;points=[]
        while stack:
            y,x=stack.pop();points.append((y,x))
            for dy,dx in [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]:
                ny,nx=y+dy,x+dx
                if 0<=ny<h and 0<=nx<w and mask[ny,nx] and not seen[ny,nx]:seen[ny,nx]=True;stack.append((ny,nx))
        if len(points)>=30:components.append(points)
    components.sort(key=len,reverse=True)
    if not components:raise ValueError('No reliable shoe foreground against fixed-background reference')
    if len(components)>1 and len(components[1])>=len(components[0])*.65:raise ValueError('Ambiguous shoe foreground components')
    points=np.array(components[0]);ys,xs=points[:,0],points[:,1]
    if len(xs)<30:raise ValueError('No reliable shoe foreground against fixed-background reference')
    bottom=int(ys.max());band=xs[ys>=bottom-5]
    if bottom==mask.shape[0]-1 or band.min()==0 or band.max()==mask.shape[1]-1:raise ValueError('Shoe contact band clipped by measurement ROI')
    return {'soleY':bottom+y1,'contactX':float((int(band.min())+int(band.max()))/2+x1),'soleWidth':int(band.max()-band.min()+1),'foregroundPixels':len(xs)}
