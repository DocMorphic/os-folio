"use client";

import { useEffect, useState } from "react";
import type { StatsResult } from "@/lib/stats-store";

const EMPTY_STATS: StatsResult = {
  allTime: { visitors: 0, pageViews: 0 },
  metrics: [
    { label: "Unique visitors", today: 0, d7: 0, d30: 0 },
    { label: "Page views", today: 0, d7: 0, d30: 0 },
  ],
  connected: false,
};

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function SiteStatsApp() {
  const [stats, setStats] = useState<StatsResult>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: StatsResult = await res.json();
        if (!cancelled) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "failed to load stats");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1 className="font-serif-heading text-[30px] leading-none" style={{ color: "var(--color-text)" }}>
          Site Stats
        </h1>
        <div className="mt-4 h-px" style={{ background: "var(--color-border)" }} />
      </div>

      {/* Connection state */}
      {!loading && !stats.connected && !error && (
        <div
          className="border px-4 py-3 text-[12px]"
          style={{
            background: "var(--color-info-box)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          No analytics backend connected. Drop your Supabase credentials in{" "}
          <code
            style={{
              background: "var(--color-tag-bg)",
              padding: "1px 4px",
              fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            }}
          >
            .env.local
          </code>{" "}
          to start tracking. See <code>CONTENT_MAP.md</code> for setup.
        </div>
      )}

      {error && (
        <div
          className="border px-4 py-3 text-[12px]"
          style={{
            background: "var(--color-info-box)",
            borderColor: "var(--color-error)",
            color: "var(--color-error)",
          }}
        >
          Failed to load stats: {error}
        </div>
      )}

      {/* OVERVIEW label */}
      <div>
        <div
          className="mb-3 text-[10.5px] font-semibold tracking-wider"
          style={{ color: "var(--color-text-muted)" }}
        >
          OVERVIEW
        </div>

        {/* Two big stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="VISITORS ALL TIME" value={loading ? "…" : fmt(stats.allTime.visitors)} />
          <StatCard label="PAGE VIEWS ALL TIME" value={loading ? "…" : fmt(stats.allTime.pageViews)} />
        </div>
      </div>

      {/* Metrics table */}
      <div className="border" style={{ borderColor: "var(--color-border)" }}>
        {/* Header */}
        <div
          className="grid grid-cols-[1fr_80px_80px_80px] gap-3 border-b px-4 py-2.5 text-[10px] font-semibold tracking-wider"
          style={{
            background: "var(--color-surface-alt)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          <span>METRIC</span>
          <span className="text-right">TODAY</span>
          <span className="text-right">7D</span>
          <span className="text-right">30D</span>
        </div>

        {/* Rows */}
        {stats.metrics.map((row, i) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_80px_80px_80px] gap-3 px-4 py-3 text-[12.5px]"
            style={{
              borderBottom: i < stats.metrics.length - 1 ? "1px solid var(--color-border)" : "none",
              color: "var(--color-text)",
            }}
          >
            <span>{row.label}</span>
            <span className="text-right font-mono" style={{ color: "var(--color-text-muted)" }}>
              {loading ? "…" : fmt(row.today)}
            </span>
            <span className="text-right font-mono" style={{ color: "var(--color-text-muted)" }}>
              {loading ? "…" : fmt(row.d7)}
            </span>
            <span className="text-right font-mono" style={{ color: "var(--color-text-muted)" }}>
              {loading ? "…" : fmt(row.d30)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="border p-4"
      style={{
        background: "var(--color-surface-solid)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="mb-2 text-[10px] font-semibold tracking-wider"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </div>
      <div className="font-serif-heading text-[32px] leading-none" style={{ color: "var(--color-text)" }}>
        {value}
      </div>
    </div>
  );
}
