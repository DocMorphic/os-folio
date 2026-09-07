"use client";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";
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
            <WoodenWheel cx={cx} angle={motion.wheel} />
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

// Stepped silhouettes retain a fixed pixel grid as the drum markings turn.
function pixelDisk(cx: number, cy: number, radius: number) {
  const rows: string[] = [];
  for (let y = -radius; y < radius; y += 3) {
    const mid = y + 1.5;
    const half = Math.round(Math.sqrt(Math.max(0, radius * radius - mid * mid)) / 3) * 3;
    if (half) rows.push(`M${cx-half} ${cy+y}h${half*2}v3h${-half*2}Z`);
  }
  return rows.join("");
}

function WoodenWheel({ cx, angle }: { cx: number; angle: number }) {
  const id = useId();
  const rear = cx - 11;
  return <g shapeRendering="crispEdges">
    <defs>
      <clipPath id={id}><path d={pixelDisk(rear, 78, 59)} /></clipPath>
    </defs>
    <path d={`M${cx-32} 161H${cx-22}V116H${cx-16}V78H${cx-5}V154H${cx+29}V161Z`} fill="#68452b" />
    <path d={`M${cx-20} 156V116H${cx-15}V82H${cx-11}V156Z`} fill="#ad7547" />
    <path d={pixelDisk(rear, 78, 72)} fill="#533623" />
    <path d={pixelDisk(rear, 78, 69)} fill="#9b663b" />
    <path d={pixelDisk(cx, 78, 72)} fill="#533623" />
    <path d={pixelDisk(cx, 78, 69)} fill="#c18b50" />
    <path d={pixelDisk(cx, 78, 63)} fill="#75492c" />
    <path d={pixelDisk(rear, 78, 59)} fill="#e2bd80" />
    <g clipPath={`url(#${id})`} transform={`rotate(${angle} ${rear} 78)`}>
      {[-42,-21,0,21,42].map((y) => <g key={y}>
        <path d={`M${rear-61} ${78+y}h122v2h-122Z`} fill="#c4965d" />
        <path d={`M${rear-45} ${84+y}h17v2h-17ZM${rear+13} ${72+y}h25v2h-25Z`} fill="#efd09a" />
      </g>)}
    </g>
    <g data-wheel-angle={angle.toFixed(2)}>
      {Array.from({length:24},(_,i) => {
        const a=(i*15+angle)*Math.PI/180;
        const x=Math.round((cx+66*Math.cos(a))/3)*3;
        const y=Math.round((78+66*Math.sin(a))/3)*3;
        return <rect key={i} x={x-1.5} y={y-1.5} width="3" height="3" fill={Math.sin(a)<0 ? "#f1cc8a" : "#986334"} />;
      })}
    </g>
    <path d={pixelDisk(rear,78,7)} fill="#81532f" />
    <rect x={rear-3} y="75" width="6" height="6" fill="#d5a164" />
    <path d={`M${cx-44} 159H${cx+38}V163H${cx+43}V170H${cx-49}V163H${cx-44}Z`} fill="#533623" />
    <path d={`M${cx-43} 162H${cx+37}V166H${cx-43}Z`} fill="#bc8952" />
    <path d={`M${cx-36} 162H${cx+30}V164H${cx-36}Z`} fill="#e4bd80" />
  </g>;
}

function Hamster({ distance, running, bob, blink, snack, onWheel }: {
  distance: number; running: boolean; bob: number; blink: boolean; snack: boolean; onWheel: boolean;
}) {
  const id = useId();
  const feet = [{x:8, width:13, phase:0}, {x:39,width:11,phase:0.5}, {x:55,width:11,phase:0}];
  const art = <svg x="0" y="3" width="80" height="48" viewBox="70 90 1390 830" preserveAspectRatio="none">
    <image href="/assets/hamster-pixel-v2.png" width="1536" height="1024" style={{imageRendering:"pixelated"}} />
  </svg>;
  return <g shapeRendering="crispEdges">
    <defs>
      <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="-5" y="-5" width="90" height="65">
        <rect x="-5" y="-5" width="90" height="65" fill="white" />
        {feet.map((f,i)=><rect key={i} x={f.x} y="44" width={f.width} height="10" fill="black" />)}
      </mask>
      {feet.map((f,i)=><clipPath id={`${id}-foot-${i}`} key={i}>
        <rect x={f.x} y="44" width={f.width} height="10" />
      </clipPath>)}
    </defs>
    {feet.map((f,i)=>{
      const p=running ? pawPosition(distance,f.phase) : {x:0,y:0};
      const surface=onWheel ? Math.sqrt(63**2-(f.x+5+p.x-40)**2)-63 : 0;
      return <g key={i} transform={`translate(${Math.round(p.x)} ${Math.round(p.y+surface)})`}>
        <g clipPath={`url(#${id}-foot-${i})`}>{art}</g>
      </g>;
    })}
    <g transform={`translate(0 ${Math.round(bob)})`} mask={`url(#${id}-body)`}>{art}
      {blink && <g><path d="M59 20H67V26H59Z" fill="#ffbb42" /><path d="M59 24H66V26H59Z" fill="#422413" /></g>}
    </g>
    {snack && <g>
      <path d="M69 34H73V39H71V42H67V38H65V35Z" fill="#68432a" />
      <path d="M69 35H71V40H69Z" fill="#daba7a" />
      <path d="M64 37H69V40H65Z" fill="#efa1a9" />
    </g>}
  </g>;
}
