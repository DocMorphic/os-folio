"use client";

import { useState } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { APP_REGISTRY } from "@/lib/constants";

export function SearchApp() {
  const [query, setQuery] = useState("");
  const { openWindow, closeWindow } = useWindowManager();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.toLowerCase().trim();
    if (!q) return;

    // Simple intent matching
    const openMatch = q.match(/open\s+(\w+)/);
    const closeMatch = q.match(/close\s+(\w+)/);
    const showMatch = q.match(/show\s+(\w+)/);

    const target = openMatch?.[1] || showMatch?.[1];
    if (target && APP_REGISTRY[target]) {
      openWindow(target);
      closeWindow("search");
      return;
    }

    if (closeMatch?.[1] && APP_REGISTRY[closeMatch[1]]) {
      closeWindow(closeMatch[1]);
      return;
    }

    // Fuzzy: match by app title
    for (const app of Object.values(APP_REGISTRY)) {
      if (q.includes(app.id) || q.includes(app.title.toLowerCase())) {
        openWindow(app.id);
        closeWindow("search");
        return;
      }
    }
  };

  return (
    <div className="-mx-5 -my-4 flex h-[calc(100%+32px)] flex-col">
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        <div className="flex flex-1 items-start p-6">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            className="custom-scrollbar w-full flex-1 resize-none bg-transparent text-[16px] leading-[1.4] outline-none"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-dm-sans), sans-serif",
            }}
            placeholder="What do you want to know or to go to? Ask anything or go to anywhere you want"
            autoFocus
          />
        </div>

        {/* Return key icon */}
        <div className="flex justify-end p-3">
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center border transition-colors"
            style={{
              background: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-surface-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-surface-alt)";
            }}
            aria-label="Submit search"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 6L13 6L13 10L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M5 8L3 6L5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
