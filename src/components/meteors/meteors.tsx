"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MeteorsIntensity = "low" | "medium" | "high";

export type MeteorsProps = {
  /** Base number of meteors in the air, before `intensity` scales it. */
  number?: number;
  /** Classes for the root wrapper. Use "absolute inset-0" to lay it behind content. */
  className?: string;
  /** Classes for the canvas the meteors are drawn on. */
  meteorClassName?: string;
  /** Shortest wait before a meteor reappears, in seconds. */
  minDelay?: number;
  /** Longest wait before a meteor reappears, in seconds. */
  maxDelay?: number;
  /** Fastest crossing, in seconds. */
  minDuration?: number;
  /** Slowest crossing, in seconds. */
  maxDuration?: number;
  /** Direction of travel in degrees, counter-clockwise from pointing right: 180 is left, 270 straight down, 215 down and to the left. */
  angle?: number;
  /** Bloom round the heads and the impact flash. */
  glow?: boolean;
  /** Meteor colour. Any CSS colour, including CSS variables. */
  color?: string;
  /** Density preset that scales `number`. */
  intensity?: MeteorsIntensity;
  /** Only spawn meteors while the pointer is over the container. */
  hoverOnly?: boolean;
  /** Pointer pulls passing meteors into a curve; a click calls one down to strike that spot. */
  interactive?: boolean;
  /** Faint twinkling background stars drawn behind the meteors. */
  stars?: number;
  /** Calls meteors down on a few spots until someone clicks. */
  autoplay?: boolean;
  /** Foreground content drawn above the sky. */
  children?: ReactNode;
};

type Rock = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  wait: number;
  size: number;
  alpha: number;
  /** Strike target, for meteors called down by a click. */
  tx?: number;
  ty?: number;
  trail: number[];
};
type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };

const MULT: Record<MeteorsIntensity, number> = { low: 0.65, medium: 1, high: 1.45 };
const TRAIL = 26;
const DEMO = [
  [0.68, 0.62],
  [0.3, 0.74],
  [0.82, 0.4],
  [0.46, 0.55],
];

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A night-sky layer of meteors drawn on canvas. Each one burns in, picks up
 * speed and leaves a tapering trail. The pointer bends passing meteors toward
 * it, and a click calls one down: it streaks in, strikes the spot and throws
 * off a ring of sparks.
 */
