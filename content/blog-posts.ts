import type { BlogPost } from "@/lib/types";

export const blogPosts: BlogPost[] = [
  {
    id: "post-venture-factory",
    title: "Building a Prompt-to-Website Venture Factory",
    date: "{{TODO: date}}",
    readingTime: "{{TODO: X min read}}",
    description:
      "How I architected the SCAILE venture factory — a system that turns a single prompt into a production-ready, SEO/GEO-optimized lead gen site. Generation pipeline, page templates, publishing flow, and the hard lessons along the way.",
    tags: ["next-js", "venture-factory", "ai", "lead-gen"],
    slug: "building-venture-factory",
  },
  {
    id: "post-desktop-os",
    title: "The Case for Desktop OS Portfolios",
    date: "Apr 2026",
    readingTime: "{{TODO: X min read}}",
    description:
      "Why I rebuilt my portfolio as a fake desktop operating system. Draggable windows, a working terminal, file explorer, and brightness settings — what works, what doesn't, and why the metaphor is worth the complexity.",
    tags: ["portfolio", "next-js", "creative-coding"],
    slug: "desktop-os-portfolios",
  },
  {
    id: "post-multi-tenant-ai",
    title: "Shipping a Multi-Tenant AI Content Platform",
    date: "{{TODO: date}}",
    readingTime: "{{TODO: X min read}}",
    description:
      "Lessons from building FormMed — a multi-tenant AI content platform for German health content. Client profiles, style guides, visual identity, inline comments that persist, and why AI content is still a minefield for factual accuracy.",
    tags: ["ai", "multi-tenant", "content", "next-js"],
    slug: "multi-tenant-ai-content",
  },
  {
    id: "post-threejs",
    title: "Learning Three.js as a Next.js Developer",
    date: "{{TODO: date}}",
    readingTime: "{{TODO: X min read}}",
    description:
      "Coming from React + Next.js, what tripped me up when I first tried Three.js and React Three Fiber — coordinate systems, the render loop, and how to think about 3D scroll interactions without losing your mind.",
    tags: ["three-js", "r3f", "creative-coding"],
    slug: "learning-threejs",
  },
];
