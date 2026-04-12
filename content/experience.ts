import type { ExperienceEntry } from "@/lib/types";

export const currentFocus: string[] = [
  "Computer Science at TU Munich (Studienkolleg).",
  "Freelance full-stack work for startups in Germany and India.",
  "Building Lighthouse — a React Native navigation app using OpenStreetMap.",
];

export const experience: ExperienceEntry[] = [
  {
    id: "scaile",
    company: "SCAILE",
    role: "Working Student",
    employmentType: "Working Student",
    location: "Germany",
    locationType: "Remote",
    startDate: "Mar 2026",
    endDate: "Present",
    description: "Building products curated to client requests.",
    tags: ["Next.js", "TypeScript", "React"],
  },
  {
    id: "freelance",
    company: "Independent",
    role: "Freelance Full-Stack Engineer",
    employmentType: "Freelance",
    location: "India & Germany",
    locationType: "Remote",
    startDate: "May 2025",
    endDate: "Present",
    description:
      "Designing and building websites for small local startups — focused on responsiveness, speed, and accessibility. Delivering custom solutions in React, Next.js, Java, Python, and Node.js for clients in education and retail.",
    tags: ["React", "Next.js", "Python", "Node.js"],
  },
  {
    id: "sigment-ai",
    company: "Sigment AI",
    role: "Software Engineering Intern",
    employmentType: "Internship",
    locationType: "Remote",
    startDate: "Jul 2025",
    endDate: "Sep 2025",
    description:
      "Contributed to a unified marketplace platform that simplifies the integration and deployment of autonomous AI agents for business operations.",
    tags: ["AI Agents", "Platform", "Full-Stack"],
  },
  {
    id: "cs-tutor-intern",
    company: "S. N. Kansagra School",
    role: "Computer Science Tutor",
    employmentType: "Internship",
    location: "Rajkot, India",
    locationType: "On-site",
    startDate: "Apr 2025",
    endDate: "Jul 2025",
    description:
      "Taught programming fundamentals and algorithms to high school students. Helped students prepare for national-level coding competitions and board examinations. Simplified complex CS concepts through real-world analogies and project-based learning.",
    tags: ["Teaching", "Algorithms", "Mentoring"],
  },
  {
    id: "private-tutor",
    company: "S. N. Kansagra School",
    role: "Private Tutor",
    employmentType: "Part-time",
    location: "Rajkot, India",
    locationType: "On-site",
    startDate: "Sep 2024",
    endDate: "Dec 2024",
    description:
      "Provided personalized tutoring in Mathematics, Physics, and English to secondary school students. Developed structured learning materials and adapted sessions to different learning styles.",
    tags: ["Teaching", "Math", "Physics"],
  },
];

export const education: ExperienceEntry[] = [
  {
    id: "tum",
    company: "Technical University of Munich",
    role: "Computer Science",
    employmentType: "Studienkolleg",
    location: "Munich, Germany",
    startDate: "Oct 2025",
    endDate: "Present",
    description:
      "Preparing for the CS undergraduate program. Coursework includes Advanced Mathematics, Higher Physics, Linear Algebra, Calculus, and Introduction to Programming.",
    tags: ["Mathematics", "Physics", "Programming"],
  },
  {
    id: "kansagra",
    company: "S. N. Kansagra School",
    role: "Class XII — Science",
    employmentType: "High School",
    location: "Rajkot, India",
    startDate: "Jun 2013",
    endDate: "Apr 2025",
    description:
      "Valedictorian with 97% in Class XII — ranked among the top 0.1% in India. Coursework in Advanced Mathematics, Computer Science, and Advanced Physics.",
    tags: ["Mathematics", "Computer Science", "Physics"],
  },
];
