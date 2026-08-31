"use client";

import Image from "next/image";
import { FOLDER_CONTENTS, type FolderItem } from "@/content/folder-files";
import { useWindowManager } from "@/hooks/use-window-manager";

interface FolderViewProps {
  folderId: string;
}

export function FolderView({ folderId }: FolderViewProps) {
  const { openWindow } = useWindowManager();
  const folder = FOLDER_CONTENTS[folderId];

  if (!folder) {
    return (
      <div className="p-4 text-[13px]" style={{ color: "var(--color-text-muted)" }}>
        Folder not found: {folderId}
      </div>
    );
  }

  const items = folder.items;
  // Pre-compute image indices so prev/next skips text entries
  const imagesOnly = items.filter((it) => it.type === "image");

  const handleClickItem = (item: FolderItem) => {
    if (item.type === "text") {
      // Open the dedicated notes app for this folder
      openWindow(`${folderId}-notes`);
      return;
    }
    if (item.type === "image" && item.src) {
      const imageIndex = imagesOnly.findIndex((i) => i.name === item.name);
      openWindow("image-viewer", {
        imageUrl: item.src,
        imageName: item.name,
        folderId,
        imageIndex: Math.max(0, imageIndex),
        imageCount: imagesOnly.length,
      });
    }
  };

  return (
    <div className="-mx-5 -my-4 h-[calc(100%+32px)] overflow-hidden">
      {/* FOLDER CONTENTS header */}
      <div
        className="flex items-center justify-between border-b-2 px-4 py-3"
        style={{
          background: "var(--color-surface-alt)",
          borderColor: "var(--color-border)",
        }}
      >
        <span className="text-[11.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          FOLDER CONTENTS
        </span>
        <span className="text-[11.5px]" style={{ color: "var(--color-text-muted)" }}>
          {items.length} items
        </span>
      </div>

      {/* Items list */}
      <div className="custom-scrollbar h-full overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-4 py-6 text-center text-[12px]" style={{ color: "var(--color-text-dim)" }}>
            Empty folder. Add photos to{" "}
            <code
              style={{
                background: "var(--color-tag-bg)",
                padding: "1px 4px",
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              }}
            >
              public/photos/{folderId}/
            </code>{" "}
            and list them in{" "}
            <code
              style={{
                background: "var(--color-tag-bg)",
                padding: "1px 4px",
                fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
              }}
            >
              content/folder-files.ts
            </code>
            .
          </div>
        ) : (
          items.map((item) => (
            <FolderRow key={item.name} item={item} onClick={() => handleClickItem(item)} />
          ))
        )}
      </div>
    </div>
  );
}

function FolderRow({ item, onClick }: { item: FolderItem; onClick: () => void }) {
  return (
    <button
      className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
      style={{ borderColor: "var(--color-border)" }}
      onClick={onClick}
      onDoubleClick={onClick}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        {item.type === "text" ? <TextFileIcon /> : <ImageFileIcon src={item.src} />}
      </div>

      <span className="flex-1 truncate text-[12.5px]" style={{ color: "var(--color-text)" }}>
        {item.name}
      </span>

      <span className="text-[10.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
        {item.type.toUpperCase()}
      </span>
    </button>
  );
}

function TextFileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="12" height="18" fill="#f5e7d0" stroke="#3a2817" strokeWidth="1.5" />
      <path d="M14 3L14 7L18 7" fill="#d4c4a8" stroke="#3a2817" strokeWidth="1.5" />
      <line x1="7" y1="11" x2="15" y2="11" stroke="#7a6346" strokeWidth="1" />
      <line x1="7" y1="14" x2="15" y2="14" stroke="#7a6346" strokeWidth="1" />
      <line x1="7" y1="17" x2="13" y2="17" stroke="#7a6346" strokeWidth="1" />
    </svg>
  );
}

function ImageFileIcon({ src }: { src?: string }) {
  if (src) {
    const thumbnailSrc = src.replace(
      /^\/photos\/([^/]+)\/([^/.]+)\.[^.]+$/,
      "/photos/thumbnails/$1/$2.webp"
    );
    return (
      <div
        className="relative h-[26px] w-[26px] overflow-hidden rounded-sm border"
        style={{ borderColor: "var(--color-border)" }}
      >
        <Image
          src={thumbnailSrc}
          alt=""
          fill
          sizes="32px"
          unoptimized
          style={{ objectFit: "cover" }}
        />
      </div>
    );
  }
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="14" fill="#c8b894" stroke="#3a2817" strokeWidth="1.5" />
      <rect x="5" y="6" width="14" height="10" fill="#8b5a2b" />
      <polygon points="5,14 9,10 12,13 15,9 19,14 19,16 5,16" fill="#e8d5b0" />
      <circle cx="8" cy="9" r="1" fill="#f7ebd8" />
    </svg>
  );
}

// === Three wrappers per folder (each is a distinct app registered in APP_REGISTRY) ===
export function GermanyFolder() {
  return <FolderView folderId="germany" />;
}
export function AustriaFolder() {
  return <FolderView folderId="austria" />;
}
export function IndiaFolder() {
  return <FolderView folderId="india" />;
}

// Back-compat default export
export function PhotoGalleryApp() {
  return <FolderView folderId="germany" />;
}
