"use client";

/* eslint-disable react-hooks/immutability -- the pointer handlers write into the simulation object held in a ref, which the animation frame reads; nothing rendered depends on it */

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";

export type InfiniteBranchesLink = { label: string; href: string };

export type InfiniteBranchesProps = {
  brand?: string;
  links?: InfiniteBranchesLink[];
  title?: string;
  subtitle?: string;
  primary?: InfiniteBranchesLink;
  secondary?: InfiniteBranchesLink;
  note?: string;
  /** where the strands come from: behind the headline, or from below the page */
  origin?: "center" | "bottom";
  /**
   * what sits over the effect: "full" (a bar, a big headline, a subtitle and two buttons), "minimal" (the brand, and a
   * smaller headline with the buttons low down, leaving the source clear), or "none" (the effect alone, to present it)
   */
  content?: "full" | "minimal" | "none";
  /** stop drawing, for when something covers it */
  paused?: boolean;
  /** px, "screen" for the full viewport, or "fill" to fill a positioned parent */
  height?: number | "screen" | "fill";
  className?: string;
};

// Phosphor Icons (MIT), via Iconify
const ICON = {
  brand:
    '<path fill="currentColor" d="M144 96V80h-16a8 8 0 0 0-8 8v80a8 8 0 0 0 8 8h16v-16a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16h-48a16 16 0 0 1-16-16v-16h-16a24 24 0 0 1-24-24v-32H72v8a16 16 0 0 1-16 16H24a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h32a16 16 0 0 1 16 16v8h32V88a24 24 0 0 1 24-24h16V48a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v48a16 16 0 0 1-16 16h-48a16 16 0 0 1-16-16"/>',
  play: '<path fill="currentColor" d="M240 128a15.74 15.74 0 0 1-7.6 13.51L88.32 229.65a16 16 0 0 1-16.2.3A15.86 15.86 0 0 1 64 216.13V39.87a15.86 15.86 0 0 1 8.12-13.82a16 16 0 0 1 16.2.3l144.08 88.14A15.74 15.74 0 0 1 240 128"/>',
};

// ───────────── the rift: strands of light running out of one point forever, drawn in three depths ─────────────

const N = 40; // points along each strand
const DEPTH = 46; // how much further away the far end of a strand is than the near end
const Q0 = 1 / DEPTH; // and so how close to the vanishing point it starts, as a fraction of its reach
const WORLD = 1100; // a strand's length in depth, in the units light and growth travel in (times the scale)
const FIRST_SURGE = 6; // seconds after it opens, once the strands have grown out
const GROW = 4.6; // seconds the strands take to shoot out of the source when it opens
const SURGE_EVERY = 11;
const SURGE_LEN = 2.8;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const hash = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};
/** smooth value noise, 0 to 1 */
const noise = (x: number, y: number) => {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi;
  const u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi),
    b = hash(xi + 1, yi),
    c = hash(xi, yi + 1),
    d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number, oct = 5) => {
  let s = 0,
    amp = 0.5,
    f = 1,
    norm = 0;
  for (let o = 0; o < oct; o++) {
    s += amp * noise(x * f, y * f);
    norm += amp;
    f *= 2.03;
    amp *= 0.5;
  }
  return s / norm;
};

type Strand = {
  band: 0 | 1 | 2; // far, middle, near
  depth: number;
  base: number; // its direction out of the source, or for a fork its turn off its parent
  bend: number;
  reach: number;
  pow: number; // how slowly it leaves the source: near strands come at you in perspective
  r0: number;
  w0: number;
  w1: number;
  amp: number; // the waves that run out along it
  k: number;
  speed: number;
  phase: number;
  seed: number;
  spin: number;
  glow: boolean; // carries light of its own
  parent: Strand | null;
  from: number; // where on its parent it forks off
  fade: number; // where along it it starts to thin away, or 1 if it runs off the page
  ox: number; // a stray twig grows from its own point, not the source (NaN for every other strand)
  oy: number;
  kink: number; // how crooked it is: twigs bend in sharp little turns
  xs: Float32Array;
  ys: Float32Array;
  ws: Float32Array;
  cum: Float32Array; // distance along it, on the screen
  wc: Float32Array; // distance along it in depth, from where it comes out of the distance: light and growth travel in this
  start: number; // and from the source to its first point
};
type Pulse = { S: Strand; front: number; v: number; len: number };
type Streak = { a: number; r: number; v: number; w: number; gold: boolean };
type Mote = { x: number; y: number; vx: number; vy: number; depth: number; ph: number; gold: boolean; age: number; life: number };

/** a soft round light, drawn once and stamped wherever something glows */
function sprite(size: number, stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}
const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
};

class Rift {
  w: number;
  h: number;
  k: number;
  s: number;
  cx: number;
  cy: number;
  hd: number;
  round: boolean;
  still: boolean;
  t = 0;
  strands: Strand[] = [];
  bands: Strand[][] = [[], [], []];
  pulses: Pulse[] = [];
  streaks: Streak[] = [];
  motes: Mote[] = [];
  pulseAcc = 0;
  streakAcc = 0;
  frame = 0;
  flare = 0;
  surge = -1; // how far the current surge has got, 0 to 1, or -1
  pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  quiet: { x: number; y: number; w: number; h: number } | null = null;
  // what it draws with
  fog: HTMLCanvasElement;
  rays: HTMLCanvasElement;
  bgC: HTMLCanvasElement; // the haze, the glow and the fog together, at half size: they are all soft
  glowC: HTMLCanvasElement;
  glow: CanvasRenderingContext2D;
  nearC: HTMLCanvasElement;
  near: CanvasRenderingContext2D;
  nk: number;
  eighth: HTMLCanvasElement;
  sixteenth: HTMLCanvasElement;
  core: HTMLCanvasElement;
  violet: HTMLCanvasElement; // a faint cold violet high up in the haze
  sky: HTMLCanvasElement; // a brighter cloud of haze above the source
  wash: HTMLCanvasElement; // the green that floods the air in a surge
  ropeAngles: number[] = [];
  dot: HTMLCanvasElement;
  ember: HTMLCanvasElement;
  bufL = new Float32Array(N * 2);
  bufR = new Float32Array(N * 2);

  constructor(w: number, h: number, k: number, round: boolean, still: boolean) {
    this.w = w;
    this.h = h;
    this.k = k;
    this.round = round;
    this.still = still;
    this.s = clamp(Math.min(w, h) / 640, 0.6, 1.5);
    this.hd = Math.hypot(w, h) / 2;
    this.cx = w / 2;
    this.cy = round ? h * 0.47 : h + 40 * this.s;
    this.grow();
    // canvases
    this.bgC = canvas((w * k) / 2, (h * k) / 2);
    this.glowC = canvas((w * k) / 2, (h * k) / 2); // the light is soft, so half size is plenty
    this.glow = this.glowC.getContext("2d")!;
    this.nk = k / 4; // the near strands are drawn small and enlarged: out of focus, cheaply
    this.nearC = canvas(w * this.nk, h * this.nk);
    this.near = this.nearC.getContext("2d")!;
    this.eighth = canvas((w * k) / 8, (h * k) / 8);
    this.sixteenth = canvas((w * k) / 16, (h * k) / 16);
    this.core = sprite(128, [
      [0, "rgba(255,232,180,.62)"],
      [0.05, "rgba(236,226,170,.36)"],
      [0.18, "rgba(110,180,155,.17)"],
      [0.5, "rgba(46,104,104,.07)"],
      [1, "rgba(30,80,90,0)"],
    ]);
    this.sky = sprite(64, [
      [0, "rgba(96,156,164,.42)"],
      [0.5, "rgba(60,110,124,.16)"],
      [1, "rgba(40,80,100,0)"],
    ]);
    this.wash = sprite(64, [
      [0, "rgba(120,240,150,.7)"],
      [0.35, "rgba(60,200,120,.38)"],
      [1, "rgba(30,140,90,0)"],
    ]);
    this.violet = sprite(64, [
      [0, "rgba(118,98,188,.5)"],
      [0.5, "rgba(84,80,150,.18)"],
      [1, "rgba(60,60,120,0)"],
    ]);
    this.dot = sprite(32, [
      [0, "rgba(230,255,240,1)"],
      [0.3, "rgba(150,240,200,.45)"],
      [1, "rgba(80,200,160,0)"],
    ]);
    this.ember = sprite(32, [
      [0, "rgba(255,240,190,1)"],
      [0.3, "rgba(255,180,80,.55)"],
      [1, "rgba(255,140,40,0)"],
    ]);
    this.fog = this.paintFog();
    this.rays = this.paintRays();
    for (let i = 0; i < Math.round(70 * clamp((w * h) / 921600, 0.4, 1.6)); i++) this.motes.push(this.mote(false, true));
    for (let i = 0; i < 12; i++) this.motes.push(this.mote(true, true));
  }

