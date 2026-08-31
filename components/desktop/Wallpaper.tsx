"use client";

import Image from "next/image";
import { useTheme } from "@/hooks/use-theme";
import {
  WALLPAPERS,
  DEFAULT_WALLPAPER_ID,
  resolveWallpaperUrl,
  resolveThemeSolidColor,
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

  // Plain solid theme color (no image)
  if (wp.kind === "theme-solid") {
    const color = resolveThemeSolidColor(mode, accent);
    return <div className="desktop-wallpaper" style={{ background: color }} />;
  }

  // Standard image wallpaper
  const url = resolveWallpaperUrl(wp, mode);
  return (
    <div className="desktop-wallpaper" aria-hidden="true">
      <Image
        key={url}
        src={url}
        alt=""
        fill
        sizes="100vw"
        unoptimized
        loading="eager"
        fetchPriority="high"
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
    </div>
  );
}
