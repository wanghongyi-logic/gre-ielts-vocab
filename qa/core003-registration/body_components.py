"""Connected foreground bounds without extra dependencies.

Run-length union/find removes isolated background codec speckles from silhouette
height evidence. All true foreground pixels remain eligible. This never changes
media, fills anatomy, or substitutes a frozen lower body.
"""
import numpy as np

def components(mask):
 parent=[];stats=[];previous=[]
 def root(i):
  while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
  return i
 def merge(a,b):
  a=root(a);b=root(b)
  if a==b:return a
  if stats[a][0]<stats[b][0]:a,b=b,a
  parent[b]=a;sa,sb=stats[a],stats[b];stats[a]=[sa[0]+sb[0],min(sa[1],sb[1]),min(sa[2],sb[2]),max(sa[3],sb[3]),max(sa[4],sb[4])]
  return a
 for y,row in enumerate(mask):
  edges=np.diff(np.r_[False,row,False].astype(np.int8));starts=np.flatnonzero(edges==1);ends=np.flatnonzero(edges==-1)-1;current=[];left=0
  for x1,x2 in zip(starts,ends):
   x1=int(x1);x2=int(x2);i=len(parent);parent.append(i);stats.append([x2-x1+1,x1,y,x2,y])
   while left<len(previous)and previous[left][1]<x1-1:left+=1
   j=left
   while j<len(previous)and previous[j][0]<=x2+1:
    i=merge(i,previous[j][2]);j+=1
   current.append((x1,x2,i))
  previous=current
 return sorted((s for i,s in enumerate(stats)if root(i)==i),reverse=True,key=lambda s:s[0])

def height(mask):
 found=components(mask)
 if not found or found[0][0]<256:raise ValueError('No substantial connected body foreground')
 n,x1,y1,x2,y2=found[0]
 return y2-y1+1
