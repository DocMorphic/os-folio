"use client";

import { useTheme } from "@/hooks/use-theme";
import {
  WALLPAPERS,
  DEFAULT_WALLPAPER_ID,
  resolveWallpaperUrl,
} from "@/lib/wallpapers";

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

  // Default / theme-solid → render the Field Notebook page.
  if (!wp || wp.kind === "theme-solid") {
    return <FieldNotebookPage mode={mode} />;
  }

  // Standard image wallpaper (user-selected photo from Settings)
  const url = resolveWallpaperUrl(wp, mode, "orange");
  return <div className="desktop-wallpaper" style={{ backgroundImage: `url(${url})` }} />;
}

/**
 * The Field Notebook page itself — paper color, fine fiber grain,
 * engineering dot grid, vignette at the edges, and a hand-drawn
 * "ground" line above the dock. All pure CSS + inline SVG, no
 * assets to load.
 */
function FieldNotebookPage({ mode }: { mode: "light" | "dark" }) {
  // Dot grid color shifts with mode so it reads against either paper.
  const dotColor = mode === "dark" ? "rgba(220, 200, 160, 0.08)" : "rgba(40, 25, 5, 0.13)";
  // Vignette darkens the outer edges — more pronounced in dark mode
  // because night-photographed paper has heavy shadow falloff.
  const vignetteOuter =
    mode === "dark" ? "rgba(0, 0, 0, 0.55)" : "rgba(80, 50, 10, 0.22)";

  // Inline SVG feTurbulence noise — pure vector paper grain, no PNG.
  const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/>
      <feColorMatrix type='matrix' values='0 0 0 0 ${mode === "dark" ? "0.08" : "0.2"}
                                            0 0 0 0 ${mode === "dark" ? "0.06" : "0.14"}
                                            0 0 0 0 ${mode === "dark" ? "0.04" : "0.06"}
                                            0 0 0 ${mode === "dark" ? "0.35" : "0.22"} 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`;
  const noiseUrl = `url("data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg)}")`;

  return (
    <div
      className="desktop-wallpaper"
      style={{
        background: "var(--color-bg)",
      }}
    >
      {/* Layer 1: paper grain — SVG fractal noise blended over the cream */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: noiseUrl,
          backgroundSize: "220px 220px",
          mixBlendMode: mode === "dark" ? "screen" : "multiply",
          opacity: mode === "dark" ? 0.55 : 0.7,
        }}
      />
      {/* Layer 2: dot grid — engineering paper feel */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${dotColor} 1px, transparent 1.2px)`,
          backgroundSize: "22px 22px",
        }}
      />
      {/* Layer 3: vignette — edges slightly darker, like a page in a lamplit room */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 55%, ${vignetteOuter} 100%)`,
        }}
      />
      {/* Layer 4: hand-drawn ground line above the dock.
          SVG path with a slightly wavy stroke — the "ruled line" at the
          bottom of the page where everything rests. */}
      <svg
        className="pointer-events-none absolute left-0 right-0"
        style={{ bottom: "96px", width: "100%", height: "12px" }}
        viewBox="0 0 1000 12"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 6 Q 60 4, 120 7 T 240 6 T 360 7 T 480 5 T 600 7 T 720 6 T 840 7 T 1000 6"
          stroke="var(--color-border-strong)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          opacity={mode === "dark" ? "0.42" : "0.55"}
        />
      </svg>
    </div>
  );
}
