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
    darkUrl: "/wallpapers/cat-dark.png",
    kind: "illustration",
  },
  // More wallpapers go here — user will provide from their phone.
  // Drop an image in public/wallpapers/ and add an entry here.
  // If you want a separate dark variant, add `darkUrl`; otherwise the
  // same image is used for both themes.
];

export const DEFAULT_WALLPAPER_ID = "cat";
