/** Shared visual/audio emitter: the griddle, not the roof hologram. */
export const GRILL_POSITION={x:2.75,y:2.25,z:.9};
export const STEAM_COUNT=32;
export const COFFEE_STEAM_ORIGINS=[{x:1.78,y:2.425,z:.7},{x:-1.25,y:2.37,z:-1.12}] as const;
export function coffeeSteamPose(time:number,index:number){
  const seed=hash(index+113),age=(Math.max(0,time)/(2.6+seed)+seed)%1;
  return {x:Math.sin(age*6+seed*8)*age*.035,y:age*.42,z:Math.cos(age*5+seed*12)*age*.025,size:.018+age*.105,alpha:Math.sin(Math.PI*age)**1.8,seed};
}
const hash=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export function steamPose(time:number,index:number){
  const seed=hash(index+19),life=3.1+seed*1.4;
  const age=((Math.max(0,time)/life+hash(index+7))%1);
  const sway=Math.sin(age*4.4+seed*6.28);
  return {x:(index%2?-.25:.25)+sway*age*.16,y:.22+age*.93,
    z:Math.cos(age*3.7+seed*8)*age*.11,size:.09+age*.38,
    alpha:Math.sin(Math.PI*age)**1.6,seed};
}
export function grillGain(distance:number,inspecting:boolean){
  const proximity=Math.max(0,Math.min(1,(22-Math.max(0,distance))/18));
  return (inspecting?.012:.12)*proximity*proximity;
}
