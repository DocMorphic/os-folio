const FRICTION = 1.7;
const MAX_SPEED = 14;
const DRAG_THRESHOLD = 6;
const STOP_SPEED = 0.008;
const TAU = Math.PI * 2;
const RETURN_DELAY = 0.2;
const RETURN_DURATION = 2.4;

/** Pointer coordinates use CSS pixels; velocity is radians per second. */
export class ComputerSpin {
  angle = 0;
  velocity = 0;
  private home: null | { from: number; to: number; elapsed: number } = null;
  private drag: null | {
    x: number; y: number; angle: number; sensitivity: number; moved: boolean;
    samples: { x: number; time: number }[];
  } = null;

  get dragging() { return this.drag !== null; }

  begin(x: number, y: number, time: number, width: number) {
    this.home = null;
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
    if (reducedMotion) { this.velocity = 0; this.home = null; return; }
    let remaining = Math.max(0, dt);
    if (this.velocity !== 0) {
      // Split at the exact stop time, so the return is frame-rate independent.
      const untilStop = Math.max(0, Math.log(Math.abs(this.velocity) / STOP_SPEED) / FRICTION);
      const coast = Math.min(remaining, untilStop);
      const decay = Math.exp(-FRICTION * coast);
      this.angle += this.velocity * (1 - decay) / FRICTION;
      this.velocity *= decay;
      remaining -= coast;
      if (coast < untilStop) return;
      this.velocity = 0;
    }
    if (!this.home) {
      const to = Math.round(this.angle / TAU) * TAU;
      if (Math.abs(to - this.angle) < 1e-9) return;
      this.home = { from: this.angle, to, elapsed: 0 };
    }
    this.home.elapsed += remaining;
    const t = Math.max(0, Math.min(1, (this.home.elapsed - RETURN_DELAY) / RETURN_DURATION));
    // Ease in and out from rest, using the shortest route to the front.
    const ease = t * t * t * (t * (6 * t - 15) + 10);
    this.angle = this.home.from + (this.home.to - this.home.from) * ease;
    if (t === 1) { this.angle = this.home.to; this.home = null; }
  }

  rotateBy(angle: number) { this.home = null; this.velocity = 0; this.angle += angle; }
  reset() { this.drag = null; this.home = null; this.angle = 0; this.velocity = 0; }
}
