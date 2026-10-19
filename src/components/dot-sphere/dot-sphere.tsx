"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type DotSphereProps = {
  /** Number of dots on the sphere. */
  dots?: number;
  /** Sphere radius in px. The canvas adds room around it for dots pushed outwards. */
  radius?: number;
  /** Dot colour. Defaults to the current text colour, so it follows your theme. */
  color?: string;
  /** How hard the pointer pushes dots away, 0–100. */
  repel?: number;
  /** Idle spin speed, 0–100. */
  speed?: number;
  /** Let the pointer push dots and drag to spin the sphere. */
  interactive?: boolean;
  /** Base dot diameter in px (front dots are drawn larger, back dots smaller). */
  dotSize?: number;
  className?: string;
};

type Dot = { x: number; y: number; z: number; ox: number; oy: number; vx: number; vy: number };

/** Evenly spread points over a unit sphere. */
function fibonacciSphere(n: number): Dot[] {
  const out: Dot[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    out.push({ x: Math.cos(t) * r, y, z: Math.sin(t) * r, ox: 0, oy: 0, vx: 0, vy: 0 });
  }
  return out;
}

/**
 * A sphere of dots on a canvas. It turns slowly on its own; move the pointer across it and the
 * dots part around it, then spring back. Drag to spin it and let go to feel it coast.
 */
export function DotSphere({
  dots = 420,
  radius = 130,
  color,
  repel = 55,
  speed = 30,
  interactive = true,
  dotSize = 3.4,
  className,
}: DotSphereProps) {
  const reduce = useReducedMotion();
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const pad = Math.round(radius * 0.32);
  const box = radius * 2 + pad * 2;

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(box * dpr);
    canvas.height = Math.round(box * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pts = fibonacciSphere(Math.max(24, Math.min(2400, Math.round(dots))));
    const order = pts.map(() => 0);
    const proj = pts.map(() => ({ sx: 0, sy: 0, z: 0 }));
    const c = box / 2;
    const baseSpin = (Math.max(0, Math.min(100, speed)) / 100) * 0.9; // rad / s
    const push = (Math.max(0, Math.min(100, repel)) / 100) * radius * 0.5;
    const reach = radius * 0.56;

    let yaw = 0.6;
    const pitch = -0.32;
    let spin = baseSpin;
    let ink = color ?? getComputedStyle(canvas).color;
    let frame = 0;
    let raf = 0;
    let last = performance.now();
    let onScreen = true;
    let pointer: { x: number; y: number } | null = null;
    let drag: { x: number; t: number; v: number } | null = null;

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * box, y: ((e.clientY - r.top) / r.height) * box };
    };

    const draw = () => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cp - z1 * sp;
        const z2 = p.y * sp + z1 * cp;
        proj[i].sx = c + x1 * radius;
        proj[i].sy = c + y2 * radius;
        proj[i].z = z2;
        order[i] = i;
      }
      order.sort((a, b) => proj[a].z - proj[b].z);

      ctx.clearRect(0, 0, box, box);
      ctx.fillStyle = ink;
      for (const i of order) {
        const q = proj[i];
        const p = pts[i];
        const depth = (q.z + 1) / 2; // 0 back … 1 front
        ctx.globalAlpha = 0.16 + depth * 0.84;
        const r = (dotSize / 2) * (0.4 + depth * 0.7);
        ctx.beginPath();
        ctx.arc(q.sx + p.ox, q.sy + p.oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (++frame % 30 === 0 && !color) ink = getComputedStyle(canvas).color;

      if (!drag) spin += (baseSpin - spin) * Math.min(1, dt * 1.6); // coast back to idle speed
      yaw += spin * dt;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let fx = -p.ox * 55;
        let fy = -p.oy * 55;
        if (pointer && push > 0) {
          const q = proj[i];
          const dx = q.sx + p.ox - pointer.x;
          const dy = q.sy + p.oy - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < reach && q.z > -0.35) {
            const k = (1 - d / reach) ** 2 * push * 120;
            fx += (dx / (d || 1)) * k;
            fy += (dy / (d || 1)) * k;
          }
        }
        p.vx = (p.vx + fx * dt) * 0.86;
        p.vy = (p.vy + fy * dt) * 0.86;
        p.ox += p.vx * dt * 8;
        p.oy += p.vy * dt * 8;
      }

      draw();
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce || !onScreen || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    draw();
    start();

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onMove = (e: PointerEvent) => {
      pointer = toLocal(e);
      if (drag) {
        const now = performance.now();
        const dx = pointer.x - drag.x;
        const dtm = Math.max(1, now - drag.t);
        yaw += (dx / radius) * 1.1;
        drag.v = ((dx / radius) * 1.1 * 1000) / dtm;
        drag.x = pointer.x;
        drag.t = now;
        if (reduce) draw();
      }
    };
    const onLeave = () => {
      pointer = null;
    };
    const onDown = (e: PointerEvent) => {
      const at = toLocal(e);
      drag = { x: at.x, t: performance.now(), v: 0 };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // synthetic or already-released pointers can't be captured; window listeners cover it
      }
    };
    const onUp = () => {
      if (!drag) return;
      spin = Math.max(-8, Math.min(8, drag.v || spin));
      drag = null;
    };

    if (interactive) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [dots, radius, color, repel, speed, interactive, dotSize, box, reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "block touch-none select-none text-[#17181a] dark:text-white",
        interactive && "cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{ width: box, height: box }}
    />
  );
}
