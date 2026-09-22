import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {registerHooks} from "node:module";
registerHooks({resolve(specifier,context,next){
  if(specifier.startsWith("./")&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes("/lib/"))return next(specifier+".ts",context);
  return next(specifier,context);
}});
const {butterflyPose,createTramLife,BUTTERFLY_SPECIES}=await import("./tram-life.ts");
import { createTramGarden,flowerGeometry } from "./tram-garden.ts";

test("butterflies have continuous flights, individual phases and real pauses",()=>{
  for(let i=0;i<4;i++)for(let t=0;t<100;t+=.13){
    const c=butterflyPose(t,i),d=butterflyPose(t+.016,i);
    for(const n of Object.values(c).filter(n=>typeof n==="number"))assert.ok(Number.isFinite(n));
    assert.ok(c.y>.5);
    assert.ok(Math.hypot(c.x-d.x,c.y-d.y,c.z-d.z)<.05);
  }
  for(let i=0;i<4;i++)assert.ok(Array.from({length:100},(_,t)=>butterflyPose(t,i)).some(p=>p.perched));
  assert.ok(new Set(BUTTERFLY_SPECIES).size===4);
  assert.ok(new Set([0,1,2,3].map(i=>butterflyPose(12,i).flap.toFixed(3))).size===4);
});
test("garden uses three instanced draws with detailed bounded flower geometry",()=>{
  const scene=new THREE.Scene(),materials=[],garden=createTramGarden(scene,materials);
  assert.equal(garden.flowers.length,3);assert.equal(garden.flowers.reduce((n,m)=>n+m.count,0),84);
  for(let kind=0;kind<3;kind++){
    const g=flowerGeometry(kind);assert.ok(g.attributes.position.count>500);assert.ok(g.attributes.position.count<5000);
    for(const n of g.attributes.position.array)assert.ok(Number.isFinite(n));g.dispose();
  }
  garden.update(123);garden.flowers.forEach(f=>f.geometry.dispose());materials.forEach(m=>m.dispose());
});
test("dynamic world objects update world matrices and stay within a bounded render budget",()=>{
  const scene=new THREE.Scene(),materials=[],life=createTramLife(scene,materials);
  const hologram=scene.getObjectByName("Roof / rotating burger hologram"),dots=hologram.children.find(o=>o instanceof THREE.Points);
  assert.equal(dots.geometry.attributes.position.count,2032,"each burger ingredient receives a bounded dot budget");
  assert.equal(new Set(dots.geometry.attributes.ingredient.array).size,7,"bun, base, patty, lettuce, tomato, cheese and sesame remain distinct");
  assert.ok(hologram.children.every(o=>o instanceof THREE.Points),"no solid shell or connected lines in the hologram");
  assert.equal(dots.material.blending,THREE.AdditiveBlending,"light adds to its background instead of opaque confetti dots");
  assert.match(dots.material.vertexShader,/float scan=/,"projection scan advances through the volume");
  const beam=scene.getObjectByName("Hologram / light from the circular emitter"),lens=scene.getObjectByName("Hologram / luminous projector lens");
  assert.ok(beam&&lens,"the dot burger has a visible optical source");
  assert.equal(beam.material.blending,THREE.AdditiveBlending);
  assert.ok(Math.abs(beam.position.y-.325*beam.scale.y-lens.position.y)<.005,"projection begins on the lens, not floating above it");
  dots.geometry.computeBoundingBox();assert.ok(dots.geometry.boundingBox.max.x-dots.geometry.boundingBox.min.x>2.5,"hologram is more than twice the old width");
  scene.matrixWorldAutoUpdate=false;life.update(0);
  const steam=scene.getObjectByName("Kitchen / soft rising steam");
  assert.equal(steam.geometry.attributes.position.count,32);
  assert.equal(steam.material.depthWrite,false);
  life.setSteamViewport(700);life.update(1,1);
  assert.equal(steam.material.uniforms.viewportHeight.value,700);
  assert.equal(steam.material.uniforms.night.value,1);
  assert.equal(scene.getObjectByName("Bird / gull 1"),undefined);
  const butterfly=scene.getObjectByName("Butterfly / Monarch"),before=butterfly.matrixWorld.clone();life.update(5);assert.ok(!before.equals(butterfly.matrixWorld));
  assert.equal(dots.material.uniforms.time.value,5,"independent particle drift advances with animation time");
  const homes=Float32Array.from(dots.geometry.attributes.position.array);
  assert.equal(life.cycleHologram(),true);assert.equal(life.cycleHologram(),false,'cannot stack collapse cycles');
  life.update(6.1);assert.equal(life.hologramActive,true);assert.notDeepEqual(dots.geometry.attributes.position.array,homes);
  life.update(7.8);assert.equal(life.hologramActive,false);assert.deepEqual(dots.geometry.attributes.position.array,homes);
  let calls=0,triangles=0;
  scene.traverse(o=>{if(o instanceof THREE.Mesh){calls++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}if(o instanceof THREE.Mesh||o instanceof THREE.Points)for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));});
  assert.ok(calls<35,`${calls} dynamic draws`);assert.ok(triangles<18000,`${triangles} dynamic triangles`);
  scene.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});life.dispose();materials.forEach(m=>m.dispose());
});