  /** the strands: roots out of the source in three depths, each forking a few times towards its end */
  grow() {
    const { s, hd, round } = this;
    const area = clamp((this.w * this.h) / 921600, 0.4, 1.7);
    const counts = [Math.round(96 * Math.sqrt(area)), Math.round(54 * Math.sqrt(area)), Math.round(14 + 6 * Math.sqrt(area))];
    const R = Math.random;
    // strands gather into ropes: most of them follow one of a few directions, and sway with it
    const nRopes = round ? 15 : 11;
    const wing = () => {
      const r = R();
      if (r < 0.4) return -0.18 + (R() - 0.5) * 1.15; // the right wing
      if (r < 0.8) return Math.PI + 0.18 + (R() - 0.5) * 1.15; // the left
      if (r < 0.93) return -Math.PI / 2 + (R() - 0.5) * 1.0; // up
      return Math.PI / 2 + (R() - 0.5) * 1.3; // a few down
    };
    const ropes: { a: number; bend: number; k: number; speed: number; phase: number }[] = Array.from({ length: nRopes }, (_, i) => ({
      a: round ? wing() : -Math.PI / 2 + (((i + R() * 0.8) / nRopes) * 2 - 1) * 1.38,
      bend: (R() - 0.5) * 0.7,
      k: 0.7 + 1.1 * R(),
      speed: 0.4 + 0.45 * R(),
      phase: R() * 6.28,
    }));
    this.ropeAngles = ropes.map((r) => r.a);
    const edge = Math.min(this.w, this.h) * 0.5;
    const make = (p: Omit<Strand, "xs" | "ys" | "ws" | "cum" | "wc" | "start" | "fade" | "seed" | "ox" | "oy" | "kink">, extra?: Partial<Strand>): Strand => {
      // roots that reach past the edge run off the page at full width; the rest, and every fork, thin away
      const fade = !p.parent && p.reach > edge * 1.15 && !extra ? 1 : 0.55 + 0.25 * R();
      const S: Strand = { ...p, fade, seed: R(), ox: NaN, oy: NaN, kink: p.band === 0 ? 0.22 : 0.05, ...extra, xs: new Float32Array(N), ys: new Float32Array(N), ws: new Float32Array(N), cum: new Float32Array(N), wc: new Float32Array(N), start: 0 };
      this.strands.push(S);
      this.bands[S.band]!.push(S);
      return S;
    };
    const fork = (P: Strand, depth: number) => {
      const kid = make({
        band: P.band,
        depth: P.depth,
        base: (R() < 0.5 ? -1 : 1) * (0.1 + 0.3 * R()),
        bend: (R() - 0.5) * 0.7,
        reach: P.reach * (0.3 + 0.32 * R()),
        pow: 1,
        r0: 0,
        w0: 0,
        w1: P.w1 * (0.42 + 0.3 * R()),
        amp: P.amp * (0.5 + 0.3 * R()),
        k: P.k * (1 + R() * 0.6),
        speed: P.speed * (0.8 + 0.5 * R()),
        phase: R() * 6.28,
        spin: 0,
        glow: P.glow && R() < 0.6,
        parent: P,
        from: Math.floor((N - 3) * (0.3 + 0.48 * R())) + 1,
      });
      if (depth < 2 && R() < 0.55) fork(kid, depth + 1);
    };
    for (const band of [0, 1, 2] as const) {
      const n = counts[band]!;
      for (let i = 0; i < n; i++) {
        const depth = band === 0 ? 0.05 + 0.33 * R() : band === 1 ? 0.42 + 0.3 * R() : 0.78 + 0.22 * R();
        const free = round ? ((i + R() * 0.85) / n) * Math.PI * 2 + band * 0.7 : -Math.PI / 2 + (((i + R()) / n) * 2 - 1) * 1.42;
        const rope = R() < (band === 0 ? 0.55 : 0.8) ? ropes[Math.floor(R() * ropes.length)]! : null;
        const spread = (R() + R() + R() - 1.5) * (band === 2 ? 0.1 : 0.07);
        const root = make({
          band,
          depth,
          base: rope ? rope.a + spread : free,
          bend: rope ? rope.bend + (R() - 0.5) * 0.12 : (R() - 0.5) * (band === 2 ? 0.9 : 0.6),
          reach: hd * (band === 0 ? 0.5 + 0.45 * R() : band === 1 ? 0.78 + 0.5 * R() : 1.15 + 0.55 * R()) * (round ? 1 : 1.2),
          pow: band === 0 ? 1.02 : band === 1 ? 1.18 : 1.6,
          r0: (band === 0 ? 4 + 10 * R() : band === 1 ? 6 + 16 * R() : 10 + 30 * R()) * s,
          w0: (band === 2 ? 1 : 0.35 + 0.35 * R()) * s,
          w1: (band === 0 ? 0.8 + 1.4 * R() : band === 1 ? 3 + 5 * R() : 14 + 22 * R()) * s,
          amp: (band === 0 ? 5 + 9 * R() : band === 1 ? 9 + 14 * R() : 16 + 26 * R()) * s,
          k: rope ? rope.k * (0.94 + 0.12 * R()) : 0.7 + 1.1 * R(),
          speed: rope ? rope.speed * (0.94 + 0.12 * R()) : 0.4 + 0.5 * R(),
          phase: rope ? rope.phase + (R() - 0.5) * 0.5 : R() * 6.28,
          spin: (R() - 0.5) * 0.012,
          glow: band < 2 && R() < (band === 0 ? 0.08 : 0.13),
          parent: null,
          from: 0,
        });
        const forks = band === 2 ? (R() < 0.5 ? 1 : 0) : R() < 0.8 ? 1 + Math.floor(R() * 2.2) : 0;
        for (let f = 0; f < forks; f++) fork(root, 0);
      }
    }
    // a web of thin, crooked twigs far back in the haze, crossing every which way
    const twigs = Math.round(34 * Math.sqrt(area));
    for (let i = 0; i < twigs; i++) {
      const twig = make(
        {
          band: 0,
          depth: 0.1 + 0.25 * R(),
          base: R() * Math.PI * 2,
          bend: (R() - 0.5) * 1.2,
          reach: hd * (0.35 + 0.5 * R()),
          pow: 1,
          r0: 0,
          w0: (0.5 + 0.5 * R()) * s,
          w1: (0.6 + 0.9 * R()) * s,
          amp: (3 + 6 * R()) * s,
          k: 0.6 + R(),
          speed: 0.2 + 0.3 * R(),
          phase: R() * 6.28,
          spin: 0,
          glow: R() < 0.12,
          parent: null,
          from: 0,
        },
        { ox: R() * this.w, oy: R() * this.h, kink: 0.55 + 0.4 * R() },
      );
      if (R() < 0.6) fork(twig, 1);
    }
  }

  /** drifting fog: soft lighter patches, painted small and enlarged */
  paintFog() {
    const fw = Math.ceil(this.w / 6),
      fh = Math.ceil(this.h / 6);
    const c = canvas(fw, fh),
      g = c.getContext("2d")!,
      img = g.createImageData(fw, fh);
    for (let y = 0; y < fh; y++)
      for (let x = 0; x < fw; x++) {
        const v = Math.pow(fbm(x * 0.026 + 3.1, y * 0.026 + 7.7, 5), 2.8);
        const i = (y * fw + x) * 4;
        img.data[i] = 64;
        img.data[i + 1] = 118;
        img.data[i + 2] = 124;
        img.data[i + 3] = clamp(v * 2.7, 0, 1) * 255;
      }
    g.putImageData(img, 0, 0);
    return c;
  }

