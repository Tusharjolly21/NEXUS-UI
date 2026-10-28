Add the "Glass Bubbles" component from Nexus UI to my project.

Four glass orbs hang on threads from the top of a panel. Sweep the pointer through them and they swing, knock into each other and spin their icons before settling back under their anchors.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { GlassBubbles } from "@/components/glass-bubbles";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/glass-bubbles/glass-bubbles.tsx ---

```tsx
"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { motion, motionValue, type MotionValue } from "framer-motion";

const W = 440;
const H = 300;

export interface GlassBubblesProps {
  /** Nudges a random bubble every 2.6s until someone moves the pointer through them. */
  autoplay?: boolean;
  /** Size of every orb, 0.6 to 1.3. Bigger orbs knock into each other sooner. Default 1. */
  size?: number;
  /** Length of every thread, 0.5 to 1.3. Longer threads swing wider and slower. Default 1. */
  threadLength?: number;
  /** How hard the orbs are pulled down, 0.2 to 3. Lower floats, higher snaps back faster. Default 1. */
  gravity?: number;
  /** How quickly swinging dies away, 0.25 to 4. Lower keeps swinging, higher settles fast. Default 1. */
  drag?: number;
  /** How hard the pointer shoves an orb, 0.2 to 3. Default 1. */
  push?: number;
}

const clamp = (v: number, lo: number, hi: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

/** One hanging orb: anchor x on the top edge, thread length, radius, tint, icon and label. */
export interface GlassBubble {
  ax: number;
  len: number;
  r: number;
  tint: string;
  icon: ReactNode;
  label: string;
}

const ic = (d: string) => (
  <svg width="44%" height="44%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const BUBBLES: GlassBubble[] = [
  { ax: 90, len: 120, r: 46, tint: "#5ac8fa", label: "Search", icon: ic("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4") },
  { ax: 180, len: 170, r: 54, tint: "#bf5af2", label: "Write", icon: ic("M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4") },
  { ax: 270, len: 110, r: 42, tint: "#ff9f0a", label: "Ideas", icon: ic("M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11v2h6v-2a6 6 0 0 0-3-11z") },
  { ax: 355, len: 160, r: 48, tint: "#30d158", label: "Code", icon: ic("M8 8l-4 4 4 4M16 8l4 4-4 4") },
];

/**
 * Glass orbs hanging on threads. Push them with the pointer and they swing,
 * knock into each other and spin, then settle back under their anchors.
 * Simple verlet pendulums with circle collisions, rendered as DOM so the
 * glass can use real CSS gradients and blur.
 */
export function GlassBubbles({ autoplay = false, size = 1, threadLength = 1, gravity = 1, drag = 1, push = 1 }: GlassBubblesProps) {
  const stage = useRef<HTMLDivElement>(null);
  const sizeK = clamp(size, 0.6, 1.3);
  const lenK = clamp(threadLength, 0.5, 1.3);
  // Scaled copies used for drawing; the physics loop reads the same numbers through a ref so changes apply live.
  const bubbles = useMemo(() => BUBBLES.map((b) => ({ ...b, r: b.r * sizeK, len: b.len * lenK })), [sizeK, lenK]);
  const live = useRef({ bubbles, gravity: 1, drag: 1, push: 1 });
  useEffect(() => {
    live.current = { bubbles, gravity: clamp(gravity, 0.2, 3), drag: clamp(drag, 0.25, 4), push: clamp(push, 0.2, 3) };
  }, [bubbles, gravity, drag, push]);
  const [pos] = useState(() => BUBBLES.map((b) => ({ x: motionValue(b.ax), y: motionValue(b.len), rot: motionValue(0) })));
  const [threads] = useState(() => BUBBLES.map((b) => motionValue(`M ${b.ax} 0 L ${b.ax} ${b.len}`)));
  const pointer = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const touched = useRef(false);
  const kick = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = live.current.bubbles.map((b) => ({ x: b.ax, y: b.len, px: b.ax, py: b.len, rot: 0, vr: 0 }));
    let raf = 0;
    let last = performance.now();
    let t0 = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.025, (now - last) / 1000);
      last = now;
      // Synthetic nudge while idle.
      if (autoplay && !reduce && !touched.current && now - t0 > 2600) {
        t0 = now;
        const k = Math.floor(Math.random() * s.length);
        s[k].px -= (Math.random() > 0.5 ? 1 : -1) * 9;
      }
      // Keyboard gust: shove every bubble sideways (kick -1 = left, 1 = right).
      if (kick.current !== 0) {
        for (const b of s) b.px -= kick.current * 9;
        kick.current = 0;
      }
      const { bubbles: B, gravity: g, drag: dr, push: ps } = live.current;
      const keep = 1 - 0.008 * dr;
      for (const b of s) {
        const vx = (b.x - b.px) * keep, vy = (b.y - b.py) * keep;
        b.px = b.x; b.py = b.y;
        b.x += vx; b.y += vy + 1400 * g * dt * dt;
      }
      // pointer pushes
      const p = pointer.current;
      if (p) {
        s.forEach((b, i) => {
          const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy), min = B[i].r + 22;
          if (d < min && d > 0.01) {
            const shove = ((min - d) / d) * Math.min(1, 0.5 * ps);
            b.x += dx * shove; b.y += dy * shove;
            b.vr += (p.vx * 0.02 * ps) * (dy > 0 ? -1 : 1);
          }
        });
      }
      for (let it = 0; it < 4; it++) {
        // threads (max length, can go slack)
        s.forEach((b, i) => {
          const T = B[i];
          const dx = b.x - T.ax, dy = b.y, d = Math.hypot(dx, dy);
          if (d > T.len) { b.x = T.ax + (dx / d) * T.len; b.y = (dy / d) * T.len; }
        });
        // collisions
        for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
          const a = s[i], c = s[j];
          const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = B[i].r + B[j].r;
          if (d < min && d > 0.01) {
            const o = (min - d) / d / 2;
            a.x -= dx * o; a.y -= dy * o; c.x += dx * o; c.y += dy * o;
            const tang = ((c.x - c.px) - (a.x - a.px)) * 0.6;
            a.vr += tang; c.vr -= tang;
          }
        }
        // walls
        s.forEach((b, i) => {
          const r = B[i].r;
          if (b.x < r) b.x = r;
          if (b.x > W - r) b.x = W - r;
          if (b.y > H - r) b.y = H - r;
        });
      }
      s.forEach((b, i) => {
        b.vr *= 0.97;
        b.rot += b.vr;
        pos[i].x.set(b.x); pos[i].y.set(b.y); pos[i].rot.set(b.rot);
        const T = B[i];
        const d = Math.hypot(b.x - T.ax, b.y);
        const sag = Math.sqrt(Math.max(0, T.len * T.len - d * d)) * 0.5;
        threads[i].set(`M ${T.ax} 0 Q ${(T.ax + b.x) / 2 + sag * 0.3} ${b.y / 2 + sag} ${b.x} ${b.y - T.r}`);
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, pos, threads]);

  const local = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  const onKeyDown = (e: RKeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    touched.current = true;
    // Verlet: lowering the previous x gives a rightward velocity, so the sign follows the key.
    kick.current = e.key === "ArrowLeft" ? -1 : 1;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={stage}
        tabIndex={0}
        className="relative touch-none overflow-hidden rounded-[24px] [--gb-bg:radial-gradient(120%_90%_at_50%_0%,#ffffff,#e9eef6_70%)] [--gb-thread:rgba(29,29,31,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0071e3] dark:[--gb-bg:radial-gradient(120%_90%_at_50%_0%,#2c2c2e,#1c1c1e_70%)] dark:[--gb-thread:rgba(245,245,247,.35)] dark:focus-visible:outline-[#2997ff]"
        style={{ width: W, height: H, maxWidth: "100%", background: "var(--gb-bg)" }}
        onPointerMove={(e) => {
          touched.current = true;
          const q = local(e);
          const prev = pointer.current;
          pointer.current = { ...q, vx: prev ? q.x - prev.x : 0, vy: prev ? q.y - prev.y : 0 };
        }}
        onPointerLeave={() => {
          pointer.current = null;
        }}
        onKeyDown={onKeyDown}
        role="group"
        aria-label="Hanging glass bubbles: Search, Write, Ideas, Code. Move your pointer through them, or press the left and right arrow keys."
      >
        <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden="true">
          {threads.map((t, i) => <motion.path key={i} d={t} fill="none" stroke="var(--gb-thread)" strokeWidth={1.2} />)}
        </svg>
        {bubbles.map((b, i) => <Orb key={b.label} b={b} x={pos[i].x} y={pos[i].y} rot={pos[i].rot} />)}
      </div>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">Sweep your pointer through the bubbles.</span>
    </div>
  );
}

function Orb({ b, x, y, rot }: { b: GlassBubble; x: MotionValue<number>; y: MotionValue<number>; rot: MotionValue<number> }) {
  const d = b.r * 2;
  return (
    <motion.div className="pointer-events-none absolute left-0 top-0" style={{ x, y, width: d, height: d, marginLeft: -b.r, marginTop: -b.r }}>
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 50% 60%, ${b.tint}55, ${b.tint}10 60%, transparent 72%)`, filter: "blur(6px)", transform: "translateY(10%)" }} />
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.95), rgba(255,255,255,.25) 26%, rgba(255,255,255,.08) 55%, ${b.tint}33 80%, ${b.tint}66 100%)`,
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,.8), inset -6px -10px 18px ${b.tint}55, inset 6px 8px 14px rgba(255,255,255,.7), 0 14px 26px -12px rgba(0,0,0,.25)`,
          backdropFilter: "blur(2px)",
        }}
      >
        <motion.div className="absolute inset-0 flex items-center justify-center" style={{ rotate: rot, color: b.tint }}>
          {b.icon}
        </motion.div>
        <span className="absolute left-[18%] top-[12%] h-[24%] w-[36%] -rotate-[30deg] rounded-full bg-white/80 blur-[2px]" />
      </div>
    </motion.div>
  );
}
```

--- components/glass-bubbles/index.ts ---

```ts
export { GlassBubbles } from "./glass-bubbles";
export type { GlassBubblesProps, GlassBubble } from "./glass-bubbles";
```
