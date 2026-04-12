import type { Metadata } from "next";
import { DM_Sans, Newsreader, Geist_Mono } from "next/font/google";
import { StatsTracker } from "@/components/StatsTracker";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "Dharmay Dave | Portfolio",
  description:
    "CS student at TU Munich, freelance full-stack developer, and builder of weird and wonderful web and mobile products.",
  openGraph: {
    title: "Dharmay Dave | Portfolio",
    description:
      "CS student at TU Munich, freelance full-stack developer, and builder of weird and wonderful web and mobile products.",
    type: "website",
    images: ["/favicon.png"],
  },
  twitter: {
    card: "summary",
    title: "Dharmay Dave | Portfolio",
    description: "CS student at TU Munich, freelance full-stack developer.",
    images: ["/favicon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-accent="orange"
      suppressHydrationWarning
      className={`${dmSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('os-folio:theme')||'light';var a=localStorage.getItem('os-folio:accent')||'orange';var b=localStorage.getItem('os-folio:brightness')||'100';document.documentElement.setAttribute('data-theme',t);document.documentElement.setAttribute('data-accent',a);document.documentElement.style.setProperty('--display-brightness',(parseInt(b,10)/100).toString())}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full overflow-hidden">
        <a href="#desktop-content" className="skip-to-content">
          Skip to content
        </a>
        <nav className="sr-only" aria-label="Main navigation">
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#works">Works</a></li>
            <li><a href="#experience">Experience</a></li>
            <li><a href="#blog">Blog</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>
        {children}
        <StatsTracker />
      </body>
    </html>
  );
}
