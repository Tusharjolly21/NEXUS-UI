"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Clapperboard, LayoutTemplate, Rows3, Shapes, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { components: Sparkles, blocks: Rows3, templates: LayoutTemplate, icons: Shapes, videos: Clapperboard } as const;

export type Figure = { value: number; label: string; href: string; icon: keyof typeof ICONS; note?: string };

/** A colour along the Nexus spectrum, 0 = blue, 0.5 = violet, 1 = pink. */
function spectrum(t: number) {
  return t <= 0.5
    ? `color-mix(in oklab, var(--cx-violet) ${Math.round(t * 200)}%, var(--cx-blue))`
    : `color-mix(in oklab, var(--cx-pink) ${Math.round((t - 0.5) * 200)}%, var(--cx-violet))`;
}

/** One digit on a wheel of 0–9 that rolls to its value. */
function Wheel({ digit, run, delay, color }: { digit: number; run: boolean; delay: number; color: string }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative inline-block h-[1em] overflow-hidden" style={{ width: "0.6em", color }}>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-(run || reduce ? digit : 0)}em` }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16, mass: 1.1, delay }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <span key={n} className="block h-[1em] text-center leading-[1em]">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ value, run, delay }: { value: number; run: boolean; delay: number }) {
  const digits = String(value).split("").map(Number);
  return (
    <span className="inline-flex" aria-hidden>
      {digits.map((d, i) => (
        <Wheel
          key={i}
          digit={d}
          run={run}
          delay={delay + (digits.length - 1 - i) * 0.08}
          color={spectrum(digits.length === 1 ? 0.3 : i / (digits.length - 1))}
        />
      ))}
    </span>
  );
}

/**
 * What's in the library, as a framed instrument panel: each figure rolls up on wheels the first time
 * it comes into view, its cell lights where the pointer is, and each one opens its part of the site.
 */
export function Numbers({ figures }: { figures: Figure[] }) {
  const ref = React.useRef<HTMLUListElement>(null);
  const run = useInView(ref, { once: true, margin: "-20% 0px" });

  return (
    <section aria-label="What's in the library" className="cx-section px-4 py-16 sm:py-20">
      {/* the 1px gaps over a hairline-coloured panel draw the lines between cells at every column count */}
      <ul
        ref={ref}
        className="relative mx-auto grid max-w-[1152px] grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-[var(--cx-hairline)] shadow-[0_0_0_1px_var(--cx-hairline)] sm:grid-cols-3 lg:grid-cols-5"
      >
        {run ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 z-20 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-[color-mix(in_oklab,var(--cx-violet)_16%,transparent)] to-transparent"
            initial={{ left: "-40%" }}
            animate={{ left: "120%" }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          />
        ) : null}
        {figures.map((f, i) => {
          const Icon = ICONS[f.icon];
          return (
            <li
              key={f.label}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
              }}
              onPointerEnter={(e) => e.currentTarget.style.setProperty("--go", "1")}
              onPointerLeave={(e) => e.currentTarget.style.setProperty("--go", "0")}
              className={cn("cx-glow group bg-card", i === figures.length - 1 && "col-span-2 lg:col-span-1")}
            >
              <Link
                href={f.href}
                className="relative z-10 flex h-full flex-col gap-7 p-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:p-7"
              >
                <span className="flex items-center justify-between text-muted-foreground">
                  <span className="grid size-9 place-items-center rounded-xl bg-muted text-foreground transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="size-4 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
                    aria-hidden
                  />
                </span>
                <span>
                  <span className="pg-display block text-[clamp(48px,5.6vw,68px)] leading-none">
                    <span className="sr-only">{f.value}</span>
                    <Odometer value={f.value} run={run} delay={0.1 + i * 0.12} />
                  </span>
                  <span className="mt-3 block text-[15px] font-medium text-foreground">{f.label}</span>
                  {f.note ? <span className="mt-0.5 block text-[13px] text-muted-foreground">{f.note}</span> : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
