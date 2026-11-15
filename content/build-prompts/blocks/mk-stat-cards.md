# Stat Cards

Add the "Stat Cards" section from Nexus UI to my project.

An analytics overview: four KPI tiles over a big chart. Switch between 7, 30 and 90 days and nothing is redrawn from scratch: every line bends on a spring into its new shape and every digit rolls. Pick a tile and a pane of glass slides to it while the chart turns into that metric. Point at the chart or a sparkline to scrub; the tile's number rolls with you.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { StatCards } from "@/components/blocks/motion-kit/stat-cards";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/blocks/motion-kit/stat-cards/index.ts ---

```ts
export { default as StatCards } from "./stat-cards";
export type { StatCardsProps } from "./stat-cards";
```

--- components/blocks/motion-kit/stat-cards/stat-cards.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import {
  AnimatePresence,
  type MotionValue,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type ReactNode,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type StatFormat = "money" | "money2" | "count" | "percent";
export type StatMetric = {
  id: string;
  label: string;
  /** one of the built-in glyphs */
  icon?: "money" | "users" | "funnel" | "bag";
  color: string;
  /** how a day's values add up over a period: summed (revenue) or averaged (a rate) */
  kind: "sum" | "avg";
  format: StatFormat;
  /** daily values, oldest first; at least twice the longest period, so there's a previous period to compare with */
  series: number[];
  /** true when going down is good (refunds, churn) */
  invert?: boolean;
};

export type StatCardsProps = {
  title?: string;
  subtitle?: string;
  metrics?: StatMetric[];
  /** the date of the last value in each series */
  endDate?: Date;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const I = {
  money:
    "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m12 152h-4v8a8 8 0 0 1-16 0v-8h-16a8 8 0 0 1 0-16h36a12 12 0 0 0 0-24h-24a28 28 0 0 1 0-56h4v-8a8 8 0 0 1 16 0v8h16a8 8 0 0 1 0 16h-36a12 12 0 0 0 0 24h24a28 28 0 0 1 0 56",
  users:
    "M64.12 147.8a4 4 0 0 1-4 4.2H16a8 8 0 0 1-7.8-6.17a8.35 8.35 0 0 1 1.62-6.93A67.8 67.8 0 0 1 37 117.51a40 40 0 1 1 66.46-35.8a3.94 3.94 0 0 1-2.27 4.18A64.08 64.08 0 0 0 64 144c0 1.28 0 2.54.12 3.8m182-8.91A67.76 67.76 0 0 0 219 117.51a40 40 0 1 0-66.46-35.8a3.94 3.94 0 0 0 2.27 4.18A64.08 64.08 0 0 1 192 144c0 1.28 0 2.54-.12 3.8a4 4 0 0 0 4 4.2H240a8 8 0 0 0 7.8-6.17a8.33 8.33 0 0 0-1.63-6.94Zm-89 43.18a48 48 0 1 0-58.37 0A72.13 72.13 0 0 0 65.07 212A8 8 0 0 0 72 224h112a8 8 0 0 0 6.93-12a72.15 72.15 0 0 0-33.74-29.93Z",
  funnel:
    "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-72 136h-32a8 8 0 0 1 0-16h32a8 8 0 0 1 0 16m32-40H80a8 8 0 0 1 0-16h96a8 8 0 0 1 0 16m32-40H48a8 8 0 0 1 0-16h160a8 8 0 0 1 0 16",
  bag: "M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-88 120a48.05 48.05 0 0 1-48-48a8 8 0 0 1 16 0a32 32 0 0 0 64 0a8 8 0 0 1 16 0a48.05 48.05 0 0 1-48 48M40 72V56h176v16Z",
  up: "M204 64v104a12 12 0 0 1-24 0V93L72.49 200.49a12 12 0 0 1-17-17L163 76H88a12 12 0 0 1 0-24h104a12 12 0 0 1 12 12",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const PERIODS = [7, 30, 90] as const;
const N = 120; // points along every drawn line, whatever the period, so one line can morph into another
const VB_W = 1000;
const VB_H = 300;
const TOP = 18;
const BOT = 6;

// ---------------------------------------------------------------- demo data

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeSeries(seed: number, days: number, f: (i: number, r: () => number, dow: number) => number) {
  const r = rng(seed);
  const out: number[] = [];
  for (let i = 0; i < days; i++) out.push(f(i, r, (i + 3) % 7));
  return out;
}
const DAYS = 180;
const DEFAULT_METRICS: StatMetric[] = [
  {
    id: "revenue",
    label: "Revenue",
    icon: "money",
    color: "#0071e3",
    kind: "sum",
    format: "money",
    series: makeSeries(
      7,
      DAYS,
      (i, r, dow) =>
        3050 * (1 + i * 0.0016) * (dow >= 5 ? 1.1 : 1) * (1 + Math.sin(i / 9) * 0.07) * (0.93 + r() * 0.14),
    ),
  },
  {
    id: "users",
    label: "Active users",
    icon: "users",
    color: "#bf5af2",
    kind: "avg",
    format: "count",
    series: makeSeries(
      11,
      DAYS,
      (i, r, dow) =>
        9200 * (1 + i * 0.0009) * (dow >= 5 ? 0.86 : 1) * (1 + Math.sin(i / 13) * 0.04) * (0.95 + r() * 0.1),
    ),
  },
  {
    id: "conversion",
    label: "Conversion",
    icon: "funnel",
    color: "#30d158",
    kind: "avg",
    format: "percent",
    series: makeSeries(
      23,
      DAYS,
      (i, r) => 3.05 + Math.sin(i / 11) * 0.22 + (i > 150 ? (i - 150) * 0.012 : 0) + (r() - 0.5) * 0.36,
    ),
  },
  {
    id: "order",
    label: "Avg. order",
    icon: "bag",
    color: "#ff9f0a",
    kind: "avg",
    format: "money2",
    series: makeSeries(
      31,
      DAYS,
      (i, r, dow) => 74 - i * 0.022 + (dow >= 5 ? 2.4 : 0) + Math.sin(i / 7) * 1.4 + (r() - 0.5) * 4.6,
    ),
  },
];

// ---------------------------------------------------------------- numbers

function fmt(v: number, f: StatFormat, day: boolean) {
  if (f === "percent") return `${v.toFixed(2)}%`;
  if (f === "money2") return `$${v.toFixed(2)}`;
  if (day) return (f === "money" ? "$" : "") + Math.round(v).toLocaleString("en-US");
  const pre = f === "money" ? "$" : "";
  if (Math.abs(v) >= 1e6) return `${pre}${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `${pre}${(v / 1e3).toFixed(1)}k`;
  return `${pre}${Math.round(v)}`;
}
function axisFmt(v: number, f: StatFormat) {
  if (f === "percent") return `${v.toFixed(1)}%`;
  if (f === "money2") return `$${Math.round(v)}`;
  const pre = f === "money" ? "$" : "";
  if (Math.abs(v) >= 1e3) return `${pre}${(v / 1e3).toFixed(1)}k`;
  return `${pre}${Math.round(v)}`;
}
const agg = (xs: number[], kind: "sum" | "avg") => {
  const s = xs.reduce((a, b) => a + b, 0);
  return kind === "sum" ? s : s / Math.max(1, xs.length);
};
const dayOf = (end: Date, back: number) => new Date(end.getFullYear(), end.getMonth(), end.getDate() - back);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const short = (d: Date) => `${MON[d.getMonth()]} ${d.getDate()}`;
const longDay = (d: Date) => `${WD[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;

/** a smooth curve through the values, sampled at N evenly spaced points (Catmull-Rom), normalised against lo..hi */
function resample(vals: number[], lo: number, hi: number) {
  const n = vals.length;
  const out = new Array<number>(N);
  const span = hi - lo || 1;
  for (let k = 0; k < N; k++) {
    const x = (k / (N - 1)) * (n - 1);
    const i = Math.min(n - 2, Math.floor(x));
    const t = x - i;
    const p0 = vals[Math.max(0, i - 1)];
    const p1 = vals[i];
    const p2 = vals[i + 1];
    const p3 = vals[Math.min(n - 1, i + 2)];
    const t2 = t * t;
    const t3 = t2 * t;
    const v =
      0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
    out[k] = (v - lo) / span;
  }
  return out;
}
const range = (xs: number[], pad = 0.14) => {
  let lo = Infinity;
  let hi = -Infinity;
  for (const x of xs) {
    lo = Math.min(lo, x);
    hi = Math.max(hi, x);
  }
  const p = (hi - lo || Math.abs(hi) || 1) * pad;
  return [lo - p, hi + p] as const;
};
const yAt = (ys: number[], f: number) => {
  const x = Math.max(0, Math.min(1, f)) * (N - 1);
  const i = Math.min(N - 2, Math.floor(x));
  return ys[i] + (ys[i + 1] - ys[i]) * (x - i);
};
const py = (y: number, h = VB_H, top = TOP, bot = BOT) => top + (1 - y) * (h - top - bot);
function linePath(ys: number[], h = VB_H, top = TOP, bot = BOT) {
  let d = "";
  for (let k = 0; k < N; k++)
    d += `${k ? "L" : "M"}${((k / (N - 1)) * VB_W).toFixed(1)} ${py(ys[k], h, top, bot).toFixed(1)}`;
  return d;
}
const areaPath = (ys: number[], h = VB_H, top = TOP, bot = BOT) => `${linePath(ys, h, top, bot)}L${VB_W} ${h}L0 ${h}Z`;

/** walks a drawn line from wherever it is now to a new shape, on a spring, calling draw on every frame */
function useMorph(target: number[], draw: (ys: number[]) => void, reduce: boolean) {
  const cur = useRef<number[] | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useLayoutEffect(() => {
    const from = cur.current;
    if (!from || reduce) {
      cur.current = target.slice();
      drawRef.current(cur.current);
      return;
    }
    const start = from.slice();
    const ys = start.slice();
    cur.current = ys;
    const a = animate(0, 1, {
      type: "spring",
      stiffness: 140,
      damping: 19,
      onUpdate: (t) => {
        for (let k = 0; k < N; k++) ys[k] = start[k] + (target[k] - start[k]) * t;
        drawRef.current(ys);
      },
    });
    return () => a.stop();
  }, [target, reduce]);
  return cur;
}

const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * An analytics overview: four KPI tiles over a big chart.
 *
 * Each tile has its number, how it moved against the period before, and a sparkline that draws itself in. Switch
 * between 7, 30 and 90 days and nothing is redrawn from scratch: every line bends on a spring into its new shape and
 * every digit rolls to its new value. Pick a tile and a pane of glass slides over to it while the big chart turns into
 * that metric, its colour washing across. Point at the big chart (or a sparkline) to scrub: a crosshair rides the
 * line, a label follows it with the day and its value, and the tile's number rolls along with you. The dashed line
 * is the period before. Arrow keys scrub the chart when it has focus.
 *   <StatCards title="Overview" metrics={metrics} />
 */
export default function StatCards({
  title = "Overview",
  subtitle = "Northwind Store",
  metrics = DEFAULT_METRICS,
  endDate,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: StatCardsProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const seen = useInView(rootRef, { once: true, amount: 0.25 });
  const touched = useRef(false);
  const [end] = useState(() => endDate ?? dayOf(new Date(), 1));
  const [period, setPeriod] = useState<number>(30);
  const [sel, setSel] = useState(0);
  const [scrub, setScrub] = useState<{
    m: number;
    i: number;
    from: "chart" | "tile";
  } | null>(null);
  const [w, setW] = useState(900);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // the outer width: the padding changes with it, so measuring inside it would flip back and forth
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w < 640;
  const tiny = w < 400;

  // every number the block shows, for the chosen period
  const stats = useMemo(
    () =>
      metrics.map((m) => {
        const s = m.series;
        const cur = s.slice(s.length - period);
        const prev = s.slice(Math.max(0, s.length - period * 2), s.length - period);
        const v = agg(cur, m.kind);
        const pv = prev.length ? agg(prev, m.kind) : v;
        const [lo, hi] = range(cur, 0.1);
        const [blo, bhi] = range(prev.length === cur.length ? [...cur, ...prev] : cur, 0.14);
        return {
          cur,
          prev,
          value: v,
          delta: pv ? (v - pv) / Math.abs(pv) : 0,
          spark: resample(cur, lo, hi),
          big: resample(cur, blo, bhi),
          bigPrev: prev.length === cur.length ? resample(prev, blo, bhi) : null,
          lo: blo,
          hi: bhi,
        };
      }),
    [metrics, period],
  );
  const S = stats[sel];
  const M = metrics[sel];

  const touch = () => {
    touched.current = true;
  };
  const pick = (i: number) => {
    if (i === sel) return;
    setSel(i);
    setScrub(null);
    sfx.note(520 + i * 70, { dur: 0.22, gain: 0.07, bell: 0.4 });
  };
  const choosePeriod = (p: number) => {
    if (p === period) return;
    setPeriod(p);
    setScrub(null);
    sfx.whoosh(500, 1500, { dur: 0.35, gain: 0.05 });
    sfx.note(p === 7 ? 740 : p === 30 ? 660 : 587, {
      dur: 0.3,
      gain: 0.06,
      at: 0.05,
    });
  };

  // ------------------------------------------------------------ the big chart
  const lineRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const prevRef = useRef<SVGPathElement>(null);
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
  const tipX = useSpring(0, { stiffness: 700, damping: 50 });
  const scrubF = useRef<number | null>(null);
  const placeDot = (ys: number[]) => {
    const f = scrubF.current;
    if (f == null) return;
    dotX.set(f);
    dotY.set(py(yAt(ys, f)) / VB_H);
  };
  const bigCur = useMorph(
    S.big,
    (ys) => {
      const l = linePath(ys);
      lineRef.current?.setAttribute("d", l);
      glowRef.current?.setAttribute("d", l);
      areaRef.current?.setAttribute("d", areaPath(ys));
      placeDot(ys);
    },
    reduce,
  );
  const flat = useMemo(() => new Array<number>(N).fill(0.5), []);
  useMorph(S.bigPrev ?? flat, (ys) => prevRef.current?.setAttribute("d", linePath(ys)), reduce);

  const chartScrubAt = (f: number, from: "chart" | "auto" = "chart") => {
    const n = S.cur.length;
    const i = Math.max(0, Math.min(n - 1, Math.round(f * (n - 1))));
    const snapF = i / (n - 1);
    scrubF.current = snapF;
    tipX.set(snapF);
    if (bigCur.current) placeDot(bigCur.current);
    setScrub((s) => {
      if (!s || s.i !== i || s.m !== sel) sfx.tick({ freq: 2600, gain: from === "auto" ? 0.025 : 0.035 });
      return { m: sel, i, from: "chart" };
    });
  };
  const endScrub = () => {
    scrubF.current = null;
    setScrub(null);
  };
  const chartRef = useRef<HTMLDivElement>(null);
  const onChartMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = chartRef.current?.getBoundingClientRect();
    if (!r) return;
    chartScrubAt((e.clientX - r.left) / r.width);
  };
  const onChartKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const n = S.cur.length;
    const i = scrub && scrub.from === "chart" ? scrub.i : n - 1;
    let j = i;
    if (e.key === "ArrowLeft") j = i - (e.shiftKey ? 7 : 1);
    else if (e.key === "ArrowRight") j = i + (e.shiftKey ? 7 : 1);
    else if (e.key === "Home") j = 0;
    else if (e.key === "End") j = n - 1;
    else if (e.key === "Escape") return endScrub();
    else return;
    e.preventDefault();
    touch();
    chartScrubAt(Math.max(0, Math.min(n - 1, j)) / (n - 1));
  };

  // ------------------------------------------------------------ autoplay
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let anim: { stop: () => void } | null = null;
    const at = (ms: number, f: () => void) => timers.push(setTimeout(() => alive && !touched.current && f(), ms));
    const sweep = (ms: number, a: number, b: number, dur: number) =>
      at(ms, () => {
        anim = animate(a, b, {
          duration: dur,
          ease: [0.45, 0, 0.25, 1],
          onUpdate: (f) => !touched.current && apRef.current.scrubAt(f),
        });
      });
    // the steps refer to the latest closures through a ref, so each one sees the current state
    const plan: [number, () => void][] = [
      [1400, () => apRef.current.period(90)],
      [3200, () => apRef.current.sweep()],
      [6400, () => apRef.current.end()],
      [7000, () => apRef.current.pick(1)],
      [8600, () => apRef.current.period(7)],
      [10200, () => apRef.current.pick(3)],
      [11800, () => apRef.current.period(30)],
      [13400, () => apRef.current.pick(2)],
      [15000, () => apRef.current.pick(0)],
    ];
    const loop = () => {
      for (const [ms, f] of plan) at(ms, f);
      at(16600, loop);
    };
    apRef.current.sweepRun = () => sweep(0, 0.12, 0.88, 2.8);
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      anim?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);
  const apRef = useRef({
    period: (_p: number) => {},
    pick: (_i: number) => {},
    sweep: () => {},
    end: () => {},
    sweepRun: () => {},
    scrubAt: (_f: number) => {},
  });
  apRef.current.scrubAt = (f) => chartScrubAt(f, "auto");
  apRef.current.period = choosePeriod;
  apRef.current.pick = pick;
  apRef.current.sweep = () => apRef.current.sweepRun();
  apRef.current.end = endScrub;

  // ------------------------------------------------------------ labels
  const n = S.cur.length;
  const scrubOnChart = scrub && scrub.from === "chart" && scrub.m === sel ? scrub.i : null;
  const scrubDate = scrubOnChart != null ? dayOf(end, n - 1 - scrubOnChart) : null;
  const xTicks = useMemo(() => {
    const k = period === 7 ? 7 : narrow ? 3 : 5;
    return Array.from({ length: k }, (_, j) => Math.round((j / (k - 1)) * (period - 1)));
  }, [period, narrow]);
  // the value at each gridline, read back from the normalisation the line was drawn with
  const yTicks = [0.2, 0.5, 0.8].map((f) => ({
    f,
    v: S.lo + f * (S.hi - S.lo),
  }));
  const prevLabel = `previous ${period} days`;

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={touch}
      onKeyDownCapture={touch}
      className={`relative w-full max-w-[980px] overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${narrow ? "p-4" : "p-6"} ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />

      <header className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`truncate font-semibold tracking-[-0.022em] ${narrow ? "text-[19px]" : "text-[22px]"}`}>
            {title}
          </h3>
          <p className="truncate text-[13px] text-[#6e6e73]">
            {subtitle}
            {!tiny && <span> · last {period} days</span>}
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Period"
          className="relative flex shrink-0 rounded-full bg-[#f2f2f4] p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,.06)]"
        >
          {PERIODS.map((p) => {
            const on = p === period;
            return (
              <button
                key={p}
                role="radio"
                aria-checked={on}
                tabIndex={on ? 0 : -1}
                onClick={() => choosePeriod(p)}
                onKeyDown={(e) => {
                  const k = PERIODS.indexOf(period as (typeof PERIODS)[number]);
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    choosePeriod(PERIODS[(k + 1) % 3]);
                    (e.currentTarget.parentElement?.children[(k + 1) % 3] as HTMLElement | undefined)?.focus();
                  } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    choosePeriod(PERIODS[(k + 2) % 3]);
                    (e.currentTarget.parentElement?.children[(k + 2) % 3] as HTMLElement | undefined)?.focus();
                  }
                }}
                className={`relative z-0 rounded-full px-3 py-[5px] text-[13px] font-medium tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${on ? "text-[#1d1d1f]" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
              >
                {on && (
                  <motion.span
                    layoutId={`${uid}-seg`}
                    className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_3px_8px_-2px_rgba(0,0,0,.12)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                  />
                )}
                {p}D
              </button>
            );
          })}
        </div>
      </header>

      {/* tiles */}
      <div className={`relative mt-5 grid gap-2 ${narrow ? "grid-cols-2" : "grid-cols-4"}`}>
        {metrics.map((m, i) => (
          <Tile
            key={m.id}
            m={m}
            st={stats[i]}
            on={i === sel}
            uid={uid}
            idx={i}
            seen={seen}
            reduce={reduce}
            narrow={narrow}
            tiny={tiny}
            period={period}
            end={end}
            scrubI={scrub && scrub.m === i ? scrub.i : null}
            onPick={() => {
              touch();
              pick(i);
            }}
            onScrub={(j) => {
              if (j == null) {
                if (scrub?.from === "tile" && scrub.m === i) setScrub(null);
                return;
              }
              setScrub((s) => {
                if (!s || s.i !== j || s.m !== i) sfx.tick({ freq: 3000, gain: 0.03 });
                return { m: i, i: j, from: "tile" };
              });
            }}
          />
        ))}
      </div>

      {/* big chart */}
      <div
        className={`relative ${narrow ? "mt-4" : "mt-5"} rounded-[22px] bg-[#fbfbfc] shadow-[inset_0_0_0_1px_rgba(0,0,0,.05)] ${narrow ? "px-3 pb-3 pt-3" : "px-5 pb-4 pt-4"}`}
      >
        <div className="flex items-center justify-between gap-3 text-[12px]">
          <div className="flex min-w-0 items-center gap-2">
            <motion.span
              className="h-2 w-2 shrink-0 rounded-full"
              animate={{ backgroundColor: M.color }}
              transition={{ duration: 0.4 }}
            />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={M.id}
                className="truncate font-medium text-[#1d1d1f]"
                initial={reduce ? false : { opacity: 0, y: 6, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(3px)" }}
                transition={{ duration: 0.28 }}
              >
                {M.label} by day
              </motion.span>
            </AnimatePresence>
          </div>
          {S.bigPrev && (
            <span className="flex shrink-0 items-center gap-1.5 text-[#6e6e73]">
              <svg width="16" height="2" aria-hidden="true">
                <line x1="0" y1="1" x2="16" y2="1" stroke="#a1a1a6" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
              {tiny ? "before" : prevLabel}
            </span>
          )}
        </div>

        <div
          ref={chartRef}
          tabIndex={0}
          role="slider"
          aria-label={`${M.label} by day. Use the arrow keys to read each day.`}
          aria-valuemin={0}
          aria-valuemax={n - 1}
          aria-valuenow={scrubOnChart ?? n - 1}
          aria-valuetext={
            scrubOnChart != null && scrubDate
              ? `${longDay(scrubDate)}: ${fmt(S.cur[scrubOnChart], M.format, true)}`
              : `${M.label} ${fmt(S.value, M.format, false)}`
          }
          onPointerMove={onChartMove}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
            onChartMove(e);
          }}
          onPointerLeave={(e) => e.pointerType === "mouse" && endScrub()}
          onPointerUp={(e) => e.pointerType !== "mouse" && endScrub()}
          onPointerCancel={endScrub}
          onBlur={endScrub}
          onKeyDown={onChartKey}
          className={`relative mt-3 cursor-crosshair touch-pan-y rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 ${narrow ? "ml-0 h-[170px]" : "ml-9 h-[230px]"}`}
        >
          {/* gridlines and their values */}
          {yTicks.map(({ f, v }) => (
            <div
              key={f}
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-black/[0.07]"
              style={{ top: `${(py(f) / VB_H) * 100}%` }}
            >
              {!narrow && (
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={`${M.id}-${period}`}
                    className="absolute -left-9 -top-[7px] w-8 text-right text-[10.5px] tabular-nums text-[#86868b]"
                    initial={reduce ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {axisFmt(v, M.format)}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          ))}

          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
            animate={seen ? { clipPath: "inset(0 0% 0 0)" } : undefined}
            transition={{
              duration: 1.3,
              ease: [0.65, 0, 0.35, 1],
              delay: 0.35,
            }}
          >
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0"
                    style={{
                      stopColor: M.color,
                      stopOpacity: 0.22,
                      transition: "stop-color .5s",
                    }}
                  />
                  <stop
                    offset="0.65"
                    style={{
                      stopColor: M.color,
                      stopOpacity: 0.05,
                      transition: "stop-color .5s",
                    }}
                  />
                  <stop
                    offset="1"
                    style={{
                      stopColor: M.color,
                      stopOpacity: 0,
                      transition: "stop-color .5s",
                    }}
                  />
                </linearGradient>
              </defs>
              <path ref={areaRef} fill={`url(#${uid}-area)`} />
              <path
                ref={prevRef}
                fill="none"
                stroke="#a1a1a6"
                strokeOpacity={S.bigPrev ? 0.7 : 0}
                strokeWidth={1.5}
                strokeDasharray="4 5"
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke-opacity .4s" }}
              />
              <path
                ref={glowRef}
                fill="none"
                strokeWidth={7}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  stroke: M.color,
                  strokeOpacity: 0.16,
                  transition: "stroke .5s",
                }}
              />
              <path
                ref={lineRef}
                fill="none"
                strokeWidth={2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ stroke: M.color, transition: "stroke .5s" }}
              />
            </svg>
          </motion.div>

          {/* the crosshair, the dot riding the line, and its label */}
          <AnimatePresence>
            {scrubOnChart != null && scrubDate && (
              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Cross x={dotX} y={dotY} color={M.color} />
                <Tip x={tipX} narrow={narrow}>
                  <span className="block text-[11px] text-white/60">{longDay(scrubDate)}</span>
                  <span className="block text-[14px] font-semibold tabular-nums tracking-[-0.01em]">
                    <Roll text={fmt(S.cur[scrubOnChart], M.format, true)} reduce={reduce} fast />
                  </span>
                  {S.prev.length === n && (
                    <span className="block text-[11px] tabular-nums text-white/60">
                      {fmt(S.prev[scrubOnChart], M.format, true)} the {period === 7 ? "week" : "period"} before
                    </span>
                  )}
                </Tip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* dates */}
        <div className={`relative mt-2 h-4 text-[11px] tabular-nums text-[#86868b] ${narrow ? "" : "ml-9"}`}>
          <AnimatePresence initial={false}>
            {xTicks.map((i, j) => {
              const d = dayOf(end, period - 1 - i);
              const first = j === 0;
              const last = j === xTicks.length - 1;
              return (
                <motion.span
                  key={`${period}-${i}`}
                  className="absolute top-0 whitespace-nowrap"
                  style={{
                    left: `${(i / (period - 1)) * 100}%`,
                    x: first ? "0%" : last ? "-100%" : "-50%",
                  }}
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3, delay: reduce ? 0 : j * 0.03 }}
                >
                  {period === 7 ? WD[d.getDay()] : short(d)}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {M.label}: {fmt(S.value, M.format, false)} over the last {period} days, {S.delta >= 0 ? "up" : "down"}{" "}
        {Math.abs(S.delta * 100).toFixed(1)} percent.
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- pieces

type St = {
  cur: number[];
  prev: number[];
  value: number;
  delta: number;
  spark: number[];
};

function Tile({
  m,
  st,
  on,
  uid,
  idx,
  seen,
  reduce,
  narrow,
  tiny,
  period,
  end,
  scrubI,
  onPick,
  onScrub,
}: {
  m: StatMetric;
  st: St;
  on: boolean;
  uid: string;
  idx: number;
  seen: boolean;
  reduce: boolean;
  narrow: boolean;
  tiny: boolean;
  period: number;
  end: Date;
  scrubI: number | null;
  onPick: () => void;
  onScrub: (i: number | null) => void;
}) {
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);
  const SH = 100;
  const cur = useMorph(
    st.spark,
    (ys) => {
      lineRef.current?.setAttribute("d", linePath(ys, SH, 6, 4));
      areaRef.current?.setAttribute("d", areaPath(ys, SH, 6, 4));
    },
    reduce,
  );
  const good = m.invert ? st.delta <= 0 : st.delta >= 0;
  const n = st.cur.length;
  const scrubbing = scrubI != null;
  const shown = scrubbing ? fmt(st.cur[scrubI], m.format, true) : fmt(st.value, m.format, false);
  const date = scrubbing ? dayOf(end, n - 1 - scrubI) : null;
  const f = scrubbing ? scrubI / (n - 1) : 0;
  const dotTop = scrubbing && cur.current ? (6 + (1 - yAt(cur.current, f)) * (SH - 10)) / SH : 0;

  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const r = sparkRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    onScrub(Math.max(0, Math.min(n - 1, Math.round(x * (n - 1)))));
  };

  return (
    <motion.button
      type="button"
      aria-pressed={on}
      aria-label={`${m.label}: ${fmt(st.value, m.format, false)}, ${st.delta >= 0 ? "up" : "down"} ${Math.abs(st.delta * 100).toFixed(1)} percent on the previous ${period} days. Show it on the chart.`}
      onClick={onPick}
      className={`group relative isolate flex min-w-0 flex-col rounded-[20px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${narrow ? "p-3" : "p-4"}`}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={seen ? { opacity: 1, y: 0 } : undefined}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        delay: reduce ? 0 : 0.08 * idx,
      }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
    >
      {/* the resting surface, and the pane of glass that slides to the chosen one */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-20 rounded-[20px] bg-[#f5f5f7]/70 transition-colors group-hover:bg-[#f0f0f3]"
      />
      {on && (
        <motion.span
          layoutId={`${uid}-tile`}
          aria-hidden="true"
          className="absolute inset-0 -z-10 rounded-[20px] bg-white"
          style={{
            boxShadow: `0 0 0 1px ${hexA(m.color, 0.28)}, 0 1px 0 rgba(255,255,255,.9) inset, 0 12px 28px -14px ${hexA(m.color, 0.55)}, 0 2px 6px -2px rgba(0,0,0,.08)`,
          }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
        />
      )}

      <span className="flex items-center gap-2">
        <span
          className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full"
          style={{ color: m.color, background: hexA(m.color, 0.13) }}
        >
          <Ico d={I[m.icon ?? "money"]} size={13} />
        </span>
        <span className="truncate text-[13px] font-medium text-[#6e6e73]">{m.label}</span>
      </span>

      <span
        className={`mt-2 block whitespace-nowrap font-semibold leading-none tracking-[-0.03em] text-[#1d1d1f] ${tiny ? "text-[21px]" : narrow ? "text-[23px]" : "text-[28px]"}`}
      >
        <Roll text={shown} reduce={reduce} fast={scrubbing} />
      </span>

      <span className="mt-2 flex h-[20px] items-center gap-1.5 overflow-hidden text-[12px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {date ? (
            <motion.span
              key="date"
              className="truncate tabular-nums text-[#6e6e73]"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {longDay(date)}
            </motion.span>
          ) : (
            <motion.span
              key="delta"
              className="flex min-w-0 items-center gap-1.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <motion.span
                className="flex shrink-0 items-center gap-[3px] rounded-full px-1.5 py-[2px] font-semibold tabular-nums"
                animate={{
                  color: good ? "#1f7a35" : "#c4161c",
                  backgroundColor: good ? "rgba(52,199,89,.13)" : "rgba(255,59,48,.11)",
                }}
                transition={{ duration: 0.35 }}
              >
                <motion.span
                  animate={{ rotate: st.delta >= 0 ? 0 : 90 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 18 }}
                >
                  <Ico d={I.up} size={10} />
                </motion.span>
                <Roll text={`${Math.abs(st.delta * 100).toFixed(1)}%`} reduce={reduce} />
              </motion.span>
              {!tiny && <span className="truncate text-[#86868b]">vs prev.</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <div
        ref={sparkRef}
        className={`relative mt-3 w-full touch-pan-y ${narrow ? "h-9" : "h-11"}`}
        onPointerMove={move}
        onPointerLeave={() => onScrub(null)}
        onPointerUp={(e) => e.pointerType !== "mouse" && onScrub(null)}
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
          animate={seen ? { clipPath: "inset(0 0% 0 0)" } : undefined}
          transition={{
            duration: 1.1,
            ease: [0.65, 0, 0.35, 1],
            delay: 0.25 + idx * 0.1,
          }}
        >
          <svg
            viewBox={`0 0 ${VB_W} ${SH}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id={`${uid}-sp${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={m.color} stopOpacity={on ? 0.24 : 0.14} />
                <stop offset="1" stopColor={m.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path ref={areaRef} fill={`url(#${uid}-sp${idx})`} />
            <path
              ref={lineRef}
              fill="none"
              stroke={m.color}
              strokeWidth={on ? 2 : 1.6}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ transition: "stroke-width .3s" }}
            />
          </svg>
        </motion.div>
        {scrubbing && (
          <>
            <span
              className="pointer-events-none absolute bottom-0 top-0 w-px bg-black/10"
              style={{ left: `${f * 100}%` }}
            />
            <span
              className="pointer-events-none absolute h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
              style={{
                left: `${f * 100}%`,
                top: `${dotTop * 100}%`,
                background: m.color,
                boxShadow: `0 0 0 3px ${hexA(m.color, 0.18)}`,
              }}
            />
          </>
        )}
      </div>
    </motion.button>
  );
}

function Cross({ x, y, color }: { x: MotionValue<number>; y: MotionValue<number>; color: string }) {
  const left = useTransform(x, (v) => `${v * 100}%`);
  const top = useTransform(y, (v) => `${v * 100}%`);
  return (
    <>
      <motion.span
        className="absolute bottom-0 top-0 w-px"
        style={{
          left,
          background: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,.16) 20%, rgba(0,0,0,.16))",
        }}
      />
      <motion.span className="absolute" style={{ left, top }}>
        <span
          className="absolute -left-[13px] -top-[13px] h-[26px] w-[26px] rounded-full"
          style={{ background: hexA(color, 0.16) }}
        />
        <span
          className="absolute -left-[6px] -top-[6px] h-3 w-3 rounded-full border-[2.5px] border-white"
          style={{
            background: color,
            boxShadow: `0 2px 6px ${hexA(color, 0.5)}`,
          }}
        />
      </motion.span>
    </>
  );
}

function Tip({ x, narrow, children }: { x: MotionValue<number>; narrow: boolean; children: ReactNode }) {
  const left = useTransform(x, (v) => `${v * 100}%`);
  // keep the label inside the chart: lean right near the left edge, left near the right edge
  const shift = useTransform(x, (v) => `${-Math.max(0, Math.min(1, (v - 0.08) / 0.84)) * 100}%`);
  return (
    <motion.div className="absolute top-1" style={{ left }}>
      <motion.div
        className={`whitespace-nowrap rounded-[12px] bg-[#1d1d1f]/90 px-2.5 py-1.5 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)] backdrop-blur-md ${narrow ? "" : "mx-2"}`}
        style={{ x: shift }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** a number whose digits roll on drums to their new values, places lined up from the right */
function Roll({ text, reduce, fast }: { text: string; reduce: boolean; fast?: boolean }) {
  const chars = text.split("");
  const len = chars.length;
  const spring = reduce
    ? { duration: 0 }
    : fast
      ? { type: "spring" as const, stiffness: 520, damping: 40 }
      : { type: "spring" as const, stiffness: 190, damping: 24 };
  return (
    <span
      className="inline-flex items-start align-top tabular-nums"
      style={{ height: "1.12em", lineHeight: "1.12em" }}
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {chars.map((c, i) => {
          const pos = len - i;
          const digit = c >= "0" && c <= "9";
          if (!digit)
            return (
              <motion.span
                key={`${pos}-${c}`}
                layout={reduce ? false : "position"}
                className="inline-block"
                style={{ height: "1.12em", lineHeight: "1.12em" }}
                initial={{ opacity: 0, y: "0.25em" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-0.25em" }}
                transition={{ duration: 0.2 }}
              >
                {c}
              </motion.span>
            );
          const d = +c;
          return (
            <motion.span
              key={`${pos}-d`}
              layout={reduce ? false : "position"}
              className="relative inline-block overflow-hidden"
              style={{ height: "1.12em", lineHeight: "1.12em" }}
              initial={{ opacity: 0, y: "0.3em" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-0.3em" }}
              transition={{ duration: 0.22 }}
            >
              <span className="invisible">0</span>
              <motion.span
                className="absolute left-0 top-0 flex flex-col"
                initial={false}
                animate={{ y: `${-d * 10}%` }}
                transition={spring}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
                  <span key={k} style={{ height: "1.12em" }}>
                    {k}
                  </span>
                ))}
              </motion.span>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </span>
  );
}
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
