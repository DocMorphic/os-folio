const TAU=Math.PI*2;
/** Build once per visit: an off-centre basin with scattered local erosion.
 * No angular sectors, alternating radii, or prescribed opening-view symmetry.
 * @param {number} seed */
export function createShoreline(seed=Math.floor(Math.random()*0xffffffff)){
  let state=seed>>>0;
  const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  const rotation=random()*TAU,axisX=132+random()*8,axisZ=120+random()*12;
  const offsetAngle=rotation+(random()-.5)*1.1,offset=58+random()*8;
  const features=Array.from({length:3+Math.floor(random()*5)},()=>({
    angle:random()*TAU,width:.22+random()*.55,depth:(random()-.45)*25,
  }));
  const profile={seed,rotation,axisX,axisZ,cx:Math.cos(offsetAngle)*offset,cz:Math.sin(offsetAngle)*offset,features};
  // Reduce only excessive local erosion. Remapping every radius to a forced
  // min/max would turn the offset oval itself into a pinched limacon.
  for(let attempt=0;attempt<12;attempt++){
    const samples=Array.from({length:1024},(_,i)=>rawRadius(i/1024*TAU,profile));
    if(Math.min(...samples)>=52&&Math.max(...samples)<=224)break;
    for(const feature of features)feature.depth*=.65;
  }
  return profile;
}
function rawRadius(angle,p){
  const c=Math.cos(p.rotation),s=Math.sin(p.rotation),dx=Math.cos(angle-p.rotation),dz=Math.sin(angle-p.rotation);
  const cx=p.cx*c+p.cz*s,cz=-p.cx*s+p.cz*c;
  const ax=1/(p.axisX*p.axisX),az=1/(p.axisZ*p.axisZ);
  const a=dx*dx*ax+dz*dz*az,b=-2*(dx*cx*ax+dz*cz*az),q=cx*cx*ax+cz*cz*az-1;
  let r=(-b+Math.sqrt(b*b-4*a*q))/(2*a);
  for(const f of p.features)r+=f.depth*Math.exp((Math.cos(angle-f.angle)-1)/(f.width*f.width));
  return r;
}
export const DEFAULT_SHORELINE=createShoreline(417);
/** @param {number} angle */
export function shorelineRadius(angle,profile=DEFAULT_SHORELINE){
  return rawRadius(angle,profile);
}
// GLSL and geometry derive from the exact same seed, never independent noise.
export function shorelineShader(profile=DEFAULT_SHORELINE){
  const n=value=>value.toFixed(12),p=profile,c=Math.cos(p.rotation),s=Math.sin(p.rotation);
  const cx=p.cx*c+p.cz*s,cz=-p.cx*s+p.cz*c;
  return `float shorelineRadius(float angle){
    vec2 d=vec2(cos(angle-${n(p.rotation)}),sin(angle-${n(p.rotation)}));
    vec2 inverseAxes=vec2(${n(1/(p.axisX*p.axisX))},${n(1/(p.axisZ*p.axisZ))});
    vec2 center=vec2(${n(cx)},${n(cz)});
    float a=dot(d*d,inverseAxes),b=-2.*dot(d*center,inverseAxes),q=dot(center*center,inverseAxes)-1.;
    float r=(-b+sqrt(max(0.,b*b-4.*a*q)))/(2.*a);
    ${p.features.map(f=>`r+=(${n(f.depth)})*exp((cos(angle-${n(f.angle)})-1.)/${n(f.width*f.width)});`).join('')}
    return r;
  }`;
}
/** Keep zooming/portrait entrance cameras on the lake side of close terrain.
 * @param {{x:number,y:number,z:number}} position */
export function keepCameraInsideLake(position,profile=DEFAULT_SHORELINE){
  const radius=Math.hypot(position.x,position.z),limit=shorelineRadius(Math.atan2(position.z,position.x),profile)-10;
  const scale=radius>limit?limit/radius:1;
  return {x:position.x*scale,y:position.y,z:position.z*scale};
}
