import * as THREE from "three";
import {BOTTLE_SLOTS,vendingPage} from "./vending-controls.mjs";

type Article={id:string;title:string;url:string};
const COLORS=[0x438c77,0xb66a36,0x557ba0,0xa55854,0x8a7445,0x72739d,0x487985,0xa76680,0x70924d];
export const DISPENSE_SECONDS=1.65;

/** A restrained release, gravity drop into the chute, then a damped roll into the tray. */
export function bottlePose(slot:number,elapsed:number){
  const start=BOTTLE_SLOTS[slot],t=Math.min(1,Math.max(0,elapsed/DISPENSE_SECONDS));
  if(t<.18){const p=t/.18;return {x:start.x,y:start.y+.008*Math.sin(p*Math.PI),z:.625+p*.1,rotation:-.18*Math.sin(p*Math.PI/2)};}
  if(t<.68){const p=(t-.18)/.5,fall=p*p;return {x:THREE.MathUtils.lerp(start.x,.09,fall),y:THREE.MathUtils.lerp(start.y,.397,fall),z:THREE.MathUtils.lerp(.725,.35,Math.max(0,(p-.78)/.22)),rotation:THREE.MathUtils.lerp(-.18,Math.PI/2,p)};}
  const p=(t-.68)/.32,ease=1-Math.pow(1-p,3);
  return {x:.09,y:.397+.02*Math.sin(p*Math.PI*3)*(1-p)*(1-p),z:THREE.MathUtils.lerp(.35,.65,ease),rotation:Math.PI/2+.12*Math.sin(p*Math.PI*2)*(1-p)*(1-p)};
}

