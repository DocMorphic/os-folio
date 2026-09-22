import assert from "node:assert/strict";
import { test } from "node:test";
import { convexHull, expandByFootprint, isMousePositionSafe, moveMouseWithinScene } from "./mouse-collision.ts";
const bounds={left:12,right:488,top:12,bottom:288};
const obstacles=[convexHull([{x:170,y:60},{x:330,y:60},{x:330,y:230},{x:170,y:230}])];
test("a fast drag cannot tunnel through the computer",()=>{
  const p=moveMouseWithinScene({x:100,y:150},{x:450,y:150},bounds,obstacles);
  assert.ok(p.x<170);assert.ok(isMousePositionSafe(p,bounds,obstacles));
});
test("dragging diagonally slides along the computer edge",()=>{
  const p=moveMouseWithinScene({x:120,y:100},{x:280,y:260},bounds,obstacles);
  assert.ok(p.y>230);assert.ok(isMousePositionSafe(p,bounds,obstacles));
});
test("the full mouse stays inside the padded frame on all four edges",()=>{
  for(const to of [{x:-1000,y:250},{x:1000,y:250},{x:70,y:-1000},{x:70,y:1000}]){
    const p=moveMouseWithinScene({x:70,y:250},to,bounds,obstacles);
    assert.ok(isMousePositionSafe(p,bounds,obstacles));
  }
});
test("resize or rotation recovers a mouse covered by the model",()=>{
  const p=moveMouseWithinScene({x:250,y:150},{x:250,y:150},bounds,obstacles);
  assert.ok(isMousePositionSafe(p,bounds,obstacles));
});
test("mouse can travel around the computer to either side",()=>{
  let p={x:400,y:150};
  for(const target of [{x:400,y:265},{x:100,y:265},{x:100,y:150}]){
    p=moveMouseWithinScene(p,target,bounds,obstacles);
    assert.ok(isMousePositionSafe(p,bounds,obstacles));
    assert.ok(Math.hypot(p.x-target.x,p.y-target.y)<0.01);
  }
});
test("invalid or fully occupied frames fail safely",()=>{
  assert.equal(moveMouseWithinScene({x:0,y:0},{x:0,y:0},{left:2,right:1,top:0,bottom:1},[]),null);
  assert.equal(moveMouseWithinScene({x:250,y:150},{x:250,y:150},{left:200,right:300,top:100,bottom:200},obstacles),null);
});

test("contact stops within a quarter pixel, without an invisible gap",()=>{
  const shell=convexHull([{x:100,y:100},{x:200,y:100},{x:200,y:200},{x:100,y:200}]);
  const mouse=convexHull([{x:-5,y:0},{x:0,y:-8},{x:5,y:0},{x:0,y:8}]);
  const obstacle=expandByFootprint(shell,mouse);
  const result=moveMouseWithinScene({x:250,y:150},{x:190,y:150},bounds,[obstacle]);
  assert.ok(result.x>=205 && result.x<=205.26);
});

test("rounded footprint can approach corners that bounding rectangles would block",()=>{
  const shell=convexHull([{x:100,y:100},{x:200,y:100},{x:200,y:200},{x:100,y:200}]);
  const mouse=convexHull([{x:-5,y:0},{x:0,y:-8},{x:5,y:0},{x:0,y:8}]);
  const obstacle=expandByFootprint(shell,mouse);
  assert.ok(isMousePositionSafe({x:204,y:207},bounds,[obstacle]));
  assert.ok(!isMousePositionSafe({x:202,y:203},bounds,[obstacle]));
});
