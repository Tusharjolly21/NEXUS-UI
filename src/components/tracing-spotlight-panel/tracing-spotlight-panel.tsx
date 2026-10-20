"use client";
import { useEffect, useRef, useSyncExternalStore, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export interface TracingSpotlightPanelProps {
  /** Panel content. Leave out for the built-in pricing tier. */
  children?: ReactNode;
  /** Colour of the light. Defaults to system blue. */
  color?: string;
  /** Radius of the spotlight inside the panel, in px. */
  size?: number;
  /** While nobody is pointing at it, the light runs laps around the border. */
  trace?: boolean;
  /** Seconds for one lap of the border. */
  lap?: number;
  /** Sweeps the spotlight through the panel now and then until someone points at it. */
  autoplay?: boolean;
  className?: string;
}

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

/** "#0071e3" + 0.2 -> "rgba(0,113,227,0.2)". Anything that isn't #rrggbb is returned as is. */
function alpha(hex: string, a: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** A point `d` px along the border of a w×h rectangle, clockwise from the top-left corner. */
function onBorder(d: number, w: number, h: number) {
  const per = 2 * (w + h);
  let t = ((d % per) + per) % per;
  if (t < w) return [t, 0];
  t -= w;
  if (t < h) return [w, t];
  t -= h;
  if (t < w) return [w - t, h];
  t -= w;
  return [0, h - t];
}

function PricingTier({ dark }: { dark: boolean }) {
  const features = ["Unlimited projects", "Version history for 90 days", "Priority support"];
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <p className="m-0 text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Pro</p>
        <span className="rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0059b3] dark:bg-[#0a84ff]/20 dark:text-[#6cb6ff]">Most popular</span>
      </div>
      <p className="m-0 mt-3 flex items-baseline gap-1 text-[#1d1d1f] dark:text-[#f5f5f7]">
        <span className="text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums">$24</span>
        <span className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">per month</span>
      </p>
      <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="7" fill={dark ? "#30d158" : "#28a745"} opacity=".16" />
              <path d="M5 8.2 7 10.2 11 6" fill="none" stroke={dark ? "#30d158" : "#1a7f37"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 500, damping: 24 }}
        className="mt-5 h-10 rounded-full bg-[#0071e3] text-[14px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
      >
        Start free trial
      </motion.button>
    </div>
  );
}

/**
 * A panel with a light in it. Point inside and a soft spotlight trails the
 * pointer on a spring while the border glows wherever the light is closest.
 * Leave, and the light slides out to the edge and keeps running laps around
 * the border, like a comet tracing the outline, until you come back.
 */
