"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { useTheme } from "@/hooks/use-theme";
import { APP_REGISTRY } from "@/lib/constants";
import { projects } from "@/content/projects";
import { experience } from "@/content/experience";
import { blogPosts } from "@/content/blog-posts";
import { FOLDER_CONTENTS } from "@/content/folder-files";

type ResultKind =
  | "app"
  | "folder"
  | "text-file"
  | "project"
  | "blog-post"
  | "experience"
  | "command";

interface Result {
  id: string;
  label: string;
  subtitle?: string;
  kind: ResultKind;
  /** Runs when this result is selected (via click or Enter). */
  action: () => void;
}

export function SearchApp() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { openWindow, closeWindow, windows, getFocusedAppId } = useWindowManager();
  const { toggleMode, setAccent } = useTheme();

  // Build the full searchable corpus once
  const allResults = useMemo<Result[]>(() => {
    const results: Result[] = [];

    // Apps
    Object.values(APP_REGISTRY)
      .filter((app) => app.showInExplorer)
      .forEach((app) => {
        results.push({
          id: `app-${app.id}`,
          label: app.title,
          subtitle: "App",
          kind: "app",
          action: () => openWindow(app.id),
        });
      });

    // Folders
    Object.entries(FOLDER_CONTENTS).forEach(([folderId, folder]) => {
      results.push({
        id: `folder-${folderId}`,
        label: folder.label,
        subtitle: `Folder · ${folder.items.filter((i) => i.type === "image").length} photos`,
        kind: "folder",
        action: () => openWindow(`folder-${folderId}`),
      });
    });

    // Text files on the desktop
    results.push({
      id: "file-about",
      label: "about.txt",
      subtitle: "Text file",
      kind: "text-file",
      action: () => openWindow("about-txt"),
    });
    results.push({
      id: "file-buildlog",
      label: "build-log.md",
      subtitle: "Text file",
      kind: "text-file",
      action: () => openWindow("build-log-md"),
    });

    // Projects
    projects.forEach((p) => {
      results.push({
        id: `project-${p.id}`,
        label: p.title,
        subtitle: `Project · ${p.year}`,
        kind: "project",
        action: () => openWindow("works"),
      });
    });

    // Blog posts
    blogPosts.forEach((post) => {
      results.push({
        id: `blog-${post.id}`,
        label: post.title,
        subtitle: `Blog · ${post.date}`,
        kind: "blog-post",
        action: () => openWindow("blog"),
      });
    });

    // Experience entries
    experience.forEach((e) => {
      results.push({
        id: `exp-${e.id}`,
        label: `${e.role} at ${e.company}`,
        subtitle: `Experience · ${e.startDate} – ${e.endDate}`,
        kind: "experience",
        action: () => openWindow("experience"),
      });
    });

    // Commands
    results.push({
      id: "cmd-close-all",
      label: "Close all windows",
      subtitle: "Command",
      kind: "command",
      action: () => {
        [...windows].forEach((w) => closeWindow(w.appId));
      },
    });
    results.push({
      id: "cmd-toggle-dark",
      label: "Toggle dark mode",
      subtitle: "Command",
      kind: "command",
      action: () => toggleMode(),
    });
    (["orange", "green", "blue", "purple"] as const).forEach((c) => {
      results.push({
        id: `cmd-accent-${c}`,
        label: `Set accent: ${c}`,
        subtitle: "Command",
        kind: "command",
        action: () => setAccent(c),
      });
    });

    return results;
  }, [openWindow, closeWindow, toggleMode, setAccent, windows]);

  // Filter + rank by query
  const filtered = useMemo<Result[]>(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allResults.slice(0, 12); // default "recent/everything" view

    // Parse intent keywords
    const isClose = /^close\b/.test(q);
    const isOpen = /^(open|show|launch|go to)\b/.test(q);
    const cleanQ = q.replace(/^(open|show|launch|go to|close)\s+/, "");

    // "close all" / "close all windows"
    if (isClose && /^close(\s+all)?(\s+windows?)?$/.test(q)) {
      return allResults.filter((r) => r.id === "cmd-close-all");
    }

    // Score each result: label match > subtitle match, word-start > substring
    const scored = allResults
      .map((r) => {
        const label = r.label.toLowerCase();
        const sub = (r.subtitle || "").toLowerCase();
        let score = 0;

        if (label === cleanQ || label === q) score += 1000;
        if (label.startsWith(cleanQ) || label.startsWith(q)) score += 500;

        // Every word in the query must match somewhere
        const words = (cleanQ || q).split(/\s+/).filter(Boolean);
        let allMatched = true;
        for (const w of words) {
          if (label.includes(w)) score += 50;
          else if (sub.includes(w)) score += 20;
          else allMatched = false;
        }
        if (!allMatched) return { r, score: 0 };

        // Intent boost
        if (isOpen && (r.kind === "app" || r.kind === "folder" || r.kind === "text-file")) {
          score += 100;
        }
        if (isClose && r.kind === "command") score += 100;

        return { r, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    return scored.map((x) => x.r);
  }, [query, allResults]);

  // Reset selection when the query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const runResult = (r: Result) => {
    r.action();
    // Close the search window when a result opens something — except for commands
    // that don't open a window (like toggle-dark / set-accent)
    if (r.kind !== "command" || r.id === "cmd-close-all") {
      closeWindow("search");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = filtered[selectedIndex];
      if (r) runResult(r);
    } else if (e.key === "Escape") {
      closeWindow("search");
    }
  };

  return (
    <div className="-mx-5 -my-4 flex h-[calc(100%+32px)] flex-col">
      {/* Input area */}
      <div
        className="shrink-0 border-b px-4 py-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <textarea
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full resize-none bg-transparent text-[15px] leading-[1.3] outline-none"
          style={{
            color: "var(--color-text)",
            fontFamily: "var(--font-dm-sans), sans-serif",
            minHeight: "28px",
            maxHeight: "56px",
          }}
          placeholder="Type anything. Try: open contact, close all windows, toggle dark mode…"
          rows={1}
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-[12px]" style={{ color: "var(--color-text-dim)" }}>
            No results. Try: <code style={{ fontFamily: "var(--font-geist-mono), monospace" }}>open contact</code>,{" "}
            <code style={{ fontFamily: "var(--font-geist-mono), monospace" }}>show germany</code>,{" "}
            <code style={{ fontFamily: "var(--font-geist-mono), monospace" }}>close all windows</code>.
          </div>
        ) : (
          <ul>
            {filtered.map((r, i) => {
              const isSelected = i === selectedIndex;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left transition-colors"
                    style={{
                      background: isSelected ? "var(--color-button-dark)" : "transparent",
                      color: isSelected ? "#ffffff" : "var(--color-text)",
                    }}
                    onClick={() => runResult(r)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <ResultIcon kind={r.kind} selected={isSelected} />
                      <span className="truncate text-[13px] font-medium">{r.label}</span>
                    </div>
                    {r.subtitle && (
                      <span
                        className="shrink-0 text-[10px] font-semibold uppercase tracking-wider"
                        style={{
                          color: isSelected ? "rgba(255,255,255,0.7)" : "var(--color-text-muted)",
                        }}
                      >
                        {r.subtitle}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer hint */}
      <div
        className="shrink-0 border-t px-4 py-1.5 text-[10px]"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface-alt)",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
      >
        ↑↓ navigate · ↵ open · esc close
      </div>
    </div>
  );
}

function ResultIcon({ kind, selected }: { kind: ResultKind; selected: boolean }) {
  const color = selected ? "#ffffff" : "var(--color-text-muted)";
  const common = { width: 16, height: 16, fill: "none", stroke: color, strokeWidth: 1.5 };

  switch (kind) {
    case "folder":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
        </svg>
      );
    case "text-file":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6" />
        </svg>
      );
    case "blog-post":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case "project":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "experience":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "command":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case "app":
    default:
      return (
        <svg {...common} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
  }
}
