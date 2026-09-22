import assert from "node:assert/strict";
import { test } from "node:test";
import { bounceAxis, dvdPosition, DVD_WIDTH, DVD_HEIGHT } from "./dvd-screensaver.ts";

test("the smaller DVD retains its original aspect ratio",()=>{
  assert.equal(DVD_WIDTH,120);assert.equal(DVD_HEIGHT,76);
  assert.equal(DVD_WIDTH/DVD_HEIGHT,180/114);
});

test("DVD logo stays inside the glass across many bounces", () => {
  for (let t = 0; t < 10000; t += 0.31) {
    const { x, y } = dvdPosition(t);
    assert.ok(x >= 0 && x + DVD_WIDTH <= 512);
    assert.ok(y >= 0 && y + DVD_HEIGHT <= 352);
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
  const firstHit = (352 - DVD_HEIGHT - 61) / 45;
  assert.equal(dvdPosition(0).color, dvdPosition(1).color);
  assert.notEqual(dvdPosition(firstHit - 0.001).color, dvdPosition(firstHit + 0.001).color);
});

test("visible logo bounds reach all four glass edges exactly", () => {
  const spanX=512-DVD_WIDTH,spanY=352-DVD_HEIGHT;
  assert.ok(Math.abs(dvdPosition((spanX-38)/67).x+DVD_WIDTH-512)<1e-9);
  assert.ok(Math.abs(dvdPosition((2*spanX-38)/67).x)<1e-9);
  assert.ok(Math.abs(dvdPosition((spanY-61)/45).y+DVD_HEIGHT-352)<1e-9);
  assert.ok(Math.abs(dvdPosition((2*spanY-61)/45).y)<1e-9);
});
