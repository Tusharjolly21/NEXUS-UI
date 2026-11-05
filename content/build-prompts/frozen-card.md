# Frozen Card

Add the "Frozen Card" component from Nexus UI to my project.

The card screen of a banking app, where you can freeze your card. The “Aurora” debit card tilts toward your pointer with a glare and a holographic sheen, glowing in its own colours on a dark panel. Press Freeze card and feathery frost grows in from the corners and edges with a frosted bloom behind it, the print blurs and drains to icy slate blue, the card shivers, a Frozen tag replaces the network mark, and snow falls across the whole screen, some of it in front of the card; tilt it and the glare sparkles on the ice. Unfreeze and cracks race across the ice, it melts from the middle outwards with drips running off the bottom edge, and a warm glow brings the colour back. The eye on the card shows the full number. Keyboard: Tab to Freeze card (a switch) and press Space or Enter; the eye, Change limits, Transactions, back and more are buttons.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { FrozenCard } from "@/components/frozen-card";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/frozen-card/frozen-card.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type FrozenCardProps = {
  /** controlled frozen state */
  frozen?: boolean;
  defaultFrozen?: boolean;
  onFrozenChange?: (frozen: boolean) => void;
  holder?: string;
  last4?: string;
  /** the full number shown when the eye is pressed (a sample ending in last4 by default) */
  number?: string;
  expiry?: string;
  title?: string;
  /** spent so far this month and the monthly limit, for the meter under the card */
  spent?: number;
  limit?: number;
  currency?: string;
  onLimits?: () => void;
  /** the "more" button in the header */
  onDetails?: () => void;
  onTransactions?: () => void;
  onBack?: () => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (MIT) via Iconify, inlined
const ICON = {
  snow: { vb: 256, body: "<path fill=\"currentColor\" d=\"M227.65 149.14a12 12 0 0 1-8.79 14.51l-20.67 5.08l5.4 20.16a12 12 0 0 1-23.18 6.22l-7.29-27.2L140 148.78V187l20.48 20.48a12 12 0 0 1-17 17L128 209l-15.51 15.52a12 12 0 0 1-17-17L116 187v-38.22l-33.12 19.13l-7.29 27.2a12 12 0 0 1-23.18-6.22l5.4-20.16l-20.67-5.08a12 12 0 1 1 5.72-23.3l27.89 6.85L104 128l-33.25-19.2l-27.89 6.85A11.8 11.8 0 0 1 40 116a12 12 0 0 1-2.85-23.65l20.67-5.08l-5.4-20.16a12 12 0 0 1 23.18-6.22l7.29 27.2L116 107.21V69L95.52 48.48a12 12 0 0 1 17-17L128 47l15.51-15.52a12 12 0 1 1 17 17L140 69v38.24l33.12-19.12l7.29-27.2a12 12 0 0 1 23.18 6.22l-5.4 20.16l20.67 5.08A12 12 0 0 1 216 116a11.8 11.8 0 0 1-2.87-.35l-27.89-6.85L152 128l33.25 19.2l27.89-6.85a12 12 0 0 1 14.51 8.79\"/>" },
  back: { vb: 256, body: "<path fill=\"currentColor\" d=\"M168.49 199.51a12 12 0 0 1-17 17l-80-80a12 12 0 0 1 0-17l80-80a12 12 0 0 1 17 17L97 128Z\"/>" },
  more: { vb: 256, body: "<path fill=\"currentColor\" d=\"M144 128a16 16 0 1 1-16-16a16 16 0 0 1 16 16m-84-16a16 16 0 1 0 16 16a16 16 0 0 0-16-16m136 0a16 16 0 1 0 16 16a16 16 0 0 0-16-16\"/>" },
  eye: { vb: 256, body: "<path fill=\"currentColor\" d=\"M251 123.13c-.37-.81-9.13-20.26-28.48-39.61C196.63 57.67 164 44 128 44S59.37 57.67 33.51 83.52C14.16 102.87 5.4 122.32 5 123.13a12.08 12.08 0 0 0 0 9.75c.37.82 9.13 20.26 28.49 39.61C59.37 198.34 92 212 128 212s68.63-13.66 94.48-39.51c19.36-19.35 28.12-38.79 28.49-39.61a12.08 12.08 0 0 0 .03-9.75m-46.06 33C183.47 177.27 157.59 188 128 188s-55.47-10.73-76.91-31.88A130.4 130.4 0 0 1 29.52 128a130.5 130.5 0 0 1 21.57-28.11C72.54 78.73 98.41 68 128 68s55.46 10.73 76.91 31.89A130.4 130.4 0 0 1 226.48 128a130.5 130.5 0 0 1-21.57 28.12ZM128 84a44 44 0 1 0 44 44a44.05 44.05 0 0 0-44-44m0 64a20 20 0 1 1 20-20a20 20 0 0 1-20 20\"/>" },
  eyeOff: { vb: 256, body: "<path fill=\"currentColor\" d=\"M56.88 31.93a12 12 0 1 0-17.76 16.14l16 17.65C20.67 88.66 5.72 121.58 5 123.13a12.08 12.08 0 0 0 0 9.75c.37.82 9.13 20.26 28.49 39.61C59.37 198.34 92 212 128 212a131.3 131.3 0 0 0 51-10l20.09 22.1a12 12 0 0 0 17.76-16.14ZM128 188c-29.59 0-55.47-10.73-76.91-31.88A130.7 130.7 0 0 1 29.52 128c5.27-9.31 18.79-29.9 42-44.29l90.09 99.11A109.3 109.3 0 0 1 128 188m123-55.12c-.36.81-9 20-28 39.16a12 12 0 1 1-17-16.9A130.5 130.5 0 0 0 226.48 128a130.4 130.4 0 0 0-21.57-28.12C183.46 78.73 157.59 68 128 68c-3.35 0-6.7.14-10 .42a12 12 0 1 1-2-23.91c3.93-.34 8-.51 12-.51c36 0 68.63 13.67 94.49 39.52c19.35 19.35 28.11 38.8 28.48 39.61a12.08 12.08 0 0 1 .03 9.75\"/>" },
  limits: { vb: 256, body: "<path fill=\"currentColor\" d=\"M40 92h30.06a36 36 0 0 0 67.88 0H216a12 12 0 0 0 0-24h-78.06a36 36 0 0 0-67.88 0H40a12 12 0 0 0 0 24m64-24a12 12 0 1 1-12 12a12 12 0 0 1 12-12m112 96h-14.06a36 36 0 0 0-67.88 0H40a12 12 0 0 0 0 24h94.06a36 36 0 0 0 67.88 0H216a12 12 0 0 0 0-24m-48 24a12 12 0 1 1 12-12a12 12 0 0 1-12 12\"/>" },
  receipt: { vb: 256, body: "<path fill=\"currentColor\" d=\"M68 100a12 12 0 0 1 12-12h96a12 12 0 0 1 0 24H80a12 12 0 0 1-12-12m12 52h96a12 12 0 0 0 0-24H80a12 12 0 0 0 0 24m156-96v152a12 12 0 0 1-17.37 10.73L192 205.42l-26.63 13.31a12 12 0 0 1-10.74 0L128 205.42l-26.63 13.31a12 12 0 0 1-10.74 0L64 205.42l-26.63 13.31A12 12 0 0 1 20 208V56a20 20 0 0 1 20-20h176a20 20 0 0 1 20 20m-24 4H44v128.58l14.63-7.31a12 12 0 0 1 10.74 0L96 194.58l26.63-13.31a12 12 0 0 1 10.74 0L160 194.58l26.63-13.31a12 12 0 0 1 10.74 0l14.63 7.31Z\"/>" },
  contactless: { vb: 256, body: "<path fill=\"currentColor\" d=\"M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88M97.07 100.26a59.33 59.33 0 0 1 0 55.48a8 8 0 1 1-14.14-7.48a42.79 42.79 0 0 0 0-40.52a8 8 0 0 1 14.14-7.48m56-32a126.67 126.67 0 0 1 0 119.54a8 8 0 0 1-14.07-7.57a110.62 110.62 0 0 0 0-104.46a8 8 0 0 1 14.12-7.54Zm-28 16a93 93 0 0 1 0 87.52a8 8 0 1 1-14.12-7.52a77 77 0 0 0 0-72.48a8 8 0 1 1 14.12-7.52\"/>" },
} as const;

const CW = 340; // the card, in its own units
const CH = 214;
const STOP = Symbol("stop");
const TAU = Math.PI * 2;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;
const MELT = 1.7;

/** a frost structure: line segments that each grow between t0 and t1, plus haze, dust, star plates and glints */
type Frost = {
  n: number;
  seg: Float32Array; // x0 y0 x1 y1 t0 t1 cls, per segment
  done: Float32Array;
  puffs: number[]; // x y t
  stars: number[]; // x y r t a
  glints: number[]; // x y phase
  specks: Float32Array; // x y t size alpha, sorted by t
  end: number;
};
const grow = (seed: number): Frost => {
  const r = rng(seed);
  const out: number[] = [];
  const puffs: number[] = [];
  const stars: number[] = [];
  const glints: number[] = [];
  let end = 0;
  // a fern-like dendrite: a gently curving stem lined with fine 60° shoots that taper towards the tip,
  // and each shoot lined with finer ones still
  const branch = (x: number, y: number, a: number, len: number, t0: number, speed: number, depth: number, curl: number) => {
    const step = depth === 0 ? 2.6 : depth === 1 ? 1.9 : 1.4;
    const gap = depth === 0 ? 3.3 + r() * 1.3 : 2.2 + r() * 0.7;
    let s = 0;
    let next = gap * (0.6 + r() * 0.6);
    while (s < len) {
      const nx = x + Math.cos(a) * step;
      const ny = y + Math.sin(a) * step;
      if (nx < -3 || ny < -3 || nx > CW + 3 || ny > CH + 3) break;
      const ta = t0 + s / speed;
      const tb = t0 + (s + step) / speed;
      out.push(x, y, nx, ny, ta, tb, depth);
      end = Math.max(end, tb);
      s += step;
      x = nx;
      y = ny;
      a += curl + (r() - 0.5) * (depth === 0 ? 0.06 : 0.05);
      if (depth < 2 && s % (depth === 0 ? 8 : 13) < step) puffs.push(x, y, tb);
      if (depth < 2 && s >= next) {
        const left = 1 - s / len;
        const sl = len * (depth === 0 ? 0.28 : 0.38) * Math.pow(left, 0.85) * (0.75 + r() * 0.45);
        if (sl > (depth === 0 ? 2.6 : 1.5)) {
          for (const sg of [1, -1]) {
            if (r() < (depth === 0 ? 0.1 : 0.24)) continue;
            branch(x, y, a + sg * (Math.PI / 3) + (r() - 0.5) * 0.2, sl * (0.6 + r() * 0.7), tb + 0.01, speed * 0.6, depth + 1, sg * curl * 0.5 + (r() - 0.5) * 0.02);
          }
        }
        next = s + gap * (0.8 + r() * 0.4);
      }
      // now and then a stem forks into two feathers
      if (depth === 0 && r() < 0.008 && len - s > 36) branch(x, y, a + (r() < 0.5 ? 1 : -1) * (Math.PI / 3), (len - s) * 0.7, tb, speed, 0, -curl);
    }
    if (depth < 2 && r() < (depth === 0 ? 1 : 0.22)) glints.push(x, y, r() * TAU);
  };
  // corners first and thickest
  const corners: [number, number, number][] = [
    [0, 0, Math.PI / 4],
    [CW, 0, (Math.PI * 3) / 4],
    [CW, CH, (-Math.PI * 3) / 4],
    [0, CH, -Math.PI / 4],
  ];
  for (const [cx, cy, base] of corners) {
    const k = 7;
    for (let i = 0; i < k; i++) {
      const a = base + (i / (k - 1) - 0.5) * 1.75 + (r() - 0.5) * 0.3;
      const off = (r() - 0.5) * 14;
      branch(cx + Math.cos(base + Math.PI / 2) * off, cy + Math.sin(base + Math.PI / 2) * off, a, 62 + r() * 80, r() * 0.22, 110, 0, (r() - 0.5) * 0.035);
    }
  }
  // then the edges
  const edge = (x0: number, y0: number, x1: number, y1: number, inward: number, gap: number) => {
    const L = Math.hypot(x1 - x0, y1 - y0);
    for (let d = 30; d < L - 30; d += gap * (0.7 + r() * 0.6)) {
      const u = d / L;
      const mid = 1 - Math.abs(u - 0.5) * 2; // shorter towards the middle of an edge
      const inset = r() * 7;
      const lean = (r() - 0.5) * 2.3; // some run nearly along the edge
      const l = (r() < 0.25 ? 48 + r() * 40 : 14 + r() * 36) * (1 - mid * 0.3);
      branch(x0 + (x1 - x0) * u + Math.cos(inward) * inset, y0 + (y1 - y0) * u + Math.sin(inward) * inset, inward + lean, l, 0.1 + r() * 0.55 + mid * 0.15, 96, 0, (r() - 0.5) * 0.05);
    }
  };
  edge(0, 0, CW, 0, Math.PI / 2, 22);
  edge(0, CH, CW, CH, -Math.PI / 2, 22);
  edge(0, 0, 0, CH, 0, 26);
  edge(CW, 0, CW, CH, Math.PI, 26);
  // a few long feathers that reach right across the card
  for (let i = 0; i < 7; i++) {
    const side = Math.floor(r() * 4);
    let x = 0;
    let y = 0;
    let a = 0;
    if (side === 0) [x, y, a] = [30 + r() * (CW - 60), 0, Math.PI / 2];
    else if (side === 1) [x, y, a] = [30 + r() * (CW - 60), CH, -Math.PI / 2];
    else if (side === 2) [x, y, a] = [0, 24 + r() * (CH - 48), 0];
    else [x, y, a] = [CW, 24 + r() * (CH - 48), Math.PI];
    branch(x, y, a + (r() - 0.5) * 1.1, 110 + r() * 120, 0.3 + r() * 0.45, 125, 0, (r() - 0.5) * 0.03);
  }
  // little six-armed plates scattered in the haze, more near the rim
  for (let i = 0; i < 60; i++) {
    let x = r() * CW;
    let y = r() * CH;
    if (r() < 0.65) {
      const e = r();
      if (e < 0.25) y = r() * 30;
      else if (e < 0.5) y = CH - r() * 30;
      else if (e < 0.75) x = r() * 36;
      else x = CW - r() * 36;
    }
    const rim = Math.min(x, CW - x, y, CH - y);
    stars.push(x, y, 1.4 + r() * 3, 0.2 + rim / 70 + r() * 0.4, r() * TAU);
  }
  // frost bloom: ice dust that creeps in from the rim, dense at the edges and thin in the middle
  const sp: number[][] = [];
  for (let i = 0; i < 9000 && sp.length < 2600; i++) {
    const x = r() * CW;
    const y = r() * CH;
    const rim = Math.min(x, CW - x, y, CH - y);
    if (r() > 0.06 + 0.94 * Math.exp(-rim / 18)) continue;
    sp.push([x, y, 0.04 + rim / 80 + r() * 0.3, 0.5 + r() * (rim < 14 ? 1.4 : 0.8), 0.16 + r() * 0.5]);
  }
  sp.sort((p, q) => p[2] - q[2]);
  end = Math.max(end, sp.length ? sp[sp.length - 1][2] : 0);
  const n = out.length / 7;
  return { n, seg: new Float32Array(out), done: new Float32Array(n), puffs, stars, glints, specks: new Float32Array(sp.flat()), end: Math.max(end, 1.2) };
};

/** the "Aurora" card art: a night sky with aurora curtains over a dark ridge and a warm horizon, painted once */
const paintAurora = () => {
  const c = document.createElement("canvas");
  c.width = CW * 2;
  c.height = CH * 2;
  const g = c.getContext("2d");
  if (!g) return "";
  g.scale(2, 2);
  const r = rng(11);
  const sky = g.createLinearGradient(0, 0, 0, CH);
  sky.addColorStop(0, "#050826");
  sky.addColorStop(0.48, "#0c1048");
  sky.addColorStop(0.8, "#2a0f55");
  sky.addColorStop(1, "#4d1252");
  g.fillStyle = sky;
  g.fillRect(0, 0, CW, CH);
  const glow = (x: number, y: number, rad: number, col: string) => {
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, col);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, CW, CH);
  };
  glow(CW * 0.74, CH * 1.04, CW * 0.6, "rgba(255,124,82,.6)");
  glow(CW * 0.16, CH * 1.1, CW * 0.5, "rgba(255,60,170,.45)");
  for (let i = 0; i < 170; i++) {
    const x = r() * CW;
    const y = r() * CH * 0.78;
    g.globalAlpha = (0.15 + r() * 0.65) * (1 - y / CH);
    g.fillStyle = "#fff";
    const z = r() < 0.07 ? 1.3 : 0.7;
    g.fillRect(x, y, z, z);
  }
  g.globalAlpha = 1;
  // aurora curtains: drawn small and scaled up so they stay soft
  const SWm = 170;
  const SHm = 107;
  const sm = document.createElement("canvas");
  sm.width = SWm;
  sm.height = SHm;
  const s2 = sm.getContext("2d");
  if (s2) {
    s2.globalCompositeOperation = "lighter";
    const pal = [
      [44, 245, 196],
      [104, 255, 150],
      [62, 210, 255],
      [160, 92, 255],
      [255, 76, 206],
    ];
    const pick = (u: number) => {
      const f = clamp(u, 0, 1) * (pal.length - 1);
      const i = Math.floor(f);
      const t = f - i;
      const a = pal[i];
      const b = pal[Math.min(pal.length - 1, i + 1)];
      return a.map((v, k) => Math.round(v + (b[k] - v) * t));
    };
    const ribbons = [
      { base: 0.52, amp: 0.13, f: 0.05, ph: 0.4, h: 0.46, h0: 0, h1: 0.55, a: 0.55 },
      { base: 0.38, amp: 0.1, f: 0.065, ph: 2.1, h: 0.34, h0: 0.3, h1: 1, a: 0.45 },
      { base: 0.64, amp: 0.07, f: 0.038, ph: 4, h: 0.3, h0: 0.55, h1: 1, a: 0.38 },
    ];
    for (const rb of ribbons)
      for (let x = -4; x < SWm + 4; x++) {
        const u = x / SWm;
        const y0 = SHm * (rb.base + rb.amp * Math.sin(x * rb.f + rb.ph) + 0.025 * Math.sin(x * 0.31 + rb.ph * 3));
        const hgt = SHm * rb.h * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(x * 0.09 + rb.ph) * Math.sin(x * 0.023 + 1)));
        const [R, G, B] = pick(rb.h0 + (rb.h1 - rb.h0) * u);
        const fl = 0.55 + 0.45 * r();
        const gr = s2.createLinearGradient(0, y0 - hgt, 0, y0 + 3);
        gr.addColorStop(0, `rgba(${R},${G},${B},0)`);
        gr.addColorStop(0.72, `rgba(${R},${G},${B},${rb.a * 0.45 * fl})`);
        gr.addColorStop(0.95, `rgba(${R},${G},${B},${rb.a * fl})`);
        gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
        s2.fillStyle = gr;
        s2.fillRect(x, y0 - hgt, 1.3, hgt + 3);
      }
    g.globalCompositeOperation = "lighter";
    g.imageSmoothingQuality = "high";
    g.drawImage(sm, 0, -4, CW, CH);
    g.globalAlpha = 0.45;
    g.drawImage(sm, 0, -4, CW, CH);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  }
  // a dark ridge along the bottom, rim-lit by the horizon
  const ridge = new Path2D();
  ridge.moveTo(0, CH);
  for (let x = 0; x <= CW; x += 4) {
    const y = CH * 0.8 - 10 * Math.sin(x * 0.018 + 0.6) - 6 * Math.sin(x * 0.047 + 2) - 3 * Math.sin(x * 0.13);
    ridge.lineTo(x, y);
  }
  ridge.lineTo(CW, CH);
  ridge.closePath();
  g.fillStyle = "#05061a";
  g.fill(ridge);
  g.save();
  g.clip(ridge);
  const rl = g.createLinearGradient(0, CH * 0.68, 0, CH);
  rl.addColorStop(0, "rgba(255,140,120,.28)");
  rl.addColorStop(0.18, "rgba(255,140,120,0)");
  g.fillStyle = rl;
  g.fillRect(0, 0, CW, CH);
  g.restore();
  // grain
  const n = document.createElement("canvas");
  n.width = n.height = 128;
  const ng = n.getContext("2d");
  if (ng) {
    const im = ng.createImageData(128, 128);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = Math.random() * 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
      im.data[i + 3] = 255;
    }
    ng.putImageData(im, 0, 0);
    g.globalAlpha = 0.07;
    g.globalCompositeOperation = "overlay";
    g.fillStyle = g.createPattern(n, "repeat") ?? "transparent";
    g.fillRect(0, 0, CW, CH);
    g.globalAlpha = 1;
    g.globalCompositeOperation = "source-over";
  }
  return c.toDataURL("image/jpeg", 0.92);
};

