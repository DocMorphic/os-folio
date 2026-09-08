const MAX_SPEED = 14;
const DRAG_THRESHOLD = 6;
const TAU = Math.PI * 2;

/** Pointer coordinates use CSS pixels; velocity is radians per second. */
export class ComputerSpin {
  angle = 0;
  velocity = 0;
  private home: null | { from: number; to: number; elapsed: number; duration: number; speed: number } = null;
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
    if (!this.home) {
      const speed = Math.abs(this.velocity);
      let to = Math.round(this.angle / TAU) * TAU;
      let duration = 2.4;
      if (speed >= 1.2) {
        // Land on a front-facing revolution AHEAD of the flick, rather than
        // stopping at an arbitrary angle and then reversing toward home.
        const direction = Math.sign(this.velocity);
        to = direction * Math.ceil(direction * (this.angle + this.velocity * 0.7) / TAU) * TAU;
        duration = Math.min(4.5, 3 * Math.abs(to - this.angle) / speed);
      }
      if (Math.abs(to - this.angle) < 1e-9 && speed < 1e-9) return;
      this.home = { from: this.angle, to, elapsed: 0, duration, speed: this.velocity };
    }
    const home = this.home;
    home.elapsed += Math.max(0, dt);
    const t = Math.min(1, home.elapsed / home.duration);
    const distance = home.to - home.from;
    const tangent = home.speed * home.duration;
    // One Hermite trajectory preserves release velocity and continuously
    // brings it to zero at home. There is no coast/return switch or delay.
    this.angle = home.from + distance * (3*t*t - 2*t*t*t) + tangent * (t*t*t - 2*t*t + t);
    this.velocity = (distance * (6*t - 6*t*t) + tangent * (3*t*t - 4*t + 1)) / home.duration;
    if (t === 1) { this.angle = home.to; this.velocity = 0; this.home = null; }
  }

  rotateBy(angle: number) { this.home = null; this.velocity = 0; this.angle += angle; }
  reset() { this.drag = null; this.home = null; this.angle = 0; this.velocity = 0; }
}
