"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";

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
  /** Called with the period key when the user switches period. */
  onPeriodChange?: (period: string) => void;
  title?: string;
  /** Cycles through the periods every 2.8s until someone touches the strip. */
  autoplay?: boolean;
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

/** Sparkline box and how many points every trend is resampled to, so any two can morph. */
const W = 200;
const H = 56;
const M = 32;
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Catmull-Rom resample to M points, normalised into the sparkline box. */
function shape(points: number[]): number[] {
  const p = points.length > 1 ? points : [0, 0];
  const lo = Math.min(...p);
  const hi = Math.max(...p);
  const span = hi - lo || 1;
  const L = p.length;
  const out: number[] = [];
  for (let j = 0; j < M; j++) {
    const x = (j / (M - 1)) * (L - 1);
    const i = Math.min(L - 2, Math.floor(x));
    const t = x - i;
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(L - 1, i + 2)];
    const v = 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
    out.push(H - 7 - ((v - lo) / span) * (H - 16));
  }
  return out;
}

function line(ys: number[]) {
  return ys.map((y, j) => `${j ? "L" : "M"}${r2((j / (M - 1)) * W)},${r2(y)}`).join(" ");
}

function Sparkline({ points, good, id, still }: { points: number[]; good: boolean; id: string; still: boolean }) {
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const shown = useRef<number[] | null>(null);
  // The first render owns the attributes; after that every change is drawn by the morph below.
  const [first] = useState(() => {
    const ys = shape(points);
    return { d: line(ys), y: r2(ys[M - 1]) };
  });
  const key = points.join(",");

  useEffect(() => {
    const to = shape(key.split(",").map(Number));
    const from = shown.current ?? to;
    const draw = (ys: number[]) => {
      const d = line(ys);
      lineRef.current?.setAttribute("d", d);
      areaRef.current?.setAttribute("d", `${d} L${W},${H} L0,${H} Z`);
      dotRef.current?.setAttribute("cy", String(r2(ys[M - 1])));
      shown.current = ys;
    };
    if (still || from === to) {
      draw(to);
      return;
    }
    const run = animate(0, 1, {
      type: "spring",
      stiffness: 170,
      damping: 17,
      onUpdate: (t) => draw(from.map((y, j) => y + (to[j] - y) * t)),
    });
    return () => run.stop();
  }, [key, still]);

  const color = good ? "#30d158" : "#ff3b30";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-14 w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" style={{ transition: "stop-color .4s" }} />
          <stop offset="100%" stopColor={color} stopOpacity="0" style={{ transition: "stop-color .4s" }} />
        </linearGradient>
      </defs>
      <path ref={areaRef} d={`${first.d} L${W},${H} L0,${H} Z`} fill={`url(#${id})`} />
      <path ref={lineRef} d={first.d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ transition: "stroke .4s" }} />
      <circle ref={dotRef} cx={W} cy={first.y} r="3.5" fill={color} className="stroke-white dark:stroke-[#1c1c1e]" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ transition: "fill .4s" }} />
    </svg>
  );
}

/** Splits "$48.9k" into "$", 48.9 (1 decimal) and "k" so the number can be tweened. */
function parse(v: string) {
  const m = v.match(/^(.*?)(-?\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, "");
  const dec = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { pre: m[1], n: Number(raw), dec, post: m[3], commas: m[2].includes(",") };
}

function Rolling({ value, still }: { value: string; still: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef<number | null>(null);
  const [first] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const p = parse(value);
    const from = last.current;
    if (!p || still || from === null) {
      el.textContent = value;
      last.current = p ? p.n : null;
      return;
    }
    const fmt = (n: number) =>
      `${p.pre}${p.commas ? n.toLocaleString("en-US", { minimumFractionDigits: p.dec, maximumFractionDigits: p.dec }) : n.toFixed(p.dec)}${p.post}`;
    const run = animate(from, p.n, { type: "spring", stiffness: 120, damping: 20, onUpdate: (n) => (el.textContent = fmt(n)) });
    last.current = p.n;
    return () => run.stop();
  }, [value, still]);
  return (
    <span ref={ref} aria-hidden="true">
      {first}
    </span>
  );
}