export function createVendingBottles(parent:THREE.Group,materials:THREE.Material[],textures:THREE.Texture[]){
  const root=new THREE.Group();root.name="Blogs / stocked bottles";root.userData.dynamic=true;parent.add(root);
  const profile=[[0,0],[.044,0],[.057,.009],[.060,.025],[.060,.19],[.055,.215],[.028,.247],[.026,.285],[.029,.288],[.029,.302],[0,.302]].map(([x,y])=>new THREE.Vector2(x,y));
  const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.24,metalness:.08,clearcoat:1,clearcoatRoughness:.13});
  const metal=new THREE.MeshStandardMaterial({color:0xd1b783,metalness:.65,roughness:.3});
  const atlas=document.createElement("canvas");atlas.width=512;atlas.height=1280;
  const context=atlas.getContext("2d")!,texture=new THREE.CanvasTexture(atlas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  const paper=new THREE.MeshStandardMaterial({map:texture,roughness:.7,color:0xfff7dd,emissive:0xffeccb,emissiveIntensity:.12});
  materials.push(glass,metal,paper);textures.push(texture);
  const bodies=new THREE.InstancedMesh(new THREE.LatheGeometry(profile,32),glass,10);
  const canProfile=[[0,0],[.052,0],[.060,.009],[.060,.218],[.054,.228],[0,.228]].map(([x,y])=>new THREE.Vector2(x,y));
  const juiceProfile=[[0,0],[.045,0],[.061,.016],[.060,.19],[.054,.211],[.035,.228],[.034,.255],[0,.255]].map(([x,y])=>new THREE.Vector2(x,y));
  const bodyTypes=[bodies,new THREE.InstancedMesh(new THREE.LatheGeometry(canProfile,32),glass,10),new THREE.InstancedMesh(new THREE.LatheGeometry(juiceProfile,32),glass,10)];
  const capGeometry=new THREE.CylinderGeometry(.032,.032,.016,24);capGeometry.translate(0,.299,0);
  const caps=new THREE.InstancedMesh(capGeometry,metal,10);
  const labelsGeometry=new THREE.BufferGeometry(),positions=new Float32Array(10*25*2*3),uvs=new Float32Array(10*25*2*2),indices:number[]=[];
  const labelVertices:THREE.Vector3[]=[];
  for(let side=0;side<2;side++)for(let j=0;j<=24;j++){const angle=-Math.PI*.73+j/24*Math.PI*1.46;labelVertices.push(new THREE.Vector3(Math.sin(angle)*.061,side===0?.188:.055,Math.cos(angle)*.061));}
  for(let i=0;i<10;i++)for(let side=0;side<2;side++)for(let j=0;j<=24;j++){const vertex=i*50+side*25+j;uvs[vertex*2]=j/24;uvs[vertex*2+1]=1-(i+(side===0?.015:.985))/10;if(side===0&&j<24){const a=vertex;indices.push(a,a+25,a+1,a+1,a+25,a+26);}}
  labelsGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));labelsGeometry.setAttribute("uv",new THREE.BufferAttribute(uvs,2));labelsGeometry.setIndex(indices);
  const labels=new THREE.Mesh(labelsGeometry,paper);labels.frustumCulled=false;
  for(const mesh of [...bodyTypes,caps,labels]){mesh.name="Vending / bottle batch";mesh.castShadow=false;mesh.receiveShadow=true;mesh.frustumCulled=false;root.add(mesh);}
  for(const body of bodyTypes)body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  bodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);caps.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion(),position=new THREE.Vector3(),scale=new THREE.Vector3(),point=new THREE.Vector3();
  let entries:Article[]=[],page=0,chosen=-1,elapsed=0,phase:"idle"|"dropping"|"ready"="idle",resolve:((ok:boolean)=>void)|null=null;
  const colorFor=(entry:Article)=>{let hash=0;for(const char of entry.id)hash=(hash*31+char.charCodeAt(0))>>>0;return COLORS[hash%COLORS.length];};
  const drawLabel=(entry:Article|undefined,index:number,number:number)=>{
    context.fillStyle="#f5ead1";context.fillRect(0,index*128,512,128);if(!entry)return;
    context.fillStyle="#314b41";context.textAlign="center";context.textBaseline="middle";context.font="bold 22px monospace";context.fillText(String(number).padStart(2,"0"),256,index*128+19);
    context.font="bold 18px sans-serif";const words=entry.title.split(/\s+/),lines:string[]=[];let line="";
    for(const word of words){if((line+" "+word).trim().length>25&&line){lines.push(line);line=word;}else line=(line+" "+word).trim();}if(line)lines.push(line);
    lines.slice(0,3).forEach((text,row)=>context.fillText(text.slice(0,27),256,index*128+49+row*24,330));texture.needsUpdate=true;
  };
  const put=(index:number,pose:{x:number;y:number;z:number;rotation:number},visible:boolean)=>{
    const type=(index===9?Math.max(0,chosen):index)%3;
    position.set(pose.x,pose.y,pose.z);rotation.setFromAxisAngle(new THREE.Vector3(0,0,1),pose.rotation);scale.setScalar(visible?1:0);matrix.compose(position,rotation,scale);
    for(let i=0;i<bodyTypes.length;i++)bodyTypes[i].setMatrixAt(index,i===type?matrix:new THREE.Matrix4().makeScale(0,0,0));
    const capMatrix=matrix.clone().multiply(new THREE.Matrix4().makeTranslation(0,type===1?-.075:type===2?-.048:0,0)).multiply(new THREE.Matrix4().makeScale(type===1?1.8:1,1,type===1?1.8:1));caps.setMatrixAt(index,capMatrix);
    for(let v=0;v<50;v++){point.copy(labelVertices[v]).applyMatrix4(matrix);positions.set([point.x,point.y,point.z],(index*50+v)*3);}
  };
  const flush=()=>{for(const body of bodyTypes){body.instanceMatrix.needsUpdate=true;if(body.instanceColor)body.instanceColor.needsUpdate=true;}caps.instanceMatrix.needsUpdate=true;labelsGeometry.attributes.position.needsUpdate=true;labelsGeometry.computeVertexNormals();};
  const stock=(all:Article[],nextPage:number)=>{
    if(phase!=="idle")return;
    entries=all;page=vendingPage(all,nextPage).page;const slots=vendingPage(all,page).slots as (Article|null)[];
    slots.forEach((entry,index)=>{const slot=BOTTLE_SLOTS[index];put(index,{x:slot.x,y:slot.y,z:.625,rotation:0},!!entry);for(const body of bodyTypes)body.setColorAt(index,new THREE.Color(entry?colorFor(entry):0xffffff));drawLabel(entry??undefined,index,page*9+index+1);});
    put(9,{x:0,y:0,z:0,rotation:0},false);if(bodies.instanceColor)bodies.instanceColor.needsUpdate=true;flush();
  };
  stock([],0);
  return {bodies,caps,labels,get phase(){return phase;},get count(){return entries.length;},stock,
    dispense:(slot:number,reduced=false):Promise<boolean>=>{
      const entry=entries[page*9+slot];if(phase!=="idle"||!Number.isInteger(slot)||slot<0||slot>8||!entry)return Promise.resolve(false);
      chosen=slot;elapsed=0;phase="dropping";drawLabel(entry,9,page*9+slot+1);for(const body of bodyTypes)body.setColorAt(9,new THREE.Color(colorFor(entry)));
      put(chosen,{x:0,y:0,z:0,rotation:0},false);put(9,bottlePose(chosen,reduced?DISPENSE_SECONDS:0),true);flush();
      if(reduced){phase="ready";return Promise.resolve(true);}return new Promise(ok=>{resolve=ok;});
    },
    collect:()=>{if(phase!=="ready")return;phase="idle";chosen=-1;stock(entries,page);},
    update:(dt:number)=>{if(phase!=="dropping")return false;elapsed=Math.min(DISPENSE_SECONDS,elapsed+Math.max(0,dt));put(9,bottlePose(chosen,elapsed),true);flush();if(elapsed>=DISPENSE_SECONDS){phase="ready";resolve?.(true);resolve=null;}return phase==="dropping";},
    dispose:()=>{resolve?.(false);resolve=null;},
  };
}
