"use client";
import { useEffect, useRef, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { motion, useMotionValue, type MotionValue } from "framer-motion";

const W = 440;
const H = 300;

interface Bubble { ax: number; len: number; r: number; tint: string; icon: ReactNode; label: string }

const ic = (d: string) => (
  <svg width="44%" height="44%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const BUBBLES: Bubble[] = [
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
export default function GlassBubbles({ autoplay = false }: { autoplay?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const pos = BUBBLES.map((b) => ({ x: useMotionValue(b.ax), y: useMotionValue(b.len), rot: useMotionValue(0) }));
  const threads = BUBBLES.map((b) => useMotionValue(`M ${b.ax} 0 L ${b.ax} ${b.len}`));
  const pointer = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const touched = useRef(false);

  useEffect(() => {
    const s = BUBBLES.map((b) => ({ x: b.ax, y: b.len, px: b.ax, py: b.len, rot: 0, vr: 0 }));
    let raf = 0;
    let last = performance.now();
    let t0 = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.025, (now - last) / 1000);
      last = now;
      // Synthetic nudge while idle.
      if (autoplay && !touched.current && now - t0 > 2600) {
        t0 = now;
        const k = Math.floor(Math.random() * s.length);
        s[k].px -= (Math.random() > 0.5 ? 1 : -1) * 9;
      }
      for (const b of s) {
        const vx = (b.x - b.px) * 0.992, vy = (b.y - b.py) * 0.992;
        b.px = b.x; b.py = b.y;
        b.x += vx; b.y += vy + 1400 * dt * dt;
      }
      // pointer pushes
      const p = pointer.current;
      if (p) {
        s.forEach((b, i) => {
          const dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy), min = BUBBLES[i].r + 22;
          if (d < min && d > 0.01) {
            const push = (min - d) / d;
            b.x += dx * push * 0.5; b.y += dy * push * 0.5;
            b.vr += (p.vx * 0.02) * (dy > 0 ? -1 : 1);
          }
        });
      }
      for (let it = 0; it < 4; it++) {
        // threads (max length, can go slack)
        s.forEach((b, i) => {
          const B = BUBBLES[i];
          const dx = b.x - B.ax, dy = b.y, d = Math.hypot(dx, dy);
          if (d > B.len) { b.x = B.ax + (dx / d) * B.len; b.y = (dy / d) * B.len; }
        });
        // collisions
        for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) {
          const a = s[i], c = s[j];
          const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), min = BUBBLES[i].r + BUBBLES[j].r;
          if (d < min && d > 0.01) {
            const o = (min - d) / d / 2;
            a.x -= dx * o; a.y -= dy * o; c.x += dx * o; c.y += dy * o;
            const tang = ((c.x - c.px) - (a.x - a.px)) * 0.6;
            a.vr += tang; c.vr -= tang;
          }
        }
        // walls
        s.forEach((b, i) => {
          const r = BUBBLES[i].r;
          if (b.x < r) b.x = r;
          if (b.x > W - r) b.x = W - r;
          if (b.y > H - r) b.y = H - r;
        });
      }
      s.forEach((b, i) => {
        b.vr *= 0.97;
        b.rot += b.vr;
        pos[i].x.set(b.x); pos[i].y.set(b.y); pos[i].rot.set(b.rot);
        const B = BUBBLES[i];
        const d = Math.hypot(b.x - B.ax, b.y);
        const sag = Math.sqrt(Math.max(0, B.len * B.len - d * d)) * 0.5;
        threads[i].set(`M ${B.ax} 0 Q ${(B.ax + b.x) / 2 + sag * 0.3} ${b.y / 2 + sag} ${b.x} ${b.y - BUBBLES[i].r}`);
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const local = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={stage}
        className="relative touch-none overflow-hidden rounded-[24px]"
        style={{ width: W, height: H, maxWidth: "100%", background: "radial-gradient(120% 90% at 50% 0%, #ffffff, #e9eef6 70%)" }}
        onPointerMove={(e) => {
          touched.current = true;
          const q = local(e);
          const prev = pointer.current;
          pointer.current = { ...q, vx: prev ? q.x - prev.x : 0, vy: prev ? q.y - prev.y : 0 };
        }}
        onPointerLeave={() => (pointer.current = null)}
        role="img"
        aria-label="Hanging glass bubbles. Move your pointer through them."
      >
        <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden="true">
          {threads.map((t, i) => <motion.path key={i} d={t} fill="none" stroke="rgba(29,29,31,.35)" strokeWidth={1.2} />)}
        </svg>
        {BUBBLES.map((b, i) => <Orb key={b.label} b={b} x={pos[i].x} y={pos[i].y} rot={pos[i].rot} />)}
      </div>
      <span className="text-[13px] text-[#86868b]">Sweep your pointer through the bubbles.</span>
    </div>
  );
}

function Orb({ b, x, y, rot }: { b: Bubble; x: MotionValue<number>; y: MotionValue<number>; rot: MotionValue<number> }) {
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
