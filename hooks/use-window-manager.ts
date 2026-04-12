"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { WindowState } from "@/lib/types";
import { APP_REGISTRY } from "@/lib/constants";

// Reserved zones
const MENUBAR_HEIGHT = 34;
const DOCK_HEIGHT = 72;
const MIN_MARGIN = 12;
const MIN_W = 280;
const MIN_H = 180;
const TITLEBAR_VISIBLE_MIN = 100;

/**
 * Per-window context — stores arbitrary data an app needs to render
 * (e.g. which image the ImageViewer should show).
 */
export interface WindowContext {
  imageUrl?: string;
  imageName?: string;
  folderId?: string;
  imageIndex?: number;
  imageCount?: number;
}

interface WindowManagerContextValue {
  windows: WindowState[];
  windowStatuses: Record<string, string>;
  windowContexts: Record<string, WindowContext>;
  openWindow: (appId: string, context?: WindowContext) => void;
  closeWindow: (appId: string) => void;
  minimizeWindow: (appId: string) => void;
  restoreWindow: (appId: string) => void;
  focusWindow: (appId: string) => void;
  updatePosition: (appId: string, position: { x: number; y: number }) => void;
  updateSize: (appId: string, size: { width: number; height: number }) => void;
  centerWindow: (appId: string) => void;
  maximizeWindow: (appId: string) => void;
  setWindowStatus: (appId: string, status: string) => void;
  setWindowContext: (appId: string, patch: WindowContext) => void;
  getOpenWindows: () => WindowState[];
  getFocusedAppId: () => string | null;
}

export const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export function useWindowManager(): WindowManagerContextValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used within WindowManagerProvider");
  return ctx;
}

