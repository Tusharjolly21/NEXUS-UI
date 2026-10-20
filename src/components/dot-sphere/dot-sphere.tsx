"use client";
import { useEffect, useRef, useSyncExternalStore, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";

export type DotSphereProps = {
  /** Number of dots on the sphere. */
  dots?: number;
  /** Sphere radius in px. The canvas adds room around it for dots pushed outwards. */
  radius?: number;
  /** Dot colour. Defaults to near-black, or near-white in dark mode. */
  color?: string;
  /** Colour of the ripple a tap sends across the surface. */
  accent?: string;
  /** How hard the pointer pushes dots away, 0–100. */
  repel?: number;
  /** Idle spin speed, 0–100. */
  speed?: number;
  /** Let the pointer push dots, drag to spin and tap to send ripples. */
  interactive?: boolean;
  /** Base dot diameter in px; front dots draw larger, back dots smaller. */
  dotSize?: number;
  /** Hint under the sphere. An empty string hides it. */
  hint?: string;
  /** Sends ripples from different points and flicks the sphere round until someone touches it. */
  autoplay?: boolean;
  /** Classes for the root element. */
  className?: string;
};

type Dot = { x: number; y: number; z: number; ox: number; oy: number; vx: number; vy: number };
type Ripple = { x: number; y: number; z: number; t: number };

/** Follows the site's `.dark` class on <html>. The server snapshot is light. */
function subscribeDark(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
const useDark = () =>
  useSyncExternalStore(
    subscribeDark,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

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

/** Autoplay tap points, as fractions of the sphere radius from its centre. */
const DEMO_TAPS: [number, number][] = [
  [-0.35, -0.3],
  [0.42, 0.18],
  [-0.1, 0.45],
  [0.25, -0.42],
];

const RIPPLE_SPEED = 2.1; // radians of arc per second
const RIPPLE_WIDTH = 0.34;
const RIPPLE_LIFE = (Math.PI + RIPPLE_WIDTH * 2) / RIPPLE_SPEED;

/**
 * A sphere of dots on a canvas. It turns slowly on its own; the pointer
 * parts the dots as it passes. Drag to spin it in any direction and let go
 * to watch it coast; tap and a ripple rolls out from that spot, swelling the
 * dots and lighting them in the accent colour as it wraps round the far side.
 */
export function DotSphere({
  dots = 420,
  radius = 130,
  color,
  accent,
  repel = 55,
  speed = 30,
  interactive = true,
  dotSize = 3.4,
  hint = "Drag to spin. Tap for a ripple.",
  autoplay = false,
  className = "",
}: DotSphereProps) {
  const reduce = useReducedMotion() === true;
  const dark = useDark();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pad = Math.round(radius * 0.34);
  const box = radius * 2 + pad * 2;
  const ink = useRef({ dot: "#1d1d1f", accent: "#0071e3" });
  const api = useRef<{ ripple: (fx: number, fy: number) => void; nudge: (dx: number, dy: number) => void } | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    ink.current = { dot: color ?? (dark ? "#f5f5f7" : "#1d1d1f"), accent: accent ?? (dark ? "#0a84ff" : "#0071e3") };
  }, [color, accent, dark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(box * dpr);
    canvas.height = Math.round(box * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pts = fibonacciSphere(Math.max(24, Math.min(2400, Math.round(dots))));
    const order = pts.map((_, i) => i);
    const proj = pts.map(() => ({ sx: 0, sy: 0, z: 0, amp: 0 }));
    const c = box / 2;
    const baseSpin = (Math.max(0, Math.min(100, speed)) / 100) * 0.9;
    const push = (Math.max(0, Math.min(100, repel)) / 100) * radius * 0.5;
    const reach = radius * 0.56;
    const REST_PITCH = -0.32;

    let yaw = 0.6;
    let pitch = REST_PITCH;
    let spin = baseSpin;
    let tilt = 0;
    let raf = 0;
    let last = performance.now();
    let onScreen = true;
    let pointer: { x: number; y: number } | null = null;
    let drag: { x: number; y: number; sx: number; sy: number; t: number; vx: number; vy: number; t0: number } | null = null;
    const ripples: Ripple[] = [];

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * box, y: ((e.clientY - r.top) / r.height) * box };
    };

    /** Screen point -> point on the front of the sphere in model space, or null if it missed. */
    const pick = (x: number, y: number) => {
      const nx = (x - c) / radius;
      const ny = (y - c) / radius;
      const d2 = nx * nx + ny * ny;
      if (d2 > 1) return null;
      const nz = Math.sqrt(1 - d2);
      // Undo pitch (about x), then yaw (about y).
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const y1 = ny * cp + nz * sp;
      const z1 = -ny * sp + nz * cp;
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      return { x: nx * cy - z1 * sy, y: y1, z: nx * sy + z1 * cy };
    };

    const addRipple = (x: number, y: number) => {
      const at = reduce ? null : pick(x, y);
      if (!at) return;
      ripples.push({ ...at, t: 0 });
      if (ripples.length > 4) ripples.shift();
    };

    const draw = () => {
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let amp = 0;
        for (const r of ripples) {
          const ang = Math.acos(Math.max(-1, Math.min(1, p.x * r.x + p.y * r.y + p.z * r.z)));
          const front = r.t * RIPPLE_SPEED;
          const fall = Math.max(0, 1 - r.t / RIPPLE_LIFE);
          const g = (ang - front) / RIPPLE_WIDTH;
          amp += Math.exp(-g * g) * fall;
        }
        amp = Math.min(1, amp);
        const lift = 1 + amp * 0.14;
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cp - z1 * sp;
        const z2 = p.y * sp + z1 * cp;
        proj[i].sx = c + x1 * radius * lift;
        proj[i].sy = c + y2 * radius * lift;
        proj[i].z = z2;
        proj[i].amp = amp;
        order[i] = i;
      }
      order.sort((a, b) => proj[a].z - proj[b].z);

      ctx.clearRect(0, 0, box, box);
      const { dot, accent: hot } = ink.current;
      for (const i of order) {
        const q = proj[i];
        const p = pts[i];
        const depth = (q.z + 1) / 2;
        const lit = q.amp > 0.12;
        ctx.fillStyle = lit ? hot : dot;
        ctx.globalAlpha = Math.min(1, 0.14 + depth * 0.86 + q.amp * 0.3);
        const r = (dotSize / 2) * (0.4 + depth * 0.7) * (1 + q.amp * 0.9);
        ctx.beginPath();
        ctx.arc(q.sx + p.ox, q.sy + p.oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!drag) {
        spin += (baseSpin - spin) * Math.min(1, dt * 1.4);
        tilt += -tilt * Math.min(1, dt * 2.5);
        pitch += tilt * dt;
        // Pitch swings back to rest on a soft spring.
        tilt += (REST_PITCH - pitch) * 14 * dt;
      }
      yaw += spin * dt;
      pitch = Math.max(-1.25, Math.min(1.25, pitch));

      for (let k = ripples.length - 1; k >= 0; k--) {
        ripples[k].t += dt;
        if (ripples[k].t > RIPPLE_LIFE) ripples.splice(k, 1);
      }

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let fx = -p.ox * 55;
        let fy = -p.oy * 55;
        if (pointer && push > 0 && !drag) {
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
      if (reduce) {
        draw();
        return;
      }
      if (!onScreen || document.hidden) return;
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
      if (!drag) return;
      const now = e.timeStamp;
      const dx = pointer.x - drag.x;
      const dy = pointer.y - drag.y;
      const dtm = Math.max(8, now - drag.t);
      const ay = (dx / radius) * 1.1;
      const ap = (dy / radius) * 0.9;
      yaw += ay;
      pitch = Math.max(-1.25, Math.min(1.25, pitch - ap));
      drag.vx = drag.vx * 0.4 + ((ay * 1000) / dtm) * 0.6;
      drag.vy = drag.vy * 0.4 + ((-ap * 1000) / dtm) * 0.6;
      drag.x = pointer.x;
      drag.y = pointer.y;
      drag.t = now;
      if (reduce) draw();
    };
    const onLeave = () => {
      pointer = null;
    };
    const onDown = (e: PointerEvent) => {
      touched.current = true;
      const at = toLocal(e);
      drag = { x: at.x, y: at.y, sx: at.x, sy: at.y, t: e.timeStamp, t0: e.timeStamp, vx: 0, vy: 0 };
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        // synthetic or already-released pointers can't be captured; window listeners cover it
      }
    };
    const onUp = (e: PointerEvent) => {
      if (!drag) return;
      const moved = Math.hypot(drag.x - drag.sx, drag.y - drag.sy);
      if (moved < 6 && e.timeStamp - drag.t0 < 400) addRipple(drag.sx, drag.sy);
      else if (!reduce) {
        spin = Math.max(-8, Math.min(8, drag.vx || spin));
        tilt = Math.max(-5, Math.min(5, drag.vy));
      }
      drag = null;
    };

    api.current = {
      ripple: (fx, fy) => addRipple(c + fx * radius, c + fy * radius),
      nudge: (dx, dy) => {
        spin += dx;
        tilt += dy;
        if (reduce) {
          yaw += dx * 0.3;
          pitch = Math.max(-1.25, Math.min(1.25, pitch + dy * 0.3));
          draw();
        }
      },
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
      api.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [dots, radius, repel, speed, interactive, dotSize, box, reduce]);

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      const [fx, fy] = DEMO_TAPS[k % DEMO_TAPS.length];
      if (k % 2 === 1) api.current?.nudge(k % 4 === 1 ? 2.6 : -2.2, 0.8);
      api.current?.ripple(fx, fy);
      k++;
    }, 2400);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, [number, number]> = { ArrowLeft: [-1.6, 0], ArrowRight: [1.6, 0], ArrowUp: [0, 1.2], ArrowDown: [0, -1.2] };
    if (map[e.key]) {
      e.preventDefault();
      touched.current = true;
      api.current?.nudge(...map[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      touched.current = true;
      api.current?.ripple(0, 0);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        role="img"
        aria-label="A sphere of dots. Drag to spin it, tap to send a ripple; arrow keys spin it and Enter sends a ripple."
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? onKey : undefined}
        className="relative max-w-full rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
        style={{ width: box, aspectRatio: "1" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[86%] h-[12%] w-[62%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,.14),transparent)] dark:bg-[radial-gradient(closest-side,rgba(10,132,255,.22),transparent)]"
        />
        <canvas
          ref={canvasRef}
          className={`relative block h-full w-full touch-none select-none ${interactive ? "cursor-grab active:cursor-grabbing" : ""}`}
        />
      </div>
      {hint && interactive ? <p className="m-0 text-[12px] text-[#86868b] dark:text-[#a1a1a6]">{hint}</p> : null}
    </div>
  );
}
