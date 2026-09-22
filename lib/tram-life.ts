import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { burgerHologramParticles,hologramDotPose,HOLOGRAM_CYCLE_SECONDS } from "./burger-hologram";
import {HOLOGRAM_PLACEMENT} from "./hologram-timing.mjs";
import {GRILL_POSITION,STEAM_COUNT,steamPose,COFFEE_STEAM_ORIGINS,coffeeSteamPose} from "./tram-kitchen";

const noise=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
export const BUTTERFLY_SPECIES=["Monarch","Cabbage white","Common blue","Red admiral"] as const;
/** Each visitor rests on a flower, takes an independent curved flight, then lands.
 * Pure time sampling makes hidden-tab resumes stable without shared phase loops. */
export function butterflyPose(t:number,index:number) {
  const duration=10.7+index*2.83,clock=Math.max(0,t)+index*7.19,cycle=Math.floor(clock/duration),phase=clock/duration-cycle;
  const anchor=(n:number)=>{const a=noise(n*3.1+index*23)*Math.PI*2;return new THREE.Vector3((index%2?3.85:-5.1)+Math.cos(a)*.48,.69+noise(n+index*11)*.12,(index<2?2.9:-2.4)+Math.sin(a)*.35);};
  const from=anchor(cycle),to=anchor(cycle+1),u=THREE.MathUtils.clamp((phase-.22)/.67,0,1),s=u*u*u*(u*(6*u-15)+10);
  const arc=Math.sin(u*Math.PI),turn=noise(cycle+index*37)>.5?1:-1;
  const p=from.clone().lerp(to,s);p.x+=Math.sin(u*Math.PI*2)*arc*.29*turn;p.z+=arc*.44*turn;p.y+=arc*(.58+noise(cycle+index*7)*.67);
  const flight=u>0&&u<1;
  const dx=(to.x-from.x)+Math.cos(u*Math.PI*2)*.6*turn,dz=(to.z-from.z)+Math.cos(u*Math.PI)*.44*turn;
  return {x:p.x,y:p.y,z:p.z,heading:Math.atan2(dx,dz),bank:Math.sin(u*Math.PI*2)*.16,
    flap:flight?.22+(Math.sin(t*(18.7+index*2.13)+Math.sin(t*.7+index)*2)+1)*.57:1.05+Math.sin(t*(.8+index*.13))*.14,
    perched:!flight};
}

function colored(parts:{g:THREE.BufferGeometry;color:number;p?:number[];s?:number[];r?:number[]}[]) {
  const geometries=parts.map(({g,color,p=[0,0,0],s=[1,1,1],r=[0,0,0]})=>{
    const geo=g.index?g.toNonIndexed():g.clone();g.dispose();
    geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),new THREE.Vector3(...s)));
    const c=new THREE.Color(color),values=new Float32Array(geo.attributes.position.count*3);for(let i=0;i<values.length;i+=3){values[i]=c.r;values[i+1]=c.g;values[i+2]=c.b;}geo.setAttribute("color",new THREE.BufferAttribute(values,3));return geo;
  });
  const result=mergeGeometries(geometries,false)!;geometries.forEach(g=>g.dispose());return result;
}
const sphere=(r:number)=>new THREE.SphereGeometry(r,12,8);
function burgerGeometry() {
  const parts:Parameters<typeof colored>[0]=[
    {g:sphere(.22),color:0xc58c42,p:[0,.07,0],s:[1,.35,1]},
    {g:new THREE.CylinderGeometry(.215,.215,.045,24),color:0x553322,p:[0,.13,0]},
    {g:new THREE.CylinderGeometry(.23,.22,.015,16),color:0x76a348,p:[0,.16,0]},
    {g:new THREE.BoxGeometry(.31,.012,.31),color:0xe8b847,p:[0,.177,0],r:[0,.45,0]},
    {g:new THREE.SphereGeometry(.225,24,12,0,Math.PI*2,0,Math.PI/2),color:0xe0aa60,p:[0,.18,0],s:[1,.62,1]},
  ];
  for(let i=0;i<16;i++){const a=i*2.4,r=.035*Math.sqrt(i);parts.push({g:new THREE.SphereGeometry(.012,8,6),color:0xf8df9e,p:[Math.cos(a)*r,.18+Math.sqrt(.225*.225-r*r)*.62,Math.sin(a)*r],s:[.45,.3,1]});}
  return colored(parts);
}

