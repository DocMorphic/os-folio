/** Cosmetic loading pacing; actual route readiness remains a separate gate. */
export function createLoadingRun(random:()=>number=Math.random){
  const duration=3000+Math.floor(random()*2001);
  const weights=Array.from({length:6},()=>.08+random());
  const total=weights.reduce((sum,value)=>sum+value,0);
  let progress=0;
  return {duration,stops:[0,...weights.map(weight=>(progress+=weight/total))]};
}
export function loadingScore(elapsed:number,run:ReturnType<typeof createLoadingRun>){
  // Reserve the final 200 ms for a visible 00100 before Begin replaces the game.
  const t=Math.max(0,Math.min(1,elapsed/(run.duration-200)))*6;
  const segment=Math.min(5,Math.floor(t)),fraction=t-segment;
  const eased=fraction*fraction*(3-2*fraction);
  return Math.min(100,Math.floor(100*(run.stops[segment]+(run.stops[segment+1]-run.stops[segment])*eased)+1e-6));
}
