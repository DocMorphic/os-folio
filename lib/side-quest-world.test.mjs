import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import * as THREE from "three";
registerHooks({resolve(specifier,context,next){
  if(specifier.startsWith("./")&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes("/lib/"))return next(specifier+".ts",context);
  return next(specifier,context);
}});
const {buildSideQuestWorld,WORLD_STOPS}=await import("./side-quest-world-model.ts");

test("tram world has six real destinations, finite batched geometry and an exposed CRT",t=>{
  const previous=globalThis.document;
  globalThis.document={createElement:()=>({width:1,height:1,getContext:()=>new Proxy({
    createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
    measureText:s=>({width:s.length*32,actualBoundingBoxLeft:0,actualBoundingBoxRight:s.length*32,actualBoundingBoxAscent:64,actualBoundingBoxDescent:4}),
  },{get:(target,key)=>key in target?target[key]:()=>{}})})};
  const scene=new THREE.Scene();let world;
  try{world=buildSideQuestWorld(scene);}finally{globalThis.document=previous;}
  scene.updateMatrixWorld(true);
  let meshes=0,triangles=0,lights=0,shadowLights=0;
  scene.traverse(o=>{
    if(o instanceof THREE.Mesh){meshes++;const g=o.geometry;triangles+=(g.index?.count??g.attributes.position.count)/3*(o instanceof THREE.InstancedMesh?o.count:1);for(const value of g.attributes.position.array)assert.ok(Number.isFinite(value));}
    if(o instanceof THREE.Light){lights++;if(o.castShadow)shadowLights++;}
  });
  t.diagnostic(`${meshes} meshes / ${triangles} triangles / ${lights} lights`);
  // Includes the larger lit cabinet, three instanced container shapes, and market display.
  assert.ok(meshes<300,`draw-call budget: ${meshes}`);assert.ok(triangles<400000,`triangle budget: ${triangles}`);
  assert.equal(lights,3);assert.equal(shadowLights,1);
  // Both drawbars must bridge the rounded chassis edge, not leave the coupling
  // head suspended below it. Check the final baked geometry at each connection.
  for(const side of [-1,1])for(const x of [4.2,4.32,4.43]){
    const ray=new THREE.Raycaster(new THREE.Vector3(side*x,.615,-.85),new THREE.Vector3(0,-1,0),0,.04);
    assert.ok(ray.intersectObjects(scene.children,true).length,`coupler ${side} has a continuous supported drawbar at ${x}`);
  }
  const {keyboardBounds:keys,keyboardSupport:tray}=world;
  assert.ok(Math.abs(keys.min.y-tray.max.y)<.001,"keyboard rests directly on its tray");
  assert.ok(keys.min.x>=tray.min.x&&keys.max.x<=tray.max.x&&keys.min.z>=tray.min.z&&keys.max.z<=tray.max.z,"tray supports the entire keyboard footprint");
  assert.ok(scene.getObjectByName("Tram interior / fitted galley"));
  assert.ok(scene.getObjectByName("Blogs / journal vending machine"));
  assert.ok(scene.getObjectByName("Journey / investigation board"));
  assert.equal(scene.getObjectByName("Journey / interactive typewriter"),undefined);
  assert.equal(scene.getObjectByName("Journey / station totem"),undefined);
  assert.equal(scene.getObjectByName("Journey / travellers luggage"),undefined);
  assert.equal(scene.getObjectByName("Journey / brass lifeline"),undefined);
  assert.equal(scene.getObjectByName("Journey / departures"),undefined,'old rectangular board is gone');
  assert.equal(scene.getObjectByName("Journal / writing"),undefined,"the small book is replaced by the vending machine");
  assert.ok(scene.getObjectByName("Front corner / SAD-ist television"));
  assert.ok(world.tvScreen.getWorldPosition(new THREE.Vector3()).y>4.8,"TV is mounted at the front roof corner");
  assert.ok(world.tvScreen.getWorldPosition(new THREE.Vector3()).z>.25,"TV stays on the serving-counter side");
  const tvNormal=new THREE.Vector3(0,0,1).transformDirection(world.tvScreen.matrixWorld);
  assert.ok(tvNormal.z>.95&&tvNormal.x<-.1&&tvNormal.x>-.25,"TV faces the opposite side at the same shallow angle");
  assert.ok(world.tvScreen.getWorldPosition(new THREE.Vector3()).x< -3,"TV occupies the left roof end, clear of the burger projector");
  assert.ok(world.tvScreen.parent,"TV screen survives static batching for exact HTML projection");
  assert.ok(world.landmarks.find(l=>l.id==="blogs").hit.position.x< -5&&world.landmarks.find(l=>l.id==="blogs").hit.position.z<0,"vending kiosk is beside the carriage, clear of the journey board");
  assert.equal(world.tramWindows.windows.length,13);
  assert.deepEqual(world.landmarks.map(l=>l.id),WORLD_STOPS.map(s=>s.id));
  for(const stop of world.landmarks){
    assert.equal(stop.hit.parent,null,"hit proxies must not obscure the real CRT");
    const ray=new THREE.Raycaster(stop.camera,stop.hit.position.clone().sub(stop.camera).normalize());
    assert.ok(ray.intersectObject(stop.hit).length,`${stop.id} is reachable`);
    assert.ok(stop.camera.y>0,"no underground destination cameras");
  }
  assert.ok(scene.getObjectByName("Keepsake / city bicycle"));
  assert.ok(scene.getObjectByName("Back platform / waiting for the next adventure"));
  const flap=scene.getObjectByName("Mailbox / hinged brass letter flap"),flag=scene.getObjectByName("Mailbox / collection flag");
  assert.ok(flap.children.length&&flag.children.length,"moving hardware must survive static batching");
  scene.traverse(o=>{o.matrixAutoUpdate=false;});scene.matrixWorldAutoUpdate=false;
  const window=world.tramWindows.windows[0],closedWindow=window.sash.matrixWorld.clone(),opening=window.hit.matrixWorld.clone();
  world.tramWindows.toggle(0);
  for(let i=0;i<90;i++)world.tramWindows.update(1/60);
  assert.ok(window.sash.rotation.x*window.outward<-1,"open pane swings outward around its upper hinge");
  assert.equal(window.sash.position.y,window.height/2,"the hinge stays at the top of the frame");
  for(let index=0;index<world.tramWindows.windows.length;index++){
    const w=world.tramWindows.windows[index];w.open=true;world.tramWindows.update(0,true);
    const lowerEdge=new THREE.Vector3(0,-w.height,0).applyEuler(w.sash.rotation);
    assert.ok(lowerEdge.z*w.outward>1,"every face opens away from the tram, not into it");
    if(index!==0){w.open=false;world.tramWindows.update(0,true);}
  }
  assert.ok(!closedWindow.equals(window.sash.matrixWorld),"window updates under frozen static matrices");
  assert.ok(opening.equals(window.hit.matrixWorld),"the empty opening remains clickable");
  assert.equal(world.tramWindows.windows[1].amount,0,"windows open independently");
  world.tramWindows.toggle(0);world.tramWindows.update(0,true);
  assert.equal(Math.abs(window.sash.rotation.x),0,"reduced motion closes immediately");
  const closed=flap.matrixWorld.clone();
  for(let i=1;i<=60;i++)world.animateMailbox(i/60,true);
  assert.ok(!closed.equals(flap.matrixWorld),"hinge animates even with the static scene frozen");
  assert.ok(flap.rotation.x<-.9&&Math.abs(flag.rotation.z)<.03);
  for(let i=61;i<=120;i++)world.animateMailbox(i/60,false);
  assert.ok(Math.abs(flap.rotation.x)<.03&&flag.rotation.z>.9);
  const screen=world.computer.screen,center=screen.getWorldPosition(new THREE.Vector3());
  // A clear final approach is essential; the awning can naturally occlude it at high orbit angles.
  for(const distance of [.8,1.2,2,3]){
    const from=center.clone().add(new THREE.Vector3(0,0,distance));
    const ray=new THREE.Raycaster(from,center.clone().sub(from).normalize());
    assert.equal(ray.intersectObjects(scene.children,true)[0]?.object,screen,`CRT blocked at ${distance}`);
  }
  scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});world.materials.forEach(m=>m.dispose());world.textures.forEach(tex=>tex.dispose());
  world.landmarks.forEach(l=>{l.hit.geometry.dispose();l.hit.material.dispose();});
  world.tramWindows.dispose();
});
