const FRICTION = 1.7;
const MAX_SPEED = 14;
const DRAG_THRESHOLD = 6;

/** Pointer coordinates use CSS pixels; velocity is radians per second. */
export class ComputerSpin {
  angle = 0;
  velocity = 0;
  private drag: null | {
    x: number; y: number; angle: number; sensitivity: number; moved: boolean;
    samples: { x: number; time: number }[];
  } = null;

  get dragging() { return this.drag !== null; }

  begin(x: number, y: number, time: number, width: number) {
    this.velocity = 0; // Catching a spinning computer stops its momentum.
    this.drag = { x, y, angle: this.angle, sensitivity: Math.PI * 2 / Math.max(240, width), moved: false, samples: [{ x, time }] };
  }

  move(x: number, y: number, time: number) {
    const drag = this.drag;
    if (!drag) return;
    if (Math.hypot(x - drag.x, y - drag.y) > DRAG_THRESHOLD) drag.moved = true;
    if (drag.moved) this.angle = drag.angle + (x - drag.x) * drag.sensitivity;
    drag.samples.push({ x, time });
    // Keep the recent movement, not the average of the entire drag.
    while (drag.samples.length > 2 && drag.samples[1].time < time - 80) drag.samples.shift();
  }

  release(time: number, cancelled = false, reducedMotion = false) {
    const drag = this.drag;
    this.drag = null;
    this.velocity = 0;
    if (!drag) return false;
    const first = drag.samples[0], last = drag.samples[drag.samples.length - 1];
    if (drag.moved && !cancelled && !reducedMotion && time - last.time < 90 && last.time > first.time) {
      const speed = (last.x - first.x) * drag.sensitivity / ((last.time - first.time) / 1000);
      this.velocity = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, speed));
    }
    return drag.moved;
  }

  step(dt: number, reducedMotion = false) {
    if (this.dragging) return;
    if (reducedMotion) { this.velocity = 0; return; }
    // Analytical damping gives the same glide at 30, 60, or 120 Hz.
    const decay = Math.exp(-FRICTION * dt);
    this.angle += this.velocity * (1 - decay) / FRICTION;
    this.velocity *= decay;
    if (Math.abs(this.velocity) < 0.008) this.velocity = 0;
  }

  reset() { this.drag = null; this.angle = 0; this.velocity = 0; }
}
