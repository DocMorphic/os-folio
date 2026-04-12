"use client";

import { createContext, useContext, useEffect, useCallback } from "react";
import type { ThemeMode, AccentColor, ThemeState } from "@/lib/types";
import { STORAGE_KEYS, DEFAULT_THEME } from "@/lib/constants";
import { useLocalStorage } from "./use-local-storage";

interface ThemeContextValue extends ThemeState {
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccent: (accent: AccentColor) => void;
  setBrightness: (value: number) => void;
  setWallpaperId: (id: string) => void;
  setCustomWallpaper: (dataUrl: string | null) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function useThemeProvider(): ThemeContextValue {
  const [mode, setModeRaw] = useLocalStorage<ThemeMode>(STORAGE_KEYS.theme, DEFAULT_THEME.mode);
  const [accent, setAccentRaw] = useLocalStorage<AccentColor>(STORAGE_KEYS.accent, DEFAULT_THEME.accent);
  const [brightness, setBrightnessRaw] = useLocalStorage<number>(STORAGE_KEYS.brightness, DEFAULT_THEME.brightness);
  const [wallpaperId, setWallpaperIdRaw] = useLocalStorage<string>(STORAGE_KEYS.wallpaperId, DEFAULT_THEME.wallpaperId);
  const [customWallpaperUrl, setCustomWallpaperRaw] = useLocalStorage<string | null>(STORAGE_KEYS.customWallpaper, DEFAULT_THEME.customWallpaperUrl);

  // Apply theme attributes to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.style.setProperty("--display-brightness", String(brightness / 100));
  }, [brightness]);

  const setMode = useCallback((m: ThemeMode) => setModeRaw(m), [setModeRaw]);
  const toggleMode = useCallback(() => setModeRaw((prev) => (prev === "dark" ? "light" : "dark")), [setModeRaw]);
  const setAccent = useCallback((a: AccentColor) => setAccentRaw(a), [setAccentRaw]);
  const setBrightness = useCallback((v: number) => setBrightnessRaw(Math.max(70, Math.min(100, v))), [setBrightnessRaw]);
  const setWallpaperId = useCallback((id: string) => setWallpaperIdRaw(id), [setWallpaperIdRaw]);
  const setCustomWallpaper = useCallback((url: string | null) => setCustomWallpaperRaw(url), [setCustomWallpaperRaw]);

  return {
    mode,
    accent,
    brightness,
    wallpaperId,
    customWallpaperUrl,
    setMode,
    toggleMode,
    setAccent,
    setBrightness,
    setWallpaperId,
    setCustomWallpaper,
  };
}
