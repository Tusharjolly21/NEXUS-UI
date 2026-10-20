"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate, motion, MotionConfig, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

export interface CountingStat {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** Short line in green under the label. */
  trend: string;
  /** A handful of points for the sparkline, oldest first. */
  spark: number[];
}

export interface CountingStatsProps {
  stats?: CountingStat[];
  title?: string;
  /** Any CSS colour for the glow and every other sparkline. */
  accent?: string;
  /** Counts up again every few seconds while the band is on screen. */
  autoplay?: boolean;
  className?: string;
}

export const DEFAULT_COUNTING_STATS: CountingStat[] = [
  { value: 12.4, decimals: 1, suffix: "M", label: "Events processed a day", trend: "+32% this quarter", spark: [8, 10, 9, 13, 12, 15, 17, 16, 20, 24] },
  { value: 99.99, decimals: 2, suffix: "%", label: "Uptime over 12 months", trend: "4 minutes down all year", spark: [20, 20, 19, 20, 20, 20, 20, 18, 20, 20] },
  { value: 140, suffix: "ms", label: "Median dashboard load", trend: "2x faster than last year", spark: [24, 22, 21, 18, 17, 15, 13, 12, 10, 9] },
  { value: 4.9, decimals: 1, suffix: "/5", label: "Average review score", trend: "from 2,800 reviews", spark: [14, 15, 15, 16, 17, 17, 18, 18, 19, 19] },
];

const CYCLE_MS = 7000;

function formatStat(stat: CountingStat, n: number) {
  const digits = stat.decimals ?? 0;
  return `${stat.prefix ?? ""}${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}${stat.suffix ?? ""}`;
}

function Spark({ data, color, go, instant }: { data: number[]; color: string; go: boolean; instant: boolean }) {
  const points = data.length > 1 ? data : [0, 0];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const pts = points.map((v, i) => [(i / (points.length - 1)) * 120, 32 - ((v - min) / (max - min || 1)) * 28 - 2]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width="120" height="34" viewBox="0 0 120 34" className="max-w-full flex-none overflow-visible" aria-hidden="true">
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: go ? 1 : 0 }}
        transition={instant ? { duration: 0 } : { duration: 1.6, ease, delay: 0.3 }}
      />
      <motion.circle
        cx={last[0]}
        cy={last[1]}
        r="3.5"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: go ? (instant ? 1 : [0, 1.6, 1]) : 0 }}
        transition={instant ? { duration: 0 } : { delay: 1.8, duration: 0.5 }}
      />
    </svg>
  );
}

function StatCard({ stat, index, autoplay }: { stat: CountingStat; index: number; autoplay: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const visible = useInView(ref, { amount: 0.2 });
  const [cycle, setCycle] = useState(0);
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => formatStat(stat, v));
  const looping = autoplay && !reduce && seen && visible;

  useEffect(() => {
    if (!looping) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => window.clearInterval(id);
  }, [looping]);

  useEffect(() => {
    if (!seen) return;
    if (reduce) {
      count.set(stat.value);
      return;
    }
    count.set(0);
    const controls = animate(count, stat.value, { duration: 2, ease, delay: index * 0.1 });
    return () => controls.stop();
  }, [seen, cycle, reduce, count, stat.value, index]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease, delay: index * 0.08 }}
      className="flex min-w-0 flex-col gap-4 border-t border-white/10 pt-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <span className="sr-only">{formatStat(stat, stat.value)}</span>
        <motion.span
          aria-hidden="true"
          className="text-[clamp(40px,4.6vw,56px)] font-semibold leading-none tracking-[-0.045em] tabular-nums text-white"
        >
          {text}
        </motion.span>
        <Spark
          key={cycle}
          data={stat.spark}
          color={index % 2 ? "#5ac8fa" : "var(--mk-accent)"}
          go={seen}
          instant={reduce}
        />
      </div>
      <span className="text-[15px] text-[#d2d2d7]">{stat.label}</span>
      <span className="text-[13px] font-medium text-[#30d158]">{stat.trend}</span>
    </motion.div>
  );
}

/**
 * Dark stats band. Numbers count up the first time they scroll into view, each with a sparkline
 * that draws itself and a dot that pops at today. With `autoplay` the count replays every few
 * seconds while the band stays on screen.
 */
export function CountingStats({
  stats = DEFAULT_COUNTING_STATS,
  title = "The numbers, in public.",
  accent,
  autoplay = false,
  className,
}: CountingStatsProps) {
  const accentStyle = accent ? ({ "--mk-accent": accent } as CSSProperties) : undefined;
  return (
    <MotionConfig reducedMotion="user">
      <section
        style={accentStyle}
        className={cn(
          "@container relative w-full bg-black px-4 py-16 [--mk-accent:#0a84ff] sm:px-5 sm:py-20 dark:border-y dark:border-[#1c1c1e]",
          className,
        )}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 left-1/2 h-[480px] w-[min(900px,100%)] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, color-mix(in srgb, var(--mk-accent) 20%, transparent), transparent)" }}
          />
        </div>
        <div className="relative mx-auto max-w-[1120px]">
          <h2 className="m-0 mb-10 max-w-[640px] text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:mb-12">
            {title}
          </h2>
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 @xl:grid-cols-2 @xl:gap-y-12 @5xl:grid-cols-4">
            {stats.map((stat, i) => (
              <StatCard key={`${i}-${stat.label}`} stat={stat} index={i} autoplay={autoplay} />
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
