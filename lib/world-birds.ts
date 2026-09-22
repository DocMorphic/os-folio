import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createSkyFlock} from './sky-flock';

function painted(geometry:THREE.BufferGeometry,color:number){
  const g=geometry.index?geometry.toNonIndexed():geometry.clone();geometry.dispose();
  const c=new THREE.Color(color),colors=new Float32Array(g.attributes.position.count*3);
  for(let i=0;i<colors.length;i+=3){colors[i]=c.r;colors[i+1]=c.g;colors[i+2]=c.b;}
  g.setAttribute('color',new THREE.BufferAttribute(colors,3));return g;
}
export function gullBodyGeometry(){
  const parts:THREE.BufferGeometry[]=[];
  const ellipsoid=(scale:number[],at:number[],color:number)=>{const g=new THREE.SphereGeometry(1,12,8);g.scale(...scale as [number,number,number]);g.translate(...at as [number,number,number]);parts.push(painted(g,color));};
  ellipsoid([.097,.09,.27],[0,0,0],0xdde0dc);
  ellipsoid([.09,.045,.23],[0,.06,-.025],0x879293);
  ellipsoid([.064,.065,.079],[0,.055,.269],0xe5e5dd);
  const beak=new THREE.ConeGeometry(.024,.12,8);beak.rotateX(Math.PI/2);beak.translate(0,.041,.369);parts.push(painted(beak,0xc6a166));
  for(const x of [-.058,.058])ellipsoid([.009,.009,.009],[x,.076,.302],0x242b2c);
  const tail=new THREE.BufferGeometry();tail.setAttribute('position',new THREE.Float32BufferAttribute([-.047,0,-.21,.047,0,-.21,-.12,-.012,-.43,.047,0,-.21,.12,-.012,-.43,-.12,-.012,-.43],3));tail.computeVertexNormals();parts.push(painted(tail,0xb5bebb));
  const merged=mergeGeometries(parts.map(g=>{g.deleteAttribute('uv');return g;}),false)!;parts.forEach(g=>g.dispose());return merged;
}
export function gullWingGeometry(side:number){
  // Swept elbow, narrow wrist and separated primary-feather tips; cambered
  // upper/lower surfaces rather than two flat triangles or a generic V.
  const stations=[[.065,.12,-.16],[.30,.17,-.25],[.52,.13,-.22],[.76,-.015,-.25],[.97,-.18,-.27]];
  const positions:number[]=[],colors:number[]=[];
  const triangle=(a:number[],b:number[],c:number[],ink:number)=>{const col=new THREE.Color(ink);for(const p of [a,b,c]){positions.push(p[0]*side,p[1],p[2]);colors.push(col.r,col.g,col.b);}};
  for(let i=0;i<stations.length-1;i++){
    const [x,f,b]=stations[i],[xx,ff,bb]=stations[i+1];
    for(const s of [-1,1]){
      const y=s*.013,yy=s*.009,ink=i>1?0x394649:s>0?0x8c9b9e:0xc9d0cb;
      triangle([x,y,f],[xx,yy,ff],[x,y,b],ink);triangle([xx,yy,ff],[xx,yy,bb],[x,y,b],ink);
    }
  }
  for(let i=0;i<5;i++){
    const x=.69+i*.051,z=-.205-i*.017;
    triangle([x,.004,z],[x+.10,-.018,z-.12+i*.012],[x+.042,.003,z+.017],0x344044);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
}
export function createWorldBirds(scene:THREE.Scene,materials:THREE.Material[],seed=Math.floor(Math.random()*0xffffffff)){
  const flock=createSkyFlock(seed),root=new THREE.Group();root.name='Sky / migrating gull flocks';scene.add(root);
  const time={value:0},night={value:0};
  const makeMaterial=(wing:boolean)=>{
    // The lake's short ground-fog range would erase birds in the open sky.
    // Use a longer, gentle aerial haze while preserving ordinary scene lighting.
    const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.86,side:THREE.DoubleSide,transparent:true,depthWrite:false,alphaTest:.025,fog:false});
    m.onBeforeCompile=shader=>{
      shader.uniforms.birdTime=time;shader.uniforms.birdNight=night;
      shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
        attribute float birdPhase; attribute float birdVisibility; varying float vBirdVisibility; varying float vBirdHaze;
        uniform float birdTime;
        float wingAngle(vec3 p){
          float glide=smoothstep(-.25,.35,sin((birdTime+birdPhase)*.51));
          float beat=sin(birdTime*25.0+birdPhase*4.0);
          float flap=mix(.07,.56,glide)*beat+.10;
          return sign(p.x)*(flap+smoothstep(.4,.97,abs(p.x))*.20*sin(birdTime*25.0+birdPhase*4.0-.65)*glide);
        }
        mat3 wingRotation(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
      `).replace('#include <begin_vertex>',`#include <begin_vertex>
        vBirdVisibility=birdVisibility;
        vBirdHaze=smoothstep(50.0,180.0,distance(cameraPosition,(modelMatrix*instanceMatrix*vec4(position,1.0)).xyz))*.65;
        ${wing?'transformed=wingRotation(wingAngle(position))*position;':''}
      `);
      if(wing)shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=wingRotation(wingAngle(position))*objectNormal;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vBirdVisibility; varying float vBirdHaze; uniform float birdNight;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a *= vBirdVisibility * (1.0-birdNight*.88);\ndiffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.55,.64,.68),vec3(.04,.065,.12),birdNight),vBirdHaze);');
    };
    m.customProgramCacheKey=()=>`gull-flight-${wing?1:0}`;materials.push(m);return m;
  };
  const bodyMaterial=makeMaterial(false),wingMaterial=makeMaterial(true);
  const meshes=[gullBodyGeometry(),gullWingGeometry(-1),gullWingGeometry(1)].map((g,i)=>{
    g.setAttribute('birdPhase',new THREE.InstancedBufferAttribute(Float32Array.from(flock.birds,b=>b.phase),1));
    g.setAttribute('birdVisibility',new THREE.InstancedBufferAttribute(new Float32Array(flock.birds.length).fill(1),1));
    const mesh=new THREE.InstancedMesh(g,i?wingMaterial:bodyMaterial,flock.birds.length);mesh.name=i?'Birds / articulated feathered wings':'Birds / shaped gull bodies';mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;root.add(mesh);return mesh;
  });
  const dummy=new THREE.Object3D(),position=new THREE.Vector3(),target=new THREE.Vector3();
  const update=(dt:number,darkness:number,reduced=false)=>{
    root.visible=!reduced;if(reduced)return;
    flock.advance(dt);time.value=flock.time;night.value=darkness;
    flock.birds.forEach((b,i)=>{
      position.lerpVectors(b.previous,b.position,flock.interpolation);dummy.position.copy(position);target.copy(position).add(b.velocity);dummy.lookAt(target);dummy.rotateZ(b.bank);dummy.scale.setScalar(b.scale);dummy.updateMatrix();
      const radius=Math.hypot(position.x,position.z),fade=1-THREE.MathUtils.smoothstep(radius,115,143);
      for(const mesh of meshes){mesh.setMatrixAt(i,dummy.matrix);mesh.geometry.attributes.birdVisibility.setX(i,fade);}
    });
    for(const mesh of meshes){mesh.instanceMatrix.needsUpdate=true;mesh.geometry.attributes.birdVisibility.needsUpdate=true;}
  };
  update(0,0);return {root,update,count:flock.birds.length,
    visibleCount:(camera:THREE.Camera)=>{let count=0;for(const b of flock.birds){target.copy(b.position).project(camera);if(Math.abs(target.x)<1&&Math.abs(target.y)<1&&target.z<1&&Math.hypot(b.position.x,b.position.z)<115)count++;}return count;},
    dispose:()=>{meshes.forEach(m=>{m.dispose();m.geometry.dispose();});root.removeFromParent();}};
}
