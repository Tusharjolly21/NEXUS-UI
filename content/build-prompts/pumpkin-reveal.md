# Pumpkin Reveal

Add the "Pumpkin Reveal" component from Nexus UI to my project.

Trick or treat with a real 3D jack-o'-lantern hanging from a dead branch. It turns on its rope, every hit grows glowing cracks where you struck it, and the third splits it along its ribs into curved shell pieces. Then whatever was inside gets out: sheet ghosts with cut-out faces fly out and keep circling the night, bats burst out, and black widows scuttle across the card while one drops on a thread from the branch. Then the offer flies out on a torn, bloodied slip with a cobweb and its spider, and lands ready to copy. The sounds are synthesised, off until the visitor switches them on, and an optional track can play as it bursts.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser. Create it at lib/ from the file below.
5. Download the Halloween track from https://nexus-ui.com/audio/pumpkin-burst.mp3 (there is also a download button next to the build prompt on the component page) and save it as `public/audio/pumpkin-burst.mp3`. Then use it like this: `<PumpkinReveal music="/audio/pumpkin-burst.mp3" />`. The burst is timed to this exact recording. Playback starts 0.2 s in, so the hit at 0.24 s lands on the burst. The theremin glides up about 1.65 s after the burst while the ghosts fly out, the skeleton on the grave chatters and the moon pulses on the bass moves at 3.4, 5.0 and 6.6 s, a ghost swoops across the graveyard on the theremin's glide down at 6.45 s, and the track fades from about 10 s. The moonlight also follows the music's loudness as it plays. Use the file as it is: trimming the start or re-encoding it with a different offset moves every cue. Credit: Halloween music by Starostin, from Pixabay.
6. Use it like this: `import { PumpkinReveal } from "@/components/pumpkin-reveal";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/pumpkin-reveal/index.ts ---

```ts
export { PumpkinReveal } from "./pumpkin-reveal";
export type { PumpkinRevealProps } from "./pumpkin-reveal";
```

--- components/pumpkin-reveal/pumpkin-reveal.tsx ---

```tsx
"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

// ---------------------------------------------------------------------------
// geometry (piñata art units; the hang point is the origin, the body hangs below it)
const CARD_H = 500, ANCHOR_Y = 96, ROPE = 46, BODY_Y = 72;
// the branch it hangs from: a crooked centreline from off the left edge out past the middle
const branchY = (x: number, W: number) => {
  const t = clamp(x / (W * 0.86), 0, 1);
  return ANCHOR_Y + 16 - 30 * t + 10 * t * t + 2.6 * Math.sin(x * 0.07) + 1.6 * Math.sin(x * 0.19 + 1);
};
// bony twigs: fraction along the branch, angle (deg, 0 = right, -90 = up), length, base width, fork
const TWIGS = [
  { f: 0.1, ang: -62, len: 40, w: 5, fork: 1 }, { f: 0.2, ang: 118, len: 26, w: 3.6, fork: 0 }, { f: 0.33, ang: -104, len: 30, w: 3.8, fork: -1 },
  { f: 0.62, ang: -48, len: 44, w: 4, fork: 1 }, { f: 0.72, ang: 70, len: 22, w: 2.8, fork: 0 }, { f: 0.86, ang: -84, len: 26, w: 2.6, fork: -1 }, { f: 0.95, ang: -20, len: 22, w: 2.2, fork: 1 },
];
// things hanging off it that swing when it shakes: a spider on its thread and two dead leaves
const LEAVES = [{ f: 0.79, a: 0, s: 1 }, { f: 0.9, a: 64, s: 1 }, { f: 0.43, a: 112, s: 0.85 }];
// the offer that comes out once the horde has fled; each new pumpkin holds the next one
type Treat = { title: string; code: string };
const TREATS: Treat[] = [
  { title: "20% off your first year", code: "BOO20" },
  { title: "A free month of Pro", code: "GHOST30" },
];
// how long the horde has the stage before the offer comes out, in ms
const EMERGE_MS = 2600;

