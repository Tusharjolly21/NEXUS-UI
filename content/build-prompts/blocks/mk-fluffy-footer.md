# Fluffy Footer

Add the "Fluffy Footer" section from Nexus UI to my project.

A site footer with a big fluffy creature living in it. Its eyes follow your pointer anywhere on the panel and its head leans after you; point at a link and it looks right at it, eyes wide, while the link gets a soft underline. It blinks now and then, gets sleepy when you stop moving, then dozes off breathing slowly with little z's floating up, and wakes with a startle and a ruffle of fur when you come back. Tap it and it squishes, giggles with its eyes squeezed shut and blushes. Keyboard: Tab through the links and it looks at each one; focus the creature ("Say hi") and press Enter or Space to make it giggle.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { FluffyFooter } from "@/components/blocks/motion-kit/fluffy-footer";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

## API

| Prop | Type | Default | Meaning |
|---|---|---|---|
| `brand` | `string` | `"Mochi"` | the wordmark at the top |
| `tagline` | `string` | `"A tiny studio for friendly brands."` | a short line under the wordmark |
| `columns` | `FooterColumn[]` | `COLUMNS` |  |
| `email` | `string` | `"hello@mochi.studio"` |  |
| `copyright` | `string` | none |  |
| `legal` | `FooterLink[]` | `LEGAL` | small links in the bottom corner |
| `furColor` | `string` | `"#7d8bff"` | the creature's base fur colour; highlights and shadows are derived from it |
| `onNavigate` | `(href: string, label: string) => void` | none | called instead of following the link when you pass it |
| `autoplay` | `boolean` | `false` |  |
| `className` | `string` | `""` |  |

--- components/blocks/motion-kit/fluffy-footer/index.ts ---

```ts
export { FluffyFooter } from "./fluffy-footer";
export type { FooterLink, FooterColumn, FluffyFooterProps } from "./fluffy-footer";
```

--- components/blocks/motion-kit/fluffy-footer/fluffy-footer.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };
export type FluffyFooterProps = {
  /** the wordmark at the top */
  brand?: string;
  /** a short line under the wordmark */
  tagline?: string;
  columns?: FooterColumn[];
  email?: string;
  copyright?: string;
  /** small links in the bottom corner */
  legal?: FooterLink[];
  /** the creature's base fur colour; highlights and shadows are derived from it */
  furColor?: string;
  /** called instead of following the link when you pass it */
  onNavigate?: (href: string, label: string) => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  mail: { vb: 256, body: "<path fill=\"currentColor\" d=\"M224 44H32a12 12 0 0 0-12 12v136a20 20 0 0 0 20 20h176a20 20 0 0 0 20-20V56a12 12 0 0 0-12-12m-30.85 24L128 127.72L62.85 68ZM44 188V83.28l75.89 69.57a12 12 0 0 0 16.22 0L212 83.28V188Z\"/>" },
} as const;

const COLUMNS: FooterColumn[] = [
  { title: "Studio", links: [{ label: "About us", href: "#about" }, { label: "Our work", href: "#work" }, { label: "Journal", href: "#journal" }, { label: "Careers", href: "#careers" }] },
  { title: "Services", links: [{ label: "Branding", href: "#branding" }, { label: "Websites", href: "#websites" }, { label: "Motion", href: "#motion" }, { label: "Illustration", href: "#illustration" }] },
  { title: "Resources", links: [{ label: "Press kit", href: "#press" }, { label: "Free icons", href: "#icons" }, { label: "Newsletter", href: "#newsletter" }, { label: "Podcast", href: "#podcast" }] },
  { title: "Follow", links: [{ label: "Instagram", href: "#instagram" }, { label: "Dribbble", href: "#dribbble" }, { label: "YouTube", href: "#youtube" }, { label: "LinkedIn", href: "#linkedin" }] },
];
const LEGAL: FooterLink[] = [
  { label: "Privacy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
];
const STOP = Symbol("stop");
const ROUNDED = "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Nunito, Quicksand, system-ui, sans-serif";

// ─── colour ───
type RGB = [number, number, number];
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const hexRgb = (h: string): RGB => {
  let s = h.replace("#", "").trim();
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  const n = parseInt(s.slice(0, 6), 16);
  return Number.isNaN(n) || s.length < 6 ? [134, 146, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbHsl = ([r, g, b]: RGB): RGB => {
  r /= 255;
  g /= 255;
  b /= 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};
const hslRgb = (h: number, s: number, l: number): RGB => {
  h = (((h % 360) + 360) % 360) / 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
};
const css = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const BUCKETS = 40;
const mix = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
/** a light ramp for the fur: 0 is the deepest indigo shadow, 0.56 the base colour, 1 the lilac-white tips */
function makeRamp(base: string) {
  const c = hexRgb(base);
  const [h] = rgbHsl(c);
  const stops: [number, RGB][] = [
    [0, mix(c, hslRgb(h + 12, 0.75, 0.12), 0.8)],
    [0.3, mix(c, hslRgb(h + 8, 0.8, 0.22), 0.52)],
    [0.56, c],
    [0.8, mix(c, hslRgb(h + 22, 1, 0.9), 0.55)],
    [1, mix(c, hslRgb(h + 30, 1, 0.97), 0.9)],
  ];
  const at = (t: number): RGB => {
    t = clamp(t, 0, 1);
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i][0]) {
        const [t0, c0] = stops[i - 1];
        const [t1, c1] = stops[i];
        return mix(c0, c1, (t - t0) / (t1 - t0));
      }
    }
    return stops[stops.length - 1][1];
  };
  return { at, bucket: Array.from({ length: BUCKETS }, (_, i) => at(i / (BUCKETS - 1))) };
}
type Ramp = ReturnType<typeof makeRamp>;
const bucketOf = (lv: number) => Math.round(clamp(lv, 0, 1) * (BUCKETS - 1));

const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ─── the creature's shape: a soft superellipse dome in local px, origin at the base centre, y up is negative ───
const P = 2.25;
type Geo = { R: number; Dh: number; M: number; below: number; cw: number; ch: number; ox: number; oy: number; left: number; top: number; L: number };
type Strand = { x: number; y: number; dx: number; dy: number; len: number; w: number; bend: number; b: number; s: number; ph: number; nx: number; ny: number };

const insideF = (x: number, y: number, R: number, Dh: number) => (y >= 0 ? Math.abs(x) / R : Math.pow(Math.pow(Math.abs(x) / R, P) + Math.pow(-y / Dh, P), 1 / P));
const normalAt = (x: number, y: number, R: number, Dh: number): [number, number] => {
  if (y >= 0) return [x < 0 ? -1 : 1, 0];
  const gx = (Math.sign(x) * Math.pow(Math.abs(x) / R, P - 1)) / R;
  const gy = -Math.pow(-y / Dh, P - 1) / Dh;
  const l = Math.hypot(gx, gy) || 1;
  return [gx / l, gy / l];
};
// light from the top left, a little in front
const LX = -0.55;
const LY = 0.75;
const LZ = 0.37;
const shadeAt = (x: number, y: number, R: number, Dh: number) => {
  const u = clamp(x / R, -1, 1);
  const v = clamp(-y / Dh, 0, 1);
  const r2 = Math.min(1, u * u + v * v);
  const nz = Math.sqrt(1 - r2);
  const lam = (u * LX + v * LY + nz * LZ + 0.5) / 1.5;
  return (0.18 + 0.75 * lam) * (0.62 + 0.38 * smooth(-0.05, 0.6, v));
};

