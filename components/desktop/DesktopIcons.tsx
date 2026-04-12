"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";

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

type IconType = "folder" | "envelope" | "file";

interface DesktopItem {
  id: string;
  label: string;
  type: IconType;
  appId: string;
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
];

// Grid cell size — icons snap to multiples of these on drop
const GRID_COL_W = 104;
const GRID_ROW_H = 96;
const GRID_OFFSET_X = 12;
const GRID_OFFSET_Y = 12;

const DEFAULT_POSITIONS: Record<string, IconPos> = {
  germany: { x: GRID_OFFSET_X, y: GRID_OFFSET_Y + GRID_ROW_H * 0 },
  austria: { x: GRID_OFFSET_X, y: GRID_OFFSET_Y + GRID_ROW_H * 1 },
  india: { x: GRID_OFFSET_X, y: GRID_OFFSET_Y + GRID_ROW_H * 2 },
  contact: { x: GRID_OFFSET_X, y: GRID_OFFSET_Y + GRID_ROW_H * 3 },
  about: { x: GRID_OFFSET_X, y: GRID_OFFSET_Y + GRID_ROW_H * 4 },
  buildlog: { x: GRID_OFFSET_X, y: GRID_OFFSET_Y + GRID_ROW_H * 5 },
};

const ICON_WIDTH = 104;
const ICON_HEIGHT = 88;
const DRAG_THRESHOLD_PX = 5;

function snapToGrid(x: number, y: number): IconPos {
  const col = Math.round((x - GRID_OFFSET_X) / GRID_COL_W);
  const row = Math.round((y - GRID_OFFSET_Y) / GRID_ROW_H);
  return {
    x: GRID_OFFSET_X + col * GRID_COL_W,
    y: GRID_OFFSET_Y + row * GRID_ROW_H,
  };
}

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

export function DesktopIcons() {
  const { openWindow } = useWindowManager();
  const isMobile = useIsMobile();
  // Session-only state — positions reset on refresh
  const [positions, setPositions] = useState<Record<string, IconPos>>(DEFAULT_POSITIONS);

  // On small screens, render icons as a horizontally scrollable row pinned
  // to the top of the desktop area. Dragging is disabled — tapping opens.
  if (isMobile) {
    return (
      <div
        className="absolute left-0 right-0 top-0 z-[400] overflow-x-auto overflow-y-hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex w-max items-start gap-2 px-3 py-2">
          {DESKTOP_ITEMS.map((item) => (
            <button
              key={item.id}
              className="flex w-[76px] shrink-0 flex-col items-center gap-1 px-1 py-1 select-none"
              onClick={() => openWindow(item.appId)}
            >
              <DesktopIconSvg type={item.type} size={44} />
              <span
                className="w-full truncate text-center text-[10.5px] font-medium leading-[1.2]"
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
    );
  }

  return (
    <>
      {DESKTOP_ITEMS.map((item) => (
        <DraggableIcon
          key={item.id}
          item={item}
          position={positions[item.id] ?? DEFAULT_POSITIONS[item.id]}
          onOpen={() => openWindow(item.appId)}
          onDrop={(x, y) => {
            const snapped = snapToGrid(x, y);
            setPositions((prev) => ({
              ...prev,
              [item.id]: clampPosition(snapped.x, snapped.y),
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
  onDrop: (x: number, y: number) => void;
}

function DraggableIcon({ item, position, onOpen, onDrop }: DraggableIconProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    dragging: false,
    draggedEnough: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    latestX: 0,
    latestY: 0,
    rafPending: false,
  });

  // Animating flag is React state so CSS transition can turn on/off
  const [animating, setAnimating] = useState(false);
  // isDragging is React state so we can apply translucent styling
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const s = dragState.current;
      s.dragging = true;
      s.draggedEnough = false;
      s.startX = e.clientX;
      s.startY = e.clientY;
      s.offsetX = e.clientX - position.x;
      s.offsetY = e.clientY - position.y;
      s.latestX = position.x;
      s.latestY = position.y;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    },
    [position.x, position.y]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const s = dragState.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.startX;
    const dy = e.clientY - s.startY;
    if (!s.draggedEnough) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      s.draggedEnough = true;
      setIsDragging(true);
    }
    s.latestX = e.clientX - s.offsetX;
    s.latestY = e.clientY - s.offsetY;
    // Direct DOM write inside rAF — no React re-render during drag
    if (!s.rafPending) {
      s.rafPending = true;
      requestAnimationFrame(() => {
        s.rafPending = false;
        if (rootRef.current) {
          rootRef.current.style.left = `${s.latestX}px`;
          rootRef.current.style.top = `${s.latestY}px`;
        }
      });
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const s = dragState.current;
      try {
        if (e.currentTarget && "releasePointerCapture" in e.currentTarget) {
          (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        }
      } catch {}
      const wasDragging = s.draggedEnough;
      s.dragging = false;
      s.draggedEnough = false;

      if (!wasDragging) {
        // Pure click — open the window
        onOpen();
        return;
      }

      // Drag ended — pop into the nearest grid cell.
      // Enable CSS transition briefly, then commit state so React sets left/top.
      setIsDragging(false);
      setAnimating(true);
      onDrop(s.latestX, s.latestY);
      // Turn off transition after it finishes (250ms)
      window.setTimeout(() => setAnimating(false), 280);
    },
    [onDrop, onOpen]
  );

  // Compose style: during drag, position is written directly to DOM (rAF)
  // and we only toggle opacity. On drop, React sets the snapped left/top
  // and the `animating` class adds a transition so it "pops" into place.
  const style: React.CSSProperties = {
    left: position.x,
    top: position.y,
    width: ICON_WIDTH,
    cursor: "pointer",
    touchAction: "none",
    opacity: isDragging ? 0.45 : 1,
    // During a snap-back transition, animate left/top and a subtle scale
    transition: animating
      ? "left 0.22s cubic-bezier(0.2, 1.4, 0.4, 1), top 0.22s cubic-bezier(0.2, 1.4, 0.4, 1), transform 0.22s ease-out"
      : "opacity 0.1s ease-out",
    transform: animating ? "scale(1.08)" : "scale(1)",
    willChange: isDragging ? "left, top" : undefined,
  };

  return (
    <div
      ref={rootRef}
      className="desktop-icon absolute z-10 flex flex-col items-center gap-1.5 px-2 py-2 select-none"
      style={style}
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
