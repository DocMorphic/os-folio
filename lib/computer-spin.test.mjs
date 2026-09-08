import assert from "node:assert/strict";
import { test } from "node:test";
import { ComputerSpin } from "./computer-spin.ts";

function flick(direction = 1) {
  const spin = new ComputerSpin();
  spin.begin(100, 100, 0, 456);
  spin.move(100 + 40 * direction, 100, 40);
  spin.move(100 + 80 * direction, 100, 80);
  spin.release(85);
  return spin;
}
test("a flick coasts in the drag direction and gradually slows", () => {
  for (const direction of [-1, 1]) {
    const spin = flick(direction), angle = spin.angle, speed = spin.velocity;
    spin.step(0.5);
    assert.ok((spin.angle - angle) * direction > 0);
    assert.ok(Math.abs(spin.velocity) < Math.abs(speed));
    spin.step(10);
    assert.equal(spin.velocity, 0);
  }
});
test("damping is independent of frame rate", () => {
  const a = flick(), b = flick();
  for(let i=0;i<60;i++) a.step(1/60);
  for(let i=0;i<120;i++) b.step(1/120);
  assert.ok(Math.abs(a.angle-b.angle)<1e-10);
});
test("small click jitter does not rotate or suppress a click", () => {
  const spin = new ComputerSpin();spin.begin(10,10,0,400);spin.move(13,12,30);
  assert.equal(spin.release(40),false);assert.equal(spin.angle,0);assert.equal(spin.velocity,0);
});
test("holding still before release, cancellation, and reduced motion do not fling", () => {
  for (const mode of ["hold","cancel","reduce"]) {
    const spin = new ComputerSpin();spin.begin(0,0,0,400);spin.move(100,0,50);
    assert.equal(spin.release(mode==="hold"?200:55,mode==="cancel",mode==="reduce"),true);
    assert.equal(spin.velocity,0);
  }
});
test("grabbing stops momentum and reset restores the original orientation", () => {
  const spin = flick();spin.begin(10,10,100,400);assert.equal(spin.velocity,0);
  spin.reset();assert.equal(spin.dragging,false);assert.equal(spin.angle,0);
});
test("the glide lands facing front without a separate return stage", () => {
  const spin = flick();
  for(let i=0;i<600;i++) spin.step(1/60);
  assert.ok(Math.abs(Math.sin(spin.angle))<1e-9);
  assert.ok(Math.cos(spin.angle)>0.999999);
  const pose = new ComputerSpin();pose.angle = Math.PI*2-0.8;
  pose.step(1.2);assert.ok(Math.abs(pose.angle-(Math.PI*2-0.4))<1e-9);
  pose.step(1.2);assert.ok(Math.abs(pose.angle-Math.PI*2)<1e-9);
});
test("flicks never stop or reverse before reaching the front", () => {
  for(const direction of [-1,1]) for(const angle of [-12,-5,-0.1,0,0.1,5,12]) for(const speed of [1.2,3,7,14]) {
    const spin = new ComputerSpin();spin.angle=angle;spin.velocity=direction*speed;
    let previous=angle;
    for(let i=0;i<600;i++) {
      spin.step(1/120);
      assert.ok((spin.angle-previous)*direction>=-1e-10);
      const atHome=Math.abs(spin.angle/ (Math.PI*2)-Math.round(spin.angle/(Math.PI*2)))<1e-8;
      if(!atHome)assert.ok(spin.velocity*direction>0);
      previous=spin.angle;
    }
  }
});
test("release velocity is continuous and a gentle placement starts returning immediately", () => {
  const spin=flick();const before=spin.velocity;spin.step(0.000001);
  assert.ok(Math.abs(spin.velocity-before)<0.001);
  const placed=new ComputerSpin();placed.angle=1;placed.step(0.05);
  assert.ok(placed.angle<1 && placed.velocity<0);
});
test("the complete coast and return match at different frame rates", () => {
  const a = flick(), b = flick();
  for(let i=0;i<165;i++) a.step(1/30);
  for(let i=0;i<660;i++) b.step(1/120);
  assert.ok(Math.abs(a.angle-b.angle)<1e-9);
});
test("a new drag interrupts the return without snapping, and reduced motion stays still", () => {
  const spin = new ComputerSpin();spin.angle=2;spin.step(1);
  const angle=spin.angle;spin.begin(10,10,0,400);spin.step(2);assert.equal(spin.angle,angle);
  spin.move(30,10,40);assert.ok(spin.angle>angle);
  spin.release(200,false,true);const held=spin.angle;spin.step(10,true);assert.equal(spin.angle,held);
});
