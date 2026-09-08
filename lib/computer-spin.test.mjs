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