export function createTramLife(scene:THREE.Scene,materials:THREE.Material[]) {
  const root=new THREE.Group();root.name="Life / independent butterflies and kitchen";scene.add(root);
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.74,side:THREE.DoubleSide});materials.push(material);
  const add=(geometry:THREE.BufferGeometry,parent:THREE.Object3D=root)=>{const m=new THREE.Mesh(geometry,material);parent.add(m);return m;};
  const bodyParts:Parameters<typeof colored>[0]=[{g:sphere(.022),color:0x342e29,s:[.6,.7,3.1]},{g:sphere(.018),color:0x252926,p:[0,.006,.072]}];
  for(const side of [-1,1])bodyParts.push({g:new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,0,.078),new THREE.Vector3(side*.026,.016,.12),new THREE.Vector3(side*.038,.01,.122)),6,.003,3,false),color:0x302c28});
  const butterflyBody=colored(bodyParts);
  const butterflyWings=[0xdb8734,0xf5ead3,0x6fabe0,0x29272a].map((color,i)=>{
    const shape=new THREE.Shape();shape.moveTo(0,0);shape.bezierCurveTo(.07,.12,.13,.21,.185,.17);shape.bezierCurveTo(.22,.09,.15,.03,.105,.005);shape.bezierCurveTo(.22,-.085,.105,-.19,.046,-.11);shape.quadraticCurveTo(.012,-.06,0,0);
    const parts:Parameters<typeof colored>[0]=[{g:new THREE.ShapeGeometry(shape,12),color:0x292c2a,r:[Math.PI/2,0,0]},{g:new THREE.ShapeGeometry(shape,12),color,p:[.005,.003,0],s:[.88,.88,.88],r:[Math.PI/2,0,0]}];
    // Veins, pale edge spots, and species-specific wing bands remain attached to each wing.
    for(let n=0;n<5;n++){
      const tip=new THREE.Vector3(.065+n*.027,.006,-.045-n*.022);
      parts.push({g:new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(.015,.006,0),tip),1,.0018,3,false),color:i===1?0xb8b8a0:0x423834});
      parts.push({g:new THREE.SphereGeometry(.007,8,4),color:i===3?0xf3e4d2:0xffebc0,p:[.071+n*.026,.007,-.054-n*.024],s:[1,.25,1]});
    }
    if(i===1)parts.push({g:sphere(.018),color:0x454844,p:[.115,.008,-.09],s:[1,.2,1]});
    if(i===3)for(let n=0;n<4;n++)parts.push({g:sphere(.022),color:0xde5535,p:[.058+n*.023,.008,-.029-n*.016],s:[.7,.2,1]});
    return colored(parts);
  });
  const butterflies=BUTTERFLY_SPECIES.map((species,i)=>{const group=new THREE.Group();group.name=`Butterfly / ${species}`;group.scale.setScalar([1.3,1.05,.87,1.17][i]);root.add(group);add(butterflyBody,group);const left=add(butterflyWings[i],group),right=add(butterflyWings[i],group);right.scale.x=-1;return {group,left,right};});
  const kitchen=new THREE.Group();kitchen.name="Kitchen / sizzling burger griddle";kitchen.position.copy(GRILL_POSITION);root.add(kitchen);
  const grillParts:Parameters<typeof colored>[0]=[{g:new THREE.BoxGeometry(1.03,.12,.57),color:0x697874},{g:new THREE.BoxGeometry(.94,.025,.51),color:0x293c3c,p:[0,.073,0]},{g:new THREE.BoxGeometry(1,.07,.04),color:0x87928b,p:[0,.13,-.27]}];
  for(let i=0;i<12;i++)grillParts.push({g:new THREE.BoxGeometry(.018,.013,.47),color:0x46554f,p:[-.43+i*.078,.091,0]});
  for(const x of [-.33,.33])grillParts.push({g:new THREE.CylinderGeometry(.035,.035,.025,10),color:0xb59966,p:[x,-.014,.3],r:[Math.PI/2,0,0]});
  add(colored(grillParts),kitchen);const burger=burgerGeometry();for(const x of [-.25,.25]){const b=add(burger,kitchen);b.position.set(x,.08,0);b.scale.setScalar(.9);}
  // Small rising vapor particles fade out rather than popping at the loop seam.
  const steamGeo=new THREE.BufferGeometry(),positions=new Float32Array(STEAM_COUNT*3),ages=new Float32Array(STEAM_COUNT),sizes=new Float32Array(STEAM_COUNT),seeds=new Float32Array(STEAM_COUNT);
  steamGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));steamGeo.setAttribute("alpha",new THREE.BufferAttribute(ages,1));
  steamGeo.setAttribute("size",new THREE.BufferAttribute(sizes,1));steamGeo.setAttribute("seed",new THREE.BufferAttribute(seeds,1));
  const steamMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{viewportHeight:{value:900},time:{value:0},night:{value:0}},
    vertexShader:`attribute float alpha;attribute float size;attribute float seed;uniform float viewportHeight;varying float fade;varying float phase;
      void main(){fade=alpha;phase=seed;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(size*viewportHeight*projectionMatrix[1][1]/max(.2,-p.z),1.,110.);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`uniform float time;uniform float night;varying float fade;varying float phase;
      void main(){vec2 p=(gl_PointCoord-.5)*2.;float angle=phase*6.28+time*.12;mat2 turn=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));p=turn*p;
        p.x+=.13*sin(p.y*5.+phase*12.+time*.6);float r=length(p*vec2(1.15,.86));
        float feather=1.-smoothstep(.05,1.,r);float folds=.65+.35*sin(p.y*7.+p.x*4.+phase*17.);
        gl_FragColor=vec4(mix(vec3(.82,.84,.81),vec3(.39,.43,.46),night),feather*feather*folds*fade*.16);
      }`});materials.push(steamMat);
  const steam=new THREE.Points(steamGeo,steamMat);steam.name="Kitchen / soft rising steam";steam.frustumCulled=false;kitchen.add(steam);
  const coffeeGeo=new THREE.BufferGeometry(),coffeeCount=24;
  for(const [name,size] of [["position",3],["alpha",1],["size",1],["seed",1]] as const)coffeeGeo.setAttribute(name,new THREE.BufferAttribute(new Float32Array(coffeeCount*size),size));
  const coffeeSteam=new THREE.Points(coffeeGeo,steamMat);coffeeSteam.name="Coffee / fine rising steam";coffeeSteam.frustumCulled=false;root.add(coffeeSteam);
  const holoGeo=burgerHologramParticles();
  const originalDots=Float32Array.from(holoGeo.attributes.position.array);
  let hologramStart:number|null=null,lastTime=0,hologramAngle=0;
  const placement=HOLOGRAM_PLACEMENT;
  const holo=new THREE.Group();holo.name="Roof / rotating burger hologram";holo.position.set(placement.x,placement.y,placement.z);holo.scale.setScalar(placement.scale);root.add(holo);
  const holoColor={value:new THREE.Color(0x39e8ff)};
  // Only separate light particles are rendered. The sampled shape is never a
  // visible mesh: no shell, wireframe, connecting lines, or projection cone.
  const dotsMat=new THREE.ShaderMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,uniforms:{holoColor},
    vertexShader:`uniform float time;uniform vec3 holoColor;varying vec3 tint;varying float pulse;
      void main(){
        float seed=fract(sin(dot(position,vec3(12.9898,78.233,39.425)))*43758.5453);
        vec3 drift=vec3(sin(time*.72+seed*63.),sin(time*.95+seed*97.),cos(time*.63+seed*41.))*.013;
        // A luminous scan travels through the point volume; most dots remain
        // faintly visible so the recognizable ingredient silhouette survives.
        float scan=exp(-pow((mod(position.y-time*.48+1.8,1.8)-.9)*9.,2.));
        float shimmer=.88+.12*sin(time*19.+seed*57.);
        tint=mix(color,holoColor,.62);pulse=(.65+scan*.8)*shimmer;
        vec4 p=modelViewMatrix*vec4(position+drift,1.);
        gl_PointSize=clamp(78./max(.1,-p.z),3.,6.);
        gl_Position=projectionMatrix*p;
      }`,
    fragmentShader:`uniform vec3 holoColor;varying vec3 tint;varying float pulse;
      void main(){
        float d=length(gl_PointCoord-.5)*2.;if(d>.95)discard;
        float halo=exp(-d*d*5.),core=1.-smoothstep(.16,.52,d);
        gl_FragColor=vec4(tint*(1.8+core),(.4*halo+.8*core)*pulse);
        #include <colorspace_fragment>
      }`});dotsMat.uniforms.time={value:0};materials.push(dotsMat);holo.add(new THREE.Points(holoGeo,dotsMat));
  // Disconnected ascending light specks visually tie the image to its emitter.
  const projectionGeo=new THREE.BufferGeometry(),projectionPositions=new Float32Array(96*3);
  for(let i=0;i<96;i++){const a=i*2.399,r=.12+noise(i)*.22;projectionPositions.set([Math.cos(a)*r,noise(i+100),Math.sin(a)*r],i*3);}
  projectionGeo.setAttribute("position",new THREE.BufferAttribute(projectionPositions,3));
  const projectionMat=new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,uniforms:{time:dotsMat.uniforms.time,holoColor},
    vertexShader:`uniform float time;varying float strength;void main(){float u=fract(position.y+time*.42);vec3 q=vec3(position.x*(.6+u*2.),-1.32+u*.58,position.z*(.6+u*2.));strength=sin(u*3.14159)*.38;vec4 p=modelViewMatrix*vec4(q,1.);gl_PointSize=clamp(45./max(.1,-p.z),1.5,3.);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`uniform vec3 holoColor;varying float strength;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(holoColor,exp(-d*d*4.)*strength);
      #include <colorspace_fragment>
    }`});
  materials.push(projectionMat);holo.add(new THREE.Points(projectionGeo,projectionMat));
  const base=add(colored([{g:new THREE.CylinderGeometry(.49,.53,.1,40),color:0x294951},{g:new THREE.TorusGeometry(.42,.016,6,48),color:0xa6d8bc,r:[Math.PI/2,0,0]},{g:new THREE.CylinderGeometry(.32,.32,.015,32),color:0x78bcb1,p:[0,.058,0]}]));base.name="Hologram / mounted emitter";base.position.set(placement.x,4.4,placement.z);
  // The burger stays entirely point-based. A separate optical emitter gives
  // those dots a visible source: a bright lens and soft widening shaft of light.
  const beamMaterial=new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,uniforms:{time:dotsMat.uniforms.time,holoColor},
    vertexShader:`varying vec2 beamUV;varying vec3 beamNormal;varying vec3 beamView;void main(){beamUV=uv;vec4 p=modelViewMatrix*vec4(position,1.);beamView=-p.xyz;beamNormal=normalMatrix*normal;gl_Position=projectionMatrix*p;}`,
    fragmentShader:`uniform float time;uniform vec3 holoColor;varying vec2 beamUV;varying vec3 beamNormal;varying vec3 beamView;void main(){
      float edge=pow(abs(dot(normalize(beamNormal),normalize(beamView))),1.4);
      float heightFade=1.-smoothstep(.35,1.,beamUV.y);
      float rays=.78+.22*pow(.5+.5*sin(beamUV.x*94.25+time*.18),6.);
      float alpha=edge*heightFade*rays*(.23+.025*sin(time*3.));
      gl_FragColor=vec4(holoColor*1.7,alpha);
      #include <colorspace_fragment>
    }`});materials.push(beamMaterial);
  const beamGeometry=new THREE.CylinderGeometry(1.18,.29,.65,48,1,true);
  const beam=new THREE.Mesh(beamGeometry,beamMaterial);beam.name="Hologram / light from the circular emitter";beam.position.set(placement.x,4.793,placement.z);beam.scale.set(placement.scale,1,placement.scale);root.add(beam);
  const lensMaterial=new THREE.ShaderMaterial({transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,uniforms:{time:dotsMat.uniforms.time,holoColor},
    vertexShader:`varying vec2 lensUV;void main(){lensUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform float time;uniform vec3 holoColor;varying vec2 lensUV;void main(){float r=length(lensUV-.5)*2.;float core=1.-smoothstep(.2,.6,r);float halo=exp(-r*r*5.);float ring=exp(-pow((r-.58)*35.,2.));gl_FragColor=vec4(mix(holoColor,vec3(1.),core*.8)*2.,(core*.8+halo*.5+ring*.65)*(.94+.06*sin(time*3.)));
      #include <colorspace_fragment>
    }`});materials.push(lensMaterial);
  const lensGeometry=new THREE.PlaneGeometry(1.15,1.15),lens=new THREE.Mesh(lensGeometry,lensMaterial);lens.name="Hologram / luminous projector lens";lens.rotation.x=-Math.PI/2;lens.position.set(placement.x,4.47,placement.z);root.add(lens);
  const update=(t:number,night=0)=>{
    for(let i=0;i<coffeeCount;i++){
      const p=coffeeSteamPose(t,i),origin=COFFEE_STEAM_ORIGINS[Math.floor(i/12)];
      coffeeGeo.attributes.position.setXYZ(i,origin.x+p.x,origin.y+p.y,origin.z+p.z);
      coffeeGeo.attributes.alpha.setX(i,p.alpha*1.2);coffeeGeo.attributes.size.setX(i,p.size);coffeeGeo.attributes.seed.setX(i,p.seed);
    }
    for(const attribute of Object.values(coffeeGeo.attributes))attribute.needsUpdate=true;
    const elapsed=hologramStart===null?-1:Math.max(0,t-hologramStart);
    if(hologramStart!==null){
      const attribute=holoGeo.attributes.position;
      for(let i=0;i<attribute.count;i++){const p=hologramDotPose(originalDots[i*3],originalDots[i*3+1],originalDots[i*3+2],i,elapsed);attribute.setXYZ(i,p.x,p.y,p.z);}
      attribute.needsUpdate=true;
      if(elapsed>=HOLOGRAM_CYCLE_SECONDS)hologramStart=null;
    }else hologramAngle-=Math.min(.05,Math.max(0,t-lastTime))*.23;
    lastTime=t;
    for(let i=0;i<butterflies.length;i++){const b=butterflies[i],p=butterflyPose(t,i);b.group.position.set(p.x,p.y,p.z);b.group.rotation.set(0,p.heading,p.bank);b.left.rotation.z=p.flap;b.right.rotation.z=-p.flap;}
    for(let i=0;i<STEAM_COUNT;i++){const p=steamPose(t,i);positions[i*3]=p.x;positions[i*3+1]=p.y;positions[i*3+2]=p.z;ages[i]=p.alpha;sizes[i]=p.size;seeds[i]=p.seed;}
    steamMat.uniforms.time.value=t;steamMat.uniforms.night.value=night;steamGeo.attributes.size.needsUpdate=true;steamGeo.attributes.seed.needsUpdate=true;
    steamGeo.attributes.position.needsUpdate=true;steamGeo.attributes.alpha.needsUpdate=true;
    holo.rotation.y=hologramAngle;holo.position.y=placement.y+(hologramStart===null?Math.sin(t*.9)*.045:0);dotsMat.uniforms.time.value=t;
    beam.scale.y=(.65+Math.sin(t*.9)*.045)/.65;beam.position.y=4.468+.325*beam.scale.y;
    root.updateMatrixWorld(true);
  };
  update(0);return {root,update,get hologramActive(){return hologramStart!==null;},setSteamViewport:(height:number)=>{steamMat.uniforms.viewportHeight.value=height;},cycleHologram:(at=lastTime)=>{if(hologramStart!==null)return false;hologramStart=at;return true;},dispose:()=>{coffeeGeo.dispose();steamGeo.dispose();holoGeo.dispose();projectionGeo.dispose();beamGeometry.dispose();lensGeometry.dispose();}};
}
