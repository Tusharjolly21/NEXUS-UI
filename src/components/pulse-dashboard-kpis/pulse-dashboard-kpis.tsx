"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Kpi = {
  label: string;
  value: string;
  /** Change versus the previous period, e.g. "+12.4%". A leading "-" reads as a drop. */
  delta?: string;
  /** Whether a drop is good news (latency, churn…). */
  lowerIsBetter?: boolean;
  /** Points for the sparkline, oldest first. */
  trend?: number[];
};

export type KpiStripProps = {
  /** KPIs to show. When `periods` is given, these are ignored in favour of the active period. */
  kpis?: Kpi[];
  /** Named periods, each with its own KPIs; adds a period switcher. */
  periods?: Record<string, Kpi[]>;
  defaultPeriod?: string;
  title?: string;
  className?: string;
};

const PERIODS: Record<string, Kpi[]> = {
  "7d": [
    { label: "Activation", value: "64.2%", delta: "+4.1%", trend: [48, 52, 50, 55, 58, 61, 64] },
    { label: "Net revenue", value: "$48.9k", delta: "+12.4%", trend: [31, 34, 33, 39, 41, 45, 49] },
    { label: "p95 latency", value: "182ms", delta: "-9.6%", lowerIsBetter: true, trend: [240, 228, 215, 220, 201, 190, 182] },
  ],
  "30d": [
    { label: "Activation", value: "61.8%", delta: "+2.7%", trend: [52, 55, 53, 57, 56, 59, 58, 60, 62, 61, 63, 62] },
    { label: "Net revenue", value: "$196k", delta: "+18.2%", trend: [120, 128, 131, 140, 138, 151, 160, 166, 170, 181, 188, 196] },
    { label: "p95 latency", value: "201ms", delta: "+3.1%", lowerIsBetter: true, trend: [190, 188, 195, 192, 199, 205, 198, 203, 207, 200, 204, 201] },
  ],
  "90d": [
    { label: "Activation", value: "58.4%", delta: "+9.3%", trend: [44, 46, 47, 49, 50, 52, 53, 55, 56, 57, 58, 58] },
    { label: "Net revenue", value: "$542k", delta: "+41.0%", trend: [300, 320, 345, 360, 390, 410, 430, 455, 480, 500, 520, 542] },
    { label: "p95 latency", value: "214ms", delta: "-22.5%", lowerIsBetter: true, trend: [290, 280, 270, 262, 255, 248, 240, 233, 228, 221, 218, 214] },
  ],
};

function Sparkline({ points, good, id }: { points: number[]; good: boolean; id: string }) {
  const reduce = useReducedMotion();
  const w = 200;
  const h = 56;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * w, h - 6 - ((p - min) / span) * (h - 14)] as const);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const color = good ? "#10b981" : "#f43f5e";
  const [lx, ly] = xy[xy.length - 1];
  return (
    <div className="relative h-14 w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 size-full overflow-visible" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${id}-clip`}>
            <motion.rect
              key={`c-${line}`}
              x="-4"
              y="-8"
              height={h + 16}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: w + 8 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-clip)`}>
          <path d={area} fill={`url(#${id})`} />
          <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <motion.span
        key={`d-${line}`}
        aria-hidden
        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white dark:ring-zinc-950"
        style={{ left: `${(lx / w) * 100}%`, top: `${(ly / h) * 100}%`, background: color }}
        initial={reduce ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 400, damping: 20 }}
      />
    </div>
  );
}

/** A row of KPI cards with deltas and animated sparklines, plus an optional period switcher. */
export function KpiStrip({ kpis, periods = kpis ? undefined : PERIODS, defaultPeriod, title = "This week at a glance", className }: KpiStripProps) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const keys = periods ? Object.keys(periods) : [];
  const [period, setPeriod] = React.useState(defaultPeriod ?? keys[0] ?? "");
  const list = periods ? periods[period] ?? [] : kpis ?? [];

  return (
    <section
      className={cn(
        "w-full rounded-[28px] border border-zinc-200/80 bg-zinc-50 p-3",
        "dark:border-white/10 dark:bg-zinc-900",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 px-3 pb-3 pt-2">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">{title}</h2>
        {keys.length > 1 ? (
          <div role="radiogroup" aria-label="Period" className="flex gap-0.5 rounded-full bg-zinc-200/70 p-0.5 dark:bg-white/10">
            {keys.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={period === k}
                onClick={() => setPeriod(k)}
                className={cn(
                  "relative h-7 rounded-full px-3 text-[12.5px] font-medium transition-colors",
                  period === k ? "text-zinc-950 dark:text-white" : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                {period === k ? (
                  <motion.span
                    layoutId={`${id}-period`}
                    className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-zinc-700"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 }}
                  />
                ) : null}
                <span className="relative">{k}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {list.map((k, i) => {
          const down = k.delta?.trim().startsWith("-") ?? false;
          const good = k.lowerIsBetter ? down : !down;
          return (
            <motion.div
              key={k.label}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="rounded-[20px] border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(23,23,28,0.04)] dark:border-white/10 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">{k.label}</p>
                {k.delta ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums",
                      good ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {down ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                    {k.delta.replace(/^[+-]/, "")}
                  </span>
                ) : null}
              </div>
              <motion.p
                key={`${period}-${k.value}`}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mt-2 text-[28px] font-semibold tabular-nums tracking-[-0.04em] text-zinc-950 dark:text-white"
              >
                {k.value}
              </motion.p>
              {k.trend && k.trend.length > 1 ? (
                <div className="mt-2">
                  <Sparkline points={k.trend} good={good} id={`${id}-${i}`.replace(/:/g, "")} />
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
