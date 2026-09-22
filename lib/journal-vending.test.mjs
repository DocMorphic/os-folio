import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('./')&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes('/lib/'))return next(specifier+'.ts',context);return next(specifier,context);}});
const {buildWorldProps,VENDING_YAW}=await import('./world-props.ts');

function withProps(check){
  const original=globalThis.document;globalThis.document={createElement:()=>({getContext:()=>new Proxy({},{get:()=>()=>{}})})};
  const scene=new THREE.Scene(),materials=[],textures=[];
  try{const props=buildWorldProps(scene,materials,textures);scene.updateMatrixWorld(true);check(props,scene);}
  finally{globalThis.document=original;scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
}
test('vending is a visible in-world screen without bottle geometry or shelves',()=>withProps(({vendingScreen},scene)=>{
  assert.equal(vendingScreen.userData.dynamic,true);assert.equal(vendingScreen.visible,true);
  assert.equal(vendingScreen.geometry.parameters.width,.9);assert.equal(vendingScreen.geometry.parameters.height,1.26);
  assert.equal(vendingScreen.parent.scale.x,1.22);
  assert.equal(scene.getObjectByName("Blogs / stocked bottles"),undefined);
  const center=vendingScreen.getWorldPosition(new THREE.Vector3()),normal=new THREE.Vector3(0,0,1).transformDirection(vendingScreen.matrixWorld);
  assert.ok(Math.abs(normal.x-Math.sin(VENDING_YAW))<1e-6);
  assert.ok(normal.x<-.999,'screen faces fully outward at the platform end');
  assert.ok(Math.abs(normal.z)<1e-6,'screen no longer faces the board in front');
  const ray=new THREE.Raycaster(center.clone().addScaledVector(normal,2),normal.clone().negate());
  assert.equal(ray.intersectObjects(scene.children,true)[0].object,vendingScreen);
}));
test('rear rooftop ticker faces the back and leaves the front sign exposed',()=>withProps(({tickerScreen})=>{
  const center=tickerScreen.getWorldPosition(new THREE.Vector3()),normal=new THREE.Vector3(0,0,1).transformDirection(tickerScreen.matrixWorld);
  assert.ok(center.z<-2);assert.ok(normal.z<-.99);assert.ok(center.y>4.3);
  assert.equal(tickerScreen.geometry.parameters.height,1.276);
}));
test('solar module and travel kit have mounted, finite geometry',()=>withProps((_,scene)=>{
  assert.ok(scene.getObjectByName("Roof / solar panel"));
  assert.ok(scene.getObjectByName("Bench / travel kit"));
  assert.ok(scene.getObjectByName("Bench / analogue camera"));
  assert.ok(scene.getObjectByName("Bench / folded trail map"));
  scene.traverse(o=>{if(o.isMesh)for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n));});
}));
test('chocolates use real blogs, accessible cards and an explicit read link',()=>{
  const ui=readFileSync(new URL('../components/JournalVending.tsx',import.meta.url),'utf8');
  assert.match(ui,/fetch\("\/api\/blogs"/);assert.doesNotMatch(ui,/onDispense|onStock|bottleHit|ComputerTerminal/);
  assert.match(ui,/Choose chocolate:/);assert.match(ui,/rel="noopener noreferrer"/);
  assert.match(ui,/entries.slice\(page\*8,page\*8\+8\)/);
  assert.match(ui,/setSelected\(entry\)/);
});
test('screen is depth masked in overview and remains inside its cabinet',()=>{
  const room=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(room,/vendingScreen.material=screenMask/);
  assert.match(room,/moveTo\("vending"/);
  assert.match(room,/screenQuadMatrix\(quad,logicalWidth,logicalHeight\)/);
});
