import * as THREE from "three";
import {openWater,type WaterPoint} from "./water-interaction";

export const FISH_SPECIES=["Rainbow trout","Golden koi","Silver salmon"] as const;
export const WATER_HEIGHT=-.49;
// Distinct silhouettes at the same camera distance, plus individual variation.
export function fishSize(species:number,appearance:number){
  const variation=((appearance*.61803398875)%1)*.32+.84;
  return [.58,.98,1.48][species]*variation;
}
export function fishBallistic(t:number,lift:number,speed:number){return {height:lift*t-4.905*t*t,forward:speed*t,verticalVelocity:lift-9.81*t,duration:2*lift/9.81};}
export function fishLanding(start:WaterPoint,heading:number,lift:number,speed:number){const distance=2*lift/9.81*speed;return {x:start.x+Math.cos(heading)*distance,z:start.z+Math.sin(heading)*distance};}
export function fishNoseEntry(lift:number,speed:number,size:number){
  let low=lift/9.81,high=2*lift/9.81;
  for(let i=0;i<20;i++){
    const t=(low+high)/2,p=fishBallistic(t,lift,speed);
    const nose=p.height+.6*size*p.verticalVelocity/Math.hypot(speed,p.verticalVelocity);
    if(nose>0)low=t;else high=t;
  }
  return (low+high)/2;
}