/** the outline as ~1px samples with outward normals, with soft lumps so it never reads as a perfect curve */
function outline(R: number, Dh: number, below: number) {
  const raw: [number, number][] = [];
  for (let y = below; y > 0; y -= 2) raw.push([-R, y]);
  const N = 900;
  for (let i = 0; i <= N; i++) {
    const th = Math.PI * (1 - i / N);
    const c = Math.cos(th);
    const s = Math.sin(th);
    raw.push([R * Math.sign(c) * Math.pow(Math.abs(c), 2 / P), -Dh * Math.pow(s, 2 / P)]);
  }
  for (let y = 2; y <= below; y += 2) raw.push([R, y]);
  const cum = [0];
  for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
  const total = cum[cum.length - 1];
  const pts: { x: number; y: number; nx: number; ny: number; s: number }[] = [];
  let j = 1;
  for (let d = 0; d <= total; d += 1) {
    while (j < raw.length - 1 && cum[j] < d) j++;
    const k = (d - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]);
    const x = lerp(raw[j - 1][0], raw[j][0], k);
    const y = lerp(raw[j - 1][1], raw[j][1], k);
    const tx = raw[j][0] - raw[j - 1][0];
    const ty = raw[j][1] - raw[j - 1][1];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = ty / tl;
    const ny = -tx / tl;
    const s = d / total;
    const lift = smooth(0, -Dh * 0.15, y);
    const lump = R * lift * (0.012 * Math.sin(s * Math.PI * 12 + 1.2) + 0.007 * Math.sin(s * Math.PI * 23 + 0.3) + 0.004 * Math.sin(s * Math.PI * 41 + 2.1));
    pts.push({ x: x + nx * lump, y: y + ny * lump, nx, ny, s });
  }
  return pts;
}

type Path = CanvasPath;
const addStrand = (p: Path, x: number, y: number, dx: number, dy: number, len: number, w: number, bend: number) => {
  const px = -dy;
  const py = dx;
  const hw = w / 2;
  const bx = px * bend * len;
  const by = py * bend * len;
  const tx = x + dx * len + bx;
  const ty = y + dy * len + by;
  const mx = x + dx * len * 0.5 + bx * 0.62;
  const my = y + dy * len * 0.5 + by * 0.62;
  p.moveTo(x + px * hw, y + py * hw);
  p.quadraticCurveTo(mx + px * hw * 0.5, my + py * hw * 0.5, tx, ty);
  p.quadraticCurveTo(mx - px * hw * 0.5, my - py * hw * 0.5, x - px * hw, y - py * hw);
  p.closePath();
};

let filterOk: boolean | null = null;
const canFilter = () => {
  if (filterOk === null) {
    const t = document.createElement("canvas").getContext("2d");
    if (t) t.filter = "blur(2px)";
    filterOk = !!t && t.filter === "blur(2px)";
  }
  return filterOk;
};

