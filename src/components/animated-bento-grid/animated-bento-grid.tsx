"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type BentoVariant = "default" | "glass" | "gradient-border" | "spotlight";

export interface BentoItem {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: string;
  span?: "1x1" | "2x1" | "1x2" | "2x2";
  trend?: { value: number; label: string };
}

export interface AnimatedBentoGridProps {
  items: BentoItem[];
  variant?: BentoVariant;
  columns?: 2 | 3 | 4;
  animated?: boolean;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
}

export interface BentoGridPreset {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  accent?: string;
  span?: "1x1" | "2x1" | "1x2" | "2x2";
  trend?: { value: number; label: string };
}

// ── Animation variants ─────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.42, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ── Span helpers ──────────────────────────────────────────────────────────────

function spanClasses(span?: BentoItem["span"]) {
  switch (span) {
    case "2x1": return "col-span-2 row-span-1";
    case "1x2": return "col-span-1 row-span-2";
    case "2x2": return "col-span-2 row-span-2";
    default:   return "col-span-1 row-span-1";
  }
}

function minH(cols: number, span?: BentoItem["span"]) {
  if (span === "1x2" || span === "2x2") return "min-h-[200px]";
  if (cols === 4) return "min-h-[100px]";
  if (cols === 3) return "min-h-[120px]";
  return "min-h-[130px]";
}

// ── Trend badge ───────────────────────────────────────────────────────────────

function TrendBadge({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        up ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400",
      )}
    >
      {up ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
}

// ── Default card ──────────────────────────────────────────────────────────────

function BentoCardDefault({ item, reduce }: { item: BentoItem; reduce: boolean }) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-inner">
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: item.accent
            ? `radial-gradient(circle at 20% 20%, ${item.accent}22, transparent 60%)`
            : undefined,
        }}
      />
      {item.icon && (
        <div className="mb-3 flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60">
          {item.icon}
        </div>
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">{item.label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-white">{item.value}</p>
      {item.trend && <TrendBadge value={item.trend.value} />}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02]"
        animate={reduce ? {} : { opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ── Glass card ────────────────────────────────────────────────────────────────

function BentoCardGlass({ item }: { item: BentoItem }) {
  return (
    <div className="lf-glass relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-4">
      <div className="flex items-center justify-between">
        {item.icon && (
          <div className="flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60">
            {item.icon}
          </div>
        )}
        {item.trend && <TrendBadge value={item.trend.value} />}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">{item.label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-white">{item.value}</p>
      </div>
    </div>
  );
}

// ── Gradient border card ──────────────────────────────────────────────────────

function BentoCardGradientBorder({ item }: { item: BentoItem }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl p-[1px]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/10" />
      <div className="relative h-full overflow-hidden rounded-2xl bg-zinc-950 p-4">
        <div
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: item.accent
              ? `radial-gradient(circle at 50% 0%, ${item.accent}30, transparent 70%)`
              : undefined,
          }}
        />
        {item.icon && (
          <div className="mb-3 flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60">
            {item.icon}
          </div>
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">{item.label}</p>
        <p className="mt-1.5 text-2xl font-semibold text-white">{item.value}</p>
        {item.trend && <TrendBadge value={item.trend.value} />}
      </div>
    </div>
  );
}

// ── Spotlight card ────────────────────────────────────────────────────────────

function BentoCardSpotlight({ item, reduce }: { item: BentoItem; reduce: boolean }) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl bg-zinc-950 p-4">
      <div
        className="pointer-events-none absolute -left-12 -top-12 size-40 rounded-full"
        style={{
          background: item.accent
            ? `radial-gradient(circle, ${item.accent}40 0%, transparent 70%)`
            : "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
        }}
      />
      {item.icon && (
        <div className="mb-3 flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60">
          {item.icon}
        </div>
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">{item.label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-white">{item.value}</p>
      {item.trend && <TrendBadge value={item.trend.value} />}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 size-20 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: item.accent
            ? `radial-gradient(circle, ${item.accent}30, transparent 70%)`
            : "transparent",
        }}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function AnimatedBentoGrid({
  items,
  variant = "default",
  columns = 3,
  animated = true,
  staggerDelay = 0,
  className,
  itemClassName,
}: AnimatedBentoGridProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion() === true;
  const shouldAnimate = animated && !reduce;

  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  }[columns];

  function renderCard(item: BentoItem, i: number) {
    const props = { item, reduce };
    let card: React.ReactNode;
    switch (variant) {
      case "glass":        card = <BentoCardGlass {...props} />; break;
      case "gradient-border": card = <BentoCardGradientBorder {...props} />; break;
      case "spotlight":   card = <BentoCardSpotlight {...props} />; break;
      default:             card = <BentoCardDefault {...props} />; break;
    }

    const inner = (
      <div
        className={cn(
          spanClasses(item.span),
          minH(columns, item.span),
          itemClassName,
        )}
      >
        {card}
      </div>
    );

    if (!shouldAnimate) return inner;

    return (
      <motion.div
        key={item.id}
        custom={i}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={cardVariants}
      >
        {inner}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid gap-3",
        colClass,
        "auto-rows-fr",
        className,
      )}
    >
      {items.map((item, i) => renderCard(item, i))}
    </div>
  );
}