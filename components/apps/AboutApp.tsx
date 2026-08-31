"use client";

import { aboutData } from "@/content/about";
import { useWindowManager } from "@/hooks/use-window-manager";

export function AboutApp() {
  const { openWindow } = useWindowManager();

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col gap-5">
        <div>
          <h1
            className="font-serif-heading flex flex-wrap items-center gap-x-4 text-[clamp(38px,8vw,64px)] leading-[0.95]"
            style={{ color: "var(--color-text)" }}
          >
            <span>{aboutData.firstName}</span>
            <span
              className="h-[2px] w-12 sm:w-20"
              style={{ background: "var(--color-accent)" }}
              aria-hidden="true"
            />
            <span>{aboutData.lastName}</span>
          </h1>
          <p
            className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {aboutData.title} · {aboutData.location}
          </p>
        </div>

        <div
          className="flex max-w-[68ch] flex-col gap-3 text-[13px] leading-[1.65]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <p>{aboutData.intro[0]}</p>
          <p>
            {aboutData.intro[1]} Browse my{" "}
            <button className="content-link" onClick={() => openWindow("works")}>
              projects
            </button>
            , follow along on{" "}
            <a
              className="content-link"
              href={aboutData.socials.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            , connect on{" "}
            <a
              className="content-link"
              href={aboutData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            , or{" "}
            <button className="content-link" onClick={() => openWindow("contact")}>
              get in touch
            </button>
            .
          </p>
        </div>

        <section className="border" style={{ borderColor: "var(--color-border)" }}>
          <h2
            className="border-b px-4 py-2.5 text-[10.5px] font-semibold tracking-[0.16em]"
            style={{
              background: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            CURRENT FOCUS
          </h2>
          <ul className="flex flex-col gap-2.5 p-4">
            {aboutData.currentFocus.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[12.5px] leading-[1.55]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span
                  className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2
            className="text-[10.5px] font-semibold tracking-[0.16em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            FULL TIMELINE
          </h2>
          <p
            className="mt-2 text-[12.5px] leading-[1.55]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The complete work and education story, with the useful details left in.
          </p>
          <button
            className="mt-3 border px-4 py-2 text-[12px] font-medium text-white transition-colors"
            style={{
              background: "var(--color-button-dark)",
              borderColor: "var(--color-border-strong)",
            }}
            onClick={() => openWindow("experience")}
          >
            Open Experience
          </button>
        </section>
      </div>

      <PixelCompanion />
    </div>
  );
}

function PixelCompanion() {
  return (
    <div className="pixel-companion-stage mt-auto min-h-28 overflow-hidden pt-7" aria-hidden="true">
      <div className="pixel-companion">
        <svg
          className="pixel-companion-dog"
          width="88"
          height="52"
          viewBox="0 0 44 26"
          fill="none"
          shapeRendering="crispEdges"
        >
          <g className="pixel-dog-tail" fill="var(--color-text-muted)">
            <rect x="35" y="10" width="6" height="3" />
            <rect x="39" y="7" width="3" height="4" />
          </g>
          <g fill="var(--color-text-dim)">
            <rect x="11" y="8" width="25" height="10" />
            <rect x="7" y="6" width="11" height="10" />
            <rect x="5" y="3" width="8" height="8" />
            <rect x="4" y="2" width="3" height="5" />
            <rect x="12" y="3" width="3" height="5" />
          </g>
          <rect x="6" y="7" width="2" height="2" fill="var(--color-text)" />
          <rect x="3" y="8" width="3" height="2" fill="var(--color-text-muted)" />
          <g className="pixel-dog-leg pixel-dog-leg-a" fill="var(--color-text-muted)">
            <rect x="12" y="17" width="4" height="7" />
            <rect x="10" y="23" width="6" height="2" />
            <rect x="29" y="17" width="4" height="7" />
            <rect x="29" y="23" width="6" height="2" />
          </g>
          <g className="pixel-dog-leg pixel-dog-leg-b" fill="var(--color-text-dim)">
            <rect x="18" y="17" width="4" height="6" />
            <rect x="17" y="22" width="5" height="2" />
            <rect x="34" y="16" width="3" height="7" />
            <rect x="34" y="22" width="5" height="2" />
          </g>
        </svg>
      </div>
      <div className="pixel-companion-shadow" />
    </div>
  );
}
