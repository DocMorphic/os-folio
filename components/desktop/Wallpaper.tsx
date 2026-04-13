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
      {/* Layer 4: hand-drawn ground line above the dock with sketched
          sprite objects resting on it — a mug, a pencil, a stack of
          books, a compass. Pure pen strokes, cream fills, no assets. */}
      <GroundSprites mode={mode} />

      {/* Layer 5: corner doodles — page margin decorations. A compass
          rose, a crossed-out word, an arrow annotation. These are pure
          decorative flourish and pointer-events:none. */}
      <CornerDoodles mode={mode} />
    </div>
  );
}

// === Ground + sprite objects ==========================================
//
// Sits above the dock area. A wavy ink horizon line with a few hand-drawn
// "props" resting on it. Feels like the bottom of a page in a field journal
// where the illustrator sketched some objects as the baseline.
function GroundSprites({ mode }: { mode: "light" | "dark" }) {
  const ink = mode === "dark" ? "rgba(243, 234, 217, 0.55)" : "rgba(30, 22, 12, 0.6)";
  const fill = mode === "dark" ? "rgba(243, 234, 217, 0.08)" : "rgba(30, 22, 12, 0.04)";
  const accent = "rgba(234, 88, 12, 0.75)";

  return (
    <svg
      className="pointer-events-none absolute left-0 right-0"
      style={{ bottom: "92px", width: "100%", height: "80px" }}
      viewBox="0 0 1200 80"
      preserveAspectRatio="xMidYEnd slice"
      aria-hidden="true"
    >
      {/* Wavy ground line */}
      <path
        d="M0 65 Q 80 62, 160 66 T 320 64 T 480 66 T 640 63 T 800 66 T 960 64 T 1200 65"
        stroke={ink}
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Coffee mug, far left */}
      <g transform="translate(90, 28)">
        <path
          d="M0 10 Q 0 8, 2 8 L 22 8 Q 24 8, 24 10 L 24 30 Q 24 36, 18 36 L 6 36 Q 0 36, 0 30 Z"
          stroke={ink}
          strokeWidth="1.3"
          fill={fill}
          strokeLinejoin="round"
        />
        <path
          d="M24 14 Q 32 14, 32 22 Q 32 30, 24 30"
          stroke={ink}
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Steam */}
        <path
          d="M8 6 Q 10 2, 8 -2 M 14 5 Q 16 1, 14 -3 M 20 6 Q 22 2, 20 -2"
          stroke={ink}
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* Pencil, yellow body, leaning right */}
      <g transform="translate(260, 40) rotate(-8)">
        <path
          d="M0 8 L 60 8 L 60 16 L 0 16 Z"
          stroke={ink}
          strokeWidth="1.3"
          fill={accent}
          fillOpacity="0.22"
          strokeLinejoin="round"
        />
        {/* Tip */}
        <path d="M60 8 L 72 12 L 60 16 Z" stroke={ink} strokeWidth="1.3" fill={fill} strokeLinejoin="round" />
        {/* Lead */}
        <path d="M72 12 L 76 12" stroke={ink} strokeWidth="2" strokeLinecap="round" />
        {/* Eraser */}
        <path d="M0 8 L -6 8 L -6 16 L 0 16 Z" stroke={ink} strokeWidth="1.3" fill={fill} strokeLinejoin="round" />
      </g>

      {/* Stack of books, middle */}
      <g transform="translate(480, 30)">
        {/* Bottom book */}
        <path d="M0 28 Q 0 26, 2 26 L 50 26 Q 52 26, 52 28 L 52 36 Q 52 38, 50 38 L 2 38 Q 0 38, 0 36 Z" stroke={ink} strokeWidth="1.3" fill={fill} strokeLinejoin="round" />
        <line x1="4" y1="30" x2="48" y2="30" stroke={ink} strokeWidth="0.8" opacity="0.7" />
        {/* Middle book, offset */}
        <path d="M4 16 Q 4 14, 6 14 L 46 14 Q 48 14, 48 16 L 48 24 Q 48 26, 46 26 L 6 26 Q 4 26, 4 24 Z" stroke={ink} strokeWidth="1.3" fill={fill} strokeLinejoin="round" />
        <line x1="8" y1="18" x2="44" y2="18" stroke={ink} strokeWidth="0.8" opacity="0.7" />
        {/* Top book, slightly tilted */}
        <path d="M2 4 Q 2 2, 4 2 L 42 2 Q 44 2, 44 4 L 44 12 Q 44 14, 42 14 L 4 14 Q 2 14, 2 12 Z" stroke={ink} strokeWidth="1.3" fill={fill} strokeLinejoin="round" />
      </g>

      {/* Ruler, right of center, slightly tilted */}
      <g transform="translate(680, 45) rotate(4)">
        <path d="M0 0 L 110 0 L 110 10 L 0 10 Z" stroke={ink} strokeWidth="1.3" fill={fill} strokeLinejoin="round" />
        {/* Tick marks */}
        {[0, 11, 22, 33, 44, 55, 66, 77, 88, 99, 110].map((x, i) => (
          <line key={i} x1={x} y1={0} x2={x} y2={i % 2 === 0 ? 5 : 3} stroke={ink} strokeWidth="0.9" />
        ))}
      </g>

      {/* Small folded paper airplane, far right */}
      <g transform="translate(900, 28)">
        <path
          d="M0 20 L 50 4 L 34 22 L 50 4 L 30 36 L 34 22 Z"
          stroke={ink}
          strokeWidth="1.3"
          fill={fill}
          strokeLinejoin="round"
        />
      </g>

      {/* Compass (tiny), far right */}
      <g transform="translate(1050, 25)">
        <circle cx="18" cy="18" r="18" stroke={ink} strokeWidth="1.3" fill={fill} />
        <circle cx="18" cy="18" r="2" stroke={ink} strokeWidth="1.1" fill="none" />
        {/* North arrow */}
        <path d="M18 4 L 21 18 L 18 14 L 15 18 Z" stroke={ink} strokeWidth="1.1" fill={accent} fillOpacity="0.5" strokeLinejoin="round" />
        {/* Cardinal marks */}
        <text x="18" y="12" fontSize="4" textAnchor="middle" fill={ink}>N</text>
      </g>
    </svg>
  );
}

