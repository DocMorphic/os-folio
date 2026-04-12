export interface WallpaperOption {
  id: string;
  label: string;
  url: string;              // used in light mode (and as default if no darkUrl)
  darkUrl?: string;         // used in dark mode
  /**
   * "theme-solid" = a plain solid color that tracks the current accent + theme.
   * The Wallpaper component renders it via inline CSS; the `url` field is empty.
   */
  kind: "illustration" | "photo" | "solid" | "gradient" | "theme-solid";
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: "theme-solid",
    label: "Theme Color",
    url: "",
    kind: "theme-solid",
  },
  {
    id: "wallpaper1",
    label: "Wallpaper 1",
    url: "/wallpapers/wallpaper1.jpg",
    kind: "photo",
  },
  {
    id: "pxl-1",
    label: "India — June 2023",
    url: "/wallpapers/PXL_20230601_060150566.jpg",
    kind: "photo",
  },
  {
    id: "pxl-2",
    label: "Austria — Nov 2025",
    url: "/wallpapers/PXL_20251108_105236468.jpg",
    kind: "photo",
  },
  {
    id: "pxl-3",
    label: "Germany — Dec 2025",
    url: "/wallpapers/PXL_20251206_145828605.jpg",
    kind: "photo",
  },
  {
    id: "pxl-4",
    label: "Germany — Dec 2025 (2)",
    url: "/wallpapers/PXL_20251206_150917316.jpg",
    kind: "photo",
  },
];

export const DEFAULT_WALLPAPER_ID = "theme-solid";

/** Solid background colors per accent for "theme-solid" wallpaper. */
export const THEME_SOLID_LIGHT: Record<string, string> = {
  orange: "#ea580c",
  green: "#5fa85f",
  blue: "#5087d4",
  purple: "#a172cf",
};

export const THEME_SOLID_DARK: Record<string, string> = {
  orange: "#2a1608",
  green: "#0d1f0d",
  blue: "#0b1322",
  purple: "#1a0e22",
};

/**
 * Resolve the actual wallpaper URL for a given wallpaper + current theme + accent.
 * Returns an empty string for "theme-solid" since it's rendered as a solid color.
 */
export function resolveWallpaperUrl(
  wp: WallpaperOption,
  mode: "light" | "dark",
  _accent: "orange" | "green" | "blue" | "purple"
): string {
  if (wp.kind === "theme-solid") return "";
  if (mode === "dark" && wp.darkUrl) return wp.darkUrl;
  return wp.url;
}

/**
 * Get the solid background color for "theme-solid" wallpapers.
 */
export function resolveThemeSolidColor(
  mode: "light" | "dark",
  accent: "orange" | "green" | "blue" | "purple"
): string {
  return mode === "dark" ? THEME_SOLID_DARK[accent] : THEME_SOLID_LIGHT[accent];
}
