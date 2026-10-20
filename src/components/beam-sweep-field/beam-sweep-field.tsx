"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export type BeamFieldProps = {
  /** Content placed over the field. Defaults to a short hero. */
  children?: ReactNode;
  /** Number of sweeping light columns (1 to 5). */
  beams?: number;
  /** Beam colour (any CSS colour). */
  color?: string;
  /** Seconds for one sweep across the field. */
  speed?: number;
  /** Caption at the bottom edge. Pass an empty string to hide it. */
  hint?: string;
  /** Swings a beam onto a few points across the field until someone moves over it. */
  autoplay?: boolean;
  className?: string;
};

const MAX = 5;
/** Autoplay targets as fractions of the width. */
const DEMO = [0.24, 0.72, 0.46, 0.86, 0.32];
/** Half-width in px of the band of grid a beam lights. */
const BAND = 110;

/**
 * A dark backdrop where columns of light sweep across a fine grid and light
 * the lines they pass. Move over it and the nearest beam swings onto the
 * pointer, leans into the move and overshoots before settling; let go and it
 * drifts back into its sweep.
 */
export function BeamField({
  children,
  beams = 3,
  color = "#67e8f9",
  speed = 11,
  hint = "Move across the field. The nearest beam follows.",
  autoplay = false,
  className,
}: BeamFieldProps) {
  const still = useReducedMotion() === true;
  const n = Math.max(1, Math.min(MAX, Math.round(beams)));
  const period = Math.max(2, speed);
  const root = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, inside: false });
  const touched = useRef(false);

  // One motion value per possible beam, always created so hooks never change order.
  const x0 = useMotionValue(120);
  const x1 = useMotionValue(300);
  const x2 = useMotionValue(480);
  const x3 = useMotionValue(-9999);
  const x4 = useMotionValue(-9999);
  const k0 = useMotionValue(0);
  const k1 = useMotionValue(0);
  const k2 = useMotionValue(0);
  const k3 = useMotionValue(0);
  const k4 = useMotionValue(0);
  const xs: MotionValue<number>[] = [x0, x1, x2, x3, x4];
  const skews: MotionValue<number>[] = [k0, k1, k2, k3, k4];

  // The bright copy of the grid only shows inside a band around each beam.
  const lit = useTransform([x0, x1, x2, x3, x4], (v: number[]) =>
    v
      .map((x) => `linear-gradient(90deg, transparent ${Math.round(x - BAND)}px, #000 ${Math.round(x)}px, transparent ${Math.round(x + BAND)}px)`)
      .join(", "),
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mvX = [x0, x1, x2, x3, x4];
    const mvK = [k0, k1, k2, k3, k4];
    let w = el.clientWidth || 600;
    const ro = new ResizeObserver(() => {
      w = el.clientWidth || w;
      if (still) place();
    });
    ro.observe(el);
    function place() {
      mvX.forEach((m, i) => m.set(i < n ? Math.round((w * (i + 1)) / (n + 1)) : -9999));
      mvK.forEach((m) => m.set(0));
    }
    if (still) {
      place();
      return () => ro.disconnect();
    }

    const pos = Array.from({ length: MAX }, (_, i) => (w * (i + 1)) / (n + 1));
    const vel = new Array<number>(MAX).fill(0);
    for (let i = n; i < MAX; i++) mvX[i].set(-9999);
    let caught: number | null = null;
    let t = 0;
    let demoClock = 0;
    let demoStep = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e?.isIntersecting ?? true;
    });
    io.observe(el);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      t += dt;

      let target: number | null = null;
      if (pointer.current.inside) target = pointer.current.x;
      else if (autoplay && !touched.current) {
        demoClock += dt;
        if (demoClock > 2.4) {
          demoClock = 0;
          demoStep++;
        }
        // Hold the beam on a point, then let it drift back for the last stretch of each step.
        if (demoClock < 1.6) target = DEMO[demoStep % DEMO.length] * w;
      }
      if (target === null) caught = null;
      else if (caught === null) {
        let best = 0;
        for (let i = 1; i < n; i++) if (Math.abs(pos[i] - target) < Math.abs(pos[best] - target)) best = i;
        caught = best;
      }

      for (let i = 0; i < n; i++) {
        const free = w * (0.5 + 0.6 * Math.sin((t / (period + i * 3)) * Math.PI * 2 + i * 2.1));
        const onPointer = caught === i && target !== null;
        // Underdamped on the pointer (it overshoots), close to critical on the free sweep.
        const k = onPointer ? 130 : 26;
        const c = onPointer ? 9 : 10;
        const goal = onPointer ? (target as number) : free;
        vel[i] += (k * (goal - pos[i]) - c * vel[i]) * dt;
        pos[i] += vel[i] * dt;
        mvX[i].set(pos[i]);
        mvK[i].set(Math.max(-16, Math.min(16, -vel[i] * 0.014)));
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [n, period, still, autoplay, x0, x1, x2, x3, x4, k0, k1, k2, k3, k4]);

  const tint = (pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;
  const grid = (alpha: string) =>
    `linear-gradient(${alpha} 1px, transparent 1px), linear-gradient(90deg, ${alpha} 1px, transparent 1px)`;

  return (
    <section
      ref={root}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        pointer.current = { x: e.clientX - r.left, inside: true };
      }}
      onPointerLeave={() => {
        pointer.current.inside = false;
      }}
      className={cn(
        "relative isolate flex min-h-[420px] w-full items-center justify-center overflow-hidden rounded-[24px] bg-[#05070b] px-6 py-16 text-white sm:px-8",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000,transparent)]">
          <div className="absolute inset-0" style={{ backgroundImage: grid("rgba(255,255,255,0.045)"), backgroundSize: "44px 44px" }} />
          <motion.div
            className="absolute inset-0"
            style={{ backgroundImage: grid(tint(60)), backgroundSize: "44px 44px", maskImage: lit, WebkitMaskImage: lit }}
          />
        </div>
        <div className="absolute inset-x-[-10%] bottom-[-38%] h-[70%] rounded-[100%] blur-3xl" style={{ background: `radial-gradient(closest-side, ${tint(22)}, transparent)` }} />
        {xs.slice(0, n).map((x, i) => (
          <motion.div key={i} className="absolute inset-y-0 left-0 w-0" style={{ x }}>
            <motion.div className="absolute inset-y-0 -left-[90px] w-[180px] origin-bottom" style={{ skewX: skews[i] }}>
              <div
                className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
                style={{ background: `linear-gradient(to bottom, transparent, ${tint(70)} 35%, #fff 78%, transparent)` }}
              />
              <div
                className="absolute inset-y-[6%] left-1/2 w-[110px] -translate-x-1/2 opacity-50 blur-2xl"
                style={{ background: `linear-gradient(to bottom, transparent, ${color} 60%, transparent)` }}
              />
              <div
                className="absolute bottom-[12%] left-1/2 h-8 w-36 -translate-x-1/2 rounded-full opacity-60 blur-xl"
                style={{ background: `radial-gradient(closest-side, ${color}, transparent)` }}
              />
            </motion.div>
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#05070b_96%)]" />
      </div>

      {children ?? (
        <div className="relative max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[12px] font-medium text-white/75 backdrop-blur">
            <span className="size-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
            Now in public beta
          </span>
          <h2 className="mt-5 text-[32px] font-semibold leading-[1.04] tracking-[-0.045em] [text-wrap:balance] sm:text-[44px]">
            Observability that sees every request.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
            Trace a slow page to the line of code behind it, without adding a single SDK.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <motion.a
              href="#"
              whileTap={{ scale: 0.95 }}
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b]"
            >
              Start tracing
              <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </motion.a>
            <motion.a
              href="#"
              whileTap={{ scale: 0.95 }}
              className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[14px] font-medium text-white/85 outline-none hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#0a84ff]"
            >
              Read the docs
            </motion.a>
          </div>
        </div>
      )}

      {hint ? <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-[12px] text-white/55">{hint}</p> : null}
    </section>
  );
}
