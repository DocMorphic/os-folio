"use client";

import { useEffect } from "react";
import { useWindowManager } from "@/hooks/use-window-manager";
import { projects } from "@/content/projects";
import {
  PROJECT_DETAILS,
  type ProjectVisual,
} from "@/content/project-details";

const APP_ID = "project-detail";

export function ProjectDetailApp() {
  const { windowContexts, setWindowStatus } = useWindowManager();
  const projectId = windowContexts[APP_ID]?.projectId;
  const project = projects.find((item) => item.id === projectId);
  const detail = projectId ? PROJECT_DETAILS[projectId] : undefined;

  useEffect(() => {
    setWindowStatus(APP_ID, project?.title ?? "");
    return () => setWindowStatus(APP_ID, "");
  }, [project, setWindowStatus]);

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
          No project selected.
        </p>
      </div>
    );
  }

  const visuals = detail?.visuals ?? [];
  const tasks = detail?.tasks ?? [];

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(270px,0.78fr)_minmax(0,1.35fr)]">
      <div
        className="custom-scrollbar flex min-h-0 flex-col gap-5 overflow-y-auto border p-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <header>
          <p
            className="text-[10px] font-semibold tracking-[0.18em]"
            style={{ color: "var(--color-accent)" }}
          >
            PROJECT CASE STUDY · {project.year}
          </p>
          <h1
            className="font-serif-heading mt-2 text-[32px] leading-none"
            style={{ color: "var(--color-text)" }}
          >
            {project.title}
          </h1>
          <p
            className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {project.role}
            {project.startDate && ` · ${project.startDate} – ${project.endDate || "Now"}`}
          </p>
          <p
            className="mt-4 text-[12.5px] leading-[1.65]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {project.description}
          </p>
        </header>

        {(project.link || project.github) && (
          <div className="flex flex-wrap gap-2">
            {project.link && <ActionLink href={project.link}>Visit project</ActionLink>}
            {project.github && <ActionLink href={project.github}>GitHub</ActionLink>}
          </div>
        )}

        <MetaSection title="Tech stack" items={project.tags} />
        {tasks.length > 0 && <MetaSection title="Tasks" items={tasks} />}

        {detail?.references && detail.references.length > 0 && (
          <section>
            <SectionLabel>References</SectionLabel>
            <div className="mt-2 flex flex-col border" style={{ borderColor: "var(--color-border)" }}>
              {detail.references.map((reference, index) => (
                <a
                  key={reference.href}
                  href={reference.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between gap-3 px-3 py-2 text-[12px] transition-colors hover:bg-[var(--color-surface-hover)] ${
                    index !== detail.references!.length - 1 ? "border-b" : ""
                  }`}
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-link)",
                  }}
                >
                  <span>{reference.label}</span>
                  <ExternalArrow />
                </a>
              ))}
            </div>
          </section>
        )}

        {detail?.diagram && (
          <section>
            <SectionLabel>Diagram</SectionLabel>
            <div
              className="mt-2 border p-3"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface-alt)",
              }}
            >
              <h2 className="text-[12px] font-semibold" style={{ color: "var(--color-text)" }}>
                {detail.diagram.title}
              </h2>
              <div className="mt-3 flex flex-col items-stretch gap-1.5">
                {detail.diagram.nodes.map((node, index) => (
                  <div key={node} className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-full border px-3 py-2 text-center text-[10.5px] font-medium"
                      style={{
                        borderColor: "var(--color-border-strong)",
                        background: "var(--color-surface-solid)",
                        color: "var(--color-text)",
                      }}
                    >
                      {node}
                    </div>
                    {index !== detail.diagram!.nodes.length - 1 && (
                      <span className="text-[13px] leading-none" style={{ color: "var(--color-accent)" }}>
                        ↓
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col gap-4 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
          {detail?.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[14px] font-semibold" style={{ color: "var(--color-text)" }}>
                {section.title}
              </h2>
              <p
                className="mt-1.5 text-[12px] leading-[1.65]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </div>

      <section className="custom-scrollbar min-h-0 overflow-y-auto lg:border-l lg:pl-4" style={{ borderColor: "var(--color-border)" }}>
        <div
          className="sticky top-0 z-10 mb-3 flex items-center justify-between border-b py-2"
          style={{
            background: "var(--color-surface-solid)",
            borderColor: "var(--color-border)",
          }}
        >
          <SectionLabel>Visuals</SectionLabel>
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            {visuals.length} {visuals.length === 1 ? "item" : "items"} · scroll ↓
          </span>
        </div>

        {visuals.length > 0 ? (
          <div className="flex flex-col gap-5 pb-2">
            {visuals.map((visual, index) => (
              <VisualCard key={`${visual.src}-${index}`} visual={visual} index={index} />
            ))}
          </div>
        ) : (
          <div
            className="flex min-h-64 items-center justify-center border p-8 text-center"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface-alt)",
            }}
          >
            <div>
              <p className="text-[13px] font-medium" style={{ color: "var(--color-text)" }}>
                Tutorial coming soon
              </p>
              <p className="mt-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
                Add screenshots or a WebM/MP4 walkthrough to this project’s visual list.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function VisualCard({ visual, index }: { visual: ProjectVisual; index: number }) {
  const label = visual.type === "video" ? "Tutorial" : "Screen";

  return (
    <figure className="border" style={{ borderColor: "var(--color-border)" }}>
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface-alt)",
        }}
      >
        <span
          className="text-[9.5px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {String(index + 1).padStart(2, "0")} · {label}
        </span>
        {visual.type === "video" && (
          <span className="text-[9.5px] font-semibold" style={{ color: "var(--color-accent)" }}>
            PLAY WALKTHROUGH
          </span>
        )}
      </div>
      <div
        className="flex min-h-48 items-center justify-center overflow-hidden"
        style={{ background: "var(--color-surface-alt)" }}
      >
        {visual.type === "video" ? (
          <video
            src={visual.src}
            controls
            playsInline
            preload="metadata"
            className="max-h-[540px] w-full bg-black object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={visual.src}
            alt={visual.caption || `Project visual ${index + 1}`}
            loading="lazy"
            className="max-h-[540px] w-full object-contain"
          />
        )}
      </div>
      {visual.caption && (
        <figcaption
          className="border-t px-3 py-2 text-[10.5px] leading-[1.45]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          {visual.caption}
        </figcaption>
      )}
    </figure>
  );
}

function MetaSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="border px-2 py-1 text-[10.5px]"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-tag-bg)",
              color: "var(--color-text)",
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[10px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: "var(--color-text-muted)" }}
    >
      {children}
    </h2>
  );
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 border px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-[var(--color-surface-hover)]"
      style={{ borderColor: "var(--color-border-strong)", color: "var(--color-text)" }}
    >
      {children}
      <ExternalArrow />
    </a>
  );
}

function ExternalArrow() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M3 9L9 3M9 3H4M9 3V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
