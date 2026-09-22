import test from "node:test";
import assert from "node:assert/strict";
import { WaterInteraction,openWater,RIPPLE_IMPULSES } from "./water-interaction.ts";

test("water interactions reject the dock, nonfinite rays and distant horizon",()=>{
  for(const p of [{x:0,z:0},{x:6,z:3},{x:NaN,z:8},{x:Infinity,z:0},{x:64,z:3}])assert.equal(openWater(p),false);
  assert.equal(openWater({x:0,z:8}),true);assert.equal(openWater({x:8,z:0}),true);
  const input=new WaterInteraction();input.click({x:0,z:0});assert.equal(input.drain().length,0);
});
test("clicks emit one pressure pulse and consume it only once",()=>{
  const input=new WaterInteraction();input.click({x:9,z:2});
  const events=input.drain();assert.equal(events.length,1);assert.deepEqual(events[0],{x:9,z:2,radius:.7,strength:.11});
  assert.equal(input.drain().length,0);
});
test("motion emits a depression with shoulders and never floods the GPU queue",()=>{
  const input=new WaterInteraction();input.move({x:8,z:8},1);input.move({x:9,z:8},1.1);
  const events=input.drain();assert.ok(events.length<=RIPPLE_IMPULSES);
  assert.ok(events.some(e=>e.strength<0));assert.ok(events.some(e=>e.strength>0&&e.z>8));assert.ok(events.some(e=>e.strength>0&&e.z<8));
  for(let i=0;i<200;i++)input.move({x:8+i*.05,z:8},2+i*.01);
  assert.ok(input.drain().length<=RIPPLE_IMPULSES);
});
test("stationary hover, leaving, pointer jumps and hidden-tab gaps create no spurious wakes",()=>{
  const input=new WaterInteraction();input.move({x:8,z:8},1);input.move({x:8,z:8},1.1);assert.equal(input.drain().length,0);
  input.move({x:-8,z:8},1.2);assert.equal(input.drain().length,0);
  input.move({x:-7,z:8},5);assert.equal(input.drain().length,0);
  input.reset();input.move({x:8,z:8},5.1);assert.equal(input.drain().length,0);
});
