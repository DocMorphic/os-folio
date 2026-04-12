# Content Map — Where to Edit What

This doc lists every personalized field in the portfolio. Each row points to the exact file and line number where you can edit the text directly.

I've pre-filled everything I know from our previous conversations (SCAILE, venture factory, FormMed, Three.js portfolio, etc). The fields marked `{{TODO: ...}}` are the ones I couldn't know for certain — edit those directly in the files below.

> **Tip:** After editing, the dev server hot-reloads automatically. No rebuild needed.

---

## About Window — `content/about.ts`

| Field | Line | Current value | Notes |
|---|---|---|---|
| First name | 2 | `"Dharmay"` | — |
| Last name | 3 | `"Dave"` | — |
| Title | 4 | `"Frontend Engineer & Venture Builder"` | Edit if you want a different tagline |
| **Location** | **5** | `"{{TODO: your city}}"` | Your city, e.g. `"Berlin, Germany"` |
| Intro paragraph 1 | 7 | SCAILE venture factory intro | Edit freely |
| Intro paragraph 2 | 8 | Three.js / GitHub mention | Edit freely |
| Current focus 1 | 11 | Venture factory expansion | Edit freely |
| Current focus 2 | 12 | nextsure | Edit freely |
| Current focus 3 | 13 | Three.js portfolio | Edit freely |
| **GitHub URL** | **16** | `"{{TODO: github URL}}"` | e.g. `"https://github.com/dharmaydave"` |
| **LinkedIn URL** | **17** | `"{{TODO: linkedin URL}}"` | Full URL |
| **Twitter/X URL** | **18** | `"{{TODO: twitter/x URL}}"` | Full URL — or delete the line if you don't want it |
| **Email** | **19** | `"{{TODO: email address}}"` | e.g. `"dharmay@example.com"` |

---

## Projects / Works Window — `content/projects.ts`

### Project 1: SCAILE Venture Factory (lines 4–18)

| Field | Line | Current value |
|---|---|---|
| Title | 6 | `"SCAILE Venture Factory"` |
| Description | 7–8 | Pre-filled — edit if wanted |
| Role | 11 | `"Frontend lead · Architecture owner"` |
| **Start date** | **13** | `"{{TODO: Sept 2025 or actual start}}"` |
| **Live URL** | **15** | `"{{TODO: live URL or remove line}}"` |
| **GitHub URL** | **16** | `"{{TODO: github.com/clients-scaile/venture-factory or private}}"` — or delete if private |

### Project 2: nextsure (lines 19–30)

| Field | Line | Current value |
|---|---|---|
| Title | 21 | `"nextsure"` |
| Description | 22–23 | Pre-filled |
| Start date | 27 | `"Jan 2026"` |
| **Live URL** | **29** | `"{{TODO: live URL}}"` — or delete line |

### Project 3: FormMed (lines 31–43)

| Field | Line | Current value |
|---|---|---|
| Title | 33 | `"FormMed"` |
| Description | 34–35 | Pre-filled |
| **Start date** | **40** | `"{{TODO: 2025 start date}}"` |

### Project 4: Three.js Portfolio (lines 44–55)

| Field | Line | Current value |
|---|---|---|
| Title | 46 | `"Three.js Portfolio"` |
| Description | 47–48 | Pre-filled |
| **Start date** | **52** | `"{{TODO: start date}}"` |
| **GitHub URL** | **54** | `"{{TODO: github URL}}"` |

### Project 5: OS Portfolio (this site) (lines 56–68)

| Field | Line | Current value |
|---|---|---|
| Title | 58 | `"OS Portfolio"` |
| Description | 59–60 | Pre-filled |
| **GitHub URL** | **67** | `"{{TODO: github URL}}"` |

---

## Experience Window — `content/experience.ts`

### Current Focus (lines 3–7)

Three bullet points shown at the top of the Experience window. Edit freely.

### Experience Entry 1: SCAILE Venture Factory Owner (lines 10–24)

| Field | Line | Current value |
|---|---|---|
| Company | 12 | `"SCAILE"` |
| Role | 13 | `"Frontend Architect · Venture Factory Owner"` |
| Employment type | 14 | `"Full-time"` |
| **Location** | **15** | `"{{TODO: city, country}}"` |
| **Location type** | **16** | `"{{TODO: Remote / Hybrid / On-site}}"` |
| **Start date** | **17** | `"{{TODO: Sept 2025 or actual start}}"` |
| **Duration** | **19** | `"{{TODO: auto-compute or leave blank}}"` — e.g. `"7 mos"` |
| Description | 20–21 | Pre-filled |

### Experience Entry 2: SCAILE Platform (lines 25–34)

| Field | Line | Current value |
|---|---|---|
| Company | 27 | `"SCAILE"` |
| Role | 28 | `"Frontend Engineer · SCAILE Platform"` |
| **Start date** | **29** | `"{{TODO: start date}}"` |
| Description | 32–33 | Pre-filled |

### Experience Entry 3: Prior role (lines 35–43)

**This entry is a template for any prior role/internship.** If you don't have one, just delete the whole entry (lines 35–43 including the trailing comma).

| Field | Line | Current value |
|---|---|---|
| **Company** | **37** | `"{{TODO: previous company}}"` |
| **Role** | **38** | `"{{TODO: previous role}}"` |
| **Employment type** | **39** | `"{{TODO: full-time / internship / freelance}}"` |
| **Start date** | **40** | `"{{TODO: start date}}"` |
| **End date** | **41** | `"{{TODO: end date}}"` |
| **Description** | **42** | Placeholder |

---

