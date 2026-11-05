# Forecast Status

Add the "Forecast Status" component from Nexus UI to my project.

An app-review status card that shows its state as weather. Waiting is a lilac sky with clouds drifting by; in review it clouds over and rains; approved, the clouds part, the sun comes out with turning rays and a rainbow; rejected, a purple storm rolls in with sheets of rain and lightning. Every change blends the sky, clouds and rain over a second. Move across the sky and the clouds drift away from you; tap it and the weather answers (a splash, a lightning strike, a sparkle).

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ForecastStatus } from "@/components/forecast-status";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/forecast-status/forecast-status.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type ReviewStatus = "waiting" | "review" | "approved" | "rejected";
export type ForecastStatusProps = {
  status?: ReviewStatus;
  defaultStatus?: ReviewStatus;
  onStatusChange?: (s: ReviewStatus) => void;
  appName?: string;
  version?: string;
  /** reason shown when it's rejected */
  rejection?: string;
  onRelease?: () => void;
  onResubmit?: () => void;
  /** a row of buttons under the card to preview every state */
  showSwitcher?: boolean;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  plane: { vb: 256, body: "<path fill=\"currentColor\" d=\"M231.4 44.34v.15l-58.2 191.94a15.88 15.88 0 0 1-14 11.51q-.69.06-1.38.06a15.86 15.86 0 0 1-14.42-9.15l-36.4-74.7a4 4 0 0 1 .77-4.58l57.92-57.92a8 8 0 0 0-11.31-11.31l-57.95 57.92a4 4 0 0 1-4.58.77l-74.77-36.39a16 16 0 0 1 2.49-29.8l191.94-58.2h.15a16 16 0 0 1 19.74 19.7\"/>" },
  rain: { vb: 256, body: "<path fill=\"currentColor\" d=\"m158.66 196.44l-32 48a8 8 0 1 1-13.32-8.88l32-48a8 8 0 0 1 13.32 8.88m73.21-108.89a76 76 0 0 0-151.78.73A8.18 8.18 0 0 1 72 96h-.6a8.14 8.14 0 0 1-7.4-8.61a92.5 92.5 0 0 1 2.33-16.51a4 4 0 0 0-5-4.78A52.09 52.09 0 0 0 24 116.36C24.2 145.07 48.12 168 76.84 168h36.21l-23.71 35.56a8 8 0 0 0 13.32 8.88L132.28 168H156a76.08 76.08 0 0 0 75.87-80.45\"/>" },
  sun: { vb: 256, body: "<path fill=\"currentColor\" d=\"M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m8 24a64 64 0 1 0 64 64a64.07 64.07 0 0 0-64-64m-69.66 5.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16\"/>" },
  bolt: { vb: 256, body: "<path fill=\"currentColor\" d=\"m213.85 125.46l-112 120a8 8 0 0 1-13.69-7l14.66-73.33l-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41l57.63 21.61a8 8 0 0 1 3 12.95Z\"/>" },
  app: { vb: 256, body: "<path fill=\"currentColor\" d=\"M101.85 191.14C97.34 201 82.29 224 40 224a8 8 0 0 1-8-8c0-42.29 23-57.34 32.86-61.85a8 8 0 0 1 6.64 14.56c-6.43 2.93-20.62 12.36-23.12 38.91c26.55-2.5 36-16.69 38.91-23.12a8 8 0 1 1 14.56 6.64m122-144a16 16 0 0 0-15-15c-12.58-.75-44.73.4-71.4 27.07L88 108.7a8 8 0 0 1-11.33-11.31l26.56-26.57a4 4 0 0 0-2.82-6.82H74.35A15.9 15.9 0 0 0 63 68.68L28.7 103a16 16 0 0 0 9.07 27.16l38.47 5.37l44.21 44.21l5.37 38.49a15.94 15.94 0 0 0 10.78 12.92a16.1 16.1 0 0 0 5.1.83a15.9 15.9 0 0 0 11.3-4.68l34.32-34.3a16 16 0 0 0 4.68-11.35v-26.06a4 4 0 0 0-6.83-2.82l-26.57 26.56a8 8 0 0 1-11.71-.42a8.2 8.2 0 0 1 .6-11.1l49.27-49.27c26.69-26.68 27.84-58.83 27.09-71.42Z\"/>" },
  retry: { vb: 256, body: "<path fill=\"currentColor\" d=\"M244 56v48a12 12 0 0 1-12 12h-48a12 12 0 1 1 0-24h17.1l-19-17.38c-.13-.12-.26-.24-.38-.37A76 76 0 1 0 127 204h1a75.53 75.53 0 0 0 52.15-20.72a12 12 0 0 1 16.49 17.45A99.45 99.45 0 0 1 128 228h-1.37a100 100 0 1 1 71.88-170.94L220 76.72V56a12 12 0 0 1 24 0\"/>" },
  go: { vb: 256, body: "<path fill=\"currentColor\" d=\"M204 64v104a12 12 0 0 1-24 0V93L72.49 200.49a12 12 0 0 1-17-17L163 76H88a12 12 0 0 1 0-24h104a12 12 0 0 1 12 12\"/>" },
} as const;

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const rgb = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixc = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// what the weather is like for each state
type Sky = { top: RGB; mid: RGB; bot: RGB; cover: number; dark: number; rain: number; wind: number; sun: number; storm: number; bow: number };
const SKY: Record<ReviewStatus, Sky> = {
  waiting: { top: hex("#5b4fe0"), mid: hex("#7f73f5"), bot: hex("#c9b8ff"), cover: 0.55, dark: 0.05, rain: 0, wind: 14, sun: 0, storm: 0, bow: 0 },
  review: { top: hex("#1e3aa8"), mid: hex("#3a5fd9"), bot: hex("#7b9cf0"), cover: 0.9, dark: 0.35, rain: 0.55, wind: 30, sun: 0, storm: 0, bow: 0 },
  approved: { top: hex("#1257d6"), mid: hex("#2f86f2"), bot: hex("#ffc35c"), cover: 0.18, dark: 0, rain: 0, wind: 22, sun: 1, storm: 0, bow: 1 },
  rejected: { top: hex("#1a0f33"), mid: hex("#4a1d5c"), bot: hex("#8c2f5c"), cover: 1, dark: 0.85, rain: 1, wind: 90, sun: 0, storm: 1, bow: 0 },
};
const ORDER: ReviewStatus[] = ["waiting", "review", "approved", "rejected"];
const COPY: Record<ReviewStatus, { title: string; icon: keyof typeof ICON; step: number }> = {
  waiting: { title: "Waiting for review", icon: "plane", step: 0 },
  review: { title: "In review", icon: "rain", step: 1 },
  approved: { title: "Approved", icon: "sun", step: 2 },
  rejected: { title: "Rejected", icon: "bolt", step: 2 },
};
const STOP = Symbol("stop");
const CLOUD_H = 0.72; // cloud sprite height, as a share of its width

