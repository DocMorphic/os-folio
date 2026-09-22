export type ScreenPoint = { x: number; y: number };
export type ScreenQuad = [ScreenPoint, ScreenPoint, ScreenPoint, ScreenPoint];

/** Full horizontal rotation, with a comfortable vertical limit. The camera
 * looks around from an interior vantage point rather than passing through walls. */
export const ROOM_LOOK = { minPitch: -.85, maxPitch: .85 };
export function clampRoomPitch(pitch: number) {
  return Math.max(ROOM_LOOK.minPitch, Math.min(ROOM_LOOK.maxPitch, pitch));
}
export function fittedScreen(width: number, height: number, screenWidth: number, screenHeight: number, fov: number) {
  const tan=Math.tan(fov*Math.PI/360);
  const distance=Math.max(screenWidth/(2*tan*(width/height)*.93),screenHeight/(2*tan*.82));
  const pixelsPerUnit=height/(2*distance*tan);
  return {distance,width:Math.round(screenWidth*pixelsPerUnit),height:Math.round(screenHeight*pixelsPerUnit)};
}
export function smoothRoomStep(value: number) {
  const t = Math.max(0, Math.min(1, value));
  return Math.max(0,Math.min(1,t * t * t * (t * (t * 6 - 15) + 10)));
}

/** Project a DOM rectangle onto a perspective screen: TL, TR, BR, BL.
 * Unlike an affine transform, this keeps all four corners on the glass while orbiting. */
export function screenQuadMatrix([p0, p1, p2, p3]: ScreenQuad, width: number, height: number): number[] {
  if (width <= 0 || height <= 0) throw new Error("Screen dimensions must be positive");
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = Math.abs(det) < 1e-8 ? 0 : (dx3 * dy2 - dx2 * dy3) / det;
  const h = Math.abs(det) < 1e-8 ? 0 : (dx1 * dy3 - dx3 * dy1) / det;
  return [
    (p1.x - p0.x + g * p1.x) / width, (p1.y - p0.y + g * p1.y) / width, 0, g / width,
    (p3.x - p0.x + h * p3.x) / height, (p3.y - p0.y + h * p3.y) / height, 0, h / height,
    0, 0, 1, 0, p0.x, p0.y, 0, 1,
  ];
}
