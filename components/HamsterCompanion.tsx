"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { pawPosition, smoothStep, wheelAngle } from "@/lib/hamster-motion";

type Phase = "watch" | "approach" | "climb" | "run" | "rest";
type Motion = { x: number; y: number; distance: number; wheel: number; speed: number; phase: Phase; blink: boolean };
const initial: Motion = { x: 58, y: 166, distance: 0, wheel: 0, speed: 0, phase: "watch", blink: false };

export function HamsterCompanion({ onExperience }: { onExperience: () => void }) {
  const [motion, setMotion] = useState(initial);
  const [layout, setLayout] = useState({ width: 456, scale: 1 });
  const [speaking, setSpeaking] = useState(false);
  const [bubble, setBubble] = useState<{ left: number; top: number; tail: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<HTMLButtonElement>(null);
  const snackUntil = useRef(0);
  const speechTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let width = 456;
    let frozen = false;
    const resize = new ResizeObserver(() => {
      const scale = Math.min(1, Math.max(0.1, stage.clientHeight / 176));
      width = stage.clientWidth / scale;
      frozen = false;
      setLayout({ width, scale });
    });
    resize.observe(stage);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let phase: Phase = "watch";
    let elapsed = 0;
    let clock = 0;
    let previous = 0;
    let frame = 0;
    let distance = 0;
    let wheelDistance = 0;
    let speed = 0;
    const tick = (now: number) => {
      const dt = previous ? Math.min(0.04, (now - previous) / 1000) : 0;
      previous = now;
      if (!document.hidden) {
        const cx = width - 100;
        if (reduced.matches) {
          if (!frozen) setMotion({ ...initial, x: cx, y: 144, phase: "rest" });
          frozen = true;
        } else {
          frozen = false;
          clock += dt;
          const snacking = now < snackUntil.current;
          if (!snacking || phase === "climb") elapsed += dt;
          let x = 58;
          let y = 166;
          let goalSpeed = 0;
          if (phase === "watch" && elapsed > 0.8) { phase = "approach"; elapsed = 0; }
          if (phase === "approach") {
            const duration = Math.max(1, (cx - 58) / 65);
            const t = Math.min(1, elapsed / duration);
            x = 58 + (cx - 58) * t;
            // A shallow ramp into the open front of the wheel.
            y = 166 - 22 * smoothStep((t - 0.72) / 0.28);
            goalSpeed = snacking ? 0 : 65;
            if (t === 1) { phase = "climb"; elapsed = 0; }
          } else if (phase === "climb") {
            x = cx; y = 144;
            if (elapsed > 0.35) { phase = "run"; elapsed = 0; }
          } else if (phase === "run" || phase === "rest") {
            x = cx; y = 144;
            goalSpeed = phase === "run" && !snacking ? 78 : 0;
            if (phase === "run" && elapsed > 11) { phase = "rest"; elapsed = 0; }
            else if (phase === "rest" && elapsed > 2.4) { phase = "run"; elapsed = 0; }
          }
          speed += (goalSpeed - speed) * (1 - Math.exp(-dt * 4));
          distance += speed * dt;
          if (phase === "run" || phase === "rest") wheelDistance += speed * dt;
          setMotion({
            x, y, distance, wheel: wheelAngle(wheelDistance), speed, phase,
            blink: clock % 4.7 > 4.55,
          });
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); };
  }, []);

  useEffect(() => () => {
    if (speechTimer.current) clearTimeout(speechTimer.current);
  }, []);

  useEffect(() => {
    if (!speaking) return;
    let frame = 0;
    const position = () => {
      const rect = petRef.current?.getBoundingClientRect();
      if (rect) {
        const center = rect.left + rect.width / 2;
        const left = Math.max(129, Math.min(window.innerWidth - 129, center));
        setBubble({ left, top: Math.max(10, rect.top - 65), tail: Math.max(15, Math.min(223, center - left + 119)) });
      }
      frame = requestAnimationFrame(position);
    };
    frame = requestAnimationFrame(position);
    return () => cancelAnimationFrame(frame);
  }, [speaking]);

  const pet = () => {
    snackUntil.current = performance.now() + 2600;
    setSpeaking(true);
    if (speechTimer.current) clearTimeout(speechTimer.current);
    speechTimer.current = setTimeout(() => setSpeaking(false), 3200);
  };
  const cx = layout.width - 100;
  const running = motion.speed > 4;
  const bob = running ? Math.sin(motion.distance / 22 * Math.PI * 4) * 0.8 : 0;

  return (
    <>
      <div className="hamster-stage" ref={stageRef} aria-label="Hamster and exercise wheel">
        <button className="companion-experience" type="button" onClick={onExperience}>Open Experience</button>
        <div className="hamster-scene" style={{ width: layout.width, transform: `scale(${layout.scale})` }}>
          <svg className="hamster-illustration" width={layout.width} height="176" viewBox={`0 0 ${layout.width} 176`} aria-hidden="true">
            <ellipse cx={cx} cy="170" rx="66" ry="3" fill="#684f39" opacity=".1" />
            <path d={`M${cx-32} 166L${cx-7} 82H${cx+7}L${cx+32} 166`} fill="none" stroke="#6a5542" strokeWidth="7" strokeLinejoin="round" />
            <path d={`M${cx-30} 164L${cx-5} 82`} stroke="#b09878" strokeWidth="2" />
            <circle cx={cx} cy="78" r="69" fill="#d9d4be" stroke="#65513e" strokeWidth="4" />
            <circle cx={cx} cy="78" r="62" fill="#eee4cb" />
            <g transform={`rotate(${motion.wheel} ${cx} 78)`} data-wheel-angle={motion.wheel.toFixed(2)}>
              {Array.from({ length: 8 }, (_, i) => (
                <path key={i} d={`M${cx} 78V17`} transform={`rotate(${i*45} ${cx} 78)`} stroke="#b7baa0" strokeWidth="3" />
              ))}
              {Array.from({ length: 28 }, (_, i) => (
                <path key={i} d={`M${cx} 11V17`} transform={`rotate(${i*360/28} ${cx} 78)`}
                  stroke={i % 7 === 0 ? "#7c8d6b" : "#aaae91"} strokeWidth={i % 7 === 0 ? 5 : 2} />
              ))}
              <circle cx={cx} cy="78" r="64.5" fill="none" stroke="#899776" strokeWidth="2" />
            </g>
            <circle cx={cx} cy="78" r="8" fill="#b5ba9a" stroke="#65513e" strokeWidth="2" />
            <circle cx={cx-1} cy="77" r="2.5" fill="#ede3ca" />
            <path d={`M${cx-42} 162H${cx+42}V169H${cx-42}Z`} fill="#927459" stroke="#65513e" strokeWidth="2" />
            <path d={`M${cx-36} 164H${cx+36}`} stroke="#d4b795" strokeWidth="2" />
            <g transform={`translate(${motion.x-40} ${motion.y-54})`} data-hamster-phase={motion.phase}>
              <Hamster distance={motion.distance} running={running} bob={bob} blink={motion.blink}
                onWheel={motion.phase === "run" || motion.phase === "rest" || motion.phase === "climb"}
                snack={speaking && !running} />
            </g>
          </svg>
          <button ref={petRef} className="hamster-pet" type="button" onClick={pet}
            aria-label="Pet the hamster" title="A tiny snack break?"
            style={{
              left: motion.x - Math.max(80, 44 / layout.scale) / 2,
              top: motion.y - 26 - Math.max(56, 44 / layout.scale) / 2,
              width: Math.max(80, 44 / layout.scale),
              height: Math.max(56, 44 / layout.scale),
            }}>
            <span className="sr-only">Pet the hamster</span>
          </button>
        </div>
      </div>
      {speaking && bubble && createPortal(
        <span className="companion-speech" role="status" style={{
          left: bubble.left, top: bubble.top, "--speech-tail-x": `${bubble.tail}px`,
        } as CSSProperties}>
          Tiny paws. Big plans. Just stopping for a snack.
        </span>, document.body,
      )}
    </>
  );
}

