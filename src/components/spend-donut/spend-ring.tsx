"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SpendTxn = { name: string; date: string; amount: number };
export type SpendCategory = {
  id: string;
  label: string;
  color: string;
  icon?: keyof typeof I;
  budget: number;
  months: number[];
  txns: SpendTxn[];
};
export type SpendRingProps = {
  title?: string;
  /** month names, oldest first; each category's `months` lines up with these */
  monthNames?: string[];
  categories?: SpendCategory[];
  currency?: string;
  onSelect?: (category: SpendCategory | null) => void;
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
  cart: "m239.71 74.14l-25.64 92.28A24.06 24.06 0 0 1 191 184H92.16A24.06 24.06 0 0 1 69 166.42L33.92 40H16a8 8 0 0 1 0-16h24a8 8 0 0 1 7.71 5.86L57.19 64H232a8 8 0 0 1 7.71 10.14M88 200a16 16 0 1 0 16 16a16 16 0 0 0-16-16m104 0a16 16 0 1 0 16 16a16 16 0 0 0-16-16",
  dining:
    "M216 40v184a8 8 0 0 1-16 0v-48h-48a8 8 0 0 1-8-8a268.8 268.8 0 0 1 7.22-56.88c9.78-40.49 28.32-67.63 53.63-78.47A8 8 0 0 1 216 40m-96.11-1.31a8 8 0 1 0-15.78 2.63L111.89 88H88V40a8 8 0 0 0-16 0v48H48.11l7.78-46.68a8 8 0 1 0-15.78-2.63l-8 48A8 8 0 0 0 32 88a48.07 48.07 0 0 0 40 47.32V224a8 8 0 0 0 16 0v-88.68A48.07 48.07 0 0 0 128 88a8 8 0 0 0-.11-1.31Z",
  transport:
    "M184 24H72a32 32 0 0 0-32 32v128a32 32 0 0 0 32 32h8l-14.4 19.2a8 8 0 1 0 12.8 9.6L100 216h56l21.6 28.8a8 8 0 1 0 12.8-9.6L176 216h8a32 32 0 0 0 32-32V56a32 32 0 0 0-32-32M84 184a12 12 0 1 1 12-12a12 12 0 0 1-12 12m36-64H56V80h64Zm52 64a12 12 0 1 1 12-12a12 12 0 0 1-12 12m28-64h-64V80h64Z",
  shopping:
    "M216 64h-40a48 48 0 0 0-96 0H40a16 16 0 0 0-16 16v120a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16m-88-32a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32",
  bills:
    "m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z",
  travel:
    "M215.52 197.26a8 8 0 0 1-1.86 8.39l-24 24A8 8 0 0 1 184 232a7 7 0 0 1-.79 0a8 8 0 0 1-5.87-3.52l-44.07-66.12L112 183.59V208a8 8 0 0 1-2.34 5.65s-14 14.06-15.88 15.88a7.9 7.9 0 0 1-2.78 1.88a8 8 0 0 1-10.41-4.35l-.06-.15l-14.7-36.76L29 175.42a8 8 0 0 1-2.69-13.08l16-16A8 8 0 0 1 48 144h24.4l21.27-21.27l-66.11-44.08a8 8 0 0 1-1.22-12.32l24-24a8 8 0 0 1 8.39-1.86l85.94 31.25l31.53-31.53a28 28 0 0 1 39.6 39.6l-31.53 31.53Z",
  left: "M168.49 199.51a12 12 0 0 1-17 17l-80-80a12 12 0 0 1 0-17l80-80a12 12 0 0 1 17 17L97 128Z",
  right: "m184.49 136.49l-80 80a12 12 0 0 1-17-17L159 128L87.51 56.49a12 12 0 1 1 17-17l80 80a12 12 0 0 1-.02 17",
  back: "M228 128a12 12 0 0 1-12 12H69l51.52 51.51a12 12 0 0 1-17 17l-72-72a12 12 0 0 1 0-17l72-72a12 12 0 0 1 17 17L69 116h147a12 12 0 0 1 12 12",
};
const Ico = ({ d, size, style }: { d: string; size: number; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 256 256"
    width={size}
    height={size}
    style={{ display: "block", flex: "none", ...style }}
    aria-hidden="true"
  >
    <path fill="currentColor" d={d} />
  </svg>
);

const MONTHS = ["September", "October", "November"];
const DEFAULT_CATEGORIES: SpendCategory[] = [
  {
    id: "bills",
    label: "Bills",
    color: "#5e5ce6",
    icon: "bills",
    budget: 900,
    months: [790, 812, 820],
    txns: [
      { name: "Rent share", date: "Nov 1", amount: 640 },
      { name: "Electricity", date: "Nov 4", amount: 96 },
      { name: "Fibre broadband", date: "Nov 6", amount: 48 },
      { name: "Phone plan", date: "Nov 9", amount: 36 },
    ],
  },
  {
    id: "groceries",
    label: "Groceries",
    color: "#30d158",
    icon: "cart",
    budget: 700,
    months: [540, 588, 612],
    txns: [
      { name: "Corner Market", date: "Nov 14", amount: 86.4 },
      { name: "Saturday farmers market", date: "Nov 9", amount: 42 },
      { name: "Fresh & Co", date: "Nov 7", amount: 128.6 },
      { name: "Weekly shop", date: "Nov 2", amount: 355 },
    ],
  },
  {
    id: "dining",
    label: "Dining",
    color: "#ff9f0a",
    icon: "dining",
    budget: 400,
    months: [380, 296, 423],
    txns: [
      { name: "Noodle bar with Kofi", date: "Nov 15", amount: 64 },
      { name: "Brunch at Ottie's", date: "Nov 10", amount: 38.5 },
      { name: "Coffee, the whole month", date: "Nov 1", amount: 92.5 },
      { name: "Lena's birthday dinner", date: "Nov 8", amount: 228 },
    ],
  },
  {
    id: "shopping",
    label: "Shopping",
    color: "#ff375f",
    icon: "shopping",
    budget: 300,
    months: [210, 410, 355],
    txns: [
      { name: "Running shoes", date: "Nov 12", amount: 149 },
      { name: "Linen shirt", date: "Nov 5", amount: 78 },
      { name: "Desk lamp", date: "Nov 3", amount: 128 },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    color: "#0a84ff",
    icon: "travel",
    budget: 500,
    months: [0, 640, 260],
    txns: [
      { name: "Train to the coast", date: "Nov 13", amount: 112 },
      { name: "Cabin, one night", date: "Nov 13", amount: 148 },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    color: "#64d2ff",
    icon: "transport",
    budget: 250,
    months: [196, 230, 218],
    txns: [
      { name: "Monthly pass", date: "Nov 1", amount: 165 },
      { name: "Late taxi home", date: "Nov 8", amount: 31 },
      { name: "Bike repair", date: "Nov 11", amount: 22 },
    ],
  },
];

const SIZE = 300;
const C = SIZE / 2;
const R = 112;
const BASE = 20;
const FAT = 34;
const GAP = 0.05; // radians of clear space between the rounded ends of two arcs
const SAMPLES = 48;
// where the arc unwinds to: a budget bar across the top
const BAR_Y = 40;
const BAR_X0 = 26;
const BAR_W = SIZE - 52;

const money = (n: number, cur: string) =>
  `${cur}${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

/** each digit is a reel that rolls to its new value; columns are keyed from the right so they keep their identity */
function Roll({ text, reduce, style }: { text: string; reduce: boolean; style?: CSSProperties }) {
  const chars = [...text];
  return (
    <span
      aria-label={text}
      style={{
        display: "inline-flex",
        fontVariantNumeric: "tabular-nums",
        ...style,
      }}
    >
      {chars.map((ch, i) => {
        const key = chars.length - i;
        if (!/\d/.test(ch))
          return (
            <span key={`s${key}${ch}`} aria-hidden="true">
              {ch}
            </span>
          );
        return (
          <span
            key={`d${key}`}
            aria-hidden="true"
            style={{
              position: "relative",
              display: "inline-block",
              height: "1.15em",
              overflow: "hidden",
              lineHeight: 1.15,
            }}
          >
            <motion.span
              initial={false}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 210,
                      damping: 22,
                      mass: 0.6 + (key % 3) * 0.12,
                    }
              }
              style={{ display: "flex", flexDirection: "column" }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} style={{ height: "1.15em" }}>
                  {d}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

type Spring = { x: number; v: number };
const step = (s: Spring, target: number, k: number, d: number, dt: number) => {
  s.v += ((target - s.x) * k - s.v * d) * dt;
  s.x += s.v * dt;
};

/**
 * A month of spending as a ring. Each category is an arc in its own colour, sized by what you spent. Point at one and
 * it swells: the arc thickens and grows round the ring on a spring, pushing its neighbours aside, while the total in
 * the middle rolls to that category's figure. Click it and the arc peels off the ring and unwinds into a straight bar
 * across the top, your spend against that category's budget, and its transactions drop in underneath; Back winds it
 * round again. Change month and every arc springs to its new share while the digits roll. Arrow keys move between
 * categories, Enter opens one, Escape closes it.
 */
export default function SpendRing({
  title = "Spending",
  monthNames = MONTHS,
  categories = DEFAULT_CATEGORIES,
  currency = "$",
  onSelect,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: SpendRingProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [month, setMonth] = useState(monthNames.length - 1);
  const [hover, setHover] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const live = useRef({ month, hover, open, reduce });
  live.current = { month, hover, open, reduce };
  const total = categories.reduce((a, c) => a + (c.months[month] ?? 0), 0);
  const shown = open ?? hover;
  const cat = shown !== null ? categories[shown] : null;
  const prev = month > 0 ? categories.reduce((a, c) => a + (c.months[month - 1] ?? 0), 0) : null;
  const centerValue = cat ? (cat.months[month] ?? 0) : total;

  // per arc: share of the ring, how swollen it is, and the unwinding of the open one
  const st = useRef(
    categories.map((c) => ({
      amt: { x: c.months[month] ?? 0, v: 0 },
      k: { x: 0, v: 0 },
      fade: { x: 1, v: 0 },
    })),
  );
  const unwind = useRef({ x: 0, v: 0 });
  const spin = useRef({ x: 0, v: 0 });
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const hits = useRef<(SVGPathElement | null)[]>([]);
  const icons = useRef<(SVGGElement | null)[]>([]);
  const track = useRef<SVGPathElement | null>(null);
  const geo = useRef<{ a0: number; a1: number }[]>([]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const arcPts = (a0: number, a1: number, r: number) => {
      const pts: number[][] = [];
      for (let j = 0; j <= SAMPLES; j++) {
        const a = a0 + ((a1 - a0) * j) / SAMPLES;
        pts.push([C + Math.cos(a) * r, C + Math.sin(a) * r]);
      }
      return pts;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const L = live.current;
      const S = st.current;
      const snap = L.reduce;
      S.forEach((s, i) => {
        const want = categories[i].months[L.month] ?? 0;
        const hot = (L.open ?? L.hover) === i ? 1 : 0;
        if (snap) {
          s.amt.x = want;
          s.k.x = hot;
          s.fade.x = L.open === null || L.open === i ? 1 : 0;
          return;
        }
        step(s.amt, want, 90, 15, dt);
        step(s.k, hot, 260, 18, dt);
        step(s.fade, L.open === null || L.open === i ? 1 : 0, 160, 22, dt);
      });
      if (snap) unwind.current.x = L.open !== null ? 1 : 0;
      else step(unwind.current, L.open !== null ? 1 : 0, 120, 19, dt);
      step(spin.current, 0, 60, 12, dt);
      // shares: a swollen arc takes a bigger slice
      const w = S.map((s) => Math.max(0, s.amt.x) * (1 + 0.32 * Math.max(0, s.k.x)) + 0.0001);
      const sum = w.reduce((a, b) => a + b, 0);
      // the gap after each arc leaves room for both rounded ends, so swollen arcs push their neighbours away
      const widthOf = (s: (typeof S)[number]) => BASE + (FAT - BASE) * Math.max(0, s.k.x);
      const gaps = S.map((s, i) => {
        if (s.amt.x <= 1) return 0;
        let j = (i + 1) % S.length;
        while (S[j].amt.x <= 1 && j !== i) j = (j + 1) % S.length;
        return (widthOf(s) + widthOf(S[j])) / 2 / R + GAP;
      });
      const room = Math.PI * 2 - gaps.reduce((x, y) => x + y, 0);
      let a = -Math.PI / 2 + spin.current.x - gaps[gaps.length - 1] / 2;
      const u = unwind.current.x;
      geo.current = [];
      S.forEach((s, i) => {
        const span = (w[i] / sum) * room;
        const a0 = a;
        const a1 = a + span;
        a = a1 + gaps[i];
        geo.current[i] = { a0, a1 };
        const p = paths.current[i];
        const h = hits.current[i];
        const ic = icons.current[i];
        if (!p) return;
        const k = Math.max(0, s.k.x);
        const width = BASE + (FAT - BASE) * k;
        const tooThin = span < 0.02;
        let d: string;
        if (L.open === i && u > 0.001) {
          // peel off from the start: each point lets go a little after the one before it
          const share = Math.min(1, (categories[i].months[L.month] ?? 0) / Math.max(1, categories[i].budget));
          const pts = arcPts(a0, a1, R).map(([x, y], j) => {
            const f = j / SAMPLES;
            const t = Math.max(0, Math.min(1, u * 1.7 - f * 0.7));
            const e = t * t * (3 - 2 * t);
            return [x + (BAR_X0 + BAR_W * share * f - x) * e, y + (BAR_Y - y) * e];
          });
          d = "M" + pts.map((q) => q.map((v) => v.toFixed(2)).join(" ")).join(" L");
          p.setAttribute("stroke-width", String(width + (12 - width) * u));
        } else {
          const r0 = R;
          const large = a1 - a0 > Math.PI ? 1 : 0;
          d = tooThin
            ? ""
            : `M${(C + Math.cos(a0) * r0).toFixed(2)} ${(C + Math.sin(a0) * r0).toFixed(2)} A${r0} ${r0} 0 ${large} 1 ${(C + Math.cos(a1) * r0).toFixed(2)} ${(C + Math.sin(a1) * r0).toFixed(2)}`;
          p.setAttribute("stroke-width", String(width));
        }
        p.setAttribute("d", d);
        // pale until it's the one you're looking at
        const anyHot = L.open !== null || L.hover !== null;
        const op = (anyHot ? 0.28 + 0.72 * k : 0.85) * Math.max(0, s.fade.x);
        p.setAttribute("stroke-opacity", op.toFixed(3));
        if (h) {
          h.setAttribute("d", d);
          h.style.display = L.open !== null || tooThin ? "none" : "";
        }
        if (ic) {
          const mid = (a0 + a1) / 2;
          const show = span > 0.32 && L.open === null ? 1 : 0;
          const sc = (0.9 + 0.35 * k) * (show ? 1 : 0.001);
          ic.setAttribute(
            "transform",
            `translate(${(C + Math.cos(mid) * R).toFixed(2)} ${(C + Math.sin(mid) * R).toFixed(2)}) scale(${sc.toFixed(3)})`,
          );
          ic.style.color = op > 0.5 ? "#fff" : categories[i].color;
          ic.style.opacity = String(Math.max(0, s.fade.x) * (1 - u));
        }
      });
      if (track.current) track.current.setAttribute("stroke-opacity", (Math.max(0, u - 0.4) * 0.16).toFixed(3));
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [categories]);

  const point = (i: number | null) => {
    if (i === live.current.hover) return;
    setHover(i);
    if (i !== null) sfx.tick({ freq: 1800 + i * 260, gain: 0.03 });
  };
  const openCat = (i: number) => {
    setOpen(i);
    setHover(null);
    onSelect?.(categories[i]);
    sfx.whoosh(600, 2600, { dur: 0.45, gain: 0.045 });
    sfx.note(659, { at: 0.12, dur: 0.3, gain: 0.04, bell: 0.5 });
  };
  const close = () => {
    setOpen(null);
    onSelect?.(null);
    sfx.whoosh(2600, 700, { dur: 0.45, gain: 0.04 });
  };
  const goMonth = (m: number) => {
    if (m < 0 || m >= monthNames.length || m === month) return;
    setMonth(m);
    spin.current.v += (m > month ? 1 : -1) * -2.2;
    sfx.whoosh(1200, 2200, { dur: 0.3, gain: 0.03 });
    for (let k = 0; k < 4; k++) sfx.tick({ at: 0.05 + k * 0.045, freq: 2400 + k * 300, gain: 0.02 });
  };

  // autoplay: point round the ring, open one, close it, change month
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const [ghost, setGhost] = useState(false);
  const [ghostDown, setGhostDown] = useState(false);
  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    const go = async (x: number, y: number, ms = 600) => {
      setGhost(true);
      await Promise.all([
        animate(gx, x, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
        animate(gy, y, { duration: ms / 1000, ease: [0.4, 0, 0.2, 1] }),
      ]);
    };
    const tap = async () => {
      setGhostDown(true);
      await wait(120);
      setGhostDown(false);
    };
    const arcAt = (i: number) => {
      const s = svg.current;
      const c = card.current;
      const g = geo.current[i];
      if (!s || !c || !g) return [0, 0] as const;
      const r = s.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      const k = r.width / SIZE;
      const mid = (g.a0 + g.a1) / 2;
      return [r.left - cb.left + (C + Math.cos(mid) * R) * k, r.top - cb.top + (C + Math.sin(mid) * R) * k] as const;
    };
    const el = (sel: string) => {
      const c = card.current;
      const e = c?.querySelector(sel);
      if (!c || !e) return [0, 0] as const;
      const r = e.getBoundingClientRect();
      const cb = c.getBoundingClientRect();
      return [r.left - cb.left + r.width / 2, r.top - cb.top + r.height / 2] as const;
    };
    const run = async () => {
      await wait(1300);
      let n = 0;
      while (ok()) {
        for (const i of [1, 2, 3, 0]) {
          if (!ok()) return;
          await go(...arcAt(i), 520);
          point(i);
          await wait(850);
        }
        if (!ok()) return;
        const pick = [2, 1, 4][n % 3];
        await go(...arcAt(pick), 500);
        point(pick);
        await wait(500);
        await tap();
        openCat(pick);
        await wait(3200);
        if (!ok()) return;
        await go(...el("[data-back]"));
        await tap();
        close();
        await wait(1500);
        if (!ok()) return;
        point(null);
        await go(...el(month > 0 || n % 2 ? "[data-prev]" : "[data-next]"));
        await tap();
        goMonth(live.current.month > 0 ? live.current.month - 1 : live.current.month + 1);
        await wait(1500);
        await tap();
        goMonth(monthNames.length - 1);
        await wait(1400);
        setGhost(false);
        await wait(1200);
        n++;
      }
    };
    run().catch((err) => {
      // torn down mid-step (the tile scrolled away): its elements are gone, so there is nothing to report
      if (alive) throw err;
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const delta = prev !== null && !cat ? total - prev : null;
  const sorted = useMemo(
    () => (open !== null ? [...categories[open].txns].sort((a, b) => b.amount - a.amount) : []),
    [open, categories],
  );
  const oc = open !== null ? categories[open] : null;

  return (
    <div
      className={`relative w-full max-w-[380px] select-none ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
        color: "#1d1d1f",
      }}
    >
      <div
        ref={card}
        onPointerDown={(e) => e.isTrusted && (touched.current = true)}
        onKeyDown={(e) => {
          touched.current = true;
          if (e.key === "Escape" && open !== null) close();
        }}
        style={{
          position: "relative",
          borderRadius: 30,
          background: "#fff",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -34px rgba(0,0,0,0.35)",
          padding: "20px 20px 18px",
          overflow: "hidden",
        }}
      >
        {/* header: month switcher */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 34,
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {oc ? (
              <motion.button
                key="back"
                data-back
                type="button"
                onClick={close}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: 0,
                  background: "#f5f5f7",
                  borderRadius: 17,
                  height: 34,
                  padding: "0 14px 0 11px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1d1d1f",
                  cursor: "pointer",
                }}
              >
                <Ico d={I.back} size={14} />
                All spending
              </motion.button>
            ) : (
              <motion.div
                key="title"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button
              type="button"
              data-prev
              aria-label="Previous month"
              disabled={month === 0}
              onClick={() => goMonth(month - 1)}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                border: 0,
                background: "transparent",
                color: month === 0 ? "#d2d2d7" : "#6e6e73",
                display: "grid",
                placeItems: "center",
                cursor: month === 0 ? "default" : "pointer",
              }}
            >
              <Ico d={I.left} size={13} />
            </button>
            <div
              style={{
                position: "relative",
                width: 86,
                height: 20,
                overflow: "hidden",
                textAlign: "center",
                fontSize: 13.5,
                fontWeight: 600,
                color: "#3a3a3c",
              }}
            >
              <AnimatePresence initial={false} custom={month}>
                <motion.span
                  key={month}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ position: "absolute", inset: 0 }}
                >
                  {monthNames[month]}
                </motion.span>
              </AnimatePresence>
            </div>
            <button
              type="button"
              data-next
              aria-label="Next month"
              disabled={month === monthNames.length - 1}
              onClick={() => goMonth(month + 1)}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                border: 0,
                background: "transparent",
                color: month === monthNames.length - 1 ? "#d2d2d7" : "#6e6e73",
                display: "grid",
                placeItems: "center",
                cursor: month === monthNames.length - 1 ? "default" : "pointer",
              }}
            >
              <Ico d={I.right} size={13} />
            </button>
          </div>
        </div>

        {/* the ring */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: SIZE,
            margin: "4px auto 0",
            aspectRatio: "1",
          }}
        >
          <svg
            ref={svg}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width="100%"
            height="100%"
            style={{ display: "block", overflow: "visible" }}
            role="group"
            aria-label={`${title}, ${monthNames[month]}`}
          >
            {/* the budget track the open arc unwinds onto */}
            <path
              ref={track}
              d={`M${BAR_X0} ${BAR_Y} L${BAR_X0 + BAR_W} ${BAR_Y}`}
              stroke="#1d1d1f"
              strokeOpacity={0}
              strokeWidth={12}
              strokeLinecap="round"
              fill="none"
            />
            {categories.map((c, i) => (
              <path
                key={c.id}
                ref={(e) => void (paths.current[i] = e)}
                stroke={c.color}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {categories.map((c, i) => (
              <g key={c.id} ref={(e) => void (icons.current[i] = e)} style={{ pointerEvents: "none" }}>
                {c.icon && <path d={I[c.icon]} transform="translate(-7 -7) scale(0.0547)" fill="currentColor" />}
              </g>
            ))}
            {/* fat invisible arcs to point at */}
            {categories.map((c, i) => (
              <path
                key={c.id}
                ref={(e) => void (hits.current[i] = e)}
                role="button"
                tabIndex={0}
                aria-label={`${c.label}: ${money(c.months[month] ?? 0, currency)}`}
                stroke="transparent"
                strokeWidth={FAT + 12}
                fill="none"
                onPointerEnter={() => point(i)}
                onPointerLeave={() => point(null)}
                onFocus={() => point(i)}
                onBlur={() => point(null)}
                onClick={() => {
                  touched.current = true;
                  openCat(i);
                }}
                onKeyDown={(e) => {
                  touched.current = true;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCat(i);
                  } else if (
                    e.key === "ArrowRight" ||
                    e.key === "ArrowDown" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowUp"
                  ) {
                    e.preventDefault();
                    const j =
                      (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : categories.length - 1)) %
                      categories.length;
                    hits.current[j]?.focus({ preventScroll: true });
                  }
                }}
                style={{
                  cursor: "pointer",
                  outline: "none",
                  pointerEvents: "stroke",
                }}
              />
            ))}
          </svg>
          {/* the middle */}
          <AnimatePresence>
            {open === null && (
              <motion.div
                key="mid"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  transition: { duration: 0.15 },
                }}
                aria-live="polite"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    height: 18,
                    width: 160,
                    overflow: "hidden",
                    textAlign: "center",
                  }}
                >
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={cat?.id ?? "total"}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 30,
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        fontSize: 13,
                        fontWeight: 600,
                        color: cat ? cat.color : "#86868b",
                        filter: cat ? "brightness(0.85)" : undefined,
                      }}
                    >
                      {cat ? cat.label : `Spent in ${monthNames[month]}`}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <Roll
                  text={money(Math.round(centerValue), currency)}
                  reduce={reduce}
                  style={{
                    fontSize: 40,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    marginTop: 2,
                  }}
                />
                <div
                  style={{
                    height: 18,
                    fontSize: 12.5,
                    color: "#86868b",
                    marginTop: 2,
                  }}
                >
                  {cat ? (
                    `${Math.round(((cat.months[month] ?? 0) / Math.max(1, total)) * 100)}% of the month`
                  ) : delta !== null ? (
                    <span
                      style={{
                        color: delta > 0 ? "#d70015" : "#248a3d",
                        fontWeight: 600,
                      }}
                    >{`${delta > 0 ? "Up" : "Down"} ${money(Math.abs(Math.round(delta)), currency)} on ${monthNames[month - 1]}`}</span>
                  ) : (
                    "Point at a slice"
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* opened: the budget line's labels and the transactions */}
          <AnimatePresence>
            {oc && (
              <motion.div
                key={oc.id}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { delay: reduce ? 0 : 0.35 },
                }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${(BAR_X0 / SIZE) * 100}%`,
                    right: `${(BAR_X0 / SIZE) * 100}%`,
                    top: `${((BAR_Y + 14) / SIZE) * 100}%`,
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    color: "#86868b",
                  }}
                >
                  <span>
                    <b style={{ color: "#1d1d1f", fontWeight: 650 }}>{money(oc.months[month] ?? 0, currency)}</b> of{" "}
                    {money(oc.budget, currency)}
                  </span>
                  <span
                    style={{
                      color: (oc.months[month] ?? 0) > oc.budget ? "#d70015" : "#248a3d",
                      fontWeight: 600,
                    }}
                  >
                    {(oc.months[month] ?? 0) > oc.budget
                      ? `${money((oc.months[month] ?? 0) - oc.budget, currency)} over`
                      : `${money(oc.budget - (oc.months[month] ?? 0), currency)} left`}
                  </span>
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: 6,
                    right: 6,
                    top: `${((BAR_Y + 42) / SIZE) * 100}%`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 10,
                        background: oc.color,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {oc.icon && <Ico d={I[oc.icon]} size={16} />}
                    </span>
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {oc.label}
                    </span>
                  </div>
                  {sorted.map((t, k) => (
                    <motion.div
                      key={t.name}
                      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: reduce ? 0 : 0.45 + k * 0.06,
                        type: "spring",
                        stiffness: 300,
                        damping: 26,
                        filter: {
                          duration: 0.3,
                          delay: reduce ? 0 : 0.45 + k * 0.06,
                        },
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 2px",
                        borderTop: k ? "1px solid rgba(0,0,0,0.06)" : "none",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 550,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {t.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#86868b" }}>{t.date}</div>
                      </div>
                      <div
                        style={{
                          width: 54,
                          height: 5,
                          borderRadius: 3,
                          background: "#f0f0f3",
                          overflow: "hidden",
                        }}
                      >
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: t.amount / Math.max(...sorted.map((x) => x.amount)),
                          }}
                          transition={{
                            delay: reduce ? 0 : 0.55 + k * 0.06,
                            type: "spring",
                            stiffness: 200,
                            damping: 22,
                          }}
                          style={{
                            height: "100%",
                            background: oc.color,
                            transformOrigin: "0 50%",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: 70,
                          textAlign: "right",
                          fontSize: 14,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {money(t.amount, currency)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* legend */}
        <motion.div
          animate={{
            opacity: open === null ? 1 : 0,
            y: open === null ? 0 : 10,
          }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px 12px",
            marginTop: 8,
            pointerEvents: open === null ? "auto" : "none",
          }}
        >
          {categories.map((c, i) => (
            <button
              key={c.id}
              type="button"
              tabIndex={-1}
              onPointerEnter={() => point(i)}
              onPointerLeave={() => point(null)}
              onClick={() => openCat(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: 0,
                background: hover === i ? "#f5f5f7" : "transparent",
                borderRadius: 10,
                padding: "6px 8px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: c.color,
                  flex: "none",
                }}
              />
              <span style={{ flex: 1, fontSize: 13, color: "#3a3a3c" }}>{c.label}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {money(c.months[month] ?? 0, currency)}
              </span>
            </button>
          ))}
        </motion.div>

        {ghost && (
          <motion.span
            aria-hidden="true"
            animate={{ scale: ghostDown ? 0.78 : 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 26 }}
            style={{
              position: "absolute",
              left: -13,
              top: -13,
              x: gx,
              y: gy,
              width: 26,
              height: 26,
              borderRadius: 13,
              background: "rgba(29,29,31,0.18)",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.85), 0 6px 14px -4px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 9,
            }}
          />
        )}
      </div>
    </div>
  );
}
