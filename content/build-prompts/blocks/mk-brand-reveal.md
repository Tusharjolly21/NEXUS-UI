# Brand Reveal

Add the "Brand Reveal" section from Nexus UI to my project.

A loading splash that resolves into your brand, on a plain white stage. A soft, puffy tile rolls through little photographs like a reel, each with a bold white mark on it. Between holds it spins down to the next one: the picture smears into vertical streaks and the tile turns like a drum, getting shorter and wider with its top and bottom edges blurring away. When your content is ready it lands on your own mark, then cuts to the wordmark, which drops in with a vertical motion-blur stutter and settles crisp. Drag the tile up or down to spin it yourself, or tap it. Keyboard: focus the tile and press Space or Enter to spin it; after the reveal, Replay runs it again.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { BrandReveal } from "@/components/blocks/motion-kit/brand-reveal";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `wordmark` | `string` | `"lumen.studio"` |  |
| `tagline` | `string` | none | an optional line under the wordmark |
| `scenes` | `BrandScene[]` | `SCENES` | the scenes the tile rolls through while it loads |
| `logo` | `string` | none | the tile it lands on: your logo image, or a letter (the wordmark's first letter by default) |
| `mark` | `string` | none |  |
| `brandColors` | `[string, string]` | none | paint the landing tile as a soft gradient in these colours instead of the blue-sky scene |
| `ready` | `boolean` | none | set true when your content has loaded |
| `progress` | `number` | none | or report loading progress from 0 to 1; it reveals at 1 and shows a small percentage meanwhile |
| `minDuration` | `number` | `2400` | the reel always plays at least this long, in ms |
| `height` | `number \| string` | none | stage height in px, or any CSS height such as "100dvh" |
| `onDone` | `() => void` | none |  |
| `onEnter` | `() => void` | none |  |
| `enterLabel` | `string` | `"Enter"` |  |
| `autoplay` | `boolean` | `false` |  |
| `className` | `string` | `""` |  |

--- components/blocks/motion-kit/brand-reveal/index.ts ---

```ts
export { BrandReveal } from "./brand-reveal";
export type { SceneArt, GlyphKind, BrandScene, BrandRevealProps } from "./brand-reveal";
```

--- components/blocks/motion-kit/brand-reveal/brand-reveal.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type SceneArt = "hills" | "gummies" | "meadow" | "ruins" | "neon" | "girders" | "clay" | "slope";
/** names from the first version still work; they map onto the closest scene */
type LegacyArt = "sunset" | "ocean" | "city" | "aurora" | "citrus" | "candy";
export type GlyphKind = "cloud" | "cube" | "hex" | "links" | "ring" | "brackets" | "asterisk" | "capsule" | "none";
export type BrandScene = {
  /** one of the built-in painted scenes */
  art?: SceneArt | LegacyArt;
  /** a photo URL, cover-fitted to the tile */
  image?: string;
  /** two colours for a soft gradient "photo" (used when there's no art or image) */
  colors?: [string, string];
  /** the white mark drawn on this scene; the built-in scenes each have one */
  glyph?: GlyphKind;
};
export type BrandRevealProps = {
  wordmark?: string;
  /** an optional line under the wordmark */
  tagline?: string;
  /** the scenes the tile rolls through while it loads */
  scenes?: BrandScene[];
  /** the tile it lands on: your logo image, or a letter (the wordmark's first letter by default) */
  logo?: string;
  mark?: string;
  /** paint the landing tile as a soft gradient in these colours instead of the blue-sky scene */
  brandColors?: [string, string];
  /** set true when your content has loaded */
  ready?: boolean;
  /** or report loading progress from 0 to 1; it reveals at 1 and shows a small percentage meanwhile */
  progress?: number;
  /** the reel always plays at least this long, in ms */
  minDuration?: number;
  /** stage height in px, or any CSS height such as "100dvh" */
  height?: number | string;
  onDone?: () => void;
  onEnter?: () => void;
  enterLabel?: string;
  autoplay?: boolean;
  className?: string;
};

// Framework7 Icons (MIT) via Iconify, inlined
const ICON = {
  replay: { vb: 56, body: "<path fill=\"currentColor\" d=\"M28.856 26.184c1.054 0 1.851-.797 1.851-1.875c0-.493-.187-.961-.539-1.336l-7.008-6.961c1.406-.305 3.047-.446 4.828-.446c9.399 0 16.946 7.524 16.946 16.922a16.9 16.9 0 0 1-16.946 16.969c-9.398 0-16.922-7.547-16.922-16.969c0-1.125-.726-1.945-1.828-1.945c-1.148 0-1.945.82-1.945 1.945c0 11.508 9.21 20.743 20.695 20.743a20.67 20.67 0 0 0 20.719-20.743c0-11.484-9.234-20.695-20.719-20.695c-1.36 0-2.718.14-4.054.375l6.257-6.14c.329-.376.516-.844.516-1.337c0-1.078-.797-1.921-1.852-1.921c-.562 0-1.03.187-1.359.562l-9.656 9.797c-.375.375-.586.89-.586 1.406c0 .54.164 1.008.586 1.406l9.656 9.704c.328.351.774.539 1.36.539\"/>" },
  enter: { vb: 56, body: "<path fill=\"currentColor\" d=\"M49.762 28c0-.586-.234-1.125-.703-1.57L33.543 10.938c-.516-.516-1.031-.704-1.594-.704c-1.148 0-2.039.844-2.039 2.016c0 .563.188 1.101.563 1.477l5.25 5.343l7.898 7.196l-5.672-.352H8.301c-1.195 0-2.063.867-2.063 2.086s.867 2.086 2.063 2.086h29.648l5.696-.352l-7.922 7.196l-5.25 5.343c-.375.352-.563.914-.563 1.477c0 1.172.89 2.016 2.04 2.016c.562 0 1.054-.211 1.523-.657L49.059 29.57c.469-.445.703-.984.703-1.57\"/>" },
} as const;

const SCENES: BrandScene[] = [{ art: "hills" }, { art: "gummies" }, { art: "meadow" }, { art: "ruins" }, { art: "neon" }, { art: "girders" }, { art: "clay" }];
const LEGACY: Record<LegacyArt, SceneArt> = { sunset: "clay", ocean: "slope", city: "neon", aurora: "meadow", citrus: "gummies", candy: "gummies" };
const ART_GLYPH: Record<SceneArt, GlyphKind> = { hills: "cloud", gummies: "cube", meadow: "hex", ruins: "links", neon: "ring", girders: "brackets", clay: "asterisk", slope: "capsule" };
const ART_CYCLE: SceneArt[] = ["hills", "gummies", "meadow", "ruins", "neon", "girders", "clay"];
const GLYPH_CYCLE: GlyphKind[] = ["cloud", "cube", "hex", "links", "ring", "brackets", "asterisk", "capsule"];
const HOLDS = [420, 330, 470, 300, 430, 350, 390];
const JUMPS = [1, 1, 1, 2, 1, 1, 1];
const STOP = Symbol("stop");
const FONT = '"Helvetica Neue", Helvetica, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
const mod = (a: number, n: number) => ((a % n) + n) % n;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
type Phase = "roll" | "land" | "lockup";
type ReelItem = { art?: SceneArt; image?: string; colors?: [string, string]; glyph: GlyphKind; brand?: boolean };
type C = [number, number, number];

// ─── noise ───
function hash(x: number, y: number, s: number) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s);
  const b = hash(xi + 1, yi, s);
  const c = hash(xi, yi + 1, s);
  const d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, s: number, oct = 5) {
  let a = 0.5;
  let f = 1;
  let t = 0;
  let n = 0;
  for (let i = 0; i < oct; i++) {
    t += a * vnoise(x * f, y * f, s + i * 31);
    n += a;
    a *= 0.5;
    f *= 2.07;
  }
  return t / n;
}
const sst = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mixc = (a: C, b: C, t: number): C => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const mul = (a: C, k: number): C => [a[0] * k, a[1] * k, a[2] * k];
const add = (a: C, b: C, k = 1): C => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const hex2 = (h: string): C => {
  const n = parseInt(h.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

// ─── the scenes: each is a tiny per-pixel "photo" shader; u across, v down, a = height / width ───
type Shader = (u: number, v: number, a: number) => C;
const SHADERS: Record<SceneArt, Shader> = {
  // golden grassy hills under a blue sky
  hills(u, v) {
    let c = mixc([0.12, 0.38, 0.67], [0.6, 0.78, 0.87], sst(0.0, 0.62, v));
    const cl = fbm(u * 2.2 + 3, v * 4.6, 3);
    c = mixc(c, [0.95, 0.96, 0.98], sst(0.5, 0.8, cl) * 0.65 * (1 - sst(0.2, 0.5, v)));
    // two hazy ranges far away
    const far1 = 0.47 + 0.09 * u + 0.07 * (fbm(u * 2.1, 0.4, 4, 4) - 0.5);
    const far2 = 0.53 + 0.13 * u + 0.08 * (fbm(u * 2.6, 1.4, 5, 4) - 0.5);
    if (v > far1) c = mixc(c, mixc([0.5, 0.63, 0.66], [0.42, 0.55, 0.52], fbm(u * 6, v * 6, 5, 3)), sst(far1, far1 + 0.008, v) * 0.8);
    if (v > far2) c = mixc(c, mixc([0.38, 0.5, 0.4], [0.5, 0.56, 0.38], fbm(u * 8, v * 8, 6, 3)), sst(far2, far2 + 0.008, v) * 0.85);
    // the near hill, golden grass, lit from the left
    const near = 0.44 + 0.46 * u * u + 0.04 * (fbm(u * 3, 1.7, 6, 4) - 0.5);
    const e = sst(near - 0.004, near + 0.012, v);
    if (e > 0) {
      const d = v - near;
      const blur = sst(0.75, 1, v); // the foreground is out of focus
      const g = fbm(u * (10 - 6 * blur) + v * 3, v * (18 - 10 * blur), 7);
      const ridges = fbm(u * 2.3 + v * 1.6, v * 4.2, 8, 4);
      let grass = mixc([0.46, 0.48, 0.19], [0.8, 0.73, 0.38], g);
      grass = mul(grass, 0.6 + 0.65 * ridges);
      grass = add(grass, [0.25, 0.2, 0.08], 0.5 * (1 - sst(0, 0.05, d)) * (1 - u)); // sunlit crest
      grass = mixc(grass, [0.66, 0.7, 0.66], 0.2 * (1 - sst(0, 0.14, d)));
      // clumps of dark oak, soft edged
      const tree = fbm(u * 7 + 2, v * 6.5, 9, 5) + 0.1 * sst(0.7, 1, v) - 0.08 * (1 - sst(0, 0.08, d));
      const tm = sst(0.63, 0.71, tree);
      if (tm > 0) {
        const leaf = fbm(u * 30, v * 30, 10, 3);
        const tc = mul([0.11, 0.17, 0.08], 0.65 + 0.9 * leaf * (1 - 0.6 * sst(0.63, 0.8, tree)));
        grass = mixc(grass, add(tc, [0.18, 0.15, 0.05], 0.4 * (1 - u) * leaf), tm);
      }
      grass = mul(grass, 1.06 - 0.22 * u);
      c = mixc(c, grass, e);
    }
    return c;
  },
  // a close-up of gummy candy, out of focus at the back
  gummies(u, v) {
    let c = mixc([0.42, 0.53, 0.8], [0.66, 0.6, 0.78], v);
    c = mixc(c, [0.85, 0.85, 0.92], 0.25 * sst(0.4, 1, fbm(u * 2, v * 2, 21, 3)));
    const blobs: [number, number, number, C, number][] = [
      [0.48, 0.3, 0.2, [0.32, 0.45, 0.86], 0.22],
      [0.12, 0.18, 0.27, [0.86, 0.26, 0.32], 0.16],
      [0.92, 0.15, 0.24, [0.95, 0.62, 0.72], 0.18],
      [0.05, 0.78, 0.24, [0.92, 0.32, 0.4], 0.08],
      [0.36, 0.92, 0.3, [0.98, 0.58, 0.22], 0.06],
      [0.78, 0.74, 0.42, [0.99, 0.74, 0.22], 0.04],
    ];
    for (const [bx, by, r, col, soft] of blobs) {
      const dx = u - bx;
      const dy = v - by;
      const wob = 0.09 * (fbm(u * 5 + bx * 9, v * 5 + by * 9, 30, 3) - 0.5);
      const dd = Math.hypot(dx * (1 + 0.15 * Math.sign(dx)), dy) / r + wob;
      const al = 1 - sst(1 - soft, 1 + soft, dd);
      if (al <= 0) continue;
      let body = mixc(mul(col, 0.7), mixc(col, [1, 1, 1], 0.18), sst(1, 0.15, dd));
      body = add(body, [1, 0.95, 0.9], 0.18 * sst(0.75, 0.98, dd) * sst(0, 0.5, dy / r + 0.4));
      const hx = dx + r * 0.33;
      const hy = dy + r * 0.38;
      const spec = Math.exp(-(hx * hx + hy * hy * 2.2) / (r * r * 0.03));
      body = add(body, [1, 1, 1], 0.75 * spec * (1 - soft * 3));
      c = mixc(c, body, al);
    }
    return c;
  },
  // a rocky meadow with small flowers, boulders lit from above
  meadow(u, v) {
    const sc = 3 + (1 - v) * 9;
    let c = mixc([0.27, 0.33, 0.16], [0.55, 0.55, 0.28], fbm(u * sc * 1.4, v * sc * 2.4, 41));
    c = mul(c, 0.75 + 0.45 * fbm(u * 3, v * 5, 42, 3));
    // flowers in the grass
    const cell = 30 + v * 26;
    const fx0 = Math.floor(u * cell);
    const fy0 = Math.floor(v * cell * 1.1);
    const h = hash(fx0, fy0, 51);
    if (h > 0.86) {
      const fx = u * cell - fx0 - 0.5;
      const fy = v * cell * 1.1 - fy0 - 0.5;
      const f = 1 - sst(0.1, 0.4, Math.hypot(fx, fy));
      const col: C = h > 0.965 ? [0.97, 0.95, 0.92] : h > 0.93 ? [0.92, 0.58, 0.7] : [0.98, 0.82, 0.3];
      c = mixc(c, col, f * (0.5 + 0.5 * v));
    }
    // boulders: bigger near the bottom, each a lumpy dome with a shadow under it
    for (let i = 0; i < 16; i++) {
      const by = 0.12 + 0.95 * hash(i, 7, 52);
      const bx = -0.1 + 1.2 * hash(i, 8, 52);
      const size = (0.05 + 0.1 * hash(i, 9, 52)) * (0.45 + by * 0.9);
      const dx = (u - bx) / (size * 1.35);
      const dy = (v - by) / size;
      const lump = 0.22 * (fbm(u * 9 + i, v * 9, 53, 3) - 0.5);
      const r = Math.hypot(dx, dy) + lump;
      // shadow on the grass, offset down and right
      const sr = Math.hypot((u - bx - size * 0.25) / (size * 1.5), (v - by - size * 0.45) / (size * 0.7));
      c = mul(c, 1 - 0.38 * (1 - sst(0.6, 1.1, sr)));
      if (r < 1.03) {
        const nz = Math.sqrt(Math.max(0, 1 - Math.min(1, r * r)));
        const lit = Math.max(0, -dx * 0.35 - dy * 0.65 + nz * 0.6);
        let rock = mixc([0.47, 0.42, 0.45], [0.7, 0.66, 0.64], fbm(u * 22, v * 22, 54 + i, 3));
        rock = mul(rock, 0.42 + 0.78 * lit);
        rock = mixc(rock, [0.3, 0.36, 0.2], 0.35 * sst(0.55, 1, dy) * sst(0.6, 0.8, fbm(u * 15, v * 15, 55, 2)));
        c = mixc(c, rock, sst(1.03, 0.94, r));
      }
    }
    c = mixc(c, [0.74, 0.76, 0.84], 0.5 * (1 - v) * (1 - v));
    return mul(c, 1.04 - 0.12 * v);
  },
  // an old stone arcade, warm in the sun
  ruins(u, v) {
    let c: C = [0.62, 0.7, 0.74];
    const wallTop = 0.08 + 0.05 * fbm(u * 4, 0.5, 61, 3);
    if (v > wallTop) {
      const row = Math.floor((v - wallTop) / 0.055);
      const off = hash(row, 1, 60) * 0.1;
      const bw = 0.08 + 0.05 * hash(row, 2, 60);
      const bxi = Math.floor((u + off) / bw);
      const bx = ((u + off) / bw) % 1;
      const by = ((v - wallTop) / 0.055) % 1;
      const mortar = Math.max(sst(0.86, 1, by), sst(0.9, 1, bx), sst(0.1, 0, bx) * 0.6) * (0.6 + 0.4 * hash(bxi, row, 61));
      let stone = mixc([0.56, 0.43, 0.3], [0.82, 0.68, 0.52], fbm(u * 8 + row * 3, v * 8, 62, 4));
      stone = mul(stone, 0.88 + 0.24 * hash(bxi, row, 65));
      stone = mul(stone, 1 - 0.2 * mortar);
      stone = mul(stone, 0.82 + 0.3 * fbm(u * 26, v * 4, 63, 3));
      c = stone;
      // two tiers of arches
      for (const [top, bot, w] of [
        [0.2, 0.52, 0.2],
        [0.62, 1.05, 0.23],
      ] as const) {
        for (const ac of [0.08, 0.5, 0.92]) {
          const dx = Math.abs(u - ac) / (w / 2);
          const archY = top + (w / 2) * (1 - Math.sqrt(Math.max(0, 1 - dx * dx))) * 1.1;
          if (dx < 1 && v > archY && v < bot) {
            const depth = sst(archY, archY + 0.25, v);
            let inside = mixc([0.62, 0.7, 0.72], [0.22, 0.2, 0.17], 0.35 + 0.5 * depth);
            inside = mixc(inside, [0.3, 0.4, 0.2], 0.5 * sst(0.55, 0.7, fbm(u * 8, v * 8, 64, 3)) * depth);
            c = mixc(c, inside, sst(0.98, 0.9, dx));
          }
        }
      }
    }
    const ivy = fbm(u * 6, v * 6, 66) + 0.28 * sst(0.55, 1, v) + 0.2 * sst(0.25, 0, u);
    c = mixc(c, mul([0.24, 0.33, 0.15], 0.7 + 0.6 * fbm(u * 20, v * 20, 67, 3)), sst(0.66, 0.74, ivy));
    c = mixc(c, [0.78, 0.76, 0.72], 0.18);
    return mul(c, 0.9 + 0.2 * u);
  },
  // a street at night, neon signs and their reflections
  neon(u, v) {
    let c = mixc([0.025, 0.03, 0.06], [0.06, 0.05, 0.09], v);
    const signs: [number, number, number, number, C][] = [
      [0.14, 0.08, 0.62, 0.035, [0.25, 0.85, 0.95]],
      [0.33, 0.25, 0.55, 0.02, [0.98, 0.82, 0.32]],
      [0.6, 0.12, 0.5, 0.03, [0.95, 0.3, 0.62]],
      [0.82, 0.3, 0.64, 0.025, [0.45, 0.92, 0.55]],
      [0.94, 0.05, 0.35, 0.02, [0.98, 0.55, 0.25]],
    ];
    const refl = v > 0.7;
    const vv = refl ? 1.4 - v : v;
    for (const [x, y0, y1, w, col] of signs) {
      const dx = (u - x + (refl ? 0.01 * (fbm(u * 30, v * 60, 71, 2) - 0.5) : 0)) / w;
      const inY = sst(y0 - 0.03, y0 + 0.02, vv) * sst(y1 + 0.03, y1 - 0.02, vv);
      const core = Math.exp(-dx * dx * 2.2) * inY;
      const glow = Math.exp(-dx * dx * 0.08) * (0.25 + 0.75 * inY) * 0.35;
      const k = (core + glow) * (refl ? 0.45 * sst(0.7, 0.78, v) : 1);
      c = add(c, mixc(col, [1, 1, 1], core * 0.45), k);
    }
    for (let i = 0; i < 9; i++) {
      const bx = hash(i, 1, 72);
      const by = 0.1 + 0.6 * hash(i, 2, 72);
      const br = 0.04 + 0.06 * hash(i, 3, 72);
      const d = Math.hypot(u - bx, v - by) / br;
      const col = signs[i % signs.length][4];
      c = add(c, col, 0.16 * (1 - sst(0.8, 1, d)));
    }
    if (refl) c = mixc(c, [0.05, 0.05, 0.08], 0.25 * fbm(u * 4, v * 40, 73, 3));
    return c;
  },
  // steel beams crossing a bright sky
  girders(u, v) {
    let c = mixc([0.14, 0.38, 0.66], [0.62, 0.76, 0.86], sst(0, 1, v * 0.8 + u * 0.3));
    const sun = Math.exp(-((u - 0.86) ** 2 + (v - 0.08) ** 2) / 0.03);
    c = add(c, [1, 0.88, 0.66], 0.55 * sun);
    const beams: [number, number, number, number, number][] = [
      [-0.1, 0.38, 1.1, 0.02, 0.11],
      [-0.05, 1.0, 1.1, 0.46, 0.13],
      [0.62, -0.1, 0.8, 1.1, 0.09],
    ];
    for (const [x0, y0, x1, y1, w] of beams) {
      const ex = x1 - x0;
      const ey = y1 - y0;
      const L = Math.hypot(ex, ey);
      const t = ((u - x0) * ex + (v - y0) * ey) / (L * L);
      const s = ((u - x0) * -ey + (v - y0) * ex) / L;
      const a = Math.abs(s) / (w / 2);
      if (a < 1.05 && t > -0.1 && t < 1.1) {
        let steel = mixc([0.13, 0.15, 0.19], [0.3, 0.32, 0.36], fbm(u * 14, v * 14, 81, 3));
        steel = mul(steel, 0.75 + 0.5 * (1 - a * a)); // rounded across its width
        const lit = sst(0.55, 0.95, -s / (w / 2));
        steel = mixc(steel, [0.92, 0.66, 0.42], lit * 0.75);
        // lattice holes in the web
        const k = (t * L) / w;
        const web = Math.abs(((k % 1) + 1) % 1 - 0.5);
        const hole = sst(0.62, 0.55, a) * sst(0.36, 0.3, Math.abs(web - Math.abs(s / (w / 2)) * 0.5));
        steel = mixc(steel, mixc(c, [0.1, 0.12, 0.15], 0.55), hole * 0.4);
        c = mixc(c, steel, sst(1.05, 0.95, a));
      }
    }
    return mixc(c, [0.75, 0.8, 0.86], 0.08);
  },
  // soft clay hills under a lavender sky
  clay(u, v) {
    let c = mixc([0.48, 0.52, 0.9], [0.74, 0.7, 0.93], sst(0, 0.75, v));
    c = mixc(c, [0.92, 0.9, 0.98], 0.4 * sst(0.55, 0.8, fbm(u * 2.5, v * 6, 91, 4)) * (1 - v));
    const domes: [number, number, number, number, C, number][] = [
      [0.8, 0.95, 0.38, 0.42, [0.5, 0.64, 0.42], 0.35],
      [1.02, 0.98, 0.22, 0.55, [0.24, 0.4, 0.3], 0.28],
      [0.28, 1.0, 0.34, 0.38, [0.94, 0.62, 0.64], 0.22],
      [0.58, 1.06, 0.22, 0.3, [0.62, 0.74, 0.44], 0.12],
      [0.2, 1.14, 0.4, 0.4, [0.9, 0.32, 0.28], 0.03],
      [0.7, 1.18, 0.32, 0.32, [0.8, 0.24, 0.26], 0.0],
      [1.02, 1.12, 0.25, 0.3, [0.5, 0.68, 0.4], 0.0],
    ];
    for (const [cx, base, rx, ry, col, haze] of domes) {
      const dx = (u - cx) / rx;
      const dy = (base - v) / ry;
      const r2 = dx * dx + dy * dy;
      if (v > base || r2 > 1.02) continue;
      const nz = Math.sqrt(Math.max(0, 1 - r2));
      const lit = Math.max(0, dx * -0.45 + dy * 0.55 + nz * 0.7);
      let body = mul(col, 0.45 + 0.7 * lit);
      body = add(body, [1, 1, 1], 0.22 * Math.pow(lit, 12));
      body = mul(body, 0.75 + 0.25 * sst(0, 0.35, dy));
      body = mixc(body, [0.74, 0.72, 0.93], haze);
      c = mixc(c, body, sst(1.02, 0.97, r2));
    }
    return c;
  },
  // bright blue sky over a grassy slope with one tree
  slope(u, v) {
    let c = mixc([0.08, 0.38, 0.82], [0.42, 0.7, 0.95], sst(0, 0.85, v));
    c = mixc(c, [0.85, 0.92, 1], 0.18 * sst(0.55, 0.8, fbm(u * 3, v * 5, 101, 4)));
    const line = 0.95 - 0.36 * u + 0.025 * (fbm(u * 6, 0.5, 102, 3) - 0.5);
    if (v > line) {
      const g = fbm(u * 12 + v * 6, v * 22, 103);
      let grass = mixc([0.6, 0.58, 0.22], [0.86, 0.8, 0.42], g);
      grass = mul(grass, 0.8 + 0.35 * fbm(u * 3, v * 7, 104, 3));
      c = mixc(c, grass, sst(line, line + 0.012, v));
    }
    // one small tree on the crest
    const tx = 0.42;
    const ty = 0.95 - 0.36 * tx;
    let td = 9;
    for (const [ox, oy, r] of [
      [0, -0.085, 0.05],
      [-0.035, -0.065, 0.038],
      [0.035, -0.06, 0.04],
      [0.01, -0.12, 0.035],
    ] as const)
      td = Math.min(td, Math.hypot(u - tx - ox, v - ty - oy) / r);
    td += 0.3 * (fbm(u * 26, v * 26, 105, 3) - 0.5);
    const trunk = Math.abs(u - tx) < 0.006 && v > ty - 0.06 && v < ty + 0.005 ? 1 : 0;
    const leaf = 0.7 + 0.7 * fbm(u * 30, v * 30, 106, 2);
    c = mixc(c, [0.16, 0.14, 0.1], trunk);
    c = mixc(c, add(mul([0.12, 0.22, 0.09], leaf), [0.2, 0.18, 0.05], 0.3 * sst(0.4, -0.4, (u - tx) * 20)), sst(1.05, 0.85, td));
    return c;
  },
};

/** paint a scene "photo" at low resolution; it gets scaled up with smoothing, which gives the soft focus */
function paintScene(art: SceneArt, pw: number, ph: number) {
  const c = document.createElement("canvas");
  c.width = pw;
  c.height = ph;
  const g = c.getContext("2d")!;
  const im = g.createImageData(pw, ph);
  const d = im.data;
  const fn = SHADERS[art];
  const a = ph / pw;
  for (let y = 0; y < ph; y++)
    for (let x = 0; x < pw; x++) {
      const col = fn((x + 0.5) / pw, (y + 0.5) / ph, a);
      const n = (hash(x, y, 999) - 0.5) * 0.05;
      // a light vignette, like a lens
      const vx = (x + 0.5) / pw - 0.5;
      const vy = (y + 0.5) / ph - 0.5;
      const vig = 1 - 0.18 * (vx * vx + vy * vy) * 2;
      const i = (y * pw + x) * 4;
      d[i] = Math.max(0, Math.min(255, (col[0] * vig + n) * 255));
      d[i + 1] = Math.max(0, Math.min(255, (col[1] * vig + n) * 255));
      d[i + 2] = Math.max(0, Math.min(255, (col[2] * vig + n) * 255));
      d[i + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return c;
}

/** a soft two-colour "photo" for scenes given only colours */
function paintColors(cols: [string, string], pw: number, ph: number) {
  const a = hex2(cols[0]);
  const b = hex2(cols[1]);
  const c = document.createElement("canvas");
  c.width = pw;
  c.height = ph;
  const g = c.getContext("2d")!;
  const im = g.createImageData(pw, ph);
  const d = im.data;
  for (let y = 0; y < ph; y++)
    for (let x = 0; x < pw; x++) {
      const u = (x + 0.5) / pw;
      const v = (y + 0.5) / ph;
      let col = mixc(a, b, sst(0, 1, v * 0.8 + u * 0.3 + 0.25 * (fbm(u * 2, v * 2, 7, 4) - 0.5)));
      col = mixc(col, [1, 1, 1], 0.12 * sst(0.55, 0.8, fbm(u * 3, v * 4, 9, 4)));
      const n = (hash(x, y, 999) - 0.5) * 0.05;
      const i = (y * pw + x) * 4;
      d[i] = Math.max(0, Math.min(255, (col[0] + n) * 255));
      d[i + 1] = Math.max(0, Math.min(255, (col[1] + n) * 255));
      d[i + 2] = Math.max(0, Math.min(255, (col[2] + n) * 255));
      d[i + 3] = 255;
    }
  g.putImageData(im, 0, 0);
  return c;
}

/** a bold white mark, drawn on its own layer so parts can be cut out of it */
function drawGlyph(g: CanvasRenderingContext2D, kind: GlyphKind, cx: number, cy: number, s: number, letter = "") {
  if (kind === "none" && !letter) return;
  const L = document.createElement("canvas");
  const pad = Math.ceil(s * 0.2);
  const size = Math.ceil(s + pad * 2);
  L.width = L.height = size;
  const l = L.getContext("2d")!;
  l.translate(size / 2, size / 2);
  l.scale(s, s); // the mark is drawn in a unit box from -0.5 to 0.5
  l.fillStyle = "#fff";
  l.strokeStyle = "#fff";
  l.lineCap = "round";
  l.lineJoin = "round";
  const lw = 0.085;
  l.lineWidth = lw;
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    l.beginPath();
    l.roundRect(x, y, w, h, r);
  };
  const cut = (fn: () => void) => {
    l.save();
    l.globalCompositeOperation = "destination-out";
    fn();
    l.restore();
  };
  switch (kind) {
    case "cloud": {
      // a cloud outline with an arrow rising through it
      l.beginPath();
      l.arc(-0.2, 0.06, 0.17, Math.PI * 0.5, Math.PI * 1.45);
      l.arc(0.02, -0.08, 0.23, Math.PI * 1.12, Math.PI * 1.92);
      l.arc(0.24, 0.07, 0.16, Math.PI * 1.55, Math.PI * 0.5);
      l.closePath();
      l.stroke();
      l.beginPath();
      l.moveTo(-0.13, 0.15);
      l.lineTo(0.02, -0.06);
      l.lineTo(0.17, 0.15);
      l.stroke();
      l.beginPath();
      l.moveTo(0.02, 0.2);
      l.lineTo(0.13, 0.36);
      l.lineTo(-0.09, 0.36);
      l.closePath();
      l.fill();
      break;
    }
    case "cube": {
      const t = 0.36;
      const h = t * Math.sin(Math.PI / 3);
      l.beginPath();
      l.moveTo(0, -t);
      l.lineTo(h * 1.15, -t / 2);
      l.lineTo(h * 1.15, t / 2);
      l.lineTo(0, t);
      l.lineTo(-h * 1.15, t / 2);
      l.lineTo(-h * 1.15, -t / 2);
      l.closePath();
      l.fill();
      cut(() => {
        l.lineWidth = 0.05;
        l.lineCap = "butt";
        l.beginPath();
        l.moveTo(-h * 1.15, -t / 2);
        l.lineTo(0, 0);
        l.lineTo(h * 1.15, -t / 2);
        l.moveTo(0, 0);
        l.lineTo(0, t);
        l.stroke();
      });
      break;
    }
    case "hex": {
      l.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        l[i ? "lineTo" : "moveTo"](Math.cos(a) * 0.4, Math.sin(a) * 0.4);
      }
      l.closePath();
      l.stroke();
      l.beginPath();
      l.moveTo(-0.2, -0.12);
      l.lineTo(0, 0.02);
      l.lineTo(0.2, -0.12);
      l.moveTo(0, 0.02);
      l.lineTo(0, 0.24);
      l.stroke();
      break;
    }
    case "links": {
      rr(-0.36, -0.36, 0.44, 0.44, 0.13);
      l.stroke();
      rr(-0.08, -0.08, 0.44, 0.44, 0.13);
      l.stroke();
      // the over/under crossing
      cut(() => {
        l.fillRect(0.04 - lw, -0.08 - lw * 0.5, lw * 2, lw);
      });
      l.beginPath();
      l.moveTo(0.08, -0.12);
      l.lineTo(0.08, 0.0);
      l.stroke();
      break;
    }
    case "ring": {
      l.beginPath();
      l.arc(0, -0.02, 0.33, 0, Math.PI * 2);
      l.stroke();
      l.beginPath();
      l.moveTo(0, -0.2);
      l.lineTo(0.25, 0.28);
      l.lineTo(-0.25, 0.28);
      l.closePath();
      l.stroke();
      break;
    }
    case "brackets": {
      rr(-0.13, -0.13, 0.26, 0.26, 0.07);
      l.stroke();
      l.beginPath();
      l.moveTo(-0.24, -0.36);
      l.lineTo(-0.4, -0.2);
      l.lineTo(-0.4, 0.2);
      l.lineTo(-0.24, 0.36);
      l.moveTo(0.24, -0.36);
      l.lineTo(0.4, -0.2);
      l.lineTo(0.4, 0.2);
      l.lineTo(0.24, 0.36);
      l.stroke();
      break;
    }
    case "asterisk": {
      l.lineWidth = 0.1;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        l.beginPath();
        l.moveTo(Math.cos(a) * 0.14, Math.sin(a) * 0.14);
        l.lineTo(Math.cos(a) * 0.38, Math.sin(a) * 0.38);
        l.stroke();
      }
      l.beginPath();
      l.arc(0, 0, 0.09, 0, Math.PI * 2);
      l.fill();
      break;
    }
    case "capsule": {
      rr(-0.2, -0.38, 0.4, 0.76, 0.2);
      l.stroke();
      l.beginPath();
      l.ellipse(0, 0.02, 0.13, 0.09, -0.6, 0, Math.PI * 2);
      l.fill();
      cut(() => {
        l.beginPath();
        l.arc(0.01, 0.02, 0.035, 0, Math.PI * 2);
        l.fill();
      });
      break;
    }
  }
  if (letter) {
    // the landing mark: a white tile with your letter cut out of it
    rr(-0.34, -0.34, 0.68, 0.68, 0.16);
    l.fill();
    l.setTransform(1, 0, 0, 1, 0, 0);
    cut(() => {
      l.font = `700 ${Math.round(s * 0.46)}px -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif`;
      l.textAlign = "center";
      l.textBaseline = "middle";
      l.fillText(letter, size / 2, size / 2 + s * 0.025);
    });
  }
  g.drawImage(L, cx - size / 2, cy - size / 2);
}

/** cover-fit an image into a w x h box */
function coverImg(g: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const k = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * k;
  const ih = img.naturalHeight * k;
  g.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
}

/** a vertical box blur, made by averaging copies of the source spread along its height */
function vblur(src: HTMLCanvasElement, scale: number, len: number) {
  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));
  const a = document.createElement("canvas");
  a.width = w;
  a.height = h;
  const ag = a.getContext("2d")!;
  ag.imageSmoothingQuality = "high";
  ag.drawImage(src, 0, 0, w, h);
  const L = len * scale;
  const pass = (from: HTMLCanvasElement, span: number, K: number) => {
    const o = document.createElement("canvas");
    o.width = w;
    o.height = h;
    const og = o.getContext("2d")!;
    for (let k = 0; k < K; k++) {
      og.globalAlpha = 1 / (k + 1);
      og.drawImage(from, 0, (k / (K - 1) - 0.5) * span);
    }
    return o;
  };
  const K = clamp(Math.ceil(L / 2.5), 3, 28);
  const p1 = pass(a, L, K);
  return pass(p1, (L / (K - 1)) * 1.2, 4);
}

