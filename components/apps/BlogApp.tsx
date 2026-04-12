"use client";

import { blogPosts } from "@/content/blog-posts";

export function BlogApp() {
  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1 className="font-serif-heading text-[30px] leading-none" style={{ color: "var(--color-text)" }}>
          Blog
        </h1>
        <p className="mt-3 text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
          Browse posts in explorer mode. Click a post to open its article in a new window with metadata, images, and code blocks.
        </p>
      </div>

      {/* POST LIST card */}
      <div className="border" style={{ borderColor: "var(--color-border)" }}>
        {/* Card header */}
        <div
          className="border-b px-4 py-2.5"
          style={{
            background: "var(--color-surface-alt)",
            borderColor: "var(--color-border)",
          }}
        >
          <span className="text-[10.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            POST LIST
          </span>
        </div>

        {/* Post rows */}
        {blogPosts.map((post, i) => (
          <div
            key={post.id}
            className={`flex gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-hover)] ${
              i !== blogPosts.length - 1 ? "border-b" : ""
            }`}
            style={{ borderColor: "var(--color-border)" }}
          >
            {/* Book icon */}
            <div className="mt-0.5 shrink-0">
              <BookIcon />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium" style={{ color: "var(--color-text)" }}>
                {post.title}
              </div>
              <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>
                {post.date} · {post.readingTime}
              </div>
              <p className="mt-1 text-[11.5px] leading-[1.5]" style={{ color: "var(--color-text-muted)" }}>
                {post.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" stroke="currentColor" strokeWidth="1.5" fill="none" style={{ color: "var(--color-text-muted)" }}/>
      <line x1="6" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1" style={{ color: "var(--color-text-muted)" }}/>
      <line x1="6" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="1" style={{ color: "var(--color-text-muted)" }}/>
      <line x1="6" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1" style={{ color: "var(--color-text-muted)" }}/>
    </svg>
  );
}
