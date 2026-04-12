"use client";

import { useState, useRef, useEffect } from "react";
import { useClock } from "@/hooks/use-clock";
import { useWindowManager } from "@/hooks/use-window-manager";
import { BrightnessPopover } from "./BrightnessPopover";

const CMD_KEY = typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl";

function resetSystem() {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("os-folio:"));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {}
  window.location.reload();
}

export function MenuBar() {
  const time = useClock();
  const {
    openWindow,
    closeWindow,
    minimizeWindow,
    centerWindow,
    maximizeWindow,
    getFocusedAppId,
  } = useWindowManager();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const focusedAppId = getFocusedAppId();

  return (
    <div
      ref={menuRef}
      className="relative z-[600] flex h-[34px] items-stretch justify-between border-b-2 pr-3"
      style={{
        background: "var(--color-menubar-bg)",
        borderColor: "var(--color-menubar-border)",
      }}
    >
      {/* Left: Logo + Portfolio menu + File + View */}
      <div className="flex items-stretch">
        {/* Logo — click to open Site Stats */}
        <button
          className="flex h-[34px] w-[34px] items-center justify-center border-r-2"
          style={{
            background: "var(--color-accent)",
            borderColor: "var(--color-menubar-border)",
          }}
          onClick={() => openWindow("stats")}
          aria-label="Site stats"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="white">
            <rect x="2" y="6" width="2" height="10" />
            <rect x="5" y="3" width="2" height="13" />
            <rect x="8" y="7" width="2" height="9" />
            <rect x="11" y="2" width="2" height="14" />
            <rect x="14" y="5" width="2" height="11" />
            <rect x="17" y="8" width="2" height="8" />
          </svg>
        </button>

        {/* Portfolio dropdown menu */}
        <MenuButton
          label="Portfolio"
          isOpen={openMenu === "portfolio"}
          onClick={() => setOpenMenu(openMenu === "portfolio" ? null : "portfolio")}
          className="ml-3"
          bold
        >
          {/* Items below */}
          <MenuItem
            label="About Portfolio"
            shortcut={`${CMD_KEY}+Opt+A`}
            onClick={() => { openWindow("about"); setOpenMenu(null); }}
          />
          <MenuItem
            label="Contact Wes"
            shortcut={`${CMD_KEY}+Opt+K`}
            onClick={() => { openWindow("contact"); setOpenMenu(null); }}
          />
          <MenuItem
            label="Open Guide"
            shortcut={`${CMD_KEY}+Opt+H`}
            onClick={() => { openWindow("help"); setOpenMenu(null); }}
          />
          <MenuDivider />
          <MenuItem
            label="Settings..."
            onClick={() => { openWindow("settings"); setOpenMenu(null); }}
          />
          <MenuItem
            label="Reset System"
            onClick={() => { if (confirm("Reset all settings and reload?")) resetSystem(); }}
          />
        </MenuButton>

        {/* File Menu */}
        <MenuButton
          label="File"
          isOpen={openMenu === "file"}
          onClick={() => setOpenMenu(openMenu === "file" ? null : "file")}
          className="ml-2"
        >
          <MenuItem label="New Window" disabled />
          <MenuItem label="Open..." disabled />
          <MenuDivider />
          <MenuItem
            label="Close Window"
            shortcut={`${CMD_KEY}+Opt+W`}
            onClick={() => {
              if (focusedAppId) closeWindow(focusedAppId);
              setOpenMenu(null);
            }}
            disabled={!focusedAppId}
          />
        </MenuButton>

        {/* View Menu */}
        <MenuButton
          label="View"
          isOpen={openMenu === "view"}
          onClick={() => setOpenMenu(openMenu === "view" ? null : "view")}
          className="ml-2"
        >
          <MenuItem
            label="Refresh"
            shortcut={`${CMD_KEY}+Opt+R`}
            onClick={() => window.location.reload()}
          />
          <MenuItem
            label="Maximize"
            shortcut={`${CMD_KEY}+Opt+F`}
            onClick={() => {
              if (focusedAppId) maximizeWindow(focusedAppId);
              setOpenMenu(null);
            }}
            disabled={!focusedAppId}
          />
          <MenuItem
            label="Minimize"
            shortcut={`${CMD_KEY}+Opt+M`}
            onClick={() => {
              if (focusedAppId) minimizeWindow(focusedAppId);
              setOpenMenu(null);
            }}
            disabled={!focusedAppId}
          />
          <MenuItem
            label="Close"
            shortcut={`${CMD_KEY}+Opt+W`}
            onClick={() => {
              if (focusedAppId) closeWindow(focusedAppId);
              setOpenMenu(null);
            }}
            disabled={!focusedAppId}
          />
          <MenuDivider />
          <MenuItem
            label="Center Window"
            shortcut={`${CMD_KEY}+Opt+C`}
            onClick={() => {
              if (focusedAppId) centerWindow(focusedAppId);
              setOpenMenu(null);
            }}
            disabled={!focusedAppId}
          />
        </MenuButton>
      </div>

      {/* Right: Brightness + Clock */}
      <div className="flex items-stretch gap-3">
        <div className="relative flex items-center">
          <button
            className="flex h-7 w-7 items-center justify-center"
            style={{ background: "var(--color-button-dark)" }}
            onClick={() => setOpenMenu(openMenu === "brightness" ? null : "brightness")}
            aria-label="Display settings"
          >
            {/* Gear icon — pixel/blocky style, white on dark */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              {/* Top/bottom/left/right teeth */}
              <rect x="7" y="1" width="2" height="2" />
              <rect x="7" y="13" width="2" height="2" />
              <rect x="1" y="7" width="2" height="2" />
              <rect x="13" y="7" width="2" height="2" />
              {/* Diagonal teeth */}
              <rect x="2.5" y="2.5" width="2" height="2" />
              <rect x="11.5" y="2.5" width="2" height="2" />
              <rect x="2.5" y="11.5" width="2" height="2" />
              <rect x="11.5" y="11.5" width="2" height="2" />
              {/* Outer ring */}
              <path d="M4 4H12V12H4V4Z M5 5V11H11V5H5Z" />
              {/* Center hole */}
              <rect x="7" y="7" width="2" height="2" />
            </svg>
          </button>
          {openMenu === "brightness" && (
            <BrightnessPopover onClose={() => setOpenMenu(null)} />
          )}
        </div>

        <span className="flex items-center text-[11.5px]" style={{ color: "var(--color-menubar-text)" }}>
          {time}
        </span>
      </div>
    </div>
  );
}

function MenuButton({
  label,
  isOpen,
  onClick,
  className,
  bold,
  children,
}: {
  label: string;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
  bold?: boolean;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  const bg = isOpen
    ? "var(--color-button-dark)"
    : hover
    ? "var(--color-surface-solid)"
    : "transparent";
  const fg = isOpen ? "#ffffff" : "var(--color-menubar-text)";
  return (
    <div className={`relative flex items-center ${className ?? ""}`}>
      <button
        className="px-2.5 py-1 text-[12.5px] transition-colors"
        style={{
          background: bg,
          color: fg,
          fontWeight: bold ? 600 : 500,
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
      >
        {label}
      </button>
      {isOpen && (
        <div
          className="menu-dropdown absolute left-0 top-full mt-0 min-w-[220px] border-2 py-1.5"
          style={{
            background: "var(--color-surface-solid)",
            borderColor: "var(--color-border-strong)",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  label,
  shortcut,
  onClick,
  disabled,
}: {
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[12px] transition-colors"
      style={{
        color: disabled ? "var(--color-text-dim)" : "var(--color-text)",
        cursor: disabled ? "default" : "pointer",
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "var(--color-button-dark)";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--color-text)";
        }
      }}
    >
      {label}
      {shortcut && (
        <span className="ml-5 text-[10.5px]" style={{ color: "inherit", opacity: 0.6 }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="mx-3 my-1 h-px" style={{ background: "var(--color-border)" }} />;
}

