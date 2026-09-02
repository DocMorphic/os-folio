"use client";

import { aboutData } from "@/content/about";
import { useWindowManager } from "@/hooks/use-window-manager";
import { useEffect, useRef, useState } from "react";

export function AboutApp() {
  const { openWindow } = useWindowManager();

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-col gap-5">
        <div>
          <h1
            className="font-serif-heading flex flex-wrap items-center gap-x-4 text-[clamp(38px,8vw,64px)] leading-[0.95]"
            style={{ color: "var(--color-text)" }}
          >
            <span>{aboutData.firstName}</span>
            <span
              className="h-[2px] w-12 sm:w-20"
              style={{ background: "var(--color-accent)" }}
              aria-hidden="true"
            />
            <span>{aboutData.lastName}</span>
          </h1>
          <p
            className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            {aboutData.title} · {aboutData.location}
          </p>
        </div>

        <div
          className="flex max-w-[68ch] flex-col gap-3 text-[13px] leading-[1.65]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <p>{aboutData.intro[0]}</p>
          <p>
            {aboutData.intro[1]} Browse my{" "}
            <button className="content-link" onClick={() => openWindow("works")}>
              projects
            </button>
            , follow along on{" "}
            <a
              className="content-link"
              href={aboutData.socials.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            , connect on{" "}
            <a
              className="content-link"
              href={aboutData.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            , or{" "}
            <button className="content-link" onClick={() => openWindow("contact")}>
              get in touch
            </button>
            .
          </p>
        </div>

        <section className="border" style={{ borderColor: "var(--color-border)" }}>
          <h2
            className="border-b px-4 py-2.5 text-[10.5px] font-semibold tracking-[0.16em]"
            style={{
              background: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            CURRENT FOCUS
          </h2>
          <ul className="flex flex-col gap-2.5 p-4">
            {aboutData.currentFocus.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-[12.5px] leading-[1.55]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span
                  className="mt-[7px] h-2 w-2 shrink-0 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2
            className="text-[10.5px] font-semibold tracking-[0.16em]"
            style={{ color: "var(--color-text-muted)" }}
          >
            FULL TIMELINE
          </h2>
          <p
            className="mt-2 text-[12.5px] leading-[1.55]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The complete work and education story, with the useful details left in.
          </p>
          <button
            className="mt-3 border px-4 py-2 text-[12px] font-medium text-white transition-colors"
            style={{
              background: "var(--color-button-dark)",
              borderColor: "var(--color-border-strong)",
            }}
            onClick={() => openWindow("experience")}
          >
            Open Experience
          </button>
        </section>
      </div>

      <PixelCompanion />
    </div>
  );
}

function PixelCompanion() {
  const [cat, setCat] = useState({
    x: 18,
    facingRight: true,
    behavior: "idle" as "idle" | "walking" | "sleeping" | "stretching",
    walkFrame: 0,
  });
  const [showHeart, setShowHeart] = useState(false);
  const xRef = useRef(cat.x);
  const restartRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let active = true;
    let generation = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let walkTimer: ReturnType<typeof setInterval> | undefined;
    let frame: number | undefined;

    const update = (next: Partial<typeof cat>) => {
      if (!active) return;
      if (next.x !== undefined) xRef.current = next.x;
      setCat((current) => ({ ...current, ...next }));
    };

    const wait = (milliseconds: number, callback: () => void, run = generation) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (active && run === generation) callback();
      }, milliseconds);
    };

    const stopWalking = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      clearInterval(walkTimer);
      walkTimer = undefined;
      update({ walkFrame: 0 });
    };

    const wander = (target: number, done: () => void, run = generation) => {
      stopWalking();
      const start = xRef.current;
      const distance = Math.abs(target - start);
      if (distance < 1) {
        done();
        return;
      }

      const duration = Math.max(700, distance * 42);
      const startedAt = performance.now();
      update({
        behavior: "walking",
        facingRight: target > start,
      });
      walkTimer = setInterval(() => {
        setCat((current) => ({ ...current, walkFrame: current.walkFrame === 0 ? 1 : 0 }));
      }, 180);

      const move = (now: number) => {
        if (!active || run !== generation) return;
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        update({ x: start + (target - start) * eased });
        if (progress < 1) {
          frame = requestAnimationFrame(move);
        } else {
          stopWalking();
          done();
        }
      };

      frame = requestAnimationFrame(move);
    };

    const chooseNext = (run = generation) => {
      if (!active || run !== generation) return;
      const choice = Math.random();

      if (choice < 0.28) {
        wander(78, () => {
          update({ behavior: "sleeping", facingRight: true });
          wait(3200 + Math.random() * 2800, () => {
            update({ behavior: "stretching" });
            wait(900, () => chooseNext(run), run);
          }, run);
        }, run);
        return;
      }

      if (choice < 0.48) {
        update({ behavior: "stretching" });
        wait(900, () => chooseNext(run), run);
        return;
      }

      const target = 8 + Math.random() * 68;
      wander(target, () => {
        update({ behavior: "idle" });
        wait(900 + Math.random() * 1700, () => chooseNext(run), run);
      }, run);
    };

    restartRef.current = () => {
      generation += 1;
      clearTimeout(timeout);
      stopWalking();
      update({ behavior: "stretching" });
      const run = generation;
      wait(700, () => chooseNext(run), run);
    };

    wait(900, () => chooseNext(generation));

    return () => {
      active = false;
      restartRef.current = null;
      clearTimeout(timeout);
      clearInterval(walkTimer);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  const petCat = () => {
    setShowHeart(true);
    window.setTimeout(() => setShowHeart(false), 950);
    restartRef.current?.();
  };

  const isSleeping = cat.behavior === "sleeping";

  return (
    <div className="pixel-companion-stage mt-auto min-h-32 overflow-hidden pt-7">
      <div className="pixel-cat-bed" aria-hidden="true" />
      <div
        className={`pixel-companion pixel-companion--${cat.behavior}`}
        style={{ left: `${cat.x}%` }}
      >
        {isSleeping && <span className="pixel-cat-zzz" aria-hidden="true">zZz</span>}
        {showHeart && <span className="pixel-cat-heart" aria-hidden="true">♥</span>}
        <button
          type="button"
          className="pixel-cat-button"
          onClick={petCat}
          aria-label="Pet the pixel cat"
          title="Pet the cat"
        >
          {isSleeping ? (
            <SleepingCat />
          ) : (
            <StandingCat
              facingRight={cat.facingRight}
              walking={cat.behavior === "walking"}
              walkFrame={cat.walkFrame}
            />
          )}
        </button>
      </div>
    </div>
  );
}

function StandingCat({
  facingRight,
  walking,
  walkFrame,
}: {
  facingRight: boolean;
  walking: boolean;
  walkFrame: number;
}) {
  const frontLegY = walking && walkFrame === 0 ? -2 : 0;
  const backLegY = walking && walkFrame === 1 ? -2 : 0;

  return (
    <svg
      className="pixel-cat pixel-cat-standing"
      width="92"
      height="62"
      viewBox="0 0 46 31"
      fill="none"
      shapeRendering="crispEdges"
      style={{ transform: facingRight ? undefined : "scaleX(-1)" }}
      aria-hidden="true"
    >
      <g className="pixel-cat-tail" fill="var(--color-text-muted)">
        <rect x="34" y="11" width="8" height="4" />
        <rect x="40" y="7" width="4" height="6" />
        <rect x="42" y="4" width="3" height="5" />
      </g>
      <g fill="var(--color-text-dim)">
        <rect x="10" y="11" width="28" height="11" />
        <rect x="6" y="7" width="12" height="13" />
        <rect x="7" y="3" width="4" height="6" />
        <rect x="14" y="3" width="4" height="6" />
        <rect x="8" y="2" width="3" height="3" />
        <rect x="15" y="2" width="3" height="3" />
      </g>
      <rect x="8" y="10" width="2" height="2" fill="var(--color-surface)" />
      <rect x="15" y="10" width="2" height="2" fill="var(--color-surface)" />
      <rect x="11" y="13" width="3" height="2" fill="var(--color-accent)" />
      <g stroke="var(--color-text-muted)" strokeWidth="1">
        <path d="M10 15H4M10 17H3M15 15H21M15 17H22" />
      </g>
      <g fill="var(--color-text-muted)" style={{ transform: `translateY(${frontLegY}px)` }}>
        <rect x="12" y="21" width="4" height="8" />
        <rect x="10" y="28" width="6" height="2" />
        <rect x="31" y="21" width="4" height="8" />
        <rect x="31" y="28" width="6" height="2" />
      </g>
      <g fill="var(--color-text-dim)" style={{ transform: `translateY(${backLegY}px)` }}>
        <rect x="18" y="21" width="4" height="7" />
        <rect x="17" y="27" width="6" height="2" />
        <rect x="36" y="20" width="3" height="8" />
        <rect x="36" y="27" width="6" height="2" />
      </g>
    </svg>
  );
}

function SleepingCat() {
  return (
    <svg
      className="pixel-cat pixel-cat-sleeping"
      width="92"
      height="48"
      viewBox="0 0 46 24"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g fill="var(--color-text-dim)">
        <rect x="7" y="10" width="31" height="11" />
        <rect x="4" y="8" width="13" height="11" />
        <rect x="5" y="5" width="4" height="5" />
        <rect x="13" y="5" width="4" height="5" />
        <rect x="31" y="7" width="9" height="11" />
      </g>
      <g fill="var(--color-text-muted)">
        <rect x="35" y="5" width="8" height="4" />
        <rect x="40" y="8" width="4" height="8" />
        <rect x="34" y="16" width="8" height="3" />
      </g>
      <path d="M6 12H10M12 12H16" stroke="var(--color-surface)" strokeWidth="1" />
      <rect x="10" y="14" width="2" height="1" fill="var(--color-accent)" />
    </svg>
  );
}
