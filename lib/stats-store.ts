// Site Stats store — Supabase-backed analytics via REST API (PostgREST)
// No SDK dependency. Uses fetch() directly.
//
// If env vars aren't set, all functions return empty data gracefully —
// the UI still renders, it just shows zeros.
//
// To swap for a different backend (Upstash, Vercel KV, custom):
// 1. Replace the body of getStats() and trackVisit() below
// 2. Keep the same exported types — the API routes and UI don't change

export interface MetricRow {
  label: string;
  today: number;
  d7: number;
  d30: number;
}

export interface StatsResult {
  allTime: {
    visitors: number;
    pageViews: number;
  };
  metrics: MetricRow[];
  /** true if a real backend is connected, false if returning empty placeholder data */
  connected: boolean;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TABLE = "portfolio_visits";

function isConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function authHeaders(): HeadersInit {
  return {
    "apikey": SUPABASE_ANON_KEY!,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function emptyStats(): StatsResult {
  return {
    allTime: { visitors: 0, pageViews: 0 },
    metrics: [
      { label: "Unique visitors", today: 0, d7: 0, d30: 0 },
      { label: "Page views", today: 0, d7: 0, d30: 0 },
    ],
    connected: false,
  };
}

// === Helpers ===

/**
 * Count rows in the table with an optional timestamp filter.
 * Supabase PostgREST supports count via Prefer: count=exact + HEAD request.
 */
async function countRows(filter?: string): Promise<number> {
  if (!isConfigured()) return 0;

  let url = `${SUPABASE_URL}/rest/v1/${TABLE}?select=id`;
  if (filter) {
    url += `&${filter}`;
  }

  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        ...authHeaders(),
        "Prefer": "count=exact",
        "Range-Unit": "items",
        "Range": "0-0",
      },
      cache: "no-store",
    });
    if (!res.ok) return 0;
    // Content-Range header format: "items 0-0/<total>"
    const contentRange = res.headers.get("content-range");
    if (!contentRange) return 0;
    const total = contentRange.split("/")[1];
    return parseInt(total, 10) || 0;
  } catch {
    return 0;
  }
}

/**
 * Count distinct session_ids since a given timestamp (or all-time if omitted).
 *
 * Calls the `count_distinct_sessions(since timestamptz)` Postgres function
 * via PostgREST's RPC endpoint. Server-side COUNT(DISTINCT) — exact, cheap,
 * no row-limit cliff.
 *
 * If the function doesn't exist in Supabase yet (404), returns 0 and the
 * Site Stats UI will show zeros for unique visitors until you paste the
 * SQL from CONTENT_MAP.md into the SQL editor.
 */
async function countDistinctSessions(sinceIso?: string): Promise<number> {
  if (!isConfigured()) return 0;

  const url = `${SUPABASE_URL}/rest/v1/rpc/count_distinct_sessions`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ since: sinceIso ?? null }),
      cache: "no-store",
    });
    if (!res.ok) return 0;
    const result = await res.json();
    // RPC returns a bare number (bigint serializes as JSON number for
    // values that fit in a JS number, which portfolio-scale is fine)
    if (typeof result === "number") return result;
    if (typeof result === "string") return parseInt(result, 10) || 0;
    return 0;
  } catch {
    return 0;
  }
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function isoStartOfToday(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

// === Public API ===

export async function getStats(): Promise<StatsResult> {
  if (!isConfigured()) return emptyStats();

  try {
    const todayIso = isoStartOfToday();
    const d7Iso = isoDaysAgo(7);
    const d30Iso = isoDaysAgo(30);

    // Page views (total row counts)
    const [pvAll, pvToday, pv7, pv30] = await Promise.all([
      countRows(""),
      countRows(`created_at=gte.${todayIso}`),
      countRows(`created_at=gte.${d7Iso}`),
      countRows(`created_at=gte.${d30Iso}`),
    ]);

    // Unique visitors (distinct session_id) — RPC handles the time filter
    const [uvAll, uvToday, uv7, uv30] = await Promise.all([
      countDistinctSessions(),
      countDistinctSessions(todayIso),
      countDistinctSessions(d7Iso),
      countDistinctSessions(d30Iso),
    ]);

    return {
      allTime: {
        visitors: uvAll,
        pageViews: pvAll,
      },
      metrics: [
        { label: "Unique visitors", today: uvToday, d7: uv7, d30: uv30 },
        { label: "Page views", today: pvToday, d7: pv7, d30: pv30 },
      ],
      connected: true,
    };
  } catch {
    return emptyStats();
  }
}

export async function trackVisit(sessionId: string, path: string): Promise<boolean> {
  if (!isConfigured()) return false;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        event_type: "page_view",
        session_id: sessionId,
        path: path,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