/** paints the static fur once, in soft layers, and returns the outer strands that move */
function buildFur(g: Geo, ramp: Ramp, dpr: number) {
  const { R, Dh, below, cw, ch, ox, oy, L } = g;
  const rnd = rng(11);
  const mk = (k = 1) => {
    const cv = document.createElement("canvas");
    cv.width = Math.max(2, Math.round(cw * dpr * k));
    cv.height = Math.max(2, Math.round(ch * dpr * k));
    const x = cv.getContext("2d")!;
    x.setTransform(dpr * k, 0, 0, dpr * k, ox * dpr * k, oy * dpr * k);
    return [cv, x] as const;
  };
  const [cache, c] = mk();
  const full = mk();
  const half = mk(0.5);
  // layers that end up blurred are painted at half size, which costs a quarter as much
  let [tmp, tc] = full;
  const pickLevel = (l: typeof full) => ([tmp, tc] = l);
  // blurs a layer onto the cache; ctx.filter where it works, otherwise a scaled copy
  const put = (blur: number, alpha = 1) => {
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = alpha;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    if (blur <= 0) c.drawImage(tmp, 0, 0, cache.width, cache.height);
    else if (blur < 3 && canFilter()) {
      c.filter = `blur(${blur * dpr}px)`;
      c.drawImage(tmp, 0, 0, cache.width, cache.height);
      c.filter = "none";
    } else {
      const k = 1 / (1 + blur * dpr * 0.8);
      const [sm, sx] = mk(k);
      sx.setTransform(1, 0, 0, 1, 0, 0);
      sx.imageSmoothingQuality = "high";
      sx.drawImage(tmp, 0, 0, sm.width, sm.height);
      c.drawImage(sm, 0, 0, cache.width, cache.height);
    }
    c.restore();
    tc.save();
    tc.setTransform(1, 0, 0, 1, 0, 0);
    tc.clearRect(0, 0, tmp.width, tmp.height);
    tc.restore();
  };
  const ol = outline(R, Dh, below);
  const shapePath = (inset: number) => {
    const p = new Path2D();
    ol.forEach((o, i) => (i ? p.lineTo(o.x - o.nx * inset, o.y - o.ny * inset) : p.moveTo(o.x - o.nx * inset, o.y - o.ny * inset)));
    p.lineTo(R - inset, below + 40);
    p.lineTo(-R + inset, below + 40);
    p.closePath();
    return p;
  };

  // a soft contact shadow on the panel behind
  pickLevel(half);
  tc.save();
  tc.translate(R * 0.01, R * 0.035);
  tc.fillStyle = "rgba(16,12,92,.5)";
  tc.fill(shapePath(-L * 0.2));
  tc.restore();
  put(L * 1.1);
  // a translucent halo where the outermost fibres thin out
  tc.fillStyle = css(ramp.at(0.6), 0.55);
  tc.fill(shapePath(-L * 0.35));
  put(L * 0.55);
  // the undercoat colour, so gaps between strands read as depth, never as holes
  const gr = tc.createRadialGradient(-R * 0.34, -Dh * 0.8, 0, -R * 0.1, -Dh * 0.4, R * 1.3);
  gr.addColorStop(0, css(ramp.at(0.7)));
  gr.addColorStop(0.45, css(ramp.at(0.5)));
  gr.addColorStop(1, css(ramp.at(0.22)));
  tc.fillStyle = gr;
  tc.fill(shapePath(L * 0.25));
  put(L * 0.3);

  const d: [number, number] = [0, 0];
  const crownX = -R * 0.04;
  const crownY = -Dh * 0.94;
  const dirAt = (x: number, y: number, comb = 0.55) => {
    let fx = x - crownX;
    let fy = y - crownY;
    const fl = Math.hypot(fx, fy) || 1;
    fx /= fl;
    fy = fy / fl + 0.6;
    const a = 0.7 * Math.sin(x * 0.042 + Math.sin(y * 0.037) * 2.1) * Math.cos(y * 0.031 - x * 0.019) + 0.25 * Math.sin(x * 0.11 + y * 0.09);
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    let rx = fx * ca - fy * sa;
    let ry = fx * sa + fy * ca;
    const e = smooth(0.8, 1.02, insideF(x, y, R, Dh));
    const n = normalAt(x, y, R, Dh);
    rx = lerp(rx, n[0], e * comb);
    ry = lerp(ry, n[1], e * comb);
    const l = Math.hypot(rx, ry) || 1;
    d[0] = rx / l;
    d[1] = ry / l;
  };

  // coats, darker and blurred underneath, finer and lighter on top; strands grow in loose clumps
  const coat = (sp: number, per: number, lenK: number, w: number, shift: number, alpha: number, pull: number) => {
    const paths: (Path2D | null)[] = Array.from({ length: BUCKETS }, () => null);
    for (let gy = -Dh - L; gy < below; gy += sp) {
      for (let gx = -R - L; gx < R + L; gx += sp) {
        const x = gx + rnd() * sp;
        const y = gy + rnd() * sp;
        if (insideF(x, y, R, Dh) > 0.99) continue;
        dirAt(x, y);
        const cl = L * lenK * (0.7 + rnd() * 0.6);
        const tipx = x + d[0] * cl;
        const tipy = y + d[1] * cl;
        const lv = shadeAt(x + d[0] * cl * 0.6, y + d[1] * cl * 0.6, R, Dh) + shift + (rnd() - 0.5) * 0.07;
        const bend = (rnd() - 0.5) * 0.5;
        for (let k = 0; k < per; k++) {
          const rx = x + (rnd() - 0.5) * sp * 1.2;
          const ry = y + (rnd() - 0.5) * sp * 1.2;
          if (insideF(rx, ry, R, Dh) > 1) continue;
          const f = 0.8 + rnd() * 0.35;
          const tx = lerp(rx + d[0] * cl * f, tipx, pull);
          const ty = lerp(ry + d[1] * cl * f, tipy, pull);
          const dx = tx - rx;
          const dy = ty - ry;
          const len = Math.hypot(dx, dy) || 1;
          const b = bucketOf(lv + (rnd() - 0.5) * 0.05);
          const p = paths[b] ?? (paths[b] = new Path2D());
          addStrand(p, rx, ry, dx / len, dy / len, len, w * (0.7 + rnd() * 0.6), bend + (rnd() - 0.5) * 0.25);
        }
      }
    }
    paths.forEach((p, b) => {
      if (!p) return;
      tc.fillStyle = css(ramp.bucket[b], alpha);
      tc.fill(p);
    });
  };
  coat(L * 0.55, 4, 1.2, 2.2, -0.12, 1, 0.22);
  put(1.2);
  pickLevel(full);
  coat(L * 0.44, 4, 1.05, 1.6, -0.04, 1, 0.25);
  put(0.7);

  // the fuzzy edge: strands rooted inside the outline, lying along the flow and lifting past it
  const edgeStrand = (o: (typeof ol)[number], inset: number, lenK: number, shift: number, spread: number, lift: number) => {
    const x = o.x - o.nx * inset;
    const y = o.y - o.ny * inset;
    dirAt(x, y, 0);
    let dx = o.nx * lift + d[0];
    let dy = o.ny * lift + d[1];
    const a = (rnd() - 0.5) * spread;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    [dx, dy] = [dx * ca - dy * sa, dx * sa + dy * ca];
    const dl = Math.hypot(dx, dy) || 1;
    const v = clamp(-y / Dh, 0, 1);
    const len = L * lenK * (0.55 + rnd() * 0.7) * (0.85 + 0.3 * smooth(0.1, 0.95, v));
    const lv = shadeAt(x, y, R, Dh) + shift + (rnd() - 0.5) * 0.08;
    return { x, y, dx: dx / dl, dy: dy / dl, len, b: bucketOf(lv) };
  };
  const edge = (step: number, inMin: number, inMax: number, lenK: number, shift: number, w: number, lift: number) => {
    const paths: (Path2D | null)[] = Array.from({ length: BUCKETS }, () => null);
    for (let i = 0; i < ol.length; i += step) {
      const e = edgeStrand(ol[Math.floor(i)], L * (inMin + rnd() * (inMax - inMin)), lenK, shift, 1.1, lift);
      const p = paths[e.b] ?? (paths[e.b] = new Path2D());
      addStrand(p, e.x, e.y, e.dx, e.dy, e.len, w * (0.7 + rnd() * 0.6), (rnd() - 0.5) * 0.6);
    }
    paths.forEach((p, b) => {
      if (!p) return;
      tc.fillStyle = css(ramp.bucket[b], 0.9);
      tc.fill(p);
    });
  };
  edge(0.7, 0.3, 1.1, 1.0, -0.02, 1.5, 0.62);
  put(0.5);
  coat(L * 0.46, 3, 0.85, 1.25, 0.04, 0.9, 0.3);
  edge(0.9, 0.1, 0.8, 0.9, 0.06, 1.1, 0.7);
  put(0);
  coat(L * 0.6, 2, 0.6, 0.95, 0.12, 0.75, 0.35);
  put(0);

  // the outer strands that sway, rim-lit by the glow behind
  const fringe: Strand[] = [];
  for (let i = 0; i < ol.length; i += 1.1) {
    const o = ol[Math.floor(i)];
    const e = edgeStrand(o, L * (0.1 + rnd() * 0.5), 0.92, 0.14, 1.1, 0.75);
    fringe.push({ ...e, w: 0.8 + rnd() * 0.6, bend: (rnd() - 0.5) * 0.9, s: o.s, ph: rnd() * Math.PI * 2, nx: o.nx, ny: o.ny });
  }
  // a cowlick at the crown
  const top = ol.reduce((a, o) => (o.y < a.y ? o : a), ol[0]);
  for (let k = 0; k < 16; k++) {
    const ang = -Math.PI / 2 + (k - 7.5) * 0.07 - 0.2;
    fringe.push({ x: top.x - R * 0.015 + (k - 8) * 1.2, y: top.y + L * 0.6, dx: Math.cos(ang), dy: Math.sin(ang), len: L * (1.3 + rnd() * 0.8), w: 1.4 + rnd() * 0.8, bend: -0.3 - rnd() * 0.2, b: bucketOf(0.84 + rnd() * 0.1), s: top.s, ph: rnd() * 6, nx: 0, ny: -1 });
  }
  const byBucket: number[][] = Array.from({ length: BUCKETS }, () => []);
  fringe.forEach((f, i) => byBucket[f.b].push(i));
  return { cache, fringe, byBucket };
}

/**
 * A site footer with a big fluffy creature living in it. Its eyes follow your pointer anywhere on the panel and
 * its head leans after you; point at a link and it looks right at it, eyes wide, while the link gets a soft
 * underline. It blinks now and then, gets sleepy when you stop moving, then dozes off breathing slowly with
 * little z's floating up, and wakes with a startle and a ruffle of fur when you come back. Tap it and it
 * squishes, giggles with its eyes squeezed shut and blushes.
 * Keyboard: Tab through the links and it looks at each one; focus the creature ("Say hi") and press Enter or
 * Space to make it giggle.
 */
