import * as THREE from 'three';

export type SkyBird={position:THREE.Vector3;previous:THREE.Vector3;velocity:THREE.Vector3;acceleration:THREE.Vector3;flock:number;phase:number;scale:number;bank:number};
/** Local flock steering after Reynolds: separation, alignment, cohesion, plus
 * migration goals. Routes cross the lake and leave; no orbital sine paths. */
export function createSkyFlock(seed=19427){
  let state=seed>>>0,time=0,carry=0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const birds:SkyBird[]=[],flocks:{goal:THREE.Vector3;stage:number;direction:number;center:THREE.Vector3}[]=[];
  const sizes=[9,11,7,1,1],centers=[[14,19,-17],[40,28,-48],[-8,25,67],[-48,22,-9],[56,32,35]];
  for(let f=0;f<sizes.length;f++){
    const p=new THREE.Vector3(...centers[f]),direction=f%2?-.9:1.65;
    flocks.push({goal:new THREE.Vector3(Math.sin(direction)*85,20+random()*12,Math.cos(direction)*85),stage:0,direction,center:p.clone()});
    for(let i=0;i<sizes[f];i++){
      const position=p.clone().add(new THREE.Vector3((i%4-1.5)*2.1+random()*.4,random()*1.7,Math.floor(i/4)*2.1));
      birds.push({position,previous:position.clone(),velocity:new THREE.Vector3(Math.sin(direction)*7.5,0,Math.cos(direction)*7.5),acceleration:new THREE.Vector3(),flock:f,phase:random()*40,scale:.76+random()*.24,bank:0});
    }
  }
  const delta=new THREE.Vector3(),alignment=new THREE.Vector3(),cohesion=new THREE.Vector3(),separation=new THREE.Vector3(),desired=new THREE.Vector3();
  function step(dt:number){
    time+=dt;
    for(let f=0;f<flocks.length;f++){
      const flock=flocks[f];flock.center.set(0,0,0);
      for(const b of birds)if(b.flock===f)flock.center.add(b.position);
      flock.center.multiplyScalar(1/sizes[f]);
      if(flock.stage===1&&Math.hypot(flock.center.x,flock.center.z)>146){
        const angle=random()*Math.PI*2,entry=new THREE.Vector3(Math.sin(angle)*152,20+random()*12,Math.cos(angle)*152);
        flock.direction=angle+Math.PI+(random()-.5)*.65;flock.stage=0;
        flock.goal.set(Math.sin(flock.direction)*65,19+random()*14,Math.cos(flock.direction)*65);
        for(const b of birds)if(b.flock===f){b.position.sub(flock.center).add(entry);b.previous.copy(b.position);b.velocity.set(Math.sin(flock.direction)*7.5,0,Math.cos(flock.direction)*7.5);}
        flock.center.copy(entry);
      }
      if(flock.center.distanceTo(flock.goal)<18){
        // Keep onward travel, but vary the next bearing instead of reversing
        // toward a central attractor (which produces endless circles).
        flock.direction+=(random()-.5)*.65;flock.stage=1;
        flock.goal.copy(flock.center).add(new THREE.Vector3(Math.sin(flock.direction)*180,0,Math.cos(flock.direction)*180));flock.goal.y=22+random()*12;
      }
    }
    for(const b of birds){
      alignment.set(0,0,0);cohesion.set(0,0,0);separation.set(0,0,0);let neighbors=0;
      for(const other of birds){
        if(other===b)continue;delta.subVectors(other.position,b.position);const d2=delta.lengthSq();
        if(d2<5&&d2>.0001)separation.addScaledVector(delta,-2.8/d2);
        if(other.flock===b.flock&&d2<90&&delta.dot(b.velocity)>-15){alignment.add(other.velocity);cohesion.add(other.position);neighbors++;}
      }
      desired.subVectors(flocks[b.flock].goal,b.position).normalize().multiplyScalar(7.6+b.scale);
      b.acceleration.copy(desired).sub(b.velocity).multiplyScalar(.62).add(separation);
      if(neighbors){alignment.multiplyScalar(1/neighbors).sub(b.velocity);cohesion.multiplyScalar(1/neighbors).sub(b.position);b.acceleration.addScaledVector(alignment,.45).addScaledVector(cohesion,.12);}
      b.acceleration.y+=Math.sin(time*.47+b.phase)*.12;
      if(b.position.y<16)b.acceleration.y+=(16-b.position.y)*1.5;
      if(b.position.y>38)b.acceleration.y-=(b.position.y-38)*1.5;
      b.acceleration.clampLength(0,2.6);
    }
    for(const b of birds){
      b.previous.copy(b.position);b.velocity.addScaledVector(b.acceleration,dt);b.velocity.y=THREE.MathUtils.clamp(b.velocity.y,-2.2,2.2);
      const horizontal=Math.hypot(b.velocity.x,b.velocity.z),speed=THREE.MathUtils.clamp(horizontal,6.4,9.2);
      b.velocity.x*=speed/horizontal;b.velocity.z*=speed/horizontal;b.position.addScaledVector(b.velocity,dt);
      const turn=(b.velocity.x*b.acceleration.z-b.velocity.z*b.acceleration.x)/speed;
      b.bank=THREE.MathUtils.lerp(b.bank,THREE.MathUtils.clamp(-turn*.18,-.42,.42),1-Math.exp(-dt*4));
    }
  }
  return {birds,get time(){return time;},get interpolation(){return carry/(1/60);},advance(dt:number){
    carry+=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
    while(carry>=1/60){step(1/60);carry-=1/60;}
  }};
}