// A deterministic hash in 0..1. Integer maths only, so the server and the browser agree to the last digit
// (a sin-based hash does not, and that breaks hydration).
const rnd = (n: number) => {
  let h = (Math.round(n * 1000) | 0) ^ 0x9e3779b9;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
// the coupon: a torn bottom edge, chamfered top corners, and where the blood runs from the top
const TORN = (() => {
  const pts = ["0% 7%", "3% 0%", "97% 0%", "100% 7%"];
  for (let i = 0; i <= 18; i++) pts.push(`${(100 - (i * 100) / 18).toFixed(2)}% ${(i % 2 ? 93 - rnd(i * 3.3) * 5 : 100 - rnd(i * 1.7) * 2.5).toFixed(2)}%`);
  return `polygon(${pts.join(",")})`;
})();
const DRIPS = [
  { x: 6, w: 7, l: 15 }, { x: 15, w: 5, l: 24 }, { x: 27, w: 8, l: 12 }, { x: 41, w: 5, l: 30 }, { x: 52, w: 6, l: 14 },
  { x: 63, w: 9, l: 19 }, { x: 77, w: 5, l: 11 },
];

// ---------------------------------------------------------------------------
// A real 3D jack-o'-lantern, drawn on a canvas: a ribbed shell with a carved,
// candle-lit face. It cracks where you hit it and shatters into rigid shards of
// shell (orange skin outside, pale flesh inside) that tumble and bounce.
type P3 = [number, number, number];
const PR = 58, PH = 0.74, NL = 50, NP = 24, TILT = 0.24;
const L3: P3 = (() => { const v: P3 = [-0.45, -0.62, 0.64]; const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; })();
const RIM: P3 = [0.62, -0.55, -0.56];
// carved face, in face space: x -1..1 across, y -1 (top) .. 1 (bottom)
const FACE_POLYS: [number, number][][] = [
  [[-0.78, -0.42], [-0.22, -0.18], [-0.62, 0.02]],
  [[0.78, -0.42], [0.22, -0.18], [0.62, 0.02]],
  [[-0.11, 0.1], [0.11, 0.1], [0, -0.06]],
  (() => {
    const top: [number, number][] = [[-0.86, 0.22], [-0.66, 0.36], [-0.56, 0.24], [-0.38, 0.4], [-0.24, 0.27], [-0.08, 0.42], [0.08, 0.28], [0.24, 0.42], [0.38, 0.26], [0.56, 0.4], [0.66, 0.24], [0.86, 0.22]];
    const bot: [number, number][] = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12, x = 0.86 - 1.72 * t; bot.push([x, 0.22 + 0.62 * Math.sin(Math.PI * t) ** 0.8 * (1 - 0.15 * Math.abs(x))]); }
    // one crooked tooth hanging from the top lip and one rising from the bottom
    return [...top, ...bot.slice(0, 5), [0.18, 0.62], [0.12, 0.8], ...bot.slice(6)];
  })(),
];
const faceToSphere = (fx: number, fy: number) => ({ th: Math.PI / 2 + fx * 0.92, ph: 1.5 + fy * 0.58 });
const inPoly = (x: number, y: number, poly: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const surf = (th: number, ph: number): P3 => {
  const rib = 0.9 + 0.1 * Math.pow(Math.abs(Math.cos(5 * th)), 0.55);
  const s = Math.sin(ph), c = Math.cos(ph);
  const rr = PR * rib * Math.pow(Math.max(0, s), 0.82);
  let y = PR * PH * c;
  y -= 10 * Math.exp(-((ph / 0.36) ** 2)); // the stem sits in a dimple
  y += 7 * Math.exp(-(((Math.PI - ph) / 0.4) ** 2));
  return [rr * Math.cos(th), y, rr * Math.sin(th)];
};
type Facet = { v: [number, number, number, number]; shard: number; hole: boolean; th: number; ph: number; n: P3 };
// the smooth surface normal (from the shape's own derivatives), so shading does not show the facets
const surfNormal = (th: number, ph: number): P3 => {
  const e = 1e-3, a = surf(th, ph), b = surf(th + e, ph), c = surf(th, Math.min(Math.PI - 1e-4, ph + e));
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  let n: P3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
  if (n[0] * a[0] + n[1] * a[1] + n[2] * a[2] < 0) n = [-n[0], -n[1], -n[2]];
  const l = Math.hypot(...n) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
};
const MESH3 = (() => {
  const verts: P3[] = [];
  for (let p = 0; p <= NP; p++) for (let l = 0; l < NL; l++) verts.push(surf((l / NL) * Math.PI * 2, (p / NP) * Math.PI));
  const idx = (p: number, l: number) => p * NL + ((l + NL) % NL);
  // shards: a pumpkin splits along its rib grooves, then breaks across each rib in a jagged line
  const ribOf = (l: number) => ((Math.floor((l + 0.5) / 5 - 0.5) % 10) + 10) % 10;
  const shardOf = (p: number, l: number) => {
    if (p < 3) return 30;
    if (p >= NP - 3) return 31;
    const r = ribOf(l), zig = rnd(l * 3.7 + p * 0.1) > 0.55 ? 1 : 0;
    const b1 = 8 + Math.floor(rnd(r * 5.1) * 3) - 1 + zig, b2 = 15 + Math.floor(rnd(r * 9.3) * 3) - 1 + zig;
    return r * 3 + (p < b1 ? 0 : p < b2 ? 1 : 2);
  };
  const facets: Facet[] = [];
  for (let p = 0; p < NP; p++) for (let l = 0; l < NL; l++) {
    const th = ((l + 0.5) / NL) * Math.PI * 2, ph = ((p + 0.5) / NP) * Math.PI;
    const best = shardOf(p, l);
    const fx = (th - Math.PI / 2) / 0.92, fy = (ph - 1.5) / 0.58;
    const hole = Math.abs(fx) < 1.2 && FACE_POLYS.some((poly) => inPoly(fx, fy, poly));
    facets.push({ v: [idx(p, l), idx(p, l + 1), idx(p + 1, l + 1), idx(p + 1, l)], shard: best, hole, th, ph, n: surfNormal(th, ph) });
  }
  // crack edges: every edge between two facets of different shards
  const edges: { a: number; b: number; s1: number; s2: number; f1: number; f2: number }[] = [];
  for (let p = 0; p < NP; p++) for (let l = 0; l < NL; l++) {
    const f = p * NL + l, right = p * NL + ((l + 1) % NL), down = p + 1 < NP ? (p + 1) * NL + l : -1;
    if (facets[f].shard !== facets[right].shard) edges.push({ a: idx(p, l + 1), b: idx(p + 1, l + 1), s1: facets[f].shard, s2: facets[right].shard, f1: f, f2: right });
    if (down >= 0 && facets[f].shard !== facets[down].shard) edges.push({ a: idx(p + 1, l), b: idx(p + 1, l + 1), s1: facets[f].shard, s2: facets[down].shard, f1: f, f2: down });
  }
  return { verts, facets, edges, nShards: 32 };
})();
type Shard = { f: number[]; rel: Map<number, P3>; nrm: Map<number, P3>; rim: [number, number][]; pos: P3; vel: P3; axis: P3; w: number; rad: number; life: number };
type Chip = { x: number; y: number; vx: number; vy: number; a: number; va: number; s: number; c: string; life: number };
const rot3 = (v: P3, ax: P3, a: number): P3 => {
  const c = Math.cos(a), s = Math.sin(a), d = v[0] * ax[0] + v[1] * ax[1] + v[2] * ax[2];
  return [v[0] * c + (ax[1] * v[2] - ax[2] * v[1]) * s + ax[0] * d * (1 - c), v[1] * c + (ax[2] * v[0] - ax[0] * v[2]) * s + ax[1] * d * (1 - c), v[2] * c + (ax[0] * v[1] - ax[1] * v[0]) * s + ax[2] * d * (1 - c)];
};
const shadeRGB = (base: P3, n: P3, amb: number, dif: number, spec: number, rim: number) => {
  const d = Math.max(0, n[0] * L3[0] + n[1] * L3[1] + n[2] * L3[2]);
  const h = [L3[0], L3[1], L3[2] + 1], hl = Math.hypot(h[0], h[1], h[2]);
  const sp = Math.pow(Math.max(0, (n[0] * h[0] + n[1] * h[1] + n[2] * h[2]) / hl), 28) * spec;
  const r = Math.max(0, n[0] * RIM[0] + n[1] * RIM[1] + n[2] * RIM[2]) ** 2 * rim;
  const k = amb + dif * d;
  return `rgb(${Math.min(255, base[0] * k + 255 * sp + 150 * r) | 0},${Math.min(255, base[1] * k + 235 * sp + 160 * r) | 0},${Math.min(255, base[2] * k + 210 * sp + 255 * r) | 0})`;
};
const SKIN: P3 = [255, 118, 26], FLESH: P3 = [255, 206, 120];
type View = { cx: number; cy: number; b: number; yaw: number; sq: number; k: number };
function createPumpkin() {
  const N = MESH3.verts.length;
  const sx = new Float32Array(N), sy = new Float32Array(N), sz = new Float32Array(N);
  const fcx = new Float32Array(MESH3.facets.length), fcy = new Float32Array(MESH3.facets.length), fvis = new Uint8Array(MESH3.facets.length);
  const cracked = new Set<number>();
  // cracks are hand-grown jagged lines on the surface, in (longitude, latitude)
  let cracks: { pts: [number, number][]; w: number }[] = [];
  const projTP = (v: View, th: number, ph: number) => {
    const p = surf(th, ph);
    const cy = Math.cos(v.yaw), syw = Math.sin(v.yaw), ct = Math.cos(TILT), st = Math.sin(TILT), cb = Math.cos(v.b), sb = Math.sin(v.b);
    let x = p[0] * (2 - v.sq); const y = p[1] * v.sq, z = p[2] * (2 - v.sq);
    const x1 = x * cy + z * syw, z1 = -x * syw + z * cy, y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    x = x1; const yd = -y2;
    return { x: v.cx + v.k * (x * cb - yd * sb), y: v.cy + v.k * (x * sb + yd * cb), z: z2 };
  };
  const rotN = (v: View, n: P3): P3 => {
    const cy = Math.cos(v.yaw), syw = Math.sin(v.yaw), ct = Math.cos(TILT), st = Math.sin(TILT), cb = Math.cos(v.b), sb = Math.sin(v.b);
    const x1 = n[0] * cy + n[2] * syw, z1 = -n[0] * syw + n[2] * cy, y2 = n[1] * ct - z1 * st, z2 = n[1] * st + z1 * ct;
    const yd = -y2;
    return [x1 * cb - yd * sb, x1 * sb + yd * cb, z2];
  };
  let shards: Shard[] = [];
  let chips: Chip[] = [];
  let lastView: View | null = null;
  const transform = (v: View) => {
    const cy = Math.cos(v.yaw), syw = Math.sin(v.yaw), ct = Math.cos(TILT), st = Math.sin(TILT), cb = Math.cos(v.b), sb = Math.sin(v.b);
    const xs = 2 - v.sq, ys = v.sq;
    for (let i = 0; i < N; i++) {
      const p = MESH3.verts[i];
      let x = p[0] * xs;
      const y = p[1] * ys, z = p[2] * xs;
      const x1 = x * cy + z * syw, z1 = -x * syw + z * cy;
      const y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
      x = x1; const yd = -y2;
      sx[i] = v.cx + v.k * (x * cb - yd * sb);
      sy[i] = v.cy + v.k * (x * sb + yd * cb);
      sz[i] = v.k * z2;
    }
    lastView = v;
  };
  const normalOf = (a: P3, b: P3, c: P3, center: P3): P3 => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let n: P3 = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const l = Math.hypot(...n) || 1; n = [n[0] / l, n[1] / l, n[2] / l];
    const ox = a[0] - center[0], oy = a[1] - center[1], oz = a[2] - center[2];
    return ox * n[0] + oy * n[1] + oz * n[2] < 0 ? [-n[0], -n[1], -n[2]] : n;
  };
  const P = (i: number): P3 => [sx[i], sy[i], sz[i]];
  const polyPath = (g: CanvasRenderingContext2D, pts: [number, number][]) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
  // project a face-space point onto the shell
  const faceXY = (v: View, fx: number, fy: number) => {
    const { th, ph } = faceToSphere(fx, fy), p = surf(th, ph);
    const cy = Math.cos(v.yaw), syw = Math.sin(v.yaw), ct = Math.cos(TILT), st = Math.sin(TILT), cb = Math.cos(v.b), sb = Math.sin(v.b);
    let x = p[0] * (2 - v.sq); const y = p[1] * v.sq, z = p[2] * (2 - v.sq);
    const x1 = x * cy + z * syw, z1 = -x * syw + z * cy, y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
    x = x1; const yd = -y2;
    return { x: v.cx + v.k * (x * cb - yd * sb), y: v.cy + v.k * (x * sb + yd * cb), z: z2 };
  };
  return {
    reset: () => { cracked.clear(); cracks = []; shards = []; chips = []; },
    busy: () => shards.length > 0 || chips.length > 0,
    draw: (g: CanvasRenderingContext2D, v: View, t: number, flick: number, stemFrom: { x: number; y: number }) => {
      transform(v);
      const C: P3 = [v.cx, v.cy, 0];
      const order: { f: number; z: number; col: string }[] = [];
      MESH3.facets.forEach((f, i) => {
        const a = P(f.v[0]), b = P(f.v[1]), c = P(f.v[2]), d = P(f.v[3]);
        fcx[i] = (a[0] + b[0] + c[0] + d[0]) / 4; fcy[i] = (a[1] + b[1] + c[1] + d[1]) / 4;
        // degenerate polar facets: use the other triangle for the normal
        const n = Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.01 ? normalOf(a, c, d, C) : normalOf(a, b, c, C);
        fvis[i] = n[2] > 0.02 ? 1 : 0;
        if (!fvis[i]) return;
        const ao = 0.78 + 0.22 * Math.min(1, Math.max(0, 1 - (f.ph / Math.PI - 0.15) * 0.9));
        const base: P3 = [SKIN[0] * ao, SKIN[1] * ao, SKIN[2] * ao];
        order.push({ f: i, z: (a[2] + b[2] + c[2] + d[2]) / 4, col: shadeRGB(base, rotN(v, f.n), 0.34, 0.78, 0.32, 0.5) });
      });
      order.sort((p, q) => p.z - q.z);
      g.lineJoin = "round";
      for (const o of order) {
        const f = MESH3.facets[o.f];
        g.beginPath(); g.moveTo(sx[f.v[0]], sy[f.v[0]]); g.lineTo(sx[f.v[1]], sy[f.v[1]]); g.lineTo(sx[f.v[2]], sy[f.v[2]]); g.lineTo(sx[f.v[3]], sy[f.v[3]]); g.closePath();
        g.fillStyle = o.col; g.fill(); g.strokeStyle = o.col; g.lineWidth = 0.7; g.stroke();
      }
      // the carved face: dark cut walls, then candle light set back inside
      const fc = faceXY(v, 0, 0.1);
      if (fc.z > 4) {
        const nx = (fc.x - v.cx) / (PR * v.k), ny = (fc.y - v.cy) / (PR * v.k);
        for (const poly of FACE_POLYS) {
          const pts = poly.map(([x, y]) => faceXY(v, x, y));
          if (pts.some((p) => p.z < -2)) continue;
          const outer = pts.map((p) => [p.x, p.y] as [number, number]);
          polyPath(g, outer); g.fillStyle = "#2a0d02"; g.fill();
          g.strokeStyle = "rgba(120,40,0,.9)"; g.lineWidth = 1.4 * v.k; g.stroke();
          // the hole seen through the shell's thickness: shifted toward the centre
          let mx = 0, my = 0; outer.forEach((p) => { mx += p[0]; my += p[1]; }); mx /= outer.length; my /= outer.length;
          const inner = outer.map(([x, y]) => [mx + (x - mx) * 0.84 - nx * 3.2 * v.k, my + (y - my) * 0.84 - ny * 3.2 * v.k] as [number, number]);
          polyPath(g, inner);
          const gr = g.createRadialGradient(v.cx, v.cy + 6 * v.k, 2, v.cx, v.cy + 6 * v.k, 62 * v.k);
          gr.addColorStop(0, `rgba(255,250,210,${0.95 * flick})`); gr.addColorStop(0.35, `rgba(255,205,70,${flick})`); gr.addColorStop(1, `rgba(230,90,0,${0.85 * flick})`);
          g.fillStyle = gr; g.fill();
        }
      }
      // cracks: light from the candle leaking through the breaks
      if (cracks.length) {
        g.lineCap = "round"; g.lineJoin = "round";
        for (const cr of cracks) {
          const pts = cr.pts.map(([th, ph]) => projTP(v, th, ph));
          for (let pass = 0; pass < 2; pass++) {
            for (let i = 1; i < pts.length; i++) {
              const p0 = pts[i - 1], p1 = pts[i];
              if (p0.z < 6 || p1.z < 6) continue;
              const taper = 1 - i / pts.length;
              g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y);
              if (pass === 0) { g.strokeStyle = `rgba(255,205,80,${0.75 * flick})`; g.lineWidth = (1.2 + 2.6 * taper) * cr.w * v.k; }
              else { g.strokeStyle = "rgba(35,8,0,.92)"; g.lineWidth = (0.5 + 1.1 * taper) * cr.w * v.k; }
              g.stroke();
            }
          }
        }
      }
      // stem, and the rope tied round it
      const sb = Math.sin(v.b), cb = Math.cos(v.b), k = v.k;
      const bx = v.cx + sb * (PR * PH - 10) * k * v.sq, by = v.cy - cb * (PR * PH - 10) * k * v.sq;
      const ux = sb, uy = -cb, px = cb, py = sb;
      g.beginPath();
      g.moveTo(bx - px * 6 * k, by - py * 6 * k);
      g.quadraticCurveTo(bx + ux * 10 * k - px * 7 * k, by + uy * 10 * k - py * 7 * k, bx + ux * 19 * k + px * 1 * k, by + uy * 19 * k + py * 1 * k);
      g.lineTo(bx + ux * 18 * k + px * 5 * k, by + uy * 18 * k + py * 5 * k);
      g.quadraticCurveTo(bx + ux * 9 * k + px * 3 * k, by + uy * 9 * k + py * 3 * k, bx + px * 6 * k, by + py * 6 * k);
      g.closePath();
      const sg = g.createLinearGradient(bx - px * 7 * k, by - py * 7 * k, bx + px * 7 * k, by + py * 7 * k);
      sg.addColorStop(0, "#3a4518"); sg.addColorStop(0.45, "#77863a"); sg.addColorStop(1, "#242c0c");
      g.fillStyle = sg; g.fill(); g.strokeStyle = "rgba(20,24,6,.8)"; g.lineWidth = 0.7; g.stroke();
      g.strokeStyle = "#a88d63"; g.lineWidth = 1.6; g.lineCap = "round";
      const sx0 = bx + ux * 15 * k, sy0 = by + uy * 15 * k;
      g.beginPath(); g.moveTo(stemFrom.x, stemFrom.y); g.lineTo(sx0 - px * 4.5 * k, sy0 - py * 4.5 * k); g.moveTo(stemFrom.x, stemFrom.y); g.lineTo(sx0 + px * 4.5 * k, sy0 + py * 4.5 * k); g.stroke();
      g.beginPath(); g.moveTo(sx0 - px * 4.5 * k, sy0 - py * 4.5 * k); g.lineTo(sx0 + px * 4.5 * k, sy0 + py * 4.5 * k); g.stroke();
    },
    /** crack the shard under a screen point, and the ones around it on later hits */
    crack: (x: number, y: number, level: number, dir: number) => {
      let best = -1, bd = 1e9;
      MESH3.facets.forEach((f, i) => { if (!fvis[i]) return; const d = (fcx[i] - x) ** 2 + (fcy[i] - y) ** 2; if (d < bd) { bd = d; best = i; } });
      if (best < 0) return;
      const s0 = MESH3.facets[best].shard;
      cracked.add(s0);
      // grow a starburst of jagged cracks from the hit, bigger on the second blow
      const { th: th0, ph: ph0 } = MESH3.facets[best];
      const nb = level >= 2 ? 6 : 4;
      for (let bi = 0; bi < nb; bi++) {
        let a = (bi / nb) * Math.PI * 2 + rnd(bi * 3.1 + level * 11) * 0.8, th = th0, ph = ph0;
        const pts: [number, number][] = [[th, ph]];
        const steps = (level >= 2 ? 7 : 5) + Math.floor(rnd(bi * 5.7 + level) * 4);
        for (let k2 = 0; k2 < steps; k2++) {
          a += (rnd(bi * 13.1 + k2 * 2.3 + level * 5) - 0.5) * 1.1;
          const len = 0.06 + rnd(bi * 7.9 + k2) * 0.05;
          th += (Math.cos(a) * len) / Math.max(0.35, Math.sin(ph)); ph = Math.min(Math.PI - 0.25, Math.max(0.25, ph + Math.sin(a) * len));
          pts.push([th, ph]);
          if (k2 === 2 && rnd(bi * 2.2 + level) > 0.45) {
            let a2 = a + (rnd(bi) > 0.5 ? 0.9 : -0.9), t2 = th, p2 = ph; const br: [number, number][] = [[t2, p2]];
            for (let m2 = 0; m2 < 3; m2++) { a2 += (rnd(m2 * 3.3 + bi) - 0.5) * 0.9; t2 += (Math.cos(a2) * 0.06) / Math.max(0.35, Math.sin(p2)); p2 = Math.min(Math.PI - 0.25, Math.max(0.25, p2 + Math.sin(a2) * 0.06)); br.push([t2, p2]); }
            cracks.push({ pts: br, w: 0.7 });
          }
        }
        cracks.push({ pts, w: level >= 2 ? 1 : 0.85 });
      }
      // chips of skin and flesh fly off where it was hit
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (rnd(i * 3.3 + level * 7) - 0.5) * 2.4;
        const sp = 140 + rnd(i * 5.1 + level) * 260;
        chips.push({ x: fcx[best], y: fcy[best], vx: Math.cos(a) * sp + dir * 70, vy: Math.sin(a) * sp, a: rnd(i) * 6, va: (rnd(i * 2.2) - 0.5) * 30, s: 2 + rnd(i * 1.7) * 3.5, c: i % 3 ? "#ff8a1f" : "#ffd27a", life: 0 });
      }
    },
    /** shatter: every shard becomes a rigid body, flung out from the centre */
    burst: (dir: number) => {
      const v = lastView;
      if (!v) return;
      const groups = new Map<number, number[]>();
      MESH3.facets.forEach((f, i) => { if (!f.hole) { const a = groups.get(f.shard) ?? []; a.push(i); groups.set(f.shard, a); } });
      shards = [];
      groups.forEach((fs, si) => {
        const ids = new Set<number>(); fs.forEach((fi) => MESH3.facets[fi].v.forEach((vi) => ids.add(vi)));
        let cx = 0, cy = 0, cz = 0; ids.forEach((i) => { cx += sx[i]; cy += sy[i]; cz += sz[i]; }); cx /= ids.size; cy /= ids.size; cz /= ids.size;
        const rel = new Map<number, P3>(); let rad = 0;
        ids.forEach((i) => { const r: P3 = [sx[i] - cx, sy[i] - cy, sz[i] - cz]; rel.set(i, r); rad = Math.max(rad, Math.hypot(r[0], r[1])); });
        // each facet keeps its true outward normal, so the shard reads as skin outside and flesh inside
        const nrm = new Map<number, P3>(); fs.forEach((fi) => nrm.set(fi, rotN(v, MESH3.facets[fi].n)));
        // the broken edge all round the shard, drawn as the thickness of the shell
        const rim: [number, number][] = [];
        for (const e of MESH3.edges) if (e.s1 === si || e.s2 === si) rim.push([e.a, e.b]);
        const ox = cx - v.cx, oy = cy - v.cy, oz = cz, ol = Math.hypot(ox, oy, oz) || 1;
        const sp = 300 + rnd(si * 2.7) * 260;
        const ax: P3 = [rnd(si * 1.1) - 0.5, rnd(si * 2.3) - 0.5, rnd(si * 3.7) - 0.5], al = Math.hypot(...ax) || 1;
        shards.push({ f: fs, rel, nrm, rim, pos: [cx, cy, cz], vel: [(ox / ol) * sp + dir * 70, (oy / ol) * sp - 320, (oz / ol) * sp * 0.5], axis: [ax[0] / al, ax[1] / al, ax[2] / al], w: (4 + rnd(si * 5.3) * 8) * (rnd(si) > 0.5 ? 1 : -1), rad: rad * 0.55, life: 0 });
      });
      // seeds and stringy pulp
      for (let i = 0; i < 26; i++) {
        const a = -Math.PI / 2 + (rnd(i * 7.7) - 0.5) * 3.4, sp = 160 + rnd(i * 4.4) * 420;
        chips.push({ x: v.cx, y: v.cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 140, a: rnd(i) * 6, va: (rnd(i * 2.9) - 0.5) * 24, s: 2.5 + rnd(i * 6.1) * 2, c: i % 2 ? "#fff1cf" : "#f4a43a", life: 0 });
      }
      cracked.clear(); cracks = [];
    },
    step: (dt: number, floorY: number, W: number) => {
      for (const s of shards) {
        s.life += dt;
        s.vel[1] += 1700 * dt;
        s.pos[0] += s.vel[0] * dt; s.pos[1] += s.vel[1] * dt; s.pos[2] += s.vel[2] * dt;
        const a = s.w * dt;
        s.rel.forEach((r, i) => s.rel.set(i, rot3(r, s.axis, a)));
        s.nrm.forEach((r, i) => s.nrm.set(i, rot3(r, s.axis, a)));
        if (s.pos[1] + s.rad > floorY) { s.pos[1] = floorY - s.rad; if (s.vel[1] > 0) s.vel[1] *= -0.28; s.vel[0] *= 0.72; s.w *= 0.55; }
        if (s.pos[0] < -60 || s.pos[0] > W + 60) s.life = 9;
      }
      shards = shards.filter((s) => s.life < 2);
      for (const c of chips) { c.life += dt; c.vy += 1500 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.a += c.va * dt; if (c.y > floorY) { c.y = floorY; c.vy *= -0.25; c.vx *= 0.6; } }
      chips = chips.filter((c) => c.life < 1.4);
    },
    drawShards: (g: CanvasRenderingContext2D) => {
      const items: { z: number; pts: [number, number][]; col: string; al: number; rim: [number, number][][] | null }[] = [];
      for (const s of shards) {
        const al = s.life < 1.4 ? 1 : Math.max(0, 1 - (s.life - 1.4) / 0.6);
        let zs = 0;
        for (const fi of s.f) {
          const f = MESH3.facets[fi];
          const w = f.v.map((vi) => { const r = s.rel.get(vi)!; return [r[0] + s.pos[0], r[1] + s.pos[1], r[2] + s.pos[2]] as P3; });
          const n = s.nrm.get(fi)!, outside = n[2] > 0;
          const nv: P3 = outside ? n : [-n[0], -n[1], -n[2]];
          const col = shadeRGB(outside ? SKIN : FLESH, nv, outside ? 0.34 : 0.5, outside ? 0.78 : 0.55, outside ? 0.3 : 0.06, 0.4);
          const z = (w[0][2] + w[1][2] + w[2][2] + w[3][2]) / 4; zs += z;
          items.push({ z, pts: w.map((p) => [p[0], p[1]] as [number, number]), col, al, rim: null });
        }
        // the broken rim sits just in front of the shard's own facets
        const rimPts = s.rim.map(([a, b]) => { const ra = s.rel.get(a), rb = s.rel.get(b); return ra && rb ? ([[ra[0] + s.pos[0], ra[1] + s.pos[1]], [rb[0] + s.pos[0], rb[1] + s.pos[1]]] as [number, number][]) : null; }).filter(Boolean) as [number, number][][];
        items.push({ z: zs / Math.max(1, s.f.length) + 0.5, pts: [], col: "", al, rim: rimPts });
      }
      items.sort((a, b) => a.z - b.z);
      for (const it of items) {
        g.globalAlpha = it.al;
        if (it.rim) {
          g.lineCap = "round"; g.strokeStyle = "#e9a650"; g.lineWidth = 1.5;
          g.beginPath(); for (const [p, q] of it.rim) { g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); } g.stroke();
          continue;
        }
        g.beginPath(); g.moveTo(it.pts[0][0], it.pts[0][1]); for (let i = 1; i < 4; i++) g.lineTo(it.pts[i][0], it.pts[i][1]); g.closePath();
        g.fillStyle = it.col; g.fill(); g.strokeStyle = it.col; g.lineWidth = 0.7; g.stroke();
      }
      g.globalAlpha = 1;
      for (const c of chips) {
        g.save(); g.globalAlpha = c.life < 1 ? 1 : Math.max(0, (1.4 - c.life) / 0.4);
        g.translate(c.x, c.y); g.rotate(c.a); g.fillStyle = c.c;
        g.beginPath(); g.ellipse(0, 0, c.s, c.s * 0.55, 0, 0, Math.PI * 2); g.fill();
        g.restore();
      }
    },
  };
}
type Pumpkin = ReturnType<typeof createPumpkin>;

