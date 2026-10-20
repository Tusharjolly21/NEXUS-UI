"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Density = "low" | "medium" | "high";
type Direction = "up" | "down" | "random";

export type SparklesProps = {
  /** Base number of sparkles, before `density` scales it. */
  count?: number;
  /** Sparkle colour (any CSS colour). Defaults to blue on light, ice white on dark. */
  color?: string;
  /** Smallest sparkle radius in px. */
  minSize?: number;
  /** Largest sparkle radius in px. The biggest fifth are drawn as four-point stars. */
  maxSize?: number;
  /** Speed multiplier for twinkling and drift. */
  speed?: number;
  /** Overall opacity, 0.1 to 1. */
  opacity?: number;
  className?: string;
  /** Mount as an absolute layer filling the parent. */
  background?: boolean;
  /** Density preset that scales `count`. */
  density?: Density;
  /** Which way the sparkles drift while they shine. */
  direction?: Direction;
  /** Soft bloom round each sparkle. */
  enableGlow?: boolean;
  /** A trail of sparkles follows the pointer, and a click throws a burst that falls and fades. */
  interactive?: boolean;
  /** Throws a few bursts at set points until someone touches the layer. */
  autoplay?: boolean;
};

const MULT: Record<Density, number> = { low: 0.7, medium: 1, high: 1.45 };
const DEMO = [
  [0.3, 0.42],
  [0.7, 0.58],
  [0.52, 0.32],
];

