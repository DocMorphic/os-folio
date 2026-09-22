export type SnakeDirection = "up" | "down" | "left" | "right";

const OPPOSITE: Record<SnakeDirection, SnakeDirection> = {
  up: "down", down: "up", left: "right", right: "left",
};

/** Ignore tap jitter; a swipe follows its dominant axis, never a diagonal. */
export function snakeSwipeDirection(dx: number, dy: number, threshold = 14): SnakeDirection | null {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

/** Only one actual turn is buffered between simulation ticks. */
export function queueSnakeTurn(current: SnakeDirection, queued: SnakeDirection, next: SnakeDirection): SnakeDirection {
  if (queued !== current || next === OPPOSITE[current]) return queued;
  return next;
}
