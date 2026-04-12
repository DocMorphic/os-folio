"use client";

import { projects } from "@/content/projects";

// Map "Sept 2025" / "Nov 2024" / "Now" into a number of months since Jan 2024
const MONTH_NAMES: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sept: 8, sep: 8, oct: 9, nov: 10, dec: 11,
};
const START_YEAR = 2024;
const TOTAL_MONTHS = 36; // 3 years: 2024, 2025, 2026

function toMonthIndex(dateStr: string): number {
  if (dateStr.toLowerCase() === "now") {
    const now = new Date();
    return Math.max(0, (now.getFullYear() - START_YEAR) * 12 + now.getMonth());
  }
  const parts = dateStr.trim().split(/\s+/);
  const month = MONTH_NAMES[parts[0].toLowerCase().replace(".", "")] ?? 0;
  const year = parseInt(parts[1] || String(START_YEAR), 10);
  return (year - START_YEAR) * 12 + month;
}

export function WorksApp() {
  const todayIndex = toMonthIndex("Now");
  const todayPct = (todayIndex / TOTAL_MONTHS) * 100;

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1 className="font-serif-heading text-[30px] leading-none" style={{ color: "var(--color-text)" }}>
          Works
        </h1>
        <p className="mt-3 text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
          Explore selected projects with timelines, stack choices, and delivery outcomes. This view includes company and freelance examples in a horizontal timeline display.
        </p>
      </div>

      {/* PROJECT LIST card */}
      <div className="border" style={{ borderColor: "var(--color-border-hover)" }}>
        <div
          className="border-b px-4 py-2.5"
          style={{
            background: "var(--color-surface-alt)",
            borderColor: "var(--color-border-hover)",
          }}
        >
          <span className="text-[10.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            PROJECT LIST
          </span>
        </div>
        <div>
          {projects.map((p, i) => (
            <div
              key={p.id}
              className={`px-4 py-2 text-[12.5px] transition-colors hover:bg-[var(--color-surface-hover)] ${
                i !== projects.length - 1 ? "border-b" : ""
              }`}
              style={{ borderColor: "var(--color-border-hover)", color: "var(--color-text)" }}
            >
              <span className="font-semibold">{p.title}</span>
              <span style={{ color: "var(--color-text-muted)" }}>
                {" "}· {p.role} · {p.startDate} – {p.endDate} · {p.category}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TIMELINE card — fixed names column + horizontally scrolling grid */}
      <TimelineCard todayIndex={todayIndex} />
    </div>
  );
}

// Timeline visual constants
const MONTH_WIDTH = 56; // px per month in the scrollable strip
const NAMES_WIDTH = 140; // px — fixed left column for project titles
const HEADER_H = 36; // px — year header row
const ROW_H = 42; // px — each project row

function TimelineCard({ todayIndex }: { todayIndex: number }) {
  const totalWidth = TOTAL_MONTHS * MONTH_WIDTH;
  const todayX = todayIndex * MONTH_WIDTH;

  return (
    <div className="border" style={{ borderColor: "var(--color-border-hover)" }}>
      {/* Card header */}
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
          TIMELINE (FROM 2024)
        </span>
      </div>

      <div className="flex">
        {/* LEFT: fixed names column */}
        <div
          className="w-[140px] shrink-0 border-r"
          style={{ borderColor: "var(--color-border-hover)" }}
        >
          {/* Names header — matches year header height */}
          <div
            className="flex items-center border-b px-3"
            style={{
              height: HEADER_H,
              borderColor: "var(--color-border-hover)",
              background: "var(--color-surface-alt)",
            }}
          >
            <span
              className="text-[10px] font-semibold tracking-wider"
              style={{ color: "var(--color-text-muted)" }}
            >
              PROJECTS
            </span>
          </div>
          {projects.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center px-3 ${
                i !== projects.length - 1 ? "border-b" : ""
              }`}
              style={{
                height: ROW_H,
                borderColor: "var(--color-border-hover)",
              }}
            >
              <span className="truncate text-[11px]" style={{ color: "var(--color-text)" }}>
                {p.title}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT: horizontally scrolling timeline */}
        <div className="custom-scrollbar flex-1 overflow-x-auto">
          <div className="relative" style={{ width: totalWidth }}>
            {/* Year header row */}
            <div
              className="relative border-b"
              style={{
                height: HEADER_H,
                borderColor: "var(--color-border-hover)",
                background: "var(--color-surface-alt)",
              }}
            >
              {["2024", "2025", "2026"].map((year, i) => (
                <span
                  key={year}
                  className="absolute top-1/2 -translate-y-1/2 text-[10.5px] font-semibold tracking-wider"
                  style={{
                    color: "var(--color-text-muted)",
                    left: i * 12 * MONTH_WIDTH + 8,
                  }}
                >
                  {year}
                </span>
              ))}
            </div>

            {/* Rows (bars) — one row per project, stacked. The VERTICAL
                grid lines are drawn across all rows via absolute positioning
                below. */}
            <div className="relative">
              {/* Vertical grid — year boundaries (stronger) */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={`y-${i}`}
                  className="pointer-events-none absolute top-0 bottom-0 w-px"
                  style={{
                    left: i * 12 * MONTH_WIDTH,
                    background: "var(--color-border-hover)",
                  }}
                />
              ))}
              {/* Vertical grid — quarter boundaries (more subtle) */}
              {Array.from({ length: 12 })
                .map((_, i) => (i + 1) * 3)
                .filter((m) => m % 12 !== 0)
                .map((m) => (
                  <div
                    key={`q-${m}`}
                    className="pointer-events-none absolute top-0 bottom-0 w-px"
                    style={{
                      left: m * MONTH_WIDTH,
                      background: "var(--color-border)",
                      opacity: 0.6,
                    }}
                  />
                ))}

              {/* Today marker line */}
              <div
                className="pointer-events-none absolute top-0 bottom-0"
                style={{
                  left: todayX,
                  width: "2px",
                  background: "var(--color-accent)",
                  opacity: 0.85,
                  zIndex: 2,
                }}
              />
              {/* Today label pinned to top of the marker */}
              <div
                className="pointer-events-none absolute"
                style={{
                  left: todayX,
                  top: 2,
                  transform: "translateX(-50%)",
                  background: "var(--color-tag-bg)",
                  color: "var(--color-accent)",
                  fontSize: "9.5px",
                  padding: "1px 6px",
                  border: "1px solid var(--color-accent)",
                  zIndex: 3,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                Today
              </div>

              {projects.map((p, i) => {
                const start = toMonthIndex(p.startDate || "Jan 2024");
                const end = toMonthIndex(p.endDate || "Now");
                const barLeft = Math.min(start, end) * MONTH_WIDTH;
                const barWidth = Math.max(10, Math.abs(end - start) * MONTH_WIDTH);

                return (
                  <div
                    key={p.id}
                    className={`relative ${
                      i !== projects.length - 1 ? "border-b" : ""
                    }`}
                    style={{
                      height: ROW_H,
                      borderColor: "var(--color-border-hover)",
                    }}
                  >
                    <div
                      className="absolute"
                      style={{
                        left: barLeft,
                        top: (ROW_H - 20) / 2,
                        width: barWidth,
                        height: 20,
                        background: "var(--color-button-dark)",
                        opacity: 0.6,
                        zIndex: 1,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
