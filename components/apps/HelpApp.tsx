"use client";

export function HelpApp() {
  return (
    <div className="flex flex-col gap-5">
      {/* Heading */}
      <div>
        <h1 className="font-serif-heading text-[30px] leading-none" style={{ color: "var(--color-text)" }}>
          Portfolio Guide
        </h1>
        <p className="mt-3 text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
          This site is a desktop-style portfolio. Open apps in draggable windows, browse files and folders, use intelligent search, and control everything through CLI commands in Terminal.
        </p>
      </div>

      {/* How To Open Apps */}
      <div>
        <h2 className="mb-2 text-[14px] font-semibold" style={{ color: "var(--color-text)" }}>
          How To Open Apps
        </h2>
        <ul className="flex flex-col gap-1.5">
          <BulletItem>Click app icons in the bottom app bar to open or focus a window.</BulletItem>
          <BulletItem>Use Search to type what you want and let the site open matching windows for you.</BulletItem>
          <BulletItem>Use Terminal with commands like open and close for command-line control.</BulletItem>
        </ul>
      </div>

      {/* Intelligent Search */}
      <div>
        <h2 className="mb-2 text-[14px] font-semibold" style={{ color: "var(--color-text)" }}>
          Intelligent Search
        </h2>
        <p className="text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
          Search is intelligent and free-form. You can type anything naturally, and it can open apps, projects, blog posts, files, folders, photos, and even close windows based on what you ask.
        </p>
        <p className="mt-3 font-mono text-[11.5px]" style={{ color: "var(--color-text-muted)" }}>
          Try: open contact | show projects | open Portugal trip photos | close all windows and open about
        </p>
      </div>

      {/* CLI Quick Start */}
      <div>
        <h2 className="mb-2 text-[14px] font-semibold" style={{ color: "var(--color-text)" }}>
          CLI Quick Start
        </h2>
        <p className="text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
          Open the Terminal app and run commands. Good starters:
        </p>
        <p className="mt-2 font-mono text-[11.5px]" style={{ color: "var(--color-text-muted)" }}>
          help apps open &lt;app&gt; close &lt;app&gt; windows man &lt;command&gt;
        </p>
      </div>
    </div>
  );
}

function BulletItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[12.5px] leading-[1.55]" style={{ color: "var(--color-text-secondary)" }}>
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "var(--color-text-muted)" }} />
      {children}
    </li>
  );
}
