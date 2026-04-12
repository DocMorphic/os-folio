"use client";

import { useCallback, useEffect, useState } from "react";
import type { BlogEntry } from "@/lib/blogs-store";

type SubmitState = "idle" | "sending" | "success" | "error";

export function BlogApp() {
  const [blogs, setBlogs] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/blogs", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { blogs: BlogEntry[] };
      setBlogs(data.blogs ?? []);
    } catch {
      // silent — UI still shows whatever's in state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side URL validation
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a URL first.");
      return;
    }
    try {
      const u = new URL(trimmed);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        setError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }

    setSubmitState("sending");
    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, title: title.trim() || undefined }),
      });
      const data = (await res.json()) as { blog?: BlogEntry; error?: string };
      if (!res.ok || !data.blog) {
        setSubmitState("error");
        setError(data.error || `Failed (${res.status})`);
        return;
      }
      // Optimistic prepend
      setBlogs((prev) => [data.blog!, ...prev]);
      setUrl("");
      setTitle("");
      setSubmitState("success");
      setTimeout(() => setSubmitState("idle"), 1500);
    } catch (err) {
      setSubmitState("error");
      setError(err instanceof Error ? err.message : "Network error");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1
          className="font-serif-heading text-[30px] leading-none"
          style={{ color: "var(--color-text)" }}
        >
          Blog
        </h1>
        <p
          className="mt-3 text-[12.5px] leading-[1.55]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          A shared list of posts worth reading. Found something cool? Drop the
          link below — it'll show up for everyone.
        </p>
      </div>

      {/* Add-link form — compact */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-1.5 border px-3 py-2"
        style={{
          background: "var(--color-surface-alt)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex gap-1.5">
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="https://..."
            className="min-w-0 flex-1 border px-2 py-1 text-[11.5px] outline-none"
            style={{
              background: "var(--color-input-bg)",
              borderColor: error ? "var(--color-error)" : "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="hidden min-w-0 flex-1 border px-2 py-1 text-[11.5px] outline-none sm:block"
            style={{
              background: "var(--color-input-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
          />
          <button
            type="submit"
            disabled={submitState === "sending"}
            className="shrink-0 px-3 py-1 text-[11px] font-medium text-white transition-colors disabled:opacity-70"
            style={{ background: "var(--color-button-dark)" }}
            onMouseEnter={(e) => {
              if (submitState !== "sending")
                e.currentTarget.style.background = "var(--color-button-dark-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-button-dark)";
            }}
          >
            {submitState === "sending" ? "…" : "Add"}
          </button>
        </div>

        {error && (
          <div className="text-[10.5px]" style={{ color: "var(--color-error)" }}>
            {error}
          </div>
        )}
        {submitState === "success" && !error && (
          <div className="text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>
            Added.
          </div>
        )}
      </form>

      {/* POST LIST card */}
      <div className="border" style={{ borderColor: "var(--color-border-hover)" }}>
        <div
          className="border-b px-4 py-2.5"
          style={{
            background: "var(--color-surface-alt)",
            borderColor: "var(--color-border-hover)",
          }}
        >
          <span
            className="text-[10.5px] font-semibold tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            POST LIST
          </span>
        </div>

        {loading ? (
          <div
            className="px-4 py-6 text-center text-[12px]"
            style={{ color: "var(--color-text-dim)" }}
          >
            Loading...
          </div>
        ) : blogs.length === 0 ? (
          <div
            className="px-4 py-6 text-center text-[12px]"
            style={{ color: "var(--color-text-dim)" }}
          >
            No posts yet. Be the first to drop a link above.
          </div>
        ) : (
          blogs.map((b, i) => (
            <a
              key={b.id}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)] ${
                i !== blogs.length - 1 ? "border-b" : ""
              }`}
              style={{
                borderColor: "var(--color-border-hover)",
                color: "var(--color-text)",
              }}
            >
              <div className="mt-0.5 shrink-0">
                <BookIcon />
              </div>
              <div className="min-w-0 flex-1">
                <div
                  className="truncate text-[12.5px] font-medium"
                  style={{ color: "var(--color-text)" }}
                >
                  {b.title}
                </div>
                <div
                  className="mt-0.5 truncate text-[10.5px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {hostnameOf(b.url)} · added {formatDate(b.createdAt)}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect
        x="3"
        y="3"
        width="14"
        height="14"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        style={{ color: "var(--color-text-muted)" }}
      />
      <line x1="6" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1" style={{ color: "var(--color-text-muted)" }} />
      <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1" style={{ color: "var(--color-text-muted)" }} />
      <line x1="6" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1" style={{ color: "var(--color-text-muted)" }} />
    </svg>
  );
}
