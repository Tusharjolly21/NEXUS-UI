"use client";


import { motion, useInView, useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, type KeyboardEvent as RKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Ink = { id: string; name: string; hex: string };

export type InkDropPickerProps = {
  /** the inks to choose from */
  colors?: Ink[];
  /** the id of the ink chosen at the start */
  defaultValue?: string;
  /** called with the chosen ink's hex and id */
  onChange?: (hex: string, id: string) => void;
  label?: string;
  description?: string;
  /** Soft synthesised sounds: the pipette, the drop landing and the water. They also follow the site-wide sound switch. */
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
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
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

const DEFAULT_INKS: Ink[] = [
  { id: "ocean", name: "Ocean", hex: "#0a84ff" },
  { id: "grape", name: "Grape", hex: "#bf5af2" },
  { id: "rose", name: "Rose", hex: "#ff375f" },
  { id: "tangerine", name: "Tangerine", hex: "#ff9f0a" },
  { id: "moss", name: "Moss", hex: "#30d158" },
  { id: "teal", name: "Teal", hex: "#40c8e0" },
  { id: "graphite", name: "Graphite", hex: "#48484a" },
];

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const rgbOf = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(f.slice(0, 2), 16) / 255, parseInt(f.slice(2, 4), 16) / 255, parseInt(f.slice(4, 6), 16) / 255];
};
/** how much an ink darkens red, green and blue light. Inks mix by adding these, the way dyes do (blue and yellow
 * swirl green), and since the darkening is linear in the ink, a thin wisp keeps its colour's hue instead of drifting */
const absorbOf = (hex: string): [number, number, number] => rgbOf(hex).map((c) => 1 - c) as [number, number, number];
const K = 2.3; // how dark a unit of ink is

// ───────────── the scene, in css px ─────────────
const SW = 300,
  SH = 340;
const CX = 150;
const GX0 = 68,
  GX1 = 232; // the glass, outside
const WALL = 5;
const IX0 = GX0 + WALL,
  IX1 = GX1 - WALL; // inside
const RIM = 118; // the top of the glass
const BASE = 318; // the bottom of the glass
const FLOOR = 302; // the inside floor, above the thick glass base
const SURF = 150; // the water's surface at rest
const TIP = 106; // the pipette's tip
const RIM_RY = 7;

// ───────────── the fluid: stable fluids (Stam), velocity on a coarse grid, ink on one twice as fine ─────────────
const NX = 62,
  NY = 61; // fluid cells across and down (2.5 css px each)
const CELL = (IX1 - IX0) / NX;
const DX = NX * 2,
  DY = NY * 2; // ink cells
const RELAX = 0.3; // how fast the water settles to an even tint, per second, once the plumes have had their moment
const TINT = 0.05; // how much ink an evenly tinted glass holds

type Fluid = {
  u: Float32Array;
  v: Float32Array;
  u0: Float32Array;
  v0: Float32Array;
  p: Float32Array;
  div: Float32Array;
  curl: Float32Array;
  dens: Float32Array;
  ink: [Float32Array, Float32Array, Float32Array];
  ink0: [Float32Array, Float32Array, Float32Array];
};
const S = (NX + 2) * (NY + 2);
const I = (i: number, j: number) => i + (NX + 2) * j;
function makeFluid(): Fluid {
  const f = () => new Float32Array(S);
  const g = () => new Float32Array(DX * DY);
  return { u: f(), v: f(), u0: f(), v0: f(), p: f(), div: f(), curl: f(), dens: f(), ink: [g(), g(), g()], ink0: [g(), g(), g()] };
}
function bound(b: number, x: Float32Array) {
  for (let i = 1; i <= NX; i++) {
    x[I(i, 0)] = b === 2 ? -x[I(i, 1)] : x[I(i, 1)];
    x[I(i, NY + 1)] = b === 2 ? -x[I(i, NY)] : x[I(i, NY)];
  }
  for (let j = 1; j <= NY; j++) {
    x[I(0, j)] = b === 1 ? -x[I(1, j)] : x[I(1, j)];
    x[I(NX + 1, j)] = b === 1 ? -x[I(NX, j)] : x[I(NX, j)];
  }
  x[I(0, 0)] = 0.5 * (x[I(1, 0)] + x[I(0, 1)]);
  x[I(0, NY + 1)] = 0.5 * (x[I(1, NY + 1)] + x[I(0, NY)]);
  x[I(NX + 1, 0)] = 0.5 * (x[I(NX, 0)] + x[I(NX + 1, 1)]);
  x[I(NX + 1, NY + 1)] = 0.5 * (x[I(NX, NY + 1)] + x[I(NX + 1, NY)]);
}
function sample(x: Float32Array, fx: number, fy: number) {
  fx = clamp(fx, 0.5, NX + 0.5);
  fy = clamp(fy, 0.5, NY + 0.5);
  const i0 = Math.floor(fx),
    j0 = Math.floor(fy);
  const s = fx - i0,
    t = fy - j0;
  return (1 - s) * ((1 - t) * x[I(i0, j0)] + t * x[I(i0, j0 + 1)]) + s * ((1 - t) * x[I(i0 + 1, j0)] + t * x[I(i0 + 1, j0 + 1)]);
}
function advectVel(f: Fluid, dt: number) {
  f.u0.set(f.u);
  f.v0.set(f.v);
  for (let j = 1; j <= NY; j++)
    for (let i = 1; i <= NX; i++) {
      const k = I(i, j);
      const x = i - dt * f.u0[k],
        y = j - dt * f.v0[k];
      f.u[k] = sample(f.u0, x, y);
      f.v[k] = sample(f.v0, x, y);
    }
  bound(1, f.u);
  bound(2, f.v);
}
function project(f: Fluid) {
  const { u, v, p, div } = f;
  for (let j = 1; j <= NY; j++)
    for (let i = 1; i <= NX; i++) {
      div[I(i, j)] = -0.5 * (u[I(i + 1, j)] - u[I(i - 1, j)] + v[I(i, j + 1)] - v[I(i, j - 1)]);
      p[I(i, j)] = 0;
    }
  bound(0, div);
  bound(0, p);
  for (let it = 0; it < 18; it++) {
    for (let j = 1; j <= NY; j++)
      for (let i = 1; i <= NX; i++) p[I(i, j)] = (div[I(i, j)] + p[I(i - 1, j)] + p[I(i + 1, j)] + p[I(i, j - 1)] + p[I(i, j + 1)]) / 4;
    bound(0, p);
  }
  for (let j = 1; j <= NY; j++)
    for (let i = 1; i <= NX; i++) {
      u[I(i, j)] -= 0.5 * (p[I(i + 1, j)] - p[I(i - 1, j)]);
      v[I(i, j)] -= 0.5 * (p[I(i, j + 1)] - p[I(i, j - 1)]);
    }
  bound(1, u);
  bound(2, v);
}
/** vorticity confinement: puts back the little curls the grid smooths away, so the ink keeps curling */
function confine(f: Fluid, eps: number, dt: number) {
  const { u, v, curl } = f;
  for (let j = 1; j <= NY; j++)
    for (let i = 1; i <= NX; i++) curl[I(i, j)] = 0.5 * (v[I(i + 1, j)] - v[I(i - 1, j)] - (u[I(i, j + 1)] - u[I(i, j - 1)]));
  for (let j = 2; j < NY; j++)
    for (let i = 2; i < NX; i++) {
      const nx = 0.5 * (Math.abs(curl[I(i + 1, j)]) - Math.abs(curl[I(i - 1, j)]));
      const ny = 0.5 * (Math.abs(curl[I(i, j + 1)]) - Math.abs(curl[I(i, j - 1)]));
      const len = Math.hypot(nx, ny) + 1e-5;
      const w = curl[I(i, j)];
      u[I(i, j)] += dt * eps * (ny / len) * w;
      v[I(i, j)] += dt * eps * (-(nx / len)) * w;
    }
}
/** carries the ink along the flow, on the fine grid, and lets it spread a touch */
function advectInk(f: Fluid, dt: number) {
  for (let c = 0; c < 3; c++) f.ink0[c].set(f.ink[c]);
  const [r0, g0, b0] = f.ink0;
  const [r, g, b] = f.ink;
  for (let fj = 0; fj < DY; fj++)
    for (let fi = 0; fi < DX; fi++) {
      const X = (fi + 0.5) / 2 + 0.5,
        Y = (fj + 0.5) / 2 + 0.5;
      const x = (X - dt * sample(f.u, X, Y) - 0.5) * 2 - 0.5;
      const y = (Y - dt * sample(f.v, X, Y) - 0.5) * 2 - 0.5;
      const cx = clamp(x, 0, DX - 1.001),
        cy = clamp(y, 0, DY - 1.001);
      const i0 = Math.floor(cx),
        j0 = Math.floor(cy);
      const s = cx - i0,
        t = cy - j0;
      const a = i0 + DX * j0,
        bb = a + 1,
        cc = a + DX,
        d = cc + 1;
      const w0 = (1 - s) * (1 - t),
        w1 = s * (1 - t),
        w2 = (1 - s) * t,
        w3 = s * t;
      const k = fi + DX * fj;
      r[k] = w0 * r0[a] + w1 * r0[bb] + w2 * r0[cc] + w3 * r0[d];
      g[k] = w0 * g0[a] + w1 * g0[bb] + w2 * g0[cc] + w3 * g0[d];
      b[k] = w0 * b0[a] + w1 * b0[bb] + w2 * b0[cc] + w3 * b0[d];
    }
}

