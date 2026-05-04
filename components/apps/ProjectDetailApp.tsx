"use client";

import { useCallback, useEffect } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { projects } from "@/content/projects";
import { PROJECT_DETAILS } from "@/content/project-details";

const APP_ID = "project-detail";

export function ProjectDetailApp() {
  const { windowContexts, setWindowContext, setWindowStatus } =
    useWindowManager();
  const ctx = windowContexts[APP_ID];
  const projectId = ctx?.projectId;

  const project = projects.find((p) => p.id === projectId);
  const detail = projectId ? PROJECT_DETAILS[projectId] : undefined;

  const visuals = detail?.visuals ?? [];
  const slideIndex = ctx?.projectSlide ?? 0;
  const currentVisual = visuals[slideIndex];

  // Set window title bar to project name
  useEffect(() => {
    if (project) {
      setWindowStatus(APP_ID, project.title);
    }
    return () => setWindowStatus(APP_ID, "");
  }, [project, setWindowStatus]);

  // Keyboard navigation for carousel
  const goPrev = useCallback(() => {
    if (visuals.length <= 1) return;
    const next = (slideIndex - 1 + visuals.length) % visuals.length;
    setWindowContext(APP_ID, { projectSlide: next });
  }, [slideIndex, visuals.length, setWindowContext]);

  const goNext = useCallback(() => {
    if (visuals.length <= 1) return;
    const next = (slideIndex + 1) % visuals.length;
    setWindowContext(APP_ID, { projectSlide: next });
  }, [slideIndex, visuals.length, setWindowContext]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p
          className="text-[13px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          No project selected.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* LEFT COLUMN — metadata + description (scrollable) */}
      <div
        className="custom-scrollbar flex w-[40%] shrink-0 flex-col gap-5 overflow-y-auto border-r p-5"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Title + role + dates */}
        <div>
          <h2
            className="font-serif-heading text-[24px] leading-tight"
            style={{ color: "var(--color-text)" }}
          >
            {project.title}
          </h2>
          <p
            className="mt-1 text-[11.5px] font-semibold tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            {project.role?.toUpperCase()}
            {project.startDate && (
              <>
                {" "}
                &middot; {project.startDate} - {project.endDate || "Now"}
              </>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11.5px] font-semibold tracking-wider transition-colors"
              style={{
                borderColor: "var(--color-border-strong)",
                color: "var(--color-text)",
                background: "var(--color-surface-solid)",
              }}
            >
              VISIT PROJECT
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3 9L9 3M9 3H4M9 3V8" />
              </svg>
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11.5px] font-semibold tracking-wider transition-colors"
              style={{
                borderColor: "var(--color-border-strong)",
                color: "var(--color-text)",
                background: "var(--color-surface-solid)",
              }}
            >
              GITHUB
              <svg
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3 9L9 3M9 3H4M9 3V8" />
              </svg>
            </a>
          )}
        </div>

        {/* Tech stack */}
        <div>
          <div
            className="mb-2 text-[10px] font-semibold tracking-wider"
            style={{ color: "var(--color-text-muted)" }}
          >
            TECH STACK
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="border px-2 py-0.5 text-[11px]"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  background: "var(--color-tag-bg)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tasks */}
        {detail?.tasks && detail.tasks.length > 0 && (
          <div>
            <div
              className="mb-2 text-[10px] font-semibold tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              TASKS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {detail.tasks.map((task) => (
                <span
                  key={task}
                  className="border px-2 py-0.5 text-[11px]"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    background: "var(--color-tag-bg)",
                  }}
                >
                  {task}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {detail?.references && detail.references.length > 0 && (
          <div>
            <div
              className="mb-2 text-[10px] font-semibold tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              REFERENCES
            </div>
            <div className="flex flex-col gap-1">
              {detail.references.map((ref) => (
                <a
                  key={ref.href}
                  href={ref.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] underline"
                  style={{ color: "var(--color-link)" }}
                >
                  <span
                    className="h-1.5 w-1.5"
                    style={{ background: "var(--color-accent)" }}
                  />
                  {ref.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          className="h-px"
          style={{ background: "var(--color-border)" }}
        />

        {/* Description sections */}
        {detail?.sections.map((section) => (
          <div key={section.title}>
            <h3
              className="mb-2 text-[15px] font-semibold"
              style={{ color: "var(--color-text)" }}
            >
              {section.title}
            </h3>
            <p
              className="text-[12.5px] leading-[1.6]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {section.content}
            </p>
          </div>
        ))}

        {/* Fallback if no detail */}
        {!detail && (
          <p
            className="text-[12.5px] leading-[1.6]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {project.description}
          </p>
        )}
      </div>

      {/* RIGHT COLUMN — visuals carousel */}
      <div className="flex flex-1 flex-col p-5">
        {/* Carousel header */}
        <div
          className="mb-3 text-[10.5px] font-semibold tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          VISUALS &middot; {visuals.length > 0 ? `${visuals.length} SLIDES` : "NO SLIDES YET"}
        </div>

        {visuals.length > 0 && currentVisual ? (
          <>
            {/* Main display */}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden border"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface-alt)",
              }}
            >
              {currentVisual.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentVisual.src}
                  alt={currentVisual.caption || `Slide ${slideIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <video
                  src={currentVisual.src}
                  controls
                  className="max-h-full max-w-full"
                />
              )}

              {/* Prev/Next arrows */}
              {visuals.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center border"
                    style={{
                      background: "var(--color-surface-solid)",
                      borderColor: "var(--color-border-strong)",
                      color: "var(--color-text)",
                    }}
                    aria-label="Previous slide"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 5L6 8" />
                    </svg>
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center border"
                    style={{
                      background: "var(--color-surface-solid)",
                      borderColor: "var(--color-border-strong)",
                      color: "var(--color-text)",
                    }}
                    aria-label="Next slide"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 2L7 5L4 8" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Slide label */}
            <div
              className="mt-2 text-[10px] tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              SLIDE {slideIndex + 1} &middot;{" "}
              {currentVisual.type === "image" ? "IMAGE" : "VIDEO"}
            </div>

            {/* Thumbnail strip */}
            {visuals.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {visuals.map((v, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setWindowContext(APP_ID, { projectSlide: i })
                    }
                    className="shrink-0 border-2 transition-opacity"
                    style={{
                      width: 64,
                      height: 48,
                      borderColor:
                        i === slideIndex
                          ? "var(--color-accent)"
                          : "var(--color-border)",
                      opacity: i === slideIndex ? 1 : 0.6,
                      overflow: "hidden",
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  >
                    {v.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={v.src}
                        alt={v.caption || `Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-[9px]"
                        style={{
                          background: "var(--color-surface-alt)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        VIDEO
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div
            className="flex flex-1 items-center justify-center border"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface-alt)",
            }}
          >
            <div className="text-center">
              <p
                className="text-[13px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                No visuals yet
              </p>
              <p
                className="mt-1 text-[11px]"
                style={{ color: "var(--color-text-muted)", opacity: 0.6 }}
              >
                Screenshots and videos will be added soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
