"use client";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";

export type StockLineTheme = "auto" | "light" | "dark";
export type StockLineRange = "1D" | "1W" | "1M" | "1Y";

export interface StockLineProps {
  /** "auto" follows the page (`.dark` on an ancestor); "light" or "dark" pins the card's palette. */
  theme?: StockLineTheme;
  /** Ticker shown in the top-left corner and read out in the chart's label. */
  symbol?: string;
  /** Draw the line as smooth cubic curves instead of straight segments. */
  smooth?: boolean;
  /** Fade a gradient area under the line. */
  fill?: boolean;
  /** Line, dot and change colour while the price is at or above the range's open. */
  up?: string;
  /** Line, dot and change colour while the price is below the range's open. */
  down?: string;
  /** Cycles through the ranges and sweeps the dot along each one until someone interacts. */
  autoplay?: boolean;
}

/**
 * Palette as CSS variables so SVG fills and inline styles can follow the theme.
 * Written out in full so Tailwind sees every class.
 */
const THEME_VARS: Record<StockLineTheme, string> = {
  light:
    "[--sl-card:#ffffff] [--sl-text:#1d1d1f] [--sl-sub:#6e6e73] [--sl-grid:#ececf0] [--sl-seg:#f0f0f3] [--sl-seg-on:#ffffff] [--sl-edge:0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]",
  dark:
    "[--sl-card:#1c1c1e] [--sl-text:#f5f5f7] [--sl-sub:#98989d] [--sl-grid:#2c2c2e] [--sl-seg:#2c2c2e] [--sl-seg-on:#48484a] [--sl-edge:0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
  auto:
    "[--sl-card:#ffffff] [--sl-text:#1d1d1f] [--sl-sub:#6e6e73] [--sl-grid:#ececf0] [--sl-seg:#f0f0f3] [--sl-seg-on:#ffffff] [--sl-edge:0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:[--sl-card:#1c1c1e] dark:[--sl-text:#f5f5f7] dark:[--sl-sub:#98989d] dark:[--sl-grid:#2c2c2e] dark:[--sl-seg:#2c2c2e] dark:[--sl-seg-on:#48484a] dark:[--sl-edge:0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
};

const RANGES: readonly StockLineRange[] = ["1D", "1W", "1M", "1Y"];
const N = 64, W = 340, H = 140, PAD = 8;

const lcg = (s: number) => (s * 9301 + 49297) % 233280;