type Drop = { x: number; y: number; vy: number; r: number; hex: string; absorb: [number, number, number]; main: boolean };
type Speck = { x: number; y: number; vx: number; vy: number; r: number; hex: string };
type Pip = {
  x: number;
  vx: number;
  tx: number;
  hex: string; // what is in the tube
  fill: number; // how full, 0 to 1
  squeeze: number; // 0 to 1
  bead: number; // the drop growing at the tip, 0 to 1
  lift: number;
  queue: { at: number; size: number }[]; // drops still to come, by time
  t: number;
  pending: { hex: string; absorb: [number, number, number] } | null;
};

/**
 * An accent colour picker that drops your colour into a glass of water.
 *
 * Choose an ink and a glass pipette slides over the glass, squeezes, and lets a drop fall: it rings the surface,
 * throws up a little crown of droplets, then sinks and blooms into curling plumes as it falls through the water. A
 * real fluid simulation runs the water (velocity on a coarse grid, the ink carried on a grid twice as fine, ink
 * heavier than water so it sinks, and vorticity confinement keeping its curls), and the inks mix by absorbing light
 * the way dyes do, so a blue dropped into yellow water swirls green before the new colour takes over and the glass
 * settles to an even tint. Drag in the water to stir it. The glass casts a caustic in its own colour. The inks are a
 * radiogroup; arrow keys move between them.
 *   <InkDropPicker defaultValue="ocean" onChange={(hex) => setAccent(hex)} />
 */
