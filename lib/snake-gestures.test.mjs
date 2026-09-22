import test from "node:test";
import assert from "node:assert/strict";
import { snakeSwipeDirection, queueSnakeTurn } from "./snake-gestures.ts";

test("swipes resolve all four directions and prefer the dominant axis", () => {
  assert.equal(snakeSwipeDirection(40, 3), "right");
  assert.equal(snakeSwipeDirection(-40, 3), "left");
  assert.equal(snakeSwipeDirection(3, 40), "down");
  assert.equal(snakeSwipeDirection(3, -40), "up");
  assert.equal(snakeSwipeDirection(-20, 35), "down");
});

test("taps, small jitter and invalid coordinates cannot turn the snake", () => {
  assert.equal(snakeSwipeDirection(0, 0), null);
  assert.equal(snakeSwipeDirection(13, -13), null);
  assert.equal(snakeSwipeDirection(NaN, 40), null);
  assert.equal(snakeSwipeDirection(Infinity, 0), null);
  assert.equal(snakeSwipeDirection(14, 0), "right");
});

test("steering cannot reverse and accepts just one turn per tick", () => {
  assert.equal(queueSnakeTurn("right", "right", "left"), "right");
  assert.equal(queueSnakeTurn("right", "right", "up"), "up");
  assert.equal(queueSnakeTurn("right", "up", "down"), "up");
  assert.equal(queueSnakeTurn("right", "up", "left"), "up");
  // Once the simulation applies the queued turn, another turn is accepted.
  assert.equal(queueSnakeTurn("up", "up", "left"), "left");
  for (const [direction, opposite] of [["up", "down"], ["down", "up"], ["left", "right"], ["right", "left"]]) {
    assert.equal(queueSnakeTurn(direction, direction, opposite), direction);
  }
});
