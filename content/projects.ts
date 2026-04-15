import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    id: "lighthouse",
    title: "Lighthouse",
    description:
      "A mobile navigation app using open-source geospatial data. React Native + Expo for cross-platform, integrating OpenStreetMap to render interactive, scalable maps. A short focused build shipped in February 2026.",
    tags: ["React Native", "Expo", "OpenStreetMap", "TypeScript"],
    role: "Solo builder",
    category: "Personal",
    year: "2026",
    startDate: "Feb 2026",
    endDate: "Feb 2026",
    github: "https://github.com/DocMorphic/lighthouse",
  },
  {
    id: "freelance-ez",
    title: "Freelance-ez",
    description:
      "AI-powered website builder for SMEs. Users input their company details and AI generates a complete multi-page website. Like Lovable, but for a targeted audience.",
    tags: ["Next.js", "TypeScript", "Gemini 2.5 Pro", "Supabase"],
    role: "Solo",
    category: "Personal",
    year: "2025",
    startDate: "May 2025",
    endDate: "Jun 2025",
  },
  {
    id: "hashi",
    title: "Hashi",
    description:
      "A web-based Hashiwokakero logic puzzle. Implements graph-based algorithms for bridge validation and puzzle-solving. Built in TypeScript + React + CSS3, deployed on Vercel.",
    tags: ["TypeScript", "React", "CSS3", "Graph Algorithms"],
    role: "Solo",
    category: "Personal",
    year: "2025",
    startDate: "Feb 2025",
    endDate: "Feb 2025",
    link: "https://hashiii.vercel.app",
  },
  {
    id: "framed",
    title: "Framed",
    description:
      "A competitive PvP arena fighter with a unique \"window-based\" environmental mechanic and fast-paced combat logic. Built from scratch in GDScript, Godot, and Blender with custom physics and collision detection.",
    tags: ["Godot", "GDScript", "Blender", "Game Design"],
    role: "Solo",
    category: "Personal",
    year: "2026",
    startDate: "Feb 2026",
    endDate: "Now",
  },
  {
    id: "os-folio",
    title: "OS Portfolio",
    description:
      "This site. A desktop-OS-style portfolio with draggable windows, a working terminal, file explorer, site stats dashboard, and full theming. Built with Next.js 16, React 19, Tailwind 4, and a Supabase analytics backend.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind", "Supabase"],
    role: "Solo",
    category: "Personal",
    year: "2026",
    startDate: "Apr 2026",
    endDate: "Now",
    github: "https://github.com/DocMorphic/os-folio",
  },
];