export default function InkDropPicker({
  colors = DEFAULT_INKS,
  defaultValue,
  onChange,
  label = "Accent colour",
  description = "Drop a colour in and watch it take.",
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: InkDropPickerProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "120px" });
  const [value, setValue] = useState(() => (colors.find((c) => c.id === defaultValue) ?? colors[0]).id);
  const current = colors.find((c) => c.id === value) ?? colors[0];
  const cb = useRef({ onChange });
  cb.current = { onChange };
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const st = useRef<{
    fluid: Fluid;
    target: [number, number, number];
    relax: number; // the current pull toward an even tint
    calmAt: number; // when the water last got a jolt
    drops: Drop[];
    specks: Speck[];
    wave: Float32Array;
    waveV: Float32Array;
    pip: Pip;
    tint: [number, number, number]; // the water's even colour, for the caustic and the base
    gpu: GpuFluid | null;
    wake: () => void;
  } | null>(null);
  if (!st.current) {
    const first = colors.find((c) => c.id === defaultValue) ?? colors[0];
    const fluid = makeFluid();
    const a = absorbOf(first.hex);
    for (let c = 0; c < 3; c++) fluid.ink[c].fill(a[c] * TINT);
    st.current = {
      fluid,
      target: a,
      relax: 0,
      calmAt: -1e9,
      drops: [],
      specks: [],
      wave: new Float32Array(48),
      waveV: new Float32Array(48),
      pip: { x: CX + 18, vx: 0, tx: CX + 18, hex: first.hex, fill: 0.55, squeeze: 0, bead: 0, lift: 0, queue: [], t: 0, pending: null },
      tint: [...a] as [number, number, number],
      gpu: null,
      wake: () => {},
    };
  }

  /** choose an ink: the pipette fills with it, moves over the glass and lets a drop go */
  const choose = (ink: Ink, user = true) => {
    if (user) touched.current = true;
    const s = st.current!;
    setValue(ink.id);
    cb.current.onChange?.(ink.hex, ink.id);
    const absorb = absorbOf(ink.hex);
    s.target = absorb;
    if (reduce) {
      s.relax = 3;
      s.calmAt = performance.now() / 1000;
      s.pip.hex = ink.hex;
      s.wake();
      return;
    }
    const p = s.pip;
    p.pending = { hex: ink.hex, absorb };
    p.tx = IX0 + 34 + Math.random() * (IX1 - IX0 - 68);
    p.t = 0;
    p.queue = [
      { at: 0.62, size: 1 },
      { at: 1.18, size: 0.62 },
    ];
    p.bead = 0;
    s.relax = 0;
    s.calmAt = performance.now() / 1000;
    sfx.whoosh(500, 1400, { dur: 0.35, gain: 0.018 });
    s.wake();
  };

  // ── the loop ──
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !inView) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = st.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = SW * dpr;
    cv.height = SH * dpr;
    const inkCv = document.createElement("canvas");
    inkCv.width = DX;
    inkCv.height = DY;
    const ictx = inkCv.getContext("2d")!;
    const img = ictx.createImageData(DX, DY);
    const f = s.fluid;
    // the fluid runs on the GPU where it can, at four times the detail; the CPU version is the fallback
    const gpu = reduce ? null : makeGpuFluid(IX1 - IX0, FLOOR - SURF + 1, dpr);
    s.gpu = gpu;
    if (gpu) gpu.fill(s.tint.map((v) => v * TINT) as [number, number, number]);
    let raf = 0,
      last = performance.now(),
      running = false;

    const BASE_RGB = [246, 250, 253];
    const paintInk = () => {
      const d = img.data;
      const [r, g, b] = f.ink;
      for (let k = 0, o = 0; k < DX * DY; k++, o += 4) {
        // light through the water, dimmed by what the ink soaks up; a little deeper toward the floor
        const depth = 1 - 0.05 * (Math.floor(k / DX) / DY);
        // thick ink is soft-limited, so a dense core stays its own colour rather than going toward black
        d[o] = BASE_RGB[0] * Math.exp((-r[k] * K) / (1 + r[k] * 0.45)) * depth;
        d[o + 1] = BASE_RGB[1] * Math.exp((-g[k] * K) / (1 + g[k] * 0.45)) * depth;
        d[o + 2] = BASE_RGB[2] * Math.exp((-b[k] * K) / (1 + b[k] * 0.45)) * depth;
        d[o + 3] = 255;
      }
      ictx.putImageData(img, 0, 0);
    };
    const tintCss = (alpha: number, lift = 0) => {
      const t = s.tint;
      const c = (i: number) => Math.round(255 * (lift + (1 - lift) * Math.exp(-t[i] * TINT * K * 7)));
      return `rgba(${c(0)},${c(1)},${c(2)},${alpha})`;
    };
    const inkCss = (hex: string, a = 1) => {
      const [r, g, b] = rgbOf(hex);
      return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
    };

    /** a drop reaches the water */
    const splash = (d: Drop) => {
      const fx = (d.x - IX0) / CELL + 0.5;
      const rad = d.main ? 3.2 : 2.3;
      const amt = d.main ? 3.4 : 2.1;
      if (gpu) {
        const u = (d.x - IX0) / (IX1 - IX0);
        gpu.splatDye(u, 0.965, d.absorb.map((v) => v * amt * 0.9) as [number, number, number], (rad * CELL) / (IX1 - IX0));
        gpu.splatVel(u, 0.95, 0, -(d.main ? 95 : 62), (rad * CELL * 0.9) / (IX1 - IX0));
      }
      // ink, in a small lens just under the surface
      if (!gpu) for (let fj = 0; fj < 14; fj++)
        for (let fi = Math.max(0, Math.floor(fx * 2 - 12)); fi < Math.min(DX, Math.ceil(fx * 2 + 12)); fi++) {
          const dxv = (fi + 0.5) / 2 + 0.5 - fx,
            dyv = (fj + 0.5) / 2 + 0.5 - 1.6;
          const w = Math.exp(-(dxv * dxv + dyv * dyv * 1.6) / (rad * rad)) * amt;
          if (w < 0.01) continue;
          const k = fi + DX * fj;
          for (let c = 0; c < 3; c++) f.ink[c][k] += d.absorb[c] * w;
        }
      // the drop's momentum: a downward jet, which rolls up into a pair of vortices (a ring, seen side on)
      const jet = d.main ? 62 : 40;
      if (!gpu) for (let j = 1; j <= 8; j++)
        for (let i = Math.max(1, Math.floor(fx - 5)); i <= Math.min(NX, Math.ceil(fx + 5)); i++) {
          const w = Math.exp(-((i - fx) ** 2) / (rad * rad * 0.8) - ((j - 2.5) ** 2) / 9);
          f.v[I(i, j)] += jet * w;
        }
      // the surface rings, and a little crown of droplets jumps up and falls back
      const wi = Math.round(((d.x - IX0) / (IX1 - IX0)) * (s.wave.length - 1));
      for (let k = -2; k <= 2; k++) {
        const q = wi + k;
        if (q >= 0 && q < s.wave.length) s.waveV[q] += (d.main ? 46 : 30) * (1 - Math.abs(k) * 0.3);
      }
      const n = d.main ? 9 : 5;
      for (let q = 0; q < n; q++) {
        const a = -Math.PI / 2 + (q / (n - 1) - 0.5) * 2.1 + (Math.random() - 0.5) * 0.25;
        const sp = (d.main ? 95 : 70) * (0.6 + Math.random() * 0.6);
        s.specks.push({ x: d.x, y: SURF - 1, vx: Math.cos(a) * sp * 0.55, vy: Math.sin(a) * sp, r: 0.9 + Math.random() * (d.main ? 1.2 : 0.7), hex: d.hex });
      }
      // a water drop's voice: a bubble ringing up in pitch
      const base = d.main ? 1050 : 1450;
      sfx.note(base, { glide: base * 1.9, dur: 0.11, gain: d.main ? 0.06 : 0.04, bell: 0 });
      sfx.tick({ freq: 5200, gain: d.main ? 0.05 : 0.03 });
      sfx.note(210, { at: 0.02, dur: 0.16, gain: d.main ? 0.035 : 0.02, bell: 0 });
      s.calmAt = performance.now() / 1000;
    };

    const draw = (now: number) => {
      const W = SW;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, SH);
      const wv = s.wave;
      const surfAt = (x: number) => {
        const u = clamp((x - IX0) / (IX1 - IX0)) * (wv.length - 1);
        const i0 = Math.floor(u),
          i1 = Math.min(wv.length - 1, i0 + 1);
        return SURF + wv[i0] + (wv[i1] - wv[i0]) * (u - i0);
      };

      // ── on the table: the glass's shadow, and the light it focuses, in the water's colour ──
      const sh = ctx.createRadialGradient(CX - 6, BASE + 4, 4, CX - 6, BASE + 4, 100);
      sh.addColorStop(0, "rgba(0,0,0,0.20)");
      sh.addColorStop(0.55, "rgba(0,0,0,0.07)");
      sh.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.translate(0, BASE + 4);
      ctx.scale(1, 0.11);
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.arc(CX - 6, 0, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(CX + 30, BASE + 7);
      ctx.scale(1, 0.13);
      const ca = ctx.createRadialGradient(0, 0, 2, 0, 0, 74);
      ca.addColorStop(0, "rgba(255,255,255,0.85)");
      ca.addColorStop(0.18, tintCss(0.75, 0.15));
      ca.addColorStop(0.6, tintCss(0.22, 0.2));
      ca.addColorStop(1, tintCss(0, 0.2));
      ctx.fillStyle = ca;
      ctx.beginPath();
      ctx.arc(0, 0, 74, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ── the back of the rim ──
      ctx.strokeStyle = "rgba(150,166,182,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(CX, RIM, (GX1 - GX0) / 2, RIM_RY, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // ── the water ──
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(IX0, surfAt(IX0));
      for (let x = IX0; x <= IX1; x += 2) ctx.lineTo(x, surfAt(x));
      ctx.lineTo(IX1, FLOOR - 14);
      ctx.quadraticCurveTo(IX1, FLOOR, IX1 - 14, FLOOR);
      ctx.lineTo(IX0 + 14, FLOOR);
      ctx.quadraticCurveTo(IX0, FLOOR, IX0, FLOOR - 14);
      ctx.closePath();
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(gpu ? gpu.canvas : inkCv, IX0, SURF - 1, IX1 - IX0, FLOOR - SURF + 1);
      // seen through a cylinder: darker toward the sides, a bright refracted band near each wall
      const cyl = ctx.createLinearGradient(IX0, 0, IX1, 0);
      cyl.addColorStop(0, "rgba(10,30,50,0.16)");
      cyl.addColorStop(0.06, "rgba(255,255,255,0.10)");
      cyl.addColorStop(0.12, "rgba(10,30,50,0.02)");
      cyl.addColorStop(0.5, "rgba(10,30,50,0)");
      cyl.addColorStop(0.88, "rgba(10,30,50,0.03)");
      cyl.addColorStop(0.95, "rgba(255,255,255,0.08)");
      cyl.addColorStop(1, "rgba(10,30,50,0.18)");
      ctx.fillStyle = cyl;
      ctx.fillRect(IX0, SURF - 8, IX1 - IX0, FLOOR - SURF + 8);
      // light coming down through the surface
      const lit = ctx.createLinearGradient(0, SURF, 0, FLOOR);
      lit.addColorStop(0, "rgba(255,255,255,0.16)");
      lit.addColorStop(0.25, "rgba(255,255,255,0)");
      lit.addColorStop(1, "rgba(0,20,40,0.05)");
      ctx.fillStyle = lit;
      ctx.fillRect(IX0, SURF - 8, IX1 - IX0, FLOOR - SURF + 8);
      ctx.restore();

      // ── the surface, seen from a little above: a flat ellipse whose near edge carries the ripples ──
      const rx = (IX1 - IX0) / 2,
        ry = 5.2;
      ctx.beginPath();
      for (let k = 0; k <= 64; k++) {
        const a = Math.PI + (k / 64) * Math.PI; // the far half
        const x = CX + Math.cos(a) * rx;
        ctx[k ? "lineTo" : "moveTo"](x, surfAt(x) + Math.sin(a) * ry * 0.9);
      }
      for (let k = 0; k <= 64; k++) {
        const a = (k / 64) * Math.PI; // the near half
        const x = CX + Math.cos(a) * rx;
        ctx.lineTo(x, surfAt(x) + Math.sin(a) * ry);
      }
      ctx.closePath();
      const top = ctx.createLinearGradient(0, SURF - ry, 0, SURF + ry);
      top.addColorStop(0, "rgba(255,255,255,0.9)");
      top.addColorStop(1, tintCss(0.5, 0.45));
      ctx.fillStyle = top;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      for (let k = 0; k <= 64; k++) {
        const a = (k / 64) * Math.PI;
        const x = CX + Math.cos(a) * rx;
        ctx[k ? "lineTo" : "moveTo"](x, surfAt(x) + Math.sin(a) * ry + 0.8);
      }
      ctx.strokeStyle = "rgba(60,80,100,0.16)";
      ctx.stroke();

      // ── drops in the air, and the crown ──
      for (const d of s.drops) {
        const stretch = 1 + clamp(d.vy / 900, 0, 0.45);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.scale(1 / Math.sqrt(stretch), stretch);
        const g = ctx.createRadialGradient(-d.r * 0.35, -d.r * 0.4, 0.2, 0, 0, d.r);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.28, inkCss(d.hex, 0.95));
        g.addColorStop(1, inkCss(d.hex, 1));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      for (const p of s.specks) {
        ctx.fillStyle = inkCss(p.hex, 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── the glass ──
      const outer = new Path2D();
      outer.moveTo(GX0, RIM);
      outer.lineTo(GX0, BASE - 22);
      outer.quadraticCurveTo(GX0, BASE, GX0 + 22, BASE);
      outer.lineTo(GX1 - 22, BASE);
      outer.quadraticCurveTo(GX1, BASE, GX1, BASE - 22);
      outer.lineTo(GX1, RIM);
      const inner = new Path2D();
      inner.moveTo(IX0, RIM + 2);
      inner.lineTo(IX0, FLOOR - 14);
      inner.quadraticCurveTo(IX0, FLOOR, IX0 + 14, FLOOR);
      inner.lineTo(IX1 - 14, FLOOR);
      inner.quadraticCurveTo(IX1, FLOOR, IX1, FLOOR - 14);
      inner.lineTo(IX1, RIM + 2);
      // the thick base: the water's colour, bent and brightened by the glass
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(GX0, FLOOR - 16);
      ctx.lineTo(GX0, BASE - 22);
      ctx.quadraticCurveTo(GX0, BASE, GX0 + 22, BASE);
      ctx.lineTo(GX1 - 22, BASE);
      ctx.quadraticCurveTo(GX1, BASE, GX1, BASE - 22);
      ctx.lineTo(GX1, FLOOR - 16);
      ctx.lineTo(IX1, FLOOR - 16);
      ctx.lineTo(IX1, FLOOR - 14);
      ctx.quadraticCurveTo(IX1, FLOOR, IX1 - 14, FLOOR);
      ctx.lineTo(IX0 + 14, FLOOR);
      ctx.quadraticCurveTo(IX0, FLOOR, IX0, FLOOR - 14);
      ctx.lineTo(IX0, FLOOR - 16);
      ctx.closePath();
      const bg = ctx.createLinearGradient(0, FLOOR, 0, BASE);
      bg.addColorStop(0, tintCss(0.4, 0.3));
      bg.addColorStop(0.5, "rgba(236,243,248,0.55)");
      bg.addColorStop(1, tintCss(0.32, 0.3));
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.restore();
      // the walls
      ctx.fillStyle = "rgba(232,240,246,0.42)";
      ctx.fillRect(GX0, RIM, WALL, FLOOR - RIM - 10);
      ctx.fillRect(IX1, RIM, WALL, FLOOR - RIM - 10);
      ctx.fillStyle = "rgba(236,243,248,0.18)";
      ctx.fillRect(IX0, RIM, IX1 - IX0, surfAt(CX) - RIM - 5);
      ctx.strokeStyle = "rgba(128,146,164,0.62)";
      ctx.lineWidth = 1;
      ctx.stroke(outer);
      ctx.strokeStyle = "rgba(128,146,164,0.3)";
      ctx.stroke(inner);
      // highlights: a long soft streak on the left, a hard thin one on the right, a glint on the base
      const hl = ctx.createLinearGradient(0, RIM, 0, FLOOR);
      hl.addColorStop(0, "rgba(255,255,255,0)");
      hl.addColorStop(0.12, "rgba(255,255,255,0.75)");
      hl.addColorStop(0.7, "rgba(255,255,255,0.35)");
      hl.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hl;
      ctx.beginPath();
      ctx.roundRect(IX0 + 6, RIM + 10, 7, FLOOR - RIM - 22, 3.5);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.roundRect(IX0 + 16, RIM + 26, 2, FLOOR - RIM - 70, 1);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(IX1 - 5, RIM + 14, 1.5, FLOOR - RIM - 40);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.beginPath();
      ctx.roundRect(GX0 + 24, BASE - 6, 44, 2, 1);
      ctx.fill();
      // the near side of the rim: a rounded lip catching the light
      ctx.beginPath();
      ctx.ellipse(CX, RIM, (GX1 - GX0) / 2, RIM_RY, 0, 0, Math.PI);
      ctx.strokeStyle = "rgba(128,146,164,0.72)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(CX, RIM + 1.2, (GX1 - GX0) / 2 - 2, RIM_RY - 1, 0, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(CX, RIM, (GX1 - GX0) / 2 - WALL, RIM_RY - 1.5, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = "rgba(128,146,164,0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // ── the pipette ──
      const p = s.pip;
      const px = p.x,
        lift = p.lift;
      ctx.save();
      ctx.translate(px, -lift);
      // a soft shadow it throws on the glass rim
      // tube, glass: straight, then tapering to the tip
      const tube = new Path2D();
      tube.moveTo(-5, 52);
      tube.lineTo(-5, 92);
      tube.quadraticCurveTo(-5, 98, -2.2, 103);
      tube.lineTo(-1.4, TIP);
      tube.lineTo(1.4, TIP);
      tube.lineTo(2.2, 103);
      tube.quadraticCurveTo(5, 98, 5, 92);
      tube.lineTo(5, 52);
      tube.closePath();
      ctx.fillStyle = "rgba(240,246,250,0.75)";
      ctx.fill(tube);
      // the ink in the tube, held up to its level
      const level = 102 - p.fill * 44;
      ctx.save();
      ctx.clip(tube);
      ctx.fillStyle = inkCss(p.hex, 0.9);
      ctx.fillRect(-6, level, 12, TIP - level + 2);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillRect(-6, level, 12, 1.2);
      ctx.restore();
      ctx.strokeStyle = "rgba(118,136,154,0.7)";
      ctx.lineWidth = 0.9;
      ctx.stroke(tube);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(-3.4, 55, 1.3, 38);
      // the collar
      ctx.fillStyle = "#d4d8dd";
      ctx.beginPath();
      ctx.roundRect(-7.5, 47, 15, 7, 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillRect(-6, 48.2, 12, 1.2);
      // the rubber bulb, squashed as it squeezes
      const sq = p.squeeze;
      ctx.save();
      ctx.translate(0, 48);
      ctx.scale(1 - 0.16 * sq, 1 - 0.07 * sq);
      const bulb = new Path2D();
      bulb.moveTo(-6.5, 0);
      bulb.bezierCurveTo(-7, -6, -13.5, -10, -13.5, -22);
      bulb.bezierCurveTo(-13.5, -34, -7, -40, 0, -40);
      bulb.bezierCurveTo(7, -40, 13.5, -34, 13.5, -22);
      bulb.bezierCurveTo(13.5, -10, 7, -6, 6.5, 0);
      bulb.closePath();
      const bgr = ctx.createRadialGradient(-5, -28, 1, 0, -20, 24);
      bgr.addColorStop(0, "#6b6b70");
      bgr.addColorStop(0.45, "#3a3a3d");
      bgr.addColorStop(1, "#1f1f22");
      ctx.fillStyle = bgr;
      ctx.fill(bulb);
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.ellipse(-5.5, -27, 2.6, 7, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // the drop gathering at the tip
      if (p.bead > 0) {
        const r = 1.2 + p.bead * 3.6;
        const g = ctx.createRadialGradient(-r * 0.35, TIP + r - r * 0.4, 0.2, 0, TIP + r, r);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.3, inkCss(p.hex, 0.95));
        g.addColorStop(1, inkCss(p.hex, 1));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, TIP + r * 0.92, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      void now;
    };

    const step = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      const t = now / 1000;
      // the pipette: a damped spring to where it is going; the tube fills with the new ink on the way
      const p = s.pip;
      p.t += dt;
      const k = 120,
        c = 2 * Math.sqrt(k) * 0.82;
      p.vx += (k * (p.tx - p.x) - c * p.vx) * dt;
      p.x += p.vx * dt;
      p.lift = Math.max(0, Math.abs(p.vx) * 0.05);
      if (p.pending) {
        if (p.t < 0.3) p.fill = Math.max(0, p.fill - dt * 4);
        else {
          if (p.hex !== p.pending.hex) p.hex = p.pending.hex;
          p.fill = Math.min(0.7, p.fill + dt * 2.6);
        }
      }
      const nextDrop = p.queue[0];
      if (nextDrop && p.pending) {
        const lead = p.t - (nextDrop.at - 0.3);
        if (lead > 0) {
          p.squeeze = clamp(Math.sin(clamp(lead / 0.34) * Math.PI));
          p.bead = clamp(lead / 0.28) * nextDrop.size;
        }
        if (p.t >= nextDrop.at) {
          p.queue.shift();
          s.drops.push({ x: p.x, y: TIP + 3, vy: 40, r: 2.6 + nextDrop.size * 1.9, hex: p.hex, absorb: p.pending.absorb, main: nextDrop.size >= 1 });
          p.bead = 0;
          p.fill = Math.max(0.2, p.fill - 0.12 * nextDrop.size);
          sfx.tick({ freq: 1800, gain: 0.025 });
          if (!p.queue.length) p.pending = null;
        }
      } else p.squeeze = Math.max(0, p.squeeze - dt * 4);
      // drops in the air
      for (const d of s.drops) {
        d.vy += 1500 * dt;
        d.y += d.vy * dt;
      }
      s.drops = s.drops.filter((d) => {
        if (d.y >= SURF - 1) {
          splash(d);
          return false;
        }
        return true;
      });
      for (const q of s.specks) {
        q.vy += 900 * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
      }
      s.specks = s.specks.filter((q) => q.y < SURF + 2 || q.vy < 0);
      // the surface: a little wave equation along the near edge
      const wv = s.wave,
        wvv = s.waveV;
      const n = wv.length;
      for (let sub = 0; sub < 3; sub++) {
        const h = dt / 3;
        for (let i = 0; i < n; i++) {
          const l = wv[Math.max(0, i - 1)],
            r = wv[Math.min(n - 1, i + 1)];
          wvv[i] += ((l + r - 2 * wv[i]) * 2600 - wv[i] * 26 - wvv[i] * 4.2) * h;
        }
        for (let i = 0; i < n; i++) wv[i] += wvv[i] * h;
      }
      // the water
      const sinceCalm = t - s.calmAt;
      const ink = f.ink;
      if (gpu) {
        const want = sinceCalm > 5.5 ? Math.max(s.relax, RELAX * clamp((sinceCalm - 5.5) / 3)) : s.relax;
        gpu.step(dt, {
          buoyancy: 58,
          curl: 6,
          damp: sinceCalm > 7 ? 0.9 : 0.16,
          relax: want,
          target: s.target.map((v) => v * TINT) as [number, number, number],
          time: t,
        });
        gpu.render(K);
        // the even colour the water is heading for, for the surface and the caustic
        const k = 1 - Math.exp(-dt * (sinceCalm > 2 ? 0.45 : 0.08));
        for (let ch = 0; ch < 3; ch++) s.tint[ch] += (s.target[ch] - s.tint[ch]) * k;
        draw(now);
        const busy = s.drops.length || s.specks.length || p.pending || Math.abs(p.tx - p.x) > 0.3 || sinceCalm < 26;
        if (busy) raf = requestAnimationFrame(step);
        else running = false;
        return;
      }
      // ink is heavier than water: where there is more of it, it sinks
      for (let j = 1; j <= NY; j++)
        for (let i = 1; i <= NX; i++) {
          const a = (i - 1) * 2 + DX * (j - 1) * 2;
          const sum = ink[0][a] + ink[1][a] + ink[2][a] + ink[0][a + DX + 1] + ink[1][a + DX + 1] + ink[2][a + DX + 1];
          const tgt = (s.target[0] + s.target[1] + s.target[2]) * TINT * 2;
          const extra = Math.max(0, sum - tgt);
          f.dens[I(i, j)] = extra;
          f.v[I(i, j)] += dt * (24 * extra + (Math.random() - 0.5) * 3 * Math.min(1, extra));
          f.u[I(i, j)] += dt * (Math.random() - 0.5) * 2.4 * Math.min(1, extra);
        }
      confine(f, 14, dt);
      advectVel(f, dt);
      project(f);
      // water is a little thick at this scale: slow the flow so it settles
      const damp = Math.exp(-dt * (sinceCalm > 7 ? 0.9 : 0.18));
      for (let q = 0; q < S; q++) {
        f.u[q] *= damp;
        f.v[q] *= damp;
      }
      advectInk(f, dt);
      // after a while the plumes have spread through the glass: settle to an even tint of the chosen ink
      const want = sinceCalm > 5.5 ? Math.max(s.relax, RELAX * clamp((sinceCalm - 5.5) / 3)) : s.relax;
      if (want > 0) {
        const r = 1 - Math.exp(-want * dt);
        for (let ch = 0; ch < 3; ch++) {
          const arr = ink[ch],
            tv = s.target[ch] * TINT;
          for (let q = 0; q < arr.length; q++) arr[q] += (tv - arr[q]) * r;
        }
      }
      // the colour the water shows at its surface and throws on the table: the ink actually in it
      for (let ch = 0; ch < 3; ch++) {
        let sum = 0,
          n = 0;
        const arr = ink[ch];
        for (let q = 0; q < arr.length; q += 7) {
          sum += arr[q];
          n++;
        }
        s.tint[ch] = sum / n / TINT;
      }
      paintInk();
      draw(now);
      // keep going while anything moves; rest once the glass has settled
      const busy = s.drops.length || s.specks.length || p.pending || Math.abs(p.tx - p.x) > 0.3 || sinceCalm < 26;
      if (busy) raf = requestAnimationFrame(step);
      else running = false;
    };
    s.wake = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };
    if (gpu) gpu.render(K);
    else paintInk();
    draw(performance.now());
    s.wake();
    return () => {
      cancelAnimationFrame(raf);
      running = false;
      s.wake = () => {};
      s.gpu = null;
      gpu?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  // ── stirring: drag in the water ──
  const drag = useRef<{ x: number; y: number; t: number } | null>(null);
  const toScene = (e: RPointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * SW, y: ((e.clientY - r.top) / r.height) * SH };
  };
  const onDown = (e: RPointerEvent<HTMLCanvasElement>) => {
    touched.current = true;
    const q = toScene(e);
    if (q.x < IX0 || q.x > IX1 || q.y < SURF - 10 || q.y > FLOOR) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { ...q, t: performance.now() };
  };
  const onMove = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d || reduce) return;
    const q = toScene(e);
    const now = performance.now();
    const dt = Math.max(8, now - d.t) / 1000;
    const s = st.current!;
    const f = s.fluid;
    if (s.gpu) {
      const u = clamp((q.x - IX0) / (IX1 - IX0)),
        v = clamp(1 - (q.y - SURF) / (FLOOR - SURF));
      s.gpu.splatVel(u, v, clamp(((q.x - d.x) / dt) * 0.55, -160, 160), clamp((-(q.y - d.y) / dt) * 0.55, -160, 160), 0.07);
    }
    const fx = (q.x - IX0) / CELL + 0.5,
      fy = (q.y - SURF) / ((FLOOR - SURF) / NY) + 0.5;
    const vx = clamp((q.x - d.x) / CELL / dt, -90, 90),
      vy = clamp((q.y - d.y) / CELL / dt, -90, 90);
    if (!s.gpu) for (let j = Math.max(1, Math.floor(fy - 4)); j <= Math.min(NY, Math.ceil(fy + 4)); j++)
      for (let i = Math.max(1, Math.floor(fx - 4)); i <= Math.min(NX, Math.ceil(fx + 4)); i++) {
        const w = Math.exp(-((i - fx) ** 2 + (j - fy) ** 2) / 5) * 0.35;
        f.u[I(i, j)] += vx * w;
        f.v[I(i, j)] += vy * w;
      }
    if (q.y < SURF + 14) {
      const wi = Math.round(clamp((q.x - IX0) / (IX1 - IX0)) * (s.wave.length - 1));
      s.waveV[wi] += clamp(Math.abs(vx) * 0.12, 0, 8);
    }
    s.calmAt = now / 1000;
    s.relax = 0;
    s.wake();
    drag.current = { ...q, t: now };
  };
  const onUp = () => {
    drag.current = null;
  };

  // ── autoplay: a new ink every few seconds until someone touches it ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let i = colors.findIndex((c) => c.id === value);
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      i = (i + 1) % colors.length;
      choose(colors[i], false);
    }, 5600);
    const first = window.setTimeout(() => !touched.current && choose(colors[(i = (i + 1) % colors.length)], false), 900);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, inView]);

  const onKey = (e: RKeyboardEvent, i: number) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + colors.length) % colors.length;
    btnRefs.current[n]?.focus();
    choose(colors[n]);
  };

  const hexLabel = useMemo(() => current.hex.toUpperCase(), [current.hex]);
  return (
    <div ref={rootRef} className={`w-full max-w-[340px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div id="ink-label" className="text-[17px] font-semibold tracking-[-0.02em]">
            {label}
          </div>
          <div className="mt-0.5 text-[13px] text-[#6e6e73]">{description}</div>
        </div>
        <div className="shrink-0 text-right" aria-live="polite">
          <div className="text-[13px] font-medium">{current.name}</div>
          <div className="text-[12px] tabular-nums text-[#86868b]">{hexLabel}</div>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="mx-auto mt-1 block touch-none select-none"
        style={{ width: SW, height: SH, maxWidth: "100%", aspectRatio: `${SW} / ${SH}` }}
      />
      <div role="radiogroup" aria-labelledby="ink-label" className="mt-2 flex justify-between px-1">
        {colors.map((c, i) => {
          const on = c.id === value;
          return (
            <button
              key={c.id}
              ref={(el) => {
            btnRefs.current[i] = el;
          }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={c.name}
              title={c.name}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(c)}
              onKeyDown={(e) => onKey(e, i)}
              className="relative grid h-[34px] w-[34px] place-items-center rounded-full outline-none focus-visible:shadow-[0_0_0_2px_#0071e3]"
            >
              {on && <motion.span layoutId="ink-ring" className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 1.5px ${c.hex}` }} transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
              <motion.span
                className="block h-[24px] w-[24px] rounded-full"
                animate={{ scale: on ? 0.9 : 1 }}
                whileHover={{ scale: on ? 0.9 : 1.08 }}
                whileTap={{ scale: 0.82 }}
                transition={{ type: "spring", stiffness: 520, damping: 26 }}
                style={{
                  background: `radial-gradient(circle at 34% 30%, rgba(255,255,255,.85) 0 9%, rgba(255,255,255,0) 26%), radial-gradient(circle at 50% 60%, ${c.hex} 0 58%, ${c.hex} 100%)`,
                  boxShadow: `inset 0 -2px 4px rgba(0,0,0,.18), inset 0 1px 1px rgba(255,255,255,.35), 0 2px 5px -1px ${c.hex}99`,
                }}
              />
            </button>
          );
        })}
      </div>
      {/* the interface, taking the colour once the ink has spread through the water */}
      <div aria-hidden="true" className="mt-4 flex items-center justify-between rounded-[14px] bg-[#f5f5f7] px-3 py-2.5" style={{ ["--ink" as string]: current.hex }}>
        <span className="rounded-full px-3 py-1 text-[12px] font-semibold text-white transition-colors delay-[1400ms] duration-[1200ms]" style={{ background: "var(--ink)" }}>
          Continue
        </span>
        <span className="text-[12px] font-medium transition-colors delay-[1600ms] duration-[1200ms]" style={{ color: "var(--ink)" }}>
          Learn more
        </span>
        <span className="relative h-[18px] w-[30px] rounded-full transition-colors delay-[1800ms] duration-[1200ms]" style={{ background: "var(--ink)" }}>
          <span className="absolute right-[2px] top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)]" />
        </span>
      </div>
      <div className="mt-3 text-center text-[12px] text-[#86868b]">Pick an ink to drop it in. Drag in the water to stir.</div>
    </div>
  );
}

