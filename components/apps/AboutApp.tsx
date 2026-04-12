"use client";

import { aboutData } from "@/content/about";
import { useWindowManager } from "@/hooks/use-window-manager";

// Phrases that become clickable links inside the intro paragraphs
const LINK_TARGETS: Record<string, () => void> = {};

export function AboutApp() {
  const { openWindow } = useWindowManager();

  // Bind link handlers after `openWindow` is available
  LINK_TARGETS["photos"] = () => openWindow("photos");
  LINK_TARGETS["get in touch"] = () => openWindow("contact");
  LINK_TARGETS["contact"] = () => openWindow("contact");

  return (
    <div className="flex flex-col gap-5">
      {/* Serif heading: Dharmay ——— Dave */}
      <h1
        className="font-serif-heading text-[36px] leading-none"
        style={{ color: "var(--color-text)" }}
      >
        {aboutData.firstName}
        <span
          className="mx-4 inline-block align-middle"
          style={{
            width: "60px",
            height: "2px",
            background: "var(--color-text)",
          }}
        />
        {aboutData.lastName}
      </h1>

      {/* Location + title under the heading */}
      <div className="-mt-3 flex flex-wrap items-center gap-x-2 text-[12px]" style={{ color: "var(--color-text-muted)" }}>
        <span>{aboutData.title}</span>
        <span>·</span>
        <span>{aboutData.location}</span>
      </div>

      {/* Intro paragraphs */}
      <div className="flex flex-col gap-3 text-[12.5px] leading-[1.6]" style={{ color: "var(--color-text-secondary)" }}>
        {aboutData.intro.map((paragraph, i) => (
          <p key={i}>{renderWithLinks(paragraph, openWindow)}</p>
        ))}
      </div>

      {/* Social icon buttons (theme-aware via currentColor) */}
      <div className="flex gap-2">
        <SocialIconButton
          href={aboutData.socials.github}
          label="GitHub"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.73.5.67 5.56.67 11.83c0 4.99 3.24 9.22 7.73 10.71.57.1.77-.25.77-.55v-2.07c-3.15.68-3.82-1.33-3.82-1.33-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.33.95.1-.74.4-1.24.73-1.53-2.52-.29-5.17-1.26-5.17-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.5-1.45.11-3.02 0 0 .96-.31 3.14 1.17.91-.25 1.88-.38 2.85-.38.97 0 1.94.13 2.85.38 2.18-1.48 3.14-1.17 3.14-1.17.61 1.57.23 2.73.11 3.02.73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.18 5.59.41.35.77 1.04.77 2.1v3.11c0 .3.2.66.78.55 4.49-1.5 7.73-5.73 7.73-10.71C23.33 5.56 18.27.5 12 .5z" />
            </svg>
          }
        />
        <SocialIconButton
          href={aboutData.socials.linkedin}
          label="LinkedIn"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18V10.13H5.67V18h2.67zM7 8.94a1.54 1.54 0 1 0 0-3.08 1.54 1.54 0 0 0 0 3.08zM18.34 18v-4.54c0-2.4-1.28-3.52-2.99-3.52-1.38 0-2 .76-2.34 1.29v-1.1h-2.67c.03.74 0 7.87 0 7.87h2.67v-4.4c0-.24.02-.48.09-.65.19-.47.62-.96 1.35-.96.95 0 1.33.73 1.33 1.8V18h2.56z" />
            </svg>
          }
        />
        <SocialIconButton
          href={`mailto:${aboutData.socials.email}`}
          label="Email"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          }
        />
      </div>

      {/* CURRENT FOCUS card */}
      <div
        className="border p-4"
        style={{ background: "var(--color-surface-alt)", borderColor: "var(--color-border)" }}
      >
        <div
          className="mb-3 text-[10.5px] font-semibold tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          CURRENT FOCUS
        </div>
        <ul className="flex flex-col gap-2">
          {aboutData.currentFocus.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[12.5px] leading-[1.55]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0" style={{ background: "var(--color-accent)" }} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* FULL TIMELINE */}
      <div>
        <div
          className="mb-2 text-[10.5px] font-semibold tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          FULL TIMELINE
        </div>
        <p className="mb-3 text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
          View my complete experience and education timeline in a dedicated window.
        </p>
        <button
          className="px-4 py-2 text-[12.5px] font-medium text-white transition-colors"
          style={{ background: "var(--color-button-dark)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-button-dark-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-button-dark)")}
          onClick={() => openWindow("experience")}
        >
          Open Experience
        </button>
      </div>
    </div>
  );
}

/**
 * Renders a paragraph, converting certain keywords into clickable links
 * that open the corresponding app window.
 */
function renderWithLinks(paragraph: string, openWindow: (id: string) => void): React.ReactNode {
  // Keywords to linkify → which app they open
  const linkMap: Record<string, string> = {
    "game theory": "blog",
    "procedural content generation": "blog",
    "Lighthouse": "works",
    "OpenStreetMap": "works",
  };

  const keys = Object.keys(linkMap);
  const pattern = new RegExp(`\\b(${keys.map(escapeRegex).join("|")})\\b`, "g");

  const parts = paragraph.split(pattern);

  return parts.map((part, i) => {
    if (linkMap[part]) {
      return (
        <a
          key={i}
          href="#"
          className="content-link"
          onClick={(e) => {
            e.preventDefault();
            openWindow(linkMap[part]);
          }}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Icon button for GitHub / LinkedIn / Email.
 * Uses currentColor so the SVG auto-adapts to light/dark theme.
 */
function SocialIconButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center border transition-colors"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface-solid)",
        color: "var(--color-text)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border-strong)";
        e.currentTarget.style.color = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.color = "var(--color-text)";
      }}
    >
      {icon}
    </a>
  );
}
