# Content Checklist

Everything you need to provide to complete your portfolio. Replace the placeholders in the corresponding files.

## About (`content/about.ts`)

- [ ] Your full name
- [ ] Professional title (e.g., "Full-Stack Developer & Creator")
- [ ] Location
- [ ] Bio text (2-3 paragraphs about who you are)
- [ ] "Currently working on..." text
- [ ] Skills/technologies list
- [ ] Social links (GitHub, LinkedIn, Twitter/X, email)
- [ ] Profile photo (place in `public/` and update `AboutApp.tsx`)

## Projects (`content/projects.ts`)

For each project you want to showcase:

- [ ] Project title
- [ ] Description (2-3 sentences)
- [ ] Your role (e.g., "Solo Developer", "Lead Engineer")
- [ ] Year / date range
- [ ] Tech tags (e.g., ["React", "TypeScript", "Supabase"])
- [ ] Live URL (optional)
- [ ] GitHub URL (optional)
- [ ] Screenshot/thumbnail image (place in `public/projects/`)

## Experience (`content/experience.ts`)

For each role:

- [ ] Company name
- [ ] Job title
- [ ] Start date — end date
- [ ] Description of responsibilities and impact
- [ ] Technologies used

## Blog Posts (`content/blog-posts.ts`)

For each blog post:

- [ ] Title
- [ ] Date
- [ ] Description/summary
- [ ] Tags
- [ ] Reading time estimate
- [ ] Full content (if you want to host blog posts on this site)

## Contact (`components/apps/ContactApp.tsx`)

- [ ] Contact form endpoint (e.g., Formspree, Resend, or custom API route)
- [ ] Email address for fallback display

## Photos (`public/photos/`)

- [ ] Gallery photos organized by folder (e.g., `berlin/`, `portugal/`, or your own locations)
- [ ] Update `components/explorer/file-tree-data.ts` with your actual folder/photo names

## Visual Assets

- [ ] Favicon (`public/favicon.ico`)
- [ ] Open Graph image, 1200x630px (`public/og-image.png`)
- [ ] Desktop wallpaper images (`public/wallpapers/`) — at least one dark and one light variant
- [ ] CV/Resume PDF (`public/cv.pdf`) — optional

## Metadata (`app/layout.tsx`)

- [ ] Page title
- [ ] Meta description
- [ ] OpenGraph title and description
- [ ] Canonical domain URL

## Deployment

- [ ] Custom domain
- [ ] Vercel project setup
- [ ] Analytics (Umami site ID + script URL) — optional
