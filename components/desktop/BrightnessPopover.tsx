"use client";

import { useTheme } from "@/hooks/use-theme";
import { useWindowManager } from "@/hooks/use-window-manager";
import { ACCENT_COLORS } from "@/lib/constants";

interface BrightnessPopoverProps {
  onClose: () => void;
}

export function BrightnessPopover({ onClose }: BrightnessPopoverProps) {
  const { brightness, setBrightness, accent, setAccent, mode, toggleMode } = useTheme();
  const { openWindow } = useWindowManager();

  return (
    <div
      className="menu-dropdown absolute right-0 top-full mt-0.5 w-[210px] border p-2 md:w-[260px] md:p-3"
      style={{
        background: "var(--color-surface-solid)",
        borderColor: "var(--color-border-strong)",
      }}
    >
      {/* DISPLAY header */}
      <div
        className="mb-2 border-b pb-1.5 text-[10px] font-semibold tracking-wider"
        style={{
          color: "var(--color-text-muted)",
          borderColor: "var(--color-border)",
        }}
      >
        DISPLAY
      </div>

      {/* Brightness */}
      <div className="mb-3">
        <div className="mb-1.5 text-[12px]" style={{ color: "var(--color-text)" }}>
          Brightness
        </div>
        <input
          type="range"
          min={70}
          max={100}
          value={brightness}
          onChange={(e) => setBrightness(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
        <div className="mt-1 flex justify-between text-[10px]" style={{ color: "var(--color-text-muted)" }}>
          <span>Dim</span>
          <span>{brightness}%</span>
          <span>Bright</span>
        </div>
      </div>

      {/* Theme color */}
      <div className="mb-2">
        <div className="mb-1.5 text-[12px]" style={{ color: "var(--color-text)" }}>
          Theme color
        </div>
        <div className="flex gap-1.5">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.id}
              className="h-6 flex-1 border-2"
              style={{
                background: color.hex,
                borderColor: accent === color.id ? "var(--color-border-strong)" : "var(--color-border)",
                borderWidth: accent === color.id ? "2px" : "1px",
              }}
              onClick={() => setAccent(color.id)}
              aria-label={color.label}
            />
          ))}
        </div>
      </div>

      <div className="my-2 h-px" style={{ background: "var(--color-border)" }} />

      {/* Dark mode toggle */}
      <button
        className="flex w-full items-center justify-between px-2 py-1.5 text-[12px] transition-colors"
        style={{ color: "var(--color-text)" }}
        onClick={toggleMode}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-button-dark)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--color-text)";
        }}
      >
        <span>Switch to {mode === "dark" ? "light" : "dark"} mode</span>
        <span
          className="border px-1.5 py-[1px] text-[10px] font-semibold"
          style={{
            background: mode === "dark" ? "var(--color-accent)" : "var(--color-surface-alt)",
            color: mode === "dark" ? "#fff" : "var(--color-text-muted)",
            borderColor: "var(--color-border)",
          }}
        >
          {mode === "dark" ? "ON" : "OFF"}
        </span>
      </button>

      <button
        className="mt-0.5 w-full px-2 py-1.5 text-left text-[12px] transition-colors"
        style={{ color: "var(--color-text)" }}
        onClick={() => {
          openWindow("settings");
          onClose();
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--color-button-dark)";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--color-text)";
        }}
      >
        Open settings...
      </button>
    </div>
  );
}
