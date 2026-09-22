export type SoundPoint={x:number;y:number;z:number};
export const CAMERA_PASS={offset:.18,duration:1.37} as const;
/** Camera speed, not audio speed, adapts to distance within one natural pass. */
export function assetFlight(distance:number){
  const d=Math.max(0,Number.isFinite(distance)?distance:0);
  return {duration:CAMERA_PASS.duration,gain:Math.min(1,d/2)*Math.min(1.2,.65+Math.sqrt(d)*.095)};
}
/** Wall-clock timing keeps a slow render frame from delaying the visual finish. */
export function cameraTravelElapsed(startedAt:number,now:number,duration:number){return Math.max(0,Math.min(duration,(now-startedAt)/1000));}
export const CAMERA_AIR=[{name:"jesse-whoosh-original",duration:2.504375}] as const;
export function cameraAirSample(){return CAMERA_AIR[0].name;}
/** One untouched, normal-speed breath. Never stretch or repeat a noise grain. */
export function cameraAirWindow(flightDuration:number,bufferDuration:number){
  const offset=Math.min(CAMERA_PASS.offset,Math.max(0,bufferDuration-.02));
  return {offset,duration:Math.min(flightDuration,CAMERA_PASS.duration,Math.max(.02,bufferDuration-offset))};
}
/** Camera-local air travels past the listener, not a fixed left/right balance. */
export function airPass(progress:number,side:number,entrance=false){
  const t=Math.max(0,Math.min(1,progress)),direction=side<0?-1:1;
  const travel=entrance?1-Math.pow(1-t,3):t*t*t*(t*(6*t-15)+10);
  return {x:direction*(1.35-2.7*travel),y:1.55,z:-1.8+4.2*travel};
}
export function cameraPassGain(progress:number,duration:number){
  const t=Math.max(0,Math.min(1,progress));
  // The unmodified recording supplies the swell. Only soften the two edges.
  const attack=Math.min(1,t*duration/.08),release=Math.min(1,(1-t)*duration/.22);
  return Math.sin(attack*Math.PI/2)**2*Math.sin(release*Math.PI/2)**2;
}
export function listenerToWorld(local:SoundPoint,position:SoundPoint,forward:SoundPoint,up:SoundPoint):SoundPoint{
  const right={x:forward.y*up.z-forward.z*up.y,y:forward.z*up.x-forward.x*up.z,z:forward.x*up.y-forward.y*up.x};
  return {x:position.x+right.x*local.x+up.x*local.y-forward.x*local.z,y:position.y+right.y*local.x+up.y*local.y-forward.y*local.z,z:position.z+right.z*local.x+up.z*local.y-forward.z*local.z};
}
export const WORLD_MUSIC={
  day:{src:"/audio/world/minecraft.mp3",title:"Minecraft",artist:"C418"},
  night:{src:"/audio/world/haggstrom.mp3",title:"Haggstrom",artist:"C418"},
} as const;
