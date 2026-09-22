import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import * as THREE from "three";

// Resolve the app's bundler-style TypeScript imports for Node's geometry tests.
registerHooks({resolve(specifier,context,next){
  if(specifier.startsWith("./")&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes("/lib/"))return next(specifier+".ts",context);
  return next(specifier,context);
}});
const {buildPortfolioRoom}=await import("./portfolio-room-model.ts");
const {buildPortfolioRoom:buildCottageRoom}=await import("./cottage-room-model.ts");

for(const [name,build,budget] of [["legacy apartment",buildPortfolioRoom,900],["pixel cottage",buildCottageRoom,450]])
test(`${name} has finite geometry and an unobstructed CRT approach`,t=>{
  // These tests check scene construction and raycasts, not raster output.
  const previous=globalThis.document;
  globalThis.document={createElement:()=>({width:1,height:1,getContext:()=>new Proxy({
    createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
    measureText:t=>({width:t.length*32,actualBoundingBoxLeft:0,actualBoundingBoxRight:t.length*32,actualBoundingBoxAscent:64,actualBoundingBoxDescent:4}),
  },{get:(target,key)=>key in target?target[key]:()=>{}})})};
  let room;
  const scene=new THREE.Scene();
  try{room=build(scene);}finally{globalThis.document=previous;}
  scene.updateMatrixWorld(true);
  let meshes=0,vertices=0,batches=0;
  scene.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    meshes++;if(object.name.includes("static detail batch"))batches++;
    const p=object.geometry.attributes.position;
    vertices+=p.count;
    for(const value of p.array)assert.ok(Number.isFinite(value));
  });
  assert.ok(vertices>100000,"room should contain detailed geometry");
  assert.ok(batches>20,"static detail should be batched");
  assert.ok(meshes<budget,`too many separate meshes: ${meshes}`);
  t.diagnostic(`${name}: ${meshes} meshes, ${vertices} vertices, ${batches} static batches`);
  if(name==="pixel cottage"){
    assert.ok(vertices<700000,`cottage geometry budget exceeded: ${vertices}`);
    let lights=0,shadowLights=0;
    scene.traverse(o=>{if(o instanceof THREE.Light){lights++;if(o.castShadow)shadowLights++;}});
    assert.equal(lights,3);assert.equal(shadowLights,1);
    assert.ok(scene.getObjectsByProperty("name","Cottage / flower pot").length>=8);
  }
  const center=room.computer.screen.getWorldPosition(new THREE.Vector3());
  for(let step=0;step<=20;step++){
    const from=room.roomPosition.clone().lerp(center.clone().add(new THREE.Vector3(0,0,1.4)),step/20);
    const ray=new THREE.Raycaster(from,center.clone().sub(from).normalize());
    const hit=ray.intersectObjects(scene.children,true)[0];
    assert.equal(hit.object,room.computer.screen,`a new prop obstructs the monitor at step ${step}`);
  }
  scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});
  room.materials.forEach(m=>m.dispose());room.textures.forEach(t=>t.dispose());
});
