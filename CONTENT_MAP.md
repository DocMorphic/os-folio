# Content map

[← Overview](README.md) · [Setup & integrations](docs/SETUP.md)

Use this guide to update the portfolio without tracing the entire desktop implementation.

| Content | Edit here |
| :--- | :--- |
| Name, biography, interests, social links | [`content/about.ts`](content/about.ts) |
| Project summaries and outbound URLs | [`content/projects.ts`](content/projects.ts) |
| Project stories, images, and detailed links | [`content/project-details.ts`](content/project-details.ts) |
| Roles and work history | [`content/experience.ts`](content/experience.ts) |
| Reading links | [`content/blog-posts.ts`](content/blog-posts.ts) |
| Desktop notes | [`content/text-files.ts`](content/text-files.ts) |
| Photo folders and file references | [`content/folder-files.ts`](content/folder-files.ts) |
| Help text | [`content/help.ts`](content/help.ts) |
| Photos, downloadable CV, and public files | [`public/`](public/) |

Keep project links consistent across summaries and detail pages. Photo files must exist at the public paths referenced by the folder entries.

## Desktop presentation

- [`lib/constants.ts`](lib/constants.ts): app registration, titles, dimensions, initial positions, and theme defaults.
- [`components/desktop/DesktopIcons.tsx`](components/desktop/DesktopIcons.tsx): desktop shortcuts.
- [`components/desktop/MenuBar.tsx`](components/desktop/MenuBar.tsx): menu presentation and branding.
- [`lib/wallpapers.ts`](lib/wallpapers.ts): wallpaper definitions.
- [`app/layout.tsx`](app/layout.tsx): page metadata.

## Integrations

See [the setup guide](docs/SETUP.md) for Resend and Supabase. Credentials belong in local or hosting environment settings, never in this file. Integration status depends on the deployment's configuration; documentation does not certify that a service is connected.
