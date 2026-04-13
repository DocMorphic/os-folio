"use client";

import { useEffect, useState } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { APP_REGISTRY } from "@/lib/constants";

const DOCK_APPS_ORDER = ["about", "blog", "contact", "experience", "help", "search", "settings", "terminal", "works"];
const DOCK_APPS_MOBILE_ORDER = ["about", "blog", "contact", "experience", "search", "terminal", "works"];
const DOCK_APPS = DOCK_APPS_ORDER.map((id) => APP_REGISTRY[id]).filter(Boolean);
const DOCK_APPS_MOBILE = DOCK_APPS_MOBILE_ORDER.map((id) => APP_REGISTRY[id]).filter(Boolean);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// Hand-drawn wobbly dock icons. Each is a few pen strokes, slightly
// imperfect, with tiny inside details. Stroke is cream (for contrast
// against the brown-ink dock button fill). Everything has round linecaps
// so strokes end softly like a real pen lift.
const STROKE = "#f3ead9";
const STROKE_ATTRS = {
  fill: "none",
  stroke: STROKE,
  strokeWidth: "1.5",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DOCK_ICONS: Record<string, React.ReactNode> = {
  about: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Person bust — wobbly oval head + shoulders */}
      <path d="M12 4 Q 14.5 4, 14.5 7 Q 14.5 10, 12 10 Q 9.5 10, 9.5 7 Q 9.5 4, 12 4 Z" />
      <path d="M5 20 Q 5 14, 12 13.5 Q 19 14, 19 20" />
    </svg>
  ),
  blog: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Open book */}
      <path d="M4 6 Q 4 4, 6 4 L 11 5 L 11 20 L 6 19 Q 4 19, 4 17 Z" />
      <path d="M20 6 Q 20 4, 18 4 L 13 5 L 13 20 L 18 19 Q 20 19, 20 17 Z" />
    </svg>
  ),
  contact: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Envelope with flap line */}
      <path d="M3 6 Q 3 5, 4 5 L 20 5 Q 21 5, 21 6 L 21 18 Q 21 19, 20 19 L 4 19 Q 3 19, 3 18 Z" />
      <path d="M3 6 Q 12 13, 21 6" />
    </svg>
  ),
  experience: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Briefcase + handle */}
      <path d="M9 6 Q 9 4, 11 4 L 13 4 Q 15 4, 15 6" />
      <path d="M3 8 Q 3 7, 4 7 L 20 7 Q 21 7, 21 8 L 21 18 Q 21 19, 20 19 L 4 19 Q 3 19, 3 18 Z" />
      <path d="M3 12 Q 12 14, 21 12" />
    </svg>
  ),
  help: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Round question mark */}
      <path d="M12 4 Q 18 4, 18 10 Q 18 13, 15 14 Q 12 15, 12 17" />
      <path d="M12 19.5 Q 12.5 19.5, 12.5 20 Q 12.5 20.5, 12 20.5 Q 11.5 20.5, 11.5 20 Q 11.5 19.5, 12 19.5 Z" fill={STROKE} strokeWidth="0" />
    </svg>
  ),
  search: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Magnifying glass — wobbly circle + handle */}
      <path d="M10 4 Q 15.5 4, 15.5 10 Q 15.5 16, 10 16 Q 4.5 16, 4.5 10 Q 4.5 4, 10 4 Z" />
      <path d="M14.5 14.5 L 20 20" />
    </svg>
  ),
  settings: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Gear — six simple teeth, center circle */}
      <path d="M12 9 Q 15 9, 15 12 Q 15 15, 12 15 Q 9 15, 9 12 Q 9 9, 12 9 Z" />
      <path d="M12 3 L 12 6 M 12 18 L 12 21 M 3 12 L 6 12 M 18 12 L 21 12 M 5.5 5.5 L 7.5 7.5 M 16.5 16.5 L 18.5 18.5 M 5.5 18.5 L 7.5 16.5 M 16.5 7.5 L 18.5 5.5" />
    </svg>
  ),
  terminal: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* CLI box with chevron + underscore */}
      <path d="M4 5 Q 3 5, 3 6 L 3 18 Q 3 19, 4 19 L 20 19 Q 21 19, 21 18 L 21 6 Q 21 5, 20 5 Z" />
      <path d="M7 9 L 10 12 L 7 15 M 12 16 L 17 16" />
    </svg>
  ),
  works: (
    <svg width="22" height="22" viewBox="0 0 24 24" {...STROKE_ATTRS}>
      {/* Folder-ish portfolio with handle */}
      <path d="M4 8 L 20 8 Q 21 8, 21 9 L 21 19 Q 21 20, 20 20 L 4 20 Q 3 20, 3 19 L 3 9 Q 3 8, 4 8 Z" />
      <path d="M8 8 Q 8 6, 10 6 L 14 6 Q 16 6, 16 8" />
    </svg>
  ),
};

