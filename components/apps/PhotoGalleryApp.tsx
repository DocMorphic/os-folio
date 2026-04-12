"use client";

interface FolderItem {
  name: string;
  type: "text" | "image";
}

const PROVENCE_ITEMS: FolderItem[] = [
  { name: "provance-france-2025-trip.txt", type: "text" },
  { name: "provance-1.png", type: "image" },
  { name: "provance-2.png", type: "image" },
  { name: "provance-3.png", type: "image" },
  { name: "provance-4.png", type: "image" },
  { name: "provance-5.png", type: "image" },
  { name: "provance-6.png", type: "image" },
];

export function PhotoGalleryApp() {
  const items = PROVENCE_ITEMS;

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
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              {item.type === "text" ? <TextFileIcon /> : <ImageFileIcon />}
            </div>

            <span className="flex-1 text-[12.5px]" style={{ color: "var(--color-text)" }}>
              {item.name}
            </span>

            <span className="text-[10.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              {item.type.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextFileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="3" width="12" height="18" fill="#f5e7d0" stroke="#3a2817" strokeWidth="1.5"/>
      <path d="M14 3L14 7L18 7" fill="#d4c4a8" stroke="#3a2817" strokeWidth="1.5"/>
      <line x1="7" y1="11" x2="15" y2="11" stroke="#7a6346" strokeWidth="1"/>
      <line x1="7" y1="14" x2="15" y2="14" stroke="#7a6346" strokeWidth="1"/>
      <line x1="7" y1="17" x2="13" y2="17" stroke="#7a6346" strokeWidth="1"/>
    </svg>
  );
}

function ImageFileIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="14" fill="#c8b894" stroke="#3a2817" strokeWidth="1.5"/>
      <rect x="5" y="6" width="14" height="10" fill="#8b5a2b"/>
      <polygon points="5,14 9,10 12,13 15,9 19,14 19,16 5,16" fill="#e8d5b0"/>
      <circle cx="8" cy="9" r="1" fill="#f7ebd8"/>
    </svg>
  );
}
