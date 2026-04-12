export interface WallpaperOption {
  id: string;
  label: string;
  url: string;              // used in light mode (and as default if no darkUrl)
  darkUrl?: string;         // used in dark mode
  kind: "illustration" | "photo" | "solid" | "gradient" | "themed";
}

export const WALLPAPERS: WallpaperOption[] = [
  // Theme-blended cat silhouette — changes color with the accent.
  // Rendered specially in <Wallpaper /> using currentColor.
  {
    id: "cat-theme",
    label: "Cat (theme)",
    url: "/wallpapers/cat-silhouette.svg",
    kind: "themed",
  },
  // User's photos
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

export const DEFAULT_WALLPAPER_ID = "cat-theme";
