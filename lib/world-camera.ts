import * as THREE from "three";

/** Keep exploration above the platform and outside the solid tram shell. */
export function safeWorldCamera(position:{x:number;y:number;z:number}) {
  const p={...position,y:Math.max(.3,position.y)};
  const bounds={left:-4.6,right:4.6,back:-2.3,front:.65,top:4.65};
  if(p.y>=bounds.top||p.x<=bounds.left||p.x>=bounds.right||p.z<=bounds.back||p.z>=bounds.front)return p;
  const exits=[{axis:"x" as const,value:bounds.left,distance:p.x-bounds.left},{axis:"x" as const,value:bounds.right,distance:bounds.right-p.x},{axis:"z" as const,value:bounds.back,distance:p.z-bounds.back},{axis:"z" as const,value:bounds.front,distance:bounds.front-p.z}];
  const exit=exits.sort((a,b)=>a.distance-b.distance)[0];p[exit.axis]=exit.value;return p;
}

type Point={x:number;y:number;z:number};
/** A rear-to-front half orbit. Polar interpolation keeps the approach outside
 * the tram instead of cutting through its centre like a wide Bezier chord. */
export function worldEntranceCurve(destination:THREE.Vector3,target:THREE.Vector3){
  const center=target.clone(),offset=destination.clone().sub(center);
  const radius=Math.hypot(offset.x,offset.z),endAngle=Math.atan2(offset.x,offset.z);
  return new class extends THREE.Curve<THREE.Vector3>{
    constructor(){super();}
    getPoint(t:number,result=new THREE.Vector3()){
      const u=THREE.MathUtils.clamp(t,0,1),angle=endAngle-Math.PI*(1-u);
      const r=radius*(1+.9*(1-u)),height=offset.y*(1+.65*(1-u));
      return result.set(Math.sin(angle)*r,height,Math.cos(angle)*r).add(center);
    }
  }();
}
/** Bounded clearance corridor; close starts escape sideways before rising. */
export function worldFlightWaypoints(from:Point,to:Point):Point[]{
  let blocked=false;
  for(let i=1;i<100;i++){
    const t=i/100,x=from.x+(to.x-from.x)*t,z=from.z+(to.z-from.z)*t,y=from.y+(to.y-from.y)*t;
    if(x>-4.9&&x<4.9&&z>-2.5&&z<1.7&&y<5.3)blocked=true;
  }
  if(!blocked)return [{...from},{...to}];
  const escape=(p:Point)=>{
    const result={...p};
    if(p.y>=5.5||p.x<=-5.2||p.x>=5.2||p.z<=-2.8||p.z>=2)return result;
    const exits=[{axis:"x" as const,value:-5.2,d:p.x+5.2},{axis:"x" as const,value:5.2,d:5.2-p.x},{axis:"z" as const,value:-2.8,d:p.z+2.8},{axis:"z" as const,value:2,d:2-p.z}];
    const nearest=exits.sort((a,b)=>a.d-b.d)[0];result[nearest.axis]=nearest.value;return result;
  };
  const start=escape(from),end=escape(to),altitude=Math.max(6.1,from.y,to.y);
  return [{...from},start,{...start,y:altitude},{...end,y:altitude},end,{...to}].filter((p,i,a)=>!i||Math.hypot(p.x-a[i-1].x,p.y-a[i-1].y,p.z-a[i-1].z)>.001);
}

export function worldFlightCurve(from:Point,to:Point){
  const points=worldFlightWaypoints(from,to).map(p=>new THREE.Vector3(p.x,p.y,p.z));
  const path=new THREE.CurvePath<THREE.Vector3>();let cursor=points[0];
  for(let i=1;i<points.length-1;i++){
    const p=points[i],prev=points[i-1],next=points[i+1],r=Math.min(.2,p.distanceTo(prev)*.35,p.distanceTo(next)*.35);
    const enter=p.clone().addScaledVector(prev.clone().sub(p).normalize(),r),leave=p.clone().addScaledVector(next.clone().sub(p).normalize(),r);
    path.add(new THREE.LineCurve3(cursor,enter));path.add(new THREE.QuadraticBezierCurve3(enter,p,leave));cursor=leave;
  }
  path.add(new THREE.LineCurve3(cursor,points.at(-1)!));return path;
}
