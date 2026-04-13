"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { LLM_TXT } from "@/content/text-files";

const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

type IconType = "folder" | "envelope" | "file" | "clipboard";

interface DesktopItem {
  id: string;
  label: string;
  type: IconType;
  appId?: string;
}

interface IconPos {
  x: number;
  y: number;
}

const DESKTOP_ITEMS: DesktopItem[] = [
  { id: "germany", label: "germany", type: "folder", appId: "folder-germany" },
  { id: "austria", label: "austria", type: "folder", appId: "folder-austria" },
  { id: "india", label: "india", type: "folder", appId: "folder-india" },
  { id: "contact", label: "Contact", type: "envelope", appId: "contact" },
  { id: "about", label: "about.txt", type: "file", appId: "about-txt" },
  { id: "buildlog", label: "build-log.md", type: "file", appId: "build-log-md" },
  { id: "llm", label: "llm.txt", type: "clipboard" },
];

// Initial layout coords — used only to seed the default positions.
// There's no grid system anymore; icons are free-positioned after first drag.
const INITIAL_X = 12;
const INITIAL_Y = 12;
const INITIAL_ROW_STEP = 96;
const INITIAL_COL_STEP = 104;

const DEFAULT_POSITIONS: Record<string, IconPos> = {
  germany: { x: INITIAL_X, y: INITIAL_Y + INITIAL_ROW_STEP * 0 },
  austria: { x: INITIAL_X, y: INITIAL_Y + INITIAL_ROW_STEP * 1 },
  india: { x: INITIAL_X, y: INITIAL_Y + INITIAL_ROW_STEP * 2 },
  contact: { x: INITIAL_X, y: INITIAL_Y + INITIAL_ROW_STEP * 3 },
  about: { x: INITIAL_X, y: INITIAL_Y + INITIAL_ROW_STEP * 4 },
  buildlog: { x: INITIAL_X, y: INITIAL_Y + INITIAL_ROW_STEP * 5 },
  // llm sits at the top of column 2 so it never clips off the bottom of
  // shorter viewports (iPad landscape, narrow laptop windows).
  llm: { x: INITIAL_X + INITIAL_COL_STEP, y: INITIAL_Y + INITIAL_ROW_STEP * 0 },
};

const ICON_WIDTH = 104;
const ICON_HEIGHT = 88;
const DRAG_THRESHOLD_PX = 8;

