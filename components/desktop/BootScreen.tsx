"use client";

import { useState, useEffect } from "react";

const BOOT_LINES = [
  "BOOT SEQUENCE INITIATED",
  "loading kernel ............. [ OK ]",
  "mounting /desktop ........... [ OK ]",
  "initializing window manager . [ OK ]",
  "starting stats tracker ...... [ OK ]",
  "loading wallpapers .......... [ OK ]",
  "dharmay@portfolio:~$ ready",
];

const LINE_STAGGER_MS = 55;
const WELCOME_DELAY_MS = BOOT_LINES.length * LINE_STAGGER_MS + 50;
const FADE_DELAY_MS = WELCOME_DELAY_MS + 150;
const UNMOUNT_DELAY_MS = FADE_DELAY_MS + 200;

export function BootScreen() {
  const [visible, setVisible] = useState(true);
  const [linesShown, setLinesShown] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Reveal lines one by one
    const lineTimers = BOOT_LINES.map((_, i) =>
      setTimeout(() => setLinesShown(i + 1), i * LINE_STAGGER_MS + 100)
    );

    // Show "welcome." after all lines
    const welcomeTimer = setTimeout(() => setShowWelcome(true), WELCOME_DELAY_MS);

    // Unmount after fade
    const unmountTimer = setTimeout(() => setVisible(false), UNMOUNT_DELAY_MS);

    return () => {
      lineTimers.forEach(clearTimeout);
      clearTimeout(welcomeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!visible) return null;

  const progressPct = Math.round((linesShown / BOOT_LINES.length) * 100);

  return (
    <div
      className="boot-screen fixed inset-0 z-[9999] overflow-hidden"
      style={{ background: "#0a0705" }}
      aria-live="polite"
      aria-label="Loading workspace"
    >
      {/* Scanline overlay for CRT feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Logo top-left */}
      <div
        className="absolute left-6 top-6 flex items-center gap-2.5"
        style={{
          opacity: linesShown > 0 ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center"
          style={{ background: "#ea580c" }}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
            <rect x="2" y="6" width="2" height="10" />
            <rect x="5" y="3" width="2" height="13" />
            <rect x="8" y="7" width="2" height="9" />
            <rect x="11" y="2" width="2" height="14" />
            <rect x="14" y="5" width="2" height="11" />
            <rect x="17" y="8" width="2" height="8" />
          </svg>
        </div>
        <span
          className="text-[11px] tracking-widest"
          style={{
            color: "#e8c98f",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          }}
        >
          DHARMAY&apos;S PORTFOLIO
        </span>
      </div>

      {/* Terminal lines — center-left */}
      <div
        className="absolute inset-0 flex items-center"
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
      >
        <div className="w-full max-w-[560px] px-10">
          {BOOT_LINES.map((line, i) => {
            const shown = i < linesShown;
            return (
              <div
                key={i}
                className="flex items-start text-[13px] leading-[1.8]"
                style={{
                  opacity: shown ? 1 : 0,
                  transform: shown ? "translateY(0)" : "translateY(4px)",
                  transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
                }}
              >
                <span style={{ color: "#ea580c", marginRight: "8px" }}>{">"}</span>
                <span style={{ color: "#e8c98f" }}>{renderLine(line)}</span>
                {/* Cursor on the last line */}
                {i === BOOT_LINES.length - 1 && shown && (
                  <span
                    className="cursor-blink ml-1"
                    style={{ color: "#ea580c" }}
                  >
                    ▋
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Welcome text bottom-right */}
      <div
        className="absolute bottom-24 right-12"
        style={{
          opacity: showWelcome ? 1 : 0,
          transform: showWelcome ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
        }}
      >
        <span
          className="text-[56px] leading-none"
          style={{
            color: "#ea580c",
            fontFamily: "var(--font-newsreader), Georgia, serif",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          welcome.
        </span>
      </div>

      {/* Progress bar at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: "rgba(232, 201, 143, 0.1)" }}
      >
        <div
          className="h-full"
          style={{
            width: `${progressPct}%`,
            background: "#ea580c",
            transition: "width 0.2s ease-out",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Colors the "[ OK ]" marker green while keeping the rest of the line cream.
 */
function renderLine(line: string): React.ReactNode {
  const okIndex = line.indexOf("[ OK ]");
  if (okIndex === -1) return line;
  const before = line.slice(0, okIndex);
  const ok = line.slice(okIndex, okIndex + 6);
  const after = line.slice(okIndex + 6);
  return (
    <>
      {before}
      <span style={{ color: "#5fa85f" }}>{ok}</span>
      {after}
    </>
  );
}
