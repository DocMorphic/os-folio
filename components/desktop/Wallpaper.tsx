"use client";

import { useTheme } from "@/hooks/use-theme";
import { WALLPAPERS, DEFAULT_WALLPAPER_ID } from "@/lib/wallpapers";

export function Wallpaper() {
  const { customWallpaperUrl, wallpaperId, mode } = useTheme();

  let bgImage: string | undefined;

  if (customWallpaperUrl) {
    bgImage = `url(${customWallpaperUrl})`;
  } else {
    const selectedId = wallpaperId || DEFAULT_WALLPAPER_ID;
    const wp = WALLPAPERS.find((w) => w.id === selectedId);
    if (wp) {
      // Use dark variant if available and dark mode is on
      const url = mode === "dark" && wp.darkUrl ? wp.darkUrl : wp.url;
      bgImage = `url(${url})`;
    }
  }

  return (
    <div
      className="desktop-wallpaper"
      style={bgImage ? { backgroundImage: bgImage } : undefined}
    />
  );
}
