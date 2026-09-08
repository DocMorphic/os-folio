import assert from "node:assert/strict";
import { test } from "node:test";
import { bounceAxis, dvdPosition, DVD_WIDTH, DVD_HEIGHT } from "./dvd-screensaver.ts";

test("DVD logo stays inside the glass across many bounces", () => {
  for (let t = 0; t < 10000; t += 0.31) {
    const { x, y } = dvdPosition(t);
    assert.ok(x >= 14 && x + DVD_WIDTH <= 498);
    assert.ok(y >= 14 && y + DVD_HEIGHT <= 338);
  }
});
test("motion reverses continuously at both edges", () => {
  assert.equal(bounceAxis(99, 100), 99);
  assert.equal(bounceAxis(100, 100), 100);
  assert.equal(bounceAxis(101, 100), 99);
  assert.equal(bounceAxis(199, 100), 1);
  assert.equal(bounceAxis(200, 100), 0);
  assert.equal(bounceAxis(201, 100), 1);
});
test("color changes on an edge collision, not in the middle of a pass", () => {
  const firstHit = (352 - DVD_HEIGHT - 28 - 61) / 45;
  assert.equal(dvdPosition(0).color, dvdPosition(1).color);
  assert.notEqual(dvdPosition(firstHit - 0.001).color, dvdPosition(firstHit + 0.001).color);
});
