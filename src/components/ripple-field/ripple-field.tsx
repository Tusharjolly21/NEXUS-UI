"use client";
import { useEffect, useRef, type PointerEvent as RPointerEvent } from "react";

export interface RippleFieldProps {
  /** Height of the field in px. It fills the width of its container. */
  height?: number;
  /** Distance between dots in px. */
  gap?: number;
  /** Colours a dot can burst into; one is picked at random per hit. */
  colors?: string[];
  /** Drops rings at random spots until the user clicks. */
  autoplay?: boolean;
}

export const RIPPLE_FIELD_PALETTE = ["#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#0a84ff", "#bf5af2"];

/**
 * A quiet grid of dots. Click and a ring travels outward from that point; dots
 * it passes over burst into colour, get kicked away from the centre, and then
 * settle back to grey.
 */
export function RippleField({ height = 300, gap = 18, colors = RIPPLE_FIELD_PALETTE, autoplay = false }: RippleFieldProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const rings = useRef<{ x: number; y: number; t: number }[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const touched = useRef(false);
  const dark = useRef(false);

  // Track the site theme so the resting dots can be redrawn in the right ink.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      dark.current = root.classList.contains("dark");
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    const el = wrap.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !el || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0, h = 0, raf = 0;
    type Dot = { x: number; y: number; e: number; c: string; ox: number; oy: number; vx: number; vy: number; hit: number };
    let dots: Dot[] = [];
    const build = () => {
      w = el.clientWidth;
      h = height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      dots = [];
      for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dots.push({ x, y, e: 0, c: colors[0], ox: 0, oy: 0, vx: 0, vy: 0, hit: -1 });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);

    const SPEED = 340, BAND = 22, MAXR = 230, LIFE = (MAXR / 340) * 1000 + 100;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const ink = dark.current ? "245,245,247" : "29,29,31";
      rings.current = rings.current.filter((r) => now - r.t < LIFE);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        for (let k = 0; k < rings.current.length; k++) {
          const r = rings.current[k];
          const radius = ((now - r.t) / 1000) * SPEED;
          const dx = d.x - r.x, dy = d.y - r.y;
          const dist = Math.hypot(dx, dy);
          if (radius < MAXR && Math.abs(dist - radius) < BAND && d.hit !== r.t) {
            d.hit = r.t;
            const strength = 1 - radius / MAXR;
            d.e = Math.max(d.e, 0.35 + strength * 0.65);
            d.c = colors[Math.floor(Math.random() * colors.length)];
            const kick = (60 + Math.random() * 120) * strength;
            d.vx += (dx / (dist || 1)) * kick;
            d.vy += (dy / (dist || 1)) * kick;
          }
        }
        // Spring the dot back home and let the colour decay.
        d.vx += -d.ox * 90 * dt;
        d.vy += -d.oy * 90 * dt;
        d.vx *= Math.pow(0.02, dt);
        d.vy *= Math.pow(0.02, dt);
        d.ox += d.vx * dt;
        d.oy += d.vy * dt;
        d.e = Math.max(0, d.e - dt * 1.1);
        let size = 1.6 + d.e * 2.6;
        let hover = 0;
        if (pointer.current) {
          const pd = Math.hypot(d.x - pointer.current.x, d.y - pointer.current.y);
          hover = Math.max(0, 1 - pd / 70);
          size += hover * 1.2;
        }
        ctx.beginPath();
        ctx.arc(d.x + d.ox, d.y + d.oy, size, 0, Math.PI * 2);
        if (d.e > 0.02) {
          ctx.globalAlpha = Math.min(1, 0.25 + d.e);
          ctx.fillStyle = d.c;
        } else {
          ctx.globalAlpha = 1;
          ctx.fillStyle = hover > 0 ? `rgba(${ink},${0.22 + hover * 0.4})` : `rgba(${ink},.18)`;
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [height, gap, colors]);

  useEffect(() => {
    if (!autoplay) return;
    const drop = () => {
      if (touched.current || !wrap.current) return;
      const w = wrap.current.clientWidth;
      rings.current.push({ x: w * (0.15 + Math.random() * 0.7), y: height * (0.2 + Math.random() * 0.6), t: performance.now() });
    };
    const a = setTimeout(drop, 500);
    const b = setInterval(drop, 1700);
    return () => { clearTimeout(a); clearInterval(b); };
  }, [autoplay, height]);

  const local = (e: RPointerEvent) => {
    const el = e.currentTarget as HTMLDivElement;
    const r = el.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * el.clientWidth, y: ((e.clientY - r.top) / r.height) * height };
  };

  return (
    <div
      ref={wrap}
      role="button"
      tabIndex={0}
      aria-label="Dot field. Click anywhere to send a ring of colour across it."
      className="relative w-full cursor-crosshair overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_50px_-28px_rgba(0,0,0,.3)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_50px_-28px_rgba(0,0,0,.8)] dark:focus-visible:ring-[#0a84ff]"
      style={{ height }}
      onPointerMove={(e) => {
        pointer.current = local(e);
      }}
      onPointerLeave={() => {
        pointer.current = null;
      }}
      onPointerDown={(e) => {
        touched.current = true;
        rings.current.push({ ...local(e), t: performance.now() });
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        const w = e.currentTarget.clientWidth;
        rings.current.push({ x: w / 2, y: height / 2, t: performance.now() });
      }}
    >
      <canvas ref={canvas} className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}