  /** the haze of light radiating from the source, in uneven shafts */
  paintRays() {
    const D = Math.ceil(this.hd * 0.6);
    const c = canvas(D, D),
      g = c.getContext("2d")!,
      img = g.createImageData(D, D);
    for (let y = 0; y < D; y++)
      for (let x = 0; x < D; x++) {
        const dx = (x - D / 2) / (D / 2),
          dy = (y - D / 2) / (D / 2),
          rho = Math.hypot(dx, dy);
        if (rho > 1) continue;
        const ca = dx / (rho || 1),
          sa = dy / (rho || 1);
        const shaft = Math.pow(fbm(ca * 3 + 5, sa * 3 + 5, 4), 3) * 1.9 + 0.4 * Math.pow(fbm(ca * 16 + 1, sa * 16 + 2, 2), 3);
        const fall = Math.exp(-rho * 3) * (1 - rho);
        const v = clamp(shaft * fall * 0.75 + Math.exp(-rho * rho * 40) * 0.4);
        const i = (y * D + x) * 4;
        img.data[i] = 92;
        img.data[i + 1] = 176;
        img.data[i + 2] = 164;
        img.data[i + 3] = v * 255;
      }
    g.putImageData(img, 0, 0);
    return c;
  }

  mote(gold: boolean, anywhere: boolean): Mote {
    const R = Math.random;
    if (gold) {
      const a = this.round ? R() * Math.PI * 2 : -Math.PI / 2 + (R() - 0.5) * 2.4;
      const r = (anywhere ? R() * 160 : 10 + R() * 30) * this.s;
      return { x: this.cx + Math.cos(a) * r, y: Math.min(this.h - 4, this.cy + Math.sin(a) * r), vx: Math.cos(a) * 9 * this.s, vy: Math.sin(a) * 7 * this.s - 6 * this.s, depth: 0.5 + R() * 0.5, ph: R() * 6.28, gold, age: anywhere ? R() * 5 : 0, life: 4 + R() * 4 };
    }
    return { x: R() * this.w, y: R() * this.h, vx: (R() - 0.5) * 5 * this.s, vy: (-2 - R() * 5) * this.s, depth: R(), ph: R() * 6.28, gold, age: 0, life: 1e9 };
  }

