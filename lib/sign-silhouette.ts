/** Trace the largest opaque island into a closed, simplified perimeter.
 * This builds actual metal sidewalls around a cut-out sign, not a rectangle
 * hidden behind an alpha texture. Coordinates are normalized image pixels. */
export function signSilhouette(rgba:ArrayLike<number>,width:number,height:number){
  const solid=(x:number,y:number)=>x>=0&&y>=0&&x<width&&y<height&&rgba[(y*width+x)*4+3]>=160;
  const stride=width+1,edges=new Map<number,number[]>();
  const add=(x:number,y:number,a:number,b:number)=>{const key=y*stride+x,list=edges.get(key)??[];list.push(b*stride+a);edges.set(key,list);};
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(solid(x,y)){
    if(!solid(x,y-1))add(x,y,x+1,y);
    if(!solid(x+1,y))add(x+1,y,x+1,y+1);
    if(!solid(x,y+1))add(x+1,y+1,x,y+1);
    if(!solid(x-1,y))add(x,y+1,x,y);
  }
  let largest:number[][]=[],largestArea=0;
  while(edges.size){
    const first=edges.keys().next().value!;let current=first;
    const path:number[][]=[];
    do{
      path.push([current%stride,Math.floor(current/stride)]);
      const targets=edges.get(current);if(!targets?.length)break;
      const next=targets.pop()!;if(!targets.length)edges.delete(current);current=next;
    }while(current!==first&&path.length<=width*height*4);
    const area=Math.abs(path.reduce((sum,p,i)=>{const q=path[(i+1)%path.length];return sum+p[0]*q[1]-q[0]*p[1];},0));
    if(area>largestArea){largest=path;largestArea=area;}
  }
  if(largest.length<3)throw new Error('Sign artwork needs an opaque silhouette');
  // Ramer–Douglas–Peucker removes pixel stair steps without losing the notch
  // or atomic-star points. No image pixels are changed.
  const simplify=(points:number[][]):number[][]=>{
    if(points.length<=2)return points;
    const a=points[0],b=points.at(-1)!,dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
    let max=.75*.75,split=-1;
    for(let i=1;i<points.length-1;i++){
      const p=points[i],t=len?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/len)):0;
      const d=(p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2;
      if(d>max){max=d;split=i;}
    }
    return split<0?[a,b]:[...simplify(points.slice(0,split+1)).slice(0,-1),...simplify(points.slice(split))];
  };
  const half=Math.floor(largest.length/2);
  return [...simplify(largest.slice(0,half+1)).slice(0,-1),...simplify([...largest.slice(half),largest[0]]).slice(0,-1)].map(([x,y])=>({x:x/width-.5,y:.5-y/height}));
}
