"use client";

import { useCallback, useRef } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { useLocalStorage } from "@/hooks/use-local-storage";

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

const DEFAULT_POSITIONS: Record<string, IconPos> = {
  germany: { x: 12, y: 12 },
  austria: { x: 12, y: 108 },
  india: { x: 12, y: 204 },
  contact: { x: 12, y: 300 },
  about: { x: 12, y: 396 },
  buildlog: { x: 12, y: 492 },
};

const STORAGE_KEY = "os-folio:icon-positions";
const ICON_WIDTH = 104;
const ICON_HEIGHT = 88;
const DRAG_THRESHOLD_PX = 5;

/** Keep the icon within the visible desktop area (above dock, not fully off-screen). */
function clampPosition(x: number, y: number): IconPos {
  if (typeof window === "undefined") return { x, y };
  const vw = window.innerWidth;
  const contentH = window.innerHeight - 34; // minus menu bar
  const dockReserve = 90; // keep icons above the dock
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
  const [positions, setPositions] = useLocalStorage<Record<string, IconPos>>(
    STORAGE_KEY,
    DEFAULT_POSITIONS
  );

  return (
    <>
      {DESKTOP_ITEMS.map((item) => {
        const pos = positions[item.id] ?? DEFAULT_POSITIONS[item.id] ?? { x: 12, y: 12 };
        return (
          <DraggableIcon
            key={item.id}
            item={item}
            position={pos}
            onOpen={() => openWindow(item.appId)}
            onMove={(newPos) => {
              setPositions((prev) => ({ ...prev, [item.id]: clampPosition(newPos.x, newPos.y) }));
            }}
          />
        );
      })}
    </>
  );
}

interface DraggableIconProps {
  item: DesktopItem;
  position: IconPos;
  onOpen: () => void;
  onMove: (pos: IconPos) => void;
}

function DraggableIcon({ item, position, onOpen, onMove }: DraggableIconProps) {
  const isDragging = useRef(false);
  const draggedEnough = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const startPointer = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      draggedEnough.current = false;
      startPointer.current = { x: e.clientX, y: e.clientY };
      dragOffset.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    },
    [position.x, position.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - startPointer.current.x;
      const dy = e.clientY - startPointer.current.y;
      if (!draggedEnough.current && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      draggedEnough.current = true;
      onMove({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    },
    [onMove]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      try {
        if (e.currentTarget && "releasePointerCapture" in e.currentTarget) {
          (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        }
      } catch {}
      const wasDragging = draggedEnough.current;
      isDragging.current = false;
      draggedEnough.current = false;
      if (!wasDragging) {
        onOpen();
      }
    },
    [onOpen]
  );

  return (
    <div
      className="desktop-icon absolute z-10 flex flex-col items-center gap-1.5 px-2 py-2 select-none"
      style={{
        left: position.x,
        top: position.y,
        width: ICON_WIDTH,
        cursor: "pointer",
        touchAction: "none",
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

function DesktopIconSvg({ type }: { type: IconType }) {
  if (type === "folder") {
    return (
      <svg width="58" height="50" viewBox="0 0 56 48" fill="none" className="pointer-events-none">
        <rect x="10" y="4" width="20" height="7" fill="#e8dbc2" stroke="#3a1a06" strokeWidth="1" />
        <rect x="5" y="10" width="46" height="34" fill="#8b3e14" stroke="#3a1a06" strokeWidth="2" />
      </svg>
    );
  }

  if (type === "envelope") {
    return (
      <svg width="58" height="50" viewBox="0 0 56 48" fill="none" className="pointer-events-none">
        <rect x="7" y="4" width="42" height="40" fill="#f5e7d0" stroke="#3a2817" strokeWidth="2" />
        <rect x="17" y="16" width="22" height="16" fill="none" stroke="#3a2817" strokeWidth="1.5" />
        <path d="M17 16L28 25L39 16" stroke="#3a2817" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  // file
  return (
    <svg width="58" height="50" viewBox="0 0 56 48" fill="none" className="pointer-events-none">
      <path d="M11 4 L36 4 L45 13 L45 44 L11 44 Z" fill="#f5e7d0" stroke="#3a2817" strokeWidth="2" />
      <path d="M36 4 L36 13 L45 13" fill="#d4c4a8" stroke="#3a2817" strokeWidth="2" />
      <line x1="17" y1="22" x2="39" y2="22" stroke="#9c8260" strokeWidth="1.2" />
      <line x1="17" y1="28" x2="33" y2="28" stroke="#9c8260" strokeWidth="1.2" />
    </svg>
  );
}