  /** move everything on */
  step(dt: number) {
    this.t += dt;
    const { t, s, hd } = this;
    const p = this.pointer;
    p.x += (p.tx - p.x) * (1 - Math.exp(-dt * 2.4));
    p.y += (p.ty - p.y) * (1 - Math.exp(-dt * 2.4));
    // the surge: every so often light rushes out through every strand at once
    const since = t - FIRST_SURGE,
      ph = since - Math.floor(since / SURGE_EVERY) * SURGE_EVERY;
    this.surge = !this.still && since >= 0 && ph < SURGE_LEN ? ph / SURGE_LEN : -1;
    const q = this.surge;
    this.flare = q < 0 ? 0 : q < 0.2 ? Math.pow(q / 0.2, 1.5) : Math.pow(1 - (q - 0.2) / 0.8, 1.6);
    // warp streaks during the first part of a surge
    if (q >= 0 && q < 0.5) {
      this.streakAcc += dt * 110 * clamp(hd / 700, 0.6, 1.4);
      while (this.streakAcc >= 1) {
        this.streakAcc -= 1;
        const fan = this.ropeAngles[Math.floor(Math.random() * this.ropeAngles.length)] ?? 0;
        const a = Math.random() < 0.75 ? fan + (Math.random() - 0.5) * 0.4 : Math.random() * Math.PI * 2;
        this.streaks.push({ a, r: (14 + Math.random() * 70) * s, v: (180 + Math.random() * 260) * s, w: 0.6 + Math.random() * 1.6, gold: Math.random() < 0.22 });
      }
    }
    for (const k of this.streaks) {
      k.v *= Math.exp(dt * 2.2);
      k.r += k.v * dt;
    }
    this.streaks = this.streaks.filter((k) => k.r < hd * 1.25);

    // the strands themselves
    const par = (S: Strand) => (S.depth - 0.4) * 34 * s;
    for (const S of this.strands) {
      const P = S.parent;
      let ox: number, oy: number, base: number, w0: number;
      if (!P) {
        const stray = S.ox === S.ox;
        ox = stray ? S.ox : this.cx;
        oy = stray ? S.oy : this.cy;
        base = S.base + S.spin * t;
        w0 = S.w0;
      } else {
        const j = S.from;
        ox = P.xs[j]!;
        oy = P.ys[j]!;
        base = Math.atan2(P.ys[j + 1]! - P.ys[j - 1]!, P.xs[j + 1]! - P.xs[j - 1]!) + S.base;
        w0 = P.ws[j]! * 0.6;
      }
      const sh = P ? 0 : par(S),
        shx = p.x * sh,
        shy = p.y * sh * 0.6;
      // a strand from the source is a line running towards you out of the far distance, seen in perspective: its
      // distance from the vanishing point and its width both go as one over depth, so far down it the strands crowd
      // together, thin to threads and sink into the haze, and nothing marks where they begin
      const deep = !P && S.ox !== S.ox;
      let lx = ox,
        ly = oy,
        L = 0;
      for (let i = 0; i < N; i++) {
        const v = i / (N - 1);
        let u = v,
          q = v,
          d: number;
        if (deep) {
          q = Q0 + (1 - Q0) * Math.pow(v, 1.5); // points spaced evenly on the screen, a little closer near the middle
          u = 1 - (1 / q - 1) / (DEPTH - 1); // how far along it is in depth
          d = S.reach * q;
        } else d = S.r0 + (S.reach - S.r0) * Math.pow(u, S.pow);
        // a twig turns in sharp little steps: a stepped noise along it, barely moving with time
        const ks = u * 9 + S.seed * 31,
          ki = Math.floor(ks),
          kf = ks - ki;
        const kn = S.kink ? (hash(ki, S.seed * 7) - 0.5) * (1 - kf * kf * (3 - 2 * kf)) + (hash(ki + 1, S.seed * 7) - 0.5) * (kf * kf * (3 - 2 * kf)) : 0;
        const a = base + S.bend * u * u + kn * S.kink * 1.6;
        const wav = S.amp * Math.pow(q, 1.25) * Math.sin(S.k * 6.283 * u - t * S.speed * 2 + S.phase);
        const ca = Math.cos(a),
          sa = Math.sin(a);
        const x = ox + ca * d - sa * wav + shx * u,
          y = oy + sa * d + ca * wav + shy * u;
        if (i) L += Math.hypot(x - lx, y - ly);
        S.xs[i] = x;
        S.ys[i] = y;
        S.cum[i] = L;
        S.wc[i] = deep ? u * WORLD * s : L;
        // a strand that ends inside the picture thins away to nothing rather than stopping short, and a fork grows
        // out of its parent thin, from inside it, rather than starting as a block beside it
        const sprout = P ? 0.3 + 0.7 * Math.min(1, u / 0.14) : 1;
        const width = deep ? Math.max(0.22 * s, S.w1 * Math.pow(q, 1.05)) : w0 + (S.w1 - w0) * Math.pow(u, 1.25);
        S.ws[i] = width * (q > S.fade ? Math.max(0, 1 - (q - S.fade) / (1 - S.fade)) : 1) * sprout;
        lx = x;
        ly = y;
      }
      S.start = P ? P.start + P.cum[S.from]! : S.ox === S.ox ? hd * 0.25 + S.seed * hd * 0.6 : 0;
      // a fork carries on from where it leaves its parent; a stray twig starts somewhere part way out
      if (P) {
        const from = P.wc[S.from]!;
        for (let i = 0; i < N; i++) S.wc[i] = from + S.cum[i]!;
      } else if (!deep) for (let i = 0; i < N; i++) S.wc[i] = S.start + S.cum[i]!;
    }

    // light running out along the dark strands now and then
    if (!this.still) {
      this.pulseAcc += dt * 5 * clamp(hd / 700, 0.6, 1.5);
      while (this.pulseAcc >= 1) {
        this.pulseAcc -= 1;
        if (this.pulses.length > 40) continue;
        const S = this.strands[Math.floor(Math.random() * this.strands.length)]!;
        if (S.parent) continue;
        this.pulses.push({ S, front: 0, v: (170 + Math.random() * 160) * s, len: (50 + Math.random() * 70) * s });
      }
      for (const u of this.pulses) u.front += u.v * dt;
      this.pulses = this.pulses.filter((u) => u.front < u.S.cum[N - 1]! + u.len);
    }

    // dust and embers
    for (let i = 0; i < this.motes.length; i++) {
      const m = this.motes[i]!;
      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.gold) {
        if (m.age > m.life) this.motes[i] = this.mote(true, false);
      } else if (m.x < -10 || m.x > this.w + 10 || m.y < -10 || m.y > this.h + 10) {
        const n = this.mote(false, true);
        n.y = this.h + 6;
        this.motes[i] = n;
      }
    }
  }

  /** every strand of one band as one shape, a ribbon that widens as it comes towards you */
  ribbons(list: Strand[]) {
    const path = new Path2D(),
      L = this.bufL,
      R = this.bufR;
    for (const S of list) {
      const { xs, ys, ws } = S;
      for (let i = 0; i < N; i++) {
        const a = Math.max(0, i - 1),
          b = Math.min(N - 1, i + 1);
        let tx = xs[b]! - xs[a]!,
          ty = ys[b]! - ys[a]!;
        const m = Math.hypot(tx, ty) || 1;
        tx /= m;
        ty /= m;
        const hw = ws[i]! / 2;
        L[i * 2] = xs[i]! - ty * hw;
        L[i * 2 + 1] = ys[i]! + tx * hw;
        R[i * 2] = xs[i]! + ty * hw;
        R[i * 2 + 1] = ys[i]! - tx * hw;
      }
      path.moveTo(L[0]!, L[1]!);
      for (let i = 1; i < N; i++) path.lineTo(L[i * 2]!, L[i * 2 + 1]!);
      for (let i = N - 1; i >= 0; i--) path.lineTo(R[i * 2]!, R[i * 2 + 1]!);
      path.closePath();
    }
    return path;
  }
  line(S: Strand) {
    const path = new Path2D();
    path.moveTo(S.xs[0]!, S.ys[0]!);
    for (let i = 1; i < N; i++) path.lineTo(S.xs[i]!, S.ys[i]!);
    return path;
  }
  /** a run of light along a strand, from front - len to front, measured from the strand's start */
  run(g: CanvasRenderingContext2D, S: Strand, front: number, len: number) {
    if (front <= 0 || front - len > S.cum[N - 1]!) return;
    g.setLineDash([len, 1e5]);
    g.lineDashOffset = len - front;
    g.stroke(this.line(S));
  }

  render(ctx: CanvasRenderingContext2D) {
    this.frame++;
    const { k, t, cx, cy, w, h } = this;
    const W = w * k,
      H = h * k,
      fl = this.flare;
    const z = this.still ? 1 : 1 + 0.022 * Math.sin(t * 0.11); // a slow drift of the camera, in and out
    const cam = (g: CanvasRenderingContext2D, kk: number) => g.setTransform(kk * z, 0, 0, kk * z, cx * kk * (1 - z), cy * kk * (1 - z));

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, W, H);

    // the light behind everything (shafts of haze, the source's glow, the fog) and the far strands, which are soft with
    // distance anyway, drawn at half size every other frame
    if (this.frame % 2 === 1 || this.still) this.paintBack(fl, cam);
    ctx.drawImage(this.bgC, 0, 0, W, H);

    // far strands: fine, soft with distance; then the middle ones, darker and sharper
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    cam(ctx, k);
    this.drawStrands(ctx, cam, W, H, z);
  }

  paintBack(fl: number, cam: (g: CanvasRenderingContext2D, kk: number) => void) {
    const ctx = this.bgC.getContext("2d")!;
    const kb = this.k / 2;
    this.haze(ctx, kb, fl);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    cam(ctx, kb);
    const far = this.ribbons(this.bands[0]!);
    ctx.fillStyle = "rgba(8,34,30,.66)";
    ctx.fill(far);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = "rgba(110,225,185,.1)";
    ctx.stroke(far);
  }

  /** the light behind everything: shafts of haze turning slowly, the source's glow, two layers of drifting fog */
  haze(ctx: CanvasRenderingContext2D, kb: number, fl: number) {
    const { t, cx, cy, hd, w, h } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "lighter";
    ctx.setTransform(kb, 0, 0, kb, 0, 0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.006);
    ctx.globalAlpha = 0.5 + 0.3 * fl;
    ctx.drawImage(this.rays, -hd, -hd, hd * 2, hd * 2);
    ctx.restore();
    const cr = hd * (this.round ? 0.52 : 0.8) * (1 + 0.25 * fl);
    ctx.globalAlpha = Math.min(1, (0.6 + 0.07 * Math.sin(t * 0.8)) * (1 + 0.5 * fl));
    ctx.drawImage(this.core, cx - cr, cy - cr, cr * 2, cr * 2);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(this.violet, cx - w * 0.55, -h * 0.55, w * 1.1, h * 0.9);
    ctx.globalAlpha = 0.6;
    ctx.drawImage(this.sky, cx - w * 0.6, cy - h * 0.85, w * 1.2, h * 1.15);
    if (fl > 0) {
      ctx.globalAlpha = Math.min(1, 0.6 * fl);
      ctx.drawImage(this.wash, cx - hd * 1.3, cy - hd * 1.3, hd * 2.6, hd * 2.6);
    }
    const fx = Math.sin(t * 0.031) * 0.1 * w,
      fy = Math.cos(t * 0.023) * 0.06 * h;
    ctx.globalAlpha = 0.42 * (1 + 0.6 * fl);
    ctx.drawImage(this.fog, -0.15 * w + fx, -0.15 * h + fy, w * 1.3, h * 1.3);
    ctx.save();
    ctx.translate(w, h);
    ctx.scale(-1, -1);
    ctx.globalAlpha = 0.3 * (1 + 0.6 * fl);
    ctx.drawImage(this.fog, -0.2 * w - fx * 0.7, -0.2 * h + fy * 0.8, w * 1.4, h * 1.4);
    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  /** the camera's slow drift in and out */
  zoom() {
    return this.still ? 1 : 1 + 0.022 * Math.sin(this.t * 0.11);
  }
  /** how far out from the source the strands have grown, in px: they shoot out of it when the hero opens */
  reachNow() {
    if (this.still) return 1e5;
    // out of the distance: steady in depth, which in perspective is slow far away and a rush close up
    const p = clamp((this.t - 0.2) / GROW);
    return WORLD * this.s * 2.2 * Math.pow(p, 1.15) + 1;
  }

  /** what floats in front: dust, embers, and the streaks of a surge */
  fx(ctx: CanvasRenderingContext2D, kk: number) {
    const { s, cx, cy } = this,
      z = this.zoom();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(kk * z, 0, 0, kk * z, cx * kk * (1 - z), cy * kk * (1 - z));
    this.dust(ctx, 0, 1.01);
    ctx.globalCompositeOperation = "lighter";
    for (const m of this.motes) {
      if (!m.gold) continue;
      const life = Math.sin(Math.PI * clamp(m.age / m.life)),
        fl2 = 0.6 + 0.4 * Math.sin(this.t * 9 + m.ph * 3);
      const r = (1.4 + m.depth * 1.8) * s;
      ctx.globalAlpha = 0.85 * life * fl2;
      ctx.drawImage(this.ember, m.x - r * 2, m.y - r * 2, r * 4, r * 4);
    }
    ctx.globalAlpha = 1;
    ctx.lineCap = "round";
    for (const kk2 of this.streaks) {
      const l = Math.min(kk2.r, kk2.v * 0.09),
        ca = Math.cos(kk2.a),
        sa = Math.sin(kk2.a);
      const x0 = cx + ca * (kk2.r - l),
        y0 = cy + sa * (kk2.r - l),
        x1 = cx + ca * kk2.r,
        y1 = cy + sa * kk2.r;
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, kk2.gold ? "rgba(255,206,120,0)" : "rgba(170,255,200,0)");
      g.addColorStop(1, kk2.gold ? "rgba(255,226,160,.9)" : "rgba(200,255,220,.85)");
      ctx.strokeStyle = g;
      ctx.lineWidth = kk2.w * s;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  drawStrands(ctx: CanvasRenderingContext2D, cam: (g: CanvasRenderingContext2D, kk: number) => void, W: number, H: number, z: number) {
    const { k, s, t, cx, cy, hd } = this;
    this.dust(ctx, 0, 0.45);
    const mid = this.ribbons(this.bands[1]!);
    ctx.fillStyle = "rgba(2,13,11,.9)";
    ctx.fill(mid);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = "rgba(110,235,190,.2)";
    ctx.stroke(mid);

    // the light: strands that carry their own, runs of it along the dark ones, the surge, the streaks
    const g = this.glow;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1;
    g.clearRect(0, 0, this.glowC.width, this.glowC.height);
    g.globalCompositeOperation = "lighter";
    cam(g, k / 2);
    g.lineCap = "round";
    for (const S of this.strands) {
      if (!S.glow || S.band === 2) continue;
      const path = this.line(S);
      g.setLineDash([]);
      g.lineWidth = (2.4 + S.w1 * 0.8) * (S.band ? 1 : 0.7);
      g.strokeStyle = "rgba(40,255,140,.07)";
      g.stroke(path);
      g.lineWidth = 0.7 + S.depth * 1.3;
      g.strokeStyle = "rgba(140,255,170,.3)";
      g.stroke(path);
      // long runs of brighter light, always flowing outward along it
      const L = S.cum[N - 1]!,
        len = L * 0.38,
        cycle = L + len * 1.6;
      g.lineWidth = 1 + S.depth * 1.5;
      g.strokeStyle = "rgba(200,255,212,.62)";
      for (const off of [0, 0.5]) {
        const f = (((t * 70 * s + S.phase * 90) / cycle + off) % 1) * cycle;
        this.run(g, S, f, len);
      }
      g.setLineDash([]);
    }
    for (const u of this.pulses) {
      if (u.S.band === 2) continue;
      g.lineWidth = 1 + u.S.w1 * 0.35;
      g.strokeStyle = "rgba(120,255,160,.6)";
      this.run(g, u.S, u.front, u.len);
    }
    const q = this.surge;
    if (q >= 0) {
      const F = Math.pow(q, 1.6) * hd * 1.9,
        len = (90 + 160 * q) * s;
      for (const S of this.strands) {
        if (S.band === 2) continue;
        g.lineWidth = 0.8 + S.w1 * 0.45;
        g.strokeStyle = S.band ? "rgba(150,255,175,.75)" : "rgba(120,255,170,.42)";
        this.run(g, S, F - S.start, len);
      }
      g.setLineDash([]);
      for (const kk of this.streaks) {
        const l = Math.min(kk.r, kk.v * 0.09),
          ca = Math.cos(kk.a),
          sa = Math.sin(kk.a);
        g.lineWidth = kk.w * s;
        g.strokeStyle = kk.gold ? "rgba(255,206,120,.75)" : "rgba(170,255,200,.7)";
        g.beginPath();
        g.moveTo(cx + ca * (kk.r - l), cy + sa * (kk.r - l));
        g.lineTo(cx + ca * kk.r, cy + sa * kk.r);
        g.stroke();
      }
    }
    g.setLineDash([]);
    // its bloom, every third frame
    if (this.frame % 3 === 0 || this.still) {
      let src: HTMLCanvasElement = this.glowC;
      for (const c of [this.eighth, this.sixteenth]) {
        const cg = c.getContext("2d")!;
        cg.globalCompositeOperation = "copy";
        cg.drawImage(src, 0, 0, c.width, c.height);
        src = c;
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 1;
    ctx.imageSmoothingQuality = "low";
    ctx.drawImage(this.glowC, 0, 0, W, H);
    ctx.globalAlpha = 1.0;
    ctx.drawImage(this.sixteenth, 0, 0, W, H);

    // the near strands: huge, out of focus, almost black against the light
    const n = this.near,
      nk = this.nk;
    n.setTransform(1, 0, 0, 1, 0, 0);
    n.globalCompositeOperation = "source-over";
    n.globalAlpha = 1;
    n.clearRect(0, 0, this.nearC.width, this.nearC.height);
    cam(n, nk);
    const near = this.ribbons(this.bands[2]!);
    n.fillStyle = "rgba(1,5,4,.94)";
    n.fill(near);
    n.lineWidth = 1.6 / (nk * z);
    n.strokeStyle = "rgba(90,210,165,.16)";
    n.stroke(near);
    n.globalCompositeOperation = "lighter";
    n.lineCap = "round";
    const nearRun = (S: Strand, front: number, len: number, a: number) => {
      n.lineWidth = Math.max(2, S.w1 * 0.3);
      n.strokeStyle = `rgba(110,255,160,${a})`;
      this.run(n, S, front, len);
    };
    for (const u of this.pulses) if (u.S.band === 2) nearRun(u.S, u.front, u.len * 1.6, 0.45);
    if (q >= 0) for (const S of this.bands[2]!) nearRun(S, Math.pow(q, 1.6) * hd * 1.9 - S.start, (140 + 200 * q) * s, 0.55);
    n.setLineDash([]);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.imageSmoothingQuality = "medium";
    ctx.drawImage(this.nearC, 0, 0, W, H);

    // dust in front, embers, then a little shade behind the words
    ctx.globalCompositeOperation = "lighter";
    cam(ctx, k);
    this.dust(ctx, 0.45, 1.01);
    for (const m of this.motes) {
      if (!m.gold) continue;
      const life = Math.sin(Math.PI * clamp(m.age / m.life)),
        fl2 = 0.6 + 0.4 * Math.sin(t * 9 + m.ph * 3);
      const r = (1.4 + m.depth * 1.8) * s;
      ctx.globalAlpha = 0.85 * life * fl2;
      ctx.drawImage(this.ember, m.x - r * 2, m.y - r * 2, r * 4, r * 4);
    }
    if (this.quiet) {
      const qq = this.quiet;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.translate(qq.x + qq.w / 2, qq.y + qq.h / 2);
      ctx.scale(qq.w * 0.7, qq.h * 0.8);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, "rgba(2,10,9,.5)");
      gr.addColorStop(0.6, "rgba(2,10,9,.36)");
      gr.addColorStop(1, "rgba(2,10,9,0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  dust(ctx: CanvasRenderingContext2D, from: number, to: number) {
    const { t, s } = this;
    for (const m of this.motes) {
      if (m.gold || m.depth < from || m.depth >= to) continue;
      const r = (0.6 + m.depth * m.depth * 4.5) * s;
      ctx.globalAlpha = (0.16 + 0.3 * (1 - m.depth)) * (0.6 + 0.4 * Math.sin(t * 1.3 + m.ph));
      ctx.drawImage(this.dot, m.x - r, m.y - r, r * 2, r * 2);
    }
  }
}

// ───────────── the strands on the GPU: sharp at any screen resolution, each a twisted, lit rope with light inside ─────────────

const ROPE_VS = `
attribute vec2 aPos;
attribute vec4 aA; // across (px, signed), along (px from the source), half width, blur
attribute vec4 aB; // depth, seed, carries light, distance along it on the screen
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uZoom;
varying vec4 vA;
varying vec4 vB;
void main() {
  vec2 p = uCenter + (aPos - uCenter) * uZoom;
  vec2 c = p / uRes * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
  vA = aA;
  vB = aB;
}`;

const ROPE_FS = `
precision highp float;
varying vec4 vA;
varying vec4 vB;
uniform float uTime;
uniform float uDpr;
uniform float uS;
uniform float uGrow;
uniform float uTip;
uniform float uSurgeF;
uniform float uSurgeLen;
uniform float uSurgeAmt;
uniform float uMode; // 0 the strand itself, 1 only the light it gives off, for the bloom
float h1(float n) { return fract(sin(n) * 43758.5453123); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
void main() {
  float off = vA.x, u = vA.y, hw = vA.z, blur = vA.w;
  float depth = vB.x, seed = vB.y, glow = vB.z, scr = vB.w;
  // coverage across the strand, antialiased, softened for the near ones that are out of focus
  float d = abs(off), aa = 0.75 / uDpr;
  float cover = (1.0 - smoothstep(hw - aa - blur, hw + aa + blur, d)) * min(1.0, 2.0 * hw * uDpr);
  // it only exists as far as it has grown out of the source
  float grown = 1.0 - smoothstep(uGrow - 10.0 * uS, uGrow, u);
  float a = cover * grown;
  if (a < 0.002) discard;
  float x = clamp(off / max(hw, 0.0001), -1.0, 1.0);
  float nz = sqrt(max(0.0, 1.0 - x * x));
  float W = max(2.0 * hw, 1.5);

  // a rope of three twisted plies, its surface flowing outward, out of the source, all the time
  float along = scr - uTime * (16.0 + 22.0 * seed) * uS;
  float ph = along / (W * 2.4) + asin(x) * 0.4775 + seed * 7.0;
  float st = fract(ph * 3.0);
  // the twist only shows on strands wide enough to see it; on thin ones it would only shimmer
  float plies = smoothstep(5.0, 12.0, W * uDpr);
  float bulge = mix(0.75, sin(st * 3.14159), plies);
  float groove = mix(1.0, 1.0 - smoothstep(0.0, 0.18, st) * smoothstep(1.0, 0.82, st), plies);
  // fibres running along each ply (they vary across it, hardly along it), and slower blotches like bark
  float ply = floor(ph * 3.0);
  float fib = mix(0.5, n1(x * 18.0 + ply * 13.0 + seed * 91.0 + along * 0.012 / uS) * 0.65 + n1(x * 41.0 + ply * 7.0 + along * 0.03 / uS) * 0.35, plies);
  float bark = n1(along * 0.03 / uS + seed * 31.0);
  float grain = 0.55 + 0.3 * fib + 0.3 * bark;

  // lit from behind by the haze: bright edges, a dark body, a little sheen on the crest of each ply
  float rim = pow(1.0 - nz, 2.2);
  vec3 body = mix(vec3(0.034, 0.030, 0.026), vec3(0.020, 0.058, 0.046), smoothstep(0.3, 0.6, depth));
  vec3 col = body * (0.4 + 0.6 * bulge) * grain;
  col += vec3(0.11, 0.34, 0.33) * rim * (0.45 + 0.55 * bulge) * (0.55 + 0.45 * fib);
  col += vec3(0.42, 0.80, 0.74) * pow(bulge, 9.0) * pow(nz, 1.5) * (0.05 + 0.09 * fib);
  col *= mix(0.45, 1.0, groove * 0.4 + 0.6);
  col = mix(col, vec3(0.062, 0.128, 0.138), (1.0 - depth) * 0.6); // far ones sink into the fog

  // the light inside it, spreading outward: fast bright bands, a slow swell, colour drifting as it goes
  float band = pow(0.5 + 0.5 * sin((u - uTime * (130.0 + 70.0 * seed) * uS) * (6.2832 / (320.0 * uS)) + seed * 40.0), 18.0);
  float swell = pow(0.5 + 0.5 * sin((u - uTime * 48.0 * uS) * (6.2832 / (760.0 * uS)) + seed * 17.0), 3.0);
  // only a few carry light, and those carry a lot of it: the rest are dark against the haze
  float strength = glow > 0.5 ? 1.0 : 0.3 * step(0.82, h1(seed * 77.0));
  float hue = 0.5 + 0.5 * sin(u * 0.0032 / uS - uTime * 0.45 + seed * 6.0);
  vec3 ec = mix(vec3(0.36, 1.0, 0.30), vec3(0.10, 0.95, 0.46), hue * 0.7);
  ec = mix(ec, vec3(0.22, 0.92, 0.86), smoothstep(0.7, 1.0, n1(u * 0.002 / uS + seed * 23.0 - uTime * 0.2)) * 0.35);
  ec = mix(ec, vec3(1.0, 0.78, 0.36), smoothstep(0.84, 1.0, n1(u * 0.004 / uS + seed * 50.0)) * 0.6);
  float inside = (0.3 + 0.7 * nz) * (0.5 + 0.5 * groove);
  vec3 em = ec * inside * strength * (band * 1.5 + swell * 0.32 + (glow > 0.5 ? 0.16 : 0.0));
  // the surge, rushing out through everything
  float sg = exp(-pow((u - uSurgeF) / uSurgeLen, 2.0)) * uSurgeAmt;
  em += vec3(0.42, 1.0, 0.58) * sg * (0.35 + 0.65 * nz) * (0.45 + 0.55 * depth);
  // the glowing tips as they grow out
  float tip = exp(-pow((u - uGrow) / (11.0 * uS), 2.0)) * uTip;
  em += vec3(0.48, 1.0, 0.42) * tip * nz * nz * 0.45;

  // the strands are a little see-through, like dark silk: the haze shows through their middle more than their edges
  float opa = mix(0.7, 0.94, depth) * (0.8 + 0.2 * (1.0 - nz));
  // far down a strand, towards the vanishing point, it sinks into the haze: paler, then gone, with no edge to it
  float far = exp(-u / (190.0 * uS));
  col = mix(col, vec3(0.20, 0.30, 0.29), far * 0.85);
  em *= 1.0 - far * 0.55;
  opa *= 1.0 - far * 0.92;
  if (uMode > 0.5) { gl_FragColor = vec4(em * a * opa, 0.0); return; }
  gl_FragColor = vec4((col + em) * a * opa, a * opa);
}`;

const QUAD_VS = `
attribute vec2 aQ;
varying vec2 vUv;
void main() { vUv = aQ * 0.5 + 0.5; gl_Position = vec4(aQ, 0.0, 1.0); }`;
const BLUR_FS = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uDir;
void main() {
  vec4 s = texture2D(uTex, vUv) * 0.227027;
  s += (texture2D(uTex, vUv + uDir * 1.3846) + texture2D(uTex, vUv - uDir * 1.3846)) * 0.3162162;
  s += (texture2D(uTex, vUv + uDir * 3.2308) + texture2D(uTex, vUv - uDir * 3.2308)) * 0.0702703;
  gl_FragColor = s;
}`;
const COPY_FS = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uAmt;
void main() { gl_FragColor = texture2D(uTex, vUv) * uAmt; }`;

const STRIDE = 10; // floats per vertex

class RopeGL {
  gl: WebGLRenderingContext;
  rope: WebGLProgram;
  blur: WebGLProgram;
  copy: WebGLProgram;
  vbo: WebGLBuffer;
  ibo: WebGLBuffer;
  quad: WebGLBuffer;
  data: Float32Array;
  indices: number;
  wide = false; // 32-bit indices
  tex: WebGLTexture[] = [];
  fbo: WebGLFramebuffer[] = [];
  bw = 1;
  bh = 1;
  dpr: number;
  ul = new Map<string, WebGLUniformLocation | null>();

  static create(cv: HTMLCanvasElement, rift: Rift, dpr: number) {
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false });
    if (!gl) return null;
    try {
      return new RopeGL(gl, rift, dpr);
    } catch {
      return null;
    }
  }

  constructor(gl: WebGLRenderingContext, rift: Rift, dpr: number) {
    this.gl = gl;
    this.dpr = dpr;
    const program = (vs: string, fs: string, attrs: string[]) => {
      const p = gl.createProgram()!;
      for (const [src, type] of [
        [vs, gl.VERTEX_SHADER],
        [fs, gl.FRAGMENT_SHADER],
      ] as const) {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || "shader");
        gl.attachShader(p, sh);
      }
      attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || "link");
      return p;
    };
    this.rope = program(ROPE_VS, ROPE_FS, ["aPos", "aA", "aB"]);
    this.blur = program(QUAD_VS, BLUR_FS, ["aQ"]);
    this.copy = program(QUAD_VS, COPY_FS, ["aQ"]);
    // one strip of two vertices a point for every strand, drawn in one go from far to near
    const nStrands = rift.strands.length;
    this.wide = nStrands * N * 2 > 65000;
    if (this.wide && !gl.getExtension("OES_element_index_uint")) throw new Error("too many strands");
    this.data = new Float32Array(nStrands * N * 2 * STRIDE);
    const idx = this.wide ? new Uint32Array(nStrands * (N - 1) * 6) : new Uint16Array(nStrands * (N - 1) * 6);
    let o = 0;
    for (let j = 0; j < nStrands; j++) {
      const b = j * N * 2;
      for (let i = 0; i < N - 1; i++) {
        const v = b + i * 2;
        idx[o++] = v;
        idx[o++] = v + 1;
        idx[o++] = v + 2;
        idx[o++] = v + 1;
        idx[o++] = v + 3;
        idx[o++] = v + 2;
      }
    }
    this.indices = idx.length;
    this.vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
    this.ibo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    // two small targets for the bloom
    this.bw = Math.max(1, Math.round(gl.drawingBufferWidth / 4));
    this.bh = Math.max(1, Math.round(gl.drawingBufferHeight / 4));
    for (let i = 0; i < 2; i++) {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.bw, this.bh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const f = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("framebuffer");
      this.tex.push(t);
      this.fbo.push(f);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  u(p: WebGLProgram, name: string) {
    const key = name + (p === this.rope ? "r" : p === this.blur ? "b" : "c");
    if (!this.ul.has(key)) this.ul.set(key, this.gl.getUniformLocation(p, name));
    return this.ul.get(key)!;
  }

  /** the strands' ribbons for this frame, offset across their direction by their width, plus a margin for blur */
  fill(rift: Rift) {
    const d = this.data,
      dpr = this.dpr,
      s = rift.s;
    let o = 0;
    for (const S of rift.strands) {
      const blur = S.band === 2 ? (1.2 + 2.4 * clamp((S.depth - 0.78) / 0.22)) * s : S.band === 0 ? 0.3 : 0;
      const { xs, ys, ws, cum } = S;
      for (let i = 0; i < N; i++) {
        const a = Math.max(0, i - 1),
          b = Math.min(N - 1, i + 1);
        let tx = xs[b]! - xs[a]!,
          ty = ys[b]! - ys[a]!;
        const m = Math.hypot(tx, ty) || 1;
        tx /= m;
        ty /= m;
        const hw = ws[i]! / 2;
        const g = Math.max(hw, 0.5 / dpr) + blur + 1.2 / dpr;
        const u = S.wc[i]!;
        const scr = S.start + cum[i]!;
        for (const side of [-1, 1]) {
          d[o++] = xs[i]! - ty * g * side;
          d[o++] = ys[i]! + tx * g * side;
          d[o++] = g * side;
          d[o++] = u;
          d[o++] = hw;
          d[o++] = blur;
          d[o++] = S.depth;
          d[o++] = S.seed;
          d[o++] = S.glow ? 1 : 0;
          d[o++] = scr;
        }
      }
    }
  }

  ropeAttribs() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE * 4, 0);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, STRIDE * 4, 8);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, STRIDE * 4, 24);
  }
  quadAttribs() {
    const gl = this.gl;
    gl.disableVertexAttribArray(1);
    gl.disableVertexAttribArray(2);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
  }

  draw(rift: Rift) {
    const gl = this.gl;
    if (gl.isContextLost()) return;
    this.fill(rift);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data);
    const q = rift.surge,
      grow = rift.reachNow();
    const growing = clamp(1 - (rift.t - GROW + 0.6) / 1.2);
    const set = (dprNow: number, mode: number) => {
      const p = this.rope;
      gl.useProgram(p);
      gl.uniform2f(this.u(p, "uRes"), rift.w, rift.h);
      gl.uniform2f(this.u(p, "uCenter"), rift.cx, rift.cy);
      gl.uniform1f(this.u(p, "uZoom"), rift.zoom());
      gl.uniform1f(this.u(p, "uTime"), rift.t);
      gl.uniform1f(this.u(p, "uDpr"), dprNow);
      gl.uniform1f(this.u(p, "uS"), rift.s);
      gl.uniform1f(this.u(p, "uGrow"), grow);
      gl.uniform1f(this.u(p, "uTip"), rift.still ? 0 : growing);
      gl.uniform1f(this.u(p, "uSurgeF"), q < 0 ? -1e4 : Math.pow(q, 1.1) * WORLD * rift.s * 2.2);
      gl.uniform1f(this.u(p, "uSurgeLen"), (70 + 150 * Math.max(0, q)) * rift.s);
      gl.uniform1f(this.u(p, "uSurgeAmt"), q < 0 ? 0 : 1.05 * (1 - 0.65 * q));
      gl.uniform1f(this.u(p, "uMode"), mode);
    };
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);

    // 1. the light alone, small, for the bloom
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[0]!);
    gl.viewport(0, 0, this.bw, this.bh);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.blendFunc(gl.ONE, gl.ONE);
    set(this.dpr / 4, 1);
    this.ropeAttribs();
    gl.drawElements(gl.TRIANGLES, this.indices, this.wide ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
    // 2. blur it, twice, wider the second time
    this.quadAttribs();
    gl.useProgram(this.blur);
    gl.disable(gl.BLEND);
    for (const spread of [1, 2.2]) {
      for (const [from, to, dx, dy] of [
        [0, 1, 1, 0],
        [1, 0, 0, 1],
      ] as const) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[to]!);
        gl.viewport(0, 0, this.bw, this.bh);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.tex[from]!);
        gl.uniform1i(this.u(this.blur, "uTex"), 0);
        gl.uniform2f(this.u(this.blur, "uDir"), (dx * spread) / this.bw, (dy * spread) / this.bh);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    }
    // 3. the strands themselves, sharp, at full resolution
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    set(this.dpr, 0);
    this.ropeAttribs();
    gl.drawElements(gl.TRIANGLES, this.indices, this.wide ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
    // 4. the bloom laid over them, as added light
    this.quadAttribs();
    gl.useProgram(this.copy);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex[0]!);
    gl.uniform1i(this.u(this.copy, "uTex"), 0);
    gl.uniform1f(this.u(this.copy, "uAmt"), 1.2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    const gl = this.gl;
    gl.deleteBuffer(this.vbo);
    gl.deleteBuffer(this.ibo);
    gl.deleteBuffer(this.quad);
    this.tex.forEach((t) => gl.deleteTexture(t));
    this.fbo.forEach((f) => gl.deleteFramebuffer(f));
    [this.rope, this.blur, this.copy].forEach((p) => gl.deleteProgram(p));
  }
}