export function FluffyFooter({
  brand = "Mochi",
  tagline = "A tiny studio for friendly brands.",
  columns = COLUMNS,
  email = "hello@mochi.studio",
  copyright = `© ${new Date().getFullYear()} Mochi Studio`,
  legal = LEGAL,
  furColor = "#7d8bff",
  onNavigate,
  autoplay = false,
  className = "",
}: FluffyFooterProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.15 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const measured = !!box;
  const W = box?.w ?? 1000;
  const wide = W >= 860;
  const twoByTwo = W < 560;
  const pad = W < 400 ? 20 : wide ? 40 : 28;
  const H = wide ? Math.round(clamp(W * 0.39, 400, 440)) : box?.h ?? 700;

  // where the creature sits: big and centred on wide panels, peeking from the bottom on narrow ones
  const geo = useMemo<Geo & { cx: number; baseY: number }>(() => {
    // on wide panels it leaves room for the copyright and legal links in the corners
    const R = wide ? Math.min(W * 0.3, W / 2 - pad - 150) : Math.min(W * 0.5, 300);
    const Dh = wide ? Math.min(H * 0.6, R * 0.86) : R * 0.84;
    const L = clamp(R * 0.05, 8.5, 17);
    const M = Math.round(R * 0.16 + L * 2);
    const below = 36;
    const cx = W / 2;
    const baseY = wide ? H : H + Dh * 0.26;
    const cw = Math.round(2 * R + 2 * M);
    const ch = Math.round(Dh + M + below);
    return { R, Dh, L, M, below, cw, ch, ox: R + M, oy: Dh + M, left: Math.round(cx - R - M), top: Math.round(baseY - Dh - M), cx, baseY };
  }, [W, H, wide, pad]);
  const geoRef = useRef(geo);
  geoRef.current = geo;
  const ramp = useMemo(() => makeRamp(furColor), [furColor]);

  // ─── the creature's state, read by the animation loop ───
  const sim = useRef({
    clock: 0,
    lastActive: 0,
    mood: "awake" as "awake" | "sleepy" | "asleep",
    look: null as { x: number; y: number } | null, // canvas px
    curious: 0,
    pupil: [0, 0.12, 0, 0.12],
    pupilV: [0, 0, 0, 0],
    lean: 0,
    leanV: 0,
    sq: 0,
    sqV: 0,
    jy: 0,
    jyV: 0,
    lid: 1,
    lidV: 0,
    es: 1,
    esV: 0,
    cur: 0,
    curV: 0,
    nextBlink: 1800,
    blinkT0: -1e9,
    blinkTwice: false,
    giggleT0: -1e9,
    startleT0: -1e9,
    ruffles: [] as { t0: number; mode: 0 | 1 }[],
    sleepAmt: 0,
    rise: 1,
    riseV: 0,
    idle: { sleepy: 5000, asleep: 7600 },
  });
  const [asleep, setAsleep] = useState(false);
  const [say, setSay] = useState("");
  const [hot, setHot] = useState<string | null>(null);
  const hotRef = useRef<string | null>(null);

  const poke = useCallback(() => {
    const s = sim.current;
    s.lastActive = s.clock;
    if (s.mood === "asleep") {
      s.mood = "awake";
      setAsleep(false);
      s.startleT0 = s.clock;
      if (!reducedRef.current) {
        s.sqV -= 2.6;
        s.jyV -= 150;
        s.lidV += 9;
        s.ruffles.push({ t0: s.clock, mode: 1 });
      }
    } else if (s.mood === "sleepy") s.mood = "awake";
  }, []);

  const giggle = useCallback(() => {
    const s = sim.current;
    poke();
    s.giggleT0 = s.clock;
    if (!reducedRef.current) {
      s.sqV += 2.3;
      s.ruffles.push({ t0: s.clock, mode: 0 });
    }
    setSay(`${brand} giggles.`);
    window.setTimeout(() => setSay(""), 1800);
  }, [poke, brand]);

  // points on the panel, in canvas px
  const toCanvas = useCallback((clientX: number, clientY: number) => {
    const cv = cvRef.current;
    if (!cv) return null;
    const r = cv.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }, []);
  const lookAtEl = useCallback(
    (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const p = toCanvas(r.left + r.width / 2, r.top + r.height / 2);
      if (p) sim.current.look = p;
    },
    [toCanvas],
  );

  // ─── the loop: springs, moods, then paint ───
  const builtRef = useRef(false);
  useEffect(() => {
    if (!measured) return;
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    // painting the fur takes a moment, so a resize waits until it settles
    const tid = window.setTimeout(() => {
    const g = geoRef.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { cache, fringe, byBucket } = buildFur(g, ramp, dpr);
    cv.width = Math.round(g.cw * dpr);
    cv.height = Math.round(g.ch * dpr);
    builtRef.current = true;
    const fringeCss = ramp.bucket.map((c) => css(c, 0.78));
    const { R, Dh, ox, oy, cw, ch } = g;
    // the face, in local px
    const EX = R * 0.255;
    const EY = -Dh * 0.62;
    const erx = R * 0.118;
    const ery = R * 0.132;
    const MY = EY + ery * 1.34;
    const lidCol = (i: number) => {
      const lv = shadeAt(i ? EX : -EX, EY - ery, R, Dh);
      return [css(ramp.at(lv - 0.12)), css(ramp.at(lv - 0.3))];
    };
    const lidTone = [lidCol(0), lidCol(1)];
    // short fur that laps over the rim of each eye, so they sit in the fur instead of on it
    const rimFur = [0, 1].map((i) => {
      const r = rng(31 + i);
      const out: { a: number; k: number; dx: number; dy: number; len: number; w: number; bend: number; c: string }[] = [];
      for (let n = 0; n < 120; n++) {
        const lower = n >= 92;
        const a = lower ? Math.PI * (0.25 + r() * 0.5) : Math.PI * (1.02 + r() * 0.96);
        const k = 1.04 + r() * 0.14;
        let dx = -Math.cos(a) * 0.9 + (r() - 0.5) * 0.5;
        let dy = -Math.sin(a) * 0.9 + (lower ? -0.1 : 0.3);
        const l = Math.hypot(dx, dy) || 1;
        dx /= l;
        dy /= l;
        const ex = (i ? EX : -EX) + Math.cos(a) * erx;
        const ey = EY + Math.sin(a) * ery;
        out.push({ a, k, dx, dy, len: erx * (lower ? 0.1 + r() * 0.12 : 0.15 + r() * 0.2), w: 1.3 + r() * 1.3, bend: (r() - 0.5) * 0.6, c: css(ramp.at(shadeAt(ex, ey, R, Dh) - 0.1 + (r() - 0.5) * 0.12), 0.92) });
      }
      return out;
    });
    let last = performance.now();
    let t = 0;

    const spring = (o: Record<string, unknown>, k: string, kv: string, target: number, stiff: number, damp: number, dt: number) => {
      const x = o[k] as number;
      let v = o[kv] as number;
      v += (-stiff * (x - target) - damp * v) * dt;
      o[k] = x + v * dt;
      o[kv] = v;
    };

    const eye = (i: number, open: number, sx: number, look: number[], happy: boolean, cur: number) => {
      const s = sim.current;
      const cx = i ? EX : -EX;
      const rx = erx * sx;
      const ry = ery * sx;
      // a soft socket where the fur dips around the eye
      const so = ctx.createRadialGradient(cx, EY + ry * 0.1, ry * 0.7, cx, EY + ry * 0.1, ry * 1.5);
      so.addColorStop(0, "rgba(20,14,90,.5)");
      so.addColorStop(1, "rgba(20,14,90,0)");
      ctx.fillStyle = so;
      ctx.beginPath();
      ctx.ellipse(cx, EY + ry * 0.1, rx * 1.55, ry * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, EY, rx, ry, 0, 0, Math.PI * 2);
      ctx.clip();
      // the eyeball
      const sc = ctx.createRadialGradient(cx - rx * 0.3, EY - ry * 0.35, ry * 0.1, cx, EY, ry * 1.05);
      sc.addColorStop(0, "#ffffff");
      sc.addColorStop(0.7, "#f3f3ff");
      sc.addColorStop(1, "#c9cdf6");
      ctx.fillStyle = sc;
      ctx.fillRect(cx - rx, EY - ry, rx * 2, ry * 2);
      // iris and pupil
      const ir = rx * 0.64;
      const px = cx + look[i * 2] * (rx - ir - rx * 0.04);
      const py = EY + look[i * 2 + 1] * (ry - ir - rx * 0.02);
      const ig = ctx.createRadialGradient(px, py + ir * 0.35, ir * 0.15, px, py, ir);
      ig.addColorStop(0, "#ffd66b");
      ig.addColorStop(0.55, "#ffa83a");
      ig.addColorStop(0.9, "#e86a1c");
      ig.addColorStop(1, "#8a3a10");
      ctx.fillStyle = ig;
      ctx.beginPath();
      ctx.arc(px, py, ir, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#16112f";
      ctx.beginPath();
      ctx.arc(px, py, ir * (0.52 + cur * 0.08), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.95)";
      ctx.beginPath();
      ctx.ellipse(px - ir * 0.36, py - ir * 0.4, ir * 0.3, ir * 0.24, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px + ir * 0.34, py + ir * 0.32, ir * 0.11, 0, Math.PI * 2);
      ctx.fill();
      // shade cast by the upper lid
      const closed = clamp(1 - open, 0, 1);
      const uy = lerp(EY - ry * 1.08, EY + ry * 0.3, closed);
      const ub = lerp(-ry * 0.32, ry * 0.3, closed);
      const ls = ctx.createLinearGradient(0, uy - ry * 0.1, 0, uy + ry * 0.55);
      ls.addColorStop(0, "rgba(30,20,110,.38)");
      ls.addColorStop(1, "rgba(30,20,110,0)");
      ctx.fillStyle = ls;
      ctx.fillRect(cx - rx, EY - ry, rx * 2, ry * 2);
      // lids are cut from the fur itself
      const lowerRise = happy ? 1 : closed * closed * 0.9 + (s.mood === "sleepy" ? 0.08 : 0);
      const ly = lerp(EY + ry * 1.08, EY + ry * 0.3, lowerRise);
      const bx0 = cx - rx * 1.2;
      const by0 = EY - ry * 1.3;
      const bw = rx * 2.4;
      const bh = ry * 2.6;
      if (closed > 0.002 || lowerRise > 0.002) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - rx * 1.2, EY - ry * 1.3);
        ctx.lineTo(cx + rx * 1.2, EY - ry * 1.3);
        ctx.lineTo(cx + rx * 1.2, uy);
        ctx.quadraticCurveTo(cx, uy + ub * 2, cx - rx * 1.2, uy);
        ctx.closePath();
        // same winding as the upper lid, so where they overlap stays covered
        ctx.moveTo(cx + rx * 1.2, EY + ry * 1.3);
        ctx.lineTo(cx - rx * 1.2, EY + ry * 1.3);
        ctx.lineTo(cx - rx * 1.2, ly);
        ctx.quadraticCurveTo(cx, ly + ry * 0.22, cx + rx * 1.2, ly);
        ctx.closePath();
        ctx.clip();
        // a rounded lid: lit on top, turning darker as it curves down to the lash line
        const lg = ctx.createLinearGradient(0, EY - ry, 0, Math.max(uy, EY - ry * 0.4) + ry * 0.05);
        lg.addColorStop(0, lidTone[i][0]);
        lg.addColorStop(1, lidTone[i][1]);
        ctx.fillStyle = lg;
        ctx.fillRect(cx - rx * 1.2, EY - ry * 1.3, rx * 2.4, ry * 2.6);
        ctx.globalAlpha = 0.38;
        ctx.drawImage(cache, (bx0 + ox) * dpr, (by0 + oy) * dpr, bw * dpr, bh * dpr, bx0, by0, bw, bh);
        ctx.globalAlpha = 1;
        const hl = ctx.createRadialGradient(cx - rx * 0.3, EY - ry * 0.45, 0, cx - rx * 0.3, EY - ry * 0.45, rx * 0.9);
        hl.addColorStop(0, "rgba(255,255,255,.16)");
        hl.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = hl;
        ctx.fillRect(cx - rx * 1.2, EY - ry * 1.3, rx * 2.4, ry * 2.6);
        ctx.restore();
      }
      // lash lines
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(22,16,70,.82)";
      ctx.lineWidth = Math.max(1.6, rx * lerp(0.075, 0.11, closed));
      if (uy > EY - ry * 1.02 && !happy) {
        ctx.beginPath();
        ctx.moveTo(cx + rx * 1.2, uy);
        ctx.quadraticCurveTo(cx, uy + ub * 2, cx - rx * 1.2, uy);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = `rgba(24,16,96,${0.3 * clamp(open, 0, 1)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, EY, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (const f of rimFur[i]) {
        ctx.beginPath();
        addStrand(ctx, cx + Math.cos(f.a) * rx * f.k, EY + Math.sin(f.a) * ry * f.k, f.dx, f.dy, f.len * sx, f.w, f.bend);
        ctx.fillStyle = f.c;
        ctx.fill();
      }
      // happy squeeze: ^ ^
      if (happy) {
        ctx.strokeStyle = "#1c1450";
        ctx.lineWidth = Math.max(2.4, rx * 0.2);
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(cx - rx * 0.62, EY + ry * 0.22);
        ctx.quadraticCurveTo(cx - rx * 0.2, EY - ry * 0.42, cx, EY - ry * 0.4);
        ctx.quadraticCurveTo(cx + rx * 0.2, EY - ry * 0.42, cx + rx * 0.62, EY + ry * 0.22);
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current) return;
      const s = sim.current;
      const red = reducedRef.current;
      s.clock += dt * 1000;
      t += red ? 0 : dt;

      // moods
      const idle = s.clock - s.lastActive;
      if (s.mood === "awake" && idle > s.idle.sleepy) s.mood = "sleepy";
      if (s.mood === "sleepy" && idle > s.idle.asleep) {
        s.mood = "asleep";
        setAsleep(true);
      }
      s.sleepAmt = lerp(s.sleepAmt, s.mood === "asleep" ? 1 : 0, red ? 1 : 1 - Math.exp(-dt * 2.5));
      const giggling = s.clock - s.giggleT0 < 950;

      // blinks every 2 to 6 seconds, sometimes twice
      if (s.mood === "awake" && !giggling && s.clock > s.nextBlink) {
        s.blinkT0 = s.clock;
        s.blinkTwice = Math.random() < 0.28;
        s.nextBlink = s.clock + 2000 + Math.random() * 4000;
      }
      const bt = s.clock - s.blinkT0;
      const blinkOne = (u: number) => (red ? (u >= 0 && u < 120 ? 0 : 1) : u < 0 ? 1 : u < 70 ? 1 - u / 70 : u < 100 ? 0 : u < 220 ? smooth(100, 220, u) : 1);
      const blink = Math.min(blinkOne(bt), s.blinkTwice ? blinkOne(bt - 260) : 1);

      // where to look, per eye
      const sx0 = 1 + s.sq * 0.55;
      const sy0 = 1 - s.sq;
      const lk = s.look;
      for (let i = 0; i < 2; i++) {
        let tx = 0;
        let ty = 0.12;
        if (lk && s.mood !== "asleep") {
          const ex = ox + (i ? EX : -EX) * sx0 - s.lean * EY * sy0;
          const ey = oy + s.jy + s.rise * (Dh + 30) + EY * sy0;
          const dx = lk.x - ex;
          const dy = lk.y - ey;
          const dist = Math.hypot(dx, dy) || 1;
          const m = Math.min(1, dist / (R * 0.8));
          tx = (dx / dist) * m;
          ty = (dy / dist) * m;
        }
        const ml = Math.hypot(tx, ty);
        if (ml > 1) {
          tx /= ml;
          ty /= ml;
        }
        const o = s.pupil;
        const v = s.pupilV;
        for (let k = 0; k < 2; k++) {
          const j = i * 2 + k;
          const target = k ? ty : tx;
          v[j] += (-260 * (o[j] - target) - 21 * v[j]) * dt;
          o[j] += v[j] * dt;
        }
      }
      // lean, squash, hop, lids
      const sinceG = (s.clock - s.giggleT0) / 1000;
      const wob = giggling && !red ? Math.sin(sinceG * 27) * 0.05 * Math.exp(-sinceG * 2.6) : 0;
      const leanTarget = red || !lk || s.mood === "asleep" ? 0 : clamp((lk.x - ox) / (R * 2.4), -1, 1) * 0.075;
      spring(s, "lean", "leanV", leanTarget, 90, 13, dt);
      spring(s, "sq", "sqV", 0, 300, 11, dt);
      spring(s, "jy", "jyV", 0, 230, 15, dt);
      // on first sight it pops up from below the edge
      if (red) s.rise = 0;
      else spring(s, "rise", "riseV", 0, 52, 8.5, dt);
      const lift = s.jy + s.rise * (Dh + 30);
      spring(s, "cur", "curV", s.curious, 160, 18, dt);
      const lidTarget = s.mood === "asleep" ? 0 : s.mood === "sleepy" ? 0.46 : 1 + s.curious * 0.12;
      if (red) {
        s.lid = lidTarget;
        s.lidV = 0;
      } else spring(s, "lid", "lidV", lidTarget, s.mood === "awake" ? 260 : 40, s.mood === "awake" ? 20 : 11, dt);
      spring(s, "es", "esV", 1 + s.curious * 0.07, 200, 16, dt);
      if (red) {
        s.lean = 0;
        s.sq = 0;
        s.jy = 0;
      }
      const breathe = red ? 0 : Math.sin(t * lerp(1.9, 1.15, s.sleepAmt)) * lerp(0.006, 0.026, s.sleepAmt);
      const hop = giggling && !red ? -Math.abs(Math.sin(sinceG * 15)) * 3.2 * Math.exp(-sinceG * 2.4) : 0;
      const sx = 1 + s.sq * 0.55 - breathe * 0.35;
      const sy = 1 - s.sq + breathe + s.cur * 0.012;
      const lean = s.lean + wob;

      // ── paint ──
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(dpr * sx, 0, -dpr * lean * sy, dpr * sy, dpr * ox, dpr * (oy + lift + hop));
      ctx.drawImage(cache, -ox, -oy, cw, ch);

      // the moving outer fur: wind, plus ruffle waves that make it stand up as they pass
      s.ruffles = s.ruffles.filter((r) => s.clock - r.t0 < 1100);
      const waves: [number, number][] = [];
      s.ruffles.forEach((r) => {
        const age = (s.clock - r.t0) / 1000;
        const amp = Math.exp(-age * 2.2);
        if (r.mode === 0) waves.push([-0.12 + age * 1.5, amp]);
        else {
          waves.push([0.5 - age * 0.9, amp]);
          waves.push([0.5 + age * 0.9, amp]);
        }
      });
      const windA = red ? 0 : lerp(0.07, 0.035, s.sleepAmt);
      for (let b = 0; b < BUCKETS; b++) {
        const list = byBucket[b];
        if (!list.length) continue;
        ctx.beginPath();
        for (let q = 0; q < list.length; q++) {
          const f = fringe[list[q]];
          let r = 0;
          for (let w = 0; w < waves.length; w++) {
            const z = (f.s - waves[w][0]) / 0.07;
            r += waves[w][1] * Math.exp(-z * z);
          }
          let dx = f.dx;
          let dy = f.dy;
          if (r > 0.01) {
            dx += f.nx * r * 0.7;
            dy += f.ny * r * 0.7;
            const l = Math.hypot(dx, dy) || 1;
            dx /= l;
            dy /= l;
          }
          const sway = Math.sin(t * 1.7 + f.s * 16 + f.ph) * windA + Math.sin(t * 0.7 + f.ph * 2) * windA * 0.5;
          addStrand(ctx, f.x, f.y, dx, dy, f.len * (1 + r * 0.5), f.w, f.bend + sway + r * 0.25 * Math.sin(f.ph));
        }
        ctx.fillStyle = fringeCss[b];
        ctx.fill();
      }

      // the face
      const happy = giggling;
      const open = happy ? 0 : clamp(s.lid, 0, 1.3) * blink;
      for (let i = 0; i < 2; i++) eye(i, open, s.es, s.pupil, happy, s.cur);
      // blush, warmer while it giggles
      const since = (s.clock - s.giggleT0) / 1000;
      const pulse = since < 1.6 ? Math.sin(Math.min(1, since / 0.25) * Math.PI * 0.5) * Math.exp(-Math.max(0, since - 0.25) * 1.6) : 0;
      for (let i = 0; i < 2; i++) {
        const bx = (i ? 1 : -1) * R * 0.43;
        const by = EY + ery * 1.15;
        const br = R * (0.115 + pulse * 0.025);
        // tint the fur itself pink, then add a little warmth on top
        for (let pass = 0; pass < 2; pass++) {
          const al = pass ? 0.16 + pulse * 0.25 : 0.85 + pulse * 0.15;
          const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
          bg.addColorStop(0, `rgba(255,96,170,${al})`);
          bg.addColorStop(0.3, `rgba(255,96,170,${al * 0.8})`);
          bg.addColorStop(0.7, `rgba(255,96,170,${al * 0.28})`);
          bg.addColorStop(1, "rgba(255,96,170,0)");
          ctx.globalCompositeOperation = pass ? "source-over" : "color";
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.ellipse(bx, by, br, br * 0.62, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
      }
      // mouth
      const mw = R * 0.05;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (happy) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(-mw * 1.25, MY - mw * 0.1);
        ctx.quadraticCurveTo(0, MY - mw * 0.35, mw * 1.25, MY - mw * 0.1);
        ctx.quadraticCurveTo(mw * 1.05, MY + mw * 1.4, 0, MY + mw * 1.4);
        ctx.quadraticCurveTo(-mw * 1.05, MY + mw * 1.4, -mw * 1.25, MY - mw * 0.1);
        ctx.closePath();
        ctx.fillStyle = "#2a1052";
        ctx.fill();
        ctx.clip();
        ctx.fillStyle = "#ff7aa6";
        ctx.beginPath();
        ctx.ellipse(0, MY + mw * 1.3, mw * 0.8, mw * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (s.cur > 0.5 && s.mood === "awake") {
        ctx.fillStyle = "#2a1052";
        ctx.beginPath();
        ctx.ellipse(0, MY + mw * 0.3, mw * 0.42 * s.cur, mw * 0.55 * s.cur, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = "#221653";
        ctx.lineWidth = Math.max(1.8, R * 0.016);
        ctx.beginPath();
        if (s.mood === "asleep") {
          ctx.moveTo(-mw * 0.5, MY + mw * 0.1);
          ctx.quadraticCurveTo(0, MY + mw * 0.45, mw * 0.5, MY + mw * 0.1);
        } else {
          ctx.moveTo(-mw, MY);
          ctx.quadraticCurveTo(-mw * 0.5, MY + mw * 0.7, 0, MY + mw * 0.05);
          ctx.quadraticCurveTo(mw * 0.5, MY + mw * 0.7, mw, MY);
        }
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(frame);
    }, builtRef.current ? 160 : 0);
    return () => {
      window.clearTimeout(tid);
      cancelAnimationFrame(raf);
    };
  }, [measured, geo.cw, geo.ch, geo.R, geo.Dh, ramp]);

  // z's float up while it sleeps
  const [zs, setZs] = useState<number[]>([]);
  useEffect(() => {
    if (!asleep) {
      setZs([]);
      return;
    }
    if (reduced) return;
    let n = 0;
    const add = () => inViewRef.current && setZs((z) => [...z.slice(-3), n++]);
    add();
    const id = window.setInterval(add, 1150);
    return () => window.clearInterval(id);
  }, [asleep, reduced]);

  // ─── pointer: anywhere on the panel ───
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const p = toCanvas(e.clientX, e.clientY);
    if (!p) return;
    if (!hotRef.current) sim.current.look = p;
    poke();
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    const p = toCanvas(e.clientX, e.clientY);
    if (p && !(e.target as HTMLElement).closest("a")) sim.current.look = p;
    poke();
  };
  const onLeave = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") sim.current.look = null;
  };
  const setHotLink = useCallback(
    (id: string | null, el?: HTMLElement) => {
      hotRef.current = id;
      setHot(id);
      sim.current.curious = id ? 1 : 0;
      if (id && el) lookAtEl(el);
      poke();
    },
    [lookAtEl, poke],
  );
  const follow = (href: string, label: string) => (e: { preventDefault: () => void }) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href, label);
    }
  };

  // ─── autoplay: follow the finger, look at two links, a tap, a nap, a wake-up ───
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
    const s = sim.current;
    s.idle = { sleepy: 1600, asleep: 3200 };
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
      s.idle = { sleepy: 5000, asleep: 7600 };
      if (hotRef.current) setHotLink(null);
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    let moved = 0;
    const onMouse = (e: PointerEvent) => {
      if (!e.isTrusted || e.pointerType !== "mouse") return;
      moved += Math.abs(e.movementX) + Math.abs(e.movementY);
      if (moved > 24) abort();
    };
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    root.addEventListener("pointermove", onMouse, true);
    // the eyes follow the ghost while it's showing
    const feed = () => {
      if (!alive || go.get() < 0.3 || hotRef.current) return;
      const cv = cvRef.current;
      if (!cv) return;
      const g = geoRef.current;
      s.look = { x: gx.get() - g.left, y: gy.get() - g.top };
      poke();
    };
    const unsubs = [gx.on("change", feed), gy.on("change", feed)];
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const tt = performance.now();
          if (inViewRef.current) left -= tt - lastT;
          lastT = tt;
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
    const box = () => root.getBoundingClientRect();
    const at = (el: Element) => {
      const r = el.getBoundingClientRect();
      const b = box();
      return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
    };
    const moveTo = async (x: number, y: number, d: number) => {
      if (go.get() < 0.5) {
        gx.set(x + 30);
        gy.set(y + 40);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, d), run(gy, y, d)]);
    };
    const hover = async (sel: string) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return;
      const p = at(el);
      await moveTo(p.x - Math.min(20, el.offsetWidth / 3), p.y + 4, 0.55);
      setHotLink(el.dataset.link ?? null, el);
      await wait(1000);
    };
    (async () => {
      await wait(500);
      while (alive) {
        const b = box();
        const g = geoRef.current;
        // a swoop across the panel
        await moveTo(b.width * 0.78, b.height * 0.32, 0.5);
        await moveTo(b.width * 0.55, g.baseY - g.Dh * 1.25, 0.6);
        await moveTo(b.width * 0.22, b.height * 0.62, 0.7);
        // two links, one on each side
        const links = root.querySelectorAll<HTMLElement>("nav [data-link]");
        if (links.length) {
          await hover(`[data-link="${links[Math.min(1, links.length - 1)].dataset.link}"]`);
          setHotLink(null);
          await hover(`[data-link="${links[Math.max(0, links.length - 3)].dataset.link}"]`);
          setHotLink(null);
        }
        // a tap on the creature
        const hi = root.querySelector("[data-sayhi]");
        if (hi) {
          const r = hi.getBoundingClientRect();
          const bb = box();
          await moveTo(r.left - bb.left + r.width * 0.62, r.top - bb.top + Math.min(r.height * 0.55, g.Dh * 0.55), 0.6);
          await run(gs, 0.8, 0.08);
          giggle();
          await run(gs, 1, 0.12);
        }
        await wait(700);
        // hold still: sleepy, then asleep
        await run(go, 0, 0.4);
        await wait(6200);
        // and back again
        await moveTo(b.width * 0.68, b.height * 0.42, 0.45);
        await wait(1600);
        await moveTo(b.width * 0.4, b.height * 0.3, 0.7);
        await wait(500);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      unsubs.forEach((u) => u());
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
      root.removeEventListener("pointermove", onMouse, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const ic = (k: keyof typeof ICON, sz = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={sz} height={sz} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;

  // ─── content ───
  const fs = wide ? clamp(W * 0.058, 52, 70) : clamp(W * 0.13, 42, 58);
  // every link draws the eyes: hover with a mouse, or focus with the keyboard
  const lookProps = (id: string) => ({
    "data-link": id,
    onPointerEnter: (e: RPointerEvent<HTMLElement>) => e.pointerType === "mouse" && setHotLink(id, e.currentTarget),
    onPointerLeave: (e: RPointerEvent<HTMLElement>) => e.pointerType === "mouse" && hotRef.current === id && setHotLink(null),
    onFocus: (e: { currentTarget: HTMLElement }) => setHotLink(id, e.currentTarget),
    onBlur: () => hotRef.current === id && setHotLink(null),
  });
  const underline = (id: string, cls = "-bottom-[1px] h-[3px]") => (
    <motion.span
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 right-0 rounded-full bg-[#ffe27a] shadow-[0_0_10px_rgba(255,226,122,.75)] ${cls}`}
      style={{ originX: 0 }}
      initial={false}
      animate={{ scaleX: hot === id ? 1 : 0, opacity: hot === id ? 1 : 0 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
    />
  );
  const wordmark = (
    <a href="#top" {...lookProps("brand")} onClick={follow("#top", brand)} className="group relative block rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#4350ef]" aria-label={`${brand}, back to top`}>
      <svg width={fs * 0.66 * brand.length + fs * 0.4} height={fs * 1.22} viewBox={`0 0 ${fs * 0.66 * brand.length + fs * 0.4} ${fs * 1.22}`} aria-hidden="true" className="block overflow-visible">
        <text x="50%" y={fs * 0.98} textAnchor="middle" fontSize={fs} fontWeight={800} fontFamily={ROUNDED} letterSpacing={fs * 0.01} fill="#2b2bb8" stroke="#2b2bb8" strokeWidth={fs * 0.2} strokeLinejoin="round" transform={`translate(0 ${fs * 0.07})`}>
          {brand}
        </text>
        <text x="50%" y={fs * 0.98} textAnchor="middle" fontSize={fs} fontWeight={800} fontFamily={ROUNDED} letterSpacing={fs * 0.01} fill="#ffffff" stroke="#ffffff" strokeWidth={fs * 0.11} strokeLinejoin="round">
          {brand}
        </text>
      </svg>
    </a>
  );
  const linkClass = "relative inline-block rounded-[6px] py-[3px] text-[14.5px] font-medium leading-[1.35] text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4350ef]";
  const column = (col: FooterColumn, ci: number) => (
    <nav key={ci} aria-labelledby={`ff-${ci}-${brand.replace(/\W/g, "")}`} className="min-w-0">
      <h4 id={`ff-${ci}-${brand.replace(/\W/g, "")}`} className="m-0 mb-2 text-[13px] font-semibold text-[#fff0b8]">
        {col.title}
      </h4>
      <ul className="m-0 list-none space-y-[3px] p-0">
        {col.links.map((l, li) => {
          const id = `${ci}-${li}`;
          return (
            <li key={id}>
              <a href={l.href} {...lookProps(id)} onClick={follow(l.href, l.label)} className={linkClass}>
                {l.label}
                {underline(id)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
  const half = Math.ceil(columns.length / 2);
  const zk = wide ? 1 : 0.6;
  const mail = (
    <a
      href={`mailto:${email}`}
      {...lookProps("mail")}
      onClick={follow(`mailto:${email}`, email)}
      className="pointer-events-auto inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[15px] font-semibold text-[#2f2fc0] shadow-[0_10px_24px_-10px_rgba(20,14,110,.7),inset_0_-2px_0_rgba(47,47,192,.12)] outline-none transition-transform duration-150 hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#4350ef]"
    >
      <span className="text-[#ff5fa8]">{ic("mail", 17)}</span>
      {email}
    </a>
  );
  const small = (
    <>
      <p className="m-0 text-[12.5px] leading-5 text-white/85">{copyright}</p>
      <ul className="m-0 flex list-none gap-4 p-0 text-[12.5px] leading-5">
        {legal.map((l) => (
          <li key={l.label}>
            <a href={l.href} {...lookProps(`legal-${l.label}`)} onClick={follow(l.href, l.label)} className="relative inline-block rounded-[4px] text-[12.5px] text-white/85 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white">
              {l.label}
              {underline(`legal-${l.label}`, "-bottom-[2px] h-[2px]")}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
  const sayHi = (
    <button
      type="button"
      data-sayhi
      aria-label="Say hi"
      onClick={giggle}
      className="absolute z-[5] cursor-pointer rounded-t-[50%] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
      style={{ left: geo.cx - geo.R * 0.8, width: geo.R * 1.6, top: geo.baseY - geo.Dh * 0.98, height: Math.max(40, H - (geo.baseY - geo.Dh * 0.98)) }}
    />
  );

  return (
    <footer ref={rootRef} className={`relative mx-auto w-full max-w-[1100px] select-none ${className}`}>
      <div
        ref={panelRef}
        onPointerMove={onMove}
        onPointerDown={onDown}
        onPointerLeave={onLeave}
        className="relative overflow-hidden rounded-[28px] text-white shadow-[0_30px_60px_-32px_rgba(40,36,180,.7),0_0_0_1px_rgba(30,30,160,.08)]"
        style={{
          height: wide ? H : undefined,
          background: `radial-gradient(${geo.R * 1.9}px ${geo.Dh * 1.6}px at 50% ${geo.baseY}px, rgba(124,140,255,.95), rgba(124,140,255,.55) 45%, rgba(124,140,255,0) 72%), linear-gradient(180deg, #4552f4 0%, #4350ef 45%, #3a3fd9 100%)`,
        }}
      >
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute" style={{ left: geo.left, top: geo.top, width: geo.cw, height: geo.ch }} />

        {wide ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center" style={{ top: pad - 6 }}>
              <div className="pointer-events-auto">{wordmark}</div>
              {tagline && <p className="m-0 mt-1 text-[14px] text-white/90">{tagline}</p>}
            </div>
            <div className="absolute flex gap-[clamp(24px,3.4vw,48px)]" style={{ left: pad, top: pad + 4 }}>
              {columns.slice(0, half).map((c, i) => column(c, i))}
            </div>
            <div className="absolute flex gap-[clamp(24px,3.4vw,48px)]" style={{ right: pad, top: pad + 4 }}>
              {columns.slice(half).map((c, i) => column(c, i + half))}
            </div>
            {sayHi}
            <div className="pointer-events-none absolute inset-x-0 z-10 flex justify-center" style={{ bottom: Math.round(H * 0.045) }}>
              {mail}
            </div>
            <div className="pointer-events-none absolute inset-x-0 flex items-end justify-between [&>*]:pointer-events-auto" style={{ bottom: pad - 12, paddingLeft: pad, paddingRight: pad }}>
              {small}
            </div>
          </>
        ) : (
          <div className="relative flex flex-col items-center" style={{ padding: `${pad}px ${pad}px 0` }}>
            {wordmark}
            {tagline && <p className="m-0 mt-1 text-center text-[14px] text-white/90">{tagline}</p>}
            <div className={`mt-7 grid w-full gap-x-6 gap-y-6 ${twoByTwo ? "grid-cols-2" : "grid-cols-4"}`}>{columns.map((c, i) => column(c, i))}</div>
            <div className="relative z-10 mt-8">{mail}</div>
            <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1">{small}</div>
            <div aria-hidden="true" style={{ height: geo.Dh * 0.74 + 58 }} />
            {sayHi}
          </div>
        )}

        {/* z's while it sleeps */}
        <div aria-hidden="true" className="pointer-events-none absolute z-20" style={{ left: geo.cx + geo.R * 0.4, top: geo.baseY - geo.Dh * 0.98 }}>
          <AnimatePresence>
            {reduced && asleep
              ? [0, 1, 2].map((i) => (
                  <motion.span key={`r${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0 }} className="absolute font-extrabold text-white [text-shadow:0_2px_0_rgba(43,43,184,.55)]" style={{ left: i * 16, top: -i * 20, fontSize: 16 + i * 6, fontFamily: ROUNDED }}>
                    z
                  </motion.span>
                ))
              : zs.map((z) => (
                  <motion.span
                    key={z}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5, rotate: 8 }}
                    animate={{ opacity: [0, 1, 1, 0], x: [0, 14, 26, 40].map((v) => v * zk), y: [0, -26, -52, -78].map((v) => v * zk), scale: [0.5, 0.85, 1.05, 1.2], rotate: [8, -6, 6, -10] }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ duration: 2.8, ease: "easeOut", times: [0, 0.3, 0.7, 1] }}
                    className="absolute font-extrabold text-white [text-shadow:0_2px_0_rgba(43,43,184,.55)]"
                    style={{ fontSize: geo.R * 0.07 + 12, fontFamily: ROUNDED }}
                  >
                    z
                  </motion.span>
                ))}
          </AnimatePresence>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {say}
      </p>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </footer>
  );
}
```
