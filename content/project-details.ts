export interface ProjectSection {
  title: string;
  content: string;
}

export interface ProjectVisual {
  type: "image" | "video";
  src: string;
  caption?: string;
}

export interface ProjectDetail {
  projectId: string;
  tasks: string[];
  sections: ProjectSection[];
  visuals: ProjectVisual[];
  references?: { label: string; href: string }[];
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = {
  aliquot: {
    projectId: "aliquot",
    tasks: ["AI Pipeline", "Frontend", "Backend", "Search Integration"],
    sections: [
      {
        title: "Origin",
        content:
          "I wanted to see how far you could push LLMs beyond just generating text. The idea was simple: give the AI a scientific hypothesis in plain English and have it produce an experiment plan that a real researcher could actually follow. Not a summary, not a literature review, but a full operational plan with real reagent catalog numbers, equipment, budgets, and timelines.",
      },
      {
        title: "What It Does",
        content:
          "You type in a hypothesis and Aliquot runs it through a 7-stage pipeline. First it validates and classifies your hypothesis, then checks existing literature for novelty. If the hypothesis is worth testing, it generates a full experiment plan: protocol with citations, materials with verified catalog numbers from real vendors, equipment lists, a budget breakdown, a timeline, and a validation approach. Every claim gets a confidence score so you know what the AI is certain about and where it is guessing.",
      },
      {
        title: "Architecture",
        content:
          "The pipeline runs in 3 streamed HTTP phases. Phase 1 uses server-sent events to run the validator, classifier, and literature quality check. Phase 2 extracts reagents, searches vendor catalogs via Tavily in parallel, and synthesizes a draft plan. Phase 3 re-verifies every catalog number against live sources and annotates confidence scores. The AI layer uses Claude Sonnet for orchestration and Haiku for fast classification and confidence annotation.",
      },
      {
        title: "Stack",
        content:
          "Next.js 16 with React 19 and Tailwind 4 on the frontend. Anthropic Claude (Haiku 4.5 + Sonnet 4.6) for reasoning. Tavily for vendor catalog search, OpenAlex for literature. Supabase Postgres with pgvector for data persistence. Deployed on Vercel with fluid compute for the streaming pipeline.",
      },
    ],
    visuals: [
      { type: "image", src: "/projects/aliquot/desktop.png", caption: "Hypothesis input with desktop workspace" },
    ],
    references: [
      { label: "Live Demo", href: "https://aliquot-pi.vercel.app" },
      { label: "GitHub", href: "https://github.com/DocMorphic/aliquot" },
    ],
  },

  lighthouse: {
    projectId: "lighthouse",
    tasks: ["Mobile Development", "Maps Integration", "Offline Caching"],
    sections: [
      {
        title: "Origin",
        content:
          "I was curious whether you could build a usable navigation app without depending on Google Maps or Apple Maps. OpenStreetMap has incredibly detailed map data that is completely free and open, but most mobile apps that use it feel like afterthoughts. I wanted to build something that felt native and responsive, using open-source geospatial data as the foundation.",
      },
      {
        title: "What It Does",
        content:
          "Lighthouse is a mobile navigation app built with React Native and Expo. It renders interactive, scalable maps using OpenStreetMap tile data. The app handles real-time positioning, map rendering at multiple zoom levels, and basic routing. The focus was on making the map experience feel as smooth as commercial alternatives while keeping the entire data layer open-source.",
      },
      {
        title: "Technical Details",
        content:
          "Built with React Native and Expo for cross-platform support on iOS and Android. The map rendering integrates OpenStreetMap tile servers with custom styling. Offline tile caching lets the app work without connectivity for areas you have visited before. The whole thing was a focused weekend build to prove the concept works.",
      },
    ],
    visuals: [
      // User will provide React Native app screenshots
    ],
  },

  "freelance-ez": {
    projectId: "freelance-ez",
    tasks: ["AI Integration", "Frontend", "Backend", "Website Generation"],
    sections: [
      {
        title: "Origin",
        content:
          "While freelancing for small businesses in India and Germany, I kept running into the same problem: clients wanted a website but did not have the budget for a full development cycle. Tools like Wix and Squarespace exist, but they still require the user to make dozens of design decisions. I wanted to build something where you just describe your business and get a complete website back.",
      },
      {
        title: "What It Does",
        content:
          "Freelance-ez is an AI-powered website builder for small and medium businesses. The user inputs their company details, what they do, and the vibe they want. The AI generates a complete multi-page website with copy, layout, and styling. Think Lovable, but specifically targeted at small local businesses that just need something online fast.",
      },
      {
        title: "Technical Details",
        content:
          "Built with Next.js and TypeScript on the frontend. Uses Google Gemini 2.5 Pro for content generation and layout decisions. Supabase handles data persistence and user accounts. The generation pipeline produces responsive HTML/CSS that the user can tweak and publish directly.",
      },
    ],
    visuals: [
      { type: "image", src: "/projects/freelance-ez/landing.png", caption: "Landing page" },
      { type: "image", src: "/projects/freelance-ez/create.png", caption: "Sign in" },
    ],
  },

  hashi: {
    projectId: "hashi",
    tasks: ["Algorithms", "Frontend", "Game Logic"],
    sections: [
      {
        title: "Origin",
        content:
          "I was studying graph algorithms for a university course and wanted a project that would force me to actually internalize the concepts instead of just memorizing them for an exam. Hashiwokakero (Bridges) is a logic puzzle where islands must be connected by bridges following specific rules. The constraints map perfectly onto graph theory: connected components, degree constraints, cycle detection.",
      },
      {
        title: "What It Does",
        content:
          "Hashi is a web-based logic puzzle game. You get a grid of numbered islands and need to connect them with bridges. Each island's number tells you how many bridges must connect to it. Bridges can only run horizontally or vertically, cannot cross each other, and at most two bridges can connect any pair of islands. The app validates your solution in real time and can solve puzzles automatically using graph algorithms.",
      },
      {
        title: "Technical Details",
        content:
          "Built in TypeScript and React with pure CSS3 for the visual design. The puzzle solver uses graph-based algorithms for bridge validation: connected component analysis to check if all islands are reachable, degree constraint checking for each node, and cycle detection to verify puzzle completeness. Deployed on Vercel for instant access.",
      },
    ],
    visuals: [
      { type: "image", src: "/projects/hashi/puzzle.png", caption: "Puzzle grid with numbered islands" },
      { type: "image", src: "/projects/hashi/landing.png", caption: "Landing with difficulty selection" },
    ],
    references: [
      { label: "Play Hashi", href: "https://hashiii.vercel.app" },
    ],
  },

  framed: {
    projectId: "framed",
    tasks: ["Game Design", "Physics Engine", "3D Modeling", "Combat System"],
    sections: [
      {
        title: "Origin",
        content:
          "I have always been interested in game design theory, specifically the idea that the best mechanics emerge from constraints. Most arena fighters give you a static environment and focus entirely on character abilities. I wanted to flip that: what if the arena itself was the primary mechanic? What if you could reshape the fighting space mid-combat?",
      },
      {
        title: "What It Does",
        content:
          'Framed is a competitive PvP arena fighter where the environment uses a "window-based" mechanic. The arena behaves like a dynamic frame that players can manipulate during combat, pushing, pulling, and reshaping the boundaries. This creates a constantly shifting battleground where positioning and spatial awareness matter as much as combat execution.',
      },
      {
        title: "Technical Details",
        content:
          "Built entirely in Godot using GDScript for game logic and Blender for 3D asset creation. The physics engine uses custom collision detection tailored for non-traditional arena shapes. The combat system handles fast-paced input with frame-accurate hit detection. Currently in active development with ongoing iteration on the core mechanic balance.",
      },
    ],
    visuals: [
      // User will provide from their other laptop
    ],
  },
};