/**
 * The card screen of a banking app, where you can freeze your card. The "Aurora" debit card tilts toward
 * your pointer with a glare and a holographic sheen, glowing in its own colours on a dark panel. Press
 * Freeze card and feathery frost grows in from the corners and edges with a frosted bloom behind it, the
 * print blurs and drains to icy slate blue, the card shivers, a Frozen tag replaces the network mark, and
 * snow falls across the whole screen, some of it in front of the card; tilt it and the glare sparkles on
 * the ice. Unfreeze and cracks race across the ice, it melts from the middle outwards with drips running off
 * the bottom edge, and a warm glow brings the colour back. The eye on the card shows the full number.
 * Keyboard: Tab to Freeze card (a switch) and press Space or Enter; the eye, Change limits, Transactions,
 * back and more are buttons.
 */
export function FrozenCard({
  frozen,
  defaultFrozen = false,
  onFrozenChange,
  holder = "Maya Chen",
  last4 = "7481",
  number,
  expiry = "08/29",
  title = "Debit card",
  spent = 1284.2,
  limit = 2000,
  currency = "$",
  onLimits,
  onDetails,
  onTransactions,
  onBack,
  autoplay = false,
  className = "",
}: FrozenCardProps) {
  const reduced = !!useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const frostCv = useRef<HTMLCanvasElement>(null);
  const backCv = useRef<HTMLCanvasElement>(null);
  const frontCv = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  // ─── size: the card fills the panel ───
  const [RW, setRW] = useState(380);
  const [RH, setRH] = useState(520);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setRW(e.contentRect.width);
      setRH(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = RW < 340 ? 14 : 20;
  const cw = Math.max(160, RW - pad * 2);
  const s = cw / CW;
  const ch = Math.round(CH * s);
  const dims = useRef({ RW, RH });
  dims.current = { RW, RH };

  // ─── state ───
  const [inner, setInner] = useState(defaultFrozen);
  const innerRef = useRef(inner);
  innerRef.current = inner;
  const isFrozen = frozen ?? inner;
  const toggle = useCallback(() => {
    const v = !(frozen ?? innerRef.current);
    if (frozen === undefined) setInner(v);
    onFrozenChange?.(v);
  }, [frozen, onFrozenChange]);
  const [live, setLive] = useState("");
  const [badge, setBadge] = useState(defaultFrozen);
  const [reveal, setReveal] = useState(false);
  const full = number ?? `4532 8810 2210 ${last4}`;

  // ─── tilt and glare ───
  const tx = useMotionValue(0); // -1..1 across the card
  const ty = useMotionValue(0);
  const glareT = useMotionValue(0);
  const glareO = useSpring(glareT, { stiffness: 200, damping: 30 });
  const rx = useSpring(useTransform(ty, (v) => -v * 8), { stiffness: 170, damping: 16 });
  const ry = useSpring(useTransform(tx, (v) => v * 11), { stiffness: 170, damping: 16 });
  const gpx = useSpring(useTransform(tx, (v) => 50 + v * 50), { stiffness: 240, damping: 26 });
  const gpy = useSpring(useTransform(ty, (v) => 50 + v * 50), { stiffness: 240, damping: 26 });
  const glare = useMotionTemplate`radial-gradient(circle at ${gpx}% ${gpy}%, rgba(255,255,255,.5), rgba(255,255,255,.1) 28%, rgba(255,255,255,0) 55%)`;
  const sheenPos = useTransform(ry, (v) => `${50 - v * 4}% 50%`);
  const shiver = useMotionValue(0);
  // how frozen the colours are (0..1), and a warm pulse when it thaws
  const ice = useMotionValue(defaultFrozen ? 1 : 0);
  const warm = useMotionValue(0);
  const artFilter = useTransform(ice, (v) => `saturate(${1 - 0.78 * v}) brightness(${1 - 0.12 * v}) blur(${(v * 1.8).toFixed(2)}px)`);
  const iceTint = useTransform(ice, (v) => v * 0.78);
  const coldWash = useTransform(ice, (v) => v * 0.5);
  const slate = useTransform(ice, (v) => v);
  const warmGlow = useTransform(warm, (v) => v * 0.75);
  const bloomWarm = useTransform(ice, (v) => (1 - v) * 0.62);
  const bloomCold = useTransform(ice, (v) => v * 0.55);

  const point = (clientX: number, clientY: number) => {
    const c = cardRef.current;
    if (!c) return;
    const b = c.getBoundingClientRect();
    tx.set(clamp(((clientX - b.left) / b.width) * 2 - 1, -1.2, 1.2));
    ty.set(clamp(((clientY - b.top) / b.height) * 2 - 1, -1.2, 1.2));
    glareT.set(1);
    sparkle.current = 1;
  };
  const release = () => {
    tx.set(0);
    ty.set(0);
    glareT.set(0);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" && e.buttons === 0) return;
    point(e.clientX, e.clientY);
  };

  // ─── the ice: grown into offscreen canvases, composited each frame ───
  type Phase = "idle" | "growing" | "frozen" | "cracking" | "melting";
  type Flake = { x: number; y: number; vy: number; ph: number; r: number; rot: number; vr: number; kind: number; a: number; z: number };
  const sim = useRef({
    phase: (defaultFrozen ? "frozen" : "idle") as Phase,
    t: 0,
    frost: null as Frost | null,
    frostC: null as HTMLCanvasElement | null,
    hazeC: null as HTMLCanvasElement | null,
    puffI: 0,
    starI: 0,
    speckI: 0,
    cracks: [] as { pts: number[]; len: number; t0: number }[],
    drips: [] as { x: number; y: number; y0: number; v: number; t0: number; off: boolean; gone: number }[],
    falls: [] as { x: number; y: number; vy: number; a: number }[],
    back: [] as Flake[],
    front: [] as Flake[],
    snowing: defaultFrozen,
    drawn: false,
    dirty: true,
  });
  const sparkle = useRef(0);
  const dpr = typeof window === "undefined" ? 1 : Math.min(2, window.devicePixelRatio || 1);

  // sprites, made once
  const sprites = useRef<{ puff: HTMLCanvasElement; glint: HTMLCanvasElement; flakes: HTMLCanvasElement[]; rim: HTMLCanvasElement } | null>(null);
  const getSprites = () => {
    if (sprites.current) return sprites.current;
    const mk = (w: number, h: number) => {
      const c = document.createElement("canvas");
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      return [c, g] as const;
    };
    const [puff, pg] = mk(40, 40);
    const rg = pg.createRadialGradient(20, 20, 0, 20, 20, 20);
    rg.addColorStop(0, "rgba(236,248,255,1)");
    rg.addColorStop(0.5, "rgba(214,238,255,.45)");
    rg.addColorStop(1, "rgba(214,238,255,0)");
    pg.fillStyle = rg;
    pg.fillRect(0, 0, 40, 40);
    const [glint, gg] = mk(24, 24);
    const gr = gg.createRadialGradient(12, 12, 0, 12, 12, 8);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(1, "rgba(200,235,255,0)");
    gg.fillStyle = gr;
    gg.fillRect(0, 0, 24, 24);
    gg.strokeStyle = "rgba(255,255,255,.95)";
    gg.lineCap = "round";
    gg.lineWidth = 1;
    gg.beginPath();
    gg.moveTo(12, 1);
    gg.lineTo(12, 23);
    gg.moveTo(1, 12);
    gg.lineTo(23, 12);
    gg.stroke();
    // snowflakes: a dendrite star, a simple star, a pellet, and a big soft out-of-focus flake for the front
    const flakes = [0, 1, 2, 3].map((kind) => {
      const [c, g] = mk(28, 28);
      g.translate(14, 14);
      if (kind >= 2) {
        const R = kind === 2 ? 6 : 13;
        const pr = g.createRadialGradient(0, 0, 0, 0, 0, R);
        pr.addColorStop(0, kind === 2 ? "rgba(255,255,255,1)" : "rgba(255,255,255,.75)");
        pr.addColorStop(kind === 2 ? 0.55 : 0.4, kind === 2 ? "rgba(235,247,255,.8)" : "rgba(235,247,255,.35)");
        pr.addColorStop(1, "rgba(200,232,255,0)");
        g.fillStyle = pr;
        g.beginPath();
        g.arc(0, 0, R, 0, TAU);
        g.fill();
        return c;
      }
      g.strokeStyle = "rgba(255,255,255,.96)";
      g.lineCap = "round";
      g.shadowColor = "rgba(150,210,255,.9)";
      g.shadowBlur = 3;
      for (let i = 0; i < 6; i++) {
        g.save();
        g.rotate((i * Math.PI) / 3);
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(0, -11);
        if (kind === 0) {
          g.lineWidth = 1.1;
          for (const [d, l] of [
            [4.5, 3.6],
            [7.5, 2.6],
          ]) {
            g.moveTo(0, -d);
            g.lineTo(-l * 0.87, -d - l * 0.5);
            g.moveTo(0, -d);
            g.lineTo(l * 0.87, -d - l * 0.5);
          }
        }
        g.stroke();
        g.restore();
      }
      return c;
    });
    // frosted rim: denser at the edges and corners
    const [rim, rgc] = mk(CW, CH);
    const v = rgc.createRadialGradient(CW / 2, CH / 2, CH * 0.2, CW / 2, CH / 2, CW * 0.6);
    v.addColorStop(0, "rgba(220,242,255,0)");
    v.addColorStop(0.55, "rgba(220,242,255,.08)");
    v.addColorStop(1, "rgba(238,249,255,.6)");
    rgc.fillStyle = v;
    rgc.fillRect(0, 0, CW, CH);
    sprites.current = { puff, glint, flakes, rim };
    return sprites.current;
  };

  /** draw any frost that should exist by time t into the offscreen canvases (only the new bits) */
  const drawFrostTo = (t: number) => {
    const S = sim.current;
    const F = S.frost;
    if (!F || !S.frostC || !S.hazeC) return;
    const spr = getSprites();
    const hg = S.hazeC.getContext("2d")!;
    hg.setTransform(dpr, 0, 0, dpr, 0, 0);
    // frost bloom creeping in from the rim
    hg.fillStyle = "#eef8ff";
    const SP = F.specks;
    while (S.speckI < SP.length / 5 && SP[S.speckI * 5 + 2] <= t) {
      const o = S.speckI * 5;
      const z = SP[o + 3];
      hg.globalAlpha = SP[o + 4];
      hg.fillRect(SP[o] - z / 2, SP[o + 1] - z / 2, z, z);
      S.speckI++;
    }
    while (S.puffI < F.puffs.length / 3 && F.puffs[S.puffI * 3 + 2] <= t) {
      const x = F.puffs[S.puffI * 3];
      const y = F.puffs[S.puffI * 3 + 1];
      hg.globalAlpha = 0.04;
      hg.drawImage(spr.puff, x - 13, y - 13, 26, 26);
      S.puffI++;
    }
    const g = S.frostC.getContext("2d")!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.lineCap = "round";
    const glow = [new Path2D(), new Path2D(), new Path2D()];
    const core = [new Path2D(), new Path2D(), new Path2D()];
    let any = false;
    const sg = F.seg;
    for (let i = 0; i < F.n; i++) {
      const d = F.done[i];
      if (d >= 1) continue;
      const o = i * 7;
      const t0 = sg[o + 4];
      if (t < t0) continue;
      const f = Math.min(1, (t - t0) / Math.max(1e-4, sg[o + 5] - t0));
      if (f <= d) continue;
      const x0 = sg[o];
      const y0 = sg[o + 1];
      const dx = sg[o + 2] - x0;
      const dy = sg[o + 3] - y0;
      const cls = sg[o + 6];
      glow[cls].moveTo(x0 + dx * d, y0 + dy * d);
      glow[cls].lineTo(x0 + dx * f, y0 + dy * f);
      core[cls].moveTo(x0 + dx * d, y0 + dy * d);
      core[cls].lineTo(x0 + dx * f, y0 + dy * f);
      F.done[i] = f;
      any = true;
    }
    if (any) {
      const glowW = [2.4, 1.5, 1];
      const coreW = [0.95, 0.62, 0.42];
      const glowC = ["rgba(120,196,255,.28)", "rgba(120,196,255,.2)", "rgba(170,222,255,.16)"];
      const coreC = ["rgba(248,253,255,.96)", "rgba(228,245,255,.86)", "rgba(206,234,255,.74)"];
      for (let c = 0; c < 3; c++) {
        g.lineWidth = glowW[c];
        g.strokeStyle = glowC[c];
        g.stroke(glow[c]);
      }
      for (let c = 0; c < 3; c++) {
        g.lineWidth = coreW[c];
        g.strokeStyle = coreC[c];
        g.stroke(core[c]);
      }
    }
    // six-armed plates
    while (S.starI < F.stars.length / 5 && F.stars[S.starI * 5 + 3] <= t) {
      const o = S.starI * 5;
      const [x, y, rad, , a] = [F.stars[o], F.stars[o + 1], F.stars[o + 2], F.stars[o + 3], F.stars[o + 4]];
      g.strokeStyle = "rgba(240,250,255,.8)";
      g.lineWidth = 0.6;
      g.beginPath();
      for (let k = 0; k < 6; k++) {
        const aa = a + (k * Math.PI) / 3;
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(aa) * rad, y + Math.sin(aa) * rad);
      }
      g.stroke();
      S.starI++;
    }
  };

  const startFreeze = useCallback(() => {
    const S = sim.current;
    S.frost = grow((Math.random() * 1e9) | 0);
    S.puffI = 0;
    S.starI = 0;
    S.speckI = 0;
    S.cracks = [];
    S.drips = [];
    const mk = () => {
      const c = document.createElement("canvas");
      c.width = Math.round(CW * dpr);
      c.height = Math.round(CH * dpr);
      return c;
    };
    S.frostC = mk();
    S.hazeC = mk();
    S.t = 0;
    S.phase = "growing";
    S.snowing = !reducedRef.current;
    S.dirty = true;
    if (reducedRef.current) {
      // no growth: draw it whole and fade it in
      S.t = S.frost.end + 1;
      drawFrostTo(S.t);
      S.phase = "frozen";
      animate(ice, 1, { duration: 0.35 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startThaw = useCallback((ox = CW / 2, oy = CH / 2) => {
    const S = sim.current;
    if (S.phase === "idle") return;
    if (reducedRef.current) {
      // no cracks or melt: the frost just fades out
      S.cracks = [];
      S.snowing = false;
      animate(ice, 0, { duration: 0.35 });
      window.setTimeout(() => {
        if (S.phase === "growing") return;
        S.phase = "idle";
        S.frost = null;
        S.dirty = true;
      }, 360);
      return;
    }
    const r = rng((Math.random() * 1e9) | 0);
    const cracks: { pts: number[]; len: number; t0: number }[] = [];
    const crack = (x: number, y: number, a: number, max: number, t0: number, depth: number) => {
      const pts = [x, y];
      let len = 0;
      while (len < max) {
        const st = 6 + r() * 7;
        a += (r() - 0.5) * 0.7;
        x += Math.cos(a) * st;
        y += Math.sin(a) * st;
        len += st;
        pts.push(x, y);
        if (x < -4 || y < -4 || x > CW + 4 || y > CH + 4) break;
        if (depth < 2 && r() < 0.16) crack(x, y, a + (r() < 0.5 ? 1 : -1) * (0.5 + r() * 0.4), (max - len) * 0.55, t0 + (len / max) * 0.2, depth + 1);
      }
      cracks.push({ pts, len, t0 });
    };
    const k = 7;
    for (let i = 0; i < k; i++) crack(ox, oy, (i / k) * TAU + (r() - 0.5) * 0.6, 90 + r() * 150, r() * 0.04, 0);
    S.cracks = cracks;
    S.phase = "cracking";
    S.t = 0;
    S.snowing = false;
    S.dirty = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── one loop for the ice on the card and the snow across the screen ───
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let lastBack = 0;
    let lastFront = 0;
    const mkFlake = (front: boolean, scatter: boolean): Flake => {
      const { RW: W, RH: H } = dims.current;
      const z = Math.random();
      const r = front ? 9 + z * 9 : 1.6 + z * 3.6;
      return {
        x: Math.random() * W,
        y: scatter ? Math.random() * H * 0.85 : -r * 2,
        vy: front ? 60 + z * 40 : 15 + z * 24,
        ph: Math.random() * TAU,
        r,
        rot: Math.random() * TAU,
        vr: (Math.random() - 0.5) * 1.2,
        kind: front ? 3 : z > 0.72 ? 0 : z > 0.45 ? 1 : 2,
        a: scatter ? 0 : 1,
        z,
      };
    };
    const drawFlakes = (cv: HTMLCanvasElement, list: Flake[], front: boolean, want: boolean, dt: number, spr: ReturnType<typeof getSprites>) => {
      const { RW: W, RH: H } = dims.current;
      const g = cv.getContext("2d")!;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const keep = list.filter((f) => f.y < H + 30 && f.a > -0.01 && f.x > -40 && f.x < W + 40);
      for (const f of keep) {
        f.y += f.vy * dt;
        f.x += Math.sin(clock * (front ? 0.8 : 1.1) + f.ph) * (front ? 16 : 9) * dt * (0.6 + f.z);
        f.rot += f.vr * dt;
        f.a = want ? Math.min(1, f.a + dt * 2) : f.a - dt * 1.6;
        g.save();
        g.globalAlpha = clamp(f.a, 0, 1) * (front ? 0.55 + f.z * 0.25 : 0.45 + f.z * 0.5);
        g.translate(f.x, f.y);
        g.rotate(f.rot);
        g.drawImage(spr.flakes[f.kind], -f.r, -f.r, f.r * 2, f.r * 2);
        g.restore();
      }
      return keep;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current) return;
      clock += dt;
      const S = sim.current;
      const fc = frostCv.current;
      const bc = backCv.current;
      const frc = frontCv.current;
      if (!fc || !bc || !frc) return;
      const red = reducedRef.current;
      const spr = getSprites();

      // advance
      if (S.phase === "growing") {
        S.t += dt;
        drawFrostTo(S.t);
        const p = clamp(S.t / (S.frost?.end ?? 1.6), 0, 1);
        ice.set(easeOut(Math.min(1, p * 1.15)));
        if (S.t > (S.frost?.end ?? 1.6) + 0.05) S.phase = "frozen";
        S.dirty = true;
      } else if (S.phase === "cracking") {
        S.t += dt;
        if (S.t > 0.32) {
          S.phase = "melting";
          S.t = 0;
          // drips start where the ice is thinning
          const r = rng((Math.random() * 1e9) | 0);
          S.drips = [0, 1, 2, 3].map((i) => {
            const x = 36 + ((i + 0.1 + r() * 0.8) / 4) * (CW - 72);
            const y0 = CH * (0.12 + r() * 0.3);
            return { x, y: y0, y0, v: 8 + r() * 10, t0: 0.2 + [0, 0.5, 0.25, 0.75][i] + r() * 0.2, off: false, gone: 0 };
          });
          void animate(warm, [0, 1, 0], { duration: 1.1, delay: 0.35, times: [0, 0.35, 1], ease: "easeInOut" });
        }
        S.dirty = true;
      } else if (S.phase === "melting") {
        S.t += dt;
        const m = clamp(S.t / MELT, 0, 1);
        if (!red) ice.set(1 - easeInOut(m));
        for (const d of S.drips) {
          if (S.t < d.t0 || d.off) continue;
          // water slips in little jerks, then runs
          const slip = 0.55 + 0.45 * Math.sin((S.t - d.t0) * 13 + d.x);
          d.v = Math.min(200, d.v + dt * 120);
          d.y += d.v * dt * slip;
          if (d.y > CH - 3) {
            d.off = true;
            d.gone = S.t;
            const face = faceRef.current;
            const root = rootRef.current;
            if (face && root) {
              const fr = face.getBoundingClientRect();
              const rr = root.getBoundingClientRect();
              const k = fr.width / CW;
              S.falls.push({ x: fr.left - rr.left + d.x * k, y: fr.top - rr.top + (CH - 3) * k, vy: d.v * k, a: 1 });
            }
          }
        }
        if (m >= 1 && S.drips.every((d) => d.off || S.t > 3.2) && S.t > MELT + 0.6) {
          S.phase = "idle";
          S.frost = null;
          S.cracks = [];
          S.drips = [];
        }
        S.dirty = true;
      } else if (S.phase === "frozen" && sparkle.current > 0.02) S.dirty = true;

      // ── the card canvas ──
      if (S.dirty) {
        S.dirty = false;
        const g = fc.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.clearRect(0, 0, fc.width, fc.height);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (S.phase !== "idle" && S.frost) {
          const prog = S.phase === "growing" ? clamp(S.t / S.frost.end, 0, 1) : 1;
          g.globalAlpha = easeOut(prog);
          g.fillStyle = "rgba(200,228,255,.05)";
          g.fillRect(0, 0, CW, CH);
          g.drawImage(spr.rim, 0, 0, CW, CH);
          g.globalAlpha = 1;
          if (S.hazeC) g.drawImage(S.hazeC, 0, 0, CW, CH);
          if (S.frostC) g.drawImage(S.frostC, 0, 0, CW, CH);
          // glints under the glare
          if (S.phase === "frozen" && sparkle.current > 0.02) {
            const gx = (gpx.get() / 100) * CW;
            const gy = (gpy.get() / 100) * CH;
            const G = S.frost.glints;
            for (let i = 0; i < G.length; i += 3) {
              const d = Math.hypot(G[i] - gx, G[i + 1] - gy);
              if (d > 120) continue;
              const tw = 0.5 + 0.5 * Math.sin(clock * 5 + G[i + 2] * 3);
              const a = (1 - d / 120) * tw * sparkle.current;
              if (a < 0.05) continue;
              const z = 6 + 9 * a;
              g.globalAlpha = a;
              g.drawImage(spr.glint, G[i] - z / 2, G[i + 1] - z / 2, z, z);
            }
            g.globalAlpha = 1;
          }
          // cracks race out from the middle
          if ((S.phase === "cracking" || S.phase === "melting") && S.cracks.length) {
            const ct = S.phase === "cracking" ? S.t : 1;
            const path = new Path2D();
            for (const c of S.cracks) {
              const f = clamp((ct - c.t0) / 0.22, 0, 1);
              if (f <= 0) continue;
              let want = c.len * f;
              path.moveTo(c.pts[0], c.pts[1]);
              for (let i = 2; i < c.pts.length && want > 0; i += 2) {
                const sx = c.pts[i - 2];
                const sy = c.pts[i - 1];
                const l = Math.hypot(c.pts[i] - sx, c.pts[i + 1] - sy);
                const u = Math.min(1, want / l);
                path.lineTo(sx + (c.pts[i] - sx) * u, sy + (c.pts[i + 1] - sy) * u);
                want -= l;
              }
            }
            g.lineJoin = "round";
            g.lineCap = "round";
            g.translate(0.8, 0.9);
            g.strokeStyle = "rgba(14,52,110,.55)";
            g.lineWidth = 1.6;
            g.stroke(path);
            g.translate(-0.8, -0.9);
            g.strokeStyle = "rgba(170,225,255,.5)";
            g.lineWidth = 3.2;
            g.stroke(path);
            g.strokeStyle = "rgba(255,255,255,.98)";
            g.lineWidth = 1;
            g.stroke(path);
          }
          // the melt opens from the middle outwards
          if (S.phase === "melting") {
            const m = easeInOut(clamp(S.t / MELT, 0, 1));
            const R = 8 + m * Math.hypot(CW, CH) * 0.6;
            g.globalCompositeOperation = "destination-out";
            const mg = g.createRadialGradient(CW / 2, CH / 2, 0, CW / 2, CH / 2, R);
            mg.addColorStop(0, "rgba(0,0,0,1)");
            mg.addColorStop(Math.max(0, 1 - 46 / R), "rgba(0,0,0,1)");
            mg.addColorStop(1, "rgba(0,0,0,0)");
            g.fillStyle = mg;
            g.fillRect(0, 0, CW, CH);
            if (m > 0.55) {
              g.fillStyle = `rgba(0,0,0,${(m - 0.55) / 0.45})`;
              g.fillRect(0, 0, CW, CH);
            }
            g.globalCompositeOperation = "source-over";
            // drips running down the face, with a wet trail
            for (const d of S.drips) {
              if (S.t < d.t0) continue;
              const fade = d.off ? clamp(1 - (S.t - d.gone) / 0.7, 0, 1) : 1;
              if (fade <= 0) continue;
              const top = Math.max(d.y0, d.y - 44);
              const bot = Math.min(d.y, CH);
              if (bot > top + 1) {
                const tr = g.createLinearGradient(0, top, 0, bot);
                tr.addColorStop(0, "rgba(220,240,255,0)");
                tr.addColorStop(1, `rgba(228,245,255,${0.42 * fade})`);
                g.strokeStyle = tr;
                g.lineWidth = 3.2;
                g.beginPath();
                g.moveTo(d.x, top);
                g.lineTo(d.x, bot);
                g.stroke();
                g.strokeStyle = `rgba(255,255,255,${0.55 * fade})`;
                g.lineWidth = 0.8;
                g.beginPath();
                g.moveTo(d.x - 0.8, top + (bot - top) * 0.4);
                g.lineTo(d.x - 0.8, bot);
                g.stroke();
              }
              if (!d.off) {
                g.save();
                g.translate(d.x, d.y);
                const dg = g.createRadialGradient(-1.3, 0, 0, 0, 1.5, 5.5);
                dg.addColorStop(0, "rgba(255,255,255,1)");
                dg.addColorStop(0.45, "rgba(214,240,255,.9)");
                dg.addColorStop(1, "rgba(96,178,255,.75)");
                g.fillStyle = dg;
                g.beginPath();
                g.moveTo(0, -9);
                g.quadraticCurveTo(4.4, -1.5, 4.2, 1.8);
                g.arc(0, 1.8, 4.2, 0, Math.PI);
                g.quadraticCurveTo(-4.4, -1.5, 0, -9);
                g.fill();
                g.fillStyle = "rgba(255,255,255,.95)";
                g.beginPath();
                g.ellipse(-1.5, 0.4, 1, 1.6, 0.3, 0, TAU);
                g.fill();
                g.restore();
              }
            }
          }
        }
      }

      // ── snow across the whole screen: small flakes behind the card, big soft ones in front ──
      const want = S.snowing && !red;
      if (want) {
        if (clock - lastBack > 0.085 && S.back.length < 44) {
          lastBack = clock;
          S.back.push(mkFlake(false, S.phase === "growing" && S.back.length < 22));
        }
        if (clock - lastFront > 0.65 && S.front.length < 6) {
          lastFront = clock;
          S.front.push(mkFlake(true, false));
        }
      }
      if (S.back.length || S.front.length || S.falls.length || S.drawn) {
        S.back = drawFlakes(bc, S.back, false, want, dt, spr);
        S.front = drawFlakes(frc, S.front, true, want, dt, spr);
        // water falling off the card
        const g2 = frc.getContext("2d")!;
        S.falls = S.falls.filter((d) => d.y < dims.current.RH + 10 && d.a > 0);
        for (const d of S.falls) {
          d.vy += 900 * dt;
          d.y += d.vy * dt;
          d.a -= dt * 1.2;
          g2.globalAlpha = clamp(d.a, 0, 1);
          g2.fillStyle = "rgba(200,235,255,.95)";
          g2.beginPath();
          g2.ellipse(d.x, d.y, 2.2, 3.4 + Math.min(4, d.vy / 120), 0, 0, TAU);
          g2.fill();
        }
        g2.globalAlpha = 1;
        S.drawn = S.back.length + S.front.length + S.falls.length > 0;
      }
      if (glareT.get() === 0) sparkle.current *= 0.92;
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpr]);

  // canvases follow the size
  useLayoutEffect(() => {
    const f = frostCv.current;
    if (f) {
      f.width = Math.round(CW * dpr);
      f.height = Math.round(CH * dpr);
    }
    for (const c of [backCv.current, frontCv.current]) {
      if (!c) continue;
      c.width = Math.round(RW * dpr);
      c.height = Math.round(RH * dpr);
    }
    sim.current.dirty = true;
  }, [RW, RH, dpr]);

  // start frozen if asked to
  useEffect(() => {
    if (defaultFrozen || frozen) {
      const S = sim.current;
      const was = reducedRef.current;
      reducedRef.current = true; // draw it whole, no growth
      startFreeze();
      reducedRef.current = was;
      S.snowing = !was;
      ice.set(1);
      setBadge(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // react to changes of the frozen state
  const prev = useRef(isFrozen);
  useEffect(() => {
    if (prev.current === isFrozen) return;
    prev.current = isFrozen;
    setLive(isFrozen ? "Card frozen. Payments are paused." : "Card unfrozen. Payments are back on.");
    if (isFrozen) {
      startFreeze();
      if (!reducedRef.current) {
        window.setTimeout(() => void animate(shiver, [0, -4, 4, -3, 2.5, -1.5, 0], { duration: 0.42, ease: "easeOut" }), 160);
        window.setTimeout(() => sim.current.phase !== "idle" && setBadge(true), 900);
      } else setBadge(true);
    } else {
      setBadge(false);
      startThaw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFrozen]);

  // ─── autoplay: tilt, peek at the number, freeze, admire the ice, thaw ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    let following = false;
    const own = new Set<AnimationPlaybackControls>();
    const follow = () => {
      if (!following) return;
      const b = root.getBoundingClientRect();
      point(b.left + gx.get(), b.top + gy.get());
    };
    const u1 = gx.on("change", follow);
    const u2 = gy.on("change", follow);
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      if (following) release();
      following = false;
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, v: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const cardAt = (fx: number, fy: number) => {
      const c = cardRef.current!.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return [c.left - b.left + c.width * fx, c.top - b.top + c.height * fy] as const;
    };
    const moveTo = async (x: number, y: number, d: number) => {
      if (go.get() < 0.5) {
        gx.set(x + 30);
        gy.set(y + 40);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, d), run(gy, y, d)]);
    };
    const sweep = async (pts: [number, number][], d: number) => {
      following = true;
      for (const [fx, fy] of pts) {
        const [x, y] = cardAt(fx, fy);
        await moveTo(x, y, d);
      }
      following = false;
      release();
    };
    const tap = async (sel: string, act: () => void, hide = true) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      await moveTo(r.left - b.left + r.width / 2, r.top - b.top + r.height / 2, 0.5);
      await run(gs, 0.8, 0.08);
      act();
      await run(gs, 1, 0.12);
      if (hide) await run(go, 0, 0.3);
    };
    (async () => {
      await wait(250);
      while (alive) {
        if (sim.current.phase !== "idle") {
          await tap("[data-freeze]", toggle);
          await wait(2600);
        }
        await sweep(
          [
            [0.3, 0.4],
            [0.7, 0.6],
          ],
          0.4,
        );
        await tap("[data-eye]", () => setReveal(true), false);
        await wait(1300);
        await tap("[data-eye]", () => setReveal(false), false);
        await wait(300);
        await tap("[data-freeze]", toggle);
        await wait(2400);
        await sweep(
          [
            [0.2, 0.3],
            [0.55, 0.45],
            [0.85, 0.7],
            [0.6, 0.3],
          ],
          0.55,
        );
        await run(go, 0, 0.3);
        await wait(900);
        await tap("[data-freeze]", toggle);
        await wait(3000);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      u1();
      u2();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  // the card art, painted once
  const [art, setArt] = useState<string | null>(null);
  useEffect(() => setArt(paintAurora() || null), []);
  const artBg = art ? `url(${art})` : "linear-gradient(180deg, #050826, #0c1048 48%, #2a0f55 80%, #4d1252)";

  const ic = (k: keyof typeof ICON, size = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={size} height={size} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const money = (v: number, whole = false) => `${currency}${v.toLocaleString("en-US", { minimumFractionDigits: whole && Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
  const narrow = RW < 300;
  const pct = clamp(limit > 0 ? spent / limit : 0, 0, 1) * 100;
  const notch = "radial-gradient(circle at 0 50%, transparent 11.5px, #000 12px)";
  const round = "grid h-[52px] w-[52px] place-items-center rounded-full";
  const ring = "outline-none focus-visible:ring-2 focus-visible:ring-[#8fd0ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0f1f]";

  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[400px] select-none overflow-hidden rounded-[34px] text-white shadow-[0_40px_70px_-34px_rgba(24,12,70,.85),0_0_0_1px_rgba(255,255,255,.05)] ${className}`}
      style={{ background: "radial-gradient(120% 55% at 50% -12%, rgba(132,120,255,.2), rgba(132,120,255,0) 62%), linear-gradient(180deg, #11142b 0%, #0a0c19 58%, #080913 100%)" }}
      onPointerMove={onMove}
      onPointerLeave={release}
      onPointerUp={(e) => e.pointerType === "touch" && release()}
    >
      {/* the room goes cold when the card freezes */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ opacity: coldWash, background: "radial-gradient(90% 50% at 50% 28%, rgba(110,180,255,.32), rgba(110,180,255,0) 70%)" }} />
      <canvas ref={backCv} aria-hidden="true" className="pointer-events-none absolute left-0 top-0" style={{ width: RW, height: RH }} />

      <div className="relative" style={{ padding: `${pad - 4}px ${pad}px ${pad + 4}px` }}>
        {/* header */}
        <div className="flex items-center justify-between gap-2">
          <button type="button" aria-label="Back" onClick={() => onBack?.()} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[.07] text-white/80 transition-colors hover:bg-white/[.12] ${ring}`}>
            {ic("back", 16)}
          </button>
          <div className="min-w-0 text-center">
            <p className="m-0 truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</p>
            <p className="m-0 mt-0.5 flex h-[16px] items-center justify-center gap-1.5 text-[12px]">
              {isFrozen ? (
                <>
                  <span className="text-[#8fd0ff]">{ic("snow", 11)}</span>
                  <span className="text-[#b4e1ff]">Frozen</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
                  <span className="text-white/60">Active</span>
                </>
              )}
            </p>
          </div>
          <button type="button" aria-label="Card details" onClick={() => onDetails?.()} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[.07] text-white/80 transition-colors hover:bg-white/[.12] ${ring}`}>
            {ic("more", 18)}
          </button>
        </div>

        {/* the card */}
        <div className="relative mt-5" style={{ height: ch }}>
          {/* its glow on the panel: its own colours, or icy blue */}
          <motion.div aria-hidden="true" className="pointer-events-none absolute rounded-[28px]" style={{ left: "8%", right: "8%", top: "26%", bottom: "-10%", backgroundImage: artBg, backgroundSize: "cover", filter: "blur(26px) saturate(1.5)", opacity: bloomWarm }} />
          <motion.div aria-hidden="true" className="pointer-events-none absolute rounded-[28px]" style={{ left: "8%", right: "8%", top: "26%", bottom: "-10%", background: "rgba(110,190,255,.75)", filter: "blur(30px)", opacity: bloomCold }} />
          <motion.div className="absolute inset-0" style={{ x: shiver }}>
            <motion.div ref={cardRef} className="relative h-full w-full" style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}>
              <div
                ref={faceRef}
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: CW, height: CH, borderRadius: 18, transform: `scale(${s})`, transformOrigin: "0 0", WebkitMaskImage: notch, maskImage: notch }}
              >
                {/* the Aurora print, which blurs and cools as it freezes */}
                <motion.div aria-hidden="true" className="absolute -inset-[6px]" style={{ backgroundImage: artBg, backgroundSize: `${CW}px ${CH}px`, backgroundPosition: "6px 6px", filter: artFilter }} />
                <motion.div aria-hidden="true" className="absolute inset-0 mix-blend-screen" style={{ backgroundImage: "linear-gradient(112deg, rgba(255,255,255,0) 30%, rgba(120,255,235,.16) 40%, rgba(255,245,150,.14) 47%, rgba(255,130,230,.16) 54%, rgba(255,255,255,0) 64%)", backgroundSize: "260% 100%", backgroundPosition: sheenPos }} />
                <motion.div aria-hidden="true" className="absolute inset-0 mix-blend-color" style={{ opacity: iceTint, background: "linear-gradient(135deg, #a9cdee, #5b8dc4 55%, #8fb8e2)" }} />
                <motion.div aria-hidden="true" className="absolute inset-0" style={{ opacity: slate, background: "linear-gradient(160deg, rgba(38,62,98,.42), rgba(14,28,54,.5))" }} />
                {/* the chip, under the ice */}
                <div aria-hidden="true" className="absolute inset-0 text-white">
                  <svg className="absolute left-[26px] top-[80px]" width="44" height="34" viewBox="0 0 46 36">
                    <defs>
                      <linearGradient id="fc-gold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#fff3c4" />
                        <stop offset=".45" stopColor="#f2c14e" />
                        <stop offset="1" stopColor="#b07b1c" />
                      </linearGradient>
                    </defs>
                    <rect x=".5" y=".5" width="45" height="35" rx="7" fill="url(#fc-gold)" stroke="rgba(120,80,10,.35)" />
                    <path d="M0 12H14M0 24H14M32 12H46M32 24H46M14 0V36M32 0V36M14 18H32" stroke="rgba(110,72,8,.45)" strokeWidth="1" fill="none" />
                    <rect x="14" y="10" width="18" height="16" rx="3" fill="none" stroke="rgba(110,72,8,.45)" />
                  </svg>
                  <span className="absolute left-[80px] top-[84px] text-white/80">{ic("contactless", 24)}</span>
                </div>
                {/* frost */}
                <canvas ref={frostCv} aria-hidden="true" className={`absolute inset-0 transition-opacity duration-300 ${reduced && !isFrozen ? "opacity-0" : "opacity-100"}`} style={{ width: CW, height: CH }} />
                {/* the words stay readable over the ice */}
                <div aria-hidden="true" className="absolute inset-0 text-white" style={{ textShadow: "0 1px 3px rgba(8,22,48,.55), 0 0 10px rgba(8,22,48,.35)" }}>
                  <div className="absolute left-[22px] top-[19px] flex items-center gap-2">
                    <span className="block h-[19px] w-[19px] rounded-full" style={{ background: "conic-gradient(from 200deg, #ffd36e, #ff6fb1, #9b7bff, #6cf0ff, #ffd36e)", WebkitMask: "radial-gradient(circle, transparent 4.5px, #000 5px)", mask: "radial-gradient(circle, transparent 4.5px, #000 5px)" }} />
                    <span className="text-[17px] font-semibold tracking-[-0.02em]">Halo</span>
                    <span className="ml-1 text-[12px] font-medium text-white/65">Debit</span>
                  </div>
                  <span className={`absolute bottom-[46px] left-[24px] font-medium tabular-nums ${reveal ? "text-[17px] tracking-[0.06em]" : "text-[18px] tracking-[0.04em]"}`}>{reveal ? full : `•••• ${last4}`}</span>
                  <span className="absolute bottom-[21px] left-[24px] flex gap-3 text-[13px] font-medium text-white/85">
                    {holder}
                    {reveal && <span className="tabular-nums text-white/70">{expiry}</span>}
                  </span>
                  <AnimatePresence initial={false}>
                    {badge ? (
                      <motion.span
                        key="frozen"
                        className="absolute bottom-[17px] right-[18px] flex items-center gap-1 rounded-full border border-white/40 bg-[#0d2442]/45 py-[3px] pl-[7px] pr-[9px] text-[12px] font-semibold text-[#e2f4ff] backdrop-blur-md"
                        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, filter: "blur(6px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.4 }}
                      >
                        {ic("snow", 12)}
                        Frozen
                      </motion.span>
                    ) : (
                      <motion.span key="nova" className="absolute bottom-[16px] right-[20px] flex items-center gap-1 text-[20px] font-bold italic tracking-[-0.03em]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
                          <path d="M7 0C7.6 4.6 9.4 6.4 14 7C9.4 7.6 7.6 9.4 7 14C6.4 9.4 4.6 7.6 0 7C4.6 6.4 6.4 4.6 7 0Z" fill="#fff" />
                        </svg>
                        nova
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {/* glare, and the thaw's warm glow */}
                <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-soft-light" style={{ background: glare, opacity: glareO }} />
                <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ opacity: warmGlow, background: "radial-gradient(80% 90% at 50% 60%, rgba(255,170,90,.75), rgba(255,120,80,0) 70%)" }} />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,.3),inset_0_0_0_1px_rgba(255,255,255,.1)]" />
                {/* show the full number */}
                <button
                  type="button"
                  data-eye
                  aria-label={reveal ? "Hide card number" : "Show card number"}
                  aria-pressed={reveal}
                  onClick={() => setReveal((v) => !v)}
                  className="absolute right-[14px] top-[13px] grid h-[30px] w-[30px] place-items-center rounded-full bg-black/25 text-white/90 outline-none backdrop-blur-md transition-colors hover:bg-black/40 focus-visible:ring-2 focus-visible:ring-white"
                >
                  {ic(reveal ? "eyeOff" : "eye", 16)}
                </button>
              </div>
            </motion.div>
          </motion.div>
          <span className="sr-only">{`${title} ending in ${last4}, ${holder}${isFrozen ? ", frozen" : ""}`}</span>
        </div>

        {/* spending this month */}
        <div className="mt-6">
          <div className={`flex items-baseline justify-between gap-2 ${narrow ? "text-[12px]" : "text-[12.5px]"}`}>
            <span className="whitespace-nowrap text-white/55">{narrow ? "This month" : "Spent this month"}</span>
            <span className="whitespace-nowrap tabular-nums text-white/55">
              <span className="font-semibold text-white">{money(spent)}</span> of {money(limit, true)}
            </span>
          </div>
          <div className="relative mt-2 h-[5px] overflow-hidden rounded-full bg-white/[.08]">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #7c5cff, #ff4fc4 60%, #ff9a5c)" }} />
            <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct}%`, opacity: ice, background: "linear-gradient(90deg, #4f78a8, #a9d8ff)" }} />
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 grid grid-cols-3 gap-1">
          <button type="button" role="switch" aria-checked={isFrozen} aria-label="Freeze card" data-freeze onClick={toggle} className={`group flex flex-col items-center gap-2 rounded-[18px] px-0.5 py-1 ${ring}`}>
            <span className={`relative ${round} bg-white/[.08] shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition-colors group-hover:bg-white/[.13]`}>
              <motion.span aria-hidden="true" className="absolute inset-0 rounded-full shadow-[0_0_24px_rgba(120,200,255,.55),inset_0_1px_0_rgba(255,255,255,.8)]" style={{ background: "linear-gradient(150deg, #effaff, #9ad6ff 55%, #5fb2f2)" }} initial={false} animate={{ opacity: isFrozen ? 1 : 0, scale: isFrozen ? 1 : 0.6 }} transition={{ type: "spring", stiffness: 320, damping: 22 }} />
              <motion.span className="relative" initial={false} animate={{ rotate: isFrozen ? 60 : 0, color: isFrozen ? "#0b2a4a" : "rgba(255,255,255,.9)" }} transition={{ type: "spring", stiffness: 220, damping: 16 }}>
                {ic("snow", 21)}
              </motion.span>
            </span>
            <span className={`text-center text-[12px] font-medium leading-tight transition-colors ${isFrozen ? "text-[#b4e1ff]" : "text-white/70"}`}>Freeze card</span>
          </button>
          <button type="button" onClick={() => onLimits?.()} className={`group flex flex-col items-center gap-2 rounded-[18px] px-0.5 py-1 ${ring}`}>
            <span className={`${round} bg-white/[.08] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition-colors group-hover:bg-white/[.13]`}>{ic("limits", 21)}</span>
            <span className="text-center text-[12px] font-medium leading-tight text-white/70">Change limits</span>
          </button>
          <button type="button" onClick={() => onTransactions?.()} className={`group flex flex-col items-center gap-2 rounded-[18px] px-0.5 py-1 ${ring}`}>
            <span className={`${round} bg-white/[.08] text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition-colors group-hover:bg-white/[.13]`}>{ic("receipt", 21)}</span>
            <span className="text-center text-[12px] font-medium leading-tight text-white/70">Transactions</span>
          </button>
        </div>
      </div>

      <canvas ref={frontCv} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20" style={{ width: RW, height: RH }} />
      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```

--- components/frozen-card/index.ts ---

```ts
export { FrozenCard } from "./frozen-card";
export type { FrozenCardProps } from "./frozen-card";
```