function Arrow({ down }: { down: boolean }) {
  return (
    <svg viewBox="0 0 10 10" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={down ? "M2.5 2.5l5 5M7.5 3.5v4h-4" : "M2.5 7.5l5-5M3.5 2.5h4v4"} />
    </svg>
  );
}

/**
 * A row of KPI cards with a period switcher. Switching period morphs every
 * sparkline into its new shape on a spring, rolls the figures to their new
 * values and flips the delta chips, which know when a drop is good news.
 */
export function KpiStrip({
  kpis,
  periods = kpis ? undefined : PERIODS,
  defaultPeriod,
  onPeriodChange,
  title = "This week at a glance",
  autoplay = false,
  className = "",
}: KpiStripProps) {
  const reduce = useReducedMotion() === true;
  const id = useId().replace(/:/g, "");
  const keys = periods ? Object.keys(periods) : [];
  const [period, setPeriod] = useState(defaultPeriod ?? keys[0] ?? "");
  const list = periods ? (periods[period] ?? []) : (kpis ?? []);
  const touched = useRef(false);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);

  const keyList = keys.join("\u0000");
  useEffect(() => {
    const ks = keyList ? keyList.split("\u0000") : [];
    if (!autoplay || ks.length < 2) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      setPeriod((p) => ks[(ks.indexOf(p) + 1) % ks.length]);
    }, 2800);
    return () => window.clearInterval(t);
  }, [autoplay, keyList]);

  const choose = (k: string) => {
    touched.current = true;
    setPeriod(k);
    onPeriodChange?.(k);
  };

  const radioKey = (e: KeyboardEvent, i: number) => {
    let to: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (i + 1) % keys.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (i - 1 + keys.length) % keys.length;
    if (to === null) return;
    e.preventDefault();
    choose(keys[to]);
    radios.current[to]?.focus();
  };

  return (
    <section
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container w-full rounded-[28px] bg-[#f5f5f7] p-3 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#111113] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 pb-3 pt-2">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em]">{title}</h2>
        {keys.length > 1 ? (
          <div role="radiogroup" aria-label="Period" className="flex gap-0.5 rounded-full bg-[#e8e8ed] p-0.5 dark:bg-[#2c2c2e]">
            {keys.map((k, i) => {
              const on = period === k;
              return (
                <button
                  key={k}
                  ref={(el) => {
                    radios.current[i] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => choose(k)}
                  onKeyDown={(e) => radioKey(e, i)}
                  className={`relative h-7 rounded-full px-3 text-[12px] font-semibold tabular-nums outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff] ${
                    on ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]"
                  }`}
                >
                  {on ? (
                    <motion.span
                      layoutId={`${id}-period`}
                      className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)] dark:bg-[#48484a]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative">{k}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-2 @min-[540px]:grid-cols-3" aria-live="polite">
        {list.map((k, i) => {
          const down = k.delta?.trim().startsWith("-") ?? false;
          const good = k.lowerIsBetter ? down : !down;
          return (
            <motion.div
              key={k.label}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="rounded-[22px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{k.label}</p>
                {k.delta ? (
                  <span className="relative inline-flex h-5 overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={k.delta}
                        initial={reduce ? false : { y: down ? -14 : 14, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? undefined : { y: down ? 14 : -14, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 420, damping: 26, delay: i * 0.04 }}
                        className={`inline-flex h-5 items-center gap-0.5 rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                          good ? "bg-[#30d158]/12 text-[#1a7f37] dark:text-[#30d158]" : "bg-[#ff3b30]/10 text-[#c9271d] dark:text-[#ff6961]"
                        }`}
                      >
                        <Arrow down={down} />
                        {k.delta.replace(/^[+-]/, "")}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.04em] tabular-nums">
                <span className="sr-only">
                  {k.value}
                  {k.delta ? `, ${down ? "down" : "up"} ${k.delta.replace(/^[+-]/, "")}, ${good ? "good" : "needs attention"}` : ""}
                </span>
                <Rolling value={k.value} still={reduce} />
              </p>
              {k.trend && k.trend.length > 1 ? (
                <div className="mt-3">
                  <Sparkline points={k.trend} good={good} id={`${id}-g${i}`} still={reduce} />
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </div>
      <p className="px-3 pb-1 pt-3 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Switch the period; every line morphs to its new shape.</p>
    </section>
  );
}
