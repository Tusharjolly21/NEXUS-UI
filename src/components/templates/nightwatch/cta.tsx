"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { COLORS, CONTAINER, DAWN, DAWN_GRADIENT, FONT_MONO } from "./theme";
import { Avatar, Button, Icon, Logo, LogoMark, Reveal, SplitHeading } from "./ui";

/** The three panels that rotate behind the call to action: a status page, the on-call week, and a chat thread. */
function CtaPanel({ v: view }: { v: number }) {
  const cardClass = "overflow-hidden rounded-[18px] p-4";
  return view === 0 ? (
    <div
      className={cardClass}
      style={{
        background: "#F3F1EC",
        color: "#1B1D26",
      }}
    >
      <p className="text-[12px] font-[620]">status.acme.com</p>
      <p
        className="mt-2 flex items-center gap-1.5 text-[11px]"
        style={{
          color: "#1E9E6A",
        }}
      >
        <span className="size-1.5 rounded-full bg-current" />
        All systems normal
      </p>
      {[0, 1, 2].map((row) => (
        <div key={row} className="mt-2.5 flex gap-[2px]">
          {Array.from(
            {
              length: 26,
            },
            (_, i) => (
              <span
                key={i}
                className="h-4 flex-1 rounded-[2px]"
                style={{
                  background: row === 1 && i === 19 ? DAWN[0] : "#7DD9B3",
                  opacity: 0.5 + i / 52,
                }}
              />
            ),
          )}
        </div>
      ))}
    </div>
  ) : view === 1 ? (
    <div
      className={cardClass}
      style={{
        background: COLORS.raise,
      }}
    >
      <p
        className="text-[12px] font-[600]"
        style={{
          color: COLORS.ink,
        }}
      >
        This week on call
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((n, i) => (
          <div key={i} className="text-center">
            <span
              className="text-[9.5px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {n}
            </span>
            <div
              className="mt-1 h-10 rounded-md"
              style={{
                background: i < 3 ? `${DAWN[1]}55` : i < 5 ? "rgba(91,227,176,.35)" : "rgba(150,170,255,.25)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex -space-x-1.5">
        {["Ines Duarte", "Theo Ruiz", "Kemi Ade"].map((n) => (
          <Avatar key={n} name={n} size={22} ring={COLORS.raise} />
        ))}
      </div>
    </div>
  ) : view === 2 ? (
    <div
      className={cardClass}
      style={{
        background: COLORS.raise,
      }}
    >
      <div className="flex items-center gap-2">
        <Avatar name="Theo Ruiz" size={22} />
        <span
          className="rounded-xl rounded-tl-sm bg-white/[.07] px-2.5 py-1.5 text-[11px]"
          style={{
            color: COLORS.ink,
          }}
        >
          Is checkout ok?
        </span>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2">
        <span
          className="rounded-xl rounded-tr-sm px-2.5 py-1.5 text-[11px] text-[#1C0F09]"
          style={{
            background: DAWN_GRADIENT,
          }}
        >
          Rolled back #8812. p95 is 310 ms.
        </span>
        <LogoMark size={20} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <Avatar name="Ines Duarte" size={22} />
        <span
          className="rounded-xl rounded-tl-sm bg-white/[.07] px-2.5 py-1.5 text-[11px]"
          style={{
            color: COLORS.ink,
          }}
        >
          Going back to sleep.
        </span>
      </div>
    </div>
  ) : view === 3 ? (
    <div
      className={cardClass}
      style={{
        background: "#F3F1EC",
        color: "#1B1D26",
      }}
    >
      <p
        className="text-[10px]"
        style={{
          color: "#8A8C96",
          fontFamily: FONT_MONO,
        }}
      >
        POSTMORTEM · DRAFT
      </p>
      <p className="mt-1 text-[13px] font-[620] leading-[1.25]">Checkout slowed for 41 seconds</p>
      {[92, 80, 86, 54].map((n, i) => (
        <div
          key={i}
          className="mt-2 h-1.5 rounded-full"
          style={{
            width: `${n}%`,
            background: i === 1 ? `${DAWN[1]}88` : "#DCDAD3",
          }}
        />
      ))}
    </div>
  ) : view === 4 ? (
    <div
      className={cardClass}
      style={{
        background: COLORS.raise,
      }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[12px] font-[600]"
          style={{
            color: COLORS.ink,
          }}
        >
          Time to resolve
        </p>
        <span
          className="text-[11px]"
          style={{
            color: COLORS.ok,
          }}
        >
          −86%
        </span>
      </div>
      <svg viewBox="0 0 200 70" className="mt-2 w-full">
        <path d="M0 10 L30 14 L60 12 L90 30 L120 44 L150 52 L200 58" fill="none" stroke={COLORS.ok} strokeWidth="2" />
        <path d="M0 10 L30 14 L60 12 L90 30 L120 44 L150 52 L200 58 V70 H0Z" fill={COLORS.ok} opacity=".12" />
      </svg>
    </div>
  ) : (
    <div
      className={cardClass}
      style={{
        background: COLORS.raise,
        fontFamily: FONT_MONO,
      }}
    >
      {["› nw rollback checkout --to 8811", "  draining 12 pods…", "  ✓ healthy in 18s"].map((n, i) => (
        <p
          key={i}
          className="whitespace-pre text-[10.5px] leading-[1.9]"
          style={{
            color: i === 2 ? COLORS.ok : i === 0 ? DAWN[2] : COLORS.text,
          }}
        >
          {n}
        </p>
      ))}
    </div>
  );
}

export function Cta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const reduce = useReducedMotion();
  const glowX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -140]);
  const glowY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-120, 80]);
  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t py-20 sm:py-28"
      style={{
        borderColor: COLORS.line,
      }}
    >
      <div
        aria-hidden={true}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background: "radial-gradient(70% 80% at 30% 100%, rgba(255,120,90,.16), transparent 70%)",
        }}
      />
      <div className={`${CONTAINER} relative grid items-center gap-12 lg:grid-cols-2`}>
        <div>
          <SplitHeading
            text={`Tonight could
be quiet.`}
            className="text-[clamp(40px,5.4vw,72px)] font-[560] leading-[0.98] tracking-[-0.045em]"
            style={{
              color: COLORS.ink,
            }}
          />
          <Reveal delay={0.3}>
            <p
              className="mt-5 max-w-[440px] text-[17px] leading-[1.6]"
              style={{
                color: COLORS.text,
              }}
            >
              Connect your alerts this afternoon. Nightwatch watches alongside you for a week, then starts taking the
              night shift.
            </p>
          </Reveal>
          <Reveal delay={0.4} className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" icon="ph:arrow-right" href="#pricing">
              Start free
            </Button>
            <Button size="lg" kind="glass" href="#faq">
              Book a walkthrough
            </Button>
          </Reveal>
        </div>
        <div
          aria-hidden={true}
          className="relative grid h-[460px] grid-cols-2 gap-3 overflow-hidden"
          style={{
            WebkitMaskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)",
            maskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)",
          }}
        >
          <motion.div
            style={{
              y: glowX,
            }}
            className="space-y-3"
          >
            {[0, 1, 3, 5].map((i) => (
              <CtaPanel key={i} v={i} />
            ))}
          </motion.div>
          <motion.div
            style={{
              y: glowY,
            }}
            className="space-y-3 pt-10"
          >
            {[2, 4, 0, 1].map((i, i3) => (
              <CtaPanel key={i3} v={i} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const setGlow = (x: string, y: string, radius: string) => {
    const el = ref.current;
    if (el) {
      el.style.setProperty("--x", x);
      el.style.setProperty("--y", y);
      el.style.setProperty("--r", radius);
    }
  };
  const columns: [title: string, links: string[]][] = [
    ["Product", ["Incidents", "On-call", "Runbooks", "Status pages", "Postmortems"]],
    ["Company", ["About", "Customers", "Careers", "Press"]],
    ["Resources", ["Docs", "Changelog", "Field notes", "Support"]],
    ["Legal", ["Privacy", "Terms", "Security", "DPA"]],
  ];
  return (
    <footer
      className="border-t pt-16"
      style={{
        borderColor: COLORS.line,
      }}
    >
      <div className={`${CONTAINER} grid gap-10 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]`}>
        <div>
          <Logo />
          <p
            className="mt-4 max-w-[260px] text-[14px] leading-[1.55]"
            style={{
              color: COLORS.soft,
            }}
          >
            The on-call teammate that takes the first twenty minutes of every incident.
          </p>
          <div className="mt-5 flex gap-1">
            {[
              ["ph:github-logo", "GitHub"],
              ["ph:x-logo", "X"],
              ["ph:linkedin-logo", "LinkedIn"],
            ].map(([icon, label]) => (
              <a
                key={label}
                href="#top"
                aria-label={label}
                className="nw-ring grid size-9 place-items-center rounded-full transition-colors hover:bg-white/[.06] hover:text-white"
                style={{
                  color: COLORS.text,
                }}
              >
                <Icon name={icon} size={17} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map(([title, links]) => (
            <div key={title}>
              <p
                className="text-[13px] font-[600]"
                style={{
                  color: COLORS.ink,
                }}
              >
                {title}
              </p>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="nw-ring text-[14px] transition-colors hover:text-white"
                      style={{
                        color: COLORS.text,
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div
        ref={ref}
        aria-hidden={true}
        className="relative mt-16 select-none overflow-hidden pb-[3vw]"
        style={
          {
            "--x": "50%",
            "--y": "120%",
            "--r": "min(420px, 34vw)",
          } as CSSProperties
        }
        onPointerMove={(event) => {
          if (reduce) {
            return;
          }
          const rect = event.currentTarget.getBoundingClientRect();
          setGlow(`${event.clientX - rect.left}px`, `${event.clientY - rect.top}px`, "260px");
        }}
        onPointerLeave={() => setGlow("50%", "120%", "min(420px, 34vw)")}
      >
        <p
          className="whitespace-nowrap text-center text-[clamp(64px,17.4vw,250px)] font-[620] leading-[0.86] tracking-[-0.055em]"
          style={{
            color: "transparent",
            WebkitTextStroke: "1px rgba(150,170,255,.22)",
          }}
        >
          nightwatch
        </p>
        <p
          className="absolute inset-x-0 top-0 whitespace-nowrap text-center text-[clamp(64px,17.4vw,250px)] font-[620] leading-[0.86] tracking-[-0.055em]"
          style={{
            backgroundImage: DAWN_GRADIENT,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitMaskImage: "radial-gradient(var(--r) circle at var(--x) var(--y), #000, transparent 70%)",
            maskImage: "radial-gradient(var(--r) circle at var(--x) var(--y), #000, transparent 70%)",
            transition: "-webkit-mask-position .2s",
          }}
        >
          nightwatch
        </p>
      </div>
      <div
        className="border-t"
        style={{
          borderColor: COLORS.line,
        }}
      >
        <div
          className={`${CONTAINER} flex flex-col gap-3 py-6 text-[13px] sm:flex-row sm:items-center`}
          style={{
            color: COLORS.soft,
          }}
        >
          <span>© 2026 Nightwatch Labs</span>
          <a href="#top" className="nw-ring flex items-center gap-1.5 transition-colors hover:text-white sm:ml-auto">
            <span className="relative grid size-2 place-items-center">
              <span
                className="nw-ping absolute size-2 rounded-full"
                style={{
                  background: COLORS.ok,
                }}
              />
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: COLORS.ok,
                }}
              />
            </span>
            All systems normal
          </a>
        </div>
      </div>
    </footer>
  );
}
