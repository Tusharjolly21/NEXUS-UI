"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type AnimationPlaybackControls,
} from "framer-motion";

export interface PolaroidScene {
  /** Top and bottom colours of the sky gradient. */
  sky: [string, string];
  /** Sea colour. */
  sea: string;
  /** Sun and glints on the water. */
  sun: string;
  /** Foreground hill colour. */
  land: string;
  /** Handwritten caption once the photo has developed. */
  caption: string;
}

export const DEFAULT_POLAROID_SCENES: PolaroidScene[] = [
  { sky: ["#ffb38a", "#ff6f91"], sea: "#5b6fd6", sun: "#fff3c4", land: "#3d2a5c", caption: "Lisbon, at six" },
  { sky: ["#a1e3ff", "#e9f7ff"], sea: "#2fa4b8", sun: "#ffffff", land: "#2f6b4f", caption: "Lagoon, day two" },
  { sky: ["#ffd36e", "#ff9f6b"], sea: "#c2410c", sun: "#fff8e1", land: "#5d3a1a", caption: "Desert road" },
];

export interface PolaroidDevelopProps {
  /** Optional photo to develop (any local or remote URL). Without it the drawn scenes are used. */
  src?: string;
  /** Alt text for `src`. */
  alt?: string;
  /** Caption written under `src` once it has developed. Ignored for the drawn scenes, which carry their own. */
  caption?: string;
  /** Drawn scenes cycled by "New photo" when no `src` is given. */
  scenes?: PolaroidScene[];
  /** Called with the caption (or `alt`) when the photo finishes developing. */
  onDeveloped?: (caption: string) => void;
  /** Shakes the photo by itself, then swaps to a new one, until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the root. */
  className?: string;
  /** How quickly a shake clears the haze, 1 is the default. Higher develops with gentler shakes. Clamped to 0.3 to 4. */
  sensitivity?: number;
  /** How far the photo tilts as you move it, 1 is the default and 0 keeps it level. Clamped to 0 to 2. */
  swing?: number;
  /** How far the photo follows the pointer when you drag it past its limit, 0.5 by default. Clamped to 0.1 to 1. */
  elasticity?: number;
  /** Lets the photo develop slowly by itself, the way a real one does. Turn it off and only shaking develops it. */
  selfDevelop?: boolean;
}

const clamp = (v: number, lo: number, hi: number) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : lo);

const SHAKE = [-40, 36, -32, 30, -26, 22, -16, 10, 0];
const HAND = "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive";

function Scene({ s, gid }: { s: PolaroidScene; gid: string }) {
  return (
    <svg viewBox="0 0 200 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.sky[0]} />
          <stop offset="1" stopColor={s.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="200" height="180" fill={`url(#${gid})`} />
      <circle cx="132" cy="70" r="22" fill={s.sun} />
      <rect y="100" width="200" height="80" fill={s.sea} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={110 - i * 6} y={104 + i * 8} width={44 + i * 12} height="2" rx="1" fill={s.sun} opacity={0.6 - i * 0.15} />
      ))}
      <path d="M0 120 C 30 96, 60 104, 86 118 S 130 140, 200 128 V180 H0Z" fill={s.land} />
    </svg>
  );
}

/**
 * An instant photo you develop by shaking. Grab it and shake: the faster you
 * move it, the quicker the grey haze clears and the colour comes through.
 * It swings on its own weight as you drag, and once it's developed a caption
 * writes itself along the bottom.
 */
