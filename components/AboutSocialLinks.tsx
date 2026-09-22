"use client";

import { aboutData } from "@/content/about";
import styles from "./AboutSocialLinks.module.css";

const profiles = [
  { label: "GitHub", href: aboutData.socials.github, path: "M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.08c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.54 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.16c.95 0 1.9.13 2.8.38 2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.7.12 2.98.72.79 1.16 1.79 1.16 3.02 0 4.3-2.64 5.26-5.15 5.54.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" },
  { label: "LinkedIn", href: aboutData.socials.linkedin, path: "M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8v-4.65c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.5V9.2h2.84v1.3h.04c.4-.75 1.36-1.55 2.8-1.55 3 0 3.56 1.97 3.56 4.53v5.27Z" },
  { label: "X", href: aboutData.socials.x, path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.589-6.64 7.589H.47l8.604-9.835L0 1.153h7.594l5.24 6.932 6.067-6.932ZM17.61 20.644h2.04L6.486 3.24H4.298L17.61 20.644Z" },
];

export function AboutSocialLinks({ onContact }: { onContact(): void }) {
  return <nav className={styles.links} aria-label="Social links and contact">
    {profiles.map(({ label, href, path }) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={path}/></svg>
      <span>{label}</span>
    </a>)}
    <button type="button" onClick={onContact}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6 9 7 9-7"/></svg>
      <span>Contact</span>
    </button>
  </nav>;
}
