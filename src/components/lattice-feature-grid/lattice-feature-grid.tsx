"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Accessibility, Gauge, type LucideIcon, Palette, Search, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

export type LatticeFeature = {
  title: string;
  body: string;
  icon?: LucideIcon;
  /** Small illustration shown at the top of the tile. */
  visual?: React.ReactNode;
};

export type LatticeFeaturesProps = {
  items?: LatticeFeature[];
  eyebrow?: string;
  heading?: string;
  className?: string;
};

function TokensVisual() {
  const swatches = ["#17171c", "#6366f1", "#a855f7", "#f472b6", "#f59e0b", "#10b981"];
  return (
    <div className="flex items-end gap-1.5">
      {swatches.map((c, i) => (
        <motion.span
          key={c}
          className="h-10 w-7 rounded-lg shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]"
          style={{ backgroundColor: c }}
          initial={{ y: 8, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
        />
      ))}
    </div>
  );
}

function SpringVisual() {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 200 60" className="h-14 w-full" aria-hidden>
      <path d="M0 50 H200" className="stroke-zinc-200 dark:stroke-white/10" strokeDasharray="3 4" />
      <motion.path
        d="M0 50 C 30 50, 40 4, 70 8 S 100 30, 120 24 S 150 14, 170 18 S 190 20, 200 20"
        fill="none"
        className="stroke-indigo-500"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

function A11yVisual() {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-white">Cancel</span>
      <span className="rounded-lg bg-zinc-950 px-3 py-1.5 text-[12px] font-medium text-white outline outline-2 outline-offset-2 outline-indigo-500 dark:bg-white dark:text-zinc-950">Confirm</span>
      <kbd className="ml-1 rounded-md border border-zinc-200 px-1.5 py-0.5 font-sans text-[11px] text-zinc-500 dark:border-white/10 dark:text-zinc-400">Tab ⇥</kbd>
    </div>
  );
}

function SeoVisual() {
  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-3 dark:border-white/10 dark:bg-zinc-900">
      <p className="truncate text-[11px] text-emerald-700 dark:text-emerald-400">northwind.co › pricing</p>
      <p className="mt-0.5 truncate text-[13px] font-medium text-indigo-700 dark:text-indigo-300">Pricing — Northwind</p>
      <p className="mt-0.5 line-clamp-1 text-[11.5px] text-zinc-500 dark:text-zinc-400">Plans that scale with your team. Start free…</p>
    </div>
  );
}

const ITEMS: LatticeFeature[] = [
  { title: "Tokens, not hex codes", body: "Colour, type and spacing come from one set of variables, so a rebrand is a single file.", icon: Palette, visual: <TokensVisual /> },
  { title: "Motion with intent", body: "Springs tuned to feel physical — fast to respond, calm to settle, never in the way.", icon: Waves, visual: <SpringVisual /> },
  { title: "Accessible by default", body: "Focus you can see, keyboard paths that make sense, and reduced motion honoured everywhere.", icon: Accessibility, visual: <A11yVisual /> },
  { title: "Ready for search", body: "Semantic markup, real headings and fast first paint, so pages rank as well as they look.", icon: Search, visual: <SeoVisual /> },
];

/**
 * A four-up feature grid where every tile carries a small live illustration of the feature it
 * describes, revealed as the section scrolls in.
 */
export function LatticeFeatures({
  items = ITEMS,
  eyebrow = "Why teams switch",
  heading = "Everything a design system should have done for you",
  className,
}: LatticeFeaturesProps) {
  const reduce = useReducedMotion();
  return (
    <section
      className={cn(
        "w-full rounded-[28px] border border-zinc-200/80 bg-white p-8",
        "dark:border-white/10 dark:bg-zinc-950",
        className,
      )}
    >
      {heading ? (
        <div className="max-w-lg">
          {eyebrow ? <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-300">{eyebrow}</p> : null}
          <h2 className="mt-2 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] text-zinc-950 [text-wrap:balance] dark:text-white">{heading}</h2>
        </div>
      ) : null}
      <div className="mt-7 grid gap-px overflow-hidden rounded-[22px] border border-zinc-200/80 bg-zinc-200/80 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
        {items.map((it, i) => {
          const Icon = it.icon ?? Gauge;
          return (
            <motion.div
              key={it.title}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col bg-white p-6 transition-colors hover:bg-zinc-50/80 dark:bg-zinc-950 dark:hover:bg-white/[0.02]"
            >
              <div className="flex min-h-[64px] items-center">{it.visual}</div>
              <div className="mt-5 flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-white/10 dark:text-zinc-300">
                  <Icon className="size-3.5" />
                </span>
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-zinc-950 dark:text-white">{it.title}</p>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-500 dark:text-zinc-400">{it.body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