/**
 * An app-review status card that shows its state as weather. Waiting is a lilac sky with clouds drifting by;
 * in review it clouds over and rains; approved, the clouds part, the sun comes out with turning rays and a
 * rainbow; rejected, a purple storm rolls in with sheets of rain and lightning. Every change blends the sky,
 * clouds and rain over a second. Move across the sky and the clouds drift away from you; tap it and the
 * weather answers (a splash, a lightning strike, a sparkle).
 */
export function ForecastStatus({
  status,
  defaultStatus = "waiting",
  onStatusChange,
  appName = "Orbit",
  version = "Version 2.4 (318)",
  rejection = "Guideline 2.1: the app crashed when we opened it. Fix it and resubmit.",
  onRelease,
  onResubmit,
  showSwitcher = false,
  autoplay = false,
  className = "",
}: ForecastStatusProps) {
  const reduced = !!useReducedMotion();
  const uid = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const [inner, setInner] = useState<ReviewStatus>(defaultStatus);
  const cur = status ?? inner;
  const curRef = useRef(cur);
  curRef.current = cur;
  const set = useCallback(
    (s: ReviewStatus) => {
      if (status === undefined) setInner(s);
      onStatusChange?.(s);
    },
    [status, onStatusChange],
  );

  const [size, setSize] = useState({ w: 360, h: 470 });
  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // pointer and taps feed into the weather
  const ptr = useRef<{ x: number; y: number; vx: number; t: number } | null>(null);
  const taps = useRef<{ x: number; y: number }[]>([]);

  // ─── the sky ───
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const { w: W, h: H } = size;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);

    // clouds: soft puffs pre-drawn once, in a light and a stormy version
    const makeCloud = (seed: number, w: number, tone: string) => {
      const c = document.createElement("canvas");
      const h = w * CLOUD_H;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      const g = c.getContext("2d")!;
      g.scale(dpr, dpr);
      // a row of soft puffs, tallest in the middle, all well inside the sprite so no edge is cut
      const puffs = 8;
      for (let i = 0; i < puffs; i++) {
        const u = i / (puffs - 1);
        const bump = Math.sin(u * Math.PI);
        const px = w * (0.18 + u * 0.64) + Math.sin(seed * 9 + i * 2.1) * w * 0.025;
        const r = w * (0.1 + bump * 0.1 + (((seed * 13 + i * 7) % 5) / 5) * 0.025);
        const py = h * 0.62 - bump * h * 0.2;
        const grad = g.createRadialGradient(px, py - r * 0.2, r * 0.1, px, py, r);
        grad.addColorStop(0, tone);
        grad.addColorStop(0.6, tone.replace(/,1\)$/, ",.9)"));
        grad.addColorStop(1, tone.replace(/,1\)$/, ",0)"));
        g.fillStyle = grad;
        g.beginPath();
        g.arc(px, py, r, 0, Math.PI * 2);
        g.fill();
      }
      return c;
    };
    const clouds = Array.from({ length: 9 }, (_, i) => {
      const w = W * (0.45 + ((i * 37) % 10) / 22);
      return {
        x: ((i * 0.37) % 1) * (W + w) - w,
        y: H * (0.02 + ((i * 0.53) % 1) * 0.5),
        w,
        depth: 0.5 + ((i * 0.61) % 1) * 0.6,
        rank: ((i * 0.71) % 1), // lower ranks appear first as the sky clouds over
        light: makeCloud(i + 1, w, "rgba(255,255,255,1)"),
        dark: makeCloud(i + 1, w, "rgba(70,58,108,1)"),
        push: 0,
      };
    });
    const drops = Array.from({ length: 170 }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 10 + Math.random() * 14, v: 700 + Math.random() * 500, live: Math.random() }));
    const splashes: { x: number; y: number; t: number }[] = [];
    const sparks: { x: number; y: number; t: number; s: number }[] = [];
    const glints = Array.from({ length: 18 }, () => ({ x: Math.random() * W, y: Math.random() * H * 0.6, p: Math.random() * 6 }));
    let bolt: { pts: [number, number][]; t: number } | null = null;
    let flash = 0;
    let nextBolt = 1.2;
    const p: Sky = { ...SKY[curRef.current], top: [...SKY[curRef.current].top] as RGB, mid: [...SKY[curRef.current].mid] as RGB, bot: [...SKY[curRef.current].bot] as RGB };
    let t = 0;
    let last = performance.now();
    let raf = 0;

    const strike = (x?: number) => {
      const pts: [number, number][] = [];
      let bx = x ?? W * (0.2 + Math.random() * 0.6);
      let by = 0;
      pts.push([bx, by]);
      while (by < H * 0.78) {
        by += 14 + Math.random() * 22;
        bx += (Math.random() - 0.5) * 34;
        pts.push([bx, by]);
      }
      bolt = { pts, t: 0 };
      flash = 1;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current) return;
      t += reduced ? 0 : dt;
      // ease every weather setting toward the current state
      const target = SKY[curRef.current];
      const k = reduced ? 1 : 1 - Math.exp(-dt * 1.8);
      p.top = mixc(p.top, target.top, k);
      p.mid = mixc(p.mid, target.mid, k);
      p.bot = mixc(p.bot, target.bot, k);
      (["cover", "dark", "rain", "wind", "sun", "storm", "bow"] as const).forEach((key) => (p[key] = lerp(p[key], target[key], k)));

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, rgb(p.top));
      sky.addColorStop(0.55, rgb(p.mid));
      sky.addColorStop(1, rgb(p.bot));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // sun with turning rays, low on the right
      if (p.sun > 0.01) {
        const sx = W * 0.74;
        const sy = H * 0.62;
        ctx.save();
        ctx.globalAlpha = p.sun;
        ctx.translate(sx, sy);
        ctx.rotate(t * 0.08);
        for (let i = 0; i < 14; i++) {
          ctx.rotate((Math.PI * 2) / 14);
          const rg = ctx.createLinearGradient(0, 0, 0, -H * 0.9);
          rg.addColorStop(0, "rgba(255,236,170,.32)");
          rg.addColorStop(1, "rgba(255,236,170,0)");
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.moveTo(-6, 0);
          ctx.lineTo(-W * 0.09, -H * 0.9);
          ctx.lineTo(W * 0.09, -H * 0.9);
          ctx.lineTo(6, 0);
          ctx.fill();
        }
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = p.sun;
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, W * 0.42);
        glow.addColorStop(0, "rgba(255,248,214,1)");
        glow.addColorStop(0.16, "rgba(255,226,140,.95)");
        glow.addColorStop(0.4, "rgba(255,190,90,.35)");
        glow.addColorStop(1, "rgba(255,170,60,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }
      // rainbow
      if (p.bow > 0.01) {
        const cols = ["#ff4d4d", "#ff9f1a", "#ffe14d", "#4dd96b", "#3aa8ff", "#7a5cff"];
        ctx.save();
        ctx.globalAlpha = p.bow * 0.42;
        ctx.lineWidth = 7;
        cols.forEach((c, i) => {
          ctx.strokeStyle = c;
          ctx.beginPath();
          ctx.arc(W * 0.28, H * 0.98, W * 0.62 - i * 7, Math.PI * 1.05, Math.PI * 1.75);
          ctx.stroke();
        });
        ctx.restore();
      }
      // sparkles in fair weather
      if (p.sun > 0.3) {
        glints.forEach((g) => {
          const a = Math.max(0, Math.sin(t * 2 + g.p)) * p.sun * 0.9;
          if (a < 0.05) return;
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.beginPath();
          ctx.arc(g.x, g.y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // clouds, parallax by depth, pushed by the pointer
      const pt = ptr.current;
      clouds.forEach((c) => {
        const vis = Math.max(0, Math.min(1, (p.cover - c.rank * 0.9) * 3));
        c.x += (p.wind * c.depth + (p.sun > 0.5 ? (c.x + c.w / 2 > W / 2 ? 1 : -1) * 40 * p.sun : 0)) * dt;
        if (c.x > W + 20) c.x = -c.w - 20;
        if (c.x < -c.w - 40) c.x = W + 10;
        if (pt && now - pt.t < 400) {
          const cx = c.x + c.w / 2;
          const cy = c.y + c.w * 0.3;
          const d = Math.hypot(cx - pt.x, cy - pt.y);
          if (d < c.w * 0.6) c.push += (cx > pt.x ? 1 : -1) * (1 - d / (c.w * 0.6)) * 180 * dt + pt.vx * 0.04;
        }
        c.push *= 0.94;
        c.x += c.push * dt * 4;
        if (vis < 0.01) return;
        ctx.globalAlpha = vis * (0.75 + c.depth * 0.25);
        ctx.drawImage(c.light, c.x, c.y, c.w, c.w * CLOUD_H);
        if (p.dark > 0.02) {
          ctx.globalAlpha = vis * p.dark;
          ctx.drawImage(c.dark, c.x, c.y, c.w, c.w * CLOUD_H);
        }
      });
      ctx.globalAlpha = 1;

      // rain: streaks that slant with the wind, splashing at the bottom
      if (p.rain > 0.02 && !reduced) {
        const slant = p.wind / 900;
        ctx.strokeStyle = `rgba(220,230,255,${0.35 + p.storm * 0.2})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        drops.forEach((d) => {
          if (d.live > p.rain) return;
          d.y += d.v * dt * (1 + p.storm * 0.4);
          d.x += d.v * slant * dt;
          if (d.y > H) {
            if (Math.random() < 0.3) splashes.push({ x: d.x, y: H - 4 - Math.random() * 10, t: 0 });
            d.y = -d.l - Math.random() * 40;
            d.x = Math.random() * (W + 60) - 60 * slant * 10;
          }
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - d.l * slant * 1.2, d.y - d.l);
        });
        ctx.stroke();
      }
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        s.t += dt;
        if (s.t > 0.35) {
          splashes.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(230,236,255,${0.5 * (1 - s.t / 0.35)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, 2 + s.t * 30, 1 + s.t * 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // lightning
      if (p.storm > 0.6 && !reduced) {
        nextBolt -= dt;
        if (nextBolt <= 0) {
          strike();
          nextBolt = 1.8 + Math.random() * 2.6;
        }
      }
      if (bolt) {
        const b = bolt as { pts: [number, number][]; t: number };
        b.t += dt;
        const a = Math.max(0, 1 - b.t / 0.28) * (b.t < 0.06 || b.t > 0.11 ? 1 : 0.3);
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.shadowColor = "rgba(200,170,255,1)";
        ctx.shadowBlur = 16;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        b.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
        ctx.restore();
        if (b.t > 0.3) bolt = null;
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(235,225,255,${flash * 0.45})`;
        ctx.fillRect(0, 0, W, H);
        flash = Math.max(0, flash - dt * 4);
      }

      // taps: the weather answers
      while (taps.current.length) {
        const tp = taps.current.shift()!;
        const s = curRef.current;
        if (s === "rejected") strike(tp.x);
        else if (s === "approved") for (let i = 0; i < 14; i++) sparks.push({ x: tp.x, y: tp.y, t: 0, s: i });
        else for (let i = 0; i < 3; i++) splashes.push({ x: tp.x + (i - 1) * 8, y: tp.y, t: -i * 0.08 });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.t += dt;
        if (s.t > 0.8) {
          sparks.splice(i, 1);
          continue;
        }
        const ang = (s.s / 14) * Math.PI * 2;
        const r = 10 + s.t * 70;
        ctx.fillStyle = `rgba(255,240,180,${1 - s.t / 0.8})`;
        ctx.beginPath();
        ctx.arc(s.x + Math.cos(ang) * r, s.y + Math.sin(ang) * r - s.t * 20, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [size, reduced]);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = cardRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const lp = ptr.current;
    const now = performance.now();
    ptr.current = { x, y, vx: lp ? ((x - lp.x) / Math.max(8, now - lp.t)) * 16 : 0, t: now };
  };
  const onTap = (e: RPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const r = cardRef.current!.getBoundingClientRect();
    taps.current.push({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  // ─── autoplay: submit, review, approval, a rejection, and round again ───
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
    const tapAt = async (x: number, y: number, act: () => void) => {
      if (go.get() < 0.5) {
        gx.set(x + 30);
        gy.set(y + 40);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, 0.45), run(gy, y, 0.45)]);
      await run(gs, 0.8, 0.09);
      act();
      await run(gs, 1, 0.11);
    };
    const choose = async (s: ReviewStatus) => {
      const btn = root.querySelector<HTMLElement>(`[data-status="${s}"]`);
      if (btn) {
        const r = btn.getBoundingClientRect();
        const b = root.getBoundingClientRect();
        await tapAt(r.left - b.left + r.width / 2, r.top - b.top + r.height / 2, () => set(s));
        await run(go, 0, 0.3);
      } else set(s);
    };
    const skyTap = async (fx: number, fy: number) => {
      const c = cardRef.current!.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      const x = c.left - b.left + c.width * fx;
      const y = c.top - b.top + c.height * fy;
      await tapAt(x, y, () => taps.current.push({ x: c.width * fx, y: c.height * fy }));
      await run(go, 0, 0.3);
    };
    (async () => {
      await wait(2200);
      while (alive) {
        await choose("review");
        await wait(2800);
        await choose("approved");
        await wait(1600);
        await skyTap(0.3, 0.42);
        await wait(2000);
        await choose("rejected");
        await wait(1500);
        await skyTap(0.62, 0.3);
        await wait(2400);
        await choose("waiting");
        await wait(2600);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const copy = COPY[cur];
  const body: Record<ReviewStatus, string> = {
    waiting: "Submitted 2 hours ago. Reviews usually start within a day.",
    review: "A reviewer is testing your build right now.",
    approved: "Ready for sale. Release it whenever you like.",
    rejected: rejection,
  };
  const steps = ["Submitted", "In review", cur === "rejected" ? "Rejected" : "Approved"];

  return (
    <div ref={rootRef} className={`relative flex w-full max-w-[380px] select-none flex-col items-center ${className}`}>
      <div
        ref={cardRef}
        onPointerMove={onMove}
        onPointerDown={onTap}
        className="relative h-[470px] w-full overflow-hidden rounded-[32px] text-white shadow-[0_30px_60px_-30px_rgba(40,20,120,.6),0_0_0_1px_rgba(0,0,0,.06)]"
        role="group"
        aria-label={`${appName} review status: ${copy.title}`}
      >
        <canvas ref={cvRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <div className="relative flex h-full flex-col p-5 [text-shadow:0_1px_12px_rgba(0,0,40,.25)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-[linear-gradient(145deg,#ff6fb1,#7a5cff_55%,#2f86f2)] shadow-[0_6px_16px_-6px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.35)]">{ic("app", 22)}</span>
            <span>
              <span className="block text-[16px] font-semibold tracking-[-0.015em]">{appName}</span>
              <span className="block text-[12.5px] text-white/80">{version}</span>
            </span>
          </div>

          <div className="mt-12 flex flex-col items-start" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={cur} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }} transition={{ duration: 0.45, ease: [0.3, 0, 0.2, 1] }}>
                <motion.span className="block" initial={{ scale: 0.6, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                  {ic(copy.icon, 34)}
                </motion.span>
                <h3 className="m-0 mt-3 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em]">{copy.title}</h3>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* frosted panel: what's happening, where it's up to, what to do */}
          <div className="mt-auto rounded-[22px] bg-[rgba(16,10,48,.32)] p-4 backdrop-blur-xl [text-shadow:none] shadow-[inset_0_1px_0_rgba(255,255,255,.18)]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.p key={cur} className="m-0 text-[14px] leading-[1.45] text-white/95" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                {body[cur]}
              </motion.p>
            </AnimatePresence>
            <ol className="m-0 mt-4 flex list-none items-center gap-2 p-0" aria-label="Progress">
              {steps.map((s, i) => {
                const done = i <= copy.step;
                const bad = cur === "rejected" && i === 2;
                return (
                  <li key={i} className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <motion.span className="block h-[4px] rounded-full" animate={{ backgroundColor: bad ? "#ff6b8b" : done ? "#ffffff" : "rgba(255,255,255,.25)" }} transition={{ duration: 0.5, delay: i * 0.12 }} />
                    <span className={`truncate text-[10.5px] min-[380px]:text-[11.5px] ${done ? "text-white" : "text-white/80"}`}>{s}</span>
                  </li>
                );
              })}
            </ol>
            <AnimatePresence initial={false}>
              {(cur === "approved" || cur === "rejected") && (
                <motion.button
                  key={cur}
                  type="button"
                  onClick={() => (cur === "approved" ? onRelease?.() : (onResubmit?.(), set("waiting")))}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 42, marginTop: 14 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 28 }}
                  className="flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-white text-[14px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {cur === "approved" ? (
                    <>
                      Release now {ic("go", 14)}
                    </>
                  ) : (
                    <>
                      {ic("retry", 14)} Resubmit
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showSwitcher && (
        <div role="radiogroup" aria-label="Preview a status" className="mt-4 grid grid-cols-2 justify-center gap-1 rounded-[20px] bg-white p-1 min-[380px]:flex min-[380px]:rounded-full shadow-[0_0_0_1px_rgba(0,0,0,.06),0_8px_20px_-14px_rgba(0,0,0,.35)]">
          {ORDER.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={cur === s}
              data-status={s}
              onClick={() => set(s)}
              className={`relative whitespace-nowrap rounded-full px-2 py-1.5 text-[12px] font-medium outline-none sm:px-3 sm:text-[12.5px] focus-visible:ring-2 focus-visible:ring-[#0071e3] ${cur === s ? "text-white" : "text-[#1d1d1f] hover:bg-black/[.04]"}`}
            >
              {cur === s && <motion.span layoutId={`${uid}-pill`} className="absolute inset-0 rounded-full" style={{ background: s === "approved" ? "#2f86f2" : s === "rejected" ? "#6b2a6b" : s === "review" ? "#2a49c7" : "#6d61ec" }} transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
              <span className="relative">{COPY[s].title.replace("Waiting for review", "Waiting")}</span>
            </button>
          ))}
        </div>
      )}

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```

--- components/forecast-status/index.ts ---

```ts
export { ForecastStatus } from "./forecast-status";
export type { ReviewStatus, ForecastStatusProps } from "./forecast-status";
```
