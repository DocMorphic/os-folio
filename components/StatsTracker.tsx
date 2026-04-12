"use client";

import { useEffect } from "react";

const SESSION_KEY = "os-folio:session-id";
const TRACKED_KEY = "os-folio:tracked-this-session";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return "";
  }
}

/**
 * Fires a POST to /api/stats/track on mount.
 * Dedupes per browser session via sessionStorage —
 * a page refresh in the same tab won't double-count.
 */
export function StatsTracker() {
  useEffect(() => {
    try {
      // Only track once per session
      if (sessionStorage.getItem(TRACKED_KEY)) return;

      const sessionId = getOrCreateSessionId();
      if (!sessionId) return;

      fetch("/api/stats/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          path: window.location.pathname,
        }),
      })
        .then(() => {
          sessionStorage.setItem(TRACKED_KEY, "1");
        })
        .catch(() => {
          // silent — tracking failures shouldn't break the site
        });
    } catch {
      // localStorage/sessionStorage blocked — ignore
    }
  }, []);

  return null;
}