function Brand({ name }: { name: string }) {
  return (
    <a href="#" className="flex items-center gap-2 rounded-full text-[17px] font-semibold tracking-[-0.01em] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#3df0a0]">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#3df0a0] text-[#022414] shadow-[0_0_24px_rgba(61,240,160,.45)]">
        <svg viewBox="0 0 256 256" width="18" height="18" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.brand }} />
      </span>
      {name}
    </a>
  );
}
function PrimaryButton({ link }: { link: InfiniteBranchesLink }) {
  return (
    <a
      href={link.href}
      className="rounded-full bg-[#3df0a0] px-6 py-3 text-[15px] font-semibold text-[#022414] shadow-[0_0_0_1px_rgba(255,255,255,.25)_inset,0_10px_40px_-8px_rgba(61,240,160,.65)] outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#010805]"
    >
      {link.label}
    </a>
  );
}
function SecondaryButton({ link }: { link: InfiniteBranchesLink }) {
  return (
    <a
      href={link.href}
      className="flex items-center gap-2 rounded-full bg-white/[0.06] px-5 py-3 text-[15px] font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,.16)_inset] backdrop-blur-md outline-none transition-colors hover:bg-white/[0.1] focus-visible:ring-2 focus-visible:ring-[#3df0a0]"
    >
      <svg viewBox="0 0 256 256" width="13" height="13" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.play }} />
      {link.label}
    </a>
  );
}

