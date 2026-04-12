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

      {/* Social links */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
        <a
          href={aboutData.socials.github}
          target="_blank"
          rel="noopener noreferrer"
          className="content-link"
        >
          GitHub ↗
        </a>
        <a
          href={aboutData.socials.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="content-link"
        >
          LinkedIn ↗
        </a>
        <a href={`mailto:${aboutData.socials.email}`} className="content-link">
          Email ↗
        </a>
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
