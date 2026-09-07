export const WHEEL_RADIUS = 63;
export const STRIDE_LENGTH = 22;

export function smoothStep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

// A planted paw travels backwards with the treadmill; the return stroke
// lifts it off the surface. All four paws and the wheel use one distance.
export function pawPosition(distance: number, offset: number) {
  const phase = ((distance / STRIDE_LENGTH + offset) % 1 + 1) % 1;
  const reach = STRIDE_LENGTH * 0.6 / 2;
  if (phase < 0.6) return { x: reach - phase * STRIDE_LENGTH, y: 0 };
  const swing = (phase - 0.6) / 0.4;
  return { x: -reach + 2 * reach * smoothStep(swing), y: -5 * Math.sin(Math.PI * swing) };
}

export function wheelAngle(distance: number) {
  return distance / WHEEL_RADIUS * 180 / Math.PI;
}
