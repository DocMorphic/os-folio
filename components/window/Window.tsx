"use client";

import { useCallback, useRef } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { APP_REGISTRY } from "@/lib/constants";
import { WindowTitleBar } from "./WindowTitleBar";
import { WindowContent } from "./WindowContent";

interface WindowProps {
  appId: string;
  children: React.ReactNode;
  itemCount?: number;
  noResize?: boolean;
  showMinimize?: boolean;
  showMaximize?: boolean;
}

export function Window({
  appId,
  children,
  itemCount,
  noResize,
  showMinimize = true,
  showMaximize = true,
}: WindowProps) {
  const {
    windows,
    windowStatuses,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    updatePosition,
    updateSize,
    getFocusedAppId,
  } = useWindowManager();

  const windowState = windows.find((w) => w.appId === appId);
  const appDef = APP_REGISTRY[appId];
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const isFocused = getFocusedAppId() === appId;
  const statusText = windowStatuses[appId];

  // === Drag handlers ===
  const handleDragDown = useCallback(
    (e: React.PointerEvent) => {
      if (!windowState) return;
      isDragging.current = true;
      dragOffset.current = {
        x: e.clientX - windowState.position.x,
        y: e.clientY - windowState.position.y,
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      focusWindow(appId);
    },
    [appId, focusWindow, windowState]
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      updatePosition(appId, {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    },
    [appId, updatePosition]
  );

  const handleDragUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      if (e.currentTarget && "releasePointerCapture" in e.currentTarget) {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      }
    } catch {}
  }, []);

  // === Resize handlers ===
  const handleResizeDown = useCallback(
    (e: React.PointerEvent) => {
      if (!windowState) return;
      e.stopPropagation();
      e.preventDefault();
      isResizing.current = true;
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        w: windowState.size.width,
        h: windowState.size.height,
      };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
      focusWindow(appId);
    },
    [appId, focusWindow, windowState]
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing.current) return;
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      updateSize(appId, {
        width: resizeStart.current.w + dx,
        height: resizeStart.current.h + dy,
      });
    },
    [appId, updateSize]
  );

  const handleResizeUp = useCallback((e: React.PointerEvent) => {
    isResizing.current = false;
    try {
      if (e.currentTarget && "releasePointerCapture" in e.currentTarget) {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      }
    } catch {}
  }, []);

  // === Button handlers with defensive reset ===
  const handleClose = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
    closeWindow(appId);
  }, [appId, closeWindow]);

  const handleMinimize = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
    minimizeWindow(appId);
  }, [appId, minimizeWindow]);

  const handleMaximize = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
    maximizeWindow(appId);
  }, [appId, maximizeWindow]);

  if (!windowState || !appDef) return null;

  return (
    <div
      className="window-enter absolute flex flex-col overflow-hidden border-2"
      style={{
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height,
        zIndex: windowState.zIndex,
        background: "var(--color-surface-solid)",
        borderColor: "var(--color-border-strong)",
        boxShadow: "4px 4px 0 rgba(60, 30, 5, 0.25)",
      }}
      onMouseDown={() => focusWindow(appId)}
      role="dialog"
      aria-label={appDef.title}
    >
      <WindowTitleBar
        title={appDef.title}
        isFocused={isFocused}
        itemCount={itemCount}
        statusText={statusText}
        showMinimize={showMinimize}
        showMaximize={showMaximize}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onPointerDown={handleDragDown}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragUp}
      />
      <WindowContent>{children}</WindowContent>

      {/* Resize handle — visible diagonal grip */}
      {!noResize && (
        <div
          className="resize-handle"
          onPointerDown={handleResizeDown}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeUp}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Resize window"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.8 }}>
            <rect x="12" y="4" width="2" height="2" fill="var(--color-text-muted)" />
            <rect x="12" y="8" width="2" height="2" fill="var(--color-text-muted)" />
            <rect x="8" y="8" width="2" height="2" fill="var(--color-text-muted)" />
            <rect x="12" y="12" width="2" height="2" fill="var(--color-text-muted)" />
            <rect x="8" y="12" width="2" height="2" fill="var(--color-text-muted)" />
            <rect x="4" y="12" width="2" height="2" fill="var(--color-text-muted)" />
          </svg>
        </div>
      )}
    </div>
  );
}
