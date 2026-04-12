// User-submitted blog links store — Supabase-backed via PostgREST.
// Follows the same direct-fetch pattern as lib/stats-store.ts, no SDK.
//
// Table (run in Supabase SQL editor):
//   create table portfolio_blogs (
//     id uuid primary key default gen_random_uuid(),
//     url text not null,
//     title text not null,
//     created_at timestamptz default now()
//   );
//   alter table portfolio_blogs enable row level security;
//   create policy "anyone can read" on portfolio_blogs for select using (true);
//   create policy "anyone can insert" on portfolio_blogs for insert with check (true);

export interface BlogEntry {
  id: string;
  url: string;
  title: string;
  createdAt: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TABLE = "portfolio_blogs";

function isConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function authHeaders(): HeadersInit {
  return {
    apikey: SUPABASE_ANON_KEY!,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

interface BlogRow {
  id: string;
  url: string;
  title: string;
  created_at: string;
}

function rowToEntry(row: BlogRow): BlogEntry {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    createdAt: row.created_at,
  };
}

export async function listBlogs(): Promise<BlogEntry[]> {
  if (!isConfigured()) return [];
  try {
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}?select=id,url,title,created_at&order=created_at.desc&limit=200`;
    const res = await fetch(url, {
      method: "GET",
      headers: authHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as BlogRow[];
    return rows.map(rowToEntry);
  } catch {
    return [];
  }
}

export async function addBlog(url: string, title: string): Promise<BlogEntry | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({ url, title }),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as BlogRow[];
    const row = rows[0];
    if (!row) return null;
    return rowToEntry(row);
  } catch {
    return null;
  }
}