/** Three reusable swimmers and six splash slots: clicks never allocate meshes. */
export function createWorldFish(scene:THREE.Scene,materials:THREE.Material[],onSplash:(p:WaterPoint,strength:number)=>void){
  const root=new THREE.Group();root.name="Lake / jumping fish";scene.add(root);
  const clip=new THREE.Plane(new THREE.Vector3(0,1,0),-WATER_HEIGHT),geometries:THREE.BufferGeometry[]=[];
  const own=<T extends THREE.BufferGeometry>(g:T)=>{geometries.push(g);return g;};
  const phase={value:0};
  // A travelling bend runs through the body, peduncle and fins in one coordinate
  // system. Nothing hinges off a disconnected ellipsoid during the jump.
  const flex=(material:THREE.MeshStandardMaterial,skin=-1)=>{
    material.onBeforeCompile=shader=>{
      shader.uniforms.fishPhase=phase;
      shader.vertexShader="uniform float fishPhase; varying vec3 fishPosition;\n"+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        fishPosition=position;
        float bend=pow(clamp((.12-position.x)/.82,0.,1.),2.);
        transformed.z+=sin(fishPhase-position.x*7.)*bend*.075;`);
      shader.fragmentShader="varying vec3 fishPosition;\n"+shader.fragmentShader;
      if(skin>=0)shader.fragmentShader=shader.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        vec3 p=fishPosition;
        float angle=atan(p.z,p.y);
        vec2 scales=vec2(p.x*78.,angle*13.);
        scales.x+=mod(floor(scales.y),2.)*.5;
        vec2 cell=fract(scales)-.5;
        float rim=smoothstep(.34,.49,length(cell*vec2(.9,1.)));
        diffuseColor.rgb*=1.-rim*.14*(1.-smoothstep(.25,.52,p.x));
        ${skin===0||skin===2?`vec2 spots=vec2(p.x*33.,angle*9.);vec2 tile=floor(spots);float seed=fract(sin(dot(tile,vec2(127.1,311.7)))*43758.5453);float speck=(1.-smoothstep(.09,.19,length(fract(spots)-.5)))*step(.58,seed)*smoothstep(-.07,.035,p.y);diffuseColor.rgb*=1.-speck*.72;`:""}
      `);
    };
    material.customProgramCacheKey=()=>`fish-flex-${skin}`;
    return material;
  };
  const makeBody=(species:number)=>{
    const positions:number[]=[],colors:number[]=[],indices:number[]=[],palette=[[0x50664a,0xe7d9c8],[0xece8d6,0xfff5df],[0x3b5d61,0xdfebe9]][species];
    const upper=new THREE.Color(palette[0]),lower=new THREE.Color(palette[1]);
    const profile=[.026,.04,.066,.102,.149,.188,.209,.212,.198,.168,.124,.073,.018];
    for(let i=0;i<=48;i++)for(let j=0;j<=24;j++){
      const u=i/48,a=j/24*Math.PI*2,k=u*12,index=Math.min(11,Math.floor(k)),r=THREE.MathUtils.lerp(profile[index],profile[index+1],k-index)*(species===1?1.16:species===2?.86:1);
      const x=-.67+u*1.27,y=Math.cos(a)*r,z=Math.sin(a)*r*.64;
      positions.push(x,y,z);const c=lower.clone().lerp(upper,THREE.MathUtils.smoothstep(Math.cos(a),-.65,.85));
      if(species===0)c.lerp(new THREE.Color(0xb7797f),Math.exp(-Math.pow(y/.043,2))*.58);
      if(species===1){const patch=Math.sin(x*15+Math.sin(a*2)*1.6)+Math.sin(a*3.1+x*8);if(patch>.3&&y>-.1)c.setHex(0xd05c29);if(patch< -1.4&&x<.18)c.setHex(0x343e3c);}
      colors.push(c.r,c.g,c.b);
      if(i<48&&j<24){const k=i*25+j;indices.push(k,k+1,k+25,k+1,k+26,k+25);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return own(g);
  };
  const eyeGeo=own(new THREE.SphereGeometry(.019,12,10));
  const eyeMat=new THREE.MeshStandardMaterial({color:0x111917,roughness:.2,clippingPlanes:[clip]});materials.push(eyeMat);
  const fish=FISH_SPECIES.map((name,species)=>{
    const group=new THREE.Group();group.name=`Fish / ${name}`;group.visible=false;root.add(group);
    const material=flex(new THREE.MeshStandardMaterial({vertexColors:true,metalness:.32,roughness:.3,clippingPlanes:[clip]}),species);materials.push(material);group.add(new THREE.Mesh(makeBody(species),material));
    const finMat=flex(new THREE.MeshStandardMaterial({color:[0xa89483,0xd89c6b,0x91a4aa][species],vertexColors:true,side:THREE.DoubleSide,roughness:.42,clippingPlanes:[clip]}));materials.push(finMat);
    const fin=(base:number[],edge:number[][],parent:THREE.Object3D=group)=>{
      const curve=new THREE.CatmullRomCurve3(edge.map(p=>new THREE.Vector3(...p))),start=new THREE.Vector3(...base),vertices:number[]=[],colors:number[]=[],indices:number[]=[];
      for(let i=0;i<=40;i++)for(let j=0;j<=5;j++){
        const v=j/5,p=start.clone().lerp(curve.getPoint(i/40),v);p.z+=Math.sin(v*Math.PI)*.012;vertices.push(p.x,p.y,p.z);
        const shade=(i%4===0?.62:.94)*(1-v*.14);colors.push(shade,shade,shade);
        if(i<40&&j<5){const n=i*6+j;indices.push(n,n+6,n+1,n+1,n+6,n+7);}
      }
      const g=own(new THREE.BufferGeometry());g.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));g.setAttribute("color",new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const mesh=new THREE.Mesh(g,finMat);parent.add(mesh);return mesh;
    };
    const tail=new THREE.Group();tail.name="Attached / forked caudal fin";group.add(tail);
    fin([-.62,0,0],[[-.87,.23,0],[-.94,.22,0],[-.85,.1,0],[-.8,0,0],[-.85,-.1,0],[-.94,-.22,0],[-.87,-.23,0]],tail);
    fin([-.11,.145,0],[[-.35,.14,0],[-.29,.27,0],[-.08,.34,0],[.05,.21,0],[.17,.19,0]]);
    fin([-.38,-.07,0],[[-.46,-.1,0],[-.43,-.24,0],[-.28,-.18,0],[-.22,-.13,0]]);
    const gillMat=flex(new THREE.MeshStandardMaterial({color:species===1?0xc08960:0x657a73,metalness:.25,roughness:.36,clippingPlanes:[clip]}));materials.push(gillMat);
    const detail=(points:number[][],radius:number)=>{const tube=new THREE.Mesh(own(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,5,false)),gillMat);group.add(tube);};
    for(const side of [-1,1]){
      fin([.21,-.065,side*.095],[[.17,-.09,side*.12],[.02,-.2,side*.31],[-.09,-.18,side*.23],[-.01,-.1,side*.12]]);
      fin([-.14,-.13,side*.055],[[-.18,-.15,side*.07],[-.32,-.26,side*.15],[-.36,-.19,side*.06]]);
      detail([[.24,.12,side*.066],[.18,.065,side*.116],[.19,-.025,side*.124],[.26,-.112,side*.075]],.005);
      const iris=new THREE.Mesh(own(new THREE.SphereGeometry(.029,14,10)),gillMat);iris.position.set(.456,.043,side*.063);iris.scale.z=.48;group.add(iris);
      const eye=new THREE.Mesh(eyeGeo,eyeMat);eye.position.set(.46,.044,side*.077);eye.scale.z=.42;group.add(eye);
      detail([[.596,-.006,side*.007],[.55,-.025,side*.041],[.497,-.04,side*.05]],.004);
      if(species===1)detail([[.554,-.026,side*.029],[.56,-.08,side*.051],[.52,-.112,side*.052]],.003);
    }
    group.scale.setScalar(fishSize(species,0));
    return {group,tail,appearances:0,size:group.scale.x,entry:0,start:{x:0,z:0},heading:0,time:-100,lift:5.6,speed:2.4,landed:true};
  });
  const nightUniform={value:0};
  const ringGeo=own(new THREE.PlaneGeometry(2,2)),splashSlots=Array.from({length:6},()=>{
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{fade:{value:0},night:nightUniform},
      vertexShader:`varying vec2 local;void main(){local=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`varying vec2 local;uniform float fade;uniform float night;void main(){float r=length(local),a=atan(local.y,local.x);float crest=exp(-pow((r-.77)/.075,2.));float broken=.55+.45*sin(a*13.+r*21.);float opacity=crest*broken*fade;vec3 tint=mix(vec3(.44,.59,.62),vec3(.10,.17,.23),night);gl_FragColor=vec4(tint,opacity);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>}`});materials.push(material);
    const ring=new THREE.Mesh(ringGeo,material);ring.rotation.x=-Math.PI/2;ring.visible=false;root.add(ring);return {ring,material,time:-100,x:0,z:0,power:1,notified:true};
  });
  const positions=new Float32Array(6*28*3),alpha=new Float32Array(6*28),dropGeo=own(new THREE.BufferGeometry());dropGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));dropGeo.setAttribute("alpha",new THREE.BufferAttribute(alpha,1));
  const dropMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{night:nightUniform},vertexShader:`attribute float alpha;varying float fade;void main(){fade=alpha;vec4 p=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(42./max(.1,-p.z),1.,4.);gl_Position=projectionMatrix*p;}`,fragmentShader:`varying float fade;uniform float night;void main(){float d=length((gl_PointCoord-.5)*vec2(2.7,2.));if(d>1.)discard;vec3 tint=mix(vec3(.58,.72,.76),vec3(.16,.24,.32),night);gl_FragColor=vec4(tint,exp(-d*d*4.)*fade);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>}`});materials.push(dropMat);
  const drops=new THREE.Points(dropGeo,dropMat);drops.frustumCulled=false;root.add(drops);
  let serial=0,splashSerial=0,lastJump=-100,active=false;
  const splash=(p:WaterPoint,time:number,power:number)=>{const s=splashSlots[splashSerial++%splashSlots.length];s.x=p.x;s.z=p.z;s.time=time;s.power=power;s.notified=false;};
  const jump=(point:WaterPoint,now:number)=>{
    if(!openWater(point)||now-lastJump<.23)return false;
    const index=[0,1,2].map(i=>(serial+i)%3).find(i=>now-fish[i].time>2);if(index===undefined)return false;
    // Prefer an outward course; never jump through the dock or land on it.
    const heading=Math.atan2(point.z,point.x)+Math.sin(serial*2.4)*.7;
    const slot=fish[index];serial=index+1;
    slot.lift=5.4+(serial%3)*.48;slot.speed=2.05+(serial%3)*.27;
    if(!openWater(fishLanding(point,heading,slot.lift,slot.speed)))return false;
    slot.size=fishSize(index,slot.appearances++);slot.group.scale.setScalar(slot.size);
    slot.entry=fishNoseEntry(slot.lift,slot.speed,slot.size);
    // Begin below the surface. The clip plane reveals the head, then the body,
    // instead of spawning an already half-visible fish at the click location.
    slot.start={...point};slot.heading=heading;slot.time=now+.22;slot.landed=false;lastJump=now;active=true;splash(point,slot.time-.06,.5*Math.sqrt(slot.size));return true;
  };
  const forward=new THREE.Vector3(1,0,0),velocity=new THREE.Vector3();
  const update=(now:number,night=0)=>{
    nightUniform.value=night;
    phase.value=now*18;
    active=false;
    for(const f of fish){
      const t=now-f.time,p=fishBallistic(t,f.lift,f.speed);f.group.visible=t>=-.22&&t<p.duration+.4;
      const entry=f.entry;
      if(!f.landed&&t>=entry){
        f.landed=true;const v=f.lift-9.81*entry;
        const distance=f.speed*entry+.6*f.size*f.speed/Math.hypot(f.speed,v);
        splash({x:f.start.x+Math.cos(f.heading)*distance,z:f.start.z+Math.sin(f.heading)*distance},f.time+entry,.9*Math.sqrt(f.size));
      }
      if(!f.group.visible)continue;active=true;
      f.group.position.set(f.start.x+Math.cos(f.heading)*p.forward,WATER_HEIGHT+p.height,f.start.z+Math.sin(f.heading)*p.forward);
      velocity.set(Math.cos(f.heading)*f.speed,p.verticalVelocity,Math.sin(f.heading)*f.speed).normalize();f.group.quaternion.setFromUnitVectors(forward,velocity);
    }
    for(let i=0;i<splashSlots.length;i++){
      const s=splashSlots[i],t=now-s.time;s.ring.visible=t>=0&&t<1.35;
      if(!s.notified&&t>=0){s.notified=true;if(t<.4)onSplash({x:s.x,z:s.z},.11*s.power);}
      if(s.ring.visible){active=true;s.ring.position.set(s.x,WATER_HEIGHT+.009,s.z);s.ring.scale.setScalar(.09+Math.sqrt(t)*1.45);s.material.uniforms.fade.value=Math.min(1,t*18)*Math.exp(-t*2.6)*.36*s.power;}
      for(let n=0;n<28;n++){
        const index=i*28+n,a=n*2.399+i*.71,v=(.45+(n%7)*.13)*s.power,vy=(1.1+(n%5)*.22)*s.power,y=vy*t-4.905*t*t;
        const visible=t>=0&&t<1.2&&y>0;
        positions.set([s.x+Math.cos(a)*v*t,WATER_HEIGHT+Math.max(0,y),s.z+Math.sin(a)*v*t],index*3);alpha[index]=visible?Math.min(1,t*30)*Math.min(1,y*20)*Math.max(0,1-t)*.7:0;
      }
    }
    drops.visible=active;dropGeo.attributes.position.needsUpdate=true;dropGeo.attributes.alpha.needsUpdate=true;root.updateMatrixWorld(true);
  };
  return {root,jump,update,get active(){return active;},dispose:()=>geometries.forEach(g=>g.dispose())};
}
