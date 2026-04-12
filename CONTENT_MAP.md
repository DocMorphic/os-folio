# Content Map

All the content is filled in from your CV. This doc lists what's live, what's still placeholder, and where to edit each thing.

---

## About — `content/about.ts`

| Field | Line | Status |
|---|---|---|
| Name | 2–3 | ✅ Dharmay Dave |
| Title | 4 | ✅ CS Student & Full-Stack Developer |
| Location | 5 | ✅ Munich, Germany |
| Intro paragraphs | 6–9 | ✅ Filled from CV |
| Current focus | 10–14 | ✅ TUM / freelance / Lighthouse |
| GitHub | 16 | ✅ https://github.com/DocMorphic |
| LinkedIn | 17 | ✅ https://www.linkedin.com/in/dharmay-dave/ |
| Email | 18 | ✅ davedharmay@gmail.com |

---

## Experience — `content/experience.ts`

All four work entries are real (no SCAILE — that's work's work):

| # | Role | Company | Date | Status |
|---|---|---|---|---|
| 1 | Freelance Full-Stack Engineer | Independent | May 2025 – Present | ✅ |
| 2 | Software Engineering Intern | Sigment AI | Jul – Sep 2025 | ✅ |
| 3 | Computer Science Tutor (intern) | S. N. Kansagra School | Apr – Jul 2025 | ✅ |
| 4 | Private Tutor | S. N. Kansagra School | Sep – Dec 2024 | ✅ |

Plus an EDUCATION section in the same file:

| School | Program | Date |
|---|---|---|
| Technical University of Munich | Computer Science (Studienkolleg) | Oct 2025 – Present |
| S. N. Kansagra School | Class XII Science (Valedictorian, 97%) | Jun 2013 – Apr 2025 |

---

## Projects — `content/projects.ts`

All seven projects are real (the CV entries + this portfolio itself):

| # | Title | Year | Status |
|---|---|---|---|
| 1 | Lighthouse | 2026 | ✅ + GitHub link |
| 2 | Freelance-ez | 2025 | ✅ |
| 3 | Hashi | 2025 | ✅ + live link |
| 4 | Framed | 2025 | ✅ |
| 5 | Voice-Controlled Home IoT | 2024 | ✅ |
| 6 | AI Health Chatbot | 2024 | ✅ |
| 7 | OS Portfolio (this site) | 2026 | ✅ + GitHub link |

---

## Blog — `content/blog-posts.ts`

Four relevant post titles pulled from your actual project work:

| Title | Status |
|---|---|
| Building Lighthouse: A Navigation App with Open-Source Maps | Title ✅ · Date ✅ · **Reading time TODO** · Content TODO |
| Bridge Validation in Hashi: Graph Algorithms in the Browser | Title ✅ · Date ✅ · **Reading time TODO** · Content TODO |
| Window-Based Combat: Designing Framed in Godot | Title ✅ · Date ✅ · **Reading time TODO** · Content TODO |
| From Rajkot to Munich: A CS Student's First Year in Germany | Title ✅ · **Date TODO** · **Reading time TODO** · Content TODO |

All reading times are `{{TODO: X min read}}` — fill in when you write the posts. Dates too for the Rajkot→Munich post.

**Where to edit:** `content/blog-posts.ts` lines 7, 17, 27, 37 (dates) and 8, 18, 28, 38 (reading times).

---

## Text Files — `content/text-files.ts`

- `about.txt` content (lines 3–13) ✅
- `build-log.md` content (lines 15–22) ✅

These show up as editable monospace text windows when you double-click the desktop icons `about.txt` and `build-log.md`.

---

## Desktop Icons — `components/desktop/DesktopIcons.tsx`

The berlin / portugal / provance-france folder labels are placeholders. Change them in `DESKTOP_ITEMS` (lines 14–21) to your own photo folder names, or delete the entries entirely.

---

## Site Stats Backend (Supabase)

**Connected.** `.env.local` already has:
- `NEXT_PUBLIC_SUPABASE_URL=https://ibdxpytdyynkdcznjlan.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>`

Database table: `portfolio_visits` (created via SQL editor, RLS policies set).
Keep-alive: GitHub Action runs every 3 days (`.github/workflows/supabase-keepalive.yml`) to prevent Supabase from pausing the project.

**To swap backend later:** Edit the bodies of `getStats()` and `trackVisit()` in `lib/stats-store.ts`. API routes and UI won't need changes.

---

## Logo

Still the default signal-bars SVG. When you're ready for a custom logo, edit `components/desktop/MenuBar.tsx` lines 64–72 — replace the `<svg>` with your own.

---

## Quick Start Checklist

What's left:

- [ ] Blog post dates + reading times (4 entries in `content/blog-posts.ts`)
- [ ] Actual blog post content (if you want to host posts on this site)
- [ ] Custom logo to replace the signal-bars SVG
- [ ] Replace the berlin/portugal/provance-france desktop icons with your own (or delete)
- [ ] Take a headshot (optional) — the About window doesn't currently show a photo, just the serif heading

Nothing else is blocking you from shipping this. Everything else is real, from your CV.
