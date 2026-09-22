import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const FLOWER_BEDS = [[-5.2,-2.65,1.15,1.05],[-5.15,2.85,1.25,1.12],[4.95,-2.3,1.1,1.65],[3.85,3.22,1.25,.58]] as const;

/** Curved, tapered petal/leaf surface with a raised midrib, not a faceted ball. */
function petal(length:number,width:number,cup:number) {
  const g=new THREE.PlaneGeometry(1,1,2,6),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const t=p.getY(i)+.5,u=p.getX(i)*2;
    p.setXYZ(i,u*width*Math.pow(Math.sin(Math.PI*t),.65),cup*t*t+.014*(1-u*u)*Math.sin(Math.PI*t),t*length);
  }
  g.computeVertexNormals();return g;
}

export function flowerGeometry(kind:number) {
  const parts:THREE.BufferGeometry[]=[],matrix=new THREE.Matrix4(),q=new THREE.Quaternion();
  const add=(geo:THREE.BufferGeometry,color:number,position:THREE.Vector3,rotation=new THREE.Euler(),scale=new THREE.Vector3(1,1,1))=>{
    const g=geo.index?geo.toNonIndexed():geo.clone();geo.dispose();q.setFromEuler(rotation);matrix.compose(position,q,scale);g.applyMatrix4(matrix);
    const c=new THREE.Color(color),colors=new Float32Array(g.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}g.setAttribute("color",new THREE.BufferAttribute(colors,3));parts.push(g);
  };
  const h=kind===2?.63:.43,lean=.045;
  const stem=new THREE.CatmullRomCurve3([new THREE.Vector3(),new THREE.Vector3(-.015,h*.4,0),new THREE.Vector3(lean,h,0)]);
  add(new THREE.TubeGeometry(stem,10,.007,5,false),0x557843,new THREE.Vector3());
  for(let i=0;i<4;i++){
    const a=i*2.4,y=.08+i*.075;
    add(petal(.15,.033,-.035),i%2?0x628849:0x799c54,new THREE.Vector3(0,y,0),new THREE.Euler(-.35,a,.1));
    add(new THREE.CylinderGeometry(.002,.003,.11,4),0xabc078,new THREE.Vector3(Math.sin(a)*.04,y+.012,Math.cos(a)*.04),new THREE.Euler(Math.PI/2-.2,a,0));
  }
  if(kind===2){
    // A salvia spike: separate bell-like corollas, dark throats and a tapered bud.
    for(let i=0;i<9;i++){
      const a=i*2.4,y=h-.22+i*.026,r=.022;
      add(new THREE.ConeGeometry(.025,.06,7,1,true),i%2?0x8c91be:0xb5a6cc,new THREE.Vector3(lean+Math.sin(a)*r,y,Math.cos(a)*r),new THREE.Euler(.8,a,.6));
    }
    add(new THREE.SphereGeometry(.021,8,5),0x8c91be,new THREE.Vector3(lean,h+.03,0),undefined,new THREE.Vector3(.7,1.8,.7));
  }else{
    const n=kind===0?12:8,colors=kind===0?[0xfff4d9,0xf1ddb5]:[0xe9a299,0xd78289];
    for(let i=0;i<n;i++)add(petal(kind===0?.082:.091,kind===0?.019:.035,kind===0?-.018:.024),colors[i%2],new THREE.Vector3(lean,h,0),new THREE.Euler(0,i*Math.PI*2/n,0));
    add(new THREE.SphereGeometry(.027,10,6),0xc09230,new THREE.Vector3(lean,h+.012,0),undefined,new THREE.Vector3(1,.45,1));
    for(let i=0;i<9;i++){const a=i*2.4,r=.006*Math.sqrt(i);add(new THREE.SphereGeometry(.0045,4,3),i%2?0xeec967:0x916c28,new THREE.Vector3(lean+Math.cos(a)*r,h+.024,Math.sin(a)*r));}
  }
  const geometry=mergeGeometries(parts,false)!;parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();return geometry;
}

/** Three instanced draws for the whole garden; roots stay fixed in the wind. */
export function createTramGarden(scene:THREE.Scene,materials:THREE.Material[]) {
  const time={value:0},flowers:THREE.InstancedMesh[]=[];
  for(let kind=0;kind<3;kind++){
    const geometry=flowerGeometry(kind),material=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.88});materials.push(material);
    material.onBeforeCompile=shader=>{
      shader.uniforms.gardenTime=time;
      shader.vertexShader="uniform float gardenTime; attribute float windPhase;\n"+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        float bend=pow(max(position.y,0.),1.8);
        transformed.x+=sin(gardenTime*1.5+windPhase)*bend*.13;
        transformed.z+=sin(gardenTime*1.1+windPhase*.8)*bend*.055;`);
    };
    material.customProgramCacheKey=()=>"rooted-flower-wind-v1";
    const count=28,mesh=new THREE.InstancedMesh(geometry,material,count),phases=new Float32Array(count),dummy=new THREE.Object3D();
    mesh.name=["Garden / ivory daisies","Garden / blush cosmos","Garden / lavender salvia"][kind];
    for(let i=0;i<count;i++){
      const [x,z,w,d]=FLOWER_BEDS[i%4],u=((i*37+kind*13)%97)/97,v=((i*29+kind*31)%89)/89;
      dummy.position.set(x+(u-.5)*w*.9,.17,z+(v-.5)*d*.9);dummy.rotation.y=i*2.399;dummy.scale.setScalar(.7+((i*11+kind*7)%19)/30);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);phases[i]=i*1.73+kind*2;
    }
    geometry.setAttribute("windPhase",new THREE.InstancedBufferAttribute(phases,1));mesh.computeBoundingSphere();if(mesh.boundingSphere)mesh.boundingSphere.radius+=.2;
    mesh.receiveShadow=true;scene.add(mesh);flowers.push(mesh);
  }
  return {flowers,update:(seconds:number)=>{time.value=seconds;}};
}
