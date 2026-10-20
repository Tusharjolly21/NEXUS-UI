"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type NebulaCtaAction = { label: string; href?: string; onClick?: () => void };

export interface NebulaCtaGlowProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** The bright button. `null` hides it. */
  primaryAction?: NebulaCtaAction | null;
  /** Quiet text link beside it. `null` hides it. */
  secondaryAction?: NebulaCtaAction | null;
  /** The two nebula colours, as CSS colours. */
  colors?: [string, string];
  /** How many stars to draw. */
  stars?: number;
  /** Lets an invisible pointer drift around the button and press it now and then until someone points at the card. */
  autoplay?: boolean;
  className?: string;
}

/** Small seeded PRNG so the starfield is identical on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Geo = { w: number; h: number; bx: number; by: number };

/** The pointer coordinate pulled toward the button's, harder the nearer the pointer is. */
function usePull(p: MotionValue<number>, near: MotionValue<number>, geo: React.RefObject<Geo>, key: "bx" | "by", pull: number) {
  return useTransform([p, near], ([v, n]: number[]) => {
    const b = geo.current[key];
    return v + (b - v) * Math.min(1, n * pull);
  });
}

function ActionLink({ action, className, children, onPress }: { action: NebulaCtaAction; className: string; children: React.ReactNode; onPress?: () => void }) {
  return (
    <a
      href={action.href ?? "#"}
      onClick={(e) => {
        if (!action.href) e.preventDefault();
        onPress?.();
        action.onClick?.();
      }}
      className={className}
    >
      {children}
    </a>
  );
}

/**
 * A call-to-action on a night sky. Two nebulae drift after the pointer on
 * lazy springs; bring it near the button and they gather around it and
 * brighten while the button leans toward you. Press it and the glow blooms
 * out in a ring.
 */
