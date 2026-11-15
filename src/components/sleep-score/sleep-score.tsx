"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import {
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type SleepStage = "awake" | "rem" | "core" | "deep";
export type SleepNight = {
  /** e.g. "Tue, Nov 11" */
  label: string;
  /** minutes after 6 pm that you fell asleep */
  start: number;
  /** the night, as [stage, minutes] in order */
  stages: [SleepStage, number][];
  /** how far bedtime was from your usual, in minutes (negative is earlier) */
  bedtimeShift: number;
};
export type SleepScoreProps = {
  nights?: SleepNight[];
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
  moon: "M240 96a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0v-16h-16a8 8 0 0 1 0-16h16V72a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8m-96-40h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16m65.14 94.33A88.07 88.07 0 0 1 105.67 46.86a8 8 0 0 0-10.6-9.06A96 96 0 1 0 218.2 160.93a8 8 0 0 0-9.06-10.6",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

const STAGE: Record<SleepStage, { label: string; color: string; row: number }> = {
  awake: { label: "Awake", color: "#ffad66", row: 0 },
  rem: { label: "REM", color: "#7dd3fc", row: 1 },
  core: { label: "Core", color: "#5b8cff", row: 2 },
  deep: { label: "Deep", color: "#8b6cff", row: 3 },
};
const ORDER: SleepStage[] = ["awake", "rem", "core", "deep"];

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
// a night built the way sleep goes: about five cycles, deep sleep early, REM growing toward morning, a few brief wakings
function makeNight(seed: number, label: string, quality: number): SleepNight {
  const r = rng(seed);
  const stages: [SleepStage, number][] = [];
  const cycles = quality > 0.78 ? 5 : quality > 0.6 ? 4 + Math.round(r()) : 4;
  for (let c = 0; c < cycles; c++) {
    const early = 1 - c / cycles;
    stages.push(["core", Math.round(24 + r() * 16)]);
    const deep = Math.round((16 + r() * 24) * early * (0.6 + quality * 0.6));
    if (deep > 4) stages.push(["deep", deep]);
    stages.push(["core", Math.round(14 + r() * 16)]);
    stages.push(["rem", Math.round((10 + r() * 12) * (0.7 + c * 0.35))]);
    if (r() > quality * 0.85 || (c === 2 && quality < 0.7))
      stages.push(["awake", Math.round(2 + r() * (quality < 0.7 ? 14 : 5))]);
  }
  stages.push(["awake", 3]);
  return {
    label,
    start: Math.round(270 + (r() - 0.5) * 70 + (1 - quality) * 50),
    stages,
    bedtimeShift: Math.round((r() - 0.6) * 40 + (1 - quality) * 60),
  };
}
const DEMO: SleepNight[] = [
  makeNight(11, "Thu, Nov 6", 0.62),
  makeNight(12, "Fri, Nov 7", 0.74),
  makeNight(13, "Sat, Nov 8", 0.55),
  makeNight(14, "Sun, Nov 9", 0.86),
  makeNight(15, "Mon, Nov 10", 0.8),
  makeNight(16, "Tue, Nov 11", 0.7),
  makeNight(17, "Wed, Nov 12", 0.95),
];

const total = (n: SleepNight, s?: SleepStage) => n.stages.reduce((a, [k, m]) => a + (!s || k === s ? m : 0), 0);
const hm = (m: number) => `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`;
const clock = (minAfter6pm: number) => {
  const t = (18 * 60 + minAfter6pm) % (24 * 60);
  const h = Math.floor(t / 60);
  const mm = Math.round(t % 60);
  return `${((h + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
function scoreOf(n: SleepNight) {
  const asleep = total(n) - total(n, "awake");
  const duration = Math.round(Math.max(0, Math.min(50, 50 - Math.max(0, 480 - asleep) / 6)));
  const bedtime = Math.round(Math.max(0, Math.min(30, 30 - Math.abs(n.bedtimeShift) / 4)));
  const wakes = total(n, "awake") - 3;
  const interruptions = Math.round(Math.max(0, Math.min(20, 20 - wakes / 1.5)));
  return {
    duration,
    bedtime,
    interruptions,
    total: duration + bedtime + interruptions,
    asleep,
    wakes,
  };
}
const verdict = (s: number) =>
  s >= 90 ? "Excellent" : s >= 80 ? "Very good" : s >= 70 ? "Good" : s >= 60 ? "Fair" : "Restless";

// the gauge: an arc of 270 degrees in three segments, sized by how many points each part is worth
const SEG = [
  { key: "duration", label: "Duration", max: 50, a: "#a78bfa", b: "#c4b5fd" },
  { key: "bedtime", label: "Bedtime", max: 30, a: "#f472b6", b: "#f9a8d4" },
  {
    key: "interruptions",
    label: "Interruptions",
    max: 20,
    a: "#38bdf8",
    b: "#7dd3fc",
  },
] as const;
type SegKey = (typeof SEG)[number]["key"];
const R = 74;
const SWEEP = 270;
const GAP = 7; // degrees between segments
const arc = (a0: number, a1: number) => {
  const p = (a: number) => [
    100 + R * Math.cos(((a - 90) * Math.PI) / 180),
    100 + R * Math.sin(((a - 90) * Math.PI) / 180),
  ];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

/**
 * Last night's sleep, on a night-sky card.
 *
 * The score sits inside a gauge of three segments, one for each part of it (how long you slept, how close to your
 * usual bedtime, how often you woke), each as long as the points it's worth and filled to what you earned, glowing
 * softly. Point at a part in the list and its segment brightens and the middle reads that part. Below, the night
 * itself: every stretch of awake, REM, core and deep sleep as a bar on its row, joined like a staircase; drag along
 * it to read the time and stage. Step between nights and everything flows to the new one while the score counts.
 * Stars twinkle behind; after an excellent night one falls.
 *   <SleepScore nights={nights} />
 */
export default function SleepScore({
  nights = DEMO,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: SleepScoreProps) {
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
  const skyRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const seen = useInView(rootRef, { once: true, amount: 0.3 });
  const touched = useRef(false);
  const [day, setDay] = useState(nights.length - 1);
  const [focus, setFocus] = useState<SegKey | null>(null);
  const [scrub, setScrub] = useState<number | null>(null); // minutes into the night
  const night = nights[day];
  const sc = useMemo(() => scoreOf(night), [night]);
  const span = total(night);

  const go = (d: number) => {
    const n = Math.max(0, Math.min(nights.length - 1, day + d));
    if (n === day) return;
    setDay(n);
    setScrub(null);
    sfx.whoosh(d > 0 ? 500 : 1300, d > 0 ? 1300 : 500, {
      dur: 0.35,
      gain: 0.04,
    });
    const s = scoreOf(nights[n]).total;
    sfx.note(392 + s * 4, { dur: 0.5, gain: 0.045, at: 0.12, bell: 0.6 });
  };

  // ------------------------------------------------------------ the sky
  const excellent = sc.total >= 80;
  const exRef = useRef(excellent);
  exRef.current = excellent;
  useEffect(() => {
    const cv = skyRef.current;
    if (!cv || !inView) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = rng(5);
    // stars of different temperatures: blue-white, white, warm
    const TINT = ["#cfdcff", "#ffffff", "#fff1d6", "#ffd9c2", "#e3e9ff"];
    const stars = Array.from({ length: 110 }, () => {
      const m = r();
      return {
        x: r(),
        y: r() * 0.8,
        s: 0.35 + m * m * 1.6,
        p: r() * 6.28,
        f: 0.5 + r() * 2.2,
        c: TINT[Math.floor(r() * TINT.length)],
      };
    });
    // the still parts of the sky, painted once: the Milky Way and the moon
    let still: HTMLCanvasElement | null = null;
    let stillW = 0;
    const paintStill = (w: number, h: number) => {
      const c = document.createElement("canvas");
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      const q = rng(9);
      // the band runs from low on the left to high on the right
      const bx0 = -0.1 * w,
        by0 = h * 0.95,
        bx1 = w * 1.1,
        by1 = h * 0.05;
      const len = Math.hypot(bx1 - bx0, by1 - by0);
      const ux = (bx1 - bx0) / len,
        uy = (by1 - by0) / len;
      const nx = -uy,
        ny = ux;
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 26; i++) {
        const t = q();
        const off = (q() - 0.5) * 60;
        const cx = bx0 + ux * len * t + nx * off;
        const cy = by0 + uy * len * t + ny * off;
        const rad = 30 + q() * 60;
        const col = q() < 0.5 ? "120,110,220" : q() < 0.5 ? "170,120,210" : "110,150,230";
        const rg = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
        rg.addColorStop(0, `rgba(${col},0.07)`);
        rg.addColorStop(1, `rgba(${col},0)`);
        g.fillStyle = rg;
        g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      }
      // the dust of countless faint stars along it
      for (let i = 0; i < 900; i++) {
        const t = q();
        const gauss = (q() + q() + q() - 1.5) / 1.5;
        const cx = bx0 + ux * len * t + nx * gauss * 46;
        const cy = by0 + uy * len * t + ny * gauss * 46;
        g.fillStyle = `rgba(230,232,255,${0.08 + q() * 0.35 * (1 - Math.abs(gauss))})`;
        g.fillRect(cx, cy, 0.7, 0.7);
      }
      // a dark lane of dust down its middle
      g.globalCompositeOperation = "source-over";
      for (let i = 0; i < 14; i++) {
        const t = 0.15 + q() * 0.75;
        const cx = bx0 + ux * len * t + nx * (q() - 0.5) * 10;
        const cy = by0 + uy * len * t + ny * (q() - 0.5) * 10;
        const rad = 10 + q() * 18;
        const rg = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
        rg.addColorStop(0, "rgba(8,10,30,0.22)");
        rg.addColorStop(1, "rgba(8,10,30,0)");
        g.fillStyle = rg;
        g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      }
      // the moon: a waxing gibbous, with seas and craters, lit from the right
      const mx = 44,
        my = 150,
        mr = 17;
      const halo = g.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 5);
      halo.addColorStop(0, "rgba(220,225,255,0.22)");
      halo.addColorStop(0.4, "rgba(170,180,255,0.07)");
      halo.addColorStop(1, "rgba(170,180,255,0)");
      g.fillStyle = halo;
      g.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
      g.save();
      g.beginPath();
      g.arc(mx, my, mr, 0, Math.PI * 2);
      g.clip();
      const body = g.createRadialGradient(mx + mr * 0.3, my - mr * 0.3, mr * 0.1, mx, my, mr * 1.05);
      body.addColorStop(0, "#fbf8ee");
      body.addColorStop(0.7, "#e6e1d3");
      body.addColorStop(1, "#bdb8aa");
      g.fillStyle = body;
      g.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
      const seas: [number, number, number][] = [
        [-0.25, -0.3, 0.38],
        [0.15, -0.05, 0.3],
        [-0.05, 0.35, 0.28],
        [0.4, 0.25, 0.2],
        [-0.45, 0.1, 0.22],
      ];
      for (const [sx, sy, sr] of seas) {
        const rg = g.createRadialGradient(mx + sx * mr, my + sy * mr, 0, mx + sx * mr, my + sy * mr, sr * mr);
        rg.addColorStop(0, "rgba(120,118,112,0.42)");
        rg.addColorStop(1, "rgba(120,118,112,0)");
        g.fillStyle = rg;
        g.fillRect(mx - mr, my - mr, mr * 2, mr * 2);
      }
      for (let i = 0; i < 26; i++) {
        const a = q() * Math.PI * 2;
        const d = Math.sqrt(q()) * mr * 0.92;
        const cx = mx + Math.cos(a) * d,
          cy = my + Math.sin(a) * d;
        const cr = 0.5 + q() * q() * 2.4;
        g.fillStyle = "rgba(95,92,86,0.35)";
        g.beginPath();
        g.arc(cx, cy, cr, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "rgba(255,255,250,0.35)";
        g.beginPath();
        g.arc(cx + cr * 0.35, cy - cr * 0.3, cr * 0.55, 0, Math.PI * 2);
        g.fill();
      }
      for (let i = 0; i < 260; i++) {
        g.fillStyle = q() < 0.5 ? "rgba(255,255,255,0.08)" : "rgba(80,78,70,0.08)";
        g.fillRect(mx - mr + q() * mr * 2, my - mr + q() * mr * 2, 1, 1);
      }
      // night falls across the left of it, with a soft terminator
      g.filter = "blur(2.5px)";
      g.fillStyle = "rgba(12,16,44,0.9)";
      g.beginPath();
      g.ellipse(mx - mr * 0.78, my, mr * 0.95, mr * 1.15, 0, 0, Math.PI * 2);
      g.fill();
      g.filter = "none";
      g.restore();
      // a bright rim on the lit limb
      g.strokeStyle = "rgba(255,255,245,0.35)";
      g.lineWidth = 0.8;
      g.beginPath();
      g.arc(mx, my, mr - 0.4, -Math.PI * 0.42, Math.PI * 0.42);
      g.stroke();
      return c;
    };
    let shoot: { x: number; y: number; t: number } | null = null;
    let nextShoot = performance.now() + 1500;
    let raf = 0;
    const draw = (now: number) => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      if (!still || stillW !== w) {
        still = paintStill(w, h);
        stillW = w;
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(still, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const t = now / 1000;
      for (const st of stars) {
        const tw = reduce
          ? 0.75
          : 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * st.f + st.p)) * (0.85 + 0.15 * Math.sin(t * 7.3 + st.p * 3));
        const x = st.x * w;
        const y = st.y * h;
        ctx.globalAlpha = tw * 0.9;
        ctx.fillStyle = st.c;
        ctx.beginPath();
        ctx.arc(x, y, st.s, 0, Math.PI * 2);
        ctx.fill();
        if (st.s > 1.25) {
          // a soft bloom, and the four-pointed spikes of a bright star
          const bl = ctx.createRadialGradient(x, y, 0, x, y, st.s * 4.5);
          bl.addColorStop(0, `rgba(255,255,255,${0.35 * tw})`);
          bl.addColorStop(1, "rgba(255,255,255,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = bl;
          ctx.fillRect(x - st.s * 5, y - st.s * 5, st.s * 10, st.s * 10);
          const L = st.s * 6 * (0.7 + 0.3 * tw);
          for (const [dx, dy] of [
            [1, 0],
            [0, 1],
          ]) {
            const gr = ctx.createLinearGradient(x - dx * L, y - dy * L, x + dx * L, y + dy * L);
            gr.addColorStop(0, "rgba(255,255,255,0)");
            gr.addColorStop(0.5, `rgba(255,255,255,${0.55 * tw})`);
            gr.addColorStop(1, "rgba(255,255,255,0)");
            ctx.strokeStyle = gr;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(x - dx * L, y - dy * L);
            ctx.lineTo(x + dx * L, y + dy * L);
            ctx.stroke();
          }
        }
      }
      // after an excellent night, now and then a star falls
      if (!reduce && exRef.current && !shoot && now > nextShoot) {
        shoot = {
          x: 0.2 + Math.random() * 0.5,
          y: 0.05 + Math.random() * 0.15,
          t: now,
        };
        nextShoot = now + 5000 + Math.random() * 4000;
      }
      if (shoot) {
        const k = (now - shoot.t) / 900;
        if (k >= 1) shoot = null;
        else {
          const x = (shoot.x + k * 0.35) * w;
          const y = (shoot.y + k * 0.16) * h;
          const fade = Math.sin(k * Math.PI);
          const g = ctx.createLinearGradient(x - 90, y - 41, x, y);
          g.addColorStop(0, "rgba(160,180,255,0)");
          g.addColorStop(0.7, `rgba(200,210,255,${0.5 * fade})`);
          g.addColorStop(1, `rgba(255,255,255,${0.95 * fade})`);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x - 90, y - 41);
          ctx.lineTo(x, y);
          ctx.stroke();
          const head = ctx.createRadialGradient(x, y, 0, x, y, 6);
          head.addColorStop(0, `rgba(255,255,255,${fade})`);
          head.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = head;
          ctx.fillRect(x - 6, y - 6, 12, 12);
        }
      }
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ go, setFocus, setScrub });
  ap.current = { go, setFocus, setScrub };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await sleep(1600);
        for (const k of ["duration", "bedtime", "interruptions"] as const) {
          if (!ok()) break;
          ap.current.setFocus(k);
          await sleep(1100);
        }
        if (!ok()) break;
        ap.current.setFocus(null);
        // scrub across the night
        const o = { v: 0 };
        await animate(
          o,
          { v: 1 },
          {
            duration: 2.6,
            ease: [0.45, 0, 0.3, 1],
            onUpdate: () => ok() && ap.current.setScrub(o.v),
          },
        );
        ap.current.setScrub(null);
        if (!ok()) break;
        await sleep(600);
        for (let i = 0; i < 3 && ok(); i++) {
          ap.current.go(-1);
          await sleep(1300);
        }
        for (let i = 0; i < 3 && ok(); i++) {
          ap.current.go(1);
          await sleep(1000);
        }
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  // ------------------------------------------------------------ the gauge's geometry
  const parts = SEG.map((s) => ({ ...s, value: sc[s.key] }));
  const room = SWEEP - GAP * (SEG.length - 1);
  let a = -SWEEP / 2;
  const geo = parts.map((p) => {
    const len = (room * p.max) / 100;
    const g = { ...p, a0: a, a1: a + len, fill: p.value / p.max };
    a += len + GAP;
    return g;
  });
  const shown = focus ? parts.find((p) => p.key === focus)! : null;

  // ------------------------------------------------------------ the night's geometry
  const chartRef = useRef<HTMLDivElement>(null);
  const bars = useMemo(() => {
    let t = 0;
    return night.stages.map(([k, m]) => {
      const b = { k, t0: t, t1: t + m };
      t += m;
      return b;
    });
  }, [night]);
  const at =
    scrub != null ? (bars.find((b) => scrub * span >= b.t0 && scrub * span <= b.t1) ?? bars[bars.length - 1]) : null;
  const scrubFrom = (clientX: number) => {
    const r = chartRef.current?.getBoundingClientRect();
    if (!r) return;
    const f = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    setScrub((prev) => {
      const pb = prev != null ? bars.findIndex((b) => prev * span >= b.t0 && prev * span <= b.t1) : -1;
      const nb = bars.findIndex((b) => f * span >= b.t0 && f * span <= b.t1);
      if (pb !== nb)
        sfx.tick({
          freq: 2000 + STAGE[bars[nb]?.k ?? "core"].row * 300,
          gain: 0.025,
        });
      return f;
    });
  };
  const onChartKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 30 / span : 5 / span;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      touched.current = true;
      setScrub((s) => Math.max(0, Math.min(1, (s ?? 0) + (e.key === "ArrowRight" ? step : -step))));
    } else if (e.key === "Escape") setScrub(null);
  };
  const ticks = useMemo(() => {
    const out: { f: number; label: string }[] = [];
    const first = Math.ceil((night.start + 18 * 60) / 60) * 60 - 18 * 60;
    for (let m = first; m < night.start + span; m += 120)
      out.push({
        f: (m - night.start) / span,
        label: clock(m).replace(":00", ""),
      });
    return out;
  }, [night, span]);

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
      className={`relative w-full max-w-[400px] overflow-hidden rounded-[28px] p-5 text-white shadow-[0_0_0_1px_rgba(255,255,255,.06),0_30px_60px_-30px_rgba(10,14,40,.8)] ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
        background: "radial-gradient(120% 60% at 85% -5%, #2b2f6e 0%, #161b45 40%, #0c1030 75%, #080b22 100%)",
      }}
    >
      <canvas
        ref={skyRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px] w-full"
        style={{ maskImage: "linear-gradient(180deg, #000 60%, transparent)" }}
      />
      {/* the moon's glow */}

      <header className="relative flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[13px] text-white/60">
            <Ico d={I.moon} size={13} /> Sleep score
          </p>
          <div className="relative mt-0.5 h-[28px] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p
                key={verdict(sc.total)}
                className="text-[22px] font-semibold tracking-[-0.02em]"
                initial={reduce ? false : { y: 18, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={reduce ? { opacity: 0 } : { y: -18, opacity: 0, filter: "blur(4px)" }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  filter: { duration: 0.25 },
                  opacity: { duration: 0.2 },
                }}
              >
                {verdict(sc.total)}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-white/[0.08] p-[3px] ring-1 ring-white/10 backdrop-blur">
          <button
            type="button"
            aria-label="Previous night"
            disabled={day === 0}
            onClick={() => go(-1)}
            className="grid h-7 w-7 place-items-center rounded-full text-white/85 outline-none transition hover:bg-white/10 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Ico d={I.left} size={11} />
          </button>
          <span
            className="relative w-[84px] overflow-hidden text-center text-[12.5px] font-medium tabular-nums"
            aria-live="polite"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={day}
                className="block whitespace-nowrap"
                initial={reduce ? false : { y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              >
                {night.label}
              </motion.span>
            </AnimatePresence>
          </span>
          <button
            type="button"
            aria-label="Next night"
            disabled={day === nights.length - 1}
            onClick={() => go(1)}
            className="grid h-7 w-7 place-items-center rounded-full text-white/85 outline-none transition hover:bg-white/10 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Ico d={I.right} size={11} />
          </button>
        </div>
      </header>

      {/* the gauge */}
      <div
        className="relative mx-auto mt-2 h-[190px] w-[200px]"
        role="img"
        aria-label={`Sleep score ${sc.total} of 100, ${verdict(sc.total)}.`}
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-[200px] w-[200px] overflow-visible">
          <defs>
            {geo.map((g) => (
              <linearGradient
                key={g.key}
                id={`${uid}-${g.key}`}
                gradientUnits="userSpaceOnUse"
                x1={100 + R * Math.cos(((g.a0 - 90) * Math.PI) / 180)}
                y1={100 + R * Math.sin(((g.a0 - 90) * Math.PI) / 180)}
                x2={100 + R * Math.cos(((g.a1 - 90) * Math.PI) / 180)}
                y2={100 + R * Math.sin(((g.a1 - 90) * Math.PI) / 180)}
              >
                <stop offset="0" stopColor={g.a} />
                <stop offset="1" stopColor={g.b} />
              </linearGradient>
            ))}
            <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          {geo.map((g, i) => {
            const on = !focus || focus === g.key;
            const d = arc(g.a0, g.a1);
            const sw = focus === g.key ? 15 : 12;
            return (
              <g key={g.key} style={{ opacity: on ? 1 : 0.28, transition: "opacity .3s" }}>
                <path d={d} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={12} strokeLinecap="round" />
                {/* the glow under the filled part */}
                <motion.path
                  d={d}
                  fill="none"
                  stroke={`url(#${uid}-${g.key})`}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  filter={`url(#${uid}-glow)`}
                  opacity={0.55}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: seen ? g.fill : 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 60,
                          damping: 16,
                          delay: 0.1 * i,
                        }
                  }
                />
                <motion.path
                  d={d}
                  fill="none"
                  stroke={`url(#${uid}-${g.key})`}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: seen ? g.fill : 0, strokeWidth: sw }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 60,
                          damping: 16,
                          delay: 0.1 * i,
                          strokeWidth: { duration: 0.2 },
                        }
                  }
                />
                {/* a bright inner line along the tube, so it reads as a lit glass channel */}
                <motion.path
                  d={d}
                  fill="none"
                  stroke="rgba(255,255,255,.55)"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  style={{ mixBlendMode: "overlay" }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: seen ? g.fill : 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 60,
                          damping: 16,
                          delay: 0.1 * i,
                        }
                  }
                />
                {/* energy running along the earned part, toward its end */}
                {!reduce && g.fill > 0.04 && (
                  <motion.path
                    key={`${day}-${g.key}`}
                    d={arc(g.a0, g.a0 + (g.a1 - g.a0) * g.fill)}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={sw - 5}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="0.14 1"
                    style={{
                      filter: `drop-shadow(0 0 4px ${g.b})`,
                      mixBlendMode: "screen",
                    }}
                    initial={{ strokeDashoffset: 0.14, opacity: 0 }}
                    animate={{
                      strokeDashoffset: [0.14, -1],
                      opacity: seen ? [0, 0.85, 0.85, 0] : 0,
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: [0.45, 0, 0.3, 1],
                      delay: 1.2 + i * 0.6,
                      repeatDelay: 1.2,
                    }}
                  />
                )}
                {/* a glowing head where the earned part ends */}
                <motion.g
                  style={{ transformOrigin: "100px 100px" }}
                  initial={{ rotate: g.a0, opacity: 0 }}
                  animate={{
                    rotate: seen ? g.a0 + (g.a1 - g.a0) * g.fill : g.a0,
                    opacity: seen && g.fill > 0.03 ? 1 : 0,
                  }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 60,
                          damping: 16,
                          delay: 0.1 * i,
                          opacity: { duration: 0.3 },
                        }
                  }
                >
                  <circle cx={100} cy={100 - R} r={sw * 0.95} fill={g.b} opacity={0.35} filter={`url(#${uid}-glow)`} />
                  <circle cx={100} cy={100 - R} r={sw * 0.36} fill="#fff" />
                </motion.g>
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-x-0 top-[62px] flex flex-col items-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={shown ? shown.key : "all"}
              className="flex flex-col items-center"
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.18 }}
            >
              <span
                className="bg-gradient-to-b from-white to-[#c9c6ff] bg-clip-text text-[48px] font-semibold leading-none tracking-[-0.04em] text-transparent tabular-nums"
                style={{
                  filter: "drop-shadow(0 0 18px rgba(167,139,250,.45))",
                }}
              >
                <Count n={shown ? shown.value : sc.total} reduce={reduce} />
              </span>
              <span className="mt-1.5 text-[12px] text-white/55">
                {shown ? `${shown.label}, of ${shown.max}` : "of 100"}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* the parts of the score */}
      <ul className="relative -mt-3 rounded-[18px] bg-white/[0.05] p-1 ring-1 ring-white/[0.07]">
        {parts.map((p) => {
          const detail =
            p.key === "duration"
              ? `Asleep ${hm(sc.asleep)}`
              : p.key === "bedtime"
                ? Math.abs(night.bedtimeShift) < 5
                  ? "Right on time"
                  : `${Math.abs(night.bedtimeShift)}m ${night.bedtimeShift < 0 ? "earlier" : "later"}`
                : sc.wakes <= 1
                  ? "Slept straight through"
                  : `${sc.wakes}m awake`;
          const on = focus === p.key;
          return (
            <li key={p.key}>
              <button
                type="button"
                onPointerEnter={(e) => e.pointerType === "mouse" && setFocus(p.key)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
                onFocus={() => setFocus(p.key)}
                onBlur={() => setFocus(null)}
                onClick={() => setFocus((f) => (f === p.key ? null : p.key))}
                aria-pressed={on}
                className="relative flex w-full items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {on && (
                  <motion.span
                    layoutId={`${uid}-row`}
                    className="absolute inset-0 rounded-[14px] bg-white/[0.08]"
                    transition={{ type: "spring", stiffness: 500, damping: 38 }}
                  />
                )}
                <span
                  className="relative h-2.5 w-2.5 rounded-[3px]"
                  style={{
                    background: `linear-gradient(135deg, ${p.a}, ${p.b})`,
                    boxShadow: `0 0 8px ${p.a}aa`,
                  }}
                />
                <span className="relative text-[13.5px] font-medium">{p.label}</span>
                <span className="relative truncate text-[12.5px] text-white/50">{detail}</span>
                <span className="relative ml-auto text-[13px] font-semibold tabular-nums">
                  <Count n={p.value} reduce={reduce} />
                  <span className="font-normal text-white/45">/{p.max}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* the night */}
      <div className="relative mt-4">
        <div className="mb-2 flex items-baseline justify-between text-[12px]">
          <span className="text-white/60">Stages</span>
          <span className="tabular-nums text-white/45">
            {clock(night.start)} to {clock(night.start + span)}
          </span>
        </div>
        <div
          ref={chartRef}
          tabIndex={0}
          role="slider"
          aria-label="Sleep stages through the night. Use the arrow keys to read them."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((scrub ?? 0) * 100)}
          aria-valuetext={
            at && scrub != null ? `${clock(night.start + scrub * span)}, ${STAGE[at.k].label}` : "Not reading"
          }
          onPointerMove={(e: RPointerEvent<HTMLDivElement>) => scrubFrom(e.clientX)}
          onPointerDown={(e: RPointerEvent<HTMLDivElement>) => {
            e.currentTarget.setPointerCapture?.(e.pointerId);
            scrubFrom(e.clientX);
          }}
          onPointerLeave={(e) => e.pointerType === "mouse" && setScrub(null)}
          onPointerUp={(e) => e.pointerType !== "mouse" && setScrub(null)}
          onKeyDown={onChartKey}
          onBlur={() => setScrub(null)}
          className="relative h-[104px] cursor-crosshair touch-pan-y rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {ORDER.map((k) => (
            <div
              key={k}
              className="absolute inset-x-0 border-t border-dashed border-white/[0.07]"
              style={{ top: `${STAGE[k].row * 25 + 12.5}%` }}
            >
              <span className="absolute -top-[8px] right-0 text-[10px] text-white/30">{STAGE[k].label}</span>
            </div>
          ))}
          <AnimatePresence initial={false}>
            <motion.div
              key={day}
              className="absolute inset-y-0 left-0 w-[calc(100%-36px)]"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            >
              {/* the steps between stages: fine lines of light */}
              {bars.slice(1).map((b, i) => {
                const p = bars[i];
                const y0 = STAGE[p.k].row * 25 + 12.5;
                const y1 = STAGE[b.k].row * 25 + 12.5;
                return (
                  <motion.span
                    key={`j${i}`}
                    className="absolute w-px"
                    style={{
                      left: `${(b.t0 / span) * 100}%`,
                      top: `${Math.min(y0, y1)}%`,
                      height: `${Math.abs(y1 - y0)}%`,
                      background: `linear-gradient(180deg, ${STAGE[(y0 < y1 ? p : b).k].color}aa, ${STAGE[(y0 < y1 ? b : p).k].color}aa)`,
                    }}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: seen ? (at ? 0.35 : 0.7) : 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.3 + (b.t0 / span) * 0.6,
                      duration: 0.3,
                    }}
                  />
                );
              })}
              {/* each stretch: a lit capsule, glowing in its stage's colour */}
              {bars.map((b, i) => {
                const y = STAGE[b.k].row * 25 + 12.5;
                const lit = !at || at === b;
                const c = STAGE[b.k].color;
                return (
                  <motion.span
                    key={i}
                    className="absolute h-[13px] -translate-y-1/2 rounded-[5px]"
                    style={{
                      left: `${(b.t0 / span) * 100}%`,
                      width: `max(2px, calc(${((b.t1 - b.t0) / span) * 100}% - 1px))`,
                      top: `${y}%`,
                      originX: 0,
                      background: `linear-gradient(180deg, color-mix(in srgb, ${c} 55%, white) 0%, ${c} 45%, color-mix(in srgb, ${c} 80%, black) 100%)`,
                      boxShadow: `0 0 ${at === b ? 16 : 9}px ${c}${at === b ? "cc" : "77"}, inset 0 1px 0 rgba(255,255,255,.55)`,
                      opacity: lit ? 1 : 0.38,
                      transition: "opacity .2s, box-shadow .2s",
                    }}
                    initial={reduce ? false : { scaleX: 0 }}
                    animate={{ scaleX: seen ? 1 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 26,
                      delay: reduce ? 0 : 0.2 + (b.t0 / span) * 0.6,
                    }}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
          {scrub != null && at && (
            <>
              <div
                className="pointer-events-none absolute bottom-0 top-0 w-px"
                style={{
                  left: `calc(${scrub} * (100% - 36px))`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.85) 30%, rgba(255,255,255,.85) 70%, rgba(255,255,255,0))",
                  boxShadow: "0 0 8px rgba(255,255,255,.6)",
                }}
              />
              <div
                className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-[10px] bg-white px-2.5 py-1 text-[12px] font-medium text-[#0b0f26] shadow-[0_8px_20px_-8px_rgba(0,0,0,.6)]"
                style={{
                  left: `calc(${scrub} * (100% - 36px))`,
                  transform: `translateX(-${Math.round(scrub * 100)}%)`,
                }}
              >
                <span
                  className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                  style={{ background: STAGE[at.k].color }}
                />
                {STAGE[at.k].label}{" "}
                <span className="font-normal text-[#6e6e73]">at {clock(night.start + scrub * span)}</span>
              </div>
            </>
          )}
        </div>
        <div className="relative mt-1.5 h-4 w-[calc(100%-36px)] text-[10.5px] tabular-nums text-white/40">
          {ticks.map((t) => (
            <span
              key={t.label}
              className="absolute -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${t.f * 100}%` }}
            >
              {t.label}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {ORDER.map((k) => (
            <div
              key={k}
              className="min-w-0 rounded-[12px] bg-white/[0.05] px-2 py-2 ring-1 ring-white/[0.06] sm:px-2.5"
            >
              <p className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-white/55">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: STAGE[k].color }} />
                {STAGE[k].label}
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[12px] font-semibold tabular-nums sm:text-[12.5px]">
                {hm(total(night, k))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Count({ n, reduce }: { n: number; reduce: boolean }) {
  const [shown, setShown] = useState(n);
  const from = useRef(n);
  useEffect(() => {
    if (reduce) {
      setShown(n);
      from.current = n;
      return;
    }
    const a = animate(from.current, n, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = n;
    return () => a.stop();
  }, [n, reduce]);
  return <>{shown}</>;
}
