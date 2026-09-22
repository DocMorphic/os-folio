import * as THREE from "three";
import {RoundedBoxGeometry} from "three/addons/geometries/RoundedBoxGeometry.js";
import {batchRoomGeometry} from "./room-geometry";

/** Mounted hardware and two restrained neon accents, built once. */
export function createTramRooftop(scene:THREE.Scene,materials:THREE.Material[]){
  const stage=new THREE.Scene();
  const metal=new THREE.MeshStandardMaterial({color:0x31494b,metalness:.7,roughness:.4});
  const rubber=new THREE.MeshStandardMaterial({color:0x182625,roughness:.86});
  const steel=new THREE.MeshStandardMaterial({color:0xa2aba5,metalness:.8,roughness:.35});
  const cone=new THREE.MeshStandardMaterial({color:0x434b48,roughness:.92});
  const ceramic=new THREE.MeshStandardMaterial({color:0xd8c9a7,roughness:.5});
  const neon=new THREE.MeshStandardMaterial({color:0x84dad0,emissive:0x56eedb,emissiveIntensity:.3,roughness:.23});
  const glow=new THREE.MeshBasicMaterial({color:0x6bffe8,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  materials.push(metal,rubber,steel,cone,ceramic,neon,glow);
  const mesh=(g:THREE.BufferGeometry,m:THREE.Material,p:number[],parent:THREE.Object3D=stage)=>{const o=new THREE.Mesh(g,m);o.position.set(...p as [number,number,number]);o.castShadow=m!==glow;o.receiveShadow=m!==glow;parent.add(o);return o;};
  const box=(w:number,h:number,d:number,p:number[],m=metal,parent:THREE.Object3D=stage)=>mesh(new RoundedBoxGeometry(w,h,d,1,Math.min(.025,w/4,h/4,d/4)),m,p,parent);
  const cable=(points:number[][],radius=.013,m:THREE.Material=rubber,parent:THREE.Object3D=stage)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),32,radius,6,false),m,[0,0,0],parent);
  const ring=(r:number,t:number,p:number[],m:THREE.Material,parent:THREE.Object3D=stage)=>mesh(new THREE.TorusGeometry(r,t,6,20),m,p,parent);
  for(const side of [-1,1]){
    const speaker=new THREE.Group();speaker.name=`Roof / bracket-mounted ${side<0?"left":"right"} speaker`;speaker.position.set(side<0?-4.02:1.7,4.31,side<0?-.52:-1.32);speaker.rotation.y=side*.24;stage.add(speaker);
    box(.42,.045,.4,[0,.022,0],steel,speaker);
    box(.30,.08,.29,[0,-.035,0],rubber,speaker);
    for(const x of [-.21,.21]){
      box(.045,.38,.13,[x,.20,-.025],metal,speaker);
      const pivot=mesh(new THREE.CylinderGeometry(.045,.045,.065,12),steel,[x,.28,0],speaker);pivot.rotation.z=Math.PI/2;
    }
    box(.38,.57,.34,[0,.43,0],rubber,speaker);
    box(.34,.53,.025,[0,.43,.18],metal,speaker);
    for(const [y,r] of [[.34,.112],[.60,.055]]){
      ring(r,.014,[0,y,.204],rubber,speaker);
      const diaphragm=mesh(new THREE.ConeGeometry(r*.87,.035,24),cone,[0,y,.20],speaker);diaphragm.rotation.x=Math.PI/2;
      mesh(new THREE.SphereGeometry(r*.3,12,8),rubber,[0,y,.217],speaker).scale.z=.45;
    }
    for(let i=0;i<8;i++)box(.31,.007,.008,[0,.21+i*.061,.226],steel,speaker);
    for(const x of [-.145,.145])for(const y of [.205,.665])mesh(new THREE.SphereGeometry(.012,8,6),steel,[x,y,.226],speaker);
    cable([[0,.29,-.178],[0,.13,-.27],[0,.07,-.42],[0,.025,-.58]],.012,rubber,speaker);
    for(const x of [-.15,.15])for(const z of [-.13,.13])mesh(new THREE.CylinderGeometry(.019,.019,.012,6),steel,[x,.052,z],speaker);
  }
  const routing=new THREE.Group();routing.name="Roof / clipped conduit and junctions";stage.add(routing);
  box(.38,.12,.28,[-.95,4.37,-1.59],metal,routing);
  box(.33,.018,.23,[-.95,4.441,-1.59],steel,routing);
  cable([[-4.03,4.335,-1.09],[-4.03,4.34,-1.66],[-1.7,4.335,-1.79],[-.95,4.34,-1.73],[1.3,4.335,-1.77],[4.03,4.34,-1.67],[4.03,4.335,-1.09]],.022,rubber,routing);
  cable([[-1.3,4.35,-1.72],[-1.3,4.385,-1.55],[-1.12,4.385,-1.59]],.013,rubber,routing);
  for(const x of [-3.8,-2.4,-1.6,.3,1.5,2.6,3.7]){
    box(.09,.032,.12,[x,4.35,-1.75],steel,routing);
    for(const z of [-1.795,-1.705])mesh(new THREE.CylinderGeometry(.012,.012,.015,6),metal,[x,4.373,z],routing);
  }
  const aerial=new THREE.Group();aerial.name="Roof / radio aerial and service vent";stage.add(aerial);
  box(.23,.045,.23,[.55,4.332,-1.5],steel,aerial);
  mesh(new THREE.CylinderGeometry(.055,.09,.15,12),rubber,[.55,4.425,-1.5],aerial);
  for(let n=0;n<4;n++)mesh(new THREE.CylinderGeometry(.04,.04,.035,12),ceramic,[.55,4.53+n*.055,-1.5],aerial);
  cable([[.55,4.68,-1.5],[.55,5.02,-1.5],[.62,5.57,-1.51]],.008,steel,aerial);
  box(.54,.13,.45,[2.65,4.375,-1.4],metal,aerial);
  for(let i=0;i<7;i++)box(.43,.008,.018,[2.65,4.448,-1.57+i*.054],rubber,aerial);

  const accents=new THREE.Group();accents.name="Lighting / mint sill and awning accents";stage.add(accents);
  const luminous=(points:number[][])=>{cable(points,.013,neon,accents);const halo=cable(points,.039,glow,accents);halo.castShadow=false;halo.receiveShadow=false;};
  // The wooden billboard has no neon underline or halo.
  // Recessed sill strips, below the body: subtle turquoise underglow without
  // running light tubes across any window or the CRT's viewing corridor.
  for(const z of [-2.03,.45])luminous([[-3.7,.81,z],[-.2,.81,z],[3.7,.81,z]]);
  // Leave the close-up CRT corridor clear, as with the existing festoon bulbs.
  for(const [a,b] of [[-2.28,-1.42],[.53,3.98]]){
    luminous([[a,3.335,1.49],[b,3.335,1.49]]);
    for(let x=a+.06;x<b;x+=.62)box(.035,.025,.055,[x,3.36,1.49],steel,accents);
  }
  const wash=new THREE.PointLight(0x6ce8d6,0,4.6,2);wash.position.set(2.9,3.30,1.57);stage.add(wash);
  // Batching avoids a draw call for each grille bar, bolt and cable clip.
  batchRoomGeometry(stage,new THREE.Group(),16);
  const root=new THREE.Group();root.name="Roof / functional details and neon";root.add(...stage.children);scene.add(root);
  return {root,wash,update:(night:number)=>{neon.emissiveIntensity=.25+night*3.5;glow.opacity=.012+night*.13;wash.intensity=night*3.2;}};
}