export function Taskbar() {
  const { windows, openWindow, focusWindow, restoreWindow, minimizeWindow } = useWindowManager();
  const isMobile = useIsMobile();
  const apps = isMobile ? DOCK_APPS_MOBILE : DOCK_APPS;

  return (
    <div
      className="notebook-dock absolute bottom-5 left-1/2 z-[600] -translate-x-1/2 md:bottom-3"
      style={{
        // The entire dock tilts a tiny amount so it looks placed, not
        // rendered. Deterministic so every reload is the same.
        transform: "translateX(-50%) rotate(-0.4deg)",
      }}
    >
      <div
        className="flex items-center justify-center gap-1.5 border px-3 py-3 md:w-auto md:gap-2 md:px-3 md:py-2"
        style={{
          background: "var(--color-dock-bg)",
          borderColor: "var(--color-border-strong)",
          width: isMobile ? "calc(100vw - 16px)" : undefined,
          maxWidth: "calc(100vw - 12px)",
          // Paper card shadow — slightly irregular offset + soft spread
          boxShadow:
            "2px 4px 0 rgba(40,25,5,0.14), 5px 8px 16px rgba(40,25,5,0.18), 0 1px 0 rgba(255,255,255,0.5) inset",
        }}
      >
        {apps.map((app) => {
          const win = windows.find((w) => w.appId === app.id);
          const isOpen = !!win;
          const isFocused =
            win &&
            !win.isMinimized &&
            win.zIndex >= Math.max(...windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.zIndex), 0);

          return (
            <div key={app.id} className="dock-item relative flex flex-col items-center">
              {/* Tooltip */}
              <div
                className="dock-tooltip absolute -top-8 left-1/2 whitespace-nowrap border px-2 py-0.5 text-[12px]"
                style={{
                  background: "var(--color-surface-solid)",
                  borderColor: "var(--color-border-strong)",
                  color: "var(--color-text)",
                }}
              >
                {app.title}
              </div>

              <button
                className="flex h-10 w-10 items-center justify-center border-2 transition-colors md:h-10 md:w-10"
                style={{
                  background: isFocused ? "var(--color-button-dark-hover)" : "var(--color-button-dark)",
                  borderColor: "var(--color-border-strong)",
                }}
                onClick={() => {
                  if (!win) {
                    openWindow(app.id);
                  } else if (win.isMinimized) {
                    restoreWindow(app.id);
                  } else if (isFocused) {
                    minimizeWindow(app.id);
                  } else {
                    focusWindow(app.id);
                  }
                }}
                aria-label={app.title}
              >
                <span className="scale-[0.8] md:scale-[0.9]">
                  {DOCK_ICONS[app.id] || <span className="text-sm text-white">{app.icon}</span>}
                </span>
              </button>

              {isOpen && (
                <div
                  className="mt-1 h-1 w-1"
                  style={{
                    background: isFocused ? "var(--color-accent)" : "#8b5a2b",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
