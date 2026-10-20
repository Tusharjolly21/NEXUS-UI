"use client";

import { useEffect, useRef, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";

export interface NebulaStat {
  label: string;
  value: string;
}

export interface NebulaGlassCardProps {
  /** Small label above the title. */
  eyebrow?: string;
  /** Card heading. */
  title?: string;
  /** One or two lines under the heading. */
  description?: string;
  /** Up to three figures along the bottom. */
  stats?: NebulaStat[];
  /** Button label. Empty string hides the button. */
  cta?: string;
  /** Called when the button is pressed. */
  onAction?: () => void;
  /** Three colours for the nebula behind the glass and the edge light. */
  hues?: [string, string, string];
  /** Maximum tilt in degrees. */
  tiltStrength?: number;
  /** Replaces the default body (eyebrow, title, description, stats). */
  children?: ReactNode;
  /** Hint under the card. Empty string hides it. */
  hint?: string;
  /** Sweeps a virtual pointer across the card until someone touches it. */
  autoplay?: boolean;
  className?: string;
}

const DEFAULT_STATS: NebulaStat[] = [
  { label: "Renders", value: "12.4k" },
  { label: "Uptime", value: "99.98%" },
  { label: "Regions", value: "28" },
];

function Spark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5l2.1 6.1 6.4 2.4-6.4 2.4L12 19.5l-2.1-6.1L3.5 11l6.4-2.4z" fill="currentColor" />
    </svg>
  );
}

/**
 * A frosted glass card floating over a slow nebula. It tilts toward the
 * pointer on springs, its layers sit at different depths, a rim light runs
 * round the edge on the side the pointer is, and a press dips the card in
 * and flashes the rim before it springs back.
 */
