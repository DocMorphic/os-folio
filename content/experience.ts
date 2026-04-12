import type { ExperienceEntry } from "@/lib/types";

export const currentFocus: string[] = [
  "Expanding the SCAILE venture factory with blog CMS, conversion flows, and agent framework integration.",
  "Shipping nextsure — our first venture factory client — with partner checkout flows.",
  "Exploring creative-coding portfolios with Three.js and React Three Fiber.",
];

export const experience: ExperienceEntry[] = [
  {
    id: "scaile-venture-factory",
    company: "SCAILE",
    role: "Frontend Architect · Venture Factory Owner",
    employmentType: "Full-time",
    location: "{{TODO: city, country}}",
    locationType: "{{TODO: Remote / Hybrid / On-site}}",
    startDate: "{{TODO: Sept 2025 or actual start}}",
    endDate: "Present",
    duration: "{{TODO: auto-compute or leave blank}}",
    description:
      "Owns architecture and MVP of the SCAILE venture factory — a prompt-to-website system generating SEO/GEO-optimized lead gen sites. Shipped generation pipeline, premium design system, SEO infra, publishing flow, and multi-tenant foundations.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind", "Supabase", "Vercel"],
  },
  {
    id: "scaile-platform",
    company: "SCAILE",
    role: "Frontend Engineer · SCAILE Platform",
    employmentType: "Full-time",
    startDate: "{{TODO: start date}}",
    endDate: "Present",
    description:
      "Contributes to the SCAILE platform (Next.js 16 + FastAPI monorepo) — blog engine, social listening, shadcn/ui components, multi-tenant config system. Worked on the FormMed tenant, an AI content platform for German health writing.",
    tags: ["Next.js", "FastAPI", "Multi-tenant", "AI", "shadcn/ui"],
  },
  {
    id: "prior",
    company: "{{TODO: previous company}}",
    role: "{{TODO: previous role}}",
    employmentType: "{{TODO: full-time / internship / freelance}}",
    startDate: "{{TODO: start date}}",
    endDate: "{{TODO: end date}}",
    description: "{{TODO: describe this role — or remove this entry entirely from content/experience.ts if you don't want it}}",
    tags: [],
  },
];
