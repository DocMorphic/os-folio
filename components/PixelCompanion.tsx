"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CAT_HIDDEN, sampleCatJump, smoothStep } from "@/lib/cat-motion";

type Phase = "idle" | "walk" | "crouch" | "enter" | "hidden" | "peek" | "boxed" | "duck" | "exit" | "land";
type Pose = {
  x: number; y: number; frame: number; right: boolean;
  behind: boolean; peek: boolean; scaleX: number; scaleY: number; phase: Phase;
};
const initialPose: Pose = {
  x: 18, y: 0, frame: 5, right: true, behind: false,
  peek: false, scaleX: 1, scaleY: 1, phase: "idle",
};

export function PixelCompanion({ onExperience }: { onExperience: () => void }) {
  const [pose, setPose] = useState(initialPose);
  const [speaking, setSpeaking] = useState(false);
  const [sceneScale, setSceneScale] = useState(1);
  const [bubble, setBubble] = useState<{ left: number; top: number; tail: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pauseUntil = useRef(0);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = stage.clientWidth;
    const resize = new ResizeObserver(() => {
      const scale = Math.min(1, Math.max(0.1, stage.clientHeight / 176));
      width = stage.clientWidth / scale;
      setSceneScale(scale);
    });
    resize.observe(stage);
    let current = { ...initialPose };
    let phase: Phase = "idle";
    let elapsed = 0;
    let duration = 700;
    let from = current.x;
    let target = current.x;
    let afterWalk: Phase = "crouch";
    let visits = 0;
    let raf = 0;
    let previous = 0;
    const boxX = () => Math.min(78, 100 - 77 / Math.max(width, 1) * 100);
    const leftX = () => 56 / Math.max(width, 1) * 100;
    const approachX = () => Math.max(leftX(), boxX() - 136 / Math.max(width, 1) * 100);
    const begin = (next: Phase, milliseconds: number) => {
      phase = next;
      elapsed = 0;
      duration = milliseconds;
      from = current.x;
    };
    const walk = (destination: number, next: Phase) => {
      target = destination;
      afterWalk = next;
      current.right = target >= current.x;
      const pixels = Math.abs(target - current.x) * width / 100;
      begin("walk", Math.max(450, pixels / 72 * 1000));
    };
    const advance = () => {
      switch (phase) {
        case "idle":
          if (visits % 3 === 0) walk(approachX(), "crouch");
          else walk(visits % 3 === 1 ? leftX() : approachX(), "idle");
          break;
        case "walk":
          if (afterWalk === "idle") visits++;
          begin(afterWalk, afterWalk === "crouch" ? 240 : 1600);
          break;
        case "crouch": current.right = true; begin("enter", 820); break;
        case "enter": begin("hidden", 180); break;
        case "hidden": begin("peek", 420); break;
        case "peek": begin("boxed", 3800); break;
        case "boxed": begin("duck", 280); break;
        case "duck": current.right = false; begin("exit", 820); break;
        case "exit": begin("land", 180); break;
        case "land": visits++; begin("idle", 700); break;
      }
    };
    const tick = (now: number) => {
      const dt = previous ? Math.min(40, now - previous) : 0;
      previous = now;
      const resting = phase === "idle" || phase === "boxed" || phase === "walk";
      if (!document.hidden && !motion.matches && !(resting && now < pauseUntil.current)) {
        elapsed += dt;
        const t = Math.min(1, elapsed / duration);
        const next: Pose = { ...current, phase, scaleX: 1, scaleY: 1 };
        if (phase === "idle") {
          Object.assign(next, { y: 0, frame: 5, behind: false, peek: false });
        } else if (phase === "walk") {
          const x = from + (target - from) * t;
          const travelled = Math.abs(x - from) * width / 100;
          Object.assign(next, { x, y: 0, frame: Math.floor(travelled / 23) % 2, peek: false, behind: false });
        } else if (phase === "crouch" || phase === "land") {
          const compression = Math.sin(Math.PI * t) * 0.08;
          Object.assign(next, { y: 0, frame: 2, peek: false, behind: false, scaleX: 1 + compression / 2, scaleY: 1 - compression });
        } else if (phase === "enter" || phase === "exit") {
          const entering = phase === "enter";
          const jump = sampleCatJump(t, entering);
          const end = entering ? boxX() : approachX();
          Object.assign(next, {
            x: from + (end - from) * jump.travel, y: jump.y,
            frame: 3, peek: false, behind: jump.behind,
          });
        } else if (phase === "hidden") {
          Object.assign(next, { x: boxX(), y: CAT_HIDDEN, frame: 3, behind: true, peek: false });
        } else {
          const reveal = phase === "peek" ? smoothStep(t) : phase === "duck" ? 1 - smoothStep(t) : 1;
          Object.assign(next, { x: boxX(), y: -32 + 80 * reveal, behind: true, peek: true });
        }
        current = next;
        setPose(next);
        if (t === 1) advance();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
    };
  }, []);

  useEffect(() => () => {
    if (speechTimer.current) clearTimeout(speechTimer.current);
  }, []);

  useEffect(() => {
    if (!speaking) return;
    let raf = 0;
    const position = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const center = rect.left + rect.width / 2;
        const left = Math.max(129, Math.min(window.innerWidth - 129, center));
        setBubble({ left, top: Math.max(10, rect.top - 62), tail: Math.max(15, Math.min(223, center - left + 119)) });
      }
      raf = requestAnimationFrame(position);
    };
    raf = requestAnimationFrame(position);
    return () => cancelAnimationFrame(raf);
  }, [speaking]);

  const pet = () => {
    setSpeaking(true);
    pauseUntil.current = performance.now() + 1600;
    if (speechTimer.current) clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => setSpeaking(false), 3200);
  };

  return (
    <>
      <div ref={stageRef} className="miso-stage" aria-label="Interactive pixel cat area">
        <button className="miso-experience" type="button" onClick={onExperience}>Open Experience</button>
        <div className="miso-scene" style={{ width: `${100 / sceneScale}%`, transform: `scale(${sceneScale})` }}>
        <div className="miso-box miso-box-back" aria-hidden="true" />
        <div
          className="miso-actor"
          data-phase={pose.phase}
          data-behind={pose.behind}
          style={{
            left: `${pose.x}%`,
            transform: `translate(-50%, ${-pose.y}px)`,
            zIndex: pose.behind ? 2 : 4,
            // The box has transparent pixels below its base. Clip the hidden
            // body at the floor as well, so paws cannot leak out underneath.
            clipPath: pose.behind ? `inset(0 0 ${Math.max(0, 6 - pose.y)}px 0)` : undefined,
          }}
        >
          <button ref={buttonRef} type="button" className="miso-button" onClick={pet} aria-label="Pet the pixel cat">
            <span className="miso-facing" style={{ transform: `scaleX(${pose.peek || pose.right ? 1 : -1})` }}>
              <span className="miso-pose" style={{ transform: `scale(${pose.scaleX}, ${pose.scaleY})` }}>
                <svg className="miso-sprite" width={pose.peek ? 82 : 108} height={pose.peek ? 69 : 110}
                  viewBox={pose.peek ? "0 0 1250 1050" : "0 0 362 400"} aria-hidden="true">
                  <image href={pose.peek ? "/assets/pixel-cat-peek.png" : `/assets/pixel-cat-frame-${pose.frame}.png`}
                    x="0" y={!pose.peek && pose.frame === 3 ? 98 : 0}
                    width={pose.peek ? 1250 : 362} height={pose.peek ? 1050 : 400}
                    preserveAspectRatio="none" />
                </svg>
              </span>
            </span>
            {speaking && <span className="miso-meow" aria-hidden="true">♡</span>}
          </button>
        </div>
        <div className="miso-box miso-box-front" aria-hidden="true" />
        </div>
      </div>
      {speaking && bubble && createPortal(
        <span className="pixel-cat-speech" role="status" style={{
          left: bubble.left, top: bubble.top, "--speech-tail-x": `${bubble.tail}px`,
        } as CSSProperties}>
          Meow! I&apos;m Miso, the cat keeping watch over the portfolio.
        </span>, document.body,
      )}
    </>
  );
}
