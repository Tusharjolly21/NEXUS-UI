"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

export type SignalDay = "ok" | "degraded" | "down";
export type SignalRegion = { name: string; ms: number; status?: "ok" | "degraded" };

export type BentoSignalsProps = {
  /** Latency in ms the live chart hovers around. */
  latency?: number;
  /** Uptime percentage shown on the uptime tile. */
  uptime?: string;
  /** Daily status for the uptime bars, oldest first. */
  days?: SignalDay[];
  /** Requests served. Counts up when the grid scrolls into view, then keeps ticking while `live`. */
  requests?: number;
  /** Edge regions with their round-trip latency. */
  regions?: SignalRegion[];
  /** Keep the chart scrolling and the counters ticking. */
  live?: boolean;
  /** Sweeps the chart cursor back and forth until someone points at the grid. */
  autoplay?: boolean;
  /** Extra classes for the grid. */
  className?: string;
};

const DAYS: SignalDay[] = Array.from({ length: 30 }, (_, i) => (i === 11 ? "degraded" : i === 23 ? "down" : "ok"));
const REGIONS: SignalRegion[] = [
  { name: "Frankfurt", ms: 18 },
  { name: "Virginia", ms: 24 },
  { name: "Singapore", ms: 61, status: "degraded" },
  { name: "São Paulo", ms: 43 },
];
const BARS = [38, 44, 41, 52, 49, 58, 55, 63, 60, 71, 68, 82];

/** Chart box in SVG units, and how many intervals are visible. */
const W = 320;
const H = 120;
const N = 36;
const STEP = W / (N - 1);
const TICK_MS = 1100;

const TILE =
  "relative overflow-hidden rounded-[22px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]";
const LABEL = "flex items-center gap-1.5 text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]";
const BIG = "font-semibold tabular-nums tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]";

