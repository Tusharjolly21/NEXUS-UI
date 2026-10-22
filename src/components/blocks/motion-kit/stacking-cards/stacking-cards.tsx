"use client";

import { useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface StackingCardItem {
  /** Small number or label in the accent colour. */
  tag: string;
  title: string;
  body: string;
  /** Card fill and accent in light mode. */
  bg: string;
  accent: string;
  /** Card fill and accent in dark mode. Falls back to the light pair, so set them for tinted fills. */
  darkBg?: string;
  darkAccent?: string;
}

export interface StackingCardsProps {
  cards?: StackingCardItem[];
  heading?: string;
  /** Line under the heading. */
  hint?: string;
  /** Accessible name for the scrolling region. */
  label?: string;
  /** Height of the scrolling frame in pixels. */
  height?: number;
  className?: string;
}

export const DEFAULT_STACKING_CARDS: StackingCardItem[] = [
  { tag: "01", title: "Plan", body: "Write the brief, pick the pages, set the tone.", bg: "#eef5ff", accent: "#0071e3", darkBg: "#12263f", darkAccent: "#5eb0ff" },
  { tag: "02", title: "Compose", body: "Drop in blocks. Every one already moves well.", bg: "#f3ecff", accent: "#8944ab", darkBg: "#2a1c3d", darkAccent: "#c792ee" },
  { tag: "03", title: "Tune", body: "Adjust springs and timing live, then copy the code.", bg: "#e9f9ee", accent: "#1a7f37", darkBg: "#12301f", darkAccent: "#4cd470" },
  { tag: "04", title: "Ship", body: "One file per component. Nothing to install but Motion.", bg: "#fff4e5", accent: "#b25e00", darkBg: "#38260f", darkAccent: "#ffb340" },
];

const TOP = 24;
const STEP = 14;
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

function StackCard({
  i,
  n,
  card,
  progress,
  reduce,
}: {
  i: number;
  n: number;
  card: StackingCardItem;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  // Once later cards arrive, this one shrinks and dims a little for each card on top of it.
  const under = n - 1 - i;
  const scale = useTransform(progress, [i / n, 1], [1, reduce ? 1 : 1 - under * 0.05]);
  const dim = useTransform(progress, [i / n, 1], [0, under * 0.08]);
  const vars = {
    "--sc-bg": card.bg,
    "--sc-bg-d": card.darkBg ?? card.bg,
    "--sc-a": card.accent,
    "--sc-a-d": card.darkAccent ?? card.accent,
  } as CSSProperties;
  return (
    <div className="sticky flex h-[360px] items-start justify-center" style={{ top: TOP + i * STEP }}>
      <motion.div
        className="relative h-[300px] w-full max-w-[560px] origin-top overflow-hidden rounded-[28px] bg-[var(--sc-bg)] p-7 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_-10px_30px_-20px_rgba(0,0,0,.25)] dark:bg-[var(--sc-bg-d)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_-10px_30px_-20px_rgba(0,0,0,.9)]"
        style={{ ...vars, scale }}
      >
        <span className="text-[13px] font-semibold tabular-nums text-[var(--sc-a)] dark:text-[var(--sc-a-d)]">{card.tag}</span>
        <h4 className="m-0 mt-2 text-[44px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">{card.title}</h4>
        <p className="m-0 mt-3 max-w-[320px] text-[16px] leading-[1.5] text-[#424245] dark:text-[#d1d1d6]">{card.body}</p>
        <div className="absolute bottom-7 right-7 grid grid-cols-3 gap-1.5" aria-hidden="true">
          {Array.from({ length: 9 }, (_, k) => (
            <span
              key={k}
              className="h-5 w-5 rounded-[6px] bg-[var(--sc-a)] dark:bg-[var(--sc-a-d)]"
              style={{ opacity: k <= i * 2 + 2 ? 0.85 : 0.12 }}
            />
          ))}
        </div>
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dim }} />
      </motion.div>
    </div>
  );
}

/**
 * Cards that stack as you scroll the frame. Each one pins near the top a little lower than the last, the
 * next slides up over it, and the ones underneath shrink and dim slightly so the pile reads as depth.
 * Scroll back and they lift off in reverse. The frame scrolls on its own, so it works the same on the page
 * and inside any preview or tile. Under reduced motion the cards still pin and dim but do not shrink.
 * There is no autoplay: the stack is driven by scrolling the frame.
 */
export function StackingCards({
  cards = DEFAULT_STACKING_CARDS,
  heading = "Four steps to a site that moves",
  hint = "Scroll inside this box.",
  label = "Steps",
  height = 540,
  className,
}: StackingCardsProps) {
  const reduce = useReducedMotion() ?? false;
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: box, target: inner, offset: ["start start", "end end"] });

  return (
    <section aria-label={label} className={cn("w-full bg-[#f5f5f7] px-4 py-12 sm:px-6 sm:py-16 dark:bg-black", className)}>
      <div className="relative mx-auto w-full max-w-[1000px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <div
          ref={box}
          tabIndex={0}
          role="region"
          aria-label={`${label}, scrollable`}
          className={cn("relative overflow-y-auto overscroll-y-auto px-4", FOCUS)}
          style={{ height }}
        >
          <div className="pt-10 text-center">
            <h3 className="m-0 text-[clamp(26px,4vw,36px)] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]">{heading}</h3>
            <p className="m-0 mt-2 text-[15px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</p>
          </div>
          <div ref={inner} className="relative mt-8 pb-[160px]">
            {cards.map((c, i) => (
              <StackCard key={`${i}-${c.title}`} i={i} n={cards.length} card={c} progress={scrollYProgress} reduce={reduce} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
