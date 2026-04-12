export interface WallpaperOption {
  id: string;
  label: string;
  url: string;              // used in light mode (and as default if no darkUrl)
  darkUrl?: string;         // used in dark mode
  kind: "illustration" | "photo" | "solid" | "gradient";
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: "cat",
    label: "Cat",
    url: "/wallpapers/cat.png",
    kind: "illustration",
  },
  // More wallpapers go here — user will provide from their phone
];

export const DEFAULT_WALLPAPER_ID = "cat";
