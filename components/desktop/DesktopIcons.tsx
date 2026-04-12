"use client";

import { useWindowManager } from "@/hooks/use-window-manager";

type IconType = "folder" | "envelope" | "file";

interface DesktopItem {
  id: string;
  label: string;
  type: IconType;
  appId: string;
}

const DESKTOP_ITEMS: DesktopItem[] = [
  { id: "germany", label: "germany", type: "folder", appId: "folder-germany" },
  { id: "austria", label: "austria", type: "folder", appId: "folder-austria" },
  { id: "india", label: "india", type: "folder", appId: "folder-india" },
  { id: "contact", label: "Contact", type: "envelope", appId: "contact" },
  { id: "about", label: "about.txt", type: "file", appId: "about-txt" },
  { id: "buildlog", label: "build-log.md", type: "file", appId: "build-log-md" },
];

export function DesktopIcons() {
  const { openWindow } = useWindowManager();

  return (
    <div className="absolute left-2 top-3 z-10 flex flex-col gap-2">
      {DESKTOP_ITEMS.map((item) => (
        <button
          key={item.id}
          className="desktop-icon flex w-[104px] flex-col items-center gap-1.5 px-2 py-2"
          onDoubleClick={() => openWindow(item.appId)}
          onClick={() => openWindow(item.appId)}
        >
          <DesktopIconSvg type={item.type} />
          <span
            className="text-center text-[12.5px] font-medium leading-[1.2]"
            style={{
              color: "var(--color-desktop-label)",
              textShadow: "1px 1px 2px rgba(0,0,0,0.5), 0 0 3px rgba(0,0,0,0.3)",
              whiteSpace: "pre-line",
            }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

function DesktopIconSvg({ type }: { type: IconType }) {
  if (type === "folder") {
    return (
      <svg width="58" height="50" viewBox="0 0 56 48" fill="none">
        <rect x="10" y="4" width="20" height="7" fill="#e8dbc2" stroke="#3a1a06" strokeWidth="1"/>
        <rect x="5" y="10" width="46" height="34" fill="#8b3e14" stroke="#3a1a06" strokeWidth="2"/>
      </svg>
    );
  }

  if (type === "envelope") {
    return (
      <svg width="58" height="50" viewBox="0 0 56 48" fill="none">
        <rect x="7" y="4" width="42" height="40" fill="#f5e7d0" stroke="#3a2817" strokeWidth="2"/>
        <rect x="17" y="16" width="22" height="16" fill="none" stroke="#3a2817" strokeWidth="1.5"/>
        <path d="M17 16L28 25L39 16" stroke="#3a2817" strokeWidth="1.5" fill="none"/>
      </svg>
    );
  }

  // file
  return (
    <svg width="58" height="50" viewBox="0 0 56 48" fill="none">
      <path d="M11 4 L36 4 L45 13 L45 44 L11 44 Z" fill="#f5e7d0" stroke="#3a2817" strokeWidth="2"/>
      <path d="M36 4 L36 13 L45 13" fill="#d4c4a8" stroke="#3a2817" strokeWidth="2"/>
      <line x1="17" y1="22" x2="39" y2="22" stroke="#9c8260" strokeWidth="1.2"/>
      <line x1="17" y1="28" x2="33" y2="28" stroke="#9c8260" strokeWidth="1.2"/>
    </svg>
  );
}
