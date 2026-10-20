"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export type HeroAuroraProps = {
  /** Pill text above the headline. */
  eyebrow?: string;
  /** Headline. */
  title?: ReactNode;
  /** Supporting line. */
  subtitle?: string;
  /** Primary call to action. */
  primary?: { label: string; href: string };
  /** Secondary call to action. */
  secondary?: { label: string; href: string };
  /** Colour of the light that follows the pointer. */
  spotlight?: string;
  /** Moves a pretend pointer across the hero until someone moves over it. */
  autoplay?: boolean;
  className?: string;
};

/** Autoplay pointer stops, as fractions of the hero. */
const DEMO = [
  [0.28, 0.72],
  [0.74, 0.58],
  [0.52, 0.86],
  [0.82, 0.3],
];

const STATS: { label: string; value: number; suffix: string; decimals: number; delta: string; up: boolean }[] = [
  { label: "Conversion", value: 4.8, suffix: "%", decimals: 1, delta: "+0.9", up: true },
  { label: "Sessions", value: 128, suffix: "k", decimals: 0, delta: "+12%", up: true },
  { label: "Bounce", value: 31, suffix: "%", decimals: 0, delta: "-4%", up: false },
];

/**
 * A launch hero on a slow aurora. A soft spotlight trails the pointer, the
 * ribbons of light drift against it, and the glass product card under the
 * headline rises in with an overshoot and tilts toward the pointer while a
 * glare slides across it.
 */
