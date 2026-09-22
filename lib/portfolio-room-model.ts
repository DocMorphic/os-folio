import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import { buildRetroComputer } from "./retro-computer-model";
import { batchRoomGeometry, drapedCloth } from "./room-geometry";

/** An enclosed, furnished megablock apartment. Geometry, materials and lighting
 * are built locally; none of the reference screenshots is used as a backdrop. */
export function buildPortfolioRoom(scene: THREE.Scene) {
  const materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
  let seed=90210;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const canvasTexture=(canvas:HTMLCanvasElement)=>{
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);return texture;
  };
  // Fine surface variation, not a flat room illustration.
  const grainCanvas=document.createElement("canvas");grainCanvas.width=grainCanvas.height=256;
  const ink=grainCanvas.getContext("2d")!,noise=ink.createImageData(256,256);
  for(let i=0;i<noise.data.length;i+=4){const v=205+Math.floor(random()*40);noise.data.set([v,v,v,255],i);}
  ink.putImageData(noise,0,0);
  for(let i=0;i<70;i++){ink.strokeStyle="rgba(80,88,91,.12)";ink.beginPath();const x=random()*256,y=random()*256;ink.moveTo(x,y);ink.lineTo(x+random()*40,y+random()*2);ink.stroke();}
  const grain=canvasTexture(grainCanvas);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;
  const mat=(color:number,roughness=.65,metalness=.15,textured=true)=>{
    const m=new THREE.MeshStandardMaterial({color,roughness,metalness,map:textured?grain:null,bumpMap:textured?grain:null,bumpScale:.004});materials.push(m);return m;
  };
  const neon=(color:number,strength=3)=>{
    const m=new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(strength),toneMapped:false});materials.push(m);return m;
  };
  const steel=mat(0x59616a,.48,.72),dark=mat(0x171b21,.56,.65),wall=mat(0x514a48,.83,.25);
  const ivory=mat(0x928374,.58,.35),black=mat(0x0c141b,.43,.35),silver=mat(0xa5b8bc,.27,.9);
  const pink=mat(0x642939,.6,.08),teal=mat(0x285156,.88,.02),cloth=mat(0x34394f,.92,0);
  const copper=mat(0x8a5439,.5,.7),paper=mat(0xb6a98f,.93,0),rubber=mat(0x242023,.96,0);
  const burgundy=mat(0x50313d,.95,0),ochre=mat(0x947140,.76,.15);
  const cyan=neon(0x4ddcf0,3),magenta=neon(0xf14f9d,2.7),amber=neon(0xf0b458,2),white=neon(0xb7e5e5,2);
  const mesh=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,parent:THREE.Object3D=scene)=>{
    const object=new THREE.Mesh(g,m);object.position.set(x,y,z);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
  };
  const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material=steel,r=.035,parent:THREE.Object3D=scene)=>mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/3,h/3,d/3)),m,x,y,z,parent);
  const cylinder=(rt:number,rb:number,h:number,x:number,y:number,z:number,m:THREE.Material=steel,parent:THREE.Object3D=scene)=>mesh(new THREE.CylinderGeometry(rt,rb,h,32),m,x,y,z,parent);
  const torus=(radius:number,tube:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=scene)=>mesh(new THREE.TorusGeometry(radius,tube,8,36),m,x,y,z,parent);
  const pipe=(points:number[][],radius:number,m:THREE.Material=steel,parent:THREE.Object3D=scene)=>{
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number])));
    return mesh(new THREE.TubeGeometry(curve,24,radius,8,false),m,0,0,0,parent);
  };
  const group=(x:number,y:number,z:number,rotation=0)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rotation;scene.add(g);return g;};
  const frame=(w:number,h:number,t:number,depth:number,x:number,y:number,z:number,m:THREE.Material,parent:THREE.Object3D=scene)=>{
    const round=(p:THREE.Shape|THREE.Path,w:number,h:number,r:number)=>{
      p.moveTo(-w/2+r,-h/2);p.lineTo(w/2-r,-h/2);p.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      p.lineTo(w/2,h/2-r);p.quadraticCurveTo(w/2,h/2,w/2-r,h/2);p.lineTo(-w/2+r,h/2);
      p.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);p.lineTo(-w/2,-h/2+r);p.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    };
    const s=new THREE.Shape(),hole=new THREE.Path();round(s,w,h,Math.min(.5,h/4));round(hole,w-t*2,h-t*2,Math.min(.4,h/5));s.holes.push(hole);
    return mesh(new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:8}),m,x,y,z-depth/2,parent);
  };
  const label=(text:string,w:number,h:number,x:number,y:number,z:number,color="#9bc9d1",parent:THREE.Object3D=scene)=>{
    const canvas=document.createElement("canvas");canvas.width=512;canvas.height=128;const ctx=canvas.getContext("2d")!;
    ctx.fillStyle=color;ctx.font="500 42px monospace";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,256,64,490);
    const m=new THREE.MeshBasicMaterial({map:canvasTexture(canvas),transparent:true,depthWrite:false,toneMapped:false});materials.push(m);
    const decal=mesh(new THREE.PlaneGeometry(w,h),m,x,y,z,parent);decal.castShadow=false;return decal;
  };
  const display=(title:string,w:number,h:number,x:number,y:number,z:number,color="#5ce9ec",parent:THREE.Object3D=scene)=>{
    const canvas=document.createElement("canvas");canvas.width=768;canvas.height=384;const ctx=canvas.getContext("2d")!;
    ctx.fillStyle="#07151f";ctx.fillRect(0,0,768,384);ctx.strokeStyle=color;ctx.fillStyle=color;
    ctx.font="24px monospace";ctx.fillText(title,28,45);ctx.fillRect(28,61,712,2);
    for(let i=0;i<12;i++){ctx.globalAlpha=.2+(i%3)*.13;ctx.fillRect(28,89+i*21,160+(i*37)%260,5);}
    ctx.globalAlpha=.75;ctx.strokeRect(467,89,269,234);
    for(let i=0;i<7;i++)ctx.fillRect(485+i*33,285-((i*19)%121),18,25+((i*19)%121));
    ctx.globalAlpha=1;ctx.font="17px monospace";ctx.fillText("SIGNAL ACTIVE   //   2077",28,360);
    const m=new THREE.MeshBasicMaterial({map:canvasTexture(canvas),color:new THREE.Color(1.3,1.3,1.3),toneMapped:false});materials.push(m);
    box(w+.13,h+.13,.1,x,y,z-.04,black,.04,parent);
    const screen=mesh(new THREE.PlaneGeometry(w,h),m,x,y,z+.018,parent);screen.castShadow=false;return m;
  };
  const can=(x:number,y:number,z:number,m:THREE.Material=teal,parent:THREE.Object3D=scene)=>{
    cylinder(.08,.08,.23,x,y+.115,z,m,parent);cylinder(.077,.077,.008,x,y+.235,z,silver,parent);
  };
  const bolts=(x:number,y:number,z:number,w:number,h:number,parent:THREE.Object3D=scene)=>{
    for(const sx of [-1,1])for(const sy of [-1,1]){const b=cylinder(.018,.018,.015,x+sx*w/2,y+sy*h/2,z,silver,parent);b.rotation.x=Math.PI/2;}
  };

  // Complete shell, ceiling, and an actual aperture overlooking the city.
  box(16,.2,14,0,-.13,0,black);box(16,.15,14,0,6.4,0,dark);
  box(.2,6.4,14,-8,3.2,0,wall);box(.2,6.4,14,8,3.2,0,wall);box(16,6.4,.2,0,3.2,7,wall);
  box(7,6.4,.2,-4.5,3.2,-7,wall);box(.8,6.4,.2,7.6,3.2,-7,wall);
  box(8.2,1.8,.2,3.1,.9,-7,wall);box(8.2,1,.2,3.1,5.9,-7,wall);
  for(const z of [-6.85,6.85]){box(15.8,.22,.14,0,.15,z,dark);box(15.8,.12,.2,0,5.9,z,steel);}
  for(const x of [-7.85,7.85]){box(.14,.22,13.7,x,.15,0,dark);box(.2,.12,13.7,x,5.9,0,steel);}
  for(let i=0;i<8;i++)for(const x of [-7.87,7.87]){box(.055,4.8,.035,x,3,i*1.7-6,black,.003);box(.055,.035,1.65,x,1.5,i*1.7-6,black,.003);}
  // Instanced hexagonal tiles add real bevels and grout without hundreds of draw calls.
  const tileMat=mat(0x26323e,.36,.7);const tilePositions:number[][]=[];
  for(let row=0;row<25;row++)for(let col=0;col<25;col++)tilePositions.push([-7.5+col*.625+(row%2)*.3125,.01,-6.5+row*.542]);
  const tiles=new THREE.InstancedMesh(new THREE.CylinderGeometry(.353,.35,.03,6),tileMat,tilePositions.length);
  const matrix=new THREE.Matrix4();
  tilePositions.forEach((p,i)=>{matrix.makeTranslation(...p as [number,number,number]);tiles.setMatrixAt(i,matrix);tiles.setColorAt(i,new THREE.Color().setScalar(.7+random()*.28));});
  tiles.receiveShadow=true;scene.add(tiles);
  for(const x of [-6.8,6.8])box(.055,.015,12.6,x,.035,0,copper,.002);
  for(const x of [-5,0,5])box(.2,.25,13.8,x,6.14,0,steel);
  for(const z of [-3.5,3.5]){box(15.7,.24,.35,0,6.13,z,steel);box(4.4,.03,.12,0,5.99,z,white);}
  for(const x of [-7.3,7.3]){pipe([[x,5.9,-6.7],[x,5.9,-2],[x,5.7,2],[x,5.7,6.7]],.11,steel);for(let i=0;i<6;i++)cylinder(.16,.16,.055,x,5.9,-5+i*2,ivory).rotation.x=Math.PI/2;}

  // Recessed workstation, repeating the exact About computer model.
  const desk=group(-4.25,0,-5.8);
  frame(5.5,4.8,.22,.4,0,2.7,-.65,ivory,desk);box(5.03,4.36,.1,0,2.7,-.84,black,.06,desk);
  box(4.9,.16,2.5,0,1.75,0,steel,.07,desk);box(4.6,.1,2.25,0,1.64,0,dark,.04,desk);
  for(const x of [-2.08,2.08])box(.16,1.67,2.0,x,.84,-.02,ivory,.035,desk);
  box(4.5,.026,.045,0,1.65,1.13,cyan,.005,desk);
  box(4.7,.12,.72,0,4.05,-.39,steel,.03,desk);box(4.1,.025,.04,0,3.96,-.08,white,.004,desk);
  label("PERSONAL ACCESS",2.8,.23,0,4.45,-.72,"#90c4ce",desk);
  const computer=buildRetroComputer();computer.rig.scale.setScalar(.78);computer.rig.position.set(-4.25,1.83,-5.91);scene.add(computer.rig);
  computer.keys.forEach(k=>{if(k.hint)k.hint.emissiveIntensity=0;});
  computer.ctx.fillStyle="#0c1510";computer.ctx.fillRect(0,0,512,352);computer.screenTexture.needsUpdate=true;
  for(const x of [-1.5,1.52]){
    box(.48,.8,.42,x,2.2,-.45,dark,.05,desk);
    for(const y of [2.02,2.39]){const cone=cylinder(.12,.12,.03,x,y,-.22,silver,desk);cone.rotation.x=Math.PI/2;const ring=torus(.14,.017,x,y,-.2,black,desk);ring.rotation.z=.1;}
  }
  display("NETWORK / LIVE",1.15,.5,1.35,3.5,-.71,"#5ce9ec",desk);
  box(.55,.05,.42,-1.6,1.86,.5,black,.025,desk);
  for(let i=0;i<5;i++){box(.06,.05,.065,-1.79+i*.08,1.90,.52,cyan,.007,desk);}
  can(1.65,1.84,.65,pink,desk);
  for(let i=0;i<12;i++){box(.12,.35+(i%3)*.07,.35,-1.8+i*.15,4.3,-.38,i%3?steel:pink,.008,desk);}
  pipe([[-1.9,4,-.1],[-2.16,3.5,-.15],[-2.18,1.9,.1],[-1.75,1.86,.5]],.018,black,desk);
  const chair=group(-5.8,0,-3.45,-.45);
  cylinder(.09,.12,.75,0,.54,0,silver,chair);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;pipe([[0,.2,0],[Math.cos(a)*.53,.12,Math.sin(a)*.53]],.035,black,chair);}
  box(1.1,.22,1.05,0,.98,0,cloth,.11,chair);box(1.05,1.1,.18,0,1.58,.43,dark,.1,chair);
  for(const x of [-.6,.6]){box(.07,.45,.07,x,1.03,.12,silver,.02,chair);box(.14,.1,.7,x,1.3,.08,ivory,.045,chair);}

  // Panoramic window with frame depth, blinds, and 3D skyline beyond the glass.
  frame(8.3,3.7,.16,.25,3.1,3.62,-6.83,black);
  box(8.4,.13,.5,3.1,1.78,-6.65,ivory);
  for(let i=0;i<10;i++){const slat=box(8.0,.048,.12,3.1,5.31-i*.095,-6.59,steel,.008);slat.rotation.x=.18;}
  for(const x of [-.94,3.1,7.14])box(.05,3.5,.08,x,3.6,-6.56,silver,.01);
  const buildingMats=[mat(0x172537,.65,.5),mat(0x30303b,.55,.55),mat(0x152331,.7,.5)];
  const windowMats=[neon(0x53b9d4,1.3),neon(0xe29b75,1.3),neon(0xad67a8,1.4)];
  for(let i=0;i<19;i++){
    const x=-15+i*2.05,z=-13-(i%3)*4.2,h=9+random()*13,w=2.0+random()*.85;
    box(w,h,3.2,x,h/2-3.4,z,buildingMats[i%3],.04);
    const winGeo=new THREE.PlaneGeometry(.20,.31),winCount=100,windows=new THREE.InstancedMesh(winGeo,windowMats[i%3],winCount);
    for(let j=0;j<winCount;j++){matrix.makeTranslation(x-w*.37+(j%5)*w*.185,-2.5+Math.floor(j/5)*h*.047,z+1.615);windows.setMatrixAt(j,matrix);windows.setColorAt(j,new THREE.Color().setScalar(random()>.36?.45+random()*.55:.018));}
    scene.add(windows);
    for(const edge of [-1,1])box(.1,h,.18,x+edge*w*.46,h/2-3.4,z+1.64,dark,.008);
    for(let floor=0;floor<12;floor++)box(w+.13,.1,.21,x,floor*h/12-2.5,z+1.68,dark,.008);
    for(let unit=0;unit<4;unit++){box(.46,.24,.27,x+w*.31,unit*1.8+.3,z+1.77,steel,.015);for(let grille=0;grille<3;grille++)box(.36,.025,.015,x+w*.31,unit*1.8+.24+grille*.06,z+1.915,black,.001);}
    cylinder(.06,.06,1.65,x,h-2.9,z,steel);
    if(i%3===1){
      const sign=group(x+w*.53,0,z+1.83);
      box(.9,3.6,.22,0,3.6,0,black,.045,sign);
      for(let row=0;row<3;row++)label(["夜","市","07"][row],.68,.61,0,4.65-row*.82,.13,"#ff6c9d",sign);
      for(const sx of [-.43,.43])box(.025,3.35,.02,sx,3.6,.14,magenta,.003,sign);
    }
    if(i%4===2){
      const sign=group(x,0,z+1.89);box(w*1.12,1.3,.18,0,1.35,0,black,.02,sign);
      label(i%2?"NIGHT / LINE":"NOODLES",w, .46,0,1.61,.11,"#ffbe73",sign);
      label("OPEN LATE / 24H",w*.8,.21,0,1.09,.11,"#e89c69",sign);
      box(w*1.06,.025,.03,0,.75,.11,amber,.001,sign);
    }
  }
  // Separate light bars reflect onto the metallic floor.
  box(7.7,.035,.035,3.1,1.94,-6.60,cyan,.004);
  label("NIGHT LINK",2.1,.3,3.4,5.65,-6.83,"#56ddeb");

  // Sunken lounge: molded shell, vinyl upholstery, seams, cushions and low table.
  const lounge=group(3.7,0,-4.4);
  box(6.15,.44,1.95,0,.38,-.12,ivory,.18,lounge);box(5.72,.7,.35,0,1.23,-.83,pink,.13,lounge);
  box(.38,.94,1.96,-2.9,.72,-.1,ivory,.13,lounge);box(.38,.94,1.96,2.9,.72,-.1,ivory,.13,lounge);
  for(let i=0;i<3;i++){
    box(1.79,.23,1.54,-1.85+i*1.85,.77,.05,pink,.11,lounge);
    box(1.75,.67,.24,-1.85+i*1.85,1.19,-.64,pink,.09,lounge);
    box(1.6,.018,.02,-1.85+i*1.85,.9,.72,ivory,.004,lounge);
  }
  for(const [x,angle] of [[-2.1,.18],[1.82,-.25]]){const cushion=box(.8,.56,.22,x,1.14,-.38,teal,.12,lounge);cushion.rotation.z=angle;}
  box(7.4,.025,4.25,3.5,.034,-3.14,mat(0x383148,.95,0),.05);
  box(3.5,.46,1.28,2.55,.52,-2.15,ivory,.22);box(3.23,.09,1.11,2.55,.78,-2.15,dark,.15);
  box(2.8,.024,.015,2.55,.3,-1.51,magenta,.003);
  can(1.48,.84,-2.12,pink);
  box(.7,.055,.46,2.35,.855,-2.25,steel,.015);box(.66,.009,.42,2.35,.887,-2.25,ivory,.004);
  cylinder(.57,.61,.64,.35,.38,-2.25,teal);cylinder(.57,.57,.09,.35,.735,-2.25,teal);
  for(let i=0;i<3;i++){const stitch=torus(.578,.009,.35,.21+i*.19,-2.25,ivory);stitch.rotation.x=Math.PI/2;}
  // Side entertainment wall, visible when looking right.
  const mediaWall=group(7.78,0,-2.7,-Math.PI/2);
  frame(3.9,2.8,.15,.2,0,2.9,0,steel,mediaWall);display("AFTER HOURS / CITY FEED",3.35,1.84,0,3,0.13,"#64d8eb",mediaWall);
  box(4.2,.24,.55,0,1.25,.24,ivory,.08,mediaWall);
  for(let i=0;i<5;i++){box(.4,.04,.3,-1.3+i*.51,1.40,.28,i%2?black:steel,.012,mediaWall);}
  label("NO SIGNAL LOST",2,.2,0,1.78,.13,"#e889af",mediaWall);

  // The hanging ventilation/media column is the room's centerpiece.
  cylinder(.87,.87,.17,3.8,6.2,-3.5,dark);cylinder(.5,.5,.55,3.8,5.89,-3.5,steel);
  cylinder(.74,.68,1.25,3.8,5.03,-3.5,ivory);cylinder(.82,.82,.16,3.8,5.66,-3.5,dark);
  cylinder(.69,.76,.19,3.8,4.34,-3.5,steel);
  for(const y of [4.39,5.6]){const ring=torus(.76,.024,3.8,y,-3.5,cyan);ring.rotation.x=Math.PI/2;}
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,g=group(3.8+Math.sin(a)*.72,0,-3.5+Math.cos(a)*.72,a);
    box(.25,.32,.025,0,5.19,0,dark,.02,g);for(let j=0;j<4;j++)box(.20,.013,.02,0,5.10+j*.055,.018,steel,.002,g);
  }
  const holoMaterial=display("MEGABLOCK / 07",1.1,.51,3.8,4.64,-2.72,"#57eeef");
  const holo=holoMaterial.clone();holo.transparent=true;holo.opacity=.54;holo.side=THREE.DoubleSide;holo.depthWrite=false;materials.push(holo);
  const band=mesh(new THREE.CylinderGeometry(1.12,1.12,.67,48,1,true,-1.3,2.6),holo,3.8,4.65,-3.5);band.castShadow=false;
  const pendant=new THREE.PointLight(0x5adbe9,11,7,2);pendant.position.set(3.8,4.4,-3.1);scene.add(pendant);

  // Opposite wall: sleeping alcove, storage, and a working-looking entry airlock.
  const sleep=group(4.9,0,6.64,Math.PI);
  frame(5.0,4.65,.22,.4,0,2.6,0,ivory,sleep);box(4.5,4.15,.08,0,2.6,-.18,black,.1,sleep);
  box(3.8,.4,2.48,0,.46,1.07,steel,.13,sleep);box(3.62,.3,2.3,0,.8,1.07,cloth,.15,sleep);
  box(3.46,.08,1.43,0,1.0,1.48,teal,.1,sleep);
  for(const x of [-.95,.95])box(1.25,.2,.58,x,1.04,.32,ivory,.13,sleep);
  box(4.35,.035,.045,0,4.58,.17,magenta,.008,sleep);
  label("OFFLINE",1.3,.24,0,3.54,-.1,"#cb749b",sleep);
  const bedside=group(1.58,0,5.9,Math.PI);box(.7,1.0,.67,0,.5,0,steel,.07,bedside);can(0,1.03,0,pink,bedside);
  const door=group(-.3,0,6.86,Math.PI);
  frame(2.72,4.9,.2,.22,0,2.5,0,ivory,door);
  for(const x of [-.59,.59]){box(1.16,4.42,.12,x,2.5,.01,dark,.03,door);for(let j=0;j<4;j++)box(1.05,.026,.035,x,1.2+j*.82,.08,steel,.003,door);}
  box(.025,4.25,.025,0,2.5,.09,cyan,.003,door);label("07 / PRIVATE",1.8,.25,0,5.23,.1,"#b1cdd0",door);
  display("ACCESS",.46,.76,1.72,2.78,.01,"#f773ad",door);
  bolts(0,2.5,.11,2.3,4.5,door);
  const wardrobe=group(-4.7,0,6.72,Math.PI);
  frame(4.5,4.8,.18,.24,0,2.5,0,steel,wardrobe);box(4.1,4.45,.08,0,2.5,-.08,black,.02,wardrobe);
  for(const y of [.8,1.7,4.1])box(3.95,.1,.68,0,y,.28,steel,.025,wardrobe);
  pipe([[-1.8,3.86,.32],[1.8,3.86,.32]],.035,silver,wardrobe);
  for(let i=0;i<4;i++){
    const x=-1.5+i*.86;pipe([[x-.28,3.53,.32],[x,3.76,.32],[x+.28,3.53,.32],[x-.28,3.53,.32]],.012,silver,wardrobe);
    box(.53,1.16,.25,x,2.95,.35,i%2?pink:teal,.08,wardrobe);
    for(const sign of [-1,1]){const sleeve=box(.18,.8,.23,x+sign*.34,3.02,.35,cloth,.06,wardrobe);sleeve.rotation.z=sign*.15;}
    box(.6,.24,.45,x,1.01,.33,ivory,.045,wardrobe);
  }
  box(3.6,.028,.04,0,4.24,.48,amber,.005,wardrobe);

  // Left side kitchenette, inset cabinets, sink, stove, and vending unit.
  const kitchen=group(-7.71,0,.35,Math.PI/2);
  frame(5.7,4.7,.2,.32,0,2.6,0,ivory,kitchen);box(5.2,4.25,.08,0,2.6,-.14,dark,.035,kitchen);
  box(5.2,1.32,1.08,0,.76,.49,steel,.06,kitchen);box(5.45,.12,1.25,0,1.49,.54,silver,.05,kitchen);
  for(const x of [-1.72,0,1.72]){box(1.58,1.13,.065,x,.8,1.06,ivory,.04,kitchen);box(.32,.045,.055,x,1.13,1.11,black,.015,kitchen);}
  box(1.21,.018,.79,-1.3,1.56,.51,black,.12,kitchen);frame(1.34,.89,.06,.02,-1.3,1.57,.51,silver,kitchen).rotation.x=-Math.PI/2;
  pipe([[-1.3,1.54,.08],[-1.3,2.03,.08],[-1.3,2.1,.31],[-1.3,1.93,.43]],.038,silver,kitchen);
  box(1.35,.03,.85,1.15,1.57,.48,black,.04,kitchen);
  for(const x of [.8,1.47])for(const z of [.26,.7]){const coil=torus(.17,.016,x,1.60,z,amber,kitchen);coil.rotation.x=Math.PI/2;}
  for(const x of [-1.73,0,1.73]){box(1.57,1.15,.56,x,3.55,.12,ivory,.06,kitchen);box(.025,.27,.03,x+.58,3.51,.42,black,.008,kitchen);}
  box(4.9,.026,.04,0,2.94,.34,white,.004,kitchen);
  for(let i=0;i<4;i++)can(-.45+i*.25,1.58,.68,i%2?pink:teal,kitchen);
  const vending=group(-7.42,0,4.79,Math.PI/2);
  box(1.48,3.7,.83,0,1.9,0,dark,.09,vending);frame(1.25,3.33,.08,.06,0,1.93,.44,magenta,vending);
  display("SYNTH / 24",.93,.45,0,3.13,.49,"#ff579a",vending);
  for(let row=0;row<4;row++){box(1.05,.055,.18,0,1.04+row*.44,.43,steel,.01,vending);for(let col=0;col<4;col++)can(-.36+col*.24,1.08+row*.44,.45,(row+col)%2?pink:teal,vending);}
  box(.77,.24,.06,0,.55,.49,black,.04,vending);
  label("FRESH CIRCUITS",1.05,.14,0,3.62,.49,"#ff8cc6",vending);

  // Surface panels, exposed fasteners and conduits make the back views intentional.
  for(const z of [-.7,5.5]){
    const panel=group(7.85,0,z,-Math.PI/2);
    box(2.35,3.4,.06,0,2.8,0,steel,.045,panel);bolts(0,2.8,.05,2.12,3.14,panel);
    for(let i=0;i<7;i++)box(1.6,.027,.02,0,3.5+i*.09,.04,black,.003,panel);
    label(z>1?"ENV / CONTROL":"SERVICE",1.5,.19,0,2.8,.055,"#749da7",panel);
    pipe([[-.85,1.4,.08],[-.85,2.1,.08],[.7,2.1,.08],[.7,2.6,.08]],.022,black,panel);
    box(.055,.57,.025,.9,1.75,.06,cyan,.004,panel);
  }

  // ARCHITECTURE — layered assemblies, not neon outlines on flat walls.
  // Deep window reveal, bolted cover plates, radiator fins and blind mechanics.
  box(8.8,.54,.85,3.0,5.82,-6.56,ivory,.09);
  box(8.25,.19,.97,3.05,5.47,-6.49,dark,.02);
  for(const x of [-1.28,7.52]){
    box(.31,4.16,.75,x,3.57,-6.63,ivory,.055);
    box(.12,3.65,.08,x,3.6,-6.20,copper,.018);
    bolts(x,3.6,-6.155,.12,3.25);
  }
  for(let i=0;i<8;i++){
    const x=-.35+i*.99;box(.89,.75,.11,x,1.13,-6.72,steel,.025);
    bolts(x,1.13,-6.64,.72,.61);
    for(let fin=0;fin<6;fin++)box(.047,.54,.035,x-.30+fin*.12,1.13,-6.63,dark,.003);
  }
  for(const x of [.1,6.5]){
    pipe([[x,5.36,-6.5],[x,4.52,-6.49],[x+.05,4.49,-6.49],[x+.05,5.36,-6.5]],.006,ivory);
    cylinder(.11,.11,.48,x,5.59,-6.18,dark).rotation.z=Math.PI/2;
  }
  label("H10 / RESIDENTIAL     •     PRESSURE SEALED",4.6,.20,2.3,5.81,-6.115,"#c5bbaa");
  box(.72,.28,.025,6.55,5.79,-6.11,black,.008);
  label("01:47",.57,.22,6.55,5.79,-6.09,"#ffc57d");

  // Multi-level ceiling: removable panels, service rails, insulated ducts and fan.
  for(const x of [-5.1,-1.7,1.7,5.1])for(const z of [-5.25,-1.75,1.75,5.25]){
    box(3.17,.08,3.12,x,6.25,z,wall,.025);
    for(const edge of [-1,1])box(.025,.045,2.94,x+edge*1.44,6.18,z,black,.003);
    for(const dz of [-1.24,1.24])box(.48,.045,.045,x,6.16,z+dz,steel,.008);
  }
  for(const x of [-6.95,6.95]){
    box(.65,.43,10.1,x,5.74,.1,dark,.07);
    for(let rib=0;rib<20;rib++)box(.71,.47,.036,x,5.74,-4.7+rib*.5,steel,.008);
    for(let line=0;line<3;line++)pipe([[x-.26+line*.18,5.45,-5.9],[x-.26+line*.18,5.45,0],[x-.26+line*.18,5.45,5.6]],.028,line===1?copper:black);
  }
  const ceilingFan=group(-.3,0,.65);
  cylinder(.13,.13,.65,0,5.92,0,black,ceilingFan);cylinder(.28,.23,.19,0,5.58,0,steel,ceilingFan);
  for(let i=0;i<5;i++){
    const bladeShape=new THREE.Shape();bladeShape.moveTo(.15,-.08);bladeShape.lineTo(1.29,-.17);bladeShape.quadraticCurveTo(1.53,-.13,1.40,.15);bladeShape.lineTo(.4,.23);bladeShape.closePath();
    const blade=mesh(new THREE.ExtrudeGeometry(bladeShape,{depth:.028,bevelEnabled:true,bevelSize:.012,bevelThickness:.009,bevelSegments:1,steps:1}),dark,0,5.52,0,ceilingFan);
    blade.rotation.set(-Math.PI/2,0,i*Math.PI*2/5);
  }
  cylinder(.17,.24,.08,0,5.45,0,ivory,ceilingFan);
  // Caged warm fixtures contrast with the city light.
  for(const z of [-.8,4.7]){
    box(.58,.12,.95,-4.8,6.04,z,black,.05);
    box(.42,.018,.74,-4.8,5.97,z,amber,.04);
    for(let rib=0;rib<5;rib++)box(.53,.055,.025,-4.8,5.94,z-.33+rib*.165,steel,.002);
  }

  // Personal objects are individually modeled, with handles, rims and surface detail.
  const mug=(x:number,y:number,z:number,m:THREE.Material=ivory,parent:THREE.Object3D=scene)=>{
    const profile=[[.02,0],[.10,0],[.115,.025],[.115,.24],[.104,.25],[.096,.23],[.096,.022],[.02,.022]].map(([r,h])=>new THREE.Vector2(r,h));
    mesh(new THREE.LatheGeometry(profile,24),m,x,y,z,parent);
    const handle=torus(.086,.018,x+.125,y+.13,z,m,parent);handle.scale.x=.8;
    const coffee=mesh(new THREE.CircleGeometry(.095,24),black,x,y+.215,z,parent);coffee.rotation.x=-Math.PI/2;
  };
  const bottle=(x:number,y:number,z:number,parent:THREE.Object3D=scene)=>{
    const profile=[[0,0],[.073,0],[.085,.025],[.085,.26],[.039,.32],[.03,.46],[0,.46]].map(([r,h])=>new THREE.Vector2(r,h));
    mesh(new THREE.LatheGeometry(profile,20),teal,x,y,z,parent);
    cylinder(.039,.039,.045,x,y+.465,z,black,parent);cylinder(.087,.087,.12,x,y+.16,z,paper,parent);
  };
  // Desk: repair station, paper manuals, loose cartridges, solder, lamp and headphones.
  const workstation=group(-4.25,0,-5.8);
  for(let page=0;page<4;page++){
    const sheet=box(.55,.005,.4,-1.48+page*.018,1.848+page*.007,.90,paper,.001,workstation);sheet.rotation.y=-.14+page*.06;
  }
  for(let line=0;line<7;line++)box(.30,.002,.01,-1.48,1.879,.79+line*.035,dark,.001,workstation);
  mug(1.91,1.84,.87,ochre,workstation);
  box(.83,.028,.5,1.65,1.86,.08,teal,.025,workstation);
  for(let chip=0;chip<5;chip++){
    box(.10,.022,.13,1.38+chip*.12,1.888,.09,black,.008,workstation);
    for(const sign of [-1,1])box(.09,.008,.009,1.38+chip*.12,1.897,.09+sign*.08,silver,.001,workstation);
  }
  const phones=new THREE.Group();phones.position.set(-1.95,1.99,.37);phones.rotation.x=.38;workstation.add(phones);
  mesh(new THREE.TorusGeometry(.22,.028,8,32,Math.PI),black,0,.03,0,phones);
  for(const side of [-1,1]){box(.10,.18,.14,side*.22,.025,0,rubber,.04,phones);box(.018,.16,.11,side*.276,.025,0,copper,.013,phones);}
  pipe([[-1.72,1.86,.33],[-1.45,1.85,.48],[-1.28,1.85,.31],[-1.35,1.85,.01]],.009,black,workstation);
  cylinder(.18,.21,.07,2.01,1.89,-.64,black,workstation);
  pipe([[2.01,1.92,-.64],[2.01,2.51,-.64],[1.64,2.76,-.57]],.027,copper,workstation);
  const lamp=cylinder(.12,.25,.19,1.60,2.72,-.54,dark,workstation);lamp.rotation.z=-.4;
  const lampBulb=cylinder(.13,.15,.02,1.58,2.61,-.54,amber,workstation);lampBulb.rotation.z=-.4;
  for(let drawer=0;drawer<3;drawer++){
    box(1.30,.30,.085,1.30,.48+drawer*.34,1.05,steel,.018,workstation);
    box(.40,.036,.055,1.30,.50+drawer*.34,1.11,black,.01,workstation);
  }
  // Cable loom and junction box, visible beneath the worktop and along its side.
  box(.57,.88,.20,-2.3,2.85,-.39,steel,.035,workstation);
  bolts(-2.3,2.85,-.275,.45,.74,workstation);
  for(let cable=0;cable<5;cable++)pipe([[-2.39+cable*.055,2.40,-.30],[-2.43+cable*.055,1.95,-.24],[-2.40+cable*.055,.61,-.1],[-1.1+cable*.20,.18,.30]],.015,cable===1?copper:black,workstation);
  for(let socket=0;socket<4;socket++){box(.085,.13,.025,-2.48+socket*.12,3.03,-.26,black,.006,workstation);box(.012,.035,.01,-2.48+socket*.12,3.025,-.24,amber,.001,workstation);}
  label("CAUTION / LIVE",.44,.09,-2.3,2.59,-.275,"#efb565",workstation);
  for(let book=0;book<12;book++){
    for(let rule=0;rule<3;rule++)box(.075,.01,.01,-1.8+book*.15,4.24+rule*.09,-.199,paper,.001,workstation);
  }

  // Soft furnishings: draped fabric and pillow piping break the block-out silhouette.
  burgundy.side=THREE.DoubleSide;
  const throwCloth=mesh(drapedCloth(1.25,1.98,.67),burgundy,5.24,.935,-4.12);throwCloth.rotation.y=.13;
  for(let i=0;i<13;i++)pipe([[4.69+i*.095,.27,-3.40],[4.70+i*.095,.20,-3.41],[4.68+i*.095,.17,-3.44]],.006,ochre);
  for(const [x,angle] of [[1.6,.18],[5.52,-.25]]){
    const pillowFrame=frame(.72,.48,.013,.01,x,1.14,-4.65,ivory);pillowFrame.rotation.z=angle;
  }
  for(let seam=0;seam<3;seam++)for(let stitch=0;stitch<18;stitch++)box(.045,.006,.004,1.08+seam*1.85+stitch*.086,.906,-3.60,copper,.001);
  // Low table has a tray, bowl, chopsticks, coasters and a dog-eared manual.
  cylinder(.26,.25,.015,3.59,.839,-2.11,copper);
  const bowlProfile=[[0,0],[.13,0],[.27,.18],[.28,.21],[.26,.23],[.24,.20],[.11,.027],[0,.027]].map(([r,h])=>new THREE.Vector2(r,h));
  mesh(new THREE.LatheGeometry(bowlProfile,32),ochre,2.87,.84,-2.08);
  for(const dx of [0,.06]){const stick=box(.012,.012,.67,2.79+dx,1.05,-2.07,ivory,.003);stick.rotation.y=.43;}
  bottle(1.66,.84,-2.35);mug(3.61,.84,-2.13,black);
  for(let paperLine=0;paperLine<5;paperLine++)box(.44,.002,.009,2.35,.894,-2.35+paperLine*.04,dark,.001);
  for(const z of [-2.57,-1.72])box(.64,.012,.025,2.35,.89,z,copper,.004);
  // A side table and stacked storage soften the otherwise empty corner.
  cylinder(.61,.66,.10,6.86,1.04,-5.1,ivory);cylinder(.08,.14,.90,6.86,.55,-5.1,silver);
  cylinder(.45,.45,.08,6.86,.09,-5.1,dark);bottle(6.79,1.10,-5.27);mug(6.95,1.10,-4.96,ochre);
  for(let item=0;item<3;item++){const book=box(.49,.07,.38,6.93,1.14+item*.08,-5.38,item%2?paper:burgundy,.009);book.rotation.y=item*.08;}

  // Pendant column: access housings, projecting sensors, seals and exposed screws.
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3,g=group(3.8+Math.sin(a)*.69,0,-3.5+Math.cos(a)*.69,a);
    box(.43,.30,.16,0,5.43,.04,steel,.025,g);bolts(0,5.43,.132,.32,.20,g);
    box(.22,.06,.025,0,5.40,.145,black,.004,g);
    box(.23,.23,.20,0,4.18,0,dark,.03,g);
    const sensor=cylinder(.065,.065,.06,0,4.19,.13,cyan,g);sensor.rotation.x=Math.PI/2;
  }
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;pipe([[3.8+Math.cos(a)*.47,5.84,-3.5+Math.sin(a)*.47],[3.8+Math.cos(a)*.58,5.73,-3.5+Math.sin(a)*.58]],.021,copper);
  }
  label("K-09",.54,.23,3.79,5.40,-2.63,"#e4c7a6");

  // Sleeping bay: padded wall, shelf, rumpled blanket and bedside lamp.
  for(let col=0;col<5;col++)for(let row=0;row<3;row++)box(.76,.50,.11,-1.57+col*.79,1.40+row*.54,-.085,burgundy,.07,sleep);
  teal.side=THREE.DoubleSide;
  const quilt=mesh(drapedCloth(3.35,2.00,.47),teal,0,1.07,1.14,sleep);
  quilt.rotation.y=-.035;
  for(let seam=0;seam<8;seam++)pipe([[-1.59+seam*.45,1.074,.26],[-1.56+seam*.45,1.074,1.3],[-1.58+seam*.45,.72,1.94]],.006,cloth,sleep);
  box(4.09,.085,.41,0,3.4,.10,steel,.025,sleep);
  for(let book=0;book<6;book++)box(.095,.24+book%2*.07,.23,-1.6+book*.11,3.57,.1,book%2?ochre:cloth,.007,sleep);
  const nightLamp=new THREE.PointLight(0xffa253,6,3,2);nightLamp.position.set(1.7,1.66,5.79);scene.add(nightLamp);
  cylinder(.13,.2,.05,1.7,1.045,5.8,copper);cylinder(.018,.018,.36,1.7,1.25,5.8,copper);
  cylinder(.16,.25,.29,1.7,1.51,5.8,ochre);cylinder(.13,.2,.012,1.7,1.36,5.8,amber);
  // Lockers and airlock have actual latches, hinges, rails and a threshold grate.
  for(const x of [-1.22,1.22])for(const y of [1.1,3.7])box(.14,.35,.11,x,y,.18,steel,.012,door);
  for(const x of [-.4,.4]){box(.13,.68,.12,x,2.41,.17,black,.035,door);box(.055,.49,.07,x,2.41,.26,copper,.015,door);}
  box(2.5,.07,.82,0,.067,.37,steel,.017,door);
  for(let i=0;i<13;i++)box(.085,.008,.62,-1.11+i*.185,.108,.4,black,.002,door);
  label("KEEP CLEAR",1.0,.10,0,.55,.097,"#f5bc71",door);
  for(let i=0;i<4;i++){
    const x=-1.5+i*.86;box(.015,.94,.013,x,2.92,.49,silver,.002,wardrobe);
    for(const sign of [-1,1])box(.13,.08,.017,x+sign*.16,3.1,.493,dark,.01,wardrobe);
    box(.036,.075,.016,x,3.33,.51,copper,.004,wardrobe);
    for(let fold=0;fold<3;fold++)box(.45,.065,.30,x,4.18+fold*.073,.22,fold%2?cloth:burgundy,.024,wardrobe);
  }

  // Kitchen backsplash, dish rack, small appliances and supplies.
  for(let row=0;row<4;row++)for(let col=0;col<12;col++)box(.40,.24,.018,-2.27+col*.415,1.83+row*.26,-.085,ivory,.008,kitchen);
  box(.64,.59,.55,.07,1.91,.44,dark,.04,kitchen);box(.5,.32,.04,.07,1.98,.73,black,.017,kitchen);
  for(const x of [-.13,.04,.21]){const knob=cylinder(.038,.038,.025,x,1.74,.76,copper,kitchen);knob.rotation.x=Math.PI/2;}
  box(.55,.02,.10,.07,1.86,.77,silver,.004,kitchen);
  mug(.45,1.58,.57,ivory,kitchen);bottle(-2.12,1.58,.75,kitchen);
  box(.72,.06,.59,-1.91,1.62,.41,steel,.017,kitchen);
  for(let plate=0;plate<5;plate++){
    const dish=cylinder(.18,.16,.017,-2.18+plate*.12,1.83,.4,paper,kitchen);dish.rotation.z=1.25;
    pipe([[-2.21+plate*.12,1.64,.14],[-2.21+plate*.12,1.91,.14],[-2.21+plate*.12,1.91,.66],[-2.21+plate*.12,1.64,.66]],.006,silver,kitchen);
  }
  pipe([[1.8,2.60,.11],[2.38,2.60,.11]],.02,black,kitchen);
  for(let utensil=0;utensil<3;utensil++){
    const x=1.91+utensil*.19;pipe([[x,2.65,.10],[x,2.55,.13],[x,2.22,.13]],.011,copper,kitchen);
    const spoon=mesh(new THREE.SphereGeometry(.055,12,8),silver,x,2.18,.13,kitchen);spoon.scale.set(.6,1.2,.2);
  }
  label("WATER / RECYCLED",1.16,.10,-1.3,2.74,-.064,"#302a24",kitchen);
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
    // Product bands and visible pull-tabs on the vending cans.
    cylinder(.081,.081,.068,-.36+col*.24,1.215+row*.44,.45,ochre,vending);
    const tab=torus(.020,.004,-.36+col*.24,1.316+row*.44,.45,dark,vending);tab.rotation.x=Math.PI/2;
  }
  box(.19,.56,.045,.48,.52,.52,steel,.013,vending);
  for(let b=0;b<3;b++){const button=cylinder(.028,.028,.015,.48,.38+b*.13,.555,amber,vending);button.rotation.x=Math.PI/2;}

  // Side service spine: a rack with fans, patch cables, removable floor access panels.
  const rack=group(7.53,0,.68,-Math.PI/2);
  box(1.13,2.4,.59,0,1.35,0,dark,.04,rack);
  for(let unit=0;unit<6;unit++){
    box(.99,.32,.045,0,.43+unit*.37,.33,steel,.014,rack);
    for(const x of [-.34,.34])box(.021,.22,.035,x,.43+unit*.37,.37,black,.003,rack);
    for(let port=0;port<5;port++)box(.066,.056,.018,-.22+port*.11,.44+unit*.37,.36,black,.002,rack);
    box(.021,.021,.018,.41,.44+unit*.37,.36,unit%3?cyan:amber,.002,rack);
  }
  for(let cable=0;cable<4;cable++)pipe([[-.19+ cable*.11,2.28,.38],[-.2+cable*.11,1.83,.6],[.41,1.55+ cable*.1,.65],[.21-cable*.11,.82,.38]],.010,cable%2?copper:teal,rack);
  const hatch=group(.15,0,3.25,.12);box(2.2,.022,1.42,0,.041,0,steel,.025,hatch);
  for(let i=0;i<12;i++)box(.09,.004,1.05,-.97+i*.177,.055,0,dark,.002,hatch);
  for(const x of [-.94,.94])for(const z of [-.60,.60])cylinder(.025,.025,.005,x,.055,z,silver,hatch);
  for(let i=0;i<4;i++){
    const parcel=group(-6.4+i*.33,0,4.7+(i%2)*.42,i*.13);
    box(.55,.30,.44,0,.19+(i>1?.31:0),0,ochre,.017,parcel);
    box(.065,.005,.44,0,.343+(i>1?.31:0),0,paper,.001,parcel);
    label("DD / 07",.27,.085,0,.2+(i>1?.31:0),.225,"#3e3327",parcel);
  }

  // Original full-resolution wall print on a lightly buckled paper mesh.
  const posterWall=group(7.75,0,2.8,-Math.PI/2);
  const posterMaterial=mat(0xffffff,.96,0,false);
  const posterGeometry=new THREE.PlaneGeometry(1.85,2.775,16,24);
  const posterVertices=posterGeometry.attributes.position;
  for(let i=0;i<posterVertices.count;i++){
    const x=posterVertices.getX(i),y=posterVertices.getY(i);
    posterVertices.setZ(i,.025+Math.sin(x*8+y*3)*.006+Math.max(0,-y-1.05)**2*.22);
  }
  posterGeometry.computeVertexNormals();
  const poster=mesh(posterGeometry,posterMaterial,0,2.92,.03,posterWall);poster.rotation.z=-.028;
  for(const x of [-.68,.68]){const tape=box(.26,.11,.007,x,4.25,.065,paper,.003,posterWall);tape.rotation.z=x*.16;}
  box(2.1,.09,.28,0,4.52,.10,black,.025,posterWall);
  box(1.75,.018,.10,0,4.46,.18,amber,.004,posterWall);

  // Motivated light sources: cyan city spill, pink lounge, warm kitchen/task light.
  RectAreaLightUniformsLib.init();
  const area=(color:number,intensity:number,w:number,h:number,pos:number[],target:number[])=>{
    const l=new THREE.RectAreaLight(color,intensity,w,h);l.position.set(...pos as [number,number,number]);l.lookAt(new THREE.Vector3(...target as [number,number,number]));scene.add(l);
  };
  area(0x58b6de,4,7.6,3.1,[3.1,3.8,-6.4],[1,2,0]);
  area(0xf05b83,3,3.8,1,[4.9,4.2,6.35],[2,1,1]);
  area(0xffbb79,5,4,1,[-7.3,3.1,.35],[-1,1,0]);
  area(0xffc385,3,3,1,[-4.8,5.9,.1],[-4,1,.1]);
  area(0xffce9b,2.5,1.7,.2,[7.2,4.4,2.8],[7.7,2.6,2.8]);
  scene.add(new THREE.HemisphereLight(0x8caabe,0x30222a,.38));
  const task=new THREE.SpotLight(0xffd0a1,36,18,.82,.65,1.7);task.position.set(-3.8,5.5,-4.8);task.target.position.set(-4.2,1.8,-5.3);task.castShadow=true;
  task.shadow.mapSize.set(1024,1024);task.shadow.normalBias=.025;scene.add(task,task.target);
  const loungeLight=new THREE.PointLight(0xeb5298,22,10,2);loungeLight.position.set(5,2.3,-4.0);scene.add(loungeLight);
  const fill=new THREE.DirectionalLight(0x9bb8d2,.38);fill.position.set(1,5,2);scene.add(fill);
  const doorLight=new THREE.PointLight(0x49cbe9,12,8,2);doorLight.position.set(-.3,3,5.9);scene.add(doorLight);
  batchRoomGeometry(scene,computer.rig);
  return {computer,posterMaterial,materials:[...materials,...computer.materials],textures:[...textures,...computer.textures],roomPosition:new THREE.Vector3(0,2.75,1.3)};
}