function clampPosition(x: number, y: number, w: number, _h: number) {
  if (typeof window === "undefined") return { x, y };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minX = TITLEBAR_VISIBLE_MIN - w;
  const maxX = vw - TITLEBAR_VISIBLE_MIN;
  const minY = 0;
  const maxY = (vh - MENUBAR_HEIGHT) - 44;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

function clampSize(w: number, h: number) {
  if (typeof window === "undefined") return { width: w, height: h };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = vw - MIN_MARGIN * 2;
  const maxH = vh - MENUBAR_HEIGHT - DOCK_HEIGHT - MIN_MARGIN * 2;
  return {
    width: Math.max(MIN_W, Math.min(maxW, w)),
    height: Math.max(MIN_H, Math.min(maxH, h)),
  };
}

export function useWindowManagerProvider(): WindowManagerContextValue {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [windowStatuses, setWindowStatuses] = useState<Record<string, string>>({});
  const [windowContexts, setWindowContexts] = useState<Record<string, WindowContext>>({});
  const zIndexCounter = useRef(10);

  const openWindow = useCallback((appId: string, context?: WindowContext) => {
    const appDef = APP_REGISTRY[appId];
    if (!appDef) return;

    // Store/merge context
    if (context) {
      setWindowContexts((prev) => ({ ...prev, [appId]: { ...prev[appId], ...context } }));
    }

    setWindows((prev) => {
      const existing = prev.find((w) => w.appId === appId);
      if (existing) {
        const newZ = ++zIndexCounter.current;
        return prev.map((w) =>
          w.appId === appId ? { ...w, isMinimized: false, zIndex: newZ } : w
        );
      }

      const newZ = ++zIndexCounter.current;
      const clampedSize = clampSize(appDef.defaultWidth, appDef.defaultHeight);

      let defaultX = appDef.defaultX;
      let defaultY = appDef.defaultY;

      if (typeof window !== "undefined") {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const contentHeight = vh - MENUBAR_HEIGHT;
        const offset = (prev.length % 5) * 24;
        defaultX = Math.max(
          MIN_MARGIN,
          Math.floor((vw - clampedSize.width) / 2) + offset
        );
        defaultY = Math.max(
          MIN_MARGIN,
          Math.floor((contentHeight - clampedSize.height - DOCK_HEIGHT) / 2) + offset
        );
      }

      const pos = clampPosition(defaultX, defaultY, clampedSize.width, clampedSize.height);

      const newWindow: WindowState = {
        appId,
        isOpen: true,
        isMinimized: false,
        zIndex: newZ,
        position: pos,
        size: clampedSize,
      };
      return [...prev, newWindow];
    });
  }, []);

  const closeWindow = useCallback((appId: string) => {
    setWindows((prev) => prev.filter((w) => w.appId !== appId));
    setWindowStatuses((prev) => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
    setWindowContexts((prev) => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
  }, []);

  const minimizeWindow = useCallback((appId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.appId === appId ? { ...w, isMinimized: true } : w))
    );
  }, []);

  const restoreWindow = useCallback((appId: string) => {
    const newZ = ++zIndexCounter.current;
    setWindows((prev) =>
      prev.map((w) => (w.appId === appId ? { ...w, isMinimized: false, zIndex: newZ } : w))
    );
  }, []);

  const focusWindow = useCallback((appId: string) => {
    setWindows((prev) => {
      const w = prev.find((win) => win.appId === appId);
      if (!w) return prev;
      // Only bump z-index if not already topmost
      const currentMax = Math.max(
        ...prev.filter((win) => win.isOpen && !win.isMinimized).map((win) => win.zIndex)
      );
      if (w.zIndex >= currentMax) return prev;
      const newZ = ++zIndexCounter.current;
      return prev.map((win) =>
        win.appId === appId ? { ...win, zIndex: newZ } : win
      );
    });
  }, []);

  const updatePosition = useCallback(
    (appId: string, position: { x: number; y: number }) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.appId !== appId) return w;
          const clamped = clampPosition(position.x, position.y, w.size.width, w.size.height);
          return { ...w, position: clamped };
        })
      );
    },
    []
  );

  const updateSize = useCallback(
    (appId: string, size: { width: number; height: number }) => {
      setWindows((prev) =>
        prev.map((w) => {
          if (w.appId !== appId) return w;
          const clamped = clampSize(size.width, size.height);
          return { ...w, size: clamped };
        })
      );
    },
    []
  );

  const centerWindow = useCallback((appId: string) => {
    if (typeof window === "undefined") return;
    const vw = window.innerWidth;
    const contentHeight = window.innerHeight - MENUBAR_HEIGHT;
    setWindows((prev) =>
      prev.map((w) => {
        if (w.appId !== appId) return w;
        const x = Math.floor((vw - w.size.width) / 2);
        const y = Math.floor((contentHeight - w.size.height - DOCK_HEIGHT) / 2);
        return { ...w, position: clampPosition(x, y, w.size.width, w.size.height) };
      })
    );
  }, []);

  const maximizeWindow = useCallback((appId: string) => {
    if (typeof window === "undefined") return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setWindows((prev) =>
      prev.map((w) => {
        if (w.appId !== appId) return w;
        const size = {
          width: vw - MIN_MARGIN * 2,
          height: vh - MENUBAR_HEIGHT - DOCK_HEIGHT - MIN_MARGIN * 2,
        };
        // Also ensure isMinimized is false and bump z-index
        return {
          ...w,
          size,
          position: { x: MIN_MARGIN, y: MIN_MARGIN },
          isMinimized: false,
          zIndex: ++zIndexCounter.current,
        };
      })
    );
  }, []);

  const setWindowStatus = useCallback((appId: string, status: string) => {
    setWindowStatuses((prev) => {
      if (prev[appId] === status) return prev;
      return { ...prev, [appId]: status };
    });
  }, []);

  const setWindowContext = useCallback((appId: string, patch: WindowContext) => {
    setWindowContexts((prev) => ({ ...prev, [appId]: { ...prev[appId], ...patch } }));
  }, []);

  const getOpenWindows = useCallback(() => windows.filter((w) => w.isOpen), [windows]);

  const getFocusedAppId = useCallback(() => {
    const visible = windows.filter((w) => w.isOpen && !w.isMinimized);
    if (visible.length === 0) return null;
    return visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b)).appId;
  }, [windows]);

  return {
    windows,
    windowStatuses,
    windowContexts,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    updatePosition,
    updateSize,
    centerWindow,
    maximizeWindow,
    setWindowStatus,
    setWindowContext,
    getOpenWindows,
    getFocusedAppId,
  };
}
