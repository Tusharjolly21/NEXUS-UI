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
