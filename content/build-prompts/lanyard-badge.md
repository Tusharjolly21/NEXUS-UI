# Lanyard Badge

Add the "Lanyard Badge" component from Nexus UI to my project.

A conference badge hanging from a strap. Grab it and throw it around; it swings back as a damped pendulum and twists with its sideways speed.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { LanyardBadge } from "@/components/lanyard-badge";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/lanyard-badge/index.ts ---

```ts
export { LanyardBadge } from "./lanyard-badge";
export type { LanyardBadgeProps } from "./lanyard-badge";
```

--- components/lanyard-badge/lanyard-badge.tsx ---

```tsx
"use client";
import { useEffect, useRef, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export interface LanyardBadgeProps {
  name?: string;
  role?: string;
  event?: string;
  tag?: string;
  strap?: string;
  /** Gives the badge a nudge every few seconds until someone grabs it. */
  autoplay?: boolean;
}

const W = 420; // stage width
const H = 420; // stage height
const L = 150; // strap length
const BW = 168; // badge width
const BH = 228; // badge height

/**
 * A badge hanging from a strap. Drag it anywhere; let go and it swings
 * back as a damped pendulum, twisting with its sideways speed.
 */
export function LanyardBadge({ name = "Alex Rivera", role = "Design Engineer", event = "Motion Summit", tag = "Speaker", strap = "#0071e3", autoplay = false }: LanyardBadgeProps) {
  const stage = useRef<HTMLDivElement>(null);
  const px = useMotionValue(W / 2);
  const py = useMotionValue(L);
  const rot = useMotionValue(0);
  const twist = useMotionValue(0);
  const path = useMotionValue(`M ${W / 2} 0 L ${W / 2} ${L}`);
  const badgeX = useTransform(px, (v) => v - BW / 2);
  const st = useRef({ x: W / 2, y: L, vx: 0, vy: 0, r: 0, vr: 0, dragging: false, tx: 0, ty: 0, ox: 0, oy: 0, touched: false });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const ax = W / 2;
    const ay = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      const s = st.current;
      if (s.dragging) {
        const nx = s.x + (s.tx - s.x) * 0.45;
        const ny = s.y + (s.ty - s.y) * 0.45;
        s.vx = (nx - s.x) / dt;
        s.vy = (ny - s.y) / dt;
        s.x = nx;
        s.y = ny;
        // Elastic strap: allow some stretch, then resist.
        const dx = s.x - ax, dy = s.y - ay, d = Math.hypot(dx, dy), max = L * 1.35;
        if (d > max) { s.x = ax + (dx / d) * max; s.y = ay + (dy / d) * max; }
      } else {
        s.vy += 2200 * dt;
        s.vx *= Math.pow(0.35, dt);
        s.vy *= Math.pow(0.35, dt);
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const dx = s.x - ax, dy = s.y - ay, d = Math.hypot(dx, dy);
        if (d > L) {
          const nx = dx / d, ny = dy / d;
          // Pull back toward the strap length like a stiff spring, and drop radial velocity.
          s.x = ax + nx * (L + (d - L) * 0.6);
          s.y = ay + ny * (L + (d - L) * 0.6);
          const radial = s.vx * nx + s.vy * ny;
          if (radial > 0) { s.vx -= radial * nx * 0.9; s.vy -= radial * ny * 0.9; }
        }
      }
      // Badge angle follows the strap with its own spring, so it lags and overshoots.
      const target = (-Math.atan2(s.x - ax, s.y - ay) * 180) / Math.PI;
      s.vr += ((target - s.r) * 180 - s.vr * 14) * dt;
      s.r += s.vr * dt;
      px.set(s.x);
      py.set(s.y);
      rot.set(s.r);
      twist.set(Math.max(-55, Math.min(55, s.vx * 0.05)));
      const d = Math.hypot(s.x - ax, s.y - ay);
      const sag = Math.sqrt(Math.max(0, L * L - d * d)) * 0.7;
      const mx = (ax + s.x) / 2, my = (ay + s.y) / 2 + sag;
      path.set(`M ${ax} ${ay} Q ${mx} ${my} ${s.x} ${s.y}`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [path, px, py, rot, twist]);

  useEffect(() => {
    if (!autoplay) return;
    const nudge = () => {
      const s = st.current;
      if (s.touched || s.dragging) return;
      s.vx += (Math.random() > 0.5 ? 1 : -1) * (700 + Math.random() * 500);
      s.vy -= 200;
    };
    const a = setTimeout(nudge, 600);
    const b = setInterval(nudge, 4200);
    return () => { clearTimeout(a); clearInterval(b); };
  }, [autoplay]);

  const toLocal = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  // Keyboard: arrows flick the badge sideways, Enter/Space toss it up.
  const onKeyDown = (e: RKeyboardEvent) => {
    const s = st.current;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      s.touched = true;
      s.vx += (e.key === "ArrowLeft" ? -1 : 1) * 900;
      s.vy -= 200;
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      s.touched = true;
      s.vy -= 900;
    }
  };

  const release = () => {
    st.current.dragging = false;
  };

  return (
    <div ref={stage} className="relative touch-none select-none" style={{ width: W, height: H, maxWidth: "100%", perspective: 900 }}>
      <svg className="pointer-events-none absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <motion.path d={path} fill="none" stroke={strap} strokeWidth={12} strokeLinecap="round" />
        <motion.path d={path} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
      </svg>
      <span className="absolute left-1/2 top-0 h-3 w-8 -translate-x-1/2 rounded-b-md bg-[#d2d2d7] dark:bg-[#48484a]" aria-hidden="true" />
      <motion.div
        role="img"
        tabIndex={0}
        aria-label={`${event} badge for ${name}, ${role}. Drag to swing it, or use the arrow keys.`}
        className="absolute left-0 top-0 cursor-grab rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 active:cursor-grabbing dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        style={{ x: badgeX, y: py, rotate: rot, rotateY: twist, originX: 0.5, originY: 0, width: BW, height: BH + 18, transformStyle: "preserve-3d" }}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          const s = st.current;
          const p = toLocal(e);
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          s.dragging = true;
          s.touched = true;
          s.ox = p.x - s.x;
          s.oy = p.y - s.y;
          s.tx = s.x;
          s.ty = s.y;
        }}
        onPointerMove={(e) => {
          const s = st.current;
          if (!s.dragging) return;
          const p = toLocal(e);
          s.tx = p.x - s.ox;
          s.ty = p.y - s.oy;
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <span className="absolute left-1/2 top-0 h-[22px] w-[26px] -translate-x-1/2 rounded-[6px] bg-[linear-gradient(180deg,#e5e5ea,#aeaeb2)] shadow-[inset_0_1px_0_#fff,0_2px_4px_rgba(0,0,0,.2)]" />
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_30px_50px_-24px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_30px_50px_-24px_rgba(0,0,0,.9)]"
          style={{ height: BH }}
        >
          <span className="mx-auto mt-3 h-2 w-12 rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]" />
          <div className="flex flex-1 flex-col items-center gap-2 px-4 pt-4 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#86868b] dark:text-[#8e8e93]">{event} 2026</span>
            <span className="flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-semibold text-white" style={{ background: `linear-gradient(135deg, ${strap}, #5e5ce6)` }}>
              {name.split(" ").map((w) => w[0]).join("")}
            </span>
            <span className="text-[18px] font-semibold leading-tight tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{name}</span>
            <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{role}</span>
          </div>
          <span className="flex h-9 items-center justify-center text-[12px] font-semibold uppercase tracking-[0.18em] text-white" style={{ background: strap }}>
            {tag}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
```
