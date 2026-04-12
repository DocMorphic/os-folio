"use client";

import { aboutData } from "@/content/about";
import { useWindowManager } from "@/hooks/use-window-manager";

export function AboutApp() {
  const { openWindow } = useWindowManager();

  return (
    <div className="flex flex-col gap-5">
      {/* Serif heading: Wes ——— Dieleman */}
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

      {/* Intro paragraphs */}
      <div className="flex flex-col gap-3 text-[12.5px] leading-[1.6]" style={{ color: "var(--color-text-secondary)" }}>
        {aboutData.intro.map((paragraph, i) => (
          <p key={i}>
            {paragraph.split(/(\b(?:photos|LinkedIn|get in touch|Project X|Company|University)\b)/).map((part, j) => {
              if (["photos", "LinkedIn", "get in touch"].includes(part)) {
                return (
                  <a
                    key={j}
                    href="#"
                    className="content-link"
                    onClick={(e) => {
                      e.preventDefault();
                      if (part === "photos") openWindow("photos");
                      if (part === "get in touch") openWindow("contact");
                    }}
                  >
                    {part}
                  </a>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        ))}
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
            <li key={i} className="flex items-start gap-2 text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
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
          View my complete experience timeline in a dedicated window with full role context.
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

      {/* Dog illustration placeholder */}
      <div className="flex justify-center pt-4">
        <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
          {/* Simple dog silhouette */}
          <path d="M15 50 Q15 30 25 28 Q28 20 35 20 Q40 15 48 18 L65 18 Q75 18 80 28 Q85 35 85 45 L85 55 L80 55 L80 48 L75 48 L75 55 L35 55 L35 48 L30 48 L30 55 L15 55 Z" fill="#a08968" opacity="0.7"/>
          <circle cx="42" cy="28" r="2" fill="#3a2817"/>
          <path d="M48 32 L52 35" stroke="#3a2817" strokeWidth="1"/>
          <rect x="35" y="55" width="60" height="5" fill="#7a6346" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}
