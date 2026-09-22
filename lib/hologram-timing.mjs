// Shared by particle motion and audio: local-space acceleration is 8 units/s².
export const HOLOGRAM_FLOOR=-1.29;
export const HOLOGRAM_GRAVITY=8;
export const hologramDelay=index=>(((index*137+43)%997)/997)*.18;
export const hologramLandingTime=(height,index)=>hologramDelay(index)+Math.sqrt(2*(height-HOLOGRAM_FLOOR)/HOLOGRAM_GRAVITY);
export const HOLOGRAM_PLACEMENT={x:3.85,y:5.53,z:-.15,scale:.82};
// Eighteen representative dots from the actual bun / filling sampling budgets.
export const hologramImpactEvents=Array.from({length:18},(_,n)=>{
  let index,height;
  if(n<7){const i=Math.floor((n+.5)/7*420);index=850+i;height=-.75+(i+.5)/420*.32;}
  else if(n<15){index=Math.floor((n-7+.5)/8*850);height=.38+(index+.5)/850*.66;}
  else {
    const layer=n-15,starts=[1270,1490,1660],counts=[220,170,140];
    index=[1380,1575,1730][layer];
    const i=index-starts[layer],ripple=layer===1?.055:0;
    height=[-.30,-.025,.19][layer]+((i+.5)/counts[layer]-.5)*[.16,.035,.065][layer]
      +ripple*Math.sin(i*Math.PI*(3-Math.sqrt(5))*7);
  }
  return {index,height,at:hologramLandingTime(height,index),gain:.24+.08*Math.sin(n*3)};
});
