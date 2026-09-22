# Setup & customization

[← Overview](../README.md) · [Architecture](ARCHITECTURE.md)

## Local desktop

Install Node.js 20.9+ and run `npm ci`, then `npm run dev`. The desktop, project content, photographs, and themes do not need a database.

Create an ignored `.env.local` only for integrations you intend to use:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

| Setting | Purpose |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Origin used for site metadata; set to the deployed origin in production. |
| `RESEND_API_KEY` | Server-side email delivery for contact messages and blog notifications. |
| Supabase URL and anon key | REST access to visit statistics and submitted blog links. |

Keep the Resend key server-only. The Supabase anon key is a public client credential; table policies determine its access.

## Contact delivery

The recipient and sender are defined in [`lib/email.ts`](../lib/email.ts). Update both for your own installation and configure the sender in your Resend account. With no key, the contact endpoint reports that delivery is unavailable. Merely rendering the form does not prove email delivery works.

## Optional persistence

The committed project does not include a complete database migration. These are the contracts implemented by the adapters:

| Object | Required behavior |
| :--- | :--- |
| `portfolio_visits` | Stores visit rows used by [`lib/stats-store.ts`](../lib/stats-store.ts); inspect `trackVisit` for the insert shape. |
| `count_distinct_sessions(since)` | Supabase RPC returning a count of distinct non-null `session_id` values, optionally filtered by creation time. |
| `portfolio_blogs` | `id` UUID, `url`, `title`, and `created_at`; table example is in [`lib/blogs-store.ts`](../lib/blogs-store.ts). |

Configure policies for the adapter's read/insert operations on your own database. Without a configured backend, statistics show empty values and submitted links are not persisted. The public client credential is not an administrative key.

## Customize content

1. Edit the typed entries in [`content/`](../content/).
2. Add your own photographs and CV under [`public/`](../public/), then update the corresponding references.
3. Keep project URLs consistent in both `projects.ts` and `project-details.ts`.
4. Use [`lib/constants.ts`](../lib/constants.ts) for app registration and default window geometry.
5. Use [`components/desktop/DesktopIcons.tsx`](../components/desktop/DesktopIcons.tsx) for desktop shortcuts.

## Deploy

Import the repository into Vercel as a Next.js project. The production commands are `npm run build` and `npm start`; Vercel manages the production server. Add optional environment values in the project settings and redeploy after changing browser-prefixed values.

After publishing, check the desktop and any configured contact, statistics, or submission features individually. A successful page load only verifies the web interface.