// === Corner doodles ====================================================
//
// Margin flourish — a "DRAFT" stamp bottom-left, an arrow annotation
// top-right. Decorative only. Pure ink on paper.
function CornerDoodles({ mode }: { mode: "light" | "dark" }) {
  const ink = mode === "dark" ? "rgba(243, 234, 217, 0.45)" : "rgba(30, 22, 12, 0.5)";
  const red = "rgba(194, 74, 46, 0.75)";

  return (
    <>
      {/* Top-left: a small sketched "Munich → Rajkot" arrow + crossed text */}
      <svg
        className="pointer-events-none absolute"
        style={{ top: "48px", left: "18px", width: "180px", height: "50px" }}
        viewBox="0 0 180 50"
        aria-hidden="true"
      >
        <text
          x="0"
          y="18"
          fontFamily="var(--font-kalam), cursive"
          fontSize="14"
          fill={ink}
          fontWeight="700"
        >
          Munich
        </text>
        {/* Arrow curve */}
        <path
          d="M55 14 Q 80 4, 110 18"
          stroke={ink}
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M106 13 L 112 18 L 106 22"
          stroke={ink}
          strokeWidth="1.3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="115"
          y="24"
          fontFamily="var(--font-kalam), cursive"
          fontSize="14"
          fill={ink}
          fontWeight="700"
        >
          Rajkot
        </text>
      </svg>

      {/* Top-right: a small "DRAFT" rubber stamp, slightly tilted */}
      <svg
        className="pointer-events-none absolute"
        style={{ top: "50px", right: "32px", width: "130px", height: "50px" }}
        viewBox="0 0 130 50"
        aria-hidden="true"
      >
        <g transform="rotate(-8 65 25)">
          <path
            d="M6 8 Q 4 8, 4 10 L 4 40 Q 4 42, 6 42 L 124 42 Q 126 42, 126 40 L 126 10 Q 126 8, 124 8 Z"
            stroke={red}
            strokeWidth="2"
            fill="none"
            strokeLinejoin="round"
          />
          <path
            d="M10 12 Q 8 12, 8 14 L 8 36 Q 8 38, 10 38 L 120 38 Q 122 38, 122 36 L 122 14 Q 122 12, 120 12 Z"
            stroke={red}
            strokeWidth="1"
            fill="none"
            strokeLinejoin="round"
          />
          <text
            x="65"
            y="30"
            fontFamily="var(--font-architect), cursive"
            fontSize="18"
            fill={red}
            fontWeight="700"
            textAnchor="middle"
            letterSpacing="4"
          >
            WORK IN PROGRESS
          </text>
        </g>
      </svg>

      {/* Bottom-left corner: crossed-out word + annotation */}
      <svg
        className="pointer-events-none absolute"
        style={{ bottom: "200px", left: "20px", width: "160px", height: "40px" }}
        viewBox="0 0 160 40"
        aria-hidden="true"
      >
        <text
          x="0"
          y="18"
          fontFamily="var(--font-kalam), cursive"
          fontSize="13"
          fill={ink}
          fontWeight="400"
          fontStyle="italic"
        >
          student
        </text>
        {/* Strikethrough — wobbly line */}
        <path
          d="M-2 14 Q 25 12, 52 15"
          stroke={ink}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <text
          x="60"
          y="18"
          fontFamily="var(--font-kalam), cursive"
          fontSize="13"
          fill={ink}
          fontWeight="700"
        >
          builder
        </text>
      </svg>
    </>
  );
}