export function TracingSpotlightPanel({
  children,
  color,
  size = 260,
  trace = true,
  lap = 5,
  autoplay = false,
  className = "",
}: TracingSpotlightPanelProps) {
  const reduce = useReducedMotion() === true;
  const dark = useDark();
  const accent = color ?? (dark ? "#0a84ff" : "#0071e3");
  const panel = useRef<HTMLDivElement>(null);
  const box = useRef({ w: 320, h: 360 });
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const x = useSpring(tx, { stiffness: 140, damping: 17, mass: 0.7 });
  const y = useSpring(ty, { stiffness: 140, damping: 17, mass: 0.7 });
  const inside = useSpring(0, { stiffness: 160, damping: 22 });
  const mode = useRef<"trace" | "pointer" | "demo">("trace");
  const along = useRef(0);
  const touched = useRef(false);
  const conf = useRef({ trace, lap, reduce, autoplay });
  useEffect(() => {
    conf.current = { trace, lap, reduce, autoplay };
  });

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      box.current = { w: el.offsetWidth, h: el.offsetHeight };
    });
    ro.observe(el);
    box.current = { w: el.offsetWidth, h: el.offsetHeight };
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let clock = 0;
    let demoUntil = 0;
    let nextDemo = 2.2;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      clock += dt;
      const c = conf.current;
      const { w, h } = box.current;
      if (c.autoplay && !touched.current && !c.reduce && mode.current !== "pointer") {
        if (mode.current === "trace" && clock > nextDemo) {
          mode.current = "demo";
          demoUntil = clock + 2.6;
          inside.set(1);
        }
        if (mode.current === "demo") {
          const t = (clock - (demoUntil - 2.6)) / 2.6;
          tx.set(w * (0.5 + 0.34 * Math.sin(t * Math.PI * 2)));
          ty.set(h * (0.5 + 0.3 * Math.sin(t * Math.PI * 4 + 0.6)));
          if (clock > demoUntil) {
            mode.current = "trace";
            nextDemo = clock + 3.4;
            inside.set(0);
          }
          return;
        }
      }
      if (mode.current === "trace" && c.trace && !c.reduce) {
        const per = 2 * (w + h);
        along.current += (per / Math.max(1, c.lap)) * dt;
        const [px, py] = onBorder(along.current, w, h);
        tx.set(px);
        ty.set(py);
      }
    };
    // Start the light at the top edge so the first frame isn't a jump from the corner.
    along.current = box.current.w * 0.3;
    const [sx, sy] = onBorder(along.current, box.current.w, box.current.h);
    tx.jump(sx);
    ty.jump(sy);
    x.jump(sx);
    y.jump(sy);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tx, ty, x, y, inside]);

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    mode.current = "pointer";
    tx.set(e.clientX - r.left);
    ty.set(e.clientY - r.top);
    inside.set(1);
  };
  const onLeave = () => {
    mode.current = "trace";
    inside.set(0);
    // Pick up the lap from the border point nearest to where the pointer left.
    const { w, h } = box.current;
    const px = Math.max(0, Math.min(w, tx.get()));
    const py = Math.max(0, Math.min(h, ty.get()));
    const d = [py, w - px, h - py, px];
    const side = d.indexOf(Math.min(...d));
    along.current = side === 0 ? px : side === 1 ? w + py : side === 2 ? w + h + (w - px) : 2 * w + h + (h - py);
  };

  const rim = useMotionTemplate`radial-gradient(150px circle at ${x}px ${y}px, ${accent}, transparent 70%)`;
  const glow = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, ${alpha(accent, dark ? 0.24 : 0.14)}, transparent 70%)`;
  const halo = useMotionTemplate`radial-gradient(90px circle at ${x}px ${y}px, ${alpha(accent, dark ? 0.5 : 0.35)}, transparent 70%)`;
  const rimFade = useTransform(inside, [0, 1], [1, 0.85]);

  return (
    <div
      ref={panel}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onFocus={(e) => {
        // Keyboard users get the light too: it settles over whatever has focus.
        const r = e.currentTarget.getBoundingClientRect();
        const t = (e.target as HTMLElement).getBoundingClientRect();
        mode.current = "pointer";
        tx.set(t.left + t.width / 2 - r.left);
        ty.set(t.top + t.height / 2 - r.top);
        inside.set(1);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onLeave();
      }}
      className={`relative w-full max-w-[340px] rounded-[24px] p-[1.5px] ${className}`}
    >
      {/* Hairline border, then the lit part of it on top. */}
      <div aria-hidden="true" className="absolute inset-0 rounded-[24px] bg-[rgba(0,0,0,.08)] dark:bg-[rgba(255,255,255,.1)]" />
      <motion.div aria-hidden="true" className="absolute inset-0 rounded-[24px]" style={{ backgroundImage: rim, opacity: rimFade }} />
      {!reduce ? <motion.div aria-hidden="true" className="pointer-events-none absolute -inset-3 rounded-[30px] blur-xl" style={{ backgroundImage: halo }} /> : null}
      <div className="relative overflow-hidden rounded-[22.5px] bg-white p-6 shadow-[0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: glow, opacity: inside }} />
        <div className="relative">{children ?? <PricingTier dark={dark} />}</div>
      </div>
    </div>
  );
}

/** Older name for the same component. */
export const TracingSpotlight = TracingSpotlightPanel;
