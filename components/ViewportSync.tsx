"use client";
import {useEffect} from "react";

/** Safari's software keyboard resizes the visual viewport, not 100dvh. */
export function ViewportSync(){
  useEffect(()=>{
    const viewport=window.visualViewport;
    const update=()=>{
      // Don't reflow the app while the visitor is using accessibility pinch zoom.
      if(viewport&&Math.abs(viewport.scale-1)>.02)return;
      document.documentElement.style.setProperty("--app-height",`${viewport?.height??window.innerHeight}px`);
    };
    update();window.addEventListener("resize",update);viewport?.addEventListener("resize",update);
    return()=>{window.removeEventListener("resize",update);viewport?.removeEventListener("resize",update);document.documentElement.style.removeProperty("--app-height");};
  },[]);
  return null;
}
