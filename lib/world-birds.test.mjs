import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {createSkyFlock} from './sky-flock.ts';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('./')&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes('/lib/'))return next(specifier+'.ts',context);return next(specifier,context);}});
const {createWorldBirds,gullBodyGeometry,gullWingGeometry}=await import('./world-birds.ts');

test('flocks cross the sky with bounded speed and turn acceleration; no visible teleporting',()=>{
  const flock=createSkyFlock(127),start=flock.birds.map(b=>b.position.clone());let minimumHeight=Infinity,maximumSpeed=0;
  for(let frame=0;frame<60*100;frame++){
    const previous=flock.birds.map(b=>b.position.clone());flock.advance(1/60);
    for(const [i,b] of flock.birds.entries()){
      assert.ok(b.position.toArray().every(Number.isFinite));minimumHeight=Math.min(minimumHeight,b.position.y);maximumSpeed=Math.max(maximumSpeed,b.velocity.length());
      if(Math.hypot(previous[i].x,previous[i].z)<115)assert.ok(previous[i].distanceTo(b.position)<.2,'no jump in the visible zone');
      assert.ok(b.acceleration.length()<2.601);assert.ok(Math.abs(b.bank)<=.42);
    }
    if(frame===600)assert.ok(flock.birds.every((b,i)=>b.position.distanceTo(start[i])>40),'actual onward travel rather than circling');
  }
  assert.ok(minimumHeight>14);assert.ok(maximumSpeed<9.5);
});
test('session seeds differ, and long hidden-tab gaps cannot explode the simulation',()=>{
  const a=createSkyFlock(1),b=createSkyFlock(2);assert.notDeepEqual(a.birds[0].position,b.birds[0].position);
  const p=a.birds[0].position.clone();a.advance(90);assert.ok(a.birds[0].position.distanceTo(p)<1);
  a.advance(NaN);assert.ok(a.birds.every(b=>b.position.toArray().every(Number.isFinite)));
});
test('shaped gulls use three instanced draws, independently phased wings and no shadows',()=>{
  for(const g of [gullBodyGeometry(),gullWingGeometry(1),gullWingGeometry(-1)]){assert.ok(g.attributes.position.count>30);assert.ok(g.attributes.position.array.every(Number.isFinite));g.dispose();}
  const scene=new THREE.Scene(),materials=[],birds=createWorldBirds(scene,materials,2);birds.update(.03,0);
  assert.equal(birds.root.children.length,3);assert.equal(birds.count,29);
  for(const mesh of birds.root.children){assert.ok(mesh.isInstancedMesh);assert.equal(mesh.castShadow,false);assert.equal(mesh.count,29);assert.ok(new Set(mesh.geometry.attributes.birdPhase.array).size>25);}
  birds.update(.03,0,true);assert.equal(birds.root.visible,false);
  birds.dispose();assert.equal(scene.children.length,0);materials.forEach(m=>m.dispose());
});
