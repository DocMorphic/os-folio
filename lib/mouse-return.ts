/** Wait for the camera to settle, pause briefly, then ease the mouse home. */
export class MouseReturn {
  active = false;
  private elapsed = 0;

  request() { this.active = true; this.elapsed = 0; }
  cancel() { this.active = false; this.elapsed = 0; }

  step(dt: number, cameraMoving: boolean, reducedMotion = false): number | null {
    if (!this.active) return null;
    if (cameraMoving) { this.elapsed = 0; return null; }
    this.elapsed += Math.max(0, dt);
    if (this.elapsed < 0.35) return null;
    const t = reducedMotion ? 1 : Math.min(1, (this.elapsed - 0.35) / 0.9);
    if (t === 1) this.active = false;
    return t*t*t*(t*(6*t-15)+10);
  }
}
