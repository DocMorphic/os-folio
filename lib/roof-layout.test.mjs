import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('./')&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes('/lib/'))return next(specifier+'.ts',context);return next(specifier,context);}});
const {buildWorldProps}=await import('./world-props.ts');
import {HOLOGRAM_PLACEMENT,hologramImpactEvents,hologramLandingTime} from './hologram-timing.mjs';
import {hologramDotPose,burgerHologramParticles} from './burger-hologram.ts';

test('twin tilted solar modules have substantial hinged posts; corner TV remains fully supported',()=>{
  const previous=globalThis.document;
  globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
  const scene=new THREE.Scene(),materials=[],textures=[];let props;
  try{props=buildWorldProps(scene,materials,textures);}finally{globalThis.document=previous;}
  scene.updateMatrixWorld(true);
  const solar=scene.getObjectByName('Roof / solar panel'),tv=scene.getObjectByName('Front corner / SAD-ist television');
  assert.deepEqual(tv.position.toArray(),[-3.35,3.4,-.15],'same front-left corner, inset enough to support both sides');
  assert.equal(tv.rotation.y,-.18);
  const screenDirection=new THREE.Vector3(0,0,1).transformDirection(props.tvScreen.matrixWorld);
  const hitDirection=new THREE.Vector3(0,0,1).transformDirection(props.tvHit.matrixWorld);
  assert.ok(screenDirection.distanceTo(hitDirection)<1e-6);
  const panels=new THREE.Box3().setFromObject(solar);assert.ok(panels.min.y>6.6,'entire module is above billboard, burger and aerials');
  assert.equal(solar.children.filter(o=>o.name==='Solar / framed photovoltaic module').length,2);
  assert.ok(solar.rotation.x<-.4,'panels face the opposite direction while keeping their upward tilt');
  const panelNormal=new THREE.Vector3(0,1,0).transformDirection(solar.matrixWorld);
  assert.ok(panelNormal.y>.8&&panelNormal.z<-.4,'cell faces still point upward, now toward the back');
  assert.equal(panels.intersectsBox(new THREE.Box3().setFromObject(tv)),false,'raised panel clears angled TV, including antennas');
  const poles=scene.children.filter(o=>o.name==='Solar / substantial support mast');assert.equal(poles.length,2);
  for(const pole of poles){const b=new THREE.Box3().setFromObject(pole);assert.ok(b.min.y<4.54&&b.max.y>=6.74);assert.ok(b.max.x-b.min.x>.2);}
  assert.equal(scene.children.filter(o=>o.name==='Solar / adjustable hinge').length,2);
  assert.equal(scene.children.filter(o=>o.name==='Solar / tilt support arm').length,4);
  for(const foot of scene.children.filter(o=>o.name==='Solar / octagonal pedestal foot'))assert.ok(new THREE.Box3().setFromObject(foot).min.y<4.30);
  const shoes=tv.children.filter(o=>o.name==='TV / bolted roof shoe');assert.equal(shoes.length,2);
  for(const shoe of shoes){
    const b=new THREE.Box3().setFromObject(shoe);
    assert.ok(b.min.x> -4.25&&b.max.x<4.25&&b.min.z> -1.9&&b.max.z<.35,'both shoes remain inside the flat roof');
    assert.ok(Math.abs(b.min.y-4.29)<.005,'shoe rests on the roof');
  }
  const cradle=new THREE.Box3().setFromObject(tv.getObjectByName('TV / continuous cabinet cradle'));
  assert.ok(cradle.max.y>=4.455,'cradle contacts cabinet underside');
  for(const pedestal of tv.children.filter(o=>o.name==='TV / solid pedestal')){
    const b=new THREE.Box3().setFromObject(pedestal);
    assert.ok(b.min.y<=4.35&&b.max.y>=cradle.min.y,'unbroken support from roof shoe to cradle');
  }
  scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());props.tvHit.geometry.dispose();
});

test('hologram contacts share the visual gravity and reach the projector at the sound onset',()=>{
  const geometry=burgerHologramParticles(),points=geometry.getAttribute('position');
  assert.equal(hologramImpactEvents.length,18);
  for(const event of hologramImpactEvents){
    assert.ok(Math.abs(event.height-points.getY(event.index))<1e-6,'audio follows an actual dot, including lettuce ripples');
    assert.equal(event.at,hologramLandingTime(event.height,event.index));
    const landed=hologramDotPose(0,event.height,0,event.index,event.at);
    assert.ok(Math.abs(landed.y+1.29)<1e-6);
    assert.ok(hologramDotPose(0,event.height,0,event.index,event.at-.005).y>landed.y);
  }
  assert.ok(Math.abs(HOLOGRAM_PLACEMENT.y-1.29*HOLOGRAM_PLACEMENT.scale-4.47)<.005,'dots settle at the lens');
  geometry.dispose();
});