type Twinkle = { x: number; y: number; r: number; t: number; dur: number; dx: number; dy: number; rot: number; a: number; star: boolean };
type Bit = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; rot: number; vr: number };

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
}

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/** A canvas colour string (#rrggbb or rgb/rgba) at zero alpha. */
function clear(c: string) {
  if (c.startsWith("#") && c.length === 7) {
    const n = parseInt(c.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0)`;
  }
  const m = c.match(/[\d.]+/g);
  return m && m.length >= 3 ? `rgba(${m[0]},${m[1]},${m[2]},0)` : "rgba(255,255,255,0)";
}

/** 0 → overshoots to about 1.1 → 1, the "pop" every sparkle makes when it appears. */
const backOut = (u: number) => 1 + 2.70158 * (u - 1) ** 3 + 1.70158 * (u - 1) ** 2;
const envelope = (t: number) => (t < 0.22 ? backOut(t / 0.22) : t < 0.6 ? 1 : 1 - ((t - 0.6) / 0.4) ** 2);

/**
 * A canvas layer of sparkles. Each one pops in with a small overshoot, turns
 * as it shines, drifts and fades, then reappears somewhere else. With
 * `interactive`, the pointer leaves a sparkling trail and a click throws a
 * burst that arcs down under gravity.
 */
export function Sparkles({
  count = 36,
  color,
  minSize = 0.9,
  maxSize = 2.8,
  speed = 1,
  opacity = 0.9,
  className,
  background = false,
  density = "medium",
  direction = "random",
  enableGlow = true,
  interactive = false,
  autoplay = false,
}: SparklesProps) {
  const still = useReducedMotion() === true;
  const dark = useIsDark();
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false, lastEmit: 0 });
  const queue = useRef<{ x: number; y: number; n: number; burst: boolean }[]>([]);
  const touched = useRef(false);
  const total = Math.max(4, Math.min(600, Math.round(Math.max(4, count) * MULT[density])));
  const tone = color ?? (dark ? "#e5f4ff" : "#0a84ff");

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    ctx.fillStyle = tone;
    const fill = ctx.fillStyle;
    // A pre-rendered glow sprite is far cheaper than shadowBlur per particle.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d");
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, fill);
      // Fade to the same colour at zero alpha; fading to transparent black leaves grey halos.
      g.addColorStop(1, clear(fill));
      sctx.globalAlpha = 0.5;
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 64, 64);
    }

    const lo = Math.max(0.4, minSize);
    const hi = Math.max(lo + 0.2, maxSize);
    const pace = Math.max(0.2, Math.min(3, speed));
    const alphaMax = Math.max(0.1, Math.min(1, opacity));
    const rand = rng(total * 101 + Math.round(hi * 10));
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const place = (s: Twinkle, first: boolean) => {
      s.x = rand();
      s.y = rand();
      const star = rand() < 0.2;
      s.star = star && hi >= 1.6;
      s.r = (lo + rand() * (hi - lo)) * (star ? 1.6 : 1);
      s.dur = 2.2 + rand() * 3.6;
      s.t = first ? rand() : 0;
      const drift = 6 + rand() * 18;
      s.dx = (rand() * 2 - 1) * 10;
      s.dy = direction === "up" ? -drift : direction === "down" ? drift : (rand() * 2 - 1) * drift;
      s.rot = rand() * Math.PI;
      s.a = (0.35 + rand() * 0.65) * alphaMax;
    };
    const field: Twinkle[] = Array.from({ length: total }, () => {
      const s: Twinkle = { x: 0, y: 0, r: 1, t: 0, dur: 3, dx: 0, dy: 0, rot: 0, a: 1, star: false };
      place(s, true);
      return s;
    });
    const bits: Bit[] = [];

    const shape = (x: number, y: number, r: number, rot: number, a: number, star: boolean) => {
      if (a <= 0.01 || r <= 0.05) return;
      if (enableGlow) {
        ctx.globalAlpha = a;
        const gr = r * (star ? 6 : 4.5);
        ctx.drawImage(sprite, x - gr, y - gr, gr * 2, gr * 2);
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = fill;
      ctx.beginPath();
      if (star) {
        const R = r * 2.4;
        const c = Math.cos(rot);
        const s = Math.sin(rot);
        const P = (px: number, py: number) => [x + px * c - py * s, y + px * s + py * c] as const;
        const pts = [P(0, -R), P(R, 0), P(0, R), P(-R, 0)];
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i <= 4; i++) {
          const q = pts[i % 4];
          ctx.quadraticCurveTo(x, y, q[0], q[1]);
        }
      } else ctx.arc(x, y, r, 0, 6.283);
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of field) {
        const e = still ? 0.7 : Math.max(0, envelope(s.t));
        shape(s.x * w + s.dx * s.t, s.y * h + s.dy * s.t, s.r * e, s.rot + s.t * 1.4, s.a * Math.min(1, e), s.star);
      }
      for (const b of bits) {
        const k = b.life / b.max;
        const e = envelope(k);
        shape(b.x, b.y, b.r * e, b.rot, Math.min(1, e) * alphaMax, b.r > 1.4);
      }
      ctx.globalAlpha = 1;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (still) draw();
    });
    ro.observe(cv);
    if (still) {
      draw();
      return () => ro.disconnect();
    }

    const throwBits = (x: number, y: number, n: number, burst: boolean) => {
      for (let i = 0; i < n; i++) {
        const a = burst ? (i / n) * Math.PI * 2 + rand() * 0.4 : rand() * Math.PI * 2;
        const v = burst ? 90 + rand() * 170 : 10 + rand() * 40;
        bits.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v - (burst ? 80 : 10),
          life: 0,
          max: burst ? 0.8 + rand() * 0.7 : 0.5 + rand() * 0.4,
          r: lo + rand() * (hi - lo) * (burst ? 1.2 : 0.8),
          rot: rand() * Math.PI,
          vr: (rand() * 2 - 1) * 6,
        });
      }
      if (bits.length > 400) bits.splice(0, bits.length - 400);
    };

    let raf = 0;
    let last = performance.now();
    let demoClock = 0.6;
    let demoStep = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(cv);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      for (const s of field) {
        s.t += (dt * pace) / s.dur;
        if (s.t >= 1) place(s, false);
      }
      for (const q of queue.current.splice(0)) throwBits(q.x, q.y, q.n, q.burst);
      if (autoplay && !touched.current) {
        demoClock += dt;
        if (demoClock > 1.7) {
          demoClock = 0;
          const [fx, fy] = DEMO[demoStep++ % DEMO.length];
          throwBits(fx * w, fy * h, 18, true);
        }
      }
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.life += dt;
        if (b.life >= b.max) {
          bits.splice(i, 1);
          continue;
        }
        const drag = Math.pow(0.06, dt);
        b.vx *= drag;
        b.vy = b.vy * drag + 240 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vr * dt;
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [still, total, tone, minSize, maxSize, speed, opacity, direction, enableGlow, autoplay]);

  return (
    <div
      aria-hidden
      onPointerMove={(e) => {
        if (!interactive) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        touched.current = true;
        const p = pointer.current;
        if (e.timeStamp - p.lastEmit > 36) {
          p.lastEmit = e.timeStamp;
          queue.current.push({ x, y, n: 2, burst: false });
        }
        pointer.current = { ...p, x, y, inside: true };
      }}
      onPointerLeave={() => {
        pointer.current.inside = false;
      }}
      onPointerDown={(e) => {
        if (!interactive) return;
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        queue.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, n: 20, burst: true });
      }}
      className={cn(
        "overflow-hidden",
        background ? "absolute inset-0" : "relative",
        !interactive && "pointer-events-none",
        className,
      )}
    >
      <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