function Hamster({ distance, running, bob, blink, snack, onWheel }: {
  distance: number; running: boolean; bob: number; blink: boolean; snack: boolean; onWheel: boolean;
}) {
  const paw = (x: number, phase: number, far: boolean) => {
    const p = running ? pawPosition(distance, phase) : { x: 0, y: 0 };
    const surface = onWheel ? Math.sqrt(63 ** 2 - (x + p.x - 39) ** 2) - 63 : 0;
    return <g transform={`translate(${x+p.x} ${p.y+surface})`} fill={far ? "#b77b62" : "#e5a18c"} stroke="#704b36" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M-3 42H2V48H7V51H-5V47Z" />
      {!far && <path d="M1 48V50M4 48V50" stroke="#aa715c" strokeWidth="1" />}
    </g>;
  };
  return (
    <g shapeRendering="geometricPrecision">
      {paw(25, 0.5, true)}{paw(54, 0, true)}
      <g transform={`translate(0 ${bob})`}>
        <path d="M10 35H5V40H11" fill="#e2a389" stroke="#704b36" strokeWidth="2" />
        <path d="M10 39V28L15 19L25 14H39L48 17L58 17L67 24L70 35L66 44L56 48H24L14 45Z"
          fill="#c98b47" stroke="#684731" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M14 28L20 21L29 18H39L44 21L36 23H28L21 28L18 37H13Z" fill="#e7b76c" />
        <path d="M17 39L25 35L38 34L44 28L55 28L66 34L64 42L55 47H27L18 44Z" fill="#f5e5bd" />
        <path d="M23 44H37L43 40L48 43L42 47H27Z" fill="#ddc899" />
        <path d="M43 20L40 15V8L44 4H50L54 8V17" fill="#bb8145" stroke="#684731" strokeWidth="2" strokeLinejoin="round" />
        <path d="M44 14V9L47 7L51 10V15Z" fill="#e7a68b" />
        <path d="M53 20L54 13L60 10L65 14V23" fill="#dda356" stroke="#684731" strokeWidth="2" strokeLinejoin="round" />
        <path d="M58 18V15L60 14L63 17V20" fill="#edb6a0" />
        <path d="M41 22L48 17H59L67 24L69 30L75 32V37L70 39L65 45H52L43 40L40 31Z" fill="#e6b36b" />
        <path d="M51 21H57L59 24L58 30L61 33L57 38L52 34L48 34L46 29Z" fill="#f9ebc9" />
        <path d="M58 33L67 31L72 34V39L65 44H55L49 40V35Z" fill="#f9eccf" />
        <path d="M47 35L51 32L55 35V41L51 43L47 40Z" fill="#f3dcb0" />
        {blink
          ? <path d="M61 27H66" stroke="#33271e" strokeWidth="2" />
          : <><path d="M61 23H65L67 25V30L64 32L60 30V26Z" fill="#322820" /><rect x="61" y="24" width="2.5" height="3" rx=".5" fill="#fff9e9" /><rect x="65" y="29" width="1" height="1" fill="#a87743" /></>}
        <path d="M72 32H76V35L73 37L71 35Z" fill="#c48076" stroke="#704b36" strokeWidth="1" />
        <path d="M70 39H73M64 37L71 38M64 41L70 40" stroke="#b59872" strokeWidth="1" strokeLinecap="round" />
        <path d="M20 25L24 23M25 20H30M16 33L18 30M30 31L33 29M35 21L38 22" stroke="#b7793d" strokeWidth="1.5" />
        {snack && <g>
          <path d="M63 38L68 40L65 48L60 46Z" fill="#997046" stroke="#604c33" strokeWidth="1" />
          <path d="M64 40L62 46" stroke="#e2ca91" strokeWidth="1" />
          <path d="M55 41L60 39L63 41L60 44H56" fill="#e5a18c" stroke="#704b36" strokeWidth="1" />
        </g>}
      </g>
      {paw(22, 0, false)}{!snack && paw(55, 0.5, false)}
    </g>
  );
}