/** the pillow: a superellipse that gets boxier while it spins */
function pillow(cx: number, cy: number, a: number, b: number, n: number) {
  const p = new Path2D();
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = cx + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
    const y = cy + b * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
    if (i) p.lineTo(x, y);
    else p.moveTo(x, y);
  }
  p.closePath();
  return p;
}

/**
 * A loading splash that resolves into your brand, on a plain white stage. A soft, puffy tile rolls through
 * little photographs like a reel, each with a bold white mark on it. Between holds it spins down to the next
 * one: the picture smears into vertical streaks and the tile turns like a drum, getting shorter and wider with
 * its top and bottom edges blurring away. When your content is ready it lands on your own mark, then cuts to
 * the wordmark, which drops in with a vertical motion-blur stutter and settles crisp.
 * Drag the tile up or down to spin it yourself, or tap it. Keyboard: focus the tile and press Space or Enter
 * to spin it; after the reveal, Replay runs it again.
 */
export function BrandReveal({
  wordmark = "lumen.studio",
  tagline,
  scenes = SCENES,
  logo,
  mark: markText,
  brandColors,
  ready,
  progress,
  minDuration = 2400,
  height,
  onDone,
  onEnter,
  enterLabel = "Enter",
  autoplay = false,
  className = "",
}: BrandRevealProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  // ─── sizes ───
  const [W, setW] = useState(720);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = typeof height === "number" ? height : W < 480 ? 380 : 460;
  const TW = Math.round(clamp(W * 0.22, 132, 248) / 4) * 4; // the tile
  const TH = Math.round(TW * 1.1);
  const CW = Math.round(TW * 1.4); // the canvas, with room for the squash and the soft edge
  const CH = Math.round(TH * 1.4);
  const F = Math.round(clamp(W * 0.042, 26, 46)); // the wordmark
  const [stageH, setStageH] = useState(H);
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (el) setStageH(el.getBoundingClientRect().height || H);
  }, [H, height, W]);
  const cy = Math.round(stageH * 0.48);

  // ─── the reel: your scenes plus the tile it lands on ───
  const reel = useMemo<ReelItem[]>(() => {
    const list = (scenes.length ? scenes : SCENES).map((sc, i): ReelItem => {
      const art = sc.art ? ((sc.art in LEGACY ? LEGACY[sc.art as LegacyArt] : sc.art) as SceneArt) : sc.image || sc.colors ? undefined : ART_CYCLE[i % ART_CYCLE.length];
      return { art, image: sc.image, colors: sc.colors, glyph: sc.glyph ?? (art ? ART_GLYPH[art] : GLYPH_CYCLE[i % GLYPH_CYCLE.length]) };
    });
    return [...list, { art: brandColors ? undefined : "slope", colors: brandColors, glyph: "none", brand: true }];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes, brandColors?.[0], brandColors?.[1]]);
  const N = reel.length;
  const NRef = useRef(N);
  NRef.current = N;

  const [phase, setPhaseState] = useState<Phase>("roll");
  const phaseRef = useRef<Phase>("roll");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const [runId, setRunId] = useState(0);
  const [wordRun, setWordRun] = useState(0);
  const [status, setStatus] = useState("Loading");

  const pos = useMotionValue(0);
  const exit = useMotionValue(0); // extra smear and squeeze as the tile cuts away
  const tileO = useMotionValue(1);
  const wordO = useMotionValue(0);
  const wordY = useMotionValue(0);
  const wordSY = useMotionValue(1);
  const smear = useMotionValue(0);
  const wordShadow = useTransform(smear, (m) => {
    if (m < 0.01) return "none";
    const f = F * m;
    return `0 ${(-f * 0.34).toFixed(1)}px ${(f * 0.06).toFixed(1)}px rgba(0,0,0,${(0.42 * m).toFixed(3)}), 0 ${(f * 0.24).toFixed(1)}px ${(f * 0.09).toFixed(1)}px rgba(0,0,0,${(0.26 * m).toFixed(3)}), 0 ${(-f * 0.7).toFixed(1)}px ${(f * 0.2).toFixed(1)}px rgba(0,0,0,${(0.14 * m).toFixed(3)})`;
  });
  const wordBlur = useTransform(smear, (m) => `blur(${(m * F * 0.05).toFixed(2)}px)`);

  const readyRef = useRef(ready);
  readyRef.current = ready;
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const minRef = useRef(minDuration);
  minRef.current = minDuration;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const elapsedRef = useRef(0);
  const draggingRef = useRef(false);
  const spinningRef = useRef(false);
  const showPct = progress !== undefined;

  const isReady = () => {
    const el = elapsedRef.current;
    if (el < minRef.current) return false;
    if (progressRef.current !== undefined) return progressRef.current >= 1;
    if (readyRef.current !== undefined) return readyRef.current;
    return el >= Math.max(minRef.current, 3600);
  };

  // ─── paint the scenes, stack them into a strip, and pre-blur the strip ───
  type Strip = { base: HTMLCanvasElement; levels: HTMLCanvasElement[]; lens: number[]; n: number; tw: number; th: number };
  const stripRef = useRef<Strip | null>(null);
  const dirtyRef = useRef(true);
  useEffect(() => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const tw = Math.round(TW * dpr);
    const th = Math.round(TH * dpr);
    const n = reel.length;
    const pw = Math.round(TW * 0.72);
    const ph = Math.round(TH * 0.72);
    const letter = (markText ?? wordmark.replace(/[^\p{L}\p{N}]/gu, "").charAt(0) ?? "").toUpperCase();
    const sprites: (HTMLCanvasElement | null)[] = reel.map(() => null);
    const photos: (HTMLImageElement | null)[] = reel.map(() => null);
    let logoImg: HTMLImageElement | null = null;
    let alive = true;
    let timer = 0;
    let raf = 0;

    const finish = (i: number) => {
      const sc = reel[i];
      const c = document.createElement("canvas");
      c.width = tw;
      c.height = th;
      const g = c.getContext("2d")!;
      g.imageSmoothingQuality = "high";
      const ph0 = photos[i];
      if (ph0) coverImg(g, ph0, tw, th);
      else if (sc.art) g.drawImage(paintScene(sc.art, pw, ph), 0, 0, tw, th);
      else g.drawImage(paintColors(sc.colors ?? ["#7fa8ff", "#c9d8ff"], pw, ph), 0, 0, tw, th);
      if (sc.brand && logoImg) {
        const k = Math.min((tw * 0.46) / logoImg.naturalWidth, (th * 0.46) / logoImg.naturalHeight);
        g.drawImage(logoImg, (tw - logoImg.naturalWidth * k) / 2, (th - logoImg.naturalHeight * k) / 2, logoImg.naturalWidth * k, logoImg.naturalHeight * k);
      } else drawGlyph(g, sc.glyph, tw / 2, th / 2, tw * 0.42, sc.brand ? letter : "");
      sprites[i] = c;
    };
    const rebuild = (full: boolean) => {
      if (!alive) return;
      const base = document.createElement("canvas");
      base.width = tw;
      base.height = th * (n + 4);
      const bg = base.getContext("2d")!;
      // two scenes of padding at each end so the drum can wrap around
      for (let k = -2; k < n + 2; k++) {
        const sp = sprites[mod(k, n)];
        const y = (k + 2) * th;
        if (sp) bg.drawImage(sp, 0, y);
        else {
          bg.fillStyle = "#e9eaee";
          bg.fillRect(0, y, tw, th);
        }
      }
      const lens = [0, 0.08 * th, 0.24 * th, 0.6 * th];
      // the blurred copies are small: they are blurry anyway
      const levels = full ? [base, vblur(base, 0.5, lens[1]), vblur(base, 0.34, lens[2]), vblur(base, 0.25, lens[3])] : [base, base, base, base];
      stripRef.current = { base, levels, lens, n, tw, th };
      dirtyRef.current = true;
    };
    const schedule = (full: boolean) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => rebuild(full));
    };
    // paint one scene at a time so the page stays responsive; show the first at once, blur the reel when all are in
    let next = 0;
    const step = () => {
      if (!alive || next >= n) return;
      finish(next++);
      if (next === 1) rebuild(false);
      else if (next === n) schedule(true);
      timer = window.setTimeout(step, 0);
    };
    step();
    // photos replace their painted scene when they arrive
    reel.forEach((sc, i) => {
      const src = sc.brand ? logo : sc.image;
      if (!src) return;
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        if (!alive) return;
        if (sc.brand) logoImg = im;
        else photos[i] = im;
        if (i < next) {
          finish(i);
          if (next >= n) schedule(true);
        }
      };
      im.src = src;
    });
    return () => {
      alive = false;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [reel, TW, TH, logo, markText, wordmark]);

  // ─── drawing loop ───
  useEffect(() => {
    const cv = cvRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cw = Math.round(CW * dpr);
    const ch = Math.round(CH * dpr);
    cv.width = cw;
    cv.height = ch;
    const tw = Math.round(TW * dpr);
    const th = Math.round(TH * dpr);
    const buf = document.createElement("canvas");
    buf.width = tw;
    buf.height = th;
    const b = buf.getContext("2d")!;
    // the mask and the rim light are soft, so they're built at half size and scaled up
    const ms = 0.5;
    const mw = Math.round(cw * ms);
    const mh = Math.round(ch * ms);
    const mask = document.createElement("canvas");
    mask.width = mw;
    mask.height = mh;
    const mk = mask.getContext("2d")!;
    const rim = document.createElement("canvas");
    rim.width = mw;
    rim.height = mh;
    const rk = rim.getContext("2d")!;
    // fine film grain
    const grainC = document.createElement("canvas");
    grainC.width = grainC.height = 160;
    {
      const gg = grainC.getContext("2d")!;
      const im = gg.createImageData(160, 160);
      for (let i = 0; i < im.data.length; i += 4) {
        const r = Math.random();
        const v = r > 0.5 ? 255 : 0;
        im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
        im.data[i + 3] = Math.abs(r - 0.5) * 2 * 17;
      }
      gg.putImageData(im, 0, 0);
    }
    const grain = ctx.createPattern(grainC, "repeat");
    dirtyRef.current = true;
    let raf = 0;
    let lastT = performance.now();
    let lastP = pos.get();
    let vs = 0;
    let maskKey = "";
    let lastPct = -1;

    const warped = (img: HTMLCanvasElement, sc: number, centre: number, d: number) => {
      const A = d * 1.15;
      const span = (th / 2) * (1 + 0.55 * d);
      if (A < 0.01) {
        b.drawImage(img, 0, (centre - th / 2) * sc, img.width, th * sc, 0, 0, tw, th);
        return;
      }
      const sinA = Math.sin(A);
      const map = (y: number) => centre + (Math.asin(((y / th) * 2 - 1) * sinA) / A) * span;
      const bands = Math.ceil(th / 4);
      for (let k = 0; k < bands; k++) {
        const y0 = (k * th) / bands;
        const y1 = ((k + 1) * th) / bands;
        const s0 = map(y0);
        const s1 = map(y1);
        b.drawImage(img, 0, s0 * sc, img.width, Math.max(0.5, (s1 - s0) * sc), 0, y0, tw, y1 - y0 + 0.75);
      }
    };

    const draw = (p: number, speed: number) => {
      const st = stripRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, cw, ch);
      if (!st || st.tw !== tw || st.th !== th) return;
      const n = st.n;
      const ex = exit.get();
      const d = reduced ? 0 : clamp(Math.pow(speed / 6, 0.85) + ex * 0.6, 0, 1);
      const blurLen = reduced ? 0 : Math.min(st.lens[3], speed * th * 0.1 + ex * th * 0.5);

      // the picture, warped onto the drum and smeared along the motion
      b.setTransform(1, 0, 0, 1, 0, 0);
      b.globalAlpha = 1;
      b.clearRect(0, 0, tw, th);
      if (reduced) {
        const base = Math.floor(p);
        const f = p - base;
        b.drawImage(st.base, 0, (mod(base, n) + 2) * th, tw, th, 0, 0, tw, th);
        if (f > 0.001) {
          b.globalAlpha = f;
          b.drawImage(st.base, 0, (mod(base + 1, n) + 2) * th, tw, th, 0, 0, tw, th);
          b.globalAlpha = 1;
        }
      } else {
        const centre = (mod(p, n) + 2.5) * th;
        let i = 0;
        while (i < 2 && blurLen > st.lens[i + 1]) i++;
        const t = clamp((blurLen - st.lens[i]) / (st.lens[i + 1] - st.lens[i]), 0, 1);
        const lv = (k: number) => st.levels[k];
        const scl = (k: number) => lv(k).width / tw;
        warped(lv(i), scl(i), centre, d);
        if (t > 0.01) {
          b.globalAlpha = t;
          warped(lv(i + 1), scl(i + 1), centre, d);
          b.globalAlpha = 1;
        }
      }

      // the tile turns like a drum: shorter and wider, and boxier, while it spins
      const w = TW * (1 + 0.08 * d) * dpr;
      const h = TH * (1 - 0.13 * d - 0.08 * ex) * dpr;
      const x0 = (cw - w) / 2;
      const y0 = (ch - h) / 2;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(buf, x0, y0, w, h);
      if (d > 0.01) {
        const gr = ctx.createLinearGradient(0, y0, 0, y0 + h);
        gr.addColorStop(0, `rgba(0,0,0,${0.3 * d})`);
        gr.addColorStop(0.3, "rgba(0,0,0,0)");
        gr.addColorStop(0.7, "rgba(0,0,0,0)");
        gr.addColorStop(1, `rgba(0,0,0,${0.3 * d})`);
        ctx.fillStyle = gr;
        ctx.fillRect(x0, y0, w, h);
      }
      // a little shading towards the edges, like something inflated
      const rg = ctx.createRadialGradient(cw / 2, ch / 2, Math.min(w, h) * 0.3, cw / 2, ch / 2, Math.max(w, h) * 0.62);
      rg.addColorStop(0, "rgba(0,0,0,0)");
      rg.addColorStop(1, "rgba(0,0,0,0.16)");
      ctx.fillStyle = rg;
      ctx.fillRect(x0, y0, w, h);

      // the soft, feathered pillow shape, with its top and bottom melting away while it spins
      const key = `${Math.round(w / 2)}|${Math.round(h / 2)}|${Math.round(d * 30)}`;
      if (key !== maskKey) {
        maskKey = key;
        const k = ms;
        const nExp = 3.5 + 1.8 * d;
        const path = pillow((cw / 2) * k, (ch / 2) * k, (w / 2) * k, (h / 2) * k, nExp);
        const OFF = mw * 3;
        mk.setTransform(1, 0, 0, 1, 0, 0);
        mk.globalCompositeOperation = "source-over";
        mk.clearRect(0, 0, mw, mh);
        mk.save();
        mk.shadowColor = "#000";
        mk.shadowBlur = TW * 0.05 * dpr * k;
        mk.shadowOffsetX = OFF;
        mk.translate(-OFF, 0);
        mk.fillStyle = "#000";
        mk.fill(path);
        mk.restore();
        if (d > 0.01) {
          // top and bottom melt away while it spins
          const fade = 0.03 + 0.24 * d;
          const vg = mk.createLinearGradient(0, y0 * k, 0, (y0 + h) * k);
          vg.addColorStop(0, "rgba(0,0,0,0)");
          vg.addColorStop(fade, "#000");
          vg.addColorStop(1 - fade, "#000");
          vg.addColorStop(1, "rgba(0,0,0,0)");
          mk.globalCompositeOperation = "destination-in";
          mk.fillStyle = vg;
          mk.fillRect(0, 0, mw, mh);
        }
        // a soft light along the inside of the edge
        rk.setTransform(1, 0, 0, 1, 0, 0);
        rk.clearRect(0, 0, mw, mh);
        rk.save();
        rk.shadowColor = "rgba(255,255,255,0.55)";
        rk.shadowBlur = TW * 0.07 * dpr * k;
        rk.shadowOffsetX = OFF;
        rk.translate(-OFF, 0);
        rk.strokeStyle = "#fff";
        rk.lineWidth = TW * 0.05 * dpr * k;
        rk.stroke(path);
        rk.restore();
      }
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0, cw, ch);
      ctx.globalCompositeOperation = "source-atop";
      ctx.drawImage(rim, 0, 0, cw, ch);
      if (grain) {
        ctx.fillStyle = grain;
        const ox = Math.floor(Math.random() * 160);
        const oy = Math.floor(Math.random() * 160);
        ctx.translate(-ox, -oy);
        ctx.fillRect(ox, oy, cw, ch);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;
      if (!inViewRef.current) return;
      if (phaseRef.current === "roll") elapsedRef.current += dt * 1000;
      const p = pos.get();
      const dp = p - lastP;
      lastP = p;
      vs += (dp / Math.max(dt, 1 / 240) - vs) * 0.35;
      if (Math.abs(dp) < 1e-5 && Math.abs(vs) < 0.02) vs = 0;
      const moving = Math.abs(dp) > 1e-5 || Math.abs(vs) > 0.02 || exit.get() > 0.001;
      if (moving || dirtyRef.current) {
        draw(p, Math.abs(vs));
        dirtyRef.current = moving; // one more clean frame after it stops
      }
      if (showPct && pctRef.current && phaseRef.current === "roll") {
        const pct = Math.round(clamp(progressRef.current ?? 0, 0, 1) * 100);
        if (pct !== lastPct) {
          lastPct = pct;
          pctRef.current.textContent = `${pct}%`;
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TW, TH, CW, CH, reduced, showPct]);

  // ─── the reel's own motion ───
  const ctlRef = useRef<AnimationPlaybackControls | null>(null);
  const resRef = useRef<(() => void) | null>(null);
  const stopReel = useCallback(() => {
    ctlRef.current?.stop();
    ctlRef.current = null;
    const r = resRef.current;
    resRef.current = null;
    r?.();
  }, []);
  const moveReel = useCallback(
    (target: number, opts: Record<string, unknown>) =>
      new Promise<void>((res) => {
        stopReel();
        resRef.current = res;
        ctlRef.current = animate(pos, target, {
          ...opts,
          onComplete: () => {
            ctlRef.current = null;
            resRef.current = null;
            res();
          },
        } as never);
      }),
    [pos, stopReel],
  );
  const skipBrand = (t: number, dir = 1) => (mod(t, NRef.current) === NRef.current - 1 ? t + dir : t);

  // the cut: the tile is gone and the wordmark drops in with a stutter
  const lockup = useCallback(() => {
    setPhase("lockup");
    setStatus(`${wordmark} is ready`);
    setWordRun((r) => r + 1);
    tileO.set(0);
    if (reduced) {
      wordO.set(0);
      animate(wordO, 1, { duration: 0.35 });
      wordY.set(0);
      wordSY.set(1);
      smear.set(0);
    } else {
      wordO.set(1);
      animate(wordY, [-F * 0.42, F * 0.2, -F * 0.09, F * 0.03, 0], { duration: 0.5, times: [0, 0.22, 0.48, 0.74, 1], ease: "easeOut" });
      animate(wordSY, [1.4, 0.93, 1.05, 1], { duration: 0.46, times: [0, 0.3, 0.62, 1], ease: "easeOut" });
      animate(smear, [1, 0.5, 0.72, 0.18, 0], { duration: 0.56, times: [0, 0.2, 0.42, 0.7, 1], ease: "easeOut" });
    }
    window.setTimeout(() => onDoneRef.current?.(), reduced ? 400 : 700);
  }, [reduced, tileO, wordO, wordY, wordSY, smear, wordmark, F]);
  const lockupRef = useRef(lockup);
  lockupRef.current = lockup;

  // the director: hold, roll to the next picture, repeat until ready; then land on your mark and cut
  useEffect(() => {
    let alive = true;
    const sleep = (ms: number) =>
      new Promise<void>((res) => {
        let left = ms;
        let last = performance.now();
        const tk = () => {
          if (!alive) return res();
          const t = performance.now();
          if (inViewRef.current) left -= t - last;
          last = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(50, Math.max(16, left)));
        };
        tk();
      });
    const land = async () => {
      setPhase("land");
      setStatus("Ready");
      const n = NRef.current;
      let target = Math.round(pos.get()) + 1;
      while (mod(target, n) !== n - 1) target++;
      const jump = target - pos.get();
      await moveReel(target, reduced ? { duration: 0.5, ease: "linear" } : { duration: Math.min(0.95, 0.3 + jump * 0.11), ease: [0.6, 0, 0.3, 1.12] });
      if (!alive) return;
      await sleep(reduced ? 350 : 640);
      if (!alive) return;
      if (reduced) {
        await new Promise<void>((r) => animate(tileO, 0, { duration: 0.25, onComplete: () => r() }));
        if (alive) lockupRef.current();
        return;
      }
      // one last fast turn, and cut on the blur
      const ex = animate(exit, [0, 1], { duration: 0.2, ease: "easeIn" });
      void moveReel(target + 1, { duration: 0.26, ease: [0.7, 0, 1, 1] });
      await sleep(185);
      ex.stop();
      exit.set(0);
      if (!alive) return;
      lockupRef.current();
    };
    (async () => {
      let k = 0;
      await sleep(320);
      while (alive && phaseRef.current === "roll") {
        if (draggingRef.current || spinningRef.current) {
          await sleep(80);
          continue;
        }
        if (isReady()) return land();
        await sleep(reduced ? 900 : HOLDS[k % HOLDS.length]);
        if (!alive || draggingRef.current || spinningRef.current) continue;
        if (isReady()) return land();
        const jump = reduced ? 1 : JUMPS[k % JUMPS.length];
        k++;
        const target = skipBrand(Math.round(pos.get()) + jump);
        await moveReel(target, reduced ? { duration: 0.5, ease: "linear" } : { duration: 0.3 + jump * 0.08, ease: [0.6, 0, 0.32, 1.12] });
      }
    })();
    return () => {
      alive = false;
      stopReel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId, reduced]);

  const replay = useCallback(() => {
    if (phaseRef.current !== "lockup") return;
    elapsedRef.current = 0;
    const back = () => {
      setPhase("roll");
      setStatus("Loading");
      tileO.set(1);
      dirtyRef.current = true;
      if (!reduced) {
        // a kick to get the reel going again
        spinningRef.current = true;
        void moveReel(skipBrand(Math.round(pos.get()) + 3), { duration: 0.85, ease: [0.45, 0, 0.3, 1.1] }).then(() => (spinningRef.current = false));
      }
      setRunId((r) => r + 1);
    };
    if (reduced) {
      wordO.set(0);
      back();
      return;
    }
    // the wordmark smears away upwards, then the tile is back
    animate(smear, 1, { duration: 0.16, ease: "easeIn" });
    animate(wordY, -F * 0.5, { duration: 0.16, ease: "easeIn" });
    animate(wordO, 0, { duration: 0.16, ease: "easeIn", onComplete: back });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, F]);

  const spin = useCallback(() => {
    if (phaseRef.current !== "roll") return;
    spinningRef.current = true;
    const target = skipBrand(Math.round(pos.get()) + (reduced ? 1 : 4));
    void moveReel(target, reduced ? { duration: 0.5, ease: "linear" } : { duration: 0.95, ease: [0.35, 0, 0.2, 1.08] }).then(() => (spinningRef.current = false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, moveReel]);

  // ─── drag the drum ───
  const drag = useRef<{ y: number; p: number; moved: number; hist: [number, number][] } | null>(null);
  const dragStart = useCallback(
    (y: number) => {
      if (phaseRef.current !== "roll") return false;
      stopReel();
      draggingRef.current = true;
      drag.current = { y, p: pos.get(), moved: 0, hist: [[performance.now(), pos.get()]] };
      return true;
    },
    [pos, stopReel],
  );
  const dragMove = useCallback(
    (y: number) => {
      const d = drag.current;
      if (!d) return;
      d.moved = Math.max(d.moved, Math.abs(y - d.y));
      const p = d.p + (d.y - y) / (TH * 0.9);
      pos.set(p);
      d.hist.push([performance.now(), p]);
      if (d.hist.length > 6) d.hist.shift();
    },
    [pos, TH],
  );
  const dragEnd = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    draggingRef.current = false;
    if (!d) return;
    if (d.moved < 5) return spin();
    const [t0, p0] = d.hist[0];
    const [t1, p1] = d.hist[d.hist.length - 1];
    const v = performance.now() - t1 > 90 || t1 - t0 < 8 ? 0 : ((p1 - p0) / (t1 - t0)) * 1000;
    const p = pos.get();
    const target = skipBrand(Math.round(p + v * 0.3), v >= 0 ? 1 : -1);
    spinningRef.current = true;
    void moveReel(target, reduced ? { duration: 0.4 } : { type: "spring", velocity: v, stiffness: 130, damping: 18, restDelta: 0.001 }).then(() => (spinningRef.current = false));
  }, [pos, reduced, moveReel, spin]);

  const local = (e: RPointerEvent) => e.clientY - rootRef.current!.getBoundingClientRect().top;
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (phaseRef.current !== "roll") return;
    if (dragStart(local(e))) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    spin();
  };

  // ─── autoplay: watch the reveal, replay it, flick the drum ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      if (drag.current) dragEnd();
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
    const run = (mv: MotionValue<number>, v: number, duration: number, ease: number[] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease, onComplete: () => (own.delete(c), res()) } as never);
        own.add(c);
      });
    const until = async (cond: () => boolean) => {
      while (!cond()) await wait(120);
    };
    const show = async (x: number, y: number) => {
      if (go.get() < 0.5) {
        gx.set(x + 30);
        gy.set(y + 40);
        await run(go, 1, 0.25);
      }
    };
    const tap = async (sel: string, act: () => void) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const bb = root.getBoundingClientRect();
      const x = r.left - bb.left + r.width / 2;
      const y = r.top - bb.top + r.height / 2;
      await show(x, y);
      await Promise.all([run(gx, x, 0.5), run(gy, y, 0.5)]);
      await run(gs, 0.8, 0.08);
      act();
      await run(gs, 1, 0.1);
    };
    const flick = async () => {
      const bb = root.getBoundingClientRect();
      const x = bb.width / 2 + TW * 0.14;
      const y0 = cy + TH * 0.3;
      await show(x, y0);
      await Promise.all([run(gx, x, 0.45), run(gy, y0, 0.45)]);
      await run(gs, 0.8, 0.08);
      if (!dragStart(y0)) return;
      const unsub = gy.on("change", (v) => dragMove(v));
      try {
        await run(gy, y0 - TH * 1.0, 0.22, [0.3, 0, 0.6, 1]);
      } finally {
        unsub();
        dragEnd();
      }
      await run(gs, 1, 0.1);
      await run(go, 0, 0.35);
    };
    (async () => {
      while (alive) {
        await until(() => phaseRef.current === "lockup");
        await wait(2400);
        await tap("[data-replay]", () => replay());
        await run(go, 0, 0.3);
        await wait(1100);
        await flick();
        await until(() => phaseRef.current === "lockup");
        await wait(2400);
        await tap("[data-replay]", () => replay());
        await run(go, 0, 0.3);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced, TW, TH, cy]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const locked = phase === "lockup";
  const letters = [...wordmark];
  // each run the letters settle from their own grey at their own moment
  const greys = useMemo(() => letters.map((_, i) => ({ g: Math.round(110 + 110 * hash(i, wordRun, 7)), d: 0.06 + 0.34 * hash(i, wordRun, 8) })), [wordmark, wordRun]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={rootRef}
      role="region"
      aria-label={`${wordmark} intro`}
      className={`relative w-full select-none overflow-hidden rounded-[28px] bg-white text-black shadow-[0_0_0_1px_rgba(0,0,0,.05)] ${className}`}
      style={{ height: height ?? H }}
    >
      {/* the tile */}
      <motion.div className="absolute" style={{ left: "50%", top: cy - CH / 2, marginLeft: -CW / 2, width: CW, height: CH, opacity: tileO }}>
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <div
          role="button"
          tabIndex={locked ? -1 : 0}
          aria-label="Spin the reel"
          aria-hidden={locked}
          onPointerDown={onDown}
          onPointerMove={(e) => drag.current && dragMove(local(e))}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
          onKeyDown={onKey}
          className={`absolute outline-none [touch-action:none] focus-visible:ring-2 focus-visible:ring-black/45 focus-visible:ring-offset-[6px] ${locked ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
          style={{ left: (CW - TW) / 2, top: (CH - TH) / 2, width: TW, height: TH, borderRadius: TW * 0.32 }}
        />
      </motion.div>

      {/* the wordmark it cuts to */}
      <div className="pointer-events-none absolute inset-x-0 flex justify-center px-4" style={{ top: cy, transform: "translateY(-50%)" }}>
        <motion.h2
          aria-label={wordmark}
          className="m-0 whitespace-pre font-medium leading-none tracking-[-0.035em]"
          style={{ fontSize: F, fontFamily: FONT, opacity: wordO, y: wordY, scaleY: wordSY, textShadow: wordShadow, filter: wordBlur }}
        >
          {letters.map((ch, i) => (
            <motion.span
              key={`${wordRun}-${i}`}
              aria-hidden="true"
              initial={{ color: reduced ? "#000000" : `rgb(${greys[i].g},${greys[i].g},${greys[i].g})` }}
              animate={{ color: "#000000" }}
              transition={{ duration: 0.12, delay: reduced ? 0 : greys[i].d }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.h2>
      </div>
      {tagline && (
        <motion.p
          className="pointer-events-none absolute inset-x-0 m-0 px-6 text-center text-[14px] leading-[1.45] text-[#6e6e73]"
          style={{ top: cy + F * 0.62 + 10 }}
          initial={false}
          animate={{ opacity: locked ? 1 : 0, y: locked ? 0 : 6 }}
          transition={{ duration: 0.45, delay: locked ? (reduced ? 0.1 : 0.7) : 0 }}
        >
          {tagline}
        </motion.p>
      )}

      {/* loading percentage, only when you report progress */}
      {showPct && (
        <motion.span
          ref={pctRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 text-center text-[12px] tabular-nums text-[#86868b]"
          style={{ top: cy + TH / 2 + 22 }}
          initial={false}
          animate={{ opacity: locked ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      {/* after the reveal */}
      <motion.div
        className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-1 px-4"
        initial={false}
        animate={{ opacity: locked ? 1 : 0 }}
        transition={{ duration: 0.35, delay: locked ? (reduced ? 0.1 : 0.9) : 0 }}
        style={{ pointerEvents: locked ? "auto" : "none" }}
      >
        {onEnter && (
          <button
            type="button"
            onClick={onEnter}
            tabIndex={locked ? 0 : -1}
            className="mr-1 flex h-9 items-center gap-1.5 rounded-full bg-black pl-4 pr-3.5 text-[13.5px] font-medium text-white outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2"
          >
            {enterLabel}
            {ic("enter", 13)}
          </button>
        )}
        <button
          type="button"
          data-replay
          onClick={replay}
          tabIndex={locked ? 0 : -1}
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-[#6e6e73] outline-none transition-colors hover:text-black focus-visible:ring-2 focus-visible:ring-black/30"
        >
          {ic("replay", 13)}
          Replay
        </button>
      </motion.div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-black/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```
