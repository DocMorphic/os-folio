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

      {/* TIMELINE card */}
      <div className="border" style={{ borderColor: "var(--color-border-hover)" }}>
        <div
          className="border-b px-4 py-2.5"
          style={{
            background: "var(--color-surface-alt)",
            borderColor: "var(--color-border-hover)",
          }}
        >
          <span className="text-[10.5px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            TIMELINE (FROM 2024)
          </span>
        </div>

        <div className="px-4 pt-3 pb-2">
          {/* Year headers */}
          <div
            className="mb-0 flex border-b pb-2"
            style={{ borderColor: "var(--color-border-hover)" }}
          >
            <div className="w-[140px] shrink-0">
              <span className="text-[10px] font-semibold tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                PROJECTS
              </span>
            </div>
            <div className="relative flex-1">
              {["2024", "2025", "2026"].map((year, i) => (
                <span
                  key={year}
                  className="absolute text-[10.5px]"
                  style={{
                    color: "var(--color-text-muted)",
                    left: `${(i / 3) * 100}%`,
                  }}
                >
                  {year}
                </span>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="relative">
            {/* Today marker — runs full height of all rows */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px"
              style={{
                left: `calc(140px + ${todayPct}% * (100% - 140px) / 100%)`,
                background: "var(--color-accent)",
                opacity: 0.8,
                zIndex: 2,
              }}
            />
            {/* Today label — small pill near top of marker */}
            <div
              className="pointer-events-none absolute"
              style={{
                left: `calc(140px + ${todayPct}% * (100% - 140px) / 100%)`,
                top: "4px",
                transform: "translateX(-50%)",
                background: "var(--color-tag-bg)",
                color: "var(--color-accent)",
                fontSize: "9.5px",
                padding: "1px 6px",
                border: "1px solid var(--color-accent)",
                zIndex: 3,
                fontWeight: 500,
              }}
            >
              Today
            </div>

            {projects.map((p, i) => {
              const start = toMonthIndex(p.startDate || "Jan 2024");
              const end = toMonthIndex(p.endDate || "Now");
              const leftPct = (Math.min(start, end) / TOTAL_MONTHS) * 100;
              const widthPct = Math.max(1.5, (Math.abs(end - start) / TOTAL_MONTHS) * 100);

              return (
                <div
                  key={p.id}
                  className={`flex items-center py-2.5 ${
                    i !== projects.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: "var(--color-border-hover)" }}
                >
                  <div className="w-[140px] shrink-0 pr-3">
                    <span className="truncate text-[11px]" style={{ color: "var(--color-text)" }}>
                      {p.title}
                    </span>
                  </div>
                  <div className="relative h-[18px] flex-1">
                    <div
                      className="absolute top-0 h-[18px]"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        background: "var(--color-button-dark)",
                        opacity: 0.55,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
