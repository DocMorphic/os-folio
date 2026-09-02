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

type IconType = "folder" | "envelope" | "file" | "clipboard" | "pdf";

interface DesktopItem {
  id: string;
  label: string;
  type: IconType;
  appId?: string;
  downloadHref?: string;
  downloadName?: string;
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
  {
    id: "cv",
    label: "CV.pdf",
    type: "pdf",
    downloadHref: "/cv.pdf",
    downloadName: "Dharmay Dave CV.pdf",
  },
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
  cv: { x: INITIAL_X + INITIAL_COL_STEP, y: INITIAL_Y + INITIAL_ROW_STEP * 1 },
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
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);
  // Session-only state — positions reset on refresh
  const [positions, setPositions] = useState<Record<string, IconPos>>(DEFAULT_POSITIONS);

  const updateScrollHint = useCallback(() => {
    const row = mobileScrollRef.current;
    if (!row) return;
    setShowScrollHint(row.scrollLeft + row.clientWidth < row.scrollWidth - 8);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const frame = window.requestAnimationFrame(updateScrollHint);
    return () => window.cancelAnimationFrame(frame);
  }, [isMobile, updateScrollHint]);

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
      // Downloadable files (e.g. the CV) trigger a browser download.
      if (item.downloadHref) {
        const a = document.createElement("a");
        a.href = item.downloadHref;
        a.download = item.downloadName ?? "";
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        onToast(`${item.label} downloaded`);
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
      <div className="absolute left-0 right-0 top-0 z-[5]">
        <div
          ref={mobileScrollRef}
          className="no-scrollbar overflow-x-auto overflow-y-hidden"
          style={{
            WebkitOverflowScrolling: "touch",
            maxWidth: "100vw",
          }}
          onScroll={updateScrollHint}
        >
          <div className="flex w-max items-start gap-1 px-2 py-2.5 pr-10">
            {DESKTOP_ITEMS.map((item) => (
              <button
                key={item.id}
                className="flex w-[78px] shrink-0 flex-col items-center gap-1 px-0.5 py-1 select-none"
                onClick={() => handleActivate(item)}
              >
                <DesktopIconSvg type={item.type} size={50} />
                <span
                  className="w-full truncate text-center text-[11.5px] font-medium leading-[1.2]"
                  style={{
                    color: "var(--color-desktop-label)",
                    textShadow: "1px 1px 2px rgba(0,0,0,0.5), 0 0 3px rgba(0,0,0,0.3)",
                  }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {showScrollHint && (
          <button
            type="button"
            className="mobile-icon-scroll-hint absolute right-1 top-[24px] flex h-9 w-7 items-center justify-center border"
            style={{
              color: "var(--color-text)",
              background: "var(--color-surface-solid)",
              borderColor: "var(--color-border-strong)",
              boxShadow: "-5px 0 8px color-mix(in srgb, var(--color-bg) 75%, transparent)",
            }}
            onClick={() => mobileScrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
            aria-label="Scroll desktop icons right"
          >
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" aria-hidden="true">
              <path d="M4 3L10 9L4 15" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </button>
        )}
      </div>
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
        className="pointer-events-none text-center text-[12.5px] font-medium leading-[1.2]"
        style={{
          color: "var(--color-desktop-label)",
          textShadow: "1px 1px 2px rgba(0,0,0,0.5), 0 0 3px rgba(0,0,0,0.3)",
          whiteSpace: "pre-line",
        }}
      >
        {item.label}
      </span>
    </div>
  );
}

function DesktopIconSvg({ type, size = 58 }: { type: IconType; size?: number }) {
  const height = Math.round((size * 50) / 58);
  if (type === "folder") {
    return (
      <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none">
        <rect x="10" y="4" width="20" height="7" fill="#e8dbc2" stroke="#3a1a06" strokeWidth="0.8" />
        <rect x="5" y="10" width="46" height="34" fill="#8b3e14" stroke="#3a1a06" strokeWidth="0.8" />
      </svg>
    );
  }

  if (type === "envelope") {
    return (
      <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none">
        <rect x="7" y="4" width="42" height="40" fill="#f5e7d0" stroke="#3a2817" strokeWidth="0.8" />
        <rect x="17" y="16" width="22" height="16" fill="none" stroke="#3a2817" strokeWidth="1" />
        <path d="M17 16L28 25L39 16" stroke="#3a2817" strokeWidth="1" fill="none" />
      </svg>
    );
  }

  if (type === "clipboard") {
    return (
      <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none">
        {/* Clipboard base */}
        <rect x="11" y="8" width="30" height="36" fill="#f5e7d0" stroke="#3a2817" strokeWidth="0.8" />
        {/* Clip at the top */}
        <rect x="19" y="4" width="14" height="6" fill="#8b5a2b" stroke="#3a2817" strokeWidth="0.8" />
        {/* Text lines */}
        <line x1="16" y1="18" x2="36" y2="18" stroke="#9c8260" strokeWidth="0.8" />
        <line x1="16" y1="23" x2="34" y2="23" stroke="#9c8260" strokeWidth="0.8" />
        <line x1="16" y1="28" x2="36" y2="28" stroke="#9c8260" strokeWidth="0.8" />
        <line x1="16" y1="33" x2="30" y2="33" stroke="#9c8260" strokeWidth="0.8" />
      </svg>
    );
  }

  if (type === "pdf") {
    return (
      <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none">
        {/* Document silhouette with corner fold, same palette as the file icon */}
        <path d="M11 4 L36 4 L45 13 L45 44 L11 44 Z" fill="#f5e7d0" stroke="#3a2817" strokeWidth="0.8" />
        <path d="M36 4 L36 13 L45 13" fill="#d4c4a8" stroke="#3a2817" strokeWidth="0.8" />
        {/* Faint text lines hinting at body copy */}
        <line x1="17" y1="22" x2="34" y2="22" stroke="#9c8260" strokeWidth="0.8" />
        <line x1="17" y1="26" x2="32" y2="26" stroke="#9c8260" strokeWidth="0.8" />
        {/* Red PDF badge stamped at the bottom */}
        <rect x="14" y="33" width="22" height="9" fill="#c93030" stroke="#3a2817" strokeWidth="0.8" />
        <text
          x="25"
          y="40"
          textAnchor="middle"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize="6.6"
          fontWeight="700"
          fill="#ffffff"
          letterSpacing="0.5"
        >
          PDF
        </text>
      </svg>
    );
  }

  // file
  return (
    <svg width={size} height={height} viewBox="0 0 56 48" fill="none" className="pointer-events-none">
      <path d="M11 4 L36 4 L45 13 L45 44 L11 44 Z" fill="#f5e7d0" stroke="#3a2817" strokeWidth="0.8" />
      <path d="M36 4 L36 13 L45 13" fill="#d4c4a8" stroke="#3a2817" strokeWidth="0.8" />
      <line x1="17" y1="22" x2="39" y2="22" stroke="#9c8260" strokeWidth="0.8" />
      <line x1="17" y1="28" x2="33" y2="28" stroke="#9c8260" strokeWidth="0.8" />
    </svg>
  );
}
