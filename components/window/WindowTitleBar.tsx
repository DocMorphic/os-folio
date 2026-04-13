"use client";

interface WindowTitleBarProps {
  title: string;
  isFocused: boolean;
  isMaximized?: boolean;
  /** When false, cursor falls back to default (no drag affordance). */
  draggable?: boolean;
  itemCount?: number;
  statusText?: string;
  showMinimize?: boolean;
  showMaximize?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

export function WindowTitleBar({
  title,
  isFocused,
  isMaximized = false,
  draggable = true,
  itemCount,
  statusText,
  showMinimize = true,
  showMaximize = true,
  onClose,
  onMinimize,
  onMaximize,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: WindowTitleBarProps) {
  // Priority: statusText > itemCount > active dot
  const hasMeta = !!statusText || typeof itemCount === "number";

  return (
    <div
      className={`notebook-tape relative flex h-10 shrink-0 items-center justify-between border-b pl-4 pr-1.5 ${
        draggable ? "cursor-move" : "cursor-default"
      }`}
      style={{
        background: "var(--color-titlebar)",
        borderColor: "var(--color-border)",
        // Tape has a subtle vertical gradient like a piece of masking
        // tape catching light, plus an irregular faint stripe across.
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.04) 100%), repeating-linear-gradient(88deg, transparent 0 22px, rgba(0,0,0,0.018) 22px 23px)",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Title — LEFT, in handwritten Kalam */}
      <span
        className="pointer-events-none truncate text-[14px]"
        style={{
          fontFamily: "var(--font-kalam), cursive",
          color: isFocused ? "var(--color-text)" : "var(--color-text-muted)",
          fontWeight: 700,
          letterSpacing: "0.01em",
        }}
      >
        {title}
      </span>

      {/* Controls — RIGHT */}
      <div
        className="flex h-full items-center gap-1.5"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Status text or item count or active dot */}
        {statusText ? (
          <div className="mr-1.5 flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-accent)" }} />
            <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              {statusText}
            </span>
          </div>
        ) : typeof itemCount === "number" ? (
          <div className="mr-1.5 flex items-center gap-1">
            <div className="h-1 w-1" style={{ background: "var(--color-accent)" }} />
            <span className="text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>
              {itemCount} items
            </span>
          </div>
        ) : (
          <div
            className="mr-1.5 h-1.5 w-1.5 rotate-45"
            style={{ background: "var(--color-accent)" }}
          />
        )}

        {/* Minimize */}
        {showMinimize && (
          <button className="window-control-btn" onClick={onMinimize} aria-label="Minimize">
            <svg width="12" height="12" viewBox="0 0 14 14">
              <rect x="3" y="6" width="8" height="1.8" fill="white" />
            </svg>
          </button>
        )}

        {/* Maximize / Restore — same button, SVG flips based on state */}
        {showMaximize && (
          <button
            className="window-control-btn maximize"
            onClick={onMaximize}
            aria-label={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? (
              // Restore: two overlapping squares
              <svg width="12" height="12" viewBox="0 0 14 14">
                <rect x="4.5" y="2.5" width="7" height="7" stroke="white" strokeWidth="1.4" fill="none" />
                <rect x="2.5" y="4.5" width="7" height="7" stroke="white" strokeWidth="1.4" fill="#8a7560" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 14 14">
                <rect x="3" y="3" width="8" height="8" stroke="white" strokeWidth="1.5" fill="none" />
              </svg>
            )}
          </button>
        )}

        {/* Close */}
        <button className="window-control-btn close" onClick={onClose} aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 14 14">
            <line x1="3.5" y1="3.5" x2="10.5" y2="10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="10.5" y1="3.5" x2="3.5" y2="10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
