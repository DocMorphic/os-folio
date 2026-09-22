"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import { beginWorldVisit, navigateImmersive } from "@/lib/route-transition";

// This module is reachable only from /v2, never from the desktop tree.
const PortfolioRoom = dynamic(
  () => import("@/components/PortfolioRoom").then(module => module.PortfolioRoom),
  { ssr: false },
);
const noSource = () => undefined;

export function WorldPage() {
  const router=useRouter();
  // Establish the presentation gate before the scene's passive mount effects.
  useLayoutEffect(()=>{beginWorldVisit();},[]);
  const leave=()=>navigateImmersive("/#about",path=>router.push(path));
  return <main id="desktop-content" className="world-page">
    <PortfolioRoom active sourceReady sourceBounds={noSource} onExit={leave} standalone/>
  </main>;
}
