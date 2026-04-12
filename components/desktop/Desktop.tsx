"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeContext, useThemeProvider } from "@/hooks/use-theme";
import {
  WindowManagerContext,
  useWindowManagerProvider,
} from "@/hooks/use-window-manager";
import { BootScreen } from "./BootScreen";
import { MenuBar } from "./MenuBar";
import { Taskbar } from "./Taskbar";
import { Wallpaper } from "./Wallpaper";
import { DesktopIcons } from "./DesktopIcons";
import { Window } from "@/components/window/Window";
import { APP_REGISTRY } from "@/lib/constants";
import { FOLDER_CONTENTS, type FolderItem } from "@/content/folder-files";
import { LLM_TXT } from "@/content/text-files";

// Kick off image preloading right after the desktop mounts so thumbnails
// are cached by the time the user opens a folder window.
function useFolderImagePreload() {
  useEffect(() => {
    const srcs: string[] = [];
    Object.values(FOLDER_CONTENTS).forEach((folder) => {
      folder.items.forEach((it: FolderItem) => {
        if (it.type === "image" && it.src) srcs.push(it.src);
      });
    });
    // Defer past the first paint so boot animation isn't jankier than it
    // already is.
    const handle = window.setTimeout(() => {
      srcs.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }, 300);
    return () => window.clearTimeout(handle);
  }, []);
}

import { AboutApp } from "@/components/apps/AboutApp";
import { WorksApp } from "@/components/apps/WorksApp";
import { ExperienceApp } from "@/components/apps/ExperienceApp";
import { BlogApp } from "@/components/apps/BlogApp";
import { ContactApp } from "@/components/apps/ContactApp";
import { TerminalApp } from "@/components/apps/TerminalApp";
import { SettingsApp } from "@/components/apps/SettingsApp";
import { HelpApp } from "@/components/apps/HelpApp";
import { SearchApp } from "@/components/apps/SearchApp";
import {
  GermanyFolder,
  AustriaFolder,
  IndiaFolder,
} from "@/components/apps/PhotoGalleryApp";
import {
  AboutTxtApp,
  BuildLogApp,
  LlmTxtApp,
  GermanyNotesApp,
  AustriaNotesApp,
  IndiaNotesApp,
} from "@/components/apps/TextEditorApp";
import { SiteStatsApp } from "@/components/apps/SiteStatsApp";
import { ImageViewerApp } from "@/components/apps/ImageViewerApp";

const APP_COMPONENTS: Record<string, React.ComponentType> = {
  about: AboutApp,
  works: WorksApp,
  experience: ExperienceApp,
  blog: BlogApp,
  contact: ContactApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  help: HelpApp,
  search: SearchApp,
  "folder-germany": GermanyFolder,
  "folder-austria": AustriaFolder,
  "folder-india": IndiaFolder,
  "about-txt": AboutTxtApp,
  "build-log-md": BuildLogApp,
  "llm-txt": LlmTxtApp,
  "germany-notes": GermanyNotesApp,
  "austria-notes": AustriaNotesApp,
  "india-notes": IndiaNotesApp,
  "image-viewer": ImageViewerApp,
  stats: SiteStatsApp,
};

// Simple secret sequence: up up down down
const SECRET_SEQUENCE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown"];

export function Desktop() {
  const theme = useThemeProvider();
  const windowManager = useWindowManagerProvider();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  // Once unlocked, clicking llm.txt on the desktop also opens the viewer.
  // Before unlock, clicking only copies to clipboard.
  const [llmUnlocked, setLlmUnlocked] = useState(false);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  };

  useFolderImagePreload();

  // Type ↑ ↑ ↓ ↓ anywhere on the page (outside of inputs) to unlock
  // llm.txt so the viewer window opens on click.
  useEffect(() => {
    let idx = 0;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.key === SECRET_SEQUENCE[idx]) {
        idx += 1;
        if (idx === SECRET_SEQUENCE.length) {
          idx = 0;
          setLlmUnlocked(true);
          windowManager.openWindow("llm-txt");
          navigator.clipboard
            .writeText(LLM_TXT)
            .then(() => showToast("llm.txt unlocked · copied to clipboard"))
            .catch(() => showToast("llm.txt unlocked · clipboard blocked"));
        }
      } else {
        idx = e.key === SECRET_SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [windowManager]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        const focused = windowManager.getFocusedAppId();
        if (focused) windowManager.closeWindow(focused);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        windowManager.openWindow("search");
      }
      // Cmd+Opt combinations
      if ((e.metaKey || e.ctrlKey) && e.altKey) {
        const focused = windowManager.getFocusedAppId();
        const key = e.key.toLowerCase();
        if (key === "w" && focused) {
          e.preventDefault();
          windowManager.closeWindow(focused);
        } else if (key === "f" && focused) {
          e.preventDefault();
          windowManager.maximizeWindow(focused);
        } else if (key === "m" && focused) {
          e.preventDefault();
          windowManager.minimizeWindow(focused);
        } else if (key === "c" && focused) {
          e.preventDefault();
          windowManager.centerWindow(focused);
        } else if (key === "r") {
          e.preventDefault();
          window.location.reload();
        } else if (key === "a") {
          e.preventDefault();
          windowManager.openWindow("about");
        } else if (key === "k") {
          e.preventDefault();
          windowManager.openWindow("contact");
        } else if (key === "h") {
          e.preventDefault();
          windowManager.openWindow("help");
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [windowManager]);

  return (
    <ThemeContext value={theme}>
      <WindowManagerContext value={windowManager}>
        <BootScreen />
        <div className="desktop-brightness relative h-dvh w-full select-none">
          <Wallpaper />
          <MenuBar />

          <div
            id="desktop-content"
            className="absolute inset-0 bottom-0"
            style={{ top: "34px" }}
            tabIndex={-1}
          >
            {/* Desktop shortcut icons */}
            <DesktopIcons llmUnlocked={llmUnlocked} onToast={showToast} />

            {/* Window layer */}
            <div className="absolute inset-0 overflow-hidden">
              {windowManager.windows
                .filter((w) => w.isOpen && !w.isMinimized)
                .map((w) => {
                  const AppComponent = APP_COMPONENTS[w.appId];
                  const appDef = APP_REGISTRY[w.appId];
                  if (!AppComponent || !appDef) return null;
                  // For folder windows, show the item count from the folder data
                  let itemCount: number | undefined;
                  if (w.appId.startsWith("folder-")) {
                    const folderId = w.appId.replace("folder-", "");
                    itemCount = FOLDER_CONTENTS[folderId]?.items.length;
                  }
                  const isSearch = w.appId === "search";
                  return (
                    <Window
                      key={w.appId}
                      appId={w.appId}
                      itemCount={itemCount}
                      showMinimize={!isSearch}
                      showMaximize={!isSearch}
                    >
                      <AppComponent />
                    </Window>
                  );
                })}
            </div>
          </div>

          <Taskbar />

          {toast && (
            <div
              className="pointer-events-none absolute bottom-24 left-1/2 z-[700] -translate-x-1/2 whitespace-nowrap border-2 px-4 py-2 text-[12.5px] font-medium"
              style={{
                background: "var(--color-surface-solid)",
                borderColor: "var(--color-border-strong)",
                color: "var(--color-text)",
                boxShadow: "4px 4px 0 var(--color-window-shadow)",
              }}
            >
              {toast}
            </div>
          )}
        </div>
      </WindowManagerContext>
    </ThemeContext>
  );
}