export function NebulaCtaGlow({
  eyebrow = "Ready when you are",
  title = "Start building faster",
  description = "Every component, live and editable. Copy the code or install it in one line.",
  primaryAction = { label: "Start building" },
  secondaryAction = { label: "Browse components" },
  colors = ["#0a84ff", "#bf5af2"],
  stars = 140,
  autoplay = false,
  className = "",
}: NebulaCtaGlowProps) {
  const still = useReducedMotion() === true;
  const card = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const button = React.useRef<HTMLSpanElement>(null);
  const geo = React.useRef<Geo>({ w: 600, h: 400, bx: 300, by: 280 });
  const touched = React.useRef(false);
  const [blooms, setBlooms] = React.useState<number[]>([]);

  // Pointer in card pixels; starts parked on the button so the glow rests there.
  const px = useMotionValue(300);
  const py = useMotionValue(280);
  const near = useTransform([px, py], ([x, y]: number[]) => {
    const g = geo.current;
    const d = Math.hypot(x - g.bx, y - g.by);
    return Math.max(0, 1 - d / Math.max(220, g.w * 0.45));
  });
  const nearS = useSpring(near, { stiffness: 120, damping: 20 });
  const ax = useSpring(usePull(px, near, geo, "bx", 0.9), { stiffness: 55, damping: 13 });
  const ay = useSpring(usePull(py, near, geo, "by", 0.9), { stiffness: 55, damping: 13 });
  const bx = useSpring(usePull(px, near, geo, "bx", 0.6), { stiffness: 28, damping: 10 });
  const by = useSpring(usePull(py, near, geo, "by", 0.6), { stiffness: 28, damping: 10 });
  const glowA = useMotionTemplate`radial-gradient(240px 200px at ${ax}px ${ay}px, ${colors[0]}, transparent 70%)`;
  const glowB = useMotionTemplate`radial-gradient(300px 220px at ${bx}px ${by}px, ${colors[1]}, transparent 70%)`;
  const glowOpacity = useTransform(nearS, [0, 1], [0.55, 1]);
  const halo = useTransform(nearS, [0, 1], [0.15, 0.9]);
  const haloScale = useTransform(nearS, [0, 1], [0.85, 1.12]);
  const mx = useSpring(useTransform([px, near], ([x, n]: number[]) => (still ? 0 : Math.max(-14, Math.min(14, (x - geo.current.bx) * 0.12 * n)))), { stiffness: 300, damping: 18 });
  const my = useSpring(useTransform([py, near], ([y, n]: number[]) => (still ? 0 : Math.max(-10, Math.min(10, (y - geo.current.by) * 0.12 * n)))), { stiffness: 300, damping: 18 });

  // Keep the card size and button centre current; park the glow on the button at first.
  React.useEffect(() => {
    const c = card.current;
    if (!c || typeof ResizeObserver === "undefined") return;
    let first = true;
    const measure = () => {
      const r = c.getBoundingClientRect();
      const b = button.current?.getBoundingClientRect();
      geo.current = { w: r.width, h: r.height, bx: b ? b.left - r.left + b.width / 2 : r.width / 2, by: b ? b.top - r.top + b.height / 2 : r.height * 0.7 };
      if (first) {
        first = false;
        px.set(geo.current.bx);
        py.set(geo.current.by - 40);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(c);
    return () => ro.disconnect();
  }, [px, py]);

  // Starfield: seeded, twinkling, with a little parallax against the pointer.
  React.useEffect(() => {
    const cv = canvas.current;
    const c = card.current;
    if (!cv || !c) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const rnd = mulberry32(7);
    const field = Array.from({ length: Math.max(0, Math.min(600, stars)) }, () => ({
      x: rnd(),
      y: rnd(),
      r: rnd() < 0.08 ? 1.3 + rnd() * 0.6 : 0.4 + rnd() * 0.7,
      depth: 0.2 + rnd() * 0.8,
      phase: rnd() * Math.PI * 2,
      speed: 0.6 + rnd() * 1.8,
    }));
    let raf = 0;
    let w = 0;
    let h = 0;
    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(size) : null;
    ro?.observe(c);
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const ox = (px.get() / Math.max(1, w) - 0.5) * 14;
      const oy = (py.get() / Math.max(1, h) - 0.5) * 10;
      for (const s of field) {
        const tw = still ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.speed + s.phase);
        ctx.globalAlpha = tw * (0.35 + s.depth * 0.65);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x * w - ox * s.depth, s.y * h - oy * s.depth, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!still) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [stars, still, px, py]);

  const bloom = React.useCallback(() => {
    if (still) return;
    const k = performance.now();
    setBlooms((b) => [...b.slice(-2), k]);
  }, [still]);

  // Autoplay: an invisible pointer loops toward the button and away, pressing it now and then.
  React.useEffect(() => {
    if (!autoplay || still) return;
    let run: AnimationPlaybackControls | undefined;
    let wait: ReturnType<typeof setTimeout> | undefined;
    let k = 0;
    const legs = [
      (g: Geo) => [g.w * 0.14, g.h * 0.22],
      (g: Geo) => [g.bx + 30, g.by - 6],
      (g: Geo) => [g.w * 0.86, g.h * 0.3],
      (g: Geo) => [g.bx - 20, g.by + 4],
    ];
    const step = () => {
      if (touched.current) return;
      const [tx, ty] = legs[k % legs.length](geo.current);
      const press = k % legs.length === 1 || k % legs.length === 3;
      k++;
      const fx = px.get();
      const fy = py.get();
      run = animate(0, 1, {
        duration: 1.8,
        ease: [0.45, 0, 0.2, 1],
        onUpdate: (t) => {
          if (touched.current) return;
          px.set(fx + (tx - fx) * t);
          py.set(fy + (ty - fy) * t);
        },
        onComplete: () => {
          if (touched.current) return;
          if (press) bloom();
          wait = setTimeout(step, press ? 900 : 300);
        },
      });
    };
    wait = setTimeout(step, 600);
    return () => {
      run?.stop();
      clearTimeout(wait);
    };
  }, [autoplay, still, px, py, bloom]);

  const onMove = (e: React.PointerEvent) => {
    touched.current = true;
    const r = card.current?.getBoundingClientRect();
    if (!r) return;
    px.set(e.clientX - r.left);
    py.set(e.clientY - r.top);
  };

  const focus = "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b12]";

  return (
    <div
      ref={card}
      onPointerMove={onMove}
      onPointerDown={() => {
        touched.current = true;
      }}
      onPointerLeave={() => {
        px.set(geo.current.bx);
        py.set(geo.current.by - 60);
      }}
      className={`@container relative isolate w-full overflow-hidden rounded-[28px] bg-[#07070c] px-6 py-14 text-center shadow-[0_0_0_1px_rgba(255,255,255,.06),0_30px_60px_-30px_rgba(0,0,0,.6)] @[560px]:px-10 @[560px]:py-16 ${className}`}
    >
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 -z-10 size-full" />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen" style={{ backgroundImage: glowB, opacity: glowOpacity, filter: "blur(28px)" }} />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen" style={{ backgroundImage: glowA, opacity: glowOpacity, filter: "blur(18px)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_0%,transparent_40%,rgba(0,0,0,.55))]" />

      {eyebrow && <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/70">{eyebrow}</p>}
      <h2 className="mx-auto mt-3 max-w-[560px] bg-gradient-to-b from-white to-white/70 bg-clip-text text-[34px] font-semibold leading-[1.02] tracking-[-0.045em] text-transparent [text-wrap:balance] @[560px]:text-[48px]">
        {title}
      </h2>
      {description && <p className="mx-auto mt-4 max-w-[420px] text-[15px] leading-relaxed text-white/70">{description}</p>}

      {(primaryAction || secondaryAction) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {primaryAction && (
            <span ref={button} className="relative inline-flex">
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -inset-5 rounded-full"
                style={{ opacity: halo, scale: haloScale, background: `radial-gradient(closest-side, ${colors[0]}cc, ${colors[1]}55 60%, transparent)`, filter: "blur(10px)" }}
              />
              {blooms.map((k) => (
                <motion.span
                  key={k}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full border-2"
                  style={{ borderColor: colors[0] }}
                  initial={{ scale: 1, opacity: 0.9 }}
                  animate={{ scale: 3.2, opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                  onAnimationComplete={() => setBlooms((b) => b.filter((x) => x !== k))}
                />
              ))}
              <motion.span className="relative inline-flex" style={{ x: mx, y: my }} whileTap={still ? undefined : { scale: 0.94 }} transition={{ type: "spring", stiffness: 600, damping: 18 }}>
                <ActionLink
                  action={primaryAction}
                  onPress={() => {
                    touched.current = true;
                    bloom();
                  }}
                  className={`relative inline-flex h-12 items-center gap-2 rounded-full bg-white pl-6 pr-5 text-[15px] font-semibold text-[#1d1d1f] shadow-[0_10px_30px_-10px_rgba(255,255,255,.5)] transition-colors hover:bg-[#f5f5f7] ${focus}`}
                >
                  {primaryAction.label}
                  <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 8h9.5M8.5 4l4 4-4 4" />
                  </svg>
                </ActionLink>
              </motion.span>
            </span>
          )}
          {secondaryAction && (
            <ActionLink action={secondaryAction} className={`rounded-full px-2 py-1 text-[15px] font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline ${focus}`}>
              {secondaryAction.label}
            </ActionLink>
          )}
        </div>
      )}
    </div>
  );
}

/** Older name for the same component. */
export const NebulaCta = NebulaCtaGlow;