function twigPoly(x0: number, y0: number, ang: number, len: number, w: number, bend: number) {
  const a = (ang * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
  const pts: string[] = [], back: string[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6, hw = (w / 2) * (1 - t) + 0.25 * t, off = bend * Math.sin(t * Math.PI) * len * 0.12;
    const cx = x0 + ca * len * t + nx * off, cy = y0 + sa * len * t + ny * off;
    pts.push(`${(cx + nx * hw).toFixed(1)} ${(cy + ny * hw).toFixed(1)}`);
    back.unshift(`${(cx - nx * hw).toFixed(1)} ${(cy - ny * hw).toFixed(1)}`);
  }
  return `M${pts.join(" L")} L${back.join(" L")} Z`;
}


function Branch({ W, uid, gRef, leafRefs }: { W: number; uid: string; gRef: React.RefObject<SVGGElement | null>; leafRefs: React.MutableRefObject<(SVGGElement | null)[]> }) {
  const tip = W * 0.86, N = 90;
  const thick = (x: number) => {
    const t = clamp(x / tip, 0, 1);
    // knots: lumps where old twigs broke off
    const knot = [0.16, 0.41, 0.55].reduce((k, c) => k + Math.exp(-(((t - c) / 0.025) ** 2)) * 0.32, 0);
    return (17 - 14 * Math.pow(t, 0.75)) * (1 + knot);
  };
  const at = (f: number) => { const x = -14 + (tip + 14) * f; return { x, y: branchY(x, W), w: thick(x) }; };
  const pts = Array.from({ length: N + 1 }, (_, i) => at(i / N));
  const top = pts.map((p) => `${p.x.toFixed(1)} ${(p.y - p.w / 2).toFixed(1)}`);
  const bot = [...pts].reverse().map((p) => `${p.x.toFixed(1)} ${(p.y + p.w / 2).toFixed(1)}`);
  const body = `M${top.join(" L")} L${(tip + 10).toFixed(1)} ${(branchY(tip, W) - 3).toFixed(1)} L${bot.join(" L")} Z`;
  const rim = `M${pts.map((p) => `${p.x.toFixed(1)} ${(p.y - p.w / 2 + 1.1).toFixed(1)}`).join(" L")}`;
  const twigs: string[] = [];
  TWIGS.forEach((tw, i) => {
    const p = at(tw.f), side = Math.sin((tw.ang * Math.PI) / 180) < 0 ? -1 : 1;
    const x0 = p.x, y0 = p.y + (side * p.w) / 2.6;
    twigs.push(twigPoly(x0, y0, tw.ang, tw.len * 1.15, tw.w * 1.45, i % 2 ? 1 : -1));
    if (tw.fork) {
      const a = (tw.ang * Math.PI) / 180, fx = x0 + Math.cos(a) * tw.len * 0.55, fy = y0 + Math.sin(a) * tw.len * 0.55;
      twigs.push(twigPoly(fx, fy, tw.ang + tw.fork * 38, tw.len * 0.6, tw.w * 0.8, -tw.fork));
    }
  });
  const ax = W / 2, ay = branchY(ax, W), aw = thick(ax);
  const cracks = [0.06, 0.15, 0.24, 0.36, 0.47, 0.58].map((f, i) => {
    const p = at(f);
    return `M${p.x.toFixed(1)} ${(p.y - p.w * 0.2 + (i % 2) * 2.4).toFixed(1)} q${(7 + i * 2).toFixed(1)} ${(i % 2 ? -1.6 : 1.4).toFixed(1)} ${(15 + i * 3).toFixed(1)} ${(i % 2 ? 0.8 : -0.6).toFixed(1)}`;
  });
  // a cobweb strung in the crook of the twig at 0.62
  const wb = at(0.62), web = { x: wb.x + 2, y: wb.y - wb.w / 2 + 1 };
  const spokes = [-46, -34, -22, -10].map((d) => ({ a: (d * Math.PI) / 180, l: 27 - Math.abs(d + 28) * 0.15 }));
  const pt = (a: number, r: number) => `${(web.x + Math.cos(a) * r).toFixed(1)} ${(web.y + Math.sin(a) * r).toFixed(1)}`;
  const ring = (r: number) => "M" + spokes.map((sp, i) => (i ? `Q${pt((sp.a + spokes[i - 1].a) / 2, r * 0.86)} ${pt(sp.a, r * (sp.l / 27))}` : pt(sp.a, r * (sp.l / 27)))).join(" ");
  return (
    <svg className="pointer-events-none absolute left-0 z-[11] overflow-visible" style={{ top: ANCHOR_Y - 80 }} width={W} height={150} viewBox={`0 ${ANCHOR_Y - 80} ${W} 150`} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}bark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3d52" />
          <stop offset=".4" stopColor="#241b2a" />
          <stop offset="1" stopColor="#0d0910" />
        </linearGradient>
        <linearGradient id={`${uid}rope`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a7350" />
          <stop offset=".5" stopColor="#c9ad80" />
          <stop offset="1" stopColor="#8a7350" />
        </linearGradient>
      </defs>
      <g ref={gRef}>
        {twigs.map((d, i) => <path key={i} d={d} fill={`url(#${uid}bark)`} />)}
        <path d={body} fill={`url(#${uid}bark)`} />
        {/* cold moonlight along the top */}
        <path d={rim} fill="none" stroke="rgba(200,205,255,.32)" strokeWidth="1.1" strokeLinecap="round" />
        {cracks.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth=".9" strokeLinecap="round" />)}
        <g fill="none" stroke="rgba(225,225,245,.3)" strokeWidth=".55">
          {spokes.map((sp, i) => <path key={i} d={`M${web.x} ${web.y} L${(web.x + Math.cos(sp.a) * sp.l).toFixed(1)} ${(web.y + Math.sin(sp.a) * sp.l).toFixed(1)}`} />)}
          {[9, 16, 23].map((r) => <path key={r} d={ring(r)} />)}
        </g>
        {/* the rope wrapped twice over the branch, tied off underneath */}
        {[-4, 1].map((dx, i) => (
          <path key={i} d={`M${ax + dx - 1.5} ${ay - aw / 2 - 1} L${ax + dx + 3.5} ${ay + aw / 2 + 1}`} stroke={`url(#${uid}rope)`} strokeWidth="2.6" strokeLinecap="round" />
        ))}
        <ellipse cx={ax} cy={ay + aw / 2 + 2} rx="3.2" ry="2.4" fill="#a88d63" stroke="rgba(0,0,0,.45)" strokeWidth=".6" />
        {LEAVES.map((l, i) => {
          const p = at(l.f);
          return (
            <g key={i} transform={`translate(${p.x.toFixed(1)} ${(p.y + p.w / 2 - 1).toFixed(1)})`}>
              <g ref={(el) => { leafRefs.current[i] = el; }} transform={`rotate(${l.a})`}>
                {i === 0 ? (
                  <g>
                    <path d="M0 0 L0 44" stroke="rgba(230,230,250,.55)" strokeWidth=".7" />
                    <g transform="translate(0 50)">
                      <g stroke="#0b080d" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        {[-1, 1].map((sd) => [0, 1, 2, 3].map((k) => (
                          <path key={`${sd}${k}`} d={`M${sd * 2} ${-2 + k * 1.6} l${sd * (6 + k)} ${-5 + k * 2.6} l${sd * (3 + k * 0.5)} ${5 + k * 1.2}`} />
                        )))}
                      </g>
                      <ellipse cx="0" cy="-5" rx="3.4" ry="3.6" fill="#120d15" />
                      <ellipse cx="0" cy="2.5" rx="5.2" ry="6.2" fill="#120d15" />
                      <ellipse cx="-1.6" cy="0" rx="1.6" ry="2.4" fill="rgba(255,255,255,.12)" />
                      <circle cx="-1.3" cy="-5.6" r=".8" fill="#ff3b30" />
                      <circle cx="1.3" cy="-5.6" r=".8" fill="#ff3b30" />
                    </g>
                  </g>
                ) : (
                  <g transform={`scale(${l.s})`}>
                    <path d="M0 0 L3 0" stroke="#3b2a1e" strokeWidth="1" strokeLinecap="round" />
                    <path d="M2.5 0 C7 -6 12 -3 15 -6 C17 -1 22 -3 24 0 C21 3 18 1 15 5 C12 2 7 6 2.5 0 Z" fill="#5b3b22" />
                    <path d="M3 0 Q13 -0.6 23 0" fill="none" stroke="rgba(0,0,0,.4)" strokeWidth=".6" />
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Spooky sounds, synthesised with the Web Audio API (no files). Off until the
// viewer turns them on; browsers only allow audio after a gesture anyway.
function createSpook() {
  let ctx: AudioContext | null = null, master: GainNode | null = null, nb: AudioBuffer | null = null;
  let amb: { stop: () => void; duck: (on: boolean) => void } | null = null;
  let musicUrl: string | null = null, music: AudioBuffer | null = null, loading: Promise<void> | null = null;
  let mSrc: AudioBufferSourceNode | null = null, mGain: GainNode | null = null, an: AnalyserNode | null = null;
  const lvl = new Uint8Array(256);
  const ok = () => !!ctx && !!master && !!nb && ctx.state === "running";
  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
      nb = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = nb.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return true;
  };
  // iOS plays Web Audio on the "ambient" channel, which the ringer switch mutes. A playing media element,
  // or the audio session type where Safari supports it, moves the page to the playback channel.
  let keep: HTMLAudioElement | null = null;
  const keepMedia = () => {
    try {
      const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
      if (session) session.type = "playback";
    } catch { /* ignore */ }
    if (keep) { void keep.play().catch(() => {}); return; }
    try {
      const n = 4410, u8 = new Uint8Array(44 + n * 2), dv = new DataView(u8.buffer);
      const w = (o: number, t: string) => { for (let i = 0; i < t.length; i++) dv.setUint8(o + i, t.charCodeAt(i)); };
      w(0, "RIFF"); dv.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, 44100, true); dv.setUint32(28, 88200, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); w(36, "data"); dv.setUint32(40, n * 2, true);
      let bin = ""; for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
      keep = new Audio("data:audio/wav;base64," + btoa(bin));
      keep.loop = true; keep.volume = 0.01; keep.setAttribute("playsinline", "");
      void keep.play().catch(() => {});
    } catch { keep = null; }
  };
  const releaseMedia = () => { try { keep?.pause(); } catch { /* ignore */ } };
  const env = (g: GainNode, t: number, a: number, peak: number, d: number) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  };
  const noise = (t: number, dur: number, type: BiquadFilterType, freq: number, q: number, peak: number, a = 0.004) => {
    const c = ctx!, src = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    src.buffer = nb; fl.type = type; fl.frequency.value = freq; fl.Q.value = q; env(g, t, a, peak, dur);
    src.connect(fl).connect(g).connect(master!);
    src.start(t, Math.random() * 1.2, a + dur + 0.05);
  };
  const tone = (t: number, type: OscillatorType, f0: number, f1: number, dur: number, peak: number, a = 0.01) => {
    const c = ctx!, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + a + dur);
    env(g, t, a, peak, dur); o.connect(g).connect(master!);
    o.start(t); o.stop(t + a + dur + 0.05);
  };
  const creak = (t: number, peak = 0.05) => {
    const c = ctx!, o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    o.type = "sawtooth"; o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(92, t + 0.55);
    lfo.frequency.value = 23; lg.gain.value = 9; lfo.connect(lg).connect(o.frequency);
    fl.type = "bandpass"; fl.frequency.value = 760; fl.Q.value = 7;
    env(g, t, 0.06, peak, 0.5); o.connect(fl).connect(g).connect(master!);
    o.start(t); lfo.start(t); o.stop(t + 0.65); lfo.stop(t + 0.65);
  };
  const hoot = () => {
    if (!ok()) return;
    const t = ctx!.currentTime;
    // an owl, in the track's key (G down to E flat)
    tone(t, "sine", 392, 370, 0.32, 0.07, 0.06);
    tone(t + 0.5, "sine", 330, 311, 0.5, 0.06, 0.08);
  };
  const ambient = () => {
    const c = ctx!, t = c.currentTime, stops: (() => void)[] = [];
    // wind: looping noise through a wandering band-pass, with gusts
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), wg = c.createGain();
    src.buffer = nb; src.loop = true; bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 0.8; wg.gain.value = 0.0001;
    wg.gain.exponentialRampToValueAtTime(0.07, t + 1.2);
    const l1 = c.createOscillator(), g1 = c.createGain(); l1.frequency.value = 0.11; g1.gain.value = 330; l1.connect(g1).connect(bp.frequency);
    const l2 = c.createOscillator(), g2 = c.createGain(); l2.frequency.value = 0.07; g2.gain.value = 0.025; l2.connect(g2).connect(wg.gain);
    src.connect(bp).connect(wg).connect(master!);
    // a low drone a tritone apart, breathing slowly
    const dg = c.createGain(); dg.gain.value = 0.0001; dg.gain.exponentialRampToValueAtTime(0.022, t + 3);
    const d1 = c.createOscillator(), d2 = c.createOscillator(); d1.frequency.value = 65.41; d2.frequency.value = 98; d2.type = "triangle"; // C2 and G2, under the track
    const l3 = c.createOscillator(), g3 = c.createGain(); l3.frequency.value = 0.18; g3.gain.value = 0.01; l3.connect(g3).connect(dg.gain);
    d1.connect(dg); d2.connect(dg); dg.connect(master!);
    [src, l1, l2, d1, d2, l3].forEach((n) => { n.start(t); stops.push(() => { try { n.stop(); } catch { /* already stopped */ } }); });
    const iv = window.setInterval(hoot, 11000);
    window.setTimeout(hoot, 2500);
    // while the music plays, the wind and drone step back
    const duck = (on: boolean) => {
      const n = c.currentTime;
      wg.gain.cancelScheduledValues(n); wg.gain.setTargetAtTime(on ? 0.015 : 0.07, n, 0.25);
      dg.gain.cancelScheduledValues(n); dg.gain.setTargetAtTime(on ? 0.004 : 0.022, n, 0.25);
    };
    return { stop: () => { window.clearInterval(iv); stops.forEach((f) => f()); }, duck };
  };
  // Pages that embed the track as a data: URL often forbid fetching it (CSP connect-src),
  // so decode those by hand. If decoding fails, fall back to an <audio> element.
  let mediaEl: HTMLAudioElement | null = null, mediaNode: MediaElementAudioSourceNode | null = null;
  const bytes = async (url: string) => {
    if (url.startsWith("data:")) {
      const comma = url.indexOf(","), meta = url.slice(5, comma), body = url.slice(comma + 1);
      const bin = meta.includes(";base64") ? atob(body) : decodeURIComponent(body);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      return u8.buffer;
    }
    return (await fetch(url)).arrayBuffer();
  };
  const loadMusic = () => {
    if (!ctx || !musicUrl || music || mediaEl || loading) return loading;
    const c = ctx, url = musicUrl;
    loading = bytes(url)
      .then((b) => c.decodeAudioData(b))
      .then((buf) => { music = buf; })
      .catch(() => {
        try {
          mediaEl = new Audio(url);
          mediaEl.preload = "auto";
          mediaNode = c.createMediaElementSource(mediaEl);
        } catch { mediaEl = null; }
      })
      .finally(() => { loading = null; });
    return loading;
  };
  const stopMusic = (fade = 0.35) => {
    if (!mSrc || !mGain || !ctx) return;
    const s0 = mSrc, g = mGain, t = ctx.currentTime;
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0.0001, t + fade);
    if (mediaEl && !(s0 instanceof AudioBufferSourceNode)) { const el = mediaEl; window.setTimeout(() => el.pause(), (fade + 0.05) * 1000); }
    else { try { s0.stop(t + fade + 0.05); } catch { /* already stopped */ } }
    mSrc = null; mGain = null;
    amb?.duck(false);
  };
  return {
    setMusic: (url: string | undefined) => { musicUrl = url ?? null; },
    hasMusic: () => !!music || !!mediaEl || !!musicUrl,
    /** Play the track from `offset` seconds; returns false when there is no track to play. */
    playMusic: (offset: number, onEnd?: () => void) => {
      if (!ok() || !musicUrl) return false;
      const c = ctx!;
      if (!an) { an = c.createAnalyser(); an.fftSize = 512; an.connect(master!); }
      const asked = c.currentTime;
      const startBuffer = (late: number) => {
        stopMusic(0.05);
        const src = c.createBufferSource(), g = c.createGain();
        src.buffer = music; g.gain.value = 0.9;
        src.connect(g).connect(an!);
        src.onended = () => { if (mSrc === src) { mSrc = null; mGain = null; amb?.duck(false); } onEnd?.(); };
        src.start(c.currentTime, offset + late);
        mSrc = src; mGain = g;
        amb?.duck(true);
      };
      const startMedia = (late: number) => {
        if (!mediaEl || !mediaNode) return;
        stopMusic(0.05);
        const g = c.createGain(); g.gain.value = 0.9;
        try { mediaNode.disconnect(); } catch { /* not connected */ }
        mediaNode.connect(g).connect(an!);
        mediaEl.currentTime = offset + late;
        const el = mediaEl;
        el.onended = () => { mSrc = null; mGain = null; amb?.duck(false); onEnd?.(); };
        void el.play().catch(() => {});
        // stopMusic fades this gain; keep a stub source so it knows something is playing
        mSrc = { stop: () => { el.pause(); }, onended: null } as unknown as AudioBufferSourceNode; mGain = g;
        amb?.duck(true);
      };
      if (music) { startBuffer(0); return true; }
      if (mediaEl) { startMedia(0); return true; }
      // still decoding: start as soon as it is ready, skipping ahead so it stays in sync
      void loadMusic()?.then(() => {
        const late = c.currentTime - asked;
        if (late > 2.5) return;
        if (music) startBuffer(late); else if (mediaEl) startMedia(late);
      });
      return true;
    },
    stopMusic,
    /** Loudness of the music right now, 0..1 */
    level: () => {
      if (!an || !mSrc) return 0;
      an.getByteTimeDomainData(lvl);
      let sum = 0;
      for (let i = 0; i < lvl.length; i++) { const v = (lvl[i] - 128) / 128; sum += v * v; }
      return Math.min(1, Math.sqrt(sum / lvl.length) * 3.2);
    },
    /**
     * Phones only let audio start from inside a tap. Call this synchronously from the tap handler that
     * turns the sound on: it creates and resumes the context there, and asks iOS to treat the page as
     * media so the ringer switch does not mute it.
     */
    unlock: () => {
      if (!ensure() || !ctx) return;
      void ctx.resume();
      try { const b = ctx.createBuffer(1, 1, ctx.sampleRate), n = ctx.createBufferSource(); n.buffer = b; n.connect(ctx.destination); n.start(0); } catch { /* ignore */ }
      keepMedia();
    },
    /** Called on every tap while the sound is on: phones suspend or interrupt the context when the page is backgrounded. */
    nudge: () => { if (ctx && ctx.state !== "running" && ctx.state !== "closed") void ctx.resume(); },
    on: async () => {
      if (!ensure() || !ctx) return;
      keepMedia();
      await ctx.resume();
      if (!amb) { amb = ambient(); hoot(); }
      void loadMusic();
    },
    off: () => { stopMusic(0.05); amb?.stop(); amb = null; releaseMedia(); void ctx?.suspend(); },
    hit: (n: number) => {
      if (!ok()) return;
      const t = ctx!.currentTime;
      tone(t, "sine", 120, 42, 0.28, 0.55, 0.004);
      noise(t, 0.14, "lowpass", 900, 0.7, 0.3);
      creak(t + 0.05, 0.045);
      if (n > 0) { noise(t + 0.01, 0.07, "highpass", 2600, 0.8, 0.32); tone(t + 0.01, "square", 1900, 500, 0.05, 0.025, 0.002); }
    },
    burst: (withMusic: boolean) => {
      if (!ok()) return;
      const c = ctx!, t = c.currentTime;
      noise(t, 0.4, "lowpass", 1400, 0.6, withMusic ? 0.35 : 0.75);
      tone(t, "sine", 85, 28, 0.6, withMusic ? 0.35 : 0.7, 0.003);
      if (withMusic) return;
      // the ghost's wail: a sliding voice with vibrato, doubled slightly out of tune
      [0, 7].forEach((cents, i) => {
        const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter(), v = c.createOscillator(), vg = c.createGain();
        o.type = i ? "triangle" : "sine"; o.detune.value = cents;
        const t0 = t + 0.15;
        o.frequency.setValueAtTime(260, t0); o.frequency.exponentialRampToValueAtTime(640, t0 + 0.55); o.frequency.exponentialRampToValueAtTime(230, t0 + 1.7);
        v.frequency.value = 6.2; vg.gain.value = 16; v.connect(vg).connect(o.frequency);
        fl.type = "lowpass"; fl.frequency.value = 1800;
        env(g, t0, 0.28, i ? 0.045 : 0.12, 1.45);
        o.connect(fl).connect(g).connect(master!);
        o.start(t0); v.start(t0); o.stop(t0 + 1.9); v.stop(t0 + 1.9);
      });
    },
    chime: () => {
      if (!ok()) return;
      const t = ctx!.currentTime;
      // C minor bell: C5, G5, E flat 6
      tone(t, "sine", 523.3, 521, 1.6, 0.1, 0.005);
      tone(t, "sine", 784, 781, 1.4, 0.06, 0.005);
      tone(t + 0.02, "sine", 1244.5, 1240, 1.1, 0.025, 0.005);
    },
    chatter: () => {
      if (!ok()) return;
      const t = ctx!.currentTime;
      for (let i = 0; i < 9; i++) noise(t + i * 0.055, 0.018, "bandpass", 2300 + (i % 2) * 500, 3, 0.11, 0.002);
    },
    lower: () => {
      if (!ok()) return;
      const t = ctx!.currentTime;
      creak(t, 0.06);
      noise(t, 0.5, "bandpass", 600, 1.2, 0.05, 0.08);
    },
    pop: () => {
      if (!ok()) return;
      const t = ctx!.currentTime;
      for (let i = 0; i < 5; i++) noise(t + i * 0.03, 0.03, "highpass", 3200, 0.7, 0.12, 0.002);
      tone(t + 0.12, "sine", 320, 980, 0.14, 0.18, 0.005);
    },
    /**
     * What comes out of the pumpkin, in time with the picture: the ghosts' "whooo", squeaks and
     * wingbeats as the bats break out, and dry little scuttles as the spiders run.
     */
    horde: (withMusic: boolean) => {
      if (!ok()) return;
      const c = ctx!, t = c.currentTime, v = withMusic ? 0.6 : 1, R = Math.random;
      // ghosts: soft, wobbling "whooo"s, one for each as it flies out
      [0.1, 0.32, 0.55, 0.8].forEach((at, i) => {
        const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
        const f0 = [330, 392, 294, 440][i], t0 = t + at;
        o.type = "sine";
        o.frequency.setValueAtTime(f0 * 0.8, t0); o.frequency.exponentialRampToValueAtTime(f0 * 1.35, t0 + 0.35); o.frequency.exponentialRampToValueAtTime(f0 * 0.9, t0 + 1.1);
        lfo.frequency.value = 5.5; lg.gain.value = f0 * 0.035; lfo.connect(lg).connect(o.frequency);
        fl.type = "lowpass"; fl.frequency.value = 1400;
        env(g, t0, 0.18, 0.07 * v, 0.95);
        o.connect(fl).connect(g).connect(master!);
        o.start(t0); lfo.start(t0); o.stop(t0 + 1.25); lfo.stop(t0 + 1.25);
        noise(t0, 0.9, "bandpass", 900, 0.6, 0.018 * v, 0.2);
      });
      // bats
      for (let i = 0; i < 9; i++) {
        const at = t + 0.12 + R() * 1.1;
        tone(at, "sine", 6400 + R() * 1600, 4300, 0.035, 0.035 * v, 0.003);
        noise(at, 0.05, "lowpass", 700, 0.7, 0.05 * v, 0.005);
      }
      // spiders: bursts of dry little clicks, like legs on glass
      [0.32, 0.95, 1.6, 2.35].forEach((at) => {
        for (let i = 0; i < 16; i++) noise(t + at + i * 0.011 + R() * 0.004, 0.005, "bandpass", 2800 + R() * 2600, 5, (0.045 + R() * 0.04) * v, 0.001);
      });
    },
    dispose: () => { stopMusic(0.02); amb?.stop(); amb = null; releaseMedia(); void ctx?.close(); ctx = null; },
  };
}
type Spook = ReturnType<typeof createSpook>;

/*
 * A sheet ghost: a white sheet thrown over something, gauzy at the hem, with a face cut out of black felt.
 * Faces: 0 an angry glare and a jagged grin, 1 wide eyes and an O mouth, 2 sad slanted eyes and a little
 * pointed mouth.
 */
function SheetGhost({ uid, w, face, dirt = false }: { uid: string; w: number; face: number; dirt?: boolean }) {
  return (
    <svg width={w} height={w * 1.44} viewBox="-32 -40 64 92" aria-hidden="true" className="overflow-visible" style={{ filter: "drop-shadow(0 8px 10px rgba(0,0,0,.4))" }}>
      <defs>
        <linearGradient id={`${uid}sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".98" />
          <stop offset=".5" stopColor="#f2f3f7" stopOpacity=".92" />
          <stop offset=".82" stopColor="#e4e6ee" stopOpacity=".72" />
          <stop offset="1" stopColor="#dde0e9" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id={`${uid}fold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa0b4" stopOpacity="0" />
          <stop offset=".5" stopColor="#9aa0b4" stopOpacity=".4" />
          <stop offset="1" stopColor="#9aa0b4" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}gl`} cx="50%" cy="45%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}dt`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#7a5c3e" stopOpacity=".42" />
          <stop offset="1" stopColor="#7a5c3e" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* a faint glow, so it reads against the night */}
      <ellipse cx="0" cy="2" rx="36" ry="46" fill={`url(#${uid}gl)`} />
      {/* the gauzy layer that hangs lowest */}
      <path d="M-26 30 L-27 46 L-22 41 L-18 51 L-13 44 L-8 53 L-3 45 L2 54 L7 45 L12 53 L17 44 L22 50 L26 42 L28 30 Z" fill="#ffffff" opacity=".22" />
      {/* the sheet */}
      <path
        d="M0 -39 C10.5 -39 17 -31 17.5 -20 C18 -10 20 2 24 14 C27 24 29 34 28 44 L24 40 L21 48 L16 42 L12 50 L7 43 L2 50 L-3 43 L-8 50 L-12 42 L-17 49 L-21 41 L-25 46 L-27 40 C-29 30 -26 20 -23 12 C-19 1 -18 -10 -17.5 -20 C-17 -31 -10.5 -39 0 -39 Z"
        fill={`url(#${uid}sh)`}
      />
      {/* folds where the sheet drapes */}
      <g fill="none" strokeLinecap="round">
        {["M-6 -4 C-8 12 -10 27 -12 42", "M5 -2 C7 13 10 27 12 45", "M-14 6 C-18 19 -20 30 -22 40", "M15 7 C19 19 22 30 23 40", "M0 4 C0 19 1 32 2 47"].map((d, i) => (
          <path key={i} d={d} stroke="rgba(150,156,175,.38)" strokeWidth={i === 4 ? 1 : 1.5} />
        ))}
        {["M-3.5 -2 C-5 13 -6.5 27 -8 42", "M8 0 C10 14 13 27 15 42"].map((d, i) => <path key={`h${i}`} d={d} stroke="#ffffff" strokeWidth="1.2" opacity=".7" />)}
      </g>
      <path d="M-11 -33 Q-4 -38 4 -36.5" stroke="#ffffff" strokeWidth="2" fill="none" opacity=".8" strokeLinecap="round" />
      {dirt && <ellipse cx="-9" cy="36" rx="17" ry="11" fill={`url(#${uid}dt)`} />}
      {/* the face */}
      <g fill="#141414">
        {face === 0 && (
          <>
            <path d="M-11.5 -28 L-3.2 -23.6 C-3.4 -20 -6.5 -18.6 -9 -20.2 C-10.8 -21.6 -11.6 -24.4 -11.5 -28 Z" />
            <path d="M11.5 -28 L3.2 -23.6 C3.4 -20 6.5 -18.6 9 -20.2 C10.8 -21.6 11.6 -24.4 11.5 -28 Z" />
            <path d="M-9.5 -14 L-6.6 -11.6 L-4.4 -13.6 L-2.2 -11.4 L0 -13.6 L2.2 -11.4 L4.4 -13.6 L6.6 -11.6 L9.5 -14 C8.6 -7.6 4.6 -4.6 0 -4.6 C-4.6 -4.6 -8.6 -7.6 -9.5 -14 Z" />
          </>
        )}
        {face === 1 && (
          <>
            <ellipse cx="-5.8" cy="-25" rx="3.5" ry="4.4" />
            <ellipse cx="5.8" cy="-25" rx="3.5" ry="4.4" />
            <ellipse cx="0" cy="-12" rx="4" ry="5.4" />
          </>
        )}
        {face === 2 && (
          <>
            <ellipse cx="-5.6" cy="-24" rx="2.9" ry="4.2" transform="rotate(24 -5.6 -24)" />
            <ellipse cx="5.6" cy="-24" rx="2.9" ry="4.2" transform="rotate(-24 5.6 -24)" />
            <path d="M0 -17.4 L4.2 -9.4 C1.6 -10.4 -1.6 -10.4 -4.2 -9.4 Z" />
          </>
        )}
      </g>
    </svg>
  );
}

/** Sheet ghosts that pop out of the pumpkin and then keep flying round the night until it is rehung. */
type FlockGhost = { ax: number; ay: number; dx: number[]; dy: number[]; rot: number[]; w: number; face: number; dirt: boolean; dur: number; delay: number };
function GhostFlock({ uid, plan }: { uid: string; plan: HordePlan }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[13]" aria-hidden="true">
      {plan.ghosts.map((g, i) => (
        <motion.div
          key={i}
          className="absolute left-0 top-0"
          style={{ marginLeft: -g.w / 2, marginTop: -g.w * 0.72 }}
          initial={{ x: plan.x, y: plan.y, scale: 0.2, opacity: 0 }}
          animate={{ x: g.ax, y: g.ay, scale: 1, opacity: 1 }}
          transition={{ duration: 0.85, delay: g.delay, ease: [0.2, 0.8, 0.3, 1] }}
        >
          <motion.div animate={{ x: g.dx, y: g.dy, rotate: g.rot }} transition={{ duration: g.dur, delay: g.delay + 0.85, repeat: Infinity, ease: "easeInOut" }}>
            <motion.div style={{ originY: 0 }} animate={{ y: [0, -6, 0], skewX: [0, 4, -3, 0], scaleY: [1, 1.04, 0.97, 1] }} transition={{ duration: 1.5 + i * 0.25, repeat: Infinity, ease: "easeInOut" }}>
              <SheetGhost uid={`${uid}g${i}`} w={g.w} face={g.face} dirt={g.dirt} />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// a spider seen from above; legs: angle from straight ahead, on the right side (left is mirrored)
const LEG_ANG = [36, 70, 108, 144];
const v2 = (side: number, a: number, l: number) => [side * Math.sin((a * Math.PI) / 180) * l, -Math.cos((a * Math.PI) / 180) * l];
const SPIDER_LEGS = [-1, 1].flatMap((side) =>
  LEG_ANG.map((a, k) => {
    const bx = side * 2.4, by = -4.6 + k * 1.6;
    const [kx, ky] = v2(side, a, 10.5);
    const a2 = a + (k < 2 ? -30 : 30);
    const [tx, ty] = v2(side, a2, 13.5);
    const f = (n: number) => n.toFixed(2);
    return { side, k, group: (k + (side > 0 ? 0 : 1)) % 2, bx, by, knee: [f(bx + kx), f(by + ky)], tip: [f(bx + kx + tx), f(by + ky + ty)] };
  }),
);
/** A black widow: glossy abdomen with a red hourglass, eight jointed legs that scuttle, and a cluster of red eyes. */
function Spider({ uid, size, gait }: { uid: string; size: number; gait: number }) {
  return (
    <svg width={64 * size} height={64 * size} viewBox="-32 -32 64 64" aria-hidden="true" className="overflow-visible" style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,.55))" }}>
      <defs>
        <radialGradient id={`${uid}ab`} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#4a3a32" />
          <stop offset=".45" stopColor="#1a1210" />
          <stop offset="1" stopColor="#060404" />
        </radialGradient>
      </defs>
      {SPIDER_LEGS.map((l, i) => (
        <g key={i}>
          <animateTransform
            attributeName="transform"
            type="rotate"
            values={`${-9 * l.side} ${l.bx} ${l.by};${9 * l.side} ${l.bx} ${l.by};${-9 * l.side} ${l.bx} ${l.by}`}
            dur={`${gait}s`}
            begin={l.group ? `-${(gait / 2).toFixed(3)}s` : "0s"}
            repeatCount="indefinite"
          />
          <path d={`M${l.bx} ${l.by} L${l.knee[0]} ${l.knee[1]}`} stroke="#120c0a" strokeWidth="2.1" strokeLinecap="round" />
          <path d={`M${l.knee[0]} ${l.knee[1]} L${l.tip[0]} ${l.tip[1]}`} stroke="#120c0a" strokeWidth="1.25" strokeLinecap="round" />
          {/* moonlight catching the top of each leg, so it reads against the dark */}
          <path d={`M${l.bx} ${l.by} L${l.knee[0]} ${l.knee[1]} L${l.tip[0]} ${l.tip[1]}`} stroke="rgba(190,170,215,.42)" strokeWidth=".55" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={l.knee[0]} cy={l.knee[1]} r="1.15" fill="#1c1411" />
        </g>
      ))}
      {/* fangs and feelers */}
      <path d="M-1.6 -8.6 q-1 2.4 .5 3.2 M1.6 -8.6 q1 2.4 -.5 3.2" stroke="#0a0606" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M-1.4 -8 L-3.6 -11.6 M1.4 -8 L3.6 -11.6" stroke="#120c0a" strokeWidth="1" strokeLinecap="round" />
      <ellipse cx="0" cy="-3.2" rx="5" ry="5.4" fill={`url(#${uid}ab)`} stroke="rgba(190,170,215,.35)" strokeWidth=".6" />
      <ellipse cx="0" cy="8.6" rx="7.4" ry="9.2" fill={`url(#${uid}ab)`} stroke="rgba(190,170,215,.35)" strokeWidth=".6" />
      <ellipse cx="-2.3" cy="4.6" rx="2.2" ry="3.2" fill="#fff" opacity=".16" />
      <path d="M-2.3 6.4 L2.3 6.4 L0 9.3 Z M-2.3 12.6 L2.3 12.6 L0 9.7 Z" fill="#d11a1a" />
      {[[-1.15, -7.4, 0.95], [1.15, -7.4, 0.95], [-2.7, -6.7, 0.65], [2.7, -6.7, 0.65], [-0.6, -5.9, 0.5], [0.6, -5.9, 0.5]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill="#ff2214" />
          <circle cx={x - 0.25} cy={y - 0.25} r={r * 0.35} fill="#fff" opacity=".6" />
        </g>
      ))}
    </svg>
  );
}

/** A bat with a leathery wing membrane and two red eyes; its wings beat while it flies. */
function Bat({ w }: { w: number }) {
  return (
    <svg width={w} height={w * 0.55} viewBox="-11 -6 22 12" aria-hidden="true" className="overflow-visible">
      <motion.path
        d="M0 1 C-2 -1 -4 -4 -11 -3 C-8 -1 -8 1 -9 3 C-6 1 -4 2 -3 4 C-2 2 -1 2 0 3 C1 2 2 2 3 4 C4 2 6 1 9 3 C8 1 8 -1 11 -3 C4 -4 2 -1 0 1 Z"
        fill="#07050a"
        animate={{ scaleY: [1, 0.3, 1] }}
        transition={{ duration: 0.16, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="-0.7" cy="0.2" r=".45" fill="#ff3b30" />
      <circle cx="0.7" cy="0.2" r=".45" fill="#ff3b30" />
    </svg>
  );
}

/** Everything that comes out of the pumpkin when it bursts. Paths are rolled when it bursts, so render stays pure. */
type HordePlan = {
  k: number; x: number; y: number;
  spiders: { xs: number[]; ys: number[]; rot: number[]; size: number; gait: number; dur: number; delay: number }[];
  bats: { xs: number[]; ys: number[]; w: number; dur: number; delay: number }[];
  hang: { x: number; y: number; len: number };
  ghosts: FlockGhost[];
};
const unwrap = (prev: number, next: number) => prev + ((((next - prev + 180) % 360) + 360) % 360) - 180;
function planHorde(k: number, x: number, y: number, W: number, H: number): HordePlan {
  const R = Math.random;
  const spiders = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + (R() - 0.5) * 0.8;
    const p1 = [x + Math.cos(a) * (40 + R() * 40), y + Math.sin(a) * (40 + R() * 40) + 30];
    const b = a + (R() - 0.5) * 1.3;
    const p2 = [p1[0] + Math.cos(b) * (60 + R() * 70), p1[1] + Math.sin(b) * (60 + R() * 70)];
    const c = b + (R() - 0.5) * 0.9, far = Math.max(W, H);
    const p3 = [p2[0] + Math.cos(c) * far, p2[1] + Math.sin(c) * far];
    const hd = (p: number[], q: number[]) => (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI + 90;
    const h1 = hd([x, y], p1), h2 = unwrap(h1, hd(p1, p2)), h3 = unwrap(h2, hd(p2, p3));
    return { xs: [x, p1[0], p1[0], p2[0], p2[0], p3[0]], ys: [y, p1[1], p1[1], p2[1], p2[1], p3[1]], rot: [h1, h1, h2, h2, h3, h3], size: 0.95 + R() * 0.5, gait: 0.13 + R() * 0.06, dur: 2.6 + R() * 0.9, delay: 0.12 + i * 0.07 + R() * 0.2 };
  });
  const bats = Array.from({ length: 8 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 7 - 0.5) * Math.PI * 1.5 + (R() - 0.5) * 0.3;
    const d = 200 + R() * 160;
    return { xs: [x, x + Math.cos(a) * d * 0.45 + (R() - 0.5) * 40, x + Math.cos(a) * d * 1.6], ys: [y, y + Math.sin(a) * d * 0.4 - 20, y + Math.sin(a) * d * 1.4 - 60], w: 30 + R() * 18, dur: 1.1 + R() * 0.6, delay: 0.04 + R() * 0.35 };
  });
  // ghosts: each flies out to a spot of its own, then loops round three more and back
  const spot = () => [40 + R() * (W - 80), 96 + R() * (H * 0.62 - 96)];
  const ghosts = Array.from({ length: 4 }, (_, i) => {
    const [ax, ay] = spot();
    const pts = [spot(), spot(), spot()];
    const dx = [0, ...pts.map((p) => p[0] - ax), 0], dy = [0, ...pts.map((p) => p[1] - ay), 0];
    // lean into the way it is flying
    const rot = dx.map((v, j) => clamp(((dx[(j + 1) % dx.length] - v) * 0.09), -14, 14));
    return { ax, ay, dx, dy, rot, w: 46 + R() * 16, face: [0, 1, 2, 1][i], dirt: i % 2 === 0, dur: 7 + R() * 3, delay: 0.08 + i * 0.16 };
  });
  const hx = W / 2 + 40;
  return { k, x, y, spiders, bats, hang: { x: hx, y: branchY(hx, W) + 3, len: 96 + R() * 24 }, ghosts };
}
function Horde({ uid, plan }: { uid: string; plan: HordePlan }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[16]" aria-hidden="true">
      {/* a flash of cold spirit light, and smoke rolling out */}
      <motion.div className="absolute rounded-full" style={{ left: plan.x - 90, top: plan.y - 90, width: 180, height: 180, background: "radial-gradient(closest-side, rgba(225,255,235,.95), rgba(150,255,190,.35) 45%, transparent)" }} initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: [0.2, 2.6, 3.2], opacity: [0, 1, 0] }} transition={{ duration: 0.7, ease: "easeOut" }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div key={i} className="absolute rounded-full" style={{ left: plan.x - 60, top: plan.y - 60, width: 120, height: 120, background: "radial-gradient(closest-side, rgba(28,16,38,.7), rgba(28,16,38,.25) 60%, transparent)" }} initial={{ scale: 0.3, opacity: 0, x: 0, y: 0 }} animate={{ scale: [0.3, 1.6 + i * 0.2, 2.4], opacity: [0, 0.85, 0], x: [0, (i - 2) * 38, (i - 2) * 70], y: [0, -30 - i * 8, -110 - i * 16] }} transition={{ duration: 2.6, delay: 0.05 + i * 0.08, ease: "easeOut" }} />
      ))}
      {/* the spider that drops on a thread from the branch and stays there */}
      <div className="absolute" style={{ left: plan.hang.x, top: plan.hang.y }}>
        <motion.div style={{ originX: 0, originY: 0 }} animate={{ rotate: [-3, 3.5, -3] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}>
          <motion.div className="absolute left-[-0.5px] top-0 w-px bg-[rgba(235,235,255,.55)]" initial={{ height: 0 }} animate={{ height: [0, plan.hang.len + 14, plan.hang.len - 6, plan.hang.len] }} transition={{ duration: 1.3, delay: 0.5, times: [0, 0.55, 0.8, 1], ease: "easeOut" }} />
          <motion.div className="absolute" style={{ left: -32 * 1.15, top: -32 * 1.15 + 8 }} initial={{ y: 0 }} animate={{ y: [0, plan.hang.len + 14, plan.hang.len - 6, plan.hang.len] }} transition={{ duration: 1.3, delay: 0.5, times: [0, 0.55, 0.8, 1], ease: "easeOut" }}>
            <div style={{ transform: "rotate(180deg)" }}>
              <Spider uid={`${uid}hs`} size={1.15} gait={0.55} />
            </div>
          </motion.div>
        </motion.div>
      </div>
      {/* bats bursting out */}
      {plan.bats.map((b, i) => (
        <motion.div key={`b${i}`} className="absolute left-0 top-0" style={{ marginLeft: -b.w / 2, marginTop: -b.w * 0.27 }} initial={{ x: b.xs[0], y: b.ys[0], scale: 0.2, opacity: 0 }} animate={{ x: b.xs, y: b.ys, scale: [0.2, 1, 1.25], opacity: [0, 1, 1] }} transition={{ duration: b.dur, delay: b.delay, ease: "easeIn" }}>
          <Bat w={b.w} />
        </motion.div>
      ))}
      {/* spiders pouring out and scuttling across the card */}
      {plan.spiders.map((sp, i) => (
        <motion.div key={`s${i}`} className="absolute left-0 top-0" style={{ marginLeft: -32 * sp.size, marginTop: -32 * sp.size }} initial={{ x: sp.xs[0], y: sp.ys[0], rotate: sp.rot[0], scale: 0.3, opacity: 0 }} animate={{ x: sp.xs, y: sp.ys, rotate: sp.rot, scale: [0.3, 1, 1, 1, 1, 1], opacity: [0, 1, 1, 1, 1, 1] }} transition={{ duration: sp.dur, delay: sp.delay, times: [0, 0.18, 0.3, 0.56, 0.66, 1], ease: "easeInOut" }}>
          <Spider uid={`${uid}s${i}`} size={sp.size} gait={sp.gait} />
        </motion.div>
      ))}
    </div>
  );
}

