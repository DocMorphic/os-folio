export const RIPPLE_DOMAIN=128;
export const RIPPLE_RESOLUTION=384;
export const RIPPLE_STEP=1/60;
export const RIPPLE_IMPULSES=8;
export type WaterPoint={x:number;z:number};
export type WaterImpulse=WaterPoint&{radius:number;strength:number};
export function openWater(p:WaterPoint){
  return Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.abs(p.x)<RIPPLE_DOMAIN/2-1&&Math.abs(p.z)<RIPPLE_DOMAIN/2-1&&!(Math.abs(p.x)<6.85&&Math.abs(p.z)<4.7);
}
/** Spatially sampled bow pressure and stern depression. Pointer jumps, touch
 * orbiting and tab switches must never draw a giant slash across the lake. */
export class WaterInteraction {
  private previous:(WaterPoint&{time:number})|null=null;
  private pending:WaterImpulse[]=[];
  private push(impulse:WaterImpulse){if(openWater(impulse)){this.pending.push(impulse);if(this.pending.length>RIPPLE_IMPULSES)this.pending.shift();}}
  reset(){this.previous=null;}
  click(p:WaterPoint){this.reset();this.push({...p,radius:.7,strength:.11});}
  splash(p:WaterPoint,strength=.13){this.push({...p,radius:.6,strength});}
  move(p:WaterPoint,time:number){
    if(!openWater(p)){this.reset();return;}
    const from=this.previous;
    if(!from){this.previous={...p,time};return;}
    const dx=p.x-from.x,dz=p.z-from.z,distance=Math.hypot(dx,dz),dt=time-from.time;
    if(dt<=0||dt>.25||distance>4){this.previous={...p,time};return;}
    if(distance<.24)return;
    const count=Math.min(3,Math.ceil(distance/.4)),sideX=-dz/distance,sideZ=dx/distance,speed=Math.min(1,distance/dt/12);
    for(let i=1;i<=count;i++){
      const x=from.x+dx*i/count,z=from.z+dz*i/count;
      this.push({x,z,radius:.34,strength:-.012-speed*.018});
      // A pair of displaced shoulders trails either side of the moving cursor.
      for(const sign of [-1,1])this.push({x:x+sideX*.38*sign-dx/distance*.18,z:z+sideZ*.38*sign-dz/distance*.18,radius:.29,strength:.005+speed*.007});
    }
    this.previous={...p,time};
  }
  drain(){return this.pending.splice(0,RIPPLE_IMPULSES);}
}
