/** Keep Retina detail stable, even during motion or slow frames. Only idle
 * frame cadence is reduced; never lower the scene's resolution to chase FPS. */
export function worldFramePolicy(moving:boolean,deviceRatio:number){
  const ratio=Number.isFinite(deviceRatio)?Math.max(1,deviceRatio):1;
  return {pixelRatio:Math.min(ratio,2),idleDelay:moving?0:16};
}
