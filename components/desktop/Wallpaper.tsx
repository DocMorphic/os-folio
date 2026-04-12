"use client";

import { useTheme } from "@/hooks/use-theme";
import { WALLPAPERS, DEFAULT_WALLPAPER_ID } from "@/lib/wallpapers";

export function Wallpaper() {
  const { customWallpaperUrl, wallpaperId, mode } = useTheme();

  // Custom uploaded wallpaper always wins
  if (customWallpaperUrl) {
    return (
      <div
        className="desktop-wallpaper"
        style={{ backgroundImage: `url(${customWallpaperUrl})` }}
      />
    );
  }

  const selectedId = wallpaperId || DEFAULT_WALLPAPER_ID;
  const wp = WALLPAPERS.find((w) => w.id === selectedId);

  if (!wp) {
    return <div className="desktop-wallpaper" />;
  }

  // Theme-blended cat silhouette — accent-colored bg + darker cat silhouette on top
  if (wp.kind === "themed") {
    return (
      <div
        className="desktop-wallpaper flex items-center justify-center"
        style={{ background: "var(--color-accent)" }}
      >
        <ThemedCatSilhouette />
      </div>
    );
  }

  // Standard image wallpaper (photo / illustration)
  const url = mode === "dark" && wp.darkUrl ? wp.darkUrl : wp.url;
  return (
    <div
      className="desktop-wallpaper"
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}

/**
 * A sitting cat silhouette that blends with the current accent color.
 * Uses a dark overlay that darkens the underlying accent, so it works
 * for any theme color without needing multiple SVG variants.
 */
function ThemedCatSilhouette() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-[75%] w-auto max-w-[70%]"
      preserveAspectRatio="xMidYMid meet"
      fill="rgba(0, 0, 0, 0.18)"
      aria-hidden="true"
    >
      {/* Body */}
      <path
        d="M 62 170
           C 62 155, 55 140, 58 122
           C 61 108, 68 98, 80 92
           C 78 85, 79 75, 86 66
           C 82 52, 86 42, 96 40
           C 100 52, 99 60, 100 66
           L 122 66
           C 123 60, 122 52, 126 40
           C 136 42, 140 52, 136 66
           C 143 75, 144 85, 142 92
           C 154 98, 161 108, 164 122
           C 167 140, 160 155, 160 170
           L 162 176
           L 60 176 Z"
      />
      {/* Tail curling up on the right */}
      <path
        d="M 160 162
           C 180 160, 188 148, 186 128
           C 180 138, 174 148, 168 156
           C 164 160, 162 161, 160 162 Z"
      />
    </svg>
  );
}
