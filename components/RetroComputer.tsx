"use client";

import { useEffect, useRef, useState } from "react";
import type { ComputerControls } from "@/lib/retro-computer";

export function RetroComputer({ onExperience }: { onExperience: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef<ComputerControls | null>(null);
  const [status, setStatus] = useState("Loading the little computer…");
  const [ready, setReady] = useState(false);
  const [powered, setPowered] = useState(true);
  const [ejected, setEjected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    // Three.js and its geometry are fetched only when About is mounted.
    import("@/lib/retro-computer").then(({ createComputer }) => {
      if (cancelled || !host.current) return;
      const computer = createComputer(host.current, (state) => {
        setPowered(state.powered);
        setEjected(state.ejected);
        setStatus(state.message);
      });
      controls.current = computer;
      dispose = computer.dispose;
      setReady(true);
      setStatus("Click the screen to wake it up.");
    }).catch(() => {
      if (!cancelled) setStatus("The little computer needs WebGL to start.");
    });
    return () => { cancelled = true; dispose?.(); controls.current = null; };
  }, []);

  return <div className="retro-computer-stage">
    <button className="companion-experience" type="button" onClick={onExperience}>Open Experience</button>
    <div ref={host} className="retro-computer-canvas" aria-hidden="true" />
    {!ready && <p className="retro-computer-fallback">{status}</p>}
    <div className="retro-computer-controls" aria-label="Mini computer controls">
      <button disabled={!ready} type="button" onClick={() => controls.current?.power()}
        aria-label={powered ? "Turn mini computer off" : "Turn mini computer on"} aria-pressed={powered}>
        <span aria-hidden="true">⏻</span> Power
      </button>
      <button disabled={!ready} type="button" onClick={() => controls.current?.disk()}
        aria-label={ejected ? "Insert floppy disk" : "Eject floppy disk"} aria-pressed={ejected}>
        <span aria-hidden="true">⏏</span> {ejected ? "Insert" : "Eject"}
      </button>
      <button disabled={!ready} type="button" onClick={() => controls.current?.screen()} aria-label="Wake mini computer screen">Wake</button>
    </div>
    <span className="sr-only" role="status">{status}</span>
  </div>;
}