// ───────────── the GPU fluid: the same stable-fluids scheme in shaders, velocity 112 cells across, ink 288 ─────────────
type GpuFluid = {
  canvas: HTMLCanvasElement;
  fill: (a: [number, number, number]) => void;
  splatDye: (u: number, v: number, a: [number, number, number], r: number) => void;
  splatVel: (u: number, v: number, vx: number, vy: number, r: number) => void;
  step: (dt: number, o: { buoyancy: number; curl: number; damp: number; relax: number; target: [number, number, number]; time: number }) => void;
  render: (k: number) => void;
  dispose: () => void;
};
const FVS = `attribute vec2 aPos; varying vec2 vUv, vL, vR, vT, vB; uniform vec2 texel;
void main(){ vUv = aPos * 0.5 + 0.5; vL = vUv - vec2(texel.x, 0.0); vR = vUv + vec2(texel.x, 0.0); vT = vUv + vec2(0.0, texel.y); vB = vUv - vec2(0.0, texel.y); gl_Position = vec4(aPos, 0.0, 1.0); }`;
const FS: Record<string, string> = {
  splat: `precision highp float; varying vec2 vUv; uniform sampler2D uT; uniform float aspect, radius; uniform vec3 color; uniform vec2 point;
    void main(){ vec2 p = vUv - point; p.x *= aspect; p.y *= 1.6; gl_FragColor = vec4(texture2D(uT, vUv).xyz + color * exp(-dot(p, p) / (radius * radius)), 1.0); }`,
  fill: `precision highp float; uniform vec3 color; void main(){ gl_FragColor = vec4(color, 1.0); }`,
  advect: `precision highp float; varying vec2 vUv; uniform sampler2D uV, uS; uniform vec2 vtexel; uniform float dt, keep;
    void main(){ vec2 c = vUv - dt * texture2D(uV, vUv).xy * vtexel; gl_FragColor = keep * texture2D(uS, c); }`,
  div: `precision highp float; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uV;
    void main(){ float L = texture2D(uV, vL).x, R = texture2D(uV, vR).x, T = texture2D(uV, vT).y, B = texture2D(uV, vB).y; vec2 C = texture2D(uV, vUv).xy;
      if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }`,
  curl: `precision highp float; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uV;
    void main(){ gl_FragColor = vec4(0.5 * (texture2D(uV, vR).y - texture2D(uV, vL).y - texture2D(uV, vT).x + texture2D(uV, vB).x), 0.0, 0.0, 1.0); }`,
  vort: `precision highp float; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uV, uC; uniform float curl, dt;
    void main(){ float L = texture2D(uC, vL).x, R = texture2D(uC, vR).x, T = texture2D(uC, vT).x, B = texture2D(uC, vB).x, C = texture2D(uC, vUv).x;
      vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); f /= length(f) + 1e-4; f *= curl * C; f.y *= -1.0;
      gl_FragColor = vec4(texture2D(uV, vUv).xy + f * dt, 0.0, 1.0); }`,
  press: `precision highp float; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uP, uD;
    void main(){ gl_FragColor = vec4((texture2D(uP, vL).x + texture2D(uP, vR).x + texture2D(uP, vB).x + texture2D(uP, vT).x - texture2D(uD, vUv).x) * 0.25, 0.0, 0.0, 1.0); }`,
  grad: `precision highp float; varying vec2 vUv, vL, vR, vT, vB; uniform sampler2D uP, uV; uniform vec2 texel;
    void main(){ vec2 v = texture2D(uV, vUv).xy - vec2(texture2D(uP, vR).x - texture2D(uP, vL).x, texture2D(uP, vT).x - texture2D(uP, vB).x);
      if (vUv.x < texel.x) v.x = max(v.x, 0.0); if (vUv.x > 1.0 - texel.x) v.x = min(v.x, 0.0);
      if (vUv.y < texel.y) v.y = max(v.y, 0.0); if (vUv.y > 1.0 - texel.y) v.y = min(v.y, 0.0);
      gl_FragColor = vec4(v, 0.0, 1.0); }`,
  buoy: `precision highp float; varying vec2 vUv; uniform sampler2D uV, uD; uniform float k, dt, rest, seed;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
    void main(){ vec3 a = texture2D(uD, vUv).rgb; float extra = max(0.0, a.r + a.g + a.b - rest);
      vec2 v = texture2D(uV, vUv).xy; v.y -= dt * k * extra; v += dt * (vec2(h(vUv), h(vUv + 0.37)) - 0.5) * 2.0 * min(1.0, extra);
      gl_FragColor = vec4(v, 0.0, 1.0); }`,
  relax: `precision highp float; varying vec2 vUv; uniform sampler2D uD; uniform vec3 target; uniform float r;
    void main(){ gl_FragColor = vec4(mix(texture2D(uD, vUv).rgb, target, r), 1.0); }`,
  // the water as we see it: through a cylinder of glass (magnified toward the middle, a touch of colour fringing
  // toward the walls), the ink darkening the light by how much of it there is, and lit like a cloud: brighter where it
  // faces the light above, shadowed beneath
  show: `precision highp float; varying vec2 vUv; uniform sampler2D uD; uniform vec2 dtexel; uniform float K;
    vec2 lens(vec2 uv, float a){ float x = uv.x * 2.0 - 1.0; return vec2(asin(clamp(x * sin(a), -1.0, 1.0)) / a * 0.5 + 0.5, uv.y); }
    vec3 ink(vec2 uv){ return texture2D(uD, uv).rgb; }
    void main(){
      float edge = abs(vUv.x * 2.0 - 1.0);
      vec2 ur = lens(vUv, 1.07), ug = lens(vUv, 1.0), ub = lens(vUv, 0.93);
      vec3 a = vec3(ink(ur).r, ink(ug).g, ink(ub).b);
      float d = a.r + a.g + a.b;
      float dl = dot(ink(ug - vec2(dtexel.x * 2.0, 0.0)), vec3(1.0)), dr = dot(ink(ug + vec2(dtexel.x * 2.0, 0.0)), vec3(1.0));
      float du = dot(ink(ug + vec2(0.0, dtexel.y * 2.0)), vec3(1.0)), dd = dot(ink(ug - vec2(0.0, dtexel.y * 2.0)), vec3(1.0));
      vec2 g = vec2(dr - dl, du - dd);
      float lit = 1.0 + clamp(dot(g, normalize(vec2(-0.55, 0.85))) * 0.7, -0.16, 0.2) * smoothstep(0.05, 0.4, d);
      vec3 base = vec3(0.965, 0.98, 0.992) * (1.0 - 0.05 * (1.0 - vUv.y));
      vec3 col = base * exp(-a * K / (1.0 + a * 0.45)) * lit;
      col += vec3(1.0) * 0.05 * (1.0 - exp(-d * 1.5)) * (1.0 - smoothstep(0.6, 1.0, edge));
      gl_FragColor = vec4(col, 1.0);
    }`,
};
function makeGpuFluid(w: number, h: number, dpr: number): GpuFluid | null {
  let canvas = document.createElement("canvas");
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const opts = { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false };
  let gl = canvas.getContext("webgl2", opts) as WebGL2RenderingContext | WebGLRenderingContext | null;
  let internal = 0,
    type = 0;
  if (gl && "texStorage2D" in gl && gl.getExtension("EXT_color_buffer_float")) {
    const g2 = gl as WebGL2RenderingContext;
    internal = g2.RGBA16F;
    type = g2.HALF_FLOAT;
  } else {
    // a canvas keeps the first kind of context asked of it, so the fallback needs its own
    const c1 = document.createElement("canvas");
    c1.width = canvas.width;
    c1.height = canvas.height;
    canvas = c1;
    gl = canvas.getContext("webgl", opts) as WebGLRenderingContext | null;
    const hf = gl?.getExtension("OES_texture_half_float");
    if (!gl || !hf || !gl.getExtension("OES_texture_half_float_linear")) return null;
    gl.getExtension("EXT_color_buffer_half_float");
    internal = gl.RGBA;
    type = hf.HALF_FLOAT_OES;
  }
  const G = gl;
  const compile = (t: number, src: string) => {
    const s = G.createShader(t)!;
    G.shaderSource(s, src);
    G.compileShader(s);
    return G.getShaderParameter(s, G.COMPILE_STATUS) ? s : null;
  };
  const vs = compile(G.VERTEX_SHADER, FVS);
  if (!vs) return null;
  const progs: Record<string, { p: WebGLProgram; u: (n: string) => WebGLUniformLocation | null }> = {};
  for (const [k, src] of Object.entries(FS)) {
    const fs = compile(G.FRAGMENT_SHADER, src);
    if (!fs) return null;
    const p = G.createProgram()!;
    G.attachShader(p, vs);
    G.attachShader(p, fs);
    G.bindAttribLocation(p, 0, "aPos");
    G.linkProgram(p);
    if (!G.getProgramParameter(p, G.LINK_STATUS)) return null;
    const cache: Record<string, WebGLUniformLocation | null> = {};
    progs[k] = { p, u: (n) => (n in cache ? cache[n] : (cache[n] = G.getUniformLocation(p, n))) };
  }
  const buf = G.createBuffer();
  G.bindBuffer(G.ARRAY_BUFFER, buf);
  G.bufferData(G.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), G.STATIC_DRAW);
  G.enableVertexAttribArray(0);
  G.vertexAttribPointer(0, 2, G.FLOAT, false, 0, 0);
  type FBO = { tex: WebGLTexture; fb: WebGLFramebuffer; w: number; h: number };
  const fbo = (fw: number, fh: number): FBO | null => {
    const tex = G.createTexture()!;
    G.bindTexture(G.TEXTURE_2D, tex);
    G.texParameteri(G.TEXTURE_2D, G.TEXTURE_MIN_FILTER, G.LINEAR);
    G.texParameteri(G.TEXTURE_2D, G.TEXTURE_MAG_FILTER, G.LINEAR);
    G.texParameteri(G.TEXTURE_2D, G.TEXTURE_WRAP_S, G.CLAMP_TO_EDGE);
    G.texParameteri(G.TEXTURE_2D, G.TEXTURE_WRAP_T, G.CLAMP_TO_EDGE);
    G.texImage2D(G.TEXTURE_2D, 0, internal, fw, fh, 0, G.RGBA, type, null);
    const fb = G.createFramebuffer()!;
    G.bindFramebuffer(G.FRAMEBUFFER, fb);
    G.framebufferTexture2D(G.FRAMEBUFFER, G.COLOR_ATTACHMENT0, G.TEXTURE_2D, tex, 0);
    if (G.checkFramebufferStatus(G.FRAMEBUFFER) !== G.FRAMEBUFFER_COMPLETE) return null;
    G.viewport(0, 0, fw, fh);
    G.clearColor(0, 0, 0, 1);
    G.clear(G.COLOR_BUFFER_BIT);
    return { tex, fb, w: fw, h: fh };
  };
  const dbl = (fw: number, fh: number) => {
    const a = fbo(fw, fh),
      b = fbo(fw, fh);
    if (!a || !b) return null;
    const d = { read: a, write: b, swap: () => ([d.read, d.write] = [d.write, d.read]) };
    return d;
  };
  const VWc = 112,
    VHc = Math.round((112 * h) / w);
  const DWc = 288,
    DHc = Math.round((288 * h) / w);
  const vel = dbl(VWc, VHc),
    dye = dbl(DWc, DHc),
    pres = dbl(VWc, VHc),
    div = fbo(VWc, VHc),
    curlT = fbo(VWc, VHc);
  if (!vel || !dye || !pres || !div || !curlT) return null;
  const run = (name: string, target: FBO | null, set: (u: (n: string) => WebGLUniformLocation | null) => void, texel?: [number, number]) => {
    const pr = progs[name];
    // WebGL's useProgram, not a React hook
    // eslint-disable-next-line react-hooks/rules-of-hooks
    G.useProgram(pr.p);
    if (texel) G.uniform2f(pr.u("texel"), texel[0], texel[1]);
    set(pr.u);
    if (target) {
      G.bindFramebuffer(G.FRAMEBUFFER, target.fb);
      G.viewport(0, 0, target.w, target.h);
    } else {
      G.bindFramebuffer(G.FRAMEBUFFER, null);
      G.viewport(0, 0, canvas.width, canvas.height);
    }
    G.drawArrays(G.TRIANGLE_STRIP, 0, 4);
  };
  const bind = (unit: number, t: WebGLTexture) => {
    G.activeTexture(G.TEXTURE0 + unit);
    G.bindTexture(G.TEXTURE_2D, t);
    return unit;
  };
  const vt: [number, number] = [1 / VWc, 1 / VHc];
  const aspect = w / h;
  return {
    canvas,
    fill(a) {
      run("fill", dye.write, (u) => G.uniform3f(u("color"), a[0], a[1], a[2]));
      dye.swap();
    },
    splatDye(x, y, a, r) {
      run("splat", dye.write, (u) => {
        G.uniform1i(u("uT"), bind(0, dye.read.tex));
        G.uniform1f(u("aspect"), aspect);
        G.uniform1f(u("radius"), r);
        G.uniform3f(u("color"), a[0], a[1], a[2]);
        G.uniform2f(u("point"), x, y);
      });
      dye.swap();
    },
    splatVel(x, y, vx, vy, r) {
      run("splat", vel.write, (u) => {
        G.uniform1i(u("uT"), bind(0, vel.read.tex));
        G.uniform1f(u("aspect"), aspect);
        G.uniform1f(u("radius"), r);
        G.uniform3f(u("color"), vx, vy, 0);
        G.uniform2f(u("point"), x, y);
      });
      vel.swap();
    },
    step(dt, o) {
      // ink is heavier than water, and seeds its own fingers with a little noise
      run("buoy", vel.write, (u) => {
        G.uniform1i(u("uV"), bind(0, vel.read.tex));
        G.uniform1i(u("uD"), bind(1, dye.read.tex));
        G.uniform1f(u("k"), o.buoyancy);
        G.uniform1f(u("dt"), dt);
        G.uniform1f(u("rest"), o.target[0] + o.target[1] + o.target[2]);
        G.uniform1f(u("seed"), o.time % 100);
      });
      vel.swap();
      run("curl", curlT, (u) => G.uniform1i(u("uV"), bind(0, vel.read.tex)), vt);
      run(
        "vort",
        vel.write,
        (u) => {
          G.uniform1i(u("uV"), bind(0, vel.read.tex));
          G.uniform1i(u("uC"), bind(1, curlT.tex));
          G.uniform1f(u("curl"), o.curl);
          G.uniform1f(u("dt"), dt);
        },
        vt,
      );
      vel.swap();
      run("div", div, (u) => G.uniform1i(u("uV"), bind(0, vel.read.tex)), vt);
      run("fill", pres.write, (u) => G.uniform3f(u("color"), 0, 0, 0));
      pres.swap();
      for (let i = 0; i < 22; i++) {
        run(
          "press",
          pres.write,
          (u) => {
            G.uniform1i(u("uP"), bind(0, pres.read.tex));
            G.uniform1i(u("uD"), bind(1, div.tex));
          },
          vt,
        );
        pres.swap();
      }
      run(
        "grad",
        vel.write,
        (u) => {
          G.uniform1i(u("uP"), bind(0, pres.read.tex));
          G.uniform1i(u("uV"), bind(1, vel.read.tex));
        },
        vt,
      );
      vel.swap();
      run("advect", vel.write, (u) => {
        G.uniform1i(u("uV"), bind(0, vel.read.tex));
        G.uniform1i(u("uS"), bind(0, vel.read.tex));
        G.uniform2f(u("vtexel"), vt[0], vt[1]);
        G.uniform1f(u("dt"), dt);
        G.uniform1f(u("keep"), Math.exp(-dt * o.damp));
      });
      vel.swap();
      run("advect", dye.write, (u) => {
        G.uniform1i(u("uV"), bind(0, vel.read.tex));
        G.uniform1i(u("uS"), bind(1, dye.read.tex));
        G.uniform2f(u("vtexel"), vt[0], vt[1]);
        G.uniform1f(u("dt"), dt);
        G.uniform1f(u("keep"), 1);
      });
      dye.swap();
      if (o.relax > 0) {
        run("relax", dye.write, (u) => {
          G.uniform1i(u("uD"), bind(0, dye.read.tex));
          G.uniform3f(u("target"), o.target[0], o.target[1], o.target[2]);
          G.uniform1f(u("r"), 1 - Math.exp(-o.relax * dt));
        });
        dye.swap();
      }
    },
    render(k) {
      run("show", null, (u) => {
        G.uniform1i(u("uD"), bind(0, dye.read.tex));
        G.uniform2f(u("dtexel"), 1 / DWc, 1 / DHc);
        G.uniform1f(u("K"), k);
      });
    },
    dispose() {
      G.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
