# Flow Chart

Add the "Flow Chart" section from Nexus UI to my project.

Where visitors come from, the page they land on and how they leave. Streams of light run along the ribbons, each keeping its channel's colour all the way through. Point at a channel, page, outcome or ribbon and only the visitors through it keep flowing; point at Signed up to see which channels convert. Step weeks and the ribbons swell and thin on springs.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { FlowChart } from "@/components/blocks/motion-kit/flow-chart";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/blocks/motion-kit/flow-chart/index.ts ---

```ts
export { default as FlowChart } from "./flow-chart";
export type { FlowChartProps } from "./flow-chart";
```

--- components/blocks/motion-kit/flow-chart/flow-chart.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/purity -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FlowNode = { label: string; color: string };
export type FlowWeek = {
  /** e.g. "Nov 3" */
  label: string;
  /** visitors by [source][page][outcome] */
  flows: number[][][];
};
export type FlowChartProps = {
  title?: string;
  sources?: FlowNode[];
  pages?: FlowNode[];
  outcomes?: FlowNode[];
  /** oldest first; the last one shows first */
  weeks?: FlowWeek[];
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
  left: "M168.49 199.51a12 12 0 0 1-17 17l-80-80a12 12 0 0 1 0-17l80-80a12 12 0 0 1 17 17L97 128Z",
  right: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

// ---------------------------------------------------------------- demo data

const SOURCES: FlowNode[] = [
  { label: "Search", color: "#0071e3" },
  { label: "Social", color: "#bf5af2" },
  { label: "Direct", color: "#5ac8fa" },
  { label: "Email", color: "#ff9f0a" },
  { label: "Referral", color: "#ff375f" },
];
const PAGES: FlowNode[] = [
  { label: "Home", color: "#3a3a3c" },
  { label: "Pricing", color: "#3a3a3c" },
  { label: "Blog", color: "#3a3a3c" },
];
const OUTCOMES: FlowNode[] = [
  { label: "Signed up", color: "#30d158" },
  { label: "Started trial", color: "#0a84ff" },
  { label: "Left", color: "#aeaeb2" },
];

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
function demoWeeks(): FlowWeek[] {
  const r = rng(42);
  // how each source splits across pages, and how well each source converts
  const split = [
    [0.38, 0.22, 0.4],
    [0.46, 0.12, 0.42],
    [0.62, 0.3, 0.08],
    [0.3, 0.52, 0.18],
    [0.5, 0.34, 0.16],
  ];
  const lift = [1, 0.55, 1.25, 1.9, 1.35];
  const pageRate = [
    [0.07, 0.1],
    [0.16, 0.22],
    [0.03, 0.05],
  ];
  const labels = ["Oct 6", "Oct 13", "Oct 20", "Oct 27", "Nov 3", "Nov 10"];
  const base = [4200, 2600, 1900, 1100, 820];
  return labels.map((label, w) => {
    const flows = base.map((b, s) => {
      const tot =
        b * (1 + w * 0.04) * (0.82 + r() * 0.36) * (s === 1 && w === 3 ? 1.7 : 1) * (s === 3 && w === 5 ? 1.5 : 1);
      return split[s].map((sp, p) => {
        const v = tot * Math.max(0.03, sp + (r() - 0.5) * 0.1);
        const su = Math.min(0.5, pageRate[p][0] * lift[s] * (0.85 + r() * 0.3));
        const tr = Math.min(0.4, pageRate[p][1] * lift[s] * (0.85 + r() * 0.3));
        return [Math.round(v * su), Math.round(v * tr), Math.round(v * (1 - su - tr))];
      });
    });
    return { label, flows };
  });
}
const DEMO = demoWeeks();

// ---------------------------------------------------------------- layout

type Band = { y0: number; y1: number; w: number };
type Lay = {
  src: { y: number; h: number }[];
  page: { y: number; h: number }[];
  out: { y: number; h: number }[];
  l0: Band[][];
  l1: Band[][];
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
function totals(F: number[][][]) {
  const S = F.length;
  const P = F[0].length;
  const O = F[0][0].length;
  const v0 = F.map((row) => row.map((c) => sum(c))); // source -> page
  const v1 = Array.from({ length: P }, (_, p) => Array.from({ length: O }, (_, o) => sum(F.map((row) => row[p][o])))); // page -> outcome
  const srcT = v0.map(sum);
  const pageT = Array.from({ length: P }, (_, p) => sum(v0.map((r) => r[p])));
  const outT = Array.from({ length: O }, (_, o) => sum(v1.map((r) => r[o])));
  return { S, P, O, v0, v1, srcT, pageT, outT, total: sum(srcT) };
}
function layout(F: number[][][], H: number, minGap: number): Lay {
  const t = totals(F);
  const most = Math.max(t.S, t.P, t.O);
  const k = (H - minGap * (most - 1)) / t.total;
  // each column fills the full height: fewer nodes, wider gaps
  const col = (vals: number[]) => {
    const gap = vals.length > 1 ? (H - t.total * k) / (vals.length - 1) : 0;
    let y = vals.length > 1 ? 0 : (H - t.total * k) / 2;
    return vals.map((v) => {
      const n = { y, h: v * k };
      y += v * k + gap;
      return n;
    });
  };
  const src = col(t.srcT);
  const page = col(t.pageT);
  const out = col(t.outT);
  // stack the bands inside each node in the order of the node at the other end, so they don't cross more than they must
  const srcOff = src.map((n) => n.y);
  const pageIn = page.map((n) => n.y);
  const pageOut = page.map((n) => n.y);
  const outIn = out.map((n) => n.y);
  const l0 = t.v0.map((row, s) =>
    row.map((v, p) => {
      const b = { y0: srcOff[s], y1: pageIn[p], w: v * k };
      srcOff[s] += v * k;
      pageIn[p] += v * k;
      return b;
    }),
  );
  const l1 = t.v1.map((row, p) =>
    row.map((v, o) => {
      const b = { y0: pageOut[p], y1: outIn[o], w: v * k };
      pageOut[p] += v * k;
      outIn[o] += v * k;
      return b;
    }),
  );
  return { src, page, out, l0, l1 };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lerp(a: any, b: any, t: number): any {
  if (typeof a === "number") return a + (b - a) * t;
  if (Array.isArray(a)) return a.map((x, i) => lerp(x, b[i], t));
  const o: Record<string, unknown> = {};
  for (const key of Object.keys(a)) o[key] = lerp(a[key], b[key], t);
  return o;
}
const ribbon = (x0: number, x1: number, b: Band) => {
  const xm = (x0 + x1) / 2;
  return `M${x0} ${b.y0}C${xm} ${b.y0} ${xm} ${b.y1} ${x1} ${b.y1}L${x1} ${b.y1 + b.w}C${xm} ${b.y1 + b.w} ${xm} ${b.y0 + b.w} ${x0} ${b.y0 + b.w}Z`;
};
/** a point on a band's centre-line family: lane 0 is its top edge, 1 its bottom */
function along(x0: number, x1: number, b: Band, u: number, lane: number) {
  const xm = (x0 + x1) / 2;
  const m = 1 - u;
  const x = m * m * m * x0 + 3 * m * m * u * xm + 3 * m * u * u * xm + u * u * u * x1;
  const e = u * u * (3 - 2 * u);
  const ya = b.y0 + lane * b.w;
  const yb = b.y1 + lane * b.w;
  return [x, ya + (yb - ya) * e] as const;
}

const fmt = (v: number) => Math.round(v).toLocaleString("en-US");
const pct = (v: number) => `${(v * 100).toFixed(v < 0.1 ? 1 : 0)}%`;

type Focus =
  | { k: "src"; i: number }
  | { k: "page"; i: number }
  | { k: "out"; i: number }
  | { k: "l0"; a: number; b: number }
  | { k: "l1"; a: number; b: number }
  | null;

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * Where visitors come from, which page they land on, and how they leave, as a flow chart.
 *
 * Streams of light run along the ribbons, as many as there are visitors, each keeping the colour of the channel it
 * came from all the way through, so you can watch search traffic split across the pages and see where it ends up.
 * Point at a channel, a page, an outcome or a single ribbon and everything else falls away: only the visitors that
 * pass through it keep flowing (point at Signed up to see which channels actually convert). Step between weeks and
 * the ribbons swell and thin on springs while every number rolls to its new value.
 *   <FlowChart weeks={weeks} />
 */
export default function FlowChart({
  title = "Where visitors go",
  sources = SOURCES,
  pages = PAGES,
  outcomes = OUTCOMES,
  weeks = DEMO,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: FlowChartProps) {
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
  const chartRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const seen = useInView(rootRef, { once: true, amount: 0.3 });
  const touched = useRef(false);
  const [week, setWeek] = useState(weeks.length - 1);
  const [focus, setFocus] = useState<Focus>(null);
  const [size, setSize] = useState({ w: 860, cw: 800 });

  useLayoutEffect(() => {
    const el = rootRef.current;
    const ch = chartRef.current;
    if (!el || !ch) return;
    const ro = new ResizeObserver(() =>
      setSize({
        w: el.getBoundingClientRect().width,
        cw: ch.getBoundingClientRect().width,
      }),
    );
    ro.observe(el);
    ro.observe(ch);
    return () => ro.disconnect();
  }, []);
  const narrow = size.w < 600;
  const tiny = size.w < 400;
  const H = narrow ? 300 : 340;
  const BAR = narrow ? 8 : 10;
  const W = size.cw;
  const X = [0, (W - BAR) / 2, W - BAR];

  const F = weeks[week].flows;
  const T = useMemo(() => totals(F), [F]);
  const target = useMemo(() => layout(F, H, narrow ? 8 : 10), [F, H, narrow]);

  // the drawn layout walks to the target on a spring when the week changes
  const [L, setL] = useState<Lay>(target);
  const LRef = useRef(L);
  LRef.current = L;
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current || reduce) {
      first.current = false;
      setL(target);
      return;
    }
    const from = LRef.current;
    const a = animate(0, 1, {
      type: "spring",
      stiffness: 120,
      damping: 18,
      onUpdate: (t) => setL(lerp(from, target, t)),
    });
    return () => a.stop();
  }, [target, reduce]);

  const touch = () => {
    touched.current = true;
  };
  const go = (d: number) => {
    const n = Math.max(0, Math.min(weeks.length - 1, week + d));
    if (n === week) return;
    setWeek(n);
    sfx.whoosh(d > 0 ? 700 : 1600, d > 0 ? 1600 : 700, {
      dur: 0.42,
      gain: 0.05,
    });
    sfx.note(d > 0 ? 698 : 587, { dur: 0.3, gain: 0.05, at: 0.06 });
  };
  const hover = (f: Focus) => {
    setFocus((cur) => {
      if (f && JSON.stringify(cur) !== JSON.stringify(f)) sfx.tick({ freq: 2400, gain: 0.03 });
      return f;
    });
  };

  // what's lit, given the focus
  const lit0 = (s: number, p: number) =>
    !focus ||
    (focus.k === "src" && focus.i === s) ||
    (focus.k === "page" && focus.i === p) ||
    (focus.k === "l0" && focus.a === s && focus.b === p);
  const lit1 = (p: number, o: number) =>
    !focus ||
    (focus.k === "page" && focus.i === p) ||
    (focus.k === "out" && focus.i === o) ||
    (focus.k === "l1" && focus.a === p && focus.b === o);
  const litNode = (k: "src" | "page" | "out", i: number) => {
    if (!focus) return true;
    if (focus.k === k && "i" in focus && focus.i === i) return true;
    if (focus.k === "l0") return (k === "src" && focus.a === i) || (k === "page" && focus.b === i);
    if (focus.k === "l1") return (k === "page" && focus.a === i) || (k === "out" && focus.b === i);
    if (focus.k === "src") return k === "page" ? T.v0[focus.i][i] > 0 : k === "out";
    if (focus.k === "out") return k === "page" || k === "src";
    if (focus.k === "page") return k !== "page";
    return false;
  };

  // ------------------------------------------------------------ particles
  const focusRef = useRef(focus);
  focusRef.current = focus;
  const FRef = useRef(F);
  FRef.current = F;
  const geo = useRef({ X, H });
  geo.current = { X, H };
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || reduce || !inView || !seen) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type Pt = {
      s: number;
      p: number;
      o: number;
      stage: 0 | 1;
      u: number;
      lane: number;
      v: number;
      r: number;
      a: number;
    };
    const pick = (): [number, number, number] => {
      const f = FRef.current;
      let tot = 0;
      for (const a of f) for (const b of a) for (const c of b) tot += c;
      let x = Math.random() * tot;
      for (let s = 0; s < f.length; s++)
        for (let p = 0; p < f[s].length; p++)
          for (let o = 0; o < f[s][p].length; o++) if ((x -= f[s][p][o]) <= 0) return [s, p, o];
      return [0, 0, 0];
    };
    const COUNT = Math.round(Math.min(260, Math.max(110, geo.current.X[2] * 0.26)));
    const pts: Pt[] = Array.from({ length: COUNT }, () => {
      const [s, p, o] = pick();
      const stage = Math.random() < 0.5 ? 0 : 1;
      return {
        s,
        p,
        o,
        stage,
        u: Math.random(),
        lane: 0.1 + Math.random() * 0.8,
        v: 52 + Math.random() * 40,
        r: 0.9 + Math.random() * 1.3,
        a: 0,
      } as Pt;
    });
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { X: xs, H: h } = geo.current;
      const w = Math.round(cv.clientWidth * dpr);
      const hh = Math.round(cv.clientHeight * dpr);
      if (cv.width !== w || cv.height !== hh) {
        cv.width = w;
        cv.height = hh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.clientWidth, cv.clientHeight);
      const lay = LRef.current;
      const f = focusRef.current;
      const bar = xs[1] > 300 ? 10 : 8;
      for (const pt of pts) {
        const band = pt.stage === 0 ? lay.l0[pt.s]?.[pt.p] : lay.l1[pt.p]?.[pt.o];
        if (!band) continue;
        const x0 = pt.stage === 0 ? xs[0] + bar : xs[1] + bar;
        const x1 = pt.stage === 0 ? xs[1] : xs[2];
        const len = Math.hypot(x1 - x0, band.y1 - band.y0) || 1;
        pt.u += (pt.v * dt) / len;
        if (pt.u >= 1) {
          if (pt.stage === 0) {
            pt.stage = 1;
            pt.u = 0;
            pt.lane = 0.1 + Math.random() * 0.8;
          } else {
            const [s, p, o] = pick();
            Object.assign(pt, {
              s,
              p,
              o,
              stage: 0,
              u: 0,
              lane: 0.1 + Math.random() * 0.8,
              a: 0,
            });
          }
          continue;
        }
        const on =
          !f ||
          (f.k === "src" && f.i === pt.s) ||
          (f.k === "page" && f.i === pt.p) ||
          (f.k === "out" && f.i === pt.o) ||
          (f.k === "l0" && f.a === pt.s && f.b === pt.p) ||
          (f.k === "l1" && f.a === pt.p && f.b === pt.o);
        // fade toward the target brightness, and fade in at the start and out at the end of the journey
        const want = on ? 1 : 0.06;
        pt.a += (want - pt.a) * Math.min(1, dt * 8);
        const edge = pt.stage === 0 ? Math.min(1, pt.u * 6) : Math.min(1, (1 - pt.u) * 6);
        const alpha = pt.a * edge;
        if (alpha < 0.02) continue;
        // a band this thin can't hold a lane: squeeze the lane toward its middle
        const lane = 0.5 + (pt.lane - 0.5) * Math.min(1, band.w / 6);
        const [x, y] = along(x0, x1, band, pt.u, lane);
        const col = SRC_COL.current[pt.s] ?? "#0071e3";
        ctx.globalAlpha = alpha * 0.22;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, pt.r * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.95;
        ctx.beginPath();
        ctx.arc(x, y, pt.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x - pt.r * 0.25, y - pt.r * 0.25, pt.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      void h;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, inView, seen]);
  const SRC_COL = useRef(sources.map((s) => s.color));
  SRC_COL.current = sources.map((s) => s.color);

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ go, hover });
  ap.current = { go, hover };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, f: () => void) => timers.push(setTimeout(() => alive && !touched.current && f(), ms));
    const plan: [number, () => void][] = [
      [2600, () => ap.current.hover({ k: "src", i: 0 })],
      [5000, () => ap.current.hover({ k: "out", i: 0 })],
      [7400, () => ap.current.hover({ k: "src", i: 3 })],
      [9600, () => ap.current.hover(null)],
      [10400, () => ap.current.go(-1)],
      [12000, () => ap.current.go(-1)],
      [13600, () => ap.current.hover({ k: "page", i: 1 })],
      [15800, () => ap.current.hover(null)],
      [16600, () => ap.current.go(1)],
      [18000, () => ap.current.go(1)],
    ];
    const loop = () => {
      for (const [ms, f] of plan) at(ms, f);
      at(19600, loop);
    };
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [autoplay, inView, reduce]);

  // ------------------------------------------------------------ words
  const signed = T.outT[0];
  const trials = T.outT[1];
  const caption = (() => {
    if (!focus)
      return {
        key: "none",
        a: tiny ? "Point at a stream to follow it." : "Point at a channel, a page or a stream to follow it.",
        b: "",
      };
    if (focus.k === "src") {
      const conv = sum(F[focus.i].map((r) => r[0]));
      return {
        key: `s${focus.i}`,
        a: `${sources[focus.i].label}: ${fmt(T.srcT[focus.i])} visitors`,
        b: `${pct(conv / Math.max(1, T.srcT[focus.i]))} signed up`,
      };
    }
    if (focus.k === "page") {
      return {
        key: `p${focus.i}`,
        a: `${pages[focus.i].label}: ${fmt(T.pageT[focus.i])} visitors`,
        b: `${pct(T.v1[focus.i][0] / Math.max(1, T.pageT[focus.i]))} signed up`,
      };
    }
    if (focus.k === "out") {
      const best = T.srcT
        .map((_, s) => [s, sum(F[s].map((r) => r[focus.i])) / Math.max(1, T.srcT[s])] as const)
        .sort((a, b) => b[1] - a[1])[0];
      return {
        key: `o${focus.i}`,
        a: `${outcomes[focus.i].label}: ${fmt(T.outT[focus.i])}`,
        b:
          focus.i === 2
            ? `${pct(T.outT[2] / T.total)} of visitors`
            : `best from ${sources[best[0]].label}, ${pct(best[1])}`,
      };
    }
    if (focus.k === "l0")
      return {
        key: `a${focus.a}-${focus.b}`,
        a: `${sources[focus.a].label} to ${pages[focus.b].label}: ${fmt(T.v0[focus.a][focus.b])}`,
        b: `${pct(T.v0[focus.a][focus.b] / Math.max(1, T.srcT[focus.a]))} of ${sources[focus.a].label}`,
      };
    return {
      key: `b${focus.a}-${focus.b}`,
      a: `${pages[focus.a].label} to ${outcomes[focus.b].label}: ${fmt(T.v1[focus.a][focus.b])}`,
      b: `${pct(T.v1[focus.a][focus.b] / Math.max(1, T.pageT[focus.a]))} of ${pages[focus.a].label}`,
    };
  })();

  const nodeLabel = (k: "src" | "page" | "out", i: number, n: FlowNode, y: number, h: number, value: number) => {
    const lit = litNode(k, i);
    // on a narrow card the pages read to the left of their bars, so they don't run into the outcomes
    const right = k === "src" || (k === "page" && !narrow);
    const x = k === "src" ? X[0] + BAR + 8 : k === "page" ? (narrow ? X[1] - 6 : X[1] + BAR + 8) : X[2] - 8;
    const twoLines = narrow || h > 34;
    return (
      <motion.button
        key={`${k}${i}`}
        type="button"
        onPointerEnter={(e) => e.pointerType === "mouse" && hover({ k, i })}
        onPointerLeave={(e) => e.pointerType === "mouse" && hover(null)}
        onFocus={() => hover({ k, i })}
        onBlur={() => hover(null)}
        onClick={() => {
          touch();
          setFocus((f) => (f && "i" in f && f.k === k && f.i === i ? null : { k, i }));
        }}
        aria-label={`${n.label}, ${fmt(value)} visitors`}
        className="absolute z-10 -translate-y-1/2 rounded-md px-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
        style={{
          // keep it inside the chart, even for a node at the very top or bottom
          top: Math.max(twoLines ? 15 : 8, Math.min(H - (twoLines ? 15 : 8), y + h / 2)),
          left: right ? x : undefined,
          right: right ? undefined : W - x,
          textAlign: right ? "left" : "right",
          textShadow: "0 0 3px #fff, 0 0 6px #fff, 0 0 10px #fff",
        }}
        animate={{ opacity: lit ? 1 : 0.28 }}
        transition={{ duration: 0.25 }}
      >
        <span
          className={`block whitespace-nowrap font-medium leading-tight text-[#1d1d1f] ${narrow ? "text-[11.5px]" : "text-[12.5px]"}`}
        >
          {!twoLines ? (
            <>
              {n.label} <span className="font-normal text-[#6e6e73]">{fmt(value)}</span>
            </>
          ) : (
            n.label
          )}
        </span>
        {twoLines && (
          <span
            className={`block whitespace-nowrap leading-tight tabular-nums text-[#6e6e73] ${narrow ? "text-[11px]" : "text-[12px]"}`}
          >
            <Roll text={fmt(value)} reduce={reduce} />
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={touch}
      onKeyDownCapture={(e) => {
        touch();
        if (e.key === "Escape") setFocus(null);
      }}
      onPointerEnter={touch}
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

      <header className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`truncate font-semibold tracking-[-0.022em] ${narrow ? "text-[19px]" : "text-[22px]"}`}>
            {title}
          </h3>
          <div
            className={`mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-[13px] text-[#6e6e73] ${tiny ? "gap-x-3" : ""}`}
          >
            <span>
              <b className="font-semibold tabular-nums text-[#1d1d1f]">
                <Roll text={fmt(T.total)} reduce={reduce} />
              </b>{" "}
              visitors
            </span>
            <span>
              <b className="font-semibold tabular-nums text-[#1f7a35]">
                <Roll text={fmt(signed)} reduce={reduce} />
              </b>{" "}
              signed up
            </span>
            {!tiny && (
              <span>
                <b className="font-semibold tabular-nums text-[#0066cc]">
                  <Roll text={fmt(trials)} reduce={reduce} />
                </b>{" "}
                trials
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#f2f2f4] p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,.06)]">
          <button
            type="button"
            aria-label="Previous week"
            disabled={week === 0}
            onClick={() => {
              touch();
              go(-1);
            }}
            className="grid h-7 w-7 place-items-center rounded-full text-[#1d1d1f] outline-none transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
          >
            <Ico d={I.left} size={12} />
          </button>
          <span
            className={`relative overflow-hidden text-center text-[13px] font-medium tabular-nums ${narrow ? "w-[52px]" : "w-[104px]"}`}
            aria-live="polite"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={week}
                className="block whitespace-nowrap"
                initial={reduce ? false : { y: 14, opacity: 0, filter: "blur(3px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0, filter: "blur(3px)" }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                  filter: { duration: 0.25 },
                  opacity: { duration: 0.2 },
                }}
              >
                {narrow ? weeks[week].label : `Week of ${weeks[week].label}`}
              </motion.span>
            </AnimatePresence>
          </span>
          <button
            type="button"
            aria-label="Next week"
            disabled={week === weeks.length - 1}
            onClick={() => {
              touch();
              go(1);
            }}
            className="grid h-7 w-7 place-items-center rounded-full text-[#1d1d1f] outline-none transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
          >
            <Ico d={I.right} size={12} />
          </button>
        </div>
      </header>

      {/* what you're pointing at */}
      <div
        className={`relative flex h-6 items-center overflow-hidden text-[12.5px] ${narrow ? "mt-3" : "mt-4"}`}
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={caption.key + week}
            className="flex min-w-0 items-center gap-2 whitespace-nowrap"
            initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(3px)" }}
            transition={{ duration: 0.22 }}
          >
            <span className={`truncate ${focus ? "font-medium text-[#1d1d1f]" : "text-[#86868b]"}`}>{caption.a}</span>
            {caption.b && (
              <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-[1px] text-[12px] tabular-nums text-[#6e6e73]">
                {caption.b}
              </span>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* the chart */}
      <div
        ref={chartRef}
        className={`relative ${narrow ? "mt-3" : "mt-4"}`}
        style={{ height: H }}
        onPointerLeave={(e) => e.pointerType === "mouse" && hover(null)}
      >
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: "inset(-4% 100% -4% 0)" }}
          animate={seen ? { clipPath: "inset(-4% 0% -4% 0)" } : undefined}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
        >
          <svg width={W} height={H} className="absolute inset-0 overflow-visible" aria-hidden="true">
            <defs>
              {L.l0.map((row, s) =>
                row.map((_, p) => (
                  <linearGradient
                    key={`g0${s}${p}`}
                    id={`${uid}-g0-${s}-${p}`}
                    gradientUnits="userSpaceOnUse"
                    x1={X[0] + BAR}
                    x2={X[1]}
                    y1="0"
                    y2="0"
                  >
                    <stop offset="0" stopColor={sources[s].color} stopOpacity="0.42" />
                    <stop offset="1" stopColor={pages[p].color} stopOpacity="0.14" />
                  </linearGradient>
                )),
              )}
              {L.l1.map((row, p) =>
                row.map((_, o) => (
                  <linearGradient
                    key={`g1${p}${o}`}
                    id={`${uid}-g1-${p}-${o}`}
                    gradientUnits="userSpaceOnUse"
                    x1={X[1] + BAR}
                    x2={X[2]}
                    y1="0"
                    y2="0"
                  >
                    <stop offset="0" stopColor={pages[p].color} stopOpacity="0.14" />
                    <stop
                      offset="1"
                      stopColor={outcomes[o].color}
                      stopOpacity={outcomes[o].color === "#aeaeb2" ? 0.26 : 0.42}
                    />
                  </linearGradient>
                )),
              )}
            </defs>
            {L.l0.map((row, s) =>
              row.map((b, p) => (
                <path
                  key={`l0${s}${p}`}
                  d={ribbon(X[0] + BAR, X[1], b)}
                  fill={`url(#${uid}-g0-${s}-${p})`}
                  style={{
                    opacity: lit0(s, p) ? 1 : 0.12,
                    transition: "opacity .3s",
                    cursor: "pointer",
                    mixBlendMode: "multiply",
                  }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover({ k: "l0", a: s, b: p })}
                  onClick={() => {
                    touch();
                    setFocus((f) => (f && f.k === "l0" && f.a === s && f.b === p ? null : { k: "l0", a: s, b: p }));
                  }}
                />
              )),
            )}
            {L.l1.map((row, p) =>
              row.map((b, o) => (
                <path
                  key={`l1${p}${o}`}
                  d={ribbon(X[1] + BAR, X[2], b)}
                  fill={`url(#${uid}-g1-${p}-${o})`}
                  style={{
                    opacity: lit1(p, o) ? 1 : 0.12,
                    transition: "opacity .3s",
                    cursor: "pointer",
                    mixBlendMode: "multiply",
                  }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover({ k: "l1", a: p, b: o })}
                  onClick={() => {
                    touch();
                    setFocus((f) => (f && f.k === "l1" && f.a === p && f.b === o ? null : { k: "l1", a: p, b: o }));
                  }}
                />
              )),
            )}
            {/* the node bars, with a highlight down their left edge */}
            {(
              [
                ["src", L.src, sources, X[0]],
                ["page", L.page, pages, X[1]],
                ["out", L.out, outcomes, X[2]],
              ] as const
            ).map(([k, col, meta, x]) =>
              col.map((n, i) => (
                <g
                  key={`${k}${i}`}
                  style={{
                    opacity: litNode(k, i) ? 1 : 0.3,
                    transition: "opacity .3s",
                  }}
                >
                  <rect
                    x={x}
                    y={n.y}
                    width={BAR}
                    height={Math.max(1, n.h)}
                    rx={Math.min(BAR / 2, n.h / 2)}
                    fill={meta[i].color}
                  />
                  <rect
                    x={x + 1.5}
                    y={n.y + 2}
                    width={1.5}
                    height={Math.max(0, n.h - 4)}
                    rx={0.75}
                    fill="#fff"
                    opacity={0.45}
                  />
                </g>
              )),
            )}
          </svg>
          <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        </motion.div>

        {L.src.map((n, i) => nodeLabel("src", i, sources[i], n.y, n.h, T.srcT[i]))}
        {L.page.map((n, i) => nodeLabel("page", i, pages[i], n.y, n.h, T.pageT[i]))}
        {L.out.map((n, i) => nodeLabel("out", i, outcomes[i], n.y, n.h, T.outT[i]))}
      </div>
    </div>
  );
}

/** a number whose digits roll on drums to their new values, places lined up from the right */
function Roll({ text, reduce }: { text: string; reduce: boolean }) {
  const chars = text.split("");
  const len = chars.length;
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 190, damping: 24 };
  return (
    <span
      className="inline-flex items-start align-top tabular-nums"
      style={{ height: "1.15em", lineHeight: "1.15em" }}
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
                style={{ height: "1.15em", lineHeight: "1.15em" }}
                initial={{ opacity: 0, y: "0.25em" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-0.25em" }}
                transition={{ duration: 0.2 }}
              >
                {c}
              </motion.span>
            );
          return (
            <motion.span
              key={`${pos}-d`}
              layout={reduce ? false : "position"}
              className="relative inline-block overflow-hidden"
              style={{ height: "1.15em", lineHeight: "1.15em" }}
              initial={{ opacity: 0, y: "0.3em" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "-0.3em" }}
              transition={{ duration: 0.22 }}
            >
              <span className="invisible">0</span>
              <motion.span
                className="absolute left-0 top-0 flex flex-col"
                initial={false}
                animate={{ y: `${-+c * 10}%` }}
                transition={spring}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => (
                  <span key={k} style={{ height: "1.15em" }}>
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
