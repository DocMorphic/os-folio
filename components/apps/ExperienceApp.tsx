"use client";

import { experience, currentFocus, education } from "@/content/experience";
import type { ExperienceEntry } from "@/lib/types";

export function ExperienceApp() {
  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1 className="font-serif-heading text-[30px] leading-none" style={{ color: "var(--color-text)" }}>
          Experience
        </h1>
        <p className="mt-3 text-[12.5px]" style={{ color: "var(--color-text-secondary)" }}>
          A detailed timeline of my experience, education, and current focus.
        </p>
      </div>

      {/* CURRENT FOCUS card */}
      <Card label="CURRENT FOCUS">
        <ul className="flex flex-col gap-2 p-4">
          {currentFocus.map((item, i) => (
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
      </Card>

      {/* CAREER TIMELINE card */}
      <Card label="CAREER TIMELINE">
        <div className="p-4">
          {experience.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} isLast={i === experience.length - 1} />
          ))}
        </div>
      </Card>

      {/* EDUCATION card */}
      <Card label="EDUCATION">
        <div className="p-4">
          {education.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} isLast={i === education.length - 1} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border" style={{ borderColor: "var(--color-border)" }}>
      <div
        className="border-b px-4 py-2.5"
        style={{
          background: "var(--color-surface-alt)",
          borderColor: "var(--color-border)",
        }}
      >
        <span
          className="text-[10.5px] font-semibold tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function TimelineEntry({ entry, isLast }: { entry: ExperienceEntry; isLast: boolean }) {
  return (
    <div
      className={`flex gap-3 py-3 ${isLast ? "" : "border-b"}`}
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Orange dot */}
      <div className="mt-2 shrink-0">
        <div className="h-2 w-2" style={{ background: "var(--color-accent)" }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Role · Company · Employment · Current */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--color-text)" }}>
            {entry.role}
          </span>
          <span className="text-[12.5px]" style={{ color: "var(--color-text-muted)" }}>
            {entry.company}
          </span>
          {entry.employmentType && (
            <span className="text-[11.5px]" style={{ color: "var(--color-text-dim)" }}>
              · {entry.employmentType}
            </span>
          )}
          {entry.endDate === "Present" && (
            <span
              className="px-2 py-[1px] text-[10.5px] font-semibold"
              style={{
                background: "var(--color-info-box)",
                color: "var(--color-accent)",
                border: "1px solid var(--color-accent)",
              }}
            >
              Current
            </span>
          )}
        </div>

        {/* Row 2: Date range · duration */}
        <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>
          {entry.startDate} – {entry.endDate}
          {entry.duration && ` · ${entry.duration}`}
        </div>

        {/* Row 3: Location · location type */}
        {(entry.location || entry.locationType) && (
          <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--color-text-muted)" }}>
            {entry.location}
            {entry.location && entry.locationType && " · "}
            {entry.locationType}
          </div>
        )}

        {/* Description */}
        <p className="mt-1.5 text-[11.5px] leading-[1.5]" style={{ color: "var(--color-text-muted)" }}>
          {entry.description}
        </p>
      </div>
    </div>
  );
}