function Night({ W, uid, chatter, glow }: { W: number; uid: string; chatter: number; glow: MotionValue<number> }) {
  const haloO = useTransform(glow, [0, 1], [0.75, 1.6]), haloS = useTransform(glow, [0, 1], [1, 1.22]);
  const stars = Array.from({ length: 26 }, (_, i) => ({ x: rnd(i * 3.3) * W, y: 12 + rnd(i * 7.1) * 230, r: 0.5 + rnd(i * 1.9) * 0.9, o: 0.25 + rnd(i * 5.3) * 0.5 }));
  const mx = W * 0.76, my = 74;
  const g = CARD_H - 66; // the hill line the graves stand on
  const graves = [
    { x: W * 0.12, w: 26, h: 34, r: 13, a: -6 },
    { x: W * 0.27, w: 18, h: 24, r: 3, a: 4 },
    { x: W * 0.76, w: 24, h: 30, r: 12, a: 7 },
    { x: W * 0.9, w: 14, h: 30, r: 0, a: -3, cross: true },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#120c22 0%,#1d1233 45%,#2a1736 78%,#1a0f1f 100%)" }} />
      <motion.div className="absolute" style={{ left: mx - 120, top: my - 120, width: 240, height: 240, opacity: haloO, scale: haloS, background: "radial-gradient(closest-side, rgba(255,236,190,.26), rgba(255,200,120,.09) 55%, transparent)" }} />
      <svg className="absolute inset-0" width={W} height={CARD_H}>
        <defs>
          <radialGradient id={`${uid}moon`} cx="40%" cy="38%" r="65%">
            <stop offset="0" stopColor="#fffbe8" />
            <stop offset=".7" stopColor="#f3e6b8" />
            <stop offset="1" stopColor="#d9c68e" />
          </radialGradient>
          <linearGradient id={`${uid}fog`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9a8d6" stopOpacity="0" />
            <stop offset=".6" stopColor="#b9a8d6" stopOpacity=".16" />
            <stop offset="1" stopColor="#b9a8d6" stopOpacity=".06" />
          </linearGradient>
          <linearGradient id={`${uid}stone`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3b3346" />
            <stop offset="1" stopColor="#1e1826" />
          </linearGradient>
        </defs>
        {stars.map((st, i) => <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#fff" opacity={st.o} />)}
        <circle cx={mx} cy={my} r="31" fill={`url(#${uid}moon)`} />
        {[[-9, -6, 5], [8, 4, 6.5], [-2, 13, 3.5], [11, -11, 3]].map(([dx, dy, r], i) => <circle key={i} cx={mx + dx} cy={my + dy} r={r} fill="#cdb983" opacity=".45" />)}
        {/* far hill, near hill, graves */}
        <path d={`M0 ${g + 6} Q${W * 0.3} ${g - 18} ${W * 0.62} ${g - 2} T${W} ${g - 10} V${CARD_H} H0 Z`} fill="#160e1e" />
        {graves.map((gv, i) => (
          <g key={i} transform={`translate(${gv.x} ${g + 4}) rotate(${gv.a})`}>
            {gv.cross ? (
              <path d={`M-2.5 0 V${-gv.h} M-8 ${-gv.h + 8} H8`} stroke={`url(#${uid}stone)`} strokeWidth="4.5" strokeLinecap="round" />
            ) : (
              <path d={`M${-gv.w / 2} 0 V${-gv.h + gv.r} A${gv.w / 2} ${gv.r} 0 0 1 ${gv.w / 2} ${-gv.h + gv.r} V0 Z`} fill={`url(#${uid}stone)`} />
            )}
            {!gv.cross && gv.w > 20 && <text x="0" y={-gv.h * 0.45} textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#6b6176">RIP</text>}
          </g>
        ))}
        {/* a skeleton sitting on the old headstone, jaw chattering now and then */}
        <g transform={`translate(${graves[0].x} ${g + 4}) rotate(${graves[0].a}) translate(0 ${-graves[0].h})`}>
          <g stroke="#e6dfcf" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {/* legs hanging over the front of the stone */}
            <path d="M-3.5 0 L-5.5 4 L-6.5 15 M3.5 0 L5 4 L6.5 14.5" strokeWidth="2" />
            <path d="M-8.5 15.5 L-4.5 15.5 M4.5 15 L8.5 15" strokeWidth="1.8" />
            <circle cx="-5.5" cy="4" r="1.3" fill="#e6dfcf" strokeWidth="0" />
            <circle cx="5" cy="4" r="1.3" fill="#e6dfcf" strokeWidth="0" />
            {/* pelvis, spine, ribs */}
            <path d="M-5 -1 Q0 2.5 5 -1 Q3 -4 0 -3.5 Q-3 -4 -5 -1 Z" strokeWidth="1.3" fill="#e6dfcf" />
            <path d="M0 -4 L0 -21" strokeWidth="1.6" strokeDasharray="1.6 0.9" />
            {[-8, -11.5, -15, -18].map((y, k) => <path key={k} d={`M0 ${y} Q-6 ${y + 0.5} -5.5 ${y + 3} M0 ${y} Q6 ${y + 0.5} 5.5 ${y + 3}`} strokeWidth="1.1" />)}
            {/* arms: one propped on the stone, one hanging on the knee */}
            <path d="M-5 -20 L-9 -11 L-11 -3" strokeWidth="1.6" />
            <path d="M5 -20 L7.5 -11 L6 -3" strokeWidth="1.6" />
          </g>
          <motion.g key={chatter} animate={chatter ? { rotate: [0, -6, 0, -6, 0, -5, 0, -4, 0] } : undefined} transition={{ duration: 0.5 }} style={{ originX: "0px", originY: "-24px" }}>
            {/* skull; the jaw drops while it chatters */}
            <circle cx="0" cy="-29" r="6.3" fill="#ece6d7" />
            <path d="M-4.2 -25 L-3.6 -21.8 L3.6 -21.8 L4.2 -25 Z" fill="#ece6d7" />
            <ellipse cx="-2.4" cy="-29.5" rx="1.8" ry="2.2" fill="#140e18" />
            <ellipse cx="2.4" cy="-29.5" rx="1.8" ry="2.2" fill="#140e18" />
            <circle cx="-2.4" cy="-29.3" r=".6" fill="#ff7a1a" />
            <circle cx="2.4" cy="-29.3" r=".6" fill="#ff7a1a" />
            <path d="M-.7 -26.2 L0 -27.4 L.7 -26.2 Z" fill="#140e18" />
          </motion.g>
          <motion.g key={`j${chatter}`} animate={chatter ? { y: [0, 1.8, 0, 1.8, 0, 1.6, 0, 1.4, 0] } : undefined} transition={{ duration: 0.5 }}>
            <path d="M-3.6 -21.6 Q0 -18.6 3.6 -21.6" stroke="#ece6d7" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M-2 -21.4 V-20.2 M0 -21 V-19.8 M2 -21.4 V-20.2" stroke="#140e18" strokeWidth=".6" />
          </motion.g>
        </g>
        {/* a skull hung on top of the cross */}
        <g transform={`translate(${graves[3].x - 2.5} ${g + 4 - graves[3].h - 5}) rotate(${graves[3].a + 8})`}>
          <circle cx="0" cy="0" r="5" fill="#ece6d7" />
          <path d="M-3.4 3 L-2.8 5.6 L2.8 5.6 L3.4 3 Z" fill="#ece6d7" />
          <ellipse cx="-1.9" cy="-.4" rx="1.5" ry="1.8" fill="#140e18" />
          <ellipse cx="1.9" cy="-.4" rx="1.5" ry="1.8" fill="#140e18" />
          <path d="M-.6 2.4 L0 1.4 L.6 2.4 Z" fill="#140e18" />
        </g>
        {/* a skeleton hand clawing out of the ground, waving slowly */}
        <g transform={`translate(${W * 0.6} ${g + 12})`}>
          <motion.g animate={{ y: [6, 0, 0, 6], rotate: [0, -10, 12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.7, 1] }} style={{ originX: "0px", originY: "0px" }}>
            <g stroke="#e6dfcf" strokeLinecap="round" fill="none">
              <path d="M-1.5 0 L-2 -15 M1.5 0 L1.6 -15" strokeWidth="1.7" />
              <path d="M-3 -16 L3 -16 L3.5 -20 L-3.5 -20 Z" strokeWidth="1.3" fill="#e6dfcf" />
              <path d="M-3 -20 L-5 -26 L-5.5 -30 M-1 -20.5 L-1.5 -28 L-1.8 -32.5 M1 -20.5 L1.5 -28 L1.7 -32 M3 -20 L4.6 -26 L5 -29.5 M3.4 -17 L7 -20 L8.5 -23" strokeWidth="1.2" />
            </g>
          </motion.g>
        </g>
        <path d={`M0 ${g + 14} Q${W * 0.25} ${g + 2} ${W * 0.5} ${g + 12} T${W} ${g + 6} V${CARD_H} H0 Z`} fill="#0c0811" />
        {Array.from({ length: 22 }, (_, i) => { const x = (i / 21) * W, y = g + 10 + Math.sin(i * 1.7) * 3; return <path key={i} d={`M${x} ${y} l-2 -7 M${x + 3} ${y} l1 -9 M${x + 5} ${y} l3 -6`} stroke="#0c0811" strokeWidth="1.4" strokeLinecap="round" />; })}
        <rect x="0" y={g - 40} width={W} height="110" fill={`url(#${uid}fog)`} />
      </svg>
      {/* a ghost drifting through the dark, and one that rises out of a grave */}
      <motion.div
        className="absolute left-0 top-0"
        initial={{ x: W + 40, y: 210, opacity: 0 }}
        animate={{ x: [W + 40, W * 0.55, W * 0.15, -60], y: [210, 190, 230, 205], opacity: [0, 0.8, 0.75, 0], rotate: [4, -3, 5, -2] }}
        transition={{ duration: 13, repeat: Infinity, repeatDelay: 4, delay: 2, ease: "easeInOut" }}
      >
        <motion.div animate={{ y: [0, -6, 0], skewX: [0, 4, -3, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <SheetGhost uid={`${uid}a`} w={34} face={1} />
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute left-0 top-0"
        style={{ x: W * 0.27 - 11 }}
        initial={{ y: g - 10, opacity: 0, scale: 0.6 }}
        animate={{ y: [g - 10, g - 60, g - 120], opacity: [0, 0.45, 0], scale: [0.6, 0.85, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 7, delay: 6, ease: "easeOut" }}
      >
        <SheetGhost uid={`${uid}b`} w={26} face={2} />
      </motion.div>
      {/* bats crossing the moon now and then */}
      {[0, 1].map((i) => (
        <motion.svg
          key={i}
          width="22"
          height="12"
          viewBox="-11 -6 22 12"
          className="absolute left-0 top-0"
          initial={{ x: -40, y: 60 + i * 34 }}
          animate={{ x: [-40, W + 40], y: [60 + i * 34, 40 + i * 30, 70 + i * 26, 50 + i * 30] }}
          transition={{ duration: 7 + i * 2, repeat: Infinity, repeatDelay: 5 + i * 3, delay: 1.5 + i * 2.2, ease: "linear" }}
        >
          <motion.path
            d="M0 1 C-2 -1 -4 -4 -11 -3 C-8 -1 -8 1 -9 3 C-6 1 -4 2 -3 4 C-2 2 -1 2 0 3 C1 2 2 2 3 4 C4 2 6 1 9 3 C8 1 8 -1 11 -3 C4 -4 2 -1 0 1 Z"
            fill="#07050a"
            animate={{ scaleY: [1, 0.35, 1] }}
            transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>
      ))}
    </div>
  );
}

type Bit = { x: number; y: number; vx: number; vy: number; r: number; vr: number; w: number; h: number; c: string; f: number; vf: number; life: number; k: number };
type Phase = "intact" | "emerge" | "burst" | "landed";
const EMBERS = ["#ff6a00", "#ffb347", "#ff3d00", "#ffd27a"];
/** Embers and charred flakes of shell thrown out by the burst. */
function embersFrom(x: number, y: number): Bit[] {
  const B: Bit[] = [];
  for (let i = 0; i < 120; i++) {
    const ember = i % 3 !== 0;
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.8, sp = (ember ? 160 : 220) + Math.random() * (ember ? 420 : 500);
    B.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, r: Math.random() * 6, vr: (Math.random() - 0.5) * 14, w: ember ? 2 + Math.random() * 3.5 : 3 + Math.random() * 4, h: 3 + Math.random() * 4, c: ember ? EMBERS[i % EMBERS.length] : i % 2 ? "#1d1418" : "#3a2418", f: Math.random() * 6, vf: 6 + Math.random() * 10, life: Math.random() * 0.2, k: ember ? 1 : 0 });
  }
  return B;
}

/**
 * A Halloween promo code inside a jack-o'-lantern piñata hanging from a dead
 * branch under a full moon. Tap it (or press Space) and it swings and
 * spins on its rope with each hit; cracks open after the first and second
 * blow. The third bursts it into pieces and lets out what was inside: sheet
 * ghosts that fly round the night, bats, and spiders scuttling across the card.
 * Then the coupon, a torn and bloodied slip with a spider on it, comes out and
 * lands with a bounce, ready to copy.
 */
export interface PumpkinRevealProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Shows the sound switch in the card. Sounds are synthesised, start off, and never play under a visitor who has not switched them on. */
  enableSound?: boolean;
  /** URL of a track to play when the pumpkin bursts (optional). Without one, the ghosts wail instead. */
  music?: string;
  /** Extra classes for the outer card. */
  className?: string;
}

export function PumpkinReveal({ autoplay = false, enableSound = true, music, className = "" }: PumpkinRevealProps) {
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [W, setW] = useState(400);
  const WRef = useRef(400);
  const [hits, setHits] = useState(0);
  const hitsRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("intact");
  const phaseRef = useRef<Phase>("intact");
  const [pumpkin0] = useState(createPumpkin);
  const pk = useRef<Pumpkin | null>(pumpkin0);
  const pcv = useRef<HTMLCanvasElement>(null);
  const hangT = useRef(-1);
  const bits = useRef<Bit[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState("");
  const [gen, setGen] = useState(0);
  // the visitor's own choice wins; until they make one, an autoplaying demo follows the site-wide sound switch
  const [soundChoice, setSoundChoice] = useState<boolean | null>(null);
  const [siteSound] = useSoundsEnabled();
  const autoSoundOk = useAutoplaySoundAllowed();
  const sound = enableSound && (soundChoice ?? (autoplay && autoSoundOk && siteSound));
  const snd = useRef<Spook | null>(null);
  const [horde, setHorde] = useState<HordePlan | null>(null);
  const [chatter, setChatter] = useState(0);
  const glow = useMotionValue(0);
  const [swoop, setSwoop] = useState(0);
  const cho = useRef<number[]>([]);
  const musicRaf = useRef(0);
  const [prize, setPrize] = useState<Treat>(TREATS[0]);
  const burstAt = useRef({ x: 0, y: 0 });
  const genRef = useRef(0);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const auto = useRef<number[]>([]);
  const nextId = useRef(1);
  const s = W < 380 ? 0.86 : 1;
  const sRef = useRef(s);
  useLayoutEffect(() => { sRef.current = s; });
  const floorY = CARD_H - 56;
  const CH = 134;
  const cw = Math.min(300, W - 48);

  // motion values driven by the rAF loop
  const ropeRot = useMotionValue(0), ropeLen = useMotionValue(ROPE), bodyRot = useMotionValue(0), bodySY = useMotionValue(1);
  const cX = useMotionValue(0), cY = useMotionValue(-400), cR = useMotionValue(0), cS = useMotionValue(1), cSq = useMotionValue(1), cSqX = useMotionValue(1), shadowO = useMotionValue(0), shadowS = useMotionValue(0.4);

  const st = useRef({ th: 0.05, om: 0, ph: 0, pv: 0, yw: 0, yv: 0, sq: 1, sv: 0, L: ROPE, Lv: 0, Lt: ROPE, t: 0, by: 2.5, bv: 0, load: 1 });
  const anchorDy = useMotionValue(2.5);
  const branchG = useRef<SVGGElement>(null);
  const leafEls = useRef<(SVGGElement | null)[]>([]);
  const cp = useRef({ on: false, x: 0, y: 0, vx: 0, vy: 0, a: 0, va: 0, at: 0, land: false, sq: 1, sv: 0, sc: 1, scv: 0, rest: 0, settled: false });
  const raf = useRef(0);
  const running = useRef(false);

  const later = (ms: number, fn: () => void, list = timers.current) => { const id = window.setTimeout(fn, ms); list.push(id); return id; };

  // where a point of the piñata art (art units) sits in card px right now
  const pose = (u: number, v: number) => {
    const S = st.current, k = sRef.current;
    const hx = WRef.current / 2 - S.L * Math.sin(S.th), hy = ANCHOR_Y + S.by + S.L * Math.cos(S.th);
    const b = S.th + S.ph, sx = Math.cos(S.yw) * (2 - S.sq), sy = S.sq;
    const px = u * k * sx, py = v * k * sy;
    return { x: hx + px * Math.cos(b) - py * Math.sin(b), y: hy + px * Math.sin(b) + py * Math.cos(b), ang: (b * 180) / Math.PI };
  };

  const step = (dt: number) => {
    const S = st.current;
    S.t += dt;
    const alpha = -16 * Math.sin(S.th) - 0.5 * S.om;
    S.om += alpha * dt; S.th += S.om * dt;
    const pa = -36 * S.ph - 2.4 * S.pv - 0.75 * alpha;
    S.pv += pa * dt; S.ph += S.pv * dt;
    S.yv += (-9 * S.yw - 0.9 * S.yv) * dt; S.yw += S.yv * dt;
    S.yw = clamp(S.yw, -1.05, 1.05);
    S.sv += (-560 * (S.sq - 1) - 13 * S.sv) * dt; S.sq += S.sv * dt;
    S.Lv += (-95 * (S.L - S.Lt) - 7.5 * S.Lv) * dt; S.L += S.Lv * dt;
    // the branch sags under the piñata's weight plus the swing's pull on the rope, and springs back
    const sag = S.load * (2.5 + 2.2 * S.om * S.om + Math.max(0, -S.Lv) * 0.004);
    S.bv += (-260 * (S.by - sag) - 7 * S.bv) * dt; S.by += S.bv * dt;

    pk.current!.step(dt, floorY, WRef.current);
    // confetti
    const B = bits.current;
    for (let i = B.length - 1; i >= 0; i--) {
      const b = B[i];
      b.life += dt;
      // ash falls; embers are light and drift up on the heat once their burst has spent itself
      b.vy += (b.k === 1 ? -90 : 520) * dt;
      const drag = Math.exp(-(b.k === 1 ? 2.8 : 2.1) * dt);
      b.vx *= drag; b.vy *= drag;
      b.x += (b.vx + Math.sin(b.life * 5 + b.f) * (b.k === 1 ? 18 : 26)) * dt; b.y += b.vy * dt;
      b.r += b.vr * dt; b.f += b.vf * dt;
      if (b.y > CARD_H + 20 || b.y < -30 || b.life > 4) B.splice(i, 1);
    }
    // the coupon
    const c = cp.current;
    if (c.on && !c.settled) {
      c.scv += (-260 * (c.sc - 1) - 20 * c.scv) * dt; c.sc += c.scv * dt;
      c.vy += 1500 * dt;
      c.x += c.vx * dt; c.y += c.vy * dt;
      if (c.land) { c.va += (-120 * (c.a - c.at) - 15 * c.va) * dt; c.vx *= Math.exp(-8 * dt); }
      c.a += c.va * dt;
      if (c.y >= c.rest && c.vy > 0) {
        c.y = c.rest;
        if (c.vy > 140) { c.sv -= c.vy * 0.0055; c.vy = -c.vy * 0.33; c.land = true; c.va *= 0.35; }
        else c.vy = 0;
      }
      c.sv += (-520 * (c.sq - 1) - 16 * c.sv) * dt; c.sq += c.sv * dt;
      if (c.land && Math.abs(c.vy) < 1 && Math.abs(c.va) < 2 && Math.abs(c.a - c.at) < 0.4 && Math.abs(c.sq - 1) < 0.003 && Math.abs(c.sc - 1) < 0.003) {
        c.settled = true; c.a = c.at; c.sq = 1; c.sc = 1;
        if (phaseRef.current === "burst") { phaseRef.current = "landed"; setPhase("landed"); snd.current?.chime(); }
      }
    }
  };

  const render = () => {
    const S = st.current;
    ropeRot.set((S.th * 180) / Math.PI);
    anchorDy.set(S.by);
    const Wn = WRef.current, arm = Wn / 2 + 14;
    const bt = `rotate(${((S.by - 2.5) / arm * 57.3).toFixed(2)} -14 ${branchY(-14, Wn).toFixed(1)})`;
    if (branchG.current && branchG.current.getAttribute("transform") !== bt) branchG.current.setAttribute("transform", bt);
    leafEls.current.forEach((el, i) => {
      if (!el) return;
      const sw = Math.sin(S.t * (5 + i) + i * 1.3) * Math.min(14, Math.abs(S.bv) * 0.35 + Math.abs(S.om) * 3);
      el.setAttribute("transform", `rotate(${(LEAVES[i].a + sw).toFixed(2)})`);
    });
    ropeLen.set(S.L);
    bodyRot.set((S.ph * 180) / Math.PI);
    bodySY.set(S.sq);
    const pc = pcv.current, pg = pc?.getContext("2d");
    if (pc && pg) {
      const Wn2 = WRef.current, dpr = pc.width / Math.max(1, Wn2), k = sRef.current;
      pg.setTransform(dpr, 0, 0, dpr, 0, 0);
      pg.clearRect(0, 0, Wn2, CARD_H);
      if (phaseRef.current === "intact") {
        const hx = Wn2 / 2 - S.L * Math.sin(S.th), hy = ANCHOR_Y + S.by + S.L * Math.cos(S.th), b = S.th + S.ph;
        const d = BODY_Y * k * S.sq;
        const flick = 0.8 + 0.2 * (0.5 * Math.sin(S.t * 13) + 0.3 * Math.sin(S.t * 7.3 + 1) + 0.2 * Math.sin(S.t * 23));
        pg.globalAlpha = hangT.current < 0 ? 1 : clamp((S.t - hangT.current) / 0.25, 0, 1);
        pk.current!.draw(pg, { cx: hx - d * Math.sin(b), cy: hy + d * Math.cos(b), b, yaw: S.yw * 1.25, sq: S.sq, k }, S.t, flick, { x: hx, y: hy });
        pg.globalAlpha = 1;
      }
      pk.current!.drawShards(pg);
    }
    const c = cp.current;
    if (c.on) {
      cX.set(c.x); cY.set(c.y); cR.set(c.a); cS.set(c.sc); cSq.set(c.sq); cSqX.set(2 - c.sq);
      const above = Math.max(0, c.rest - c.y);
      shadowO.set(clamp(1 - above / 260, 0, 1) * 0.9); shadowS.set(clamp(1 - above / 400, 0.35, 1));
    }
    const cv = canvas.current, ctx = cv?.getContext("2d");
    if (cv && ctx) {
      const dpr = cv.width / Math.max(1, WRef.current);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, WRef.current, CARD_H);
      for (const b of bits.current) {
        const fade = b.life > 3 ? Math.max(0, (4 - b.life) / 1) : 1;
        if (b.k === 1) {
          // an ember: a hot core in a soft glow, flickering as it cools
          const heat = Math.max(0, 1 - b.life / 4) * (0.7 + 0.3 * Math.sin(b.life * 22 + b.f));
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 0.28 * fade * heat; ctx.fillStyle = b.c;
          ctx.beginPath(); ctx.arc(b.x, b.y, b.w * 0.9, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = fade * heat; ctx.fillStyle = "#fff1c4";
          ctx.beginPath(); ctx.arc(b.x, b.y, b.w * 0.22, 0, Math.PI * 2); ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        } else {
          // a flake of charred shell
          ctx.save();
          ctx.globalAlpha = fade * 0.85;
          ctx.translate(b.x, b.y); ctx.rotate(b.r); ctx.scale(1, Math.cos(b.f));
          ctx.fillStyle = b.c;
          ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    }
  };

  const settled = () => {
    const S = st.current, c = cp.current;
    const still = Math.abs(S.th) < 0.002 && Math.abs(S.om) < 0.004 && Math.abs(S.ph) < 0.002 && Math.abs(S.pv) < 0.004 && Math.abs(S.yw) < 0.002 && Math.abs(S.yv) < 0.004 && Math.abs(S.sq - 1) < 0.001 && Math.abs(S.sv) < 0.01 && Math.abs(S.L - S.Lt) < 0.05 && Math.abs(S.Lv) < 0.05 && Math.abs(S.bv) < 0.05;
    const piecesDone = !pk.current!.busy() && phaseRef.current !== "intact";
    return still && piecesDone && bits.current.length === 0 && (!c.on || c.settled);
  };

  const wake = () => {
    if (running.current) return;
    running.current = true;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const n = 2;
      for (let i = 0; i < n; i++) step(dt / n);
      render();
      if (settled()) { running.current = false; render(); return; }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  };

  // size + canvas resolution
  useLayoutEffect(() => {
    const el = root.current!;
    const ro = new ResizeObserver(() => {
      const w = el.offsetWidth;
      WRef.current = w;
      setW(w);
      const cv = canvas.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv) { cv.width = Math.round(w * dpr); cv.height = Math.round(CARD_H * dpr); }
      const pc = pcv.current;
      if (pc) { pc.width = Math.round(w * dpr); pc.height = Math.round(CARD_H * dpr); }
      wake();
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the skeleton chatters its teeth every so often
  useEffect(() => {
    const iv = window.setInterval(() => { setChatter((c) => c + 1); snd.current?.chatter(); }, 7300);
    return () => window.clearInterval(iv);
  }, []);
  const toggleSound = () => {
    // Start the audio engine inside this tap: phones refuse to start audio from the effect below.
    if (!sound && enableSound) {
      if (!snd.current) snd.current = createSpook();
      snd.current.setMusic(music);
      snd.current.unlock();
    }
    setSoundChoice(!sound);
  };
  useEffect(() => {
    if (!sound) { snd.current?.off(); return; }
    if (!snd.current) snd.current = createSpook();
    snd.current.setMusic(music);
    void snd.current.on();
  }, [sound, music]);

  useEffect(() => () => { cancelAnimationFrame(musicRaf.current); cho.current.forEach(clearTimeout); snd.current?.dispose(); snd.current = null; }, []);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    running.current = false;
    timers.current.forEach(clearTimeout);
    auto.current.forEach(clearTimeout);
  }, []);

  const ripple = (x: number, y: number) => setRipples((r) => [...r.slice(-3), { id: nextId.current++, x, y }]);

  const burst = (dir: number) => {
    const center = pose(0, BODY_Y);
    burstAt.current = center;
    // The track opens with a hit at 0.24 s; starting it 0.2 s in puts that hit on the burst.
    // Its cues, measured from the burst: theremin glides up at 1.65 s, the bass moves at 3.4, 5.0
    // and 6.6 s, the theremin glides down at 6.5 s, and it fades out from about 10 s.
    const withMusic = !!snd.current && snd.current.playMusic(0.2, () => { cancelAnimationFrame(musicRaf.current); animate(glow, 0, { duration: 0.6 }); });
    snd.current?.burst(withMusic);
    snd.current?.horde(withMusic);
    // what was trapped inside gets out
    setHorde(planHorde((horde?.k ?? 0) + 1, center.x, center.y, WRef.current, CARD_H));
    if (root.current) animate(root.current, { x: [0, -8, 7, -5, 4, -2, 0], y: [0, 3, -3, 2, -1, 0, 0] }, { duration: 0.5, ease: "easeOut" });
    cho.current.forEach(clearTimeout); cho.current = [];
    const cue = (sec: number, fn: () => void) => { cho.current.push(window.setTimeout(fn, sec * 1000)); };
    const pulse = (to: number) => { if (!withMusic) animate(glow, [glow.get(), to, 0.15], { duration: 1.1, times: [0, 0.15, 1] }); };
    pulse(1);
    [3.4, 5.0, 6.6].forEach((t) => cue(t, () => { setChatter((c) => c + 1); pulse(0.7); }));
    cue(6.45, () => setSwoop((n) => n + 1));
    if (withMusic) {
      // let the music itself breathe through the moonlight
      const tick = () => { const l = snd.current?.level() ?? 0; glow.set(glow.get() + (l - glow.get()) * 0.25); musicRaf.current = requestAnimationFrame(tick); };
      cancelAnimationFrame(musicRaf.current);
      musicRaf.current = requestAnimationFrame(tick);
    }
    pk.current!.burst(dir);
    // embers and charred flakes of shell
    const B = embersFrom(center.x, center.y);
    bits.current = B;
    // the rope, now weightless, springs back up
    st.current.Lt = 16;
    st.current.Lv -= 200;
    st.current.load = 0;
    st.current.bv -= 70;
    st.current.om += dir * -0.6;
    phaseRef.current = "emerge";
    setPhase("emerge");
    setMsg("It burst open. Ghosts, bats and spiders came out of it.");
    later(EMERGE_MS, reveal);
  };

  // once the horde has fled, the offer flies up out of what is left of the pumpkin and lands
  const reveal = () => {
    if (phaseRef.current !== "emerge") return;
    const tr = TREATS[genRef.current % TREATS.length];
    snd.current?.pop();
    setPrize(tr);
    const c = cp.current, from = burstAt.current;
    const rest = floorY - CH / 2;
    const v0 = -560, g = 1500, dy = rest - from.y;
    const tl = (-v0 + Math.sqrt(Math.max(0, v0 * v0 + 2 * g * dy))) / g;
    const turn = from.x < WRef.current / 2 ? 360 : -360;
    Object.assign(c, { on: true, x: from.x, y: from.y, vx: (WRef.current / 2 - from.x) / tl, vy: v0, a: 0, at: turn - 1.5 * Math.sign(turn), land: false, sq: 1, sv: 0, sc: 0.25, scv: 0, rest, settled: false });
    c.va = (c.at - c.a) / tl;
    phaseRef.current = "burst";
    setPhase("burst");
    setMsg(`They are gone, and they left a treat: ${tr.title}. Code ${tr.code}.`);
    wake();
  };

  const hit = (x: number, y: number) => {
    if (phaseRef.current !== "intact") return;
    const S = st.current, k = sRef.current;
    const center = pose(0, BODY_Y);
    const dx = x - center.x, dy = y - center.y;
    const dir = dx === 0 ? 1 : -Math.sign(dx); // +1 pushes it to the right
    const mag = 0.9 + 0.5 * Math.min(1, Math.abs(dx) / (PR * k));
    S.om -= dir * mag * 1.05;
    S.pv += clamp(-dy / (PR * PH * k), -1.6, 1.6) * dir * 2.2 + dir * 0.5;
    S.yv += dir * (1.6 + rnd(hitsRef.current + x) * 1.4);
    S.sv -= 3.2;
    S.bv += 26;
    ripple(x, y);
    const n = hitsRef.current + 1;
    hitsRef.current = n;
    setHits(n);
    if (n < 3) { snd.current?.hit(n); pk.current!.crack(x, y, n, dir); }
    if (n >= 3) burst(dir);
    else setMsg(n === 1 ? "Hit 1 of 3. It cracked." : "Hit 2 of 3. One more.");
    wake();
  };

  const hang = () => {
    const S = st.current;
    snd.current?.stopMusic(0.6);
    cho.current.forEach(clearTimeout); cho.current = [];
    cancelAnimationFrame(musicRaf.current);
    animate(glow, 0, { duration: 0.6 });
    snd.current?.lower();
    Object.assign(S, { th: 0.06, om: 0, ph: 0, pv: 0, yw: 0.4, yv: 0, sq: 1, sv: 0, L: -14, Lv: 120, Lt: ROPE, load: 1 });
    pk.current!.reset();
    hangT.current = st.current.t;
    cp.current.on = false;
    setHorde(null);
    genRef.current += 1;
    hitsRef.current = 0;
    setHits(0);
    setCopied(false);
    phaseRef.current = "intact";
    setPhase("intact");
    setGen((g) => g + 1);
    setMsg("A new pumpkin is hanging. Three hits open it.");
    wake();
  };

  const copy = async () => {
    const code = prize.code;
    try { await navigator.clipboard.writeText(code); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = code; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
    }
    setCopied(true);
    setMsg(`Code ${code} copied.`);
    later(2400, () => setCopied(false));
  };

  // pointer + keyboard hits
  const onPinataDown = (e: RPointerEvent<HTMLButtonElement>) => {
    const r = root.current!.getBoundingClientRect(), z = r.width / root.current!.offsetWidth || 1;
    hit((e.clientX - r.left) / z, (e.clientY - r.top) / z);
  };
  const keySide = useRef(1);
  const onPinataKey = (e: RKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat) return;
    keySide.current *= -1;
    const p = pose(keySide.current * 26, BODY_Y + 8);
    hit(p.x, p.y);
  };
  const touch = () => {
    if (sound) snd.current?.nudge();
    if (touched.current) return;
    touched.current = true;
    auto.current.forEach(clearTimeout);
    auto.current = [];
  };

  // autoplay: three hits with pauses, the reveal, then a fresh piñata, forever
  useEffect(() => {
    if (!autoplay) return;
    const list = auto.current;
    const cycle = () => {
      if (touched.current) return;
      const at = (ms: number, fn: () => void) => later(ms, () => { if (!touched.current) fn(); }, list);
      const tap = (u: number, v: number) => { const p = pose(u, v); hit(p.x, p.y); };
      at(1000, () => tap(-30, BODY_Y + 6));
      at(2300, () => tap(28, BODY_Y - 14));
      at(3500, () => tap(-22, BODY_Y + 18));
      at(15600, () => { hang(); cycle(); });
    };
    cycle();
    return () => { list.forEach(clearTimeout); list.length = 0; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);


  return (
    <div
      ref={root}
      className={`relative w-full max-w-[440px] select-none overflow-hidden rounded-[24px] bg-[#0e0a17] shadow-[0_0_0_1px_rgba(0,0,0,.2),0_20px_40px_-26px_rgba(0,0,0,.6)] ${className}`}
      style={{ height: CARD_H }}
      onPointerDown={touch}
      onKeyDown={touch}
    >
      {/* night: sky, stars, a full moon behind the branch, bats, a graveyard in the fog */}
      <Night W={W} uid={uid} chatter={chatter} glow={glow} />
      <div className="absolute left-5 right-5 top-4 z-20 flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#f5f5f7]">Trick or treat</span>
          <span className="text-[12px] text-[#b4adc4]">{phase === "intact" ? "Something wicked is inside" : phase === "emerge" ? "They are loose" : "You survived. Here is your treat"}</span>
        </div>
        <div className="flex flex-none items-center gap-2">
        {enableSound ? (
          <button
            type="button"
            aria-pressed={sound}
            aria-label={sound ? "Turn spooky sounds off" : "Turn spooky sounds on"}
            title={sound ? "Sound on" : "Sound off"}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={toggleSound}
            className={`grid h-8 w-8 place-items-center rounded-full outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff9f0a] ${sound ? "bg-[#ff8a1f] text-[#1a0f05]" : "bg-white/[.1] text-[#f5f5f7] hover:bg-white/20"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
              {sound ? <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /> : <path d="M16 9l5 6M21 9l-5 6" />}
            </svg>
          </button>
        ) : null}
        {phase === "landed" ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={hang}
            className="h-8 flex-none whitespace-nowrap rounded-full bg-white/[.12] px-3.5 text-[12.5px] font-medium text-[#f5f5f7] outline-none transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff9f0a]"
          >
            Hang another
          </motion.button>
        ) : (
          <div className="flex h-8 flex-none items-center gap-2 whitespace-nowrap rounded-full bg-white/[.1] px-3" aria-hidden="true">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span key={i} className="block h-[7px] w-[7px] rounded-full" animate={{ backgroundColor: i < hits ? "#ff8a1f" : "rgba(255,255,255,.25)", scale: i === hits - 1 ? [1, 1.6, 1] : 1 }} transition={{ duration: 0.35 }} />
              ))}
            </span>
            <span className="text-[12.5px] font-medium tabular-nums text-[#f5f5f7]">{Math.min(hits, 3)} of 3</span>
          </div>
        )}
        </div>
      </div>

      {/* the branch it hangs from */}
      <Branch W={W} uid={uid} gRef={branchG} leafRefs={leafEls} />

      {/* rope + piñata: rotate the rope about its anchor, the body about its hang point */}
      <motion.div className="absolute top-0 z-10 h-0 w-0" style={{ left: W / 2, top: ANCHOR_Y, y: anchorDy, rotate: ropeRot, originX: 0, originY: 0 }}>
        <motion.div
          className="absolute left-[-1.5px] top-0 w-[3px] rounded-full"
          style={{ height: ropeLen, background: "repeating-linear-gradient(170deg, #cdb28a 0 3px, #a98c62 3px 6px)", boxShadow: "1px 0 0 rgba(0,0,0,.06)" }}
        />
        {phase !== "intact" && <motion.div className="absolute left-[-4px] h-2 w-2 rounded-full bg-[#a98c62]" style={{ y: ropeLen, top: -3 }} />}
        <motion.div className="absolute left-0 top-0" style={{ y: ropeLen }}>
          {phase === "intact" && (
            <motion.div
              key={`g${gen}`}
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{ left: -150 * s, top: (BODY_Y - 150) * s, width: 300 * s, height: 300 * s, background: "radial-gradient(closest-side, rgba(255,140,20,.34), rgba(255,110,0,.12) 55%, transparent)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.85, 0.65, 1, 0.75, 0.9] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {phase === "intact" && (
            <motion.button
              key={gen}
              initial={gen > 0 ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
              type="button"
              aria-label={`Pumpkin piñata, ${hits} of 3 hits. Press to hit it.`}
              onPointerDown={onPinataDown}
              onKeyDown={onPinataKey}
              className="group absolute block cursor-pointer touch-none outline-none"
              style={{ left: -PR * 1.1 * s, top: 0, width: PR * 2.2 * s, height: (BODY_Y + PR * PH + 10) * s, rotate: bodyRot, scaleY: bodySY, originX: `${PR * 1.1 * s}px`, originY: "0px" }}
            >
              <span className="pointer-events-none absolute rounded-[50%] opacity-0 ring-2 ring-[#ff9f0a] ring-offset-2 ring-offset-[#0e0a17] transition-opacity group-focus-visible:opacity-100" style={{ left: (PR * 0.1 - 6) * s, top: (BODY_Y - PR * PH - 6) * s, width: (PR * 2 + 12) * s, height: (PR * PH * 2 + 12) * s }} />
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* the pumpkin itself, in 3D, and its shards */}
      <canvas ref={pcv} className="pointer-events-none absolute left-0 top-0 z-10" style={{ width: W, height: CARD_H }} aria-hidden="true" />

      {/* what was trapped inside: ghosts (they stay and fly round), bats and spiders */}
      {horde && <GhostFlock key={`f${horde.k}`} uid={`${uid}f${horde.k}`} plan={horde} />}
      {horde && <Horde key={horde.k} uid={`${uid}h${horde.k}`} plan={horde} />}

      {/* on the theremin's glide down, a ghost swoops back across the graveyard */}
      <AnimatePresence>
        {swoop > 0 && phase !== "intact" && (
          <motion.div
            key={`s${swoop}`}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-[13]"
            initial={{ x: W + 30, y: 60, opacity: 0, rotate: 20, scale: 0.8 }}
            animate={{ x: [W + 30, W * 0.62, W * 0.3, -70], y: [60, 190, 250, 160], opacity: [0, 0.85, 0.8, 0], rotate: [20, -8, -18, -6], scale: [0.8, 1.1, 1, 0.9] }}
            transition={{ duration: 1.9, ease: "easeInOut", times: [0, 0.3, 0.65, 1] }}
            onAnimationComplete={() => setSwoop(0)}
          >
            <SheetGhost uid={`${uid}sw`} w={46} face={0} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* coupon */}
      <AnimatePresence>
        {(phase === "burst" || phase === "landed") && (
          <motion.div key={`c${gen}`} className="absolute left-0 top-0 z-[15]" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}>
            <motion.div className="absolute rounded-[50%] bg-black/60 blur-[6px]" style={{ left: W / 2 - cw * 0.42, top: floorY - 8, width: cw * 0.84, height: 14, opacity: shadowO, scaleX: shadowS }} />
            <motion.div className="absolute left-0 top-0" style={{ x: cX, y: cY, rotate: cR, scale: cS }}>
              <motion.div
                className="absolute"
                style={{ left: -cw / 2, top: -CH / 2, width: cw, height: CH, scaleY: cSq, scaleX: cSqX, originY: 1, filter: "drop-shadow(0 0 18px rgba(255,96,0,.45)) drop-shadow(0 16px 14px rgba(0,0,0,.8))" }}
                role="group"
                aria-label={`Coupon: ${prize.title}, code ${prize.code}`}
              >
                {/* a slab of dark, scratched card with a torn bottom edge, bleeding from the top */}
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: TORN, background: "radial-gradient(130% 100% at 50% 0%, #301c3c 0%, #170e20 55%, #0a0610 100%)" }}>
                  <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(112deg, rgba(255,255,255,.035) 0 1px, transparent 1px 11px), repeating-linear-gradient(28deg, rgba(0,0,0,.25) 0 1px, transparent 1px 17px)" }} />
                  <div className="absolute inset-[3px]" style={{ clipPath: TORN, boxShadow: "inset 0 0 0 1px rgba(255,138,31,.3), inset 0 0 26px rgba(255,80,0,.2)" }} />
                  <div className="absolute inset-x-0 top-0 h-[5px]" style={{ background: "linear-gradient(#4a0307,#9e0d14)" }} />
                  {DRIPS.map((d, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-0 rounded-b-full"
                      style={{ left: `${d.x}%`, width: d.w, height: d.l, originY: 0, background: "linear-gradient(#4a0307,#a50f17 70%,#c81821)" }}
                      initial={{ scaleY: 0.25 }}
                      animate={{ scaleY: [0.25, 1, 0.92, 1] }}
                      transition={{ duration: 2.4 + d.l * 0.05, delay: 0.3 + i * 0.12, times: [0, 0.6, 0.8, 1], ease: "easeOut" }}
                    />
                  ))}
                  {/* now and then a drop runs off one of them */}
                  <motion.div className="absolute rounded-full bg-[#b3121b]" style={{ left: `calc(${DRIPS[2].x}% + ${DRIPS[2].w / 2 - 2}px)`, top: DRIPS[2].l - 2, width: 4, height: 5 }} animate={{ y: [0, 0, 90], opacity: [0, 1, 0] }} transition={{ duration: 1.6, times: [0, 0.4, 1], repeat: Infinity, repeatDelay: 2.2, delay: 2.6, ease: "easeIn" }} />
                  {/* a cobweb in the top corner, with its spider */}
                  <svg className="absolute right-0 top-0" width="58" height="52" viewBox="0 0 58 52" aria-hidden="true">
                    <g fill="none" stroke="rgba(235,230,250,.4)" strokeWidth=".6">
                      {[[0, 26], [10, 40], [26, 50], [44, 52]].map(([x, y], i) => <path key={i} d={`M58 0 L${x} ${y}`} />)}
                      {[14, 26, 38].map((r) => <path key={r} d={`M${58 - r} 0 Q${58 - r * 0.8} ${r * 0.5} ${58 - r * 0.62} ${r * 0.86} Q${58 - r * 0.42} ${r * 1.0} ${58 - r * 0.14} ${r * 1.0}`} />)}
                    </g>
                  </svg>
                </div>
                <div className="absolute" style={{ right: 22, top: 20 }} aria-hidden="true">
                  <motion.div style={{ originX: 0, originY: 0 }} animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
                    <motion.div className="absolute left-0 top-0 w-px bg-[rgba(235,235,255,.6)]" animate={{ height: [14, 22, 14] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.div className="absolute" style={{ left: -14.4, top: -6 }} animate={{ y: [14, 22, 14] }} transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}>
                      <div style={{ transform: "rotate(180deg)" }}><Spider uid={`${uid}cs`} size={0.45} gait={0.6} /></div>
                    </motion.div>
                  </motion.div>
                </div>
                <div className="relative flex h-full flex-col justify-between px-4 pb-4 pt-[22px]">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ff8a1f]">
                      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.9 2 3 5.7 3 10.4c0 2.7 1.3 4.6 3 5.8V19a1 1 0 0 0 1 1h1.6v-2h1.6v2h3.6v-2h1.6v2H17a1 1 0 0 0 1-1v-2.8c1.7-1.2 3-3.1 3-5.8C21 5.7 17.1 2 12 2Zm-3.6 11.2a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Zm7.2 0a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Z" fill="currentColor" /></svg>
                      You survived
                    </span>
                    <span className={`mt-1 ${cw < 290 ? "text-[19px]" : "text-[22px]"} font-bold leading-[1.12] tracking-[-0.01em] text-[#f4ead6]`} style={{ fontFamily: "Georgia, 'Times New Roman', serif", textShadow: "0 0 14px rgba(255,110,20,.4), 0 2px 0 rgba(0,0,0,.7)" }}>
                      {prize.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-9 items-center rounded-[10px] border border-dashed border-[#ff8a1f]/60 bg-black/45 px-2.5 text-[13px] text-[#b3a6c2]">
                      Code&nbsp;
                      <motion.span className="font-semibold tracking-[0.12em] text-[#ffb35c]" style={{ textShadow: "0 0 10px rgba(255,140,30,.75)" }} animate={{ opacity: [1, 0.72, 1, 0.9, 1] }} transition={{ duration: 2.2, repeat: Infinity, times: [0, 0.08, 0.16, 0.5, 1] }}>
                        {prize.code}
                      </motion.span>
                    </span>
                    <button
                      type="button"
                      onClick={copy}
                      disabled={phase !== "landed"}
                      className="h-9 min-w-[92px] flex-none whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold text-[#1a0b03] outline-none transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9f0a]"
                      style={{ background: "linear-gradient(180deg,#ffa24a,#e0520d)", boxShadow: "0 0 16px -2px rgba(255,120,20,.7), inset 0 1px 0 rgba(255,255,255,.35)" }}
                    >
                      <span className="grid place-items-center">
                        <motion.span className="col-start-1 row-start-1" animate={{ y: copied ? -8 : 0, opacity: copied ? 0 : 1 }} aria-hidden={copied} transition={{ type: "spring", stiffness: 500, damping: 32 }}>Copy code</motion.span>
                        <motion.span className="col-start-1 row-start-1" initial={false} animate={{ y: copied ? 0 : 8, opacity: copied ? 1 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 32 }} aria-hidden={!copied}>Copied</motion.span>
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* tap ripples */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          className="pointer-events-none absolute z-20 block h-12 w-12 rounded-full border-2 border-[#ffb020]/60"
          style={{ left: r.x - 24, top: r.y - 24 }}
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onAnimationComplete={() => setRipples((rs) => rs.filter((x) => x.id !== r.id))}
          aria-hidden="true"
        />
      ))}

      <canvas ref={canvas} className="pointer-events-none absolute left-0 top-0 z-[25]" style={{ width: W, height: CARD_H }} aria-hidden="true" />

      <p className="pointer-events-none absolute inset-x-0 bottom-4 z-20 text-center text-[12.5px] text-[#b4adc4]">
        {phase === "intact" ? "Smash the pumpkin three times, or press Space." : phase === "emerge" ? "" : "Copy the code, or hang another."}
      </p>
      <span className="sr-only" aria-live="polite">{msg}</span>
    </div>
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
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

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
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