export function Meteors({
  number = 18,
  className,
  meteorClassName,
  minDelay = 0.12,
  maxDelay = 2.4,
  minDuration = 3.2,
  maxDuration = 7.2,
  angle = 215,
  glow = true,
  color = "#cfe6ff",
  intensity = "medium",
  hoverOnly = false,
  interactive = true,
  stars = 0,
  autoplay = false,
  children,
}: MeteorsProps) {
  const still = useReducedMotion() === true;
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: 0, y: 0, inside: false });
  const strikes = useRef<{ x: number; y: number }[]>([]);
  const touched = useRef(false);

  const count = Math.max(1, Math.min(72, Math.round(number * MULT[intensity])));
  const dMin = Math.max(0, minDelay);
  const dMax = Math.max(dMin + 0.05, maxDelay);
  const tMin = Math.max(0.6, minDuration);
  const tMax = Math.max(tMin + 0.2, maxDuration);

  useEffect(() => {
    const el = root.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    // Resolve the colour through the DOM so CSS variables and any colour syntax work.
    const probe = document.createElement("span");
    probe.style.color = color;
    probe.style.display = "none";
    el.appendChild(probe);
    const rgb = getComputedStyle(probe).color.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [207, 230, 255];
    probe.remove();
    const tone = (a: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

    const rand = rng(count * 7919 + Math.round(angle * 13));
    const rad = (angle * Math.PI) / 180;
    // Counter-clockwise from pointing right, so the default 215 heads down and to the left.
    const dir = { x: Math.cos(rad), y: -Math.sin(rad) };
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr));
      cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const sky = Array.from({ length: Math.max(0, Math.min(200, stars)) }, () => ({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.1,
      p: rand() * Math.PI * 2,
    }));

    // Spawn on the edge the meteors come from, anywhere along a line across the sky.
    const launch = (m: Rock, first: boolean) => {
      const diag = Math.hypot(w, h) || 800;
      const along = (rand() - 0.5) * diag * 1.3;
      m.x = w / 2 - dir.x * diag * 0.55 - dir.y * along;
      m.y = h / 2 - dir.y * diag * 0.55 + dir.x * along;
      const spd = diag / (tMin + rand() * (tMax - tMin));
      m.vx = dir.x * spd * 0.55;
      m.vy = dir.y * spd * 0.55;
      m.life = 0;
      m.wait = first ? rand() * (dMax + tMax * 0.5) : dMin + rand() * (dMax - dMin);
      m.size = 1 + rand() * 1.3;
      m.alpha = 0.45 + rand() * 0.5;
      m.tx = undefined;
      m.ty = undefined;
      m.trail.length = 0;
    };
    const rocks: Rock[] = Array.from({ length: count }, () => {
      const m: Rock = { x: 0, y: 0, vx: 0, vy: 0, life: 0, wait: 0, size: 1, alpha: 1, trail: [] };
      launch(m, true);
      return m;
    });
    const called: Rock[] = [];
    const sparks: Spark[] = [];
    const flashes: { x: number; y: number; t: number }[] = [];

    const callDown = (x: number, y: number) => {
      const diag = Math.hypot(w, h) || 800;
      const d = diag * 0.6;
      const m: Rock = {
        x: x - dir.x * d,
        y: y - dir.y * d,
        vx: dir.x * diag * 0.9,
        vy: dir.y * diag * 0.9,
        life: 0,
        wait: 0,
        size: 2.2,
        alpha: 1,
        tx: x,
        ty: y,
        trail: [],
      };
      called.push(m);
    };

    const drawTrail = (m: Rock) => {
      const pts = m.trail;
      if (pts.length < 4) return;
      ctx.lineCap = "round";
      for (let i = 2; i < pts.length; i += 2) {
        const k = i / pts.length;
        ctx.strokeStyle = tone(m.alpha * k * k);
        ctx.lineWidth = m.size * (0.25 + k * 0.9);
        ctx.beginPath();
        ctx.moveTo(pts[i - 2], pts[i - 1]);
        ctx.lineTo(pts[i], pts[i + 1]);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(pts[pts.length - 2], pts[pts.length - 1]);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();
      if (glow) {
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 7);
        g.addColorStop(0, tone(0.55 * m.alpha));
        g.addColorStop(1, tone(0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(255,255,255,${m.alpha})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size * 0.9, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSky = (time: number) => {
      for (const s of sky) {
        const a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(time * 1.3 + s.p));
        ctx.fillStyle = tone(a);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (still) {
      // One quiet frame: a few frozen streaks.
      ctx.clearRect(0, 0, w, h);
      drawSky(0);
      rocks.slice(0, Math.ceil(count / 3)).forEach((m) => {
        m.x = rand() * w;
        m.y = rand() * h;
        for (let i = TRAIL; i > 0; i--) m.trail.push(m.x - dir.x * i * 5, m.y - dir.y * i * 5);
        m.alpha *= 0.5;
        drawTrail(m);
      });
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let time = 0;
    let demoClock = 1.2;
    let demoStep = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(cv);

    const step = (m: Rock, dt: number) => {
      const p = pointer.current;
      if (interactive && p.inside && m.tx === undefined) {
        // Soft gravity well at the pointer bends the path.
        const dx = p.x - m.x;
        const dy = p.y - m.y;
        const d2 = dx * dx + dy * dy + 900;
        const f = 7e5 / d2;
        const d = Math.sqrt(d2);
        m.vx += (dx / d) * f * dt;
        m.vy += (dy / d) * f * dt;
      }
      // Burn in: speed builds up over the first second.
      const accel = 1 + Math.min(1, m.life) * 0.9;
      m.x += m.vx * accel * dt;
      m.y += m.vy * accel * dt;
      m.trail.push(m.x, m.y);
      if (m.trail.length > TRAIL * 2) m.trail.splice(0, 2);
    };

    const burst = (x: number, y: number) => {
      flashes.push({ x, y, t: 0 });
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2 + rand() * 0.3;
        const s = 60 + rand() * 170;
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0, max: 0.6 + rand() * 0.6 });
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      time += dt;
      ctx.clearRect(0, 0, w, h);
      drawSky(time);

      const spawning = !hoverOnly || pointer.current.inside;
      const margin = 220;
      for (const m of rocks) {
        if (m.wait > 0) {
          if (spawning) m.wait -= dt;
          continue;
        }
        m.life += dt;
        step(m, dt);
        drawTrail(m);
        if (m.x < -margin * 2 || m.x > w + margin * 2 || m.y < -margin * 2 || m.y > h + margin * 2 || m.life > tMax * 2.5) {
          launch(m, false);
        }
      }

      for (const s of strikes.current.splice(0)) callDown(s.x, s.y);
      if (autoplay && !touched.current) {
        demoClock += dt;
        if (demoClock > 1.9) {
          demoClock = 0;
          const [fx, fy] = DEMO[demoStep++ % DEMO.length];
          callDown(fx * w, fy * h);
        }
      }
      for (let i = called.length - 1; i >= 0; i--) {
        const m = called[i];
        m.life += dt;
        step(m, dt * 0.55);
        drawTrail(m);
        const past = (m.x - (m.tx as number)) * dir.x + (m.y - (m.ty as number)) * dir.y;
        if (past >= 0) {
          burst(m.tx as number, m.ty as number);
          called.splice(i, 1);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.t += dt;
        const k = f.t / 0.7;
        if (k >= 1) {
          flashes.splice(i, 1);
          continue;
        }
        // Ring overshoots outward fast, then fades.
        const r = 8 + (1 - Math.pow(1 - k, 3)) * 58;
        ctx.strokeStyle = tone((1 - k) * 0.8);
        ctx.lineWidth = 1.5 * (1 - k) + 0.5;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.stroke();
        if (glow) {
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 46);
          g.addColorStop(0, `rgba(255,255,255,${(1 - k) * 0.9})`);
          g.addColorStop(0.3, tone((1 - k) * 0.5));
          g.addColorStop(1, tone(0));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(f.x, f.y, 46, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life += dt;
        if (s.life >= s.max) {
          sparks.splice(i, 1);
          continue;
        }
        s.vx *= 1 - 2.4 * dt;
        s.vy = s.vy * (1 - 2.4 * dt) + 220 * dt;
        const ox = s.x;
        const oy = s.y;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const k = 1 - s.life / s.max;
        ctx.strokeStyle = tone(k);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ox - s.vx * 0.03, oy - s.vy * 0.03);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [still, count, dMin, dMax, tMin, tMax, angle, glow, color, hoverOnly, interactive, stars, autoplay]);

  return (
    <div
      ref={root}
      className={cn("relative isolate overflow-hidden", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true };
      }}
      onPointerLeave={() => {
        pointer.current.inside = false;
      }}
      onPointerDown={(e) => {
        if (!interactive) return;
        touched.current = true;
        const r = e.currentTarget.getBoundingClientRect();
        strikes.current.push({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <canvas ref={canvas} aria-hidden className={cn("pointer-events-none absolute inset-0 z-0 h-full w-full", meteorClassName)} />
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}
