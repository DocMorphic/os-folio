import type { BlogPost } from "@/lib/types";

export const blogPosts: BlogPost[] = [
  {
    id: "lighthouse",
    title: "Building Lighthouse: A Navigation App with Open-Source Maps",
    date: "Mar 2026",
    readingTime: "{{TODO: X min read}}",
    description:
      "How I'm building Lighthouse — a React Native + Expo mobile app that ditches Google Maps in favor of OpenStreetMap. Tile rendering, offline caching, and why open-source geospatial data is underrated.",
    tags: ["react-native", "openstreetmap", "mobile"],
    slug: "lighthouse-osm",
  },
  {
    id: "hashi-graphs",
    title: "Bridge Validation in Hashi: Graph Algorithms in the Browser",
    date: "Feb 2025",
    readingTime: "{{TODO: X min read}}",
    description:
      "A walkthrough of how I built a Hashiwokakero solver in TypeScript — connected components, cycle detection, and why logic puzzles are a great way to actually internalize graph theory.",
    tags: ["algorithms", "typescript", "graphs"],
    slug: "hashi-graphs",
  },
  {
    id: "framed-design",
    title: "Window-Based Combat: Designing Framed in Godot",
    date: "Feb 2025",
    readingTime: "{{TODO: X min read}}",
    description:
      "Framed is a PvP arena fighter where the environment behaves like a window — you can push, pull, and reshape it mid-fight. A retrospective on the mechanic, the combat loop, and what I learned about game design from scratch.",
    tags: ["game-dev", "godot", "design"],
    slug: "framed-windows",
  },
  {
    id: "rajkot-munich",
    title: "From Rajkot to Munich: A CS Student's First Year in Germany",
    date: "{{TODO: date}}",
    readingTime: "{{TODO: X min read}}",
    description:
      "Moving from a small Indian city to TU Munich for Computer Science. The Studienkolleg, the language, the weather, and the unexpected culture shocks of doing a degree in a country where everyone's already fluent in the code you're learning.",
    tags: ["personal", "tum", "germany"],
    slug: "rajkot-to-munich",
  },
];
