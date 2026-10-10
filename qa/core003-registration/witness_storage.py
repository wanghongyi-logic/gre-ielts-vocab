"""Lossless deduplication of byte-identical RGB witness payloads only.

Policies and geometry remain plain JSON. Expanding compact config yields exactly
its raw canonical JSON value, excluding this optional storage-only pool.
"""
import copy,hashlib,json

def compact(config):
 c=copy.deepcopy(config);counts={};refs={}
 def inventory(v):
  if isinstance(v,dict):
   if v.get('encoding')=='zlib-base64-rgb24':
    key=hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest();counts[key]=counts.get(key,0)+1;refs[key]=v
   else:
    for x in v.values():inventory(x)
  elif isinstance(v,list):
   for x in v:inventory(x)
 inventory(c);pool={k:v for k,v in refs.items()if counts[k]>1}
 def replace(v):
  if isinstance(v,dict):
   if v.get('encoding')=='zlib-base64-rgb24':
    k=hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    return {'rasterReference':k}if k in pool else v
   return {k:replace(x)for k,x in v.items()}
  if isinstance(v,list):return [replace(x)for x in v]
  return v
 out=replace(c)
 if pool:out['rasterReferencePool']=pool
 assert expand(out)==c
 return out

def expand(config):
 pool=config.get('rasterReferencePool',{})
 if not isinstance(pool,dict):raise ValueError('Invalid raster reference pool')
 for k,v in pool.items():
  if not isinstance(v,dict)or v.get('encoding')!='zlib-base64-rgb24'or hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest()!=k:raise ValueError('Invalid raster reference pool hash')
 def resolve(v):
  if isinstance(v,dict):
   if 'rasterReference'in v:
    if set(v)!={'rasterReference'}or v['rasterReference']not in pool:raise ValueError('Unknown raster reference')
    return copy.deepcopy(pool[v['rasterReference']])
   return {k:resolve(x)for k,x in v.items()}
  if isinstance(v,list):return [resolve(x)for x in v]
  return v
 return resolve({k:v for k,v in config.items()if k!='rasterReferencePool'})
