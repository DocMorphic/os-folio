import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {hologramDotPose,HOLOGRAM_CYCLE_SECONDS,burgerHologramParticles} from './burger-hologram.ts';
import {neonLetterGeometry} from './neon-letters.ts';

test('every burger dot falls, stays above the projector and returns exactly to its own home',()=>{
  const geometry=burgerHologramParticles(),p=geometry.attributes.position;
  for(let i=0;i<p.count;i+=11){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const settled=hologramDotPose(x,y,z,i,1.1);
    assert.ok(settled.y<y-.3,'recognizable drop, not a colour toggle');
    assert.deepEqual(hologramDotPose(x,y,z,i,HOLOGRAM_CYCLE_SECONDS),{x,y,z});
    for(let t=0;t<HOLOGRAM_CYCLE_SECONDS;t+=.02){
      const a=hologramDotPose(x,y,z,i,t),b=hologramDotPose(x,y,z,i,t+.001);
      assert.ok(a.y>=-1.291);assert.ok(Object.values(a).every(Number.isFinite));
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<.012,'no particle teleport');
    }
  }
  geometry.dispose();
});
test('neon glyph tubing has finite normals and a bounded triangle budget',()=>{
  const font=new FontLoader().parse(JSON.parse(readFileSync(new URL('../public/fonts/helvetiker_bold.typeface.json',import.meta.url))));
  const g=neonLetterGeometry(font,'Dharmay Dave',.69,.069);
  assert.ok(g.attributes.position.count>1000);assert.ok(g.index.count/3<30000);
  for(const value of g.attributes.normal.array)assert.ok(Number.isFinite(value));g.dispose();
});
test('idle computer is a DVD texture; only focused computer reveals the terminal',()=>{
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(source,/next==="terminal"\?screenMask:idleComputerMaterial/);
  assert.match(source,/if\(view!=="terminal"\)\{surface.style.visibility="hidden";return;\}/);
  assert.match(source,/drawTramDVD\(computer.ctx/);
});
test('entrance wind starts once on an uncovered frame, independent of exact elapsed time',()=>{
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(source,/travel.entrance&&!entranceHeld&&!travel.airStarted/);
  assert.doesNotMatch(source,/travel.elapsed===0/);
});
test('water lettering has dark/day and pale/night glass without neon outlines',()=>{
  const source=readFileSync(new URL('./water-lettering.ts',import.meta.url),'utf8');
  assert.doesNotMatch(source,/neonLetterGeometry|neonMaterials|Neon outline/);
  assert.match(source,/MeshPhysicalMaterial/);
  assert.match(source,/dayColor=new THREE.Color\(0x10171b\),nightColor=new THREE.Color\(0xf3f5f4\)/);
  assert.match(source,/face.color.copy\(dayColor\).lerp\(nightColor,night\)/);
});
test('old carriage ID is absent from every former visible label and prompt',()=>{
  for(const path of ['./side-quest-world-model.ts','./retro-computer.ts','./portfolio-room-model.ts','./tram-interior.ts','../components/ComputerTerminal.tsx']){
    assert.doesNotMatch(readFileSync(new URL(path,import.meta.url),'utf8'),/dd[-–—_ ]*0?1/i,path);
  }
});
test('arcade screen remains a pointer target while the projects side panel is open',()=>{
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(source,/view==="object"\?\(arcade\?"pointer":"default"\)/);
});
