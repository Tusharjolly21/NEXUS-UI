# Contribution Skyline

Add the "Contribution Skyline" component from Nexus UI to my project.

A year of contributions as a heatmap that stands up into a city. Switch to Skyline and the grid tilts back and turns while every day rises into a bar as tall as its count, a wave running toward today, lit from one side. Drag to walk round it, point at a day to read it, point at a streak and only its days stay lit.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { ContributionSkyline } from "@/components/contribution-skyline";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/contribution-skyline/contribution-skyline.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type ContributionSkylineProps = {
  title?: string;
  /** contributions per day, oldest first, the last one being today (or endDate) */
  data?: number[];
  endDate?: Date;
  /** the colours for none, then four levels, light to deep */
  palette?: [string, string, string, string, string];
  /** what one of them is called, and many */
  noun?: [string, string];
  /** start as the skyline instead of the flat grid */
  defaultSkyline?: boolean;
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
  grid: "M120 56v48a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16m80-16h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16m-96 96H56a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16m96 0h-48a16 16 0 0 0-16 16v48a16 16 0 0 0 16 16h48a16 16 0 0 0 16-16v-48a16 16 0 0 0-16-16",
  city: "M239.73 208H224V96a16 16 0 0 0-16-16h-44a4 4 0 0 0-4 4v124h-16V32.41a16.43 16.43 0 0 0-6.16-13a16 16 0 0 0-18.72-.69L39.12 72A16 16 0 0 0 32 85.34V208H16.27A8.18 8.18 0 0 0 8 215.47a8 8 0 0 0 8 8.53h224a8 8 0 0 0 8-8.53a8.18 8.18 0 0 0-8.27-7.47M76 184a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.28v-15.45a8.19 8.19 0 0 1 7.47-8.27a8 8 0 0 1 8.53 8Zm40 56a8 8 0 0 1-8.53 8a8.18 8.18 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Zm0-56a8 8 0 0 1-8.53 8a8.19 8.19 0 0 1-7.47-8.26v-15.47a8.19 8.19 0 0 1 7.47-8.26a8 8 0 0 1 8.53 8Z",
  flame:
    "M173.79 51.48a221.3 221.3 0 0 0-41.67-34.34a8 8 0 0 0-8.24 0a221.3 221.3 0 0 0-41.67 34.34C54.59 80.48 40 112.47 40 144a88 88 0 0 0 176 0c0-31.53-14.59-63.52-42.21-92.52M96 184c0-27.67 22.53-47.28 32-54.3c9.48 7 32 26.63 32 54.3a32 32 0 0 1-64 0",
  trophy:
    "M232 64h-24V48a8 8 0 0 0-8-8H56a8 8 0 0 0-8 8v16H24A16 16 0 0 0 8 80v16a40 40 0 0 0 40 40h3.65A80.13 80.13 0 0 0 120 191.61V216H96a8 8 0 0 0 0 16h64a8 8 0 0 0 0-16h-24v-24.42c31.94-3.23 58.44-25.64 68.08-55.58H208a40 40 0 0 0 40-40V80a16 16 0 0 0-16-16M48 120a24 24 0 0 1-24-24V80h24v32q0 4 .39 8Zm184-24a24 24 0 0 1-24 24h-.5a82 82 0 0 0 .5-8.9V80h24Z",
  star: "M240 128a15.79 15.79 0 0 1-10.5 15l-63.44 23.07L143 229.5a16 16 0 0 1-30 0l-23.06-63.44L26.5 143a16 16 0 0 1 0-30l63.44-23.06L113 26.5a16 16 0 0 1 30 0l23.07 63.44L229.5 113a15.79 15.79 0 0 1 10.5 15",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const PALETTE: [string, string, string, string, string] = ["#ebedf0", "#b7e4c4", "#6fcf8c", "#2fb35a", "#16803c"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY = 86400000;

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
function demoData(end: Date) {
  const r = rng(2026);
  const n = 380;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(end.getTime() - (n - 1 - i) * DAY);
    const dow = d.getDay();
    const week = Math.floor(i / 7);
    const season = 0.55 + 0.45 * Math.sin(i / 40 + 1);
    const holiday = (week >= 12 && week <= 13) || (week >= 33 && week <= 34);
    const sprint = i > n - 40 ? 1.4 : 1; // a strong finish
    const summer = i > n - 175 && i < n - 128; // a long unbroken run in the summer
    let v = 0;
    if (!holiday) {
      const busy = (dow === 0 || dow === 6 ? 0.25 : 1) * season * sprint;
      const roll = r();
      if (roll < 0.86 * Math.min(1, busy + 0.25) || i > n - 13 || summer)
        v = Math.round(busy * (2 + r() * 9) + (r() < 0.05 ? 10 + r() * 8 : 0));
      if ((i > n - 13 || summer) && v === 0) v = 1 + Math.round(r() * 2);
      if (i === n - 13) v = 0;
    }
    out.push(v);
  }
  return out;
}

type Cell = { w: number; d: number; v: number; date: Date; lvl: number };
type Pt = [number, number];

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(k >= 1 ? c + (255 - c) * (k - 1) : c * k)));
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
const mix = (a: string, b: string, t: number) => {
  if (t <= 0.001) return a;
  const x = parseInt(a.slice(1), 16);
  const y = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, "0")}`;
};
const inPoly = (x: number, y: number, p: Pt[]) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if (p[i][1] > y !== p[j][1] > y && x < ((p[j][0] - p[i][0]) * (y - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0])
      c = !c;
  }
  return c;
};
const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const longDate = (d: Date) => `${WD[d.getDay()]}, ${MON[d.getMonth()]} ${d.getDate()}`;

/**
 * A year of contributions, as a heatmap that stands up into a city.
 *
 * Flat, it's the familiar grid of days, deeper colour for busier days. Switch to Skyline and the grid tilts back and
 * turns while every day rises into a bar as tall as its count, a wave running from the oldest week to today, lit from
 * one side so the city has form. Drag sideways to walk round it. Point at a day, flat or standing, to read it; point
 * at a streak and only the days in it stay lit. Arrow keys move day by day when the chart has focus.
 *   <ContributionSkyline data={dailyCounts} />
 */
export default function ContributionSkyline({
  title = "Contributions",
  data,
  endDate,
  palette = PALETTE,
  noun = ["contribution", "contributions"],
  defaultSkyline = false,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: ContributionSkylineProps) {
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
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const seen = useInView(rootRef, { once: true, amount: 0.3 });
  const touched = useRef(false);
  const [end] = useState(() => endDate ?? new Date());
  const series = useMemo(() => data ?? demoData(end), [data, end]);
  const [sky, setSky] = useState(defaultSkyline);
  const [w, setW] = useState(900);
  const [hover, setHover] = useState<number | null>(null); // a cell index
  const [streak, setStreak] = useState<"long" | "now" | "best" | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w < 600;
  const tiny = w < 400;
  const WEEKS = narrow ? 26 : 53;

  // ------------------------------------------------------------ the grid of days
  const { cells, total, longest, current, best, max } = useMemo(() => {
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    const lastRow = endDay.getDay();
    const count = (WEEKS - 1) * 7 + lastRow + 1;
    const start = new Date(endDay.getTime() - (count - 1) * DAY);
    const vals = series.slice(-count);
    while (vals.length < count) vals.unshift(0);
    const sorted = vals.filter((v) => v > 0).sort((a, b) => a - b);
    const q = (f: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * f))] ?? 1;
    const cut = [q(0.25), q(0.5), q(0.75)];
    const cells: Cell[] = vals.map((v, i) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const lvl = v <= 0 ? 0 : v <= cut[0] ? 1 : v <= cut[1] ? 2 : v <= cut[2] ? 3 : 4;
      return { w: Math.floor(i / 7), d: i % 7, v, date, lvl };
    });
    // streaks: the longest run of days with something in them, and the one running up to today
    let best = { from: 0, to: -1 };
    let run = 0;
    for (let i = 0; i < cells.length; i++) {
      run = cells[i].v > 0 ? run + 1 : 0;
      if (run > best.to - best.from + 1) best = { from: i - run + 1, to: i };
    }
    let cur = 0;
    for (let i = cells.length - 1; i >= 0 && cells[i].v > 0; i--) cur++;
    let top = 0;
    for (let i = 1; i < cells.length; i++) if (cells[i].v > cells[top].v) top = i;
    return {
      cells,
      total: vals.reduce((a, b) => a + b, 0),
      longest: best,
      current: { from: cells.length - cur, to: cells.length - 1 },
      best: top,
      max: Math.max(1, ...vals),
    };
  }, [series, end, WEEKS]);

  const inStreak = (i: number) =>
    streak === "long"
      ? i >= longest.from && i <= longest.to
      : streak === "now"
        ? i >= current.from && i <= current.to
        : streak === "best"
          ? i === best
          : true;

  // ------------------------------------------------------------ camera
  const P = useMotionValue(defaultSkyline ? 1 : 0); // 0 flat, 1 skyline
  const yaw = useMotionValue(0); // extra turn from dragging, degrees
  const flatH = useMemo(() => {
    const left = narrow ? 26 : 32;
    const pitch = (Math.min(w, 980) - (narrow ? 32 : 48) - left) / WEEKS;
    return Math.round(pitch * 7 + 30);
  }, [w, narrow, WEEKS]);
  const skyH = narrow ? Math.round(Math.min(280, (w - 32) * 0.56 + 34)) : 330;
  const H = useMotionValue(defaultSkyline ? skyH : flatH);
  useEffect(() => {
    // the box's height follows the camera: short and wide when flat, tall when standing
    const update = () => H.set(flatH + (skyH - flatH) * ease(Math.min(1, P.get() * 1.4)));
    update();
    return P.on("change", update);
  }, [P, H, flatH, skyH]);

  const toggle = (to: boolean) => {
    if (to === sky) return;
    setSky(to);
    setHover(null);
    setTip(null);
    if (reduce) {
      P.set(to ? 1 : 0);
      return;
    }
    animate(P, to ? 1 : 0, {
      duration: to ? 1.9 : 1.1,
      ease: to ? [0.33, 0, 0.2, 1] : [0.5, 0, 0.3, 1],
    });
    if (!to) animate(yaw, 0, { duration: 1.1, ease: [0.5, 0, 0.3, 1] });
    if (to) {
      sfx.whoosh(300, 1400, { dur: 0.9, gain: 0.05 });
      [523, 659, 784, 1047].forEach((f, i) => sfx.note(f, { at: 0.25 + i * 0.16, dur: 0.5, gain: 0.045, bell: 0.4 }));
    } else sfx.whoosh(1400, 300, { dur: 0.6, gain: 0.04 });
  };

  // ------------------------------------------------------------ drawing
  const geom = useRef<{ tops: Pt[][]; sides: Pt[][][]; order: number[] }>({
    tops: [],
    sides: [],
    order: [],
  });
  const state = useRef({
    hover,
    streakOn: streak != null,
    inStreak,
    cells,
    max,
    palette,
    WEEKS,
    narrow,
  });
  state.current = {
    hover,
    streakOn: streak != null,
    inStreak,
    cells,
    max,
    palette,
    WEEKS,
    narrow,
  };
  const glow = useRef<number[]>([]); // per cell, eases toward lit or dimmed
  const lift = useRef<number[]>([]); // per cell, the hovered one rises a little

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv || !inView) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    let last = performance.now();
    const t0 = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = state.current;
      const cw = cv.clientWidth;
      const ch = cv.clientHeight;
      if (cv.width !== Math.round(cw * dpr) || cv.height !== Math.round(ch * dpr)) {
        cv.width = Math.round(cw * dpr);
        cv.height = Math.round(ch * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cw, ch);
      const p = P.get();
      const e = ease(p);
      // the camera: a top-down view that tilts back and turns as p goes to 1
      const a = ((-14 * e + yaw.get() * e) * Math.PI) / 180;
      const b = (52 * e * Math.PI) / 180;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const cb = Math.cos(b);
      const sb = Math.sin(b);
      const Wk = st.WEEKS;
      const gx = Wk / 2;
      const gy = 3.5;
      const proj = (x: number, y: number, z: number): Pt => {
        const X = x - gx;
        const Y = y - gy;
        const xr = X * ca - Y * sa;
        const yr = X * sa + Y * ca;
        return [xr, yr * cb - z * sb];
      };
      const depth = (x: number, y: number) => (x - gx) * sa + (y - gy) * ca;
      // fit: the ground and the tallest tower must fit the box, leaving room for the labels
      const zMax = 4.9 * e;
      const corners = [
        proj(0, 0, 0),
        proj(Wk, 0, 0),
        proj(0, 7, 0),
        proj(Wk, 7, 0),
        proj(0, 0, zMax),
        proj(Wk, 0, zMax),
        proj(0, 7, zMax),
        proj(Wk, 7, zMax),
      ];
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const [x, y] of corners) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
      const padL = st.narrow ? 26 : 32;
      const padB = 22;
      const S = Math.min((cw - padL - 4) / (x1 - x0), (ch - padB - 6) / (y1 - y0));
      const ox = padL + (cw - padL - 4 - (x1 - x0) * S) / 2 - x0 * S;
      const oy = 4 + (ch - padB - 6 - (y1 - y0) * S) / 2 - y0 * S;
      const scr = (x: number, y: number, z: number): Pt => {
        const [u, v] = proj(x, y, z);
        return [ox + u * S, oy + v * S];
      };

      // the ground's shadow, once standing
      if (e > 0.02) {
        const g = [scr(-0.4, -0.4, 0), scr(Wk + 0.4, -0.4, 0), scr(Wk + 0.4, 7.4, 0), scr(-0.4, 7.4, 0)];
        ctx.save();
        ctx.globalAlpha = 0.55 * e;
        ctx.fillStyle = "#f2f3f5";
        ctx.shadowColor = "rgba(0,0,0,.18)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 10;
        ctx.beginPath();
        g.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      const cells = st.cells;
      const n = cells.length;
      if (glow.current.length !== n) glow.current = cells.map(() => 1);
      if (lift.current.length !== n) lift.current = cells.map(() => 0);
      const order = cells
        .map((_, i) => i)
        .sort((i, j) => depth(cells[i].w + 0.5, cells[i].d + 0.5) - depth(cells[j].w + 0.5, cells[j].d + 0.5));
      const tops: Pt[][] = new Array(n);
      const sides: Pt[][][] = new Array(n);
      const gap = 0.16 + 0.04 * e;
      const appear = reduce ? 1 : Math.min(1, (now - t0) / 700);
      // light comes from the upper left of the city
      const faces: [number, number, number][] = [
        [1, 0, 0.74],
        [-1, 0, 0.9],
        [0, 1, 0.62],
        [0, -1, 0.95],
      ];
      for (const i of order) {
        const c = cells[i];
        const want = st.streakOn ? (st.inStreak(i) ? 1 : 0.12) : st.hover != null ? (i === st.hover ? 1 : 0.82) : 1;
        glow.current[i] += (want - glow.current[i]) * Math.min(1, dt * 10);
        lift.current[i] += ((i === st.hover ? 1 : 0) - lift.current[i]) * Math.min(1, dt * 12);
        // the rise runs as a wave from the oldest week to today
        const wave = ease((p * 1.45 - (c.w / Wk) * 0.45) / 1);
        const hgt = (c.v > 0 ? 0.3 + (c.v / st.max) * 4.6 : 0.06) * wave + lift.current[i] * 0.35 * e;
        const xa = c.w + gap / 2;
        const xb = c.w + 1 - gap / 2;
        const ya = c.d + gap / 2;
        const yb = c.d + 1 - gap / 2;
        const top: Pt[] = [scr(xa, ya, hgt), scr(xb, ya, hgt), scr(xb, yb, hgt), scr(xa, yb, hgt)];
        tops[i] = top;
        const gl = glow.current[i] * appear;
        const base = mix(st.palette[c.lvl], "#eceef1", 1 - gl);
        sides[i] = [];
        ctx.globalAlpha = appear;
        // the sides that face us
        if (hgt > 0.02 && e > 0.01) {
          for (const [nx, ny, k] of faces) {
            if (nx * sa + ny * ca <= 0.001) continue;
            const q: Pt[] =
              nx === 1
                ? [scr(xb, ya, hgt), scr(xb, yb, hgt), scr(xb, yb, 0), scr(xb, ya, 0)]
                : nx === -1
                  ? [scr(xa, yb, hgt), scr(xa, ya, hgt), scr(xa, ya, 0), scr(xa, yb, 0)]
                  : ny === 1
                    ? [scr(xb, yb, hgt), scr(xa, yb, hgt), scr(xa, yb, 0), scr(xb, yb, 0)]
                    : [scr(xa, ya, hgt), scr(xb, ya, hgt), scr(xb, ya, 0), scr(xa, ya, 0)];
            sides[i].push(q);
            const g = ctx.createLinearGradient(q[0][0], q[0][1], q[3][0], q[3][1]);
            g.addColorStop(0, shade(base, k));
            g.addColorStop(1, shade(base, k * 0.8));
            ctx.fillStyle = g;
            ctx.beginPath();
            q.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.closePath();
            ctx.fill();
          }
        }
        // the top: rounded while it's a flat tile, crisp once it's a roof
        const r = (2.6 * (1 - e) + 0.6) * Math.min(1, S / 14);
        const cx = (top[0][0] + top[2][0]) / 2;
        const cy = (top[0][1] + top[2][1]) / 2;
        ctx.fillStyle = shade(base, 1 + 0.08 * e);
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineJoin = "round";
        ctx.lineWidth = r * 2;
        const span = Math.max(1, Math.hypot(top[2][0] - top[0][0], top[2][1] - top[0][1]));
        const ins = Math.min(0.45, (2.83 * r) / span);
        ctx.beginPath();
        top.forEach(([x, y], j) => {
          const px = x + (cx - x) * ins;
          const py = y + (cy - y) * ins;
          if (j) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // a lit edge along the roof, and a ring round the day under the pointer
        if (e > 0.2 && c.v > 0) {
          ctx.globalAlpha = gl * 0.55 * e;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(top[3][0], top[3][1]);
          ctx.lineTo(top[0][0], top[0][1]);
          ctx.lineTo(top[1][0], top[1][1]);
          ctx.stroke();
        }
        if (i === st.hover) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = "#1d1d1f";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          top.forEach(([x, y], j) => (j ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
          ctx.closePath();
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      geom.current = { tops, sides, order };

      // month and weekday labels, laid on the ground so they travel with it
      ctx.fillStyle = "#86868b";
      ctx.font = `${st.narrow ? 10 : 11}px -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      let lastMonth = -1;
      for (const c of cells) {
        if (c.d !== 0 && !(c.w === 0 && c.d === cells[0].d)) continue;
        const m = c.date.getMonth();
        if (m === lastMonth) continue;
        lastMonth = m;
        if (c.w > Wk - 2) continue;
        const [x, y] = scr(c.w + 0.1, 7.75 + 0.25 * e, 0);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1 - 0.25 * e;
        ctx.fillText(MON[m], x, y);
      }
      ctx.textAlign = "right";
      for (const d of [1, 3, 5]) {
        const [x, y] = scr(-0.35, d + 0.5, 0);
        ctx.globalAlpha = 1 - 0.6 * e;
        ctx.fillText(WD[d], x - 2, y);
      }
      ctx.globalAlpha = 1;

      // keep the label pinned over the day it's reading
      const hv = st.hover;
      if (hv != null && tops[hv]) {
        const tp = tops[hv];
        const tx = (tp[0][0] + tp[1][0] + tp[2][0] + tp[3][0]) / 4;
        const ty = Math.min(tp[0][1], tp[1][1], tp[2][1], tp[3][1]);
        tipPos.current = { x: tx, y: ty };
        tipEl.current?.style.setProperty("transform", `translate(${tx}px, ${ty - 8}px) translate(-50%, -100%)`);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [inView, P, yaw, reduce]);
  const tipEl = useRef<HTMLDivElement>(null);
  const tipPos = useRef({ x: 0, y: 0 });

  // ------------------------------------------------------------ pointing and dragging
  const pickAt = (x: number, y: number) => {
    const { tops, sides, order } = geom.current;
    for (let k = order.length - 1; k >= 0; k--) {
      const i = order[k];
      if (tops[i] && inPoly(x, y, tops[i])) return i;
      for (const q of sides[i] ?? []) if (inPoly(x, y, q)) return i;
    }
    return null;
  };
  const drag = useRef<{
    x: number;
    yaw: number;
    id: number;
    moved: boolean;
    t: number;
    v: number;
  } | null>(null);
  const setHoverCell = (i: number | null) => {
    setHover((h) => {
      if (i != null && i !== h) sfx.tick({ freq: 2200 + cells[i].lvl * 300, gain: 0.03 });
      return i;
    });
    setTip(i == null ? null : { x: 0, y: 0 });
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    const dg = drag.current;
    if (dg && dg.id === e.pointerId && sky) {
      const dx = e.clientX - dg.x;
      if (Math.abs(dx) > 3) dg.moved = true;
      if (dg.moved) {
        const now = performance.now();
        const ny = Math.max(-40, Math.min(40, dg.yaw + dx * 0.32));
        dg.v = ((ny - yaw.get()) / Math.max(1, now - dg.t)) * 1000;
        dg.t = now;
        yaw.set(ny);
        setHoverCell(null);
        return;
      }
    }
    if (e.pointerType === "mouse" || !sky) setHoverCell(pickAt(e.clientX - r.left, e.clientY - r.top));
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (!sky) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = {
      x: e.clientX,
      yaw: yaw.get(),
      id: e.pointerId,
      moved: false,
      t: performance.now(),
      v: 0,
    };
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const dg = drag.current;
    drag.current = null;
    if (!dg || dg.id !== e.pointerId) return;
    if (dg.moved) {
      // let it coast, then settle, within the limits
      const to = Math.max(-40, Math.min(40, yaw.get() + dg.v * 0.18));
      animate(yaw, to, {
        type: "spring",
        velocity: dg.v,
        stiffness: 90,
        damping: 20,
      });
    } else {
      const r = boxRef.current?.getBoundingClientRect();
      if (r) setHoverCell(pickAt(e.clientX - r.left, e.clientY - r.top));
    }
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const n = cells.length;
    let i = hover ?? n - 1;
    if (e.key === "ArrowLeft") i -= 7;
    else if (e.key === "ArrowRight") i += 7;
    else if (e.key === "ArrowUp") i -= 1;
    else if (e.key === "ArrowDown") i += 1;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = n - 1;
    else if (e.key === "Escape") return setHoverCell(null);
    else return;
    e.preventDefault();
    touched.current = true;
    setHoverCell(Math.max(0, Math.min(n - 1, i)));
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ toggle, setStreak, setHoverCell });
  ap.current = { toggle, setStreak, setHoverCell };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let sway: { stop: () => void } | null = null;
    const at = (ms: number, f: () => void) => timers.push(setTimeout(() => alive && !touched.current && f(), ms));
    const loop = () => {
      at(1600, () => ap.current.toggle(true));
      at(
        3800,
        () =>
          (sway = animate(yaw, [0, 22, -18, 0], {
            duration: 7,
            ease: "easeInOut",
          })),
      );
      at(5600, () => ap.current.setStreak("now"));
      at(8000, () => ap.current.setStreak(null));
      at(11400, () => ap.current.toggle(false));
      at(13400, () => ap.current.setStreak("long"));
      at(15400, () => ap.current.setStreak(null));
      at(16400, loop);
    };
    loop();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      sway?.stop();
    };
  }, [autoplay, inView, reduce, yaw]);

  const hc = hover != null ? cells[hover] : null;
  const days = (a: { from: number; to: number }) => Math.max(0, a.to - a.from + 1);
  const chips: {
    id: "long" | "now" | "best";
    icon: string;
    label: string;
    value: string;
  }[] = [
    {
      id: "now",
      icon: I.flame,
      label: "Current streak",
      value: `${days(current)} days`,
    },
    {
      id: "long",
      icon: I.trophy,
      label: "Longest streak",
      value: `${days(longest)} days`,
    },
    {
      id: "best",
      icon: I.star,
      label: "Busiest day",
      value: `${cells[best]?.v ?? 0} on ${MON[cells[best]?.date.getMonth() ?? 0]} ${cells[best]?.date.getDate() ?? 0}`,
    },
  ];

  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[980px] overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${narrow ? "p-4" : "p-6"} ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
      }}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={`truncate font-semibold tracking-[-0.022em] ${narrow ? "text-[19px]" : "text-[22px]"}`}>
            {title}
          </h3>
          <p className="truncate text-[13px] text-[#6e6e73]">
            <b className="font-semibold tabular-nums text-[#1d1d1f]">{total.toLocaleString("en-US")}</b>{" "}
            {narrow ? "in the last six months" : `${noun[1]} in the last year`}
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="View"
          className="relative flex shrink-0 rounded-full bg-[#f2f2f4] p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,.06)]"
        >
          {[
            { on: false, label: "Grid", icon: I.grid },
            { on: true, label: "Skyline", icon: I.city },
          ].map((o) => {
            const active = o.on === sky;
            return (
              <button
                key={o.label}
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => toggle(o.on)}
                onKeyDown={(e) => {
                  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
                    e.preventDefault();
                    toggle(!sky);
                    const sib =
                      (e.currentTarget.parentElement?.children[sky ? 0 : 1] as HTMLElement | undefined) ?? null;
                    sib?.focus();
                  }
                }}
                className={`relative z-0 flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${active ? "text-[#1d1d1f]" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
              >
                {active && (
                  <motion.span
                    layoutId={`${uid}-seg`}
                    className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_3px_8px_-2px_rgba(0,0,0,.12)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38 }}
                  />
                )}
                <Ico d={o.icon} size={13} />
                {!tiny && o.label}
                {tiny && <span className="sr-only">{o.label}</span>}
              </button>
            );
          })}
        </div>
      </header>

      <motion.div
        ref={boxRef}
        tabIndex={0}
        role="img"
        aria-label={`${title}: ${total} ${noun[1]}. Use the arrow keys to read each day.`}
        className={`relative mt-4 select-none rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 ${sky ? "cursor-grab active:cursor-grabbing" : "cursor-default"} touch-pan-y`}
        style={{ height: H }}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={seen ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (drag.current = null)}
        onPointerLeave={(e) => e.pointerType === "mouse" && !drag.current && setHoverCell(null)}
        onKeyDown={onKey}
        onBlur={() => setHoverCell(null)}
      >
        <canvas ref={cvRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <div
          ref={tipEl}
          className="pointer-events-none absolute left-0 top-0 z-10"
          style={{
            transform: `translate(${tipPos.current.x}px, ${tipPos.current.y - 8}px) translate(-50%, -100%)`,
          }}
        >
          <AnimatePresence>
            {hc && tip && (
              <motion.div
                key="tip"
                className="whitespace-nowrap rounded-[11px] bg-[#1d1d1f]/90 px-2.5 py-1.5 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)] backdrop-blur-md"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.14 }}
              >
                <span className="block text-[13px] font-semibold tabular-nums">
                  {hc.v === 0 ? "Nothing" : `${hc.v} ${hc.v === 1 ? noun[0] : noun[1]}`}
                </span>
                <span className="block text-[11px] text-white/60">{longDate(hc.date)}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className={`mt-4 flex flex-wrap items-center gap-2 ${narrow ? "" : "justify-between"}`}>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={streak === c.id}
              aria-label={`${c.label}: ${c.value}`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setStreak(c.id)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setStreak(null)}
              onFocus={() => setStreak(c.id)}
              onBlur={() => setStreak(null)}
              onClick={() => setStreak((s) => (s === c.id ? null : c.id))}
              className={`flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3 text-[12.5px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${streak === c.id ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ececef]"}`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full ${c.id === "now" ? "text-[#ff9f0a]" : c.id === "long" ? "text-[#ffcc00]" : "text-[#30d158]"} ${streak === c.id ? "bg-white/15" : "bg-white"}`}
              >
                <Ico d={c.icon} size={11} />
              </span>
              {!tiny && <span className={streak === c.id ? "text-white/70" : "text-[#6e6e73]"}>{c.label}</span>}
              <span className="font-semibold tabular-nums">
                {tiny ? `${c.label.split(" ")[0]} ${c.value}` : c.value}
              </span>
            </button>
          ))}
        </div>
        {!narrow && (
          <div className="flex items-center gap-1.5 text-[11.5px] text-[#86868b]" aria-hidden="true">
            Less
            {palette.map((c) => (
              <span key={c} className="h-[11px] w-[11px] rounded-[3px]" style={{ background: c }} />
            ))}
            More
          </div>
        )}
      </div>
    </div>
  );
}
```

--- components/contribution-skyline/index.ts ---

```ts
export { default as ContributionSkyline } from "./contribution-skyline";
export type { ContributionSkylineProps } from "./contribution-skyline";
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
