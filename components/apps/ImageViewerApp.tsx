"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { FOLDER_CONTENTS } from "@/content/folder-files";

const APP_ID = "image-viewer";

export function ImageViewerApp() {
  const { windowContexts, setWindowContext, setWindowStatus, closeWindow } = useWindowManager();
  const ctx = windowContexts[APP_ID];

  // Build the ordered image list for the current folder
  const images = useMemo(() => {
    if (!ctx?.folderId) return [];
    const folder = FOLDER_CONTENTS[ctx.folderId];
    if (!folder) return [];
    return folder.items.filter((it) => it.type === "image");
  }, [ctx?.folderId]);

  const index = ctx?.imageIndex ?? 0;
  const total = images.length;
  const current = images[index];
  const src = current?.src ?? ctx?.imageUrl ?? "";
  const name = current?.name ?? ctx?.imageName ?? "";

  // Title bar status
  useEffect(() => {
    if (total > 0) {
      setWindowStatus(APP_ID, `${index + 1} / ${total}`);
    } else {
      setWindowStatus(APP_ID, "");
    }
    return () => setWindowStatus(APP_ID, "");
  }, [index, total, setWindowStatus]);

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    const next = (index - 1 + total) % total;
    const img = images[next];
    setWindowContext(APP_ID, {
      imageIndex: next,
      imageUrl: img.src,
      imageName: img.name,
    });
  }, [index, total, images, setWindowContext]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    const next = (index + 1) % total;
    const img = images[next];
    setWindowContext(APP_ID, {
      imageIndex: next,
      imageUrl: img.src,
      imageName: img.name,
    });
  }, [index, total, images, setWindowContext]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Escape") {
        closeWindow(APP_ID);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, closeWindow]);

  if (!src) {
    return (
      <div className="flex h-full items-center justify-center text-[13px]" style={{ color: "var(--color-text-muted)" }}>
        No image loaded.
      </div>
    );
  }

  return (
    <div
      className="-mx-5 -my-4 flex h-[calc(100%+32px)] flex-col"
      style={{ background: "#0a0705" }}
    >
      {/* Image area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="max-h-full max-w-full"
          style={{ objectFit: "contain" }}
        />

        {/* Prev button */}
        {total > 1 && (
          <button
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border transition-colors"
            style={{
              background: "rgba(20, 10, 5, 0.8)",
              borderColor: "rgba(232, 168, 112, 0.3)",
              color: "#ffb07a",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(40, 20, 10, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(20, 10, 5, 0.8)";
            }}
            onClick={goPrev}
            aria-label="Previous image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Next button */}
        {total > 1 && (
          <button
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border transition-colors"
            style={{
              background: "rgba(20, 10, 5, 0.8)",
              borderColor: "rgba(232, 168, 112, 0.3)",
              color: "#ffb07a",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(40, 20, 10, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(20, 10, 5, 0.8)";
            }}
            onClick={goNext}
            aria-label="Next image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Caption bar */}
      <div
        className="flex items-center justify-between border-t px-4 py-2 text-[11px]"
        style={{
          borderColor: "rgba(232, 168, 112, 0.2)",
          color: "#e8a870",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        <span>{name}</span>
        {total > 1 && <span>{index + 1} / {total}</span>}
      </div>
    </div>
  );
}
