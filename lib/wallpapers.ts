export interface WallpaperOption {
  id: string;
  label: string;
  url: string;              // used in light mode (and as default if no darkUrl)
  darkUrl?: string;         // used in dark mode
  /**
   * "theme-cat" = pixel cat wallpaper that auto-picks one of 8 variants
   *  based on current accent + theme. The `url` field is a preview used in Settings.
   */
  kind: "illustration" | "photo" | "solid" | "gradient" | "theme-cat";
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: "cat-pixel",
    label: "Pixel Cat (theme)",
    url: "/wallpapers/cat-orange-light.png", // preview for Settings
    kind: "theme-cat",
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

export const DEFAULT_WALLPAPER_ID = "cat-pixel";

/**
 * Resolve the actual wallpaper URL for a given wallpaper + current theme + accent.
 * For theme-cat wallpapers, this picks one of 8 variants.
 */
export function resolveWallpaperUrl(
  wp: WallpaperOption,
  mode: "light" | "dark",
  accent: "orange" | "green" | "blue" | "purple"
): string {
  if (wp.kind === "theme-cat") {
    return `/wallpapers/cat-${accent}-${mode}.png`;
  }
  if (mode === "dark" && wp.darkUrl) return wp.darkUrl;
  return wp.url;
}
