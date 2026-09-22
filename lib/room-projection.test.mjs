import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { screenQuadMatrix, smoothRoomStep, clampRoomPitch, fittedScreen } from "./room-projection.ts";
import { keyboardHintsVisible } from "./computer-interactions.ts";

const transform = (m, x, y) => {
  const w = m[3] * x + m[7] * y + 1;
  return { x: (m[0] * x + m[4] * y + m[12]) / w, y: (m[1] * x + m[5] * y + m[13]) / w };
};
for (const [name, quad] of [
  ["fullscreen", [{x:0,y:0},{x:1440,y:0},{x:1440,y:900},{x:0,y:900}]],
  ["left orbit", [{x:180,y:200},{x:420,y:160},{x:435,y:410},{x:190,y:350}]],
  ["right orbit", [{x:180,y:160},{x:420,y:200},{x:410,y:350},{x:165,y:410}]],
]) test(`terminal stays on all four glass corners: ${name}`, () => {
  const m = screenQuadMatrix(quad, 1200, 800);
  [[0,0],[1200,0],[1200,800],[0,800]].forEach(([x,y],i) => {
    const p=transform(m,x,y);
    assert.ok(Math.abs(p.x-quad[i].x)<1e-7);
    assert.ok(Math.abs(p.y-quad[i].y)<1e-7);
  });
});
test("reveal interpolation is bounded, monotonic, and has no endpoint snap", () => {
  assert.equal(smoothRoomStep(-1),0);assert.equal(smoothRoomStep(2),1);
  let previous=0;
  for(let i=0;i<=1000;i++){const v=smoothRoomStep(i/1000);assert.ok(v>=previous);previous=v;}
  assert.ok(smoothRoomStep(.001)<1e-7);assert.ok(1-smoothRoomStep(.999)<1e-7);
  for(let i=0;i<10000;i++){const value=smoothRoomStep(1-i*1e-9);assert.ok(value>=0&&value<=1,'floating-point endpoint never overshoots CurvePath');}
});
test("look-around only limits pitch, keeping the horizon comfortable", () => {
  assert.equal(clampRoomPitch(0),0);assert.equal(clampRoomPitch(5),.85);assert.equal(clampRoomPitch(-5),-.85);
});
test("screen focus fits the physical glass, without changing its aspect", () => {
  for(const [w,h] of [[1440,900],[801,707],[390,844]]){
    const fit=fittedScreen(w,h,1.62*.78,1.07*.78,58);
    assert.ok(fit.distance>0);assert.ok(fit.width<=w*.94);assert.ok(fit.height<=h*.83);
    assert.ok(Math.abs(fit.width/fit.height-1.62/1.07)<.01);
  }
});
test("keyboard clue colors stay off until the close-up has settled", () => {
  assert.equal(keyboardHintsVisible("keyboard",true,false),false);
  assert.equal(keyboardHintsVisible("keyboard",false,false),true);
  assert.equal(keyboardHintsVisible("overview",false,false),false);
  assert.equal(keyboardHintsVisible("keyboard",false,true),false);
});

test("the DOM corners track physical glass through every frame of the camera approach", () => {
  const width=801,height=707,scale=.78;
  const screen=new THREE.Vector3(-4.25,3.1794,-5.29614);
  const room=new THREE.Vector3(0,2.75,1.3);
  const camera=new THREE.PerspectiveCamera(58,width/height,.015,100);
  camera.position.copy(room);camera.lookAt(screen);
  const rotation=camera.quaternion.clone();
  const fit=fittedScreen(width,height,1.62*scale,1.07*scale,58);
  const focus=screen.clone().add(new THREE.Vector3(0,0,fit.distance));
  for(let frame=0;frame<=120;frame++){
    const t=smoothRoomStep(frame/120);
    camera.position.lerpVectors(room,focus,t);
    camera.quaternion.slerpQuaternions(rotation,new THREE.Quaternion(),t);
    camera.updateMatrixWorld();
    const quad=[[-.81,.535],[.81,.535],[.81,-.535],[-.81,-.535]].map(([x,y])=>{
      const p=screen.clone().add(new THREE.Vector3(x*scale,y*scale,0)).project(camera);
      return {x:(p.x+1)*width/2,y:(1-p.y)*height/2};
    });
    const matrix=screenQuadMatrix(quad,fit.width,fit.height);
    [[0,0],[fit.width,0],[fit.width,fit.height],[0,fit.height]].forEach(([x,y],i)=>{
      const dom=transform(matrix,x,y);
      assert.ok(Math.hypot(dom.x-quad[i].x,dom.y-quad[i].y)<1e-7,`detached at frame ${frame}`);
    });
  }
});
