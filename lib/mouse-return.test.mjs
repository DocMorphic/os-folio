import assert from "node:assert/strict";
import { test } from "node:test";
import { MouseReturn } from "./mouse-return.ts";

test("no reset during zoom or the short pause afterwards",()=>{
  const motion=new MouseReturn();motion.request();
  for(let i=0;i<100;i++)assert.equal(motion.step(0.02,true),null);
  assert.equal(motion.step(0.3,false),null);
  const p=motion.step(0.06,false);
  assert.ok(p>0 && p<0.001);
});
test("return eases continuously to home without overshooting",()=>{
  const motion=new MouseReturn();motion.request();let previous=0;
  for(let i=0;i<130;i++){
    const p=motion.step(0.01,false);
    if(p===null)continue;
    assert.ok(p>=previous && p<=1);
    assert.ok(p-previous<0.025);previous=p;
  }
  assert.equal(previous,1);assert.equal(motion.active,false);
});
test("grabbing cancels a pending or moving return",()=>{
  const motion=new MouseReturn();motion.request();motion.step(0.7,false);
  motion.cancel();assert.equal(motion.step(3,false),null);
});
test("another camera transition postpones the return",()=>{
  const motion=new MouseReturn();motion.request();motion.step(0.3,false);
  assert.equal(motion.step(1,true),null);
  assert.equal(motion.step(0.3,false),null);
});
test("reduced motion still waits for zoom and pause",()=>{
  const motion=new MouseReturn();motion.request();
  assert.equal(motion.step(1,true,true),null);
  assert.equal(motion.step(0.3,false,true),null);
  assert.equal(motion.step(0.1,false,true),1);
});