export function HeroAurora({
  eyebrow = "Introducing Aurora 2.0",
  title = (
    <>
      Ship <span className="bg-gradient-to-r from-[#7de3ff] via-white to-[#e2b8ff] bg-clip-text text-transparent">cinematic</span> interfaces in an afternoon.
    </>
  ),
  subtitle = "Motion-native components with taste built in. Copy them, own them, launch something people remember.",
  primary = { label: "Start building", href: "#" },
  secondary = { label: "Watch the film", href: "#" },
  spotlight = "rgba(100,210,255,0.22)",
  autoplay = false,
  className,
}: HeroAuroraProps) {
  const still = useReducedMotion() === true;
  const gid = `aurora-area-${useId().replace(/:/g, "")}`;
  const touched = useRef(false);
  const nx = useMotionValue(0.5);
  const ny = useMotionValue(0.35);
  const sx = useSpring(nx, { stiffness: 110, damping: 20 });
  const sy = useSpring(ny, { stiffness: 110, damping: 20 });
  const lx = useTransform(sx, (v) => `${(v * 100).toFixed(2)}%`);
  const ly = useTransform(sy, (v) => `${(v * 100).toFixed(2)}%`);
  const light = useMotionTemplate`radial-gradient(520px circle at ${lx} ${ly}, ${spotlight}, transparent 60%)`;
  // Card tilt: a looser spring than the light so it lags and swings.
  const tiltX = useSpring(useTransform(ny, (v) => (0.5 - v) * 14), { stiffness: 140, damping: 12 });
  const tiltY = useSpring(useTransform(nx, (v) => (v - 0.5) * 18), { stiffness: 140, damping: 12 });
  const glare = useTransform(sx, (v) => `${(v * 140 - 20).toFixed(2)}%`);
  const glareBg = useMotionTemplate`linear-gradient(105deg, transparent calc(${glare} - 18%), rgba(255,255,255,.14) ${glare}, transparent calc(${glare} + 18%))`;
  // Ribbons drift on their own and lean away from the pointer.
  const drift = useMotionValue(0);
  const r1 = useTransform([drift, sx] as MotionValue<number>[], ([t, x]: number[]) => Math.sin(t * 0.21) * 70 - (x - 0.5) * 60);
  const r2 = useTransform([drift, sx] as MotionValue<number>[], ([t, x]: number[]) => Math.cos(t * 0.17) * 60 + (x - 0.5) * 40);
  const r3 = useTransform([drift, sy] as MotionValue<number>[], ([t, y]: number[]) => Math.sin(t * 0.13 + 1) * 40 - (y - 0.5) * 30);
  const rot1 = useTransform(drift, (t) => -12 + Math.sin(t * 0.11) * 6);
  const rot2 = useTransform(drift, (t) => 14 + Math.cos(t * 0.09) * 6);

  useEffect(() => {
    if (still) return;
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    let step = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      drift.set(drift.get() + dt);
      if (autoplay && !touched.current) {
        clock += dt;
        if (clock > 1.9) {
          clock = 0;
          const [x, y] = DEMO[step++ % DEMO.length];
          nx.set(x);
          ny.set(y);
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [still, autoplay, drift, nx, ny]);

  return (
    <section
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        touched.current = true;
        nx.set((e.clientX - r.left) / r.width);
        ny.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        nx.set(0.5);
        ny.set(0.35);
      }}
      className={cn(
        "relative isolate w-full overflow-hidden rounded-[24px] bg-[#06060a] px-5 pt-14 text-center text-white sm:px-8 sm:pt-16",
        "shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div className="absolute left-[-15%] top-[-28%] h-[62%] w-[75%] rounded-[50%] bg-[#5e5ce6] opacity-60 blur-[90px]" style={{ x: r1, rotate: rot1 }} />
        <motion.div className="absolute right-[-15%] top-[-18%] h-[50%] w-[65%] rounded-[50%] bg-[#64d2ff] opacity-40 blur-[100px]" style={{ x: r2, rotate: rot2 }} />
        <motion.div className="absolute bottom-[8%] left-[25%] h-[38%] w-[50%] rounded-[50%] bg-[#bf5af2] opacity-35 blur-[110px]" style={{ y: r3 }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,#000_20%,transparent_70%)]" />
        <motion.div className="absolute inset-0" style={{ backgroundImage: light }} />
      </div>

      <motion.span
        initial={still ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-[12px] font-medium text-white/80 backdrop-blur"
      >
        <span className="size-1.5 rounded-full bg-[#64d2ff] shadow-[0_0_10px_#64d2ff]" /> {eyebrow}
      </motion.span>
      <motion.h1
        initial={still ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.06 }}
        className="mx-auto mt-5 max-w-[640px] text-[34px] font-semibold leading-[1.02] tracking-[-0.05em] [text-wrap:balance] sm:text-[46px]"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={still ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.12 }}
        className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/65 sm:text-[16px]"
      >
        {subtitle}
      </motion.p>
      <motion.div
        initial={still ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.18 }}
        className="mt-7 flex flex-wrap items-center justify-center gap-3"
      >
        <motion.a
          href={primary.href}
          whileTap={{ scale: 0.95 }}
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-[#1d1d1f] shadow-[0_8px_30px_-10px_rgba(255,255,255,0.55)] outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060a]"
        >
          {primary.label}
          <svg aria-hidden viewBox="0 0 16 16" className="size-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </motion.a>
        <motion.a
          href={secondary.href}
          whileTap={{ scale: 0.95 }}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-5 text-[14px] font-medium text-white/85 backdrop-blur outline-none hover:bg-white/[0.09] focus-visible:ring-2 focus-visible:ring-[#0a84ff]"
        >
          <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
            <path d="M4.5 2.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L5.4 2.3a.6.6 0 0 0-.9.5Z" />
          </svg>
          {secondary.label}
        </motion.a>
      </motion.div>

      <div className="mx-auto mt-9 max-w-2xl [perspective:1200px]">
        <motion.div
          aria-hidden
          initial={still ? false : { opacity: 0, y: 70, rotateX: 18 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 11, delay: 0.25 }}
        >
          <motion.div
            style={still ? undefined : { rotateX: tiltX, rotateY: tiltY }}
            className="relative overflow-hidden rounded-t-[22px] border border-b-0 border-white/10 bg-white/[0.06] p-2 pb-0 backdrop-blur-xl"
          >
            <div className="rounded-t-[16px] border border-b-0 border-white/10 bg-[#0c0c12] p-3 text-left sm:p-4">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#ff5f57]/80" />
                <span className="size-2 rounded-full bg-[#febc2e]/80" />
                <span className="size-2 rounded-full bg-[#28c840]/80" />
                <span className="ml-3 h-5 flex-1 rounded-md bg-white/[0.05]" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {STATS.map((s, i) => (
                  <div key={s.label} className="min-w-0 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 sm:p-3">
                    <p className="truncate text-[11px] text-white/55">{s.label}</p>
                    <p className="mt-1 text-[16px] font-semibold tracking-[-0.02em] tabular-nums sm:text-[19px]">
                      <CountUp to={s.value} decimals={s.decimals} delay={0.5 + i * 0.12} still={still} />
                      {s.suffix}
                    </p>
                    <p className={cn("text-[11px] font-medium tabular-nums", s.up ? "text-[#30d158]" : "text-[#64d2ff]")}>{s.delta}</p>
                  </div>
                ))}
              </div>
              <svg viewBox="0 0 300 60" className="mt-2 h-16 w-full rounded-xl border border-white/10 bg-white/[0.02]" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#64d2ff" stopOpacity=".35" />
                    <stop offset="1" stopColor="#64d2ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 48 C 30 44, 50 30, 80 34 S 130 22, 160 26 S 220 10, 250 14 S 290 6, 300 4 L 300 60 L 0 60 Z" fill={`url(#${gid})`} />
                <motion.path
                  d="M0 48 C 30 44, 50 30, 80 34 S 130 22, 160 26 S 220 10, 250 14 S 290 6, 300 4"
                  fill="none"
                  stroke="#64d2ff"
                  strokeWidth="1.6"
                  vectorEffect="non-scaling-stroke"
                  initial={still ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </div>
            <motion.div className="pointer-events-none absolute inset-0" style={{ backgroundImage: glareBg }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CountUp({ to, decimals, delay, still }: { to: number; decimals: number; delay: number; still: boolean }) {
  const v = useMotionValue(still ? to : 0);
  const text = useTransform(v, (n) => n.toFixed(decimals));
  useEffect(() => {
    if (still) return;
    const run = animate(v, to, { type: "spring", stiffness: 60, damping: 16, delay });
    return () => run.stop();
  }, [v, to, delay, still]);
  return <motion.span>{text}</motion.span>;
}
