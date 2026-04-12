"use client";

import { useTheme } from "@/hooks/use-theme";
import {
  WALLPAPERS,
  DEFAULT_WALLPAPER_ID,
  resolveWallpaperUrl,
} from "@/lib/wallpapers";

export function Wallpaper() {
  const { customWallpaperUrl, wallpaperId, mode, accent } = useTheme();

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

  const url = resolveWallpaperUrl(wp, mode, accent);

  return (
    <div
      className="desktop-wallpaper"
      style={{
        backgroundImage: `url(${url})`,
        imageRendering: wp.kind === "theme-cat" ? "pixelated" : "auto",
      }}
    />
  );
}
