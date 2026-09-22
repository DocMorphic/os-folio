/** Normalize wheel/trackpad input into a bounded logarithmic distance change. */
export function worldWheelZoom(delta:number,mode=0,pinch=false){
  if(!Number.isFinite(delta))return 0;
  const pixels=delta*(mode===1?16:mode===2?100:1)*(pinch?10:1);
  return Math.max(-240,Math.min(240,pixels))*.00085;
}

/** Exponential distance easing feels equally responsive near and far away.
 * A shared target lets wheel, pinch, middle-drag and keys accumulate smoothly. */
export function createWorldZoom(min:number,max:number){
  let target:number|null=null;
  return {
    get active(){return target!==null;},
    reset(){target=null;},
    add(distance:number,logDelta:number){
      if(!Number.isFinite(logDelta)||logDelta===0)return;
      target=Math.max(min,Math.min(max,(target??distance)*Math.exp(logDelta)));
    },
    step(distance:number,dt:number,reduced=false){
      if(target===null)return distance;
      if(reduced||Math.abs(Math.log(target/distance))<.0005){const result=target;target=null;return result;}
      return distance*Math.exp(Math.log(target/distance)*(1-Math.exp(-18*Math.max(0,dt))));
    },
  };
}
