import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('./')&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes('/lib/'))return next(specifier+'.ts',context);return next(specifier,context);}});
const {createQuestBoard}=await import('./tram-quest-board.ts');
test('case board is physical cork, individual notes, pins, thread and a local photograph',async()=>{
  const previous=globalThis.document,words=[];
  globalThis.document={createElement:()=>({getContext:()=>new Proxy({fillText:text=>words.push(text)},{get:(target,key)=>target[key]??(()=>{})})})};
  const scene=new THREE.Scene(),materials=[],textures=[];let board;
  try{board=createQuestBoard(scene,materials,textures);}finally{globalThis.document=previous;}
  await board.ready;
  const named=name=>{const objects=[];board.root.traverse(o=>{if(o.name===`Case board / ${name}`)objects.push(o);});return objects;};
  assert.equal(named('printed clue').length,8);assert.equal(named('red pushpin').length,7);
  assert.equal(named('red connecting thread').length,7);assert.equal(named('thread loop on pin').length,14);
  assert.equal(named('marker annotation').length,2);assert.equal(named('grounded foot').length,2);
  assert.equal(named('overlapping document').length,3);
  assert.equal(named('clip wire handle').length,2);
  assert.equal(named('screwdriver slot').length,4);
  assert.ok(named('printed clue').slice(1).every(o=>{
    const p=o.geometry.attributes.position;let low=Infinity,high=-Infinity;
    for(let i=0;i<p.count;i++){low=Math.min(low,p.getZ(i));high=Math.max(high,p.getZ(i));}
    return high-low>.01;
  }),'documents have curled surfaces instead of rigid flat rectangles');
  const marker=named('red marker')[0],direction=new THREE.Vector3(0,1,0).applyQuaternion(marker.quaternion);
  assert.ok(direction.x>.99&&Math.abs(direction.y)<.05,'marker lies on the tray rather than hanging vertically');
  assert.ok(scene.getObjectByName('Case board / pinned field photograph'));
  for(const word of ['EXPERIENCE & EDUCATION','LYCEUM','TUM','CLAR AI','SCAILE','CHAPTER?'])assert.ok(words.includes(word));
  assert.equal(textures[1].image.width,2048);assert.equal(textures[0].image.width,512);
  assert.equal(named('textured cork')[0].material.bumpMap,textures[0]);
  const pins=named('red pushpin').map(o=>o.position);
  for(const thread of named('red connecting thread')){
    const curve=thread.geometry.parameters.path;
    for(const t of [0,1])assert.ok(pins.some(p=>p.distanceTo(curve.getPoint(t))<1e-5),'string ends at a physical pin');
  }
  let triangles=0;board.root.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
  assert.ok(triangles<18000,`${triangles} triangles`);
  const bounds=new THREE.Box3().setFromObject(board.root);assert.ok(bounds.min.y>=.119&&bounds.max.y<3.3);
  board.dispose();scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
});
test('typewriter and its hover popup are completely removed, existing resume reading remains',()=>{
  const ui=readFileSync(new URL('../components/PortfolioRoom.tsx',import.meta.url),'utf8');
  const controller=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  const world=readFileSync(new URL('./side-quest-world-model.ts',import.meta.url),'utf8');
  for(const source of [ui,controller,world])assert.doesNotMatch(source,/typewriter|Typewriter|Explore my journey/);
  assert.match(world,/label:"The case board"/);
  assert.match(ui,/initialSection=\{selection.section\}/);
  assert.match(world,/questBoard.ready/);assert.match(world,/questBoard.dispose\(\)/);
});