/** Seeded random walk from `start` that is pulled onto `end` by the last point. */
function walk(seed: number, start: number, end: number, vol: number) {
  let s = seed;
  const r = () => (s = lcg(s)) / 233280;
  const pts: number[] = [];
  let v = start;
  for (let i = 0; i < N; i++) {
    const pull = (end - v) / Math.max(1, N - i);
    v += pull + (r() - 0.5) * vol;
    pts.push(v);
  }
  pts[N - 1] = end;
  return pts;
}
const SERIES: Record<StockLineRange, { pts: number[]; labels: (i: number) => string }> = {
  "1D": {
    pts: walk(3, 57420, 58708.83, 260),
    labels: (i) => {
      const m = 9 * 60 + 30 + Math.round((i / (N - 1)) * 390);
      return `${Math.floor(m / 60) % 12 || 12}:${String(m % 60).padStart(2, "0")} ${m >= 720 ? "PM" : "AM"}`;
    },
  },
  "1W": { pts: walk(8, 55980, 58708.83, 520), labels: (i) => ["Mon", "Tue", "Wed", "Thu", "Fri"][Math.min(4, Math.floor((i / N) * 5))] },
  "1M": {
    pts: walk(21, 60210, 58708.83, 900),
    labels: (i) => new Date(2026, 8, 19 + Math.round((i / (N - 1)) * 30)).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
  "1Y": {
    pts: walk(42, 41250, 58708.83, 1900),
    labels: (i) => new Date(2025, 9 + Math.round((i / (N - 1)) * 12), 1).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
  },
};

/** Map prices to 0 (top, highest) .. 1 (bottom, lowest). */
const norm = (pts: number[]) => {
  const lo = Math.min(...pts), hi = Math.max(...pts);
  return pts.map((p) => (hi - p) / (hi - lo || 1));
};
const toXY = (n: number[]) => n.map((v, i) => [(i / (N - 1)) * W, PAD + v * (H - PAD * 2)] as const);
function pathOf(xy: readonly (readonly [number, number])[], smooth: boolean) {
  if (!smooth) return xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  let d = `M${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1], [x1, y1] = xy[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx.toFixed(2)} ${y0.toFixed(2)} ${cx.toFixed(2)} ${y1.toFixed(2)} ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  return d;
}
const money = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** One digit column that rolls to its value. */
function Digit({ d }: { d: number }) {
  const y = useSpring(-d * 10, { stiffness: 260, damping: 28 });
  useEffect(() => {
    y.set(-d * 10);
  }, [d, y]);
  const ty = useTransform(y, (v) => `${v}%`);
  return (
    <span className="relative inline-block h-[1em] overflow-hidden leading-none">
      <span className="invisible">0</span>
      <motion.span className="absolute left-0 top-0 flex flex-col" style={{ y: ty }}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[1em] leading-none">{i}</span>
        ))}
      </motion.span>
    </span>
  );
}

/** A number whose digits roll independently; keyed from the right so columns stay put as width changes. */
function Rolling({ text }: { text: string }) {
  const chars = text.split("");
  return (
    <span className="inline-flex tabular-nums" aria-hidden="true">
      {chars.map((c, i) => {
        const key = chars.length - i;
        return /\d/.test(c) ? <Digit key={key} d={+c} /> : <span key={`s${key}`} className="leading-none">{c}</span>;
      })}
    </span>
  );
}

/**
 * A price chart in the style of a trading app. Run along it and a dot rides
 * the line while the price rolls digit by digit and the change turns green or
 * red. Switching range morphs the line from one shape into the next instead of
 * redrawing it, and on 1D the last point keeps ticking live.
 */
export function StockLine({
  theme = "auto",
  symbol = "NXUS",
  smooth = true,
  fill = true,
  up = "#30d158",
  down = "#ff453a",
  autoplay = false,
}: StockLineProps) {
  const gid = `sl-${useId().replace(/[^a-z0-9]/gi, "")}`;
  const [range, setRange] = useState<StockLineRange>("1D");
  const [idx, setIdx] = useState<number | null>(null);
  const [liveDelta, setLiveDelta] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const touched = useRef(false);
  const plot = useRef<HTMLDivElement>(null);

  // Morph: remember the shape we came from and tween a 0..1 progress.
  const from = useRef<number[]>(norm(SERIES["1D"].pts));
  const to = useRef<number[]>(norm(SERIES["1D"].pts));
  const prog = useMotionValue(1);
  const live = useMotionValue(0);
  const shown = useRef<number[]>(norm(SERIES["1D"].pts));
  const rangeRef = useRef<StockLineRange>("1D");
  const smoothRef = useRef(smooth);
  const go = useCallback(
    (r: StockLineRange) => {
      if (r === rangeRef.current) return;
      rangeRef.current = r;
      setLiveDelta(0);
      animate(live, 0, { duration: 0.3 });
      const p = prog.get();
      from.current = from.current.map((a, i) => a + (to.current[i] - a) * p);
      to.current = norm(SERIES[r].pts);
      prog.set(0);
      animate(prog, 1, { type: "spring", stiffness: 120, damping: 20 });
      setRange(r);
      setIdx(null);
    },
    [live, prog],
  );
  const line = useTransform([prog, live] as MotionValue<number>[], ([p, l]: number[]) => {
    const n = from.current.map((a, i) => a + (to.current[i] - a) * p);
    n[N - 1] = Math.max(0, Math.min(1, n[N - 1] + l));
    shown.current = n;
    return pathOf(toXY(n), smoothRef.current);
  });
  // Redraw when the curve style changes (nudging `live` re-runs the transform).
  useEffect(() => {
    smoothRef.current = smooth;
    live.set(live.get() + 1e-9);
  }, [smooth, live]);
  const area = useTransform(line, (d) => `${d} L${W} ${H} L0 ${H} Z`);

  const pts = SERIES[range].pts;
  const last = pts[N - 1] + (range === "1D" ? liveDelta : 0);
  const price = idx === null ? last : pts[idx];
  const change = price - pts[0];
  const pct = (change / pts[0]) * 100;
  const color = change >= 0 ? up : down;
  const [whole, cents] = money(price).split(".");

  // Dot rides the displayed line, so it follows the morph too.
  const dotX = useMotionValue(W), dotY = useMotionValue(H / 2);
  const sx = useSpring(dotX, { stiffness: 600, damping: 40 }), sy = useSpring(dotY, { stiffness: 600, damping: 40 });
  const place = useCallback(
    (i: number) => {
      const [x, y] = toXY(shown.current)[i];
      dotX.set(x);
      dotY.set(y);
    },
    [dotX, dotY],
  );
  useMotionValueEvent(line, "change", () => place(idx ?? N - 1));
  useEffect(() => {
    place(idx ?? N - 1);
  }, [idx, place]);

  const engage = () => {
    touched.current = true;
    setEngaged(true);
  };

  const pick = (e: RPointerEvent) => {
    engage();
    const el = plot.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setIdx(Math.max(0, Math.min(N - 1, Math.round(((e.clientX - r.left) / r.width) * (N - 1)))));
  };

  const onKey = (e: RKeyboardEvent) => {
    const step = e.shiftKey ? 8 : 1;
    let next: number | null | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = idx === null ? 0 : Math.min(N - 1, idx + step);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = idx === null ? N - 1 : Math.max(0, idx - step);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = N - 1;
    else if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    engage();
    setIdx(next);
  };

  // On 1D the last price ticks every 1.4s (seeded, so every render agrees).
  const tickSeed = useRef(7);
  useEffect(() => {
    const id = setInterval(() => {
      if (range !== "1D") return;
      tickSeed.current = lcg(tickSeed.current);
      const d = (tickSeed.current / 233280 - 0.45) * 120;
      setLiveDelta(d);
      const lo = Math.min(...pts), hi = Math.max(...pts);
      animate(live, -d / (hi - lo || 1), { type: "spring", stiffness: 200, damping: 18 });
    }, 1400);
    return () => clearInterval(id);
  }, [range, pts, live]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    let sweep: ReturnType<typeof setInterval> | undefined;
    let wait: ReturnType<typeof setTimeout> | undefined;
    const id = setInterval(() => {
      if (touched.current) {
        clearInterval(id);
        if (sweep) clearInterval(sweep);
        return;
      }
      go(RANGES[++k % RANGES.length]);
      let i = 0;
      if (sweep) clearInterval(sweep);
      if (wait) clearTimeout(wait);
      wait = setTimeout(() => {
        sweep = setInterval(() => {
          if (touched.current || i >= N) {
            clearInterval(sweep);
            setIdx(null);
            return;
          }
          setIdx(i);
          i += 2;
        }, 40);
      }, 900);
    }, 4200);
    return () => {
      clearInterval(id);
      if (sweep) clearInterval(sweep);
      if (wait) clearTimeout(wait);
    };
  }, [autoplay, go]);

  const sign = change >= 0 ? "+" : "−";
  const when = idx === null ? (range === "1D" ? "Today" : `Past ${range}`) : SERIES[range].labels(idx);
  const lo = Math.min(...pts), hi = Math.max(...pts);
  const announce = engaged && idx !== null ? `${when}: $${money(price)}, ${sign}${money(Math.abs(change))} (${sign}${Math.abs(pct).toFixed(2)}%)` : "";

  return (
    <div
      className={`w-[380px] max-w-full rounded-[24px] p-5 transition-colors duration-300 ${THEME_VARS[theme]}`}
      style={{ background: "var(--sl-card)", boxShadow: "var(--sl-edge)" }}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold" style={{ color: "var(--sl-sub)" }}>{symbol}</span>
        {range === "1D" && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--sl-sub)" }}>
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: up }}
                animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="relative h-2 w-2 rounded-full" style={{ background: up }} />
            </span>
            Live
          </span>
        )}
      </div>
      <div className="mt-1 flex items-baseline text-[34px] font-semibold tracking-[-0.035em]" style={{ color: "var(--sl-text)" }}>
        <span className="sr-only">${money(price)}</span>
        <span aria-hidden="true">$</span>
        <Rolling text={whole} />
        <span className="text-[20px]" style={{ color: "var(--sl-sub)" }} aria-hidden="true">
          .<Rolling text={cents} />
        </span>
      </div>
      <motion.div className="text-[13px] font-medium tabular-nums" animate={{ color }} transition={{ duration: 0.25 }}>
        {sign}
        {money(Math.abs(change))} ({sign}
        {Math.abs(pct).toFixed(2)}%)
        <span className="ml-2 font-normal" style={{ color: "var(--sl-sub)" }}>{when}</span>
      </motion.div>

      <div
        ref={plot}
        tabIndex={0}
        role="group"
        aria-roledescription="chart"
        aria-label={`${symbol} price over ${range}: ${money(pts[0])} to ${money(last)}, low ${money(lo)}, high ${money(hi)}. Use the arrow keys to scrub.`}
        className="relative mt-4 cursor-crosshair touch-none select-none rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--sl-card)] dark:focus-visible:ring-[#0a84ff]"
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setIdx(null)}
        onKeyDown={onKey}
        onBlur={() => setIdx(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity=".28" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" x2={W} y1={toXY(norm(pts))[0][1]} y2={toXY(norm(pts))[0][1]} style={{ stroke: "var(--sl-grid)" }} strokeDasharray="2 4" />
          {fill && <motion.path d={area} fill={`url(#${gid})`} style={{ transition: "fill .25s" }} />}
          <motion.path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .25s" }} />
          {idx !== null && <motion.line x1={sx} x2={sx} y1={0} y2={H} style={{ stroke: "var(--sl-sub)" }} strokeOpacity=".5" strokeDasharray="3 3" />}
          <motion.circle cx={sx} cy={sy} r="9" fill={color} opacity=".18" />
          <motion.circle cx={sx} cy={sy} r="4.5" style={{ fill: "var(--sl-card)" }} stroke={color} strokeWidth="2.2" />
        </svg>
      </div>
      <div className="sr-only" aria-live="polite">{announce}</div>

      <div role="tablist" aria-label="Range" className="mt-4 flex justify-between rounded-full p-[3px]" style={{ background: "var(--sl-seg)" }}>
        {RANGES.map((r) => (
          <button
            key={r}
            role="tab"
            type="button"
            aria-selected={range === r}
            onClick={() => {
              engage();
              go(r);
            }}
            className="relative h-7 flex-1 rounded-full text-[12px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
            style={{ color: range === r ? "var(--sl-text)" : "var(--sl-sub)" }}
          >
            {range === r && (
              <motion.span
                layoutId={`sl-seg-${gid}`}
                className="absolute inset-0 rounded-full shadow-[0_1px_3px_rgba(0,0,0,.15)]"
                style={{ background: "var(--sl-seg-on)" }}
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">{r}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
