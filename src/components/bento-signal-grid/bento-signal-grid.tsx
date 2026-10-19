"use client";

import * as React from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Activity, Globe2, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type BentoSignalsProps = {
  /** Latency in ms the live chart hovers around. */
  latency?: number;
  /** Uptime percentage shown on the uptime tile. */
  uptime?: string;
  /** Daily status for the uptime bars, oldest first: "ok" | "degraded" | "down". */
  days?: ("ok" | "degraded" | "down")[];
  /** Requests served, counted up when the grid scrolls into view. */
  requests?: number;
  regions?: { name: string; ms: number; status?: "ok" | "degraded" }[];
  /** Keep the latency chart ticking. */
  live?: boolean;
  className?: string;
};

const DAYS: ("ok" | "degraded" | "down")[] = Array.from({ length: 30 }, (_, i) => (i === 11 ? "degraded" : i === 23 ? "down" : "ok"));
const REGIONS = [
  { name: "Frankfurt", ms: 18 },
  { name: "Virginia", ms: 24 },
  { name: "Singapore", ms: 61, status: "degraded" as const },
  { name: "São Paulo", ms: 43 },
];

function useLiveSeries(base: number, live: boolean, length = 32) {
  const [series, setSeries] = React.useState(() =>
    Array.from({ length }, (_, i) => base + Math.sin(i / 2.6) * base * 0.18 + ((i * 37) % 7) - 3),
  );
  React.useEffect(() => {
    if (!live) return;
    let i = length;
    const t = setInterval(() => {
      i++;
      setSeries((s) => [...s.slice(1), base + Math.sin(i / 2.6) * base * 0.18 + (Math.random() * 8 - 4)]);
    }, 1200);
    return () => clearInterval(t);
  }, [base, live, length]);
  return series;
}

function Counter({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const v = useMotionValue(reduce ? to : 0);
  const text = useTransform(v, (n) => Math.round(n).toLocaleString("en-US"));
  const ref = React.useRef<HTMLSpanElement | null>(null);
  React.useEffect(() => {
    if (reduce) return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        animate(v, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
        io.disconnect();
      }
    });
    io.observe(node);
    return () => io.disconnect();
  }, [reduce, to, v]);
  return <motion.span ref={ref}>{text}</motion.span>;
}

const tile =
  "relative overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white p-5 dark:border-white/10 dark:bg-zinc-950";

/** A monitoring bento: a live latency chart, 30 days of uptime, a request counter and region health. */
export function BentoSignals({
  latency = 42,
  uptime = "99.98%",
  days = DAYS,
  requests = 12_480_331,
  regions = REGIONS,
  live = true,
  className,
}: BentoSignalsProps) {
  const reduce = useReducedMotion();
  const series = useLiveSeries(latency, live && !reduce);
  const w = 320;
  const h = 110;
  const max = Math.max(...series) * 1.15;
  const pts = series.map((v, i) => [(i / (series.length - 1)) * w, h - (v / max) * h] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const now = Math.round(series[series.length - 1]);

  return (
    <section
      className={cn(
        "grid w-full gap-2 rounded-[28px] border border-zinc-200/80 bg-zinc-100 p-2 sm:grid-cols-3 sm:grid-rows-2",
        "dark:border-white/10 dark:bg-zinc-900",
        className,
      )}
    >
      <div className={cn(tile, "sm:col-span-2")}>
        <div className="flex items-start justify-between">
          <div>
            <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
              <Activity className="size-3.5" /> API latency · p50
            </p>
            <p className="mt-1 text-[34px] font-semibold tabular-nums tracking-[-0.04em] text-zinc-950 dark:text-white">
              {now}
              <span className="ml-1 text-[16px] font-medium text-zinc-400">ms</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[11.5px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex size-1.5">
              {!reduce && live ? <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" /> : null}
              <span className="relative size-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-3 h-[110px] w-full" aria-hidden>
          <defs>
            <linearGradient id="bento-signal-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} className="stroke-zinc-100 dark:stroke-white/5" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#bento-signal-fill)" />
          <path d={line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className={tile}>
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="size-3.5" /> Uptime · 30 days
        </p>
        <p className="mt-1 text-[28px] font-semibold tabular-nums tracking-[-0.04em] text-zinc-950 dark:text-white">{uptime}</p>
        <div className="mt-4 flex h-10 items-end gap-[3px]">
          {days.map((d, i) => (
            <motion.span
              key={i}
              title={d}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.015, type: "spring", stiffness: 300, damping: 22 }}
              className={cn(
                "flex-1 origin-bottom rounded-[3px]",
                d === "ok" ? "h-full bg-emerald-500/80" : d === "degraded" ? "h-3/4 bg-amber-400" : "h-1/2 bg-rose-500",
              )}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-zinc-400"><span>30d ago</span><span>Today</span></div>
      </div>

      <div className={cn(tile, "flex flex-col")}>
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
          <Zap className="size-3.5" /> Requests served
        </p>
        <p className="mt-1 text-[28px] font-semibold tabular-nums tracking-[-0.04em] text-zinc-950 dark:text-white">
          <Counter to={requests} />
        </p>
        <p className="mt-2 text-[12.5px] text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">+18%</span> vs last month
        </p>
        <div className="mt-auto flex h-14 items-end gap-1 pt-4" aria-hidden>
          {[38, 44, 41, 52, 49, 58, 55, 63, 60, 71, 68, 82].map((v, i) => (
            <motion.span
              key={i}
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.03, type: "spring", stiffness: 260, damping: 24 }}
              style={{ height: `${v}%` }}
              className={cn("flex-1 origin-bottom rounded-[4px]", i === 11 ? "bg-indigo-500" : "bg-indigo-500/20 dark:bg-indigo-400/25")}
            />
          ))}
        </div>
      </div>

      <div className={cn(tile, "sm:col-span-2")}>
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400">
            <Globe2 className="size-3.5" /> Edge regions
          </p>
          <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-950 dark:text-white">{regions.filter((r) => r.status !== "degraded").length}</span>/{regions.length} healthy
          </p>
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {regions.map((r, i) => {
            const slow = r.status === "degraded";
            const pct = Math.min(100, (r.ms / Math.max(...regions.map((x) => x.ms))) * 100);
            return (
              <li key={r.name} className="rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-zinc-950 dark:text-white">
                    <span className={cn("size-1.5 rounded-full", slow ? "bg-amber-400" : "bg-emerald-500")} />
                    {r.name}
                  </span>
                  <span className="text-[12.5px] tabular-nums text-zinc-500 dark:text-zinc-400">{r.ms}ms</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-white/10">
                  <motion.div
                    className={cn("h-full origin-left rounded-full", slow ? "bg-amber-400" : "bg-emerald-500")}
                    style={{ width: `${pct}%` }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