## Blog Window — `content/blog-posts.ts`

Four placeholder blog posts with real titles relevant to your work. You can fill in dates + reading times + delete ones you don't want to write.

### Post 1: "Building a Prompt-to-Website Venture Factory" (lines 4–12)

| Field | Line | Current value |
|---|---|---|
| **Date** | **7** | `"{{TODO: date}}"` — e.g. `"15 Mar 2026"` |
| **Reading time** | **8** | `"{{TODO: X min read}}"` |

### Post 2: "The Case for Desktop OS Portfolios" (lines 13–22)

| Field | Line | Current value |
|---|---|---|
| Date | 17 | `"Apr 2026"` — pre-filled |
| **Reading time** | **18** | `"{{TODO: X min read}}"` |

### Post 3: "Shipping a Multi-Tenant AI Content Platform" (lines 23–32)

| Field | Line | Current value |
|---|---|---|
| **Date** | **27** | `"{{TODO: date}}"` |
| **Reading time** | **28** | `"{{TODO: X min read}}"` |

### Post 4: "Learning Three.js as a Next.js Developer" (lines 33–42)

| Field | Line | Current value |
|---|---|---|
| **Date** | **37** | `"{{TODO: date}}"` |
| **Reading time** | **38** | `"{{TODO: X min read}}"` |

---

## Desktop Icons — `components/desktop/DesktopIcons.tsx`

These are Wes Dieleman's reference labels (berlin, portugal, provance-france). You can change them to your own photo folders, cities, or whatever.

| Icon | Line | Current label | appId |
|---|---|---|---|
| Folder 1 | 16 | `"berlin"` | `photos` |
| Folder 2 | 17 | `"portugal"` | `photos` |
| Folder 3 | 18 | `"provance-\nfrance"` | `photos` |
| Envelope | 19 | `"Contact"` | `contact` |
| File 1 | 20 | `"about.txt"` | `about` |
| File 2 | 21 | `"build-log.md"` | `blog` |

Change the `label` field to whatever you want. The `appId` controls which window it opens when clicked.

---

## Quick Start Checklist

Minimum fields to fill in for the site to feel fully yours:

- [ ] **`content/about.ts:5`** — your location
- [ ] **`content/about.ts:16–19`** — social links + email
- [ ] **`content/experience.ts:15–17`** — SCAILE location + start date
- [ ] **`content/experience.ts:35–43`** — either fill in a prior role OR delete the entry
- [ ] **`content/projects.ts:13`** — venture factory start date
- [ ] **`content/projects.ts:15–16`** — live URL + github (or delete)
- [ ] Take a headshot and save as `public/avatar.jpg` (optional — the About window currently shows a colored circle with a `?`)

Nice-to-have:

- [ ] Blog post dates + reading times
- [ ] Real project live URLs
- [ ] Rename the berlin/portugal/provance-france folders

---

## Site Stats Backend (Supabase)

The Site Stats window (click the logo in the menu bar) is wired to a real Supabase-backed API. If you don't set up Supabase, it gracefully shows `0` everywhere with a friendly "no backend connected" message. When you're ready to start tracking visits:

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free tier is fine)
2. Note the project URL and anon key from **Settings → API**

### Step 2 — Run the SQL schema

In your Supabase project's SQL Editor, run:

```sql
create table if not exists portfolio_visits (
  id bigint primary key generated always as identity,
  created_at timestamptz not null default now(),
  event_type text not null default 'page_view',
  session_id text,
  path text
);

create index if not exists idx_portfolio_visits_created_at
  on portfolio_visits (created_at desc);

-- Allow anyone to insert visits (public tracking endpoint)
alter table portfolio_visits enable row level security;

create policy "anyone can insert visits" on portfolio_visits
  for insert to anon, authenticated
  with check (true);

-- Allow anyone to read (stats are public on the portfolio)
create policy "anyone can read visits" on portfolio_visits
  for select to anon, authenticated
  using (true);
```

### Step 3 — Add env vars

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Restart the dev server (`npm run dev`). Every page load will now insert a `portfolio_visits` row, and the Site Stats window will show real numbers.

### How it works

| File | Purpose |
|---|---|
| `lib/stats-store.ts` | Abstracted stats backend — pure `fetch` to Supabase REST API, no SDK dependency |
| `app/api/stats/route.ts` | GET endpoint → returns aggregated stats as JSON |
| `app/api/stats/track/route.ts` | POST endpoint → logs a visit |
| `components/StatsTracker.tsx` | Client component in the layout; posts to `/api/stats/track` on mount (dedupes per browser session via `sessionStorage`) |
| `components/apps/SiteStatsApp.tsx` | UI; fetches `/api/stats` and renders the cards + table |

### Swap for a different backend

If you ever want to switch to Vercel KV, Upstash Redis, Plausible, Umami, or anything else:

1. Open `lib/stats-store.ts`
2. Replace the bodies of `getStats()` and `trackVisit()` with your new backend calls
3. Keep the `StatsResult` type shape the same — API routes and UI won't need to change

### Deployment note

When you deploy to Vercel, add the two env vars in **Project Settings → Environment Variables**. Since both start with `NEXT_PUBLIC_`, they're exposed to the client bundle — that's fine because the Supabase anon key is designed to be public (Row Level Security policies gate write access).

---

## Logo

The menu bar logo is currently a pixel-art signal-bars SVG. When you're ready to use your own logo, edit `components/desktop/MenuBar.tsx` — look for the `<svg>` inside the logo button (around line 64) and replace it with your own SVG or an `<img>` tag pointing to a file you drop in `public/`.