export function PolaroidDevelop({
  src,
  alt = "",
  caption,
  scenes = DEFAULT_POLAROID_SCENES,
  onDeveloped,
  autoplay = false,
  className = "",
  sensitivity = 1,
  swing = 1,
  elasticity = 0.5,
  selfDevelop = true,
}: PolaroidDevelopProps) {
  // Read inside motion callbacks and timers, so the tuning applies live without a remount.
  const opts = useRef({ sensitivity: clamp(sensitivity, 0.3, 4), swing: clamp(swing, 0, 2), selfDevelop });
  useEffect(() => {
    opts.current = { sensitivity: clamp(sensitivity, 0.3, 4), swing: clamp(swing, 0, 2), selfDevelop };
  }, [sensitivity, swing, selfDevelop]);
  const [k, setK] = useState(0);
  const dev = useMotionValue(0);
  const [done, setDone] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const vx = useVelocity(x);
  const vy = useVelocity(y);
  const lean = useTransform(vx, (v) => Math.max(-14, Math.min(14, v / 60)) * opts.current.swing);
  const rotate = useSpring(lean, { stiffness: 200, damping: 14 });
  const haze = useTransform(dev, (d) => 1 - d);
  const filter = useTransform(
    dev,
    (d) => `saturate(${0.2 + d * 0.8}) contrast(${0.7 + d * 0.3}) blur(${(1 - d) * 3}px) brightness(${1.25 - d * 0.25})`,
  );
  const imgOpacity = useTransform(dev, (d) => 0.15 + d * 0.85);
  const touched = useRef(false);
  const shakeCtl = useRef<AnimationPlaybackControls | undefined>(undefined);
  const reduced = useReducedMotion();
  const gid = `polaroid-sky-${useId().replace(/:/g, "")}`;
  const s = scenes.length ? scenes[k % scenes.length] : DEFAULT_POLAROID_SCENES[0];
  const text = src ? caption ?? "" : s.caption;
  const name = text || alt;

  useMotionValueEvent(vx, "change", () => {
    const speed = Math.hypot(vx.get(), vy.get());
    if (speed > 300 && dev.get() < 1) dev.set(Math.min(1, dev.get() + (speed / 90000) * opts.current.sensitivity));
  });
  useMotionValueEvent(dev, "change", (d) => {
    if (d >= 1 && !done) {
      setDone(true);
      onDeveloped?.(name);
    }
  });

  useEffect(() => {
    // Develops very slowly on its own, like the real thing.
    const t = window.setInterval(() => {
      if (opts.current.selfDevelop && dev.get() < 1) dev.set(Math.min(1, dev.get() + 0.004));
    }, 100);
    return () => window.clearInterval(t);
  }, [dev]);

  useEffect(() => {
    return () => shakeCtl.current?.stop();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    let next: number | undefined;
    let ctl: AnimationPlaybackControls | undefined;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      if (dev.get() >= 1) {
        window.clearTimeout(next);
        next = window.setTimeout(() => {
          if (touched.current) return;
          setK((n) => n + 1);
          dev.set(0);
          setDone(false);
        }, 1600);
      } else if (reduced) {
        // No swinging for reduced motion: just develop in visible steps.
        dev.set(Math.min(1, dev.get() + 0.25));
      } else {
        ctl = animate(x, SHAKE, { duration: 1.6, ease: "easeInOut" });
      }
    }, 2000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(next);
      ctl?.stop();
    };
  }, [autoplay, x, dev, reduced]);

  const fresh = () => {
    touched.current = true;
    shakeCtl.current?.stop();
    setK((n) => n + 1);
    dev.set(0);
    setDone(false);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    touched.current = true;
    if (done) return;
    shakeCtl.current?.stop();
    if (reduced) dev.set(Math.min(1, dev.get() + 0.25));
    else shakeCtl.current = animate(x, SHAKE, { duration: 1.6, ease: "easeInOut" });
  };

  return (
    <div className={`flex max-w-full flex-col items-center gap-4 ${className}`}>
      <motion.div
        drag
        dragSnapToOrigin
        dragElastic={clamp(elasticity, 0.1, 1)}
        dragTransition={{ bounceStiffness: 260, bounceDamping: 14 }}
        onDragStart={() => {
          touched.current = true;
          shakeCtl.current?.stop();
        }}
        style={{ x, y, rotate }}
        whileDrag={{ scale: 1.04 }}
        tabIndex={0}
        role="button"
        onKeyDown={onKey}
        aria-label={
          done
            ? `Developed photo${name ? `: ${name}` : ""}`
            : "Undeveloped instant photo. Drag and shake it to develop, or press Enter to shake it."
        }
        className="cursor-grab touch-none select-none rounded-[6px] bg-[#fdfcf8] p-3 pb-12 shadow-[0_2px_4px_rgba(0,0,0,.08),0_24px_40px_-18px_rgba(0,0,0,.45)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_40px_-18px_rgba(0,0,0,.9)] dark:focus-visible:ring-[#0a84ff]"
      >
        <div className="relative h-[180px] w-[200px] overflow-hidden bg-[#2a2622]">
          <motion.div className="absolute inset-0" style={{ filter, opacity: imgOpacity }}>
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element -- any URL the caller passes, no loader config needed
              <img src={src} alt="" draggable={false} className="h-full w-full select-none object-cover" />
            ) : (
              <Scene s={s} gid={gid} />
            )}
          </motion.div>
          <motion.div className="absolute inset-0" style={{ opacity: haze, background: "linear-gradient(160deg,#5b5450,#2e2a27)" }} />
          <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,.25)]" />
        </div>
        <div className="relative h-0">
          <AnimatePresence>
            {done && text && (
              <motion.span
                key={k}
                className="absolute left-1 top-3 whitespace-nowrap text-[18px] text-[#3a3a3c] dark:text-[#d1d1d6]"
                style={{ fontFamily: HAND }}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                aria-hidden="true"
              >
                {text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]" aria-live="polite">
          {done ? "Developed." : "Grab it and shake."}
        </span>
        <button
          type="button"
          onClick={fresh}
          className="rounded-full bg-[#f0f0f3] px-3 py-1.5 text-[12px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
        >
          New photo
        </button>
      </div>
    </div>
  );
}
