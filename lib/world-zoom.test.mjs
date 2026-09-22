import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createWorldZoom,worldWheelZoom} from './world-zoom.ts';

test('wheel zoom is stronger, bounded and normalized across input devices',()=>{
  assert.ok(Math.abs(worldWheelZoom(100)-.085)<1e-12);
  assert.equal(worldWheelZoom(3,1),worldWheelZoom(48));
  assert.equal(worldWheelZoom(1,2),worldWheelZoom(100));
  assert.equal(worldWheelZoom(10,0,true),worldWheelZoom(100));
  assert.equal(worldWheelZoom(-100),-worldWheelZoom(100));
  assert.ok(Math.abs(worldWheelZoom(1e8)-.204)<1e-12);
  assert.equal(worldWheelZoom(NaN),0);
});
test('zoom eases monotonically without snapping or overshooting',()=>{
  const zoom=createWorldZoom(4,90);let distance=24;
  zoom.add(distance,-.26);
  const target=24*Math.exp(-.26);
  for(let i=0;i<60;i++){
    const next=zoom.step(distance,1/60);
    assert.ok(next>=target&&next<=distance);
    if(i===0)assert.ok(next>target&&next<24);
    distance=next;
  }
  assert.equal(distance,target);assert.equal(zoom.active,false);
});
test('zoom easing is time-based, consistent at 30, 60 and 120 fps',()=>{
  const values=[30,60,120].map(fps=>{
    const zoom=createWorldZoom(4,90);let d=24;zoom.add(d,.26);
    for(let i=0;i<fps/5;i++)d=zoom.step(d,1/fps);
    return d;
  });
  assert.ok(Math.max(...values)-Math.min(...values)<1e-10);
});
test('repeated input accumulates and reverse input can cancel pending movement',()=>{
  const zoom=createWorldZoom(4,90);
  zoom.add(24,-.1);zoom.add(24,-.1);
  assert.ok(Math.abs(zoom.step(24,0,true)-24*Math.exp(-.2))<1e-10);
  zoom.add(24,-.1);zoom.add(24,.1);
  assert.ok(Math.abs(zoom.step(24,1/60)-24)<1e-10);
  assert.equal(zoom.active,false);
});
test('limits, reduced motion and cancellation remain exact',()=>{
  const zoom=createWorldZoom(4,90);
  zoom.add(24,100);assert.equal(zoom.step(24,0,true),90);
  zoom.add(24,-100);assert.equal(zoom.step(24,0,true),4);
  zoom.add(24,.26);zoom.reset();assert.equal(zoom.step(24,1),24);
  assert.equal(zoom.active,false);
});
test('all zoom inputs share easing and camera flights cancel residual zoom',()=>{
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(source,/orbitControls.enableZoom=false/);
  assert.match(source,/queueZoom\(worldWheelZoom/);
  assert.match(source,/queueZoom\(Math.log\(pinchDistance\/distance\)\*1.35\)/);
  assert.match(source,/queueZoom\(direction\*\.26\)/);
  assert.match(source,/zoomMotion.active\|\|orbitHeld/);
  assert.match(source,/removeEventListener\("wheel",wheel\)/);
  const flight=source.slice(source.indexOf('function moveTo'),source.indexOf('const focus='));
  assert.match(flight,/zoomMotion.reset\(\)/);
});
