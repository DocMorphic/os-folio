import * as THREE from "three";

// One palette per world lets all cups join the same static material batches.
const palettes=new WeakMap<THREE.Material[],{porcelain:THREE.MeshPhysicalMaterial;coffee:THREE.MeshPhysicalMaterial;crema:THREE.MeshStandardMaterial;steel:THREE.MeshStandardMaterial}>();

/** Hollow glazed porcelain, dark liquid meniscus, saucer and a resting spoon. */
export function buildCoffeeCup(parent:THREE.Object3D,materials:THREE.Material[],position:[number,number,number],scale=1){
  const root=new THREE.Group();root.name="Coffee / porcelain cup and saucer";root.position.set(...position);root.scale.setScalar(scale);parent.add(root);
  let palette=palettes.get(materials);
  if(!palette){
    palette={porcelain:new THREE.MeshPhysicalMaterial({color:0xf1e5cf,roughness:.2,clearcoat:1,clearcoatRoughness:.09}),
      coffee:new THREE.MeshPhysicalMaterial({color:0x24150e,roughness:.12,clearcoat:1}),
      crema:new THREE.MeshStandardMaterial({color:0xc39460,roughness:.5}),
      steel:new THREE.MeshStandardMaterial({color:0xb7c3c2,metalness:.92,roughness:.22})};
    materials.push(...Object.values(palette));palettes.set(materials,palette);
  }
  const {porcelain,coffee,crema,steel}=palette;
  const add=(g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;};
  const profile=[[.055,.015],[.062,.02],[.071,.035],[.086,.165],[.085,.193],[.077,.198],[.070,.185],[.059,.055],[.050,.04],[0,.04]].map(([x,y])=>new THREE.Vector2(x,y));
  add(new THREE.LatheGeometry(profile,40),porcelain);
  add(new THREE.LatheGeometry([[0,0],[.085,0],[.14,.012],[.15,.02],[.145,.029],[.09,.024],[.06,.012],[0,.012]].map(([x,y])=>new THREE.Vector2(x,y)),40),porcelain);
  add(new THREE.CylinderGeometry(.073,.073,.004,40),coffee,0,.178);
  const rim=add(new THREE.TorusGeometry(.071,.0025,5,40),crema,0,.181);rim.rotation.x=Math.PI/2;
  const handle=new THREE.CatmullRomCurve3([[.077,.17,0],[.143,.17,0],[.151,.12,0],[.12,.075,0],[.073,.082,0]].map(p=>new THREE.Vector3(...p)));
  add(new THREE.TubeGeometry(handle,20,.011,8,false),porcelain);
  const spoon=add(new THREE.SphereGeometry(.026,16,8),steel,-.105,.038,.07);spoon.scale.set(.56,.13,1);
  const stem=add(new THREE.CylinderGeometry(.003,.004,.13,8),steel,-.105,.037,-.014);stem.rotation.x=Math.PI/2;
  // Irregular crema flecks, confined to the coffee's surface.
  for(let i=0;i<9;i++){const a=i*2.399,r=.015+Math.sqrt(i/9)*.04;const fleck=add(new THREE.CircleGeometry(.002+i%3*.0008,7),crema,Math.cos(a)*r,.181,Math.sin(a)*r);fleck.rotation.x=-Math.PI/2;}
  return root;
}
