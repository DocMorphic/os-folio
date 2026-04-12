"use client";

import { useTheme } from "@/hooks/use-theme";
import { ACCENT_COLORS } from "@/lib/constants";
import { WALLPAPERS, resolveWallpaperUrl, resolveThemeSolidColor } from "@/lib/wallpapers";

export function SettingsApp() {
  const {
    mode,
    accent,
    setMode,
    setAccent,
    wallpaperId,
    setWallpaperId,
    customWallpaperUrl,
    setCustomWallpaper,
  } = useTheme();

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-serif-heading text-[30px] leading-none" style={{ color: "var(--color-text)" }}>
        Settings
      </h1>

      {/* APPEARANCE section */}
      <div className="border-2 p-4" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="mb-3 text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
          Appearance
        </h2>

        {/* Theme mode */}
        <div className="mb-4">
          <div className="mb-2 text-[11.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            THEME MODE
          </div>
          <div className="flex">
            <button
              className="border-2 px-5 py-2 text-[12.5px] font-medium"
              style={{
                background: mode === "light" ? "var(--color-button-dark)" : "var(--color-surface-alt)",
                color: mode === "light" ? "#fff" : "var(--color-text)",
                borderColor: "var(--color-border-strong)",
                borderRightWidth: "1px",
              }}
              onClick={() => setMode("light")}
            >
              Light
            </button>
            <button
              className="border-2 px-5 py-2 text-[12.5px] font-medium"
              style={{
                background: mode === "dark" ? "var(--color-button-dark)" : "var(--color-surface-alt)",
                color: mode === "dark" ? "#fff" : "var(--color-text)",
                borderColor: "var(--color-border-strong)",
                borderLeftWidth: "1px",
              }}
              onClick={() => setMode("dark")}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Theme color */}
        <div>
          <div className="mb-2 text-[11.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            THEME COLOR
          </div>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.id}
                className="flex items-center gap-2 border px-3 py-2 text-[12.5px]"
                style={{
                  background: "var(--color-surface-solid)",
                  borderColor: accent === color.id ? "var(--color-border-strong)" : "var(--color-border)",
                  borderWidth: accent === color.id ? "2px" : "1px",
                  color: "var(--color-text)",
                }}
                onClick={() => setAccent(color.id)}
              >
                <span className="h-4 w-4" style={{ background: color.hex }} />
                {color.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* WALLPAPER section */}
      <div className="border-2 p-4" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="mb-1 text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
          Wallpaper
        </h2>
        <p className="mb-3 text-[12.5px]" style={{ color: "var(--color-text-muted)" }}>
          Choose an indexed wallpaper or upload your own.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {WALLPAPERS.map((wp) => {
            const isSelected = !customWallpaperUrl && wallpaperId === wp.id;
            const isThemeSolid = wp.kind === "theme-solid";
            const previewUrl = resolveWallpaperUrl(wp, mode, accent);
            const solidBg = isThemeSolid ? resolveThemeSolidColor(mode, accent) : null;
            return (
              <button
                key={wp.id}
                className="flex flex-col overflow-hidden border-2"
                style={{
                  borderColor: isSelected ? "var(--color-border-strong)" : "var(--color-border)",
                  background: "var(--color-surface-alt)",
                }}
                onClick={() => {
                  setCustomWallpaper(null);
                  setWallpaperId(wp.id);
                }}
              >
                <div
                  className="aspect-[16/10] w-full"
                  style={
                    isThemeSolid
                      ? { background: solidBg! }
                      : {
                          backgroundImage: `url(${previewUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundColor: "#ea580c",
                        }
                  }
                />
                <div
                  className="truncate px-2 py-1.5 text-left text-[11.5px]"
                  style={{
                    color: "var(--color-text)",
                    background: "var(--color-surface-solid)",
                  }}
                >
                  {wp.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Upload custom */}
        <div className="mt-3">
          <label
            className="block cursor-pointer border-2 px-3 py-2 text-center text-[12.5px]"
            style={{
              borderColor: "var(--color-border-strong)",
              background: "var(--color-surface-alt)",
              color: "var(--color-text)",
            }}
          >
            Upload Custom
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setCustomWallpaper(ev.target?.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
