import assert from "node:assert/strict";
import { test } from "node:test";
import { CAT_APEX, CAT_HIDDEN, CAT_RIM, sampleCatJump } from "./cat-motion.ts";

test("both jumps have continuous, paw-anchored endpoints and a clear apex", () => {
  for (const entering of [true, false]) {
    const start = sampleCatJump(0, entering);
    const end = sampleCatJump(1, entering);
    assert.equal(start.y, entering ? 0 : CAT_HIDDEN);
    assert.ok(Math.abs(end.y - (entering ? CAT_HIDDEN : 0)) < 1e-9);
    assert.ok(Math.abs(sampleCatJump(start.apexTime, entering).y - CAT_APEX) < 1e-9);
    assert.ok(CAT_APEX > CAT_RIM + 20);
    assert.equal(start.travel, 0);
    assert.equal(end.travel, 1);
  }
});

test("depth changes only when all of the cat is above the front rim", () => {
  for (const entering of [true, false]) {
    let previous = sampleCatJump(0, entering);
    let switches = 0;
    for (let i = 1; i <= 1000; i++) {
      const next = sampleCatJump(i / 1000, entering);
      assert.ok(Math.abs(next.y - previous.y) < 1, "no vertical teleport");
      assert.ok(next.travel >= previous.travel, "no backwards travel");
      if (next.behind !== previous.behind) {
        switches++;
        assert.ok(next.y >= CAT_RIM);
      }
      previous = next;
    }
    assert.equal(switches, 1);
  }
});

test("the pose swap inside the box happens completely below the rim", () => {
  const airborneHeight = 84;
  assert.ok(CAT_HIDDEN + airborneHeight < 0);
  const peekHiddenBottom = -32;
  const peekHeight = 69;
  assert.ok(peekHiddenBottom + peekHeight < CAT_RIM);
});
