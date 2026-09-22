import * as THREE from "three";
import {HOLOGRAM_FLOOR,HOLOGRAM_GRAVITY,hologramDelay,hologramLandingTime} from "./hologram-timing.mjs";

export const HOLOGRAM_CYCLE_SECONDS=2.8;
/** Ballistic drop, a small damped landing, then staggered magnetic reassembly. */
export function hologramDotPose(x:number,y:number,z:number,index:number,seconds:number){
  if(seconds<0||seconds>=HOLOGRAM_CYCLE_SECONDS)return {x,y,z};
  const delay=hologramDelay(index),seed=delay/.18,age=Math.max(0,seconds-delay),floor=HOLOGRAM_FLOOR;
  const landing=hologramLandingTime(y,index)-delay,since=age-landing;
  const dropped=since<0?y-HOLOGRAM_GRAVITY*.5*age*age:floor+Math.abs(Math.sin(since*15))*Math.exp(-since*10)*.10;
  const u=Math.max(0,Math.min(1,(seconds-1.15-seed*.2)/(1.1+seed*.35))),lift=u*u*(3-2*u);
  const spread=Math.min(1,age/Math.max(.01,landing))*(1-lift)*.13;
  return {x:x*(1+spread),y:dropped+(y-dropped)*lift,z:z*(1+spread)};
}

/** An exploded burger silhouette drawn exclusively as disconnected light dots.
 * Each ingredient gets its own sampling budget; hidden triangle area cannot
 * consume the dots needed to read the bun, patty, lettuce and cheese. */
export function burgerHologramParticles(){
  const positions:number[]=[],colors:number[]=[],layers:number[]=[];
  const add=(x:number,y:number,z:number,hex:number,layer:number)=>{
    positions.push(x,y,z);const c=new THREE.Color(hex);colors.push(c.r,c.g,c.b);layers.push(layer);
  };
  const golden=Math.PI*(3-Math.sqrt(5));
  // Tall domed crown, with a clean rim and an air gap over the filling.
  for(let i=0;i<850;i++){
    const h=(i+.5)/850,r=1.3*Math.sqrt(1-h*h),a=i*golden;
    add(Math.cos(a)*r,.38+h*.66,Math.sin(a)*r,0xffd292,0);
  }
  // Rounded bottom bun rather than another identical dome.
  for(let i=0;i<420;i++){
    const v=(i+.5)/420,a=i*golden,r=1.24*Math.sqrt(1-Math.pow(v*2-1,2));
    add(Math.cos(a)*r,-.75+v*.32,Math.sin(a)*r,0xf4b867,1);
  }
  const band=(count:number,radius:number,y:number,thickness:number,color:number,layer:number,ripple=0)=>{
    for(let i=0;i<count;i++){
      const a=i*golden,v=(i+.5)/count,r=radius+ripple*Math.sin(a*9);
      add(Math.cos(a)*r,y+(v-.5)*thickness+ripple*Math.sin(a*7),Math.sin(a)*r,color,layer);
    }
  };
  band(220,1.14,-.30,.16,0xce91ff,2); // chargrilled patty
  band(170,1.32,-.025,.035,0x77ffd2,3,.055); // crinkled lettuce
  band(140,1.14,.19,.065,0xff869c,4); // tomato
  // Thin square cheese with visibly drooping corners, between separated layers.
  for(let i=0;i<160;i++){
    const side=i%4,t=(Math.floor(i/4)+.5)/40*2-1;
    let x=side<2?(side===0?-1:1):t,z=side>=2?(side===2?-1:1):t;
    const a=.35,rx=x*Math.cos(a)-z*Math.sin(a);z=x*Math.sin(a)+z*Math.cos(a);x=rx;
    add(x,-.135-.08*Math.pow(Math.abs(t),6),z,0xffec82,5);
  }
  for(let i=0;i<24;i++){
    const a=i*golden,r=.18+Math.sqrt(i/24)*.92,y=.38+Math.sqrt(1-r*r/(1.3*1.3))*.66;
    for(let j=0;j<3;j++)add(Math.cos(a)*r+(j-1)*.025,y+.025,Math.sin(a)*r,0xf2ffff,6);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));
  geometry.setAttribute("ingredient",new THREE.Float32BufferAttribute(layers,1));
  return geometry;
}
