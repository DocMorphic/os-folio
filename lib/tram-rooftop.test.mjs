import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('./')&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes('/lib/'))return next(specifier+'.ts',context);return next(specifier,context);}});
const {createTramRooftop}=await import('./tram-rooftop.ts');
const {waterLetterGeometry,WATER_INTRO}=await import('./water-lettering.ts');

test('roof hardware is batched, supported and clear of the CRT viewing corridor',()=>{
  const scene=new THREE.Scene(),materials=[],roof=createTramRooftop(scene,materials);
  scene.updateMatrixWorld(true);
  let meshes=0,triangles=0;
  scene.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));}});
  assert.ok(meshes<=18,`${meshes} draws`);assert.ok(triangles<25000,`${triangles} triangles`);
  assert.ok(scene.getObjectByName('Roof / bracket-mounted left speaker'));
  assert.ok(scene.getObjectByName('Roof / bracket-mounted right speaker'));
  for(const [x,z] of [[-4.02,-.52],[1.7,-1.32]])assert.ok(new THREE.Raycaster(new THREE.Vector3(x,4.4,z),new THREE.Vector3(0,-1,0),0,.1).intersectObjects(scene.children,true).length,'base plate meets roof');
  for(let x=-1.3;x<.46;x+=.1)for(let y=2.9;y<3.5;y+=.1){
    assert.equal(new THREE.Raycaster(new THREE.Vector3(x,y,2),new THREE.Vector3(0,0,-1),0,1).intersectObjects(scene.children,true).length,0,'neon must not block terminal screen');
  }
  roof.update(0);assert.equal(roof.wash.intensity,0);
  roof.update(1);assert.equal(roof.wash.intensity,3.2);assert.equal(roof.wash.castShadow,false);
  scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());
});
test('floating introduction has real bevelled letters with upward faces and bounded geometry',()=>{
  const loader=new FontLoader(),bold=loader.parse(JSON.parse(readFileSync(new URL('../public/fonts/helvetiker_bold.typeface.json',import.meta.url)))),regular=loader.parse(JSON.parse(readFileSync(new URL('../public/fonts/helvetiker_regular.typeface.json',import.meta.url))));
  let triangles=0;
  for(const [i,text] of WATER_INTRO.entries()){
    const g=waterLetterGeometry(text,i?regular:bold,i===0);g.computeBoundingBox();
    assert.ok(g.boundingBox.min.y>=-.006);assert.ok(g.boundingBox.max.y>.02);
    assert.ok(Math.abs(g.boundingBox.min.x+g.boundingBox.max.x)<1e-5,'each row is centered');
    for(const n of g.attributes.position.array)assert.ok(Number.isFinite(n));
    triangles+=g.attributes.position.count/3;g.dispose();
  }
  assert.ok(triangles<20000,`${triangles} text triangles`);
});
