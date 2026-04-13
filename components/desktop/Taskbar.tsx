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

const DOCK_ICONS: Record<string, React.ReactNode> = {
  about: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="3" y="2" width="14" height="16" fill="none"/>
      <rect x="9" y="5" width="2" height="2" fill="white" stroke="none"/>
      <rect x="9" y="8" width="2" height="7" fill="white" stroke="none"/>
    </svg>
  ),
  blog: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="4" y="2" width="12" height="16" fill="none"/>
      <line x1="7" y1="6" x2="13" y2="6"/>
      <line x1="7" y1="9" x2="13" y2="9"/>
      <line x1="7" y1="12" x2="13" y2="12"/>
      <line x1="7" y1="15" x2="11" y2="15"/>
    </svg>
  ),
  contact: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="2" y="5" width="16" height="11" fill="none"/>
      <path d="M2 5L10 12L18 5"/>
    </svg>
  ),
  experience: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="3" y="4" width="2" height="2" fill="white" stroke="none"/>
      <line x1="7" y1="5" x2="17" y2="5"/>
      <rect x="3" y="9" width="2" height="2" fill="white" stroke="none"/>
      <line x1="7" y1="10" x2="17" y2="10"/>
      <rect x="3" y="14" width="2" height="2" fill="white" stroke="none"/>
      <line x1="7" y1="15" x2="17" y2="15"/>
    </svg>
  ),
  help: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="3" y="2" width="14" height="16" fill="none"/>
      <path d="M8 7C8 6 9 5 10 5C11 5 12 6 12 7C12 8 10 8 10 10" fill="none"/>
      <rect x="9" y="13" width="2" height="2" fill="white" stroke="none"/>
    </svg>
  ),
  search: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="3" y="3" width="9" height="9" fill="none"/>
      <line x1="12" y1="12" x2="17" y2="17" strokeWidth="2"/>
    </svg>
  ),
  settings: (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  terminal: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="2" y="3" width="16" height="14" fill="none"/>
      <path d="M5 7L8 10L5 13" fill="none"/>
      <line x1="10" y1="13" x2="15" y2="13"/>
    </svg>
  ),
  works: (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
      <rect x="2" y="6" width="16" height="12" fill="none"/>
      <path d="M7 6V4C7 3 8 3 8 3H12C12 3 13 3 13 4V6" fill="none"/>
    </svg>
  ),
};

export function Taskbar() {
  const { windows, openWindow, focusWindow, restoreWindow, minimizeWindow } = useWindowManager();
  const isMobile = useIsMobile();
  const apps = isMobile ? DOCK_APPS_MOBILE : DOCK_APPS;

  return (
    <div className="absolute bottom-5 left-1/2 z-[600] -translate-x-1/2 md:bottom-2">
      <div
        className="flex items-center justify-center gap-1.5 border-2 px-3 py-3 md:w-auto md:gap-2 md:px-3 md:py-2"
        style={{
          background: "var(--color-dock-bg)",
          borderColor: "var(--color-dock-border)",
          width: isMobile ? "calc(100vw - 16px)" : undefined,
          maxWidth: "calc(100vw - 12px)",
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
                className="flex h-10 w-10 items-center justify-center border-2 transition-colors md:h-12 md:w-12"
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
                <span className="scale-[0.8] md:scale-100">
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