/** Small deterministic PRNG so the first frame matches on server and client. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function seedSeries(base: number) {
  const r = rng(11);
  return Array.from({ length: N + 1 }, (_, i) => base + Math.sin(i / 2.6) * base * 0.16 + (r() - 0.5) * base * 0.16);
}

function yOf(v: number, base: number) {
  const lo = base * 0.45;
  const hi = base * 1.55;
  const k = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
  return r2(H - 12 - k * (H - 28));
}

function buildPath(s: number[], phase: number, base: number) {
  let d = "";
  for (let i = 0; i < s.length; i++) d += `${i ? "L" : "M"}${r2((i - phase) * STEP)},${yOf(s[i], base)}`;
  return d;
}

/** Value of the series at chart x, given the current scroll phase. */
function valueAt(s: number[], phase: number, x: number) {
  const f = Math.max(0, Math.min(s.length - 1.001, x / STEP + phase));
  const i = Math.floor(f);
  return s[i] + (s[i + 1] - s[i]) * (f - i);
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/**
 * A monitoring bento. The latency line scrolls live and a sprung cursor
 * rides it wherever you point, reading the value under it. Uptime bars spring
 * up and explain themselves on hover or with the arrow keys, the request
 * counter rolls up in view and keeps ticking, and every region pings.
 */
export function BentoSignals({
  latency = 42,
  uptime = "99.98%",
  days = DAYS,
  requests = 12_480_331,
  regions = REGIONS,
  live = true,
  autoplay = false,
  className = "",
}: BentoSignalsProps) {
  const reduce = useReducedMotion() === true;
  const running = live && !reduce;
  const base = Math.max(1, latency);
  const rootRef = useRef<HTMLElement>(null);
  const inView = useInView(rootRef, { once: true, margin: "-40px" });

  // Chart state lives in refs and is drawn straight into the SVG: no React render per frame.
  const series = useRef<number[] | null>(null);
  const phase = useRef(0);
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const ruleRef = useRef<SVGLineElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const hovering = useRef(false);

  const now = useMotionValue(Math.round(seedSeries(base)[N - 2]));
  const nowText = useTransform(now, (v) => String(Math.round(v)));
  const cursorX = useMotionValue(W * 0.6);
  const cursorSpring = useSpring(cursorX, { stiffness: 420, damping: 34 });
  const cursorOn = useMotionValue(0);
  const cursorOpacity = useSpring(cursorOn, { stiffness: 300, damping: 30 });
  const readout = useMotionValue(0);
  const readoutText = useTransform(readout, (v) => `${Math.round(v)} ms`);
  const readoutLeft = useTransform(cursorSpring, (x) => `${Math.max(9, Math.min(91, (x / W) * 100))}%`);
  const readoutY = useMotionValue(H / 2);
  const readoutTop = useTransform(readoutY, (y) => `${Math.max(-10, r2(y - 32))}px`);
  const firstSeries = seedSeries(base);
  const firstD = buildPath(firstSeries, 0, base);

  useEffect(() => {
    series.current = seedSeries(base);
    phase.current = 0;
    let raf = 0;
    let last = performance.now();
    const r = rng(base * 7 + 3);
    const frame = (t: number) => {
      const s = series.current;
      if (!s) return;
      if (running) {
        phase.current += (t - last) / TICK_MS;
        while (phase.current >= 1) {
          phase.current -= 1;
          s.shift();
          const prev = s[s.length - 1];
          const target = base + Math.sin(t / 2600) * base * 0.16;
          s.push(prev + (target - prev) * 0.45 + (r() - 0.5) * base * 0.2);
        }
      }
      last = t;
      const p = phase.current;
      const d = buildPath(s, p, base);
      lineRef.current?.setAttribute("d", d);
      areaRef.current?.setAttribute("d", `${d} L${r2((s.length - 1 - p) * STEP)},${H} L${r2(-p * STEP)},${H} Z`);
      const headV = valueAt(s, p, W - 2);
      headRef.current?.setAttribute("cy", String(yOf(headV, base)));
      now.set(headV);
      const cx = cursorSpring.get();
      const cv = valueAt(s, p, cx);
      const cy = yOf(cv, base);
      dotRef.current?.setAttribute("cx", String(r2(cx)));
      dotRef.current?.setAttribute("cy", String(cy));
      ruleRef.current?.setAttribute("x1", String(r2(cx)));
      ruleRef.current?.setAttribute("x2", String(r2(cx)));
      readout.set(cv);
      readoutY.set(cy);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [base, running, now, cursorSpring, readout, readoutY]);

  // Autoplay: sweep the cursor across the chart until the first pointer or key.
  useEffect(() => {
    if (!autoplay || reduce) return;
    cursorOn.set(1);
    const run = animate(cursorX, [W * 0.18, W * 0.88], { duration: 3.4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" });
    const stop = setInterval(() => {
      if (touched.current) {
        run.stop();
        clearInterval(stop);
        if (!hovering.current) cursorOn.set(0);
      }
    }, 200);
    return () => {
      run.stop();
      clearInterval(stop);
    };
  }, [autoplay, reduce, cursorX, cursorOn]);

  const pointChart = (e: RPointerEvent) => {
    const el = chartRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    cursorX.stop();
    cursorX.set(Math.max(4, Math.min(W - 4, ((e.clientX - r.left) / r.width) * W)));
  };

  // Request counter: rolls up once in view, then ticks while live.
  const reqTarget = useMotionValue(0);
  const reqShown = useSpring(reqTarget, { stiffness: 50, damping: 20, restDelta: 0.5 });
  const reqText = useTransform(reqShown, (v) => Math.round(v).toLocaleString("en-US"));
  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      reqTarget.set(requests);
      reqShown.jump(requests);
      return;
    }
    reqTarget.set(requests);
    if (!live) return;
    const t = setInterval(() => reqTarget.set(reqTarget.get() + 40 + Math.floor(Math.random() * 90)), 1000);
    return () => clearInterval(t);
  }, [inView, requests, live, reduce, reqTarget, reqShown]);

  // Regions jitter a little every couple of seconds while live.
  const [jitter, setJitter] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setJitter((j) => j + 1), 2200);
    return () => clearInterval(t);
  }, [running]);
  const msOf = (r: SignalRegion, i: number) => Math.max(1, Math.round(r.ms + Math.sin(jitter * 1.7 + i * 2.1) * Math.max(1, r.ms * 0.08)));
  const maxMs = Math.max(1, ...regions.map((r) => r.ms * 1.12));
  const healthy = regions.filter((r) => r.status !== "degraded").length;

  // Uptime bars: hover or arrow keys pick a day.
  const [day, setDay] = useState<number | null>(null);
  const counts = { ok: 0, degraded: 0, down: 0 };
  days.forEach((d) => counts[d]++);
  const dayLabel = (i: number) => (i === days.length - 1 ? "Today" : `${days.length - 1 - i} days ago`);
  const dayText = (d: SignalDay) => (d === "ok" ? "Operational" : d === "degraded" ? "Degraded" : "Outage");
  const dayKey = (e: KeyboardEvent) => {
    const cur = day ?? days.length - 1;
    let to: number | null = null;
    if (e.key === "ArrowRight") to = Math.min(days.length - 1, cur + 1);
    if (e.key === "ArrowLeft") to = Math.max(0, cur - 1);
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = days.length - 1;
    if (to === null) return;
    e.preventDefault();
    setDay(to);
  };

  const enter = (i: number) =>
    reduce
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 18, scale: 0.97 },
          animate: inView ? { opacity: 1, y: 0, scale: 1 } : undefined,
          transition: { type: "spring" as const, stiffness: 260, damping: 22, delay: i * 0.07 },
        };

  return (
    <section
      ref={rootRef}
      aria-label="Service health"
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container w-full text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}
    >
      <div className="grid w-full grid-cols-1 gap-3 @min-[540px]:grid-cols-3">
        {/* Latency */}
        <motion.div {...enter(0)} className={`${TILE} @min-[540px]:col-span-2`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={LABEL}>
                <Icon d="M1.5 8.5h3l2-5 3 9 2-4h3" /> API latency · p50
              </p>
              <p className={`mt-1 text-[36px] leading-none ${BIG}`}>
                <motion.span>{nowText}</motion.span>
                <span className="ml-1 text-[15px] font-medium tracking-normal text-[#6e6e73] dark:text-[#a1a1a6]">ms</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#30d158]/12 px-2.5 py-1 text-[11px] font-semibold text-[#1a7f37] dark:text-[#30d158]">
              <span className="relative flex size-1.5">
                {running ? (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#30d158]"
                    animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
                <span className="relative size-1.5 rounded-full bg-[#30d158]" />
              </span>
              {running ? "Live" : "Paused"}
            </span>
          </div>
          <div
            ref={chartRef}
            className="relative mt-3 h-[120px] touch-none"
            onPointerEnter={(e) => {
              touched.current = true;
              hovering.current = true;
              cursorOn.set(1);
              pointChart(e);
            }}
            onPointerMove={pointChart}
            onPointerLeave={() => {
              hovering.current = false;
              cursorOn.set(0);
            }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
              <defs>
                <linearGradient id="bento-signal-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0071e3" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#0071e3" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((f) => (
                <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} className="stroke-[#f0f0f3] dark:stroke-[#2c2c2e]" vectorEffect="non-scaling-stroke" />
              ))}
              <path ref={areaRef} d={`${firstD} L${r2(N * STEP)},${H} L0,${H} Z`} fill="url(#bento-signal-fill)" />
              <path ref={lineRef} d={firstD} fill="none" className="stroke-[#0071e3] dark:stroke-[#0a84ff]" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <circle ref={headRef} cx={W - 2} cy={yOf(valueAt(firstSeries, 0, W - 2), base)} r="3" className="fill-[#0071e3] dark:fill-[#0a84ff]" />
              <motion.g style={{ opacity: cursorOpacity }}>
                <line ref={ruleRef} y1="0" y2={H} className="stroke-[#1d1d1f]/20 dark:stroke-white/25" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
                <circle ref={dotRef} r="4.5" className="fill-white stroke-[#0071e3] dark:fill-[#1c1c1e] dark:stroke-[#0a84ff]" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              </motion.g>
            </svg>
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full bg-[#1d1d1f] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white shadow-[0_6px_14px_-6px_rgba(0,0,0,.5)] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
              style={{ left: readoutLeft, top: readoutTop, x: "-50%", opacity: cursorOpacity }}
            >
              {readoutText}
            </motion.span>
          </div>
          <p className="mt-2 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">Point at the chart to read any moment.</p>
        </motion.div>

        {/* Uptime */}
        <motion.div {...enter(1)} className={TILE}>
          <p className={LABEL}>
            <Icon d="M8 1.5l5.5 2v4c0 3.5-2.4 6-5.5 7-3.1-1-5.5-3.5-5.5-7v-4zM5.5 8l2 2 3-3.5" /> Uptime · {days.length} days
          </p>
          <p className={`mt-1 text-[28px] leading-tight ${BIG}`}>{uptime}</p>
          <div
            role="img"
            tabIndex={0}
            aria-label={`${days.length} day history: ${counts.ok} operational, ${counts.degraded} degraded, ${counts.down} with an outage. Use arrow keys to inspect a day.`}
            onKeyDown={dayKey}
            onBlur={() => setDay(null)}
            onPointerLeave={() => setDay(null)}
            className="mt-4 flex h-11 items-end gap-[1.5px] rounded-[6px] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
          >
            {days.map((d, i) => (
              <motion.span
                key={i}
                onPointerEnter={() => setDay(i)}
                className={`h-full flex-1 origin-bottom rounded-[3px] ${d === "ok" ? "bg-[#30d158]" : d === "degraded" ? "bg-[#ff9f0a]" : "bg-[#ff3b30]"}`}
                initial={reduce ? false : { scaleY: 0 }}
                animate={inView ? { scaleY: day === i ? 1.18 : d === "ok" ? 1 : d === "degraded" ? 0.72 : 0.5, opacity: day === null || day === i ? 1 : 0.45 } : undefined}
                transition={{ type: "spring", stiffness: 420, damping: 18, delay: day === null ? i * 0.012 : 0 }}
              />
            ))}
          </div>
          <div className="mt-2 flex h-4 justify-between text-[11px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-live="polite">
            {day === null ? (
              <>
                <span>{days.length - 1}d ago</span>
                <span>Today</span>
              </>
            ) : (
              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                {dayLabel(day)} · {dayText(days[day])}
              </span>
            )}
          </div>
        </motion.div>

        {/* Requests */}
        <motion.div {...enter(2)} className={`${TILE} flex flex-col`}>
          <p className={LABEL}>
            <Icon d="M9 1.5L3 9h4.5L7 14.5 13 7H8.5z" /> Requests served
          </p>
          <p className={`mt-1 text-[28px] leading-tight ${BIG}`}>
            <motion.span>{reqText}</motion.span>
          </p>
          <p className="mt-1 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
            <span className="font-semibold text-[#1a7f37] dark:text-[#30d158]">+18%</span> vs last month
          </p>
          <div className="mt-auto flex h-14 items-end gap-1 pt-4" aria-hidden="true">
            {BARS.map((v, i) => (
              <motion.span
                key={i}
                initial={reduce ? false : { scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : undefined}
                transition={{ delay: 0.25 + i * 0.035, type: "spring", stiffness: 300, damping: 14 }}
                style={{ height: `${v}%` }}
                className={`flex-1 origin-bottom rounded-[4px] ${i === BARS.length - 1 ? "bg-[#0071e3] dark:bg-[#0a84ff]" : "bg-[#0071e3]/15 dark:bg-[#0a84ff]/25"}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Regions */}
        <motion.div {...enter(3)} className={`${TILE} @min-[540px]:col-span-2`}>
          <div className="flex items-center justify-between">
            <p className={LABEL}>
              <Icon d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM1.5 8h13M8 1.5c2 2 2.6 4 2.6 6.5S10 12.5 8 14.5C6 12.5 5.4 10.5 5.4 8S6 3.5 8 1.5z" /> Edge regions
            </p>
            <p className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{healthy}</span>/{regions.length} healthy
            </p>
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-2 @min-[360px]:grid-cols-2">
            {regions.map((r, i) => {
              const slow = r.status === "degraded";
              const ms = msOf(r, i);
              const color = slow ? "#ff9f0a" : "#30d158";
              return (
                <li key={r.name} className="rounded-[14px] bg-[#f5f5f7] px-3 py-2.5 dark:bg-[#2c2c2e]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-[13px] font-medium">
                      <span className="relative flex size-2 shrink-0">
                        {running ? (
                          <motion.span
                            className="absolute inset-0 rounded-full"
                            style={{ background: color }}
                            animate={{ scale: [1, 2.8], opacity: [0.55, 0] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: i * 0.35 }}
                          />
                        ) : null}
                        <span className="relative size-2 rounded-full" style={{ background: color }} />
                      </span>
                      <span className="truncate">{r.name}</span>
                    </span>
                    <span className="text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">{ms} ms</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={reduce ? false : { width: 0 }}
                      animate={inView ? { width: `${Math.min(100, (ms / maxMs) * 100)}%` } : undefined}
                      transition={{ type: "spring", stiffness: 120, damping: 16, delay: jitter === 0 ? 0.3 + i * 0.07 : 0 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
