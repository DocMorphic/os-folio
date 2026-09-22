import test from "node:test";
import assert from "node:assert/strict";
import { Vector3, Matrix4 } from "three";
import { stepMousePlacement } from "./mouse-placement.ts";

test("a resting mouse stays attached through repeated full turns",()=>{
  for(const parked of [new Vector3(1.8,.1,1.4),new Vector3(3,.1,-2)]){
    const position=parked.clone();let corrections=0;
    for(let i=0;i<=1440;i++){
      const rig=new Matrix4().makeRotationY(i*Math.PI/90);
      position.copy(stepMousePlacement(position,parked,.2,false,from=>{corrections++;return from.clone().addScalar(10);}));
      assert.ok(position.distanceTo(parked)<1e-12);
      const world=position.clone().applyMatrix4(rig);
      assert.ok(Math.abs(world.length()-parked.length())<1e-10);
    }
    assert.equal(corrections,0);
  }
});

test("dragging still applies the scene and computer collision constraints",()=>{
  const from=new Vector3(1,.1,1),target=new Vector3(9,.25,9);
  let corrections=0;
  const placed=stepMousePlacement(from,target,1,true,(start,next)=>{
    corrections++;assert.equal(start,from);assert.deepEqual(next.toArray(),target.toArray());
    return new Vector3(2,.25,2);
  });
  assert.equal(corrections,1);assert.deepEqual(placed.toArray(),[2,.25,2]);
  assert.deepEqual(from.toArray(),[1,.1,1]);assert.deepEqual(target.toArray(),[9,.25,9]);
});

test("release and delayed return move smoothly without projection feedback",()=>{
  const from=new Vector3(2,.25,1),home=new Vector3(1.8,.1,1.4);
  const fail=()=>{throw new Error("idle collision correction must not run");};
  assert.deepEqual(stepMousePlacement(from,home,0,false,fail).toArray(),from.toArray());
  assert.deepEqual(stepMousePlacement(from,home,.5,false,fail).toArray(),from.clone().lerp(home,.5).toArray());
  assert.deepEqual(stepMousePlacement(from,home,1,false,fail).toArray(),home.toArray());
});
