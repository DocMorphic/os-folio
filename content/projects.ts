import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "scaile-venture-factory",
    title: "SCAILE Venture Factory",
    description:
      "Prompt-to-website system that generates SEO/GEO-optimized lead generation sites from a single idea. Owns architecture and MVP end-to-end: generation pipeline, premium page templates, scroll animations, SEO infra, publishing, and lead capture.",
    tags: ["Next.js 16", "React 19", "TypeScript", "Gemini 2.5", "Supabase", "Vercel"],
    role: "Frontend lead · Architecture owner",
    category: "SCAILE",
    year: "2025",
    startDate: "{{TODO: Sept 2025 or actual start}}",
    endDate: "Now",
    link: "{{TODO: live URL or remove line}}",
    github: "{{TODO: github.com/clients-scaile/venture-factory or private}}",
  },
  {
    id: "nextsure",
    title: "nextsure",
    description:
      "First production client on the SCAILE venture factory. An insurance lead-gen venture with partner checkout flows, dynamic CTA strategies, and featured conversions carousel. Extended the venture factory with conversion components.",
    tags: ["Next.js", "TypeScript", "Tailwind", "Supabase"],
    role: "Frontend lead",
    category: "SCAILE",
    year: "2026",
    startDate: "Jan 2026",
    endDate: "Now",
    link: "{{TODO: live URL}}",
  },
  {
    id: "formmed",
    title: "FormMed",
    description:
      "Multi-tenant AI content platform for German health content, built on the SCAILE platform. Handles inline comments, AI-powered content generation, reference tracking, and medical content workflow. Shipped under client feedback pressure.",
    tags: ["Next.js", "TypeScript", "FastAPI", "AI"],
    role: "Frontend engineer",
    category: "SCAILE",
    year: "2025",
    startDate: "{{TODO: 2025 start date}}",
    endDate: "Now",
  },
  {
    id: "threejs-portfolio",
    title: "Three.js Portfolio",
    description:
      "Personal creative-coding portfolio built with Vite + React Three Fiber + @react-three/drei. Scroll-driven 3D interactions. A learning project for going deep on Three.js from scratch.",
    tags: ["Vite", "React", "Three.js", "R3F", "TypeScript"],
    role: "Solo",
    category: "Personal",
    year: "2026",
    startDate: "{{TODO: start date}}",
    endDate: "Now",
    github: "{{TODO: github URL}}",
  },
  {
    id: "os-folio",
    title: "OS Portfolio",
    description:
      "This site. A desktop-OS-style portfolio inspired by Wes Dieleman, rebuilt with Next.js 16, React 19, and Tailwind 4. Draggable windows, taskbar dock, terminal app, and a full theming system with brightness and wallpaper controls.",
    tags: ["Next.js 16", "React 19", "TypeScript", "Tailwind 4"],
    role: "Solo",
    category: "Personal",
    year: "2026",
    startDate: "Apr 2026",
    endDate: "Now",
    github: "{{TODO: github URL}}",
  },
];