/**
 * A homepage hero where strands of light pour out of one point forever.
 *
 * Hundreds of strands radiate from a source behind the headline, in three depths: fine far ones sinking into the
 * fog, darker ones in the middle, and a few huge ones close to you, slightly out of focus. They are drawn with WebGL
 * at the full resolution of the screen, each a rope of three twisted plies with fibres and bark-like grain, dark in
 * the body and lit at the edges by the teal haze behind it, with a sheen on each ply. The rope's surface flows
 * outward all the time, so the strands seem to be pouring out of the source, and light flows out inside them in
 * bright bands, its colour drifting from emerald to lime, with cyan and gold here and there, and bleeding into the
 * air with a bloom. When the hero opens they shoot out of the source with glowing tips; every few seconds a surge
 * rushes out through all of them with streaks flying past. It all runs on its own; a pointer only adds a little depth.
 *
 * content="minimal" keeps the words small and low so the source stays clear, and content="none" shows the effect
 * alone. Without WebGL it draws flat strands on a canvas instead. Under reduced motion it shows one still frame.
 *   <InfiniteBranches title="Every idea gets a branch." primary={{ label: "Start for free", href: "/signup" }} />
 */
export function InfiniteBranches({
  brand = "Arbor",
  links = [
    { label: "Product", href: "#" },
    { label: "Customers", href: "#" },
    { label: "Docs", href: "#" },
    { label: "Pricing", href: "#" },
  ],
  title = "Every idea gets a branch.",
  subtitle = "Arbor gives each branch your team pushes its own live preview, so you can follow every version of the future and merge the one that holds.",
  primary = { label: "Start for free", href: "#" },
  secondary = { label: "Watch the film", href: "#" },
  note = "Free for teams of up to five.",
  origin = "center",
  content = "full",
  paused = false,
  height = 720,
  className = "",
}: InfiniteBranchesProps) {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<{ rift: Rift; gl: RopeGL | null; kb: number; kf: number } | null>(null);
  const inView = useInView(rootRef, { margin: "200px" });
  const [ready, setReady] = useState(false);
  const [flat, setFlat] = useState(false);

  /** one frame: the haze behind (every other frame, it is soft), the strands on the GPU, the dust and streaks in front */
  const paint = () => {
    const wd = world.current,
      bg = bgRef.current?.getContext("2d"),
      fx = fxRef.current?.getContext("2d");
    if (!wd || !bg) return;
    const { rift, gl, kb, kf } = wd;
    if (!gl) {
      rift.render(bg);
      return;
    }
    rift.frame++;
    if (rift.frame % 2 === 1 || rift.still) rift.haze(bg, kb, rift.flare);
    gl.draw(rift);
    if (fx) rift.fx(fx, kf);
  };

  // build the world for this size, and build it again when the size changes
  useEffect(() => {
    const root = rootRef.current,
      bg = bgRef.current,
      glc = glRef.current,
      fx = fxRef.current;
    if (!root || !bg || !glc || !fx) return;
    let timer = 0,
      opened = false,
      builtFor = "";
    const build = () => {
      const w = root.clientWidth,
        h = root.clientHeight;
      // the observer reports the size once as soon as it starts watching: that is not a resize
      if (!w || !h || builtFor === `${w}x${h}`) return;
      builtFor = `${w}x${h}`;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // the strands at the screen's own resolution; the haze behind is soft, so it is drawn small
      let kg = dpr;
      if (w * h * kg * kg > 4.2e6) kg = Math.sqrt(4.2e6 / (w * h));
      const kb = Math.min(dpr, 1.5) * 0.5,
        kf = Math.min(dpr, 1.5);
      let k2 = Math.min(dpr, 1.25);
      if (w * h * k2 * k2 > 1.6e6) k2 = Math.sqrt(1.6e6 / (w * h));
      const rift = new Rift(w, h, k2, origin === "center", reduce);
      world.current?.gl?.dispose();
      glc.width = Math.round(w * kg);
      glc.height = Math.round(h * kg);
      const gl = RopeGL.create(glc, rift, kg);
      const kbNow = gl ? kb : k2;
      bg.width = Math.round(w * kbNow);
      bg.height = Math.round(h * kbNow);
      fx.width = Math.round(w * kf);
      fx.height = Math.round(h * kf);
      world.current = { rift, gl, kb, kf };
      setFlat(!gl);
      // the strands grow out once, when it first opens; after a resize they are simply there
      if (reduce) rift.t = 9;
      else if (opened) rift.t = GROW + 0.8;
      opened = true;
      rift.step(1 / 60);
      paint();
      setReady(true);
    };
    build();
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(build, 160);
    });
    ro.observe(root);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, reduce]);

  useEffect(
    () => () => {
      world.current?.gl?.dispose();
    },
    [],
  );

  useEffect(() => {
    if (reduce || !inView || paused) return;
    let raf = 0,
      last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      world.current?.rift.step(dt);
      paint();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, paused]);

  const onMove = (e: RPointerEvent) => {
    const gr = world.current?.rift,
      root = rootRef.current;
    if (!gr || !root || reduce || e.pointerType === "touch") return;
    const r = root.getBoundingClientRect();
    gr.pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    gr.pointer.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  };
  const onLeave = () => {
    const gr = world.current?.rift;
    if (gr) gr.pointer.tx = gr.pointer.ty = 0;
  };

  const fill = height === "fill";
  const box: CSSProperties = fill ? {} : height === "screen" ? { height: "100svh", minHeight: 560 } : { height };
  const rise = (i: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } }
      : {
          initial: { opacity: 0, y: 18, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.9, delay: 0.25 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] as const },
        };

  return (
    <section
      ref={rootRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`${fill ? "absolute inset-0" : "relative w-full"} isolate overflow-hidden bg-[#010805] text-white ${className}`}
      style={{ ...box, containerType: "inline-size" }}
    >
      {/* the teal dark the strands come out of */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            origin === "center"
              ? "radial-gradient(70% 72% at 50% 47%, #12302f 0%, #0a1d1f 30%, #050d10 60%, #020507 100%)"
              : "radial-gradient(105% 85% at 50% 108%, #12302f 0%, #0a1d1f 30%, #050d10 60%, #020507 100%)",
        }}
      />
      <motion.div aria-hidden="true" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: reduce ? 0.3 : 0.8, ease: "easeOut" }}>
        <canvas ref={bgRef} className="absolute inset-0 block h-full w-full" />
        <canvas ref={glRef} className="absolute inset-0 block h-full w-full" style={{ display: flat ? "none" : undefined }} />
        <canvas ref={fxRef} className="absolute inset-0 block h-full w-full" style={{ mixBlendMode: "screen", display: flat ? "none" : undefined }} />
      </motion.div>
      {/* the dark closing in at the edges */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(75% 80% at 50% 47%, rgba(1,4,5,0) 48%, rgba(1,4,5,.72) 100%)" }} />

      {content === "full" && (
        <>
          {/* a soft shade behind the words, and a darker band under the bar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[47%] h-[58%] w-[78%] max-w-[920px] -translate-x-1/2 -translate-y-1/2"
            style={{ background: "radial-gradient(closest-side, rgba(2,9,8,.66), rgba(2,9,8,.4) 55%, rgba(2,9,8,0))" }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-28" style={{ background: "linear-gradient(to bottom, rgba(2,8,7,.8), rgba(2,8,7,0))" }} />
          <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
            <Brand name={brand} />
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-[14px] text-[#b9cdc2] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#3df0a0]"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a href="#" className="hidden rounded-full px-3.5 py-2 text-[14px] text-[#b9cdc2] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#3df0a0] sm:block">
                Sign in
              </a>
              <a
                href={primary.href}
                className="rounded-full bg-white px-4 py-2 text-[14px] font-medium text-[#03140c] outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#3df0a0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#010805]"
              >
                Get started
              </a>
            </div>
          </header>
          <div className="pointer-events-none relative z-10 mx-auto flex h-[calc(100%-76px)] max-w-[1200px] flex-col items-center justify-center px-6 pb-[6%] text-center">
            <motion.h1
              {...rise(0)}
              className="max-w-[14ch] font-semibold leading-[0.98] tracking-[-0.045em] text-white [text-wrap:balance]"
              style={{ fontSize: "clamp(42px, 8.4cqw, 92px)", textShadow: "0 0 40px rgba(1,8,5,.9), 0 2px 18px rgba(1,8,5,.8)" }}
            >
              {title}
            </motion.h1>
            <motion.p {...rise(1)} className="mt-5 max-w-[34rem] text-[clamp(16px,1.9cqw,19px)] leading-[1.5] text-[#b9cdc2]" style={{ textShadow: "0 1px 14px rgba(1,8,5,.95)" }}>
              {subtitle}
            </motion.p>
            <motion.div {...rise(2)} className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton link={primary} />
              <SecondaryButton link={secondary} />
            </motion.div>
            {note && (
              <motion.p {...rise(3)} className="mt-5 text-[13px] text-[#9fbcae]" style={{ textShadow: "0 1px 10px rgba(1,8,5,.95)" }}>
                {note}
              </motion.p>
            )}
          </div>
        </>
      )}

      {content === "minimal" && (
        <>
          {/* the words sit low, out of the way of the source, over a little dark rising from the bottom */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%]" style={{ background: "linear-gradient(to top, rgba(2,7,7,.86), rgba(2,7,7,.5) 45%, rgba(2,7,7,0))" }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(to bottom, rgba(2,8,7,.6), rgba(2,8,7,0))" }} />
          <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
            <Brand name={brand} />
            <a
              href={primary.href}
              className="rounded-full px-4 py-2 text-[14px] font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,.22)_inset] backdrop-blur-md outline-none transition-colors hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#3df0a0]"
            >
              Get started
            </a>
          </header>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1200px] flex-col items-center px-6 pb-[clamp(40px,8%,88px)] text-center">
            <motion.h1
              {...rise(0)}
              className="max-w-[20ch] font-semibold leading-[1.04] tracking-[-0.035em] text-white [text-wrap:balance]"
              style={{ fontSize: "clamp(28px, 4.4cqw, 52px)", textShadow: "0 2px 24px rgba(1,8,5,.85)" }}
            >
              {title}
            </motion.h1>
            <motion.div {...rise(1)} className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3">
              <PrimaryButton link={primary} />
              <SecondaryButton link={secondary} />
            </motion.div>
          </div>
        </>
      )}

      {content === "none" && <h1 className="sr-only">{title}</h1>}
    </section>
  );
}
