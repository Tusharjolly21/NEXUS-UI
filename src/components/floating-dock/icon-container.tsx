"use client";

import * as React from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Resting tile size, px. */
export const DOCK_BASE = 44;
/** Tile size right under the pointer, px. */
export const DOCK_PEAK = 70;
/** Distance from a tile's centre at which magnification has faded out, px. */
const REACH = 150;

export type IconContainerProps = {
  /** Pointer x in client coordinates; Infinity when the pointer is away. */
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  href: string;
  tint?: string;
  badge?: number | string;
  active?: boolean;
  /** Render a button instead of a link (for previews and in-app actions). */
  disableLink?: boolean;
  /** Increment to make the tile bounce, as if the app were launching. */
  bounce?: number;
  /** Called when the tile is clicked or activated with the keyboard. */
  onActivate?: () => void;
};

/**
 * One dock tile. It grows with the pointer's distance (its real width, so the
 * neighbours make room), shows a tooltip, and on click bounces like a
 * launching app: a little gravity sim with a squash every time it lands.
 */
export function IconContainer({
  mouseX,
  title,
  icon,
  href,
  tint,
  badge,
  active = false,
  disableLink = false,
  bounce = 0,
  onActivate,
}: IconContainerProps) {
  const still = useReducedMotion() === true;
  const ref = React.useRef<HTMLDivElement>(null);
  const [tip, setTip] = React.useState(false);

  const target = useTransform(mouseX, (x) => {
    const el = ref.current;
    if (still || !el || !Number.isFinite(x)) return DOCK_BASE;
    const r = el.getBoundingClientRect();
    const d = Math.abs(x - (r.left + r.width / 2));
    const t = Math.max(0, 1 - d / REACH);
    // Cosine falloff: a rounded hill, like the real dock.
    return DOCK_BASE + (DOCK_PEAK - DOCK_BASE) * (0.5 - 0.5 * Math.cos(Math.PI * t));
  });
  const size = useSpring(target, { stiffness: 420, damping: 30, mass: 0.12 });
  const radius = useTransform(size, (s) => s * 0.27);
  const glyph = useTransform(size, (s) => s * 0.5);

  // Launch bounce: y is integrated by hand; the squash springs back with a wobble.
  const hop = useMotionValue(0);
  const squash = useSpring(0, { stiffness: 700, damping: 11 });
  const sy = useTransform(squash, (q) => 1 - q * 0.22);
  const sx = useTransform(squash, (q) => 1 + q * 0.16);

  const launch = React.useCallback(() => {
    if (still) return () => {};
    let raf = 0;
    let y = 0;
    let v = -620;
    let last = performance.now();
    let landings = 0;
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      v += 2900 * dt;
      y += v * dt;
      if (y >= 0) {
        y = 0;
        squash.jump(Math.min(1, Math.abs(v) / 650));
        squash.set(0);
        v = -v * 0.42;
        landings++;
        if (Math.abs(v) < 140 || landings > 3) {
          hop.set(0);
          return;
        }
      }
      hop.set(y);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [still, hop, squash]);

  const stopRef = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    if (bounce === 0) return;
    stopRef.current();
    stopRef.current = launch();
  }, [bounce, launch]);
  React.useEffect(() => () => stopRef.current(), []);

  const activate = () => {
    stopRef.current();
    stopRef.current = launch();
    onActivate?.();
  };

  const tileClass = `relative flex items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e] ${
    tint
      ? "text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_6px_14px_-8px_rgba(0,0,0,.45)]"
      : "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_14px_-8px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_6px_14px_-8px_rgba(0,0,0,.8)]"
  }`;
  const inner = (
    <>
      {tint && <span aria-hidden className="absolute inset-0" style={{ background: tint }} />}
      {tint && <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />}
      <motion.span aria-hidden className="relative flex items-center justify-center [&_svg]:size-full [&_svg]:stroke-[1.75]" style={{ width: glyph, height: glyph }}>
        {icon}
      </motion.span>
    </>
  );
  const handlers = {
    onPointerEnter: () => setTip(true),
    onPointerLeave: () => setTip(false),
    onFocus: () => setTip(true),
    onBlur: () => setTip(false),
  };

  return (
    <motion.div ref={ref} className="relative flex shrink-0 flex-col items-center justify-end" style={{ width: size }}>
      <AnimatePresence>
        {tip && (
          <motion.span
            key="tip"
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 whitespace-nowrap rounded-[8px] bg-[#1d1d1f]/90 px-2.5 py-1 text-[12px] font-medium text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)] backdrop-blur-md dark:bg-[#f5f5f7]/95 dark:text-[#1d1d1f]"
            style={{ x: "-50%" }}
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.div className="origin-bottom" style={{ y: hop }}>
        <motion.div className="origin-bottom" style={{ scaleX: sx, scaleY: sy }}>
          {disableLink ? (
            <motion.button
              type="button"
              aria-label={title}
              aria-pressed={active}
              onClick={activate}
              className={tileClass}
              style={{ width: size, height: size, borderRadius: radius }}
              {...handlers}
            >
              {inner}
            </motion.button>
          ) : (
            <motion.div style={{ width: size, height: size, borderRadius: radius }} className="relative">
              <Link
                href={href}
                aria-label={title}
                aria-current={active ? "page" : undefined}
                onClick={activate}
                className={`${tileClass} size-full rounded-[inherit]`}
                {...handlers}
              >
                {inner}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      {badge !== undefined && badge !== "" && (
        <motion.span
          aria-label={`${badge} new`}
          className="absolute right-0 top-0 z-[1] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff3b30] px-1 text-[11px] font-semibold tabular-nums text-white shadow-[0_0_0_2px_rgba(255,255,255,.9)] dark:shadow-[0_0_0_2px_#1c1c1e]"
          style={{ y: hop, x: "25%" }}
        >
          {badge}
        </motion.span>
      )}
      <span className="mt-1 flex h-1 items-center justify-center" aria-hidden>
        {active && (
          <motion.span
            layoutId="floating-dock-running"
            className="block size-1 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          />
        )}
      </span>
    </motion.div>
  );
}
