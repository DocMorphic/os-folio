import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { buildRetroComputer } from "./retro-computer-model";
import { batchRoomGeometry } from "./room-geometry";

/** An enclosed cottage with curved silhouettes and crisp, low-resolution materials.
 * All furniture and the garden are real geometry, not a flat room backdrop. */
export function buildPortfolioRoom(scene: THREE.Scene) {
  const materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
  let seed=713;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const texture=(kind:"wood"|"cloth")=>{
    const c=document.createElement("canvas");c.width=c.height=64;const ctx=c.getContext("2d")!;
    ctx.fillStyle="#fff3d7";ctx.fillRect(0,0,64,64);
    for(let i=0;i<150;i++){ctx.fillStyle=i%3?"#ebdcb8":"#d8c79f";ctx.fillRect(Math.floor(random()*64),Math.floor(random()*64),kind==="wood"?3+Math.floor(random()*18):1,1);}
    if(kind==="cloth"){ctx.fillStyle="#dfcfad";for(let i=0;i<64;i+=4){ctx.fillRect(i,0,1,64);ctx.fillRect(0,i,64,1);}}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=t.minFilter=THREE.NearestFilter;
    t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;textures.push(t);return t;
  };
  const grain=texture("wood"),weave=texture("cloth");
  const mat=(color:number,map:THREE.Texture|null=null)=>{const m=new THREE.MeshLambertMaterial({color,map});materials.push(m);return m;};
  const oak=mat(0xaf7041,grain),trim=mat(0x68432f,grain),honey=mat(0xd4a06a,grain),cream=mat(0xffe9b8);
  const sage=mat(0x769664,weave),rose=mat(0xcc7880,weave),linen=mat(0xffefcd,weave),lavender=mat(0x9583b2,weave),peach=mat(0xe9ac83,weave);
  const green=mat(0x428353),leafLight=mat(0x80ae57),clay=mat(0xc9744b),clayLip=mat(0xe7a270),soil=mat(0x59402f),gold=mat(0xf5bf50),metal=mat(0x64594c);
  const petals=[mat(0xf4bbd0),mat(0xffe4a0),mat(0xbc9ad8),mat(0xf2f0d3)],books=[sage,rose,lavender,gold,peach];
  const mesh=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene)=>{
    const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
  };
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=oak,r=0,parent:THREE.Object3D=scene)=>
    mesh(r?new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
  const cyl=(rt:number,rb:number,h:number,x:number,y:number,z:number,m:THREE.Material=oak,parent:THREE.Object3D=scene)=>mesh(new THREE.CylinderGeometry(rt,rb,h,16),m,x,y,z,parent);
  const ball=(x:number,y:number,z:number,sx:number,sy:number,sz:number,m:THREE.Material,parent:THREE.Object3D=scene)=>{
    const o=mesh(new THREE.SphereGeometry(1,12,8),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o;
  };
  const ring=(r:number,t:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=scene)=>mesh(new THREE.TorusGeometry(r,t,6,24),m,x,y,z,parent);
  const group=(x:number,y:number,z:number,rotation=0)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;scene.add(g);return g;};
  const leaf=(x:number,y:number,z:number,a:number,size:number,parent:THREE.Object3D)=>{
    const o=ball(x,y,z,size*.48,size*.12,size,random()>.5?leafLight:green,parent);o.rotation.set(.4,a,.35);
  };
  const flower=(x:number,y:number,z:number,color:THREE.Material,parent:THREE.Object3D)=>{
    cyl(.015,.018,.4,x,y-.2,z,green,parent);
    for(let p=0;p<5;p++){const a=p*Math.PI*2/5;const o=ball(x+Math.cos(a)*.09,y,z+Math.sin(a)*.09,.085,.04,.055,color,parent);o.rotation.y=-a;}
    ball(x,y+.02,z,.043,.033,.043,gold,parent);leaf(x+.06,y-.17,z,1,.12,parent);
  };
  const plant=(x:number,y:number,z:number,size=1,flowers=false)=>{
    const p=group(x,y,z);p.scale.setScalar(size);p.name=flowers?"Cottage / flower pot":"Cottage / leafy plant";
    cyl(.27,.19,.44,0,.22,0,clay,p);cyl(.30,.30,.08,0,.44,0,clayLip,p);cyl(.25,.25,.015,0,.485,0,soil,p);
    if(flowers)for(let i=0;i<7;i++){const a=i*2.4,r=i?.16:0;flower(Math.cos(a)*r,.9+(i%3)*.12,Math.sin(a)*r,petals[i%4],p);}
    else for(let i=0;i<11;i++){const a=i*2.4;leaf(Math.cos(a)*.2,.62+Math.floor(i/4)*.18,Math.sin(a)*.2,a,.34,p);}
    return p;
  };
  const book=(x:number,y:number,z:number,w:number,h:number,color:THREE.Material,parent:THREE.Object3D=scene)=>{
    box(w,h,.36,x,y+h/2,z,color,.015,parent);box(w*.78,.025,.365,x,y+h*.78,z,linen,0,parent);
  };

  // Enclosed 360° shell with an actual window aperture.
  box(16,.2,14,0,-.12,0,trim);box(16,.14,14,0,6.4,0,cream);
  box(.2,6.4,14,-8,3.2,0,cream);box(.2,6.4,14,8,3.2,0,cream);box(16,6.4,.2,0,3.2,7,cream);
  box(7,6.4,.2,-4.5,3.2,-7,cream);box(.8,6.4,.2,7.6,3.2,-7,cream);
  box(8.2,1.8,.2,3.1,.9,-7,cream);box(8.2,1,.2,3.1,5.9,-7,cream);
  const floors=[mat(0xc99562,grain),mat(0xba8554,grain),mat(0xd4a16c,grain),mat(0xc58d5b,grain)];
  for(let row=0;row<28;row++)for(let col=0;col<8;col++)box(1.97,.035,.48,-7+col*2,.008,-6.75+row*.5,floors[(row*3+col)%4]);
  for(const z of [-6.85,6.85]){box(15.8,.25,.13,0,.16,z,trim);box(15.8,.22,.22,0,5.85,z,trim);}
  for(const x of [-7.85,7.85]){box(.13,.25,13.7,x,.16,0,trim);box(.22,.22,13.7,x,5.85,0,trim);}
  for(const x of [-7.75,-1,7.75])box(.24,6.3,.24,x,3.15,-6.8,trim);
  for(const z of [-6.7,-2,2.7,6.7])box(15.8,.3,.27,0,6.08,z,trim);
  for(const x of [-7.86,7.86])for(let i=0;i<28;i++)box(.045,1.4,.46,x,.83,-6.75+i*.5,sage);
  for(let i=0;i<32;i++)box(.46,1.4,.045,-7.75+i*.5,.83,6.86,sage);
  for(const x of [-7.78,7.78])box(.12,.09,13.7,x,1.57,0,honey);box(15.7,.09,.12,0,1.57,6.78,honey);

  // Timber window, gathered curtains and flowers on the sill.
  box(8.6,.18,.65,3.1,1.84,-6.78,honey,.025);
  for(const x of [-1,7.2])box(.19,3.6,.28,x,3.65,-6.85,trim);
  for(const y of [2,5.4])box(8.25,.18,.28,3.1,y,-6.85,trim);
  for(const x of [1.72,4.48])box(.095,3.3,.13,x,3.7,-6.88,honey);box(8.1,.09,.12,3.1,3.62,-6.88,honey);
  cyl(.045,.045,9,3.1,5.66,-6.4,trim).rotation.z=Math.PI/2;
  for(const side of [-1,1]){const x=3.1+side*3.75;
    for(let i=0;i<7;i++){const fold=cyl(.11,.065,3.05,x+(i-3)*.12,3.93,-6.4+(i%2)*.07,linen);fold.scale.z=.6;}
    box(.88,.12,.26,x,2.73,-6.32,rose,.03);
  }
  plant(.1,1.94,-6.65,.65,true);plant(5.7,1.94,-6.65,.7,true);plant(6.55,1.94,-6.65,.65);
  const meadow=mat(0x8ead60),hill=mat(0x94b96d),sky=mat(0xb4d6db);
  box(45,24,.2,0,8,-24,sky);box(45,.1,22,0,-.18,-16,meadow);
  for(let i=0;i<6;i++)ball(-16+i*7,-.7,-20,7,2.5+i%3,3,hill);
  for(let i=0;i<22;i++)box(.11,.95,.12,-7+i*.65,.45,-10,linen);
  for(const y of [.25,.68])box(14,.08,.08,0,y,-10,linen);
  for(const x of [-4,2,8]){cyl(.12,.18,3,x,1.4,-14,trim);
    for(let i=0;i<5;i++)ball(x+Math.sin(i*2)*.65,3+i%2*.4,-14+Math.cos(i*2)*.5,1.1,1,1,i%2?green:leafLight);
    for(let i=0;i<8;i++)ball(x+Math.sin(i*2.3)*.85,2.7+i%3*.35,-13.1,.08,.09,.08,rose);
  }

  // Writing nook, with the same CRT and screen coordinates as the About model.
  const desk=group(-4.25,0,-5.8);box(4.9,.17,2.5,0,1.75,0,honey,.045,desk);
  for(const x of [-2.04,2.04])for(const z of [-.91,.91])box(.14,1.65,.14,x,.83,z,trim,.015,desk);
  box(1,.62,1.95,1.57,1.37,-.03,oak,.025,desk);
  for(const y of [1.18,1.46]){box(.91,.24,.05,1.57,y,.96,honey,.01,desk);ball(1.57,y,1.01,.045,.035,.035,metal,desk);}
  const computer=buildRetroComputer();computer.rig.scale.setScalar(.78);computer.rig.position.set(-4.25,1.83,-5.91);scene.add(computer.rig);
  computer.keys.forEach(k=>{if(k.hint)k.hint.emissiveIntensity=0;});computer.ctx.fillStyle="#0c1510";computer.ctx.fillRect(0,0,512,352);computer.screenTexture.needsUpdate=true;
  for(const y of [3.95,5.03]){box(4.9,.12,.65,0,y,-.56,honey,.02,desk);for(const x of [-1.85,1.85])box(.1,.31,.45,x,y-.18,-.62,trim,0,desk);}
  for(let i=0;i<11;i++)book(-1.86+i*.16,4.02,-.54,.13,.35+i%3*.12,books[i%5],desk);
  plant(-2.72,4.02,-6.35,.62,true);plant(-5.8,5.1,-6.35,.7);
  for(let i=0;i<4;i++)box(.7,.085,.46,.6,4.07+i*.085,-.55,books[i],.008,desk);
  cyl(.11,.095,.23,1.18,1.94,.69,linen,desk);ring(.085,.022,1.32,1.96,.69,linen,desk);
  cyl(.24,.28,.06,-1.65,1.88,-.68,metal,desk);cyl(.025,.025,.67,-1.65,2.23,-.68,metal,desk);cyl(.15,.30,.28,-1.65,2.64,-.68,sage,desk);
  const chair=group(-5.55,0,-3.7,.18);
  for(const x of [-.37,.37])for(const z of [-.35,.35])cyl(.045,.055,.94,x,.47,z,trim,chair);
  box(.97,.16,.88,0,.97,0,honey,.07,chair);box(.79,.09,.68,0,1.08,.03,sage,.035,chair);
  for(const x of [-.4,.4])cyl(.043,.043,1.2,x,1.35,-.36,trim,chair);
  for(let i=0;i<5;i++)cyl(.028,.028,.75,-.3+i*.15,1.56,-.36,honey,chair);box(.95,.14,.13,0,1.96,-.36,honey,.035,chair);

  // A patchwork daybed and stitched oval rug replace the industrial lounge.
  const bed=group(5.45,0,-2.95);
  for(const x of [-1.35,1.35])for(const z of [-1.9,1.9])cyl(.09,.075,.6,x,.3,z,trim,bed);
  box(3,.28,4.25,0,.53,0,oak,.055,bed);box(2.85,.33,4.08,0,.82,0,linen,.12,bed);box(3.06,1.12,.18,0,1.15,-2.04,honey,.065,bed);
  for(let i=0;i<9;i++)box(.11,.74,.08,-1.2+i*.3,1.2,-1.91,trim,.02,bed);
  box(2.9,.11,3.02,0,1.03,.48,sage,.04,bed);const quilt=[sage,linen,rose,peach];
  for(let row=0;row<6;row++)for(let col=0;col<6;col++){
    box(.46,.025,.47,-1.18+col*.472,1.102,-.78+row*.48,quilt[(row+col*3)%4],.015,bed);
    if((row+col)%2===0)box(.11,.007,.11,-1.18+col*.472,1.12,-.78+row*.48,gold,0,bed).rotation.y=Math.PI/4;
  }
  for(const x of [-.69,.69])box(1.1,.25,.64,x,1.11,-1.47,linen,.12,bed).rotation.y=x*.1;
  box(2.9,.45,.09,0,.83,1.97,sage,.035,bed);
  cyl(.64,.64,.12,3.22,.98,-4.57,honey);for(const x of [2.85,3.58])box(.08,.9,.08,x,.48,-4.57,trim);plant(3.22,1.06,-4.57,.64,true);
  for(let i=0;i<4;i++){const rug=cyl(1,1,.012,2.6,.052+i*.014,.95,[rose,linen,sage,linen][i]);rug.scale.set(2.8-i*.16,1,1.78-i*.1);}
  for(let i=0;i<22;i++)box(.13,.016,.23,.1+i*.235,.06,2.61,linen);
  const table=group(3.7,0,1.1);cyl(.9,.9,.1,0,.82,0,honey,table);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;cyl(.045,.06,.78,Math.cos(a)*.55,.4,Math.sin(a)*.55,trim,table);}
  plant(3.85,.88,1.1,.45,true);box(.58,.06,.4,-.3,.91,.25,rose,.01,table);

  // Reverse view: cottage door, dresser, bookcase and potting bench.
  const door=group(-1.75,0,6.74);box(2.15,3.95,.13,0,1.98,0,trim,.03,door);box(1.84,3.63,.05,0,1.89,-.09,sage,.03,door);
  for(const x of [-.43,.43])for(const y of [1,2.55])box(.69,1.22,.03,x,y,-.13,honey,.015,door);
  ball(-.66,1.8,-.2,.07,.07,.055,gold,door);ring(.4,.1,0,3,-.22,green,door);
  for(let i=0;i<10;i++){const a=i*Math.PI/5;ball(Math.cos(a)*.4,3+Math.sin(a)*.4,-.3,.09,.08,.05,i%3?leafLight:rose,door);}
  const shelf=group(5.3,0,6.35,Math.PI);
  for(const x of [-1.45,1.45])box(.13,4.35,.68,x,2.18,0,oak,0,shelf);box(3,.12,.72,0,4.39,0,honey,.02,shelf);
  for(let row=0;row<5;row++){const y=.25+row*.8;box(2.9,.1,.68,0,y,0,honey,.015,shelf);
    for(let i=0;i<8;i++)book(-1.18+i*.19,y+.06,0,.15,.35+(i+row)%3*.09,books[(i+row)%5],shelf);cyl(.19,.14,.28,.96,y+.21,0,clay,shelf);
  }
  plant(4.55,4.48,6.3,.74);plant(6.33,4.48,6.3,.63,true);
  const dresser=group(-6.1,0,5.65,Math.PI);box(2.25,1.75,1.05,0,.98,0,oak,.04,dresser);box(2.42,.13,1.16,0,1.92,0,honey,.025,dresser);
  for(let i=0;i<3;i++){box(2.05,.46,.055,0,.45+i*.5,.55,honey,.018,dresser);for(const x of [-.59,.59])ball(x,.45+i*.5,.61,.045,.045,.04,metal,dresser);}
  plant(-6.4,2,5.6,.85,true);
  const bench=group(-7.25,0,.25,Math.PI/2);box(3,.13,1,0,1.45,0,honey,.03,bench);
  for(const x of [-1.25,1.25])for(const z of [-.34,.34])box(.09,1.4,.09,x,.7,z,trim,0,bench);
  for(let i=0;i<6;i++)cyl(.17,.12,.27,-1.15+i*.45,1.66,0,i%2?clay:clayLip,bench);box(2.9,.09,.8,0,.36,0,oak,0,bench);
  for(let i=0;i<3;i++){box(.62,.5,.6,-.9+i*.85,.65,0,honey,.01,bench);for(let s=0;s<4;s++)box(.64,.018,.03,-.9+i*.85,.45+s*.12,.32,trim,0,bench);}
  plant(-7.1,1.53,-.75,.8,true);plant(7.1,0,3.2,1.7);plant(-6.7,0,-1.6,1.35);plant(6.2,0,3.7,.85,true);
  cyl(.017,.017,.65,1.1,5.9,.3,trim);cyl(.36,.7,.48,1.1,5.34,.3,linen);
  const bulb=mat(0xffe5a1);bulb.emissive=new THREE.Color(0xffcd6d);bulb.emissiveIntensity=.5;ball(1.1,5.15,.3,.17,.14,.17,bulb);
  for(const x of [-.45,6.6]){const p=plant(x,4.62,-5.75,.75);
    for(const dx of [-.17,.17])cyl(.009,.009,1.2,dx,1.14,0,trim,p);
    for(let i=0;i<14;i++)leaf(Math.sin(i)*.17,.5-i*.09,.24,i,.18,p);
  }

  // One cached shadow map and diffuse light instead of a real-time neon/GI stack.
  scene.add(new THREE.HemisphereLight(0xfff2d2,0x8c795b,2.1));
  const sun=new THREE.DirectionalLight(0xffddb1,2.4);sun.position.set(3.8,5.1,-6.3);sun.target.position.set(-2,0,3);
  sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;
  sun.shadow.camera.top=10;sun.shadow.camera.bottom=-10;sun.shadow.camera.near=.1;sun.shadow.camera.far=35;sun.shadow.normalBias=.04;
  scene.add(sun,sun.target);const fill=new THREE.DirectionalLight(0xc5dfd2,.55);fill.position.set(-3,4,5);scene.add(fill);
  // Only the glass is interactive here; also batch the stationary keyboard and case.
  batchRoomGeometry(scene,computer.screen);
  return {computer,materials:[...materials,...computer.materials],textures:[...textures,...computer.textures],roomPosition:new THREE.Vector3(0,3.1,3.8)};
}
