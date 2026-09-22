import test from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
import * as THREE from "three";
registerHooks({resolve(specifier,context,next){if(specifier.startsWith("./")&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes("/lib/"))return next(specifier+".ts",context);return next(specifier,context);}});
const {fishBallistic,fishLanding,fishSize,fishNoseEntry,createWorldFish,FISH_SPECIES,WATER_HEIGHT}=await import("./world-fish.ts");
test("landing splash follows nose contact, and particles adapt to night",()=>{
  const lift=5.9,speed=2.3;
  for(const size of [.5,1,1.7]){
    const t=fishNoseEntry(lift,speed,size),p=fishBallistic(t,lift,speed);
    assert.ok(t>p.duration/2&&t<p.duration);
    assert.ok(Math.abs(p.height+.6*size*p.verticalVelocity/Math.hypot(speed,p.verticalVelocity))<.00001);
  }
  const scene=new THREE.Scene(),materials=[],f=createWorldFish(scene,materials,()=>{});
  f.jump({x:10,z:4},1);f.update(1,1);
  const fish=scene.getObjectByName(`Fish / ${FISH_SPECIES[0]}`);
  assert.ok(fish.position.y+.7*fish.scale.x<WATER_HEIGHT,"starts fully submerged, not halfway out");
  const shaders=materials.filter(m=>m.isShaderMaterial);
  assert.ok(shaders.length>=7);
  for(const m of shaders)assert.equal(m.uniforms.night.value,1);
  f.update(1.5,0);for(const m of shaders)assert.equal(m.uniforms.night.value,0);
  f.dispose();materials.forEach(m=>m.dispose());
});
test("fish have clearly separated sizes and vary between appearances without resizing mid-jump",()=>{
  for(let n=0;n<30;n++){
    assert.ok(fishSize(1,n)>fishSize(0,n)*1.5);
    assert.ok(fishSize(2,n)>fishSize(0,n)*2.4);
    assert.ok(fishSize(0,n)>=.48&&fishSize(2,n)<1.72);
  }
  const scene=new THREE.Scene(),materials=[],f=createWorldFish(scene,materials,()=>{});
  const scales=[];
  for(let i=0;i<6;i++){
    const t=1+i*3;assert.equal(f.jump({x:10,z:4},t),true);f.update(t+.25);
    const fish=scene.getObjectByName(`Fish / ${FISH_SPECIES[i%3]}`),size=fish.scale.x;
    assert.equal(fish.scale.y,size);assert.equal(fish.scale.z,size);
    f.update(t+.75);assert.equal(fish.scale.x,size);scales.push(size);f.update(t+2);
  }
  assert.notEqual(scales[0],scales[3]);
  assert.ok(scales[2]>scales[0]*2.4);
  f.dispose();materials.forEach(m=>m.dispose());
});
test("fish use ballistic flight with continuous velocity and a predicted water entry",()=>{
  const lift=5.9,speed=2.3,T=2*lift/9.81;
  assert.equal(fishBallistic(0,lift,speed).height,0);
  assert.ok(Math.abs(fishBallistic(T,lift,speed).height)<1e-10);
  assert.ok(Math.abs(fishBallistic(T/2,lift,speed).verticalVelocity)<1e-10);
  assert.ok(fishBallistic(T/2,lift,speed).height>1.7);
  assert.deepEqual(fishLanding({x:9,z:0},0,lift,speed),{x:9+T*speed,z:0});
});
test("fish click pool rejects dock and spam, keeps fins attached, splashes once on each entry",()=>{
  const scene=new THREE.Scene(),materials=[],events=[],f=createWorldFish(scene,materials,(p,strength)=>events.push({p,strength}));
  assert.equal(f.jump({x:0,z:0},1),false);
  assert.equal(f.jump({x:6.6,z:4.4},1),false,"expanded platform is protected");
  assert.equal(f.jump({x:10,z:4},1),true);assert.equal(f.jump({x:10,z:4},1.05),false);
  f.update(1.5);assert.equal(f.active,true);const fish=scene.getObjectByName(`Fish / ${FISH_SPECIES[0]}`);assert.ok(fish.visible);assert.ok(fish.position.y>WATER_HEIGHT);
  assert.equal(fish.children[1].parent,fish,"tail is attached to the same moving body");
  const body=fish.children[0].geometry,n=24*25;
  assert.ok(body.attributes.normal.getY(n)>.8,"body normals face outward for correct lighting");
  f.update(2.4);f.update(3);assert.equal(events.length,2);assert.ok(events[1].strength>events[0].strength,"landing displaces more water than takeoff");
  f.update(3.1);assert.equal(events.length,2);f.update(5);assert.equal(f.active,false);
  for(let i=0;i<3;i++){assert.equal(f.jump({x:10,z:4},6+i*3),true);f.update(6.4+i*3);f.update(8.5+i*3);}
  scene.traverse(o=>{if(o.geometry)for(const v of o.geometry.attributes.position.array)assert.ok(Number.isFinite(v));});
  f.dispose();materials.forEach(m=>m.dispose());
});