export function NebulaGlassCard({
  eyebrow = "Nebula Pro",
  title = "Render anywhere",
  description = "Edge rendering in 28 regions, with previews that land before you finish the sentence.",
  stats = DEFAULT_STATS,
  cta = "Upgrade",
  onAction,
  hues = ["#bf5af2", "#0a84ff", "#ff6482"],
  tiltStrength = 12,
  children,
  hint = "Move over the glass, then press it.",
  autoplay = false,
  className = "",
}: NebulaGlassCardProps) {
  const still = useReducedMotion() === true;
  const touched = useRef(false);
  const flash = useRef<AnimationPlaybackControls | undefined>(undefined);

  // Pointer, normalised to -1..1 across the card.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);
  const spring = { stiffness: 170, damping: 13, mass: 0.8 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const lit = useSpring(hover, { stiffness: 120, damping: 20 });
  const press = useSpring(0, { stiffness: 420, damping: 16 });
  const flare = useMotionValue(0);

  const k = still ? 0 : tiltStrength;
  const rotateY = useTransform(sx, (v) => v * k);
  const rotateX = useTransform(sy, (v) => -v * k * 0.8);
  const z = useTransform(press, (p) => p * -40);
  const scale = useTransform(press, (p) => 1 - p * 0.03);
  const angle = useTransform([sx, sy], ([x, y]) => (Math.atan2(y as number, x as number) * 180) / Math.PI + 90);
  const gx = useTransform(sx, (v) => 50 + v * 42);
  const gy = useTransform(sy, (v) => 50 + v * 42);
  const rimOpacity = useTransform([lit, flare], ([l, f]) => 0.35 + (l as number) * 0.55 + (f as number) * 0.6);
  const glareOpacity = useTransform([lit, flare], ([l, f]) => (l as number) * 0.7 + (f as number) * 0.5);
  const rim = useMotionTemplate`conic-gradient(from ${angle}deg at 50% 50%, ${hues[0]} 0deg, ${hues[1]} 40deg, transparent 110deg, transparent 250deg, ${hues[2]} 320deg, ${hues[0]} 360deg)`;
  const glare = useMotionTemplate`radial-gradient(55% 70% at ${gx}% ${gy}%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)`;
  // The nebula drifts the other way, so the glass seems to float above it.
  const nx = useTransform(sx, (v) => v * -14);
  const ny = useTransform(sy, (v) => v * -10);

  const setFrom = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)));
    py.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));
  };

  const doFlash = () => {
    flash.current?.stop();
    flare.set(1);
    flash.current = animate(flare, 0, { type: "spring", stiffness: 60, damping: 14 });
  };

  useEffect(() => () => flash.current?.stop(), []);

  // A virtual pointer drawing a slow figure eight, with a press at each crossing.
  useEffect(() => {
    if (!autoplay) return;
    let raf = 0;
    const t0 = performance.now();
    let lastTap = 0;
    let up: number | undefined;
    hover.set(1);
    const loop = (now: number) => {
      if (touched.current) return;
      const t = (now - t0) / 1000;
      px.set(Math.sin(t * 0.9) * 0.85);
      py.set(Math.sin(t * 1.8) * 0.6);
      if (t - lastTap > 4.2) {
        lastTap = t;
        press.set(1);
        up = window.setTimeout(() => {
          press.set(0);
          flash.current?.stop();
          flare.set(1);
          flash.current = animate(flare, 0, { type: "spring", stiffness: 60, damping: 14 });
        }, 160);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(up);
    };
  }, [autoplay, px, py, hover, press, flare]);

  const stop = () => {
    if (touched.current) return;
    touched.current = true;
    press.set(0);
  };

  return (
    <div className={`flex max-w-full flex-col items-center gap-4 ${className}`}>
      <div className="relative w-[320px] max-w-full" style={{ perspective: 1000 }}>
        <motion.div className="pointer-events-none absolute -inset-8" style={{ x: nx, y: ny }} aria-hidden="true">
          {hues.map((h, i) => (
            <motion.span
              key={i}
              className="absolute h-40 w-40 rounded-full blur-[38px] opacity-70 dark:opacity-80"
              style={{ background: h, left: ["4%", "52%", "30%"][i], top: ["8%", "2%", "48%"][i] }}
              animate={still ? undefined : { x: [0, [24, -20, 16][i], 0], y: [0, [12, 18, -16][i], 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 9 + i * 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </motion.div>

        <motion.div
          className="relative rounded-[24px] outline-none"
          style={{ rotateX, rotateY, z, scale, transformStyle: "preserve-3d" }}
          onPointerEnter={() => {
            stop();
            hover.set(1);
          }}
          onPointerMove={(e) => {
            stop();
            setFrom(e);
          }}
          onPointerLeave={() => {
            hover.set(0);
            px.set(0);
            py.set(0);
            press.set(0);
          }}
          onPointerDown={(e) => {
            stop();
            setFrom(e);
            press.set(1);
          }}
          onPointerUp={() => {
            press.set(0);
            if (!still) doFlash();
          }}
          onPointerCancel={() => press.set(0)}
        >
          {/* Glass */}
          <div
            className="absolute inset-0 rounded-[24px] bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-30px_rgba(40,20,80,.55)] backdrop-blur-2xl dark:bg-[#1c1c1e]/60 dark:shadow-[inset_0_1px_0_rgba(255,255,255,.12),0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-30px_rgba(0,0,0,.9)]"
            aria-hidden="true"
          />
          {/* Rim light */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[24px] p-[1.5px]"
            style={{
              background: rim,
              opacity: rimOpacity,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
            }}
            aria-hidden="true"
          />
          {/* Glare */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[24px] mix-blend-soft-light dark:mix-blend-overlay"
            style={{ background: glare, opacity: glareOpacity }}
            aria-hidden="true"
          />

          <div className="relative p-6 text-[#1d1d1f] dark:text-[#f5f5f7]" style={{ transformStyle: "preserve-3d" }}>
            {children ?? (
              <>
                <motion.div style={{ z: 40 }} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[12px] font-semibold shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                    <span style={{ color: hues[0] }}>
                      <Spark />
                    </span>
                    {eyebrow}
                  </span>
                  <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">2026</span>
                </motion.div>
                <motion.h3 style={{ z: 30 }} className="mt-5 text-[26px] font-semibold leading-[1.05] tracking-[-0.035em]">
                  {title}
                </motion.h3>
                <motion.p style={{ z: 20 }} className="mt-2 text-[13px] leading-[1.45] text-[#424245] dark:text-[#a1a1a6]">
                  {description}
                </motion.p>
                {stats.length > 0 ? (
                  <motion.dl style={{ z: 24 }} className="mt-5 grid grid-cols-3 gap-2">
                    {stats.slice(0, 3).map((s) => (
                      <div key={s.label} className="min-w-0">
                        <dt className="truncate text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">{s.label}</dt>
                        <dd className="text-[17px] font-semibold tabular-nums tracking-[-0.02em]">{s.value}</dd>
                      </div>
                    ))}
                  </motion.dl>
                ) : null}
              </>
            )}
            {cta ? (
              <motion.div style={{ z: 50 }} className="mt-5">
                <motion.button
                  type="button"
                  onClick={onAction}
                  whileTap={{ scale: 0.95 }}
                  className="h-9 w-full rounded-full bg-[#1d1d1f] text-[13px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
                >
                  {cta}
                </motion.button>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>
      {hint ? <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{hint}</span> : null}
    </div>
  );
}

/** Older name for the same card. */
export const NebulaCard = NebulaGlassCard;

export default NebulaGlassCard;
