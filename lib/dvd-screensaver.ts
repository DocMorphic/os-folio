export const DVD_WIDTH = 120;
export const DVD_HEIGHT = 76;
const COLORS = ["#9be67e", "#74c9ff", "#ef88df", "#ffd16e", "#ac9cff", "#72e4d3"];

/** Reflect an unbounded distance into a track without overshoot or teleporting. */
export function bounceAxis(distance: number, span: number) {
  const phase = ((distance % (span * 2)) + span * 2) % (span * 2);
  return phase <= span ? phase : span * 2 - phase;
}

export function dvdPosition(time: number) {
  const spanX = 512 - DVD_WIDTH;
  const spanY = 352 - DVD_HEIGHT;
  const dx = 38 + time * 67;
  const dy = 61 + time * 45;
  const collisions = Math.floor(dx / spanX) + Math.floor(dy / spanY);
  return {
    x: bounceAxis(dx, spanX),
    y: bounceAxis(dy, spanY),
    color: COLORS[collisions % COLORS.length],
  };
}
