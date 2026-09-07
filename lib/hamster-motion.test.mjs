import assert from "node:assert/strict";
import { test } from "node:test";
import { pawPosition, wheelAngle, WHEEL_RADIUS, STRIDE_LENGTH } from "./hamster-motion.ts";

test("one wheel revolution matches the distance travelled by the paws", () => {
  assert.ok(Math.abs(wheelAngle(2 * Math.PI * WHEEL_RADIUS) - 360) < 1e-9);
});

test("planted paws move backwards at exactly the wheel surface speed", () => {
  const start = pawPosition(2, 0);
  const end = pawPosition(5, 0);
  assert.ok(Math.abs(end.x - start.x + 3) < 1e-9);
  assert.equal(start.y, 0);
  assert.equal(end.y, 0);
});

test("the returning paw lifts and rejoins without a position jump", () => {
  assert.ok(pawPosition(STRIDE_LENGTH * 0.8, 0).y < -4);
  for (const boundary of [0.6, 1]) {
    const before = pawPosition(STRIDE_LENGTH * (boundary - 0.00001), 0);
    const after = pawPosition(STRIDE_LENGTH * (boundary + 0.00001), 0);
    assert.ok(Math.abs(before.x - after.x) < 0.01);
    assert.ok(Math.abs(before.y - after.y) < 0.01);
  }
});