function clampPosition(x: number, y: number): IconPos {
  if (typeof window === "undefined") return { x, y };
  const vw = window.innerWidth;
  const contentH = window.innerHeight - 34;
  const dockReserve = 90;
  const minX = 0;
  const maxX = Math.max(minX, vw - ICON_WIDTH);
  const minY = 0;
  const maxY = Math.max(minY, contentH - ICON_HEIGHT - dockReserve);
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

interface DesktopIconsProps {
  /** Controls whether clicking llm.txt also opens the viewer window. */
  llmUnlocked: boolean;
  /** Callback for showing a brief notification near the dock. */
  onToast: (message: string) => void;
}

export function DesktopIcons({ llmUnlocked, onToast }: DesktopIconsProps) {
  const { openWindow } = useWindowManager();
  const isMobile = useIsMobile();
  // Session-only state — positions reset on refresh
  const [positions, setPositions] = useState<Record<string, IconPos>>(DEFAULT_POSITIONS);

  const handleActivate = useCallback(
    (item: DesktopItem) => {
      // llm.txt: clipboard-only before unlock, clipboard + viewer after.
      if (item.type === "clipboard") {
        navigator.clipboard
          .writeText(LLM_TXT)
          .then(() => {
            onToast(
              llmUnlocked
                ? "llm.txt copied · opened viewer"
                : "llm.txt copied to clipboard"
            );
          })
          .catch(() => onToast("clipboard blocked"));
        if (llmUnlocked) openWindow("llm-txt");
        return;
      }
      if (item.appId) openWindow(item.appId);
    },
    [openWindow, llmUnlocked, onToast]
  );

  // On small screens, render icons as a horizontally scrollable row pinned
  // to the top of the desktop area. Dragging is disabled — tapping opens.
  if (isMobile) {
    return (
      <>
        <div
          className="no-scrollbar absolute left-0 right-0 top-0 z-[5] overflow-x-auto overflow-y-hidden"
          style={{
            WebkitOverflowScrolling: "touch",
            maxWidth: "100vw",
          }}
        >
          <div className="flex w-max items-start gap-2 px-3 py-3">
            {DESKTOP_ITEMS.map((item) => (
              <button
                key={item.id}
                className="flex w-[92px] shrink-0 flex-col items-center gap-1.5 px-1 py-1 select-none"
                onClick={() => handleActivate(item)}
              >
                <DesktopIconSvg type={item.type} size={60} />
                <span
                  className="w-full truncate text-center text-[13px] leading-[1.15]"
                  style={{
                    fontFamily: "var(--font-kalam), cursive",
                    color: "var(--color-desktop-label)",
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {DESKTOP_ITEMS.map((item) => (
        <DraggableIcon
          key={item.id}
          item={item}
          position={positions[item.id] ?? DEFAULT_POSITIONS[item.id]}
          onOpen={() => handleActivate(item)}
          onCommit={(x, y) => {
            // Free positioning — just clamp so it stays on screen.
            setPositions((prev) => ({
              ...prev,
              [item.id]: clampPosition(x, y),
            }));
          }}
        />
      ))}
    </>
  );
}

interface DraggableIconProps {
  item: DesktopItem;
  position: IconPos;
  onOpen: () => void;
  onCommit: (x: number, y: number) => void;
}

function DraggableIcon({ item, position, onOpen, onCommit }: DraggableIconProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // All drag bookkeeping lives in a ref — there are zero React state
  // changes during an active drag. Visual feedback (dim opacity, grabbing
  // cursor, raised z-index) is handled by toggling a CSS class via direct
  // DOM. The icon itself is positioned with translate3d which is GPU-
  // composited and doesn't trigger layout reflow, so motion is buttery.
  const dragState = useRef({
    pointerStartX: 0,
    pointerStartY: 0,
    baseX: 0,
    baseY: 0,
    latestX: 0,
    latestY: 0,
    dragging: false,
    moved: false,
    rafPending: false,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const s = dragState.current;
      s.pointerStartX = e.clientX;
      s.pointerStartY = e.clientY;
      s.baseX = position.x;
      s.baseY = position.y;
      s.latestX = position.x;
      s.latestY = position.y;
      s.dragging = true;
      s.moved = false;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    },
    [position.x, position.y]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const s = dragState.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.pointerStartX;
    const dy = e.clientY - s.pointerStartY;
    if (!s.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      s.moved = true;
      // Visual feedback via direct className mutation — no React re-render
      rootRef.current?.classList.add("dragging");
    }
    s.latestX = s.baseX + dx;
    s.latestY = s.baseY + dy;
    if (!s.rafPending) {
      s.rafPending = true;
      requestAnimationFrame(() => {
        s.rafPending = false;
        const el = rootRef.current;
        if (el) {
          el.style.transform = `translate3d(${s.latestX}px, ${s.latestY}px, 0)`;
        }
      });
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const s = dragState.current;
      if (!s.dragging) return;
      s.dragging = false;
      try {
        if (e.currentTarget && "releasePointerCapture" in e.currentTarget) {
          (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        }
      } catch {}
      rootRef.current?.classList.remove("dragging");

      if (!s.moved) {
        onOpen();
        return;
      }
      // Free positioning — commit exactly where the pointer was released
      onCommit(s.latestX, s.latestY);
    },
    [onCommit, onOpen]
  );

  return (
    <div
      ref={rootRef}
      className="desktop-icon absolute z-10 flex flex-col items-center gap-1.5 px-2 py-2 select-none"
      style={{
        left: 0,
        top: 0,
        width: ICON_WIDTH,
        cursor: "pointer",
        touchAction: "none",
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <DesktopIconSvg type={item.type} />
      <span
        className="pointer-events-none text-center text-[14px] leading-[1.15]"
        style={{
          fontFamily: "var(--font-kalam), cursive",
          color: "var(--color-desktop-label)",
          fontWeight: 700,
          whiteSpace: "pre-line",
          letterSpacing: "0.01em",
        }}
      >
        {item.label}
      </span>
    </div>
  );
}

/**
 * Hand-drawn SVG icons — every path is a wobbly, imperfect ink stroke.
 * Curves are slightly uneven, corners don't meet cleanly, fills are
 * warm cream paper. Meant to look like someone sketched them in a
 * notebook margin rather than a designer vector-drew them.
 */
function DesktopIconSvg({ type, size = 58 }: { type: IconType; size?: number }) {
  const height = Math.round((size * 50) / 58);
  const INK = "#1a1814";        // fountain pen
  const PENCIL = "#6a5d48";     // pencil stroke for secondary lines
  const PAPER = "#fff7e5";      // cream fill
  const WARM = "#e8c98f";       // warm highlight for folder bodies
  const RED = "#c24a2e";        // occasional stamp/mark

  if (type === "folder") {
    return (
      <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none" style={{ overflow: "visible" }}>
        {/* Folder tab — wobbly rectangle */}
        <path
          d="M9 10 Q 11 4, 14 5 L 27 4 Q 31 6, 32 9 L 32 12 L 9 12 Z"
          fill={WARM}
          stroke={INK}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Folder body — wobbly square with slight imperfection */}
        <path
          d="M5 12 Q 4 14, 5 16 L 5 42 Q 7 45, 10 44 L 49 44 Q 52 43, 51 40 L 51 14 Q 50 11, 47 12 L 9 12 Q 6 11, 5 12 Z"
          fill={WARM}
          stroke={INK}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* A tiny inside line suggesting papers inside */}
        <line x1="14" y1="22" x2="42" y2="22" stroke={PENCIL} strokeWidth="0.6" opacity="0.7" />
      </svg>
    );
  }

  if (type === "envelope") {
    return (
      <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none" style={{ overflow: "visible" }}>
        {/* Envelope body — slightly imperfect rectangle */}
        <path
          d="M7 8 Q 6 10, 7 12 L 7 40 Q 8 44, 12 43 L 45 43 Q 50 42, 49 38 L 49 10 Q 48 7, 45 8 L 10 8 Q 7 7, 7 8 Z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* The flap — pen stroke triangle */}
        <path
          d="M7 10 Q 17 20, 28 25 Q 39 20, 49 10"
          stroke={INK}
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Wax seal — red stamp dot */}
        <circle cx="40" cy="34" r="3.5" fill={RED} opacity="0.85" />
        <circle cx="40" cy="34" r="3.5" stroke={INK} strokeWidth="0.8" fill="none" />
      </svg>
    );
  }

  if (type === "clipboard") {
    return (
      <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none" style={{ overflow: "visible" }}>
        {/* Clipboard base — a slightly wobbly paper rectangle */}
        <path
          d="M11 10 Q 10 12, 11 14 L 11 44 Q 12 46, 14 45 L 39 45 Q 42 44, 41 42 L 41 13 Q 40 10, 38 11 L 13 11 Q 11 10, 11 10 Z"
          fill={PAPER}
          stroke={INK}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        {/* Clip at the top — pinched rectangle */}
        <path
          d="M19 4 L 33 4 Q 35 5, 35 7 L 35 11 L 17 11 L 17 7 Q 17 4, 19 4 Z"
          fill={WARM}
          stroke={INK}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Hand-drawn lines inside */}
        <path d="M16 20 Q 25 19, 36 20" stroke={PENCIL} strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M16 26 Q 25 25, 34 26" stroke={PENCIL} strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M16 32 Q 24 31, 32 33" stroke={PENCIL} strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M16 38 Q 22 37, 28 38" stroke={PENCIL} strokeWidth="0.9" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // file — sketched single sheet with a dog-ear corner
  return (
    <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none" style={{ overflow: "visible" }}>
      {/* Paper outline */}
      <path
        d="M12 4 Q 11 5, 11 7 L 11 44 Q 12 46, 14 45 L 42 45 Q 45 44, 45 42 L 45 14 L 36 4 Q 35 3, 33 4 L 13 4 Q 12 4, 12 4 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Folded corner — the dog-ear */}
      <path
        d="M36 4 L 36 13 Q 37 15, 39 14 L 45 14"
        stroke={INK}
        strokeWidth="1.2"
        fill="none"
        strokeLinejoin="round"
      />
      {/* Content lines — wobbly pencil */}
      <path d="M17 22 Q 26 21, 39 22" stroke={PENCIL} strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M17 28 Q 24 27, 34 28" stroke={PENCIL} strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <path d="M17 34 Q 22 33, 30 34" stroke={PENCIL} strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </svg>
  );
}
