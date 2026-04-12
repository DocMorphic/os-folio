"use client";

import { useState, useEffect } from "react";

export function BootScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="boot-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="text-sm font-medium tracking-wide" style={{ color: "var(--color-text-muted)" }}>
        Loading workspace
      </div>
      <div className="boot-dots flex gap-1">
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-accent)" }} />
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-accent)" }} />
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-accent)" }} />
      </div>
    </div>
  );
}
