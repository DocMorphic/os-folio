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
        ? 16 + Math.random() * 20
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
                width: 132,
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
    ? walkFrame === 0 ? "translate(3px, -4px)" : "translate(-2px, 0)"
    : undefined;
  const backLegTransform = walking
    ? walkFrame === 1 ? "translate(3px, -4px)" : "translate(-2px, 0)"
    : undefined;

  return (
    <svg
      className="pixel-cat pixel-cat-standing"
      width="132"
      height="80"
      viewBox="0 0 96 58"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <g className="pixel-cat-tail">
        <path
          d="M28 35H20V32H14V27H9V20H5V10H9V17H13V23H18V27H23V21H29Z"
          fill="var(--color-text-dim)"
          stroke="var(--color-text-muted)"
          strokeWidth="2"
        />
        <path d="M5 10H9V15H5ZM9 19H14V24H9ZM16 27H22V32H16Z" fill="var(--color-border-strong)" />
      </g>
      <path
        d="M25 22H31V18H60V20H68V25H75V43H69V47H28V44H23V29H25Z"
        fill="var(--color-text-dim)"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
      />
      <path d="M31 20H60V23H66V30H61V34H31V31H27V25H31Z" fill="var(--color-surface-alt)" opacity="0.6" />
      <path d="M35 19H41V26H37V29H33V23H35ZM47 19H53V27H49V30H45V23H47ZM59 22H65V29H62V32H58V26H59Z" fill="var(--color-border-strong)" />
      <path d="M29 36H38V42H29ZM47 35H56V43H47Z" fill="var(--color-text-muted)" opacity="0.75" />

      <path
        d="M65 14H68V7H73V12H82V6H87V14H91V34H87V38H68V35H63V20H65Z"
        fill="var(--color-text-dim)"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
      />
      <path className="pixel-cat-ear" d="M68 8H72V13H68ZM83 7H87V14H83Z" fill="var(--color-surface-alt)" />
      <path d="M65 25H71V33H76V37H68V34H64Z" fill="var(--color-surface-alt)" />
      <path d="M69 14H74V18H69ZM81 14H86V18H81Z" fill="var(--color-text)" />
      <path d="M70 15H72V17H70ZM82 15H84V17H82Z" fill="var(--color-accent)" />
      <path d="M88 21H93V25H88Z" fill="var(--color-surface-alt)" />
      <path d="M90 22H94V24H90Z" fill="var(--color-accent)" />
      <path d="M85 26H90V28H85ZM88 28H90V30H88Z" fill="var(--color-text-muted)" />
      <path d="M68 10H71V13H68ZM84 9H87V13H84ZM76 11H80V15H76Z" fill="var(--color-border-strong)" />

      <path d="M64 32H89V35H64Z" fill="var(--color-accent)" />
      <path d="M76 35H81V40H76Z" fill="var(--color-border-strong)" />
      <rect x="77" y="36" width="3" height="3" fill="var(--color-surface-alt)" />

      <g className="pixel-cat-whiskers" stroke="var(--color-text-muted)" strokeWidth="1">
        <path d="M88 25H96M87 28H95M70 25H61M71 28H62" />
      </g>

      <g style={{ transform: backLegTransform }}>
        <path d="M29 43H38V55H42V58H27V54H29Z" fill="var(--color-text-dim)" stroke="var(--color-text-muted)" strokeWidth="2" />
        <path d="M51 42H59V54H64V58H49V54H51Z" fill="var(--color-text-dim)" stroke="var(--color-text-muted)" strokeWidth="2" />
        <path d="M29 54H39V56H29ZM51 54H61V56H51Z" fill="var(--color-surface-alt)" />
      </g>
      <g style={{ transform: frontLegTransform }}>
        <path d="M39 44H47V55H51V58H37V54H39Z" fill="var(--color-text-muted)" stroke="var(--color-text-muted)" strokeWidth="2" />
        <path d="M65 39H73V54H78V58H63V54H65Z" fill="var(--color-text-muted)" stroke="var(--color-text-muted)" strokeWidth="2" />
        <path d="M39 54H48V56H39ZM65 54H75V56H65Z" fill="var(--color-surface-alt)" />
        <path d="M42 56V58M69 56V58M73 56V58" stroke="var(--color-border-strong)" strokeWidth="1" />
      </g>
    </svg>
  );
}

function SleepingCat() {
  return (
    <svg
      className="pixel-cat pixel-cat-sleeping"
      width="132"
      height="68"
      viewBox="0 0 88 45"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path
        d="M15 18H22V12H28V17H38V13H44V21H66V17H74V21H80V35H76V40H67V43H21V40H13V35H9V24H12V18Z"
        fill="var(--color-text-dim)"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
      />
      <path d="M22 14H27V19H22ZM39 15H44V21H39Z" fill="var(--color-surface-alt)" />
      <path d="M18 22H24V25H18ZM30 22H36V25H30Z" fill="var(--color-text)" />
      <path d="M24 27H29V30H24Z" fill="var(--color-accent)" />
      <path d="M18 31H35V36H18Z" fill="var(--color-surface-alt)" opacity="0.8" />
      <path d="M43 22H49V29H45V32H41V26H43ZM54 20H60V28H56V31H52V24H54Z" fill="var(--color-border-strong)" />
      <path d="M33 35H51V40H33Z" fill="var(--color-surface-alt)" />
      <path d="M17 34H38V37H17Z" fill="var(--color-accent)" />
      <rect x="27" y="37" width="5" height="5" fill="var(--color-border-strong)" />
      <path
        d="M67 18H76V22H82V29H85V37H80V33H76V29H68V33H59V28H67Z"
        fill="var(--color-text-muted)"
        stroke="var(--color-text-muted)"
        strokeWidth="2"
      />
      <path d="M75 22H80V26H75ZM79 29H84V33H79Z" fill="var(--color-border-strong)" />
      <path d="M20 27H25M31 27H36M23 30H18M32 30H38" stroke="var(--color-text-muted)" strokeWidth="1" />
      <path d="M35 39V42M40 39V42M46 39V42" stroke="var(--color-border-strong)" strokeWidth="1" />
    </svg>
  );
}
