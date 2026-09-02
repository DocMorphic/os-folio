"use client";

import { aboutData } from "@/content/about";
import { useWindowManager } from "@/hooks/use-window-manager";
import { useEffect, useRef, useState } from "react";

export function AboutApp() {
  const { openWindow } = useWindowManager();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div>
          <h1
            className="font-serif-heading flex flex-nowrap items-center gap-x-3 whitespace-nowrap text-[clamp(48px,5vw,64px)] leading-[0.95]"
            style={{ color: "var(--color-text)" }}
          >
            <span>{aboutData.firstName}</span>
            <span
              className="h-[2px] min-w-6 flex-1 sm:max-w-20"
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
          className="flex max-w-[68ch] flex-col gap-2 text-[13px] leading-[1.5]"
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
            className="border-b px-3 py-2 text-[10.5px] font-semibold tracking-[0.16em]"
            style={{
              background: "var(--color-surface-alt)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            CURRENT FOCUS
          </h2>
          <ul className="flex flex-col gap-1.5 px-3 py-2.5">
            {aboutData.currentFocus.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[12px] leading-[1.4]"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <span
                  className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
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
            className="mt-1.5 text-[12.5px] leading-[1.45]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The complete work and education story, with the useful details left in.
          </p>
          <button
            className="mt-2 border px-4 py-2 text-[12px] font-medium text-white transition-colors"
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

      const duration = Math.max(620, distance * 30);
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

      if (choice < 0.22) {
        wander(78, () => {
          update({ behavior: "sleeping", facingRight: true });
          wait(3200 + Math.random() * 2800, () => {
            update({ behavior: "stretching" });
            wait(900, () => chooseNext(run), run);
          }, run);
        }, run);
        return;
      }

      if (choice < 0.34) {
        update({ behavior: "stretching" });
        wait(900, () => chooseNext(run), run);
        return;
      }

      const target = xRef.current > 47
        ? 13 + Math.random() * 22
        : 62 + Math.random() * 19;
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
      wait(700, () => {
        const target = xRef.current > 48 ? 20 : 68;
        wander(target, () => {
          update({ behavior: "idle" });
          wait(1000, () => chooseNext(run), run);
        }, run);
      }, run);
    };

    wait(350, () => {
      const run = generation;
      wander(64, () => {
        update({ behavior: "idle" });
        wait(850, () => chooseNext(run), run);
      }, run);
    });

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
    <div className="pixel-companion-stage mt-2 h-[116px] shrink-0 overflow-hidden" aria-label="Interactive pixel cat area">
      <div className="pixel-cat-bed" aria-hidden="true" />
      <div
        className={`pixel-companion pixel-companion--${cat.behavior} pixel-companion--facing-${cat.facingRight ? "right" : "left"}`}
        style={{ left: `${cat.x}%` }}
      >
        {isSleeping && <span className="pixel-cat-zzz" aria-hidden="true">zZz</span>}
        {showHeart && <span className="pixel-cat-heart" aria-hidden="true">♥</span>}
        {cat.behavior === "walking" && (
          <span className={`pixel-cat-steps pixel-cat-steps--${cat.walkFrame}`} aria-hidden="true" />
        )}
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
            <span
              className="pixel-cat-facing"
              style={{
                display: "block",
                width: 112,
                transform: cat.facingRight ? "scaleX(1)" : "scaleX(-1)",
                transformOrigin: "center",
              }}
            >
              <StandingCat
                walking={cat.behavior === "walking"}
                walkFrame={cat.walkFrame}
              />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function StandingCat({
  walking,
  walkFrame,
}: {
  walking: boolean;
  walkFrame: number;
}) {
  const frontLegTransform = walking
    ? walkFrame === 0 ? "translate(2px, -3px)" : "translate(-1px, 0)"
    : undefined;
  const backLegTransform = walking
    ? walkFrame === 1 ? "translate(2px, -3px)" : "translate(-1px, 0)"
    : undefined;

  return (
    <svg
      className="pixel-cat pixel-cat-standing"
      width="112"
      height="70"
      viewBox="0 0 64 40"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g className="pixel-cat-tail" fill="var(--color-text-muted)">
        <rect x="10" y="14" width="9" height="5" />
        <rect x="6" y="10" width="6" height="6" />
        <rect x="3" y="5" width="5" height="7" />
        <rect x="4" y="2" width="8" height="5" />
      </g>
      <g fill="var(--color-text-dim)">
        <rect x="15" y="14" width="34" height="16" />
        <rect x="20" y="11" width="27" height="5" />
        <rect x="43" y="8" width="15" height="17" />
        <rect x="45" y="5" width="12" height="7" />
        <rect x="45" y="2" width="5" height="7" />
        <rect x="53" y="1" width="5" height="8" />
        <rect x="56" y="14" width="5" height="7" />
      </g>
      <g fill="var(--color-text-muted)">
        <rect x="4" y="3" width="3" height="2" />
        <rect x="7" y="5" width="4" height="2" />
        <rect x="19" y="16" width="5" height="4" />
        <rect x="27" y="14" width="4" height="5" />
        <rect x="36" y="17" width="5" height="4" />
        <rect x="48" y="4" width="2" height="4" />
        <rect x="54" y="3" width="2" height="5" />
      </g>
      <g fill="var(--color-surface-alt)">
        <rect x="46" y="4" width="3" height="4" />
        <rect x="54" y="3" width="3" height="5" />
        <rect x="22" y="21" width="16" height="5" />
      </g>
      <rect x="47" y="11" width="4" height="4" fill="var(--color-text)" />
      <rect x="54" y="11" width="4" height="4" fill="var(--color-text)" />
      <rect x="48" y="12" width="2" height="2" fill="var(--color-surface)" />
      <rect x="55" y="12" width="2" height="2" fill="var(--color-surface)" />
      <rect x="58" y="17" width="3" height="2" fill="var(--color-accent)" />
      <rect x="43" y="22" width="14" height="2" fill="var(--color-accent)" />
      <rect x="50" y="24" width="3" height="3" fill="var(--color-border-strong)" />
      <g stroke="var(--color-text-muted)" strokeWidth="1">
        <path d="M57 19H63M57 21H64M54 19H48M54 21H47" />
      </g>
      <g fill="var(--color-text-muted)" style={{ transform: frontLegTransform }}>
        <rect x="42" y="27" width="5" height="11" />
        <rect x="42" y="37" width="9" height="3" />
        <rect x="19" y="28" width="5" height="10" />
        <rect x="17" y="37" width="9" height="3" />
        <rect x="46" y="38" width="3" height="1" fill="var(--color-surface-alt)" />
        <rect x="19" y="38" width="3" height="1" fill="var(--color-surface-alt)" />
      </g>
      <g fill="var(--color-text-dim)" style={{ transform: backLegTransform }}>
        <rect x="35" y="28" width="5" height="10" />
        <rect x="33" y="37" width="9" height="3" />
        <rect x="25" y="29" width="5" height="9" />
        <rect x="24" y="37" width="8" height="3" />
        <rect x="36" y="38" width="3" height="1" fill="var(--color-surface-alt)" />
        <rect x="26" y="38" width="3" height="1" fill="var(--color-surface-alt)" />
      </g>
    </svg>
  );
}

function SleepingCat() {
  return (
    <svg
      className="pixel-cat pixel-cat-sleeping"
      width="112"
      height="58"
      viewBox="0 0 56 29"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g fill="var(--color-text-dim)">
        <rect x="8" y="13" width="39" height="13" />
        <rect x="5" y="11" width="17" height="13" />
        <rect x="7" y="7" width="5" height="6" />
        <rect x="16" y="7" width="5" height="6" />
        <rect x="36" y="9" width="13" height="14" />
        <rect x="42" y="12" width="10" height="11" />
      </g>
      <g fill="var(--color-text-muted)">
        <rect x="43" y="7" width="9" height="5" />
        <rect x="49" y="10" width="5" height="11" />
        <rect x="42" y="20" width="10" height="4" />
        <rect x="24" y="16" width="6" height="5" />
        <rect x="32" y="13" width="5" height="5" />
      </g>
      <g fill="var(--color-surface-alt)">
        <rect x="8" y="8" width="3" height="4" />
        <rect x="17" y="8" width="3" height="4" />
        <rect x="23" y="21" width="12" height="4" />
      </g>
      <path d="M8 15H12M15 15H19" stroke="var(--color-surface)" strokeWidth="1" />
      <rect x="12" y="18" width="3" height="2" fill="var(--color-accent)" />
      <rect x="20" y="12" width="3" height="2" fill="var(--color-accent)" />
      <rect x="43" y="9" width="3" height="2" fill="var(--color-surface-alt)" />
      <rect x="49" y="13" width="3" height="2" fill="var(--color-surface-alt)" />
    </svg>
  );
}
