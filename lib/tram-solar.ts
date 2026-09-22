import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/** Twin glazed modules carried by substantial adjustable pedestals. */
export function createTramSolar(scene:THREE.Scene,materials:THREE.Material[]){
  const steel=new THREE.MeshStandardMaterial({color:0x99b8bb,metalness:.75,roughness:.31});
  const frame=new THREE.MeshStandardMaterial({color:0xc3ced0,metalness:.86,roughness:.22});
  const dark=new THREE.MeshStandardMaterial({color:0x253c45,metalness:.25,roughness:.6});
  const cell=new THREE.MeshPhysicalMaterial({color:0x174e98,metalness:.5,roughness:.21,clearcoat:1,clearcoatRoughness:.07});
  materials.push(steel,frame,dark,cell);
  const mesh=(parent:THREE.Object3D,name:string,g:THREE.BufferGeometry,m:THREE.Material,p:number[])=>{const o=new THREE.Mesh(g,m);o.name=name;o.position.set(...p as [number,number,number]);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
  const box=(parent:THREE.Object3D,name:string,size:number[],p:number[],m:THREE.Material)=>mesh(parent,name,new RoundedBoxGeometry(size[0],size[1],size[2],1,Math.min(.008,...size.map(v=>v/3))),m,p);
  const rod=(name:string,a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material)=>{
    const o=mesh(scene,name,new THREE.CylinderGeometry(r,r,a.distanceTo(b),12),m,a.clone().add(b).multiplyScalar(.5).toArray());
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return o;
  };
  const root=new THREE.Group();root.name='Roof / solar panel';root.position.set(-2.55,7.16,-.99);root.rotation.x=-.48;scene.add(root);
  for(const x of [-.69,.69]){
    const panel=new THREE.Group();panel.name='Solar / framed photovoltaic module';panel.position.x=x;root.add(panel);
    box(panel,'Solar / aluminium frame',[1.23,.075,1.92],[0,0,0],frame);
    box(panel,'Solar / sealed backing',[1.15,.045,1.84],[0,-.042,0],dark);
    for(let row=0;row<4;row++)for(let column=0;column<3;column++){
      const px=(column-1)*.366,pz=(row-1.5)*.444;
      box(panel,'Solar / blue silicon cell',[.351,.012,.424],[px,.049,pz],cell);
      for(const offset of [-.085,0,.085])box(panel,'Solar / silver busbar',[.003,.002,.402],[px+offset,.056,pz],frame);
    }
    box(panel,'Solar / rear junction box',[.20,.09,.18],[.26,-.10,.52],dark);
  }
  root.updateMatrixWorld(true);
  for(const x of [-.69,.69]){
    const center=root.localToWorld(new THREE.Vector3(x,-.10,0));
    const pivot=new THREE.Vector3(center.x,6.75,center.z);
    mesh(scene,'Solar / octagonal pedestal foot',new THREE.CylinderGeometry(.18,.30,.19,8),steel,[pivot.x,4.38,pivot.z]);
    mesh(scene,'Solar / pedestal base collar',new THREE.CylinderGeometry(.15,.18,.13,12),frame,[pivot.x,4.52,pivot.z]);
    rod('Solar / substantial support mast',new THREE.Vector3(pivot.x,4.52,pivot.z),pivot,.105,steel);
    for(const y of [4.64,6.50])mesh(scene,'Solar / locking collar',new THREE.CylinderGeometry(.137,.137,.09,12),frame,[pivot.x,y,pivot.z]);
    const hinge=mesh(scene,'Solar / adjustable hinge',new THREE.CylinderGeometry(.15,.15,.26,16),dark,pivot.toArray());hinge.rotation.z=Math.PI/2;
    for(const z of [-.68,.68]){
      const end=root.localToWorld(new THREE.Vector3(x,-.075,z));
      rod('Solar / tilt support arm',pivot,end,.055,steel);
    }
    for(const dx of [-.18,.18])mesh(scene,'Solar / anchor bolt',new THREE.CylinderGeometry(.025,.025,.03,6),dark,[pivot.x+dx,4.30,pivot.z]);
    const outlet=root.localToWorld(new THREE.Vector3(x+.26,-.13,.52));
    const route=new THREE.CatmullRomCurve3([outlet,new THREE.Vector3(pivot.x+.32,6.4,pivot.z+.3),new THREE.Vector3(pivot.x+.13,6.21,pivot.z),new THREE.Vector3(pivot.x+.12,4.57,pivot.z),new THREE.Vector3(-1.3,4.34,-1.72)]);
    mesh(scene,'Solar / flexible service cable',new THREE.TubeGeometry(route,28,.023,7,false),dark,[0,0,0]);
  }
  box(scene,'Solar / roof cable gland',[.14,.075,.12],[-1.3,4.35,-1.72],dark);
  return root;
}
